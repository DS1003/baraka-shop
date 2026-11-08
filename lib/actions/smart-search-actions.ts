'use server';

import prisma, { withDbRetry } from '@/lib/prisma';
import {
    tokenizeQuery,
    normalizeText,
    getDidYouMeanSuggestion,
    expandSynonyms,
    detectSearchIntent,
    calculateProductRelevanceScore,
    diversifySearchResults,
    highlightTextMatch
} from '@/lib/search/smart-search-engine';

export interface SmartSearchResult {
    products: any[];
    categories: { id: string; name: string; slug: string; count?: number }[];
    brands: { id: string; name: string; slug: string; count?: number }[];
    suggestions: string[];
    didYouMean: string | null;
    query: string;
    total: number;
}

/**
 * Action de recherche intelligente rapide pour l'autocomplétion & le menu de recherche du Header
 */
export async function getSmartSearchSuggestionsAction(
    rawQuery: string,
    limit: number = 10
): Promise<SmartSearchResult> {
    const query = (rawQuery || '').trim();
    if (query.length < 2) {
        return {
            products: [],
            categories: [],
            brands: [],
            suggestions: [],
            didYouMean: null,
            query,
            total: 0
        };
    }

    try {
        const tokens = tokenizeQuery(query);
        const didYouMean = getDidYouMeanSuggestion(query);
        const searchTokens = didYouMean ? Array.from(new Set([...tokens, ...tokenizeQuery(didYouMean)])) : tokens;
        const expandedTokens = expandSynonyms(searchTokens);
        const intent = detectSearchIntent(query);

        // 1. Recherche des catégories et marques correspondant directement à la requête
        const [matchingCategories, matchingBrands] = await Promise.all([
            prisma.category.findMany({
                where: {
                    name: { contains: query, mode: 'insensitive' },
                    isPublished: true
                },
                take: 3,
                select: { id: true, name: true, slug: true }
            }),
            prisma.brand.findMany({
                where: {
                    name: { contains: query, mode: 'insensitive' }
                },
                take: 3,
                select: { id: true, name: true, slug: true }
            })
        ]);

        // 2. Construction de la condition Prisma avec matching multi-termes flexible
        // Chaque token de la requête peut correspondre dans le nom, la marque, la référence, ou la catégorie
        const tokenAndConditions = tokens.map(token => ({
            OR: [
                { name: { contains: token, mode: 'insensitive' } },
                { reference: { contains: token, mode: 'insensitive' } },
                { brand: { name: { contains: token, mode: 'insensitive' } } },
                { category: { name: { contains: token, mode: 'insensitive' } } },
                { subCategory: { name: { contains: token, mode: 'insensitive' } } },
                { shortDescription: { contains: token, mode: 'insensitive' } },
                { description: { contains: token, mode: 'insensitive' } }
            ]
        }));

        // Condition de base : publié, prix > 0
        const baseWhere: any = {
            isPublished: true,
            price: { gt: 0 }
        };

        // Requête principale : multi-token AND
        let candidates = await withDbRetry(() =>
            prisma.product.findMany({
                where: {
                    ...baseWhere,
                    AND: tokenAndConditions
                },
                include: {
                    category: { select: { id: true, name: true, slug: true } },
                    subCategory: { select: { id: true, name: true, slug: true } },
                    brand: { select: { id: true, name: true, slug: true } },
                    orderItems: { select: { id: true } },
                    reviews: { select: { id: true } }
                },
                take: 40 // Récupérer un vivier suffisant pour le re-ranking par pertinence
            })
        );

        // Fallback si 0 ou très peu de résultats : tenter avec les synonymes ou la suggestion orthographique
        if (candidates.length < 3 && (expandedTokens.length > tokens.length || didYouMean)) {
            const fallbackTokens = didYouMean ? tokenizeQuery(didYouMean) : expandedTokens;
            const fallbackConditions = fallbackTokens.map(token => ({
                OR: [
                    { name: { contains: token, mode: 'insensitive' } },
                    { brand: { name: { contains: token, mode: 'insensitive' } } },
                    { category: { name: { contains: token, mode: 'insensitive' } } }
                ]
            }));

            const fallbackCandidates = await withDbRetry(() =>
                prisma.product.findMany({
                    where: {
                        ...baseWhere,
                        OR: fallbackConditions
                    },
                    include: {
                        category: { select: { id: true, name: true, slug: true } },
                        subCategory: { select: { id: true, name: true, slug: true } },
                        brand: { select: { id: true, name: true, slug: true } },
                        orderItems: { select: { id: true } },
                        reviews: { select: { id: true } }
                    },
                    take: 30
                })
            );

            // Fusionner sans doublons
            const existingIds = new Set(candidates.map(c => c.id));
            for (const item of fallbackCandidates) {
                if (!existingIds.has(item.id)) {
                    candidates.push(item);
                    existingIds.add(item.id);
                }
            }
        }

        // 3. Calcul des scores de pertinence Google-like
        const scoredProducts = candidates.map(product => {
            const score = calculateProductRelevanceScore(product, query, tokens, intent);
            return { product, score };
        });

        // Trier par score décroissant
        scoredProducts.sort((a, b) => b.score - a.score);

        // 4. Diversification des résultats (évite d'aligner 5 bouteilles d'encre différentes avant l'imprimante)
        const diversifiedProducts = diversifySearchResults(scoredProducts, limit);

        // 5. Enrichissement des produits avec surlignage Google-like
        const finalProducts = diversifiedProducts.map(p => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: p.price,
            oldPrice: p.oldPrice,
            stock: p.stock,
            images: p.images,
            category: p.category,
            subCategory: p.subCategory,
            brand: p.brand,
            reference: p.reference,
            highlightedName: highlightTextMatch(p.name, query)
        }));

        // 6. Suggestions de requêtes connexes (Google Autocomplete)
        const suggestionsSet = new Set<string>();

        // Si une marque est détectée
        if (matchingBrands.length > 0) {
            suggestionsSet.add(`${matchingBrands[0].name} ${query}`);
        }

        // Complétions à partir des titres phares
        for (const p of finalProducts.slice(0, 3)) {
            const words = p.name.split(/\s+/).slice(0, 4).join(' ');
            if (words && words.length > query.length) {
                suggestionsSet.add(words);
            }
        }

        return {
            products: finalProducts,
            categories: matchingCategories,
            brands: matchingBrands,
            suggestions: Array.from(suggestionsSet).slice(0, 3),
            didYouMean,
            query,
            total: candidates.length
        };
    } catch (err: any) {
        console.error("[getSmartSearchSuggestionsAction] Erreur:", err);
        return {
            products: [],
            categories: [],
            brands: [],
            suggestions: [],
            didYouMean: null,
            query,
            total: 0
        };
    }
}
