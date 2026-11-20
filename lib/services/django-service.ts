import { v2 as cloudinary } from 'cloudinary';
import prisma from '@/lib/prisma';
import { getCache, setCache } from '@/lib/redis';
import {
    DJANGO_TAXONOMY,
    DJANGO_BRAND_NAMES,
    normalizeSearchText
} from './django-catalog-taxonomy';
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
    category?: number;
    brand?: number | null;
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
    subCategoryId?: string;
    subCategoryName?: string;
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
    brandId?: number | null;
    brandName?: string;
    categoryId?: number;
    subCategoryId?: string;
    subCategoryName?: string;
    categoryFamily?: string;
    barakaMatch?: BarakaMatchInfo | null;
}

export interface SearchDjangoResult {
    success: boolean;
    count: number;
    page: number;
    pageSize: number;
    totalPages?: number;
    tabCounts?: {
        all: number;
        existing: number;
        new: number;
    };
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

    const bId = typeof raw.brand === 'number' ? raw.brand : null;
    const bName = bId ? (DJANGO_BRAND_NAMES[bId] || `Marque #${bId}`) : '';
    const cId = typeof raw.category === 'number' ? raw.category : undefined;
    const tax = (cId !== undefined && DJANGO_TAXONOMY[cId])
        ? DJANGO_TAXONOMY[cId]
        : { name: cId !== undefined ? `Catégorie #${cId}` : 'Non catégorisé', family: 'AUTRE' };

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
        active: raw.active === true,
        brandId: bId,
        brandName: bName,
        categoryId: cId,
        subCategoryId: cId !== undefined ? String(cId) : undefined,
        subCategoryName: tax.name,
        categoryFamily: tax.family
    };
}

// ---------------------------------------------------------------------------
// CACHE & FILTER ENGINE
// ---------------------------------------------------------------------------

export interface DjangoIndexedItem extends DjangoCleanProduct {
    searchIndex: string;
}

const globalForCatalog = globalThis as unknown as {
    __djangoCatalogCache?: { items: DjangoIndexedItem[]; cachedAt: number };
    __barakaRefSetCache?: { set: Set<string>; cachedAt: number };
    __barakaMatchCache?: Map<string, any>;
};

const CATALOG_CACHE_TTL_SECONDS = 1800; // 30 minutes
const CATALOG_REDIS_KEY = 'django:full_catalog_v2';
const BARAKA_REF_CACHE_TTL_MS = 120_000; // 2 minutes

/**
 * Récupère le set des références Baraka avec cache mémoire ultra-rapide (0ms)
 * Évite les allers-retours SQL Neon Postgres répétés à chaque frappe.
 */
async function getCachedBarakaRefSet(): Promise<Set<string>> {
    const now = Date.now();
    if (globalForCatalog.__barakaRefSetCache && (now - globalForCatalog.__barakaRefSetCache.cachedAt) < BARAKA_REF_CACHE_TTL_MS) {
        return globalForCatalog.__barakaRefSetCache.set;
    }

    try {
        const barakaProducts = await prisma.product.findMany({
            select: { reference: true }
        });
        const refSet = new Set(
            barakaProducts
                .map(p => (p.reference || '').trim().toLowerCase())
                .filter(Boolean)
        );
        globalForCatalog.__barakaRefSetCache = {
            set: refSet,
            cachedAt: now
        };
        return refSet;
    } catch {
        return globalForCatalog.__barakaRefSetCache?.set || new Set();
    }
}

/**
 * Invalide le cache des correspondances Baraka après un import
 */
export function invalidateBarakaCatalogCache() {
    globalForCatalog.__barakaRefSetCache = undefined;
    globalForCatalog.__barakaMatchCache?.clear();
}

/**
 * Récupère le catalogue complet des 2 309 produits actifs Django
 * Utilise un cache à 2 niveaux (Mémoire L1 persistée + Redis) pour une réponse ultra-rapide (<5ms).
 */
