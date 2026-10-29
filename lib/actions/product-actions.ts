'use server';

import prisma, { withDbRetry } from '@/lib/prisma';
import { getCache, setCache, rememberCache, invalidatePrefix, invalidateCache } from '@/lib/redis';
import { slugify } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import fs from 'fs/promises';
import path from 'path';
import { sendRestockNotificationAsync } from '@/lib/stock-service';

export async function getProductsAction(options: {
    query?: string;
    category?: string;
    subCategory?: string;
    thirdLevelCategory?: string;
    brand?: string;
    store?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    page?: number;
    limit?: number;
    onSale?: boolean;
    isNew?: boolean;
    excludeIds?: string[];
    noCache?: boolean;
    onlyNewAndComingSoon?: boolean;
    badgeFilter?: 'all' | 'nouveau' | 'bientot_disponible';
} = {}) {
    const query = options.query;
    const category = options.category;
    const subCategory = options.subCategory || (options as any).sub;
    const thirdLevelCategory = options.thirdLevelCategory || (options as any).third;
    const brand = options.brand;
    const store = options.store;
    const minPrice = options.minPrice;
    const maxPrice = options.maxPrice;
    const sort = options.sort || 'newest';
    const page = options.page || 1;
    const limit = options.limit || 12;
    const onSale = options.onSale || false;
    const isNew = options.isNew || false;
    const excludeIds = options.excludeIds || [];
    const noCache = options.noCache || false;
    const onlyNewAndComingSoon = options.onlyNewAndComingSoon || false;
    const badgeFilter = options.badgeFilter || 'all';

    const executeFetch = async () => {
        const skip = (page - 1) * limit;

        try {
            // Construction du WHERE clause sécurisée via AND list (exclut les produits masqués ou sans prix)
            const andConditions: any[] = [
                { isPublished: true },
                { price: { gt: 0 } }
            ];

            if (onlyNewAndComingSoon) {
                // Uniquement les produits avec badge "Nouveau" ou "Bientôt disponible"
                const nouveauConditions: any[] = [
                    { isNew: true, stock: { gt: 0 } },
                    { metadata: { path: ['badge'], string_contains: 'Nouveau' }, stock: { gt: 0 } }
                ];

                const bientotConditions: any[] = [
                    { metadata: { path: ['badge'], equals: 'Bientôt disponible' } },
                    { metadata: { path: ['badge'], equals: 'Bientot disponible' } },
                    { metadata: { path: ['badge'], string_contains: 'disponible' } }
                ];

                let badgeConditions: any[] = [];
                if (badgeFilter === 'nouveau') {
                    badgeConditions = nouveauConditions;
                } else if (badgeFilter === 'bientot_disponible') {
                    badgeConditions = bientotConditions;
                } else {
                    badgeConditions = [...nouveauConditions, ...bientotConditions];
                }

                andConditions.push({ OR: badgeConditions });
            } else {
                andConditions.push({ stock: { gt: 0 } });
            }

            if (query) {
                andConditions.push({
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { description: { contains: query, mode: 'insensitive' } },
                        { reference: { contains: query, mode: 'insensitive' } },
                    ]
                });
            }

            if (category) {
                andConditions.push({ category: { slug: category } });
            }

            if (subCategory) {
                andConditions.push({ subCategory: { slug: subCategory } });
            }

            if (thirdLevelCategory) {
                andConditions.push({ thirdLevelCategory: { slug: thirdLevelCategory } });
            }

            if (brand) {
                andConditions.push({ brand: { slug: brand } });
            }

            if (store) {
                andConditions.push({ store: { slug: store } });
            }

            if (isNew && !onlyNewAndComingSoon) {
                andConditions.push({ isNew: true });
            }

            if (onSale) {
                const now = new Date();
                andConditions.push({
                    oldPrice: { not: null },
                    OR: [
                        { promotionId: null },
                        {
                            promotion: {
                                startDate: { lte: now },
                                endDate: { gte: now }
                            }
                        }
                    ]
                });
            }

            if (minPrice !== undefined || maxPrice !== undefined) {
                const priceFilter: any = {};
                if (minPrice !== undefined) priceFilter.gte = minPrice;
                if (maxPrice !== undefined) priceFilter.lte = maxPrice;
                andConditions.push({ price: priceFilter });
            }

            if (excludeIds && Array.isArray(excludeIds) && excludeIds.length > 0) {
                andConditions.push({ id: { notIn: excludeIds } });
            }

            const where: any = { AND: andConditions };

            // Construction du SORT (Nouveautés : ordre de dernière mise à jour allant du haut vers le bas)
            let orderBy: any = [{ updatedAt: 'desc' }, { id: 'desc' }];
            if (sort === 'price_asc') {
                orderBy = { price: 'asc' };
            } else if (sort === 'price_desc') {
                orderBy = { price: 'desc' };
            } else if (sort === 'oldest') {
                orderBy = { createdAt: 'asc' };
            } else if (sort === 'top_rated' || sort === 'best_sellers' || sort === 'popular') {
                orderBy = [
                    { orderItems: { _count: 'desc' } },
                    { reviews: { _count: 'desc' } },
                    { updatedAt: 'desc' }
                ];
            } else if (sort === 'newest') {
                orderBy = [{ updatedAt: 'desc' }, { id: 'desc' }];
            }

            const [products, total] = await withDbRetry(() => Promise.all([
                prisma.product.findMany({
                    where,
                    include: {
                        category: true,
                        subCategory: true,
                        brand: true
                    },
                    orderBy,
                    skip,
                    take: limit,
                }),
                prisma.product.count({ where })
            ]));

            return {
                products,
                pagination: {
                    total,
                    pages: Math.ceil(total / limit),
                    currentPage: page,
                    limit
                }
            };
        } catch (error) {
            console.error('[Get Products Error]:', error);
            return { products: [], pagination: { total: 0, pages: 0, currentPage: 1, limit } };
        }
    };

    if (noCache) {
        return await executeFetch();
    }

    // Clé de cache déterministe normalisée : évite la fragmentation du cache
    const cacheKey = [
        'products:v4',
        `q=${(query || '').trim().toLowerCase()}`,
        `cat=${category || ''}`,
        `sub=${subCategory || ''}`,
        `third=${thirdLevelCategory || ''}`,
        `b=${brand || ''}`,
        `s=${store || ''}`,
        `min=${minPrice ?? ''}`,
        `max=${maxPrice ?? ''}`,
        `sort=${sort}`,
        `p=${page}`,
        `lim=${limit}`,
        `sale=${Boolean(onSale)}`,
        `new=${Boolean(isNew)}`,
        `ex=${[...excludeIds].sort().join(',')}`
    ].join(':');

    return await rememberCache(cacheKey, 300, executeFetch);
}

