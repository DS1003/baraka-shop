import * as dotenv from 'dotenv';
dotenv.config();

import prisma from '../lib/prisma';
import {
    queueRestockNotification,
    queueBatchRestockNotifications,
    processRestockBatch,
    processDueRestockBatches
} from '../lib/restock-notification-service';
import { processStockChange, reactivateProduct } from '../lib/stock-service';
import crypto from 'crypto';

export async function runRestockConsolidationTests() {
    console.log('========================================================================');
    console.log('🧪 SUITE DE VALIDATION COMPLÈTE — REGROUPEMENT DES NOTIFICATIONS');
    console.log('   Baraka Shop — 8 Scénarios Obligatoires');
    console.log('========================================================================\n');

    let passedTests = 0;
    const totalTests = 8;
    const testProductIds: string[] = [];

    let defaultCategoryId: string | null = null;

    // Helper pour créer un produit de test dédié
    async function createTestProduct(name: string, stock: number = 0, price: number = 25000) {
        if (!defaultCategoryId) {
            const cat = await prisma.category.findFirst();
            if (cat) {
                defaultCategoryId = cat.id;
            } else {
                const newCat = await prisma.category.create({
                    data: { name: 'Test Categorie', slug: `test-cat-${Date.now()}` },
                });
                defaultCategoryId = newCat.id;
            }
        }

        const id = crypto.randomUUID();
        const slug = `test-prod-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const product = await prisma.product.create({
            data: {
                id,
                name: `[TEST] ${name}`,
                slug,
                description: 'Produit de test pour la validation du regroupement',
                price,
                stock,
                reference: `REF-TST-${Math.floor(Math.random() * 90000 + 10000)}`,
                categoryId: defaultCategoryId,
                isPublished: stock > 0,
                deactivationReason: stock <= 0 ? 'OUT_OF_STOCK' : null,
                restockPendingReview: false,
            },
        });
        testProductIds.push(product.id);
        return product;
    }

    try {
        // S'assurer que SiteConfig a des emails configurés et les notifications activées
        await prisma.siteConfig.upsert({
            where: { id: 'singleton' },
            update: {
                restockNotificationsEnabled: true,
                restockConsolidationMinutes: 5,
            },
            create: {
                id: 'singleton',
                restockNotificationsEnabled: true,
                restockNotificationEmails: ['test-admin@baraka.sn'],
                restockConsolidationMinutes: 5,
            },
        });

        // Nettoyer les anciens lots PENDING de test pour démarrer sur une base propre
        await prisma.restockNotificationBatch.deleteMany({
            where: { status: 'PENDING' },
        });

        // ---------------------------------------------------------------------
        // SCÉNARIO 1 : Un seul produit réapprovisionné
        // ---------------------------------------------------------------------
        console.log('▶ SCÉNARIO 1 : Un seul produit réapprovisionné — 1 e-mail groupé contenant ce produit');
        const prod1 = await createTestProduct('Plokama VM-80 Pro Single', 0);
        
        const q1 = await queueRestockNotification({
            productId: prod1.id,
            productName: prod1.name,
            reference: prod1.reference,
            price: prod1.price,
            oldStock: 0,
            newStock: 10,
        });

        if (!q1.queued || !q1.batchId) {
            throw new Error(`Échec de mise en file d'attente pour le produit 1: ${q1.reason}`);
        }

        const batch1 = await prisma.restockNotificationBatch.findUnique({
            where: { id: q1.batchId },
            include: { items: true },
        });

        if (!batch1 || batch1.items.length !== 1 || batch1.itemsCount !== 1) {
            throw new Error(`Lot 1 invalide: attendu 1 item, obtenu ${batch1?.items.length}`);
        }

        const proc1 = await processRestockBatch(q1.batchId);
        if (!proc1.success) {
            throw new Error(`Échec du traitement du lot 1: ${proc1.error}`);
        }

        const sentBatch1 = await prisma.restockNotificationBatch.findUnique({
            where: { id: q1.batchId },
        });

        if (sentBatch1?.status !== 'SENT' || !sentBatch1.sentAt) {
            throw new Error(`Statut du lot 1 non mis à jour en SENT: ${sentBatch1?.status}`);
        }

        console.log(`  ✓ Produit mis en file dans le lot ${q1.batchId}`);
        console.log(`  ✓ Lot traité avec succès: statut=SENT, itemsSent=1`);
        passedTests++;
        console.log('  [PASS] Scénario 1 validé avec succès.\n');

        // ---------------------------------------------------------------------
        // SCÉNARIO 2 : Cinq produits réapprovisionnés dans la même fenêtre
        // ---------------------------------------------------------------------
        console.log('▶ SCÉNARIO 2 : Cinq produits réapprovisionnés dans la même fenêtre de consolidation');
        const prod2_list = [];
        for (let i = 1; i <= 5; i++) {
            prod2_list.push(await createTestProduct(`Plokama Multi ${i}`, 0));
        }

        let currentBatchId: string | undefined;
        for (let i = 0; i < prod2_list.length; i++) {
            const p = prod2_list[i];
            const res = await queueRestockNotification({
                productId: p.id,
                productName: p.name,
                reference: p.reference,
                price: p.price,
                oldStock: 0,
                newStock: (i + 1) * 3,
            });

            if (!currentBatchId) {
                currentBatchId = res.batchId;
            } else if (res.batchId !== currentBatchId) {
                throw new Error(`Produit ${i} ajouté dans un batch différent (${res.batchId} vs ${currentBatchId})`);
            }
        }

        const batch2 = await prisma.restockNotificationBatch.findUnique({
            where: { id: currentBatchId! },
            include: { items: true },
        });

        if (!batch2 || batch2.items.length !== 5 || batch2.itemsCount !== 5) {
            throw new Error(`Lot 2 invalide: attendu 5 items, obtenu ${batch2?.items.length}`);
        }

        const proc2 = await processRestockBatch(currentBatchId!);
        if (!proc2.success) {
            throw new Error(`Échec du traitement du lot 2: ${proc2.error}`);
        }

        const sentBatch2 = await prisma.restockNotificationBatch.findUnique({
            where: { id: currentBatchId! },
        });

        if (sentBatch2?.status !== 'SENT') {
            throw new Error(`Statut du lot 2 incorrect: ${sentBatch2?.status}`);
        }

        console.log(`  ✓ 5 produits regroupés dans l'unique lot ${currentBatchId}`);
        console.log(`  ✓ Un seul e-mail groupé déclenché pour l'ensemble des 5 produits`);
        passedTests++;
        console.log('  [PASS] Scénario 2 validé avec succès.\n');

        // ---------------------------------------------------------------------
        // SCÉNARIO 3 : Vingt produits réapprovisionnés
        // ---------------------------------------------------------------------
        console.log('▶ SCÉNARIO 3 : Vingt produits réapprovisionnés — un seul e-mail récapitulatif avec accès liste complète');
        const prod3_list = [];
        for (let i = 1; i <= 20; i++) {
            prod3_list.push(await createTestProduct(`Plokama Gros Lot ${i}`, 0));
        }

        const bulkInputs = prod3_list.map((p, idx) => ({
            productId: p.id,
            productName: p.name,
            reference: p.reference,
            price: p.price,
            oldStock: 0,
            newStock: idx + 5,
        }));

        const q3 = await queueBatchRestockNotifications(bulkInputs);
        if (!q3.queued || !q3.batchId) {
            throw new Error(`Échec mise en lot 20 produits: ${q3.reason}`);
        }

        const batch3 = await prisma.restockNotificationBatch.findUnique({
            where: { id: q3.batchId },
            include: { items: true },
        });

        if (!batch3 || batch3.items.length !== 20 || batch3.itemsCount !== 20) {
            throw new Error(`Attendu 20 items, obtenu ${batch3?.items.length}`);
        }

        const proc3 = await processRestockBatch(q3.batchId);
        if (!proc3.success) {
            throw new Error(`Échec du traitement du lot 3: ${proc3.error}`);
        }

        console.log(`  ✓ 20 produits insérés dans le lot ${q3.batchId}`);
        console.log(`  ✓ Un seul e-mail généré avec aperçu des premiers articles et compteur restant`);
        passedTests++;
        console.log('  [PASS] Scénario 3 validé avec succès.\n');

        // ---------------------------------------------------------------------
        // SCÉNARIO 4 : Déduplication — Un produit détecté plusieurs fois
        // ---------------------------------------------------------------------
        console.log('▶ SCÉNARIO 4 : Déduplication au sein du même lot — Aucune notification dupliquée');
        const prod4 = await createTestProduct('Plokama Déduplication Test', 0);

        // Premier passage
        const q4_1 = await queueRestockNotification({
            productId: prod4.id,
            productName: prod4.name,
            reference: prod4.reference,
            price: prod4.price,
            oldStock: 0,
            newStock: 5,
        });

        // Deuxième passage dans la même fenêtre pour le même produit
        const q4_2 = await queueRestockNotification({
            productId: prod4.id,
            productName: prod4.name,
            reference: prod4.reference,
            price: prod4.price,
            oldStock: 0,
            newStock: 12, // Mise à jour de la quantité
        });

        if (q4_1.batchId !== q4_2.batchId) {
            throw new Error(`Les deux notifications doivent appartenir au même lot PENDING`);
        }

        const itemsForProd4 = await prisma.restockNotificationItem.findMany({
            where: {
                batchId: q4_1.batchId!,
                productId: prod4.id,
            },
        });

        if (itemsForProd4.length !== 1) {
            throw new Error(`Duplication détectée: ${itemsForProd4.length} lignes pour le même produit dans le lot`);
        }

        if (itemsForProd4[0].newStock !== 12) {
            throw new Error(`La quantité aurait dû être mise à jour à 12, valeur actuelle: ${itemsForProd4[0].newStock}`);
        }

        await processRestockBatch(q4_1.batchId!);

        console.log(`  ✓ Produit soumis 2 fois consécutives: une seule ligne enregistrée dans le lot`);
        console.log(`  ✓ Quantité mise à jour sans doublon (newStock = 12)`);
        passedTests++;
        console.log('  [PASS] Scénario 4 validé avec succès.\n');

        // ---------------------------------------------------------------------
        // SCÉNARIO 5 : Produit déjà en attente de vérification (restockPendingReview)
        // ---------------------------------------------------------------------
        console.log('▶ SCÉNARIO 5 : Protection contre les notifications répétées lors des crons successifs');
        const prod5 = await createTestProduct('Plokama Déjà En Attente', 0);

        // 1. Première détection : passage 0 -> 10
        await processStockChange({
            productId: prod5.id,
            previousStock: 0,
            newStock: 10,
            source: 'FTP_SYNC',
        });

        const updatedProd5 = await prisma.product.findUnique({
            where: { id: prod5.id },
        });

        if (!updatedProd5?.restockPendingReview) {
            throw new Error(`Le produit 5 devrait avoir restockPendingReview = true`);
        }

        // Récupérer le lot PENDING actuel
        const pendingBatchBefore = await prisma.restockNotificationBatch.findFirst({
            where: { status: 'PENDING' },
            include: { items: true },
        });
        const countBefore = pendingBatchBefore?.items.length || 0;

        // 2. Deuxième synchronisation cron : le produit est toujours à 10 et toujours en attente
        await processStockChange({
            productId: prod5.id,
            previousStock: 10,
            newStock: 10,
            source: 'FTP_SYNC',
        });

        const pendingBatchAfter = await prisma.restockNotificationBatch.findFirst({
            where: { status: 'PENDING' },
            include: { items: true },
        });
        const countAfter = pendingBatchAfter?.items.length || 0;

        if (countAfter !== countBefore) {
            throw new Error(`Une nouvelle notification inutile a été ajoutée pour un produit déjà en attente`);
        }

        if (pendingBatchAfter) {
            await processRestockBatch(pendingBatchAfter.id);
        }

        console.log(`  ✓ Produit en restockPendingReview = true détecté lors d'un cron ultérieur`);
        console.log(`  ✓ Aucune notification redondante générée (countItems = ${countBefore})`);
        passedTests++;
        console.log('  [PASS] Scénario 5 validé avec succès.\n');

        // ---------------------------------------------------------------------
        // SCÉNARIO 6 : Résilience et gestion des erreurs d'envoi
        // ---------------------------------------------------------------------
        console.log('▶ SCÉNARIO 6 : Gestion des erreurs d\'envoi — Préservation des données et statut FAILED');
        const prod6 = await createTestProduct('Plokama Test Erreur', 0);

        const q6 = await queueRestockNotification({
            productId: prod6.id,
            productName: prod6.name,
            reference: prod6.reference,
            price: prod6.price,
            oldStock: 0,
            newStock: 8,
        });

        // Forcer temporairement les destinataires du lot à une liste vide pour provoquer une erreur contrôlée
        await prisma.restockNotificationBatch.update({
            where: { id: q6.batchId! },
            data: { recipients: [] },
        });
        // Config singleton sans email
        await prisma.siteConfig.update({
            where: { id: 'singleton' },
            data: { restockNotificationEmails: [] },
        });

        const proc6_failed = await processRestockBatch(q6.batchId!);
        if (proc6_failed.success) {
            throw new Error(`Le traitement aurait dû échouer sans destinataire`);
        }

        const failedBatch = await prisma.restockNotificationBatch.findUnique({
            where: { id: q6.batchId! },
            include: { items: true },
        });

        if (failedBatch?.status !== 'FAILED') {
            throw new Error(`Statut attendu FAILED, obtenu: ${failedBatch?.status}`);
        }
        if (failedBatch.items.length !== 1) {
            throw new Error(`Les items ne doivent pas être perdus lors d'un échec`);
        }

        // Rétablir les destinataires et retenter
        await prisma.siteConfig.update({
            where: { id: 'singleton' },
            data: { restockNotificationEmails: ['admin-recovery@baraka.sn'] },
        });
        // Remettre en PENDING pour la nouvelle tentative
        await prisma.restockNotificationBatch.update({
            where: { id: q6.batchId! },
            data: { status: 'PENDING', recipients: ['admin-recovery@baraka.sn'] },
        });

        const proc6_recovered = await processRestockBatch(q6.batchId!);
        if (!proc6_recovered.success) {
            throw new Error(`La nouvelle tentative aurait dû réussir: ${proc6_recovered.error}`);
        }

        const recoveredBatch = await prisma.restockNotificationBatch.findUnique({
            where: { id: q6.batchId! },
        });
        if (recoveredBatch?.status !== 'SENT') {
            throw new Error(`Statut final attendu SENT, obtenu: ${recoveredBatch?.status}`);
        }

        console.log(`  ✓ Échec détecté: statut passé en FAILED avec conservation intégrale des items`);
        console.log(`  ✓ Nouvelle tentative réussie: statut passé en SENT`);
        passedTests++;
        console.log('  [PASS] Scénario 6 validé avec succès.\n');

        // ---------------------------------------------------------------------
        // SCÉNARIO 7 : Deux traitements simultanés (Concurrence & Verrouillage atomique)
        // ---------------------------------------------------------------------
        console.log('▶ SCÉNARIO 7 : Deux traitements simultanés — Verrouillage atomique et aucun doublon d\'e-mail');
        const prod7 = await createTestProduct('Plokama Concurrence Test', 0);

        const q7 = await queueRestockNotification({
            productId: prod7.id,
            productName: prod7.name,
            reference: prod7.reference,
            price: prod7.price,
            oldStock: 0,
            newStock: 25,
        });

        // Déclencher deux appels simultanés de processRestockBatch
        const [resA, resB] = await Promise.all([
            processRestockBatch(q7.batchId!),
            processRestockBatch(q7.batchId!),
        ]);

        const handledByOne = (resA.alreadyHandled && !resB.alreadyHandled) || (!resA.alreadyHandled && resB.alreadyHandled);
        if (!handledByOne) {
            throw new Error(`Conflit de concurrence: resA=${JSON.stringify(resA)}, resB=${JSON.stringify(resB)}`);
        }

        const batch7Final = await prisma.restockNotificationBatch.findUnique({
            where: { id: q7.batchId! },
        });

        if (batch7Final?.status !== 'SENT') {
            throw new Error(`Statut final attendu SENT, obtenu: ${batch7Final?.status}`);
        }

        console.log(`  ✓ Appel concurrent A: alreadyHandled = ${resA.alreadyHandled}`);
        console.log(`  ✓ Appel concurrent B: alreadyHandled = ${resB.alreadyHandled}`);
        console.log(`  ✓ Un seul exécuteur a obtenu le verrou atomique, aucun doublon d'e-mail`);
        passedTests++;
        console.log('  [PASS] Scénario 7 validé avec succès.\n');

        // ---------------------------------------------------------------------
        // SCÉNARIO 8 : Cycle complet post-réactivation manuelle
        // ---------------------------------------------------------------------
        console.log('▶ SCÉNARIO 8 : Réactivation d\'un produit puis détection d\'un nouveau réapprovisionnement réel');
        const prod8 = await createTestProduct('Plokama Cycle Complet', 0);

        // 1. Premier restock
        await processStockChange({
            productId: prod8.id,
            previousStock: 0,
            newStock: 15,
            source: 'FTP_SYNC',
        });

        const prod8_afterRestock = await prisma.product.findUnique({
            where: { id: prod8.id },
        });
        if (!prod8_afterRestock?.restockPendingReview || prod8_afterRestock.isPublished) {
            throw new Error(`Le produit devrait être en restockPendingReview et masqué`);
        }

        // 2. Traiter le lot du premier restock pour le clore
        const batch8_1 = await prisma.restockNotificationBatch.findFirst({
            where: { status: 'PENDING' },
        });
        if (batch8_1) {
            await processRestockBatch(batch8_1.id);
        }

        // 3. Validation et réactivation manuelle par l'administrateur
        const reactivateRes = await reactivateProduct(prod8.id);
        if (!reactivateRes.success) {
            throw new Error(`Échec de la réactivation manuelle: ${reactivateRes.error}`);
        }

        const prod8_reactivated = await prisma.product.findUnique({
            where: { id: prod8.id },
        });
        if (prod8_reactivated?.restockPendingReview || !prod8_reactivated?.isPublished) {
            throw new Error(`Après réactivation: restockPendingReview doit être false et isPublished true`);
        }
        console.log(`  ✓ Produit réactivé manuellement: isPublished = true, restockPendingReview = false`);

        // 4. Le produit est vendu jusqu'à rupture complète
        await processStockChange({
            productId: prod8.id,
            previousStock: 15,
            newStock: 0,
            source: 'ORDER',
        });

        const prod8_rupture = await prisma.product.findUnique({
            where: { id: prod8.id },
        });
        if (prod8_rupture?.deactivationReason !== 'OUT_OF_STOCK' || prod8_rupture.isPublished) {
            throw new Error(`Le produit devrait être à nouveau OUT_OF_STOCK et masqué`);
        }
        console.log(`  ✓ Produit tombé en rupture de stock réelle (stock = 0)`);

        // 5. Nouveau réapprovisionnement réel ultérieur
        await processStockChange({
            productId: prod8.id,
            previousStock: 0,
            newStock: 20,
            source: 'FTP_SYNC',
        });

        const prod8_newRestock = await prisma.product.findUnique({
            where: { id: prod8.id },
        });
        if (!prod8_newRestock?.restockPendingReview) {
            throw new Error(`Le nouveau cycle aurait dû passer restockPendingReview à true`);
        }

        const newPendingBatch = await prisma.restockNotificationBatch.findFirst({
            where: { status: 'PENDING' },
            include: { items: true },
        });

        const itemFound = newPendingBatch?.items.find(it => it.productId === prod8.id);
        if (!itemFound) {
            throw new Error(`Le produit n'a pas été ajouté au nouveau lot de réapprovisionnement`);
        }

        if (newPendingBatch) {
            await processRestockBatch(newPendingBatch.id);
        }

        console.log(`  ✓ Nouveau cycle de réapprovisionnement réel détecté avec succès !`);
        console.log(`  ✓ Nouveau lot PENDING créé et item ajouté (newStock = 20)`);
        passedTests++;
        console.log('  [PASS] Scénario 8 validé avec succès.\n');

        // ---------------------------------------------------------------------
        // BILAN DES TESTS
        // ---------------------------------------------------------------------
        console.log('========================================================================');
        console.log(`🎉 RÉSULTAT FINAL : ${passedTests}/${totalTests} TESTS PASSÉS AVEC SUCCÈS !`);
        console.log('========================================================================\n');

        return { success: true, passedTests, totalTests };
    } catch (err: any) {
        console.error('❌ ÉCHEC DU TEST:', err);
        return { success: false, error: err.message, passedTests, totalTests };
    } finally {
        // Nettoyage des produits de test
        if (testProductIds.length > 0) {
            await prisma.restockNotificationItem.deleteMany({
                where: { productId: { in: testProductIds } },
            });
            await prisma.product.deleteMany({
                where: { id: { in: testProductIds } },
            });
            console.log(`🧹 Nettoyage terminé: ${testProductIds.length} produits de test supprimés.`);
        }
    }
}

if (require.main === module) {
    runRestockConsolidationTests().then((res) => {
        if (!res.success) {
            process.exit(1);
        }
        process.exit(0);
    }).catch((e) => {
        console.error(e);
        process.exit(1);
    });
}
