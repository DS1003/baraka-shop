'use server';

import prismaClient from '@/lib/prisma';
const prisma = prismaClient as any;
import { getCache, setCache } from '@/lib/redis';
import { revalidatePath } from 'next/cache';
import { slugify } from '@/lib/utils';
import { v2 as cloudinary } from 'cloudinary';

/**
 * Upload direct vers Cloudinary via Server Action (Upload "Normal")
 */
export async function uploadToCloudinaryAction(formData: FormData) {
    try {
        // Init config within the action
        cloudinary.config({
            cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        const file = formData.get('file') as File;
        if (!file) return { success: false, error: "Aucun fichier" };

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload vers Cloudinary via Buffer
        const uploadResponse = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({
                folder: 'catalogue_produits',
                resource_type: 'auto'
            }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }).end(buffer);
        }) as any;

        // Sync database
        const syncResult = await syncMediaAction({
            name: file.name,
            url: uploadResponse.secure_url,
            publicId: uploadResponse.public_id,
            format: uploadResponse.format,
            size: uploadResponse.bytes,
            type: uploadResponse.resource_type
        });

        if (!syncResult.success) {
            return { success: false, error: syncResult.error || "Erreur de synchronisation avec la base de données locale" };
        }

        return { success: true, media: syncResult.media };
    } catch (error: any) {
        console.error('[Cloudinary Upload Error Details]:', JSON.stringify(error, null, 2));
        return { success: false, error: error.message || error.error?.message || JSON.stringify(error) || "Erreur inconnue" };
    }
}

/**
 * Enregistre un media uploadé vers Cloudinary dans la base locale
 */
export async function syncMediaAction(data: {
    name: string;
    url: string;
    publicId: string;
    format?: string;
    size?: number;
    type?: string;
}) {
    try {
        const media = await prisma.media.upsert({
            where: { publicId: data.publicId },
            update: {
                name: data.name,
                url: data.url,
                format: data.format,
                size: data.size,
                type: data.type || 'image'
            },
            create: {
                name: data.name,
                url: data.url,
                publicId: data.publicId,
                format: data.format,
                size: data.size,
                type: data.type || 'image'
            }
        });

        revalidatePath('/admin/media');
        return { success: true, media };
    } catch (error: any) {
        console.error('[Sync Media Error]:', error);
        return { success: false, error: error.message || JSON.stringify(error) };
    }
}

/**
 * Récupère tous les médias
 */
