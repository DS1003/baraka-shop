'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, getOptimizedImageUrl } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { ChevronLeft, ChevronRight } from 'reicon-react'
import { getCategoriesAction } from '@/lib/actions/product-actions'

const AUTOPLAY_DURATION = 5000 // 5 seconds

interface SlideItem {
    id: string | number
    image: string
    title: string
    href: string
}

export function HomeSlider({ initialSlides }: { initialSlides?: SlideItem[] }) {
    const [slides, setSlides] = useState<SlideItem[]>(initialSlides || [])
    const [currentSlide, setCurrentSlide] = useState(0)
    const [loading, setLoading] = useState(!initialSlides)
    const [isPaused, setIsPaused] = useState(false)
    const [direction, setDirection] = useState<1 | -1>(1)

    useEffect(() => {
        if (initialSlides && initialSlides.length > 0) return

        const fetchSlides = async () => {
            setLoading(true)
            try {
                const result = await getCategoriesAction()
                const formattedSlides = result.slice(0, 6).map((cat: any) => ({
                    id: cat.id,
                    image: cat.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
                    title: cat.name,
                    href: `/boutique?category=${cat.slug}`
                }))
                if (formattedSlides.length === 0) {
                    setSlides([{ id: 1, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e", title: "Bienvenue", href: "/boutique" }])
                } else {
                    setSlides(formattedSlides)
                }
            } catch (err) {
                console.error("Failed to load slider categories:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchSlides()
    }, [initialSlides])

    const nextSlide = useCallback(() => {
        if (slides.length <= 1) return
        setDirection(1)
        setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, [slides.length])

    const prevSlide = useCallback(() => {
        if (slides.length <= 1) return
        setDirection(-1)
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    }, [slides.length])

    const goToSlide = (index: number) => {
        if (index === currentSlide) return
        setDirection(index > currentSlide ? 1 : -1)
        setCurrentSlide(index)
    }

    // Autoplay timer with pause-on-hover
    useEffect(() => {
        if (slides.length <= 1 || isPaused) return

        const timer = setTimeout(() => {
            nextSlide()
        }, AUTOPLAY_DURATION)

        return () => clearTimeout(timer)
    }, [currentSlide, slides.length, isPaused, nextSlide])

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') prevSlide()
            if (e.key === 'ArrowRight') nextSlide()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [nextSlide, prevSlide])

    if (loading || slides.length === 0) {
        return (
            <section aria-label="Bannière principale Baraka Shop">
                <div className="bg-slate-100 relative rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-xs aspect-[2.3/1] sm:aspect-[2.4/1] md:aspect-[2.4/1] lg:aspect-auto lg:h-[460px] xl:h-[500px] flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            </section>
        )
    }

    const handleDragEnd = (_: any, info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }) => {
        if (slides.length <= 1) return
        const isSwipeLeft = info.offset.x < -35 || (info.offset.x < -10 && info.velocity.x < -150)
        const isSwipeRight = info.offset.x > 35 || (info.offset.x > 10 && info.velocity.x > 150)
        if (isSwipeLeft) {
            nextSlide()
        } else if (isSwipeRight) {
            prevSlide()
        }
    }

    const activeSlide = slides[currentSlide]

    return (
        <section
            aria-label="Bannière promotionnelle Baraka Shop"
            className="group relative select-none"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Main Slide Stage */}
            <div className="bg-slate-900 relative rounded-2xl md:rounded-t-[2.5rem] md:rounded-b-none overflow-hidden shadow-sm aspect-[2.2/1] sm:aspect-[2.35/1] md:aspect-[2.4/1] lg:aspect-auto lg:h-[460px] xl:h-[500px]">
                <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, scale: 1.015 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.985 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.15}
                        onDragEnd={handleDragEnd}
                        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-pan-y transform-gpu"
                    >
                        <Link
                            href={activeSlide.href}
                            className="block w-full h-full overflow-hidden bg-slate-900 relative"
                            tabIndex={0}
                        >
                            <Image
                                src={getOptimizedImageUrl(activeSlide.image, 1600)}
                                alt={activeSlide.title || "Promotion Baraka Shop"}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1600px"
                                className="object-cover object-center transition-transform duration-[4000ms] ease-out pointer-events-none group-hover:scale-[1.015]"
                                priority
                            />
                            {/* Ambient subtle vignette */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10 md:bg-gradient-to-r md:from-black/15 md:via-transparent md:to-transparent pointer-events-none" />
                        </Link>
                    </motion.div>
                </AnimatePresence>

                {/* Minimalist Floating Navigation Arrows (Reicon) */}
                {slides.length > 1 && (
                    <div className="hidden md:flex absolute inset-y-0 left-0 right-0 items-center justify-between px-4 lg:px-6 pointer-events-none z-30">
                        {/* Prev Button */}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                prevSlide()
                            }}
                            aria-label="Slide précédente"
                            className="pointer-events-auto w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-white/75 hover:bg-white text-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.12)] backdrop-blur-xl border border-white/60 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 hover:scale-105 active:scale-95 cursor-pointer focus:opacity-100 focus:outline-hidden"
                        >
                            <ChevronLeft className="w-5 h-5 text-slate-900" strokeWidth={1.8} />
                        </button>

                        {/* Next Button */}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                nextSlide()
                            }}
                            aria-label="Slide suivante"
                            className="pointer-events-auto w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-white/75 hover:bg-white text-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.12)] backdrop-blur-xl border border-white/60 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 hover:scale-105 active:scale-95 cursor-pointer focus:opacity-100 focus:outline-hidden"
                        >
                            <ChevronRight className="w-5 h-5 text-slate-900" strokeWidth={1.8} />
                        </button>
                    </div>
                )}

                {/* Mobile Floating Badge & Pagination */}
                <div className="absolute top-3 left-3 md:hidden z-20 pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-white text-[11px] font-semibold tracking-wide uppercase shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        {activeSlide.title}
                    </span>
                </div>

                {/* Mobile Minimalist Dots */}
                <div className="absolute bottom-3 left-0 right-0 flex justify-center items-center gap-1.5 md:hidden z-20 pointer-events-none">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={cn(
                                "h-1 rounded-full transition-all duration-300 pointer-events-auto shadow-xs",
                                currentSlide === index
                                    ? "bg-primary w-5"
                                    : "bg-white/60 backdrop-blur-xs w-1.5 hover:bg-white"
                            )}
                            aria-label={`Slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            {/* Apple / Studio Minimalist Navigation Dock */}
            <nav
                aria-label="Navigation des univers"
                className="hidden md:grid grid-cols-3 lg:grid-cols-6 items-center px-3 lg:px-6 py-3.5 bg-white rounded-b-2xl md:rounded-b-[2.5rem] border border-t-0 border-slate-100/90 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.03)] relative z-10"
            >
                {slides.map((slide, index) => {
                    const isActive = currentSlide === index

                    return (
                        <button
                            key={slide.id}
                            type="button"
                            onClick={() => goToSlide(index)}
                            className="group/tab relative py-1.5 px-2.5 flex flex-col items-center justify-center cursor-pointer outline-hidden transition-all text-center"
                        >
                            {/* Category Title */}
                            <span
                                className={cn(
                                    "text-[11px] lg:text-[11.5px] uppercase tracking-[0.08em] transition-all duration-200 line-clamp-1 select-none",
                                    isActive
                                        ? "font-bold text-slate-900"
                                        : "font-semibold text-slate-400 group-hover/tab:text-slate-700"
                                )}
                            >
                                {slide.title}
                            </span>

                            {/* Ultra-pure hairline progress track */}
                            <div className="w-full max-w-[90px] h-[2px] bg-slate-100 group-hover/tab:bg-slate-200/80 rounded-full overflow-hidden mt-2 transition-colors">
                                {isActive ? (
                                    <div
                                        key={`progress-${currentSlide}-${isPaused ? 'paused' : 'running'}`}
                                        className={cn(
                                            "h-full bg-primary rounded-full animate-slider-progress",
                                            isPaused && "style-pause"
                                        )}
                                        style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
                                    />
                                ) : null}
                            </div>
                        </button>
                    )
                })}
            </nav>
        </section>
    )
}
