'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import {
    generateProductEnrichment,
    regenerateSingleField,
    GenerateProductInput,
    EnrichmentOutput
} from '@/lib/ai/product-enrichment-service';

/**
 * Vérification des autorisations Administrateur
 */
async function requireAdmin() {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
        throw new Error("Action non autorisée. Rôle Administrateur requis.");
    }
    return session.user;
}

/**
 * Génère le contenu d'un produit individuel via l'IA sans enregistrer ni modifier le produit
 */
export async function generateProductAiContentAction(input: GenerateProductInput): Promise<{
    success: boolean;
    data?: EnrichmentOutput;
    error?: string;
}> {
    try {
        await requireAdmin();

        if (!input.name || input.name.trim() === '') {
            return { success: false, error: "Le nom du produit est obligatoire pour générer du contenu." };
        }

        // Si l'ID du produit est fourni, enrichir les données avec celles de la base si manquantes
        let enrichedInput = { ...input };
        if (input.id) {
            const existing = await prisma.product.findUnique({
                where: { id: input.id },
                include: { brand: true, category: true, subCategory: true }
            });

            if (existing) {
                enrichedInput = {
                    ...input,
                    name: input.name || existing.name,
                    brandName: input.brandName || existing.brand?.name,
                    categoryName: input.categoryName || existing.category?.name,
                    subCategoryName: input.subCategoryName || existing.subCategory?.name || undefined,
                    categoryId: input.categoryId || existing.categoryId,
                    brandId: input.brandId || existing.brandId,
                    reference: input.reference || existing.reference || undefined,
                    existingShortDescription: input.existingShortDescription ?? existing.shortDescription ?? undefined,
                    existingDescription: input.existingDescription ?? existing.description ?? undefined,
                    existingFeatures: input.existingFeatures ?? (Array.isArray(existing.features) ? (existing.features as string[]) : undefined),
                    existingSpecs: input.existingSpecs ?? (existing.metadata as Record<string, any> || undefined),
                    packageContent: input.packageContent ?? (Array.isArray(existing.packageContent) ? (existing.packageContent as string[]) : undefined)
                };
            }
        }

        const result = await generateProductEnrichment(enrichedInput);

        return { success: true, data: result };
    } catch (err: any) {
        console.error("[generateProductAiContentAction] Erreur:", err);
        return { success: false, error: err?.message || "Erreur lors de la génération IA." };
    }
}

/**
 * Régénère un seul champ spécifique via l'IA
 */
export async function regenerateAiFieldAction(
    input: GenerateProductInput,
    fieldName: 'shortDescription' | 'generalDescription' | 'classicDescription' | 'features' | 'specifications'
): Promise<{
    success: boolean;
    data?: Partial<EnrichmentOutput>;
    error?: string;
}> {
    try {
        await requireAdmin();
        const result = await regenerateSingleField(input, fieldName);
        return { success: true, data: result };
    } catch (err: any) {
        console.error("[regenerateAiFieldAction] Erreur:", err);
        return { success: false, error: err?.message || "Erreur lors de la régénération du champ." };
    }
}

/**
 * Enregistre ou met à jour une proposition IA pour un produit (sans toucher au produit publié)
 */
export async function saveAiProposalAction(
    productId: string,
    proposal: EnrichmentOutput,
    status: string = "TO_REVIEW"
): Promise<{
    success: boolean;
    proposalId?: string;
    error?: string;
}> {
    try {
        const user = await requireAdmin();

        const saved = await prisma.productAiProposal.upsert({
            where: { productId },
            create: {
                productId,
                status,
                shortDescription: proposal.shortDescription,
                generalDescription: proposal.generalDescription,
                classicDescription: proposal.classicDescription,
                features: proposal.features,
                specifications: proposal.specifications,
                rawSpecsText: proposal.rawSpecsText,
                modelUsed: proposal.modelUsed,
                promptTokens: proposal.promptTokens,
                completionTokens: proposal.completionTokens,
                generatedAt: new Date(),
                reviewedBy: (user as any).username || user.name || user.email || 'Admin'
            },
            update: {
                status,
                shortDescription: proposal.shortDescription,
                generalDescription: proposal.generalDescription,
                classicDescription: proposal.classicDescription,
                features: proposal.features,
                specifications: proposal.specifications,
                rawSpecsText: proposal.rawSpecsText,
                modelUsed: proposal.modelUsed,
                promptTokens: proposal.promptTokens,
                completionTokens: proposal.completionTokens,
                updatedAt: new Date(),
                reviewedBy: (user as any).username || user.name || user.email || 'Admin'
            }
        });

        return { success: true, proposalId: saved.id };
    } catch (err: any) {
        console.error("[saveAiProposalAction] Erreur:", err);
        return { success: false, error: err?.message || "Erreur lors de la sauvegarde de la proposition IA." };
    }
}

