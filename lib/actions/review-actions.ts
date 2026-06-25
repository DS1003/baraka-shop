"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

// Helper to check admin access
async function checkAdmin() {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
        throw new Error("Accès non autorisé.");
    }
}

export async function getAdminReviews(page = 1, pageSize = 20) {
    try {
        await checkAdmin();
        const skip = (page - 1) * pageSize;

        const reviews = await prisma.review.findMany({
            skip,
            take: pageSize,
            orderBy: [
                {
                    createdAt: 'desc'
                }
            ],
            include: {
                user: { select: { id: true, username: true, email: true, image: true } },
                product: { select: { id: true, name: true, slug: true, images: true } },
                reports: {
                    include: {
                        user: { select: { id: true, username: true, email: true } }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        const total = await prisma.review.count();

        return { success: true, data: reviews, total, totalPages: Math.ceil(total / pageSize) };
    } catch (error) {
        console.error("[Get Admin Reviews Error]:", error);
        return { success: false, message: "Erreur lors de la récupération des avis." };
    }
}

export async function deleteReviewAction(id: string) {
    try {
        await checkAdmin();
        const review = await prisma.review.delete({
            where: { id }
        });
        
        revalidatePath(`/admin/reviews`);
        revalidatePath(`/product/${review.productId}`);
        return { success: true, message: "Avis supprimé avec succès." };
    } catch (error) {
        console.error("[Delete Review Error]:", error);
        return { success: false, message: "Erreur lors de la suppression de l'avis." };
    }
}

export async function updateReportStatusAction(reportId: string, status: 'PENDING' | 'RESOLVED' | 'IGNORED') {
    try {
        await checkAdmin();
        await prisma.report.update({
            where: { id: reportId },
            data: { status }
        });
        
        revalidatePath(`/admin/reviews`);
        return { success: true, message: "Statut mis à jour avec succès." };
    } catch (error) {
        console.error("[Update Report Status Error]:", error);
        return { success: false, message: "Erreur lors de la mise à jour." };
    }
}
