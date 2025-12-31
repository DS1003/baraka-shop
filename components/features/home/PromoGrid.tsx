'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

const DISCOVER_ITEMS = [
    {
        title: 'Notre sélection de cadeaux',
        img: 'https://images.unsplash.com/photo-1549463591-24c187247abc',
        size: 'large'
    },
    {
        title: 'LEGO',
        img: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60',
        size: 'small'
    },
    {
        title: 'Seconde vie',
        img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
        size: 'small'
    },
    {
        title: 'Nos créateurs',
        img: 'https://images.unsplash.com/photo-1534073828943-f801091bb18c',
        size: 'small'
    },
    {
        title: 'S\'équiper IA',
        img: 'https://images.unsplash.com/photo-1677442136019-21780ecad995',
        size: 'small'
    }
]

export default function PromoGrid() {
    return (
        <section className="py-12 bg-[#f0f2f5]">
            <div className="container px-4 mx-auto">
                <div className="flex items-baseline gap-4 mb-8">
                    <h2 className="text-[18px] font-black uppercase tracking-widest text-[#1a1a1a]">À DÉCOUVRIR</h2>
                    <span className="text-[11px] font-bold text-gray-400 italic">Conseils, inspirations, innovations</span>
                    <div className="flex-1 h-px bg-gray-200 ml-4" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[600px]">
                    {/* Column 1: Large Box */}
                    <div className="md:col-span-1 h-full">
                        <DiscoverCard item={DISCOVER_ITEMS[0]} />
                    </div>

                    {/* Column 2: Two Small Boxes */}
                    <div className="flex flex-col gap-6 h-full">
                        <DiscoverCard item={DISCOVER_ITEMS[1]} />
                        <DiscoverCard item={DISCOVER_ITEMS[3]} />
                    </div>

                    {/* Column 3: Two Small Boxes */}
                    <div className="flex flex-col gap-6 h-full">
                        <DiscoverCard item={DISCOVER_ITEMS[2]} />
                        <DiscoverCard item={DISCOVER_ITEMS[4]} />
                    </div>
                </div>
            </div>
        </section>
    )
}

function DiscoverCard({ item }: { item: typeof DISCOVER_ITEMS[0] }) {
    return (
        <Link href="/shop" className="group relative w-full h-full rounded-lg overflow-hidden flex flex-col shadow-sm border border-gray-100 min-h-[250px]">
            <Image
                src={`${item.img}?q=80&w=800&auto=format&fit=crop`}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

            <div className="absolute top-8 left-8 z-10">
                <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter mb-4 max-w-[200px] leading-tight drop-shadow-lg">
                    {item.title}
                </h3>
                <button className="bg-white/90 backdrop-blur-sm text-black px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 group-hover:bg-primary group-hover:text-white transition-all">
                    VOIR <ChevronRight size={12} />
                </button>
            </div>
        </Link>
    )
}