/**
 * Récupère la proposition IA existante d'un produit
 */
export async function getAiProposalAction(productId: string) {
    try {
        await requireAdmin();
        const proposal = await prisma.productAiProposal.findUnique({
            where: { productId }
        });
        return { success: true, proposal };
    } catch (err: any) {
        return { success: false, error: err?.message };
    }
}

/**
 * Applique explicitement les champs sélectionnés d'une proposition IA au produit dans la base de données
 */
export async function applyAiProposalAction(
    productId: string,
    fieldsToApply: ('shortDescription' | 'classicDescription' | 'generalDescription' | 'features' | 'specifications')[]
): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        const user = await requireAdmin();

        const proposal = await prisma.productAiProposal.findUnique({
            where: { productId }
        });

        if (!proposal) {
            return { success: false, error: "Aucune proposition IA trouvée pour ce produit." };
        }

        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return { success: false, error: "Produit introuvable." };
        }

        const updateData: any = {};

        if (fieldsToApply.includes('shortDescription') && proposal.shortDescription) {
            updateData.shortDescription = proposal.shortDescription;
        }

        if (fieldsToApply.includes('classicDescription') && proposal.classicDescription) {
            updateData.description = proposal.classicDescription;
        } else if (fieldsToApply.includes('generalDescription') && proposal.generalDescription && !updateData.description) {
            updateData.description = `<p>${proposal.generalDescription}</p>`;
        }

        if (fieldsToApply.includes('features') && proposal.features) {
            updateData.features = proposal.features;
        }

        if (fieldsToApply.includes('specifications') && proposal.specifications) {
            // Fusionner avec metadata existant en préservant d'éventuels champs personnalisés
            const existingMeta = (product.metadata && typeof product.metadata === 'object')
                ? (product.metadata as Record<string, any>)
                : {};
            const newSpecs = proposal.specifications as Record<string, any>;
            const orderKeys = Object.keys(newSpecs);

            updateData.metadata = {
                ...existingMeta,
                ...newSpecs,
                _order: orderKeys
            };
        }

        // Mettre à jour le produit SANS modifier son état de publication (sécurité stricte)
        await prisma.product.update({
            where: { id: productId },
            data: updateData
        });

        // Marquer la proposition comme validée et enregistrée
        await prisma.productAiProposal.update({
            where: { productId },
            data: {
                status: 'VALIDATED',
                appliedFields: fieldsToApply,
                reviewedAt: new Date(),
                reviewedBy: (user as any).username || user.name || user.email || 'Admin'
            }
        });

        revalidatePath(`/admin/products`);
        revalidatePath(`/admin/products/${productId}/edit`);
        revalidatePath(`/product/${product.slug}`);

        return { success: true };
    } catch (err: any) {
        console.error("[applyAiProposalAction] Erreur:", err);
        return { success: false, error: err?.message || "Erreur lors de l'application de la proposition." };
    }
}

/**
 * Statistiques du catalogue pour l'espace d'enrichissement en masse
 */
export async function getBulkEnrichmentCatalogStatsAction() {
    try {
        await requireAdmin();

        const [
            totalProducts,
            incompleteProductsCount,
            proposalsStats,
            categoriesList,
            brandsList
        ] = await Promise.all([
            prisma.product.count(),
            prisma.product.count({
                where: {
                    OR: [
                        { shortDescription: null },
                        { shortDescription: '' },
                        { description: null },
                        { description: '' },
                        { features: { equals: [] } }
                    ]
                }
            }),
            prisma.productAiProposal.groupBy({
                by: ['status'],
                _count: { id: true }
            }),
            prisma.category.findMany({
                select: { id: true, name: true, _count: { select: { products: true } } },
                orderBy: { name: 'asc' }
            }),
            prisma.brand.findMany({
                select: { id: true, name: true, _count: { select: { products: true } } },
                orderBy: { name: 'asc' }
            })
        ]);

        const statusCounts: Record<string, number> = {
            TO_REVIEW: 0,
            VALIDATED: 0,
            GENERATED: 0,
            FAILED: 0
        };

        proposalsStats.forEach(item => {
            statusCounts[item.status] = item._count.id;
        });

        return {
            success: true,
            stats: {
                totalProducts,
                incompleteProductsCount,
                proposalsCount: Object.values(statusCounts).reduce((a, b) => a + b, 0),
                statusCounts,
                categories: categoriesList,
                brands: brandsList
            }
        };
    } catch (err: any) {
        console.error("[getBulkEnrichmentCatalogStatsAction] Erreur:", err);
        return { success: false, error: err?.message };
    }
}

