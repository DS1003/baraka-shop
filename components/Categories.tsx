'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

const UNIVERS = [
    {
        name: 'Apple',
        desc: 'Premium Reseller',
        priceLabel: 'À PARTIR DE',
        price: '15.000F',
        image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9',
        isApple: true
    },
    {
        name: 'PC portables',
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0'
    },
    {
        name: 'Périphériques',
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf'
    },
    {
        name: 'PC Baraka',
        image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7'
    }
]

export default function Categories() {
    return (
        <section className="py-12 bg-[#f0f2f5]">
            <div className="container px-4 mx-auto">
                {/* Header LDLC Style */}
                <div className="flex items-baseline gap-4 mb-8">
                    <h2 className="text-[18px] font-black uppercase tracking-widest text-[#1a1a1a]">UNIVERS POPULAIRES</h2>
                    <span className="text-[11px] font-bold text-gray-400 italic">Tout ce que vous aimez est là</span>
                    <div className="flex-1 h-px bg-gray-200 ml-4" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {UNIVERS.map((univ, i) => (
                        <Link href={`/shop?cat=${univ.name.toLowerCase()}`} key={i}>
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="bg-white rounded-lg p-8 shadow-sm border border-gray-100 h-[380px] flex flex-col items-center group transition-all hover:shadow-xl"
                            >
                                <h3 className="text-[13px] font-black text-gray-500 uppercase tracking-[0.15em] mb-12 group-hover:text-primary transition-colors">
                                    {univ.name}
                                </h3>

                                <div className="flex-1 w-full relative mb-6">
                                    <Image
                                        src={`${univ.image}?q=80&w=600&auto=format&fit=crop`}
                                        alt={univ.name}
                                        fill
                                        className="object-contain transform transition-transform duration-700 group-hover:scale-110"
                                    />

                                    {univ.isApple && (
                                        <div className="absolute top-0 left-0 flex flex-col items-start">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                                                    <Image src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" width={16} height={16} className="invert" />
                                                </span>
                                                <div className="flex flex-col leading-none">
                                                    <span className="text-[11px] font-black uppercase tracking-tighter">Premium</span>
                                                    <span className="text-[11px] font-black uppercase tracking-tighter">Reseller</span>
                                                </div>
                                            </div>
                                            {univ.price && (
                                                <div className="mt-4">
                                                    <span className="text-[9px] font-black text-gray-400 block tracking-widest">{univ.priceLabel}</span>
                                                    <span className="text-xl font-black text-primary italic leading-none">{univ.price}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight className="text-primary" />
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
