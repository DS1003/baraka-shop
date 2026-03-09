import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
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
                            product: true
                        }
                    }
                }
            },
            wishlist: true
        }
    });

    if (!userData) {
        redirect("/login");
    }

    return (
        <AccountContent user={userData} />
    );
}
