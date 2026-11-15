import 'dotenv/config';
import prisma from '../lib/prisma';
import { getSmartSearchSuggestionsAction } from '../lib/actions/smart-search-actions';
import { getProductsAction } from '../lib/actions/product-actions';

const TEST_QUERIES = [
    'tablette',
    'imprimante',
    'ordinateur portable',
    'casque Bluetooth',
    'Jabra',
    'Dell Inspiron',
    'SVR-1500VA',
    'PK-9950',
    'régulateur 1500VA',
    'tablette Samsung'
];

async function runBenchmark() {
    console.log('=== TEST DE PERTINENCE DES RECHERCHES ACTUELLES ===\n');

    for (const q of TEST_QUERIES) {
        console.log(`\n==================================================`);
        console.log(`TEST QUERY: "${q}"`);
        console.log(`==================================================`);

        const smart = await getSmartSearchSuggestionsAction(q, 5);
        console.log(`Suggestions (${smart.total} total) :`);
        if (smart.products.length === 0) {
            console.log('  [AUCUN PRODUIT TROUVÉ]');
        } else {
            smart.products.forEach((p, i) => {
                console.log(`  ${i + 1}. [${p.reference}] ${p.name} (Cat: ${p.category?.name} > ${p.subCategory?.name || '-'})`);
            });
        }

        const boutique = await getProductsAction({ query: q, limit: 5, noCache: true });
        console.log(`Boutique /boutique (${boutique.pagination.total} total) :`);
        if (boutique.products.length === 0) {
            console.log('  [AUCUN PRODUIT TROUVÉ]');
        } else {
            boutique.products.forEach((p, i) => {
                console.log(`  ${i + 1}. [${p.reference}] ${p.name} (Cat: ${p.category?.name} > ${p.subCategory?.name || '-'})`);
            });
        }
    }

    await prisma.$disconnect();
}

runBenchmark().catch(console.error);
