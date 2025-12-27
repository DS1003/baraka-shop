'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, ChevronDown, SlidersHorizontal, LayoutGrid, List, Search, X, Sparkles, ArrowRight } from 'lucide-react'
import ProductCard from '@/components/features/product/ProductCard'
import { cn } from '@/lib/utils'
import { MOCK_PRODUCTS } from '@/lib/data'
import Link from 'next/link'
import Image from 'next/image'

const FILTERS = [
    {
        id: 'category',
        name: 'Catégories',
        options: [
            { label: 'Smartphones', value: 'smartphones', count: 120 },
            { label: 'Ordinateurs', value: 'laptops', count: 85 },
            { label: 'Audio & Son', value: 'audio', count: 45 },
            { label: 'Gaming', value: 'gaming', count: 65 },
            { label: 'Accessoires', value: 'accessories', count: 200 },
        ]
    },
    {
        id: 'price',
        name: 'Budget (FCFA)',
        options: [
            { label: 'Sous 50.000 F', value: '0-50000', count: 50 },
            { label: '50.000 - 250.000 F', value: '50000-250000', count: 120 },
            { label: '250.000 - 750.000 F', value: '250000-750000', count: 80 },
            { label: '+ 750.000 F', value: '750000-plus', count: 45 },
        ]
    },
    {
        id: 'brand',
        name: 'Marques Phares',
        options: [
            { label: 'Apple', value: 'apple', count: 60 },
            { label: 'Samsung', value: 'samsung', count: 55 },
            { label: 'Sony', value: 'sony', count: 25 },
            { label: 'ASUS ROG', value: 'asus', count: 18 },
        ]
    }
]

export default function ShopPage() {
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [searchQuery, setSearchQuery] = useState('')

    return (
        <div className="bg-[#fcfcfc] min-h-screen pb-32">

            {/* Immersive Category Header */}
            <div className="bg-white border-b border-gray-100 pt-12 pb-16">
                <div className="container px-4 mx-auto text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <div className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-4">
                                <Sparkles size={14} /> Catalogue 2025
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-none mb-4">
                                Notre <span className="text-primary italic">Boutique.</span>
                            </h1>
                            <p className="text-gray-400 font-medium max-w-lg">
                                Plus de 5.000 références premium sélectionnées par nos experts technologiques à Dakar.
                            </p>
                        </div>

                        {/* Interactive Toolbar */}
                        <div className="flex flex-wrap items-center gap-3 justify-center md:justify-end">
                            <div className="relative group min-w-[200px] md:min-w-[300px]">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black" size={18} />
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none shadow-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="hidden md:flex bg-gray-50 p-1 rounded-xl border border-gray-100 shadow-sm">
                                <button onClick={() => setViewMode('grid')} className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-white text-black shadow-md" : "text-gray-400 hover:text-black")}><LayoutGrid size={18} /></button>
                                <button onClick={() => setViewMode('list')} className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-white text-black shadow-md" : "text-gray-400 hover:text-black")}><List size={18} /></button>
                            </div>
                            <button
                                onClick={() => setMobileFiltersOpen(true)}
                                className="lg:hidden flex items-center gap-2 bg-black text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95"
                            >
                                <SlidersHorizontal size={16} /> Filtres
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container px-4 mx-auto pt-10">
                <div className="flex gap-12">

                    {/* Sidebar Filters (Desktop) */}
                    <aside className="hidden lg:block w-72 shrink-0 space-y-10">
                        {FILTERS.map((section) => (
                            <div key={section.id} className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 pl-4">{section.name}</h3>
                                <div className="space-y-2">
                                    {section.options.map((option) => (
                                        <label key={option.value} className="flex items-center group cursor-pointer">
                                            <div className="relative flex items-center gap-4 w-full p-4 rounded-2xl border-2 border-transparent hover:bg-white hover:border-gray-100 hover:shadow-xl transition-all">
                                                <input type="checkbox" className="peer w-5 h-5 border-2 border-gray-200 rounded-lg checked:bg-black checked:border-black transition-all appearance-none" />
                                                <CheckCircle2 size={12} className="absolute left-4.5 top-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity ml-1" />
                                                <div className="flex-1">
                                                    <div className="text-sm font-bold text-gray-500 group-hover:text-black transition-colors">{option.label}</div>
                                                </div>
                                                <span className="text-[10px] font-black text-gray-300 group-hover:text-primary transition-colors">{option.count}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Promo Sidebar Card */}
                        <Link href="/shop/deals" className="block relative h-[400px] rounded-[2.5rem] overflow-hidden group shadow-2xl shadow-primary/20">
                            <Image src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800" fill alt="Promo" className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                            <div className="absolute bottom-10 left-8 right-8 text-white">
                                <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Vente Flash</div>
                                <h4 className="text-2xl font-black mb-4">Gaming Week <br /> Jusqu'à -40%</h4>
                                <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-lg">
                                    <ArrowRight size={20} />
                                </div>
                            </div>
                        </Link>
                    </aside>

                    {/* Product Feed Area */}
                    <div className="flex-1 space-y-8">

                        {/* Active Filters Bar */}
                        <div className="hidden lg:flex items-center justify-between bg-white p-4 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40">
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Tri par:</span>
                                <div className="flex gap-2">
                                    {['Populaire', 'Plus Récents', 'Prix Bas'].map(t => (
                                        <button key={t} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", t === 'Populaire' ? "bg-black text-white" : "text-gray-400 hover:bg-gray-50")}>{t}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mr-4">842 Produits trouvés</div>
                        </div>

                        {/* Grid */}
                        <div className={cn(
                            "grid gap-4 md:gap-8",
                            viewMode === 'grid' ? "grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
                        )}>
                            {MOCK_PRODUCTS.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
                                >
                                    <ProductCard product={product} />
                                </motion.div>
                            ))}
                        </div>

                        {/* Premium Pagination */}
                        <div className="pt-20 flex flex-col items-center gap-8">
                            <div className="flex items-center gap-3">
                                <button className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:border-black hover:text-black transition-all shadow-xl">1</button>
                                <button className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center text-lg font-black shadow-2xl">2</button>
                                <button className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:border-black hover:text-black transition-all shadow-xl">3</button>
                                <span className="px-2 text-gray-300 font-black">...</span>
                                <button className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:border-black hover:text-black transition-all shadow-xl">24</button>
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Page 2 de 24</p>
                        </div>
                    </div>

                </div>
            </div>

            {/* Mobile Filters Drawer */}
            <AnimatePresence>
                {mobileFiltersOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileFiltersOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-x-0 bottom-0 bg-white rounded-t-[3rem] z-[101] max-h-[90vh] overflow-y-auto px-8 pt-4 pb-12"
                        >
                            <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-10" />
                            <div className="flex justify-between items-center mb-10">
                                <h2 className="text-3xl font-black tracking-tight">Filtres.</h2>
                                <button onClick={() => setMobileFiltersOpen(false)} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center"><X size={20} /></button>
                            </div>

                            <div className="space-y-12">
                                {FILTERS.map((section) => (
                                    <div key={section.id} className="space-y-6">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{section.name}</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {section.options.map((option) => (
                                                <button key={option.value} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border-2 border-transparent active:border-black active:bg-white transition-all text-left">
                                                    <span className="text-sm font-black">{option.label}</span>
                                                    <span className="text-[10px] font-black text-gray-300">{option.count}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full bg-black text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] mt-12 shadow-2xl shadow-black/20">
                                Appliquer les filtres
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}

function CheckCircle2({ className, size }: { className?: string, size?: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M20 6 9 17l-5-5" />
        </svg>
    )
}
