import React from 'react'
import { Container } from '@/ui/Container'
import { getProductsAction, getCategoriesAction, getBrandsAction } from '@/lib/actions/product-actions'
import { NouveautesClient } from './NouveautesClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Nouveautés | Baraka Shop - Tout beau, tout chaud !',
    description: 'Découvrez les dernières nouveautés high-tech chez Baraka Shop. Les produits les plus récents sélectionnés pour vous.',
}

export default async function NouveautesPage({ searchParams }: { searchParams: Promise<any> }) {
    const params = await searchParams

    const category = params.category || ''
    const brand = params.brand || ''
    const sort = params.sort || 'newest'
    const page = Number(params.page) || 1
    const minPrice = params.minPrice ? Number(params.minPrice) : undefined
    const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined
    const query = params.q || ''

    // Fetch new products specifically
    const [result, categories, brands] = await Promise.all([
        getProductsAction({
            category,
            brand,
            sort,
            page,
            minPrice,
            maxPrice,
            query,
            isNew: true, // Special filter for this page
            limit: 20
        }),
        getCategoriesAction(),
        getBrandsAction()
    ])

    return (
        <main className="bg-[#f8f9fb] min-h-screen">
            {/* Hero Section inspired by screenshot but with Baraka UI */}
            <div className="relative bg-[#0F111A] overflow-hidden pt-20 pb-32">
                {/* Background Pattern/Texture */}
                <div className="absolute inset-0 opacity-[0.03]" 
                     style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }} />
                
                {/* Animated light rays */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[120px] rounded-full translate-x-1/2 -rotate-12" />
                <div className="absolute bottom-0 left-0 w-1/2 h-full bg-blue-500/5 blur-[120px] rounded-full -translate-x-1/2 rotate-12" />
                
                <Container className="relative z-10 flex flex-col items-center text-center">
                    <div className="space-y-8 max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Derniers Arrivages</span>
                        </div>

                        <h1 className="flex flex-col items-center gap-4">
                            <span className="text-white text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">
                                Du <span className="text-primary drop-shadow-[0_0_30px_rgba(249,115,22,0.4)]">Nouveau :</span>
                            </span>
                            <div className="relative inline-block mt-4">
                                <div className="absolute -inset-2 bg-primary/20 blur-xl rounded-full animate-pulse" />
                                <div className="absolute inset-0 bg-white rotate-[-1.5deg] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]" />
                                <span className="relative block bg-white text-[#1B1F3B] px-10 py-5 rounded-2xl text-2xl md:text-5xl font-black uppercase tracking-tighter rotate-[1.5deg] border-4 border-[#1B1F3B]">
                                    Tout beau, tout chaud !
                                </span>
                            </div>
                        </h1>
                        
                        <p className="text-gray-500 font-bold uppercase tracking-[0.4em] text-[10px] md:text-xs max-w-md mx-auto leading-relaxed opacity-80">
                            Sélection exclusive des produits high-tech les plus récents sur le marché sénégalais.
                        </p>
                    </div>

                    {/* Arrow Down Indicator */}
                    <div className="mt-16 flex flex-col items-center gap-4">
                        <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-primary/50 to-primary" />
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.5)] animate-bounce">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        </div>
                    </div>
                </Container>
            </div>

            <NouveautesClient
                initialProducts={result.products}
                categories={categories}
                brands={brands}
                pagination={result.pagination}
            />
        </main>
    )
}
