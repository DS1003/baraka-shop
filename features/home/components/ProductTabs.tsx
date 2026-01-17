'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/ui/Container'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Search, ShoppingCart, Star, Eye, Zap, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProductCard } from '@/ui/ProductCard'

interface Product {
    id: string
    name: string
    category: string
    price: number
    oldPrice?: number
    rating: number
    image: string
    badges?: { text: string; color: string }[]
}

const products: Record<string, Product[]> = {
    'Nouveautés': [
        {
            id: '1',
            name: 'MacBook Pro M3 Max 14" - Space Black',
            category: 'Informatique',
            price: 2500000,
            oldPrice: 2800000,
            rating: 5,
            image: 'https://media.ldlc.com/r705/ld/products/00/06/22/20/LD0006222055.jpg',
            badges: [{ text: '-15%', color: 'bg-primary' }, { text: 'HOT', color: 'bg-red-500' }]
        },
        {
            id: '2',
            name: 'iPhone 15 Pro Max 256GB Natural Titanium',
            category: 'Smartphones',
            price: 850000,
            oldPrice: 900000,
            rating: 5,
            image: "https://media.ldlc.com/r705/ld/products/00/06/06/39/LD0006063994.jpg",
            badges: [{ text: 'NEW', color: 'bg-green-500' }]
        },
        {
            id: '3',
            name: 'Sony WH-1000XM5 Wireless Headphones',
            category: 'Audio & Son',
            price: 250000,
            rating: 4,
            image: "https://sony.scene7.com/is/image/sonyglobalsolutions/360-RA-category-icon-20221202?$S7Product$&fmt=png-alpha",
            badges: []
        },
        {
            id: '4',
            name: 'Canon EOS R6 Mark II Mirrorless Camera',
            category: 'Image & Son',
            price: 1800000,
            oldPrice: 1950000,
            rating: 5,
            image: 'https://in.canon/media/image/2022/11/01/c8c8ab88ead148e9b64490fdd764bcf4_EOS+R6+Mark+II+RF24-105mm+f4-7.1+IS+STM+front+slant.png',
            badges: [{ text: 'PRO', color: 'bg-[#1B1F3B]' }]
        }
    ],
    'Meilleures Ventes': [
        {
            id: '5',
            name: 'PlayStation 5 Slim Digital Edition',
            category: 'Jeux Vidéo',
            price: 450000,
            oldPrice: 500000,
            rating: 5,
            image: 'https://media.ldlc.com/encart/p/26671_b.jpg',
            badges: [{ text: 'SOLD OUT', color: 'bg-black' }]
        },
        {
            id: '6',
            name: 'iPad Air M2 11" 128GB Blue',
            category: 'Tablettes',
            price: 650000,
            rating: 4,
            image: 'https://media.ldlc.com/encart/p/28858_b.jpg',
            badges: []
        },
        {
            id: '7',
            name: 'JBL Boombox 3 Waterproof Speaker',
            category: 'Audio',
            price: 300000,
            oldPrice: 350000,
            rating: 5,
            image: 'https://media.ldlc.com/encart/p/28829_b.jpg',
            badges: [{ text: 'FLASH', color: 'bg-primary' }]
        }
    ]
}

const tabs = ['Nouveautés', 'Meilleures Ventes', 'Promotions']

export function ProductTabs() {
    const [activeTab, setActiveTab] = useState('Nouveautés')

    return (
        <section className="py-24 bg-[#f8f9fb] relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: `url('https://res.cloudinary.com/dgro5x4h8/image/upload/v1768669738/pattern_2_kln9c6.png')`, backgroundSize: '400px' }} />
            <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-[10%] -right-[10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

            <Container className="relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 mb-12 md:mb-16 px-4">
                    <div className="flex flex-col gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-3">
                            <div className="h-[2px] w-8 bg-primary rounded-full" />
                            <span className="text-primary font-black text-[10px] md:text-[11px] uppercase tracking-[0.4em]">Notre Sélection</span>
                        </div>
                        <div className="flex items-center gap-x-6 md:gap-x-10 overflow-x-auto pb-4 md:pb-0 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={cn(
                                        "whitespace-nowrap text-base md:text-3xl font-black transition-all relative uppercase tracking-tight",
                                        activeTab === tab ? "text-[#1B1F3B]" : "text-gray-300 hover:text-gray-400"
                                    )}
                                >
                                    {tab}
                                    {activeTab === tab && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute -bottom-2 md:-bottom-3 left-0 w-8 md:w-10 h-[3px] md:h-[4px] bg-primary rounded-full shadow-[0_4px_10px_rgba(255,140,0,0.3)]"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Link href="/boutique" className="flex items-center gap-2 group/btn w-fit">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#1B1F3B] group-hover/btn:text-primary transition-colors">Voir Plus</span>
                        <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center group-hover/btn:bg-primary group-hover/btn:text-white group-hover/btn:border-primary transition-all">
                            <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                    </Link>
                </div>

                {/* Grid */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8"
                >
                    {products[activeTab]?.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                    {(!products[activeTab] || products[activeTab].length === 0) && (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Arrivage en cours...</p>
                        </div>
                    )}
                </motion.div>
            </Container>
        </section>
    )
}


