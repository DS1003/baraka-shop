import { v2 as cloudinary } from 'cloudinary';
import prisma from '@/lib/prisma';
import {
    getDjangoProductsUrl,
    resolveDjangoImageUrl,
    getDjangoImageProxyUrl,
    isAllowedDjangoImageUrl
} from '@/lib/config/django-config';

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------

export interface DjangoRawImage {
    id: number;
    image: string;
    order?: number;
}

export interface DjangoRawProduct {
    id: number;
    reference: string;
    name: string;
    libelle?: string | null;
    description?: string | null;
    stock?: number;
    solde?: boolean;
    active: boolean;
    images?: DjangoRawImage[];
    main_price?: number | null;
    promo_price?: number | null;
}

export interface DjangoCleanImage {
    id: number;
    originalUrl: string;
    resolvedUrl: string;
    proxyUrl: string;
    order: number;
}

export interface BarakaMatchInfo {
    exists: boolean;
    productId?: string;
    reference?: string;
    currentName?: string;
    currentShortDescription?: string;
    currentFeatures?: string[];
    currentImages?: string[];
    isPublished?: boolean;
    categoryId?: string;
    categoryName?: string;
    brandId?: string;
    brandName?: string;
}

export interface DjangoCleanProduct {
    id: number;
    reference: string;
    name: string;
    libelle: string; // Raw libelle from Django
    shortDescription: string; // Mapped for Baraka
    hasLibelle: boolean;
    rawDescription: string;
    features: string[]; // Cleaned array (no bullets)
    featuresText: string; // Cleaned newline-separated string
    images: DjangoCleanImage[];
    imageCount: number;
    active: boolean;
    barakaMatch?: BarakaMatchInfo | null;
}

export interface SearchDjangoResult {
    success: boolean;
    count: number;
    page: number;
    pageSize: number;
    results: DjangoCleanProduct[];
    error?: string;
}

export interface ImportFieldSelection {
    name?: boolean;
    shortDescription?: boolean;
    features?: boolean;
    images?: boolean;
    imageMode?: 'replace' | 'append' | 'ignore';
}

export interface BatchImportItemInput {
    djangoId: number;
    reference: string;
    selectedFields: ImportFieldSelection;
}

export interface BatchImportResultItem {
    djangoId: number;
    reference: string;
    success: boolean;
    action: 'updated' | 'created' | 'skipped' | 'failed';
    barakaProductId?: string;
    message: string;
    importedFields: string[];
    imagesTransferredCount?: number;
}

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

/**
 * Nettoie les puces et symboles de début de ligne des caractéristiques
 * Exemple : "• Puissance 500 W" -> "Puissance 500 W"
 * Exemple : "◉ Marque : DELL" -> "Marque : DELL"
 */
export function cleanBulletPoints(rawText: string | null | undefined): string[] {
    if (!rawText || typeof rawText !== 'string') return [];

    // Séparer par saut de ligne
    const lines = rawText.split(/\r\n|\n|\r/);
    const cleaned: string[] = [];

    // Regex pour les puces unicode courantes au début d'une ligne
    // • (u2022), ◉ (u25c9), - , * , ▪ (u25aa), ▫ (u25ab), – (u2013), — (u2014), ● (u25cf), ○ (u25cb), ► (u25ba), → (u2192), · (u00b7)
    const bulletRegex = /^[\s•◉\-\*▪▫–—●○►→·\u2022\u25C9\u25A0\u25AA\u25CF\u25B6\u27A4\u2023\u25E6]+\s*/u;

    for (const rawLine of lines) {
        const trimmed = rawLine.trim();
        if (!trimmed) continue;

        // Supprimer la puce de début de ligne tout en conservant le contenu textuel intact
        const withoutBullet = trimmed.replace(bulletRegex, '').trim();
        if (withoutBullet) {
            cleaned.push(withoutBullet);
        }
    }

    return cleaned;
}

/**
 * Initialise le SDK Cloudinary si ce n'est pas déjà fait
 */