/**
 * Recherche et pagination des produits pour la sélection en masse
 */
export async function getProductsForEnrichmentAction(params: {
    page?: number;
    pageSize?: number;
    filterType?: 'ALL' | 'INCOMPLETE' | 'CATEGORY' | 'BRAND' | 'WITH_PROPOSAL';
    filterValue?: string;
    search?: string;
}) {
    try {
        await requireAdmin();

        const page = Math.max(1, params.page || 1);
        const pageSize = Math.min(100, Math.max(1, params.pageSize || 20));
        const skip = (page - 1) * pageSize;

        const where: any = {};

        if (params.search && params.search.trim()) {
            where.OR = [
                { name: { contains: params.search.trim(), mode: 'insensitive' } },
                { reference: { contains: params.search.trim(), mode: 'insensitive' } },
                { slug: { contains: params.search.trim(), mode: 'insensitive' } }
            ];
        }

        if (params.filterType === 'INCOMPLETE') {
            where.OR = [
                { shortDescription: null },
                { shortDescription: '' },
                { description: null },
                { description: '' }
            ];
        } else if (params.filterType === 'CATEGORY' && params.filterValue) {
            where.categoryId = params.filterValue;
        } else if (params.filterType === 'BRAND' && params.filterValue) {
            where.brandId = params.filterValue;
        } else if (params.filterType === 'WITH_PROPOSAL') {
            where.aiProposal = { isNot: null };
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { updatedAt: 'desc' },
                include: {
                    brand: { select: { id: true, name: true } },
                    category: { select: { id: true, name: true } },
                    subCategory: { select: { id: true, name: true } },
                    aiProposal: true
                }
            }),
            prisma.product.count({ where })
        ]);

        return {
            success: true,
            products,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize)
        };
    } catch (err: any) {
        console.error("[getProductsForEnrichmentAction] Erreur:", err);
        return { success: false, error: err?.message };
    }
}

/**
 * Lance un travail d'enrichissement par lot (Bulk Enrichment Job)
 */
export async function startBulkEnrichmentJobAction(params: {
    name?: string;
    filterType: 'INCOMPLETE' | 'CATEGORY' | 'BRAND' | 'MANUAL';
    filterValue?: string;
    limit?: number;
    manualProductIds?: string[];
}): Promise<{
    success: boolean;
    jobId?: string;
    error?: string;
}> {
    try {
        const user = await requireAdmin();

        // 1. Déterminer la liste des produits ciblés
        let productIds: string[] = [];

        if (params.filterType === 'MANUAL' && Array.isArray(params.manualProductIds) && params.manualProductIds.length > 0) {
            productIds = params.manualProductIds;
        } else {
            const where: any = {};
            if (params.filterType === 'INCOMPLETE') {
                where.OR = [
                    { shortDescription: null },
                    { shortDescription: '' },
                    { description: null },
                    { description: '' }
                ];
            } else if (params.filterType === 'CATEGORY' && params.filterValue) {
                where.categoryId = params.filterValue;
            } else if (params.filterType === 'BRAND' && params.filterValue) {
                where.brandId = params.filterValue;
            }

            const limit = Math.min(100, params.limit || 20);
            const found = await prisma.product.findMany({
                where,
                take: limit,
                select: { id: true }
            });
            productIds = found.map(p => p.id);
        }

        if (productIds.length === 0) {
            return { success: false, error: "Aucun produit correspondant aux critères n'a été trouvé." };
        }

        // 2. Création de l'enregistrement de Job
        const job = await prisma.aiEnrichmentJob.create({
            data: {
                name: params.name || `Lot IA ${new Date().toLocaleDateString('fr-FR')} (${productIds.length} produits)`,
                status: 'RUNNING',
                filterType: params.filterType,
                filterValue: params.filterValue || null,
                totalProducts: productIds.length,
                createdById: user.id,
                items: {
                    create: productIds.map(productId => ({
                        productId,
                        status: 'PENDING'
                    }))
                }
            },
            include: { items: true }
        });

        // 3. Déclenchement asynchrone du traitement de la file en arrière-plan
        // Ne bloque pas la réponse HTTP au client
        processBulkJobQueue(job.id).catch(err => {
            console.error(`[BulkJob ${job.id}] Erreur d'exécution:`, err);
        });

        return { success: true, jobId: job.id };
    } catch (err: any) {
        console.error("[startBulkEnrichmentJobAction] Erreur:", err);
        return { success: false, error: err?.message || "Erreur lors du démarrage du traitement en lot." };
    }
}

