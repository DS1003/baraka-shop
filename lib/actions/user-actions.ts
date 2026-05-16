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
                metadata: newMetadata,
            } as any,
        });

        revalidatePath("/admin/settings");
        return { success: true };
    } catch (error) {
        console.error("Update settings error:", error);
        return { success: false, error: "Erreur lors de la mise à jour" };
    }
}