function initCloudinaryConfig() {
    cloudinary.config({
        cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
}

/**
 * Normalise un produit brut Django vers le format propre Baraka
 */
export function normalizeDjangoProduct(raw: DjangoRawProduct): DjangoCleanProduct {
    const rawImages = Array.isArray(raw.images) ? raw.images : [];
    
    // Trier les images selon l'ordre spécifié par Django (ou par leur index naturel)
    const sortedImages = [...rawImages].sort((a, b) => {
        const orderA = typeof a.order === 'number' ? a.order : 0;
        const orderB = typeof b.order === 'number' ? b.order : 0;
        return orderA - orderB;
    });

    const cleanImages: DjangoCleanImage[] = sortedImages
        .filter(img => img && typeof img.image === 'string' && img.image.trim())
        .map((img, idx) => ({
            id: img.id || idx,
            originalUrl: img.image,
            resolvedUrl: resolveDjangoImageUrl(img.image),
            proxyUrl: getDjangoImageProxyUrl(img.image),
            order: typeof img.order === 'number' ? img.order : idx
        }));

    const rawLibelle = typeof raw.libelle === 'string' ? raw.libelle.trim() : '';
    const rawDesc = typeof raw.description === 'string' ? raw.description : '';
    const cleanedFeatures = cleanBulletPoints(rawDesc);

    return {
        id: raw.id,
        reference: (raw.reference || '').trim(),
        name: (raw.name || '').trim(),
        libelle: rawLibelle,
        shortDescription: rawLibelle,
        hasLibelle: Boolean(rawLibelle),
        rawDescription: rawDesc,
        features: cleanedFeatures,
        featuresText: cleanedFeatures.join('\n'),
        images: cleanImages,
        imageCount: cleanImages.length,
        active: raw.active === true
    };
}

// ---------------------------------------------------------------------------
// CORE SERVICE METHODS
// ---------------------------------------------------------------------------

/**
 * Recherche des produits dans l'API Django
 * - Filtre STRICTEMENT les produits éligibles : active === true
 * - Rapproche les références avec la base Baraka Shop
 */
export async function searchDjangoProducts(params?: {
    q?: string;
    page?: number;
    pageSize?: number;
}): Promise<SearchDjangoResult> {
    try {
        const url = getDjangoProductsUrl({
            q: params?.q,
            page: params?.page || 1,
            pageSize: params?.pageSize || 20
        });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'BarakaShop-Admin/1.0'
            },
            signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));

        if (!response.ok) {
            return {
                success: false,
                count: 0,
                page: params?.page || 1,
                pageSize: params?.pageSize || 20,
                results: [],
                error: `Erreur API Django (${response.status} ${response.statusText}). Vérifiez la disponibilité du backend.`
            };
        }

        const data = await response.json();

        if (!data || !Array.isArray(data.results)) {
            return {
                success: false,
                count: 0,
                page: params?.page || 1,
                pageSize: params?.pageSize || 20,
                results: [],
                error: "Format de réponse inattendu de l'API Django."
            };
        }

        // Filtre STRICT côté serveur : seuls les produits avec active === true sont importables
        const eligibleRaw: DjangoRawProduct[] = data.results.filter(
            (p: any) => p && typeof p === 'object' && p.active === true
        );

        const cleanList = eligibleRaw.map(normalizeDjangoProduct);

        // Rapprochement avec les produits existants dans la base Baraka
        const references = cleanList.map(p => p.reference).filter(Boolean);
        if (references.length > 0) {
            const barakaProducts = await prisma.product.findMany({
                where: {
                    reference: { in: references }
                },
                select: {
                    id: true,
                    reference: true,
                    name: true,
                    shortDescription: true,
                    features: true,
                    images: true,
                    isPublished: true,
                    categoryId: true,
                    brandId: true,
                    category: {
                        select: { name: true }
                    },
                    brand: {
                        select: { name: true }
                    }
                }
            });

            const barakaMap = new Map<string, typeof barakaProducts[0]>();
            for (const bp of barakaProducts) {
                if (bp.reference) {
                    barakaMap.set(bp.reference.toLowerCase().trim(), bp);
                }
            }

            for (const item of cleanList) {
                const match = barakaMap.get(item.reference.toLowerCase().trim());
                if (match) {
                    item.barakaMatch = {
                        exists: true,
                        productId: match.id,
                        reference: match.reference || undefined,
                        currentName: match.name,
                        currentShortDescription: match.shortDescription || undefined,
                        currentFeatures: Array.isArray(match.features) ? (match.features as string[]) : [],
                        currentImages: match.images || [],
                        isPublished: match.isPublished,
                        categoryId: match.categoryId,
                        categoryName: match.category?.name,
                        brandId: match.brandId || undefined,
                        brandName: match.brand?.name || undefined
                    };
                } else {
                    item.barakaMatch = {
                        exists: false
                    };
                }
            }
        }

        return {
            success: true,
            count: typeof data.count === 'number' ? data.count : cleanList.length,
            page: params?.page || 1,
            pageSize: params?.pageSize || 20,
            results: cleanList
        };
    } catch (err: any) {
        if (err.name === 'AbortError') {
            return {
                success: false,
                count: 0,
                page: params?.page || 1,
                pageSize: params?.pageSize || 20,
                results: [],
                error: "Délai d'attente dépassé (timeout) lors de la communication avec l'API Django."
            };
        }
        return {
            success: false,
            count: 0,
            page: params?.page || 1,
            pageSize: params?.pageSize || 20,
            results: [],
            error: err.message || "Erreur réseau lors de la communication avec l'API Django."
        };
    }
}

