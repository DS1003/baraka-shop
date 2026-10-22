import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import AccountContent from "./AccountContent";

export default async function AccountPage({
    searchParams,
}: {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const session = await auth();

    if (!session?.user?.id) {
        const resolvedParams = searchParams ? await searchParams : {};
        const query = new URLSearchParams();
        if (resolvedParams) {
            Object.entries(resolvedParams).forEach(([k, v]) => {
                if (typeof v === 'string') query.set(k, v);
            });
        }
        const queryString = query.toString();
        const callbackUrl = queryString ? `/account?${queryString}` : '/account';
        redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }

    const userData = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            orders: {
                orderBy: { createdAt: 'desc' },
                include: {
                    items: {
                        include: {
                            product: {
                                include: {
                                    category: true,
                                    brand: true
                                }
                            }
                        }
                    }
                }
            },
            wishlist: {
                include: {
                    category: true,
                    brand: true
                }
            }
        }
    });

    if (!userData) {
        redirect("/login");
    }

    if (userData.orders && userData.orders.length > 0) {
        try {
            const rawShippingRows: any[] = await prisma.$queryRaw`
                SELECT id, "shippingAddress", "shippingPhone", "customerName", "shippingCity" 
                FROM "Order" 
                WHERE "userId" = ${session.user.id}
            `;
            const map = new Map(rawShippingRows.map(r => [r.id, r]));
            userData.orders = userData.orders.map((o: any) => {
                const extra = map.get(o.id);
                return {
                    ...o,
                    shippingAddress: o.shippingAddress || extra?.shippingAddress || userData.address || null,
                    shippingPhone: o.shippingPhone || extra?.shippingPhone || userData.phone || null,
                    customerName: o.customerName || extra?.customerName || userData.username || null,
                    shippingCity: o.shippingCity || extra?.shippingCity || 'Dakar',
                };
            });
        } catch (err) {
            console.error('[AccountPage] shipping enrichment error:', err);
        }
    }

    return (
        <Suspense fallback={
            <div className="w-full min-h-[60vh] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
            </div>
        }>
            <AccountContent user={userData} />
        </Suspense>
    );
}
