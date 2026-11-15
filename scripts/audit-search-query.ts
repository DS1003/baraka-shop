import 'dotenv/config';
import prisma from '../lib/prisma';
import { getSmartSearchSuggestionsAction } from '../lib/actions/smart-search-actions';
import { getProductsAction } from '../lib/actions/product-actions';

async function audit() {
    console.log('=== AUDIT DU MOTEUR DE RECHERCHE BARAKA SHOP ===\n');

    // 1. Catégories existantes
    const categories = await prisma.category.findMany({
        select: {
            id: true,
            name: true,
            slug: true,
            subCategories: {
                select: { id: true, name: true, slug: true }
            }
        }
    });
    console.log(`Nombre total de catégories : ${categories.length}`);
    categories.forEach(c => {
        const subs = c.subCategories.map(s => s.name).join(', ');
        console.log(`- Catégorie: "${c.name}" (slug: ${c.slug}) -> Sous-catégories: [${subs}]`);
    });

    // 2. Recherche directe de tablettes en DB (name, category, description)
    console.log('\n--- Produits avec "tablette" dans le nom ---');
    const nameTablettes = await prisma.product.findMany({
        where: {
            name: { contains: 'tablette', mode: 'insensitive' }
        },
        select: { id: true, name: true, reference: true, stock: true, isPublished: true, category: { select: { name: true } } }
    });
    console.log(`Trouvés par nom : ${nameTablettes.length}`);
    nameTablettes.forEach(p => console.log(`  * [${p.reference}] ${p.name} | Cat: ${p.category?.name} | Stock: ${p.stock} | Publié: ${p.isPublished}`));

    console.log('\n--- Produits avec "tab" dans le nom (ex: Samsung Tab, Galaxy Tab) ---');
    const tabProducts = await prisma.product.findMany({
        where: {
            name: { contains: 'Tab', mode: 'insensitive' }
        },
        take: 10,
        select: { id: true, name: true, reference: true, stock: true, isPublished: true, category: { select: { name: true } } }
    });
    console.log(`Trouvés par "Tab" : ${tabProducts.length}`);
    tabProducts.forEach(p => console.log(`  * [${p.reference}] ${p.name} | Cat: ${p.category?.name} | Stock: ${p.stock}`));

    console.log('\n--- Produits avec "tablette" dans description mais PAS dans le nom ---');
    const descOnlyTablettes = await prisma.product.findMany({
        where: {
            NOT: { name: { contains: 'tablette', mode: 'insensitive' } },
            OR: [
                { description: { contains: 'tablette', mode: 'insensitive' } },
                { shortDescription: { contains: 'tablette', mode: 'insensitive' } }
            ],
            isPublished: true,
            stock: { gt: 0 }
        },
        take: 10,
        select: {
            id: true,
            name: true,
            reference: true,
            category: { select: { name: true } },
            shortDescription: true
        }
    });
    console.log(`Trouvés par description uniquement (échantillon de 10) : ${descOnlyTablettes.length}`);
    descOnlyTablettes.forEach(p => {
        console.log(`  * [${p.reference}] ${p.name} (Catégorie: ${p.category?.name})`);
    });

    // 3. Test de getSmartSearchSuggestionsAction('tablette')
    console.log('\n--- Test getSmartSearchSuggestionsAction("tablette") actuel ---');
    const smartRes = await getSmartSearchSuggestionsAction('tablette', 10);
    console.log(`Total candidats: ${smartRes.total}`);
    console.log(`Catégories suggérées:`, smartRes.categories);
    console.log(`Marques suggérées:`, smartRes.brands);
    console.log(`Suggestions mots-clés:`, smartRes.suggestions);
    console.log(`Produits retournés : ${smartRes.products.length}`);
    smartRes.products.forEach((p, idx) => {
        console.log(`  ${idx + 1}. ${p.name} (Ref: ${p.reference}, Cat: ${p.category?.name})`);
    });

    // 4. Test de getProductsAction({ query: 'tablette' })
    console.log('\n--- Test getProductsAction({ query: "tablette" }) actuel ---');
    const boutiqueRes = await getProductsAction({ query: 'tablette', limit: 10, noCache: true });
    console.log(`Total boutique: ${boutiqueRes.pagination.total}`);
    boutiqueRes.products.forEach((p, idx) => {
        console.log(`  ${idx + 1}. ${p.name} (Ref: ${p.reference}, Cat: ${p.category?.name})`);
    });

    await prisma.$disconnect();
}

audit().catch(err => {
    console.error('Erreur audit:', err);
    process.exit(1);
});
