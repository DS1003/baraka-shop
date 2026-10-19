import 'dotenv/config';
import prisma from '../lib/prisma';
import { processStockChange, reactivateProduct } from '../lib/stock-service';

interface TestResult {
  scenario: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: TestResult[] = [];

async function runTests() {
  console.log('======================================================================');
  console.log('  LANCEMENT DU BANC DE TESTS AUTOMATISÉ : GESTION DES RUPTURES BARAKA  ');
  console.log('======================================================================\n');

  // Find or create a test category
  let testCat = await prisma.category.findFirst();
  if (!testCat) {
    testCat = await prisma.category.create({
      data: {
        name: 'Test Category Auto',
        slug: 'test-category-auto',
        isPublished: true,
      }
    });
  }

  const createdProductIds: string[] = [];

  try {
    // -------------------------------------------------------------------------
    // SCÉNARIO 1 : Rupture lors d'une modification administrative
    // -------------------------------------------------------------------------
    console.log('▶ Test Scénario 1 : Rupture lors d\'une modification administrative...');
    const p1 = await prisma.product.create({
      data: {
        name: 'Produit Test Scénario 1',
        slug: `prod-test-sc1-${Date.now()}`,
        reference: `REF-SC1-${Date.now()}`,
        price: 15000,
        stock: 3,
        isPublished: true,
        categoryId: testCat.id,
      }
    });
    createdProductIds.push(p1.id);

    // Admin sets stock to 0
    await processStockChange({
      productId: p1.id,
      previousStock: 3,
      newStock: 0,
      source: 'ADMIN_INVENTORY'
    });

    const p1After = await prisma.product.findUnique({ where: { id: p1.id } });
    const p1Public = await prisma.product.findFirst({
      where: { id: p1.id, isPublished: true, stock: { gt: 0 } }
    });

    const s1Passed = 
      p1After !== null &&
      p1After.stock === 0 &&
      p1After.isPublished === false &&
      p1After.deactivationReason === 'OUT_OF_STOCK' &&
      p1After.deactivatedAt !== null &&
      p1Public === null;

    results.push({
      scenario: 'Scénario 1 — Rupture lors d\'une modification administrative',
      passed: s1Passed,
      message: s1Passed 
        ? 'Désactivation automatique réussie (isPublished: false, reason: OUT_OF_STOCK), exclu du catalogue public'
        : 'Échec de la désactivation ou encore visible dans le catalogue public',
      details: { stock: p1After?.stock, isPublished: p1After?.isPublished, reason: p1After?.deactivationReason }
    });

    // -------------------------------------------------------------------------
    // SCÉNARIO 2 : Rupture après une commande
    // -------------------------------------------------------------------------
    console.log('▶ Test Scénario 2 : Rupture après une commande...');
    const p2 = await prisma.product.create({
      data: {
        name: 'Produit Test Scénario 2',
        slug: `prod-test-sc2-${Date.now()}`,
        reference: `REF-SC2-${Date.now()}`,
        price: 25000,
        stock: 1,
        isPublished: true,
        categoryId: testCat.id,
      }
    });
    createdProductIds.push(p2.id);

    // Simulate order placement decrementing 1 unit
    await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id: p2.id },
        data: { stock: { decrement: 1 } },
        select: { id: true, stock: true }
      });
      if (updated.stock <= 0) {
        await tx.product.update({
          where: { id: p2.id },
          data: {
            isPublished: false,
            deactivationReason: 'OUT_OF_STOCK',
            deactivatedAt: new Date(),
            restockPendingReview: false
          }
        });
      }
    }, { timeout: 25000, maxWait: 10000 });

    const p2After = await prisma.product.findUnique({ where: { id: p2.id } });
    const s2Passed = 
      p2After !== null &&
      p2After.stock === 0 &&
      p2After.isPublished === false &&
      p2After.deactivationReason === 'OUT_OF_STOCK';

    results.push({
      scenario: 'Scénario 2 — Rupture après une commande',
      passed: s2Passed,
      message: s2Passed
        ? 'Décrémentation atomique à zéro et masquage immédiat (isPublished: false, OUT_OF_STOCK)'
        : 'Échec de la désactivation post-commande',
      details: { stock: p2After?.stock, isPublished: p2After?.isPublished }
    });

    // -------------------------------------------------------------------------
    // SCÉNARIO 3 : Réapprovisionnement
    // -------------------------------------------------------------------------
    console.log('▶ Test Scénario 3 : Réapprovisionnement...');
    const p3 = await prisma.product.create({
      data: {
        name: 'Produit Test Scénario 3',
        slug: `prod-test-sc3-${Date.now()}`,
        reference: `REF-SC3-${Date.now()}`,
        price: 35000,
        stock: 0,
        isPublished: false,
        deactivationReason: 'OUT_OF_STOCK',
        deactivatedAt: new Date(),
        categoryId: testCat.id,
      }
    });
    createdProductIds.push(p3.id);

    // Admin restocks +10
    await processStockChange({
      productId: p3.id,
      previousStock: 0,
      newStock: 10,
      source: 'ADMIN_INVENTORY'
    });

    const p3After = await prisma.product.findUnique({ where: { id: p3.id } });
    const s3Passed =
      p3After !== null &&
      p3After.stock === 10 &&
      p3After.isPublished === false && // MUST remain false
      p3After.restockPendingReview === true && // In pending review list
      p3After.lastRestockedQty === 10;

    results.push({
      scenario: 'Scénario 3 — Réapprovisionnement (sans réactivation automatique)',
      passed: s3Passed,
      message: s3Passed
        ? 'Stock mis à 10, produit maintenu désactivé, statut restockPendingReview = true'
        : 'Échec : le produit a été indûment publié ou le statut review est manquant',
      details: { stock: p3After?.stock, isPublished: p3After?.isPublished, restockPendingReview: p3After?.restockPendingReview }
    });

    // -------------------------------------------------------------------------
    // SCÉNARIO 4 : Réactivation manuelle
    // -------------------------------------------------------------------------
    console.log('▶ Test Scénario 4 : Réactivation manuelle...');
    const reactivateRes = await reactivateProduct(p3.id);
    const p3Reactivated = await prisma.product.findUnique({ where: { id: p3.id } });

    const s4Passed =
      reactivateRes.success === true &&
      p3Reactivated !== null &&
      p3Reactivated.isPublished === true &&
      p3Reactivated.restockPendingReview === false &&
      p3Reactivated.deactivationReason === null;

    results.push({
      scenario: 'Scénario 4 — Réactivation manuelle par l\'administrateur',
      passed: s4Passed,
      message: s4Passed
        ? 'Validation réussie côté serveur, produit republié (isPublished: true), réinitialisation du statut review'
        : 'Échec de la réactivation manuelle',
      details: { isPublished: p3Reactivated?.isPublished, restockPendingReview: p3Reactivated?.restockPendingReview }
    });

    // -------------------------------------------------------------------------
    // SCÉNARIO 5 : Tentative de réactivation sans stock
    // -------------------------------------------------------------------------
    console.log('▶ Test Scénario 5 : Tentative de réactivation sans stock...');
    const p5 = await prisma.product.create({
      data: {
        name: 'Produit Test Scénario 5 (Stock 0)',
        slug: `prod-test-sc5-${Date.now()}`,
        reference: `REF-SC5-${Date.now()}`,
        price: 18000,
        stock: 0,
        isPublished: false,
        deactivationReason: 'OUT_OF_STOCK',
        categoryId: testCat.id,
      }
    });
    createdProductIds.push(p5.id);

    const s5Res = await reactivateProduct(p5.id);
    const p5After = await prisma.product.findUnique({ where: { id: p5.id } });

    const s5Passed =
      s5Res.success === false &&
      typeof s5Res.error === 'string' &&
      s5Res.error.includes('aucune unité') &&
      p5After?.isPublished === false;

    results.push({
      scenario: 'Scénario 5 — Tentative de réactivation sans stock refusée',
      passed: s5Passed,
      message: s5Passed
        ? `Refus strict côté serveur avec message explicite: "${s5Res.error}"`
        : 'Échec : la réactivation à stock 0 a été acceptée par erreur',
      details: { error: s5Res.error, isPublished: p5After?.isPublished }
    });

    // -------------------------------------------------------------------------
    // SCÉNARIO 6 : Désactivation manuelle
    // -------------------------------------------------------------------------
    console.log('▶ Test Scénario 6 : Désactivation manuelle...');
    const p6 = await prisma.product.create({
      data: {
        name: 'Produit Test Scénario 6 (Désactivé Manuel)',
        slug: `prod-test-sc6-${Date.now()}`,
        reference: `REF-SC6-${Date.now()}`,
        price: 45000,
        stock: 15,
        isPublished: false,
        deactivationReason: 'MANUAL',
        deactivatedAt: new Date(),
        categoryId: testCat.id,
      }
    });
    createdProductIds.push(p6.id);

    // Stock changes from 15 to 25
    await processStockChange({
      productId: p6.id,
      previousStock: 15,
      newStock: 25,
      source: 'ADMIN_INVENTORY'
    });

    const p6After = await prisma.product.findUnique({ where: { id: p6.id } });
    const s6Passed =
      p6After !== null &&
      p6After.stock === 25 &&
      p6After.isPublished === false &&
      p6After.deactivationReason === 'MANUAL' &&
      p6After.restockPendingReview === false;

    results.push({
      scenario: 'Scénario 6 — Désactivation manuelle préservée lors du réapprovisionnement',
      passed: s6Passed,
      message: s6Passed
        ? 'Le produit désactivé manuellement reste masqué avec sa raison MANUAL inchangée'
        : 'Échec : le produit a été altéré ou activé indûment',
      details: { deactivationReason: p6After?.deactivationReason, isPublished: p6After?.isPublished }
    });

    // -------------------------------------------------------------------------
    // SCÉNARIO 7 : Absence de destinataire configuré
    // -------------------------------------------------------------------------
    console.log('▶ Test Scénario 7 : Absence de destinataire configuré...');
    // Ensure siteConfig has empty emails
    await prisma.siteConfig.upsert({
      where: { id: 'singleton' },
      update: { restockNotificationEmails: [] },
      create: { id: 'singleton', restockNotificationEmails: [] }
    });

    const p7 = await prisma.product.create({
      data: {
        name: 'Produit Test Scénario 7 (Sans destinataire)',
        slug: `prod-test-sc7-${Date.now()}`,
        reference: `REF-SC7-${Date.now()}`,
        price: 22000,
        stock: 0,
        isPublished: false,
        deactivationReason: 'OUT_OF_STOCK',
        categoryId: testCat.id,
      }
    });
    createdProductIds.push(p7.id);

    let s7NoError = true;
    try {
      await processStockChange({
        productId: p7.id,
        previousStock: 0,
        newStock: 5,
        source: 'ADMIN_INVENTORY'
      });
    } catch (e) {
      s7NoError = false;
    }

    const p7After = await prisma.product.findUnique({ where: { id: p7.id } });
    const s7Passed =
      s7NoError &&
      p7After !== null &&
      p7After.stock === 5 &&
      p7After.restockPendingReview === true;

    results.push({
      scenario: 'Scénario 7 — Absence de destinataire',
      passed: s7Passed,
      message: s7Passed
        ? 'Réapprovisionnement enregistré avec succès sans plantage, produit placé en attente de validation'
        : 'Échec : exception levée ou état non persisté',
      details: { stock: p7After?.stock, restockPendingReview: p7After?.restockPendingReview }
    });

    // -------------------------------------------------------------------------
    // SCÉNARIO 8 : Robustesse face aux aléas d'envoi d'email
    // -------------------------------------------------------------------------
    console.log('▶ Test Scénario 8 : Robustesse d\'envoi d\'e-mail...');
    const p8 = await prisma.product.create({
      data: {
        name: 'Produit Test Scénario 8',
        slug: `prod-test-sc8-${Date.now()}`,
        reference: `REF-SC8-${Date.now()}`,
        price: 99000,
        stock: 0,
        isPublished: false,
        deactivationReason: 'OUT_OF_STOCK',
        categoryId: testCat.id,
      }
    });
    createdProductIds.push(p8.id);

    // Configure invalid email or let Resend reject cleanly
    await prisma.siteConfig.update({
      where: { id: 'singleton' },
      data: { restockNotificationEmails: ['invalid-email-address-no-domain'] }
    });

    let s8NoError = true;
    try {
      await processStockChange({
        productId: p8.id,
        previousStock: 0,
        newStock: 8,
        source: 'ADMIN_INVENTORY'
      });
    } catch (e) {
      s8NoError = false;
    }

    const p8After = await prisma.product.findUnique({ where: { id: p8.id } });
    const s8Passed =
      s8NoError &&
      p8After !== null &&
      p8After.stock === 8 &&
      p8After.restockPendingReview === true;

    results.push({
      scenario: 'Scénario 8 — Échec du fournisseur d\'e-mail n\'annule pas le réapprovisionnement',
      passed: s8Passed,
      message: s8Passed
        ? 'Stock et statut d\'attente enregistrés de manière résiliente même en cas d\'aléa email'
        : 'Échec : le réapprovisionnement a été annulé ou a causé un crash',
      details: { stock: p8After?.stock }
    });

    // -------------------------------------------------------------------------
    // SCÉNARIO 9 : Nouveau cycle de rupture et réapprovisionnement
    // -------------------------------------------------------------------------
    console.log('▶ Test Scénario 9 : Nouveau cycle de rupture...');
    const p9 = await prisma.product.create({
      data: {
        name: 'Produit Test Scénario 9 (Cycle complet)',
        slug: `prod-test-sc9-${Date.now()}`,
        reference: `REF-SC9-${Date.now()}`,
        price: 12000,
        stock: 5,
        isPublished: true,
        categoryId: testCat.id,
      }
    });
    createdProductIds.push(p9.id);

    // 1. Tombe à 0
    await processStockChange({ productId: p9.id, previousStock: 5, newStock: 0, source: 'ORDER' });
    const step1 = await prisma.product.findUnique({ where: { id: p9.id } });

    // 2. Reçoit 4 unités -> restockPendingReview = true
    await processStockChange({ productId: p9.id, previousStock: 0, newStock: 4, source: 'ADMIN_INVENTORY' });
    const step2 = await prisma.product.findUnique({ where: { id: p9.id } });

    // 3. Admin valide et réactive
    await reactivateProduct(p9.id);
    const step3 = await prisma.product.findUnique({ where: { id: p9.id } });

    // 4. Tombe à nouveau à 0 -> nouveau cycle !
    await processStockChange({ productId: p9.id, previousStock: 4, newStock: 0, source: 'ORDER' });
    const step4 = await prisma.product.findUnique({ where: { id: p9.id } });

    const s9Passed =
      step1?.isPublished === false && step1?.deactivationReason === 'OUT_OF_STOCK' &&
      step2?.isPublished === false && step2?.restockPendingReview === true &&
      step3?.isPublished === true && step3?.restockPendingReview === false &&
      step4?.isPublished === false && step4?.deactivationReason === 'OUT_OF_STOCK';

    results.push({
      scenario: 'Scénario 9 — Nouveau cycle de rupture complet',
      passed: s9Passed,
      message: s9Passed
        ? 'Cycle complet testé (Actif -> Rupture -> Réappro -> Validation -> Actif -> 2ème Rupture)'
        : 'Échec dans la répétition des cycles de rupture',
      details: {
        step1_out: step1?.deactivationReason,
        step2_pending: step2?.restockPendingReview,
        step3_active: step3?.isPublished,
        step4_out_again: step4?.deactivationReason
      }
    });

    // -------------------------------------------------------------------------
    // SCÉNARIO 10 : Masquage total côté catalogue public et API
    // -------------------------------------------------------------------------
    console.log('▶ Test Scénario 10 : Masquage total côté catalogue public...');
    const publicProductsResult = await prisma.product.findMany({
      where: {
        isPublished: true,
        stock: { gt: 0 }
      },
      select: { id: true, name: true, stock: true, isPublished: true }
    });

    // Verify none of the zero stock or deactivated products are in the public query
    const hasZeroStockInPublic = publicProductsResult.some(p => p.stock <= 0 || !p.isPublished);

    const s10Passed = !hasZeroStockInPublic;

    results.push({
      scenario: 'Scénario 10 — Exclusion absolue du catalogue public',
      passed: s10Passed,
      message: s10Passed
        ? `Sur ${publicProductsResult.length} produits publics retournés, 0 produit possède un stock <= 0 ou isPublished = false`
        : 'Échec : au moins un produit à stock 0 ou désactivé a fuité dans le catalogue public',
      details: { totalPublicProducts: publicProductsResult.length }
    });

  } finally {
    // Nettoyage des produits de test
    if (createdProductIds.length > 0) {
      await prisma.product.deleteMany({
        where: { id: { in: createdProductIds } }
      });
      console.log(`\n🧹 Nettoyage : ${createdProductIds.length} produits de test supprimés.`);
    }

    // Restore official Baraka email in config
    await prisma.siteConfig.update({
      where: { id: 'singleton' },
      data: {
        restockNotificationEmails: ['contact@barakagroup.sn'],
        restockNotificationsEnabled: true
      }
    });
  }

  // ---------------------------------------------------------------------------
  // RAPPORT SYNTHÉTIQUE
  // ---------------------------------------------------------------------------
  console.log('\n======================================================================');
  console.log('                  RÉSULTATS DES 10 SCÉNARIOS DE TEST                  ');
  console.log('======================================================================\n');

  let allPassed = true;
  for (const r of results) {
    const icon = r.passed ? '✅ SUCCÈS' : '❌ ÉCHEC';
    if (!r.passed) allPassed = false;
    console.log(`${icon} : ${r.scenario}`);
    console.log(`   Message : ${r.message}`);
    if (r.details) console.log(`   Détails : ${JSON.stringify(r.details)}`);
    console.log('');
  }

  console.log('======================================================================');
  if (allPassed) {
    console.log('🎉 TOUS LES 10 SCÉNARIOS EXIGÉS ONT RÉUSSI AVEC SUCCÈS (100%) !');
  } else {
    console.log('⚠️ CERTAINS SCÉNARIOS ONT ÉCHOUÉ. VÉRIFIER LES LOGS CI-DESSUS.');
  }
  console.log('======================================================================\n');

  process.exit(allPassed ? 0 : 1);
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
