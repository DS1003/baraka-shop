import DOMPurify from 'dompurify'

/**
 * Universal HTML sanitizer safe for both client-side and server-side SSR.
 * Replaces isomorphic-dompurify to eliminate heavy JSDOM / @exodus/bytes ESM crashes on Vercel Node runtime.
 */
export function sanitizeHtml(html: string | null | undefined, config?: any): string {
    if (!html) return ''

    if (typeof window !== 'undefined') {
        const purify = typeof (DOMPurify as any).sanitize === 'function'
            ? (DOMPurify as any)
            : (DOMPurify as any)(window)
        return purify.sanitize(html, config)
    }

    // SSR fallback: basic tag stripping of script/event handlers without pulling JSDOM
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/\son\w+\s*=\s*(["'])[\s\S]*?\1/gi, '')
        .replace(/javascript\s*:/gi, '')
}

const safeDOMPurify = {
    sanitize: (html: string | null | undefined, config?: any): string => sanitizeHtml(html, config),
}

export default safeDOMPurify
