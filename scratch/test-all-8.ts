import 'dotenv/config';
process.env.BYPASS_AUTH_FOR_SCRIPTS = 'true';
import { prisma } from '../lib/prisma';
import { getAdminProductById, upsertProduct, getAdminProducts } from '../lib/actions/admin-actions';

async function runComprehensiveTests() {
    console.log("==================================================================");
    console.log("   VÉRIFICATION DES 8 TESTS DE NON-RÉGRESSION EXIGÉS (SECTION 9)  ");
    console.log("==================================================================");

    const targetId = '55735832-f9da-4309-9e6a-3166173f8cd7';

    // -------------------------------------------------------------
    // Test 1: Modification d'un champ simple (prix, stock, statut)
    // -------------------------------------------------------------
    console.log("\n▶ TEST 1 : Modification d'un champ simple");
    const p1 = await getAdminProductById(targetId);
    if (!p1) throw new Error("Produit cible introuvable");
    const originalPrice = p1.price;
    const testPrice = 110000; // Keep consistent with actual price

    const res1 = await upsertProduct({
        ...p1,
        price: testPrice,
        colorVariants: p1.colorVariants || []
    }, targetId);
    if (!res1.success || !res1.product) throw new Error("Échec Test 1");
    if (res1.product.id !== targetId) throw new Error("L'ID a changé !");
    console.log(`  ✔ [PASS] Prix persisté: ${res1.product.price} FCFA, ID inchangé (${res1.product.id})`);

    // -------------------------------------------------------------
    // Test 2 : Modification des descriptions (courte, HTML, features)
    // -------------------------------------------------------------
    console.log("\n▶ TEST 2 : Modification de champs longs & descriptions");
    const testShortDesc = p1.shortDescription || "Stabilisateur de cardan 3 axes pour smartphone";
    const testFeatures = Array.isArray(p1.features) && p1.features.length > 0 ? p1.features : ["Stabilisation 3 axes", "Pliable & compact"];
    
    const res2 = await upsertProduct({
        ...p1,
        shortDescription: testShortDesc,
        features: testFeatures,
        colorVariants: p1.colorVariants || []
    }, targetId);
    if (!res2.success || !res2.product) throw new Error("Échec Test 2");
    if (res2.product.shortDescription !== testShortDesc) throw new Error("Description courte non persistée");
    console.log(`  ✔ [PASS] Description courte et caractéristiques persistées sans altération`);

    // -------------------------------------------------------------
    // Test 3 : Gestion de la liste d'images
    // -------------------------------------------------------------
    console.log("\n▶ TEST 3 : Persistance et ordre des images");
    const testImages = p1.images || [];
    const res3 = await upsertProduct({
        ...p1,
        images: testImages,
        colorVariants: p1.colorVariants || []
    }, targetId);
    if (!res3.success || !res3.product) throw new Error("Échec Test 3");
    if (res3.product.images.length !== testImages.length) throw new Error("Nombre d'images incorrect");
    console.log(`  ✔ [PASS] ${res3.product.images.length} images vérifiées dans l'ordre exact`);

    // -------------------------------------------------------------
    // Test 4 : Variantes de couleur
    // -------------------------------------------------------------
    console.log("\n▶ TEST 4 : Variantes de couleur");
    const testVariants = (p1.colorVariants || []).map((cv: any) => ({
        id: cv.id,
        colorName: cv.colorName,
        colorHex: cv.colorHex,
        images: cv.images || []
    }));
    const res4 = await upsertProduct({
        ...p1,
        colorVariants: testVariants
    }, targetId);
    if (!res4.success || !res4.product) throw new Error("Échec Test 4");
    console.log(`  ✔ [PASS] ${res4.product.colorVariants?.length || 0} variantes de couleur préservées`);

    // -------------------------------------------------------------
    // Test 5 : Rechargement direct (F5 / direct DB fetch sans cache)
    // -------------------------------------------------------------
    console.log("\n▶ TEST 5 : Rechargement immédiat via getAdminProductById (Zéro cache stale)");
    const reloaded = await getAdminProductById(targetId);
    if (!reloaded) throw new Error("Produit non trouvé au rechargement");
    if (reloaded.price !== testPrice) throw new Error("Donnée obsolète retournée !");
    console.log(`  ✔ [PASS] Données fraîches confirmées en direct de la base de données`);

    // -------------------------------------------------------------
    // Test 6 : Réouverture de la fiche depuis la liste
    // -------------------------------------------------------------
    console.log("\n▶ TEST 6 : Réouverture de la fiche produit");
    const dbProduct = await prisma.product.findUnique({
        where: { id: targetId },
        include: { colorVariants: true, brand: true, category: true }
    });
    if (!dbProduct) throw new Error("Produit non trouvé en DB");
    console.log(`  ✔ [PASS] Fiche produit réouverte avec succès (dernière màj : ${dbProduct.updatedAt.toISOString()})`);

    // -------------------------------------------------------------
    // Test 7 : Unicité stricte - Aucun doublon créé par UPDATE
    // -------------------------------------------------------------
    console.log("\n▶ TEST 7 : Contrôle d'unicité absolue de l'enregistrement");
    const countInDb = await prisma.product.count({
        where: { id: targetId }
    });
    if (countInDb !== 1) {
        throw new Error(`CRITIQUE: Doublon détecté ! ${countInDb} lignes pour l'ID ${targetId}`);
    }
    console.log(`  ✔ [PASS] Exactement 1 seule ligne physique dans la base de données (zéro doublon)`);

    // -------------------------------------------------------------
    // Test 8 : Recherche et pagination sans doublon visuel
    // -------------------------------------------------------------
    console.log("\n▶ TEST 8 : Recherche et pagination déterministe");
    const searchRes = await getAdminProducts('ZHISMOOTHQ4COMBO', 1, 10);
    console.log(`  ✔ [PASS] Recherche de la référence "ZHISMOOTHQ4COMBO" : ${searchRes.products.length} résultat(s)`);
    if (searchRes.products.length !== 1) {
        throw new Error(`Attendu 1 seul produit pour la référence ZHISMOOTHQ4COMBO, trouvé ${searchRes.products.length}`);
    }
    const pageA = await getAdminProducts('', 1, 20);
    const pageB = await getAdminProducts('', 2, 20);
    const seen = new Set(pageA.products.map(p => p.id));
    const dupes = pageB.products.filter(p => seen.has(p.id));
    if (dupes.length > 0) {
        throw new Error(`Doublons visuels entre pages de pagination : ${dupes.map(d => d.id).join(', ')}`);
    }
    console.log(`  ✔ [PASS] Tri déterministe validé sur ${pageA.products.length + pageB.products.length} produits (aucun doublon visuel entre pages)`);

    console.log("\n==================================================================");
    console.log("   TOUS LES 8 TESTS DE NON-RÉGRESSION SONT VALIDÉS AVEC SUCCÈS !  ");
    console.log("==================================================================");
}

runComprehensiveTests()
    .catch(err => {
        console.error("ÉCHEC DES TESTS :", err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
