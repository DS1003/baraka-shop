'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/ui/Container'
import { ChevronRight, ChevronLeft, ArrowRight } from 'reicon-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getOptimizedImageUrl } from '@/lib/utils'

const DEFAULT_PROMOS = [
    {
        badge: "Exclusivité",
        title: "Pack Gaming Ultimate",
        subtitle: "PS5 + 2 Jeux + Manette",
        price: "499 000FCFA",
        image: "https://media.ldlc.com/encart/p/26671_b.jpg",
        bg: "bg-[#F8FAFC]",
        border: "border-slate-100",
        size: "md:col-span-2",
        href: "/boutique?category=jeux",
        order: 0
    },
    {
        badge: "Tendance",
        title: "Apple Ecosystem",
        subtitle: "MacBook & iPad M3",
        price: "Dès 650 000FCFA",
        image: "https://media.ldlc.com/encart/p/28885_b.jpg",
        bg: "bg-[#FFFBF5]",
        border: "border-orange-100/50",
        size: "md:col-span-2",
        href: "/boutique?category=informatique",
        order: 1
    },
    {
        badge: "Vente Flash",
        title: "Smartphones Pro",
        subtitle: "Derniers modèles arrivés",
        image: "https://media.ldlc.com/encart/p/28828_b.jpg",
        bg: "bg-[#F5F7FF]",
        border: "border-blue-100/50",
        size: "md:col-span-1",
        href: "/boutique?category=smartphones",
        order: 2
    },
    {
        badge: "Promo",
        title: "Accessoires Premium",
        subtitle: "Optimisez votre setup",
        image: "https://media.ldlc.com/encart/p/22889_b.jpg",
        bg: "bg-[#FFF5F9]",
        border: "border-pink-100/50",
        size: "md:col-span-1",
        href: "/boutique?category=connectique",
        order: 3
    },
    {
        badge: "Nouveau",
        title: "SON & IMAGE",
        subtitle: "Le cinéma à la maison",
        image: "https://media.ldlc.com/encart/p/28829_b.jpg",
        bg: "bg-[#F5FFF9]",
        border: "border-emerald-100/50",
        size: "md:col-span-2",
        href: "/boutique?category=image-son",
        order: 4
    }
];

