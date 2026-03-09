'use server';

import fs from 'fs/promises';
import path from 'path';
import prismaClient from '@/lib/prisma';
const prisma = prismaClient as any;
import { getCache, setCache, invalidatePrefix } from '@/lib/redis';
import { importProductsAction } from './product-actions';
import { revalidatePath } from 'next/cache';

/**
 * Sauvegarde les produits dans un fichier JSON et démarre l'importation en arrière-plan.
 */
export async function saveToJsonAndStartImport(products: any[]) {
    console.log(`[Import Start] Received ${products.length} products to save and import.`);
    try {
        // 1. Sauvegarder dans un JSON intermédiaire
        const dataDir = path.join(process.cwd(), 'public', 'data');
        await fs.mkdir(dataDir, { recursive: true });
        const filePath = path.join(dataDir, 'latest-import.json');

        // Fonction utilitaire pour trouver une valeur par plusieurs clés possibles (insensible à la casse)
        const getVal = (obj: any, keys: string[]) => {
            const entry = Object.entries(obj).find(([k]) =>
                keys.some(key => k.toLowerCase() === key.toLowerCase())
            );
            return entry ? entry[1] : undefined;
        };

        // On nettoie les objets pour le JSON en étant flexible sur les noms de colonnes
        const cleanProducts = products.map(p => {
            const name = getVal(p, ['name', 'nom', 'désignation', 'designation', 'title', 'titre']);
            const cat = getVal(p, ['category', 'catégorie', 'categorie', 'cat']);
            const sub = getVal(p, ['subcategory', 'sous-catégorie', 'sous-categorie', 'subcategory1', 'scat1']);
            const sub2 = getVal(p, ['subcategory2', 'sous-catégorie2', 'sous-categorie2', 'scat2', 'niveau 3']);
            const brand = getVal(p, ['brand', 'marque', 'fabricant']);
            const price = getVal(p, ['price', 'prix', 'montant']);
            const stock = getVal(p, ['stock', 'quantité', 'qty', 'qte']);
            const desc = getVal(p, ['description', 'desc', 'détails']);
            const imgs = getVal(p, ['images', 'photo', 'url']);

            return {
                name: name || 'Produit sans nom',
                category: cat || 'Général',
                subcategory1: sub,
                subcategory2: sub2,
                brand: brand,
                price: Number(price) || 0,
                stock: Number(stock) || 0,
                description: desc || '',
                images: imgs,
                metadata: {
                    ...p, // On garde tout l'objet original en metadata pour ne rien perdre
                    importedAt: new Date().toISOString()
                }
            };
        });

        await fs.writeFile(filePath, JSON.stringify(cleanProducts, null, 2));

        // 2. Créer un job d'importation
        const job = await prisma.importJob.create({
            data: {
                status: 'PROCESSING',
                totalItems: products.length,
                processedItems: 0,
                progress: 0
            }
        });

        // 3. Stocker l'état initial dans Redis pour un accès ultra-rapide
        await setCache(`job:${job.id}`, {
            id: job.id,
            status: 'PROCESSING',
            totalItems: products.length,
            processedItems: 0,
            progress: 0
        }, 86400); // 24h

        console.log(`[Import] Created job ${job.id} for ${products.length} items. status: ${job.status}`);

        // 3. Lancer la synchronisation en arrière-plan (non-bloquant)
        // Attention: Dans un environnement Serverless (Vercel), cela peut être risqué si l'exécution dépasse le timeout.
        // Mais pour un environnement local ou serveur standard, c'est efficace.
        processSync(job.id, cleanProducts).catch(err => {
            console.error('[Background Import Error]:', err);
        });

        return { success: true, jobId: job.id };
    } catch (error: any) {
        console.error('[Import Save Error]:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Fonction interne de synchronisation par lots.
 */
async function processSync(jobId: string, products: any[]) {
    const chunkSize = 100; // Batch plus grand pour la performance

    for (let i = 0; i < products.length; i += chunkSize) {
        // --- VÉRIFICATION ÉTAT (PAUSE / ANNULATION) ---
        let job = await getImportStatus(jobId);

        while (job?.status === 'PAUSED') {
            console.log(`[Job ${jobId}] Injection suspendue... en attente de reprise.`);
            await new Promise(resolve => setTimeout(resolve, 3000)); // Attendre 3s
            job = await getImportStatus(jobId);
        }

        if (!job || job.status === 'CANCELLED' || job.status === 'FAILED') {
            console.log(`[Job ${jobId}] Injection arrêtée (Annulée ou Échouée).`);
            return;
        }

        const chunk = products.slice(i, i + chunkSize);

        try {
            await importProductsAction(chunk as any, true);

            const processed = Math.min(i + chunkSize, products.length);
            const progress = Math.round((processed / products.length) * 100);
            const status = processed >= products.length ? 'COMPLETED' : 'PROCESSING';

            // Mise à jour Prisma
            await prisma.importJob.update({
                where: { id: jobId },
                data: {
                    processedItems: processed,
                    progress,
                    status
                }
            });

            // Mise à jour Redis
            await setCache(`job:${jobId}`, {
                id: jobId,
                status,
                totalItems: products.length,
                processedItems: processed,
                progress
            }, 86400);

            // Petit délai pour laisser souffler la DB et permettre au serveur de répondre
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error: any) {
            console.error(`[Job ${jobId}] Critical Error at index ${i}:`, error.message);
            const errorMsg = error.message || 'Erreur inconnue';

            await prisma.importJob.update({
                where: { id: jobId },
                data: { status: 'FAILED', error: errorMsg }
            });

            await setCache(`job:${jobId}`, {
                id: jobId,
                status: 'FAILED',
                error: errorMsg,
                progress: i > 0 ? Math.round((i / products.length) * 100) : 0
            }, 86400);
            break;
        }
    }

    // --- REVALIDATION FINALE ---
    try {
        await Promise.all([
            invalidatePrefix('products:'),
            invalidatePrefix('categories:'),
            invalidatePrefix('brands:')
        ]);
        revalidatePath('/admin/products');
        revalidatePath('/admin/inventory');
    } catch (e) {
        console.error('[Import Revalidate Error]:', e);
    }
}

/**
 * Récupère le statut actuel d'un job.
 */
export async function getImportStatus(jobId: string) {
    try {
        // Tenter d'abord Redis via notre helper sécurisé
        const cached = await getCache<any>(`job:${jobId}`);
        if (cached) return cached;

        // Fallback Prisma
        return await prisma.importJob.findUnique({
            where: { id: jobId }
        });
    } catch (error) {
        console.error('[Get Import Status Error]:', error);
        return null;
    }
}

/**
 * Récupère le dernier job en cours (pour restaurer le toaster au refresh).
 */
export async function getLatestActiveJob() {
    try {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return await prisma.importJob.findFirst({
            where: {
                status: { in: ['PROCESSING', 'PENDING', 'PAUSED'] },
                updatedAt: { gte: oneDayAgo }
            },
            orderBy: { updatedAt: 'desc' }
        });
    } catch (error) {
        return null;
    }
}
export async function getAllImportJobs() {
    try {
        return await prisma.importJob.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50
        });
    } catch (error) {
        return [];
    }
}

export async function clearImportJobs() {
    try {
        await prisma.importJob.deleteMany({});
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

/**
 * Suspendre ou reprendre un job
 */
export async function togglePauseImport(jobId: string) {
    try {
        const job = await getImportStatus(jobId);
        if (!job) return { success: false };

        const newStatus = job.status === 'PAUSED' ? 'PROCESSING' : 'PAUSED';

        await prisma.importJob.update({
            where: { id: jobId },
            data: { status: newStatus }
        });

        // Mettre à jour Redis immédiatement pour que le processeur réagisse
        await setCache(`job:${jobId}`, { ...job, status: newStatus }, 86400);

        return { success: true, status: newStatus };
    } catch (error) {
        return { success: false };
    }
}

/**
 * Annuler définitivement un job
 */
export async function cancelImport(jobId: string) {
    try {
        const job = await getImportStatus(jobId);
        if (!job) return { success: false };

        await prisma.importJob.update({
            where: { id: jobId },
            data: { status: 'CANCELLED' }
        });

        await setCache(`job:${jobId}`, { ...job, status: 'CANCELLED' }, 86400);

        return { success: true };
    } catch (error) {
        return { success: false };
    }
}
