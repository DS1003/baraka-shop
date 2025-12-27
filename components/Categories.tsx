'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight, ChevronLeft } from 'lucide-react'

const CATEGORIES = [
    { name: 'Tablettes', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=400' },
    { name: 'Casques', image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=400' },
    { name: 'Montres', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400' },
    { name: 'Phones', image: 'https://images.unsplash.com/photo-1592899677712-a170135c97f5?auto=format&fit=crop&q=80&w=400' },
    { name: 'TV & Home', image: 'https://images.unsplash.com/photo-1593784991095-a20506948430?auto=format&fit=crop&q=80&w=400' },
    { name: 'Enceintes', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=400' },
    { name: 'Laptops', image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=400' },
]

export default function Categories() {
    return (
        <section className="py-8 lg:py-16 overflow-hidden">
            <div className="container px-4 mx-auto">
                <div className="flex justify-between items-end mb-6 md:mb-10">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-none">Univers Populaires</h2>
                        <p className="text-xs md:text-sm text-gray-400 mt-2 font-medium">Explorez nos sélections premium</p>
                    </div>
                    <div className="flex gap-2 hidden md:flex">
                        <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white transition-all">
                            <ChevronLeft size={18} />
                        </button>
                        <button className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-primary transition-all shadow-lg">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                {/* Horizontal Scroll on Mobile, Grid on Desktop */}
                <div className="flex overflow-x-auto lg:grid lg:grid-cols-7 gap-4 md:gap-6 pb-4 lg:pb-0 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
                    {CATEGORIES.map((cat, index) => (
                        <Link
                            href={`/shop?category=${cat.name.toLowerCase()}`}
                            key={cat.name}
                            className="flex-shrink-0 w-[140px] md:w-auto"
                        >
                            <motion.div
                                whileTap={{ scale: 0.95 }}
                                className="group flex flex-col items-center gap-3 cursor-pointer"
                            >
                                <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] w-full aspect-[1/1] md:aspect-[4/5] flex items-center justify-center p-4 md:p-6 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 overflow-hidden relative">
                                    <div className="relative w-full h-full">
                                        <Image
                                            src={cat.image}
                                            alt={cat.name}
                                            fill
                                            className="object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                                <span className="font-black text-[11px] md:text-sm text-gray-700 group-hover:text-primary transition-colors text-center uppercase tracking-wider">{cat.name}</span>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
