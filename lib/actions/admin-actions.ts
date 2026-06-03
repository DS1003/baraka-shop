'use server';
// PROXY REFRESH 2
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

import { revalidatePath } from 'next/cache';
import { invalidatePrefix, invalidateCache } from '@/lib/redis';

export async function getDashboardStats(period: string = 'ALL') {
    try {
        const orderWhereClause: any = {};
        const now = new Date();
        
        if (period === '7D') {
            const dateLimit = new Date();
            dateLimit.setDate(now.getDate() - 7);
            orderWhereClause.createdAt = { gte: dateLimit };
        } else if (period === '30D') {
            const dateLimit = new Date();
            dateLimit.setDate(now.getDate() - 30);
            orderWhereClause.createdAt = { gte: dateLimit };
        } else if (period === 'THIS_MONTH') {
            const dateLimit = new Date(now.getFullYear(), now.getMonth(), 1);
            orderWhereClause.createdAt = { gte: dateLimit };
        } else if (period === 'THIS_YEAR') {
            const dateLimit = new Date(now.getFullYear(), 0, 1);
            orderWhereClause.createdAt = { gte: dateLimit };
        }

        const [orders, customers, products, reviews] = await Promise.all([
            prisma.order.findMany({
                where: orderWhereClause,
                include: { items: true }
            }),
            prisma.user.count({ where: { role: 'USER' } }),
            prisma.product.count(),
            prisma.review.count()
        ]);

        const totalRevenue = orders.reduce((acc: number, order: any) => acc + order.total, 0);
        const orderCount = orders.length;
        const avgBasket = orderCount > 0 ? totalRevenue / orderCount : 0;

        // Dynamic trends based on period
        const stats = {
            revenue: {
                total: totalRevenue,
                trend: period === 'ALL' ? "+12.5%" : (period === '7D' ? "7 derniers jours" : "Période sélectionnée"),
                lastMonth: totalRevenue * 0.9,
            },
            orders: {
                total: orderCount,
                trend: period === 'ALL' ? "+8.2%" : "Commandes reçues",
            },
            customers: {
                total: customers,
                trend: "+15.3%",
            },
            avgBasket: {
                total: avgBasket,
                trend: "+4.1%",
            }
        };

        // Revenue history based on period
        let historyLength = 7;
        if (period === '30D') historyLength = 30;
        else if (period === '7D') historyLength = 7;
        else if (period === 'THIS_MONTH') {
            historyLength = now.getDate(); // du 1er au jour actuel
        } else if (period === 'THIS_YEAR') {
            historyLength = 12; // par mois
        }

        let revenueHistory = [];
        if (period === 'THIS_YEAR') {
            revenueHistory = Array.from({ length: 12 }, (_, i) => {
                const monthOrders = orders.filter((o: any) => o.createdAt.getMonth() === i && o.createdAt.getFullYear() === now.getFullYear());
                const monthName = new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(new Date(now.getFullYear(), i, 1));
                return {
                    name: monthName.toUpperCase(),
                    value: monthOrders.reduce((acc: number, o: any) => acc + o.total, 0)
                };
            });
        } else {
            const days = Array.from({ length: historyLength }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (historyLength - 1 - i));
                return d.toISOString().split('T')[0];
            });

            revenueHistory = days.map(date => {
                const dayOrders = orders.filter((o: any) => o.createdAt.toISOString().split('T')[0] === date);
                return {
                    name: new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric' }).format(new Date(date)),
                    value: dayOrders.reduce((acc: number, o: any) => acc + o.total, 0)
                };
            });
        }

        return { stats, revenueHistory };
    } catch (error) {
        console.error("Dashboard stats error:", error);
        return { stats: null, revenueHistory: [] };
    }
}

export async function getCategoryStats() {
    try {
        const [l1, l2, l3, products, stores] = await Promise.all([
            prisma.category.count(),
            (prisma as any).subCategory.count(),
            (prisma as any).thirdLevelCategory.count(),
            prisma.product.count(),
            prisma.store.count()
        ]);

        return {
            l1,
            l2,
            l3,
            products,
            stores
        };
    } catch (error) {
        console.error("Category stats error:", error);
        return { l1: 0, l2: 0, l3: 0, products: 0, stores: 0 };
    }
}

export async function getStoreStats() {
    try {
        const [stores, productWithStore] = await Promise.all([
            prisma.store.count(),
            prisma.product.count({ where: { storeId: { not: null } } })
        ]);
        return { stores, productWithStore };
    } catch (error) {
        return { stores: 0, productWithStore: 0 };
    }
}

