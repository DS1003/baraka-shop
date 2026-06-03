'use server';
import prisma from '@/lib/prisma';

export async function globalAdminSearch(query: string) {
    if (!query || query.length < 2) return { products: [], categories: [], users: [] };

    try {
        const [products, categories, users] = await Promise.all([
            prisma.product.findMany({
                where: {
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { reference: { contains: query, mode: 'insensitive' } },
                        { brand: { name: { contains: query, mode: 'insensitive' } } }
                    ]
                },
                take: 5,
                select: { id: true, name: true, reference: true, price: true, images: true, category: { select: { name: true } } }
            }),
            prisma.category.findMany({
                where: {
                    name: { contains: query, mode: 'insensitive' }
                },
                take: 3,
                select: { id: true, name: true }
            }),
            prisma.user.findMany({
                where: {
                    OR: [
                        { username: { contains: query, mode: 'insensitive' } },
                        { email: { contains: query, mode: 'insensitive' } },
                        { phone: { contains: query, mode: 'insensitive' } }
                    ],
                    role: 'USER'
                },
                take: 3,
                select: { id: true, username: true, email: true, phone: true }
            })
        ]);

        return { products, categories, users };
    } catch (error) {
        console.error("Global search error:", error);
        return { products: [], categories: [], users: [] };
    }
}
