require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

async function main() {
    console.log('--- SYSTEM STATUS ---');
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error("DATABASE_URL not found");
        return;
    }

    const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        const pCount = await prisma.product.count();
        console.log('Total Products:', pCount);

        const cCount = await prisma.category.count();
        console.log('Total Categories:', cCount);

        const jobs = await prisma.importJob.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5
        });
        console.log('Recent Jobs:', jobs.length);
        jobs.forEach(j => console.log(`- Job ${j.id}: ${j.status} (${j.progress}%)`));

    } catch (error) {
        console.error('Prisma Error:', error);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
