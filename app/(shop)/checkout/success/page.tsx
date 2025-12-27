'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2, Home, Package, ArrowRight, Share2, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'

export default function SuccessPage() {
    useEffect(() => {
        // Trigger confetti on mount
        const duration = 3 * 1000
        const animationEnd = Date.now() + duration
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now()

            if (timeLeft <= 0) {
                return clearInterval(interval)
            }

            const particleCount = 50 * (timeLeft / duration)
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
        }, 250)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="bg-white min-h-screen flex items-center justify-center py-20 overflow-hidden relative">

            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="container px-4 mx-auto text-center max-w-2xl relative z-10">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                    <div className="w-32 h-32 bg-green-50 text-green-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-green-200/50 relative">
                        <CheckCircle2 size={64} />
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute -top-2 -right-2 bg-primary text-white p-2 rounded-xl shadow-lg"
                        >
                            <Sparkles size={16} />
                        </motion.div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tighter leading-none">
                        Félicitations <br /> <span className="text-primary italic">C'est Confirmé !</span>
                    </h1>
                    <p className="text-gray-400 font-medium mb-12 text-lg max-w-md mx-auto">
                        Votre commande <span className="text-black font-black">#BK-9920-25</span> est en route. Un vent de technologie arrive chez vous.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col gap-4 max-w-md mx-auto"
                >
                    <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 mb-6 flex items-center justify-between text-left">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                <Package className="text-gray-400" size={24} />
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">Livraison Estimée</div>
                                <div className="text-sm font-black">Demain, avant 18h00</div>
                            </div>
                        </div>
                        <Link href="/track-order" className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary transition-all">
                            <ArrowRight size={18} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link href="/" className="bg-black text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:shadow-black/20 hover:scale-105 transition-all active:scale-95">
                            <Home size={18} /> Accueil
                        </Link>
                        <Link href="/account/orders" className="bg-white border-2 border-gray-100 text-black py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:border-black transition-all active:scale-95">
                            Mes Commandes
                        </Link>
                    </div>

                    <button className="mt-8 text-gray-400 font-bold text-xs flex items-center justify-center gap-2 hover:text-black transition-colors">
                        <Share2 size={14} /> Partager mon achat
                    </button>
                </motion.div>
            </div>
        </div>
    )
}
