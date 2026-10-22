'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Home, ShoppingBag, Package, ShoppingCart, User } from 'reicon-react'
import { useCart } from '@/context/CartContext'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'

function MobileBottomNavInner() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { itemCount } = useCart()
    const { status } = useSession()
    const isLoggedIn = status === 'authenticated'

    // Masquer la barre sur le checkout, le panier (qui a son propre bouton fixe "Commander"),
    // la page produit (qui a sa barre d'achat fixe) et l'admin
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

    const currentTab = searchParams?.get('tab') || (pathname.startsWith('/account') ? 'orders' : null)

    const isOrdersActive =
        (pathname.startsWith('/account') && currentTab === 'orders') ||
        pathname.startsWith('/order-success') ||
        pathname.startsWith('/orders')

    const isAccountActive =
        (pathname.startsWith('/account') && currentTab !== 'orders') ||
        pathname.startsWith('/login') ||
        pathname.startsWith('/register')

    const isHomeActive = pathname === '/'
    const isShopActive = pathname.startsWith('/boutique') || pathname.startsWith('/category') || pathname.startsWith('/univers')
    const isCartActive = pathname.startsWith('/cart')

    return (
        <aside
            aria-label="Navigation mobile"
            className="fixed bottom-3 inset-x-0 z-40 md:hidden flex justify-center px-3 pointer-events-none pb-[env(safe-area-inset-bottom,0px)]"
        >
            <nav className="pointer-events-auto relative w-full max-w-[364px] bg-gradient-to-b from-white/80 via-white/70 to-white/60 backdrop-blur-2xl backdrop-saturate-[190%] rounded-full border border-white/80 shadow-[0_20px_45px_-10px_rgba(15,23,42,0.18),0_8px_24px_rgba(15,23,42,0.08),inset_0_1.5px_0_0_rgba(255,255,255,0.95),inset_0_-1px_1.5px_0_rgba(15,23,42,0.05)] px-2 py-1.5 grid grid-cols-5 items-center">
                {/* 1. Accueil */}
                <Link
                    href="/"
                    className="relative flex flex-col items-center justify-center py-0.5 select-none touch-manipulation group transition-transform active:scale-95"
                >
                    <div
                        className={cn(
                            "w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-200",
                            isHomeActive
                                ? "bg-[#1B1F3B] text-white shadow-[0_4px_14px_rgba(27,31,59,0.35),inset_0_1px_1px_rgba(255,255,255,0.25)]"
                                : "text-slate-500 group-hover:text-slate-700 group-hover:bg-white/40"
                        )}
                    >
                        <Home size={20} weight={isHomeActive ? "Filled" : "Outline"} className="transition-all" />
                    </div>
                    <span
                        className={cn(
                            "text-[10px] tracking-tight leading-none mt-1 transition-colors duration-200 text-center truncate max-w-full",
                            isHomeActive ? "text-[#1B1F3B] font-bold" : "text-slate-500 font-medium"
                        )}
                    >
                        Accueil
                    </span>
                </Link>

                {/* 2. Boutique */}
                <Link
                    href="/boutique"
                    className="relative flex flex-col items-center justify-center py-0.5 select-none touch-manipulation group transition-transform active:scale-95"
                >
                    <div
                        className={cn(
                            "w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-200",
                            isShopActive
                                ? "bg-[#1B1F3B] text-white shadow-[0_4px_14px_rgba(27,31,59,0.35),inset_0_1px_1px_rgba(255,255,255,0.25)]"
                                : "text-slate-500 group-hover:text-slate-700 group-hover:bg-white/40"
                        )}
                    >
                        <ShoppingBag size={20} weight={isShopActive ? "Filled" : "Outline"} className="transition-all" />
                    </div>
                    <span
                        className={cn(
                            "text-[10px] tracking-tight leading-none mt-1 transition-colors duration-200 text-center truncate max-w-full",
                            isShopActive ? "text-[#1B1F3B] font-bold" : "text-slate-500 font-medium"
                        )}
                    >
                        Boutique
                    </span>
                </Link>

                {/* 3. Panier (Parfaitement aligné dans la barre) */}
                <Link
                    href="/cart"
                    className="relative flex flex-col items-center justify-center py-0.5 select-none touch-manipulation group transition-transform active:scale-95"
                    aria-label={`Panier (${itemCount} article${itemCount > 1 ? 's' : ''})`}
                >
                    <div
                        className={cn(
                            "w-9 h-9 rounded-2xl flex items-center justify-center relative transition-all duration-200",
                            isCartActive
                                ? "bg-[#1B1F3B] text-white shadow-[0_4px_14px_rgba(27,31,59,0.35),inset_0_1px_1px_rgba(255,255,255,0.25)]"
                                : "text-slate-500 group-hover:text-slate-700 group-hover:bg-white/40"
                        )}
                    >
                        <ShoppingCart size={20} weight={isCartActive ? "Filled" : "Outline"} className="transition-all" />
                        {typeof itemCount === 'number' && itemCount > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white/95 shadow-[0_2px_8px_rgba(249,115,22,0.4)] pointer-events-none">
                                {itemCount > 99 ? '99+' : itemCount}
                            </span>
                        )}
                    </div>
                    <span
                        className={cn(
                            "text-[10px] tracking-tight leading-none mt-1 transition-colors duration-200 text-center truncate max-w-full",
                            isCartActive ? "text-[#1B1F3B] font-bold" : "text-slate-500 font-medium"
                        )}
                    >
                        Panier
                    </span>
                </Link>

                {/* 4. Commandes */}
                <Link
                    href={isLoggedIn ? '/account?tab=orders' : '/login?callbackUrl=%2Faccount%3Ftab%3Dorders'}
                    className="relative flex flex-col items-center justify-center py-0.5 select-none touch-manipulation group transition-transform active:scale-95"
                >
                    <div
                        className={cn(
                            "w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-200",
                            isOrdersActive
                                ? "bg-[#1B1F3B] text-white shadow-[0_4px_14px_rgba(27,31,59,0.35),inset_0_1px_1px_rgba(255,255,255,0.25)]"
                                : "text-slate-500 group-hover:text-slate-700 group-hover:bg-white/40"
                        )}
                    >
                        <Package size={20} weight={isOrdersActive ? "Filled" : "Outline"} className="transition-all" />
                    </div>
                    <span
                        className={cn(
                            "text-[10px] tracking-tight leading-none mt-1 transition-colors duration-200 text-center truncate max-w-full",
                            isOrdersActive ? "text-[#1B1F3B] font-bold" : "text-slate-500 font-medium"
                        )}
                    >
                        Commandes
                    </span>
                </Link>

                {/* 5. Compte */}
                <Link
                    href={isLoggedIn ? '/account?tab=profile' : '/login'}
                    className="relative flex flex-col items-center justify-center py-0.5 select-none touch-manipulation group transition-transform active:scale-95"
                >
                    <div
                        className={cn(
                            "w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-200",
                            isAccountActive
                                ? "bg-[#1B1F3B] text-white shadow-[0_4px_14px_rgba(27,31,59,0.35),inset_0_1px_1px_rgba(255,255,255,0.25)]"
                                : "text-slate-500 group-hover:text-slate-700 group-hover:bg-white/40"
                        )}
                    >
                        <User size={20} weight={isAccountActive ? "Filled" : "Outline"} className="transition-all" />
                    </div>
                    <span
                        className={cn(
                            "text-[10px] tracking-tight leading-none mt-1 transition-colors duration-200 text-center truncate max-w-full",
                            isAccountActive ? "text-[#1B1F3B] font-bold" : "text-slate-500 font-medium"
                        )}
                    >
                        Compte
                    </span>
                </Link>
            </nav>
        </aside>
    )
}

export function MobileBottomNav() {
    return (
        <Suspense fallback={null}>
            <MobileBottomNavInner />
        </Suspense>
    )
}
