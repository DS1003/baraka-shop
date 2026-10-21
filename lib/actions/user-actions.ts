'use server';

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { rememberCache, invalidateCache } from "@/lib/redis";
import bcrypt from "bcryptjs";
import { rateLimit } from "@/lib/rate-limit";

export async function getUserSettings() {
    const session = await auth();
    if (!session?.user?.id) return null;

    return rememberCache(`user:settings:${session.user.id}`, 120, async () => {
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
    });
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

        await invalidateCache(`user:settings:${session.user.id}`);
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

/**
 * Modification sécurisée du mot de passe utilisateur
 * Conforme aux normes OWASP ASVS v4.0 et ANSSI :
 * - Re-authentification avec l'ancien mot de passe
 * - Protection anti-bruteforce via rate limiting Redis
 * - Politique de complexité stricte (8+ caractères, majuscule, minuscule, chiffre, symbole)
 * - Interdiction de réutiliser le mot de passe actuel
 * - Hachage robuste Bcrypt
 */
export async function changeUserPassword(data: {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Vous devez être connecté pour modifier votre mot de passe." };
    }

    const currentPassword = (data?.currentPassword || "").trim();
    const newPassword = (data?.newPassword || "").trim();
    const confirmPassword = (data?.confirmPassword || "").trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
        return { success: false, error: "Tous les champs sont obligatoires." };
    }

    // Protection anti-bruteforce (OWASP ASVS 2.1.8) : max 5 tentatives par 15 minutes
    const rateLimitKey = `pwd_change:${session.user.id}`;
    const limiter = await rateLimit(rateLimitKey, 5, 900);
    if (!limiter.success) {
        return {
            success: false,
            error: `Trop de tentatives de modification. Par mesure de sécurité, veuillez patienter ${Math.ceil(limiter.reset / 60)} minutes avant de réessayer.`
        };
    }

    // Vérification de la confirmation
    if (newPassword !== confirmPassword) {
        return { success: false, error: "Le nouveau mot de passe et sa confirmation ne correspondent pas." };
    }

    // Vérification des critères de sécurité (OWASP & ANSSI standards)
    if (newPassword.length < 8) {
        return { success: false, error: "Le mot de passe doit comporter au moins 8 caractères." };
    }
    if (newPassword.length > 128) {
        return { success: false, error: "Le mot de passe ne doit pas dépasser 128 caractères." };
    }
    if (!/[A-Z]/.test(newPassword)) {
        return { success: false, error: "Le mot de passe doit contenir au moins une lettre majuscule." };
    }
    if (!/[a-z]/.test(newPassword)) {
        return { success: false, error: "Le mot de passe doit contenir au moins une lettre minuscule." };
    }
    if (!/[0-9]/.test(newPassword)) {
        return { success: false, error: "Le mot de passe doit contenir au moins un chiffre." };
    }
    if (!/[^A-Za-z0-9]/.test(newPassword)) {
        return { success: false, error: "Le mot de passe doit contenir au moins un caractère spécial (@$!%*?&#...)." };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true, password: true }
        });

        if (!user || !user.password) {
            return { success: false, error: "Compte utilisateur introuvable." };
        }

        // Vérification de l'ancien mot de passe (Re-authentification OWASP ASVS)
        const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentValid) {
            return { success: false, error: "Le mot de passe actuel est incorrect." };
        }

        // Le nouveau mot de passe doit être différent de l'actuel
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return { success: false, error: "Le nouveau mot de passe doit être différent du mot de passe actuel." };
        }

        // Hachage sécurisé avec Bcrypt
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: session.user.id },
            data: { password: hashedPassword }
        });

        await invalidateCache(`user:settings:${session.user.id}`);
        revalidatePath("/account");
        revalidatePath("/admin/settings");

        return { success: true, message: "Votre mot de passe a été mis à jour avec succès." };
    } catch (error) {
        console.error("Change password error:", error);
        return { success: false, error: "Une erreur technique est survenue lors de la mise à jour." };
    }
}


