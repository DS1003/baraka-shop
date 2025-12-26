'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface AnimatedLinkProps {
    href: string
    children: React.ReactNode
    className?: string
}

export const AnimatedLink = ({ href, children, className }: AnimatedLinkProps) => {
    return (
        <Link href={href} className={cn("relative group block font-medium", className)}>
            <span className="relative z-10 block group-hover:-translate-y-1 transition-transform duration-300">
                {children}
            </span>
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </Link>
    )
}

export const ShinyText = ({ text, className }: { text: string, className?: string }) => {
    return (
        <div className={cn("relative inline-block overflow-hidden", className)}>
            <span className="relative z-10 block bg-gradient-to-r from-foreground via-gray-400 to-foreground bg-clip-text text-transparent bg-[200%_auto] animate-shine">
                {text}
            </span>
        </div>
    )
}

export const MagneticIcon = ({ children }: { children: React.ReactNode }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.2, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="cursor-pointer"
        >
            {children}
        </motion.div>
    )
}
