'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    CheckCircle2,
    ChevronRight,
    CreditCard,
    Home,
    ShieldCheck,
    Store,
    Truck,
} from 'lucide-react'
import { Button } from '@/ui/Button'
import { cn } from '@/lib/utils'

export const CHECKOUT_STEPS = [
    { id: 1, label: 'Mode', shortLabel: 'Livraison', icon: Truck },
    { id: 2, label: 'Adresse', shortLabel: 'Coordonnées', icon: Home },
    { id: 3, label: 'Paiement', shortLabel: 'Paiement', icon: CreditCard },
    { id: 4, label: 'Validation', shortLabel: 'Récap', icon: ShieldCheck },
] as const

export function CheckoutBreadcrumb() {
    return (
        <nav
            aria-label="Fil d'Ariane"
            className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 sm:mb-8 overflow-x-auto scrollbar-hide whitespace-nowrap"
        >
            <Link href="/" className="hover:text-primary transition-colors shrink-0">
                Accueil
            </Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <Link href="/cart" className="hover:text-primary transition-colors shrink-0">
                Panier
            </Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="text-[#1B1F3B] shrink-0">Commande</span>
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
        <>
            {/* Mobile: compact progress */}
            <motion.div
                className="lg:hidden mb-6 rounded-2xl bg-white border border-gray-100 p-4 shadow-sm"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <motion.div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Étape {step} / {CHECKOUT_STEPS.length}
                    </span>
                    <span className="text-xs font-black text-[#1B1F3B]">
                        {CHECKOUT_STEPS[step - 1]?.shortLabel}
                    </span>
                </motion.div>
                <motion.div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={false}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.35 }}
                    />
                </motion.div>
                <motion.div className="flex justify-between mt-3 gap-1">
                    {CHECKOUT_STEPS.map((s) => {
                        const Icon = s.icon
                        const done = step > s.id
                        const active = step === s.id
                        return (
                            <button
                                key={s.id}
                                type="button"
                                disabled={s.id > step}
                                onClick={() => s.id < step && onStepClick(s.id)}
                                className={cn(
                                    'flex-1 flex flex-col items-center gap-1 min-w-0 py-1 rounded-lg transition-colors',
                                    s.id < step && 'cursor-pointer',
                                    s.id > step && 'opacity-40 cursor-not-allowed'
                                )}
                            >
                                <span
                                    className={cn(
                                        'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                                        done && 'bg-primary text-white',
                                        active && !done && 'bg-[#1B1F3B] text-white ring-2 ring-primary/30',
                                        !done && !active && 'bg-gray-100 text-gray-400'
                                    )}
                                >
                                    {done ? (
                                        <CheckCircle2 className="w-4 h-4" />
                                    ) : (
                                        <Icon className="w-3.5 h-3.5" />
                                    )}
                                </span>
                                <span
                                    className={cn(
                                        'text-[8px] font-black uppercase tracking-wide truncate w-full text-center',
                                        active ? 'text-[#1B1F3B]' : 'text-gray-400'
                                    )}
                                >
                                    {s.shortLabel}
                                </span>
                            </button>
                        )
                    })}
                </motion.div>
            </motion.div>

            {/* Desktop: full stepper */}
            <div className="hidden lg:block max-w-3xl mx-auto mb-12 xl:mb-16 px-2">
                <div className="flex items-center justify-between relative">
                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0" />
                    <motion.div
                        className="absolute top-5 left-0 h-0.5 bg-primary z-0"
                        initial={false}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.35 }}
                    />
                    {CHECKOUT_STEPS.map((s) => {
                        const Icon = s.icon
                        const done = step > s.id
                        const active = step === s.id
                        return (
                            <div key={s.id} className="relative z-10 flex flex-col items-center gap-2 flex-1">
                                <button
                                    type="button"
                                    disabled={s.id > step}
                                    onClick={() => s.id < step && onStepClick(s.id)}
                                    className={cn(
                                        'w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all',
                                        done && 'bg-primary text-white',
                                        active && !done && 'bg-[#1B1F3B] text-white scale-110',
                                        !done && !active && 'bg-gray-100 text-gray-400',
                                        s.id < step && 'cursor-pointer hover:scale-105'
                                    )}
                                >
                                    {done ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                </button>
                                <span
                                    className={cn(
                                        'text-[10px] font-black uppercase tracking-widest text-center',
                                        step >= s.id ? 'text-[#1B1F3B]' : 'text-gray-400'
                                    )}
                                >
                                    {s.label}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </>
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
                'bg-white rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-5 sm:p-8 lg:p-10 border border-gray-100 shadow-sm',
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
    accent = 'dark',
}: {
    icon: React.ComponentType<{ className?: string }>
    title: string
    accent?: 'dark' | 'green'
}) {
    return (
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div
                className={cn(
                    'w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shrink-0',
                    accent === 'green' ? 'bg-green-500' : 'bg-[#1B1F3B]'
                )}
            >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h2 className="text-base sm:text-lg lg:text-xl font-black uppercase tracking-wide sm:tracking-widest text-[#1B1F3B] leading-tight">
                {title}
            </h2>
        </div>
    )
}

export function CheckoutNavButtons({
    onBack,
    onNext,
    nextLabel = 'Continuer',
    showBack = true,
}: {
    onBack?: () => void
    onNext: () => void
    nextLabel?: string
    showBack?: boolean
}) {
    return (
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
            {showBack && onBack && (
                <Button
                    type="button"
                    onClick={onBack}
                    className="w-full sm:flex-1 h-12 sm:h-14 bg-gray-100 text-[#1B1F3B] rounded-xl sm:rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all"
                >
                    Retour
                </Button>
            )}
            <Button
                type="button"
                onClick={onNext}
                className={cn(
                    'w-full h-12 sm:h-14 bg-[#1B1F3B] text-white rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-widest hover:bg-primary transition-all',
                    showBack && onBack ? 'sm:flex-[2]' : ''
                )}
            >
                <span className="truncate">{nextLabel}</span>
            </Button>
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
            className="mt-4 p-3 sm:p-4 bg-red-50 border border-red-100 rounded-xl sm:rounded-2xl text-red-600 text-xs font-bold text-center leading-relaxed"
        >
            {message}
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

export function CheckoutOrderSummary({
    cartItems,
    subtotal,
    shipping,
    total,
    deliveryMethod,
    selectedZoneName,
    compact = false,
    className,
}: {
    cartItems: CartItem[]
    subtotal: number
    shipping: number
    total: number
    deliveryMethod: 'livraison' | 'retrait'
    selectedZoneName?: string | null
    compact?: boolean
    className?: string
}) {
    return (
        <div
            className={cn(
                'bg-[#1B1F3B] rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] shadow-xl shadow-[#1B1F3B]/20 relative overflow-hidden',
                compact ? 'p-4' : 'p-5 sm:p-8 lg:p-10',
                className
            )}
        >
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-primary/20 blur-[50px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            <h2 className="text-sm sm:text-lg font-black text-white uppercase tracking-widest mb-4 sm:mb-6 pb-4 border-b border-white/10 relative z-10">
                Récapitulatif
            </h2>

            {!compact && (
                <div className="flex flex-col gap-4 mb-6 max-h-[220px] sm:max-h-[280px] overflow-y-auto scrollbar-hide pr-1 relative z-10">
                    {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                            <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-white/5 rounded-lg overflow-hidden shrink-0">
                                <Image src={item.image} alt="" fill className="object-contain p-1" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-white/90 uppercase tracking-tight line-clamp-2">
                                    {item.name}
                                </p>
                                <p className="text-xs sm:text-sm font-black text-primary mt-0.5">
                                    {(item.price * item.qty).toLocaleString()} FCFA
                                </p>
                            </div>
                            <span className="text-[10px] font-black text-white/40 shrink-0">×{item.qty}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex flex-col gap-2 sm:gap-3 text-white relative z-10">
                <div className="flex justify-between text-xs sm:text-sm font-bold text-white/60">
                    <span>Sous-total</span>
                    <span>{subtotal.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-green-400 gap-2">
                    <span className="flex items-center gap-1.5 min-w-0">
                        {deliveryMethod === 'livraison' ? (
                            <>
                                <Truck className="w-3 h-3 shrink-0" />
                                <span className="truncate">
                                    Livraison{selectedZoneName ? ` · ${selectedZoneName}` : ''}
                                </span>
                            </>
                        ) : (
                            <>
                                <Store className="w-3 h-3 shrink-0" />
                                Retrait boutique
                            </>
                        )}
                    </span>
                    <span className="shrink-0 uppercase">
                        {shipping === 0 ? 'Gratuit' : `${shipping.toLocaleString()} FCFA`}
                    </span>
                </div>
                <div className="h-px bg-white/10 my-1" />
                <div className="flex justify-between items-end gap-2">
                    <span className="text-xs sm:text-sm font-black uppercase tracking-widest">Total</span>
                    <span className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tighter text-primary">
                        {total.toLocaleString()} FCFA
                    </span>
                </div>
            </div>
        </div>
    )
}

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
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md safe-area-pb">
            <div className="px-4 py-3 flex items-center gap-3 max-w-lg mx-auto">
                <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                        {itemCount} article{itemCount > 1 ? 's' : ''} · Étape {step}/4
                    </p>
                    <p className="text-lg font-black text-[#1B1F3B] tracking-tight truncate">
                        {total.toLocaleString()} <span className="text-xs text-primary">FCFA</span>
                    </p>
                </div>
                {step > 1 && (
                    <button
                        type="button"
                        onClick={onBack}
                        className="h-11 px-3 rounded-xl bg-gray-100 text-[#1B1F3B] text-[10px] font-black uppercase shrink-0"
                    >
                        Retour
                    </button>
                )}
                <Button
                    type="button"
                    onClick={isLast ? onConfirm : onNext}
                    disabled={isSubmitting}
                    className="h-11 px-5 sm:px-6 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-wider shrink-0 disabled:opacity-50"
                >
                    {isSubmitting ? '…' : isLast ? 'Confirmer' : 'Continuer'}
                </Button>
            </div>
        </div>
    )
}

export function FormInput({
    label,
    placeholder,
    value,
    onChange,
    type = 'text',
}: {
    label: string
    placeholder: string
    value: string
    onChange: (val: string) => void
    type?: string
}) {
    return (
        <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-[#1B1F3B] uppercase tracking-widest pl-1">
                {label}
            </span>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-12 sm:h-14 bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl px-4 sm:px-6 text-base font-bold outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            />
        </label>
    )
}

export function PaymentOption({
    active,
    onClick,
    icon: Icon,
    title,
    desc,
}: {
    active: boolean
    onClick: () => void
    icon: React.ComponentType<{ className?: string }>
    title: string
    desc: string
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'flex items-start sm:items-center gap-4 p-4 sm:p-6 rounded-xl sm:rounded-2xl border transition-all text-left w-full',
                active
                    ? 'bg-primary/5 border-primary shadow-md shadow-primary/5'
                    : 'bg-white border-gray-100 hover:border-gray-200'
            )}
        >
            <motion.div
                className={cn(
                    'w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0',
                    active ? 'bg-primary text-white' : 'bg-gray-50 text-gray-400'
                )}
            >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.div>
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span
                    className={cn(
                        'text-xs sm:text-sm font-black uppercase tracking-tight',
                        active ? 'text-primary' : 'text-[#1B1F3B]'
                    )}
                >
                    {title}
                </span>
                <span className="text-[11px] sm:text-xs text-gray-500 font-medium leading-snug">{desc}</span>
            </div>
            <div
                className={cn(
                    'w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0',
                    active ? 'border-primary bg-primary' : 'border-gray-200'
                )}
            >
                {active && <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />}
            </div>
        </button>
    )
}
