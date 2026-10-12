'use client'

import React, { useEffect, useState } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { usePathname } from 'next/navigation'

export function ScrollProgressBar() {
    const pathname = usePathname()
    const [mounted, setMounted] = useState(false)
    const { scrollYProgress } = useScroll()
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    })

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    if (
        pathname?.startsWith('/admin') ||
        pathname === '/maintenance' ||
        pathname?.startsWith('/checkout')
    ) {
        return null
    }

    return (
        <motion.div
            style={{ scaleX }}
            className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-orange-500 via-[#E8621A] to-amber-400 origin-left z-[9999] pointer-events-none shadow-[0_1px_8px_rgba(232,98,26,0.5)]"
        />
    )
}