/**
 * Récupère un produit Django spécifique par sa référence exacte
 */
export async function getDjangoProductByReference(reference: string): Promise<{
    success: boolean;
    product?: DjangoCleanProduct;
    error?: string;
}> {
    if (!reference || !reference.trim()) {
        return { success: false, error: "Référence produit requise." };
    }

    const cleanRef = reference.trim();
    const searchRes = await searchDjangoProducts({ q: cleanRef, pageSize: 10 });

    if (!searchRes.success) {
        return { success: false, error: searchRes.error };
    }

    // Trouver la correspondance exacte sur la référence
    const exactMatch = searchRes.results.find(
        p => p.reference.toLowerCase().trim() === cleanRef.toLowerCase()
    );

    if (!exactMatch) {
        // Fallback : premier résultat si la référence partielle correspond
        const partialMatch = searchRes.results[0];
        if (partialMatch) {
            return { success: true, product: partialMatch };
        }
        return { success: false, error: `Aucun produit actif trouvé dans Django pour la référence "${cleanRef}".` };
    }

    return { success: true, product: exactMatch };
}

// ---------------------------------------------------------------------------
// IMAGE TRANSFER & SSRF PROTECTION
// ---------------------------------------------------------------------------

/**
 * Télécharge une image depuis Django et l'uploade de manière sécurisée vers Cloudinary
 * pour garantir une URL persistante et empêcher les liens temporaires/brisés.
 */
export async function transferSingleImageToCloudinary(imageUrl: string): Promise<{
    success: boolean;
    url?: string;
    error?: string;
}> {
    if (!imageUrl || typeof imageUrl !== 'string') {
        return { success: false, error: "URL d'image invalide." };
    }

    const cleanUrl = resolveDjangoImageUrl(imageUrl);

    // 1. Validation de sécurité SSRF
    if (!isAllowedDjangoImageUrl(cleanUrl)) {
        return {
            success: false,
            error: `Origine d'image non autorisée pour des raisons de sécurité SSRF (${cleanUrl}).`
        };
    }

    try {
        initCloudinaryConfig();

        // 2. Téléchargement côté serveur avec timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(cleanUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'BarakaShop-Admin-ImageTransfer/1.0'
            },
            signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));

        if (!response.ok) {
            return {
                success: false,
                error: `Image Django inaccessible (${response.status} ${response.statusText}).`
            };
        }

        // 3. Validation MIME type
        const contentType = (response.headers.get('content-type') || '').toLowerCase();
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml'];
        const isAllowedType = allowedTypes.some(t => contentType.includes(t));
        if (!isAllowedType && !contentType.startsWith('image/')) {
            return {
                success: false,
                error: `Format d'image non supporté ou invalide (${contentType}).`
            };
        }

        // 4. Validation de la taille (max 20 Mo)
        const contentLength = response.headers.get('content-length');
        if (contentLength && parseInt(contentLength, 10) > 20 * 1024 * 1024) {
            return {
                success: false,
                error: "L'image dépasse la taille maximale autorisée (20 Mo)."
            };
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (buffer.length > 20 * 1024 * 1024) {
            return {
                success: false,
                error: "L'image dépasse la taille maximale autorisée (20 Mo)."
            };
        }

        // Synchroniser le timestamp réel pour éviter les rejets d'horloge locale
        let timestamp = Math.floor(Date.now() / 1000);
        try {
            const timeCheck = await fetch('https://www.google.com', { method: 'HEAD' });
            const dateHeader = timeCheck.headers.get('date');
            if (dateHeader) {
                timestamp = Math.floor(new Date(dateHeader).getTime() / 1000);
            }
        } catch {}

        // 5. Upload vers Cloudinary
        const uploadedUrl = await new Promise<string>((resolve, reject) => {
            cloudinary.uploader.upload_stream({
                folder: 'products_baraka',
                resource_type: 'image',
                timestamp: timestamp
            }, (error, result) => {
                if (error) reject(error);
                else if (result?.secure_url) resolve(result.secure_url);
                else reject(new Error('Cloudinary upload missing secure_url'));
            }).end(buffer);
        });

        return { success: true, url: uploadedUrl };
    } catch (err: any) {
        console.error("Image transfer error:", err);
        return {
            success: false,
            error: err.message || "Échec du transfert vers Cloudinary."
        };
    }
}

