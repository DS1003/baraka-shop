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
        <section className="py-24 bg-white">
            <div className="container px-4 mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.4em] text-[10px] mb-4">
                            <Sparkles size={14} /> La Sélection Baraka
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-none uppercase italic">
                            LES INCONTOURNABLES <br /> <span className="text-primary">DE LA SEMAINE.</span>
                        </h2>
                    </div>
                    <Link href="/shop" className="group flex items-center gap-4 bg-gray-50 hover:bg-black hover:text-white px-8 py-4 rounded-full transition-all duration-500">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Explorer Tout</span>
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center group-hover:rotate-45 transition-transform">
                            <ArrowRight size={14} />
                        </div>
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                    {MOCK_PRODUCTS.slice(0, 4).map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group relative flex flex-col"
                        >
                            {/* Product Image - Kinetic Card */}
                            <div className="relative aspect-[4/5] mb-8 bg-gray-50 rounded-[3rem] overflow-hidden transition-all duration-700 group-hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] group-hover:-translate-y-2">
                                {product.isNew && (
                                    <div className="absolute top-6 left-6 z-20 overflow-hidden rounded-full">
                                        <motion.div
                                            animate={{ x: [0, 100, 0] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                            className="bg-primary text-white text-[9px] font-black px-4 py-1.5 uppercase tracking-widest relative"
                                        >
                                            NEW ARRIVAL
                                        </motion.div>
                                    </div>
                                )}

                                <div className="absolute inset-0 flex items-center justify-center p-10">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-contain p-12 mix-blend-multiply group-hover:scale-110 transition-transform duration-1000"
                                    />
                                </div>

                                {/* Floating Action - Glassmorphism */}
                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <button className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-gray-900 hover:bg-primary hover:text-white transition-all transform hover:scale-110 shadow-2xl">
                                        <ShoppingCart size={22} />
                                    </button>
                                    <button className="w-14 h-14 bg-white/80 backdrop-blur-md rounded-2xl flex items-center justify-center text-gray-400 hover:text-red-500 transition-all transform hover:scale-110 shadow-2xl">
                                        <Heart size={22} />
                                    </button>
                                </div>

                                {/* Diagonal Background text for 'Elaboré' feel */}
                                <span className="absolute bottom-6 right-6 text-6xl font-black text-gray-200/50 italic pointer-events-none select-none">
                                    0{index + 1}
                                </span>
                            </div>

                            {/* Info Section - Ultra Clean */}
                            <div className="px-2 space-y-4">
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{product.category}</span>
                                    <div className="h-px flex-1 bg-gray-100" />
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-yellow-50 rounded-full">
                                        <Star size={10} className="fill-yellow-400 text-yellow-400" />
                                        <span className="text-[9px] text-gray-900 font-bold">{product.rating}</span>
                                    </div>
                                </div>

                                <Link href={`/products/${product.id}`}>
                                    <h3 className="text-xl font-black text-gray-900 leading-tight uppercase tracking-tighter hover:text-primary transition-colors line-clamp-2 italic">
                                        {product.name}
                                    </h3>
                                </Link>

                                <div className="flex items-end justify-between pt-2">
                                    <div className="flex flex-col">
                                        {product.oldPrice && (
                                            <span className="text-xs text-gray-400 line-through font-bold mb-1 opacity-50">
                                                {product.oldPrice.toLocaleString()}F
                                            </span>
                                        )}
                                        <span className="text-3xl font-black text-gray-900 tracking-tighter italic">
                                            {product.price.toLocaleString()}<span className="text-sm not-italic ml-1">F</span>
                                        </span>
                                    </div>
                                    <Link href={`/products/${product.id}`} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-primary transition-colors">
                                        <ArrowRight size={20} />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
