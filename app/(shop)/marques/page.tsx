'use client'

import React, { useState, useEffect } from 'react'
import { Container } from '@/ui/Container'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Search, Award, ShieldCheck, Zap, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { getBrandsAction } from '@/lib/actions/product-actions'
import { getBrandLogoUrl } from '@/lib/brand-logos'

export default function BrandsPage() {
    const [brands, setBrands] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        async function fetchBrands() {
            try {
                const data = await getBrandsAction()
                setBrands(data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchBrands()
    }, [])

    const filteredBrands = brands.filter(brand =>
        brand.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <main className="bg-[#f8f9fb] min-h-screen">
            {/* Page Header */}
            <div className="bg-[#1B1F3B] py-16 md:py-24 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
                    style={{ backgroundImage: `url('https://res.cloudinary.com/dgro5x4h8/image/upload/v1768669738/pattern_2_kln9c6.png')`, backgroundSize: '400px' }} />
                <div className="absolute bottom-0 right-0 w-1/2 h-full bg-primary/20 blur-[150px] rounded-full translate-x-1/2 translate-y-1/2" />

                <Container className="relative z-10 flex flex-col items-center text-center px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 mb-4 md:mb-6"
                    >
                        <div className="h-[2px] w-6 md:w-8 bg-primary rounded-full" />
                        <span className="text-primary font-black text-[9px] md:text-[11px] uppercase tracking-[0.4em]">Nos Partenaires</span>
                        <div className="h-[2px] w-6 md:w-8 bg-primary rounded-full" />
                    </motion.div>
                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4 md:mb-6 leading-tight">Nos Marques <span className="text-primary italic">Officielles</span></h1>
                    <p className="text-gray-400 max-w-2xl text-sm md:text-lg font-medium leading-relaxed">
                        Nous collaborons directement avec les leaders mondiaux de la technologie pour vous garantir des produits originaux et un service après-vente officiel.
                    </p>
                </Container>
            </div>

            <Container className="py-12 md:py-20 px-4 sm:px-6">
                {/* Search & Stats Bar */}
                <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-gray-100 shadow-sm mb-12 flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="flex items-center justify-around w-full lg:w-auto gap-4 md:gap-12">
                        <div className="flex flex-col items-center lg:items-start">
                            <span className="text-2xl md:text-3xl font-black text-[#1B1F3B]">{brands.length}</span>
                            <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Marques</span>
                        </div>
                        <div className="w-px h-10 bg-gray-100" />
                        <div className="flex flex-col items-center lg:items-start">
                            <span className="text-2xl md:text-3xl font-black text-[#1B1F3B]">100%</span>
                            <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Certifiés</span>
                        </div>
                        <div className="w-px h-10 bg-gray-100 hidden sm:block" />
                        <div className="flex flex-col items-center lg:items-start hidden sm:flex">
                            <span className="text-2xl md:text-3xl font-black text-[#1B1F3B]">Sénégal</span>
                            <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Distribution</span>
                        </div>
                    </div>

                    <div className="relative w-full lg:w-96">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher une marque..."
                            className="w-full h-12 md:h-14 bg-gray-50 rounded-2xl border border-gray-100 pl-14 pr-6 outline-none focus:border-primary focus:bg-white transition-all text-sm font-bold"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Brands Grid */}
                {loading ? (
                    <div className="h-[300px] flex flex-col items-center justify-center text-slate-400 gap-4">
                        <Loader2 className="animate-spin text-primary" size={36} />
                        <p className="font-bold uppercase tracking-widest text-[11px]">Chargement des marques partenaires...</p>
                    </div>
                ) : (
                    <>
                        {filteredBrands.length === 0 ? (
                            <div className="h-[200px] flex items-center justify-center text-slate-400">
                                <p className="font-bold">Aucune marque ne correspond à votre recherche.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                                {filteredBrands.map((brand, idx) => {
                                    const logoUrl = getBrandLogoUrl(brand.name, brand.image)
                                    return (
                                        <motion.div
                                            key={brand.id ?? brand.name}
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-100 transition-all duration-500 flex flex-col items-center text-center"
                                        >
                                            <div className="relative w-24 h-24 md:w-32 md:h-32 bg-gray-50 rounded-full flex items-center justify-center mb-6 overflow-hidden p-6 group-hover:scale-105 transition-transform duration-500">
                                                {logoUrl ? (
                                                    <Image src={logoUrl} alt={brand.name} fill className="object-contain p-4 md:p-6" unoptimized />
                                                ) : (
                                                    <Award className="w-12 h-12 text-slate-300" />
                                                )}
                                            </div>

                                            <span className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Partenaire Officiel</span>
                                            <h3 className="text-lg md:text-xl font-black text-[#1B1F3B] uppercase tracking-tight mb-3 md:mb-4">{brand.name}</h3>
                                            <p className="text-gray-400 text-[11px] md:text-xs font-medium leading-relaxed mb-6 md:mb-8 line-clamp-2 md:line-clamp-none">
                                                Découvrez toute notre sélection exclusive et certifiée de la marque {brand.name}.
                                            </p>

                                            <div className="mt-auto w-full flex flex-col gap-3 md:gap-4">
                                                <Link href={`/boutique?brand=${brand.slug ?? brand.name.toLowerCase()}`} className="w-full h-11 md:h-12 rounded-xl bg-[#1B1F3B] text-white font-black text-[9px] md:text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary transition-all shadow-lg hover:shadow-primary/20">
                                                    Voir produits <ChevronRight className="w-3.5 h-3.5 text-primary" />
                                                </Link>
                                                <span className="text-[9px] font-bold text-gray-300 uppercase">{brand._count?.products || 0} Références</span>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        )}
                    </>
                )}

                {/* Trust Footer */}
                <div className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    <TrustCard icon={ShieldCheck} title="Authenticité" desc="Tous nos produits proviennent directement des canaux de distribution officiels." />
                    <TrustCard icon={Award} title="Excellence" desc="Plus de 10 ans d'expertise dans le conseil et la distribution High-Tech au Sénégal." />
                    <TrustCard icon={Zap} title="Réactivité" desc="Un engagement ferme sur les garanties et le support technique de qualité." />
                </div>
            </Container>
        </main>
    )
}

function TrustCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="bg-white rounded-3xl p-8 md:p-10 border border-gray-100 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Icon className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h4 className="text-base md:text-lg font-black text-[#1B1F3B] uppercase tracking-tight">{title}</h4>
            <p className="text-gray-500 text-xs md:text-sm leading-relaxed">{desc}</p>
        </div>
    )
}
