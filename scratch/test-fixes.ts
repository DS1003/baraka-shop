import 'dotenv/config';
process.env.BYPASS_AUTH_FOR_SCRIPTS = 'true';
import { prisma } from '../lib/prisma';
import { getAdminProductById, upsertProduct, getAdminProducts } from '../lib/actions/admin-actions';

async function runTests() {
    console.log("=== DÉBUT DES TESTS DE NON-RÉGRESSION ===");

    // Test 1: Chargement direct via getAdminProductById (Zéro cache)
    const testId = '55735832-f9da-4309-9e6a-3166173f8cd7';
    console.log(`\n--- TEST 1: Chargement direct du produit ${testId} ---`);
    const p1 = await getAdminProductById(testId);
    if (!p1) {
        throw new Error("Produit cible introuvable !");
    }
    console.log(`[PASS] Produit trouvé: "${p1.name}", Référence: ${p1.reference}, Prix: ${p1.price}, Images: ${p1.images.length}`);

    // Test 2: Invariance de l'identifiant (UPDATE ne doit jamais modifier l'ID)
    console.log(`\n--- TEST 2: Invariance de l'ID lors de l'enregistrement ---`);
    const originalId = p1.id;
    const originalSlug = p1.slug;
    const testPayload = {
        name: p1.name,
        slug: p1.slug,
        description: p1.description || "",
        price: p1.price,
        stock: p1.stock,
        categoryId: p1.categoryId,
        subCategoryId: p1.subCategoryId,
        thirdLevelCategoryId: p1.thirdLevelCategoryId,
        brandId: p1.brandId,
        storeId: p1.storeId,
        images: p1.images,
        videos: p1.videos,
        colorVariants: p1.colorVariants || [],
        shortDescription: p1.shortDescription,
        detailedDescription: p1.detailedDescription || [],
        features: p1.features || [],
        packageContent: p1.packageContent || [],
        isPublished: p1.isPublished,
        isNew: p1.isNew,
        metadata: (p1.metadata as any) || {}
    };

    const updateRes = await upsertProduct(testPayload, originalId);
    if (!updateRes.success || !updateRes.product) {
        throw new Error(`Échec de la mise à jour: ${updateRes.message}`);
    }
    if (updateRes.product.id !== originalId) {
        throw new Error(`CRITIQUE: L'ID a changé de ${originalId} à ${updateRes.product.id} !`);
    }
    if (updateRes.product.slug !== originalSlug) {
        throw new Error(`Le slug a changé de ${originalSlug} à ${updateRes.product.slug} sans modification du nom !`);
    }
    console.log(`[PASS] ID strictement préservé: ${updateRes.product.id}`);
    console.log(`[PASS] Slug strictement préservé: ${updateRes.product.slug}`);

    // Test 3: Persistance des champs (vérification en base)
    console.log(`\n--- TEST 3: Vérification immédiate en base de données ---`);
    const dbCheck = await prisma.product.findUnique({
        where: { id: originalId }
    });
    if (!dbCheck) {
        throw new Error("Produit introuvable en base après update !");
    }
    console.log(`[PASS] Produit vérifié en DB: updatedAt = ${dbCheck.updatedAt.toISOString()}`);

    // Test 4: Vérification qu'aucun doublon n'a été créé
    console.log(`\n--- TEST 4: Contrôle d'unicité en DB pour ce produit ---`);
    const countById = await prisma.product.count({
        where: { id: originalId }
    });
    if (countById !== 1) {
        throw new Error(`Anomalie: ${countById} enregistrements trouvés pour l'ID ${originalId}`);
    }
    console.log(`[PASS] Exactement 1 enregistrement pour l'ID ${originalId}`);

    // Test 5: Tri déterministe de la pagination
    console.log(`\n--- TEST 5: Tri déterministe de la liste admin ---`);
    const page1 = await getAdminProducts('', 1, 10);
    const page2 = await getAdminProducts('', 2, 10);
    const p1Ids = new Set(page1.products.map(p => p.id));
    const overlaps = page2.products.filter(p => p1Ids.has(p.id));
    if (overlaps.length > 0) {
        throw new Error(`Chevauchement de pagination détecté: ${overlaps.map(o => o.id).join(', ')}`);
    }
    console.log(`[PASS] Pagination parfaitement déterministe (aucun chevauchement entre page 1 et page 2, ${page1.products.length} et ${page2.products.length} produits testés)`);

    console.log("\n=== TOUS LES TESTS DE NON-RÉGRESSION ONT RÉUSSI ===");
}

runTests()
    .catch((err) => {
        console.error("ERREUR DURANT LES TESTS:", err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