export async function getProductByIdAction(id: string) {
    if (!id) return null;
    return await rememberCache(`product:${id}`, 600, async () => {
        try {
            return await withDbRetry(() => prisma.product.findFirst({
                where: {
                    OR: [
                        { id },
                        { slug: id }
                    ]
                },
                include: {
                    category: true,
                    subCategory: true,
                    thirdLevelCategory: true,
                    brand: true,
                    colorVariants: {
                        orderBy: { position: 'asc' }
                    },
                    reviews: {
                        include: {
                            user: {
                                select: { username: true, image: true }
                            }
                        },
                        orderBy: { createdAt: 'desc' },
                        take: 10
                    }
                }
            }));
        } catch (error) {
            console.error('[Get Product By Id Error]:', error);
            return null;
        }
    });
}

export async function getSimilarProductsAction(product: any, limit: number = 8) {
    if (!product || !product.id) return [];
    const cacheKey = `similar_v6:${product.id}:${product.categoryId || ''}:${product.subCategoryId || ''}:${product.thirdLevelCategoryId || ''}:${limit}`;
    
    return await rememberCache(cacheKey, 600, async () => {
        try {
            const baseWhere = {
                id: { not: product.id },
                stock: { gt: 0 },
                price: { gt: 0 },
                isPublished: true
            };

            let similarProducts: any[] = [];

            // 1. Priorité absolue : même sous-catégorie niveau 2 (thirdLevelCategory)
            if (product.thirdLevelCategoryId) {
                const thirdLevelProducts = await prisma.product.findMany({
                    where: { ...baseWhere, thirdLevelCategoryId: product.thirdLevelCategoryId },
                    include: { category: true, brand: true },
                    take: limit,
                    orderBy: { createdAt: 'desc' }
                });
                similarProducts = [...thirdLevelProducts];
            }

            // 2. Si on n'a pas atteint la limite, on complète avec la sous-catégorie niveau 1 (subCategory)
            if (similarProducts.length < limit && product.subCategoryId) {
                const excludeIds = similarProducts.map(p => p.id);
                const subCatProducts = await prisma.product.findMany({
                    where: { 
                        ...baseWhere, 
                        subCategoryId: product.subCategoryId,
                        id: { notIn: [product.id, ...excludeIds] }
                    },
                    include: { category: true, brand: true },
                    take: limit - similarProducts.length,
                    orderBy: { createdAt: 'desc' }
                });
                similarProducts = [...similarProducts, ...subCatProducts];
            }

            // 3. Si toujours pas assez de produits, on complète avec la catégorie principale
            if (similarProducts.length < limit && product.categoryId) {
                const excludeIds = similarProducts.map(p => p.id);
                const catProducts = await prisma.product.findMany({
                    where: { 
                        ...baseWhere, 
                        categoryId: product.categoryId,
                        id: { notIn: [product.id, ...excludeIds] }
                    },
                    include: { category: true, brand: true },
                    take: limit - similarProducts.length,
                    orderBy: { createdAt: 'desc' }
                });
                similarProducts = [...similarProducts, ...catProducts];
            }

            return similarProducts;
        } catch (error) {
            console.error('[Get Similar Products Error]:', error);
            return [];
        }
    });
}

