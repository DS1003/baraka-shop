'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Flash as Zap } from 'reicon-react'
import { cn } from '@/lib/utils'

interface MegaMenuProps {
    categories: any[];
    onClose: () => void;
}

export function MegaMenu({ categories, onClose }: MegaMenuProps) {
    const [activeTab, setActiveTab] = useState(categories[0]?.id || '')
    const activeCategory = categories.find(c => c.id === activeTab) || categories[0]

    if (!categories || categories.length === 0) return null;

    const handleLinkClick = (href: string) => {
        onClose();
        // Utilisation de window.location pour forcer un rechargement complet comme demandé
        window.location.href = href;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[1500px] h-[480px] md:h-[520px] lg:h-[600px] xl:h-[620px] max-h-[calc(100vh-185px)] mx-auto bg-white text-black shadow-[0_15px_35px_-5px_rgba(0,0,0,0.14)] border border-gray-200/80 rounded-b-2xl overflow-hidden z-50 flex relative"
        >
            {/* Left Column: Categories List (Responsive Sidebar) */}
            <div className="w-[180px] sm:w-[195px] md:w-[215px] lg:w-[240px] xl:w-[260px] shrink-0 bg-white border-r border-gray-100 flex flex-col pt-1.5 md:pt-2 overflow-y-auto custom-scrollbar select-none touch-pan-y">
                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        onMouseEnter={() => setActiveTab(cat.id)}
                        onClick={(e) => {
                            // Sur écran tactile (tablette/foldable/iPad Pro) : le 1er tap sélectionne la catégorie, le 2ème navigue
                            if (activeTab !== cat.id) {
                                e.preventDefault();
                                e.stopPropagation();
                                setActiveTab(cat.id);
                            } else {
                                handleLinkClick(`/boutique?category=${cat.slug}`);
                            }
                        }}
                        className={cn(
                            "flex items-center justify-between px-3 md:px-4 lg:px-4.5 py-2.5 md:py-3 lg:py-3.5 text-left transition-all border-b border-gray-50 last:border-0 cursor-pointer min-h-[44px]",
                            activeTab === cat.id
                                ? "bg-gray-50 text-primary border-l-4 border-l-primary"
                                : "text-[#1B1F3B] hover:bg-gray-50/50"
                        )}
                    >
                        <span className={cn(
                            "text-[10.5px] sm:text-[11px] md:text-[11.5px] lg:text-[12px] font-black tracking-tight uppercase line-clamp-1",
                            activeTab === cat.id ? "text-primary ml-[-4px]" : "text-[#1B1F3B]"
                        )}>
                            {cat.name}
                        </span>
                        <ChevronRight className={cn("w-3 h-3 md:w-3.5 md:h-3.5 shrink-0 ml-1 transition-opacity", activeTab === cat.id ? "text-primary opacity-100" : "text-gray-300 opacity-60")} />
                    </div>
                ))}
            </div>

            {/* Right Content: Header + Sub-categories + Visual Banner */}
            <div className="flex-1 flex flex-col bg-[#fafafa] overflow-hidden min-w-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.15 }}
                        className="flex-1 flex flex-col overflow-hidden p-3.5 sm:p-4 md:p-5 lg:p-6 xl:p-7 min-w-0"
                    >
                        {/* Rayon Header */}
                        <div className="flex items-center justify-between pb-2.5 mb-3.5 border-b border-gray-200/80 shrink-0">
                            <div className="flex items-center gap-2.5 min-w-0">
                                {activeCategory?.image && (
                                    <div className="relative w-7 h-7 md:w-8 md:h-8 rounded-lg overflow-hidden bg-white border border-gray-200/80 shrink-0 shadow-xs">
                                        <Image
                                            src={activeCategory.image}
                                            alt={activeCategory.name}
                                            fill
                                            className="object-cover p-0.5"
                                            unoptimized={activeCategory.image?.startsWith('http')}
                                        />
                                    </div>
                                )}
                                <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-wider text-primary shrink-0">Rayon</span>
                                        {activeCategory?.subCategories?.length > 0 && (
                                            <span className="text-[8.5px] md:text-[9.5px] text-gray-400 font-bold uppercase tracking-wider hidden sm:inline">
                                                • {activeCategory.subCategories.length} univers
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="text-xs md:text-sm lg:text-base font-black text-[#1B1F3B] uppercase tracking-tight truncate">
                                        {activeCategory?.name}
                                    </h4>
                                </div>
                            </div>
                            <button
                                onClick={() => handleLinkClick(`/boutique?category=${activeCategory?.slug}`)}
                                className="text-[10px] md:text-[11px] lg:text-xs font-bold text-primary hover:text-white hover:bg-primary px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg border border-primary/20 hover:border-primary flex items-center gap-1 uppercase tracking-wider transition-all cursor-pointer shrink-0 ml-2 shadow-xs"
                            >
                                <span>Explorer tout</span>
                                <ChevronRight className="w-3 md:w-3.5 h-3 md:h-3.5" />
                            </button>
                        </div>

                        {/* Content Area: Grid + Optional XL Banner */}
                        <div className="flex-1 flex gap-4 md:gap-5 lg:gap-6 xl:gap-8 overflow-hidden min-h-0">
                            {/* Sub-categories Grid: 2 columns on tablet/foldable, 3 columns on iPad Pro 13 (lg) and Desktop (xl) */}
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-4 sm:gap-x-5 md:gap-x-5 lg:gap-x-6 xl:gap-7 gap-y-5 md:gap-y-6 lg:gap-y-6 xl:gap-7 overflow-y-auto pr-2 md:pr-3 lg:pr-4 custom-scrollbar touch-pan-y">
                                {activeCategory?.subCategories?.map((sub: any) => (
                                    <div key={sub.id} className="flex flex-col gap-2 md:gap-2.5 min-w-0">
                                        <div
                                            onClick={() => handleLinkClick(`/boutique?category=${activeCategory.slug}&subCategory=${sub.slug}`)}
                                            className="text-[11px] md:text-[11.5px] lg:text-[12px] xl:text-[12.5px] font-black uppercase text-[#1B1F3B] tracking-wider pb-1.5 border-b border-gray-200 hover:text-primary transition-colors cursor-pointer line-clamp-2 leading-snug"
                                            title={sub.name}
                                        >
                                            {sub.name}
                                        </div>
                                        <ul className="flex flex-col gap-1.5 md:gap-2">
                                            {sub.thirdLevelCategories?.map((third: any) => (
                                                <li key={third.id}>
                                                    <div
                                                        onClick={() => handleLinkClick(`/boutique?category=${activeCategory.slug}&subCategory=${sub.slug}&thirdLevelCategory=${third.slug}`)}
                                                        className="text-[11px] md:text-[11.5px] lg:text-[12px] xl:text-[12.5px] text-gray-500 hover:text-primary transition-colors uppercase font-medium cursor-pointer leading-tight truncate hover:translate-x-0.5"
                                                        title={third.name}
                                                    >
                                                        {third.name}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}

                                {(!activeCategory?.subCategories || activeCategory.subCategories.length === 0) && (
                                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
                                        <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Aucune sous-catégorie</p>
                                        <button
                                            onClick={() => handleLinkClick(`/boutique?category=${activeCategory.slug}`)}
                                            className="mt-3 text-xs font-black text-primary uppercase underline"
                                        >
                                            Explorer tous les articles de {activeCategory?.name}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Visual Banner (Right Side - Visible on Desktop XL & iPad Pro 13 Landscape 1376px+) */}
                            <div className="w-[240px] xl:w-[260px] shrink-0 hidden xl:flex flex-col justify-between">
                                {activeCategory && (
                                    <div onClick={() => handleLinkClick(`/boutique?category=${activeCategory.slug}`)} className="block relative h-[280px] xl:h-[320px] w-full rounded-xl overflow-hidden shadow-lg group cursor-pointer shrink-0">
                                        <Image
                                            src={activeCategory.image || '/placeholder.png'}
                                            alt={activeCategory.name}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            unoptimized={activeCategory.image?.startsWith('http')}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-4 lg:p-5">
                                            <span className="text-primary font-black text-[9px] uppercase tracking-[0.2em] mb-1.5">En vedette</span>
                                            <h5 className="text-white font-black text-base lg:text-lg leading-tight uppercase line-clamp-2">
                                                {activeCategory.name}
                                            </h5>
                                            <div className="mt-2.5 lg:mt-3 flex items-center gap-1.5 text-white/90 text-[10.5px] lg:text-[11px] font-bold uppercase transition-all group-hover:gap-2.5 group-hover:text-white">
                                                Découvrir <ChevronRight className="w-3.5 h-3.5" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <Link href="/promotions" className="block mt-3 lg:mt-4 p-3.5 lg:p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-primary/30 hover:shadow-lg transition-all group/flash shrink-0">
                                    <div className="flex items-center gap-2.5 mb-1.5">
                                        <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover/flash:bg-primary group-hover/flash:text-white transition-all">
                                            <Zap className="w-3.5 h-3.5 lg:w-4 lg:h-4 fill-current" />
                                        </div>
                                        <p className="text-[#1B1F3B] font-black text-xs uppercase tracking-wide">Vente Flash</p>
                                    </div>
                                    <p className="text-gray-500 text-[10.5px] lg:text-[11px] leading-relaxed line-clamp-2">Profitez de réductions exclusives sur cette catégorie pendant 24h !</p>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <style jsx>{`
                .custom-scrollbar {
                    -webkit-overflow-scrolling: touch;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e5e7eb;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #d1d5db;
                }
            `}</style>
        </motion.div>
    )
}
