'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Zap, ShieldCheck } from 'lucide-react'
import { useCart } from '@/context/CartContext'

interface MiniCartProps {
    isOpen: boolean
    onClose: () => void
}

export function MiniCart({ isOpen, onClose }: MiniCartProps) {
    const { cartItems, removeFromCart, updateQty, subtotal, itemCount } = useCart()

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200]"
                    />

                    {/* Slide-over Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                        className="fixed top-0 right-0 bottom-0 w-full sm:max-w-md bg-white z-[210] shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-5 sm:px-6 py-5 flex items-center justify-between border-b border-slate-100 bg-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100/60">
                                    <ShoppingBag className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-black text-[#1B1F3B] uppercase tracking-tight">Votre Panier</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                                        {itemCount} article{itemCount > 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-[#1B1F3B] hover:text-white transition-colors"
                                aria-label="Fermer le panier"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Items List */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-hide space-y-3.5">
                            {cartItems.length > 0 ? (
                                cartItems.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex gap-3 group relative"
                                    >
                                        <div className="relative w-18 h-18 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 shrink-0">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                sizes="72px"
                                                className="object-contain p-1.5"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                            <div>
                                                <div className="flex justify-between items-start gap-1">
                                                    <h4 className="text-xs font-bold text-[#1B1F3B] line-clamp-2 leading-tight uppercase tracking-tight">
                                                        {item.name}
                                                    </h4>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-slate-300 hover:text-rose-500 p-1 transition-colors shrink-0"
                                                        aria-label="Supprimer l'article"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                {item.brand && (
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                                                        {item.brand}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-50">
                                                <div className="flex items-center bg-slate-50 rounded-lg p-0.5 border border-slate-200/60">
                                                    <button
                                                        onClick={() => updateQty(item.id, -1)}
                                                        className="w-6 h-6 flex items-center justify-center text-slate-700 hover:bg-white rounded transition-all active:scale-90"
                                                        aria-label="Moins"
                                                    >
                                                        <Minus className="w-2.5 h-2.5" />
                                                    </button>
                                                    <span className="w-6 text-center text-xs font-black text-[#1B1F3B]">{item.qty}</span>
                                                    <button
                                                        onClick={() => updateQty(item.id, 1)}
                                                        className="w-6 h-6 flex items-center justify-center text-slate-700 hover:bg-white rounded transition-all active:scale-90"
                                                        aria-label="Plus"
                                                    >
                                                        <Plus className="w-2.5 h-2.5" />
                                                    </button>
                                                </div>
                                                <span className="text-xs font-black text-orange-600 tracking-tight">
                                                    {(item.price * item.qty).toLocaleString()} FCFA
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                                    <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4 text-orange-600">
                                        <ShoppingBag className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-base font-black text-[#1B1F3B] uppercase tracking-tight mb-1">
                                        Votre panier est vide
                                    </h3>
                                    <p className="text-slate-400 text-xs font-medium mb-6 leading-relaxed max-w-xs">
                                        Ajoutez des produits pour les retrouver ici en un clic.
                                    </p>
                                    <button
                                        onClick={onClose}
                                        className="h-12 px-6 bg-[#1B1F3B] text-white rounded-xl font-black text-[11px] uppercase tracking-wider hover:bg-orange-600 transition-colors shadow-sm"
                                    >
                                        Découvrir nos produits
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Footer Summary & Direct Checkout CTA */}
                        {cartItems.length > 0 && (
                            <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-100 space-y-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between items-center text-slate-500 font-medium">
                                        <span>Sous-total</span>
                                        <span className="text-slate-800 font-bold">{subtotal.toLocaleString()} FCFA</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-500 font-medium">
                                        <span>Livraison</span>
                                        <span className="text-emerald-600 font-bold">Calculée au checkout</span>
                                    </div>
                                    <div className="pt-2 border-t border-slate-200/80 flex justify-between items-baseline">
                                        <span className="text-xs font-black text-[#1B1F3B] uppercase tracking-wider">Total</span>
                                        <span className="text-xl font-black text-orange-600 tracking-tight">
                                            {subtotal.toLocaleString()} FCFA
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2.5">
                                    <Link
                                        href="/checkout"
                                        onClick={onClose}
                                        className="w-full h-13 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white rounded-xl flex items-center justify-between px-5 font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-600/25 transition-all group"
                                    >
                                        <span className="flex items-center gap-2">
                                            Commander maintenant
                                            <Zap className="w-3.5 h-3.5 fill-white" />
                                        </span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>

                                    <Link
                                        href="/cart"
                                        onClick={onClose}
                                        className="w-full h-11 bg-white border border-slate-200 text-slate-700 rounded-xl flex items-center justify-center font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors"
                                    >
                                        Voir le panier complet
                                    </Link>
                                </div>

                                <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Paiement sécurisé · Livraison Express</span>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