export function PromoGrid({ initialPromos }: { initialPromos?: any[] }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState(0)
    const [isMobileView, setIsMobileView] = useState(false)

    useEffect(() => {
        const checkMobile = () => {
            setIsMobileView(window.innerWidth < 768)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const promos = initialPromos && initialPromos.length > 0 ? initialPromos : DEFAULT_PROMOS;

    const slideNext = () => {
        setDirection(1)
        setCurrentIndex((prev) => (prev + 1) % promos.length)
    }

    const slidePrev = () => {
        setDirection(-1)
        setCurrentIndex((prev) => (prev - 1 + promos.length) % promos.length)
    }

    const handleDragEnd = (_: any, info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }) => {
        if (promos.length <= 1) return
        const isSwipeLeft = info.offset.x < -35 || (info.offset.x < -10 && info.velocity.x < -150)
        const isSwipeRight = info.offset.x > 35 || (info.offset.x > 10 && info.velocity.x > 150)
        if (isSwipeLeft) {
            slideNext()
        } else if (isSwipeRight) {
            slidePrev()
        }
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
        <section className="overflow-hidden py-1 md:py-3">
            <Container>
                {/* Header */}
                <div className="mb-2.5 md:mb-6">
                    {/* Mobile Top Row: Eyebrow + Controls */}
                    <div className="flex md:hidden items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <div className="w-5 h-[2px] bg-primary rounded-full shrink-0" />
                            <span className="text-primary font-black text-[8.5px] uppercase tracking-[0.25em] truncate">Baraka Selection</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                            <button
                                onClick={slidePrev}
                                className="w-7 h-7 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-xs active:scale-95 transition-all text-[#1B1F3B]"
                                aria-label="Précédent"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={slideNext}
                                className="w-7 h-7 rounded-full bg-[#1B1F3B] text-white flex items-center justify-center shadow-xs active:scale-95 transition-all text-primary"
                                aria-label="Suivant"
                            >
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-0.5 md:gap-2">
                        {/* Desktop Eyebrow */}
                        <div className="hidden md:flex items-center gap-2">
                            <div className="w-8 h-[2px] bg-primary rounded-full" />
                            <span className="text-primary font-black text-[10px] uppercase tracking-[0.4em]">Baraka Selection</span>
                        </div>

                        {/* Title: full width, no truncation, no clipping */}
                        <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-[#1B1F3B] uppercase tracking-tight leading-none">
                            Nos <span className="text-primary italic inline-block pr-1.5">Incontournables</span>
                        </h2>

                        <p className="text-slate-400 text-[10px] sm:text-xs md:text-sm font-medium mt-1 md:mt-1.5 max-w-sm md:max-w-xl leading-relaxed">
                            Découvrez nos packs incontournables !
                        </p>
                    </div>
                </div>

                {/* Desktop Grid */}
                <div className="hidden md:grid grid-cols-4 gap-4 md:gap-5 lg:gap-6 xl:gap-8">
                    {promos.map((promo, idx) => (
                        <PromoCard key={idx} promo={promo} />
                    ))}
                </div>

                {/* Mobile Carousel */}
                <div className="md:hidden relative">
                    <div className="relative h-[240px] sm:h-[280px] w-full mb-2">
                        <AnimatePresence initial={false} custom={direction} mode="popLayout">
                            <motion.div
                                key={currentIndex}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: "spring", stiffness: 350, damping: 32, mass: 0.8 },
                                    opacity: { duration: 0.18 }
                                }}
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.15}
                                onDragEnd={handleDragEnd}
                                className="absolute inset-0 touch-pan-y transform-gpu will-change-transform"
                            >
                                <PromoCard promo={promos[currentIndex]} isMobile={true} />
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Pagination Dots */}
                    <div className="flex justify-center items-center gap-1.5 pt-1">
                        {promos.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setDirection(idx > currentIndex ? 1 : -1)
                                    setCurrentIndex(idx)
                                }}
                                className={`h-1.5 rounded-full transition-all duration-300 ${currentIndex === idx ? "w-6 bg-primary" : "w-1.5 bg-slate-200"
                                    }`}
                                aria-label={`Promo ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    )
}

function PromoCard({ promo, isMobile = false }: { promo: any, isMobile?: boolean }) {
    if (isMobile) {
        return (
            <Link
                href={promo.href}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl p-4 sm:p-5 transition-all duration-500 ${promo.bg} border ${promo.border} h-full shadow-md shadow-slate-200/40`}
            >
                {/* Minimalist Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: `radial-gradient(#1B1F3B 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />

                {/* Sophisticated Inner Border */}
                <div className="absolute inset-2 border border-white/50 rounded-xl pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-1.5 max-w-[62%]">
                    <div>
                        <span className="inline-block rounded-full bg-white/95 backdrop-blur-md px-2.5 py-0.5 text-[7.5px] font-black uppercase tracking-wider text-[#1B1F3B] shadow-xs border border-white">
                            {promo.badge}
                        </span>
                    </div>

                    <div className="flex flex-col gap-0.5">
                        <h3 className="text-base sm:text-lg font-black leading-tight tracking-tight text-[#1B1F3B] uppercase line-clamp-2">
                            {promo.title}
                        </h3>
                        <p className="text-[10.5px] font-medium text-[#1B1F3B]/60 leading-tight line-clamp-1">
                            {promo.subtitle}
                        </p>
                    </div>

                    {promo.price && (
                        <div className="flex flex-col mt-0.5">
                            <span className="text-[7.5px] font-bold uppercase tracking-wider text-[#1B1F3B]/40">Offre Spéciale</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-base sm:text-lg font-black tracking-tight text-[#1B1F3B]">{promo.price.split(' ')[0]}</span>
                                <span className="text-[10px] font-bold text-primary italic font-serif leading-none">{promo.price.split(' ').slice(1).join(' ')}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="relative z-10 self-start flex items-center gap-1.5 rounded-full bg-[#1B1F3B] pl-3.5 pr-2.5 py-1.5 text-[8.5px] font-black uppercase tracking-wider text-white transition-all shadow-md group-hover:bg-primary active:scale-95">
                    Explorer
                    <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white/10">
                        <ArrowRight className="h-2 w-2 text-primary" />
                    </div>
                </div>

                {/* Floating Image with Refined Motion */}
                <div className="absolute right-[-2%] bottom-1 w-[48%] h-[72%] pointer-events-none transition-transform duration-700 group-hover:scale-105">
                    <div className="relative h-full w-full">
                        <Image
                            src={getOptimizedImageUrl(promo.image, 500)}
                            alt={promo.title}
                            fill
                            className="object-contain drop-shadow-[0_12px_18px_rgba(0,0,0,0.12)] select-none"
                            sizes="(max-width: 768px) 50vw, 300px"
                            priority
                            unoptimized
                        />
                    </div>
                </div>
            </Link>
        )
    }

    return (
        <Link
            href={promo.href}
            className={`group relative flex flex-col items-start justify-between overflow-hidden rounded-2xl md:rounded-3xl lg:rounded-[2.5rem] p-5 md:p-6 lg:p-8 xl:p-10 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${promo.bg} border ${promo.border} min-h-[280px] md:min-h-[300px] lg:min-h-[360px] shadow-sm hover:shadow-2xl hover:shadow-slate-200 hover:-translate-y-2 ${promo.size}`}
        >
            {/* Minimalist Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: `radial-gradient(#1B1F3B 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />

            {/* Sophisticated Inner Border */}
            <div className="absolute inset-2 md:inset-3 border border-white/40 rounded-xl md:rounded-[1.8rem] pointer-events-none" />

            <div className="relative z-10 flex w-full flex-col gap-3 md:gap-5 lg:gap-8">
                <div>
                    <motion.span
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block rounded-full bg-white/95 backdrop-blur-md px-3 md:px-4 py-1 md:py-1.5 text-[8.5px] md:text-[10px] font-bold uppercase tracking-[0.15em] text-[#1B1F3B] shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-white"
                    >
                        {promo.badge}
                    </motion.span>
                </div>

                <div className="flex flex-col gap-1.5 md:gap-3">
                    <h3 className="text-xl sm:text-2xl md:text-xl lg:text-2xl xl:text-3xl font-extrabold leading-[1.1] tracking-tight text-[#1B1F3B] uppercase max-w-[90%]">
                        {promo.title}
                    </h3>
                    <p className="max-w-[170px] lg:max-w-[220px] text-xs lg:text-sm font-medium text-[#1B1F3B]/50 leading-relaxed line-clamp-2">
                        {promo.subtitle}
                    </p>
                </div>

                {promo.price && (() => {
                    const cleanPrice = promo.price.replace(/FCFA/i, '').trim();
                    return (
                        <div className="flex flex-col gap-1 md:gap-1.5">
                            <span className="text-[8.5px] md:text-[10px] font-bold uppercase tracking-[0.1em] text-[#1B1F3B]/30">Offre Spéciale</span>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-xl sm:text-2xl md:text-xl lg:text-2xl xl:text-3xl font-extrabold tracking-normal tabular-nums text-[#1B1F3B]">{cleanPrice}</span>
                                <span className="text-[11px] lg:text-[13px] font-bold text-primary italic font-serif leading-none">FCFA</span>
                            </div>
                        </div>
                    );
                })()}
            </div>

            <div className="relative z-10 mt-6 md:mt-6 lg:mt-10 flex items-center gap-2.5 lg:gap-4 rounded-full bg-[#1B1F3B] pl-5 pr-4 py-2.5 md:pl-5 md:pr-4 md:py-2.5 lg:pl-8 lg:pr-6 lg:py-4 text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-all duration-500 group-hover:bg-primary group-hover:scale-[1.02] shadow-xl group-hover:shadow-primary/20">
                Explorer
                <div className="flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full bg-white/10 group-hover:bg-white/20 transition-all">
                    <ArrowRight className="h-3 w-3 md:h-3.5 md:w-3.5 text-primary transition-transform duration-500 group-hover:translate-x-0.5" />
                </div>
            </div>

            {/* Floating Image with Refined Motion */}
            <div className="absolute right-[-5%] bottom-[2%] w-[55%] h-[75%] pointer-events-none transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-110 group-hover:-translate-y-6 group-hover:-rotate-2">
                <div className="relative h-full w-full">
                    <Image
                        src={getOptimizedImageUrl(promo.image, 700)}
                        alt={promo.title}
                        fill
                        className="object-contain drop-shadow-[0_25px_25px_rgba(0,0,0,0.12)] select-none"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                        unoptimized
                    />
                </div>
            </div>

            {/* Subtle Reflection Overlay */}
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rotate-12 pointer-events-none" />
        </Link>
    )
}

