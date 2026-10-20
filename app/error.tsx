'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { RotateCw, Home, MessageSquare, AlertTriangle, ShieldCheck } from 'lucide-react'

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Journaliser l'incident pour les outils d'audit & monitoring
        console.error('[Baraka High-Availability Error Boundary]:', error)
    }, [error])

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
            <div className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-100 text-center relative overflow-hidden">
                {/* Accent top gradient */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-orange-400 to-[#1B1F3B]" />

                {/* Status Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-primary text-[10px] font-black uppercase tracking-widest mb-6">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    <span>Système de Résilience Actif</span>
                </div>

                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-primary flex items-center justify-center mx-auto mb-5">
                    <AlertTriangle className="w-8 h-8" />
                </div>

                {/* Title & Description */}
                <h1 className="text-2xl sm:text-3xl font-black text-[#1B1F3B] tracking-tight uppercase mb-3">
                    Interruption <span className="text-primary italic">Temporaire</span>
                </h1>
                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-6 max-w-md mx-auto">
                    Nos serveurs ont détecté une brève fluctuation réseau. Nos mécanismes d&apos;auto-réparation rétablissent actuellement la liaison.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
                    <button
                        onClick={() => reset()}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-wider hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/20 cursor-pointer"
                    >
                        <RotateCw className="w-4 h-4" />
                        <span>Réessayer</span>
                    </button>

                    <Link
                        href="/"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#1B1F3B] text-white font-black text-xs uppercase tracking-wider hover:bg-[#252B4D] active:scale-95 transition-all shadow-md cursor-pointer"
                    >
                        <Home className="w-4 h-4" />
                        <span>Accueil</span>
                    </Link>
                </div>

                {/* Direct WhatsApp Assistance */}
                <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0 border border-green-100">
                            <MessageSquare className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-[#1B1F3B]">Besoin d&apos;aide immédiate ?</p>
                            <p className="text-[10px] text-gray-400">Notre équipe commerciale est en ligne</p>
                        </div>
                    </div>
                    <a
                        href="https://wa.me/221773123456?text=Bonjour%20Baraka%20Shop,%20je%20rencontre%20un%20souci%20sur%20le%20site"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-black text-green-600 hover:text-green-700 uppercase tracking-wider inline-flex items-center gap-1 shrink-0"
                    >
                        WhatsApp Direct &rarr;
                    </a>
                </div>

                {/* Error Reference for Support */}
                {error.digest && (
                    <p className="text-[9px] font-mono text-gray-400 mt-4">
                        Code d&apos;incident : {error.digest}
                    </p>
                )}
            </div>
        </div>
    )
}
