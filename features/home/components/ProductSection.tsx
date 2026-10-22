'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus } from 'reicon-react'
import { cn } from '@/lib/utils'
import { ProductCard } from '@/ui/ProductCard'

interface ProductSectionProps {
    eyebrow?: string;
    title: string;
    highlightedWord?: string;
    subtitle?: string;
    products: any[];
    viewAllHref?: string;
    priority?: boolean;
    className?: string;
    hideIfEmpty?: boolean;
}

export function ProductSection({
    eyebrow,
    title,
    highlightedWord,
    subtitle,
    products = [],
    viewAllHref = '/boutique',
    priority = false,
    className,
    hideIfEmpty = false
}: ProductSectionProps) {
    if (hideIfEmpty && (!products || products.length === 0)) {
        return null;
    }

    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState(0)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const chunkSize = isMobile ? 2 : 4
    const productChunks = products.reduce((resultArray: any[][], item, index) => {
        const chunkIndex = Math.floor(index / chunkSize);
        if (!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = [];
        }
        resultArray[chunkIndex].push(item);
        return resultArray;
    }, []);

    const slideNext = () => {
        if (productChunks.length <= 1) return
        setDirection(1)
        setCurrentIndex((prev) => (prev + 1) % productChunks.length)
    }

    const slidePrev = () => {
        if (productChunks.length <= 1) return
        setDirection(-1)
        setCurrentIndex((prev) => (prev - 1 + productChunks.length) % productChunks.length)
    }

    const handleDragEnd = (_: any, info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }) => {
        if (productChunks.length <= 1) return
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
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? '100%' : '-100%',
            opacity: 0
        })
    }

    return (
        <section className={cn("relative overflow-hidden py-1 md:py-2", className)}>
            <div className="relative z-10">
                {/* Header matching Baraka Section UI */}
                <div className="mb-2.5 md:mb-6">
                    {/* Mobile Top Row: Eyebrow + Controls */}
                    <div className="flex md:hidden items-center justify-between gap-2 mb-1.5">
                        {eyebrow && (
                            <div className="flex items-center gap-1.5 min-w-0">
                                <div className="w-5 h-[2px] bg-primary rounded-full shrink-0" />
                                <span className="text-primary font-black text-[8.5px] uppercase tracking-[0.25em] truncate">
                                    {eyebrow}
                                </span>
                            </div>
                        )}

                        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                            <div className="flex gap-1">
                                <button
                                    onClick={slidePrev}
                                    disabled={productChunks.length <= 1}
                                    className="w-7 h-7 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-xs text-[#1B1F3B] disabled:opacity-20 disabled:cursor-not-allowed active:scale-95"
                                    aria-label="Précédent"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={slideNext}
                                    disabled={productChunks.length <= 1}
                                    className="w-7 h-7 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-xs text-[#1B1F3B] disabled:opacity-20 disabled:cursor-not-allowed active:scale-95"
                                    aria-label="Suivant"
                                >
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {viewAllHref && (
                                <Link
                                    href={viewAllHref}
                                    className="w-7 h-7 rounded-lg bg-[#1B1F3B] text-white flex items-center justify-center shadow-sm active:scale-95 group/plus-premium transition-all hover:bg-primary"
                                    title="Voir tous les produits"
                                >
                                    <Plus className="w-3.5 h-3.5 transition-transform group-hover/plus-premium:rotate-90" strokeWidth={2.5} />
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Main Header Row: Title & Subtitle + Desktop Controls */}
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 md:gap-4">
                        <div className="flex flex-col gap-0.5 md:gap-2">
                            {/* Desktop Eyebrow */}
                            {eyebrow && (
                                <div className="hidden md:flex items-center gap-2">
                                    <div className="w-8 h-[2px] bg-primary rounded-full" />
                                    <span className="text-primary font-black text-[10px] uppercase tracking-[0.4em]">
                                        {eyebrow}
                                    </span>
                                </div>
                            )}

                            {/* Title: 100% full width, no truncation, no clipping */}
                            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-[#1B1F3B] uppercase tracking-tight leading-none">
                                {title}{' '}
                                {highlightedWord && (
                                    <span className="text-primary italic inline-block pr-1.5">{highlightedWord}</span>
                                )}
                            </h2>

                            {subtitle && (
                                <p className="text-slate-400 text-[10px] sm:text-xs md:text-sm font-medium mt-1 md:mt-1.5 max-w-sm md:max-w-xl leading-relaxed">
                                    {subtitle}
                                </p>
                            )}
                        </div>

                        {/* Desktop Controls */}
                        <div className="hidden md:flex items-center gap-2.5 shrink-0 self-end">
                            <div className="flex gap-2">
                                <button
                                    onClick={slidePrev}
                                    disabled={productChunks.length <= 1}
                                    className="w-11 h-11 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-xs md:shadow-sm hover:shadow-md transition-all text-[#1B1F3B] disabled:opacity-20 disabled:cursor-not-allowed active:scale-95"
                                    aria-label="Précédent"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={slideNext}
                                    disabled={productChunks.length <= 1}
                                    className="w-11 h-11 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-xs md:shadow-sm hover:shadow-md transition-all text-[#1B1F3B] disabled:opacity-20 disabled:cursor-not-allowed active:scale-95"
                                    aria-label="Suivant"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>

                            {viewAllHref && (
                                <Link
                                    href={viewAllHref}
                                    className="w-14 h-14 rounded-2xl bg-[#1B1F3B] text-white flex items-center justify-center shadow-xl shadow-black/10 active:scale-95 group/plus-premium transition-all hover:bg-primary"
                                    title="Voir tous les produits"
                                >
                                    <Plus className="w-7 h-7 transition-transform group-hover/plus-premium:rotate-90" strokeWidth={3} />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Carousel Content */}
                <div className="relative h-[272px] sm:h-[325px] md:h-[510px] mb-2 md:mb-5">
                    <AnimatePresence initial={false} custom={direction} mode="popLayout">
                        {productChunks.length > 0 ? (
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
                                className={cn(
                                    "absolute inset-0 grid touch-pan-y transform-gpu will-change-transform",
                                    isMobile ? "grid-cols-2 gap-2 sm:gap-3" : "grid-cols-4 gap-6 md:gap-8"
                                )}
                            >
                                {productChunks[currentIndex].map((product, idx) => (
                                    <ProductCard
                                        key={product.id || idx}
                                        product={product}
                                        priority={priority && currentIndex === 0 && idx < 4}
                                    />
                                ))}
                            </motion.div>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-3xl w-full">
                                    <p className="text-gray-400 font-black uppercase tracking-widest text-[10px] md:text-xs">
                                        Arrivage en cours...
                                    </p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Pagination Dots */}
                {productChunks.length > 1 && (
                    <div className="flex justify-center items-center gap-1.5 md:gap-2 pt-1 md:pt-3">
                        {productChunks.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setDirection(idx > currentIndex ? 1 : -1)
                                    setCurrentIndex(idx)
                                }}
                                className={cn(
                                    "h-1.5 rounded-full transition-all duration-300",
                                    currentIndex === idx ? "w-6 md:w-8 bg-primary" : "w-1.5 md:w-2 bg-gray-200 hover:bg-gray-300"
                                )}
                                aria-label={`Page ${idx + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}
