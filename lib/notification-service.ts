'use server';

import prisma from '@/lib/prisma';
import { rememberCache, invalidatePrefix } from '@/lib/redis';
import { formatPrice } from '@/lib/utils';

// ============================================
// STATUS MESSAGE CONFIG
// ============================================

interface StatusMessageConfig {
    clientTitle: string;
    clientMessage: (orderRef: string, deliveryMethod?: string | null) => string;
    adminTitle: (clientName: string) => string;
    adminMessage: (orderRef: string, total: number) => string;
    type: string;
}

const STATUS_MESSAGES: Record<string, StatusMessageConfig> = {
    PROCESSING: {
        type: 'ORDER_PROCESSING',
        clientTitle: '🔧 Commande en traitement',
        clientMessage: (ref) => `Votre commande ${ref} est en cours de préparation par notre équipe. Nous vous tiendrons informé de l'avancement.`,
        adminTitle: (name) => `Commande de ${name} en traitement`,
        adminMessage: (ref, total) => `La commande ${ref} (${formatPrice(total)}) est passée en traitement.`,
    },
    SHIPPED: {
        type: 'ORDER_SHIPPED',
        clientTitle: '🚚 Commande expédiée',
        clientMessage: (ref, deliveryMethod) =>
            deliveryMethod === 'retrait'
                ? `Bonne nouvelle ! Votre commande ${ref} est prête pour le retrait en boutique. Rendez-vous en magasin avec votre numéro de commande.`
                : `Votre commande ${ref} a été expédiée et est en cours de livraison. Elle arrivera bientôt !`,
        adminTitle: (name) => `Commande de ${name} expédiée`,
        adminMessage: (ref, total) => `La commande ${ref} (${formatPrice(total)}) a été expédiée.`,
    },
    DELIVERED: {
        type: 'ORDER_DELIVERED',
        clientTitle: '✅ Commande livrée',
        clientMessage: (ref, deliveryMethod) =>
            deliveryMethod === 'retrait'
                ? `Votre commande ${ref} a été récupérée avec succès. Merci pour votre confiance !`
                : `Votre commande ${ref} a été livrée avec succès. Merci pour votre confiance et à bientôt !`,
        adminTitle: (name) => `Commande de ${name} livrée`,
        adminMessage: (ref, total) => `La commande ${ref} (${formatPrice(total)}) a été livrée avec succès.`,
    },
    CANCELLED: {
        type: 'ORDER_CANCELLED',
        clientTitle: '❌ Commande annulée',
        clientMessage: (ref) => `Votre commande ${ref} a été annulée. Si vous avez des questions, n'hésitez pas à nous contacter.`,
        adminTitle: (name) => `Commande de ${name} annulée`,
        adminMessage: (ref, total) => `La commande ${ref} (${formatPrice(total)}) a été annulée.`,
    },
    PENDING: {
        type: 'ORDER_CREATED',
        clientTitle: '📦 Commande confirmée',
        clientMessage: (ref) => `Votre commande ${ref} a bien été enregistrée. Notre équipe va la traiter dans les plus brefs délais.`,
        adminTitle: (name) => `Nouvelle commande de ${name}`,
        adminMessage: (ref, total) => `Nouvelle commande ${ref} reçue pour un montant de ${formatPrice(total)}.`,
    },
};

// ============================================
// NOTIFICATION CREATION
// ============================================

import { emailService } from './email-service';
import { getSiteLogos } from '@/lib/actions/site-config-actions';

/**
 * Notifier le client d'un changement de statut de commande
 */
