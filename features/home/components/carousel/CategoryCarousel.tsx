'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/ui/Container'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react'

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
        <section className="py-16 bg-[#fafafa]">
            <Container>
                {/* Header */}
                <div className="flex items-end justify-between mb-10">
                    <div className="flex flex-col gap-2">
                        <span className="text-primary font-black text-[10px] uppercase tracking-[0.3em]">Découverte</span>
                        <h2 className="text-3xl md:text-4xl font-black text-[#1B1F3B] uppercase tracking-tight">Nos Rayons</h2>
                    </div>
                    <Link href="/categories" className="flex items-center gap-2 text-xs font-black uppercase text-primary border-b-2 border-primary/20 hover:border-primary transition-all pb-1">
                        Tout voir <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Carousel Container */}
                <div className="relative group/carousel">
                    {/* Navigation Buttons */}
                    <button
                        onClick={() => scrollRef.current?.scrollBy({ left: -400, behavior: 'smooth' })}
                        className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center text-[#1B1F3B] hover:bg-primary hover:text-white transition-all opacity-0 group-hover/carousel:opacity-100 hidden md:flex border border-gray-100"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <button
                        onClick={() => scrollRef.current?.scrollBy({ left: 400, behavior: 'smooth' })}
                        className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center text-[#1B1F3B] hover:bg-primary hover:text-white transition-all opacity-0 group-hover/carousel:opacity-100 hidden md:flex border border-gray-100"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Scrollable Area */}
                    <div
                        ref={scrollRef}
                        className="flex overflow-x-auto gap-6 pb-10 scrollbar-hide snap-x"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {categories.map((cat, idx) => (
                            <Link
                                key={idx}
                                href={`/category/${cat.slug}`}
                                className="flex-shrink-0 w-[180px] md:w-[220px] snap-start group"
                            >
                                <div className="flex flex-col gap-6">
                                    <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-primary/10 group-hover:-translate-y-2">
                                        <Image
                                            src={cat.image}
                                            alt={cat.name}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                                            <span className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                Visiter <ChevronRight className="w-3 h-3 text-primary" />
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <h3 className="font-black text-sm md:text-base text-[#1B1F3B] uppercase tracking-tight group-hover:text-primary transition-colors">
                                            {cat.name}
                                        </h3>
                                        <div className="w-6 h-[2px] bg-primary scale-0 group-hover:scale-100 transition-transform duration-300 mt-2" />
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
