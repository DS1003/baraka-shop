import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import WishlistContent from "./WishlistContent";

export const metadata = {
    title: 'Ma Liste d\'Envies — Baraka Shop',
    description: 'Retrouvez tous vos produits favoris sauvegardés sur Baraka Shop.',
}

export default async function WishlistPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            wishlist: {
                include: {
                    category: true,
                    brand: true,
                },
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    return <WishlistContent products={user?.wishlist || []} />;
}