export async function getAdminStores() {
    try {
        // Safe check: if the main prisma instance is broken, try to use it via any
        const p = prisma as any;
        if (!p.store) {
            console.error("CRITICAL: prisma.store is undefined in getAdminStores");
            // Last resort: try to fetch using a raw query if everything else fails
            // but let's try to just return [] to avoid crash and log keys
            return [];
        }

        return await p.store.findMany({
            include: {
                _count: {
                    select: { products: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        console.error("GET_ADMIN_STORES_ERROR:", error);
        return [];
    }
}

export async function upsertStore(data: any, id?: string) {
    try {
        if (id) {
            await prisma.store.update({
                where: { id },
                data
            });
        } else {
            // Check for existing name or slug to give better error
            const existing = await prisma.store.findFirst({
                where: {
                    OR: [
                        { name: data.name },
                        { slug: data.slug }
                    ]
                }
            });

            if (existing) {
                return { 
                    success: false, 
                    message: `Une boutique avec le nom "${data.name}" existe déjà.` 
                };
            }

            await prisma.store.create({
                data
            });
        }
        revalidatePath('/admin/stores');
        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        console.error("Upsert store error:", error);
        return { 
            success: false, 
            message: error.message || "Erreur lors de la sauvegarde. Vérifiez que le nom est unique." 
        };
    }
}

export async function deleteStore(id: string) {
    try {
        const productCount = await prisma.product.count({ where: { storeId: id } });
        if (productCount > 0) {
            return { success: false, message: "La boutique contient des produits." };
        }
        await prisma.store.delete({ where: { id } });
        revalidatePath('/admin/stores');
        return { success: true };
    } catch (error) {
        return { success: false, message: "Erreur serveur." };
    }
}

export async function getAdminProducts(
    query?: string,
    page = 1,
    pageSize = 20,
    filters?: {
        categoryId?: string;
        subCategoryId?: string;
        thirdLevelCategoryId?: string;
        brandId?: string;
        stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock';
        publishStatus?: 'published' | 'hidden';
    }
) {
    try {
        const skip = (page - 1) * pageSize;
        const where: any = {};
        const andFilters: any[] = [];

        if (query) {
            andFilters.push({
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                    { reference: { contains: query, mode: 'insensitive' } },
                    { brand: { name: { contains: query, mode: 'insensitive' } } }
                ]
            });
        }

        if (filters?.categoryId) {
            andFilters.push({ categoryId: filters.categoryId });
        }

        if (filters?.subCategoryId) {
            andFilters.push({ subCategoryId: filters.subCategoryId });
        }

        if (filters?.thirdLevelCategoryId) {
            andFilters.push({ thirdLevelCategoryId: filters.thirdLevelCategoryId });
        }

        if (filters?.brandId) {
            andFilters.push({ brandId: filters.brandId });
        }

        if (filters?.stockStatus) {
            if (filters.stockStatus === 'in_stock') {
                andFilters.push({ stock: { gt: 10 } });
            } else if (filters.stockStatus === 'low_stock') {
                andFilters.push({ stock: { gt: 0, lt: 10 } });
            } else if (filters.stockStatus === 'out_of_stock') {
                andFilters.push({ stock: 0 });
            }
        }

        if (filters?.publishStatus) {
            if (filters.publishStatus === 'published') {
                andFilters.push({ isPublished: true });
            } else if (filters.publishStatus === 'hidden') {
                andFilters.push({ isPublished: false });
            }
        }

        if (andFilters.length > 0) {
            where.AND = andFilters;
        }

        // Stats should be global-ish based on the SEARCH but not pagination
        const [total, activeCount, lowStockCount, categoriesCount] = await Promise.all([
            prisma.product.count({ where }),
            prisma.product.count({ where: { ...where, stock: { gt: 0 } } }),
            prisma.product.count({ where: { ...where, stock: { gt: 0, lt: 10 } } }),
            prisma.category.count()
        ]);

        const products = await prisma.product.findMany({
            where,
            include: {
                category: true,
                brand: true,
                subCategory: true,
                thirdLevelCategory: true,
                store: true,
                colorVariants: {
                    orderBy: { position: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: pageSize,
            skip: skip
        });

        let finalProducts = products || [];
        if (finalProducts.length === 0 && !query && (!filters || Object.keys(filters).length === 0)) {
            // Check if there's REALLY something in the DB
            const rawCount = await prisma.product.count();
            if (rawCount > 0) {
                finalProducts = [{
                    id: 'debug-id',
                    name: `⚠️ SYNC ISSUE: ${rawCount} items in DB, but query returned 0. Try refreshing or clearing filters.`,
                    price: 0,
                    stock: 0,
                    category: { name: 'DEBUG' }
                }] as any;
            }
        }

        return {
            products: finalProducts,
            total: total || (finalProducts.length > 1 ? total : 0),
            stats: { activeCount, lowStockCount, categoriesCount }
        };
    } catch (error: any) {
        console.error("ADMIN FETCH PRODUCTS ERROR:", error);
        return {
            products: [],
            total: 0,
            stats: { activeCount: 0, lowStockCount: 0, categoriesCount: 0 }
        };
    }
}

export async function getAdminOrders(status?: string) {
    try {
        const orders = await prisma.order.findMany({
            where: status ? { status } : {},
            include: {
                user: true,
                items: {
                    include: { product: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return orders;
    } catch (error) {
        console.error("Fetch orders error:", error);
        return [];
    }
}

export async function getAdminCategories() {
    try {
        const categories = await prisma.category.findMany({
            include: {
                subCategories: {
                    select: { name: true, id: true },
                    take: 5
                },
                _count: {
                    select: { products: true, subCategories: true }
                }
            }
        });
        return categories;
    } catch (error) {
        console.error("Fetch categories error:", error);
        return [];
    }
}

export async function updateOrderStatus(orderId: string, status: string) {
    try {
        await prisma.order.update({
            where: { id: orderId },
            data: { status }
        });
        revalidatePath('/admin/orders');
        return { success: true };
    } catch (error) {
        console.error("Update order error:", error);
        return { success: false };
    }
}

export async function updateProductStock(productId: string, stock: number) {
    try {
        await prisma.product.update({
            where: { id: productId },
            data: { stock }
        });
        revalidatePath('/admin/inventory');
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

export async function getCategoryRevenue() {
    try {
        const categories = await prisma.category.findMany({
            include: {
                products: {
                    include: {
                        orderItems: true
                    }
                }
            }
        });

        const distribution = categories.map((cat: any) => {
            const revenue = cat.products.reduce((acc: number, prod: any) => {
                return acc + prod.orderItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
            }, 0);
            return {
                name: cat.name,
                value: revenue
            };
        }).filter((d: any) => d.value > 0);

        return distribution;
    } catch (error) {
        return [];
    }
}

export async function getRecentActivity() {
    try {
        const [recentOrders, recentUsers] = await Promise.all([
            prisma.order.findMany({
                take: 5,
                include: { user: true },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.user.findMany({
                take: 5,
                where: { role: 'USER' },
                orderBy: { createdAt: 'desc' }
            })
        ]);

        const activities = [
            ...recentOrders.map((o: any) => ({
                id: o.id,
                type: 'ORDER' as const,
                title: `Nouvelle commande de ${o.user.username || o.user.email}`,
                time: o.createdAt,
                amount: o.total
            })),
            ...recentUsers.map((u: any) => ({
                id: u.id,
                type: 'USER' as const,
                title: `Nouvelle inscription : ${u.username || u.email}`,
                time: u.createdAt,
                amount: null
            }))
        ].sort((a: any, b: any) => b.time.getTime() - a.time.getTime()).slice(0, 8);

        return activities;
    } catch (error) {
        return [];
    }
}

export async function getAdminCustomers(query?: string, segment: string = 'all') {
    try {
        const whereClause: any = { role: 'USER' };

        if (query) {
            whereClause.OR = [
                { username: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
                { phone: { contains: query, mode: 'insensitive' } }
            ];
        }

        if (segment === 'vip') {
            // Clients avec > 5 commandes
            whereClause.orders = { some: {} }; // At least one to satisfy basic relation check before counting below if Prisma doesn't support direct relation count filtering for MySQL/PG differences, but Prisma usually does or we filter post-query.
            // Since Prisma relation filtering on count is tricky in some versions without extended features, we might need a different approach or just filter in memory for 'vip'.
            // Actually, in Prisma we usually do: `orders: { _count: { gt: 5 } }` (requires preview feature in some versions) but we'll fetch all and filter if it's not huge, or we can use raw.
        }

        const customers = await prisma.user.findMany({
            where: whereClause,
            include: {
                _count: {
                    select: { orders: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Appliquer les filtres de relations complexes en mémoire pour éviter les soucis de compatibilité Prisma
        let filteredCustomers = customers;

        if (segment === 'vip') {
            filteredCustomers = customers.filter(c => c._count.orders > 5);
        } else if (segment === 'active') {
            filteredCustomers = customers.filter(c => c._count.orders > 0);
        } else if (segment === 'inactive') {
            filteredCustomers = customers.filter(c => c._count.orders === 0);
        } else if (segment === 'new') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            filteredCustomers = customers.filter(c => new Date(c.createdAt) >= thirtyDaysAgo);
        }

        return filteredCustomers;
    } catch (error) {
        console.error("Fetch customers error:", error);
        return [];
    }
}

// ==========================================
// PROMOTIONS ACTIONS (CAMPAIGNS)
// ==========================================

export async function getAdminPromotions(query?: string) {
    try {
        const whereClause: any = {};
        if (query) {
            whereClause.name = { contains: query, mode: 'insensitive' };
        }

        const promotions = await prisma.promotion.findMany({
            where: whereClause,
            include: {
                _count: {
                    select: { products: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return promotions;
    } catch (error) {
        console.error("Fetch promotions error:", error);
        return [];
    }
}

export async function createPromotion(data: { name: string, description?: string, startDate: Date, endDate: Date, discountPercentage: number }) {
    try {
        const promotion = await prisma.promotion.create({ data });
        revalidatePath('/admin/promotions');
        revalidatePath('/promotions');
        return { success: true, promotion };
    } catch (error: any) {
        console.error("Create promotion error:", error);
        return { success: false, message: error.message };
    }
}

export async function updatePromotion(id: string, data: { name?: string, description?: string, startDate?: Date, endDate?: Date, discountPercentage?: number, isActive?: boolean }) {
    try {
        const promotion = await prisma.promotion.update({
            where: { id },
            data,
        });

        // If discount changed, update all linked products
        if (data.discountPercentage !== undefined) {
            const linkedProducts = await prisma.product.findMany({ where: { promotionId: id } });
            for (const prod of linkedProducts) {
                if (prod.oldPrice) {
                    const newPrice = prod.oldPrice - (prod.oldPrice * (data.discountPercentage / 100));
                    await prisma.product.update({
                        where: { id: prod.id },
                        data: { price: newPrice }
                    });
                }
            }
        }

        revalidatePath('/admin/promotions');
        revalidatePath('/promotions');
        revalidatePath('/boutique');
        return { success: true, promotion };
    } catch (error: any) {
        console.error("Update promotion error:", error);
        return { success: false, message: error.message };
    }
}

export async function deletePromotion(id: string) {
    try {
        // First restore all linked products' prices
        const linkedProducts = await prisma.product.findMany({ where: { promotionId: id } });
        for (const prod of linkedProducts) {
            if (prod.oldPrice) {
                await prisma.product.update({
                    where: { id: prod.id },
                    data: { price: prod.oldPrice, oldPrice: null, promotionId: null }
                });
            }
        }

        // Then delete the campaign
        await prisma.promotion.delete({ where: { id } });

        revalidatePath('/admin/promotions');
        revalidatePath('/promotions');
        revalidatePath('/boutique');
        return { success: true };
    } catch (error: any) {
        console.error("Delete promotion error:", error);
        return { success: false, message: "Impossible de supprimer la campagne." };
    }
}

export async function searchProductsForPromo(query: string) {
    if (!query || query.length < 2) return [];

    try {
        return await prisma.product.findMany({
            where: {
                name: { contains: query, mode: 'insensitive' },
                promotionId: null // Seulement les produits sans promotion active
            },
            take: 5,
            select: { id: true, name: true, price: true, oldPrice: true, images: true }
        });
    } catch (error) {
        return [];
    }
}

export async function getPromotionProducts(promotionId: string) {
    try {
        return await prisma.product.findMany({
            where: { promotionId },
            include: { brand: true, category: true }
        });
    } catch (error) {
        return [];
    }
}

export async function addProductToPromo(productId: string, promotionId: string) {
    try {
        const product = await prisma.product.findUnique({ where: { id: productId } });
        const promotion = await prisma.promotion.findUnique({ where: { id: promotionId } });

        if (!product || !promotion) throw new Error("Produit ou Promotion introuvable");

        const alreadyOldPrice = product.oldPrice || product.price;
        const discountAmount = alreadyOldPrice * (promotion.discountPercentage / 100);
        const newPrice = alreadyOldPrice - discountAmount;

        await prisma.product.update({
            where: { id: productId },
            data: {
                promotionId: promotionId,
                oldPrice: alreadyOldPrice,
                price: newPrice
            }
        });

        revalidatePath('/admin/promotions');
        revalidatePath('/boutique');
        return { success: true };
    } catch (error: any) {
        console.error("Add to promo error:", error);
        return { success: false, message: error.message };
    }
}

export async function removeProductFromPromo(productId: string) {
    try {
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product || !product.oldPrice) throw new Error("Produit non valide");

        await prisma.product.update({
            where: { id: productId },
            data: {
                price: product.oldPrice,
                oldPrice: null,
                promotionId: null
            }
        });

        revalidatePath('/admin/promotions');
        revalidatePath('/boutique');
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function deleteBulkProducts(ids: string[]) {
    try {
        await prisma.product.deleteMany({
            where: {
                id: {
                    in: ids
                }
            }
        });
        revalidatePath('/admin/inventory');
        return { success: true };
    } catch (error) {
        console.error("Delete bulk products error:", error);
        return { success: false, message: "Impossible de supprimer les produits sélectionnés." };
    }
}

export async function deleteProduct(id: string) {
    try {
        await prisma.product.delete({
            where: { id }
        });
        revalidatePath('/admin/inventory');
        return { success: true };
    } catch (error) {
        console.error("Delete product error:", error);
        return { success: false, message: "Impossible de supprimer le produit." };
    }
}

export async function deleteAllProducts() {
    try {
        await prisma.product.deleteMany({});
        revalidatePath('/admin/inventory');
        return { success: true };
    } catch (error) {
        console.error("Delete all products error:", error);
        return { success: false, message: "Impossible de vider le catalogue." };
    }
}

export async function updateProduct(id: string, data: any) {
    try {
        const product = await prisma.product.update({
            where: { id },
            data,
        });

        revalidatePath('/admin/promotions');
        revalidatePath('/boutique');
        return { success: true, product };
    } catch (error) {
        console.error("Update product error:", error);
        return { success: false, message: "Erreur lors de la modification du produit" };
    }
}

export async function deleteCategory(id: string) {
    try {
        const productCount = await prisma.product.count({ where: { categoryId: id } });
        if (productCount > 0) {
            return { success: false, message: "La catégorie contient des produits." };
        }
        await prisma.category.delete({ where: { id } });
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (error) {
        return { success: false, message: "Erreur serveur." };
    }
}

export async function deleteCustomer(id: string) {
    try {
        const orderCount = await prisma.order.count({ where: { userId: id } });
        if (orderCount > 0) {
            return { success: false, message: "Le client a des commandes actives." };
        }
        await prisma.user.delete({ where: { id } });
        revalidatePath('/admin/customers');
        return { success: true };
    } catch (error) {
        return { success: false, message: "Erreur serveur." };
    }
}

export async function getAdminBrands() {
    try {
        return await prisma.brand.findMany({
            include: {
                _count: {
                    select: { products: true }
                }
            },
            orderBy: { name: 'asc' }
        });
    } catch (error) {
        return [];
    }
}

export async function upsertBrand(data: any, id?: string) {
    try {
        if (id) {
            await prisma.brand.update({
                where: { id },
                data
            });
        } else {
            await prisma.brand.create({
                data
            });
        }
        await invalidatePrefix('brands:');
        revalidatePath('/admin/brands');
        revalidatePath('/');
        revalidatePath('/marques');
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

export async function deleteBrand(id: string) {
    try {
        const productCount = await prisma.product.count({ where: { brandId: id } });
        if (productCount > 0) {
            return { success: false, message: "La marque contient des produits." };
        }
        await prisma.brand.delete({ where: { id } });
        await invalidatePrefix('brands:');
        revalidatePath('/admin/brands');
        revalidatePath('/');
        revalidatePath('/marques');
        return { success: true };
    } catch (error) {
        return { success: false, message: "Erreur serveur." };
    }
}

export async function getSubCategories(categoryId?: string) {
    try {
        return await (prisma as any).subCategory.findMany({
            where: categoryId ? { categoryId } : {},
            include: {
                _count: {
                    select: { products: true, thirdLevelCategories: true }
                }
            },
            orderBy: { name: 'asc' }
        });
    } catch (error) {
        return [];
    }
}

export async function upsertSubCategory(data: any, id?: string) {
    try {
        if (id) {
            await prisma.subCategory.update({
                where: { id },
                data
            });
        } else {
            await (prisma as any).subCategory.create({
                data
            });
        }
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

export async function deleteSubCategory(id: string) {
    try {
        const productCount = await prisma.product.count({ where: { subCategoryId: id } });
        if (productCount > 0) {
            return { success: false, message: "La sous-catégorie contient des produits." };
        }
        const l3Count = await (prisma as any).thirdLevelCategory.count({ where: { subCategoryId: id } });
        if (l3Count > 0) {
            return { success: false, message: "Cette catégorie contient des sous-sous-catégories." };
        }
        await prisma.subCategory.delete({ where: { id } });
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

export async function getThirdLevelCategories(subCategoryId?: string) {
    try {
        return await (prisma as any).thirdLevelCategory.findMany({
            where: subCategoryId ? { subCategoryId } : {},
            include: {
                _count: {
                    select: { products: true }
                }
            },
            orderBy: { name: 'asc' }
        });
    } catch (error) {
        return [];
    }
}

export async function upsertThirdLevelCategory(data: any, id?: string) {
    try {
        if (id) {
            await (prisma as any).thirdLevelCategory.update({
                where: { id },
                data
            });
        } else {
            await (prisma as any).thirdLevelCategory.create({
                data
            });
        }
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

export async function deleteThirdLevelCategory(id: string) {
    try {
        const productCount = await prisma.product.count({ where: { thirdLevelCategoryId: id } as any });
        if (productCount > 0) {
            return { success: false, message: "Cette catégorie contient des produits." };
        }
        await (prisma as any).thirdLevelCategory.delete({ where: { id } });
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

export async function upsertProduct(data: any, id?: string) {
    try {
        const { 
            categoryId, subCategoryId, thirdLevelCategoryId, brandId, storeId, promotionId,
            colorVariants,
            ...rest 
        } = data;

        const prismaData: any = { ...rest };

        if (categoryId) prismaData.category = { connect: { id: categoryId } };
        
        if (subCategoryId) prismaData.subCategory = { connect: { id: subCategoryId } };
        else if (subCategoryId === null && id) prismaData.subCategory = { disconnect: true };

        if (thirdLevelCategoryId) prismaData.thirdLevelCategory = { connect: { id: thirdLevelCategoryId } };
        else if (thirdLevelCategoryId === null && id) prismaData.thirdLevelCategory = { disconnect: true };

        if (brandId) prismaData.brand = { connect: { id: brandId } };
        else if (brandId === null && id) prismaData.brand = { disconnect: true };

        if (storeId) prismaData.store = { connect: { id: storeId } };
        else if (storeId === null && id) prismaData.store = { disconnect: true };

        if (promotionId) prismaData.promotion = { connect: { id: promotionId } };
        else if (promotionId === null && id) prismaData.promotion = { disconnect: true };

        let product;
        if (id) {
            console.log(`[AdminAction] Updating product: ${id}`);
            product = await prisma.product.update({
                where: { id },
                data: prismaData,
            });
        } else {
            console.log(`[AdminAction] Creating new product: ${rest.name}`);
            product = await prisma.product.create({
                data: prismaData,
            });
        }

        // Handle color variants (delete-and-recreate strategy)
        if (colorVariants !== undefined) {
            // Delete existing variants
            await (prisma as any).productColorVariant.deleteMany({
                where: { productId: product.id }
            });

            // Create new variants
            if (Array.isArray(colorVariants) && colorVariants.length > 0) {
                await (prisma as any).productColorVariant.createMany({
                    data: colorVariants.map((cv: any, idx: number) => ({
                        colorName: cv.colorName,
                        colorHex: cv.colorHex,
                        images: cv.images || [],
                        productId: product.id,
                        position: idx,
                    }))
                });
            }
        }
        
        // Invalider le cache Redis
        try {
            if (id) {
                console.log(`[Redis] Invalidating cache for product: ${id}`);
                await invalidateCache(`product:${id}`);
                await invalidatePrefix('similar:');
            }
            await invalidatePrefix('products:');
        } catch (redisError) {
            console.warn("[Redis] Cache invalidation failed (non-blocking):", redisError);
        }

        // Revalidation ciblée (plus performant que '/' layout)
        console.log(`[AdminAction] Revalidating paths...`);
        revalidatePath('/admin/products');
        revalidatePath('/boutique');
        revalidatePath(`/product/${product.id}`);
        revalidatePath('/');
        
        console.log(`[AdminAction] Success!`);
        return { success: true, product };
    } catch (error) {
        console.error("Upsert product error:", error);
        return { success: false, message: "Erreur lors de l'enregistrement du produit" };
    }
}

export async function upsertCategory(data: any, id?: string) {
    try {
        if (id) {
            await prisma.category.update({
                where: { id },
                data
            });
        } else {
            await prisma.category.create({
                data
            });
        }
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (error) {
        console.error("Upsert category error:", error);
        return { success: false };
    }
}

export async function getAdminNotifications() {
    return [
        { id: 1, type: 'ORDER', title: 'Nouvelle commande #BAR-902', time: 'il y a 2 min', read: false },
        { id: 2, type: 'STOCK', title: 'Alerte stock : Abaya Silk', time: 'il y a 10 min', read: false },
        { id: 3, type: 'USER', title: 'Nouveau client : Amadou Fall', time: 'il y a 45 min', read: true },
    ];
}

export async function bulkUpdateOrderStatuses(orderIds: string[], status: string) {
    try {
        await prisma.order.updateMany({
            where: { id: { in: orderIds } },
            data: { status }
        });
        revalidatePath('/admin/orders');
        return { success: true };
    } catch (error) {
        console.error("Bulk update order statuses error:", error);
        return { success: false };
    }
}

export async function createCustomer(data: any) {
    try {
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (existingUser) {
            return { success: false, message: "Cet email est déjà utilisé." };
        }

        const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : undefined;

        await prisma.user.create({
            data: {
                username: data.username,
                email: data.email,
                password: hashedPassword,
                phone: data.phone,
                address: data.address,
                role: 'USER'
            }
        });
        revalidatePath('/admin/customers');
        return { success: true };
    } catch (error) {
        console.error("Create customer error:", error);
        return { success: false, message: "Erreur serveur lors de la création du client." };
    }
}

export async function updateCustomer(id: string, data: any) {
    try {
        if (data.email) {
            const existingUser = await prisma.user.findUnique({
                where: { email: data.email }
            });
            if (existingUser && existingUser.id !== id) {
                return { success: false, message: "Cet email est déjà utilisé par un autre compte." };
            }
        }

        const updateData: any = {
            username: data.username,
            email: data.email,
            phone: data.phone,
            address: data.address,
        };

        if (data.password && data.password.trim() !== "") {
            updateData.password = await bcrypt.hash(data.password, 10);
        }

        await prisma.user.update({
            where: { id },
            data: updateData
        });

        revalidatePath('/admin/customers');
        return { success: true };
    } catch (error) {
        console.error("Update customer error:", error);
        return { success: false, message: "Erreur serveur lors de la mise à jour du client." };
    }
}

// ==========================================
// POPULAR UNIVERSES ACTIONS
// ==========================================

export async function getPopularUniverses() {
    try {
        return await (prisma as any).popularUniverse.findMany({
            orderBy: { order: 'asc' }
        });
    } catch (error) {
        console.error("Fetch popular universes error:", error);
        return [];
    }
}

export async function upsertPopularUniverse(data: any, id?: string) {
    try {
        if (id) {
            await (prisma as any).popularUniverse.update({
                where: { id },
                data
            });
        } else {
            await (prisma as any).popularUniverse.create({
                data
            });
        }
        revalidatePath('/admin/popular-universes');
        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        console.error("Upsert popular universe error:", error);
        return { success: false, message: error.message };
    }
}

export async function deletePopularUniverse(id: string) {
    try {
        await (prisma as any).popularUniverse.delete({ where: { id } });
        revalidatePath('/admin/popular-universes');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Delete popular universe error:", error);
        return { success: false, message: "Erreur serveur." };
    }
}
export async function initializePopularUniverses() {
    const DEFAULT_UNIVERSES = [
        { name: 'BATTERIE', subtitle: 'Externes & Internes', href: '/category/batterie', order: 0 },
        { name: 'CHARGEUR', subtitle: 'Secteur & Induction', href: '/category/chargeur', order: 1 },
        { name: 'CONNECTIQUE', subtitle: 'Adaptateurs & Hubs', href: '/category/connectique', order: 2 },
        { name: 'CONSOMMABLES', subtitle: 'Encre & Papier', href: '/category/consommables', order: 3 },
        { name: 'ELECTRONIQUE', subtitle: 'Composants & Gadgets', href: '/category/electronique', order: 4 },
        { name: 'GÉNÉRAL', subtitle: 'Univers High-Tech', href: '/category/general', order: 5 },
        { name: 'IMAGE & SON', subtitle: 'TV, Casques & Caméras', href: '/category/image-son', order: 6 },
        { name: 'INFORMATIQUE', subtitle: 'MacBook, PC & Portables', href: '/category/informatique', order: 7 }
    ];

    try {
        const count = await (prisma as any).popularUniverse.count();
        if (count > 0) return { success: false, message: "La table n'est pas vide." };

        for (const uni of DEFAULT_UNIVERSES) {
            await (prisma as any).popularUniverse.create({ data: uni });
        }

        revalidatePath('/admin/popular-universes');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Initialize popular universes error:", error);
        return { success: false, message: "Erreur serveur." };
    }
}

// ==========================================
// HOME PROMOS ACTIONS
// ==========================================

export async function getHomePromos() {
    try {
        return await (prisma as any).homePromo.findMany({
            orderBy: { order: 'asc' }
        });
    } catch (error) {
        return [];
    }
}

export async function upsertHomePromo(data: any, id?: string) {
    try {
        if (id) {
            await (prisma as any).homePromo.update({ where: { id }, data });
        } else {
            await (prisma as any).homePromo.create({ data });
        }
        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function deleteHomePromo(id: string) {
    try {
        await (prisma as any).homePromo.delete({ where: { id } });
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

export async function initializeHomePromos() {
    const DEFAULT_PROMOS = [
        {
            badge: "Exclusivité",
            title: "Pack Gaming Ultimate",
            subtitle: "PS5 + 2 Jeux + Manette",
            price: "499.000 CFA",
            image: "https://media.ldlc.com/encart/p/26671_b.jpg",
            bg: "bg-[#F8FAFC]",
            border: "border-slate-100",
            size: "md:col-span-2",
            href: "/boutique?category=jeux",
            order: 0
        },
        {
            badge: "Tendance",
            title: "Apple Ecosystem",
            subtitle: "MacBook & iPad M3",
            price: "Dès 650.000 CFA",
            image: "https://media.ldlc.com/encart/p/28885_b.jpg",
            bg: "bg-[#FFFBF5]",
            border: "border-orange-100/50",
            size: "md:col-span-2",
            href: "/boutique?category=informatique",
            order: 1
        },
        {
            badge: "Vente Flash",
            title: "Smartphones Pro",
            subtitle: "Derniers modèles arrivés",
            image: "https://media.ldlc.com/encart/p/28828_b.jpg",
            bg: "bg-[#F5F7FF]",
            border: "border-orange-100/50",
            size: "md:col-span-1",
            href: "/boutique?category=smartphones",
            order: 2
        },
        {
            badge: "Promo",
            title: "Accessoires Premium",
            subtitle: "Optimisez votre setup",
            image: "https://media.ldlc.com/encart/p/22889_b.jpg",
            bg: "bg-[#FFF5F9]",
            border: "border-pink-100/50",
            size: "md:col-span-1",
            href: "/boutique?category=connectique",
            order: 3
        },
        {
            badge: "Nouveau",
            title: "SON & IMAGE",
            subtitle: "Le cinéma à la maison",
            image: "https://media.ldlc.com/encart/p/28829_b.jpg",
            bg: "bg-[#F5FFF9]",
            border: "border-emerald-100/50",
            size: "md:col-span-2",
            href: "/boutique?category=image-son",
            order: 4
        }
    ];

    try {
        for (const p of DEFAULT_PROMOS) {
            await (prisma as any).homePromo.create({ data: p });
        }
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

// ==========================================
// BIG BANNERS ACTIONS
// ==========================================

export async function getBigBanners() {
    try {
        return await (prisma as any).bigBanner.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        return [];
    }
}

export async function upsertBigBanner(data: any, id?: string) {
    try {
        if (id) {
            await (prisma as any).bigBanner.update({ where: { id }, data });
        } else {
            await (prisma as any).bigBanner.create({ data });
        }
        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function deleteBigBanner(id: string) {
    try {
        await (prisma as any).bigBanner.delete({ where: { id } });
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

export async function initializeBigBanners() {
    const DEFAULT_BANNER = {
        title: "Le Son Absolu.",
        subtitle: "Série Sony XM5",
        description: "Découvrez la nouvelle gamme Sony Noise Cancelling. Une immersion totale, un confort inégalé. Jusqu'à -40% ce weekend.",
        badge: "Offre Spéciale",
        image: "https://sony.scene7.com/is/image/sonyglobalsolutions/360-RA-category-icon-20221202?$S7Product$&fmt=png-alpha",
        href: "/boutique",
        buttonText: "Commander",
        isActive: true
    };

    try {
        await (prisma as any).bigBanner.create({ data: DEFAULT_BANNER });
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

// ---------------------------------------------------------
// NEW PUBLISH ACTIONS
// ---------------------------------------------------------

export async function toggleProductPublish(id: string, isPublished: boolean) {
    try {
        await prisma.product.update({
            where: { id },
            data: { isPublished }
        });
        
        await invalidatePrefix('products:');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Toggle publish error:", error);
        return { success: false, message: "Erreur lors de la modification du statut" };
    }
}

export async function bulkTogglePublishProducts(ids: string[], isPublished: boolean) {
    try {
        if (!ids || ids.length === 0) return { success: false, message: "Aucun produit sélectionné" };
        
        await prisma.product.updateMany({
            where: { id: { in: ids } },
            data: { isPublished }
        });
        
        await invalidatePrefix('products:');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Bulk publish error:", error);
        return { success: false, message: "Erreur lors de la modification en masse" };
    }
}

export async function globalTogglePublishProducts(isPublished: boolean) {
    try {
        await prisma.product.updateMany({
            data: { isPublished }
        });
        
        await invalidatePrefix('products:');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Global publish error:", error);
        return { success: false, message: "Erreur lors de la modification de tout le catalogue" };
    }
}

export async function toggleCategoryPublish(id: string, isPublished: boolean) {
    try {
        await prisma.category.update({
            where: { id },
            data: { isPublished }
        });
        
        revalidatePath('/admin/categories');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Toggle category publish error:", error);
        return { success: false, message: "Erreur lors de la modification du statut" };
    }
}
