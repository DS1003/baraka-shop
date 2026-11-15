import 'dotenv/config';
import prisma from '../lib/prisma';

async function main() {
    const p1 = await prisma.product.findUnique({
        where: { id: '55735832-f9da-4309-9e6a-3166173f8cd7' },
        select: { id: true, name: true, slug: true, reference: true, price: true, stock: true, isPublished: true, createdAt: true, updatedAt: true }
    });
    const p2 = await prisma.product.findUnique({
        where: { id: 'd01844e4-03a4-4171-8118-c7510e58a5e4' },
        select: { id: true, name: true, slug: true, reference: true, price: true, stock: true, isPublished: true, createdAt: true, updatedAt: true }
    });
    console.log('P1 (Smooth Q4 Combo):', p1);
    console.log('P2 (Smooth Q4):', p2);
}

main().catch(console.error).finally(() => prisma.$disconnect());
