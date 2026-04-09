import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Force dynamic — no caching at all
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const orders = await prisma.order.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                        phone: true,
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
