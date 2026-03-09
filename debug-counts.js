const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function test() {
    const prisma = new PrismaClient();
    try {
        const prodCount = await prisma.product.count();
        const catCount = await prisma.category.count();
        const brandCount = await prisma.brand.count();
        console.log("DB STATS:");
        console.log("- Products:", prodCount);
        console.log("- Categories:", catCount);
        console.log("- Brands:", brandCount);
    } catch (e) {
        console.error("Test Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

test();
