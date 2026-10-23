'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
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

/**
 * Hook de glissement fluide à la souris et au doigt
 * Permet de glisser avec le doigt sur smartphone tout en autorisant le drag souris dans Chrome DevTools
 */
function useDragToScroll() {
    const isDown = useRef(false)
    const startX = useRef(0)
    const scrollLeft = useRef(0)
    const hasDragged = useRef(false)

    const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.button !== 0) return
        const el = e.currentTarget
        isDown.current = true
        hasDragged.current = false
        startX.current = e.pageX - el.offsetLeft
        scrollLeft.current = el.scrollLeft
    }

    const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDown.current) return
        const el = e.currentTarget
        const x = e.pageX - el.offsetLeft
        const walk = (x - startX.current) * 1.3
        if (Math.abs(walk) > 4) {
            hasDragged.current = true
            el.scrollLeft = scrollLeft.current - walk
        }
    }

    const onMouseUp = () => {
        isDown.current = false
        setTimeout(() => {
            hasDragged.current = false
        }, 80)
    }

    const onClickCapture = (e: React.MouseEvent) => {
        if (hasDragged.current) {
            e.preventDefault()
            e.stopPropagation()
        }
    }

    return {
        onMouseDown,
        onMouseMove,
        onMouseUp,
        onMouseLeave: onMouseUp,
        onClickCapture
    }
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

    const mobileScrollRef = useRef<HTMLDivElement>(null)
    const desktopScrollRef = useRef<HTMLDivElement>(null)

    const mobileDrag = useDragToScroll()
    const desktopDrag = useDragToScroll()

    const slideNext = () => {
        if (mobileScrollRef.current) {
            const first = mobileScrollRef.current.firstElementChild as HTMLElement
            const stride = first ? first.offsetWidth + 12 : 172
            mobileScrollRef.current.scrollBy({ left: stride * 1.5, behavior: 'smooth' })
        }
        if (desktopScrollRef.current) {
            const stride = desktopScrollRef.current.clientWidth * 0.8
            desktopScrollRef.current.scrollBy({ left: stride, behavior: 'smooth' })
        }
    }

    const slidePrev = () => {
        if (mobileScrollRef.current) {
            const first = mobileScrollRef.current.firstElementChild as HTMLElement
            const stride = first ? first.offsetWidth + 12 : 172
            mobileScrollRef.current.scrollBy({ left: -stride * 1.5, behavior: 'smooth' })
        }
        if (desktopScrollRef.current) {
            const stride = desktopScrollRef.current.clientWidth * 0.8
            desktopScrollRef.current.scrollBy({ left: -stride, behavior: 'smooth' })
        }
    }

    return (
        <section className={cn("relative overflow-hidden py-1 md:py-3 select-none", className)}>
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
                                    disabled={products.length <= 1}
                                    className="w-7 h-7 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-xs text-[#1B1F3B] disabled:opacity-20 disabled:cursor-not-allowed active:scale-95 cursor-pointer"
                                    aria-label="Précédent"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={slideNext}
                                    disabled={products.length <= 1}
                                    className="w-7 h-7 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-xs text-[#1B1F3B] disabled:opacity-20 disabled:cursor-not-allowed active:scale-95 cursor-pointer"
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
                                    disabled={products.length <= 1}
                                    className="w-11 h-11 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-xs md:shadow-sm hover:shadow-md transition-all text-[#1B1F3B] disabled:opacity-20 disabled:cursor-not-allowed active:scale-95 cursor-pointer"
                                    aria-label="Précédent"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={slideNext}
                                    disabled={products.length <= 1}
                                    className="w-11 h-11 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-xs md:shadow-sm hover:shadow-md transition-all text-[#1B1F3B] disabled:opacity-20 disabled:cursor-not-allowed active:scale-95 cursor-pointer"
                                    aria-label="Suivant"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>

                            {viewAllHref && (
                                <Link
                                    href={viewAllHref}
                                    className="w-14 h-14 rounded-2xl bg-[#1B1F3B] text-white flex items-center justify-center shadow-xl shadow-black/10 active:scale-95 group/plus-premium transition-all hover:bg-primary cursor-pointer"
                                    title="Voir tous les produits"
                                >
                                    <Plus className="w-7 h-7 transition-transform group-hover/plus-premium:rotate-90" strokeWidth={3} />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Empty State */}
                {products.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-3xl w-full">
                        <p className="text-gray-400 font-black uppercase tracking-widest text-[10px] md:text-xs">
                            Arrivage en cours...
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Carousel Rail (Smooth hardware accelerated + Drag to scroll) */}
                        <div
                            ref={desktopScrollRef}
                            className="hidden md:flex items-stretch gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-2 scroll-pl-1 cursor-grab active:cursor-grabbing select-none"
                            style={{
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                                WebkitOverflowScrolling: 'touch',
                                touchAction: 'pan-x pan-y'
                            }}
                            {...desktopDrag}
                        >
                            {products.map((product, idx) => (
                                <div key={product.id || idx} className="w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] shrink-0 snap-start">
                                    <ProductCard
                                        product={product}
                                        priority={priority && idx < 4}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Mobile Snap-Scroll Rail (Same smooth finger swipe as Univers Populaires) */}
                        <div className="md:hidden">
                            <div
                                ref={mobileScrollRef}
                                className="flex items-stretch gap-3 overflow-x-auto overflow-y-hidden snap-x snap-mandatory no-scrollbar py-2 -mx-4 px-4 overscroll-x-contain scroll-pl-4 scroll-pr-4 transform-gpu cursor-grab active:cursor-grabbing select-none"
                                style={{
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none',
                                    WebkitOverflowScrolling: 'touch',
                                    touchAction: 'pan-x pan-y'
                                }}
                                {...mobileDrag}
                            >
                                {products.map((product, idx) => (
                                    <div key={product.id || idx} className="w-[160px] sm:w-[180px] shrink-0 snap-start">
                                        <ProductCard
                                            product={product}
                                            priority={priority && idx < 2}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </section>
    )
}
