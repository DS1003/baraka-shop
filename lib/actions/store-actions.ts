'use server';
// PROXY REFRESH 2
import prisma from '@/lib/prisma';
import { getCache, setCache, invalidatePrefix } from '@/lib/redis';
import { slugify } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

export async function getStoresAction() {
    try {
        const cacheKey = 'stores:all';
        const cached = await getCache<any>(cacheKey);
        if (cached) return cached;

        const stores = await prisma.store.findMany({
            include: {
                _count: {
                    select: { products: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        await setCache(cacheKey, stores, 3600); // 1h cache
        return stores;
    } catch (error) {
        console.error('[Get Stores Error]:', error);
        return [];
    }
}

export async function getStoreBySlugAction(slug: string) {
    try {
        const cacheKey = `store:${slug}`;
        const cached = await getCache<any>(cacheKey);
        if (cached) return cached;

        const store = await prisma.store.findUnique({
            where: { slug },
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });

        if (store) {
            await setCache(cacheKey, store, 3600);
        }
        return store;
    } catch (error) {
        console.error('[Get Store By Slug Error]:', error);
        return null;
    }
}

export async function createStoreAction(data: { name: string; logo?: string; description?: string }) {
    try {
        const slug = slugify(data.name);
        const store = await prisma.store.create({
            data: {
                ...data,
                slug,
            }
        });

        await invalidatePrefix('stores:');
        revalidatePath('/admin/stores');
        return { success: true, store };
    } catch (error) {
        console.error('[Create Store Error]:', error);
        return { success: false, error: 'Erreur lors de la création de la boutique' };
    }
}

export async function updateStoreAction(id: string, data: { name?: string; logo?: string; description?: string }) {
    try {
        const updateData: any = { ...data };
        if (data.name) {
            updateData.slug = slugify(data.name);
        }

        const store = await prisma.store.update({
            where: { id },
            data: updateData
        });

        await invalidatePrefix('stores:');
        await invalidatePrefix(`store:${store.slug}`);
        revalidatePath('/admin/stores');
        return { success: true, store };
    } catch (error) {
        console.error('[Update Store Error]:', error);
        return { success: false, error: 'Erreur lors de la mise à jour de la boutique' };
    }
}

export async function deleteStoreAction(id: string) {
    try {
        await prisma.store.delete({
            where: { id }
        });

        await invalidatePrefix('stores:');
        revalidatePath('/admin/stores');
        return { success: true };
    } catch (error) {
        console.error('[Delete Store Error]:', error);
        return { success: false, error: 'Erreur lors de la suppression de la boutique' };
    }
}