/**
 * Traitement séquentiel avec délai anti-quota de la file d'attente d'un job
 */
async function processBulkJobQueue(jobId: string) {
    try {
        const job = await prisma.aiEnrichmentJob.findUnique({
            where: { id: jobId },
            include: {
                items: {
                    include: {
                        product: {
                            include: { brand: true, category: true, subCategory: true }
                        }
                    }
                }
            }
        });

        if (!job) return;

        let processed = 0;
        let success = 0;
        let errors = 0;
        let totalCost = 0;

        for (const item of job.items) {
            // Vérifier si le job a été annulé en cours de route
            const currentJobState = await prisma.aiEnrichmentJob.findUnique({
                where: { id: jobId },
                select: { status: true }
            });
            if (currentJobState?.status === 'CANCELLED') {
                break;
            }

            // Mettre à jour l'état de l'item en cours
            await prisma.aiEnrichmentJobItem.update({
                where: { id: item.id },
                data: { status: 'PROCESSING', startedAt: new Date() }
            });

            try {
                const product = item.product;
                const result = await generateProductEnrichment({
                    id: product.id,
                    name: product.name,
                    brandName: product.brand?.name,
                    categoryName: product.category?.name,
                    subCategoryName: product.subCategory?.name || undefined,
                    reference: product.reference || undefined,
                    existingShortDescription: product.shortDescription || undefined,
                    existingDescription: product.description || undefined,
                    existingFeatures: Array.isArray(product.features) ? (product.features as string[]) : undefined,
                    existingSpecs: (product.metadata as Record<string, any>) || undefined
                });

                // Sauvegarder la proposition IA SANS modifier le produit publié
                const proposal = await prisma.productAiProposal.upsert({
                    where: { productId: product.id },
                    create: {
                        productId: product.id,
                        status: 'TO_REVIEW',
                        shortDescription: result.shortDescription,
                        generalDescription: result.generalDescription,
                        classicDescription: result.classicDescription,
                        features: result.features,
                        specifications: result.specifications,
                        rawSpecsText: result.rawSpecsText,
                        modelUsed: result.modelUsed,
                        promptTokens: result.promptTokens,
                        completionTokens: result.completionTokens,
                        generatedAt: new Date()
                    },
                    update: {
                        status: 'TO_REVIEW',
                        shortDescription: result.shortDescription,
                        generalDescription: result.generalDescription,
                        classicDescription: result.classicDescription,
                        features: result.features,
                        specifications: result.specifications,
                        rawSpecsText: result.rawSpecsText,
                        modelUsed: result.modelUsed,
                        promptTokens: result.promptTokens,
                        completionTokens: result.completionTokens,
                        generatedAt: new Date()
                    }
                });

                await prisma.aiEnrichmentJobItem.update({
                    where: { id: item.id },
                    data: {
                        status: 'COMPLETED',
                        proposalId: proposal.id,
                        completedAt: new Date()
                    }
                });

                success++;
                totalCost += (result.estimatedCost || 0);
            } catch (err: any) {
                console.error(`[BulkJob ${jobId}] Échec pour le produit ${item.productId}:`, err?.message || err);
                await prisma.aiEnrichmentJobItem.update({
                    where: { id: item.id },
                    data: {
                        status: 'FAILED',
                        errorMessage: err?.message || "Erreur de génération",
                        completedAt: new Date()
                    }
                });
                errors++;
            }

            processed++;

            // Mise à jour de la progression globale du Job
            await prisma.aiEnrichmentJob.update({
                where: { id: jobId },
                data: {
                    processedCount: processed,
                    successCount: success,
                    errorCount: errors,
                    costEstimate: totalCost
                }
            });

            // Pause respectueuse des quotas API (1.5s entre chaque requête)
            await new Promise(r => setTimeout(r, 1500));
        }

        // Marquer le job comme terminé
        const finalStatus = await prisma.aiEnrichmentJob.findUnique({
            where: { id: jobId },
            select: { status: true }
        });

        if (finalStatus?.status !== 'CANCELLED') {
            await prisma.aiEnrichmentJob.update({
                where: { id: jobId },
                data: {
                    status: errors === job.items.length ? 'FAILED' : 'COMPLETED',
                    updatedAt: new Date()
                }
            });
        }
    } catch (err) {
        console.error(`[processBulkJobQueue ${jobId}] Erreur critique:`, err);
        await prisma.aiEnrichmentJob.update({
            where: { id: jobId },
            data: { status: 'FAILED' }
        }).catch(() => {});
    }
}

