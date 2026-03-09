'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Check, ShoppingCart, X, ArrowRight } from 'lucide-react'

interface CartToastProps {
    product: {
        name: string
        price: number
        image: string
    } | null
    isVisible: boolean
    onClose: () => void
    itemCount: number
    subtotal: number
}

export function CartToast({ product, isVisible, onClose, itemCount, subtotal }: CartToastProps) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(onClose, 4500)
            return () => clearTimeout(timer)
        }
    }, [isVisible, onClose])

    return (
        <AnimatePresence>
            {isVisible && product && (
                <motion.div
                    initial={{ opacity: 0, y: -20, x: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed top-24 right-4 md:right-8 z-[300] w-[340px] md:w-[380px] bg-white rounded-2xl border border-gray-100 shadow-2xl shadow-gray-300/30 overflow-hidden"
                >
                    {/* Progress bar */}
                    <motion.div
                        initial={{ width: '100%' }}
                        animate={{ width: '0%' }}
                        transition={{ duration: 4.5, ease: 'linear' }}
                        className="h-1 bg-gradient-to-r from-green-400 to-emerald-500"
                    />

                    <div className="p-5">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', delay: 0.1, damping: 12 }}
                                    className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center"
                                >
                                    <Check className="w-4 h-4 text-white stroke-[3]" />
                                </motion.div>
                                <span className="text-[11px] font-black text-green-600 uppercase tracking-widest">
                                    Ajouté au panier
                                </span>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Product */}
                        <div className="flex items-center gap-4 mb-5">
                            <div className="relative w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-contain p-2"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-black text-[#1B1F3B] uppercase tracking-tight line-clamp-2 leading-snug">
                                    {product.name}
                                </h4>
                                <p className="text-sm font-black text-primary mt-1 tracking-tighter">
                                    {product.price.toLocaleString()} CFA
                                </p>
                            </div>
                        </div>

                        {/* Cart summary */}
                        <div className="bg-gray-50 rounded-xl p-3 mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="w-4 h-4 text-gray-400" />
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                    {itemCount} article{itemCount > 1 ? 's' : ''} dans votre panier
                                </span>
                            </div>
                            <span className="text-xs font-black text-[#1B1F3B] tracking-tighter">
                                {subtotal.toLocaleString()} CFA
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <Link
                                href="/cart"
                                className="flex-1 h-11 bg-gray-100 text-[#1B1F3B] rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
                            >
                                Voir le panier
                            </Link>
                            <Link
                                href="/checkout"
                                className="flex-1 h-11 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#1B1F3B] transition-all shadow-lg shadow-primary/20 group"
                            >
                                Commander <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
