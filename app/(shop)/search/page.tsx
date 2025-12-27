'use client'

import React, { useState } from 'react'
import { Search as SearchIcon, X, Filter, SlidersHorizontal, ChevronRight, History, TrendingUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { MOCK_PRODUCTS } from '@/lib/data'

const RECENT_SEARCHES = ['iPhone 15 Pro', 'MacBook Air M3', 'Casque Sony', 'Gaming PC']
const TRENDING_CATEGORIES = [
    { name: 'Smartphones', count: '1.2k+ produits' },
    { name: 'Laptops', count: '800+ produits' },
    { name: 'Accessoires', count: '2.5k+ produits' },
]

export default function SearchPage() {
    const [query, setQuery] = useState('')
    const [isSearching, setIsSearching] = useState(false)

    // Filter logic
    const results = query.length > 2
        ? MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
        : []

    return (
        <div className="min-h-screen bg-white">
            {/* Native App-Style Search Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 py-4 md:py-6">
                <div className="container mx-auto flex items-center gap-4">
                    <div className="flex-1 relative group">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
                        <input
                            autoFocus
                            type="text"
                            placeholder="Marque, modèle, catégorie..."
                            className="w-full bg-gray-100 border-none rounded-2xl py-4 pl-12 pr-12 text-sm font-bold focus:ring-2 focus:ring-black/5 focus:bg-white transition-all outline-none"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        {query && (
                            <button
                                onClick={() => setQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-black"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <button className="hidden md:flex items-center gap-2 bg-black text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                        <Filter size={18} /> Filtrer
                    </button>
                    <button className="md:hidden w-12 h-12 flex items-center justify-center bg-gray-100 rounded-2xl text-black active:scale-90 transition-transform">
                        <SlidersHorizontal size={20} />
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <AnimatePresence mode="wait">
                    {!query ? (
                        <motion.div
                            key="suggestions"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-10"
                        >
                            {/* Recent Searches */}
                            <section>
                                <div className="flex items-center gap-2 mb-6 text-gray-400 font-black uppercase text-[10px] tracking-[0.2em]">
                                    <History size={14} /> Recherches Récentes
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {RECENT_SEARCHES.map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setQuery(s)}
                                            className="bg-gray-50 hover:bg-black hover:text-white px-5 py-2.5 rounded-full text-sm font-bold border border-transparent hover:border-black transition-all"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Trending Categories */}
                            <section>
                                <div className="flex items-center gap-2 mb-6 text-gray-400 font-black uppercase text-[10px] tracking-[0.2em]">
                                    <TrendingUp size={14} /> Tendances
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {TRENDING_CATEGORIES.map(cat => (
                                        <div key={cat.name} className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-transparent hover:border-black/5 hover:bg-white hover:shadow-xl transition-all group cursor-pointer">
                                            <div>
                                                <div className="font-black text-lg">{cat.name}</div>
                                                <div className="text-xs text-gray-400 font-medium">{cat.count}</div>
                                            </div>
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-black group-hover:text-white transition-colors">
                                                <ChevronRight size={18} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h1 className="text-2xl font-black text-gray-900 leading-none">Résultats pour "{query}"</h1>
                                <span className="text-sm font-bold text-primary">{results.length} produits trouvés</span>
                            </div>

                            {results.length > 0 ? (
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                    {results.map((product, idx) => (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            key={product.id}
                                            className="group bg-white border border-gray-100 rounded-[2rem] p-3 hover:shadow-2xl transition-all"
                                        >
                                            <Link href={`/products/${product.id}`}>
                                                <div className="relative aspect-square bg-gray-50 rounded-[1.5rem] overflow-hidden mb-4">
                                                    <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                                </div>
                                                <h3 className="font-black text-sm text-gray-900 line-clamp-2 leading-tight px-2">{product.name}</h3>
                                                <div className="mt-2 text-primary font-black text-lg px-2">{product.price.toLocaleString()} F</div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                                    <div className="text-4xl mb-4">🔍</div>
                                    <h3 className="text-xl font-black mb-2 leading-none">Aucun résultat</h3>
                                    <p className="text-gray-400 text-sm">Essayez avec d'autres mots clés.</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
