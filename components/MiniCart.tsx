'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Zap } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { Button } from '@/ui/Button'

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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-[210] shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-6 py-8 flex items-center justify-between border-b border-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <ShoppingBag className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-[#1B1F3B] uppercase tracking-tight">Votre Panier</h2>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                                        {itemCount} article{itemCount > 1 ? 's' : ''} sélectionné{itemCount > 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-black hover:text-white transition-all shadow-sm"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Items List */}
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                            {cartItems.length > 0 ? (
                                <div className="space-y-6">
                                    {cartItems.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex gap-4 group"
                                        >
                                            <div className="relative w-24 h-24 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0 group-hover:shadow-md transition-all">
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    className="object-contain p-2"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                                <div>
                                                    <div className="flex justify-between items-start gap-2">
                                                        <h4 className="text-xs font-black text-[#1B1F3B] uppercase tracking-tight line-clamp-2 leading-tight">
                                                            {item.name}
                                                        </h4>
                                                        <button
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="text-gray-300 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                                                        {item.brand}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-100">
                                                        <button
                                                            onClick={() => updateQty(item.id, -1)}
                                                            className="w-7 h-7 flex items-center justify-center text-[#1B1F3B] hover:bg-white rounded-md transition-all active:scale-90"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="w-8 text-center text-xs font-black">{item.qty}</span>
                                                        <button
                                                            onClick={() => updateQty(item.id, 1)}
                                                            className="w-7 h-7 flex items-center justify-center text-[#1B1F3B] hover:bg-white rounded-md transition-all active:scale-90"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                    <span className="text-sm font-black text-primary tracking-tighter">
                                                        {(item.price * item.qty).toLocaleString()} CFA
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center px-10">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                        <ShoppingBag className="w-10 h-10 text-gray-200" />
                                    </div>
                                    <h3 className="text-xl font-black text-[#1B1F3B] uppercase tracking-tight mb-2">Votre panier est vide</h3>
                                    <p className="text-gray-400 text-sm font-medium mb-8 leading-relaxed">
                                        Il semble que vous n'ayez pas encore ajouté de produits. Découvrez nos meilleures offres !
                                    </p>
                                    <Button
                                        onClick={onClose}
                                        className="w-full h-14 bg-[#1B1F3B] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-gray-200 hover:bg-primary hover:shadow-primary/20 transition-all"
                                    >
                                        Continuer mes achats
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Footer / Summary */}
                        {cartItems.length > 0 && (
                            <div className="p-8 bg-gray-50 border-t border-gray-100 space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                                        <span>Sous-total</span>
                                        <span className="text-[#1B1F3B] tracking-normal">{subtotal.toLocaleString()} CFA</span>
                                    </div>
                                    <div className="flex justify-between items-center text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                                        <span>Livraison</span>
                                        <span className="text-green-600 tracking-normal">Calculé au checkout</span>
                                    </div>
                                    <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                                        <span className="text-xs font-black text-[#1B1F3B] uppercase tracking-widest">Total</span>
                                        <span className="text-2xl font-black text-primary tracking-tighter">{subtotal.toLocaleString()} CFA</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <Link
                                        href="/checkout"
                                        onClick={onClose}
                                        className="w-full h-14 bg-primary text-white rounded-2xl flex items-center justify-between px-6 font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-[#1B1F3B] transition-all group"
                                    >
                                        <span className="flex items-center gap-2">
                                            Commander maintenant
                                            <Zap className="w-4 h-4 fill-white" />
                                        </span>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <Link
                                        href="/cart"
                                        onClick={onClose}
                                        className="w-full h-14 bg-white border border-gray-200 text-[#1B1F3B] rounded-2xl flex items-center justify-center font-black text-[11px] uppercase tracking-widest hover:bg-gray-50 transition-all"
                                    >
                                        Voir le panier complet
                                    </Link>
                                </div>

                                <p className="text-center text-[9px] font-black text-gray-300 uppercase tracking-widest">
                                    Paiement Sécurisé & Livraison Express
                                </p>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
