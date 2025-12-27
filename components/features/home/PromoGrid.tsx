'use client'

import React from 'react'
import Image from 'next/image'
import { ArrowRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function PromoGrid() {
    return (
        <section className="py-8 md:py-16">
            <div className="container px-4 mx-auto space-y-6 md:space-y-10">

                {/* Main Hero Promo - Glassmorphism & High Contrast */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="relative w-full rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-[#050505] min-h-[350px] md:min-h-[480px] flex flex-col md:flex-row items-center group cursor-pointer shadow-3xl"
                >
                    <div className="flex-1 p-8 md:p-20 text-center md:text-left z-10 relative">
                        <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="bg-primary/20 text-primary border border-primary/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 w-fit mx-auto md:mx-0"
                        >
                            Offre Limitée
                        </motion.div>
                        <h2 className="text-5xl md:text-8xl font-black text-white mb-6 leading-[0.85] tracking-tighter">
                            PURE <br />
                            <span className="text-primary">SOUND.</span>
                        </h2>
                        <p className="text-gray-400 mb-8 max-w-sm font-medium text-sm md:text-base leading-relaxed">
                            Découvrez la réduction de bruit active nouvelle génération à <span className="text-white font-bold">-50%</span> aujourd'hui.
                        </p>
                        <button className="bg-white text-black hover:bg-primary hover:text-white font-black py-4 px-10 rounded-full text-xs uppercase tracking-[0.2em] transition-all shadow-white/5 shadow-2xl flex items-center gap-3 mx-auto md:mx-0 active:scale-95">
                            Shopper <ArrowRight size={18} />
                        </button>
                    </div>

                    {/* Sub-atmospheric overlay for depth */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 md:hidden" />

                    <div className="flex-1 relative w-full h-[300px] md:h-full flex items-center justify-center p-8">
                        <Image
                            src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1000&auto=format&fit=crop"
                            alt="Headphones"
                            fill
                            className="object-contain scale-90 md:scale-110 drop-shadow-[0_0_50px_rgba(255,255,255,0.15)] group-hover:scale-110 transition-transform duration-700"
                        />
                    </div>
                </motion.div>

                {/* Sub-Promo Grid - Optimized for 2-column on mobile */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">

                    {[
                        { title: 'iPad Pro', tag: 'Nouveau', price: 'Dès 290k', color: '#FFE5E8', badge: 'bg-red-500', img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0' },
                        { title: 'Sonos 2', tag: '-25% Off', price: 'Promo', color: '#E3F2FD', badge: 'bg-blue-500', img: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1' },
                        { title: 'iWatch 9', tag: 'Hot Deal', price: 'Gift +', color: '#F3E5F5', badge: 'bg-purple-500', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30' },
                        { title: 'iPhone 15', tag: 'Dernier', price: 'Stock', color: '#E8EAF6', badge: 'bg-indigo-500', img: 'https://images.unsplash.com/photo-1592899677712-a170135c97f5' },
                    ].map((card, i) => (
                        <motion.div
                            key={i}
                            whileTap={{ scale: 0.98 }}
                            className="rounded-[1.5rem] md:rounded-[2.5rem] p-5 md:p-8 relative overflow-hidden h-[240px] md:h-[380px] group cursor-pointer shadow-sm hover:shadow-xl transition-all"
                            style={{ backgroundColor: card.color }}
                        >
                            <span className={cn(card.badge, "text-white text-[9px] md:text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider")}>
                                {card.tag}
                            </span>
                            <h3 className="text-lg md:text-2xl font-black mt-3 md:mt-4 text-gray-900 leading-tight">
                                {card.title}
                            </h3>
                            <p className="text-[9px] md:text-[10px] text-gray-500 font-black uppercase tracking-[0.1em] mt-1">
                                {card.price}
                            </p>

                            <div className="absolute -bottom-4 md:bottom-0 -right-4 md:right-0 w-[80%] h-[70%]">
                                <Image
                                    src={`${card.img}?auto=format&fit=crop&q=80&w=400`}
                                    alt={card.title}
                                    fill
                                    className="object-contain object-right-bottom group-hover:scale-110 transition-transform duration-500 mix-blend-multiply"
                                />
                            </div>
                        </motion.div>
                    ))}

                </div>

            </div>
        </section>
    )
}
