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
            className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] pt-1 px-2"
        >
            <nav className="grid grid-cols-5 items-center max-w-md mx-auto">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const active = item.isActive

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 active:scale-90 select-none group",
                                active ? "text-primary" : "text-gray-400 hover:text-gray-700"
                            )}
                        >
                            {/* Icon Container with Badge */}
                            <div className="relative flex items-center justify-center w-7 h-7">
                                <Icon
                                    className={cn(
                                        "w-5 h-5 transition-transform duration-200",
                                        active ? "scale-110 stroke-[2.4]" : "stroke-[1.8] group-hover:scale-105"
                                    )}
                                />
                                {typeof item.badge === 'number' && item.badge > 0 && (
                                    <span className="absolute -top-1 -right-2.5 min-w-[18px] h-[18px] px-1 bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
                                        {item.badge > 99 ? '99+' : item.badge}
                                    </span>
                                )}
                            </div>

                            {/* Label */}
                            <span
                                className={cn(
                                    "text-[10px] tracking-tight mt-0.5 transition-all line-clamp-1 text-center font-bold",
                                    active ? "text-primary font-black" : "text-gray-500 font-semibold"
                                )}
                            >
                                {item.label}
                            </span>

                            {/* Active subtle indicator dot */}
                            {active && (
                                <span className="absolute bottom-0 w-1 h-1 rounded-full bg-primary" />
                            )}
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}
