import prisma from '@/lib/prisma';
import { emailService } from '@/lib/email-service';
import crypto from 'crypto';

export interface RestockNotificationInput {
    productId: string;
    productName: string;
    reference?: string | null;
    categoryName?: string | null;
    price: number;
    oldStock: number;
    newStock: number;
    productImageUrl?: string | null;
}

// Map en mémoire pour suivre les minuteurs actifs par batchId
const activeTimers = new Map<string, NodeJS.Timeout>();

/**
 * Planifie l'exécution différée d'un lot en mémoire si ce n'est pas déjà fait
 */
function scheduleInMemoryTimer(batchId: string, scheduledFor: Date) {
    if (activeTimers.has(batchId)) {
        return;
    }

    const delayMs = Math.max(0, scheduledFor.getTime() - Date.now());
    console.log(`[RestockService] Planification du minuteur pour le lot ${batchId} dans ${Math.round(delayMs / 1000)}s`);

    const timer = setTimeout(async () => {
        activeTimers.delete(batchId);
        try {
            await processRestockBatch(batchId);
        } catch (err) {
            console.error(`[RestockService] Erreur lors de l'exécution du lot ${batchId}:`, err);
        }
    }, delayMs);

    if (typeof timer.unref === 'function') {
        timer.unref();
    }

    activeTimers.set(batchId, timer);
}

/**
 * Ajoute un produit réapprovisionné dans le système de notification groupée
 */
export async function queueRestockNotification(input: RestockNotificationInput): Promise<{
    queued: boolean;
    batchId?: string;
    reason?: string;
}> {
    return queueBatchRestockNotifications([input]);
}

/**
 * Ajoute un ensemble de produits réapprovisionnés dans le système de notification groupée
 */
export async function queueBatchRestockNotifications(inputs: RestockNotificationInput[]): Promise<{
    queued: boolean;
    batchId?: string;
    itemsAdded: number;
    reason?: string;
}> {
    if (!inputs || inputs.length === 0) {
        return { queued: false, itemsAdded: 0, reason: 'Aucun produit fourni' };
    }

    try {
        // 1. Vérification de la configuration générale
        const siteConfig = await prisma.siteConfig.findUnique({
            where: { id: 'singleton' },
        });

        if (!siteConfig || siteConfig.restockNotificationsEnabled === false) {
            console.log('[RestockService] Notifications de réapprovisionnement désactivées dans SiteConfig');
            return { queued: false, itemsAdded: 0, reason: 'Notifications désactivées' };
        }

        const recipients = siteConfig.restockNotificationEmails || [];
        if (recipients.length === 0) {
            console.warn('[RestockService] Aucun destinataire configuré dans SiteConfig');
            return { queued: false, itemsAdded: 0, reason: 'Aucun destinataire' };
        }

        const consolidationMinutes = Math.max(1, siteConfig.restockConsolidationMinutes || 5);

        // 2. Recherche ou création d'un lot PENDING actif
        // On recherche le lot PENDING le plus récent
        let pendingBatch = await prisma.restockNotificationBatch.findFirst({
            where: { status: 'PENDING' },
            orderBy: { createdAt: 'desc' },
        });

        let isNewBatch = false;

        if (!pendingBatch) {
            const batchId = crypto.randomUUID();
            const scheduledFor = new Date(Date.now() + consolidationMinutes * 60 * 1000);

            pendingBatch = await prisma.restockNotificationBatch.create({
                data: {
                    id: batchId,
                    status: 'PENDING',
                    scheduledFor,
                    recipients,
                    itemsCount: 0,
                },
            });
            isNewBatch = true;
            console.log(`[RestockService] Nouveau lot créé ${batchId}, consolidation de ${consolidationMinutes} min`);
        }

        const batchId = pendingBatch.id;
        let itemsAdded = 0;

        // 3. Insertion des items avec déduplication stricte
        for (const item of inputs) {
            try {
                // Upsert pour éviter les violations de contrainte unique [batchId, productId]
                // et mettre à jour le nouveau stock si détecté à nouveau dans la fenêtre
                await prisma.restockNotificationItem.upsert({
                    where: {
                        batchId_productId: {
                            batchId,
                            productId: item.productId,
                        },
                    },
                    update: {
                        newStock: item.newStock,
                        price: item.price,
                        productName: item.productName,
                        reference: item.reference || null,
                        categoryName: item.categoryName || null,
                        productImageUrl: item.productImageUrl || null,
                        restockedAt: new Date(),
                    },
                    create: {
                        id: crypto.randomUUID(),
                        batchId,
                        productId: item.productId,
                        productName: item.productName,
                        reference: item.reference || null,
                        categoryName: item.categoryName || null,
                        price: item.price,
                        oldStock: item.oldStock,
                        newStock: item.newStock,
                        productImageUrl: item.productImageUrl || null,
                        restockedAt: new Date(),
                    },
                });
                itemsAdded++;
            } catch (err: any) {
                console.error(`[RestockService] Erreur ajout item ${item.productId}:`, err.message);
            }
        }

        // Mettre à jour le nombre réel d'items dans le lot
        const totalItemsInBatch = await prisma.restockNotificationItem.count({
            where: { batchId },
        });

        await prisma.restockNotificationBatch.update({
            where: { id: batchId },
            data: { itemsCount: totalItemsInBatch },
        });

        // 4. Planifier le minuteur en mémoire
        scheduleInMemoryTimer(batchId, pendingBatch.scheduledFor);

        return {
            queued: true,
            batchId,
            itemsAdded,
        };
    } catch (error: any) {
        console.error('[RestockService] Erreur lors de la mise en file d\'attente:', error);
        return { queued: false, itemsAdded: 0, reason: error.message };
    }
}

