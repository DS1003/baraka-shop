'use client'

import React, { Suspense, useState } from 'react'
import { Container } from '@/ui/Container'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    Check,
    ShoppingBag,
    ArrowRight,
    MessageCircle,
    MapPin,
    Copy,
    CheckCircle2,
    Package,
    Truck,
    Clock,
    Home
} from 'lucide-react'
import { Button } from '@/ui/Button'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

function OrderSuccessContent() {
    const searchParams = useSearchParams()
    const rawOrderId = searchParams.get('orderId') || `BK-${Math.floor(100000 + Math.random() * 900000)}`
    const orderRef = rawOrderId.startsWith('#ORD-') ? rawOrderId : (rawOrderId.startsWith('BK-') ? rawOrderId : `#ORD-${rawOrderId.substring(0, 8).toUpperCase()}`)
    const [copied, setCopied] = useState(false)

    const copyId = async () => {
        try {
            await navigator.clipboard.writeText(orderRef)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            /* ignore */
        }
    }

    const steps = [
        { label: 'Commande validée', sub: 'Enregistrée avec succès', done: true, icon: CheckCircle2 },
        { label: 'Préparation du colis', sub: 'En cours dans nos locaux', done: false, icon: Package },
        { label: 'Expédition & Livraison', sub: 'Sous 24h à Dakar', done: false, icon: Truck },
    ]

    return (
        <main className="min-h-screen bg-[#f8f9fb] py-8 sm:py-16 px-4">
            <Container className="max-w-xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden"
                >
                    {/* Top Brand Accent Bar */}
                    <div className="h-2 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500" />

                    <div className="p-6 sm:p-10 text-center">
                        {/* Animated Success Badge */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', damping: 12, stiffness: 220, delay: 0.1 }}
                            className="w-18 h-18 sm:w-20 sm:h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/25"
                        >
                            <Check className="w-9 h-9 sm:w-10 sm:h-10 stroke-[3]" />
                        </motion.div>

                        <h1 className="text-2xl sm:text-3xl font-black text-[#1B1F3B] uppercase tracking-tight mb-2">
                            Commande <span className="text-orange-600">Confirmée !</span>
                        </h1>

                        <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed mb-6 max-w-sm mx-auto">
                            Merci pour votre achat chez Baraka Shop. Votre commande a été transmise à notre équipe logistique.
                        </p>

                        {/* Order Reference Box */}
                        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="text-left">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                                    Référence de commande
                                </span>
                                <span className="text-sm sm:text-base font-black text-[#1B1F3B] tracking-wide">
                                    {orderRef}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={copyId}
                                className={cn(
                                    'h-10 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors shrink-0',
                                    copied
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-white border border-slate-200 text-slate-700 hover:border-orange-500 hover:text-orange-600 shadow-sm'
                                )}
                            >
                                {copied ? (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        <span>Copié !</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4 text-slate-400" />
                                        <span>Copier</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Order Timeline */}
                        <div className="text-left mb-8 p-4 sm:p-5 bg-slate-50/70 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 pl-1">
                                État d&apos;avancement
                            </p>
                            <div className="space-y-4">
                                {steps.map((s, idx) => {
                                    const Icon = s.icon
                                    return (
                                        <div key={s.label} className="flex items-start gap-3.5">
                                            <div
                                                className={cn(
                                                    'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                                                    s.done
                                                        ? 'bg-emerald-500 text-white shadow-sm'
                                                        : 'bg-slate-200 text-slate-400'
                                                )}
                                            >
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={cn('text-xs font-black uppercase tracking-tight', s.done ? 'text-[#1B1F3B]' : 'text-slate-400')}>
                                                    {s.label}
                                                </p>
                                                <p className="text-[11px] text-slate-500 font-medium">
                                                    {s.sub}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Quick Perks */}
                        <div className="grid grid-cols-2 gap-2.5 mb-8 text-left">
                            <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center gap-2.5">
                                <Clock className="w-4 h-4 text-orange-600 shrink-0" />
                                <div>
                                    <span className="text-[9px] font-black uppercase text-slate-400 block">Délai estimé</span>
                                    <span className="text-xs font-bold text-[#1B1F3B]">24h à Dakar</span>
                                </div>
                            </div>
                            <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center gap-2.5">
                                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                                <div>
                                    <span className="text-[9px] font-black uppercase text-slate-400 block">Livraison</span>
                                    <span className="text-xs font-bold text-[#1B1F3B]">Direct domicile</span>
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="space-y-2.5">
                            <a
                                href={`https://wa.me/221338223422?text=${encodeURIComponent(
                                    `Bonjour Baraka Shop, je viens de passer la commande ${orderRef}. Pourriez-vous me confirmer le suivi ?`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full"
                            >
                                <button className="w-full h-13 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                                    <MessageCircle className="w-4 h-4" />
                                    Suivre via WhatsApp
                                </button>
                            </a>

                            <Link href="/boutique" className="block w-full">
                                <button className="w-full h-13 bg-[#1B1F3B] hover:bg-slate-800 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95">
                                    <span>Continuer mes achats</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </Link>

                            <Link 
                                href="/account" 
                                className="inline-block pt-2 text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors uppercase tracking-wider"
                            >
                                Consulter l&apos;historique de mes commandes →
                            </Link>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-center">
                        <p className="text-[11px] font-medium text-slate-400">
                            Une question ? Contactez notre support téléphonique au{' '}
                            <a href="tel:+221338223422" className="text-orange-600 font-bold hover:underline">
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
        <main className="min-h-screen bg-[#f8f9fb] flex items-center justify-center p-6">
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
