'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/ui/Container'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Search, ShoppingCart, Star, Eye, Zap, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

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
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-4">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <div className="h-[2px] w-8 bg-primary rounded-full" />
                            <span className="text-primary font-black text-[11px] uppercase tracking-[0.4em]">Notre Sélection</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={cn(
                                        "text-xl md:text-3xl font-black transition-all relative uppercase tracking-tight",
                                        activeTab === tab ? "text-[#1B1F3B]" : "text-gray-300 hover:text-gray-400"
                                    )}
                                >
                                    {tab}
                                    {activeTab === tab && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute -bottom-3 left-0 w-10 h-[4px] bg-primary rounded-full shadow-[0_4px_10px_rgba(255,140,0,0.3)]"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Link href="/boutique" className="flex items-center gap-2 group/btn">
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
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                >
                    {products[activeTab]?.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                    {(!products[activeTab] || products[activeTab].length === 0) && (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Arrivage en cours...</p>
                        </div>
                    )}
                </motion.div>
            </Container>
        </section>
    )
}

function ProductCard({ product }: { product: Product }) {
    return (
        <div className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-gray-200/50 border border-gray-50">
            {/* Image Area */}
            <div className="relative aspect-square bg-[#fff] m-2 rounded-xl overflow-hidden group/img border border-gray-50 text-left">
                <Link href={`/product/${product.id}`} className="absolute inset-0 z-10">
                    <span className="sr-only">Voir {product.name}</span>
                </Link>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
                    {product.badges?.map((badge, idx) => (
                        <span key={idx} className={cn("text-white text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest shadow-sm", badge.color)}>
                            {badge.text}
                        </span>
                    ))}
                </div>

                {/* Actions */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 z-20 translate-x-12 opacity-0 group-hover/img:translate-x-0 group-hover/img:opacity-100 transition-all duration-500">
                    <CardAction icon={Heart} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} />
                    <CardAction icon={Eye} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} />
                </div>

                <div className="relative w-full h-full p-6 flex items-center justify-center transition-transform duration-700 group-hover/img:scale-110">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain p-6"
                    />
                </div>

                {/* Add to Cart Overlay */}
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    className="absolute bottom-4 left-4 right-4 bg-primary text-white py-3 rounded-lg font-black text-[10px] uppercase tracking-[0.2em] transform translate-y-20 opacity-0 group-hover/img:translate-y-0 group-hover/img:opacity-100 transition-all duration-500 flex items-center justify-center gap-2 hover:bg-[#1B1F3B] shadow-xl shadow-primary/20 z-20"
                >
                    <ShoppingCart className="w-3.5 h-3.5" /> Ajouter au panier
                </button>
            </div>

            {/* Content */}
            <div className="p-6 pt-2 flex flex-col gap-1.5 flex-1">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{product.category}</span>
                    <div className="flex items-center gap-0.5">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-[10px] font-bold text-gray-500">{product.rating}.0</span>
                    </div>
                </div>

                <Link href={`/product/${product.id}`} className="font-bold text-sm text-[#1B1F3B] hover:text-primary transition-colors leading-snug line-clamp-2 h-10">
                    {product.name}
                </Link>

                <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
                    <div className="flex flex-col">
                        {product.oldPrice && (
                            <span className="text-gray-400 text-[11px] line-through font-bold">
                                {product.oldPrice.toLocaleString()} CFA
                            </span>
                        )}
                        <span className="text-[#1B1F3B] font-black text-xl tracking-tight">
                            {product.price.toLocaleString()} <span className="text-[11px] font-bold text-gray-400 ml-0.5 uppercase">CFA</span>
                        </span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                        <Zap className="w-5 h-5 fill-current" />
                    </div>
                </div>
            </div>
        </div>
    )
}

function CardAction({ icon: Icon, onClick }: { icon: any, onClick?: (e: React.MouseEvent) => void }) {
    return (
        <button
            onClick={onClick}
            className="w-9 h-9 rounded-full bg-white text-[#1B1F3B] flex items-center justify-center shadow-md border border-gray-100 hover:bg-primary hover:text-white transition-all scale-90 hover:scale-100"
        >
            <Icon className="w-4 h-4" />
        </button>
    )
}
