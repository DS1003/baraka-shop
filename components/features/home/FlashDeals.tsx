'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, Zap, ArrowRight, Flame, ChevronRight, ShoppingBag } from 'lucide-react'
import { MOCK_PRODUCTS } from '@/lib/data'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function FlashDeals() {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })
    const [activeDeal, setActiveDeal] = useState(0)

    useEffect(() => {
        const target = new Date()
        target.setHours(target.getHours() + 12)
        const interval = setInterval(() => {
            const now = new Date()
            const diff = target.getTime() - now.getTime()
            if (diff <= 0) return
            setTimeLeft({
                hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000)
            })
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    const deals = MOCK_PRODUCTS.slice(4, 9)

    return (
        <section className="py-12">
            <div className="container px-4 mx-auto">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Left Panel: High Impact Countdown Card */}
                    <div className="lg:w-1/3 w-full">
                        <div className="bg-black rounded-[2.5rem] p-8 md:p-12 h-full relative overflow-hidden flex flex-col justify-between shadow-2xl group border border-white/5">
                            {/* Glow Effects */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 blur-[80px] rounded-full" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30 animate-pulse">
                                        <Zap size={24} fill="white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">FLASH <span className="text-primary italic">DEALS.</span></h2>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Édition Limitée 2025</p>
                                    </div>
                                </div>

                                <div className="space-y-6 mb-12">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4">Temps restant</span>
                                        <div className="flex gap-3">
                                            {[
                                                { label: 'Hrs', val: timeLeft.hours },
                                                { label: 'Min', val: timeLeft.minutes },
                                                { label: 'Sec', val: timeLeft.seconds, special: true }
                                            ].map((t, i) => (
                                                <div key={i} className="flex flex-col items-center">
                                                    <div className={cn(
                                                        "w-16 h-16 md:w-20 md:h-20 rounded-2xl border border-white/10 flex items-center justify-center text-2xl md:text-3xl font-black font-mono",
                                                        t.special ? "bg-primary text-white border-primary" : "bg-white/5 text-white"
                                                    )}>
                                                        {String(t.val).padStart(2, '0')}
                                                    </div>
                                                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest mt-2">{t.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <p className="text-gray-400 text-xs font-medium mb-8 leading-relaxed italic">
                                    "Les meilleures offres high-tech du Sénégal, réactualisées toutes les 24h. Stocks ultra-limités."
                                </p>
                                <Link href="/shop?tag=deals" className="w-full bg-white text-black hover:bg-primary hover:text-white py-5 rounded-full font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 group-hover:scale-105 shadow-xl">
                                    Voir Tout le catalogue <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Interactive Deals Grid */}
                    <div className="lg:w-2/3 w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                            {deals.slice(0, 4).map((deal, idx) => (
                                <motion.div
                                    key={deal.id}
                                    whileHover={{ y: -8 }}
                                    className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl flex flex-col gap-6 group relative overflow-hidden"
                                >
                                    {/* Sale Badge */}
                                    <div className="absolute top-8 left-8 z-20 bg-primary text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                        -{25 + idx * 5}% OFF
                                    </div>

                                    {/* Abstract background hover */}
                                    <div className="absolute -right-20 -top-20 w-48 h-48 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="flex gap-6 h-full items-center">
                                        <div className="w-1/2 relative aspect-square group-hover:scale-110 transition-transform duration-700">
                                            <Image
                                                src={deal.image}
                                                alt={deal.name}
                                                fill
                                                className="object-contain mix-blend-multiply"
                                            />
                                        </div>
                                        <div className="w-1/2 flex flex-col justify-center">
                                            <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-1">{deal.category}</span>
                                            <h3 className="text-sm font-black text-gray-900 leading-tight mb-3 uppercase tracking-tighter line-clamp-2">{deal.name}</h3>
                                            <div className="flex flex-col mb-4 leading-none">
                                                <span className="text-lg font-black text-gray-900 italic">{deal.price.toLocaleString()}F</span>
                                                <span className="text-[10px] text-gray-400 line-through font-bold mt-1">{(deal.price * 1.3).toLocaleString()}F</span>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${80 - idx * 15}%` }}
                                                        className="bg-primary h-full rounded-full"
                                                    />
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Vendus: {80 - idx * 15}%</span>
                                                    <span className="text-[8px] font-black text-primary uppercase tracking-widest flex items-center gap-1">
                                                        <Flame size={10} fill="currentColor" /> HOT
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button className="absolute bottom-6 right-8 w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-4 transition-all hover:bg-primary shadow-xl">
                                        <ShoppingBag size={20} />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
