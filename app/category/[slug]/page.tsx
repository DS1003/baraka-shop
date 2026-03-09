import React from 'react'
import { Container } from '@/ui/Container'
import { ProductCard } from '@/ui/ProductCard'
import * as motion from 'framer-motion/client'
import Link from 'next/link'
import { ChevronRight, Search } from 'lucide-react'
import { getCategoryBySlugAction, getProductsAction, getCategoriesAction } from '@/lib/actions/product-actions'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
    const categories = await getCategoriesAction()
    return categories.map((cat: any) => ({
        slug: cat.slug,
    }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const category = await getCategoryBySlugAction(slug)

    if (!category) {
        return { title: 'Catégorie non trouvée | Baraka Shop' }
    }

    return {
        title: `${category.name} | Baraka Shop - Rayons Spécialisés`,
        description: `Explorez notre sélection de ${category.name} chez Baraka Shop. High-Tech de premier choix au Sénégal.`
    }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params

    // Fetch individual category details
    const category = await getCategoryBySlugAction(slug)

    if (!category) {
        notFound()
    }

    // Fetch products for this category
    const result = await getProductsAction({
        category: slug,
        limit: 20
    })

    const categoryName = category.name

    return (
        <main className="bg-[#f8f9fb] min-h-screen">
            {/* Editorial Header */}
            <div className="bg-[#1B1F3B] py-12 md:py-20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
                    style={{ backgroundImage: `url('https://res.cloudinary.com/dgro5x4h8/image/upload/v1768669738/pattern_2_kln9c6.png')`, backgroundSize: '400px' }} />
                <div className="absolute -bottom-1/2 -right-1/4 w-[50%] h-full bg-primary/10 blur-[120px] rounded-full" />

                <Container className="relative z-10 px-6 sm:px-8">
                    <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">
                        <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-white">Rayons</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-primary">{categoryName}</span>
                    </div>
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-3xl sm:text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4 leading-none"
                    >
                        {categoryName}
                    </motion.h1>
                    <p className="text-gray-400 max-w-2xl text-sm sm:text-base md:text-lg font-medium leading-relaxed">
                        Découvrez notre sélection exclusive de {categoryName.toLowerCase()}. Performance, design et authenticité garantis.
                    </p>
                </Container>
            </div>

            <section className="py-12 md:py-20">
                <Container className="px-4 sm:px-8">
                    {result.products.length === 0 ? (
                        <div className="bg-white rounded-[2.5rem] p-12 md:p-20 text-center shadow-sm border border-gray-100">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-black text-[#1B1F3B] uppercase tracking-tighter mb-2">Aucun produit dans ce rayon</h3>
                            <p className="text-gray-400 text-sm max-w-xs mx-auto">Nous renouvelons actuellement notre stock. Revenez très bientôt !</p>
                            <Link
                                href="/boutique"
                                className="inline-block mt-8 px-10 py-4 bg-[#1B1F3B] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg"
                            >
                                Voir toute la boutique
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                            {result.products.map((product: any, idx: number) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <ProductCard product={product} />
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {result.pagination.pages > 1 && (
                        <div className="mt-20 flex flex-col items-center gap-6">
                            <Link
                                href={`/boutique?category=${slug}`}
                                className="px-10 py-5 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-[#1B1F3B] hover:shadow-xl hover:-translate-y-1 transition-all"
                            >
                                Voir tous les produits {categoryName}
                            </Link>
                        </div>
                    )}

                    <div className="mt-20 flex flex-col items-center gap-6">
                        <div className="w-12 h-[2px] bg-gray-100" />
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">Baraka Shop Selection</p>
                    </div>
                </Container>
            </section>
        </main>
    )
}
