'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
    CheckCircle2,
    Check,
    ChevronRight,
    ChevronDown,
    CreditCard,
    Home,
    ShieldCheck,
    Store,
    Truck,
    Smartphone,
    Wallet,
    ShoppingBag,
    Loader2,
    RotateCcw,
    Headphones,
} from 'lucide-react'
import { Button } from '@/ui/Button'
import { cn, formatPrice, formatNumber } from '@/lib/utils'

export const CHECKOUT_STEPS = [
    { id: 1, label: 'Mode & Zone', shortLabel: 'Livraison', icon: Truck },
    { id: 2, label: 'Coordonnées', shortLabel: 'Adresse', icon: Home },
    { id: 3, label: 'Paiement', shortLabel: 'Paiement', icon: CreditCard },
    { id: 4, label: 'Confirmation', shortLabel: 'Validation', icon: ShieldCheck },
] as const

export function CheckoutBreadcrumb() {
    return (
        <nav
            aria-label="Fil d'Ariane"
            className="flex items-center gap-1.5 sm:gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 sm:mb-6 overflow-x-auto scrollbar-hide whitespace-nowrap"
        >
            <Link href="/" className="hover:text-orange-600 transition-colors shrink-0">
                Accueil
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
            <Link href="/cart" className="hover:text-orange-600 transition-colors shrink-0">
                Panier
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
            <span className="text-[#1B1F3B] shrink-0 font-black">Commande</span>
        </nav>
    )
}

