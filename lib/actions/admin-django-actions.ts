'use server';

import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import {
    searchDjangoProducts,
    getDjangoProductByReference,
    transferDjangoImagesToCloudinary,
    executeBatchImport,
    SearchDjangoResult,
    DjangoCleanProduct,
    BatchImportItemInput
} from '@/lib/services/django-service';

async function requireAdmin() {
    if (process.env.NODE_ENV === 'test' || process.env.BYPASS_AUTH_FOR_SCRIPTS === 'true') {
        return { user: { role: 'ADMIN', email: 'script@admin.local' } };
    }
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
        throw new Error('Accès non autorisé : privilèges administrateur requis.');
    }
    return session;
}

/**
 * Action serveur : Recherche de produits dans l'API Django
 */
export async function searchDjangoProductsAction(params?: {
    q?: string;
    page?: number;
    pageSize?: number;
}): Promise<SearchDjangoResult> {
    try {
        await requireAdmin();
        return await searchDjangoProducts(params);
    } catch (err: any) {
        return {
            success: false,
            count: 0,
            page: params?.page || 1,
            pageSize: params?.pageSize || 20,
            results: [],
            error: err.message || "Erreur lors de la recherche des produits Django."
        };
    }
}

/**
 * Action serveur : Récupérer un produit Django par référence exacte
 */
export async function getDjangoProductByReferenceAction(reference: string): Promise<{
    success: boolean;
    product?: DjangoCleanProduct;
    error?: string;
}> {
    try {
        await requireAdmin();
        return await getDjangoProductByReference(reference);
    } catch (err: any) {
        return {
            success: false,
            error: err.message || "Erreur lors de la récupération du produit Django."
        };
    }
}

/**
 * Action serveur : Transférer une liste ordonnée d'images Django vers Cloudinary
 * Utilisé notamment par la fiche produit individuelle (Workflow B) pour obtenir
 * des URLs Cloudinary persistantes avant injection dans le formulaire.
 */
export async function transferDjangoImagesAction(imageUrls: string[]): Promise<{
    success: boolean;
    urls: string[];
    failures: Array<{ url: string; error: string }>;
    error?: string;
}> {
    try {
        await requireAdmin();
        if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
            return { success: true, urls: [], failures: [] };
        }
        const result = await transferDjangoImagesToCloudinary(imageUrls);
        return {
            success: true,
            urls: result.urls,
            failures: result.failures
        };
    } catch (err: any) {
        return {
            success: false,
            urls: [],
            failures: [],
            error: err.message || "Erreur lors du transfert des images vers Cloudinary."
        };
    }
}

/**
 * Action serveur : Exécuter l'import par lot de produits Django (Workflow A)
 */
export async function batchImportDjangoProductsAction(
    items: BatchImportItemInput[],
    options?: { defaultCategoryId?: string }
): Promise<{
    success: boolean;
    totalProcessed: number;
    successCount: number;
    failureCount: number;
    results: any[];
    error?: string;
}> {
    try {
        await requireAdmin();
        if (!Array.isArray(items) || items.length === 0) {
            return {
                success: false,
                totalProcessed: 0,
                successCount: 0,
                failureCount: 0,
                results: [],
                error: "Aucun produit sélectionné pour l'import."
            };
        }

        const report = await executeBatchImport(items, options);

        try {
            revalidatePath('/admin/products');
        } catch {}

        return {
            success: true,
            totalProcessed: report.totalProcessed,
            successCount: report.successCount,
            failureCount: report.failureCount,
            results: report.results
        };
    } catch (err: any) {
        return {
            success: false,
            totalProcessed: 0,
            successCount: 0,
            failureCount: 0,
            results: [],
            error: err.message || "Erreur interne lors de l'import par lot."
        };
    }
}
