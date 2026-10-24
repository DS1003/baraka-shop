'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { rateLimit } from '@/lib/rate-limit';
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
        const orderTxResult = await prisma.$transaction(async (tx) => {
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

            const fullName = data.shippingDetails?.firstName
                ? `${data.shippingDetails.firstName} ${data.shippingDetails.lastName || ''}`.trim()
                : (session.user.name || null);
            const shippingAddress = data.deliveryMethod === 'retrait'
                ? 'Retrait boutique Baraka Shop'
                : (data.shippingDetails?.address?.trim() || null);
            const shippingPhone = data.shippingDetails?.phone?.trim() || (session.user as any)?.phone || null;
            const shippingCity = data.shippingDetails?.city?.trim() || 'Dakar';

            const baseOrderData = {
                userId: session.user.id!,
                subtotal: serverSubtotal,
                couponCode: couponCode,
                discountAmount: discountAmount,
                total: serverTotal,
                paymentMethod: typeof data.paymentMethod === 'string' ? data.paymentMethod : 'CASH_ON_DELIVERY',
                paymentStatus: 'PENDING',
                deliveryMethod: data.deliveryMethod === 'retrait' ? 'retrait' : 'livraison',
                deliveryZone: data.deliveryZone ? String(data.deliveryZone).slice(0, 100) : null,
                shippingCost: shipping,
                status: 'PENDING' as const,
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
            };

            let newOrder: any;
            try {
                newOrder = await tx.order.create({
                    data: {
                        ...baseOrderData,
                        shippingAddress,
                        shippingPhone,
                        customerName: fullName,
                        shippingCity,
                    }
                });
            } catch (createErr: any) {
                if (createErr?.message?.includes('shippingAddress') || createErr?.message?.includes('Unknown argument')) {
                    console.warn('[OrderActions] Stale Prisma client detected, falling back to base create + SQL update...');
                    newOrder = await tx.order.create({
                        data: baseOrderData
                    });
                    await tx.$executeRawUnsafe(
                        `UPDATE "Order" SET "shippingAddress" = $1, "shippingPhone" = $2, "customerName" = $3, "shippingCity" = $4 WHERE id = $5`,
                        shippingAddress,
                        shippingPhone,
                        fullName,
                        shippingCity,
                        newOrder.id
                    ).catch((e: any) => console.error('[OrderActions] Failed raw update of shipping fields:', e));
                    newOrder.shippingAddress = shippingAddress;
                    newOrder.shippingPhone = shippingPhone;
                    newOrder.customerName = fullName;
                    newOrder.shippingCity = shippingCity;
                } else {
                    throw createErr;
                }
            }

            // Sauvegarder également l'adresse et le téléphone sur le profil utilisateur s'ils sont vides
            if (shippingAddress && shippingAddress !== 'Retrait boutique Baraka Shop') {
                await tx.user.update({
                    where: { id: session.user.id! },
                    data: {
                        address: shippingAddress,
                        ...(shippingPhone ? { phone: shippingPhone } : {})
                    }
                }).catch(() => {
                    // Si le téléphone a un conflit unique, on met à jour uniquement l'adresse
                    return tx.user.update({
                        where: { id: session.user.id! },
                        data: { address: shippingAddress }
                    }).catch(() => {});
                });
            }

            const depletedProductIds: string[] = [];

            for (const item of data.items) {
                const updatedProd = await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } },
                    select: { id: true, stock: true }
                });

                // Règle A : Si la commande ramène le stock à 0 (ou moins), désactivation automatique immédiate
                if (updatedProd.stock <= 0) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            isPublished: false,
                            deactivationReason: 'OUT_OF_STOCK',
                            deactivatedAt: new Date(),
                            restockPendingReview: false
                        }
                    });
                    depletedProductIds.push(item.productId);
                }
            }

            // ── Enregistrement atomique du coupon dans la transaction ──
            if (campaignId && couponCode) {
                await tx.couponUsage.create({
                    data: {
                        campaignId,
                        userId: session.user.id!,
                        orderId: newOrder.id,
                    }
                });
                await tx.promotionCampaign.update({
                    where: { id: campaignId },
                    data: {
                        codeUses: { increment: 1 },
                        totalRevenue: { increment: serverTotal },
                        totalDiscount: { increment: discountAmount },
                    }
                });
            }

            return { newOrder, depletedProductIds };
        });

        const order = orderTxResult.newOrder;

        // Invalidation des caches Redis (non-bloquant)
        import('@/lib/redis').then(({ invalidateCache, invalidatePrefix }) => {
            const promises: Promise<any>[] = [
                invalidatePrefix('admin:orders:'),
                invalidatePrefix('admin:dashboard:'),
                invalidatePrefix('admin:category:revenue'),
                invalidatePrefix('products:')
            ];

            // Invalider le cache individuel de chaque produit commandé
            data.items.forEach(it => {
                promises.push(invalidateCache(`product:${it.productId}`));
            });

            // Si des produits sont tombés en rupture de stock
            if (orderTxResult.depletedProductIds.length > 0) {
                promises.push(
                    invalidatePrefix('similar:'),
                    invalidatePrefix('categories:'),
                    invalidatePrefix('brands:'),
                    invalidatePrefix('admin:products:'),
                    invalidatePrefix('admin:out-of-stock:')
                );
            }
            Promise.all(promises).catch(() => {});
        }).catch(() => {});

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

