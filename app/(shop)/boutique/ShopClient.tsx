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
    SlidersHorizontal,
    RotateCcw,
    ArrowUpDown,
    Check,
    Sparkles,
    ArrowUpRight,
    ArrowDownRight,
    Clock
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

const SORT_OPTIONS = [
    { value: 'newest', label: 'Nouveautés', desc: 'Derniers arrivages en premier', icon: Sparkles },
    { value: 'price_asc', label: 'Prix : Croissant', desc: 'Du moins cher au plus cher', icon: ArrowUpRight },
    { value: 'price_desc', label: 'Prix : Décroissant', desc: 'Du plus cher au moins cher', icon: ArrowDownRight },
    { value: 'oldest', label: 'Plus anciens', desc: 'Du plus ancien au plus récent', icon: Clock },
]

export function ShopClient({ initialProducts, categories, brands, pagination }: ShopClientProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [isSortOpen, setIsSortOpen] = useState(false)
    const [isPending, setIsPending] = useState(false)

    const rawCategory = searchParams.get('category') || ''
    const currentSubCategory = searchParams.get('subCategory') || searchParams.get('sub') || ''
    const currentThirdLevelCategory = searchParams.get('thirdLevelCategory') || searchParams.get('third') || ''
    const currentBrand = searchParams.get('brand') || ''
    const currentSort = searchParams.get('sort') || 'newest'
    const currentPage = Number(searchParams.get('page')) || 1
    const query = searchParams.get('q') || ''
    const minPrice = searchParams.get('minPrice') || ''
    const maxPrice = searchParams.get('maxPrice') || ''

    // Recover category object even if category slug was omitted in query
    let activeCategoryObj = categories.find(c => c.slug === rawCategory)
    if (!activeCategoryObj && currentSubCategory) {
        activeCategoryObj = categories.find(c =>
            c.subCategories?.some((s: any) => s.slug === currentSubCategory)
        )
    }

    const currentCategory = activeCategoryObj?.slug || rawCategory

    const activeFiltersCount = [
        currentCategory,
        currentSubCategory,
        currentThirdLevelCategory,
        currentBrand,
        minPrice,
        maxPrice,
        query
    ].filter(Boolean).length

    const availableSubCategories = activeCategoryObj?.subCategories || []
    const activeSubCategoryObj = availableSubCategories.find((s: any) => s.slug === currentSubCategory)
    const availableThirdCategories = activeSubCategoryObj?.thirdLevelCategories || []

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
        
        let shouldScroll = false
        if (!updates.page) {
            params.set('page', '1')
        } else {
            shouldScroll = true
        }

        router.push(`${pathname}?${params.toString()}`, { scroll: false })

        if (shouldScroll) {
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 100)
        }

        setTimeout(() => setIsPending(false), 300)
    }

    const FilterSidebar = ({ className }: { className?: string }) => (
        <aside className={cn("flex flex-col gap-5 sm:gap-6 md:gap-8", className)}>
            {/* Categories Filter */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 md:p-8 shadow-sm border border-gray-100">
                <h3 className="text-xs sm:text-sm font-black text-[#1B1F3B] uppercase tracking-wider sm:tracking-widest mb-4 sm:mb-6 flex items-center justify-between border-b border-gray-50 pb-3 sm:pb-4">
                    Catégories <ChevronDown className="w-4 h-4 text-gray-400" />
                </h3>
                <div className="flex flex-col gap-2.5 sm:gap-3">
                    <button
                        onClick={() => updateFilters({ category: '', subCategory: '', thirdLevelCategory: '' })}
                        className={cn("text-left text-xs sm:text-sm font-bold transition-colors hover:text-primary", !currentCategory ? "text-primary" : "text-gray-500")}
                    >
                        Toutes les catégories
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => updateFilters({ category: cat.slug, subCategory: '', thirdLevelCategory: '' })}
                            className={cn("flex items-center justify-between group cursor-pointer text-left", currentCategory === cat.slug ? "text-primary font-bold" : "text-gray-500 hover:text-[#1B1F3B]")}
                        >
                            <span className="text-xs sm:text-sm transition-colors">{cat.name}</span>
                            <span className="text-[10px] font-black text-gray-300 group-hover:text-primary transition-colors">({cat._count.products})</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Filter */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 md:p-8 shadow-sm border border-gray-100">
                <h3 className="text-xs sm:text-sm font-black text-[#1B1F3B] uppercase tracking-wider sm:tracking-widest mb-4 sm:mb-6 border-b border-gray-50 pb-3 sm:pb-4">
                    Prix (FCFA)
                </h3>
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

            {/* Brands Filter */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 md:p-8 shadow-sm border border-gray-100">
                <h3 className="text-xs sm:text-sm font-black text-[#1B1F3B] uppercase tracking-wider sm:tracking-widest mb-4 sm:mb-6 border-b border-gray-50 pb-3 sm:pb-4">
                    Marques
                </h3>
                <div className="flex flex-col gap-2.5 sm:gap-3">
                    <button
                        onClick={() => updateFilters({ brand: '' })}
                        className={cn("text-left text-xs sm:text-sm font-bold transition-colors hover:text-primary", !currentBrand ? "text-primary" : "text-gray-500")}
                    >
                        Toutes les marques
                    </button>
                    {brands.map((brand) => (
                        <button
                            key={brand.id}
                            onClick={() => updateFilters({ brand: brand.slug })}
                            className={cn("flex items-center justify-between group cursor-pointer text-left", currentBrand === brand.slug ? "text-primary font-bold" : "text-gray-500 hover:text-[#1B1F3B]")}
                        >
                            <span className="text-xs sm:text-sm transition-colors">{brand.name}</span>
                            <span className="text-[10px] font-black text-gray-300 group-hover:text-primary transition-colors">({brand._count.products})</span>
                        </button>
                    ))}
                </div>
            </div>
        </aside>
    )

    return (
        <Container className="py-4 sm:py-8 md:py-12 px-3 sm:px-6">
            <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6 md:gap-8">
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
                                                updateFilters({ category: '', subCategory: '', thirdLevelCategory: '', brand: '', minPrice: '', maxPrice: '', q: '' })
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
                                        Voir {pagination.total} résultat{pagination.total > 1 ? 's' : ''}
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
                                className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[200] lg:hidden"
                            />
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                                className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-white rounded-t-3xl z-[210] p-5 pb-[calc(2rem+env(safe-area-inset-bottom,1rem))] overflow-y-auto lg:hidden shadow-2xl border-t border-gray-100"
                            >
                                {/* Pull bar indicator */}
                                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />

                                {/* Header */}
                                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                            <ArrowUpDown className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-sm font-black text-[#1B1F3B] uppercase tracking-tight">
                                            Trier les produits
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

                                {/* Options list */}
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

                {/* Desktop Sidebar */}
                <FilterSidebar className="hidden lg:flex" />

                {/* Product Listing Area */}
                <div className="lg:col-span-3">
                    {/* Mobile Unified Toolbar & Filter Controls (< lg) */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_25px_-5px_rgba(27,31,59,0.06)] p-3 sm:p-4 mb-4 lg:hidden">
                        {/* Action Row: 2 Touch-Friendly Primary Control Buttons */}
                        <div className="grid grid-cols-2 gap-2.5">
                            {/* Filter Drawer Trigger Button */}
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

                            {/* Sort Drawer Trigger Button */}
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

                        {/* Active Filter Chips Bar (Instant 1-Tap Dismissal) */}
                        {activeFiltersCount > 0 && (
                            <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
                                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 shrink-0 mr-0.5">
                                    Actifs :
                                </span>
                                {currentCategory && (
                                    <button
                                        onClick={() => updateFilters({ category: '', subCategory: '', thirdLevelCategory: '' })}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-[11px] font-bold shrink-0 transition-colors"
                                    >
                                        <span>{activeCategoryObj?.name || currentCategory}</span>
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                                {currentSubCategory && (
                                    <button
                                        onClick={() => updateFilters({ subCategory: '', thirdLevelCategory: '' })}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-[11px] font-bold shrink-0 transition-colors"
                                    >
                                        <span>{activeSubCategoryObj?.name || currentSubCategory}</span>
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                                {currentThirdLevelCategory && (
                                    <button
                                        onClick={() => updateFilters({ thirdLevelCategory: '' })}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-[11px] font-bold shrink-0 transition-colors"
                                    >
                                        <span>{availableThirdCategories.find((t: any) => t.slug === currentThirdLevelCategory)?.name || currentThirdLevelCategory}</span>
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                                {currentBrand && (
                                    <button
                                        onClick={() => updateFilters({ brand: '' })}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-[11px] font-bold shrink-0 transition-colors"
                                    >
                                        <span>Marque : {brands.find((b: any) => b.slug === currentBrand)?.name || currentBrand}</span>
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
                                    onClick={() => updateFilters({ category: '', subCategory: '', thirdLevelCategory: '', brand: '', minPrice: '', maxPrice: '', q: '' })}
                                    className="text-[10px] font-black uppercase tracking-wider text-gray-400 hover:text-primary shrink-0 px-2 py-1 transition-colors flex items-center gap-1"
                                >
                                    <RotateCcw className="w-2.5 h-2.5" /> Tout effacer
                                </button>
                            </div>
                        )}

                        {/* Bottom Status & View Mode Row */}
                        <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 mt-2.5">
                            <div className="flex items-center gap-1.5 text-xs">
                                <span className="font-black text-[#1B1F3B]">{pagination.total}</span>
                                <span className="text-gray-400 font-medium">{pagination.total > 1 ? 'articles trouvés' : 'article trouvé'}</span>
                            </div>

                            {/* View Mode Switcher (Grid / List) */}
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

                    {/* Desktop Toolbar (lg+) */}
                    <div className="hidden lg:flex bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6 items-center justify-between gap-6 mb-6">
                        <div className="flex items-center gap-4">
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
                            <span className="text-xs font-bold text-[#1B1F3B] border-l border-gray-100 pl-4">
                                {pagination.total} Produits
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            {availableSubCategories.length > 0 && (
                                <>
                                    <div className="relative min-w-[170px]">
                                        <select
                                            value={currentSubCategory}
                                            onChange={(e) => updateFilters({ subCategory: e.target.value, thirdLevelCategory: '' })}
                                            className="w-full h-11 bg-gray-50 border border-gray-100 rounded-xl px-4 text-xs font-bold text-[#1B1F3B] outline-none appearance-none focus:border-primary transition-all pr-10"
                                        >
                                            <option value="">Sous-catégories</option>
                                            {availableSubCategories.map((sub: any) => (
                                                <option key={sub.id} value={sub.slug}>{sub.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>

                                    {availableThirdCategories.length > 0 && (
                                        <div className="relative min-w-[170px]">
                                            <select
                                                value={currentThirdLevelCategory}
                                                onChange={(e) => updateFilters({ thirdLevelCategory: e.target.value })}
                                                className="w-full h-11 bg-gray-50 border border-gray-100 rounded-xl px-4 text-xs font-bold text-[#1B1F3B] outline-none appearance-none focus:border-primary transition-all pr-10"
                                            >
                                                <option value="">Filtrer par type</option>
                                                {availableThirdCategories.map((third: any) => (
                                                    <option key={third.id} value={third.slug}>{third.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="relative min-w-[170px]">
                                <select
                                    value={currentSort}
                                    onChange={(e) => updateFilters({ sort: e.target.value })}
                                    className="w-full h-11 bg-gray-50 border border-gray-100 rounded-xl px-4 text-xs font-bold text-[#1B1F3B] outline-none appearance-none focus:border-primary transition-all pr-10"
                                >
                                    <option value="newest">Trier : Nouveautés</option>
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
                        <div className="mb-4 flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-100">
                            <span className="text-xs text-gray-400">Résultats pour </span>
                            <span className="text-xs font-black text-[#1B1F3B]">"{query}"</span>
                            <button
                                onClick={() => updateFilters({ q: '' })}
                                className="text-[10px] font-black text-primary uppercase ml-auto hover:underline"
                            >
                                Effacer
                            </button>
                        </div>
                    )}

                    {/* Product Grid */}
                    <div className="relative">
                        {isPending && (
                            <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-2xl">
                                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                            </div>
                        )}

                        {initialProducts.length === 0 ? (
                            <div className="bg-white rounded-3xl p-8 sm:p-16 text-center shadow-sm border border-gray-100">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                                    <Search className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-black text-[#1B1F3B] uppercase tracking-tight mb-2">Aucun produit trouvé</h3>
                                <p className="text-gray-400 text-xs sm:text-sm max-w-xs mx-auto mb-6">Essayez de modifier vos filtres ou votre recherche pour trouver ce que vous cherchez.</p>
                                <button
                                    onClick={() => updateFilters({ category: '', subCategory: '', thirdLevelCategory: '', brand: '', q: '', minPrice: '', maxPrice: '', page: 1 })}
                                    className="px-6 sm:px-8 py-3 sm:py-4 bg-primary text-white rounded-xl sm:rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all"
                                >
                                    Réinitialiser tout
                                </button>
                            </div>
                        ) : (
                            <div className={cn(
                                "grid",
                                viewMode === 'grid' ? "gap-2.5 sm:gap-4 md:gap-6 grid-cols-2 md:grid-cols-3" : "gap-3 grid-cols-1"
                            )}>
                                {initialProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} viewMode={viewMode} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="mt-8 sm:mt-12 md:mt-16 flex flex-col items-center gap-4 sm:gap-6">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <button
                                    onClick={() => updateFilters({ page: pagination.currentPage - 1 })}
                                    disabled={pagination.currentPage === 1}
                                    aria-label="Page précédente"
                                    className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center bg-white border border-gray-100 text-gray-400 hover:text-primary hover:border-primary/20 disabled:opacity-30 disabled:hover:text-gray-400 disabled:hover:border-gray-100 transition-all shadow-sm"
                                >
                                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>

                                <div className="flex items-center gap-1 sm:gap-2">
                                    {(() => {
                                        const totalPages = pagination.pages
                                        const currentPage = pagination.currentPage
                                        const pages: (number | string)[] = []
                                        
                                        if (totalPages <= 5) {
                                            for (let i = 1; i <= totalPages; i++) pages.push(i)
                                        } else {
                                            pages.push(1)
                                            
                                            if (currentPage > 3) {
                                                pages.push('...')
                                            }
                                            
                                            const start = Math.max(2, currentPage - 1)
                                            const end = Math.min(totalPages - 1, currentPage + 1)
                                            
                                            for (let i = start; i <= end; i++) {
                                                if (!pages.includes(i)) pages.push(i)
                                            }
                                            
                                            if (currentPage < totalPages - 2) {
                                                pages.push('...')
                                            }
                                            
                                            if (!pages.includes(totalPages)) pages.push(totalPages)
                                        }

                                        return pages.map((page, i) => (
                                            typeof page === 'string' ? (
                                                <span key={`dots-${i}`} className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center text-gray-300 font-bold text-xs">...</span>
                                            ) : (
                                                <button
                                                    key={page}
                                                    onClick={() => updateFilters({ page })}
                                                    className={cn(
                                                        "w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center text-[11px] sm:text-xs font-black transition-all border",
                                                        page === currentPage
                                                            ? "bg-[#1B1F3B] text-white border-[#1B1F3B] shadow-md shadow-[#1B1F3B]/20 scale-105"
                                                            : "bg-white text-gray-500 border-gray-100 hover:border-primary/30 hover:text-primary shadow-sm"
                                                    )}
                                                >
                                                    {page}
                                                </button>
                                            )
                                        ))
                                    })()}
                                </div>

                                <button
                                    onClick={() => updateFilters({ page: pagination.currentPage + 1 })}
                                    disabled={pagination.currentPage === pagination.pages}
                                    aria-label="Page suivante"
                                    className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center bg-white border border-gray-100 text-gray-400 hover:text-primary hover:border-primary/20 disabled:opacity-30 disabled:hover:text-gray-400 disabled:hover:border-gray-100 transition-all shadow-sm"
                                >
                                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Container>
    )
}
