import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error("DATABASE_URL is not defined");
    process.exit(1);
}

const pool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter }) as any;

async function checkJobs() {
    try {
        const jobs = await prisma.importJob.findMany({
            orderBy: { createdAt: 'desc' }
        });
        console.log("Found jobs:", JSON.stringify(jobs, null, 2));
    } catch (e) {
        console.error("Error checking jobs:", e);
    } finally {
        await (prisma as any).$disconnect();
        await pool.end();
    }
}

checkJobs();
