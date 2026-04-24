import pg from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function migrate() {
    const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL!,
        ssl: { rejectUnauthorized: false },
    });

    try {
        console.log('Adding banner and logo_detail columns to Store table...');
        await pool.query('ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "banner" TEXT');
        await pool.query('ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "logo_detail" TEXT');
        console.log('Success!');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

migrate();
