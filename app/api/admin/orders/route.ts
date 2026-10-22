import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

// Force dynamic — no caching at all
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let orders: any[] = await prisma.order.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                        phone: true,
                        address: true,
                    }
                },
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                images: true,
                                price: true,
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Garantir que shippingAddress, shippingPhone et customerName sont toujours enrichis
        if (orders.length > 0) {
            try {
                const rawShippingRows: any[] = await prisma.$queryRaw`
                    SELECT id, "shippingAddress", "shippingPhone", "customerName", "shippingCity" 
                    FROM "Order"
                `;
                const map = new Map(rawShippingRows.map(r => [r.id, r]));
                orders = orders.map(o => {
                    const extra = map.get(o.id);
                    return {
                        ...o,
                        shippingAddress: o.shippingAddress || extra?.shippingAddress || o.user?.address || null,
                        shippingPhone: o.shippingPhone || extra?.shippingPhone || o.user?.phone || null,
                        customerName: o.customerName || extra?.customerName || o.user?.username || null,
                        shippingCity: o.shippingCity || extra?.shippingCity || 'Dakar',
                    };
                });
            } catch (rawErr) {
                console.error("[API:Orders] Raw shipping enrichment error:", rawErr);
            }
        }

        return NextResponse.json(orders, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                'Pragma': 'no-cache',
            }
        });
    } catch (error) {
        console.error("API: Fetch orders error:", error);
        return NextResponse.json([], { status: 500 });
    }
}
