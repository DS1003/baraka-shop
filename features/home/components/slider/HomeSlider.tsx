'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/ui/Container'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Slide {
    id: number
    image: string
    title: string
    href: string
}

const slides: Slide[] = [
    { id: 1, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2000&auto=format&fit=crop", title: "NOS OFFRES", href: "/promotions" },
    { id: 2, image: "https://media.ldlc.com/encart/p/28828_b.jpg", title: "QUI LES VEUX ?", href: "/boutique" },
    { id: 3, image: "https://media.ldlc.com/encart/p/28829_b.jpg", title: "L'OFFRE IMMANQUABLE", href: "/promotions" },
    { id: 4, image: "https://media.ldlc.com/encart/p/22889_b.jpg", title: "TÉLÉCHARGEZ L'APPLI !", href: "/" },
    { id: 5, image: "https://media.ldlc.com/encart/p/28858_b.jpg", title: "VOTRE IPAD À TAUX 0 %", href: "/boutique?brand=apple" },
    { id: 6, image: "https://media.ldlc.com/encart/p/26671_b.jpg", title: "DEMANDEZ UNE REPRISE", href: "/contact" }
]

const AUTOPLAY_DURATION = 5000 // 5 seconds

export function HomeSlider() {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [progress, setProgress] = useState(0)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const startTimeRef = useRef<number>(Date.now())

    useEffect(() => {
        startTimer()
        return () => stopTimer()
    }, [currentSlide])

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
        setCurrentSlide((prev) => (prev + 1) % slides.length)
    }

    const handleTabClick = (index: number) => {
        setCurrentSlide(index)
    }

    return (
        <section className="bg-[#f2f2f2] pb-6 md:pb-8 pt-0 md:pt-4">
            <Container className="px-0 md:px-6 lg:px-8">
                <div className="bg-white relative rounded-none md:rounded-xl overflow-hidden shadow-sm h-[200px] sm:h-[300px] md:h-[450px]">
                    <AnimatePresence mode="wait">
                        <Link href={slides[currentSlide].href} className="block w-full h-full cursor-pointer overflow-hidden bg-gray-50">
                            <motion.div
                                key={currentSlide}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.5 }}
                                className="absolute inset-0 w-full h-full"
                            >
                                <Image
                                    src={slides[currentSlide].image}
                                    alt={slides[currentSlide].title}
                                    fill
                                    className="object-contain md:object-cover hover:scale-105 transition-transform duration-[2000ms]"
                                    priority
                                />
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
                <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border-x-0 md:border-x border-b border-gray-200 bg-[#f8f8f8] rounded-none md:rounded-b-xl overflow-hidden">
                    {slides.map((slide, index) => (
                        <button
                            key={slide.id}
                            onClick={() => handleTabClick(index)}
                            className={cn(
                                "relative py-3 px-2 text-center text-[9px] md:text-[11px] font-bold uppercase transition-all duration-300 h-14 md:h-16 flex items-center justify-center border-r border-b border-black/5 last:border-r-0 sm:border-b-0",
                                currentSlide === index
                                    ? "bg-primary text-white"
                                    : "bg-[#f8f8f8] text-[#555] hover:bg-gray-100"
                            )}
                        >
                            <span className="relative z-10 leading-tight px-1">{slide.title}</span>

                            {/* Progress Bar */}
                            {currentSlide === index && (
                                <div className="absolute bottom-0 left-0 h-[3px] bg-white opacity-40 transition-all duration-100 ease-linear"
                                    style={{ width: `${progress}%` }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </Container>
        </section>
    )
}
