'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { rateLimit } from '@/lib/rate-limit';
import { emailService } from '@/lib/email-service';
import { getSiteLogos } from '@/lib/actions/site-config-actions';
import crypto from 'crypto';

const FALLBACK_LOGO_URL = 'https://res.cloudinary.com/dt6ls5mte/image/upload/v1781307808/products_baraka/skfnsbval6bfd0otays0.png';

function getCanonicalPublicUrl(): string {
    const custom = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
    if (custom && !custom.includes('localhost') && !custom.includes('127.0.0.1')) {
        return custom.replace(/\/$/, '');
    }
    return 'https://www.baraka.sn';
}

async function getEmailLogoUrl(): Promise<string> {
    try {
        const { headerLogo } = await getSiteLogos();
        const baseUrl = getCanonicalPublicUrl();
        if (headerLogo?.startsWith('http') && !headerLogo.includes('localhost')) return headerLogo;
        if (headerLogo) return `${baseUrl}${headerLogo.startsWith('/') ? '' : '/'}${headerLogo}`;
    } catch (e) {
        console.warn('[Newsletter] Impossible de charger le logo du site:', e);
    }
    return FALLBACK_LOGO_URL;
}

function safeRevalidate(path: string) {
    try {
        revalidatePath(path);
    } catch {}
}

function getPrismaClient() {
    if ((prisma as any)?.newsletterSubscriber) return prisma;
    if ((prisma as any)?.default?.newsletterSubscriber) return (prisma as any).default;
    if ((globalThis as any).prismaGlobal?.newsletterSubscriber) return (globalThis as any).prismaGlobal;
    return prisma;
}

// Admin guard
async function requireAdmin() {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
        throw new Error('Accès réservé aux administrateurs.');
    }
    return session;
}

/**
 * Inscription publique à la newsletter (Sécurisée avec Rate Limiting + Hash IP)
 */
export async function subscribeToNewsletter(input: { email: string; source?: string }) {
    try {
        let ip = 'anon';
        try {
            const h = await headers();
            ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon';
        } catch {}

        // Rate limiting anti-spam : max 5 soumissions par 15 minutes par IP
        const limiter = await rateLimit(`newsletter:${ip}`, 5, 900);
        if (!limiter.success) {
            return {
                success: false,
                error: `Trop de tentatives. Veuillez patienter ${Math.ceil(limiter.reset / 60)} minute(s).`
            };
        }

        const email = input.email?.trim().toLowerCase();
        if (!email) {
            return { success: false, error: 'Veuillez saisir une adresse email valide.' };
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email) || email.length > 100) {
            return { success: false, error: 'Format d\'adresse email invalide.' };
        }

        const salt = process.env.AUTH_SECRET || 'baraka-salt-key';
        const ipHash = crypto.createHash('sha256').update(ip + salt).digest('hex').substring(0, 32);
        const token = crypto.randomBytes(32).toString('hex');
        const baseUrl = getCanonicalPublicUrl();
        const unsubscribeUrl = `${baseUrl}/newsletter/unsubscribe?token=${token}`;

        const db = getPrismaClient();

        // Vérifier si l'abonné existe déjà
        const existing = await db.newsletterSubscriber.findUnique({
            where: { email }
        });

        if (existing) {
            if (existing.status === 'ACTIVE') {
                return {
                    success: true,
                    alreadySubscribed: true,
                    message: 'Vous êtes déjà abonné à notre newsletter avec cette adresse email !'
                };
            }

            // Réactivation d'un abonné précédemment désinscrit
            await db.newsletterSubscriber.update({
                where: { id: existing.id },
                data: {
                    status: 'ACTIVE',
                    token,
                    ipHash,
                    unsubscribedAt: null,
                    updatedAt: new Date()
                }
            });

            // Envoi de l'email de bienvenue avec Resend
            try {
                const logoUrl = await getEmailLogoUrl();
                await emailService.sendNewsletterWelcomeEmail({
                    to: email,
                    unsubscribeUrl,
                    promoCode: 'BARAKAVIP',
                    logoUrl,
                });
            } catch (err) {
                console.warn('[Newsletter] Erreur envoi email bienvenue réactivation:', err);
            }

            safeRevalidate('/admin/marketing/newsletter');

            return {
                success: true,
                message: 'Bon retour parmi nous ! Votre abonnement a bien été réactivé.'
            };
        }

        // Nouvel abonné
        await db.newsletterSubscriber.create({
            data: {
                email,
                status: 'ACTIVE',
                token,
                source: input.source || 'HOME',
                ipHash,
                confirmedAt: new Date()
            }
        });

        // Envoi de l'email de bienvenue avec Resend
        try {
            const logoUrl = await getEmailLogoUrl();
            await emailService.sendNewsletterWelcomeEmail({
                to: email,
                unsubscribeUrl,
                promoCode: 'BARAKAVIP',
                logoUrl,
            });
        } catch (err) {
            console.warn('[Newsletter] Erreur envoi email bienvenue:', err);
        }

        safeRevalidate('/admin/marketing/newsletter');

        return {
            success: true,
            message: 'Félicitations ! Vous êtes bien inscrit à la newsletter Baraka. Un email de confirmation vous a été envoyé.'
        };
    } catch (error: any) {
        console.error('[NewsletterAction] Erreur lors de l\'inscription:', error);
        return {
            success: false,
            error: error?.message || 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.'
        };
    }
}

