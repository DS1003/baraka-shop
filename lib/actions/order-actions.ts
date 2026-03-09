'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

interface OrderItemData {
    productId: string;
    quantity: number;
    price: number;
}

interface CreateOrderData {
    items: OrderItemData[];
    total: number;
    paymentMethod: string;
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

    // We allow guest orders for now if we want, but let's stick to auth for the "Account" vibe
    // Or we could create a "Guest" user or just use a nullable userId if schema allows.
    // Looking at schema: userId is String, not optional. So user MUST be logged in.

    if (!session?.user?.id) {
        return { success: false, error: "Vous devez être connecté pour passer une commande." };
    }

    try {
        // Create the order in a transaction
        const order = await prisma.$transaction(async (tx) => {
            // Vérifier que tous les produits existent encore
            const productIds = data.items.map(item => item.productId);
            const uniqueProductIds = Array.from(new Set(productIds));
            const foundProducts = await tx.product.findMany({
                where: { id: { in: uniqueProductIds } },
                select: { id: true, stock: true, name: true }
            });

            if (foundProducts.length !== uniqueProductIds.length) {
                throw new Error("Certains produits de votre panier ne sont plus disponibles ou ont été supprimés du catalogue.");
            }

            // Vérifier le stock
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
                    status: 'PENDING',
                    items: {
                        create: data.items.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price
                        }))
                    }
                }
            });

            // Update stock
            for (const item of data.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } }
                });
            }

            return newOrder;
        });

        revalidatePath('/account');
        return { success: true, orderId: order.id };
    } catch (error: any) {
        console.error("Order creation error:", error);
        return { success: false, error: "Erreur lors de la création de la commande: " + (error?.message || String(error)) };
    }
}
