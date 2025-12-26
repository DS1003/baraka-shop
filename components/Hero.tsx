'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function Hero() {
    return (
        <section className="pt-8 pb-12 bg-background/50">
            <div className="container px-4 mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[550px]">

                    {/* Main Carousel (Left - 8 Cols) */}
                    <div className="lg:col-span-8 relative rounded-3xl overflow-hidden group shadow-2xl cursor-pointer">
                        {/* Background Image - High Quality Gaming/Tech Setup */}
                        <div className="absolute inset-0 z-0">
                            <Image
                                src="https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=1600&auto=format&fit=crop"
                                alt="Gaming Setup VR"
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
                        </div>

                        {/* Content */}
                        <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 text-white max-w-2xl py-12 lg:py-0">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 w-fit mb-6"
                            >
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                <span className="text-xs font-bold uppercase tracking-widest text-primary-foreground">Nouveautés 2025</span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-none tracking-tight"
                            >
                                L'Univers <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Immersif.</span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-lg text-gray-300 mb-8 max-w-md leading-relaxed font-light"
                            >
                                Découvrez la nouvelle génération de réalité virtuelle et de setups gaming pro. Des performances inégalées.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-wrap gap-4"
                            >
                                <Link href="/shop?category=gaming" className="btn bg-white text-black hover:bg-primary hover:text-white border-none rounded-full px-8 py-4 font-bold flex items-center gap-2 shadow-xl transition-all hover:scale-105">
                                    Acheter Maintenant <ArrowRight size={20} />
                                </Link>
                            </motion.div>
                        </div>
                    </div>

                    {/* Side Banners (Right - 4 Cols) */}
                    <div className="lg:col-span-4 flex flex-col gap-6 h-full">
                        {/* Banner 1 - New iPhone */}
                        <div className="flex-1 relative rounded-3xl overflow-hidden bg-gray-100 group shadow-lg min-h-[250px] cursor-pointer">
                            <div className="absolute inset-0 z-0">
                                <Image
                                    src="https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=800&auto=format&fit=crop"
                                    alt="iPhone 15 Pro"
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            </div>
                            <div className="relative z-10 p-8 h-full flex flex-col justify-end text-white">
                                <div className="mb-auto text-right">
                                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-white/20">En Stock</span>
                                </div>
                                <h3 className="text-3xl font-bold mb-1">iPhone 15 Pro</h3>
                                <p className="text-sm text-gray-300 font-medium">Titane. Puissance. Élégance.</p>
                            </div>
                        </div>

                        {/* Banner 2 - Apple Watch */}
                        <div className="flex-1 relative rounded-3xl overflow-hidden bg-gray-100 group shadow-lg min-h-[250px] cursor-pointer">
                            <div className="absolute inset-0 z-0">
                                <Image
                                    src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=800&auto=format&fit=crop"
                                    alt="Smartwatch"
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            </div>
                            <div className="relative z-10 p-8 h-full flex flex-col justify-end text-white">
                                <span className="bg-orange-500 text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase w-fit mb-2 shadow-lg">-15% Promo</span>
                                <h3 className="text-3xl font-bold mb-1">Apple Watch</h3>
                                <p className="text-sm text-gray-300 font-medium">L'aventure commence ici.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