/**
 * Récupère le statut en temps réel d'un Job de traitement en lot
 */
export async function getBulkJobStatusAction(jobId: string) {
    try {
        await requireAdmin();

        const job = await prisma.aiEnrichmentJob.findUnique({
            where: { id: jobId },
            include: {
                items: {
                    include: {
                        product: {
                            select: { id: true, name: true, images: true, category: { select: { name: true } } }
                        }
                    },
                    orderBy: { startedAt: 'asc' }
                }
            }
        });

        if (!job) {
            return { success: false, error: "Tâche introuvable." };
        }

        return { success: true, job };
    } catch (err: any) {
        return { success: false, error: err?.message };
    }
}

/**
 * Annule un job en cours
 */
export async function cancelBulkJobAction(jobId: string) {
    try {
        await requireAdmin();
        await prisma.aiEnrichmentJob.update({
            where: { id: jobId },
            data: { status: 'CANCELLED' }
        });
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err?.message };
    }
}

/**
 * Validation groupée de propositions préalablement vérifiées
 */
export async function bulkValidateProposalsAction(proposalIds: string[]) {
    try {
        const user = await requireAdmin();

        if (!Array.isArray(proposalIds) || proposalIds.length === 0) {
            return { success: false, error: "Aucune proposition sélectionnée." };
        }

        const proposals = await prisma.productAiProposal.findMany({
            where: { id: { in: proposalIds } },
            include: { product: true }
        });

        let successCount = 0;

        for (const proposal of proposals) {
            const product = proposal.product;
            const updateData: any = {};

            if (proposal.shortDescription) updateData.shortDescription = proposal.shortDescription;
            if (proposal.classicDescription) updateData.description = proposal.classicDescription;
            if (proposal.features) updateData.features = proposal.features;
            if (proposal.specifications) {
                const existingMeta = (product.metadata && typeof product.metadata === 'object')
                    ? (product.metadata as Record<string, any>)
                    : {};
                const newSpecs = proposal.specifications as Record<string, any>;
                updateData.metadata = {
                    ...existingMeta,
                    ...newSpecs,
                    _order: Object.keys(newSpecs)
                };
            }

            // Ne jamais modifier l'état de publication d'origine
            await prisma.product.update({
                where: { id: product.id },
                data: updateData
            });

            await prisma.productAiProposal.update({
                where: { id: proposal.id },
                data: {
                    status: 'VALIDATED',
                    appliedFields: ['shortDescription', 'classicDescription', 'features', 'specifications'],
                    reviewedAt: new Date(),
                    reviewedBy: (user as any).username || user.name || user.email || 'Admin'
                }
            });

            successCount++;
        }

        revalidatePath('/admin/products');
        revalidatePath('/admin/ai-enrichment');

        return { success: true, count: successCount };
    } catch (err: any) {
        console.error("[bulkValidateProposalsAction] Erreur:", err);
        return { success: false, error: err?.message };
    }
}

/**
 * Récupère les travaux en lot récents
 */
export async function getRecentBulkJobsAction(limit: number = 10) {
    try {
        await requireAdmin();
        const jobs = await prisma.aiEnrichmentJob.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                items: {
                    select: {
                        id: true,
                        status: true,
                        errorMessage: true,
                        startedAt: true,
                        completedAt: true,
                        product: {
                            select: { id: true, name: true, images: true, reference: true }
                        }
                    }
                }
            }
        });
        return { success: true, jobs };
    } catch (err: any) {
        return { success: false, error: err?.message };
    }
}

/**
 * Récupère les propositions IA pour l'espace de révision / validation
 */
