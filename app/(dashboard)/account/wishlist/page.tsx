'use client'

import React, { useState } from 'react'
import { Heart, ShoppingCart, Trash2, ArrowRight, Sparkles, Filter, LayoutGrid, List } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { MOCK_PRODUCTS } from '@/lib/data'

export default function WishlistPage() {
    const [wishlist, setWishlist] = useState(MOCK_PRODUCTS.slice(4, 8))
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    const removeItem = (id: string) => {
        setWishlist(wishlist.filter(item => item.id !== id))
    }

    return (
        <div className="space-y-12">

            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-2">
                        <Heart size={12} fill="currentColor" /> Ma Sélection Personnelle
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter leading-none uppercase">
                        Ma <span className="text-primary italic">Wishlist.</span>
                    </h1>
                </div>

                <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={cn(
                            "p-3 rounded-xl transition-all",
                            viewMode === 'grid' ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-black"
                        )}
                    >
                        <LayoutGrid size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={cn(
                            "p-3 rounded-xl transition-all",
                            viewMode === 'list' ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-black"
                        )}
                    >
                        <List size={18} />
                    </button>
                    <div className="w-px h-6 bg-gray-200 mx-2" />
                    <button className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
                        <Filter size={14} /> Filtrer
                    </button>
                </div>
            </div>

            {/* Content List */}
            <div className="min-h-[400px]">
                <AnimatePresence mode="popLayout">
                    {wishlist.length > 0 ? (
                        <div className={cn(
                            "transition-all duration-500",
                            viewMode === 'grid'
                                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                                : "space-y-6"
                        )}>
                            {wishlist.map((product, idx) => (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9, x: -20 }}
                                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                                    className={cn(
                                        "group bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all duration-500 relative",
                                        viewMode === 'list' && "flex items-center p-6 gap-8"
                                    )}
                                >
                                    {/* Image Container */}
                                    <div className={cn(
                                        "relative bg-[#f8f9fa] overflow-hidden",
                                        viewMode === 'grid' ? "aspect-square p-8" : "w-32 h-32 rounded-3xl shrink-0"
                                    )}>
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            className="object-contain group-hover:scale-110 transition-transform duration-700 mix-blend-multiply"
                                        />

                                        {/* Remove Button - Grid View */}
                                        {viewMode === 'grid' && (
                                            <button
                                                onClick={() => removeItem(product.id)}
                                                className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-md text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-red-500 hover:text-white"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Content Info */}
                                    <div className={cn(
                                        "flex-1",
                                        viewMode === 'grid' ? "p-8 pt-4" : "flex items-center justify-between"
                                    )}>
                                        <div className={cn(viewMode === 'list' && "max-w-md")}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">{product.category}</span>
                                                <span className="w-1 h-1 bg-gray-200 rounded-full" />
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <div key={i} className={cn("w-1 h-1 rounded-full", i < 4 ? "bg-yellow-400" : "bg-gray-200")} />
                                                    ))}
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-black text-gray-900 group-hover:text-primary transition-colors leading-tight mb-4 uppercase italic tracking-tighter">
                                                {product.name}
                                            </h3>

                                            <div className="flex items-baseline gap-4 mb-6">
                                                <span className="text-2xl font-black text-gray-900 tabular-nums">{product.price.toLocaleString()} F</span>
                                                {product.oldPrice && (
                                                    <span className="text-sm font-bold text-gray-300 line-through tabular-nums">{product.oldPrice.toLocaleString()} F</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className={cn(
                                            "flex items-center gap-3",
                                            viewMode === 'grid' ? "w-full" : ""
                                        )}>
                                            <button className="flex-1 bg-black text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary transition-all active:scale-95 shadow-xl shadow-black/5">
                                                <ShoppingCart size={16} /> Ajouter
                                            </button>

                                            {viewMode === 'list' ? (
                                                <button
                                                    onClick={() => removeItem(product.id)}
                                                    className="w-14 h-14 bg-gray-50 border border-gray-100 text-gray-400 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            ) : (
                                                <Link
                                                    href={`/products/${product.id}`}
                                                    className="w-14 h-14 bg-gray-50 border border-gray-100 text-gray-300 rounded-2xl flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm"
                                                >
                                                    <ArrowRight size={20} />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-50 rounded-[4rem] border-2 border-dashed border-gray-100 py-32 flex flex-col items-center justify-center text-center px-6"
                        >
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-10 shadow-2xl shadow-gray-200/50 relative">
                                <Heart size={40} className="text-gray-100" />
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="absolute -top-2 -right-2 bg-primary text-white p-2 rounded-xl"
                                >
                                    <Sparkles size={16} />
                                </motion.div>
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter uppercase leading-none">Votre coeur est vide.</h3>
                            <p className="text-gray-400 font-medium text-lg max-w-sm mb-12">
                                Parcourez notre catalogue et ajoutez vos coups de coeur pour les retrouver plus tard.
                            </p>
                            <Link
                                href="/shop"
                                className="bg-black text-white px-12 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-primary transition-all flex items-center gap-3 active:scale-95"
                            >
                                Explorer le Shop <ArrowRight size={18} />
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Suggestion */}
            {wishlist.length > 0 && (
                <div className="bg-black rounded-[3rem] p-10 md:p-14 text-white flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="max-w-md">
                        <h4 className="text-2xl md:text-3xl font-black mb-4 leading-none uppercase italic tracking-tighter">Prêt à passer <br /> à l'action ?</h4>
                        <p className="text-gray-400 font-medium text-sm leading-relaxed">
                            Bénéficiez de <span className="text-primary font-black">-10% de réduction</span> immédiate sur votre première commande d'articles de votre wishlist.
                        </p>
                    </div>
                    <button className="bg-white text-black px-12 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-primary hover:text-white transition-all active:scale-95">
                        Valider mon Panier
                    </button>
                </div>
            )}

        </div>
    )
}
