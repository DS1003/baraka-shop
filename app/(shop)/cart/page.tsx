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
    Tag,
    Loader2,
    Check,
    X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/ui/Button'
import { useCart } from '@/context/CartContext'

interface AppliedCoupon {
    couponCode: string;
    campaignName: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
}

export default function CartPage() {
    const { cartItems, removeFromCart, updateQty, subtotal } = useCart()
    const [promoCode, setPromoCode] = useState('')
    const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)
    const [promoError, setPromoError] = useState('')
    const [promoLoading, setPromoLoading] = useState(false)

    const discount = appliedCoupon?.discountAmount || 0
    const total = subtotal - discount

    // Load saved coupon from localStorage on mount
    React.useEffect(() => {
        const saved = localStorage.getItem('baraka-applied-coupon')
        if (saved) {
            try {
                const parsed = JSON.parse(saved) as AppliedCoupon
                revalidateCoupon(parsed.couponCode)
            } catch {
                localStorage.removeItem('baraka-applied-coupon')
            }
        }
    }, [subtotal])

    const revalidateCoupon = async (code: string) => {
        try {
            const res = await fetch('/api/promotions/validate-coupon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, subtotal }),
            })
            const data = await res.json()
            if (data.valid) {
                const coupon: AppliedCoupon = {
                    couponCode: data.couponCode,
                    campaignName: data.campaignName,
                    discountType: data.discountType,
                    discountValue: data.discountValue,
                    discountAmount: data.discountAmount,
                }
                setAppliedCoupon(coupon)
                localStorage.setItem('baraka-applied-coupon', JSON.stringify(coupon))
            } else {
                setAppliedCoupon(null)
                localStorage.removeItem('baraka-applied-coupon')
            }
        } catch {
            // Silently fail on revalidation
        }
    }

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) return
        setPromoLoading(true)
        setPromoError('')

        try {
            const res = await fetch('/api/promotions/validate-coupon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: promoCode.trim().toUpperCase(), subtotal }),
            })
            const data = await res.json()

            if (data.valid) {
                const coupon: AppliedCoupon = {
                    couponCode: data.couponCode,
                    campaignName: data.campaignName,
                    discountType: data.discountType,
                    discountValue: data.discountValue,
                    discountAmount: data.discountAmount,
                }
                setAppliedCoupon(coupon)
                setPromoCode('')
                localStorage.setItem('baraka-applied-coupon', JSON.stringify(coupon))
            } else {
                setPromoError(data.error || 'Code promo invalide.')
            }
        } catch {
            setPromoError('Erreur de connexion. Réessayez.')
        } finally {
            setPromoLoading(false)
        }
    }

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null)
        localStorage.removeItem('baraka-applied-coupon')
        setPromoError('')
    }

    if (cartItems.length === 0) {
        return (
            <main className="bg-[#f8f9fb] min-h-screen py-24">
                <Container className="flex flex-col items-center justify-center text-center">
                    <div className="w-32 h-32 rounded-full bg-gray-50 flex items-center justify-center text-gray-200 mb-8 border border-gray-100">
                        <ShoppingBag className="w-16 h-16" />
                    </div>
                    <h1 className="text-4xl font-black text-[#1B1F3B] uppercase tracking-tighter mb-4">Votre panier est vide</h1>
                    <p className="text-gray-400 max-w-sm mb-12 font-medium">Il semblerait que vous n&apos;ayez pas encore ajouté de produits. Découvrez nos dernières nouveautés !</p>
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
                                            <span className="text-lg md:text-2xl font-black text-[#1B1F3B] tracking-tighter">{(item.price * item.qty).toLocaleString()} FCFA</span>
                                            <span className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden md:block">{item.price.toLocaleString()} FCFA / unité</span>
                                        </div>

                                        <div className="flex items-center gap-4 md:gap-6">
                                            <div className="flex items-center bg-gray-50 rounded-lg md:rounded-xl p-0.5 md:p-1 border border-gray-100">
                                                <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-[#1B1F3B] hover:bg-white rounded-lg transition-all"><Minus className="w-3 md:w-4 h-3 md:h-4" /></button>
                                                <span className="w-8 md:w-10 text-center font-black text-xs md:text-sm">{item.qty}</span>
                                                <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-[#1B1F3B] hover:bg-white rounded-lg transition-all"><Plus className="w-3 md:w-4 h-3 md:h-4" /></button>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
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
                                        <span className="text-white">{subtotal.toLocaleString()} FCFA</span>
                                    </div>
                                    {appliedCoupon && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="flex items-center justify-between text-sm font-bold"
                                        >
                                            <span className="flex items-center gap-1.5 text-green-400">
                                                <Tag className="w-3 h-3" />
                                                {appliedCoupon.couponCode}
                                                <button onClick={handleRemoveCoupon} className="ml-1 hover:text-red-400 transition-colors">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                            <span className="text-green-400">-{discount.toLocaleString()} FCFA</span>
                                        </motion.div>
                                    )}
                                    <div className="flex items-center justify-between text-sm font-bold text-gray-400">
                                        <span>Livraison</span>
                                        <span className="text-amber-400 text-xs uppercase tracking-wider">Calculé au checkout</span>
                                    </div>
                                    <div className="w-full h-px bg-white/10" />
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-black uppercase tracking-widest">Total</span>
                                        <span className="text-3xl font-black tracking-tighter text-primary">{total.toLocaleString()} FCFA</span>
                                    </div>
                                </div>

                                {/* Promo Code Input */}
                                {!appliedCoupon ? (
                                    <div className="mb-10">
                                        <div className="relative flex gap-2">
                                            <div className="relative flex-1">
                                                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Code Promo"
                                                    value={promoCode}
                                                    onChange={(e) => {
                                                        setPromoCode(e.target.value.toUpperCase())
                                                        setPromoError('')
                                                    }}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                                                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 text-sm font-bold outline-none focus:border-primary transition-all placeholder:text-gray-500"
                                                />
                                            </div>
                                            <button
                                                onClick={handleApplyPromo}
                                                disabled={promoLoading || !promoCode.trim()}
                                                className="h-12 px-5 bg-white/10 hover:bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                                            >
                                                {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Appliquer'}
                                            </button>
                                        </div>
                                        {promoError && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-red-400 text-[11px] font-bold mt-2 pl-1"
                                            >
                                                {promoError}
                                            </motion.p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="mb-10 p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-400 shrink-0" />
                                        <p className="text-[11px] font-bold text-green-400">
                                            Code <span className="font-black">{appliedCoupon.couponCode}</span> appliqué !
                                        </p>
                                    </div>
                                )}

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
