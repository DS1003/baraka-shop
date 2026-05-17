'use server';

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getUserSettings() {
    const session = await auth();
    if (!session?.user?.id) return null;

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                username: true,
                email: true,
                phone: true,
                image: true,
                address: true,
                metadata: true,
            }
        });

        if (!user) return null;

        // Ensure metadata has expected structure
        const metadata = (user.metadata as any) || {};
        return {
            ...user,
            settings: {
                notifications: metadata.notifications || {
                    emails: true,
                    push: true,
                    sms: false,
                    reports: true,
                    marketing: false
                },
                security: metadata.security || {
                    twoFactor: false,
                    loginAlerts: true
                }
            }
        };
    } catch (error) {
        console.error("Fetch user settings error:", error);
        return null;
    }
}

export async function updateUserSettings(data: {
    profile?: {
        username?: string;
        phone?: string;
        email?: string;
        image?: string;
        address?: string;
    },
    settings?: {
        notifications?: any;
        security?: any;
    }
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Non autorisé");

    try {
        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { metadata: true }
        });

        const currentMetadata = (currentUser?.metadata as any) || {};
        const newMetadata = {
            ...currentMetadata,
            ...(data.settings?.notifications && { notifications: data.settings.notifications }),
            ...(data.settings?.security && { security: data.settings.security }),
        };

        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                ...(data.profile?.username && { username: data.profile.username }),
                ...(data.profile?.phone && { phone: data.profile.phone }),
                ...(data.profile?.email && { email: data.profile.email }),
                ...(data.profile?.image && { image: data.profile.image }),
                ...(data.profile?.address && { address: data.profile.address }),
                metadata: newMetadata,
            } as any,
        });

        revalidatePath("/admin/settings");
        revalidatePath("/account");
        return { success: true };
    } catch (error) {
        console.error("Update settings error:", error);
        return { success: false, error: "Erreur lors de la mise à jour" };
    }
}

// Backward compatibility for the shop account page
export async function updateProfile(data: { username: string; phone: string; address: string }) {
    return updateUserSettings({
        profile: {
            username: data.username,
            phone: data.phone,
            address: data.address
        }
    });
}

export async function toggleWishlistAction(productId: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, message: "Vous devez être connecté pour utiliser la liste d'envies." };

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { wishlist: { select: { id: true } } }
        });

        if (!user) return { success: false, message: "Utilisateur non trouvé." };

        const isInWishlist = user.wishlist.some(p => p.id === productId);

        if (isInWishlist) {
            await prisma.user.update({
                where: { id: session.user.id },
                data: { wishlist: { disconnect: { id: productId } } }
            });
            revalidatePath('/account');
            return { success: true, isWishlisted: false, message: "Retiré de votre liste d'envies." };
        } else {
            await prisma.user.update({
                where: { id: session.user.id },
                data: { wishlist: { connect: { id: productId } } }
            });
            revalidatePath('/account');
            return { success: true, isWishlisted: true, message: "Ajouté à votre liste d'envies." };
        }
    } catch (error) {
        console.error("Toggle wishlist error:", error);
        return { success: false, message: "Erreur serveur lors de la mise à jour de la liste d'envies." };
    }
}

export async function checkWishlistAction(productId: string) {
    const session = await auth();
    if (!session?.user?.id) return false;

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { wishlist: { where: { id: productId }, select: { id: true } } }
        });
        return (user?.wishlist?.length || 0) > 0;
    } catch {
        return false;
    }
}

