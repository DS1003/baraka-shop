import React from 'react'
import { Container } from '@/ui/Container'
import Link from 'next/link'
import { getProductsAction, getCategoriesAction, getBrandsAction } from '@/lib/actions/product-actions'
import { ShopClient } from './ShopClient'
import { Metadata } from 'next'
import { cn } from '@/lib/utils'

export async function generateMetadata({ searchParams }: { searchParams: Promise<any> }): Promise<Metadata> {
    const params = await searchParams
    const category = params.category

    if (category) {
        const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')
        return {
            title: {
                absolute: `${formattedCategory} | Baraka Shop Dakar Sénégal`,
            },
            description: `Achetez ${formattedCategory} chez Baraka Shop (Baraka Electronique). Large choix, meilleur prix garanti. Livraison rapide à Dakar et partout au Sénégal.`,
            keywords: [formattedCategory, 'Baraka electronique', 'baraka shop', 'baraka sn', 'electronique sn', `${formattedCategory} dakar`, `${formattedCategory} sénégal`],
        }
    }

    return {
        title: {
            absolute: 'Boutique en ligne High-Tech | Baraka Shop Sénégal',
        },
        description: 'Parcourez tout notre catalogue chez Baraka Shop (Baraka Electronique) : smartphones, ordinateurs, audio, accessoires high-tech. Livraison rapide à Dakar, Sandaga et partout au Sénégal.',
        keywords: ['Baraka electronique', 'baraka shop', 'baraka sn', 'boutique electronique dakar', 'electronique sn', 'baraka sandaga'],
    }
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<any> }) {
    const params = await searchParams

    // Get filters from URL (support both standard and shorthand query params)
    let category = params.category || ''
    const subCategory = params.subCategory || params.sub || ''
    const thirdLevelCategory = params.thirdLevelCategory || params.third || ''
    const brand = params.brand || ''
    const sort = params.sort || 'newest'
    const page = Number(params.page) || 1
    const minPrice = params.minPrice ? Number(params.minPrice) : undefined
    const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined
    const query = params.q || ''

    // Fetch categories and brands first to recover parent category if missing
    const [categories, brands] = await Promise.all([
        getCategoriesAction(),
        getBrandsAction()
    ])

    if (!category && subCategory && Array.isArray(categories)) {
        const parent = categories.find((c: any) =>
            c.subCategories?.some((s: any) => s.slug === subCategory)
        )
        if (parent) {
            category = parent.slug
        }
    }

    // Fetch data server-side
    const result = await getProductsAction({
        category,
        subCategory,
        thirdLevelCategory,
        brand,
        sort,
        page,
        limit: 30,
        minPrice,
        maxPrice,
        query
    })

    const currentCategoryName = category ? (categories.find((c: any) => c.slug === category)?.name || 'Catégorie') : 'Boutique'

    return (
        <div className="bg-[#f8f9fb] min-h-screen">
            {/* Page Header */}
            <div className="bg-[#1B1F3B] py-7 sm:py-10 md:py-14 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/10 blur-[100px] rounded-full translate-x-1/2" />
                <Container className="relative z-10 flex flex-col items-center text-center px-4">
                    <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2 sm:mb-3">
                        {currentCategoryName}
                    </h1>
                    <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-gray-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest">
                        <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
                        <span className="w-1 h-1 bg-gray-600 rounded-full" />
                        <Link href="/boutique" className={cn("hover:text-primary transition-colors", !category ? "text-primary" : "text-gray-300")}>Boutique</Link>
                        {category && (
                            <>
                                <span className="w-1 h-1 bg-gray-600 rounded-full" />
                                <span className="text-primary truncate max-w-[200px] sm:max-w-none">{currentCategoryName}</span>
                            </>
                        )}
                    </div>
                </Container>
            </div>

            {/* Client Side Interactive Area */}
            <ShopClient
                initialProducts={result.products}
                categories={categories}
                brands={brands}
                pagination={result.pagination}
            />
        </div>
    )
}
