'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, LayoutGrid, ShoppingCart, User } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'

export function MobileBottomNav() {
    const pathname = usePathname()
    const { itemCount } = useCart()
    const { status } = useSession()
    const isLoggedIn = status === 'authenticated'

    // Hide bottom nav on checkout, cart (has its own floating bar), and product page (has its sticky buy bar)
    if (
        !pathname ||
        pathname.startsWith('/admin') ||
        pathname.startsWith('/checkout') ||
        pathname.startsWith('/product/') ||
        pathname.startsWith('/cart') ||
        pathname === '/maintenance'
    ) {
        return null
    }

    const navItems = [
        {
            label: 'Accueil',
            href: '/',
            icon: Home,
            isActive: pathname === '/',
        },
        {
            label: 'Boutique',
            href: '/boutique',
            icon: ShoppingBag,
            isActive: pathname.startsWith('/boutique') || pathname.startsWith('/category'),
        },
        {
            label: 'Univers',
            href: '/univers',
            icon: LayoutGrid,
            isActive: pathname.startsWith('/univers'),
        },
        {
            label: 'Panier',
            href: '/cart',
            icon: ShoppingCart,
            isActive: pathname.startsWith('/cart'),
            badge: itemCount,
        },
        {
            label: isLoggedIn ? 'Compte' : 'Connexion',
            href: isLoggedIn ? '/account' : '/login',
            icon: User,
            isActive: pathname.startsWith('/account') || pathname.startsWith('/login') || pathname.startsWith('/register'),
        },
    ]

    return (
        <aside
            aria-label="Navigation mobile"
            className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-2xl border-t border-slate-100 shadow-[0_-8px_30px_rgba(27,31,59,0.08)] pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] pt-1.5 px-2"
        >
            <nav className="grid grid-cols-5 items-center max-w-md mx-auto">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const active = item.isActive

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="relative flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 active:scale-90 select-none group"
                        >
                            {/* Icon Container with Capsule Spotlight */}
                            <div className="relative flex items-center justify-center">
                                <div
                                    className={cn(
                                        "flex items-center justify-center w-11 h-7 rounded-full transition-all duration-300",
                                        active
                                            ? "bg-primary/10 text-primary shadow-xs ring-1 ring-primary/20 scale-105"
                                            : "text-slate-400 group-hover:text-slate-600 group-hover:bg-slate-100/60"
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            "w-5 h-5 transition-transform duration-200",
                                            active ? "stroke-[2.4]" : "stroke-[1.8] group-hover:scale-105"
                                        )}
                                    />
                                </div>
                                {typeof item.badge === 'number' && item.badge > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-primary to-orange-600 text-white text-[9.5px] font-black rounded-full flex items-center justify-center ring-2 ring-white shadow-xs shadow-primary/30">
                                        {item.badge > 99 ? '99+' : item.badge}
                                    </span>
                                )}
                            </div>

                            {/* Label */}
                            <span
                                className={cn(
                                    "text-[10px] tracking-tight mt-1 transition-colors line-clamp-1 text-center",
                                    active ? "text-primary font-black" : "text-slate-500 font-semibold group-hover:text-slate-700"
                                )}
                            >
                                {item.label}
                            </span>

                            {/* Active subtle indicator pill (stable height to prevent jitter) */}
                            <div className="h-1 mt-0.5 flex items-center justify-center">
                                {active && (
                                    <span className="w-3.5 h-1 rounded-full bg-primary shadow-xs shadow-primary/40 animate-in fade-in zoom-in-75 duration-200" />
                                )}
                            </div>
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}