export async function getMediaItems() {
    try {
        return await prisma.media.findMany({
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        return [];
    }
}

/**
 * Lance le job de matching automatique entre produits et photos
 */
export async function startMediaMatchingJob() {
    try {
        // 1. Créer le job
        const job = await prisma.mediaJob.create({
            data: {
                status: 'PROCESSING',
                progress: 0,
                totalItems: 0,
                processedItems: 0,
                matchedCount: 0
            }
        });

        // 2. Lancer en arrière-plan
        processMediaMatching(job.id).catch(err => {
            console.error('[Media Matching Job Error]:', err);
        });

        return { success: true, jobId: job.id };
    } catch (error) {
        return { success: false };
    }
}

/**
 * Algorithme de matching haute performance
 * Utilise un index inversé par tokens pour éviter les boucles imbriquées O(N * M)
 */
async function processMediaMatching(jobId: string) {
    console.log(`[Media Matching] Starting Job ${jobId}`);

    // 1. Charger tout en mémoire pour la vitesse maximale
    const products = await prisma.product.findMany({
        select: {
            id: true,
            name: true,
            images: true,
            category: { select: { name: true } },
            brand: { select: { name: true } }
        }
    });
    const media = await prisma.media.findMany();

    await prisma.mediaJob.update({
        where: { id: jobId },
        data: { totalItems: products.length }
    });

    // 2. Préparer l'Index de Recherche (Token Inversé)
    // token -> Set de URLs pour un accès O(1)
    const tokenIndex = new Map<string, Set<string>>();
    // slug exact -> URL pour les matchs parfaits
    const slugMap = new Map<string, string>();

    const junkWords = new Set(['v1', 'v2', 'v3', 'copy', 'img', 'image', 'photo', 'product', 'baraka', 'final', 'web', 'shop', 'compressed', 'preview', 'watermarked', 'lowres', 'highres']);

    media.forEach((m: any) => {
        const baseName = m.name.split('.').slice(0, -1).join('.');
        const slug = slugify(baseName);
        if (slug) slugMap.set(slug, m.url);

        // Extraction de tokens (mots significatifs)
        const tokens = baseName.toLowerCase()
            .split(/[^a-z0-9]/)
            .filter((t: string) => t.length >= 3 && !junkWords.has(t));

        tokens.forEach((t: string) => {
            if (!tokenIndex.has(t)) tokenIndex.set(t, new Set());
            tokenIndex.get(t)!.add(m.url);
        });
    });

    let matchedCount = 0;
    const batchSize = 50; // Batch de DB raisonnable

    for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        const updatePromises = [];

        for (const product of batch) {
            let finalUrl: string | null = null;

            // Stratégie 1: Match de Slug Exact (Priorité Haute)
            const productSlug = slugify(product.name);
            finalUrl = slugMap.get(productSlug) || null;

            // Stratégie 2: IA de Matching par Intersection de Tokens (Fuzzy Match Intelligent)
            if (!finalUrl) {
                // Collecte les tokens du produit + marque/catégorie pour le contexte
                const rawTokens = [
                    ...product.name.toLowerCase().split(/[^a-z0-9]/),
                    ...(product.brand?.name?.toLowerCase().split(/[^a-z0-9]/) || []),
                    ...(product.category?.name?.toLowerCase().split(/[^a-z0-9]/) || [])
                ];

                const productTokens = [...new Set(
                    rawTokens.filter((t: string) => t.length >= 3 && !junkWords.has(t))
                )];

                if (productTokens.length > 0) {
                    const candidates = new Map<string, number>(); // URL -> Hit Count

                    for (const token of productTokens) {
                        const matchedUrls = tokenIndex.get(token);
                        if (matchedUrls) {
                            for (const url of matchedUrls) {
                                candidates.set(url, (candidates.get(url) || 0) + 1);
                            }
                        }
                    }

                    if (candidates.size > 0) {
                        let bestUrl = null;
                        let maxScore = 0;

                        for (const [url, score] of candidates.entries()) {
                            if (score > maxScore) {
                                maxScore = score;
                                bestUrl = url;
                            }
                        }

                        // Seuil de confiance adaptatif
                        const threshold = Math.min(2, Math.ceil(productTokens.length * 0.4));
                        if (maxScore >= threshold) {
                            finalUrl = bestUrl;
                        }
                    }
                }
            }

            // 3. Appliquer le match si trouvé et pas déjà présent
            if (finalUrl && !product.images.includes(finalUrl)) {
                updatePromises.push(
                    prisma.product.update({
                        where: { id: product.id },
                        data: {
                            images: {
                                set: [...new Set([...product.images, finalUrl])]
                            }
                        }
                    })
                );
                matchedCount++;
            }
        }

        // Exécution optimisée en parallèle
        if (updatePromises.length > 0) {
            await Promise.all(updatePromises);
        }

        // 4. Notification de progression
        const processed = Math.min(i + batchSize, products.length);
        const progress = Math.round((processed / products.length) * 100);

        await prisma.mediaJob.update({
            where: { id: jobId },
            data: {
                processedItems: processed,
                progress,
                matchedCount
            }
        });

        // Mise à jour Cache pour l'UI
        await setCache(`media-job:${jobId}`, {
            id: jobId,
            status: 'PROCESSING',
            progress,
            totalItems: products.length,
            processedItems: processed,
            matchedCount
        }, 3600);

        // Pause minime
        await new Promise(r => setTimeout(r, 50));
    }

    // 5. Clôture avec succès
    await prisma.mediaJob.update({
        where: { id: jobId },
        data: {
            status: 'COMPLETED',
            progress: 100,
            matchedCount
        }
    });

    await setCache(`media-job:${jobId}`, {
        status: 'COMPLETED',
        progress: 100,
        matchedCount
    }, 3600);

    console.log(`[Media Matching] Job ${jobId} Completed! Found ${matchedCount} associations.`);
    revalidatePath('/admin/products');
}

/**
 * Statut du job
 */
export async function getMediaJobStatus(jobId: string) {
    const cached = await getCache<any>(`media-job:${jobId}`);
    if (cached) return cached;

    return await prisma.mediaJob.findUnique({
        where: { id: jobId }
    });
}

export async function getLatestMediaJob() {
    return await prisma.mediaJob.findFirst({
        where: { status: 'PROCESSING' },
        orderBy: { updatedAt: 'desc' }
    });
}
