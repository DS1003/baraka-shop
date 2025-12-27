'use client'

import Link from 'next/link'
import { Home, Search, Heart, User, Grid } from 'lucide-react'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface MobileBottomNavProps {
    onMenuToggle: () => void
}

export default function MobileBottomNav({ onMenuToggle }: MobileBottomNavProps) {
    const pathname = usePathname()

    const navItems = [
        { icon: Home, label: 'Accueil', href: '/' },
        { icon: Grid, label: 'Rayons', onClick: onMenuToggle },
        { icon: Search, label: 'Rechercher', href: '/search' },
        { icon: Heart, label: 'Favoris', href: '/wishlist' },
        { icon: User, label: 'Compte', href: '/account' },
    ]

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-xl border-t border-gray-100 px-4 pb-safe pt-2 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
            <div className="flex items-center justify-between max-w-md mx-auto relative h-16">
                {navItems.map((item, idx) => {
                    const isActive = item.href ? pathname === item.href : false
                    const content = (
                        <div className="flex flex-col items-center gap-1 min-w-[64px] relative py-1 h-full w-full">
                            <motion.div
                                whileTap={{ scale: 0.9 }}
                                className={cn(
                                    "p-2 rounded-2xl transition-all duration-300",
                                    isActive ? "bg-black text-white shadow-lg -translate-y-1" : "text-gray-400"
                                )}>
                                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            </motion.div>
                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-tight transition-colors duration-300",
                                isActive ? "text-black" : "text-gray-400"
                            )}>
                                {item.label}
                            </span>

                            {isActive && (
                                <motion.div
                                    layoutId="bottom-nav-active-pill"
                                    className="absolute -top-1 w-1 h-1 rounded-full bg-black"
                                />
                            )}
                        </div>
                    )

                    return item.href ? (
                        <Link key={idx} href={item.href} className="flex-1">
                            {content}
                        </Link>
                    ) : (
                        <button key={idx} onClick={item.onClick} className="flex-1">
                            {content}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