export async function getCachedDjangoCatalog(): Promise<DjangoIndexedItem[]> {
    const now = Date.now();
    if (globalForCatalog.__djangoCatalogCache && (now - globalForCatalog.__djangoCatalogCache.cachedAt) < CATALOG_CACHE_TTL_SECONDS * 1000) {
        return globalForCatalog.__djangoCatalogCache.items;
    }

    // 1. Tenter le cache Redis
    try {
        const cached = await getCache<DjangoIndexedItem[]>(CATALOG_REDIS_KEY);
        if (Array.isArray(cached) && cached.length > 0) {
            globalForCatalog.__djangoCatalogCache = {
                items: cached,
                cachedAt: now
            };
            return cached;
        }
    } catch {
        // Ignorer l'erreur Redis et continuer
    }

    // 2. Si non présent en cache, charger depuis l'API Django
    let rawProducts: DjangoRawProduct[] = [];
    try {
        const firstUrl = getDjangoProductsUrl({ page: 1, pageSize: 100 });
        const firstRes = await fetch(firstUrl, {
            headers: { 'Accept': 'application/json', 'User-Agent': 'BarakaShop-Admin/1.0' },
            signal: AbortSignal.timeout(15000)
        });

        if (firstRes.ok) {
            const firstData = await firstRes.json();
            if (firstData && Array.isArray(firstData.results)) {
                rawProducts.push(...firstData.results);
                const totalCount = typeof firstData.count === 'number' ? firstData.count : 2309;
                const totalPages = Math.ceil(totalCount / 100);

                // Charger les pages 2 à N avec une concurrence contrôlée
                const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
                const BATCH_SIZE = 6;
                for (let i = 0; i < remainingPages.length; i += BATCH_SIZE) {
                    const batch = remainingPages.slice(i, i + BATCH_SIZE);
                    const batchResults = await Promise.all(
                        batch.map(async (pageNum) => {
                            try {
                                const pageUrl = getDjangoProductsUrl({ page: pageNum, pageSize: 100 });
                                const res = await fetch(pageUrl, {
                                    headers: { 'Accept': 'application/json', 'User-Agent': 'BarakaShop-Admin/1.0' },
                                    signal: AbortSignal.timeout(15000)
                                });
                                if (res.ok) {
                                    const d = await res.json();
                                    return Array.isArray(d.results) ? d.results : [];
                                }
                            } catch {
                                // Ignorer les erreurs d'une page individuelle
                            }
                            return [];
                        })
                    );
                    for (const resList of batchResults) {
                        rawProducts.push(...resList);
                    }
                }
            }
        }
    } catch (err) {
        console.warn('[DjangoCatalog] Erreur lors du fetch distant API Django:', err);
    }

    // 3. Fallback d'urgence : seed local scratch_django_products.json si le fetch distant a échoué
    if (rawProducts.length === 0) {
        try {
            const fs = await import('fs');
            const path = await import('path');
            const fallbackPath = path.resolve(process.cwd(), 'scratch_django_products.json');
            if (fs.existsSync(fallbackPath)) {
                rawProducts = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
            }
        } catch {
            // Ignorer
        }
    }

    // Filtrer strictement les produits actifs
    const eligibleRaw = rawProducts.filter(p => p && typeof p === 'object' && p.active === true);
    const cleanProducts = eligibleRaw.map(normalizeDjangoProduct);

    // Indexer pour la recherche multi-critères
    const indexedItems: DjangoIndexedItem[] = cleanProducts.map(p => {
        const searchIndex = normalizeSearchText(
            `${p.reference} ${p.name} ${p.libelle} ${p.rawDescription} ${p.brandName || ''} ${p.subCategoryName || ''} ${p.categoryFamily || ''}`
        );
        return {
            ...p,
            searchIndex
        };
    });

    globalForCatalog.__djangoCatalogCache = {
        items: indexedItems,
        cachedAt: now
    };

    try {
        await setCache(CATALOG_REDIS_KEY, indexedItems, CATALOG_CACHE_TTL_SECONDS);
    } catch {
        // Ignorer
    }

    return indexedItems;
}

/**
 * Retourne les options de filtres (Marques, Catégories, Sous-catégories) construites
 * exclusivement à partir des données réelles du catalogue Django.
 */
