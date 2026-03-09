const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function main() {
    const prisma = new PrismaClient();

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
