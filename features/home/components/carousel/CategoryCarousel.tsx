'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/ui/Container'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ChevronRight, ChevronLeft, Plus } from 'lucide-react'

const categories = [
    { name: 'Informatique', image: 'https://media.ldlc.com/encart/p/28885_b.jpg', slug: 'informatique' },
    { name: 'Smartphones', image: 'https://media.ldlc.com/encart/p/28828_b.jpg', slug: 'smartphones' },
    { name: 'Audio & Son', image: 'https://media.ldlc.com/encart/p/28829_b.jpg', slug: 'image-son' },
    { name: 'Consommables', image: 'https://media.ldlc.com/encart/p/22889_b.jpg', slug: 'consommables' },
    { name: 'Jeux Vidéo', image: 'https://media.ldlc.com/encart/p/26671_b.jpg', slug: 'jeux' },
    { name: 'Électroménager', image: 'https://media.ldlc.com/encart/p/28858_b.jpg', slug: 'electromenager' },
]

export function CategoryCarousel() {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [pageCount, setPageCount] = useState(1)

    useEffect(() => {
        const calculatePages = () => {
            if (scrollRef.current) {
                const { scrollWidth, clientWidth } = scrollRef.current
                setPageCount(Math.ceil(scrollWidth / clientWidth))
            }
        }
        calculatePages()
        window.addEventListener('resize', calculatePages)
        return () => window.removeEventListener('resize', calculatePages)
    }, [])

    return (
        <section className="py-20 bg-white">
            <Container>
                {/* Header */}
                <div className="flex items-end justify-between mb-12">
                    <div className="flex flex-col gap-3">
                        <span className="text-primary font-bold text-[10px] uppercase tracking-[0.4em] mb-1">Exploration</span>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-[#1B1F3B] uppercase tracking-tight leading-none">
                            Tous nos <span className="text-primary italic font-serif">Rayons</span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => scrollRef.current?.scrollBy({ left: -400, behavior: 'smooth' })}
                                className="w-12 h-12 rounded-full bg-white border border-slate-100 flex items-center justify-center text-[#1B1F3B] hover:bg-[#1B1F3B] hover:text-white transition-all shadow-sm group/prev active:scale-95"
                            >
                                <ChevronLeft className="w-6 h-6 transition-transform group-active/prev:-translate-x-1" />
                            </button>
                            <button
                                onClick={() => scrollRef.current?.scrollBy({ left: 400, behavior: 'smooth' })}
                                className="w-12 h-12 rounded-full bg-white border border-slate-100 flex items-center justify-center text-[#1B1F3B] hover:bg-[#1B1F3B] hover:text-white transition-all shadow-sm group/next active:scale-95"
                            >
                                <ChevronRight className="w-6 h-6 transition-transform group-active/next:translate-x-1" />
                            </button>
                        </div>

                        <Link
                            href="/categories"
                            className="w-12 h-12 rounded-2xl bg-[#1B1F3B] text-white flex items-center justify-center shadow-xl hover:shadow-[#1B1F3B]/20 transition-all duration-500 hover:-translate-y-1 active:scale-95 group/plus border border-white/10"
                            title="Tout voir"
                        >
                            <Plus className="w-6 h-6 transition-transform duration-500 group-hover/plus:rotate-90 group-hover:text-primary" strokeWidth={3} />
                        </Link>
                    </div>
                </div>

                {/* Carousel Container */}
                <div className="relative group/carousel">
                    {/* Scrollable Area */}
                    <div
                        ref={scrollRef}
                        className="flex overflow-x-auto gap-6 md:gap-8 pb-10 scrollbar-hide snap-x px-4 -mx-4 md:px-0 md:mx-0"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {categories.map((cat, idx) => (
                            <Link
                                key={idx}
                                href={`/category/${cat.slug}`}
                                className="flex-shrink-0 w-[160px] sm:w-[200px] md:w-[260px] snap-center md:snap-start group"
                            >
                                <div className="flex flex-col gap-6">
                                    <div className="relative aspect-[4/5] w-full rounded-[2rem] overflow-hidden bg-[#FBFBFB] border border-slate-50 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:shadow-2xl group-hover:shadow-slate-200/50 group-hover:-translate-y-3">
                                        <Image
                                            src={cat.image}
                                            alt={cat.name}
                                            fill
                                            className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-110"
                                        />

                                        {/* Subtle Reflection Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 opacity-30 group-hover:opacity-10 transition-opacity duration-700" />

                                        <div className="absolute inset-0 bg-[#1B1F3B]/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center p-6 text-center">
                                            <span className="text-white text-[10px] font-bold uppercase tracking-[0.2em] mb-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                                Découvrir
                                            </span>
                                            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center scale-0 group-hover:scale-100 transition-transform duration-500 delay-100 shadow-xl shadow-primary/40">
                                                <ChevronRight className="w-6 h-6 text-white" />
                                            </div>
                                        </div>

                                        {/* Sophisticated Inner Border */}
                                        <div className="absolute inset-3 border border-white/20 rounded-[1.5rem] pointer-events-none" />
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <h3 className="font-bold text-sm md:text-lg text-[#1B1F3B] uppercase tracking-tight group-hover:text-primary transition-colors text-center px-1">
                                            {cat.name}
                                        </h3>
                                        <div className="w-0 group-hover:w-8 h-[2px] bg-primary transition-all duration-500 mt-2" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </Container>

            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </section>
    )
}