export async function getCategoriesAction() {
    return await rememberCache('categories:all:with_sub_v4', 3600, async () => {
        try {
            return await withDbRetry(() => prisma.category.findMany({
                where: { isPublished: true },
                include: {
                    subCategories: {
                        include: {
                            thirdLevelCategories: true
                        }
                    },
                    _count: {
                        select: { products: { where: { isPublished: true, stock: { gt: 0 }, price: { gt: 0 } } } }
                    }
                },
                orderBy: { name: 'asc' }
            }));
        } catch (error) {
            return [];
        }
    });
}

export async function getBrandsAction() {
    return await rememberCache('brands:all_v3', 3600, async () => {
        try {
            return await withDbRetry(() => prisma.brand.findMany({
                include: {
                    _count: {
                        select: { products: { where: { isPublished: true, stock: { gt: 0 }, price: { gt: 0 } } } }
                    }
                },
                orderBy: { name: 'asc' }
            }));
        } catch (error) {
            return [];
        }
    });
}

export async function getCategoryBySlugAction(slug: string) {
    if (!slug) return null;
    return await rememberCache(`category_v3:${slug}`, 3600, async () => {
        try {
            return await withDbRetry(() => prisma.category.findFirst({
                where: { slug, isPublished: true },
                include: {
                    _count: {
                        select: { products: { where: { isPublished: true, stock: { gt: 0 }, price: { gt: 0 } } } }
                    }
                }
            }));
        } catch (error) {
            return null;
        }
    });
}

export async function getMegaMenuAction() {
    return await rememberCache('megamenu:all_v2', 3600, async () => {
        try {
            return await withDbRetry(() => prisma.category.findMany({
                where: { isPublished: true },
                include: {
                    subCategories: {
                        include: {
                            thirdLevelCategories: true
                        }
                    }
                },
                orderBy: { name: 'asc' }
            }));
        } catch (error) {
            console.error('[Get Mega Menu Action Error]:', error);
            return [];
        }
    });
}

export async function getPopularUniversesAction(): Promise<any[]> {
    return await rememberCache<any[]>('popular_universes:all_v2', 3600, async () => {
        try {
            return await withDbRetry<any[]>(() => (prisma as any).popularUniverse.findMany({
                orderBy: { order: 'asc' }
            }));
        } catch (error) {
            console.error('[Get Popular Universes Error]:', error);
            return [];
        }
    });
}



interface ImportProduct {
    reference?: string;
    name: string;
    category: string;
    subCategory?: string;
    subcategory1?: string;
    subcategory2?: string;
    brand?: string;
    price: number;
    oldPrice?: number;
    stock: number;
    description: string;
    images?: string;
    metadata?: any;
}

/**
 * Cache les IDs des catégories et marques pour éviter les UPSERT à répétition.
 */