export async function notifyClientOrderStatusChange(
    orderId: string,
    newStatus: string
) {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: true,
                items: {
                    include: {
                        product: true
                    }
                }
            },
        });

        if (!order || !order.user) return;

        const config = STATUS_MESSAGES[newStatus];
        if (!config) return;

        const orderRef = `#ORD-${orderId.substring(0, 8).toUpperCase()}`;

        // Custom client message for SHIPPED to match user requirements exactly
        let clientMessage = config.clientMessage(orderRef, order.deliveryMethod);
        if (newStatus === 'SHIPPED') {
             clientMessage = `Votre commande ${orderRef} est actuellement en cours d'acheminement.\nVous pouvez consulter son suivi dans votre espace client.`;
        }

        await prisma.notification.create({
            data: {
                userId: order.userId,
                type: config.type,
                title: config.clientTitle,
                message: clientMessage,
                orderId: orderId,
            },
        });
        invalidatePrefix(`notifications:${order.userId}`).catch(() => {});

        // Trigger transactional emails according to status change
        if (order.user.email) {
            const { headerLogo } = await getSiteLogos();
            const baseUrl = process.env.NEXTAUTH_URL || 'https://baraka.sn';
            let logoUrl: string | undefined = undefined;
            if (headerLogo) {
                logoUrl = headerLogo.startsWith('http') ? headerLogo : `${baseUrl}${headerLogo.startsWith('/') ? '' : '/'}${headerLogo}`;
            }

            const items = order.items.map(item => {
                let img = item.product.images?.[0] || 'https://via.placeholder.com/60';
                if (img && !img.startsWith('http')) {
                    img = `${baseUrl}${img.startsWith('/') ? '' : '/'}${img}`;
                }
                return {
                    name: item.product.name,
                    quantity: item.quantity,
                    price: item.price,
                    image: img,
                };
            });

            const formatPaymentMethodName = (method?: string | null): string => {
                if (!method) return 'Paiement à la livraison';
                const m = method.toLowerCase();
                if (m === 'cash' || m === 'cash_on_delivery' || m.includes('livraison')) return 'Paiement à la livraison';
                if (m.includes('wave')) return 'Wave';
                if (m.includes('orange') || m === 'om') return 'Orange Money';
                if (m.includes('card') || m.includes('carte')) return 'Carte bancaire';
                return method;
            };

            const pStatus = (order as any).paymentStatus || (newStatus === 'DELIVERED' ? 'PAID' : 'PENDING');
            const clientName = (order as any).customerName || order.user.username || 'Client';

            let deliveryAddress: string | undefined = undefined;
            if (order.deliveryMethod === 'retrait') {
                deliveryAddress = 'Retrait en boutique Baraka Shop';
            } else if ((order as any).shippingAddress) {
                const zoneInfo = order.deliveryZone ? ` — ${order.deliveryZone}` : '';
                deliveryAddress = `${(order as any).shippingAddress}${zoneInfo}`;
            } else if (order.user.address) {
                deliveryAddress = order.user.address;
            }

            const phone = (order as any).shippingPhone || order.user.phone || undefined;

            const emailPayload = {
                to: order.user.email,
                orderRef: orderRef,
                orderId: order.id,
                clientName: clientName,
                date: order.createdAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
                deliveryAddress: deliveryAddress,
                phone: phone,
                deliveryMethod: order.deliveryMethod === 'retrait' ? 'Retrait en boutique' : 'Livraison à domicile',
                paymentMethod: formatPaymentMethodName(order.paymentMethod),
                paymentStatus: pStatus,
                total: order.total,
                subtotal: order.total - (order.shippingCost || 0),
                deliveryFee: order.shippingCost || 0,
                discount: (order as any).discountAmount || 0,
                items: items,
                logoUrl: logoUrl,
            };

            if (newStatus === 'PENDING') {
                await emailService.sendOrderCreatedEmail(emailPayload);
            } else if (newStatus === 'SHIPPED') {
                await emailService.sendOrderShippedEmail(emailPayload);
            } else if (newStatus === 'DELIVERED') {
                await emailService.sendOrderDeliveredEmail(emailPayload);
            } else if (newStatus === 'CANCELLED') {
                await emailService.sendOrderCancelledEmail(emailPayload);
            }
        }
    } catch (error) {
        console.error('[NotificationService] Client notification error:', error);
    }
}

/**
 * Notifier tous les admins d'un événement lié à une commande
 */
export async function notifyAdminsNewOrder(
    orderId: string,
    clientName: string,
    total: number
) {
    try {
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: { id: true },
        });

        const orderRef = `#ORD-${orderId.substring(0, 8).toUpperCase()}`;

        const notifications = admins.map((admin) => ({
            userId: admin.id,
            type: 'NEW_ORDER_ADMIN',
            title: `🛒 Nouvelle commande de ${clientName}`,
            message: `Commande ${orderRef} reçue — ${formatPrice(total)}`,
            orderId: orderId,
        }));

        if (notifications.length > 0) {
            await prisma.notification.createMany({
                data: notifications,
            });
            invalidatePrefix('notifications:').catch(() => {});
        }
    } catch (error) {
        console.error('[NotificationService] Admin notification error:', error);
    }
}

/**
 * Notifier les admins d'un changement de statut
 */
