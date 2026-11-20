/**
 * Configuration centralisée de l'API Django
 * 
 * Cette configuration garantit que l'URL root est lue exclusivement côté serveur
 * depuis la variable d'environnement DJANGO_API_BASE_URL, sans jamais être exposée
 * au client ni dupliquée dans le code.
 */

export function getDjangoBaseUrl(): string {
    const rawUrl = process.env.DJANGO_API_BASE_URL;

    if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
        throw new Error(
            "Configuration manquante : la variable d'environnement DJANGO_API_BASE_URL n'est pas définie. " +
            "Veuillez configurer DJANGO_API_BASE_URL (ex: https://backend.barakasn.com/api/v0) dans votre fichier .env.local ou sur Vercel."
        );
    }

    const trimmed = rawUrl.trim();

    try {
        const parsed = new URL(trimmed);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            throw new Error(`Protocole non supporté pour DJANGO_API_BASE_URL : ${parsed.protocol}`);
        }
        // Supprimer les slashs terminaux pour éviter les doubles slashs
        return trimmed.replace(/\/+$/, '');
    } catch (e: any) {
        throw new Error(
            `DJANGO_API_BASE_URL invalide ("${trimmed}") : ${e.message}. ` +
            "Attendu : une URL valide (ex: https://backend.barakasn.com/api/v0)."
        );
    }
}

/**
 * Retourne l'hôte de base (protocole + domaine) déduit de DJANGO_API_BASE_URL
 * Exemple : 'https://backend.barakasn.com'
 */
export function getDjangoHost(): string {
    const baseUrl = getDjangoBaseUrl();
    const parsed = new URL(baseUrl);
    return `${parsed.protocol}//${parsed.host}`;
}

/**
 * Construit l'URL complète pour l'endpoint des produits Django
 */
export function getDjangoProductsUrl(params?: { q?: string; page?: number; pageSize?: number }): string {
    const baseUrl = getDjangoBaseUrl();
    const url = new URL(`${baseUrl}/products/products-web/`);

    if (params?.q && params.q.trim()) {
        url.searchParams.set('q', params.q.trim());
    }
    if (params?.page && params.page > 1) {
        url.searchParams.set('page', String(params.page));
    }
    if (params?.pageSize && params.pageSize > 0) {
        url.searchParams.set('page_size', String(params.pageSize));
    }

    return url.toString();
}

/**
 * Résout une URL d'image Django (relative ou absolue) vers une URL absolue accessible.
 * Exemple : '/media/product_iamges/test.jpg' -> 'https://backend.barakasn.com/media/product_iamges/test.jpg'
 */
export function resolveDjangoImageUrl(imagePath: string): string {
    if (!imagePath || typeof imagePath !== 'string') return '';
    const trimmed = imagePath.trim();
    if (!trimmed) return '';

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
    }

    const host = getDjangoHost();
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${host}${cleanPath}`;
}

/**
 * Retourne l'URL de proxy interne Baraka pour afficher l'image sans blocage CORS ou Referrer
 */
export function getDjangoImageProxyUrl(imagePath: string): string {
    if (!imagePath) return '';
    const resolved = resolveDjangoImageUrl(imagePath);
    if (!resolved) return '';
    return `/api/admin/django-image-proxy?url=${encodeURIComponent(resolved)}`;
}

/**
 * Valide qu'une URL d'image provient d'un domaine autorisé et ne constitue pas une tentative de SSRF.
 */
export function isAllowedDjangoImageUrl(urlStr: string): boolean {
    try {
        const parsed = new URL(urlStr);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return false;
        }

        const hostname = parsed.hostname.toLowerCase();

        // Blocage strict des adresses privées / locales (SSRF prevention)
        if (
            hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname === '::1' ||
            hostname === '0.0.0.0' ||
            hostname.endsWith('.local') ||
            hostname.endsWith('.internal') ||
            /^10\./.test(hostname) ||
            /^192\.168\./.test(hostname) ||
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
            /^169\.254\./.test(hostname) // Link-local / metadata
        ) {
            return false;
        }

        // Domaine Django configuré
        const djangoHost = new URL(getDjangoHost()).hostname.toLowerCase();
        if (hostname === djangoHost) {
            return true;
        }

        // Domaines Cloudinary existants ou autorisés
        if (hostname.endsWith('res.cloudinary.com') || hostname === 'backend.barakasn.com' || hostname.endsWith('.barakasn.com')) {
            return true;
        }

        return false;
    } catch {
        return false;
    }
}
