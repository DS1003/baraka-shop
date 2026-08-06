'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { notifyClientOrderStatusChange, notifyAdminsNewOrder } from '@/lib/notification-service';

interface OrderItemData {
    productId: string;
    quantity: number;
    price: number;
    selectedColor?: string;
}

interface CreateOrderData {
    items: OrderItemData[];
    total: number;
    paymentMethod: string;
    deliveryMethod: 'livraison' | 'retrait';
    deliveryZone?: string;
    shippingCost: number;
    shippingDetails: {
        firstName: string;
        lastName: string;
        address: string;
        city: string;
        area: string;
        phone: string;
    };
}

export async function createOrder(data: CreateOrderData) {
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false, error: "Vous devez être connecté pour passer une commande." };
    }

    try {
        const order = await prisma.$transaction(async (tx) => {
            const productIds = data.items.map(item => item.productId);
            const uniqueProductIds = Array.from(new Set(productIds));
            const foundProducts = await tx.product.findMany({
                where: { id: { in: uniqueProductIds } },
                select: { id: true, stock: true, name: true }
            });

            if (foundProducts.length !== uniqueProductIds.length) {
                throw new Error("Certains produits de votre panier ne sont plus disponibles ou ont été supprimés du catalogue.");
            }

            const missingStock = data.items.find(item => {
                const p = foundProducts.find(fp => fp.id === item.productId);
                return !p || p.stock < item.quantity;
            });

            if (missingStock) {
                const guiltyProduct = foundProducts.find(fp => fp.id === missingStock.productId);
                throw new Error(`Stock insuffisant pour le produit: ${guiltyProduct?.name || 'Inconnu'}`);
            }

            const newOrder = await tx.order.create({
                data: {
                    userId: session.user.id!,
                    total: data.total,
                    paymentMethod: data.paymentMethod,
                    deliveryMethod: data.deliveryMethod,
                    deliveryZone: data.deliveryZone || null,
                    shippingCost: data.shippingCost,
                    status: 'PENDING',
                    items: {
                        create: data.items.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                            selectedColor: item.selectedColor || null
                        }))
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

        // Send notifications (non-blocking)
        const clientName = data.shippingDetails.firstName
            ? `${data.shippingDetails.firstName} ${data.shippingDetails.lastName}`.trim()
            : session.user.name || session.user.email || 'Client';

        // Notify client: order confirmed
        notifyClientOrderStatusChange(order.id, 'PENDING').catch(() => {});
        // Notify admins: new order received
        notifyAdminsNewOrder(order.id, clientName, data.total).catch(() => {});

        revalidatePath('/account');
        return { success: true, orderId: order.id };
    } catch (error: any) {
        console.error("Order creation error:", error);
        return { success: false, error: "Erreur lors de la création de la commande: " + (error?.message || String(error)) };
    }
}