export async function getDjangoCatalogFilterOptions(): Promise<{
    success: boolean;
    brands: Array<{ id: string; name: string; count: number }>;
    categories: Array<{
        id: string;
        name: string;
        count: number;
        subCategories: Array<{ id: string; name: string; count: number }>;
    }>;
    totalCount: number;
    error?: string;
}> {
    try {
        const items = await getCachedDjangoCatalog();

        // 1. Construire les marques Django
        const brandCountMap = new Map<number, { name: string; count: number }>();
        for (const item of items) {
            if (item.brandId) {
                const existing = brandCountMap.get(item.brandId);
                if (existing) {
                    existing.count++;
                } else {
                    brandCountMap.set(item.brandId, {
                        name: item.brandName || `Marque #${item.brandId}`,
                        count: 1
                    });
                }
            }
        }

        const brands = Array.from(brandCountMap.entries())
            .map(([id, val]) => ({
                id: String(id),
                name: val.name,
                count: val.count
            }))
            .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));

        // 2. Construire les catégories et sous-catégories Django
        const familyMap = new Map<string, {
            count: number;
            subCategories: Map<string, { name: string; count: number }>;
        }>();

        for (const item of items) {
            const family = item.categoryFamily || 'AUTRE';
            const subId = item.subCategoryId || 'none';
            const subName = item.subCategoryName || 'Autre';

            if (!familyMap.has(family)) {
                familyMap.set(family, {
                    count: 0,
                    subCategories: new Map()
                });
            }
            const familyEntry = familyMap.get(family)!;
            familyEntry.count++;

            const subEntry = familyEntry.subCategories.get(subId);
            if (subEntry) {
                subEntry.count++;
            } else {
                familyEntry.subCategories.set(subId, {
                    name: subName,
                    count: 1
                });
            }
        }

        const categories = Array.from(familyMap.entries())
            .map(([family, data]) => ({
                id: family,
                name: family,
                count: data.count,
                subCategories: Array.from(data.subCategories.entries())
                    .map(([sId, sData]) => ({
                        id: sId,
                        name: sData.name,
                        count: sData.count
                    }))
                    .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }))
            }))
            .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));

        return {
            success: true,
            brands,
            categories,
            totalCount: items.length
        };
    } catch (err: any) {
        return {
            success: false,
            brands: [],
            categories: [],
            totalCount: 0,
            error: err.message || "Erreur lors de la construction des options de filtre Django."
        };
    }
}

/**
 * Recherche et filtrage multi-critères des produits Django
 * - Tous les filtres (Recherche, Marque, Catégorie, Sous-catégorie) s'appliquent EXCLUSIVEMENT sur Django
 * - Logique combinatoire stricte (AND)
 * - Rapprochement avec Baraka pour calculer les compteurs d'onglets (Tous / Existants / Nouveaux)
 * - Pagination globale conforme au standard moderne
 */
