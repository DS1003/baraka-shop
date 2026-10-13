'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { notifyClientOrderStatusChange, notifyAdminsNewOrder } from '@/lib/notification-service';
import { validateCoupon } from '@/lib/promotions/validation';
import { calculateDiscount } from '@/lib/promotions/calculation';
import { recordCouponUsage, updateCampaignStats } from '@/lib/promotions/eligibility';

interface OrderItemData {
    productId: string;
    quantity: number;
    price?: number;
    selectedColor?: string;
}

interface CreateOrderData {
    items: OrderItemData[];
    total?: number;
    paymentMethod: string;
    deliveryMethod: 'livraison' | 'retrait';
    deliveryZone?: string;
    shippingCost: number;
    couponCode?: string;
    shippingDetails?: {
        firstName?: string;
        lastName?: string;
        address?: string;
        city?: string;
        area?: string;
        phone?: string;
    };
}

export async function createOrder(data: CreateOrderData) {
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false, error: "Vous devez être connecté pour passer une commande." };
    }

    // ── Validation stricte des articles du panier ──
    if (!Array.isArray(data.items) || data.items.length === 0) {
        return { success: false, error: "Votre panier est vide." };
    }

    for (const item of data.items) {
        if (!item.productId || typeof item.productId !== 'string') {
            return { success: false, error: "Identifiant de produit invalide." };
        }
        if (!Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > 500) {
            return { success: false, error: "Quantité d'article invalide." };
        }
    }

    try {
        // ── Récupération des prix authentiques depuis la base de données (source de vérité) ──
        const productIds = data.items.map(item => item.productId);
        const uniqueProductIds = Array.from(new Set(productIds));
        const foundProducts = await prisma.product.findMany({
            where: { id: { in: uniqueProductIds } },
            select: { id: true, stock: true, name: true, price: true }
        });

        if (foundProducts.length !== uniqueProductIds.length) {
            return { success: false, error: "Certains produits de votre panier ne sont plus disponibles ou ont été supprimés du catalogue." };
        }

        const productMap = new Map(foundProducts.map(p => [p.id, p]));

        // Vérification du stock
        for (const item of data.items) {
            const p = productMap.get(item.productId);
            if (!p || p.stock < item.quantity) {
                return { success: false, error: `Stock insuffisant pour le produit: ${p?.name || 'Inconnu'}` };
            }
        }

        // ── Calcul du sous-total basé STRICTEMENT sur les prix de la BDD ──
        const serverSubtotal = data.items.reduce((sum, item) => {
            const p = productMap.get(item.productId)!;
            const realPrice = Math.max(0, p.price ?? 0);
            return sum + realPrice * item.quantity;
        }, 0);

        // ── Validation et calcul de la remise coupon (côté serveur) ──
        let discountAmount = 0;
        let couponCode: string | null = null;
        let campaignId: string | null = null;

        if (data.couponCode && typeof data.couponCode === 'string') {
            const cleanCoupon = data.couponCode.trim().toUpperCase();
            const validation = await validateCoupon(cleanCoupon, session.user.id, serverSubtotal);
            if (validation.valid && validation.campaign) {
                const calc = calculateDiscount(
                    serverSubtotal,
                    validation.campaign.discountType,
                    validation.campaign.discountValue
                );
                discountAmount = calc.discountAmount;
                couponCode = validation.campaign.couponCode;
                campaignId = validation.campaign.id;
            }
        }

        // ── Calcul du montant total final (sécurisé, sans valeur négative) ──
        const shipping = Math.max(0, typeof data.shippingCost === 'number' && !isNaN(data.shippingCost) ? data.shippingCost : 0);
        const serverTotal = Math.max(0, serverSubtotal - discountAmount + shipping);

        // ── Transaction sécurisée de création de commande ──
        const order = await prisma.$transaction(async (tx) => {
            // Re-vérification atomique du stock dans la transaction
            for (const item of data.items) {
                const currentProd = await tx.product.findUnique({
                    where: { id: item.productId },
                    select: { stock: true, name: true }
                });
                if (!currentProd || currentProd.stock < item.quantity) {
                    throw new Error(`Stock insuffisant pour le produit: ${currentProd?.name || 'Inconnu'}`);
                }
            }

            const newOrder = await tx.order.create({
                data: {
                    userId: session.user.id!,
                    subtotal: serverSubtotal,
                    couponCode: couponCode,
                    discountAmount: discountAmount,
                    total: serverTotal,
                    paymentMethod: typeof data.paymentMethod === 'string' ? data.paymentMethod : 'CASH_ON_DELIVERY',
                    deliveryMethod: data.deliveryMethod === 'retrait' ? 'retrait' : 'livraison',
                    deliveryZone: data.deliveryZone ? String(data.deliveryZone).slice(0, 100) : null,
                    shippingCost: shipping,
                    status: 'PENDING',
                    items: {
                        create: data.items.map(item => {
                            const p = productMap.get(item.productId)!;
                            return {
                                productId: item.productId,
                                quantity: item.quantity,
                                price: Math.max(0, p.price ?? 0), // Prix officiel de la BDD
                                selectedColor: item.selectedColor ? String(item.selectedColor).slice(0, 50) : null
                            };
                        })
                    }
                }
            });

            for (const item of data.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } }
                });
            }

            return newOrder;
        });

        // ── Enregistrement de l'utilisation du coupon (non-bloquant) ──
        if (campaignId && couponCode) {
            recordCouponUsage(campaignId, session.user.id, order.id).catch(() => {});
            updateCampaignStats(campaignId, serverTotal, discountAmount).catch(() => {});
        }

        // Notification client & admins (non-bloquant)
        const clientName = data.shippingDetails?.firstName
            ? `${data.shippingDetails.firstName} ${data.shippingDetails.lastName || ''}`.trim()
            : session.user.name || session.user.email || 'Client';

        await notifyClientOrderStatusChange(order.id, 'PENDING').catch((e) => console.error('Error notifying client:', e));
        await notifyAdminsNewOrder(order.id, clientName, serverTotal).catch((e) => console.error('Error notifying admins:', e));

        revalidatePath('/account');
        return { success: true, orderId: order.id };
    } catch (error: any) {
        console.error("Order creation error:", error);
        return { success: false, error: "Erreur lors de la création de la commande: " + (error?.message || String(error)) };
    }
}

