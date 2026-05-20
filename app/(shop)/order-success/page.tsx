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
} from 'lucide-react'
import { Button } from '@/ui/Button'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

function OrderSuccessContent() {
    const searchParams = useSearchParams()
    const orderId = searchParams.get('orderId') || `BK-${Math.floor(Math.random() * 1000000)}`
    const [copied, setCopied] = useState(false)

    const copyId = async () => {
        try {
            await navigator.clipboard.writeText(orderId)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            /* ignore */
        }
    }

    const steps = [
        { label: 'Commande reçue', done: true },
        { label: 'Préparation', done: false },
        { label: 'Livraison / retrait', done: false },
    ]

    return (
        <main className="min-h-screen bg-[#f8f9fb] py-6 sm:py-10 lg:py-12 px-4 sm:px-0">
            <Container className="max-w-lg sm:max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-lg shadow-gray-200/40 overflow-hidden"
                >
                    <div className="h-1.5 bg-gradient-to-r from-primary via-orange-400 to-primary" />

                    <div className="p-6 sm:p-10 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', damping: 14, stiffness: 200, delay: 0.1 }}
                            className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-green-200"
                        >
                            <Check className="w-8 h-8 sm:w-10 sm:h-10 stroke-[3]" />
                        </motion.div>

                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1B1F3B] uppercase tracking-tight leading-tight mb-3">
                            Commande{' '}
                            <span className="text-primary italic">confirmée</span>
                        </h1>

                        <p className="text-sm sm:text-base text-gray-500 font-medium leading-relaxed mb-6 max-w-sm mx-auto">
                            Merci pour votre confiance. Nous traitons votre commande dans les plus brefs délais.
                        </p>

                        {/* Order ID */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-8 w-full max-w-md mx-auto">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                N° commande
                            </span>
                            <span className="text-sm sm:text-base font-black text-[#1B1F3B] tracking-wide break-all">
                                {orderId}
                            </span>
                            <button
                                type="button"
                                onClick={copyId}
                                className={cn(
                                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-colors shrink-0',
                                    copied
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
                                )}
                            >
                                {copied ? (
                                    <>
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Copié
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3.5 h-3.5" /> Copier
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Timeline */}
                        <div className="text-left mb-8 p-4 sm:p-5 bg-[#f8f9fb] rounded-xl border border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                                Suivi de commande
                            </p>
                            <ol className="space-y-4">
                                {steps.map((s, i) => (
                                    <li key={s.label} className="flex items-center gap-3">
                                        <span
                                            className={cn(
                                                'w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-black',
                                                s.done
                                                    ? 'bg-primary text-white'
                                                    : 'bg-gray-200 text-gray-400'
                                            )}
                                        >
                                            {s.done ? <Check className="w-4 h-4" /> : i + 1}
                                        </span>
                                        <span
                                            className={cn(
                                                'text-sm font-bold',
                                                s.done ? 'text-[#1B1F3B]' : 'text-gray-400'
                                            )}
                                        >
                                            {s.label}
                                        </span>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        {/* Info cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                            <InfoCard icon={MapPin} label="Délai" val="24–48h" />
                            <InfoCard icon={Package} label="Statut" val="En cours" />
                            <InfoCard icon={ShoppingBag} label="Suivi" val="WhatsApp" />
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            <Link href="/boutique" className="w-full">
                                <Button className="w-full h-12 sm:h-14 bg-[#1B1F3B] text-white rounded-xl font-black text-[10px] sm:text-[11px] uppercase tracking-widest hover:bg-primary transition-all">
                                    <ArrowRight className="w-4 h-4 mr-2 rotate-180 shrink-0" />
                                    Continuer mes achats
                                </Button>
                            </Link>

                            <a
                                href={`https://wa.me/221338000000?text=${encodeURIComponent(
                                    `Bonjour, je viens de passer la commande ${orderId} sur Baraka Shop.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full"
                            >
                                <Button className="w-full h-12 sm:h-14 bg-[#25D366] text-white rounded-xl font-black text-[10px] sm:text-[11px] uppercase tracking-widest hover:bg-[#128C7E] transition-all flex items-center justify-center gap-2">
                                    <MessageCircle className="w-4 h-4 shrink-0" />
                                    Contacter le support
                                </Button>
                            </a>

                            <Link
                                href="/account"
                                className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary transition-colors py-2"
                            >
                                Voir mes commandes
                            </Link>
                        </div>
                    </div>

                    <div className="px-6 sm:px-10 py-4 bg-gray-50 border-t border-gray-100 text-center">
                        <p className="text-[10px] font-bold text-gray-400">
                            Besoin d&apos;aide ?{' '}
                            <a href="tel:+221338000000" className="text-primary font-black">
                                +221 33 800 00 00
                            </a>
                        </p>
                    </div>
                </motion.div>
            </Container>
        </main>
    )
}

function InfoCard({
    icon: Icon,
    label,
    val,
}: {
    icon: React.ComponentType<{ className?: string }>
    label: string
    val: string
}) {
    return (
        <div className="bg-white rounded-xl p-4 border border-gray-100 flex flex-row sm:flex-col items-center sm:items-center gap-3 sm:gap-2 text-left sm:text-center">
            <Icon className="w-5 h-5 text-primary shrink-0" />
            <div>
                <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    {label}
                </span>
                <span className="block text-xs sm:text-sm font-black text-[#1B1F3B]">{val}</span>
            </div>
        </div>
    )
}

function LoadingFallback() {
    return (
        <main className="min-h-screen bg-[#f8f9fb] flex items-center justify-center p-6">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
