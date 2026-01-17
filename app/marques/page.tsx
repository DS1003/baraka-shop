'use client'

import React from 'react'
import { Container } from '@/ui/Container'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Search, Award, ShieldCheck, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

const MARQUES = [
    { name: 'Apple', logo: 'https://media.ldlc.com/ld/products/00/06/22/20/LD0006222055.jpg', category: 'Premium Reseller', description: 'Le meilleur de l\'écosystème Apple avec garantie 1 an.', count: 124 },
    { name: 'Samsung', logo: 'https://media.ldlc.com/encart/p/28828_b.jpg', category: 'Official Partner', description: 'Toute la gamme Galaxy et écrans haut de gamme.', count: 86 },
    { name: 'Dell', logo: 'https://media.ldlc.com/r705/ld/products/00/06/22/20/LD0006222055.jpg', category: 'Authorized Reseller', description: 'Solutions informatiques pour professionnels et particuliers.', count: 42 },
    { name: 'Sony', logo: 'https://sony.scene7.com/is/image/sonyglobalsolutions/360-RA-category-icon-20221202?$S7Product$&fmt=png-alpha', category: 'Platinum Partner', description: 'L\'excellence en Image & Son et l\'univers PlayStation.', count: 58 },
    { name: 'HP', logo: 'https://media.ldlc.com/encart/p/28885_b.jpg', category: 'Authorized Reseller', description: 'Laptops performants et imprimantes dernière génération.', count: 31 },
    { name: 'Canon', logo: 'https://in.canon/media/image/2022/11/01/c8c8ab88ead148e9b64490fdd764bcf4_EOS+R6+Mark+II+RF24-105mm+f4-7.1+IS+STM+front+slant.png', category: 'Official Partner', description: 'Équipements photo et vidéo de haute volée.', count: 22 },
    { name: 'Asus', logo: 'https://media.ldlc.com/encart/p/28858_b.jpg', category: 'Gaming Partner', description: 'L\'innovation au service des gamers avec la gamme ROG.', count: 45 },
    { name: 'Lenovo', logo: 'https://media.ldlc.com/encart/p/26671_b.jpg', category: 'Authorized Reseller', description: 'Productivité et robustesse avec les séries ThinkPad.', count: 37 },
]

export default function BrandsPage() {
    return (
        <main className="bg-[#f8f9fb] min-h-screen">
            {/* Page Header */}
            <div className="bg-[#1B1F3B] py-20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
                    style={{ backgroundImage: `url('https://res.cloudinary.com/dgro5x4h8/image/upload/v1768669738/pattern_2_kln9c6.png')`, backgroundSize: '400px' }} />
                <div className="absolute bottom-0 right-0 w-1/2 h-full bg-primary/20 blur-[150px] rounded-full translate-x-1/2 translate-y-1/2" />

                <Container className="relative z-10 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 mb-6"
                    >
                        <div className="h-[2px] w-8 bg-primary rounded-full" />
                        <span className="text-primary font-black text-[11px] uppercase tracking-[0.4em]">Nos Partenaires</span>
                        <div className="h-[2px] w-8 bg-primary rounded-full" />
                    </motion.div>
                    <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-6">Nos Marques Officielles</h1>
                    <p className="text-gray-400 max-w-2xl text-lg font-medium">
                        Nous collaborons directement avec les leaders mondiaux de la technologie pour vous garantir des produits originaux et un service après-vente officiel.
                    </p>
                </Container>
            </div>

            <Container className="py-20">
                {/* Search & Stats Bar */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm mb-12 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-8">
                        <div className="flex flex-col">
                            <span className="text-3xl font-black text-[#1B1F3B]">24+</span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Marques Partenaires</span>
                        </div>
                        <div className="w-px h-10 bg-gray-100 hidden md:block" />
                        <div className="flex flex-col">
                            <span className="text-3xl font-black text-[#1B1F3B]">100%</span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Produits Certifiés</span>
                        </div>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher une marque..."
                            className="w-full h-14 bg-gray-50 rounded-2xl border border-gray-100 pl-14 pr-6 outline-none focus:border-primary focus:bg-white transition-all text-sm font-bold"
                        />
                    </div>
                </div>

                {/* Brands Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {MARQUES.map((brand, idx) => (
                        <motion.div
                            key={brand.name}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200 transition-all duration-500 flex flex-col items-center text-center"
                        >
                            <div className="relative w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-6 overflow-hidden p-6 group-hover:scale-110 transition-transform duration-500">
                                <Image src={brand.logo} alt={brand.name} fill className="object-contain p-6 grayscale group-hover:grayscale-0 transition-all" />
                            </div>

                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">{brand.category}</span>
                            <h3 className="text-xl font-black text-[#1B1F3B] uppercase tracking-tight mb-4">{brand.name}</h3>
                            <p className="text-gray-400 text-xs font-medium leading-relaxed mb-8">
                                {brand.description}
                            </p>

                            <div className="mt-auto w-full flex flex-col gap-4">
                                <Link href={`/boutique?brand=${brand.name.toLowerCase()}`} className="w-full h-12 rounded-xl bg-[#1B1F3B] text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary transition-all shadow-lg hover:shadow-primary/20">
                                    Voir les produits <ChevronRight className="w-3.5 h-3.5 text-primary" />
                                </Link>
                                <span className="text-[10px] font-bold text-gray-300 uppercase">{brand.count} Références disponibles</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Trust Footer */}
                <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
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
        <div className="bg-white rounded-[2rem] p-10 border border-gray-100 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Icon className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-[#1B1F3B] uppercase tracking-tight">{title}</h4>
            <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
        </div>
    )
}
