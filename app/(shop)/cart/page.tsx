'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Minus, Plus, Trash2, ArrowRight, ShieldCheck, ShoppingBag, Truck, Gift, ChevronRight } from 'lucide-react'

// Mock Cart Data
const initialCartItems = [
    {
        id: 1,
        name: 'Apple MacBook Pro 14" M3 Pro',
        price: 1850000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&q=80&w=400',
        color: 'Space Gray',
    },
    {
        id: 3,
        name: 'Sony WH-1000XM5 Noise Canceling',
        price: 250000,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=400',
        color: 'Silver White',
    }
]

export default function CartPage() {
    const [cartItems, setCartItems] = useState(initialCartItems)

    const updateQuantity = (id: number, delta: number) => {
        setCartItems(cartItems.map(item => {
            if (item.id === id) {
                const newQuantity = Math.max(1, item.quantity + delta)
                return { ...item, quantity: newQuantity }
            }
            return item
        }))
    }

    const removeItem = (id: number) => {
        setCartItems(cartItems.filter(item => item.id !== id))
    }

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    const shipping = subtotal > 500000 ? 0 : 2000
    const total = subtotal + shipping

    return (
        <div className="bg-[#fcfcfc] min-h-screen pb-32">

            {/* Header */}
            <div className="bg-white border-b border-gray-100 py-12 mb-12">
                <div className="container px-4 mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-4">
                                <ShoppingBag size={14} /> Votre Sélection
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-none">Mon <span className="text-primary italic">Panier.</span></h1>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-gray-400">
                            <span className={cn(cartItems.length > 0 ? "text-black" : "")}>01 Panier</span>
                            <ChevronRight size={14} />
                            <span>02 Livraison</span>
                            <ChevronRight size={14} />
                            <span>03 Paiement</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container px-4 mx-auto">
                {cartItems.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                        {/* Cart Items Feed */}
                        <div className="lg:col-span-2 space-y-6">
                            <AnimatePresence>
                                {cartItems.map((item, idx) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-white border border-gray-100 rounded-[2.5rem] p-6 md:p-8 flex flex-col md:flex-row gap-8 hover:shadow-2xl transition-all group"
                                    >
                                        <div className="relative w-full md:w-48 aspect-square bg-gray-50 rounded-[2rem] overflow-hidden shrink-0">
                                            <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                        </div>

                                        <div className="flex-1 flex flex-col justify-between">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-xl font-black text-gray-900 leading-tight mb-2 line-clamp-2">{item.name}</h3>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{item.color}</p>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>

                                            <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
                                                <div className="flex items-center bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, -1)}
                                                        className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white hover:shadow-md transition-all active:scale-90"
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className="w-12 text-center font-black text-lg">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, 1)}
                                                        className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white hover:shadow-md transition-all active:scale-90"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-1">Prix Unitaire: {item.price.toLocaleString()} F</div>
                                                    <div className="text-2xl font-black text-primary italic">{(item.price * item.quantity).toLocaleString()} F</div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Upsell / Info */}
                            <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
                                <div className="relative z-10">
                                    <h4 className="text-xl font-black mb-2">Livraison Express Gratuite !</h4>
                                    <p className="text-indigo-100 text-sm font-medium">Votre commande dépasse 500.000 F. La livraison à Dakar est offerte.</p>
                                </div>
                                <div className="relative z-10 bg-white text-indigo-600 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl">
                                    Activé ✅
                                </div>
                            </div>
                        </div>

                        {/* Summary Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white border border-gray-100 rounded-[3rem] p-8 md:p-10 shadow-2xl shadow-black/5 sticky top-24">
                                <h3 className="text-xl font-black text-gray-900 mb-8 pb-4 border-b border-gray-50">Résumé Commande</h3>

                                <div className="space-y-4 mb-10">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black uppercase tracking-widest text-gray-400">Sous-total</span>
                                        <span className="text-lg font-black text-gray-900">{subtotal.toLocaleString()} F</span>
                                    </div>
                                    <div className="flex justify-between items-center text-green-600">
                                        <span className="text-xs font-black uppercase tracking-widest">Livraison</span>
                                        <span className="text-sm font-black uppercase">{shipping === 0 ? 'Gratuit' : `${shipping.toLocaleString()} F`}</span>
                                    </div>
                                    <div className="pt-6 mt-6 border-t border-gray-50 flex justify-between items-end">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Total à payer</span>
                                            <span className="text-3xl font-black text-primary italic">{total.toLocaleString()} F</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Link href="/checkout" className="w-full bg-black text-white py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl shadow-black/20 hover:bg-primary transition-all active:scale-95">
                                        Finaliser Commande <ArrowRight size={20} />
                                    </Link>
                                    <Link href="/shop" className="w-full bg-gray-50 text-gray-400 py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-gray-100 hover:text-black transition-all">
                                        Continuer Shopping
                                    </Link>
                                </div>

                                <div className="mt-10 pt-10 border-t border-gray-50 grid grid-cols-2 gap-4 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <ShieldCheck className="text-gray-300" size={24} />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 leading-tight">Paiement <br /> Sécurisé</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <Truck className="text-gray-300" size={24} />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 leading-tight">SAV <br /> Baraka 24/7</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-32 bg-white rounded-[4rem] border border-gray-100 shadow-xl shadow-gray-200/40"
                    >
                        <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-gray-200">
                            <ShoppingBag size={48} />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Votre panier est vide.</h2>
                        <p className="text-gray-400 font-medium mb-10 max-w-sm mx-auto">On dirait que vous n'avez pas encore fait votre choix parmi nos pépites technologiques.</p>
                        <Link href="/shop" className="inline-flex items-center gap-3 bg-black text-white px-10 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-black/20 hover:bg-primary transition-all active:scale-95">
                            Découvrir le Catalogue <ArrowRight size={20} />
                        </Link>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ')
}
