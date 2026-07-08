import { MetadataRoute } from 'next'
import prisma from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://baraka.sn'

    try {
        // Fetch published products
        const products = await prisma.product.findMany({
            where: { isPublished: true },
            select: { id: true, slug: true, updatedAt: true }
        })

        // Fetch published categories
        const categories = await prisma.category.findMany({
            where: { isPublished: true },
            select: { slug: true }
        })

        // Fetch brands
        const brands = await prisma.brand.findMany({
            select: { slug: true }
        })

        // Fetch univers
        const univers = await prisma.univers.findMany({
            where: { isPublished: true },
            select: { slug: true }
        }).catch(() => [])

        const productUrls = products.map((product) => ({
            url: `${baseUrl}/product/${product.id}`,
            lastModified: product.updatedAt,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }))

        const categoryUrls = categories.map((category) => ({
            url: `${baseUrl}/boutique?category=${category.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }))

        const brandUrls = brands.map((brand) => ({
            url: `${baseUrl}/marques/${brand.slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.6,
        }))

        const universUrls = univers.map((u: any) => ({
            url: `${baseUrl}/univers/${u.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }))

        return [
            {
                url: baseUrl,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 1,
            },
            {
                url: `${baseUrl}/boutique`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 0.9,
            },
            {
                url: `${baseUrl}/promotions`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 0.9,
            },
            {
                url: `${baseUrl}/nouveautes`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 0.8,
            },
            {
                url: `${baseUrl}/about`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.5,
            },
            {
                url: `${baseUrl}/contact`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.5,
            },
            ...categoryUrls,
            ...universUrls,
            ...brandUrls,
            ...productUrls,
        ]
    } catch (error) {
        console.error("Error generating sitemap:", error)
        // Fallback
        return [
            {
                url: baseUrl,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 1,
            },
            {
                url: `${baseUrl}/boutique`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 0.9,
            }
        ]
    }
}
