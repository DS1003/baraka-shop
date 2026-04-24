'use server';

import prisma from '@/lib/prisma';
import { getCache, setCache, invalidatePrefix } from '@/lib/redis';
import { slugify } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import fs from 'fs/promises';
import path from 'path';

export async function getProductsAction(options: {
    query?: string;
    category?: string;
    brand?: string;
    store?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    page?: number;
    limit?: number;
    onSale?: boolean;
    isNew?: boolean;
} = {}) {
    const {
        query,
        category,
        brand,
        store,
        minPrice,
        maxPrice,
        sort = 'newest',
        page = 1,
        limit = 12,
        onSale = false,
        isNew = false
    } = options;

    const cacheKey = `products:${JSON.stringify(options)}`;
    const cached = await getCache<any>(cacheKey);
    if (cached) {
        console.log(`[Redis] Cache Hit for ${cacheKey}`);
        return cached;
    }

    const skip = (page - 1) * limit;

    try {
        // Construction du WHERE clause
        const where: any = {};

        if (query) {
            where.OR = [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
            ];
        }

        if (category) {
            where.category = { slug: category };
        }

        if (brand) {
            where.brand = { slug: brand };
        }

        if (store) {
            where.store = { slug: store };
        }

        if (isNew) {
            where.isNew = true;
        }

        if (onSale) {
            const now = new Date();
            where.AND = [
                { oldPrice: { not: null } },
                {
                    OR: [
                        { promotionId: null },
                        {
                            promotion: {
                                startDate: { lte: now },
                                endDate: { gte: now }
                            }
                        }
                    ]
                }
            ];
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {};
            if (minPrice !== undefined) where.price.gte = minPrice;
            if (maxPrice !== undefined) where.price.lte = maxPrice;
        }

        // Construction du SORT
        let orderBy: any = { createdAt: 'desc' };
        if (sort === 'price_asc') orderBy = { price: 'asc' };
        if (sort === 'price_desc') orderBy = { price: 'desc' };
        if (sort === 'oldest') orderBy = { createdAt: 'asc' };

        const [products, total] = await Promise.all([
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
        ]);

        const result = {
            products,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page,
                limit
            }
        };

        // Cache pendant 5 minutes pour les résultats de recherche/filtres
        await setCache(cacheKey, result, 300);

        return result;
    } catch (error) {
        console.error('[Get Products Error]:', error);
        return { products: [], pagination: { total: 0, pages: 0, currentPage: 1, limit } };
    }
}

export async function getProductByIdAction(id: string) {
    try {
        const cacheKey = `product:${id}`;
        const cached = await getCache<any>(cacheKey);
        if (cached) return cached;

        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                subCategory: true,
                thirdLevelCategory: true,
                brand: true,
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
        });

        if (product) {
            await setCache(cacheKey, product, 600); // 10 min cache
        }
        return product;
    } catch (error) {
        console.error('[Get Product By Id Error]:', error);
        return null;
    }
}

export async function getSimilarProductsAction(productId: string, categoryId: string, limit: number = 8) {
    try {
        const cacheKey = `similar:${productId}:${categoryId}:${limit}`;
        const cached = await getCache<any>(cacheKey);
        if (cached) return cached;

        const products = await prisma.product.findMany({
            where: {
                categoryId,
                id: { not: productId },
                stock: { gt: 0 }
            },
            include: {
                category: true,
                brand: true
            },
            take: limit,
            orderBy: { createdAt: 'desc' }
        });

        await setCache(cacheKey, products, 1800); // 30 min cache
        return products;
    } catch (error) {
        console.error('[Get Similar Products Error]:', error);
        return [];
    }
}