export function CheckoutStepper({
    step,
    onStepClick,
}: {
    step: number
    onStepClick: (s: number) => void
}) {
    const progress = ((step - 1) / (CHECKOUT_STEPS.length - 1)) * 100

    return (
        <div className="mb-6 sm:mb-8">
            {/* Mobile: Sleek segmented bar */}
            <div className="lg:hidden bg-white rounded-2xl border border-slate-100 p-3.5 shadow-sm">
                <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Étape {step} sur {CHECKOUT_STEPS.length}
                    </span>
                    <span className="text-xs font-black text-orange-600 flex items-center gap-1">
                        {CHECKOUT_STEPS[step - 1]?.label}
                    </span>
                </div>
                
                {/* Visual Progress bar */}
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                    <motion.div
                        className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
                        initial={false}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                {/* 4 Step touch targets */}
                <div className="grid grid-cols-4 gap-1">
                    {CHECKOUT_STEPS.map((s) => {
                        const done = step > s.id
                        const active = step === s.id
                        return (
                            <button
                                key={s.id}
                                type="button"
                                disabled={s.id > step}
                                onClick={() => s.id < step && onStepClick(s.id)}
                                className={cn(
                                    'py-1.5 px-1 rounded-xl flex flex-col items-center gap-1 transition-all',
                                    active && 'bg-orange-50/80 border border-orange-200/60',
                                    done && 'hover:bg-slate-50 cursor-pointer',
                                    s.id > step && 'opacity-40 cursor-not-allowed'
                                )}
                            >
                                <span
                                    className={cn(
                                        'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-colors',
                                        done && 'bg-emerald-500 text-white',
                                        active && 'bg-orange-600 text-white shadow-sm',
                                        !done && !active && 'bg-slate-100 text-slate-400'
                                    )}
                                >
                                    {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.id}
                                </span>
                                <span
                                    className={cn(
                                        'text-[9px] font-bold tracking-tight truncate w-full text-center',
                                        active ? 'text-orange-600 font-black' : done ? 'text-slate-700' : 'text-slate-400'
                                    )}
                                >
                                    {s.shortLabel}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Desktop: Elegant full stepper */}
            <div className="hidden lg:block max-w-2xl mx-auto px-4">
                <div className="flex items-center justify-between relative">
                    <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-200 z-0" />
                    <motion.div
                        className="absolute top-5 left-8 h-0.5 bg-orange-600 z-0"
                        initial={false}
                        animate={{ width: `calc(${progress}% * 0.85)` }}
                        transition={{ duration: 0.35 }}
                    />
                    {CHECKOUT_STEPS.map((s) => {
                        const Icon = s.icon
                        const done = step > s.id
                        const active = step === s.id
                        return (
                            <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                                <button
                                    type="button"
                                    disabled={s.id > step}
                                    onClick={() => s.id < step && onStepClick(s.id)}
                                    className={cn(
                                        'w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-sm',
                                        done && 'bg-emerald-500 text-white hover:scale-105',
                                        active && 'bg-orange-600 text-white ring-4 ring-orange-500/20 scale-105',
                                        !done && !active && 'bg-white border border-slate-200 text-slate-400',
                                        s.id < step && 'cursor-pointer'
                                    )}
                                >
                                    {done ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                                </button>
                                <span
                                    className={cn(
                                        'text-[11px] font-black uppercase tracking-wider',
                                        active ? 'text-orange-600' : done ? 'text-slate-800' : 'text-slate-400'
                                    )}
                                >
                                    {s.label}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export function CheckoutSection({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) {
    return (
        <section
            className={cn(
                'bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-100 shadow-sm',
                className
            )}
        >
            {children}
        </section>
    )
}

export function CheckoutSectionHeader({
    icon: Icon,
    title,
    subtitle,
}: {
    icon: React.ComponentType<{ className?: string }>
    title: string
    subtitle?: string
}) {
    return (
        <div className="flex items-center gap-3.5 mb-6 sm:mb-8 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-orange-50 border border-orange-100/60 flex items-center justify-center text-orange-600 shrink-0">
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <h2 className="text-base sm:text-lg font-black uppercase tracking-wide text-[#1B1F3B] leading-tight">
                    {title}
                </h2>
                {subtitle && (
                    <p className="text-xs text-slate-400 font-medium mt-0.5">{subtitle}</p>
                )}
            </div>
        </div>
    )
}

export function CheckoutNavButtons({
    onBack,
    onNext,
    nextLabel = 'Continuer',
    showBack = true,
    isLoading = false,
}: {
    onBack?: () => void
    onNext: () => void
    nextLabel?: string
    showBack?: boolean
    isLoading?: boolean
}) {
    return (
        <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-4 pt-4 sm:pt-6 border-t border-slate-100 mt-6 sm:mt-8">
            {showBack && onBack && (
                <button
                    type="button"
                    onClick={onBack}
                    className="w-full sm:w-auto sm:px-6 h-12 sm:h-13 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl sm:rounded-2xl font-black text-xs uppercase tracking-wider transition-colors"
                >
                    Retour
                </button>
            )}
            <button
                type="button"
                onClick={onNext}
                disabled={isLoading}
                className={cn(
                    'w-full h-12 sm:h-13 bg-orange-600 hover:bg-orange-500 text-white rounded-xl sm:rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50',
                    showBack && onBack ? 'sm:flex-1' : ''
                )}
            >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{nextLabel}</span>
                {!isLoading && <ChevronRight className="w-4 h-4" />}
            </button>
        </div>
    )
}

export function CheckoutError({ message }: { message: string }) {
    if (!message) return null
    return (
        <motion.div
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 sm:p-4 bg-rose-50 border border-rose-200/80 rounded-xl sm:rounded-2xl text-rose-600 text-xs font-bold text-center leading-relaxed"
        >
            ⚠️ {message}
        </motion.div>
    )
}

type CartItem = {
    id: string
    name: string
    price: number
    qty: number
    image: string
}

/**
 * Collapsible Order Summary Bar for Mobile Screens
 */
export function MobileOrderSummaryAccordion({
    cartItems,
    subtotal,
    shipping,
    discount = 0,
    total,
    deliveryMethod,
    selectedZoneName,
    isFreeShipping = false,
}: {
    cartItems: CartItem[]
    subtotal: number
    shipping: number
    discount?: number
    total: number
    deliveryMethod: 'livraison' | 'retrait'
    selectedZoneName?: string | null
    isFreeShipping?: boolean
}) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="lg:hidden mb-4 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 flex items-center justify-between text-left active:bg-slate-50 transition-colors"
            >
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 truncate">
                        {isOpen ? 'Masquer le récapitulatif' : `Articles (${cartItems.length}) · Total`}
                    </span>
                    <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform duration-200', isOpen && 'rotate-180')} />
                </div>
                <span className="text-sm font-black text-orange-600 shrink-0 tabular-nums">
                    {formatPrice(total)}
                </span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-100 px-4 py-3 bg-slate-50/50"
                    >
                        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 mb-3">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex items-center gap-2.5 text-xs">
                                    <div className="relative w-10 h-10 bg-white rounded-lg border border-slate-200/60 overflow-hidden shrink-0">
                                        <Image src={item.image} alt="" fill className="object-contain p-1" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-800 truncate">{item.name}</p>
                                        <p className="text-[11px] text-slate-400">Qté: {item.qty}</p>
                                    </div>
                                    <span className="font-black text-slate-900 shrink-0 tabular-nums">
                                        {formatNumber(item.price * item.qty)} F
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-slate-200/60 text-xs">
                            <div className="flex justify-between text-slate-500">
                                <span>Sous-total</span>
                                <span className="tabular-nums">{formatPrice(subtotal)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-emerald-600 font-bold">
                                    <span>Réduction</span>
                                    <span className="tabular-nums">-{formatPrice(discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-slate-500">
                                <span>Livraison ({deliveryMethod === 'retrait' ? 'Boutique' : (selectedZoneName || 'Zone')}):</span>
                                {deliveryMethod === 'retrait' ? (
                                    <span className="font-bold text-emerald-600">Gratuit</span>
                                ) : isFreeShipping ? (
                                    <span className="font-bold text-emerald-600">Offerte</span>
                                ) : selectedZoneName ? (
                                    <span className="font-bold text-slate-800 tabular-nums">{formatPrice(shipping)}</span>
                                ) : (
                                    <span className="text-slate-400 italic text-[11px]">À calculer</span>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

/**
 * Desktop Order Summary Card
 */
export function CheckoutOrderSummary({
    cartItems,
    subtotal,
    shipping,
    discount = 0,
    couponCode,
    total,
    deliveryMethod,
    selectedZoneName,
    isFreeShipping = false,
    className,
}: {
    cartItems: CartItem[]
    subtotal: number
    shipping: number
    discount?: number
    couponCode?: string | null
    total: number
    deliveryMethod: 'livraison' | 'retrait'
    selectedZoneName?: string | null
    isFreeShipping?: boolean
    className?: string
}) {
    return (
        <div
            className={cn(
                'bg-[#1B1F3B] rounded-3xl shadow-xl shadow-[#1B1F3B]/20 relative overflow-hidden p-6 sm:p-8',
                className
            )}
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 blur-[50px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            <h2 className="text-base font-black text-white uppercase tracking-widest mb-6 pb-4 border-b border-white/10 relative z-10 flex items-center justify-between">
                <span>Récapitulatif</span>
                <span className="text-xs text-slate-400 font-medium normal-case">
                    {cartItems.length} article{cartItems.length > 1 ? 's' : ''}
                </span>
            </h2>

            {/* Items list preview */}
            <div className="flex flex-col gap-3 mb-6 max-h-[240px] overflow-y-auto scrollbar-hide pr-1 relative z-10">
                {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                        <div className="relative w-12 h-12 bg-white/10 rounded-xl overflow-hidden shrink-0 border border-white/10">
                            <Image src={item.image} alt="" fill sizes="48px" className="object-contain p-1" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-white/95 line-clamp-1">
                                {item.name}
                            </p>
                            <p className="text-xs font-black text-orange-400 mt-0.5 tabular-nums">
                                {formatPrice(item.price * item.qty)}
                            </p>
                        </div>
                        <span className="text-[11px] font-black text-white/40 shrink-0">×{item.qty}</span>
                    </div>
                ))}
            </div>

            {/* Costs calculation */}
            <div className="flex flex-col gap-3 text-white relative z-10 text-sm">
                <div className="flex justify-between text-slate-300 font-medium">
                    <span>Sous-total</span>
                    <span className="tabular-nums">{formatPrice(subtotal)}</span>
                </div>

                {discount > 0 && couponCode && (
                    <div className="flex justify-between font-bold text-emerald-400">
                        <span>Code promo ({couponCode})</span>
                        <span className="tabular-nums">-{formatPrice(discount)}</span>
                    </div>
                )}

                <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-1.5 text-xs">
                        {deliveryMethod === 'livraison' ? (
                            <>
                                <Truck className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                                <span>Livraison {selectedZoneName ? `(${selectedZoneName})` : ''}</span>
                            </>
                        ) : (
                            <>
                                <Store className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>Retrait en boutique</span>
                            </>
                        )}
                    </span>
                    {deliveryMethod === 'retrait' ? (
                        <span className="text-xs font-bold uppercase text-emerald-400">
                            Gratuit
                        </span>
                    ) : isFreeShipping ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 tracking-wider border border-emerald-500/30">
                            <Check className="w-3 h-3 stroke-[2.5]" />
                            Offerte
                        </span>
                    ) : selectedZoneName ? (
                        <span className="text-xs font-bold text-white tabular-nums">
                            {formatPrice(shipping)}
                        </span>
                    ) : (
                        <span className="text-xs font-medium text-slate-400 italic">
                            À calculer
                        </span>
                    )}
                </div>

                <div className="h-px bg-white/10 my-1" />

                <div className="flex justify-between items-baseline pt-1">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-200">Total Net</span>
                    <span className="text-2xl font-black tracking-normal tabular-nums text-orange-500">
                        {formatNumber(total)} <span className="text-xs text-orange-300">FCFA</span>
                    </span>
                </div>
            </div>
        </div>
    )
}

/**
 * Mobile Sticky Bottom Navigation Bar
 */
export function CheckoutMobileBar({
    step,
    total,
    itemCount,
    isSubmitting,
    onBack,
    onNext,
    onConfirm,
}: {
    step: number
    total: number
    itemCount: number
    isSubmitting: boolean
    onBack: () => void
    onNext: () => void
    onConfirm: () => void
}) {
    const isLast = step === 4

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-md px-4 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            <div className="flex items-center gap-3 max-w-lg mx-auto">
                <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block truncate">
                        Étape {step}/4 · {itemCount} art.
                    </span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black text-[#1B1F3B] tracking-normal tabular-nums truncate">
                            {formatNumber(total)}
                        </span>
                        <span className="text-xs font-black text-orange-600">FCFA</span>
                    </div>
                </div>

                {step > 1 && (
                    <button
                        type="button"
                        onClick={onBack}
                        disabled={isSubmitting}
                        className="h-12 px-3.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold uppercase shrink-0 active:bg-slate-200 transition-colors"
                    >
                        Retour
                    </button>
                )}

                <button
                    type="button"
                    onClick={isLast ? onConfirm : onNext}
                    disabled={isSubmitting}
                    className="h-12 px-6 bg-orange-600 active:bg-orange-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shrink-0 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 transition-transform active:scale-95"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Patientez…</span>
                        </>
                    ) : (
                        <>
                            <span>{isLast ? 'Confirmer' : 'Continuer'}</span>
                            <ChevronRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}

/**
 * Modern Touch-Friendly Form Input with 16px font to prevent iOS Safari auto-zoom
 */
export function FormInput({
    label,
    placeholder,
    value,
    onChange,
    type = 'text',
    required = false,
    helperText,
    icon: Icon,
}: {
    label: string
    placeholder: string
    value: string
    onChange: (val: string) => void
    type?: string
    required?: boolean
    helperText?: string
    icon?: React.ComponentType<{ className?: string }>
}) {
    return (
        <label className="flex flex-col gap-1.5 w-full">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider pl-0.5 flex items-center gap-1">
                {label}
                {required && <span className="text-orange-600">*</span>}
            </span>
            <div className="relative">
                {Icon && (
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <Icon className="w-4 h-4" />
                    </div>
                )}
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={cn(
                        "w-full h-12 bg-slate-50/80 border border-slate-200/80 rounded-xl text-slate-900 font-semibold text-[15px] sm:text-sm outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 transition-all placeholder:text-slate-400 placeholder:font-normal",
                        Icon ? "pl-10 pr-4" : "px-4"
                    )}
                />
            </div>
            {helperText && (
                <span className="text-[10px] text-slate-400 pl-1">{helperText}</span>
            )}
        </label>
    )
}

/**
 * Modern Payment Option Tile
 */
export function PaymentOption({
    active,
    onClick,
    icon: Icon,
    title,
    desc,
    badge,
}: {
    active: boolean
    onClick: () => void
    icon: React.ComponentType<{ className?: string }>
    title: string
    desc: string
    badge?: string
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'flex items-center gap-3.5 sm:gap-4 p-4 sm:p-5 rounded-2xl border-2 transition-all text-left w-full relative group',
                active
                    ? 'bg-orange-50/40 border-orange-600 shadow-sm'
                    : 'bg-white border-slate-200/80 hover:border-slate-300'
            )}
        >
            <div
                className={cn(
                    'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                    active ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                )}
            >
                <Icon className="w-5 h-5" />
            </div>

            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className={cn('text-xs sm:text-sm font-black uppercase tracking-tight', active ? 'text-orange-600' : 'text-[#1B1F3B]')}>
                        {title}
                    </span>
                    {badge && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-black rounded-md uppercase tracking-wide">
                            {badge}
                        </span>
                    )}
                </div>
                <span className="text-[11px] sm:text-xs text-slate-500 font-medium leading-snug">
                    {desc}
                </span>
            </div>

            {/* Custom Radio check */}
            <div
                className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                    active ? 'border-orange-600 bg-orange-600 text-white' : 'border-slate-300 bg-white'
                )}
            >
                {active && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
        </button>
    )
}

/**
 * Premium Trust & Guarantee Card
 */
export function CheckoutTrustGuaranteeCard({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-[0_2px_14px_-4px_rgba(0,0,0,0.04)] p-4 sm:p-5 transition-all duration-300 hover:shadow-md hover:border-emerald-300/60 group',
                className
            )}
        >
            {/* Subtle ambient light gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.08] rounded-full blur-2xl pointer-events-none" />

            {/* Header: Seal + Status */}
            <div className="flex items-center justify-between gap-3 mb-3.5 relative z-10">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/80 border border-emerald-200/70 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
                        <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-[#1B1F3B] leading-tight">
                            Garantie Baraka Shop
                        </h3>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                            Achetez en toute sérénité à Dakar
                        </p>
                    </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-black uppercase tracking-wider shrink-0 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Certifié
                </span>
            </div>

            {/* Micro-divider */}
            <div className="h-px bg-slate-100 my-3 relative z-10" />

            {/* 3 Core Trust Pillars */}
            <div className="space-y-2.5 relative z-10 text-xs">
                {/* 1. Échange garanti */}
                <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50/80 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-[11px] leading-tight">
                            Échange garanti sous 7 jours
                        </p>
                        <p className="text-[10px] text-slate-400 leading-snug mt-0.5">
                            Testez en toute sérénité. Remplacement express en cas de non-conformité.
                        </p>
                    </div>
                </div>

                {/* 2. Inspection avant paiement */}
                <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50/80 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-[11px] leading-tight">
                            Vérification avant paiement
                        </p>
                        <p className="text-[10px] text-slate-400 leading-snug mt-0.5">
                            Inspectez et testez votre produit en main propre avant de régler au livreur.
                        </p>
                    </div>
                </div>

                {/* 3. Support & SAV Dakar */}
                <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50/80 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Headphones className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-[11px] leading-tight">
                            Service client & SAV local 7j/7
                        </p>
                        <p className="text-[10px] text-slate-400 leading-snug mt-0.5">
                            Équipe réactive par WhatsApp et boutique physique basée à Dakar.
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Seal Footer */}
            <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 relative z-10">
                <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Paiement à la livraison
                </span>
                <span className="text-slate-400">🇸🇳 Dakar & Banlieue</span>
            </div>
        </div>
    )
}

