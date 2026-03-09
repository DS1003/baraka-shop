'use server';

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: {
    username?: string;
    phone?: string;
    address?: string;
}) {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Non autorisé");
    }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                username: formData.username,
                phone: formData.phone,
                address: formData.address,
            } as any,
        });

        revalidatePath("/account");
        return { success: true };
    } catch (error) {
        console.error("Update profile error:", error);
        return { success: false, error: "Erreur lors de la mise à jour" };
    }
}
