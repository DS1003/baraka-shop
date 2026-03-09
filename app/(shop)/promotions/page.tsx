import React from 'react'
import { Container } from '@/ui/Container'
import { Zap, Clock, Search } from 'lucide-react'
import * as motion from 'framer-motion/client'
import { ProductCard } from '@/ui/ProductCard'
import Link from 'next/link'
import { getProductsAction } from '@/lib/actions/product-actions'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Promotions & Ventes Flash | Baraka Shop - Équipement High-Tech',
    description: 'Découvrez les meilleures promotions sur les smartphones, ordinateurs et accessoires High-Tech au Sénégal chez Baraka Shop.'
}

export default async function PromotionsPage() {
    // Fetch promotion products
    const flashSalesResult = await getProductsAction({
        onSale: true,
        limit: 3,
        sort: 'newest'
    })

    const allPromosResult = await getProductsAction({
        onSale: true,
        limit: 12,
        page: 1
    })

    return (
        <main className="bg-[#f8f9fb] min-h-screen">
            {/* Promo Hero */}
            <div className="bg-[#1B1F3B] py-24 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/20 blur-[150px] rounded-full translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-blue-600/10 blur-[100px] rounded-full" />

                <Container className="relative z-10 flex flex-col items-center text-center px-6">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-primary text-white text-[9px] md:text-[11px] font-black px-4 md:px-6 py-2 rounded-full uppercase tracking-[0.4em] mb-6 md:mb-8 shadow-2xl shadow-primary/40 flex items-center gap-3"
                    >
                        <Zap className="w-3.5 h-3.5 fill-current" /> Offres Limitées
                    </motion.div>
                    <h1 className="text-4xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none mb-6">
                        BARAKA <span className="text-primary italic">FLASH</span>
                    </h1>
                    <p className="text-gray-400 max-w-xl text-sm md:text-lg font-medium mb-8 md:mb-12 leading-relaxed">
                        Profitez des meilleures remises High-Tech du Sénégal. Jusqu'à -50% sur une sélection de produits premium.
                    </p>

                    <div className="flex items-center gap-4 md:gap-12 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 md:p-10">
                        <CountdownItem value="Exp" label="Offres" />
                        <div className="w-[1px] h-8 bg-white/10 hidden md:block" />
                        <CountdownItem value="En" label="Cours" />
                        <div className="w-[1px] h-8 bg-white/10 hidden md:block" />
                        <CountdownItem value="!!" label="Now" />
                    </div>
                </Container>
            </div>

            <section className="py-12 md:py-20">
                <Container className="px-4 md:px-8">
                    {/* Top Flash Grid */}
                    {flashSalesResult.products.length > 0 && (
                        <div className="mb-16 md:mb-24">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 md:mb-12 gap-4">
                                <h2 className="text-2xl md:text-3xl font-black text-[#1B1F3B] uppercase tracking-tight">Ventes Flash</h2>
                                <div className="flex items-center gap-2 text-primary font-black text-[9px] md:text-[11px] uppercase tracking-widest bg-primary/5 px-4 py-2 rounded-full w-fit">
                                    <Clock className="w-4 h-4" /> Offres à durée limitée
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                                {flashSalesResult.products.map((sale: any) => (
                                    <ProductCard key={sale.id} product={sale} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* All Promotions */}
                    <div>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                            <div className="flex flex-col gap-2 items-center md:items-start text-center md:text-left">
                                <span className="text-primary font-black text-[11px] uppercase tracking-[0.3em]">Catalogue Promo</span>
                                <h2 className="text-3xl md:text-4xl font-black text-[#1B1F3B] uppercase tracking-tight">Toutes Nos Offres</h2>
                            </div>
                            <Link
                                href="/boutique"
                                className="px-8 py-4 bg-[#1B1F3B] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all shadow-xl"
                            >
                                Tout voir dans la boutique
                            </Link>
                        </div>

                        {allPromosResult.products.length === 0 ? (
                            <div className="bg-white rounded-[2.5rem] p-16 text-center shadow-sm border border-gray-100">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search className="w-10 h-10 text-gray-300" />
                                </div>
                                <h3 className="text-xl font-black text-[#1B1F3B] uppercase tracking-tighter mb-2">Pas de promotions pour le moment</h3>
                                <p className="text-gray-400 text-sm max-w-xs mx-auto">Revenez bientôt pour découvrir nos prochaines offres exceptionnelles.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                                {allPromosResult.products.map((prod: any) => (
                                    <ProductCard key={prod.id} product={prod} />
                                ))}
                            </div>
                        )}

                        {allPromosResult.pagination.pages > 1 && (
                            <div className="mt-12 md:mt-16 flex justify-center">
                                <Link
                                    href="/boutique"
                                    className="h-14 md:h-16 px-8 md:px-12 bg-white border border-gray-200 rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-widest hover:border-primary hover:text-primary transition-all shadow-sm flex items-center"
                                >
                                    Explorer toutes les offres
                                </Link>
                            </div>
                        )}
                    </div>
                </Container>
            </section>
        </main>
    )
}

function CountdownItem({ value, label }: { value: string, label: string }) {
    return (
        <div className="flex flex-col items-center">
            <span className="text-4xl md:text-6xl font-black text-white tabular-nums">{value}</span>
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{label}</span>
        </div>
    )
}
