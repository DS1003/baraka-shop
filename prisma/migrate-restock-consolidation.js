const pg = require('pg');
const dotenv = require('dotenv');
dotenv.config();

async function runMigration() {
    let connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error('DATABASE_URL is not set');
    }
    connectionString = connectionString.replace(/sslmode=(require|prefer|verify-ca)\b/g, 'sslmode=verify-full');

    const pool = new pg.Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
    });

    try {
        console.log('--- Applying schema additions for restock notification consolidation ---');

        // 1. Add restockConsolidationMinutes to SiteConfig
        await pool.query(`
            ALTER TABLE "SiteConfig" 
            ADD COLUMN IF NOT EXISTS "restockConsolidationMinutes" INTEGER NOT NULL DEFAULT 5;
        `);
        console.log('✅ SiteConfig updated with restockConsolidationMinutes.');

        // 2. Create RestockNotificationBatch table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS "RestockNotificationBatch" (
                "id" TEXT NOT NULL,
                "status" TEXT NOT NULL DEFAULT 'PENDING',
                "scheduledFor" TIMESTAMP(3) NOT NULL,
                "sentAt" TIMESTAMP(3),
                "errorDetails" TEXT,
                "recipients" TEXT[] DEFAULT ARRAY[]::TEXT[],
                "itemsCount" INTEGER NOT NULL DEFAULT 0,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "RestockNotificationBatch_pkey" PRIMARY KEY ("id")
            );
        `);
        console.log('✅ RestockNotificationBatch table ready.');

        // 3. Create RestockNotificationItem table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS "RestockNotificationItem" (
                "id" TEXT NOT NULL,
                "batchId" TEXT NOT NULL,
                "productId" TEXT NOT NULL,
                "productName" TEXT NOT NULL,
                "reference" TEXT,
                "categoryName" TEXT,
                "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
                "oldStock" INTEGER NOT NULL DEFAULT 0,
                "newStock" INTEGER NOT NULL DEFAULT 0,
                "productImageUrl" TEXT,
                "restockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "RestockNotificationItem_pkey" PRIMARY KEY ("id"),
                CONSTRAINT "RestockNotificationItem_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "RestockNotificationBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT "RestockNotificationItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
            );
        `);
        console.log('✅ RestockNotificationItem table ready.');

        // 4. Create Indexes and Constraints
        await pool.query(`
            CREATE INDEX IF NOT EXISTS "RestockNotificationBatch_status_idx" ON "RestockNotificationBatch"("status");
            CREATE INDEX IF NOT EXISTS "RestockNotificationBatch_scheduledFor_idx" ON "RestockNotificationBatch"("scheduledFor");
            CREATE INDEX IF NOT EXISTS "RestockNotificationBatch_createdAt_idx" ON "RestockNotificationBatch"("createdAt");

            CREATE INDEX IF NOT EXISTS "RestockNotificationItem_batchId_idx" ON "RestockNotificationItem"("batchId");
            CREATE INDEX IF NOT EXISTS "RestockNotificationItem_productId_idx" ON "RestockNotificationItem"("productId");

            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'RestockNotificationItem_batchId_productId_key'
                ) THEN
                    ALTER TABLE "RestockNotificationItem" ADD CONSTRAINT "RestockNotificationItem_batchId_productId_key" UNIQUE ("batchId", "productId");
                END IF;
            END $$;
        `);
        console.log('✅ Indexes and unique constraints ready.');

        console.log('🎉 Restock notification consolidation migration successfully applied!');
    } catch (err) {
        console.error('❌ Migration failed:', err);
        throw err;
    } finally {
        await pool.end();
    }
}

runMigration().catch(console.error);