export async function searchDjangoProducts(params?: {
    q?: string;
    brandId?: string;
    categoryFamily?: string;
    subCategoryId?: string;
    tab?: 'all' | 'existing' | 'new';
    page?: number;
    pageSize?: number;
}): Promise<SearchDjangoResult> {
    try {
        const items = await getCachedDjangoCatalog();

        // 1. Récupérer l'ensemble des références existantes dans Baraka Shop depuis le cache mémoire (0ms)
        const barakaRefSet = await getCachedBarakaRefSet();

        // 2. Filtrer le catalogue selon les critères actifs (AND)
        let filtered = items;

        // Filtre Recherche textuelle (référence, nom, libellé, description, mots-clés)
        if (params?.q && params.q.trim()) {
            const normalizedQuery = normalizeSearchText(params.q);
            const searchTerms = normalizedQuery.split(/\s+/).filter(Boolean);
            if (searchTerms.length > 0) {
                filtered = filtered.filter(item =>
                    searchTerms.every(term => item.searchIndex.includes(term))
                );
            }
        }

        // Filtre Marque Django
        if (params?.brandId && params.brandId.trim()) {
            const bIdStr = params.brandId.trim();
            filtered = filtered.filter(item => String(item.brandId) === bIdStr);
        }

        // Filtre Catégorie principale Django
        if (params?.categoryFamily && params.categoryFamily.trim()) {
            const catFamily = params.categoryFamily.trim();
            filtered = filtered.filter(item => item.categoryFamily === catFamily);
        }

        // Filtre Sous-catégorie Django
        if (params?.subCategoryId && params.subCategoryId.trim()) {
            const subId = params.subCategoryId.trim();
            filtered = filtered.filter(item => item.subCategoryId === subId);
        }

        // 3. Calculer les compteurs réels d'onglets pour cet ensemble filtré
        const countAll = filtered.length;
        let countExisting = 0;
        let countNew = 0;

        for (const item of filtered) {
            const isMatch = barakaRefSet.has(item.reference.toLowerCase());
            if (isMatch) countExisting++;
            else countNew++;
        }

        // 4. Appliquer le filtre de l'onglet actif si sélectionné
        const activeTab = params?.tab || 'all';
        if (activeTab === 'existing') {
            filtered = filtered.filter(item => barakaRefSet.has(item.reference.toLowerCase()));
        } else if (activeTab === 'new') {
            filtered = filtered.filter(item => !barakaRefSet.has(item.reference.toLowerCase()));
        }

        // 5. Pagination globale
        const pageSize = params?.pageSize || 12;
        const totalCount = filtered.length;
        const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
        const requestedPage = Math.max(1, params?.page || 1);
        const currentPage = Math.min(requestedPage, totalPages);

        const startIndex = (currentPage - 1) * pageSize;
        const pageItems = filtered.slice(startIndex, startIndex + pageSize);

        // 6. Rapprocher les 12 produits de la page courante avec les détails de Baraka (avec cache mémoire)
        if (!globalForCatalog.__barakaMatchCache) {
            globalForCatalog.__barakaMatchCache = new Map();
        }
        const matchCache = globalForCatalog.__barakaMatchCache;

        const pageRefs = pageItems.map(p => p.reference).filter(Boolean);
        const missingRefs = pageRefs.filter(ref => !matchCache.has(ref.toLowerCase().trim()));

        if (missingRefs.length > 0) {
            try {
                const detailedMatches = await prisma.product.findMany({
                    where: {
                        reference: { in: missingRefs }
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
                        subCategoryId: true,
                        brandId: true,
                        category: { select: { name: true } },
                        subCategory: { select: { name: true } },
                        brand: { select: { name: true } }
                    }
                });

                const foundSet = new Set<string>();
                for (const dm of detailedMatches) {
                    if (dm.reference) {
                        const cleanR = dm.reference.toLowerCase().trim();
                        foundSet.add(cleanR);
                        matchCache.set(cleanR, {
                            exists: true,
                            productId: dm.id,
                            reference: dm.reference || undefined,
                            currentName: dm.name,
                            currentShortDescription: dm.shortDescription || undefined,
                            currentFeatures: Array.isArray(dm.features) ? (dm.features as string[]) : [],
                            currentImages: dm.images || [],
                            isPublished: dm.isPublished,
                            categoryId: dm.categoryId,
                            categoryName: dm.category?.name,
                            subCategoryId: dm.subCategoryId || undefined,
                            subCategoryName: dm.subCategory?.name || undefined,
                            brandId: dm.brandId || undefined,
                            brandName: dm.brand?.name || undefined
                        });
                    }
                }

                // Pour les références absentes de Baraka, mettre en cache un marqueur { exists: false }
                for (const ref of missingRefs) {
                    const cleanR = ref.toLowerCase().trim();
                    if (!foundSet.has(cleanR)) {
                        matchCache.set(cleanR, { exists: false });
                    }
                }
            } catch {
                // En cas d'erreur DB, fallback sur le refSet
            }
        }

        // Assigner les barakaMatch depuis le cache mémoire (instantané)
        for (const item of pageItems) {
            const cleanR = item.reference.toLowerCase().trim();
            const cached = matchCache.get(cleanR);
            if (cached) {
                item.barakaMatch = cached;
            } else {
                item.barakaMatch = { exists: barakaRefSet.has(cleanR) };
            }
        }

        return {
            success: true,
            count: totalCount,
            totalPages,
            page: currentPage,
            pageSize,
            tabCounts: {
                all: countAll,
                existing: countExisting,
                new: countNew
            },
            results: pageItems
        };
    } catch (err: any) {
        return {
            success: false,
            count: 0,
            totalPages: 1,
            page: params?.page || 1,
            pageSize: params?.pageSize || 12,
            results: [],
            error: err.message || "Erreur lors de la recherche des produits Django."
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
    defaultSubCategoryId?: string;
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
                        subCategoryId: options?.defaultSubCategoryId || null,
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

    // Invalider les caches Baraka pour refléter immédiatement les nouveaux produits
    invalidateBarakaCatalogCache();

    return {
        totalProcessed: items.length,
        successCount,
        failureCount,
        results
    };
}
