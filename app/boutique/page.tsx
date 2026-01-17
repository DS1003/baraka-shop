'use client'

import React, { useState } from 'react'
import { Container } from '@/ui/Container'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Filter,
    LayoutGrid,
    List,
    ChevronDown,
    Star,
    ShoppingCart,
    Heart,
    Eye,
    Zap,
    Search
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProductCard } from '@/ui/ProductCard'

// Mock categories for filters
const categories = [
    { name: 'Informatique', count: 124 },
    { name: 'Smartphones', count: 85 },
    { name: 'Audio & Son', count: 64 },
    { name: 'Jeux Vidéo', count: 42 },
    { name: 'Image & Son', count: 31 },
    { name: 'Tablettes', count: 19 },
]

// Mock brands for filters
const brands = [
    { name: 'Apple', count: 45 },
    { name: 'Samsung', count: 32 },
    { name: 'Sony', count: 28 },
    { name: 'Dell', count: 15 },
    { name: 'HP', count: 12 },
]

// Mock products (same data structure as homepage selective list)
const products = [
    { id: '1', name: 'MacBook Pro M3 Max 14" - Space Black', category: 'Informatique', price: 2500000, oldPrice: 2800000, rating: 5, image: 'https://media.ldlc.com/r705/ld/products/00/06/22/20/LD0006222055.jpg', badges: [{ text: '-15%', color: 'bg-primary' }] },
    { id: '2', name: 'iPhone 15 Pro Max 256GB Natural Titanium', category: 'Smartphones', price: 850000, oldPrice: 900000, rating: 5, image: "https://media.ldlc.com/r705/ld/products/00/06/06/39/LD0006063994.jpg", badges: [{ text: 'NEW', color: 'bg-green-500' }] },
    { id: '3', name: 'Sony WH-1000XM5 Wireless Headphones', category: 'Audio & Son', price: 250000, rating: 4, image: "https://sony.scene7.com/is/image/sonyglobalsolutions/360-RA-category-icon-20221202?$S7Product$&fmt=png-alpha" },
    { id: '4', name: 'Canon EOS R6 Mark II Mirrorless Camera', category: 'Image & Son', price: 1800000, oldPrice: 1950000, rating: 5, image: 'https://in.canon/media/image/2022/11/01/c8c8ab88ead148e9b64490fdd764bcf4_EOS+R6+Mark+II+RF24-105mm+f4-7.1+IS+STM+front+slant.png' },
    { id: '5', name: 'PlayStation 5 Slim Digital Edition', category: 'Jeux Vidéo', price: 450000, oldPrice: 500000, rating: 5, image: 'https://media.ldlc.com/encart/p/26671_b.jpg' },
    { id: '6', name: 'iPad Air M2 11" Blue 128GB', category: 'Tablettes', price: 650000, rating: 4, image: 'https://media.ldlc.com/encart/p/28858_b.jpg' },
    { id: '7', name: 'MacBook Air M2 13" Stellar', category: 'Informatique', price: 950000, oldPrice: 1050000, rating: 5, image: 'https://media.ldlc.com/encart/p/28885_b.jpg' },
    { id: '8', name: 'Samsung S24 Ultra 5G Grey', category: 'Smartphones', price: 1100000, rating: 5, image: 'https://media.ldlc.com/encart/p/28828_b.jpg' },
]

