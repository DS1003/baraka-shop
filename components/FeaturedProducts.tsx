'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Star, ShoppingCart, Heart, Sparkles } from 'lucide-react'
import { MOCK_PRODUCTS } from '@/lib/data'
import { cn } from '@/lib/utils'

export default function FeaturedProducts() {
    return (
        <section className="py-12 md:py-20 bg-background">
            <div className="container px-4 mx-auto">
                <div className="flex justify-between items-end mb-8 md:mb-12">
                    <div>
                        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-2">
                            <Sparkles size={12} /> Sélection du Jour
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-none">Best <span className="text-primary italic">Sellers</span></h2>
                    </div>
                    <Link href="/shop" className="group flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest hover:translate-x-1 transition-transform">
                        Voir Tout <ArrowRight size={14} />
                    </Link>
                </div>

                {/* Horizontal Scroll on Mobile, Grid on Desktop */}
                <div className="flex overflow-x-auto lg:grid lg:grid-cols-4 gap-4 md:gap-6 pb-6 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0 snap-x">
                    {MOCK_PRODUCTS.slice(0, 4).map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="flex-shrink-0 w-[260px] md:w-auto snap-start group bg-white border border-gray-100 rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all duration-500"
                        >
                            {/* Image Container */}
                            <div className="relative aspect-[4/5] bg-[#f8f9fa] overflow-hidden m-2 rounded-[1.5rem]">
                                {product.isNew && (
                                    <span className="absolute top-3 left-3 bg-black text-white text-[9px] font-black px-3 py-1 rounded-full z-10 uppercase tracking-[0.1em] shadow-lg">
                                        Nouveau
                                    </span>
                                )}
                                {product.oldPrice && (
                                    <span className="absolute top-3 right-3 bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded-full z-10 uppercase tracking-[0.1em] shadow-lg">
                                        -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                                    </span>
                                )}

                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover object-center group-hover:scale-110 transition-transform duration-700 mix-blend-multiply"
                                />

                                {/* Mobile Quick Add Button - Floating over image */}
                                <button className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center text-black shadow-xl border border-gray-100 active:scale-90 transition-transform lg:hidden">
                                    <ShoppingCart size={18} />
                                </button>
                            </div>

                            {/* Info */}
                            <div className="p-5 pt-2">
                                <div className="flex items-center gap-1 mb-2">
                                    <Star size={10} className="fill-yellow-400 text-yellow-400" />
                                    <span className="text-[10px] text-gray-400 font-bold">{product.rating} ({product.reviews})</span>
                                    <span className="ml-auto text-[9px] font-black text-gray-300 uppercase tracking-widest leading-none">{product.category}</span>
                                </div>

                                <Link href={`/products/${product.id}`}>
                                    <h3 className="font-black text-gray-900 mb-3 text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors min-h-[2.5em]">{product.name}</h3>
                                </Link>

                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex flex-col">
                                        {product.oldPrice && (
                                            <span className="text-[10px] text-gray-400 line-through font-bold">
                                                {product.oldPrice.toLocaleString()} F
                                            </span>
                                        )}
                                        <span className="font-black text-lg text-primary leading-none">
                                            {product.price.toLocaleString()} <span className="text-xs">F</span>
                                        </span>
                                    </div>

                                    {/* Desktop Quick Actions */}
                                    <div className="hidden lg:flex gap-2">
                                        <button className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center text-gray-900 hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-100">
                                            <Heart size={16} />
                                        </button>
                                        <button className="w-9 h-9 bg-black text-white rounded-full flex items-center justify-center hover:bg-primary transition-all shadow-lg active:scale-95">
                                            <ShoppingCart size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
