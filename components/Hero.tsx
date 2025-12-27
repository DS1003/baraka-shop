'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function Hero() {
    return (
        <section className="pt-4 md:pt-8 pb-12 bg-background/50">
            <div className="container px-4 mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">

                    {/* Main Banner (Left) */}
                    <div className="lg:col-span-8 relative rounded-[2rem] md:rounded-[3rem] overflow-hidden group shadow-2xl cursor-pointer min-h-[400px] md:h-[550px]">
                        <div className="absolute inset-0 z-0">
                            <Image
                                src="https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=1600&auto=format&fit=crop"
                                alt="Gaming Setup"
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/90 via-black/40 to-black/10 md:to-transparent" />
                        </div>

                        <div className="relative z-10 h-full flex flex-col justify-end md:justify-center px-6 md:px-16 text-white max-w-2xl py-12 md:py-0">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1 w-fit mb-4 md:mb-6"
                            >
                                <Sparkles size={12} className="text-primary" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Exclusivité Baraka</span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 md:mb-6 leading-none tracking-tight"
                            >
                                L'Univers <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Immersif.</span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-[15px] md:text-lg text-gray-300 mb-8 max-w-sm leading-relaxed font-medium"
                            >
                                Tech Pro & Gaming de luxe. Performance pure. Expérience totale.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Link href="/shop" className="group inline-flex items-center gap-3 bg-white text-black hover:bg-primary hover:text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95">
                                    Découvrir <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </motion.div>
                        </div>
                    </div>

                    {/* Secondary Banners (Mobile: Grid / Desktop: Vertical Stack) */}
                    <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-4 md:gap-6">

                        {/* Banner Top Right */}
                        <div className="relative rounded-[2rem] overflow-hidden group shadow-lg h-[200px] md:h-full cursor-pointer">
                            <Image
                                src="https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=800&auto=format&fit=crop"
                                alt="iPhone"
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <div className="relative z-10 p-4 md:p-8 h-full flex flex-col justify-end text-white">
                                <h3 className="text-xl md:text-3xl font-black mb-1">iPhone 15</h3>
                                <p className="text-[10px] md:text-sm text-gray-300 font-bold uppercase tracking-wider">Top Vente</p>
                            </div>
                        </div>

                        {/* Banner Bottom Right */}
                        <div className="relative rounded-[2rem] overflow-hidden group shadow-lg h-[200px] md:h-full cursor-pointer border border-transparent hover:border-primary/20">
                            <Image
                                src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=800&auto=format&fit=crop"
                                alt="Watch"
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />
                            <div className="relative z-10 p-4 md:p-8 h-full flex flex-col justify-end text-white">
                                <span className="hidden md:inline-block bg-primary text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase w-fit mb-3">Promo Flash</span>
                                <h3 className="text-xl md:text-3xl font-black mb-1">Wearables</h3>
                                <p className="text-[10px] md:text-sm text-gray-300 font-bold uppercase tracking-wider">Jusqu'à -30%</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    )
}
