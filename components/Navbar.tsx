'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
    Search,
    ShoppingCart,
    User,
    MapPin,
    ChevronDown,
    Settings,
    Laptop,
    Package,
    Sparkles,
    HelpCircle,
    Navigation,
    Menu
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import MegaMenu from './features/navigation/MegaMenu'
import { cn } from '@/lib/utils'

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header className="w-full z-[100] relative">
            {/* ROW 1: TOP SERVICE BAR (LDLC Style) */}
            <div className="bg-[#111] text-[#999] py-2 border-b border-white/5 hidden lg:block">
                <div className="container mx-auto px-4 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                    <div className="flex gap-8">
                        <Link href="/track-order" className="hover:text-white transition-colors">Suivi de commande</Link>
                        <Link href="/stores" className="hover:text-white transition-colors">Nos boutiques</Link>
                        <Link href="/help" className="hover:text-white transition-colors">Besoin d'aide ?</Link>
                    </div>
                    <div className="flex gap-8 items-center">
                        <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                            Espace Pro
                        </span>
                        <Link href="/about" className="hover:text-white transition-colors">Qui sommes-nous ?</Link>
                    </div>
                </div>
            </div>

            {/* ROW 2: MAIN HEADER (Logo, Search, Actions) */}
            <div className="bg-white py-4 border-b border-gray-100">
                <div className="container mx-auto px-4 flex items-center justify-between gap-8">
                    {/* Logo */}
                    <Link href="/" className="relative w-40 h-10 flex-shrink-0">
                        <Image
                            src="https://darkslateblue-narwhal-655051.hostingersite.com/wp-content/uploads/2025/11/WhatsApp-Image-2025-08-30-at-22.56.22-2.png"
                            alt="Baraka Shop"
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </Link>

                    {/* Search Bar - Center */}
                    <div className="flex-1 max-w-3xl hidden md:flex items-center relative group">
                        <div className="absolute left-4 z-10 text-gray-400 group-focus-within:text-primary transition-colors">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Chercher un produit, une marque, une catégorie..."
                            className="w-full bg-gray-50 border border-gray-200 py-3 pl-12 pr-4 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                        />
                        <button className="absolute right-2 px-6 py-2 bg-primary text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-black transition-all">
                            Rechercher
                        </button>
                    </div>

                    {/* Right Actions - Icons with Text (LDLC Style) */}
                    <div className="flex items-center gap-6 lg:gap-10 h-full">
                        <Link href="/stores" className="flex flex-col items-center gap-1 group text-gray-600 hover:text-primary transition-colors">
                            <MapPin size={22} className="group-hover:-translate-y-0.5 transition-transform" />
                            <span className="text-[9px] font-black uppercase tracking-wider">Boutiques</span>
                        </Link>
                        <Link href="/login" className="flex flex-col items-center gap-1 group text-gray-600 hover:text-primary transition-colors">
                            <User size={22} className="group-hover:-translate-y-0.5 transition-transform" />
                            <span className="text-[9px] font-black uppercase tracking-wider">Compte</span>
                        </Link>
                        <Link href="/cart" className="flex flex-col items-center gap-1 group text-gray-600 hover:text-primary transition-colors relative">
                            <div className="relative">
                                <ShoppingCart size={22} className="group-hover:-translate-y-0.5 transition-transform" />
                                <span className="absolute -top-2 -right-2 bg-primary text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">0</span>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-wider">Panier</span>
                        </Link>

                        {/* Mobile Toggle */}
                        <button className="lg:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ROW 3: CATEGORY NAV BAR (The Color Bar - LDLC Style) */}
            <nav className="bg-[#1a1a1a] text-white hidden lg:block overflow-visible relative h-12">
                <div className="container mx-auto px-4 h-full flex items-center">

                    {/* Mega Menu Trigger - Integrated with the new design */}
                    <MegaMenu />

                    {/* Quick Nav Links */}
                    <div className="flex items-center h-full">
                        {[
                            { name: 'Configurateur PC', icon: Settings },
                            { name: 'Votre Portable', icon: Laptop },
                            { name: 'Promotions', icon: Package, highlight: true },
                            { name: 'Nouveautés', icon: Sparkles },
                            { name: 'Services', icon: HelpCircle },
                            { name: 'Besoin d\'aide', icon: Navigation }
                        ].map((link, i) => (
                            <Link
                                key={i}
                                href="/shop"
                                className={cn(
                                    "flex items-center gap-2 px-6 h-full text-[10px] font-black uppercase tracking-[0.15em] hover:bg-white/10 transition-colors border-r border-white/5 whitespace-nowrap",
                                    link.highlight && "text-primary"
                                )}
                            >
                                {link.name}
                                {link.name === 'Promotions' && <ChevronDown size={12} className="ml-1 opacity-50" />}
                            </Link>
                        ))}
                    </div>

                    {/* Socials / App Link - Extreme Right */}
                    <div className="ml-auto flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <span className="animate-pulse text-yellow-500">Soldes Hiver -50%</span>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-white border-b border-gray-100 overflow-hidden"
                    >
                        <div className="p-4 flex flex-col gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input type="text" placeholder="Rechercher..." className="w-full bg-gray-50 py-2 pl-10 pr-4 rounded-lg text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button className="bg-primary text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest">Navigation</button>
                                <button className="bg-gray-100 text-black py-3 rounded-xl text-xs font-bold uppercase tracking-widest">Catalogues</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    )
}
