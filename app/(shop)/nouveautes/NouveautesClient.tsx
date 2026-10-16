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
    Zap,
    SlidersHorizontal,
    ArrowUpDown,
    Check,
    Sparkles,
    ArrowUpRight,
    ArrowDownRight,
    RotateCcw
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

const SORT_OPTIONS = [
    { value: 'newest', label: 'Nouveautés', desc: 'Derniers arrivages en premier', icon: Sparkles },
    { value: 'price_asc', label: 'Prix croissant', desc: 'Du moins cher au plus cher', icon: ArrowUpRight },
    { value: 'price_desc', label: 'Prix décroissant', desc: 'Du plus cher au moins cher', icon: ArrowDownRight },
]

export function NouveautesClient({ initialProducts, categories, brands, pagination }: NouveautesClientProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list') // Default to list for that LDLC feel
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [isSortOpen, setIsSortOpen] = useState(false)
    const [isPending, setIsPending] = useState(false)

    const currentCategory = searchParams.get('category') || ''
    const currentBrand = searchParams.get('brand') || ''
    const currentSort = searchParams.get('sort') || 'newest'
    const currentPage = Number(searchParams.get('page')) || 1
    const query = searchParams.get('q') || ''
    const minPrice = searchParams.get('minPrice') || ''
    const maxPrice = searchParams.get('maxPrice') || ''

    const activeFiltersCount = [
        currentCategory,
        currentBrand,
        minPrice,
        maxPrice,
        query
    ].filter(Boolean).length

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
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Prix (FCFA)</label>
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
        <Container className="pb-20 sm:pb-24 -mt-8 sm:-mt-12 md:-mt-16 relative z-20 px-3 sm:px-6">
            {/* Mobile Filter Drawer */}
            <AnimatePresence>
                {isFilterOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsFilterOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] lg:hidden"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 w-[88%] max-w-[380px] bg-[#f8f9fb] z-[210] p-5 sm:p-6 overflow-y-auto flex flex-col justify-between lg:hidden shadow-2xl"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200/70">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-lg font-black text-[#1B1F3B] uppercase tracking-tight">Filtres</h2>
                                        {activeFiltersCount > 0 && (
                                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black">
                                                {activeFiltersCount} actif{activeFiltersCount > 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setIsFilterOpen(false)}
                                        aria-label="Fermer les filtres"
                                        className="w-9 h-9 rounded-full bg-white border border-gray-200/80 flex items-center justify-center shadow-xs text-gray-500 hover:text-black transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <FilterSidebar className="flex" />
                            </div>

                            <div className="mt-8 pt-4 sticky bottom-0 bg-[#f8f9fb]/95 backdrop-blur-sm border-t border-gray-200/60 flex items-center gap-2">
                                {activeFiltersCount > 0 && (
                                    <button
                                        onClick={() => {
                                            updateFilters({ category: '', brand: '', minPrice: '', maxPrice: '', q: '' })
                                            setIsFilterOpen(false)
                                        }}
                                        className="px-4 h-12 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-50 transition-all shrink-0"
                                    >
                                        Effacer
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsFilterOpen(false)}
                                    className="flex-1 h-12 bg-[#1B1F3B] text-white rounded-xl font-black uppercase tracking-wider text-xs shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                                >
                                    Voir {initialProducts.length} résultat{initialProducts.length > 1 ? 's' : ''}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Mobile Sort Bottom Sheet */}
            <AnimatePresence>
                {isSortOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSortOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[200] md:hidden"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                            className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-white rounded-t-3xl z-[210] p-5 pb-[calc(2rem+env(safe-area-inset-bottom,1rem))] overflow-y-auto md:hidden shadow-2xl border-t border-gray-100"
                        >
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <ArrowUpDown className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-sm font-black text-[#1B1F3B] uppercase tracking-tight">
                                        Trier les nouveautés
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setIsSortOpen(false)}
                                    aria-label="Fermer le tri"
                                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-[#1B1F3B] transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex flex-col gap-2">
                                {SORT_OPTIONS.map((opt) => {
                                    const isSelected = currentSort === opt.value
                                    const Icon = opt.icon
                                    return (
                                        <button
                                            key={opt.value}
                                            onClick={() => {
                                                updateFilters({ sort: opt.value })
                                                setIsSortOpen(false)
                                            }}
                                            className={cn(
                                                "w-full p-3.5 rounded-2xl flex items-center justify-between text-left transition-all active:scale-[0.98] border",
                                                isSelected
                                                    ? "bg-primary/5 border-primary shadow-xs"
                                                    : "bg-gray-50/70 hover:bg-gray-100 border-gray-100 text-gray-700"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                                                    isSelected ? "bg-primary text-white shadow-xs" : "bg-white text-gray-500 border border-gray-200/60"
                                                )}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className={cn("text-xs font-black", isSelected ? "text-primary" : "text-[#1B1F3B]")}>
                                                        {opt.label}
                                                    </p>
                                                    <p className="text-[11px] text-gray-400 font-medium">
                                                        {opt.desc}
                                                    </p>
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white shrink-0 shadow-xs">
                                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <div className="flex flex-col lg:grid lg:grid-cols-4 gap-8">
                {/* Desktop Sidebar */}
                <FilterSidebar className="hidden lg:flex" />

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6 sm:space-y-8">
                    {/* Results Header Card - 100% Mobile Responsive */}
                    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col gap-4">
                        {/* Title & Info Row */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-primary shrink-0 ring-1 ring-primary/20">
                                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-base sm:text-xl md:text-2xl font-black text-[#1B1F3B] uppercase tracking-tighter truncate">
                                        Les {initialProducts.length} dernières <span className="text-primary italic">nouveautés</span>
                                    </h2>
                                    <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate">
                                        Derniers arrivages mis à jour
                                    </p>
                                </div>
                            </div>

                            {/* Desktop Controls (md+) */}
                            <div className="hidden md:flex items-center gap-3 shrink-0">
                                <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        aria-label="Mode grille"
                                        className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-[#1B1F3B]")}
                                    >
                                        <LayoutGrid size={18} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        aria-label="Mode liste"
                                        className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-[#1B1F3B]")}
                                    >
                                        <List size={18} />
                                    </button>
                                </div>
                                <select
                                    value={currentSort}
                                    onChange={(e) => updateFilters({ sort: e.target.value })}
                                    className="h-11 bg-white border border-gray-100 rounded-xl px-4 text-[11px] font-black uppercase tracking-widest text-[#1B1F3B] outline-none focus:border-primary transition-all shadow-sm cursor-pointer"
                                >
                                    <option value="newest">Trier par : Nouveautés</option>
                                    <option value="price_asc">Prix : Croissant</option>
                                    <option value="price_desc">Prix : Décroissant</option>
                                </select>
                            </div>
                        </div>

                        {/* Mobile Controls (< md) */}
                        <div className="flex flex-col gap-3 md:hidden pt-3 border-t border-gray-100">
                            {/* Action Row: Filtres & Trier Buttons */}
                            <div className="grid grid-cols-2 gap-2.5">
                                <button
                                    onClick={() => setIsFilterOpen(true)}
                                    className={cn(
                                        "h-11 px-3.5 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider transition-all active:scale-[0.98] border shadow-xs select-none",
                                        activeFiltersCount > 0
                                            ? "bg-[#1B1F3B] text-white border-[#1B1F3B] shadow-sm shadow-[#1B1F3B]/20"
                                            : "bg-gray-50 hover:bg-gray-100 text-[#1B1F3B] border-gray-200/80"
                                    )}
                                >
                                    <SlidersHorizontal className="w-3.5 h-3.5 text-primary shrink-0" />
                                    <span>Filtres</span>
                                    {activeFiltersCount > 0 && (
                                        <span className="min-w-5 h-5 px-1.5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                                            {activeFiltersCount}
                                        </span>
                                    )}
                                </button>

                                <button
                                    onClick={() => setIsSortOpen(true)}
                                    className="h-11 px-3.5 bg-gray-50 hover:bg-gray-100 active:bg-gray-200/70 border border-gray-200/80 rounded-xl flex items-center justify-between text-xs font-bold text-[#1B1F3B] transition-all active:scale-[0.98] shadow-xs select-none"
                                >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <ArrowUpDown className="w-3.5 h-3.5 text-primary shrink-0" />
                                        <span className="truncate">
                                            {SORT_OPTIONS.find(o => o.value === currentSort)?.label || 'Trier'}
                                        </span>
                                    </div>
                                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-1" />
                                </button>
                            </div>

                            {/* Active Filter Chips Bar */}
                            {activeFiltersCount > 0 && (
                                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 shrink-0 mr-0.5">
                                        Actifs :
                                    </span>
                                    {currentCategory && (
                                        <button
                                            onClick={() => updateFilters({ category: '' })}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-[11px] font-bold shrink-0 transition-colors"
                                        >
                                            <span>{categories.find(c => c.slug === currentCategory)?.name || currentCategory}</span>
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                    {currentBrand && (
                                        <button
                                            onClick={() => updateFilters({ brand: '' })}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-[11px] font-bold shrink-0 transition-colors"
                                        >
                                            <span>Marque : {brands.find(b => b.slug === currentBrand)?.name || currentBrand}</span>
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                    {(minPrice || maxPrice) && (
                                        <button
                                            onClick={() => updateFilters({ minPrice: '', maxPrice: '' })}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-[11px] font-bold shrink-0 transition-colors"
                                        >
                                            <span>Prix : {minPrice || '0'} - {maxPrice || '∞'} F</span>
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                    {query && (
                                        <button
                                            onClick={() => updateFilters({ q: '' })}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-[11px] font-bold shrink-0 transition-colors"
                                        >
                                            <span>"{query}"</span>
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => updateFilters({ category: '', brand: '', minPrice: '', maxPrice: '', q: '' })}
                                        className="text-[10px] font-black uppercase tracking-wider text-gray-400 hover:text-primary shrink-0 px-2 py-1 transition-colors flex items-center gap-1"
                                    >
                                        <RotateCcw className="w-2.5 h-2.5" /> Tout effacer
                                    </button>
                                </div>
                            )}

                            {/* Sub-bar: Products count + Grid/List switch */}
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                <span className="text-xs font-bold text-gray-500">
                                    <span className="font-black text-[#1B1F3B]">{initialProducts.length}</span> {initialProducts.length > 1 ? 'articles trouvés' : 'article trouvé'}
                                </span>

                                {/* View Mode Switcher */}
                                <div className="flex items-center bg-gray-100/80 p-0.5 rounded-lg border border-gray-200/60 shrink-0">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        aria-label="Mode grille"
                                        className={cn(
                                            "w-7 h-7 rounded-md flex items-center justify-center transition-all",
                                            viewMode === 'grid'
                                                ? "bg-white text-primary shadow-xs font-bold"
                                                : "text-gray-400 hover:text-gray-700"
                                        )}
                                    >
                                        <LayoutGrid className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        aria-label="Mode liste"
                                        className={cn(
                                            "w-7 h-7 rounded-md flex items-center justify-center transition-all",
                                            viewMode === 'list'
                                                ? "bg-white text-primary shadow-xs font-bold"
                                                : "text-gray-400 hover:text-gray-700"
                                        )}
                                    >
                                        <List className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
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
                            <div className="bg-white rounded-[40px] p-12 sm:p-20 text-center border border-gray-100 shadow-sm">
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
                                "grid",
                                viewMode === 'grid' ? "gap-3 sm:gap-4 md:gap-6 grid-cols-2 md:grid-cols-3" : "gap-3 grid-cols-1"
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

                    {/* Pagination removed as per request to only show the 20 latest products */}
                </div>
            </div>
        </Container>
    )
}