/**
 * Désinscription publique (1-click via le jeton de sécurité)
 */
export async function unsubscribeFromNewsletter(token: string) {
    try {
        if (!token || typeof token !== 'string' || token.length < 16) {
            return { success: false, error: 'Jeton de désinscription invalide ou expiré.' };
        }

        const db = getPrismaClient();

        const subscriber = await db.newsletterSubscriber.findUnique({
            where: { token }
        });

        if (!subscriber) {
            return { success: false, error: 'Abonné introuvable ou déjà désinscrit.' };
        }

        if (subscriber.status === 'UNSUBSCRIBED') {
            return {
                success: true,
                email: subscriber.email,
                message: 'Vous êtes déjà désinscrit de notre newsletter.'
            };
        }

        await db.newsletterSubscriber.update({
            where: { id: subscriber.id },
            data: {
                status: 'UNSUBSCRIBED',
                unsubscribedAt: new Date()
            }
        });

        safeRevalidate('/admin/marketing/newsletter');

        return {
            success: true,
            email: subscriber.email,
            message: 'Vous avez bien été désinscrit de notre liste de diffusion.'
        };
    } catch (error: any) {
        console.error('[NewsletterAction] Erreur lors de la désinscription:', error);
        return {
            success: false,
            error: 'Une erreur est survenue lors de la désinscription.'
        };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Récupérer la liste des abonnés pour l'admin
 */
export async function getNewsletterSubscribers(filters?: {
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
        const s = filters.search.trim().toLowerCase();
        where.email = { contains: s, mode: 'insensitive' };
    }

    const db = getPrismaClient();

    const [subscribers, totalCount] = await Promise.all([
        db.newsletterSubscriber.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: pageSize,
        }),
        db.newsletterSubscriber.count({ where }),
    ]);

    return {
        subscribers,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
    };
}

/**
 * Récupérer les statistiques de la newsletter
 */
export async function getNewsletterStats() {
    await requireAdmin();

    const db = getPrismaClient();

    const [total, active, pending, unsubscribed] = await Promise.all([
        db.newsletterSubscriber.count(),
        db.newsletterSubscriber.count({ where: { status: 'ACTIVE' } }),
        db.newsletterSubscriber.count({ where: { status: 'PENDING' } }),
        db.newsletterSubscriber.count({ where: { status: 'UNSUBSCRIBED' } }),
    ]);

    return {
        total,
        active,
        pending,
        unsubscribed,
    };
}

/**
 * Mettre à jour le statut d'un abonné (ex: ACTIVE, UNSUBSCRIBED)
 */
export async function updateNewsletterSubscriberStatus(id: string, status: string) {
    await requireAdmin();

    const validStatuses = ['ACTIVE', 'PENDING', 'UNSUBSCRIBED'];
    if (!validStatuses.includes(status)) {
        throw new Error('Statut invalide.');
    }

    const db = getPrismaClient();

    const updated = await db.newsletterSubscriber.update({
        where: { id },
        data: {
            status,
            ...(status === 'UNSUBSCRIBED' ? { unsubscribedAt: new Date() } : {})
        },
    });

    safeRevalidate('/admin/marketing/newsletter');
    return { success: true, subscriber: updated };
}

/**
 * Supprimer définitivement un abonné
 */
