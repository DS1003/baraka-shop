'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/ui/Container'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, getOptimizedImageUrl } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

import { getCategoriesAction } from '@/lib/actions/product-actions'

const AUTOPLAY_DURATION = 5000 // 5 seconds

export function HomeSlider({ initialSlides }: { initialSlides?: any[] }) {
    const [slides, setSlides] = useState<any[]>(initialSlides || [])
    const [currentSlide, setCurrentSlide] = useState(0)
    const [loading, setLoading] = useState(!initialSlides)

    useEffect(() => {
        if (initialSlides) return

        const fetchSlides = async () => {
            setLoading(true)
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
            setLoading(false)
        }
        fetchSlides()
    }, [initialSlides])

    useEffect(() => {
        if (slides.length <= 1) return

        const timer = setTimeout(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length)
        }, AUTOPLAY_DURATION)

        return () => clearTimeout(timer)
    }, [currentSlide, slides.length])

    const handleTabClick = (index: number) => {
        setCurrentSlide(index)
    }

    if (loading || slides.length === 0) {
        return (
            <section>
                <div className="bg-gray-100 relative rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-sm aspect-[8/3] md:aspect-auto md:h-[480px] lg:h-[500px] flex items-center justify-center">
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
            setCurrentSlide((prev) => (prev + 1) % slides.length)
        } else if (isSwipeRight) {
            setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
        }
    }

    return (
        <section>
            <div className="bg-white relative rounded-2xl md:rounded-t-[2.5rem] md:rounded-b-none overflow-hidden shadow-sm aspect-[8/3] md:aspect-auto md:h-[480px] lg:h-[500px]">
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.15}
                        onDragEnd={handleDragEnd}
                        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-pan-y transform-gpu"
                    >
                        <Link href={slides[currentSlide].href} className="block w-full h-full overflow-hidden bg-white">
                            <Image
                                src={getOptimizedImageUrl(slides[currentSlide].image, 1400)}
                                alt={slides[currentSlide].title}
                                fill
                                sizes="(max-width: 768px) 100vw, 1400px"
                                className="object-cover md:hover:scale-105 transition-transform duration-[4000ms] ease-out pointer-events-none"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent hidden md:block" />
                        </Link>
                    </motion.div>
                </AnimatePresence>

                {/* Mobile Navigation Dots */}
                <div className="absolute bottom-2 sm:bottom-3 left-0 right-0 flex justify-center items-center gap-1.5 md:hidden z-20 pointer-events-none">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => handleTabClick(index)}
                            className={cn(
                                "h-1.5 rounded-full transition-all duration-300 pointer-events-auto shadow-sm",
                                currentSlide === index
                                    ? "bg-primary w-5"
                                    : "bg-black/30 backdrop-blur-xs w-1.5 border border-white/50"
                            )}
                            aria-label={`Slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            {/* LDLC Style Bottom Tabs - Responsive Grid - Hidden on Mobile */}
            <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border border-t-0 border-gray-100 bg-white rounded-b-2xl md:rounded-b-[2.5rem] overflow-hidden shadow-sm relative z-10">
                {slides.map((slide, index) => (
                    <button
                        key={slide.id}
                        onClick={() => handleTabClick(index)}
                        className={cn(
                            "relative py-4 px-2 text-center text-[10px] md:text-[11px] font-bold uppercase transition-all duration-300 h-16 md:h-20 flex items-center justify-center border-r border-gray-100 last:border-r-0",
                            currentSlide === index
                                ? "bg-gray-50 text-primary"
                                : "bg-white text-[#1B1F3B]/60 hover:bg-gray-50 hover:text-primary"
                        )}
                    >
                        <span className="relative z-10 leading-tight px-1">{slide.title}</span>

                        {/* Progress Bar */}
                        {currentSlide === index && (
                            <div
                                key={`progress-${currentSlide}`}
                                className="absolute bottom-0 left-0 h-[3px] bg-primary animate-slider-progress"
                            />
                        )}
                    </button>
                ))}
            </div>
        </section>
    )
}