async function getEntityIds(products: ImportProduct[]) {
    const categoryNames = [...new Set(products.map(p => p.category).filter(Boolean))];
    const brandNames = [...new Set(products.map(p => p.brand).filter(Boolean) as string[])];

    const catMap = new Map<string, string>();
    const brandMap = new Map<string, string>();
    const subCatMap = new Map<string, string>();

    // 1. Catégories & Marques
    for (const name of categoryNames) {
        const cacheKey = `id:cat:${name}`;
        let id = await getCache<string>(cacheKey);
        if (!id) {
            const cat = await prisma.category.upsert({
                where: { name },
                update: {},
                create: { name, slug: slugify(name) || `cat-${Math.random().toString(36).substring(2, 7)}` }
            });
            id = cat.id;
            await setCache(cacheKey, id, 3600);
        }
        catMap.set(name, id);
    }

    for (const name of brandNames) {
        const cacheKey = `id:brand:${name}`;
        let id = await getCache<string>(cacheKey);
        if (!id) {
            const b = await prisma.brand.upsert({
                where: { name },
                update: {},
                create: { name, slug: slugify(name) || `brand-${Math.random().toString(36).substring(2, 7)}` }
            });
            id = b.id;
            await setCache(cacheKey, id, 3600);
        }
        brandMap.set(name, id);
    }

    // 2. Sous-catégories (Level 2)
    const uniqueSubCats = [...new Set(products.filter(p => p.category && (p.subCategory || p.subcategory1)).map(p => {
        const subName = p.subCategory || p.subcategory1;
        return `${p.category}|${subName}`;
    }))];

    for (const pair of uniqueSubCats) {
        const [catName, subName] = pair.split('|');
        const categoryId = catMap.get(catName);
        if (!categoryId) continue;

        const cacheKey = `id:sub:${categoryId}:${subName}`;
        let id = await getCache<string>(cacheKey);
        if (!id) {
            const sub = await prisma.subCategory.upsert({
                where: { name_categoryId: { name: subName, categoryId } },
                update: {},
                create: {
                    name: subName,
                    categoryId,
                    slug: slugify(`${catName}-${subName}-${Math.random().toString(36).substring(2, 5)}`) || `sub-${Math.random().toString(36).substring(2, 7)}`
                }
            });
            id = sub.id;
            await setCache(cacheKey, id, 3600);
        }
        subCatMap.set(pair, id);
    }

    // 3. Sous-sous-catégories (Level 3 - N3)
    const uniqueThirdCats = [...new Set(products.filter(p => p.category && (p.subCategory || p.subcategory1) && p.subcategory2).map(p => {
        const subName = p.subCategory || p.subcategory1;
        return `${p.category}|${subName}|${p.subcategory2}`;
    }))];

    const thirdCatMap = new Map<string, string>();
    for (const triple of uniqueThirdCats) {
        const [catName, subName, thirdName] = triple.split('|');
        const subCatId = subCatMap.get(`${catName}|${subName}`);
        if (!subCatId) continue;

        const cacheKey = `id:third:${subCatId}:${thirdName}`;
        let id = await getCache<string>(cacheKey);
        if (!id) {
            const third = await prisma.thirdLevelCategory.upsert({
                where: { name_subCategoryId: { name: thirdName, subCategoryId: subCatId } },
                update: {},
                create: {
                    name: thirdName,
                    subCategoryId: subCatId,
                    slug: slugify(`${catName}-${subName}-${thirdName}-${Math.random().toString(36).substring(2, 5)}`) || `third-${Math.random().toString(36).substring(2, 7)}`
                }
            });
            id = third.id;
            await setCache(cacheKey, id, 3600);
        }
        thirdCatMap.set(triple, id);
    }

    return { catMap, brandMap, subCatMap, thirdCatMap };
}

/**
 * Identifie les produits déjà présents en base pour éviter les doublons.
 */
