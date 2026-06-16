import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/admin',
                    '/api/',
                    '/login',
                    '/maintenance',
                    '/private/',
                    '/_next/',
                ],
            },
        ],
        sitemap: 'https://baraka.sn/sitemap.xml',
    }
}