/**
 * Traite et expédie un lot consolidé par e-mail avec verrouillage atomique contre les accès concurrents
 */
export async function processRestockBatch(batchId: string): Promise<{
    success: boolean;
    alreadyHandled?: boolean;
    error?: string;
    itemsSent?: number;
}> {
    // 1. Verrouillage atomique : passage immédiat de PENDING à PROCESSING
    // Seul le premier appel réussira cette commande SQL et obtiendra count > 0.
    const lockResult = await prisma.$executeRaw`
        UPDATE "RestockNotificationBatch"
        SET status = 'PROCESSING', "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = ${batchId} AND status = 'PENDING'
    `;

    if (lockResult === 0) {
        // Le lot a déjà été pris en charge par un autre thread/cron ou n'est plus en attente
        return { success: true, alreadyHandled: true };
    }

    console.log(`[RestockService] Verrou acquis pour le lot ${batchId}, début du traitement...`);

    // Nettoyer le minuteur en mémoire s'il existe
    const existingTimer = activeTimers.get(batchId);
    if (existingTimer) {
        clearTimeout(existingTimer);
        activeTimers.delete(batchId);
    }

    try {
        // 2. Charger le lot et ses items
        const batch = await prisma.restockNotificationBatch.findUnique({
            where: { id: batchId },
            include: {
                items: {
                    orderBy: { restockedAt: 'asc' },
                },
            },
        });

        if (!batch) {
            return { success: false, error: 'Lot introuvable' };
        }

        if (batch.items.length === 0) {
            // Aucun item dans le lot, marquer comme SENT et clore
            await prisma.restockNotificationBatch.update({
                where: { id: batchId },
                data: {
                    status: 'SENT',
                    sentAt: new Date(),
                    itemsCount: 0,
                },
            });
            return { success: true, itemsSent: 0 };
        }

        // 3. Récupérer les destinataires à jour depuis SiteConfig
        const siteConfig = await prisma.siteConfig.findUnique({
            where: { id: 'singleton' },
        });

        const recipients = (siteConfig?.restockNotificationEmails && siteConfig.restockNotificationEmails.length > 0)
            ? siteConfig.restockNotificationEmails
            : batch.recipients;

        if (recipients.length === 0) {
            const err = 'Aucun destinataire configuré pour la notification de réapprovisionnement';
            await prisma.restockNotificationBatch.update({
                where: { id: batchId },
                data: {
                    status: 'FAILED',
                    errorDetails: err,
                },
            });
            return { success: false, error: err };
        }

        // 4. Enrichir les images et catégories si manquantes
        const formattedItems = await Promise.all(
            batch.items.map(async (item) => {
                let img = item.productImageUrl;
                let ref = item.reference;
                let cat = item.categoryName;

                if (!img || !ref || !cat) {
                    const prod = await prisma.product.findUnique({
                        where: { id: item.productId },
                        select: { images: true, reference: true, category: { select: { name: true } } },
                    });
                    if (prod) {
                        img = img || prod.images?.[0] || null;
                        ref = ref || prod.reference || null;
                        cat = cat || prod.category?.name || null;
                    }
                }

                return {
                    productId: item.productId,
                    productName: item.productName,
                    reference: ref,
                    categoryName: cat,
                    price: item.price,
                    oldStock: item.oldStock,
                    newStock: item.newStock,
                    productImageUrl: img,
                    restockedAt: item.restockedAt,
                };
            })
        );

        // 5. Expédition de l'email groupé via EmailService
        const sendResult = await emailService.sendConsolidatedRestockEmail({
            recipients,
            items: formattedItems,
            totalCount: formattedItems.length,
            consolidationMinutes: siteConfig?.restockConsolidationMinutes || 5,
            logoUrl: siteConfig?.headerLogo || undefined,
        });

        if (!sendResult.success) {
            const errorMsg = typeof sendResult.error === 'string'
                ? sendResult.error
                : JSON.stringify(sendResult.error || 'Erreur inconnue lors de l\'envoi');

            console.error(`[RestockService] Échec de l'envoi de l'e-mail pour le lot ${batchId}:`, errorMsg);

            // Mettre à jour le statut en FAILED pour permettre une tentative ultérieure
            await prisma.restockNotificationBatch.update({
                where: { id: batchId },
                data: {
                    status: 'FAILED',
                    errorDetails: errorMsg,
                },
            });

            return { success: false, error: errorMsg };
        }

        // 6. Succès ! Mettre à jour le lot en SENT
        await prisma.restockNotificationBatch.update({
            where: { id: batchId },
            data: {
                status: 'SENT',
                sentAt: new Date(),
                itemsCount: formattedItems.length,
                recipients,
                errorDetails: null,
            },
        });

        console.log(`[RestockService] ✅ Notification groupée envoyée avec succès pour le lot ${batchId} (${formattedItems.length} produits)`);
        return { success: true, itemsSent: formattedItems.length };
    } catch (error: any) {
        console.error(`[RestockService] Exception lors du traitement du lot ${batchId}:`, error);

        // Remettre en FAILED pour ne pas perdre les données
        await prisma.restockNotificationBatch.update({
            where: { id: batchId },
            data: {
                status: 'FAILED',
                errorDetails: error.message || String(error),
            },
        }).catch(() => {});

        return { success: false, error: error.message };
    }
}

/**
 * Traite tous les lots PENDING dont la date d'échéance est passée (scheduledFor <= now)
 * Utile pour les cron jobs ou au démarrage du serveur
 */
export async function processDueRestockBatches(): Promise<{
    processedCount: number;
    results: any[];
}> {
    const dueBatches = await prisma.restockNotificationBatch.findMany({
        where: {
            status: 'PENDING',
            scheduledFor: {
                lte: new Date(),
            },
        },
        select: { id: true },
    });

    if (dueBatches.length === 0) {
        return { processedCount: 0, results: [] };
    }

    console.log(`[RestockService] Traitement de ${dueBatches.length} lot(s) de réapprovisionnement arrivés à échéance`);

    const results = [];
    for (const batch of dueBatches) {
        const res = await processRestockBatch(batch.id);
        results.push({ batchId: batch.id, ...res });
    }

    return {
        processedCount: dueBatches.length,
        results,
    };
}
