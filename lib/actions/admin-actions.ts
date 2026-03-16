'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

import { revalidatePath } from 'next/cache';

export async function getDashboardStats() {
    try {
        const [orders, customers, products, reviews] = await Promise.all([
            prisma.order.findMany({
                include: { items: true }
            }),
            prisma.user.count({ where: { role: 'USER' } }),
            prisma.product.count(),
            prisma.review.count()
        ]);

        const totalRevenue = orders.reduce((acc: number, order: any) => acc + order.total, 0);
        const orderCount = orders.length;
        const avgBasket = orderCount > 0 ? totalRevenue / orderCount : 0;

        // Month-over-month calculation (mocked trend for now but we'll fetch real data)
        // In a real app we'd compare with last month's stats.
        const stats = {
            revenue: {
                total: totalRevenue,
                trend: "+12.5%", // Placeholder for now
                lastMonth: totalRevenue * 0.9,
            },
            orders: {
                total: orderCount,
                trend: "+8.2%", // Placeholder
            },
            customers: {
                total: customers,
                trend: "+15.3%", // Placeholder
            },
            avgBasket: {
                total: avgBasket,
                trend: "+4.1%", // Placeholder
            }
        };

        // Revenue history for the chart (grouped by date)
        // Group by day for the last 30 days
        const last30Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });

        const revenueHistory = last30Days.map(date => {
            const dayOrders = orders.filter((o: any) => o.createdAt.toISOString().split('T')[0] === date);
            return {
                name: new Intl.DateTimeFormat('fr-FR', { weekday: 'short' }).format(new Date(date)),
                value: dayOrders.reduce((acc: number, o: any) => acc + o.total, 0)
            };
        });

        return { stats, revenueHistory };
    } catch (error) {
        console.error("Dashboard stats error:", error);
        return { stats: null, revenueHistory: [] };
    }
}

export async function getCategoryStats() {
    try {
        const [l1, l2, l3, products] = await Promise.all([
            prisma.category.count(),
            (prisma as any).subCategory.count(),
            (prisma as any).thirdLevelCategory.count(),
            prisma.product.count()
        ]);

        return {
            l1,
            l2,
            l3,
            products
        };
    } catch (error) {
        console.error("Category stats error:", error);
        return { l1: 0, l2: 0, l3: 0, products: 0 };
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
                thirdLevelCategory: true
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
        revalidatePath('/admin/products');
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
        revalidatePath('/admin/products');
        revalidatePath('/admin/inventory');
        return { success: true };
    } catch (error) {
        console.error("Delete bulk products error:", error);
        return { success: false, message: "Impossible de supprimer les produits sélectionnés." };
    }
}

export async function deleteAllProducts() {
    try {
        await prisma.product.deleteMany({});
        revalidatePath('/admin/products');
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

        revalidatePath('/admin/products');
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
        revalidatePath('/admin/brands');
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
        revalidatePath('/admin/brands');
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
        let product;
        if (id) {
            product = await prisma.product.update({
                where: { id },
                data,
            });
        } else {
            product = await prisma.product.create({
                data,
            });
        }
        revalidatePath('/admin/products');
        revalidatePath('/admin/inventory');
        revalidatePath('/admin/promotions');
        revalidatePath('/boutique');
        revalidatePath('/');
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
