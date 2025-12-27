'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ShoppingCart, Trash2, ArrowRight, Sparkles, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { MOCK_PRODUCTS } from '@/lib/data'

export default function WishlistPage() {
    // Mock wishlist items from our data
    const wishlistItems = MOCK_PRODUCTS.slice(4, 7)

    return (
        <div className="space-y-10 pb-20">
            {/* Header with stats */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-2">
                        <Heart size={12} className="fill-primary" /> Mes Coups de Cœur
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">Ma <span className="text-primary italic">Wishlist</span></h1>
                </div>
                <div className="flex items-center gap-4 bg-gray-50 px-6 py-4 rounded-[1.5rem] border border-gray-100">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Articles</span>
                        <span className="font-black text-xl leading-none">{wishlistItems.length}</span>
                    </div>
                    <div className="w-px h-8 bg-gray-200" />
                    <button className="bg-black text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all active:scale-95">
                        Tout ajouter au panier
                    </button>
                </div>
            </div>

            {/* List */}
            {wishlistItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <AnimatePresence>
                        {wishlistItems.map((product, idx) => (
                            <motion.div
                                key={product.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white border border-gray-100 rounded-[2rem] p-4 flex gap-6 hover:shadow-xl transition-all group"
                            >
                                <div className="relative w-32 h-32 md:w-40 md:h-40 bg-gray-50 rounded-[1.5rem] overflow-hidden shrink-0">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <button className="absolute top-2 right-2 w-8 h-8 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                        <Trash2 size={14} />
                                    </button>
                                </div>

                                <div className="flex-1 flex flex-col justify-between py-2">
                                    <div>
                                        <div className="flex items-center gap-1 mb-2">
                                            <Star size={10} className="fill-yellow-400 text-yellow-400" />
                                            <span className="text-[10px] text-gray-400 font-bold">{product.rating}</span>
                                        </div>
                                        <h3 className="font-black text-gray-900 leading-tight mb-2 line-clamp-2 md:text-lg">{product.name}</h3>
                                        <div className="text-primary font-black text-xl">{product.price.toLocaleString()} F</div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary transition-all active:scale-95">
                                            <ShoppingCart size={14} /> Ajouter
                                        </button>
                                        <Link
                                            href={`/products/${product.id}`}
                                            className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-black transition-all"
                                        >
                                            <ArrowRight size={18} />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <Heart size={32} className="text-gray-200" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">Votre liste est vide</h3>
                    <p className="text-gray-400 text-sm mb-8 font-medium">Vous n'avez pas encore ajouté de coups de cœur.</p>
                    <Link href="/shop" className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-primary transition-all shadow-xl">
                        Shopper Maintenant <ArrowRight size={16} />
                    </Link>
                </div>
            )}
        </div>
    )
}
