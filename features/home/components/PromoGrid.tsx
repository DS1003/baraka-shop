'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/ui/Container'
import { ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const promos = [
    {
        badge: "Exclusivité",
        title: "Pack Gaming Ultimate",
        subtitle: "PS5 + 2 Jeux + Manette",
        price: "499.000 CFA",
        image: "https://media.ldlc.com/encart/p/26671_b.jpg",
        bg: "bg-[#F8FAFC]",
        border: "border-slate-100",
        size: "md:col-span-2",
        href: "/category/jeux"
    },
    {
        badge: "Tendance",
        title: "Apple Ecosystem",
        subtitle: "MacBook & iPad M3",
        price: "Dès 650.000 CFA",
        image: "https://media.ldlc.com/encart/p/28885_b.jpg",
        bg: "bg-[#FFFBF5]",
        border: "border-orange-100/50",
        size: "md:col-span-2",
        href: "/category/informatique"
    },
    {
        badge: "Vente Flash",
        title: "Smartphones Pro",
        subtitle: "Derniers modèles arrivés",
        image: "https://media.ldlc.com/encart/p/28828_b.jpg",
        bg: "bg-[#F5F7FF]",
        border: "border-indigo-100/50",
        size: "md:col-span-2 lg:col-span-1",
        href: "/category/smartphones"
    },
    {
        badge: "Promo",
        title: "Accessoires Premium",
        subtitle: "Optimisez votre setup",
        image: "https://media.ldlc.com/encart/p/22889_b.jpg",
        bg: "bg-[#FFF5F9]",
        border: "border-pink-100/50",
        size: "md:col-span-2 lg:col-span-1",
        href: "/category/informatique"
    },
    {
        badge: "Nouveau",
        title: "Son & Image High-End",
        subtitle: "Le cinéma à la maison",
        image: "https://media.ldlc.com/encart/p/28829_b.jpg",
        bg: "bg-[#F5FFF9]",
        border: "border-emerald-100/50",
        size: "md:col-span-2 lg:col-span-2",
        href: "/category/image-son"
    }
]

export function PromoGrid() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState(0)

    const slideNext = () => {
        setDirection(1)
        setCurrentIndex((prev) => (prev + 1) % promos.length)
    }

    const slidePrev = () => {
        setDirection(-1)
        setCurrentIndex((prev) => (prev - 1 + promos.length) % promos.length)
    }

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 300 : -300,
            opacity: 0
        })
    }

    return (
        <section className="py-12 md:py-24 overflow-hidden bg-white">
            <Container>
                {/* Desktop Grid */}
                <div className="hidden md:grid grid-cols-4 gap-8">
                    {promos.map((promo, idx) => (
                        <PromoCard key={idx} promo={promo} />
                    ))}
                </div>

                {/* Mobile Carousel */}
                <div className="md:hidden relative px-1">
                    {/* Header with Navigation */}
                    <div className="flex items-center justify-between mb-10 px-2">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase">Baraka Selection</span>
                            <h2 className="text-3xl font-bold text-[#1B1F3B] tracking-tight">Nos <span className="text-primary italic font-serif">Incontournables</span></h2>
                        </div>
                        <div className="flex gap-2.5">
                            <button
                                onClick={slidePrev}
                                className="w-12 h-12 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm active:scale-95 transition-all text-[#1B1F3B]"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={slideNext}
                                className="w-12 h-12 rounded-full bg-[#1B1F3B] text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
                            >
                                <ChevronRight className="w-5 h-5 text-primary" />
                            </button>
                        </div>
                    </div>

                    <div className="relative h-[560px] w-full mb-10">
                        <AnimatePresence initial={false} custom={direction}>
                            <motion.div
                                key={currentIndex}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: "spring", stiffness: 300, damping: 32 },
                                    opacity: { duration: 0.3 }
                                }}
                                className="absolute inset-0"
                            >
                                <PromoCard promo={promos[currentIndex]} isMobile />
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Pagination Dots */}
                    <div className="flex justify-center gap-3">
                        {promos.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setDirection(idx > currentIndex ? 1 : -1)
                                    setCurrentIndex(idx)
                                }}
                                className={`h-1.5 rounded-full transition-all duration-500 ${currentIndex === idx ? "w-10 bg-[#1B1F3B]" : "w-1.5 bg-slate-200"
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    )
}

function PromoCard({ promo, isMobile = false }: { promo: any, isMobile?: boolean }) {
    return (
        <Link
            href={promo.href}
            className={`group relative flex flex-col items-start justify-between overflow-hidden rounded-[2.5rem] p-8 md:p-10 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${promo.bg} border ${promo.border} ${isMobile ? "h-full shadow-2xl shadow-slate-200" : `min-h-[360px] shadow-sm hover:shadow-2xl hover:shadow-slate-200 hover:-translate-y-2 ${promo.size}`}`}
        >
            {/* Minimalist Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: `radial-gradient(#1B1F3B 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />

            {/* Sophisticated Inner Border */}
            <div className="absolute inset-3 border border-white/40 rounded-[1.8rem] pointer-events-none" />

            <div className="relative z-10 flex w-full flex-col gap-8">
                <div>
                    <motion.span
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block rounded-full bg-white/95 backdrop-blur-md px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#1B1F3B] shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-white"
                    >
                        {promo.badge}
                    </motion.span>
                </div>

                <div className="flex flex-col gap-3">
                    <h3 className={`${isMobile ? "text-4xl" : "text-3xl"} font-extrabold leading-[1.1] tracking-tight text-[#1B1F3B] uppercase max-w-[90%]`}>
                        {promo.title}
                    </h3>
                    <p className="max-w-[220px] text-sm font-medium text-[#1B1F3B]/50 leading-relaxed">
                        {promo.subtitle}
                    </p>
                </div>

                {promo.price && (
                    <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#1B1F3B]/30">Offre Spéciale</span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-extrabold tracking-tighter text-[#1B1F3B]">{promo.price.split(' ')[0]}</span>
                            <span className="text-[13px] font-bold text-primary italic font-serif leading-none">{promo.price.split(' ').slice(1).join(' ')}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="relative z-10 mt-10 flex items-center gap-4 rounded-full bg-[#1B1F3B] pl-8 pr-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-all duration-500 group-hover:bg-primary group-hover:scale-[1.02] shadow-xl group-hover:shadow-primary/20">
                Explorer
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 group-hover:bg-white/20 transition-all">
                    <ArrowRight className="h-3.5 w-3.5 text-primary transition-transform duration-500 group-hover:translate-x-0.5" />
                </div>
            </div>

            {/* Floating Image with Refined Motion */}
            <div className={`absolute right-[-5%] bottom-[2%] ${isMobile ? "w-[70%] h-[55%]" : "w-[55%] h-[75%]"} pointer-events-none transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-110 group-hover:-translate-y-6 group-hover:-rotate-2`}>
                <div className="relative h-full w-full">
                    <Image
                        src={promo.image}
                        alt={promo.title}
                        fill
                        className="object-contain drop-shadow-[0_25px_25px_rgba(0,0,0,0.12)] select-none"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                    />
                </div>
            </div>

            {/* Subtle Reflection Overlay */}
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rotate-12 pointer-events-none" />
        </Link>
    )
}

