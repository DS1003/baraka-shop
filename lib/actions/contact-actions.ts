'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { emailService } from '@/lib/email-service';
import { notifyAdminsNewContactMessage } from '@/lib/notification-service';

function safeRevalidate(path: string) {
    try {
        revalidatePath(path);
    } catch {}
}
function getPrismaClient() {
    if ((prisma as any)?.contactMessage) return prisma;
    if ((prisma as any)?.default?.contactMessage) return (prisma as any).default;
    if ((globalThis as any).prismaGlobal?.contactMessage) return (globalThis as any).prismaGlobal;
    return prisma;
}

// Admin verification guard
async function requireAdmin() {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
        throw new Error('Accès réservé aux administrateurs.');
    }
    return session;
}

export interface ContactSubmissionInput {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
}

/**
 * Soumission publique du formulaire de contact
 */
export async function submitContactMessage(input: ContactSubmissionInput) {
    try {
        const name = input.name?.trim();
        const email = input.email?.trim().toLowerCase();
        const phone = input.phone?.trim() || null;
        const subject = input.subject?.trim();
        const message = input.message?.trim();

        if (!name || !email || !subject || !message) {
            return {
                success: false,
                error: 'Veuillez remplir tous les champs obligatoires (nom, email, sujet et message).'
            };
        }

        // Email basic validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return {
                success: false,
                error: 'Adresse email invalide.'
            };
        }

        const db = getPrismaClient();

        // 1. Sauvegarde en Base de Données (Option 3)
        const contactRecord = await db.contactMessage.create({
            data: {
                name,
                email,
                phone,
                subject,
                message,
                status: 'UNREAD',
            }
        });

        // 2. Notification interne Admin
        try {
            await notifyAdminsNewContactMessage(contactRecord.id, name, subject);
        } catch (notifErr) {
            console.warn('[ContactAction] Échec notification interne:', notifErr);
        }

        // 3. Envoi d'email de notification aux admins / contact@baraka.sn (Option 2)
        try {
            await emailService.sendContactNotificationEmail({
                name,
                email,
                phone,
                subject,
                message,
                createdAt: contactRecord.createdAt
            });
        } catch (emailErr) {
            console.warn('[ContactAction] Échec notification email:', emailErr);
        }

        safeRevalidate('/admin/messages');

        return {
            success: true,
            message: 'Votre message a bien été envoyé. Notre équipe Baraka Shop vous répondra dans les plus brefs délais !'
        };
    } catch (error: any) {
        console.error('[ContactAction] Erreur lors de la soumission:', error);
        return {
            success: false,
            error: error?.message || 'Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer.'
        };
    }
}

/**
 * Récupérer la liste des messages pour l'admin
 */
export async function getContactMessages(filters?: {
    status?: string;
    search?: string;
    page?: number;
    pageSize?: number;
}) {
    await requireAdmin();

    const page = Math.max(1, filters?.page || 1);
    const pageSize = Math.max(1, filters?.pageSize || 30);
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (filters?.status && filters.status !== 'ALL') {
        where.status = filters.status;
    }

    if (filters?.search && filters.search.trim().length > 0) {
        const s = filters.search.trim();
        where.OR = [
            { name: { contains: s, mode: 'insensitive' } },
            { email: { contains: s, mode: 'insensitive' } },
            { subject: { contains: s, mode: 'insensitive' } },
            { message: { contains: s, mode: 'insensitive' } },
            { phone: { contains: s, mode: 'insensitive' } },
        ];
    }

    const db = getPrismaClient();

    const [messages, totalCount] = await Promise.all([
        db.contactMessage.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: pageSize,
        }),
        db.contactMessage.count({ where }),
    ]);

    return {
        messages,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
    };
}

/**
 * Récupérer les statistiques des messages
 */
export async function getContactStats() {
    await requireAdmin();

    const db = getPrismaClient();

    const [total, unread, read, replied, archived] = await Promise.all([
        db.contactMessage.count(),
        db.contactMessage.count({ where: { status: 'UNREAD' } }),
        db.contactMessage.count({ where: { status: 'READ' } }),
        db.contactMessage.count({ where: { status: 'REPLIED' } }),
        db.contactMessage.count({ where: { status: 'ARCHIVED' } }),
    ]);

    return {
        total,
        unread,
        read,
        replied,
        archived,
    };
}

/**
 * Mettre à jour le statut d'un message (ex: READ, UNREAD, ARCHIVED, REPLIED)
 */
export async function updateContactMessageStatus(id: string, status: string) {
    await requireAdmin();

    const validStatuses = ['UNREAD', 'READ', 'REPLIED', 'ARCHIVED'];
    if (!validStatuses.includes(status)) {
        throw new Error('Statut invalide.');
    }

    const db = getPrismaClient();

    const updated = await db.contactMessage.update({
        where: { id },
        data: { status },
    });

    safeRevalidate('/admin/messages');
    return { success: true, message: updated };
}

/**
 * Enregistrer une note de réponse admin
 */
export async function saveContactMessageReplyNote(id: string, replyNote: string) {
    await requireAdmin();

    const db = getPrismaClient();

    const updated = await db.contactMessage.update({
        where: { id },
        data: {
            replyNote,
            status: 'REPLIED'
        },
    });

    safeRevalidate('/admin/messages');
    return { success: true, message: updated };
}

/**
 * Supprimer un message
 */
export async function deleteContactMessage(id: string) {
    await requireAdmin();

    const db = getPrismaClient();

    await db.contactMessage.delete({
        where: { id },
    });

    safeRevalidate('/admin/messages');
    return { success: true };
}