async function getExistingProductsInBatch(products: ImportProduct[], catMap: Map<string, string>) {
    const references = [...new Set(products.map(p => p.reference?.trim()).filter(Boolean))] as string[];
    const categoryIds = [...new Set(products.map(p => catMap.get(p.category)).filter(Boolean))] as string[];

    // Fetch by references
    const existingByRef = references.length > 0 ? await prisma.product.findMany({
        where: { reference: { in: references } },
        select: { 
            id: true, 
            name: true, 
            categoryId: true, 
            price: true, 
            stock: true, 
            subCategoryId: true, 
            thirdLevelCategoryId: true, 
            brandId: true, 
            reference: true,
            isPublished: true,
            deactivationReason: true,
            restockPendingReview: true
        }
    }) : [];

    // Fetch by names and slugs to ensure we catch the products even if category differs
    const names = products.map(p => p.name?.trim()).filter(Boolean);
    const slugs = names.map(n => slugify(n)).filter(Boolean);

    const existingByName = names.length > 0 ? await prisma.product.findMany({
        where: { 
            OR: [
                { name: { in: names } },
                { slug: { in: slugs } }
            ]
        },
        select: { 
            id: true, 
            name: true, 
            categoryId: true, 
            price: true, 
            stock: true, 
            subCategoryId: true, 
            thirdLevelCategoryId: true, 
            brandId: true, 
            reference: true,
            isPublished: true,
            deactivationReason: true,
            restockPendingReview: true
        }
    }) : [];

    const existing = [...existingByRef, ...existingByName];

    const map = new Map<string, any>();
    for (const p of existing) {
        if (p.reference) {
            map.set(`ref:${p.reference}`, p);
        }
        // Key based on normalized name to allow matching across slightly different categories
        const normalizedName = p.name.toLowerCase().trim();
        map.set(`${normalizedName}`, p);
        // Also map by slug for extra safety
        const slugged = slugify(p.name);
        if (slugged) map.set(`${slugged}`, p);
    }
    return map;
}

async function requireAdmin() {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
        throw new Error('Accès non autorisé.');
    }
    return session;
}