export default function ShopPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [priceRange, setPriceRange] = useState([0, 3000000])
    const [isFilterOpen, setIsFilterOpen] = useState(false)

    const FilterSidebar = ({ className }: { className?: string }) => (
        <aside className={cn("flex flex-col gap-8", className)}>
            {/* Categories Filter */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-sm font-black text-[#1B1F3B] uppercase tracking-widest mb-6 flex items-center justify-between border-b border-gray-50 pb-4">
                    Catégories <ChevronDown className="w-4 h-4 text-gray-400" />
                </h3>
                <div className="flex flex-col gap-3">
                    {categories.map((cat) => (
                        <label key={cat.name} className="flex items-center justify-between group cursor-pointer">
                            <div className="flex items-center gap-3">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-200 text-primary focus:ring-primary transition-all cursor-pointer" />
                                <span className="text-sm font-bold text-gray-500 group-hover:text-[#1B1F3B] transition-colors">{cat.name}</span>
                            </div>
                            <span className="text-[10px] font-black text-gray-300 group-hover:text-primary transition-colors">({cat.count})</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Filter */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-sm font-black text-[#1B1F3B] uppercase tracking-widest mb-6 border-b border-gray-50 pb-4">
                    Prix (CFA)
                </h3>
                <div className="px-2 py-4 flex flex-col gap-6">
                    <div className="flex items-center justify-between text-[11px] font-black text-gray-400 uppercase">
                        <span>{priceRange[0].toLocaleString()} CFA</span>
                        <span>{priceRange[1].toLocaleString()} CFA</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="3000000"
                        className="w-full accent-primary h-1 bg-gray-100 rounded-full appearance-none cursor-pointer"
                    />
                    <button className="w-full h-11 bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-[#1B1F3B] transition-all shadow-lg shadow-primary/20">
                        Appliquer
                    </button>
                </div>
            </div>

            {/* Brands Filter */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-sm font-black text-[#1B1F3B] uppercase tracking-widest mb-6 border-b border-gray-50 pb-4">
                    Marques
                </h3>
                <div className="flex flex-col gap-3">
                    {brands.map((brand) => (
                        <label key={brand.name} className="flex items-center justify-between group cursor-pointer">
                            <div className="flex items-center gap-3">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-200 text-primary focus:ring-primary transition-all cursor-pointer" />
                                <span className="text-sm font-bold text-gray-500 group-hover:text-[#1B1F3B] transition-colors">{brand.name}</span>
                            </div>
                            <span className="text-[10px] font-black text-gray-300 group-hover:text-primary transition-colors">({brand.count})</span>
                        </label>
                    ))}
                </div>
            </div>
        </aside>
    )

    return (
        <main className="bg-[#f8f9fb] min-h-screen">
            {/* Page Header / Breadcrumbs */}
            <div className="bg-[#1B1F3B] py-16 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/10 blur-[100px] rounded-full translate-x-1/2" />
                <Container className="relative z-10 flex flex-col items-center">
                    <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">Notre Boutique</h1>
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
                        <a href="/" className="hover:text-primary transition-colors">Accueil</a>
                        <span className="w-1 h-1 bg-gray-600 rounded-full" />
                        <span className="text-white">Boutique</span>
                    </div>
                </Container>
            </div>

            <Container className="py-12">
                <div className="flex flex-col lg:grid lg:grid-cols-4 gap-8">
                    {/* Mobile Filter Drawer */}
                    <div className="lg:hidden">
                        <button
                            onClick={() => setIsFilterOpen(true)}
                            className="w-full h-14 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center gap-3 font-black text-[11px] uppercase tracking-widest text-[#1B1F3B] hover:shadow-lg transition-all"
                        >
                            <Filter className="w-4 h-4 text-primary" /> Filtrer les produits
                        </button>

                        <AnimatePresence>
                            {isFilterOpen && (
                                <>
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onClick={() => setIsFilterOpen(false)}
                                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
                                    />
                                    <motion.div
                                        initial={{ x: '100%' }}
                                        animate={{ x: 0 }}
                                        exit={{ x: '100%' }}
                                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                        className="fixed top-0 right-0 bottom-0 w-[85%] max-w-[400px] bg-[#f8f9fb] z-[210] p-6 overflow-y-auto"
                                    >
                                        <div className="flex items-center justify-between mb-8">
                                            <h2 className="text-2xl font-black text-[#1B1F3B] uppercase tracking-tighter">Filtres</h2>
                                            <button
                                                onClick={() => setIsFilterOpen(false)}
                                                className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm"
                                            >
                                                <ChevronDown className="w-6 h-6 rotate-90" />
                                            </button>
                                        </div>
                                        <FilterSidebar className="flex" />
                                        <div className="mt-8 sticky bottom-0 left-0 right-0">
                                            <button
                                                onClick={() => setIsFilterOpen(false)}
                                                className="w-full h-16 bg-[#1B1F3B] text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl"
                                            >
                                                Voir les résultats
                                            </button>
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Desktop Sidebar */}
                    <FilterSidebar className="hidden lg:flex" />

                    {/* Product Listing Area */}
                    <div className="lg:col-span-3">
                        {/* Toolbar */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", viewMode === 'grid' ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-gray-50 text-gray-400 hover:bg-gray-100")}
                                    >
                                        <LayoutGrid className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", viewMode === 'list' ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-gray-50 text-gray-400 hover:bg-gray-100")}
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                </div>
                                <span className="text-[10px] sm:text-xs font-bold text-[#1B1F3B] border-l border-gray-100 pl-4">{products.length} Produits</span>
                            </div>

                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <div className="relative flex-1 sm:min-w-[180px]">
                                    <select className="w-full h-11 bg-gray-50 border border-gray-100 rounded-xl px-4 text-xs font-bold text-[#1B1F3B] outline-none appearance-none focus:border-primary transition-all pr-10">
                                        <option>Trier par : Nouveautés</option>
                                        <option>Prix : Croissant</option>
                                        <option>Prix : Décroissant</option>
                                        <option>Mieux notés</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div className={cn(
                            "grid gap-4 md:gap-8 mt-8",
                            viewMode === 'grid' ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1"
                        )}>
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} viewMode={viewMode} />
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="mt-16 flex items-center justify-center gap-3">
                            {[1, 2, 3, '...', 12].map((page, i) => (
                                <button
                                    key={i}
                                    className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-black transition-all",
                                        page === 1 ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white text-gray-500 hover:bg-gray-100 border border-transparent hover:border-gray-200"
                                    )}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </Container>
        </main>
    )
}


