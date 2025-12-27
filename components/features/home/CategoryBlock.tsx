'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Star, Heart, ShoppingCart } from 'lucide-react'
import { MOCK_PRODUCTS } from '@/lib/data'

interface CategoryBlockProps {
    title: string
    category: string
    image: string
    description?: string
}

export default function CategoryBlock({ title, category, image, description }: CategoryBlockProps) {
    // Filter products for this category (mock logic - just taking first 4 for demo)
    const products = MOCK_PRODUCTS.slice(0, 4);

    return (
        <section className="py-8">
            <div className="container px-4 mx-auto">
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* Banner Card (Left) - Modern & Tall */}
                    <div className="lg:w-[30%] relative rounded-[2rem] overflow-hidden group min-h-[350px] lg:min-h-[500px] shadow-2xl cursor-pointer">
                        <Image
                            src={image}
                            alt={title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-in-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/90 group-hover:via-black/40 transition-colors duration-500" />

                        <div className="absolute top-6 left-6">
                            <span className="bg-white/20 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                                Collection 2025
                            </span>
                        </div>

                        <div className="absolute bottom-0 left-0 p-8 w-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                            <h3 className="text-4xl font-black text-white mb-2 leading-tight">{title}</h3>
                            {description && <p className="text-gray-300 text-sm mb-6 line-clamp-2">{description}</p>}

                            <Link href={`/shop?category=${category}`} className="inline-flex items-center gap-3 text-white font-bold group-hover:gap-4 transition-all">
                                <span className="border-b-2 border-primary pb-0.5">Voir la collection</span>
                                <ArrowRight size={18} className="text-primary" />
                            </Link>
                        </div>
                    </div>

                    {/* Product Grid (Right) */}
                    <div className="lg:w-[70%] grid grid-cols-2 md:grid-cols-4 gap-4 items-start content-start">
                        {products.map((product, idx) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white rounded-2xl p-3 hover:shadow-xl transition-all duration-300 cursor-pointer group/card h-full border border-transparent hover:border-gray-100"
                            >
                                <div className="relative aspect-[4/5] mb-3 bg-[#f4f4f5] rounded-xl overflow-hidden">
                                    {/* Badges */}
                                    {/* Badges */}
                                    {product.oldPrice && (
                                        <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                                            -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                                        </span>
                                    )}

                                    {/* Hover Actions */}
                                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity z-10 translate-x-4 group-hover/card:translate-x-0 duration-300">
                                        <button className="w-8 h-8 rounded-full bg-white text-gray-800 flex items-center justify-center hover:bg-primary hover:text-white shadow-md transition-colors">
                                            <Heart size={14} />
                                        </button>
                                        <button className="w-8 h-8 rounded-full bg-white text-gray-800 flex items-center justify-center hover:bg-primary hover:text-white shadow-md transition-colors">
                                            <ShoppingCart size={14} />
                                        </button>
                                    </div>

                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover/card:scale-110 transition-transform duration-700 mix-blend-multiply"
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center gap-1 mb-1">
                                        <Star size={10} className="fill-yellow-400 text-yellow-400" />
                                        <span className="text-[10px] text-gray-400 font-medium">{product.rating}</span>
                                    </div>
                                    <h4 className="font-bold text-sm text-gray-900 line-clamp-2 mb-2 group-hover/card:text-primary transition-colors leading-snug min-h-[2.5em]">{product.name}</h4>
                                    <div className="flex items-end justify-between">
                                        <div className="flex flex-col">
                                            {product.oldPrice && (
                                                <span className="text-[10px] text-gray-400 line-through">{product.oldPrice.toLocaleString()} F</span>
                                            )}
                                            <span className="font-bold text-primary text-sm">{product.price.toLocaleString()} F</span>
                                        </div>
                                        <button className="bg-black text-white p-1.5 rounded-lg hover:bg-primary transition-colors">
                                            <ShoppingCart size={14} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    )
}
