'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Timer, Zap, ArrowRight, Flame } from 'lucide-react'
import { MOCK_PRODUCTS } from '@/lib/data'
import ProductCard from '@/components/features/product/ProductCard'
import Link from 'next/link'

export default function FlashDeals() {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })

    useEffect(() => {
        const target = new Date()
        target.setHours(target.getHours() + 24)
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

    return (
        <section className="py-8">
            <div className="container px-4 mx-auto">
                <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl p-6 md:p-10">
                    {/* Background Effects */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/20 blur-[100px] rounded-full pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-orange-500/10 blur-[80px] rounded-full pointer-events-none" />

                    {/* Header */}
                    <div className="relative z-10 flex flex-col md:flex-row items-end justify-between gap-6 mb-10 border-b border-white/10 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl shadow-lg shadow-orange-500/30">
                                <Zap className="text-white fill-white" size={32} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase flex items-center gap-2">
                                    Flash <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Deals</span>
                                    <Flame className="text-orange-500 animate-pulse" size={24} />
                                </h2>
                                <p className="text-gray-400 font-medium">Prix cassés pour une durée limitée</p>
                            </div>
                        </div>

                        {/* Timer */}
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl border border-white/10">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">Se termine dans :</span>
                            <div className="flex gap-2 text-white font-mono font-bold text-xl">
                                <span className="bg-black/40 px-3 py-1 rounded-lg border border-white/10">{String(timeLeft.hours).padStart(2, '0')}h</span>
                                <span className="py-1">:</span>
                                <span className="bg-black/40 px-3 py-1 rounded-lg border border-white/10">{String(timeLeft.minutes).padStart(2, '0')}m</span>
                                <span className="py-1">:</span>
                                <span className="bg-orange-500 px-3 py-1 rounded-lg min-w-[3rem] text-center shadow-lg shadow-orange-500/20">{String(timeLeft.seconds).padStart(2, '0')}s</span>
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {MOCK_PRODUCTS.slice(0, 5).map((product, index) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-xl p-3 shadow-lg group hover:-translate-y-2 transition-transform duration-300"
                            >
                                <div className="relative aspect-square mb-3 bg-gray-50 rounded-lg overflow-hidden">
                                    <div className="absolute top-2 right-2 z-10 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                                        -20%
                                    </div>
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-400 font-medium truncate">{product.category}</p>
                                    <h3 className="font-bold text-gray-900 text-sm line-clamp-2 min-h-[40px] leading-tight group-hover:text-primary transition-colors">{product.name}</h3>
                                    <div className="flex items-center gap-2 pt-1">
                                        <span className="font-bold text-red-600">{product.price.toLocaleString()} F</span>
                                        {product.oldPrice && (
                                            <span className="text-[10px] text-gray-400 line-through decoration-red-400 decoration-wavy">{product.oldPrice.toLocaleString()} F</span>
                                        )}
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
                                        <div className="bg-gradient-to-r from-orange-400 to-red-500 h-full rounded-full" style={{ width: `${Math.random() * 40 + 60}%` }} />
                                    </div>
                                    <p className="text-[10px] text-gray-500 text-right mt-1">Presque épuisé !</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-8 text-center relative z-10">
                        <Link href="/shop?tag=deals" className="inline-flex items-center gap-2 text-white/70 hover:text-white font-medium text-sm transition-colors group">
                            Voir toutes les offres <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
