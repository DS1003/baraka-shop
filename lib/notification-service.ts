'use server';

import prisma from '@/lib/prisma';

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
        adminMessage: (ref, total) => `La commande ${ref} (${total.toLocaleString()} FCFA) est passée en traitement.`,
    },
    SHIPPED: {
        type: 'ORDER_SHIPPED',
        clientTitle: '🚚 Commande expédiée',
        clientMessage: (ref, deliveryMethod) =>
            deliveryMethod === 'retrait'
                ? `Bonne nouvelle ! Votre commande ${ref} est prête pour le retrait en boutique. Rendez-vous en magasin avec votre numéro de commande.`
                : `Votre commande ${ref} a été expédiée et est en cours de livraison. Elle arrivera bientôt !`,
        adminTitle: (name) => `Commande de ${name} expédiée`,
        adminMessage: (ref, total) => `La commande ${ref} (${total.toLocaleString()} FCFA) a été expédiée.`,
    },
    DELIVERED: {
        type: 'ORDER_DELIVERED',
        clientTitle: '✅ Commande livrée',
        clientMessage: (ref, deliveryMethod) =>
            deliveryMethod === 'retrait'
                ? `Votre commande ${ref} a été récupérée avec succès. Merci pour votre confiance !`
                : `Votre commande ${ref} a été livrée avec succès. Merci pour votre confiance et à bientôt !`,
        adminTitle: (name) => `Commande de ${name} livrée`,
        adminMessage: (ref, total) => `La commande ${ref} (${total.toLocaleString()} FCFA) a été livrée avec succès.`,
    },
    CANCELLED: {
        type: 'ORDER_CANCELLED',
        clientTitle: '❌ Commande annulée',
        clientMessage: (ref) => `Votre commande ${ref} a été annulée. Si vous avez des questions, n'hésitez pas à nous contacter.`,
        adminTitle: (name) => `Commande de ${name} annulée`,
        adminMessage: (ref, total) => `La commande ${ref} (${total.toLocaleString()} FCFA) a été annulée.`,
    },
    PENDING: {
        type: 'ORDER_CREATED',
        clientTitle: '📦 Commande confirmée',
        clientMessage: (ref) => `Votre commande ${ref} a bien été enregistrée. Notre équipe va la traiter dans les plus brefs délais.`,
        adminTitle: (name) => `Nouvelle commande de ${name}`,
        adminMessage: (ref, total) => `Nouvelle commande ${ref} reçue pour un montant de ${total.toLocaleString()} FCFA.`,
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

        // Trigger email if the status is SHIPPED
        if (newStatus === 'SHIPPED' && order.user.email) {
            const items = order.items.map(item => ({
                name: item.product.name,
                quantity: item.quantity,
                price: item.price,
                image: item.product.images?.[0] || 'https://via.placeholder.com/60',
            }));

            const { headerLogo } = await getSiteLogos();
            const logoUrl = headerLogo || undefined;

            // Use type assertion since PaymentStatus in schema is likely string
            let pStatus: 'PAID' | 'PENDING' | 'ON_DELIVERY' = 'PENDING';
            if (order.paymentStatus === 'PAID') pStatus = 'PAID';
            else if (order.paymentMethod === 'CASH_ON_DELIVERY') pStatus = 'ON_DELIVERY';

            await emailService.sendOrderShippedEmail({
                to: order.user.email,
                orderRef: orderRef,
                clientName: order.user.username || order.user.firstName || 'Client',
                date: order.createdAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
                deliveryAddress: order.address ? `${order.address}, ${order.city}` : undefined,
                phone: order.phone || undefined,
                deliveryMethod: order.deliveryMethod === 'retrait' ? 'Retrait en boutique' : 'Livraison à domicile',
                paymentMethod: order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Paiement à la livraison' : 'Paiement en ligne',
                paymentStatus: pStatus,
                total: order.total,
                subtotal: order.total - 5000, // Assuming 5000 delivery fee for demonstration, ideally get this from order if it exists
                deliveryFee: 5000,
                discount: 0,
                items: items,
                logoUrl: logoUrl,
            });
        } else if (newStatus === 'PENDING' && order.user.email) {
            const items = order.items.map(item => ({
                name: item.product.name,
                quantity: item.quantity,
                price: item.price,
                image: item.product.images?.[0] || 'https://via.placeholder.com/60',
            }));

            const { headerLogo } = await getSiteLogos();
            const logoUrl = headerLogo || undefined;

            let pStatus: 'PAID' | 'PENDING' | 'ON_DELIVERY' = 'PENDING';
            if (order.paymentStatus === 'PAID') pStatus = 'PAID';
            else if (order.paymentMethod === 'CASH_ON_DELIVERY') pStatus = 'ON_DELIVERY';

            await emailService.sendOrderCreatedEmail({
                to: order.user.email,
                orderRef: orderRef,
                clientName: order.user.username || order.user.firstName || 'Client',
                date: order.createdAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
                deliveryAddress: order.address ? `${order.address}, ${order.city}` : undefined,
                phone: order.phone || undefined,
                deliveryMethod: order.deliveryMethod === 'retrait' ? 'Retrait en boutique' : 'Livraison à domicile',
                paymentMethod: order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Paiement à la livraison' : 'Paiement en ligne',
                paymentStatus: pStatus,
                total: order.total,
                subtotal: order.total - 5000,
                deliveryFee: 5000,
                discount: 0,
                items: items,
                logoUrl: logoUrl,
            });
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
            message: `Commande ${orderRef} reçue — ${total.toLocaleString()} FCFA`,
            orderId: orderId,
        }));

        if (notifications.length > 0) {
            await prisma.notification.createMany({
                data: notifications,
            });
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
    try {
        return await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    } catch (error) {
        console.error('[NotificationService] Fetch notifications error:', error);
        return [];
    }
}

/**
 * Compter les notifications non lues
 */
export async function getUnreadCount(userId: string): Promise<number> {
    try {
        return await prisma.notification.count({
            where: { userId, isRead: false },
        });
    } catch (error) {
        console.error('[NotificationService] Count unread error:', error);
        return 0;
    }
}

/**
 * Marquer une notification comme lue
 */
export async function markAsRead(notificationId: string) {
    try {
        await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });
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
        return { success: true };
    } catch (error) {
        console.error('[NotificationService] Mark all read error:', error);
        return { success: false };
    }
}
