'use client'

import React, { useState } from 'react'
import { Container } from '@/ui/Container'
import Image from 'next/image'
import Link from 'next/link'
import {
    Trash2,
    Plus,
    Minus,
    CreditCard,
    Truck,
    ShieldCheck,
    ChevronRight,
    ShoppingBag,
    ArrowLeft,
    Tag
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/ui/Button'
import { cn } from '@/lib/utils'

const MOCK_CART = [
    { id: '1', name: 'MacBook Pro M3 Max 14" - Space Black', price: 2500000, qty: 1, image: 'https://media.ldlc.com/ld/products/00/06/22/20/LD0006222055.jpg', brand: 'Apple' },
    { id: '2', name: 'iPhone 15 Pro Max 256GB Natural Titanium', price: 850000, qty: 1, image: "https://media.ldlc.com/encart/p/28828_b.jpg", brand: 'Apple' },
]

export default function CartPage() {
    const [cartItems, setCartItems] = useState(MOCK_CART)
    const [promoCode, setPromoCode] = useState('')

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0)
    const shipping = subtotal > 500000 ? 0 : 5000
    const total = subtotal + shipping

    const updateQty = (id: string, delta: number) => {
        setCartItems(prev => prev.map(item =>
            item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
        ))
    }

    const removeItem = (id: string) => {
        setCartItems(prev => prev.filter(item => item.id !== id))
    }

    if (cartItems.length === 0) {
        return (
            <main className="bg-[#f8f9fb] min-h-screen py-24">
                <Container className="flex flex-col items-center justify-center text-center">
                    <div className="w-32 h-32 rounded-full bg-gray-50 flex items-center justify-center text-gray-200 mb-8 border border-gray-100">
                        <ShoppingBag className="w-16 h-16" />
                    </div>
                    <h1 className="text-4xl font-black text-[#1B1F3B] uppercase tracking-tighter mb-4">Votre panier est vide</h1>
                    <p className="text-gray-400 max-w-sm mb-12 font-medium">Il semblerait que vous n'ayez pas encore ajouté de produits. Découvrez nos dernières nouveautés !</p>
                    <Link href="/boutique" className="h-16 px-12 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[#1B1F3B] transition-all shadow-xl shadow-primary/20 flex items-center gap-3">
                        Retour à la boutique <ChevronRight className="w-4 h-4" />
                    </Link>
                </Container>
            </main>
        )
    }

    return (
        <main className="bg-[#f8f9fb] min-h-screen py-12">
            <Container>
                {/* Header */}
                <div className="flex flex-col gap-4 mb-12">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                        <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-[#1B1F3B]">Votre Panier</span>
                    </div>
                    <h1 className="text-4xl font-black text-[#1B1F3B] uppercase tracking-tighter">Mon Panier <span className="text-primary">({cartItems.length})</span></h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                    {/* Items List */}
                    <div className="lg:col-span-8 flex flex-col gap-4 md:gap-6">
                        <AnimatePresence mode="popLayout">
                            {cartItems.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-8 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-4 md:gap-8 group"
                                >
                                    <div className="relative w-24 h-24 md:w-32 md:h-32 bg-gray-50 rounded-xl md:rounded-2xl overflow-hidden p-2 md:p-4 shrink-0">
                                        <Image src={item.image} alt={item.name} fill className="object-contain p-1 md:p-2" />
                                    </div>

                                    <div className="flex-1 flex flex-col gap-1 text-center sm:text-left">
                                        <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.brand}</span>
                                        <h3 className="text-sm md:text-lg font-black text-[#1B1F3B] leading-tight uppercase tracking-tight group-hover:text-primary transition-colors">
                                            {item.name}
                                        </h3>
                                        <div className="flex items-center justify-center sm:justify-start gap-2 mt-1 md:mt-2">
                                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500" />
                                            <span className="text-[9px] md:text-[10px] font-bold text-green-600 uppercase">En stock</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 md:gap-6 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                                        <div className="flex flex-col items-start sm:items-end">
                                            <span className="text-lg md:text-2xl font-black text-[#1B1F3B] tracking-tighter">{(item.price * item.qty).toLocaleString()} CFA</span>
                                            <span className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden md:block">{item.price.toLocaleString()} CFA / unité</span>
                                        </div>

                                        <div className="flex items-center gap-4 md:gap-6">
                                            <div className="flex items-center bg-gray-50 rounded-lg md:rounded-xl p-0.5 md:p-1 border border-gray-100">
                                                <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-[#1B1F3B] hover:bg-white rounded-lg transition-all"><Minus className="w-3 md:w-4 h-3 md:h-4" /></button>
                                                <span className="w-8 md:w-10 text-center font-black text-xs md:text-sm">{item.qty}</span>
                                                <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-[#1B1F3B] hover:bg-white rounded-lg transition-all"><Plus className="w-3 md:w-4 h-3 md:h-4" /></button>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="w-10 h-10 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                            >
                                                <Trash2 className="w-4 md:w-5 h-4 md:h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        <Link href="/boutique" className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mt-4 hover:text-primary transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Continuer mes achats
                        </Link>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24 flex flex-col gap-6">
                            {/* Summary Card */}
                            <div className="bg-[#1B1F3B] rounded-[2.5rem] p-10 text-white shadow-2xl shadow-[#1B1F3B]/30 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2" />

                                <h2 className="text-xl font-black uppercase tracking-widest mb-10 pb-6 border-b border-white/10">Résumé</h2>

                                <div className="flex flex-col gap-6 mb-10">
                                    <div className="flex items-center justify-between text-sm font-bold text-gray-400">
                                        <span>Sous-total</span>
                                        <span className="text-white">{subtotal.toLocaleString()} CFA</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm font-bold text-gray-400">
                                        <span>Livraison</span>
                                        <span className={cn("text-white", shipping === 0 && "text-green-400")}>{shipping === 0 ? 'Gratuit' : shipping.toLocaleString() + ' CFA'}</span>
                                    </div>
                                    <div className="w-full h-px bg-white/10" />
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-black uppercase tracking-widest">Total</span>
                                        <span className="text-3xl font-black tracking-tighter text-primary">{total.toLocaleString()} CFA</span>
                                    </div>
                                </div>

                                {/* Promo Code */}
                                <div className="relative mb-10">
                                    <Tag className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Code Promo"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 text-sm font-bold outline-none focus:border-primary transition-all placeholder:text-gray-500"
                                    />
                                </div>

                                <Link href="/checkout" className="block w-full">
                                    <button className="w-full h-16 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-white hover:text-[#1B1F3B] transition-all shadow-xl shadow-primary/20 group">
                                        Commander <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </Link>
                            </div>

                            {/* Trust Perks */}
                            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 flex flex-col gap-6">
                                <PerkItem icon={CreditCard} title="Paiement Sécurisé" sub="Cash à la livraison ou Wave/Orange Money" />
                                <PerkItem icon={Truck} title="Livraison Rapide" sub="24h à Dakar, 48h-72h en régions" />
                                <PerkItem icon={ShieldCheck} title="Service Client" sub="Disponible de 9h à 21h via WhatsApp" />
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </main>
    )
}

function PerkItem({ icon: Icon, title, sub }: { icon: any, title: string, sub: string }) {
    return (
        <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-primary shrink-0 border border-gray-100">
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-[#1B1F3B] tracking-tight">{title}</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase leading-tight">{sub}</span>
            </div>
        </div>
    )
}
