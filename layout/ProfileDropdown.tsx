'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
    User,
    Category as LayoutDashboard,
    ShoppingBag,
    Package,
    BoxTick as PackageCheck,
    Heart,
    Logout as LogOut,
    Login as LogIn,
    UserAdd as UserPlus,
    ChevronRight,
    Location as MapPin,
    InfoCircle as HelpCircle
} from 'reicon-react'
import { cn } from '@/lib/utils'
import { signOut } from 'next-auth/react'

interface ProfileDropdownProps {
    isLoggedIn: boolean
    session: any
    isMobile?: boolean
}

export function ProfileDropdown({ isLoggedIn, session, isMobile = false }: ProfileDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close on click outside or escape
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            document.addEventListener('touchstart', handleClickOutside)
            document.addEventListener('keydown', handleKeyDown)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('touchstart', handleClickOutside)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen])

    const user = session?.user || {}
    const role = (user as any)?.role || 'USER'
    const isAdmin = role === 'ADMIN'
    const name = user.name || (user as any)?.username || (isAdmin ? 'Administrateur' : 'Client')
    const email = user.email || ''
    const avatarInitial = name?.charAt(0)?.toUpperCase() || 'U'

    const label = isLoggedIn ? (isAdmin ? 'Admin' : 'Compte') : 'Connexion'

    return (
        <div ref={dropdownRef} className="relative inline-block text-left">
            {/* Trigger Button */}
            {isMobile ? (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    aria-label="Menu profil utilisateur"
                    className={cn(
                        "p-2 rounded-xl transition-all duration-200 relative",
                        isOpen ? "bg-primary/10 text-primary" : "hover:bg-gray-50 text-[#1B1F3B]"
                    )}
                >
                    <User className="w-6 h-6" />
                    {isLoggedIn && (
                        <span className={cn(
                            "absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2 ring-white",
                            isAdmin ? "bg-primary" : "bg-emerald-500"
                        )} />
                    )}
                </button>
            ) : (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    className="flex flex-col items-center gap-1 group focus:outline-none"
                >
                    <div className={cn(
                        "relative p-2 rounded-xl transition-all duration-300",
                        isOpen
                            ? "bg-primary/15 ring-2 ring-primary/25"
                            : "bg-gray-50 group-hover:bg-primary/10"
                    )}>
                        <User className={cn(
                            "w-6 h-6 transition-all duration-300",
                            isOpen
                                ? "text-primary scale-105"
                                : "text-[#1B1F3B] group-hover:text-primary group-hover:scale-105"
                        )} strokeWidth={1.5} />
                        {isLoggedIn && (
                            <span className={cn(
                                "absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white",
                                isAdmin ? "bg-primary" : "bg-emerald-500"
                            )} />
                        )}
                    </div>
                    <span className={cn(
                        "text-[10px] font-black uppercase tracking-tight transition-all",
                        isOpen || isAdmin ? "text-primary font-black" : "text-[#1B1F3B] group-hover:text-primary"
                    )}>
                        {label}
                    </span>
                </button>
            )}

            {/* Dropdown Floating Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                        className={cn(
                            "absolute right-0 top-full mt-2.5 z-[120] w-[280px] sm:w-[290px] max-w-[calc(100vw-2rem)]",
                            "bg-white/95 backdrop-blur-2xl rounded-2xl border border-slate-200/70",
                            "shadow-[0_16px_40px_-12px_rgba(15,23,42,0.14),0_0_0_1px_rgba(15,23,42,0.03)]",
                            "overflow-hidden p-1.5"
                        )}
                    >
                        {isLoggedIn ? (
                            <>
                                {/* User Info Header */}
                                <div className="px-3 py-2.5 rounded-xl bg-slate-50/70 border border-slate-100/80 mb-1">
                                    <div className="flex items-center gap-2.5">
                                        <div className="relative shrink-0">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1B1F3B] to-[#2D345B] text-white flex items-center justify-center font-bold text-sm shadow-xs overflow-hidden">
                                                {user.image ? (
                                                    <img src={user.image} alt={name} className="w-full h-full object-cover" />
                                                ) : (
                                                    avatarInitial
                                                )}
                                            </div>
                                            <span className={cn(
                                                "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white",
                                                isAdmin ? "bg-primary" : "bg-emerald-500"
                                            )} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <p className="font-semibold text-[13px] text-slate-900 truncate leading-snug tracking-[-0.01em]">
                                                    {name}
                                                </p>
                                                {isAdmin && (
                                                    <span className="shrink-0 text-[9px] font-bold tracking-wide uppercase px-1.5 py-0.2 rounded-md bg-orange-500/10 text-primary border border-orange-500/20">
                                                        Admin
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-slate-500 truncate font-normal leading-tight">
                                                {email || 'Compte Baraka'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Section: Admin Links (if Admin) */}
                                {isAdmin && (
                                    <div className="py-1">
                                        <div className="px-2.5 py-1 flex items-center justify-between">
                                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                                Administration
                                            </span>
                                            <span className="text-[9px] font-medium text-primary">Espace Pro</span>
                                        </div>
                                        <div className="space-y-0.5">
                                            <Link
                                                href="/admin"
                                                onClick={() => setIsOpen(false)}
                                                className="group flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100/70 transition-all text-[13px]"
                                            >
                                                <LayoutDashboard className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors shrink-0" />
                                                <span className="font-medium flex-1">Tableau de bord</span>
                                                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                                            </Link>
                                            <Link
                                                href="/admin/orders"
                                                onClick={() => setIsOpen(false)}
                                                className="group flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100/70 transition-all text-[13px]"
                                            >
                                                <ShoppingBag className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors shrink-0" />
                                                <span className="font-medium flex-1">Commandes</span>
                                                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                                            </Link>
                                            <Link
                                                href="/admin/products"
                                                onClick={() => setIsOpen(false)}
                                                className="group flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100/70 transition-all text-[13px]"
                                            >
                                                <Package className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors shrink-0" />
                                                <span className="font-medium flex-1">Catalogue produits</span>
                                                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                                            </Link>
                                        </div>
                                    </div>
                                )}

                                {isAdmin && <div className="h-px bg-slate-100 my-1 mx-2" />}

                                {/* Section: Personal Account */}
                                <div className="py-1">
                                    <div className="px-2.5 py-1">
                                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                            Espace client
                                        </span>
                                    </div>
                                    <div className="space-y-0.5">
                                        <Link
                                            href="/account"
                                            onClick={() => setIsOpen(false)}
                                            className="group flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100/70 transition-all text-[13px]"
                                        >
                                            <User className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors shrink-0" />
                                            <span className="font-medium flex-1">Mon profil</span>
                                            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                                        </Link>
                                        <Link
                                            href="/account?tab=orders"
                                            onClick={() => setIsOpen(false)}
                                            className="group flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100/70 transition-all text-[13px]"
                                        >
                                            <PackageCheck className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors shrink-0" />
                                            <span className="font-medium flex-1">Mes commandes</span>
                                            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                                        </Link>
                                        <Link
                                            href="/account?tab=wishlist"
                                            onClick={() => setIsOpen(false)}
                                            className="group flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100/70 transition-all text-[13px]"
                                        >
                                            <Heart className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors shrink-0" />
                                            <span className="font-medium flex-1">Mes favoris</span>
                                            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                                        </Link>
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100 my-1 mx-2" />

                                {/* Section: General & Sign out */}
                                <div className="py-0.5 space-y-0.5">
                                    <Link
                                        href="/boutiques"
                                        onClick={() => setIsOpen(false)}
                                        className="group flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-all text-[12px]"
                                    >
                                        <MapPin className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors shrink-0" />
                                        <span className="font-medium flex-1">Nos boutiques à Dakar</span>
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setIsOpen(false)
                                            signOut({ callbackUrl: '/' })
                                        }}
                                        className="w-full group flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50/80 transition-all text-[12px] font-medium"
                                    >
                                        <LogOut className="w-4 h-4 text-rose-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
                                        <span className="flex-1 text-left">Se déconnecter</span>
                                    </button>
                                </div>
                            </>
                        ) : (
                            /* Guest State: Ultra Clean & Minimalist */
                            <div className="p-2 space-y-3">
                                <div className="px-1 pt-1 pb-0.5">
                                    <h4 className="font-semibold text-sm text-slate-900 tracking-tight">
                                        Espace Client
                                    </h4>
                                    <p className="text-[12px] text-slate-500 font-normal leading-relaxed mt-0.5">
                                        Connectez-vous pour suivre vos commandes et sauvegarder vos favoris.
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <Link
                                        href="/login"
                                        onClick={() => setIsOpen(false)}
                                        className="w-full h-9 bg-primary hover:bg-[#d95213] text-white rounded-xl font-medium text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99]"
                                    >
                                        <LogIn className="w-3.5 h-3.5" />
                                        <span>Se connecter</span>
                                    </Link>
                                    <Link
                                        href="/register"
                                        onClick={() => setIsOpen(false)}
                                        className="w-full h-9 bg-slate-50 hover:bg-slate-100/80 text-slate-700 border border-slate-200/70 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                                    >
                                        <UserPlus className="w-3.5 h-3.5 text-slate-500" />
                                        <span>Créer un compte</span>
                                    </Link>
                                </div>

                                <div className="h-px bg-slate-100 my-1 mx-1" />

                                <div className="space-y-0.5 px-0.5 pb-0.5">
                                    <Link
                                        href="/boutiques"
                                        onClick={() => setIsOpen(false)}
                                        className="group flex items-center gap-2 px-2 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-[12px]"
                                    >
                                        <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary transition-colors" />
                                        <span className="font-medium flex-1">Nos boutiques</span>
                                    </Link>
                                    <Link
                                        href="/contact"
                                        onClick={() => setIsOpen(false)}
                                        className="group flex items-center gap-2 px-2 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-[12px]"
                                    >
                                        <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary transition-colors" />
                                        <span className="font-medium flex-1">Aide & Contact</span>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
