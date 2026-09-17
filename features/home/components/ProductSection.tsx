'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
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
}

export function ProductSection({
    eyebrow,
    title,
    highlightedWord,
    subtitle,
    products = [],
    viewAllHref = '/boutique',
    priority = false,
    className
}: ProductSectionProps) {
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
        <section className={cn("relative overflow-hidden py-4 md:py-6", className)}>
            <div className="relative z-10">
                {/* Header matching Baraka Section UI */}
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-8 md:mb-10">
                    <div className="flex flex-col gap-1.5 md:gap-2">
                        {eyebrow && (
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-[2px] bg-primary rounded-full" />
                                <span className="text-primary font-black text-[9px] md:text-[10px] uppercase tracking-[0.4em]">
                                    {eyebrow}
                                </span>
                            </div>
                        )}
                        <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-[#1B1F3B] uppercase tracking-tighter leading-none">
                            {title}{' '}
                            {highlightedWord && (
                                <span className="text-primary italic">{highlightedWord}</span>
                            )}
                        </h2>
                        {subtitle && (
                            <p className="text-slate-400 text-[11px] sm:text-xs md:text-sm font-medium mt-1 md:mt-1.5 max-w-sm md:max-w-xl leading-relaxed">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    {/* Navigation Controls */}
                    <div className="flex items-center gap-3 self-stretch md:self-end justify-end">
                        <div className="flex gap-2">
                            <button
                                onClick={slidePrev}
                                disabled={productChunks.length <= 1}
                                className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm hover:shadow-md transition-all text-[#1B1F3B] disabled:opacity-20 disabled:cursor-not-allowed"
                                aria-label="Précédent"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={slideNext}
                                disabled={productChunks.length <= 1}
                                className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm hover:shadow-md transition-all text-[#1B1F3B] disabled:opacity-20 disabled:cursor-not-allowed"
                                aria-label="Suivant"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                        {viewAllHref && (
                            <Link
                                href={viewAllHref}
                                className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#1B1F3B] text-white flex items-center justify-center shadow-xl shadow-black/10 active:scale-95 group/plus-premium transition-all hover:bg-primary"
                                title="Voir tous les produits"
                            >
                                <Plus className="w-6 h-6 md:w-7 md:h-7 transition-transform group-hover/plus-premium:rotate-90" strokeWidth={3} />
                            </Link>
                        )}
                    </div>
                </div>

                {/* Carousel Content */}
                <div className="relative h-[390px] md:h-[540px] mb-4 md:mb-6">
                    <AnimatePresence initial={false} custom={direction} mode="wait">
                        {productChunks.length > 0 ? (
                            <motion.div
                                key={currentIndex}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: "spring", stiffness: 200, damping: 25 },
                                    opacity: { duration: 0.3 }
                                }}
                                className={cn(
                                    "absolute inset-0 grid gap-4 md:gap-8",
                                    isMobile ? "grid-cols-2" : "grid-cols-4"
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
                    <div className="flex justify-center items-center gap-2 pt-2 md:pt-4">
                        {productChunks.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setDirection(idx > currentIndex ? 1 : -1)
                                    setCurrentIndex(idx)
                                }}
                                className={cn(
                                    "h-1.5 rounded-full transition-all duration-500",
                                    currentIndex === idx ? "w-8 bg-primary" : "w-2 bg-gray-200 hover:bg-gray-300"
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
