import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import AccountContent from "./AccountContent";

export default async function AccountPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
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
