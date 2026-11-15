import 'dotenv/config';
import prisma from '../lib/prisma';

async function checkDetails() {
    const pk = await prisma.product.findUnique({
        where: { reference: 'PK9950' },
        select: { id: true, name: true, reference: true, isPublished: true, deactivationReason: true, deactivatedAt: true, stock: true, price: true }
    });
    console.log('PK9950:', pk);

    // Let's check other PLOKAMA products
    const plokama = await prisma.product.findMany({
        where: { name: { contains: 'PLOKAMA', mode: 'insensitive' } },
        take: 5,
        select: { id: true, name: true, reference: true, isPublished: true, stock: true, price: true }
    });
    console.log('PLOKAMA sample:', plokama);

    // Let's check all brands
    const brands = await prisma.brand.findMany({
        select: { id: true, name: true, slug: true, _count: { select: { products: true } } }
    });
    console.log(`Brands (${brands.length}):`, brands.slice(0, 20).map(b => `${b.name} (${b._count.products})`));

    await prisma.$disconnect();
}

checkDetails().catch(console.error);
