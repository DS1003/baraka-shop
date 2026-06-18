'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Home, ShoppingBag, ArrowRight, Search, MapPin, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSiteLogos } from '@/lib/hooks/useSiteLogos'

export default function NotFound() {
    const { headerLogo } = useSiteLogos()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <main className="h-[100dvh] bg-[#FAFAFA] flex flex-col relative selection:bg-orange-500/20 selection:text-orange-900 font-sans overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div 
                    className="absolute inset-0 opacity-[0.015]"
                    style={{
                        backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
                        backgroundSize: '40px 40px',
                    }}
                />
                <div className="absolute -top-[10%] -right-[10%] w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] bg-orange-100/60 rounded-full blur-[80px] opacity-60 mix-blend-multiply animate-[pulse_8s_ease-in-out_infinite]" />
                <div className="absolute -bottom-[10%] -left-[10%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-blue-50/50 rounded-full blur-[80px] opacity-60 mix-blend-multiply" />
            </div>

            {/* Header */}
            <header className="w-full relative z-10 pt-3 sm:pt-5 md:pt-6 px-4 sm:px-6 md:px-10 flex items-center justify-between shrink-0">
                <Link href="/" className="relative w-24 h-7 sm:w-32 sm:h-9 md:w-40 md:h-11">
                    {headerLogo && (
                        <Image
                            src={headerLogo}
                            alt="Baraka Shop"
                            fill
                            className="object-contain object-left"
                            priority
                            unoptimized
                        />
                    )}
                </Link>
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-500 hover:text-slate-900 font-semibold text-[9px] sm:text-[10px] uppercase tracking-widest rounded-full border border-slate-200/60 shadow-sm hover:shadow-md transition-all"
                >
                    <ArrowLeft className="w-3 h-3" />
                    Retour
                </Link>
            </header>

            {/* Central Content — takes remaining space, centers vertically */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-4 sm:px-6 w-full max-w-4xl mx-auto min-h-0">
                
                {/* Badge */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-red-200/50 bg-red-50/50 mb-2 sm:mb-3 shadow-sm"
                >
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                    </span>
                    <span className="text-[8px] sm:text-[10px] font-bold text-red-700 uppercase tracking-[0.15em]">
                        Page introuvable
                    </span>
                </motion.div>

                {/* 404 */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.1 }}
                    className="relative"
                >
                    <h1 className="text-[60px] sm:text-[90px] md:text-[130px] lg:text-[160px] font-black text-transparent bg-clip-text bg-gradient-to-b from-slate-200 to-slate-100 leading-none select-none tracking-tighter">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[60px] sm:text-[90px] md:text-[130px] lg:text-[160px] font-black text-transparent bg-clip-text bg-gradient-to-b from-orange-500 to-orange-400 leading-none select-none tracking-tighter opacity-20">
                            404
                        </span>
                    </div>
                </motion.div>

                {/* Text */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-center max-w-xl mx-auto -mt-1 sm:-mt-3 mb-4 sm:mb-5 md:mb-6"
                >
                    <h2 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-tight mb-1.5 sm:mb-2">
                        Cette page s'est égarée dans nos rayons
                    </h2>
                    <p className="text-[11px] sm:text-xs md:text-sm text-slate-500 font-medium leading-relaxed max-w-sm sm:max-w-md mx-auto px-2">
                        La page que vous recherchez n'existe plus, a été déplacée, ou n'a peut-être jamais existé.
                    </p>
                </motion.div>

                {/* Cards */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.35 }}
                    className="w-full grid grid-cols-3 gap-2 sm:gap-3 max-w-xl sm:max-w-2xl mx-auto"
                >
                    <Link 
                        href="/" 
                        className="group relative bg-white rounded-xl p-3 sm:p-4 border border-slate-200/60 shadow-[0_2px_12px_rgb(0,0,0,0.03)] hover:shadow-[0_6px_20px_rgb(0,0,0,0.06)] transition-all overflow-hidden flex flex-col items-center sm:items-start gap-2 sm:gap-3 active:scale-[0.97] text-center sm:text-left"
                    >
                        <div className="absolute top-0 right-0 w-16 h-16 bg-orange-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                        <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                        <div className="relative">
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900">Accueil</h3>
                            <p className="text-[9px] sm:text-[11px] text-slate-400 font-medium hidden sm:block">Retour à l'accueil</p>
                        </div>
                    </Link>

                    <Link 
                        href="/boutique" 
                        className="group relative bg-white rounded-xl p-3 sm:p-4 border border-slate-200/60 shadow-[0_2px_12px_rgb(0,0,0,0.03)] hover:shadow-[0_6px_20px_rgb(0,0,0,0.06)] transition-all overflow-hidden flex flex-col items-center sm:items-start gap-2 sm:gap-3 active:scale-[0.97] text-center sm:text-left"
                    >
                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                        <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                        <div className="relative">
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900">Boutique</h3>
                            <p className="text-[9px] sm:text-[11px] text-slate-400 font-medium hidden sm:block">Nos produits</p>
                        </div>
                    </Link>

                    <Link 
                        href="/contact" 
                        className="group relative bg-white rounded-xl p-3 sm:p-4 border border-slate-200/60 shadow-[0_2px_12px_rgb(0,0,0,0.03)] hover:shadow-[0_6px_20px_rgb(0,0,0,0.06)] transition-all overflow-hidden flex flex-col items-center sm:items-start gap-2 sm:gap-3 active:scale-[0.97] text-center sm:text-left"
                    >
                        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                        <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                        <div className="relative">
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900">Contact</h3>
                            <p className="text-[9px] sm:text-[11px] text-slate-400 font-medium hidden sm:block">Nous joindre</p>
                        </div>
                    </Link>
                </motion.div>

                {/* CTA */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="mt-4 sm:mt-5 md:mt-6"
                >
                    <Link
                        href="/boutique"
                        className="group relative inline-flex items-center justify-center gap-2 h-10 sm:h-11 md:h-12 px-5 sm:px-6 bg-slate-900 text-white rounded-full font-bold text-[9px] sm:text-[10px] md:text-xs tracking-wide overflow-hidden transition-all shadow-[0_8px_25px_-8px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_25px_-8px_rgba(234,88,12,0.6)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <Search className="w-3.5 h-3.5 relative z-10" />
                        <span className="relative z-10">Explorer la boutique</span>
                        <ArrowRight className="w-3.5 h-3.5 relative z-10 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            </div>

            {/* Footer */}
            <footer className="w-full relative z-10 py-2.5 sm:py-3 md:py-4 px-4 sm:px-6 md:px-10 flex items-center justify-between shrink-0">
                <p className="text-[7px] sm:text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    © 2026 Baraka Shop
                </p>
                <div className="flex items-center gap-1.5">
                    <Search className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400" />
                    <p className="text-[7px] sm:text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Page non trouvée
                    </p>
                </div>
            </footer>
        </main>
    )
}
