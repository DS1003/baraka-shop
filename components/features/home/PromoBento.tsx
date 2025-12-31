'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const CARDS = [
    { title: 'LES BONS PLANS', subtitle: 'DES MARQUES', color: 'bg-gradient-to-br from-red-600 to-orange-500', img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da' },
    { title: 'TECH IT EASY', subtitle: 'LES GUIDES BARAKA', color: 'bg-gradient-to-br from-purple-600 to-indigo-700', img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085' },
    { title: 'LE COIN DES AFFAIRES', subtitle: 'OCCASIONS & FINS DE SÉRIE', color: 'bg-gradient-to-br from-yellow-400 to-orange-400', img: 'https://images.unsplash.com/photo-1555421689-491a97ff2040' },
    { title: 'IPHONE 16 PRO', subtitle: 'POSTEZ UN AVIS ET GAGNEZ !', color: 'bg-gradient-to-br from-gray-900 to-black', img: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569' },
]

export default function PromoBento() {
    return (
        <section className="py-8">
            <div className="container px-4 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {CARDS.map((card, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ scale: 1.02 }}
                            className={`${card.color} rounded-[2rem] h-[200px] p-8 relative overflow-hidden group cursor-pointer shadow-xl`}
                        >
                            <div className="relative z-10">
                                <h3 className="text-xl font-black text-white leading-tight italic">
                                    {card.title.split(' ').map((word, j) => (
                                        <React.Fragment key={j}>{word === 'BARAKA' ? <span className="text-primary italic">{word}</span> : word}<br /></React.Fragment>
                                    ))}
                                </h3>
                                <p className="text-[10px] font-black text-white/80 uppercase tracking-widest mt-2">{card.subtitle}</p>
                            </div>

                            <div className="absolute right-0 bottom-0 w-32 h-32 group-hover:scale-110 transition-transform duration-500 opacity-40">
                                <Image src={`${card.img}?q=80&w=300&auto=format&fit=crop`} alt={card.title} fill className="object-contain mix-blend-overlay" />
                            </div>

                            <div className="absolute bottom-4 left-6">
                                <motion.div
                                    className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white"
                                    whileHover={{ width: '100px', backgroundColor: 'white', color: 'black' }}
                                >
                                    <ArrowRight size={16} />
                                </motion.div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
