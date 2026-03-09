'use client'

import React, { useState } from 'react'
import { Container } from '@/ui/Container'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Filter,
    LayoutGrid,
    List,
    ChevronDown,
    Search,
    ChevronLeft,
    ChevronRight,
    Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProductCard } from '@/ui/ProductCard'
import Link from 'next/link'

interface ShopClientProps {
    initialProducts: any[]
    categories: any[]
    brands: any[]
    pagination: {
        total: number
        pages: number
        currentPage: number
        limit: number
    }
}

export function ShopClient({ initialProducts, categories, brands, pagination }: ShopClientProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [isPending, setIsPending] = useState(false)

    const currentCategory = searchParams.get('category') || ''
    const currentBrand = searchParams.get('brand') || ''
    const currentSort = searchParams.get('sort') || 'newest'
    const currentPage = Number(searchParams.get('page')) || 1
    const query = searchParams.get('q') || ''
    const minPrice = searchParams.get('minPrice') || ''
    const maxPrice = searchParams.get('maxPrice') || ''

    const updateFilters = (updates: Record<string, string | number | undefined>) => {
        setIsPending(true)
        const params = new URLSearchParams(searchParams.toString())
        Object.entries(updates).forEach(([key, value]) => {
            if (value === undefined || value === '') {
                params.delete(key)
            } else {
                params.set(key, String(value))
            }
        })
        if (!updates.page) {
            params.set('page', '1')
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false })

        // We trust Next.js to re-render, but we give it a tiny bit of time to look pending
        setTimeout(() => setIsPending(false), 300)
    }

    const FilterSidebar = ({ className }: { className?: string }) => (
        <aside className={cn("flex flex-col gap-8", className)}>
            {/* Categories Filter */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-sm font-black text-[#1B1F3B] uppercase tracking-widest mb-6 flex items-center justify-between border-b border-gray-50 pb-4">
                    Catégories <ChevronDown className="w-4 h-4 text-gray-400" />
                </h3>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => updateFilters({ category: '' })}
                        className={cn("text-left text-sm font-bold transition-colors hover:text-primary", !currentCategory ? "text-primary" : "text-gray-500")}
                    >
                        Toutes les catégories
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => updateFilters({ category: cat.slug })}
                            className={cn("flex items-center justify-between group cursor-pointer text-left", currentCategory === cat.slug ? "text-primary" : "text-gray-500 hover:text-[#1B1F3B]")}
                        >
                            <span className="text-sm font-bold transition-colors">{cat.name}</span>
                            <span className="text-[10px] font-black text-gray-300 group-hover:text-primary transition-colors">({cat._count.products})</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Filter */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-sm font-black text-[#1B1F3B] uppercase tracking-widest mb-6 border-b border-gray-50 pb-4">
                    Prix (CFA)
                </h3>
                <div className="px-2 py-4 flex flex-col gap-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="Min"
                                className="w-1/2 h-10 bg-gray-50 border border-gray-100 rounded-lg px-3 text-xs font-bold outline-none focus:border-primary"
                                defaultValue={minPrice}
                                onBlur={(e) => updateFilters({ minPrice: e.target.value })}
                            />
                            <input
                                type="number"
                                placeholder="Max"
                                className="w-1/2 h-10 bg-gray-50 border border-gray-100 rounded-lg px-3 text-xs font-bold outline-none focus:border-primary"
                                defaultValue={maxPrice}
                                onBlur={(e) => updateFilters({ maxPrice: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Brands Filter */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-sm font-black text-[#1B1F3B] uppercase tracking-widest mb-6 border-b border-gray-50 pb-4">
                    Marques
                </h3>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => updateFilters({ brand: '' })}
                        className={cn("text-left text-sm font-bold transition-colors hover:text-primary", !currentBrand ? "text-primary" : "text-gray-500")}
                    >
                        Toutes les marques
                    </button>
                    {brands.map((brand) => (
                        <button
                            key={brand.id}
                            onClick={() => updateFilters({ brand: brand.slug })}
                            className={cn("flex items-center justify-between group cursor-pointer text-left", currentBrand === brand.slug ? "text-primary" : "text-gray-500 hover:text-[#1B1F3B]")}
                        >
                            <span className="text-sm font-bold transition-colors">{brand.name}</span>
                            <span className="text-[10px] font-black text-gray-300 group-hover:text-primary transition-colors">({brand._count.products})</span>
                        </button>
                    ))}
                </div>
            </div>
        </aside>
    )

    return (
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
                            <span className="text-[10px] sm:text-xs font-bold text-[#1B1F3B] border-l border-gray-100 pl-4">
                                {pagination.total} Produits
                            </span>
                        </div>

                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="relative flex-1 sm:min-w-[200px]">
                                <select
                                    value={currentSort}
                                    onChange={(e) => updateFilters({ sort: e.target.value })}
                                    className="w-full h-11 bg-gray-50 border border-gray-100 rounded-xl px-4 text-xs font-bold text-[#1B1F3B] outline-none appearance-none focus:border-primary transition-all pr-10"
                                >
                                    <option value="newest">Trier par : Nouveautés</option>
                                    <option value="price_asc">Prix : Croissant</option>
                                    <option value="price_desc">Prix : Décroissant</option>
                                    <option value="oldest">Les plus anciens</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Search Info */}
                    {query && (
                        <div className="mt-6 flex items-center gap-2">
                            <span className="text-sm text-gray-400">Résultats pour </span>
                            <span className="text-sm font-black text-[#1B1F3B]">"{query}"</span>
                            <button
                                onClick={() => updateFilters({ q: '' })}
                                className="text-[10px] font-black text-primary uppercase ml-2"
                            >
                                Effacer
                            </button>
                        </div>
                    )}

                    {/* Product Grid */}
                    <div className="relative mt-8">
                        {isPending && (
                            <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-2xl">
                                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                            </div>
                        )}

                        {initialProducts.length === 0 ? (
                            <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search className="w-10 h-10 text-gray-300" />
                                </div>
                                <h3 className="text-xl font-black text-[#1B1F3B] uppercase tracking-tighter mb-2">Aucun produit trouvé</h3>
                                <p className="text-gray-400 text-sm max-w-xs mx-auto">Essayez de modifier vos filtres ou votre recherche pour trouver ce que vous cherchez.</p>
                                <button
                                    onClick={() => updateFilters({ category: '', brand: '', q: '', minPrice: '', maxPrice: '', page: 1 })}
                                    className="mt-8 px-8 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20"
                                >
                                    Réinitialiser tout
                                </button>
                            </div>
                        ) : (
                            <div className={cn(
                                "grid gap-4 md:gap-8",
                                viewMode === 'grid' ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1"
                            )}>
                                {initialProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} viewMode={viewMode} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="mt-24 flex flex-col items-center gap-6">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => updateFilters({ page: pagination.currentPage - 1 })}
                                    disabled={pagination.currentPage === 1}
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white border border-gray-100 text-gray-400 hover:text-primary hover:border-primary/20 disabled:opacity-30 disabled:hover:text-gray-400 disabled:hover:border-gray-100 transition-all shadow-sm"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                <div className="flex items-center gap-2">
                                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => updateFilters({ page })}
                                            className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-black transition-all border",
                                                page === pagination.currentPage
                                                    ? "bg-[#1B1F3B] text-white border-[#1B1F3B] shadow-xl shadow-[#1B1F3B]/20 scale-110"
                                                    : "bg-white text-gray-500 border-gray-100 hover:border-primary/30 hover:text-primary shadow-sm"
                                            )}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => updateFilters({ page: pagination.currentPage + 1 })}
                                    disabled={pagination.currentPage === pagination.pages}
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white border border-gray-100 text-gray-400 hover:text-primary hover:border-primary/20 disabled:opacity-30 disabled:hover:text-gray-400 disabled:hover:border-gray-100 transition-all shadow-sm"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Container>
    )
}
