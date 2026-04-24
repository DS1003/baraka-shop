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
    Loader2,
    X,
    Package,
    Tag,
    Clock,
    Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProductCard } from '@/ui/ProductCard'

interface NouveautesClientProps {
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

export function NouveautesClient({ initialProducts, categories, brands, pagination }: NouveautesClientProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list') // Default to list for that LDLC feel
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
        setTimeout(() => setIsPending(false), 300)
    }

    const FilterSidebar = ({ className }: { className?: string }) => (
        <aside className={cn("flex flex-col gap-6", className)}>
            <div className="bg-[#1B1F3B] text-white rounded-t-3xl p-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3">
                    <Filter className="w-4 h-4 text-primary" /> Filtrer les produits :
                </h3>
            </div>
            
            <div className="bg-white rounded-b-3xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col gap-8">
                {/* Search in Sidebar like screenshot */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Chercher une référence</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Désignation, modèle..."
                            className="w-full h-11 bg-gray-50 border border-gray-100 rounded-xl pl-4 pr-10 text-[13px] font-bold outline-none focus:border-primary transition-all"
                            defaultValue={query}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    updateFilters({ q: (e.target as HTMLInputElement).value })
                                }
                            }}
                        />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    </div>
                </div>

                {/* Categories */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Catégories</label>
                    <div className="flex flex-col gap-2">
                        {categories.slice(0, 10).map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => updateFilters({ category: cat.slug })}
                                className={cn(
                                    "flex items-center justify-between px-4 py-2.5 rounded-xl transition-all group",
                                    currentCategory === cat.slug 
                                        ? "bg-primary/10 text-primary" 
                                        : "hover:bg-gray-50 text-gray-500 hover:text-[#1B1F3B]"
                                )}
                            >
                                <span className="text-[12px] font-bold">{cat.name}</span>
                                <span className="text-[10px] font-black opacity-30 group-hover:opacity-100">({cat._count.products})</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Brands */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Marques</label>
                    <div className="flex flex-wrap gap-2">
                        {brands.slice(0, 12).map((brand) => (
                            <button
                                key={brand.id}
                                onClick={() => updateFilters({ brand: brand.slug })}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all",
                                    currentBrand === brand.slug
                                        ? "bg-[#1B1F3B] text-white border-[#1B1F3B]"
                                        : "bg-white text-gray-400 border-gray-100 hover:border-primary hover:text-primary"
                                )}
                            >
                                {brand.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Price */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Prix (CFA)</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="number"
                            placeholder="Min"
                            className="w-1/2 h-10 bg-gray-50 border border-gray-100 rounded-lg px-3 text-[12px] font-bold outline-none focus:border-primary"
                            defaultValue={minPrice}
                            onBlur={(e) => updateFilters({ minPrice: e.target.value })}
                        />
                        <div className="w-2 h-[2px] bg-gray-200" />
                        <input
                            type="number"
                            placeholder="Max"
                            className="w-1/2 h-10 bg-gray-50 border border-gray-100 rounded-lg px-3 text-[12px] font-bold outline-none focus:border-primary"
                            defaultValue={maxPrice}
                            onBlur={(e) => updateFilters({ maxPrice: e.target.value })}
                        />
                    </div>
                </div>
            </div>
        </aside>
    )

    return (
        <Container className="pb-24 -mt-12 relative z-20">
            <div className="flex flex-col lg:grid lg:grid-cols-4 gap-8">
                {/* Desktop Sidebar */}
                <FilterSidebar className="hidden lg:flex" />

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-8">
                    {/* Results Header */}
                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-primary">
                                <Zap className="w-6 h-6 fill-current" />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-[#1B1F3B] uppercase tracking-tighter">
                                    {pagination.total} Nouveautés <span className="text-primary italic">correspondent</span>
                                </h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Derniers arrivages mis à jour</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-[#1B1F3B]")}
                                >
                                    <LayoutGrid size={18} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-[#1B1F3B]")}
                                >
                                    <List size={18} />
                                </button>
                            </div>
                            <select
                                value={currentSort}
                                onChange={(e) => updateFilters({ sort: e.target.value })}
                                className="h-11 bg-white border border-gray-100 rounded-xl px-4 text-[11px] font-black uppercase tracking-widest text-[#1B1F3B] outline-none focus:border-primary transition-all shadow-sm"
                            >
                                <option value="newest text-slate-900">Trier par : Nouveautés</option>
                                <option value="price_asc text-slate-900">Prix : Croissant</option>
                                <option value="price_desc text-slate-900">Prix : Décroissant</option>
                            </select>
                        </div>
                    </div>

                    {/* Products Grid/List */}
                    <div className="relative min-h-[400px]">
                        {isPending && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-3xl">
                                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                            </div>
                        )}

                        {initialProducts.length === 0 ? (
                            <div className="bg-white rounded-[40px] p-20 text-center border border-gray-100 shadow-sm">
                                <Package className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                                <h3 className="text-2xl font-black text-[#1B1F3B] uppercase tracking-tighter">Aucune nouveauté ici</h3>
                                <p className="text-gray-400 text-sm mt-2 max-w-xs mx-auto">Revenez plus tard ou essayez d'autres filtres.</p>
                                <button
                                    onClick={() => updateFilters({ category: '', brand: '', q: '' })}
                                    className="mt-8 px-10 py-4 bg-[#1B1F3B] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-primary transition-all shadow-xl"
                                >
                                    Tout voir
                                </button>
                            </div>
                        ) : (
                            <div className={cn(
                                "grid gap-6 md:gap-8",
                                viewMode === 'grid' ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1"
                            )}>
                                {initialProducts.map((product, idx) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <ProductCard product={product} viewMode={viewMode} />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="flex justify-center pt-12">
                            <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                                <button
                                    onClick={() => updateFilters({ page: pagination.currentPage - 1 })}
                                    disabled={pagination.currentPage === 1}
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-primary disabled:opacity-20 transition-all"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                {[...Array(pagination.pages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => updateFilters({ page: i + 1 })}
                                        className={cn(
                                            "w-10 h-10 rounded-xl text-[11px] font-black transition-all",
                                            pagination.currentPage === i + 1 ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-gray-400 hover:text-[#1B1F3B] hover:bg-gray-50"
                                        )}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => updateFilters({ page: pagination.currentPage + 1 })}
                                    disabled={pagination.currentPage === pagination.pages}
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-primary disabled:opacity-20 transition-all"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Container>
    )
}
