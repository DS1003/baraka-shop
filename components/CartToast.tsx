'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Check, ShoppingBag, X, ArrowRight } from 'reicon-react'
import { formatPrice } from '@/lib/utils'

interface CartToastProps {
    product: {
        name: string
        price: number
        image: string
        brand?: string
        selectedColor?: string
        qty?: number
    } | null
    isVisible: boolean
    onClose: () => void
    itemCount: number
    subtotal: number
}

export function CartToast({ product, isVisible, onClose, itemCount, subtotal }: CartToastProps) {
    const [isHovered, setIsHovered] = useState(false)

    useEffect(() => {
        if (!isVisible || isHovered) return

        const timer = setTimeout(() => {
            onClose()
        }, 4500)

        return () => clearTimeout(timer)
    }, [isVisible, isHovered, onClose])

    return (
        <AnimatePresence>
            {isVisible && product && (
                <motion.div
                    initial={{ opacity: 0, y: -16, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.96, transition: { duration: 0.18 } }}
                    transition={{ type: 'spring', damping: 26, stiffness: 340 }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="fixed top-20 sm:top-24 right-4 sm:right-6 md:right-8 z-[300] w-[350px] sm:w-[380px] max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/70 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.18),0_0_0_1px_rgba(0,0,0,0.02)] overflow-hidden"
                >
                    <div className="p-4 sm:p-5 space-y-4">
                        {/* Header: Statut élégant & bouton fermer */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', delay: 0.08, damping: 14 }}
                                    className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-500/20"
                                >
                                    <Check className="w-3 h-3 stroke-[2.5]" />
                                </motion.div>
                                <span className="text-[12px] font-bold text-slate-800 tracking-tight">
                                    Ajouté au panier
                                </span>
                            </div>
                            <button
                                onClick={onClose}
                                aria-label="Fermer la notification"
                                className="w-7 h-7 -mr-1 -mt-1 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-all active:scale-95"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Produit ajouté */}
                        <div className="flex items-center gap-3.5 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/60">
                            <div className="relative w-14 h-14 bg-white rounded-lg border border-slate-100 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-contain p-1"
                                    unoptimized={product.image?.startsWith('http')}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                {product.brand && (
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                                        {product.brand}
                                    </span>
                                )}
                                <h4 className="text-[13px] font-bold text-slate-900 leading-snug line-clamp-2">
                                    {product.name}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[13px] font-extrabold text-[#E8621A] tracking-tight">
                                        {formatPrice(product.price)}
                                    </span>
                                    {product.selectedColor && (
                                        <span className="text-[10px] text-slate-500 font-medium border-l border-slate-200 pl-2">
                                            {product.selectedColor}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Résumé Panier */}
                        <div className="bg-slate-50/80 border border-slate-100/80 rounded-xl px-3.5 py-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-500">
                                <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-[11px] font-medium text-slate-600">
                                    {itemCount} {itemCount > 1 ? 'articles' : 'article'} dans votre panier
                                </span>
                            </div>
                            <span className="text-xs font-black text-slate-900 tracking-tight">
                                {formatPrice(subtotal)}
                            </span>
                        </div>

                        {/* Boutons d'action */}
                        <div className="flex items-center gap-2.5 pt-0.5">
                            <Link
                                href="/cart"
                                onClick={onClose}
                                className="flex-1 h-10 px-3 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-bold text-[11px] tracking-wide transition-all shadow-sm flex items-center justify-center active:scale-[0.98]"
                            >
                                Voir le panier
                            </Link>
                            <Link
                                href="/checkout"
                                onClick={onClose}
                                className="flex-1 h-10 px-3 rounded-xl bg-[#E8621A] hover:bg-[#d95213] text-white font-bold text-[11px] tracking-wide shadow-sm hover:shadow-md hover:shadow-orange-500/20 transition-all flex items-center justify-center gap-1.5 group active:scale-[0.98]"
                            >
                                Commander
                                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                        </div>
                    </div>

                    {/* Barre de progression discrète en bas */}
                    <div className="h-[2px] w-full bg-slate-100 overflow-hidden">
                        <motion.div
                            key={isVisible ? 'visible' : 'hidden'}
                            initial={{ scaleX: 1 }}
                            animate={{ scaleX: isHovered ? undefined : 0 }}
                            transition={{ duration: 4.5, ease: 'linear' }}
                            style={{ originX: 0 }}
                            className="h-full bg-gradient-to-r from-[#E8621A] to-amber-500"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
