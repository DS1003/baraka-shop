import 'dotenv/config';
import prisma from '../lib/prisma';
import { calculateProductRelevanceScore, tokenizeQuery, detectSearchIntent } from '../lib/search/smart-search-engine';

async function inspectScores() {
    const query = 'tablette';
    const tokens = tokenizeQuery(query);
    const intent = detectSearchIntent(query);

    const products = await prisma.product.findMany({
        where: {
            reference: { in: ['750MS', 'RAPC1620', 'LX2', 'DELINS7440I7', 'TAB7', 'TAB8PROMAX', 'TAB18PROMAX'] }
        },
        include: {
            category: true,
            subCategory: true,
            brand: true,
            orderItems: { select: { id: true } },
            reviews: { select: { id: true } }
        }
    });

    for (const p of products) {
        const score = calculateProductRelevanceScore(p, query, tokens, intent);
        console.log(`\n========================================`);
        console.log(`Product: [${p.reference}] ${p.name}`);
        console.log(`Cat: ${p.category?.name} | SubCat: ${p.subCategory?.name} | Brand: ${p.brand?.name}`);
        console.log(`Stock: ${p.stock} | Published: ${p.isPublished} | Price: ${p.price}`);
        console.log(`Score: ${score}`);
        console.log(`ShortDesc: ${p.shortDescription}`);
        console.log(`Description preview: ${(p.description || '').slice(0, 200)}...`);
    }

    await prisma.$disconnect();
}

inspectScores().catch(console.error);
