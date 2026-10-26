"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { rememberCache, invalidatePrefix } from '@/lib/redis';

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

        return await rememberCache(`admin:reviews:${page}:${pageSize}`, 60, async () => {
            const [reviews, total] = await Promise.all([
                prisma.review.findMany({
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
                }),
                prisma.review.count()
            ]);

            return { success: true as const, data: reviews, total, totalPages: Math.ceil(total / pageSize), message: undefined as string | undefined };
        });
    } catch (error) {
        console.error("[Get Admin Reviews Error]:", error);
        return { success: false as const, message: "Erreur lors de la récupération des avis.", data: [] as any[] };
    }
}

export async function deleteReviewAction(id: string) {
    try {
        await checkAdmin();
        const review = await prisma.review.delete({
            where: { id }
        });
        
        await invalidatePrefix('admin:reviews:');
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
        
        await invalidatePrefix('admin:reviews:');
        revalidatePath(`/admin/reviews`);
        return { success: true, message: "Statut mis à jour avec succès." };
    } catch (error) {
        console.error("[Update Report Status Error]:", error);
        return { success: false, message: "Erreur lors de la mise à jour." };
    }
}

export async function replyToReviewAction(reviewId: string, reply: string, productId?: string) {
    try {
        await checkAdmin();

        const cleanReply = reply ? String(reply).trim().slice(0, 2000) : '';
        if (!cleanReply) {
            return { success: false, message: "La réponse ne peut pas être vide." };
        }

        const review = await prisma.review.update({
            where: { id: reviewId },
            data: {
                adminReply: cleanReply,
                adminReplyAt: new Date()
            }
        });

        const targetProductId = productId || review.productId;
        await invalidatePrefix('admin:reviews:');
        if (targetProductId) {
            await invalidatePrefix(`product:${targetProductId}`);
            revalidatePath(`/product/${targetProductId}`);
        }
        revalidatePath('/admin/reviews');

        return { 
            success: true, 
            message: "Réponse publiée avec succès !", 
            adminReply: review.adminReply, 
            adminReplyAt: review.adminReplyAt 
        };
    } catch (error: any) {
        console.error("[Reply To Review Error]:", error);
        return { success: false, message: error.message || "Erreur lors de la publication de la réponse." };
    }
}

export async function deleteAdminReplyAction(reviewId: string, productId?: string) {
    try {
        await checkAdmin();

        const review = await prisma.review.update({
            where: { id: reviewId },
            data: {
                adminReply: null,
                adminReplyAt: null
            }
        });

        const targetProductId = productId || review.productId;
        await invalidatePrefix('admin:reviews:');
        if (targetProductId) {
            await invalidatePrefix(`product:${targetProductId}`);
            revalidatePath(`/product/${targetProductId}`);
        }
        revalidatePath('/admin/reviews');

        return { success: true, message: "Réponse supprimée avec succès." };
    } catch (error: any) {
        console.error("[Delete Admin Reply Error]:", error);
        return { success: false, message: error.message || "Erreur lors de la suppression de la réponse." };
    }
}

