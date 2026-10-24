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
                    '/checkout',
                    '/account',
                ],
            },
        ],
        sitemap: 'https://baraka.sn/sitemap.xml',
    }
}
