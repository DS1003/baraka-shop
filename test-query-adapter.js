const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
require('dotenv').config();

async function main() {
    const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        const products = await prisma.product.findMany({
            include: {
                category: true,
                brand: true,
                subCategory: true,
                thirdLevelCategory: true
            },
            take: 20
        });
        console.log('PRODUCTS FOUND:', products.length);
    } catch (e) {
        console.error('QUERY ERROR:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