export async function getProposalsForReviewAction(params: {
    page?: number;
    pageSize?: number;
    status?: string;
    search?: string;
}) {
    try {
        await requireAdmin();
        const page = Math.max(1, params.page || 1);
        const pageSize = Math.min(100, Math.max(1, params.pageSize || 20));
        const skip = (page - 1) * pageSize;

        const where: any = {};
        if (params.status && params.status !== 'ALL') {
            where.status = params.status;
        }

        if (params.search && params.search.trim()) {
            where.product = {
                OR: [
                    { name: { contains: params.search.trim(), mode: 'insensitive' } },
                    { reference: { contains: params.search.trim(), mode: 'insensitive' } },
                    { brand: { name: { contains: params.search.trim(), mode: 'insensitive' } } }
                ]
            };
        }

        const [proposals, total] = await Promise.all([
            prisma.productAiProposal.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { updatedAt: 'desc' },
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            reference: true,
                            slug: true,
                            images: true,
                            shortDescription: true,
                            description: true,
                            features: true,
                            metadata: true,
                            brand: { select: { name: true } },
                            category: { select: { name: true } }
                        }
                    }
                }
            }),
            prisma.productAiProposal.count({ where })
        ]);

        return {
            success: true,
            proposals,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize)
        };
    } catch (err: any) {
        return { success: false, error: err?.message };
    }
}

/**
 * Met à jour le contenu d'une proposition IA avant validation
 */
export async function updateAiProposalContentAction(
    proposalId: string,
    data: {
        shortDescription?: string;
        generalDescription?: string;
        classicDescription?: string;
        features?: string[];
        specifications?: Record<string, any>;
        status?: string;
    }
) {
    try {
        const user = await requireAdmin();
        const updated = await prisma.productAiProposal.update({
            where: { id: proposalId },
            data: {
                ...data,
                updatedAt: new Date(),
                reviewedBy: (user as any).username || user.name || user.email || 'Admin'
            }
        });
        revalidatePath('/admin/ai-enrichment');
        return { success: true, proposal: updated };
    } catch (err: any) {
        return { success: false, error: err?.message };
    }
}

/**
 * Supprime une proposition IA
 */
export async function deleteAiProposalAction(proposalId: string) {
    try {
        await requireAdmin();
        await prisma.productAiProposal.delete({
            where: { id: proposalId }
        });
        revalidatePath('/admin/ai-enrichment');
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err?.message };
    }
}

/**
 * Relance les éléments en échec d'un job
 */
export async function retryFailedJobItemsAction(jobId: string) {
    try {
        await requireAdmin();
        const failedItems = await prisma.aiEnrichmentJobItem.findMany({
            where: { jobId, status: 'FAILED' }
        });

        if (failedItems.length === 0) {
            return { success: false, error: "Aucun élément en échec à relancer." };
        }

        // Remettre les items en PENDING
        await prisma.aiEnrichmentJobItem.updateMany({
            where: { jobId, status: 'FAILED' },
            data: { status: 'PENDING', errorMessage: null }
        });

        // Remettre le job en RUNNING
        await prisma.aiEnrichmentJob.update({
            where: { id: jobId },
            data: { status: 'RUNNING' }
        });

        // Relancer le processeur de file
        processBulkJobQueue(jobId).catch(err => {
            console.error(`[retryFailedJobItemsAction ${jobId}] Erreur:`, err);
        });

        revalidatePath('/admin/ai-enrichment');
        return { success: true, count: failedItems.length };
    } catch (err: any) {
        return { success: false, error: err?.message };
    }
}

/**
 * Relance un seul élément en échec d'un lot
 */
export async function retrySingleJobItemAction(jobItemId: string) {
    try {
        await requireAdmin();
        const item = await prisma.aiEnrichmentJobItem.findUnique({
            where: { id: jobItemId },
            include: { job: true }
        });

        if (!item) {
            return { success: false, error: "Élément introuvable." };
        }

        // Remettre l'item en PENDING
        await prisma.aiEnrichmentJobItem.update({
            where: { id: jobItemId },
            data: { status: 'PENDING', errorMessage: null }
        });

        // Remettre le job en RUNNING si besoin
        await prisma.aiEnrichmentJob.update({
            where: { id: item.jobId },
            data: { status: 'RUNNING' }
        });

        // Relancer le processeur de file
        processBulkJobQueue(item.jobId).catch(err => {
            console.error(`[retrySingleJobItemAction ${jobItemId}] Erreur:`, err);
        });

        revalidatePath('/admin/ai-enrichment');
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err?.message };
    }
}
