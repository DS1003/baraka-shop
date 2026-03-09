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
        const where = {};

        console.log("Testing counts...");
        const [total, activeCount, lowStockCount, categoriesCount] = await Promise.all([
            prisma.product.count({ where }),
            prisma.product.count({ where: { ...where, stock: { gt: 0 } } }),
            prisma.product.count({ where: { ...where, stock: { gt: 0, lt: 10 } } }),
            prisma.category.count()
        ]);
        console.log("Counts OK", { total, activeCount, lowStockCount, categoriesCount });

        console.log("Testing findMany...");
        const products = await prisma.product.findMany({
            where,
            include: {
                category: true,
                brand: true,
                subCategory: true,
                thirdLevelCategory: true
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
            skip: 0
        });
        console.log('PRODUCTS FOUND:', products.length);
    } catch (e) {
        console.error('QUERY ERROR:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
