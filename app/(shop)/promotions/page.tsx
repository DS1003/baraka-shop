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
            {/* Premium Promo Hero */}
            <div className="bg-[#0A0D14] py-24 md:py-32 relative overflow-hidden isolate">
                <div className="absolute top-0 right-0 w-3/4 h-full bg-gradient-to-l from-orange-600/10 to-transparent blur-3xl -z-10" />
                <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-blue-600/10 to-transparent blur-3xl -z-10" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay -z-10" />

                <Container className="relative z-10 flex flex-col items-center text-center px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2.5 bg-white/5 border border-white/10 text-orange-500 text-[10px] md:text-[12px] font-bold px-5 py-2.5 rounded-full uppercase tracking-[0.3em] mb-8 backdrop-blur-md"
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                        Offres Limitées
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-8">
                        BARAKA <br className="md:hidden" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 italic pr-4">FLASH.</span>
                    </h1>

                    <p className="text-slate-400 max-w-2xl text-base md:text-xl font-medium mb-12 leading-relaxed">
                        Profitez des meilleures remises High-Tech du Sénégal. <br className="hidden md:block" />
                        Jusqu'à <span className="text-white font-bold">-50%</span> sur une sélection de produits premium pour un temps très limité.
                    </p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl max-w-3xl w-full"
                    >
                        <PromoStat value="24H" label="Expédition" />
                        <PromoStat value="100+" label="Offres" />
                        <PromoStat value="Live" label="En Cours" isLive />
                        <PromoStat value="-50%" label="Max Remise" />
                    </motion.div>
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

function PromoStat({ value, label, isLive }: { value: string, label: string, isLive?: boolean }) {
    return (
        <div className="bg-[#0A0D14]/80 p-6 flex flex-col items-center justify-center hover:bg-white/5 transition-colors group">
            <span className="text-3xl md:text-4xl font-black text-white tabular-nums tracking-tighter mb-1.5 flex items-center gap-2">
                {isLive && <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse mb-1" />}
                {value}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] group-hover:text-orange-500 transition-colors">{label}</span>
        </div>
    )
}
