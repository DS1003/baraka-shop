'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight, ChevronLeft } from 'lucide-react'

// Updated Mock Data with premium images matching "Image 1" style
const CATEGORIES = [
    { name: 'Tablettes', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=400' }, // iPad Vertical
    { name: 'Casques', image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=400' }, // Sony Headphones Clean
    { name: 'Montres', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400' }, // White Watch
    { name: 'Phones', image: 'https://images.unsplash.com/photo-1592899677712-a170135c97f5?auto=format&fit=crop&q=80&w=400' }, // Phone vertical
    { name: 'TV & Home', image: 'https://images.unsplash.com/photo-1593784991095-a20506948430?auto=format&fit=crop&q=80&w=400' }, // TV Screen
    { name: 'Enceintes', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=400' }, // JBL style speaker
    { name: 'Laptops', image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=400' }, // Laptop open
]

export default function Categories() {
    return (
        <section className="py-12">
            <div className="container px-4 mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Catégories Populaires</h2>
                    <div className="flex gap-3">
                        <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white transition-all duration-300">
                            <ChevronLeft size={18} />
                        </button>
                        <button className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-orange-600 transition-all duration-300 shadow-lg shadow-orange-500/30">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
                    {CATEGORIES.map((cat, index) => (
                        <Link href={`/shop?category=${cat.name.toLowerCase()}`} key={cat.name}>
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="group flex flex-col items-center gap-4 cursor-pointer"
                            >
                                <div className="bg-white rounded-[2rem] w-full aspect-[4/5] flex items-center justify-center p-6 group-hover:shadow-xl transition-all duration-500 border border-gray-100 overflow-hidden relative">
                                    <div className="relative w-full h-full">
                                        <Image
                                            src={cat.image}
                                            alt={cat.name}
                                            fill
                                            className="object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </div>
                                    {/* Subtle Overlay on hover */}
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                                <span className="font-bold text-sm text-gray-700 group-hover:text-primary transition-colors">{cat.name}</span>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
