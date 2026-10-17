import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function slugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

/**
 * Normalise l'URL d'un univers pour assurer une redirection interne fiable
 * que l'on soit en local, sur un sous-domaine ou en production.
 */
export function formatUniverseHref(rawHref?: string | null): string {
    if (!rawHref) return '/boutique'
    const trimmed = rawHref.trim()
    if (!trimmed || trimmed === '#') return '/boutique'

    // Si c'est une URL absolue (ex: https://www.baraka.sn/boutique?...)
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        try {
            const url = new URL(trimmed)
            // Extraire le chemin relatif pour les liens internes du domaine ou localhost
            if (
                url.hostname.includes('baraka.sn') ||
                url.hostname.includes('localhost') ||
                url.hostname.includes('127.0.0.1')
            ) {
                return `${url.pathname}${url.search}${url.hash}` || '/boutique'
            }
            return trimmed
        } catch {
            return trimmed
        }
    }

    if (!trimmed.startsWith('/') && !trimmed.startsWith('http')) {
        return `/boutique?category=${encodeURIComponent(trimmed)}`
    }

    return trimmed
}

/**
 * Optimise dynamiquement les images Cloudinary (WebP/AVIF automatique, compression sans perte visible, redimensionnement ciblé)
 * Réduit drastiquement le poids de la page (de plusieurs Mo à quelques dizaines de Ko)
 */
export function getOptimizedImageUrl(url?: string | null, width: number = 500): string {
    if (!url || typeof url !== 'string') return '/placeholder.png';
    const trimmed = url.trim();
    if (!trimmed) return '/placeholder.png';

    // Optimisation Cloudinary native sans passer par le quota Vercel
    if (trimmed.includes('res.cloudinary.com') && trimmed.includes('/upload/')) {
        if (!trimmed.includes('/upload/f_auto') && !trimmed.includes('/upload/w_')) {
            return trimmed.replace('/upload/', `/upload/f_auto,q_auto:good,w_${width},c_limit/`);
        }
    }
    return trimmed;
}
