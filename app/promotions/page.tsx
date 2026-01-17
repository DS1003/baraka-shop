'use client'

import React from 'react'
import { Container } from '@/ui/Container'
import { Zap, Clock, ArrowRight, ChevronRight, Filter } from 'lucide-react'
import { motion } from 'framer-motion'
import { ProductCard } from '@/ui/ProductCard'
import Link from 'next/link'

const FLASH_SALES = [
    { id: '1', name: 'iPhone 15 Pro Max 256GB', price: 790000, oldPrice: 900000, badges: [{ text: '-12%', color: 'bg-red-500' }], image: 'https://media.ldlc.com/r705/ld/products/00/06/06/39/LD0006063994.jpg', category: 'Smartphones', rating: 5 },
    { id: '2', name: 'Sony PlayStation 5 Slim', price: 395000, oldPrice: 480000, badges: [{ text: '-18%', color: 'bg-red-500' }], image: 'https://media.ldlc.com/encart/p/26671_b.jpg', category: 'Jeux Vidéo', rating: 5 },
    { id: '3', name: 'MacBook Air M2 13"', price: 890000, oldPrice: 1050000, badges: [{ text: '-15%', color: 'bg-red-500' }], image: 'https://media.ldlc.com/encart/p/28885_b.jpg', category: 'Informatique', rating: 5 },
]

const ALL_PROMOS = [
    { id: '4', name: 'AirPods Pro 2nd Gen', category: 'Audio', price: 165000, oldPrice: 195000, badges: [{ text: '-15%', color: 'bg-primary' }], image: 'https://sony.scene7.com/is/image/sonyglobalsolutions/360-RA-category-icon-20221202?$S7Product$&fmt=png-alpha', rating: 5 },
    { id: '5', name: 'Samsung Galaxy Watch 6', category: 'Smartwatch', price: 185000, oldPrice: 220000, badges: [{ text: '-16%', color: 'bg-primary' }], image: 'https://media.ldlc.com/encart/p/28828_b.jpg', rating: 4 },
    { id: '6', name: 'Logitech G Pro X Superlight', category: 'Gaming', price: 85000, oldPrice: 110000, badges: [{ text: '-22%', color: 'bg-primary' }], image: 'https://media.ldlc.com/encart/p/22889_b.jpg', rating: 5 },
    { id: '7', name: 'Canon PowerShot V10', category: 'Photo', price: 295000, oldPrice: 350000, badges: [{ text: '-15%', color: 'bg-primary' }], image: 'https://in.canon/media/image/2022/11/01/c8c8ab88ead148e9b64490fdd764bcf4_EOS+R6+Mark+II+RF24-105mm+f4-7.1+IS+STM+front+slant.png', rating: 5 },
]

export default function PromotionsPage() {
    return (
        <main className="bg-[#f8f9fb] min-h-screen">
            {/* Promo Hero */}
            <div className="bg-[#1B1F3B] py-24 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/20 blur-[150px] rounded-full translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-blue-600/10 blur-[100px] rounded-full" />

                <Container className="relative z-10 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-primary text-white text-[11px] font-black px-6 py-2 rounded-full uppercase tracking-[0.4em] mb-8 shadow-2xl shadow-primary/40 flex items-center gap-3"
                    >
                        <Zap className="w-4 h-4 fill-current" /> Offres Limitées
                    </motion.div>
                    <h1 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none mb-6">
                        BARAKA <span className="text-primary italic">FLASH</span>
                    </h1>
                    <p className="text-gray-400 max-w-xl text-lg font-medium mb-12">
                        Profitez des meilleures remises High-Tech du Sénégal. Jusqu'à -50% sur une sélection de produits premium pendant 48H.
                    </p>

                    <div className="flex items-center gap-12 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-10">
                        <CountdownItem value="01" label="Jour" />
                        <CountdownItem value="14" label="Heures" />
                        <CountdownItem value="32" label="Minutes" />
                        <CountdownItem value="45" label="Secondes" />
                    </div>
                </Container>
            </div>

            <section className="py-20">
                <Container>
                    {/* Top Flash Grid */}
                    <div className="mb-24">
                        <div className="flex items-center justify-between mb-12 px-4">
                            <h2 className="text-3xl font-black text-[#1B1F3B] uppercase tracking-tight">Flash Sales du Moment</h2>
                            <div className="flex items-center gap-2 text-primary font-black text-[11px] uppercase tracking-widest">
                                <Clock className="w-4 h-4" /> Fin dans 1j : 14h : 32m
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {FLASH_SALES.map((sale) => (
                                <ProductCard key={sale.id} product={sale} />
                            ))}
                        </div>
                    </div>

                    {/* All Promotions */}
                    <div>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 px-4">
                            <div className="flex flex-col gap-2">
                                <span className="text-primary font-black text-[11px] uppercase tracking-[0.3em]">Catalogue Promo</span>
                                <h2 className="text-4xl font-black text-[#1B1F3B] uppercase tracking-tight">Toutes Nos Offres</h2>
                            </div>

                            <div className="flex items-center gap-4 bg-white rounded-xl p-2 border border-gray-100 shadow-sm">
                                <button className="h-12 px-8 bg-[#1B1F3B] text-white rounded-lg font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                                    <Filter className="w-4 h-4" /> Filtrer
                                </button>
                                <select className="h-12 bg-transparent outline-none text-xs font-bold text-gray-500 px-4 pr-10 appearance-none border-l border-gray-100">
                                    <option>Plus gros rabais</option>
                                    <option>Prix croissant</option>
                                    <option>Nouveautés</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {ALL_PROMOS.map((prod) => (
                                <ProductCard key={prod.id} product={prod} />
                            ))}
                        </div>

                        <div className="mt-16 flex justify-center">
                            <button className="h-16 px-12 bg-white border border-gray-200 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:border-primary hover:text-primary transition-all shadow-sm">
                                Charger plus d'offres
                            </button>
                        </div>
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
