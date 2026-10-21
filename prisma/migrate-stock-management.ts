import pg from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

export async function runMigration() {
    const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL!,
        ssl: { rejectUnauthorized: false },
    });

    try {
        console.log('--- Applying schema additions for out-of-stock management ---');
        
        // 1. Add columns to Product
        await pool.query(`
            ALTER TABLE "Product" 
            ADD COLUMN IF NOT EXISTS "deactivationReason" TEXT,
            ADD COLUMN IF NOT EXISTS "deactivatedAt" TIMESTAMP WITHOUT TIME ZONE,
            ADD COLUMN IF NOT EXISTS "restockPendingReview" BOOLEAN NOT NULL DEFAULT false,
            ADD COLUMN IF NOT EXISTS "restockedAt" TIMESTAMP WITHOUT TIME ZONE,
            ADD COLUMN IF NOT EXISTS "lastRestockedQty" INTEGER;
        `);

        // 2. Add indexes on Product
        await pool.query(`ù
            CREATE INDEX IF NOT EXISTS "Product_deactivationReason_idx" ON "Product"("deactivationReason");
            CREATE INDEX IF NOT EXISTS "Product_restockPendingReview_idx" ON "Product"("restockPendingReview");
        `);

        // 3. Add columns to SiteConfig
        await pool.query(`
            ALTER TABLE "SiteConfig"
            ADD COLUMN IF NOT EXISTS "restockNotificationEmails" TEXT[] NOT NULL DEFAULT '{}',
            ADD COLUMN IF NOT EXISTS "restockNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true;
        `);

        // 4. Update initial SiteConfig with default official email if empty
        const defaultEmail = process.env.ADMIN_CONTACT_EMAIL || 'contact@baraka.sn';
        await pool.query(`
            UPDATE "SiteConfig"
            SET "restockNotificationEmails" = ARRAY[$1]::TEXT[]
            WHERE id = 'singleton' AND (
                "restockNotificationEmails" IS NULL OR 
                array_length("restockNotificationEmails", 1) IS NULL OR 
                array_length("restockNotificationEmails", 1) = 0
            );
        `, [defaultEmail]);

        // 5. Backfill products that are currently out of stock (stock <= 0) but still isPublished = true
        // Per Rule A: they must automatically be deactivated with reason 'OUT_OF_STOCK'
        const backfillRes = await pool.query(`
            UPDATE "Product"
            SET 
                "isPublished" = false,
                "deactivationReason" = 'OUT_OF_STOCK',
                "deactivatedAt" = NOW()
            WHERE stock <= 0 AND "isPublished" = true;
        `);

        console.log(`✅ Migration successful! Backfilled ${backfillRes.rowCount} out-of-stock products.`);
    } catch (e) {
        console.error('❌ Migration failed:', e);
        throw e;
    } finally {
        await pool.end();
    }
}

runMigration().catch(() => process.exit(1));
