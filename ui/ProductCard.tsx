'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Star, Zap, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCart } from '@/context/CartContext'
import { useSiteLogos } from '@/lib/hooks/useSiteLogos'
import { WatermarkOverlay } from '@/ui/WatermarkOverlay'

interface ProductCardProps {
    product: any;
    viewMode?: 'grid' | 'list';
    priority?: boolean;
}

function stripHtml(html: string) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

export function ProductCard({ product, viewMode = 'grid', priority = false }: ProductCardProps) {
    const { addToCart } = useCart()
    const { headerLogo } = useSiteLogos()

    const customBadge = product.badge || (typeof product.metadata === 'object' && product.metadata ? product.metadata.badge : undefined);
    const displayImage = product.images?.[0] || product.image || '/placeholder.png'
    const categoryName = product.category && typeof product.category === 'object' ? product.category.name : (product.category || 'Non classé')
    const cleanDescription = stripHtml(product.shortDescription || product.description || "Découvrez la performance chez Baraka Shop.")

    if (viewMode === 'list') {
        return (
            <div className="group flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200 transition-all duration-500">
                <Link href={`/product/${product.id}`} className="relative w-full md:w-[260px] aspect-square bg-white flex items-center justify-center p-8 shrink-0 overflow-hidden">
                    <WatermarkOverlay logoUrl={headerLogo} isCard />
                    <Image src={displayImage} alt={product.name} fill className="object-contain p-8 group-hover:scale-105 transition-transform duration-500 z-10" priority={priority} unoptimized />
                </Link>
                <div className="p-8 flex flex-col justify-center flex-1">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{categoryName}</span>
                            {customBadge === "Bientôt disponible" && (
                                <span className="bg-amber-50 text-amber-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-amber-100 flex items-center gap-1">
                                    Bientôt disponible
                                </span>
                            )}
                            {customBadge && customBadge !== "Bientôt disponible" && (
                                <span className={cn(
                                    "text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border flex items-center gap-1",
                                    customBadge === "Nouveau" ? "bg-blue-50 text-blue-600 border-blue-100" :
                                    customBadge === "Promotion" ? "bg-orange-50 text-orange-600 border-orange-100" :
                                    "bg-indigo-50 text-indigo-600 border-indigo-100"
                                )}>
                                    {customBadge}
                                </span>
                            )}
                            {(!customBadge || customBadge === "Nouveau") && (
                                product.stock > 0 ? (
                                    <span className="bg-green-50 text-green-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-green-100 flex items-center gap-1">
                                        <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                                        En Stock
                                    </span>
                                ) : (
                                    <span className="bg-red-50 text-red-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-red-100 flex items-center gap-1">
                                        Rupture
                                    </span>
                                )
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-[10px] font-black text-gray-400">{product.rating || 5}.0</span>
                        </div>
                    </div>
                    <Link href={`/product/${product.id}`}>
                        <h3 className="text-lg font-black text-[#1B1F3B] mb-3 hover:text-primary transition-colors cursor-pointer leading-tight tracking-tight">
                            {product.name}
                        </h3>
                    </Link>
                    <p 
                        className="text-gray-400 text-xs mb-6 leading-relaxed"
                        style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}
                    >
                        {cleanDescription}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                            {(product.oldPrice || product.compareAtPrice) && <span className="text-gray-300 text-[10px] line-through font-bold">{(product.oldPrice || product.compareAtPrice).toLocaleString()} FCFA</span>}
                            <span className="text-xl font-black text-[#1B1F3B] tracking-tighter">{(product.price ?? 0).toLocaleString()} <span className="text-[10px]">FCFA</span></span>
                        </div>
                        {customBadge === "Bientôt disponible" ? (
                            <span className="flex items-center gap-2 bg-amber-500 text-white px-6 h-12 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-amber-500/20">
                                <Clock className="w-4 h-4" /> Bientôt disponible
                            </span>
                        ) : (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    addToCart(product);
                                }}
                                className="flex items-center gap-3 bg-[#1B1F3B] text-white px-6 h-12 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-primary transition-all shadow-lg hover:shadow-primary/20"
                            >
                                <ShoppingCart className="w-4 h-4" /> Ajouter
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="group relative bg-white rounded-2xl md:rounded-3xl p-3 md:p-4 transition-all duration-500 border border-gray-100/80 hover:border-gray-200 hover:shadow-2xl hover:shadow-blue-900/5 flex flex-col justify-between h-full">
            {/* Image Container */}
            <div className="relative w-full aspect-square bg-[#fff] rounded-xl overflow-hidden group/img border border-gray-50">
                <WatermarkOverlay logoUrl={headerLogo} isCard />
                <Link href={`/product/${product.id}`} className="absolute inset-0 z-40">
                    <span className="sr-only">Voir {product.name}</span>
                </Link>

                {/* Badges */}
                <div className="absolute top-1.5 left-1.5 md:top-3 md:left-3 flex flex-col gap-1 z-40">
                    {customBadge === "Bientôt disponible" ? (
                        <span className="bg-amber-500/90 backdrop-blur-sm text-white text-[7px] md:text-[8px] font-black px-1.5 py-0.5 md:px-2 md:py-1 rounded-md uppercase tracking-wider md:tracking-widest shadow-xs">
                            <span className="hidden md:inline">Bientôt disponible</span>
                            <span className="md:hidden">Bientôt</span>
                        </span>
                    ) : customBadge === "Nouveau" ? (
                        <span className="bg-blue-500/90 backdrop-blur-sm text-white text-[7px] md:text-[8px] font-black px-1.5 py-0.5 md:px-2 md:py-1 rounded-md uppercase tracking-wider md:tracking-widest shadow-xs">Nouveau</span>
                    ) : customBadge === "Promotion" ? (
                        <span className="bg-orange-500/90 backdrop-blur-sm text-white text-[7px] md:text-[8px] font-black px-1.5 py-0.5 md:px-2 md:py-1 rounded-md uppercase tracking-wider md:tracking-widest shadow-xs">Promo</span>
                    ) : customBadge === "Bestseller" ? (
                        <span className="bg-purple-600/90 backdrop-blur-sm text-white text-[7px] md:text-[8px] font-black px-1.5 py-0.5 md:px-2 md:py-1 rounded-md uppercase tracking-wider md:tracking-widest shadow-xs">Bestseller</span>
                    ) : customBadge ? (
                        <span className="bg-indigo-600/90 backdrop-blur-sm text-white text-[7px] md:text-[8px] font-black px-1.5 py-0.5 md:px-2 md:py-1 rounded-md uppercase tracking-wider md:tracking-widest shadow-xs">{customBadge}</span>
                    ) : null}

                    {(!customBadge || customBadge === "Nouveau") && (
                        <>
                            {product.stock > 0 ? (
                                <span className="bg-green-500/90 backdrop-blur-sm text-white text-[7px] md:text-[8px] font-black px-1.5 py-0.5 md:px-2 md:py-1 rounded-md uppercase tracking-wider md:tracking-widest shadow-xs flex items-center gap-1">
                                    <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
                                    <span className="hidden md:inline">En Stock</span>
                                    <span className="md:hidden">En Stock</span>
                                </span>
                            ) : (
                                <span className="bg-red-500/90 backdrop-blur-sm text-white text-[7px] md:text-[8px] font-black px-1.5 py-0.5 md:px-2 md:py-1 rounded-md uppercase tracking-wider md:tracking-widest shadow-xs">Rupture</span>
                            )}
                            {!customBadge && product.isNew && (
                                <span className="bg-blue-500/90 backdrop-blur-sm text-white text-[7px] md:text-[8px] font-black px-1.5 py-0.5 md:px-2 md:py-1 rounded-md uppercase tracking-wider md:tracking-widest shadow-xs">Nouveau</span>
                            )}
                            {!customBadge && product.isSale && (
                                <span className="bg-orange-500/90 backdrop-blur-sm text-white text-[7px] md:text-[8px] font-black px-1.5 py-0.5 md:px-2 md:py-1 rounded-md uppercase tracking-wider md:tracking-widest shadow-xs">Promo</span>
                            )}
                        </>
                    )}
                    {product.badges?.map((badge: any, idx: number) => (
                        <span key={idx} className={cn("text-white text-[7px] md:text-[8px] font-black px-1.5 py-0.5 md:px-2 md:py-1 rounded-md uppercase tracking-wider md:tracking-widest shadow-xs backdrop-blur-sm", badge.color)}>
                            {badge.text}
                        </span>
                    ))}
                </div>

                {/* Actions */}
                <div className="absolute top-1.5 right-1.5 md:top-2 md:right-2 flex flex-col gap-2 z-40 md:translate-x-12 md:opacity-0 md:group-hover:translate-x-0 md:group-hover:opacity-100 transition-all duration-500">
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/90 text-[#1B1F3B] flex items-center justify-center shadow-md border border-gray-100 hover:bg-primary hover:text-white transition-all"
                    >
                        <Heart className="w-2.5 md:w-3.5 h-2.5 md:h-3.5" />
                    </button>
                </div>

                <div className="relative w-full h-full p-1.5 md:p-4 flex items-center justify-center transition-transform duration-700 group-hover/img:scale-110 z-10">
                    <Image src={displayImage} alt={product.name} fill className="object-contain p-1.5 md:p-4" priority={priority} unoptimized />
                </div>

                {/* Add to Cart Overlay */}
                {customBadge === "Bientôt disponible" ? (
                    <span
                        className="absolute bottom-1 md:bottom-2 left-1 md:left-2 right-1 md:right-2 bg-amber-500 text-white py-1.5 md:py-2.5 rounded-md md:rounded-lg font-black text-[7.5px] md:text-[9px] uppercase tracking-[0.1em] md:tracking-[0.2em] md:translate-y-20 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-1 md:gap-2 shadow-lg shadow-amber-500/20 z-40"
                    >
                        <Clock className="w-2.5 md:w-3.5 h-2.5 md:h-3.5" /> <span className="hidden md:inline">Bientôt disponible</span><span className="md:hidden">Bientôt</span>
                    </span>
                ) : (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addToCart(product);
                        }}
                        className="absolute bottom-1 md:bottom-2 left-1 md:left-2 right-1 md:right-2 bg-primary text-white py-1.5 md:py-2.5 rounded-md md:rounded-lg font-black text-[7.5px] md:text-[9px] uppercase tracking-[0.1em] md:tracking-[0.2em] md:translate-y-20 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-1 md:gap-2 hover:bg-[#1B1F3B] shadow-lg shadow-primary/20 z-40"
                    >
                        <ShoppingCart className="w-2.5 md:w-3.5 h-2.5 md:h-3.5" /> Ajouter
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="p-3 md:p-4 flex flex-col gap-1 md:gap-1.5 flex-1">
                <div className="flex items-center justify-between">
                    <span className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest">{categoryName}</span>
                    <div className="flex items-center gap-1">
                        <Star className="w-2.5 md:w-3 h-2.5 md:h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-[9px] md:text-[10px] font-bold text-gray-500">{(product.rating || 5)}.0</span>
                    </div>
                </div>

                <Link href={`/product/${product.id}`} className="block h-[32px] md:h-[36px] overflow-hidden">
                    <h3 
                        className="font-bold text-[11px] md:text-[13px] text-[#1B1F3B] hover:text-primary transition-colors leading-[16px] md:leading-[18px] tracking-tight"
                        style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}
                    >
                        {product.name}
                    </h3>
                </Link>

                <p 
                    className="text-gray-400 text-[8px] md:text-[9px] leading-[12px] md:leading-[14px] mt-1 h-[24px] md:h-[28px] overflow-hidden"
                    style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}
                >
                    {cleanDescription}
                </p>

                <div className="mt-4 md:mt-6 flex items-center justify-between">
                    <div className="flex flex-col">
                        {(product.oldPrice || product.compareAtPrice) && <span className="text-gray-400 text-[8px] md:text-[10px] line-through font-bold">{(product.oldPrice || product.compareAtPrice).toLocaleString()} FCFA</span>}
                        <span className="text-[#1B1F3B] font-black text-[14px] md:text-[17px] tracking-tight">
                            {(product.price ?? 0).toLocaleString()} <span className="text-[8px] md:text-[10px] font-bold text-gray-400 ml-0.5 uppercase">FCFA</span>
                        </span>
                    </div>

                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                        <Zap className="w-3.5 md:w-4 h-3.5 md:h-4 fill-current" />
                    </div>
                </div>
            </div>
        </div>
    )
}
