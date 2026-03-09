import React from 'react'
import { Container } from '@/ui/Container'
import Link from 'next/link'
import { getProductsAction, getCategoriesAction, getBrandsAction } from '@/lib/actions/product-actions'
import { ShopClient } from './ShopClient'
import { Metadata } from 'next'

export async function generateMetadata({ searchParams }: { searchParams: Promise<any> }): Promise<Metadata> {
    const params = await searchParams
    const category = params.category

    if (category) {
        // We could fetch category name here for better title
        const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')
        return {
            title: `${formattedCategory} | Baraka Shop - Électronique Premier`,
            description: `Découvrez notre sélection de ${formattedCategory} chez Baraka Shop. High-Tech de qualité supérieure au Sénégal.`
        }
    }

    return {
        title: 'Boutique | Baraka Shop - Électronique & High-Tech au Sénégal',
        description: 'Parcourez tout notre catalogue de smartphones, ordinateurs, audio et accessoires high-tech chez Baraka Shop.'
    }
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<any> }) {
    const params = await searchParams

    // Get filters from URL
    const category = params.category || ''
    const brand = params.brand || ''
    const sort = params.sort || 'newest'
    const page = Number(params.page) || 1
    const minPrice = params.minPrice ? Number(params.minPrice) : undefined
    const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined
    const query = params.q || ''

    // Fetch data server-side
    const [result, categories, brands] = await Promise.all([
        getProductsAction({
            category,
            brand,
            sort,
            page,
            minPrice,
            maxPrice,
            query
        }),
        getCategoriesAction(),
        getBrandsAction()
    ])

    const currentCategoryName = category ? (categories.find((c: any) => c.slug === category)?.name || 'Catégorie') : 'Boutique'

    return (
        <main className="bg-[#f8f9fb] min-h-screen">
            {/* Page Header */}
            <div className="bg-[#1B1F3B] py-16 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/10 blur-[100px] rounded-full translate-x-1/2" />
                <Container className="relative z-10 flex flex-col items-center">
                    <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">
                        {currentCategoryName}
                    </h1>
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
                        <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
                        <span className="w-1 h-1 bg-gray-600 rounded-full" />
                        <span className="text-white">Boutique</span>
                        {category && (
                            <>
                                <span className="w-1 h-1 bg-gray-600 rounded-full" />
                                <span className="text-primary">{currentCategoryName}</span>
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
        </main>
    )
}
