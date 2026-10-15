'use client'

import React, { Suspense, useState, useEffect } from 'react'
import { Container } from '@/ui/Container'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    Check,
    ArrowRight,
    MessageCircle,
    MapPin,
    Copy,
    CheckCircle2,
    Package,
    Truck,
    Clock,
    CreditCard,
    ShoppingBag,
    Store,
    PhoneCall
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import confetti from 'canvas-confetti'
import { getOrderSuccessDetails } from '@/lib/actions/order-actions'

interface OrderDetails {
    id: string
    total: number
    status: string
    deliveryMethod: string | null
    deliveryZone: string | null
    createdAt: Date
    items: Array<{
        id: string
        quantity: number
        price: number
        product: {
            name: string
            image: string
        }
    }>
}

function OrderSuccessContent() {
    const searchParams = useSearchParams()
    const rawOrderId = searchParams.get('orderId') || `BK-${Math.floor(100000 + Math.random() * 900000)}`
    const orderRef = rawOrderId.startsWith('#ORD-')
        ? rawOrderId
        : rawOrderId.startsWith('BK-')
            ? rawOrderId
            : `#ORD-${rawOrderId.substring(0, 8).toUpperCase()}`

    const [copied, setCopied] = useState(false)
    const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)

    // Trigger gentle celebratory confetti on mount
    useEffect(() => {
        try {
            confetti({
                particleCount: 45,
                spread: 60,
                origin: { y: 0.6 },
                colors: ['#E8621A', '#10B981', '#1B1F3B', '#F59E0B'],
                disableForReducedMotion: true,
            })
        } catch {
            // Silently ignore if canvas-confetti is not available
        }
    }, [])

    // Fetch optional order details if available in database
    useEffect(() => {
        if (rawOrderId && !rawOrderId.startsWith('BK-')) {
            getOrderSuccessDetails(rawOrderId).then((res) => {
                if (res.success && res.order) {
                    setOrderDetails(res.order as unknown as OrderDetails)
                }
            })
        }
    }, [rawOrderId])

    const copyId = async () => {
        try {
            await navigator.clipboard.writeText(orderRef)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            /* ignore */
        }
    }

    const isPickup = orderDetails?.deliveryMethod === 'retrait'

    const steps = [
        {
            title: 'Commande validée',
            description: 'Enregistrée avec succès',
            status: 'completed', // completed | current | upcoming
            icon: CheckCircle2,
        },
        {
            title: 'Préparation du colis',
            description: 'En cours dans nos locaux à Dakar',
            status: 'current',
            icon: Package,
        },
        {
            title: isPickup ? 'Mise à disposition' : 'Expédition & Livraison',
            description: isPickup ? 'Disponible sous 2h en magasin' : 'Sous 24h à Dakar & banlieue',
            status: 'upcoming',
            icon: isPickup ? Store : Truck,
        },
    ]

    return (
        <main className="min-h-screen bg-[#F8F9FB] py-10 sm:py-20 px-4 flex items-center justify-center">
            <Container className="max-w-xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="relative bg-white rounded-3xl sm:rounded-[32px] border border-slate-200/80 shadow-[0_4px_30px_-4px_rgba(0,0,0,0.05)] overflow-hidden p-6 sm:p-10"
                >
                    {/* Soft ambient light glow at the top */}
                    <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-orange-500/[0.04] via-emerald-500/[0.02] to-transparent pointer-events-none" />

                    {/* Hero section */}
                    <div className="text-center relative z-10">
                        {/* Animated Minimalist Success Seal */}
                        <motion.div
                            initial={{ scale: 0.7, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', damping: 14, stiffness: 240, delay: 0.1 }}
                            className="relative mx-auto mb-5 w-20 h-20 flex items-center justify-center"
                        >
                            {/* Ambient green halo */}
                            <div className="absolute inset-0 rounded-full bg-emerald-500/15 blur-xl pointer-events-none animate-pulse" />

                            {/* Dual-ring check container */}
                            <div className="relative w-18 h-18 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25">
                                <Check className="w-9 h-9 stroke-[3]" />
                            </div>
                        </motion.div>

                        <h1 className="text-2xl sm:text-3xl font-black text-[#1B1F3B] tracking-tight mb-2">
                            Commande confirmée !
                        </h1>

                        <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed max-w-sm mx-auto mb-6">
                            Merci pour votre achat chez <span className="font-bold text-slate-700">Baraka Shop</span>. Votre commande a été transmise à notre équipe logistique.
                        </p>

                        {/* Minimalist Order Reference Pill */}
                        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-xs mb-8 transition-colors">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                Réf :
                            </span>
                            <span className="font-mono font-bold text-[#1B1F3B] tracking-wide">
                                {orderRef}
                            </span>
                            <button
                                type="button"
                                onClick={copyId}
                                className={cn(
                                    'ml-1 text-[11px] font-bold transition-all flex items-center gap-1 active:scale-95',
                                    copied ? 'text-emerald-600' : 'text-slate-400 hover:text-orange-600'
                                )}
                                title="Copier la référence"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                        <span>Copié</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Copier</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Connected Tracking Timeline (Airy & Modern) */}
                        <div className="text-left mb-7 p-4 sm:p-5 bg-slate-50/60 rounded-2xl border border-slate-100">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3.5 pl-0.5">
                                Suivi d&apos;avancement
                            </span>

                            <div className="space-y-4 relative">
                                {steps.map((s, index) => {
                                    const isDone = s.status === 'completed'
                                    const isCurrent = s.status === 'current'
                                    const isLast = index === steps.length - 1

                                    return (
                                        <div key={s.title} className="relative flex items-start gap-3.5">
                                            {/* Vertical connector line */}
                                            {!isLast && (
                                                <div
                                                    className={cn(
                                                        'absolute left-4 top-8 w-0.5 -bottom-2 transition-colors',
                                                        isDone ? 'bg-emerald-500/50' : 'bg-slate-200'
                                                    )}
                                                />
                                            )}

                                            {/* Step Icon Badge */}
                                            <div
                                                className={cn(
                                                    'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 z-10 transition-colors',
                                                    isDone
                                                        ? 'bg-emerald-500 text-white shadow-xs'
                                                        : isCurrent
                                                            ? 'bg-orange-50 text-orange-600 border border-orange-200 shadow-xs ring-4 ring-orange-500/10'
                                                            : 'bg-white border border-slate-200 text-slate-400'
                                                )}
                                            >
                                                {isDone ? (
                                                    <Check className="w-4 h-4 stroke-[3]" />
                                                ) : (
                                                    <s.icon className="w-4 h-4" />
                                                )}
                                            </div>

                                            {/* Step Info */}
                                            <div className="flex-1 min-w-0 pt-0.5">
                                                <div className="flex items-center gap-2">
                                                    <p
                                                        className={cn(
                                                            'text-xs font-bold leading-tight',
                                                            isDone
                                                                ? 'text-[#1B1F3B]'
                                                                : isCurrent
                                                                    ? 'text-orange-600'
                                                                    : 'text-slate-400'
                                                        )}
                                                    >
                                                        {s.title}
                                                    </p>
                                                    {isCurrent && (
                                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-orange-100 text-orange-700">
                                                            En cours
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                                                    {s.description}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Logistics Summary Row */}
                        <div className="grid grid-cols-2 gap-3 mb-8 text-left">
                            <div className="p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block truncate">
                                        Délai estimé
                                    </span>
                                    <span className="text-xs font-bold text-[#1B1F3B] truncate block">
                                        {isPickup ? 'Sous 2h en magasin' : 'Sous 24h à Dakar'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                    {isPickup ? <Store className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                                </div>
                                <div className="min-w-0">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block truncate">
                                        Mode de réception
                                    </span>
                                    <span className="text-xs font-bold text-[#1B1F3B] truncate block">
                                        {isPickup ? 'Retrait boutique' : (orderDetails?.deliveryZone ? `${orderDetails.deliveryZone}` : 'Livraison à domicile')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action CTAs */}
                        <div className="space-y-3">
                            {/* WhatsApp follow button (Refined, no harsh neon green) */}
                            <a
                                href={`https://wa.me/221338223422?text=${encodeURIComponent(
                                    `Bonjour Baraka Shop, je viens de passer la commande ${orderRef}. Pourriez-vous me confirmer le suivi ?`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full"
                            >
                                <button className="w-full h-12 sm:h-13 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200/70 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-xs">
                                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                                    <span>Suivre via WhatsApp</span>
                                </button>
                            </a>

                            {/* Continue shopping button */}
                            <Link href="/boutique" className="block w-full">
                                <button className="w-full h-12 sm:h-13 bg-[#1B1F3B] hover:bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-md shadow-[#1B1F3B]/10">
                                    <span>Continuer mes achats</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </Link>

                            {/* Tertiary Link */}
                            <Link
                                href="/account"
                                className="inline-flex items-center gap-1.5 pt-1 text-[11px] font-bold text-slate-400 hover:text-orange-600 transition-colors uppercase tracking-wider"
                            >
                                <span>Consulter l&apos;historique de mes commandes</span>
                                <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>

                    {/* Support footer note */}
                    <div className="mt-8 pt-5 border-t border-slate-100 text-center relative z-10">
                        <p className="text-[11px] font-medium text-slate-400 flex items-center justify-center gap-1.5 flex-wrap">
                            <span>Une question sur votre livraison ?</span>
                            <a
                                href="tel:+221338223422"
                                className="inline-flex items-center gap-1 text-orange-600 font-bold hover:underline"
                            >
                                <PhoneCall className="w-3 h-3" />
                                +221 33 822 34 22
                            </a>
                        </p>
                    </div>
                </motion.div>
            </Container>
        </main>
    )
}

function LoadingFallback() {
    return (
        <main className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-6">
            <div className="w-10 h-10 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
        </main>
    )
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <OrderSuccessContent />
        </Suspense>
    )
}
