const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function test() {
    console.log("DATABASE_URL present:", !!process.env.DATABASE_URL);
    const prisma = new PrismaClient();
    try {
        const count = await prisma.product.count();
        console.log("Raw Product Count:", count);
        const products = await prisma.product.findMany({ take: 5, include: { category: true } });
        console.log("Products found:", products.length);
        if (products.length > 0) {
            console.log("Example:", products[0].name);
        }
    } catch (e) {
        console.error("Test Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

test();
