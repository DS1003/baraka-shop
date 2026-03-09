const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
require('dotenv').config();

async function run() {
    const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        const jobs = await (prisma as any).importJob.findMany();
        console.log("JOBS_LIST:", JSON.stringify(jobs));
    } catch (e) {
        console.log("JOBS_ERROR:", e.message);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}
run();