export async function notifyAdminsOrderStatusChange(
    orderId: string,
    newStatus: string,
    clientName: string,
    total: number
) {
    try {
        const config = STATUS_MESSAGES[newStatus];
        if (!config || newStatus === 'PENDING') return; // PENDING is handled by notifyAdminsNewOrder

        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: { id: true },
        });

        const orderRef = `#ORD-${orderId.substring(0, 8).toUpperCase()}`;

        const notifications = admins.map((admin) => ({
            userId: admin.id,
            type: config.type,
            title: config.adminTitle(clientName),
            message: config.adminMessage(orderRef, total),
            orderId: orderId,
        }));

        if (notifications.length > 0) {
            await prisma.notification.createMany({
                data: notifications,
            });
            invalidatePrefix('notifications:').catch(() => {});
        }
    } catch (error) {
        console.error('[NotificationService] Admin status notification error:', error);
    }
}

// ============================================
// NOTIFICATION QUERIES
// ============================================

/**
 * Récupérer les notifications d'un utilisateur
 */
export async function getUserNotifications(userId: string, limit: number = 30) {
    return rememberCache(`notifications:list:${userId}:${limit}`, 30, async () => {
        try {
            return await prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: limit,
            });
        } catch (error: any) {
            // Tentative de reconnexion si la base Neon était en veille (cold-start P1001)
            if (error?.code === 'P1001' || error?.message?.includes('timeout exceeded')) {
                try {
                    await new Promise((r) => setTimeout(r, 1000));
                    return await prisma.notification.findMany({
                        where: { userId },
                        orderBy: { createdAt: 'desc' },
                        take: limit,
                    });
                } catch {
                    // Ignore silent retry failure and fallback to empty array
                }
            }
            console.error('[NotificationService] Fetch notifications error:', error?.message || error);
            return [];
        }
    });
}

/**
 * Compter les notifications non lues
 */
export async function getUnreadCount(userId: string): Promise<number> {
    return rememberCache(`notifications:unread:${userId}`, 30, async () => {
        try {
            return await prisma.notification.count({
                where: { userId, isRead: false },
            });
        } catch (error: any) {
            // Tentative de reconnexion si la base Neon était en veille (cold-start P1001)
            if (error?.code === 'P1001' || error?.message?.includes('timeout exceeded')) {
                try {
                    await new Promise((r) => setTimeout(r, 1000));
                    return await prisma.notification.count({
                        where: { userId, isRead: false },
                    });
                } catch {
                    // Ignore silent retry failure
                }
            }
            console.error('[NotificationService] Count unread error:', error?.message || error);
            return 0;
        }
    });
}

/**
 * Marquer une notification comme lue (avec vérification de propriété si userId fourni)
 */
export async function markAsRead(notificationId: string, userId?: string) {
    try {
        if (userId) {
            const result = await prisma.notification.updateMany({
                where: { id: notificationId, userId },
                data: { isRead: true },
            });
            invalidatePrefix(`notifications:${userId}`).catch(() => {});
            return { success: result.count > 0 };
        }

        const notif = await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });
        invalidatePrefix(`notifications:${notif.userId}`).catch(() => {});
        return { success: true };
    } catch (error) {
        console.error('[NotificationService] Mark read error:', error);
        return { success: false };
    }
}

/**
 * Marquer toutes les notifications d'un utilisateur comme lues
 */
export async function markAllAsRead(userId: string) {
    try {
        await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        invalidatePrefix(`notifications:${userId}`).catch(() => {});
        return { success: true };
    } catch (error) {
        console.error('[NotificationService] Mark all read error:', error);
        return { success: false };
    }
}

/**
 * Notifier les administrateurs lors de la réception d'un nouveau message de contact
 */
export async function notifyAdminsNewContactMessage(
    contactId: string,
    senderName: string,
    subject: string
) {
    try {
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: { id: true },
        });

        const notifications = admins.map((admin) => ({
            userId: admin.id,
            type: 'NEW_CONTACT_MESSAGE',
            title: `💬 Nouveau message de ${senderName}`,
            message: `Sujet : ${subject} (cliquez pour voir dans Messages)`,
            orderId: null,
        }));

        if (notifications.length > 0) {
            await prisma.notification.createMany({
                data: notifications,
            });
            invalidatePrefix('notifications:').catch(() => {});
        }
        return { success: true };
    } catch (error) {
        console.error('[NotificationService] Admin contact notification error:', error);
        return { success: false, error };
    }
}