export async function importProductsAction(products: ImportProduct[], skipRevalidate = false) {
    try {
        await requireAdmin();
        if (!products || products.length === 0) return { success: true, count: 0 };

        const { catMap, brandMap, subCatMap, thirdCatMap } = await getEntityIds(products);
        const existingMap = await getExistingProductsInBatch(products, catMap);

        const toCreate: any[] = [];
        const toUpdate: { id: string, data: any }[] = [];
        const restockNotificationsToTrigger: Array<{
            productId: string;
            productName: string;
            reference?: string | null;
            categoryName?: string | null;
            price: number;
            oldStock: number;
            newStock: number;
        }> = [];

        for (const p of products) {
            const catId = catMap.get(p.category);
            const subName = p.subCategory || p.subcategory1;
            const subId = (p.category && subName) ? subCatMap.get(`${p.category}|${subName}`) : null;
            const thirdId = (p.category && subName && p.subcategory2) ? thirdCatMap.get(`${p.category}|${subName}|${p.subcategory2}`) : null;
            const bId = p.brand ? brandMap.get(p.brand) : null;

            if (!catId) continue;

            const rawName = p.name || 'Produit sans nom';
            const name = rawName.trim();
            const normalizedName = name.toLowerCase();
            const sluggedName = slugify(name);
            const reference = p.reference?.trim() || null;
            
            // Try matching by reference first
            let ext = null;
            if (reference) {
                ext = existingMap.get(`ref:${reference}`);
            }
            
            // Fallback to name/slug match
            if (!ext) ext = existingMap.get(`${normalizedName}`);
            if (!ext && sluggedName) {
                ext = existingMap.get(`${sluggedName}`);
            }

            if (ext) {
                // --- MISE À JOUR SI CHANGEMENT ---
                const newPrice = Number(p.price) || 0;
                const newStock = Number(p.stock) || 0;

                const hasChanged = (
                    ext.price !== newPrice ||
                    ext.stock !== newStock ||
                    (reference && ext.reference !== reference)
                );

                if (process.env.NODE_ENV !== 'production') console.log(`[Import Debug] Prod: ${name} | RefExcel: ${reference} | RefDB: ${ext.reference} | Changed: ${hasChanged}`);

                if (hasChanged) {
                    const updateData: any = {
                        price: newPrice,
                        stock: newStock,
                        reference: reference || undefined,
                        updatedAt: new Date()
                    };

                    if (newStock <= 0) {
                        updateData.isPublished = false;
                        updateData.deactivationReason = 'OUT_OF_STOCK';
                        updateData.deactivatedAt = new Date();
                    } else if (ext.stock <= 0 && newStock > 0 && ext.deactivationReason === 'OUT_OF_STOCK') {
                        // Restocked: keep unpublished until admin validation
                        updateData.isPublished = false;
                        updateData.restockPendingReview = true;
                        updateData.restockedAt = new Date();
                        updateData.lastRestockedQty = newStock;

                        restockNotificationsToTrigger.push({
                            productId: ext.id,
                            productName: ext.name,
                            reference: ext.reference || reference || null,
                            categoryName: p.category || '',
                            price: newPrice,
                            oldStock: ext.stock,
                            newStock: newStock,
                        });
                    }

                    toUpdate.push({
                        id: ext.id,
                        data: updateData
                    });
                }
            } else {
                // --- CRÉATION ---
                const brandName = p.brand || '';
                const slugBase = slugify(`${name}-${brandName}`) || 'product';
                const initialStock = Number(p.stock) || 0;
                const isZeroStock = initialStock <= 0;

                toCreate.push({
                    reference: reference || null,
                    name,
                    slug: `${slugBase}-${Math.random().toString(36).substring(2, 7)}`,
                    description: p.description || '',
                    price: Number(p.price) || 0,
                    oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
                    stock: initialStock,
                    categoryId: catId,
                    subCategoryId: subId || null,
                    thirdLevelCategoryId: thirdId || null,
                    brandId: bId || null,
                    images: p.images ? (Array.isArray(p.images) ? p.images : p.images.split(',').map(img => img.trim())) : [],
                    videos: [],
                    storeId: p.metadata?.storeId || null,
                    isPublished: false,
                    deactivationReason: isZeroStock ? 'OUT_OF_STOCK' : null,
                    deactivatedAt: isZeroStock ? new Date() : null,
                    metadata: {
                        ...(p.metadata || {}),
                        importedAt: new Date().toISOString()
                    }
                });
            }
        }

        // Exécution des opérations
        if (toCreate.length > 0) {
            await prisma.product.createMany({
                data: toCreate,
                skipDuplicates: true
            });
        }

        if (toUpdate.length > 0) {
            // Pour éviter les timeouts et la surcharge des connexions à la base de données,
            // on effectue les mises à jour séquentiellement plutôt que dans une seule grosse transaction
            for (const item of toUpdate) {
                try {
                    await prisma.product.update({
                        where: { id: item.id },
                        data: item.data
                    });
                } catch (updateErr) {
                    console.error(`Erreur update produit ${item.id}:`, updateErr);
                }
            }
        }

        // Déclencher les notifications de réapprovisionnement de manière asynchrone
        if (restockNotificationsToTrigger.length > 0) {
            (async () => {
                for (const item of restockNotificationsToTrigger) {
                    try {
                        await sendRestockNotificationAsync(item);
                    } catch (notifErr) {
                        console.error('[Import] Erreur envoi notification restock:', notifErr);
                    }
                }
            })();
        }

        if (!skipRevalidate) {
            await Promise.all([
                invalidatePrefix('products:'),
                invalidatePrefix('categories:'),
                invalidatePrefix('brands:'),
                invalidatePrefix('similar:'),
                invalidatePrefix('admin:products:'),
                invalidatePrefix('admin:out-of-stock:'),
                invalidatePrefix('admin:dashboard:')
            ]);
            revalidatePath('/admin/products');
            revalidatePath('/admin/out-of-stock');
            revalidatePath('/boutique');
            revalidatePath('/nouveautes');
            revalidatePath('/');
        }

        return { success: true, count: toCreate.length + toUpdate.length };

    } catch (error: any) {
        console.error('[Import Error Detail]:', error);
        throw error;
    }
}

export async function addReviewAction(productId: string, rating: number, comment?: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, message: "Vous devez être connecté pour laisser un avis." };
        }

        // Validation stricte de la note (1 à 5 étoiles)
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return { success: false, message: "La note doit être comprise entre 1 et 5 étoiles." };
        }

        const cleanComment = comment ? String(comment).trim().slice(0, 2000) : null;

        // Vérifier si l'utilisateur a déjà laissé un avis sur ce produit
        const existingReview = await prisma.review.findFirst({
            where: {
                productId,
                userId: session.user.id
            }
        });

        if (existingReview) {
            return { success: false, message: "Vous avez déjà laissé un avis sur ce produit." };
        }

        await prisma.review.create({
            data: {
                productId,
                userId: session.user.id,
                rating,
                comment: cleanComment
            }
        });

        await invalidatePrefix(`product:${productId}`);
        revalidatePath(`/product/${productId}`);

        return { success: true, message: "Avis ajouté avec succès !" };
    } catch (error) {
        console.error("[Add Review Error]:", error);
        return { success: false, message: "Erreur lors de l'ajout de l'avis." };
    }
}

