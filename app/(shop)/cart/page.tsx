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
    X,
    Sparkles,
    Zap,
    ArrowRight
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

const FREE_SHIPPING_THRESHOLD = 50_000;

export default function CartPage() {
    const { cartItems, removeFromCart, updateQty, subtotal, itemCount } = useCart()
    const [promoCode, setPromoCode] = useState('')
    const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)
    const [promoError, setPromoError] = useState('')
    const [promoLoading, setPromoLoading] = useState(false)
    const [showPromoInput, setShowPromoInput] = useState(false)

    const discount = appliedCoupon?.discountAmount || 0
    const total = Math.max(0, subtotal - discount)

    const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100))
    const missingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)

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
            setPromoError('Erreur de connexion. Veuillez réessayer.')
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
            <main className="bg-[#f8f9fb] min-h-screen py-16 sm:py-24 flex items-center justify-center">
                <Container className="px-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md mx-auto text-center bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-sm"
                    >
                        <div className="w-24 h-24 sm:w-28 sm:28 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-6 border border-orange-100/60">
                            <ShoppingBag className="w-12 h-12 stroke-[1.75]" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-[#1B1F3B] uppercase tracking-tight mb-3">
                            Votre panier est vide
                        </h1>
                        <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
                            Vous n&apos;avez aucun article pour le moment. Explorez nos collections et trouvez vos coups de cœur.
                        </p>
                        
                        <div className="flex flex-col gap-3">
                            <Link 
                                href="/boutique" 
                                className="w-full h-14 bg-orange-600 hover:bg-[#1B1F3B] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2 group"
                            >
                                Explorer la boutique
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            
                            <div className="grid grid-cols-2 gap-2 pt-2">
                                <Link 
                                    href="/promotions" 
                                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 uppercase tracking-wider transition-colors"
                                >
                                    🔥 Promotions
                                </Link>
                                <Link 
                                    href="/nouveautes" 
                                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 uppercase tracking-wider transition-colors"
                                >
                                    ✨ Nouveautés
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </Container>
            </main>
        )
    }

    return (
        <main className="bg-[#f8f9fb] min-h-screen pt-4 sm:pt-8 pb-32 lg:pb-16">
            <Container className="px-4 sm:px-6">
                
                {/* Mobile & Desktop Breadcrumb */}
                <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 sm:mb-6">
                    <Link href="/" className="hover:text-orange-600 transition-colors">Accueil</Link>
                    <ChevronRight className="w-3 h-3 text-slate-300" />
                    <span className="text-[#1B1F3B]">Panier</span>
                </nav>

                {/* Page Title & Items Count */}
                <div className="flex items-baseline justify-between gap-4 mb-4 sm:mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-4xl font-black text-[#1B1F3B] uppercase tracking-tight">
                            Mon Panier <span className="text-orange-600">({itemCount})</span>
                        </h1>
                        <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
                            Vérifiez vos articles avant de passer à la livraison.
                        </p>
                    </div>
                    <Link 
                        href="/boutique" 
                        className="hidden sm:inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors uppercase tracking-wider"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Poursuivre mes achats
                    </Link>
                </div>

                {/* Free Shipping Progress Indicator */}
                <div className="mb-6 sm:mb-8 bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between text-xs font-bold mb-2">
                        <span className="flex items-center gap-2 text-slate-700">
                            <Truck className="w-4 h-4 text-orange-600" />
                            {missingForFreeShipping === 0 ? (
                                <span className="text-emerald-600 font-black">🎉 Félicitations ! La livraison vous est offerte.</span>
                            ) : (
                                <span>
                                    Plus que <strong className="text-orange-600 font-black">{missingForFreeShipping.toLocaleString()} FCFA</strong> pour la livraison offerte
                                </span>
                            )}
                        </span>
                        <span className="text-[11px] font-black text-slate-400">{freeShippingProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${freeShippingProgress}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
                    
                    {/* Items List */}
                    <div className="lg:col-span-8 flex flex-col gap-3 sm:gap-4">
                        <AnimatePresence mode="popLayout">
                            {cartItems.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-100 shadow-sm flex items-center gap-3.5 sm:gap-5 group relative"
                                >
                                    {/* Thumbnail */}
                                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                                        <Image 
                                            src={item.image} 
                                            alt={item.name} 
                                            fill 
                                            sizes="96px"
                                            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105" 
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                                        <div>
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    {item.brand && (
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5 truncate">
                                                            {item.brand}
                                                        </span>
                                                    )}
                                                    <h3 className="text-xs sm:text-sm font-bold text-[#1B1F3B] leading-snug line-clamp-2 uppercase tracking-tight group-hover:text-orange-600 transition-colors">
                                                        {item.name}
                                                    </h3>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors shrink-0"
                                                    title="Supprimer"
                                                    aria-label="Supprimer du panier"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {item.selectedColor && (
                                                <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase">
                                                    Couleur: {item.selectedColor}
                                                </span>
                                            )}
                                        </div>

                                        {/* Bottom row: Quantity pill & Price */}
                                        <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-50">
                                            {/* Quantity Pill */}
                                            <div className="flex items-center bg-slate-50 rounded-xl p-0.5 border border-slate-200/60">
                                                <button 
                                                    onClick={() => updateQty(item.id, -1)} 
                                                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-slate-700 hover:bg-white rounded-lg transition-all active:scale-90"
                                                    aria-label="Diminuer la quantité"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="w-7 sm:w-8 text-center font-black text-xs sm:text-sm text-[#1B1F3B]">
                                                    {item.qty}
                                                </span>
                                                <button 
                                                    onClick={() => updateQty(item.id, 1)} 
                                                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-slate-700 hover:bg-white rounded-lg transition-all active:scale-90"
                                                    aria-label="Augmenter la quantité"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>

                                            {/* Total line price */}
                                            <div className="text-right">
                                                <span className="text-sm sm:text-base font-black text-[#1B1F3B] tracking-tight block">
                                                    {(item.price * item.qty).toLocaleString()} FCFA
                                                </span>
                                                {item.qty > 1 && (
                                                    <span className="text-[10px] text-slate-400 font-medium block">
                                                        {item.price.toLocaleString()} F / unité
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Mobile: Link to continue shopping */}
                        <div className="sm:hidden pt-2">
                            <Link 
                                href="/boutique" 
                                className="w-full py-3 bg-white rounded-xl border border-slate-200/80 text-center text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                Continuer mes achats
                            </Link>
                        </div>
                    </div>

                    {/* Summary Sidebar (Desktop sticky card, mobile interactive promo) */}
                    <div className="lg:col-span-4">
                        <div className="lg:sticky lg:top-24 flex flex-col gap-4 sm:gap-6">
                            
                            {/* Summary Card */}
                            <div className="bg-[#1B1F3B] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-[#1B1F3B]/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 blur-[50px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />

                                <h2 className="text-base sm:text-lg font-black uppercase tracking-widest mb-6 pb-4 border-b border-white/10 flex items-center justify-between">
                                    <span>Récapitulatif</span>
                                    <span className="text-xs text-slate-400 font-medium lowercase tracking-normal">
                                        {itemCount} article{itemCount > 1 ? 's' : ''}
                                    </span>
                                </h2>

                                {/* Cost lines */}
                                <div className="flex flex-col gap-3.5 mb-6 text-sm">
                                    <div className="flex items-center justify-between text-slate-300 font-medium">
                                        <span>Sous-total</span>
                                        <span className="text-white font-bold">{subtotal.toLocaleString()} FCFA</span>
                                    </div>

                                    {appliedCoupon && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="flex items-center justify-between text-emerald-400 font-semibold"
                                        >
                                            <span className="flex items-center gap-1.5">
                                                <Tag className="w-3.5 h-3.5" />
                                                Code {appliedCoupon.couponCode}
                                                <button onClick={handleRemoveCoupon} className="hover:text-rose-400 transition-colors ml-1" title="Supprimer le code">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </span>
                                            <span>-{discount.toLocaleString()} FCFA</span>
                                        </motion.div>
                                    )}

                                    <div className="flex items-center justify-between text-slate-300 font-medium">
                                        <span>Livraison</span>
                                        <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">
                                            Calculée à la commande
                                        </span>
                                    </div>

                                    <div className="w-full h-px bg-white/10 my-1" />

                                    <div className="flex items-baseline justify-between pt-1">
                                        <div>
                                            <span className="text-xs font-black uppercase tracking-widest text-slate-200 block">Total net</span>
                                            <span className="text-[10px] text-slate-400">TVA incluse</span>
                                        </div>
                                        <span className="text-2xl sm:text-3xl font-black tracking-tight text-orange-500">
                                            {total.toLocaleString()} <span className="text-xs text-orange-300">FCFA</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Promo Code Accordion */}
                                <div className="mb-6">
                                    {!appliedCoupon ? (
                                        <div>
                                            {!showPromoInput ? (
                                                <button
                                                    onClick={() => setShowPromoInput(true)}
                                                    className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1.5 transition-colors"
                                                >
                                                    <Tag className="w-3.5 h-3.5" />
                                                    Vous avez un code promo ?
                                                </button>
                                            ) : (
                                                <div className="space-y-2">
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder="CODE PROMO"
                                                            value={promoCode}
                                                            onChange={(e) => {
                                                                setPromoCode(e.target.value.toUpperCase())
                                                                setPromoError('')
                                                            }}
                                                            onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                                                            className="flex-1 h-11 bg-white/10 border border-white/15 rounded-xl px-3.5 text-xs font-bold outline-none focus:border-orange-500 text-white placeholder:text-slate-400 uppercase tracking-wider transition-all"
                                                        />
                                                        <button
                                                            onClick={handleApplyPromo}
                                                            disabled={promoLoading || !promoCode.trim()}
                                                            className="h-11 px-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white rounded-xl font-black text-[10px] uppercase tracking-wider transition-all shrink-0 flex items-center justify-center gap-1.5"
                                                        >
                                                            {promoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Appliquer'}
                                                        </button>
                                                    </div>
                                                    {promoError && (
                                                        <p className="text-rose-400 text-[11px] font-bold">{promoError}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs text-emerald-400 font-bold">
                                            <span className="flex items-center gap-2">
                                                <Check className="w-4 h-4 shrink-0" />
                                                Coupon {appliedCoupon.couponCode} actif
                                            </span>
                                            <button onClick={handleRemoveCoupon} className="text-[10px] text-slate-400 hover:text-white uppercase">Retirer</button>
                                        </div>
                                    )}
                                </div>

                                {/* Desktop Checkout CTA button */}
                                <Link href="/checkout" className="hidden lg:block w-full">
                                    <button className="w-full h-14 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-xl shadow-orange-600/25 group">
                                        <span>Passer la commande</span>
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </Link>

                                <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4 hidden lg:block">
                                    🔒 Paiement Sécurisé · Livraison Express
                                </p>
                            </div>

                            {/* Trust Perks Banner */}
                            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100/60">
                                        <Truck className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase text-[#1B1F3B] tracking-tight">Livraison Express Dakar</p>
                                        <p className="text-[11px] text-slate-500 font-medium">À domicile sous 24h ou retrait gratuit en boutique</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/60">
                                        <CreditCard className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase text-[#1B1F3B] tracking-tight">Paiement à la livraison</p>
                                        <p className="text-[11px] text-slate-500 font-medium">Réglez en espèces en toute sérénité à la réception</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/60">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase text-[#1B1F3B] tracking-tight">Support WhatsApp 7j/7</p>
                                        <p className="text-[11px] text-slate-500 font-medium">Une équipe à votre écoute pour toute question</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>

            </Container>

            {/* MOBILE FIRST FLOATING BOTTOM BAR */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden">
                <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
                    <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block truncate">
                            Total ({itemCount} article{itemCount > 1 ? 's' : ''})
                        </span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-black text-[#1B1F3B] tracking-tight truncate">
                                {total.toLocaleString()}
                            </span>
                            <span className="text-xs font-black text-orange-600">FCFA</span>
                        </div>
                    </div>

                    <Link href="/checkout" className="shrink-0">
                        <button className="h-12 px-6 bg-orange-600 active:bg-orange-700 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-orange-600/30 transition-transform active:scale-95">
                            <span>Commander</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </Link>
                </div>
            </div>
        </main>
    )
}