export async function deleteNewsletterSubscriber(id: string) {
    await requireAdmin();

    const db = getPrismaClient();

    await db.newsletterSubscriber.delete({
        where: { id },
    });

    safeRevalidate('/admin/marketing/newsletter');
    return { success: true };
}

/**
 * Récupérer les campagnes de newsletter
 */
export async function getNewsletterCampaigns() {
    await requireAdmin();

    const db = getPrismaClient();

    const campaigns = await db.newsletterCampaign.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return campaigns;
}

/**
 * Créer une nouvelle campagne de newsletter
 */
export async function createNewsletterCampaign(input: {
    subject: string;
    previewText?: string;
    heading: string;
    content: string;
    imageUrl?: string;
    ctaText?: string;
    ctaUrl?: string;
}) {
    const session = await requireAdmin();

    if (!input.subject || !input.heading || !input.content) {
        return { success: false, error: 'Sujet, titre et contenu sont obligatoires.' };
    }

    const db = getPrismaClient();

    const campaign = await db.newsletterCampaign.create({
        data: {
            subject: input.subject.trim(),
            previewText: input.previewText?.trim() || null,
            heading: input.heading.trim(),
            content: input.content.trim(),
            imageUrl: input.imageUrl?.trim() || null,
            ctaText: input.ctaText?.trim() || null,
            ctaUrl: input.ctaUrl?.trim() || null,
            createdById: (session.user as any)?.id || null,
            status: 'DRAFT',
        }
    });

    safeRevalidate('/admin/marketing/newsletter');
    return { success: true, campaign };
}

/**
 * Envoyer une campagne de newsletter à TOUS les abonnés actifs (avec Resend)
 */
export async function sendNewsletterCampaign(campaignId: string) {
    await requireAdmin();

    const db = getPrismaClient();

    const campaign = await db.newsletterCampaign.findUnique({
        where: { id: campaignId }
    });

    if (!campaign) {
        return { success: false, error: 'Campagne introuvable.' };
    }

    if (campaign.status === 'SENDING') {
        return { success: false, error: 'Cette campagne est déjà en cours d\'envoi.' };
    }

    // Récupérer tous les abonnés ACTIFS
    const activeSubscribers = await db.newsletterSubscriber.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true, email: true, token: true }
    });

    if (activeSubscribers.length === 0) {
        return { success: false, error: 'Aucun abonné actif trouvé pour cet envoi.' };
    }

    // Marquer la campagne comme en cours
    await db.newsletterCampaign.update({
        where: { id: campaignId },
        data: {
            status: 'SENDING',
            recipientCount: activeSubscribers.length,
        }
    });

    const baseUrl = getCanonicalPublicUrl();
    const logoUrl = await getEmailLogoUrl();
    let sentCount = 0;
    let failedCount = 0;

    // Envoi par lot avec temporisation douce pour respecter les quotas Resend
    for (const sub of activeSubscribers) {
        const unsubscribeUrl = `${baseUrl}/newsletter/unsubscribe?token=${sub.token}`;
        try {
            const res = await emailService.sendNewsletterBroadcastEmail({
                to: sub.email,
                subject: campaign.subject,
                previewText: campaign.previewText || undefined,
                heading: campaign.heading,
                content: campaign.content,
                imageUrl: campaign.imageUrl,
                ctaText: campaign.ctaText,
                ctaUrl: campaign.ctaUrl,
                unsubscribeUrl,
                logoUrl,
            });

            if (res.success) {
                sentCount++;
            } else {
                failedCount++;
            }
        } catch (err) {
            console.error(`[NewsletterCampaign] Échec envoi vers ${sub.email}:`, err);
            failedCount++;
        }

        // Temporisation de 100ms entre chaque email pour fluidifier les appels Resend
        await new Promise((res) => setTimeout(res, 100));
    }

    // Mettre à jour l'état final de la campagne
    const finalStatus = sentCount > 0 ? 'SENT' : 'FAILED';
    const updated = await db.newsletterCampaign.update({
        where: { id: campaignId },
        data: {
            status: finalStatus,
            sentCount,
            failedCount,
            sentAt: new Date()
        }
    });

    safeRevalidate('/admin/marketing/newsletter');

    return {
        success: true,
        campaign: updated,
        message: `Campagne envoyée avec succès à ${sentCount} abonné(s) (${failedCount} échec(s)).`
    };
}
