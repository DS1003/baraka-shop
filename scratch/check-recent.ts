import 'dotenv/config';
import prisma from '../lib/prisma';

async function main() {
    // Check products created in the last 7 days
    const recentCreated = await prisma.product.findMany({
        where: {
            createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        },
        select: { id: true, name: true, slug: true, reference: true, createdAt: true, updatedAt: true },
        orderBy: { createdAt: 'desc' }
    });
    console.log('Products created in last 7 days:', recentCreated);

    // Check products updated in the last 2 days
    const recentUpdated = await prisma.product.findMany({
        where: {
            updatedAt: { gte: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
        },
        select: { id: true, name: true, slug: true, reference: true, createdAt: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
        take: 20
    });
    console.log('Products updated in last 2 days (sample):', recentUpdated);
}

main().catch(console.error).finally(() => prisma.$disconnect());
