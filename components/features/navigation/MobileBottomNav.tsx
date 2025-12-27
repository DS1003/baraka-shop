'use client'

import Link from 'next/link'
import { Home, Search, Heart, User, LayoutGrid, Zap } from 'lucide-react'
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
        { icon: LayoutGrid, label: 'Rayons', onClick: onMenuToggle },
        { icon: Zap, label: 'Ventes', href: '/shop?tag=deals', special: true }, // Big Action in middle? 
        { icon: Heart, label: 'Favoris', href: '/wishlist' },
        { icon: User, label: 'Compte', href: '/account' },
    ]

    return (
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-[100]">
            <div className="bg-white/90 backdrop-blur-2xl border border-gray-100 rounded-[2.5rem] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center justify-between relative overflow-hidden">

                {/* Background active pill tracker - Animated */}
                {/* This is hard to do with the special middle button, so we'll use per-item indicators */}

                {navItems.map((item, idx) => {
                    const isActive = item.href ? pathname === item.href : false

                    if (item.special) {
                        return (
                            <Link key={idx} href={item.href || '#'} className="relative group">
                                <motion.div
                                    whileTap={{ scale: 0.9 }}
                                    className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-2xl relative z-10 -mt-10 border-4 border-[#f8f9fa] shadow-black/20"
                                >
                                    <item.icon size={24} strokeWidth={2.5} className="fill-white" />
                                    {/* Pulse effect */}
                                    <span className="absolute inset-0 rounded-full bg-black animate-ping opacity-20" />
                                </motion.div>
                                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-tighter text-black opacity-60">
                                    Flash
                                </span>
                            </Link>
                        )
                    }

                    return item.href ? (
                        <Link key={idx} href={item.href} className="flex-1">
                            <NavItem item={item} isActive={isActive} />
                        </Link>
                    ) : (
                        <button key={idx} onClick={item.onClick} className="flex-1">
                            <NavItem item={item} isActive={isActive} />
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

function NavItem({ item, isActive }: { item: any, isActive: boolean }) {
    return (
        <div className="flex flex-col items-center gap-1 group py-1 relative">
            <motion.div
                whileTap={{ scale: 0.85 }}
                className={cn(
                    "p-2.5 rounded-2xl transition-all duration-300",
                    isActive ? "text-primary bg-primary/5" : "text-gray-400 group-hover:text-black"
                )}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </motion.div>

            {isActive && (
                <motion.div
                    layoutId="mobile-nav-active-dot"
                    className="absolute bottom-0 w-1 h-1 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
            )}
        </div>
    )
}
