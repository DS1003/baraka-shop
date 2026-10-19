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
            label: 'Compte',
            href: isLoggedIn ? '/account' : '/login',
            icon: User,
            isActive: pathname.startsWith('/account') || pathname.startsWith('/login') || pathname.startsWith('/register'),
        },
    ]

    return (
        <aside
            aria-label="Navigation mobile"
            className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/90 backdrop-blur-xl border-t border-slate-200/60 shadow-[0_-2px_12px_rgba(0,0,0,0.04)] pb-[max(0.35rem,env(safe-area-inset-bottom,0px))] pt-1"
        >
            <nav className="grid grid-cols-5 items-center max-w-md mx-auto px-1">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const active = item.isActive

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="relative flex flex-col items-center justify-center py-1 rounded-lg transition-transform duration-150 active:scale-95 select-none group min-h-[44px]"
                        >
                            {/* Icon with refined badge */}
                            <div className="relative flex items-center justify-center">
                                <Icon
                                    className={cn(
                                        "w-5 h-5 transition-all duration-200",
                                        active
                                            ? "text-primary stroke-[2.25] scale-105"
                                            : "text-slate-400 stroke-[1.65] group-hover:text-slate-600"
                                    )}
                                />
                                {typeof item.badge === 'number' && item.badge > 0 && (
                                    <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white shadow-xs pointer-events-none">
                                        {item.badge > 99 ? '99+' : item.badge}
                                    </span>
                                )}
                            </div>

                            {/* Clean Micro-Label */}
                            <span
                                className={cn(
                                    "text-[10px] tracking-tight leading-none mt-1 transition-colors duration-200 truncate max-w-full text-center",
                                    active
                                        ? "text-primary font-bold"
                                        : "text-slate-400 font-medium group-hover:text-slate-600"
                                )}
                            >
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}
