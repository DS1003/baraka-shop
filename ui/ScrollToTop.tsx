'use client'

import React, { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }

        window.addEventListener('scroll', toggleVisibility)
        return () => window.removeEventListener('scroll', toggleVisibility)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    onClick={scrollToTop}
                    className={cn(
                        "fixed bottom-8 right-8 z-[100]",
                        "w-12 h-12 md:w-14 md:h-14",
                        "bg-[#1B1F3B] text-white rounded-2xl shadow-2xl",
                        "flex items-center justify-center transition-all duration-300",
                        "hover:bg-primary hover:scale-110 active:scale-95 group",
                        "border border-white/10"
                    )}
                    aria-label="Retour en haut"
                >
                    <ArrowUp className="w-6 h-6 md:w-7 h-7 group-hover:-translate-y-1 transition-transform" strokeWidth={3} />

                    {/* Ring animation */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-primary/50 scale-100 opacity-0 group-hover:scale-125 group-hover:opacity-100 transition-all duration-500" />
                </motion.button>
            )}
        </AnimatePresence>
    )
}