/**
 * Transfère une liste ordonnée d'images Django vers Cloudinary
 * PRÉSERVE STRICTEMENT L'ORDRE INITIAL
 */
export async function transferDjangoImagesToCloudinary(imageUrls: string[]): Promise<{
    urls: string[];
    failures: Array<{ url: string; error: string }>;
}> {
    const urls: string[] = [];
    const failures: Array<{ url: string; error: string }> = [];

    // Transfert séquentiel pour préserver strictement l'ordre d'origine
    for (const imgUrl of imageUrls) {
        if (!imgUrl) continue;
        const result = await transferSingleImageToCloudinary(imgUrl);
        if (result.success && result.url) {
            urls.push(result.url);
        } else {
            failures.push({
                url: imgUrl,
                error: result.error || "Erreur de transfert"
            });
        }
    }

    return { urls, failures };
}

// ---------------------------------------------------------------------------
// BATCH IMPORT EXECUTION
// ---------------------------------------------------------------------------

export interface BatchImportOptions {
    defaultCategoryId?: string;
}

/**
 * Exécute l'importation par lot pour Workflow A
 * Concurrence contrôlée, gestion par produit, aucune publication automatique.
 */
export async function executeBatchImport(
    items: BatchImportItemInput[],
    options?: BatchImportOptions
): Promise<{
    totalProcessed: number;
    successCount: number;
    failureCount: number;
    results: BatchImportResultItem[];
}> {
    const results: BatchImportResultItem[] = [];

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        try {
            // 1. Récupérer le produit Django à jour
            const djangoRes = await getDjangoProductByReference(item.reference);
            if (!djangoRes.success || !djangoRes.product) {
                results.push({
                    djangoId: item.djangoId,
                    reference: item.reference,
                    success: false,
                    action: 'failed',
                    message: djangoRes.error || "Produit introuvable dans Django",
                    importedFields: []
                });
                continue;
            }

            const djProduct = djangoRes.product;

            // Vérification stricte active
            if (djProduct.active !== true) {
                results.push({
                    djangoId: item.djangoId,
                    reference: item.reference,
                    success: false,
                    action: 'skipped',
                    message: "Produit inactif (active !== true)",
                    importedFields: []
                });
                continue;
            }

            // 2. Chercher dans Baraka DB par référence
            const existingBarakaProduct = await prisma.product.findUnique({
                where: { reference: item.reference }
            });

            const importedFieldsList: string[] = [];

            // Préparer les données à injecter
            const updatePayload: Record<string, any> = {};

            if (item.selectedFields.name && djProduct.name) {
                updatePayload.name = djProduct.name;
                importedFieldsList.push('name');
            }

            if (item.selectedFields.shortDescription) {
                // Si le libelle est vide, ne pas écraser silencieusement par du vide
                if (djProduct.hasLibelle) {
                    updatePayload.shortDescription = djProduct.shortDescription;
                    importedFieldsList.push('shortDescription');
                }
            }

            if (item.selectedFields.features) {
                updatePayload.features = djProduct.features;
                importedFieldsList.push('features');
            }

            // Gestion des images
            let transferredCount = 0;
            if (item.selectedFields.images && djProduct.images.length > 0) {
                const imageMode = item.selectedFields.imageMode || 'append';
                if (imageMode !== 'ignore') {
                    const rawUrls = djProduct.images.map(img => img.resolvedUrl);
                    const transferRes = await transferDjangoImagesToCloudinary(rawUrls);
                    const newCloudinaryUrls = transferRes.urls;
                    transferredCount = newCloudinaryUrls.length;

                    if (newCloudinaryUrls.length > 0) {
                        if (imageMode === 'replace') {
                            updatePayload.images = newCloudinaryUrls;
                        } else {
                            // append
                            const existingImages = existingBarakaProduct?.images || [];
                            // Déduplication simple
                            const combined = [...existingImages];
                            for (const u of newCloudinaryUrls) {
                                if (!combined.includes(u)) {
                                    combined.push(u);
                                }
                            }
                            updatePayload.images = combined;
                        }
                        importedFieldsList.push(`images (${transferredCount})`);
                    }
                }
            }

            if (existingBarakaProduct) {
                // Mise à jour ciblée UNIQUEMENT des champs autorisés
                if (Object.keys(updatePayload).length > 0) {
                    const updated = await prisma.product.update({
                        where: { id: existingBarakaProduct.id },
                        data: updatePayload
                    });

                    results.push({
                        djangoId: item.djangoId,
                        reference: item.reference,
                        success: true,
                        action: 'updated',
                        barakaProductId: updated.id,
                        message: `Produit existant mis à jour avec succès (${importedFieldsList.join(', ')}).`,
                        importedFields: importedFieldsList,
                        imagesTransferredCount: transferredCount
                    });
                } else {
                    results.push({
                        djangoId: item.djangoId,
                        reference: item.reference,
                        success: true,
                        action: 'skipped',
                        barakaProductId: existingBarakaProduct.id,
                        message: "Aucun champ sélectionné ou modification nécessaire.",
                        importedFields: []
                    });
                }
            } else {
                // Le produit n'existe pas dans Baraka
                // Résolution de la catégorie d'affectation
                let categoryIdToAssign = options?.defaultCategoryId;
                if (categoryIdToAssign) {
                    const catCheck = await prisma.category.findUnique({
                        where: { id: categoryIdToAssign },
                        select: { id: true }
                    });
                    if (!catCheck) {
                        categoryIdToAssign = undefined;
                    }
                }

                if (!categoryIdToAssign) {
                    const firstCategory = await prisma.category.findFirst({
                        select: { id: true }
                    });

                    if (!firstCategory) {
                        results.push({
                            djangoId: item.djangoId,
                            reference: item.reference,
                            success: false,
                            action: 'failed',
                            message: "Impossible de créer le produit : aucune catégorie disponible dans Baraka.",
                            importedFields: []
                        });
                        continue;
                    }
                    categoryIdToAssign = firstCategory.id;
                }

                // Génération d'un slug unique
                const baseSlug = djProduct.name
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '') || 'produit';
                
                const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;

                // Création SANS publication automatique (isPublished: false)
                const created = await prisma.product.create({
                    data: {
                        name: updatePayload.name || djProduct.name || `Produit ${item.reference}`,
                        slug: uniqueSlug,
                        reference: item.reference,
                        shortDescription: updatePayload.shortDescription || (djProduct.hasLibelle ? djProduct.shortDescription : null),
                        features: updatePayload.features || djProduct.features,
                        images: updatePayload.images || [],
                        categoryId: categoryIdToAssign,
                        price: 0,
                        stock: 0,
                        isPublished: false // CRUCIAL : Jamais publié automatiquement
                    }
                });

                results.push({
                    djangoId: item.djangoId,
                    reference: item.reference,
                    success: true,
                    action: 'created',
                    barakaProductId: created.id,
                    message: "Nouveau produit créé en brouillon non publié.",
                    importedFields: importedFieldsList,
                    imagesTransferredCount: transferredCount
                });
            }
        } catch (itemErr: any) {
            console.error(`Error importing item ${item.reference}:`, itemErr);
            results.push({
                djangoId: item.djangoId,
                reference: item.reference,
                success: false,
                action: 'failed',
                message: itemErr.message || "Erreur interne lors de l'enregistrement",
                importedFields: []
            });
        }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return {
        totalProcessed: items.length,
        successCount,
        failureCount,
        results
    };
}
