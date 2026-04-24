'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/ui/Container'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

import { getCategoriesAction } from '@/lib/actions/product-actions'

const AUTOPLAY_DURATION = 5000 // 5 seconds

export function HomeSlider({ initialSlides }: { initialSlides?: any[] }) {
    const [slides, setSlides] = useState<any[]>(initialSlides || [])
    const [currentSlide, setCurrentSlide] = useState(0)
    const [progress, setProgress] = useState(0)
    const [loading, setLoading] = useState(!initialSlides)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const startTimeRef = useRef<number>(Date.now())

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
        if (slides.length > 0) {
            startTimer()
        }
        return () => stopTimer()
    }, [currentSlide, slides])

    const startTimer = () => {
        stopTimer()
        startTimeRef.current = Date.now()
        setProgress(0)

        timerRef.current = setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current
            const newProgress = Math.min((elapsed / AUTOPLAY_DURATION) * 100, 100)
            setProgress(newProgress)

            if (newProgress >= 100) {
                nextSlide()
            }
        }, 30) // Update every 30ms for smooth progress
    }

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
        }
    }

    const nextSlide = () => {
        if (slides.length === 0) return
        setCurrentSlide((prev) => (prev + 1) % slides.length)
    }

    const handleTabClick = (index: number) => {
        setCurrentSlide(index)
    }

    if (loading || slides.length === 0) {
        return (
            <section>
                <div className="bg-gray-100 relative rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-sm h-[200px] sm:h-[300px] md:h-[500px] flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            </section>
        )
    }

    return (
        <section>
            <div className="bg-white relative rounded-t-2xl md:rounded-t-[2.5rem] rounded-b-none overflow-hidden shadow-sm h-[200px] sm:h-[300px] md:h-[500px]">
                <AnimatePresence mode="wait">
                    <Link href={slides[currentSlide].href} className="block w-full h-full cursor-pointer overflow-hidden bg-gray-50">
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="absolute inset-0 w-full h-full"
                        >
                            <Image
                                src={slides[currentSlide].image}
                                alt={slides[currentSlide].title}
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-[4000ms] ease-out"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent hidden md:block" />
                        </motion.div>
                    </Link>
                </AnimatePresence>

                {/* Mobile Navigation Dots */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 md:hidden z-20">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => handleTabClick(index)}
                            className={cn(
                                "w-2 h-2 rounded-full transition-all duration-300",
                                currentSlide === index ? "bg-primary w-6" : "bg-white/50"
                            )}
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
                            <div className="absolute bottom-0 left-0 h-[3px] bg-primary transition-all duration-100 ease-linear"
                                style={{ width: `${progress}%` }}
                            />
                        )}
                    </button>
                ))}
            </div>
        </section>
    )
}
