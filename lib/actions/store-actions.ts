'use server';
// PROXY REFRESH 2
import prisma from '@/lib/prisma';
import { getCache, setCache, rememberCache, invalidatePrefix } from '@/lib/redis';
import { slugify } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

import { auth } from '@/auth';

async function requireAdmin() {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
        throw new Error('Accès non autorisé.');
    }
    return session;
}

export async function getStoresAction() {
    try {
        return await rememberCache('stores:all_v2', 3600, async () => {
            return await prisma.store.findMany({
                include: {
                    _count: {
                        select: {
                            products: {
                                where: { isPublished: true, stock: { gt: 0 } }
                            }
                        }
                    }
                },
                orderBy: { name: 'asc' }
            });
        });
    } catch (error) {
        console.error('[Get Stores Error]:', error);
        return [];
    }
}

export async function getStoreBySlugAction(slug: string) {
    try {
        if (!slug) return null;
        return await rememberCache(`store_v2:${slug}`, 3600, async () => {
            return await prisma.store.findUnique({
                where: { slug },
                include: {
                    _count: {
                        select: {
                            products: {
                                where: { isPublished: true, stock: { gt: 0 } }
                            }
                        }
                    }
                }
            });
        });
    } catch (error) {
        console.error('[Get Store By Slug Error]:', error);
        return null;
    }
}

export async function createStoreAction(data: { name: string; logo?: string; description?: string }) {
    try {
        await requireAdmin();
        const slug = slugify(data.name);
        const store = await prisma.store.create({
            data: {
                ...data,
                slug,
            }
        });

        await Promise.all([
            invalidatePrefix('stores:'),
            invalidatePrefix('admin:stores:'),
            invalidatePrefix('admin:store:stats')
        ]);
        revalidatePath('/admin/stores');
        return { success: true, store };
    } catch (error: any) {
        console.error('[Create Store Error]:', error);
        return { success: false, error: error.message || 'Erreur lors de la création de la boutique' };
    }
}

export async function updateStoreAction(id: string, data: { name?: string; logo?: string; description?: string }) {
    try {
        await requireAdmin();
        const updateData: any = { ...data };
        if (data.name) {
            updateData.slug = slugify(data.name);
        }

        const store = await prisma.store.update({
            where: { id },
            data: updateData
        });

        await Promise.all([
            invalidatePrefix('stores:'),
            invalidatePrefix(`store:${store.slug}`),
            invalidatePrefix(`store_v2:${store.slug}`),
            invalidatePrefix('admin:stores:'),
            invalidatePrefix('admin:store:stats')
        ]);
        revalidatePath('/admin/stores');
        return { success: true, store };
    } catch (error: any) {
        console.error('[Update Store Error]:', error);
        return { success: false, error: error.message || 'Erreur lors de la mise à jour de la boutique' };
    }
}

export async function deleteStoreAction(id: string) {
    try {
        await requireAdmin();
        await prisma.store.delete({
            where: { id }
        });

        await Promise.all([
            invalidatePrefix('stores:'),
            invalidatePrefix('admin:stores:'),
            invalidatePrefix('admin:store:stats')
        ]);
        revalidatePath('/admin/stores');
        return { success: true };
    } catch (error: any) {
        console.error('[Delete Store Error]:', error);
        return { success: false, error: error.message || 'Erreur lors de la suppression de la boutique' };
    }
}
