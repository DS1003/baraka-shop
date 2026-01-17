'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Star, Eye, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductCardProps {
    product: any;
    viewMode?: 'grid' | 'list';
}

export function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
    if (viewMode === 'list') {
        return (
            <div className="group flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200 transition-all duration-500">
                <Link href={`/product/${product.id}`} className="relative w-full md:w-[260px] aspect-square bg-white flex items-center justify-center p-8 shrink-0">
                    <Image src={product.image} alt={product.name} fill className="object-contain p-8 group-hover:scale-105 transition-transform duration-500" />
                </Link>
                <div className="p-8 flex flex-col justify-center flex-1">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{product.category}</span>
                        <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-[10px] font-black text-gray-400">{product.rating || 5}.0</span>
                        </div>
                    </div>
                    <Link href={`/product/${product.id}`}>
                        <h3 className="text-lg font-black text-[#1B1F3B] mb-3 hover:text-primary transition-colors cursor-pointer leading-tight uppercase tracking-tight">
                            {product.name}
                        </h3>
                    </Link>
                    <p className="text-gray-400 text-xs mb-6 leading-relaxed line-clamp-2">
                        {product.description || "Découvrez la performance et l'élégance de ce produit d'exception chez Baraka Shop."}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                            {(product.oldPrice || product.compareAtPrice) && <span className="text-gray-300 text-[10px] line-through font-bold">{(product.oldPrice || product.compareAtPrice).toLocaleString()} CFA</span>}
                            <span className="text-xl font-black text-[#1B1F3B] tracking-tighter">{product.price.toLocaleString()} <span className="text-[10px]">CFA</span></span>
                        </div>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.location.href = '/cart';
                            }}
                            className="flex items-center gap-3 bg-[#1B1F3B] text-white px-6 h-12 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-primary transition-all shadow-lg hover:shadow-primary/20"
                        >
                            <ShoppingCart className="w-4 h-4" /> Ajouter
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-gray-200/50 border border-gray-50 p-2">
            {/* Image Area */}
            <div className="relative aspect-square bg-[#fff] rounded-xl overflow-hidden group/img border border-gray-50">
                <Link href={`/product/${product.id}`} className="absolute inset-0 z-10">
                    <span className="sr-only">Voir {product.name}</span>
                </Link>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
                    {product.isNew && (
                        <span className="bg-green-500 text-white text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest shadow-sm">Nouveau</span>
                    )}
                    {product.isSale && (
                        <span className="bg-red-500 text-white text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest shadow-sm">Promo</span>
                    )}
                    {product.badges?.map((badge: any, idx: number) => (
                        <span key={idx} className={cn("text-white text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest shadow-sm", badge.color)}>
                            {badge.text}
                        </span>
                    ))}
                </div>

                {/* Actions - Always visible or easier to trigger on mobile */}
                <div className="absolute top-2 right-2 flex flex-col gap-2 z-20 md:translate-x-12 md:opacity-0 md:group-hover/img:translate-x-0 md:group-hover/img:opacity-100 transition-all duration-500">
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/90 text-[#1B1F3B] flex items-center justify-center shadow-md border border-gray-100 hover:bg-primary hover:text-white transition-all"
                    >
                        <Heart className="w-3 md:w-3.5 h-3 md:h-3.5" />
                    </button>
                </div>

                <div className="relative w-full h-full p-4 md:p-6 flex items-center justify-center transition-transform duration-700 group-hover/img:scale-110">
                    <Image src={product.image} alt={product.name} fill className="object-contain p-4 md:p-6" />
                </div>

                {/* Add to Cart Overlay - Always visible or slide up on mobile */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = '/cart';
                    }}
                    className="absolute bottom-2 left-2 right-2 bg-primary text-white py-2.5 rounded-lg font-black text-[8px] md:text-[9px] uppercase tracking-[0.15em] md:tracking-[0.2em] md:translate-y-20 md:opacity-0 md:group-hover/img:translate-y-0 md:group-hover/img:opacity-100 transition-all duration-500 flex items-center justify-center gap-2 hover:bg-[#1B1F3B] shadow-xl shadow-primary/20 z-20"
                >
                    <ShoppingCart className="w-3 md:w-3.5 h-3 md:h-3.5" /> Ajouter
                </button>
            </div>

            {/* Content */}
            <div className="p-3 md:p-4 flex flex-col gap-1 md:gap-1.5 flex-1">
                <div className="flex items-center justify-between">
                    <span className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest">{product.category}</span>
                    <div className="flex items-center gap-1">
                        <Star className="w-2.5 md:w-3 h-2.5 md:h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-[9px] md:text-[10px] font-bold text-gray-500">{(product.rating || 5)}.0</span>
                    </div>
                </div>

                <Link href={`/product/${product.id}`}>
                    <h3 className="font-bold text-[11px] md:text-[13px] text-[#1B1F3B] hover:text-primary transition-colors leading-snug line-clamp-2 min-h-[32px] md:min-h-[38px] uppercase tracking-tight">
                        {product.name}
                    </h3>
                </Link>

                <div className="mt-4 md:mt-6 flex items-center justify-between">
                    <div className="flex flex-col">
                        {(product.oldPrice || product.compareAtPrice) && <span className="text-gray-400 text-[8px] md:text-[10px] line-through font-bold">{(product.oldPrice || product.compareAtPrice).toLocaleString()} CFA</span>}
                        <span className="text-[#1B1F3B] font-black text-[14px] md:text-[17px] tracking-tight">
                            {product.price.toLocaleString()} <span className="text-[8px] md:text-[10px] font-bold text-gray-400 ml-0.5 uppercase">CFA</span>
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
