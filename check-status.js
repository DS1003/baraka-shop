const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- SYSTEM STATUS ---');
    try {
        const jobs = await prisma.importJob.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5
        });
        console.log('Recent Import Jobs:', JSON.stringify(jobs, null, 2));

        const pCount = await prisma.product.count();
        console.log('Total Products in DB:', pCount);

        const cCount = await prisma.category.count();
        console.log('Total Categories in DB:', cCount);

    } catch (error) {
        console.error('Error during status check:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
