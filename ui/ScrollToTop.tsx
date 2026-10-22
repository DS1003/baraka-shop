'use client'

import React, { useState, useEffect } from 'react'
import { ArrowUp } from 'reicon-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'

export function ScrollToTop() {
    const pathname = usePathname()
    const [isVisible, setIsVisible] = useState(false)
    const [scrollProgress, setScrollProgress] = useState(0)

    useEffect(() => {
        let ticking = false
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const totalHeight = document.documentElement.scrollHeight - window.innerHeight
                    if (totalHeight > 0) {
                        const currentProgress = (window.scrollY / totalHeight) * 100
                        setScrollProgress(Math.min(100, Math.max(0, currentProgress)))
                    }

                    setIsVisible(window.scrollY > 280)
                    ticking = false
                })
                ticking = true
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll()
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    if (
        pathname?.startsWith('/admin') ||
        pathname === '/maintenance' ||
        pathname?.startsWith('/cart') ||
        pathname?.startsWith('/checkout') ||
        pathname?.startsWith('/order-success')
    ) {
        return null
    }

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    }

    const radius = 21
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (scrollProgress / 100) * circumference

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.7, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.7, y: 15 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    onClick={scrollToTop}
                    className={cn(
                        "fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[90]",
                        "w-11 h-11 md:w-13 md:h-13",
                        "bg-[#1B1F3B] text-white rounded-full shadow-[0_10px_25px_rgba(27,31,59,0.35)]",
                        "hidden md:flex items-center justify-center transition-all duration-300",
                        "hover:shadow-[0_15px_30px_rgba(232,98,26,0.35)] hover:scale-105 active:scale-95 group",
                        "border border-white/10 cursor-pointer select-none"
                    )}
                    aria-label="Retour en haut de page"
                >
                    {/* SVG Circular Progress Track & Fill */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-1" viewBox="0 0 52 52">
                        <circle
                            cx="26"
                            cy="26"
                            r={radius}
                            stroke="rgba(255, 255, 255, 0.15)"
                            strokeWidth="2.5"
                            fill="transparent"
                        />
                        <circle
                            cx="26"
                            cy="26"
                            r={radius}
                            stroke="#E8621A"
                            strokeWidth="2.5"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className="transition-all duration-150 ease-out"
                        />
                    </svg>

                    <ArrowUp className="w-5 h-5 text-white group-hover:-translate-y-0.5 group-hover:text-orange-400 transition-all duration-200" strokeWidth={2.5} />
                </motion.button>
            )}
        </AnimatePresence>
    )
}
