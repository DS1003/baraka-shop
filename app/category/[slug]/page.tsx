'use client'

import React, { use } from 'react'
import { Container } from '@/ui/Container'
import { ProductCard } from '@/ui/ProductCard'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

// Mock Data
const products = [
    {
        id: '1',
        name: 'Apple iPhone 15 Pro Max 256GB Titane Naturel',
        price: 890000,
        oldPrice: 950000,
        rating: 5,
        reviews: 24,
        image: 'https://media.ldlc.com/r705/ld/products/00/06/06/39/LD0006063994.jpg',
        category: 'Smartphone',
        isNew: true
    },
    {
        id: '2',
        name: 'Samsung Galaxy S24 Ultra 512GB Gris',
        price: 825000,
        oldPrice: 850000,
        rating: 4.8,
        reviews: 18,
        image: 'https://media.ldlc.com/r705/ld/products/00/06/22/20/LD0006222055.jpg',
        category: 'Smartphone',
        isSale: true
    },
    {
        id: '3',
        name: 'Apple iPhone 14 Pro 128GB',
        price: 750000,
        rating: 4.5,
        reviews: 40,
        image: 'https://media.ldlc.com/r705/ld/products/00/06/06/39/LD0006063994.jpg',
        category: 'Smartphone'
    },
    {
        id: '4',
        name: 'Sony WH-1000XM5 Wireless Headphones',
        price: 250000,
        rating: 4.6,
        reviews: 55,
        image: 'https://sony.scene7.com/is/image/sonyglobalsolutions/360-RA-category-icon-20221202?$S7Product$&fmt=png-alpha',
        category: 'Audio'
    }
]

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const categoryName = slug.replace('-', ' ').toUpperCase();

    return (
        <main className="bg-[#f8f9fb] min-h-screen">
            {/* Editorial Header */}
            <div className="bg-[#1B1F3B] py-20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
                    style={{ backgroundImage: `url('https://res.cloudinary.com/dgro5x4h8/image/upload/v1768669738/pattern_2_kln9c6.png')`, backgroundSize: '400px' }} />
                <div className="absolute -bottom-1/2 -right-1/4 w-[50%] h-full bg-primary/10 blur-[120px] rounded-full" />

                <Container className="relative z-10">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">
                        <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-white">Rayons</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-primary">{categoryName}</span>
                    </div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4"
                    >
                        {categoryName}
                    </motion.h1>
                    <p className="text-gray-400 max-w-2xl text-lg font-medium">
                        Découvrez notre sélection exclusive de {categoryName.toLowerCase()}. Performance, design et authenticité garantis.
                    </p>
                </Container>
            </div>

            <section className="py-20">
                <Container>
                    {/* Products Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map((product, idx) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <ProductCard product={product} />
                            </motion.div>
                        ))}
                    </div>

                    {/* Load More Fallback */}
                    <div className="mt-20 flex flex-col items-center gap-6">
                        <div className="w-12 h-[2px] bg-gray-100" />
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">Fin de la sélection</p>
                    </div>
                </Container>
            </section>
        </main>
    )
}