function maskName(name?: string | null): string | null {
    if (!name) return null;
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts.slice(1).map(p => p[0] ? p[0] + '***' : '').join(' ')}`.trim();
}

function maskPhone(phone?: string | null): string | null {
    if (!phone) return null;
    const clean = phone.trim();
    if (clean.length <= 4) return clean;
    const prefix = clean.slice(0, 3);
    const suffix = clean.slice(-2);
    return `${prefix} ••• •• ${suffix}`;
}

function maskAddress(addr?: string | null, city?: string | null): string | null {
    if (!addr) return city || null;
    if (addr.toLowerCase().includes('retrait')) return addr;
    return city ? `Adresse enregistrée (${city})` : 'Adresse enregistrée';
}

export async function getOrderSuccessDetails(orderId: string) {
    if (!orderId || typeof orderId !== 'string') {
        return { success: false, order: null };
    }

    try {
        // Protection anti-bruteforce & anti-énumération (25 requêtes par minute par IP)
        let clientIp = 'anon';
        try {
            const h = await headers();
            clientIp = h.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon';
        } catch {}

        const limiter = await rateLimit(`order_lookup:${clientIp}`, 25, 60);
        if (!limiter.success) {
            return { success: false, order: null, error: 'Trop de requêtes. Veuillez patienter.' };
        }

        const trimmed = orderId.trim();
        const cleanRef = trimmed.replace(/^#?ORD-/i, '').trim();

        // Refuser les préfixes trop courts (sécurité anti-énumération)
        if (cleanRef.length < 8 && trimmed.length < 8) {
            return { success: false, order: null };
        }

        const selectFields = {
            id: true,
            userId: true,
            total: true,
            subtotal: true,
            status: true,
            paymentStatus: true,
            paymentMethod: true,
            deliveryMethod: true,
            deliveryZone: true,
            shippingAddress: true,
            shippingPhone: true,
            customerName: true,
            shippingCity: true,
            shippingCost: true,
            createdAt: true,
            items: {
                select: {
                    id: true,
                    quantity: true,
                    price: true,
                    selectedColor: true,
                    product: {
                        select: {
                            name: true,
                            images: true,
                        }
                    }
                }
            }
        };

        // 1. Recherche par ID exact (UUID)
        let order = await prisma.order.findUnique({
            where: { id: trimmed },
            select: selectFields
        });

        // 2. Si non trouvé, recherche par préfixe UUID (au moins 8 caractères)
        if (!order && cleanRef.length >= 8) {
            order = await prisma.order.findFirst({
                where: {
                    id: {
                        startsWith: cleanRef.toLowerCase(),
                        mode: 'insensitive',
                    }
                },
                select: selectFields
            });
        }

        if (!order) {
            return { success: false, order: null };
        }

        // 3. Masquage PII si la requête est anonyme ou non-propriétaire
        const session = await auth();
        const isOwnerOrAdmin = session?.user && (
            session.user.role === 'ADMIN' || 
            session.user.id === order.userId
        );

        if (!isOwnerOrAdmin) {
            return {
                success: true,
                order: {
                    ...order,
                    customerName: maskName(order.customerName),
                    shippingPhone: maskPhone(order.shippingPhone),
                    shippingAddress: maskAddress(order.shippingAddress, order.shippingCity),
                }
            };
        }

        return { success: true, order };
    } catch (error) {
        console.error('Error fetching order success details:', error);
        return { success: false, order: null };
    }
}


