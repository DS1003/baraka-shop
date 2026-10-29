import 'dotenv/config';
import prisma from '../lib/prisma';

async function check() {
    try {
        const zeroPriceProducts = await prisma.product.findMany({
            where: {
                OR: [
                    { price: 0 },
                    { price: null },
                    { price: { lte: 0 } }
                ]
            },
            select: {
                id: true,
                name: true,
                reference: true,
                price: true,
                stock: true,
                isPublished: true,
                deactivationReason: true
            }
        });

        console.log('Total products with price <= 0 or null:', zeroPriceProducts.length);
        const publishedZero = zeroPriceProducts.filter(p => p.isPublished);
        console.log('Unpublishing', publishedZero.length, 'products...');

        for (const p of publishedZero) {
            await prisma.product.update({
                where: { id: p.id },
                data: {
                    isPublished: false,
                    deactivationReason: p.stock <= 0 ? 'OUT_OF_STOCK' : 'NO_PRICE',
                    deactivatedAt: new Date(),
                    restockPendingReview: false
                }
            });
            console.log(`✅ Unpublished: ${p.name} (${p.reference}) - Price: ${p.price}`);
        }

        const { invalidatePrefix } = await import('../lib/redis');
        await Promise.all([
            invalidatePrefix('products:'),
            invalidatePrefix('similar:'),
            invalidatePrefix('categories:'),
            invalidatePrefix('brands:'),
            invalidatePrefix('stores:'),
            invalidatePrefix('admin:products:'),
            invalidatePrefix('admin:dashboard:')
        ]);
        console.log('✅ Redis caches invalidated.');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

check();
