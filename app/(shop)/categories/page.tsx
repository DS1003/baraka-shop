'use client'

import React from 'react'
import { Container } from '@/ui/Container'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ChevronRight, ArrowRight } from 'lucide-react'

const ALL_CATEGORIES = [
    { name: 'Informatique', slug: 'informatique', image: 'https://media.ldlc.com/encart/p/28885_b.jpg', count: 154, sub: ['Laptops', 'PC Bureau', 'Composants'] },
    { name: 'Smartphones', slug: 'smartphones', image: 'https://media.ldlc.com/encart/p/28828_b.jpg', count: 86, sub: ['iPhone', 'Samsung', 'Accessoires'] },
    { name: 'Audio & Son', slug: 'audio', image: 'https://media.ldlc.com/encart/p/28829_b.jpg', count: 64, sub: ['Casques', 'Enceintes', 'Écouteurs'] },
    { name: 'Jeux Vidéo', slug: 'jeux', image: 'https://media.ldlc.com/encart/p/26671_b.jpg', count: 42, sub: ['Consoles', 'Jeux', 'Périphériques'] },
    { name: 'Tablettes', slug: 'tablettes', image: 'https://media.ldlc.com/encart/p/28858_b.jpg', count: 31, sub: ['iPad', 'Android', 'Accessoires'] },
    { name: 'Photo & Vidéo', slug: 'photo', image: 'https://in.canon/media/image/2022/11/01/c8c8ab88ead148e9b64490fdd764bcf4_EOS+R6+Mark+II+RF24-105mm+f4-7.1+IS+STM+front+slant.png', count: 22, sub: ['Appareils', 'Objectifs', 'Vlogging'] },
]

export default function CategoriesPage() {
    return (
        <main className="bg-[#f8f9fb] min-h-screen pb-24">
            {/* Simple Header */}
            <div className="bg-[#1B1F3B] py-12 md:py-20 mb-8 md:mb-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/20 blur-[150px] rounded-full translate-x-1/2" />
                <Container className="relative z-10 px-6 sm:px-8">
                    <h1 className="text-3xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4 leading-none">Toutes nos catégories</h1>
                    <div className="flex items-center gap-2 text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-widest">
                        <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
                        <span className="w-1 h-1 bg-gray-600 rounded-full" />
                        <span className="text-white">Rayons</span>
                    </div>
                </Container>
            </div>

            <Container className="px-4 sm:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                    {ALL_CATEGORIES.map((cat, idx) => (
                        <motion.div
                            key={cat.slug}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group bg-white rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500"
                        >
                            <div className="relative h-48 md:h-64 overflow-hidden">
                                <Image src={cat.image} alt={cat.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-500" />
                                <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8">
                                    <span className="bg-primary text-white text-[9px] md:text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                                        {cat.count} Produits
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 md:p-10">
                                <h3 className="text-xl md:text-2xl font-black text-[#1B1F3B] uppercase tracking-tighter mb-4 md:mb-6">{cat.name}</h3>
                                <div className="flex flex-wrap gap-2 mb-6 md:mb-8">
                                    {cat.sub.map((s) => (
                                        <span key={s} className="px-3 py-1.5 md:px-4 md:py-2 bg-gray-50 text-gray-400 text-[9px] md:text-[10px] font-bold uppercase rounded-lg md:rounded-xl hover:bg-primary/10 hover:text-primary transition-all cursor-default">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                                <Link href={`/category/${cat.slug}`} className="w-full h-12 md:h-14 bg-[#1B1F3B] text-white rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary transition-all shadow-xl hover:shadow-primary/20 group-hover:gap-5">
                                    Explorer <ArrowRight className="w-4 h-4 text-primary" />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Container>
        </main>
    )
}