export async function voteReviewAction(reviewId: string, type: 'helpful' | 'unhelpful', productId?: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, message: "Vous devez être connecté pour voter pour un avis." };
        }

        const voteKey = `review_vote:${session.user.id}:${reviewId}`;
        const existingVote = await getCache<string>(voteKey);

        let updatedReview;

        if (existingVote === type) {
            // L'utilisateur reclique sur le même vote => Annulation (toggle off)
            updatedReview = await prisma.review.update({
                where: { id: reviewId },
                data: type === 'helpful' 
                    ? { helpfulCount: { decrement: 1 } }
                    : { unhelpfulCount: { decrement: 1 } },
                select: { helpfulCount: true, unhelpfulCount: true }
            });
            await invalidateCache(voteKey);

            if (productId) {
                await invalidatePrefix(`product:${productId}`);
                revalidatePath(`/product/${productId}`);
            }

            return { 
                success: true, 
                action: 'removed' as const, 
                userVote: null,
                helpfulCount: Math.max(0, updatedReview.helpfulCount),
                unhelpfulCount: Math.max(0, updatedReview.unhelpfulCount),
                message: "Votre vote a été retiré." 
            };
        }

        if (existingVote && existingVote !== type) {
            // L'utilisateur change son vote (ex: de helpful à unhelpful ou inversement)
            updatedReview = await prisma.review.update({
                where: { id: reviewId },
                data: type === 'helpful'
                    ? { helpfulCount: { increment: 1 }, unhelpfulCount: { decrement: 1 } }
                    : { helpfulCount: { decrement: 1 }, unhelpfulCount: { increment: 1 } },
                select: { helpfulCount: true, unhelpfulCount: true }
            });
            await setCache(voteKey, type, 86400 * 30);

            if (productId) {
                await invalidatePrefix(`product:${productId}`);
                revalidatePath(`/product/${productId}`);
            }

            return { 
                success: true, 
                action: 'changed' as const, 
                userVote: type,
                helpfulCount: Math.max(0, updatedReview.helpfulCount),
                unhelpfulCount: Math.max(0, updatedReview.unhelpfulCount),
                message: "Votre vote a été mis à jour." 
            };
        }

        // Nouveau vote
        updatedReview = await prisma.review.update({
            where: { id: reviewId },
            data: type === 'helpful'
                ? { helpfulCount: { increment: 1 } }
                : { unhelpfulCount: { increment: 1 } },
            select: { helpfulCount: true, unhelpfulCount: true }
        });

        await setCache(voteKey, type, 86400 * 30);

        if (productId) {
            await invalidatePrefix(`product:${productId}`);
            revalidatePath(`/product/${productId}`);
        }

        return { 
            success: true, 
            action: 'added' as const, 
            userVote: type,
            helpfulCount: Math.max(0, updatedReview.helpfulCount),
            unhelpfulCount: Math.max(0, updatedReview.unhelpfulCount),
            message: "Merci pour votre vote !" 
        };
    } catch (error: any) {
        console.error("[Vote Review Error]:", error);
        return { success: false, message: error?.message || "Erreur lors de l'enregistrement de votre vote." };
    }
}

export async function reportReviewAction(reviewId: string, reason: string, comment?: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, message: "Vous devez être connecté pour signaler un avis." };
        }

        // Check if user already reported this review
        const existingReport = await prisma.report.findFirst({
            where: {
                reviewId,
                userId: session.user.id
            }
        });

        if (existingReport) {
            return { success: false, message: "Vous avez déjà signalé cet avis." };
        }

        await prisma.report.create({
            data: {
                reason,
                comment,
                reviewId,
                userId: session.user.id
            }
        });

        return { success: true, message: "Signalement envoyé avec succès." };
    } catch (error) {
        console.error("[Report Review Error]:", error);
        return { success: false, message: "Erreur lors de l'envoi du signalement." };
    }
}