export async function getCategoriesAction() {
    try {
        const cacheKey = 'categories:all';
        const cached = await getCache<any>(cacheKey);
        if (cached) return cached;

        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { products: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        await setCache(cacheKey, categories, 3600); // 1h cache
        return categories;
    } catch (error) {
        return [];
    }
}

export async function getBrandsAction() {
    try {
        const cacheKey = 'brands:all';
        const cached = await getCache<any>(cacheKey);
        if (cached) return cached;

        const brands = await prisma.brand.findMany({
            include: {
                _count: {
                    select: { products: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        await setCache(cacheKey, brands, 3600); // 1h cache
        return brands;
    } catch (error) {
        return [];
    }
}

export async function getCategoryBySlugAction(slug: string) {
    try {
        const cacheKey = `category:${slug}`;
        const cached = await getCache<any>(cacheKey);
        if (cached) return cached;

        const category = await prisma.category.findUnique({
            where: { slug },
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });

        if (category) {
            await setCache(cacheKey, category, 3600);
        }
        return category;
    } catch (error) {
        return null;
    }
}

export async function getMegaMenuAction() {
    try {
        const cacheKey = 'megamenu:all';
        const cached = await getCache<any>(cacheKey);
        if (cached) {
            console.log('[Redis] Cache Hit for Mega Menu');
            return cached;
        }

        const categories = await prisma.category.findMany({
            include: {
                subCategories: {
                    include: {
                        thirdLevelCategories: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        await setCache(cacheKey, categories, 3600); // 1h cache
        return categories;
    } catch (error) {
        console.error('[Get Mega Menu Action Error]:', error);
        return [];
    }
}



interface ImportProduct {
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
    const pairs = [...new Set(products.map(p => ({
        name: p.name || 'Produit sans nom',
        categoryId: catMap.get(p.category)
    })).filter(x => x.categoryId).map(x => JSON.stringify(x)))].map(s => JSON.parse(s));

    if (pairs.length === 0) return new Map<string, any>();

    const existing = await prisma.product.findMany({
        where: { OR: pairs },
        select: { id: true, name: true, categoryId: true, price: true, stock: true, subCategoryId: true, thirdLevelCategoryId: true, brandId: true }
    });

    const map = new Map<string, any>();
    for (const p of existing) {
        map.set(`${p.name}|${p.categoryId}`, p);
    }
    return map;
}

export async function importProductsAction(products: ImportProduct[], skipRevalidate = false) {
    try {
        if (!products || products.length === 0) return { success: true, count: 0 };

        const { catMap, brandMap, subCatMap, thirdCatMap } = await getEntityIds(products);
        const existingMap = await getExistingProductsInBatch(products, catMap);

        const toCreate: any[] = [];
        const toUpdate: { id: string, data: any }[] = [];

        for (const p of products) {
            const catId = catMap.get(p.category);
            const subName = p.subCategory || p.subcategory1;
            const subId = (p.category && subName) ? subCatMap.get(`${p.category}|${subName}`) : null;
            const thirdId = (p.category && subName && p.subcategory2) ? thirdCatMap.get(`${p.category}|${subName}|${p.subcategory2}`) : null;
            const bId = p.brand ? brandMap.get(p.brand) : null;

            if (!catId) continue;

            const name = p.name || 'Produit sans nom';
            const identity = `${name}|${catId}`;
            const ext = existingMap.get(identity);

            if (ext) {
                // --- MISE À JOUR SI CHANGEMENT ---
                const newPrice = Number(p.price) || 0;
                const newStock = Number(p.stock) || 0;

                if (
                    ext.price !== newPrice ||
                    ext.stock !== newStock ||
                    ext.subCategoryId !== (subId || null) ||
                    ext.thirdLevelCategoryId !== (thirdId || null) ||
                    ext.brandId !== (bId || null)
                ) {
                    toUpdate.push({
                        id: ext.id,
                        data: {
                            price: newPrice,
                            stock: newStock,
                            subCategoryId: subId || null,
                            thirdLevelCategoryId: thirdId || null,
                            brandId: bId || null,
                            updatedAt: new Date()
                        }
                    });
                }
            } else {
                // --- CRÉATION ---
                const brandName = p.brand || '';
                const slugBase = slugify(`${name}-${brandName}`) || 'product';

                toCreate.push({
                    name,
                    slug: `${slugBase}-${Math.random().toString(36).substring(2, 7)}`,
                    description: p.description || '',
                    price: Number(p.price) || 0,
                    oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
                    stock: Number(p.stock) || 0,
                    categoryId: catId,
                    subCategoryId: subId || null,
                    thirdLevelCategoryId: thirdId || null,
                    brandId: bId || null,
                    images: p.images ? (Array.isArray(p.images) ? p.images : p.images.split(',').map(img => img.trim())) : [],
                    storeId: p.metadata?.storeId || null,
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
            // Pour les mises à jour, on traite par petits lots dans la transaction pour la stabilité
            await prisma.$transaction(
                toUpdate.map(item => prisma.product.update({
                    where: { id: item.id },
                    data: item.data
                }))
            );
        }

        if (!skipRevalidate) {
            await Promise.all([
                invalidatePrefix('products:'),
                invalidatePrefix('categories:'),
                invalidatePrefix('brands:')
            ]);
            revalidatePath('/admin/products');
        }

        return { success: true, count: toCreate.length + toUpdate.length };

    } catch (error: any) {
        console.error('[Import Error Detail]:', error);
        throw error;
    }
}
