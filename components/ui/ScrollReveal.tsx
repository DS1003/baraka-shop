'use client'

import { useRef } from 'react'
import { motion, useInView, Variant } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ScrollRevealProps {
    children: React.ReactNode
    className?: string
    delay?: number
    direction?: 'up' | 'down' | 'left' | 'right'
}

export function ScrollReveal({ children, className, delay = 0, direction = 'up' }: ScrollRevealProps) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-50px" })

    const variants = {
        hidden: {
            opacity: 0,
            y: direction === 'up' ? 40 : direction === 'down' ? -40 : 0,
            x: direction === 'left' ? 40 : direction === 'right' ? -40 : 0
        },
        visible: {
            opacity: 1,
            y: 0,
            x: 0,
            transition: {
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1] as const, // Custombezier for "smooth" feel
                delay: delay
            }
        }
    }

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={variants}
            className={cn(className)}
        >
            {children}
        </motion.div>
    )
}
