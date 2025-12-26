'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Menu, X, Search, User, Heart, Phone, MapPin, Truck, Sparkles, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import { cn } from '@/lib/utils'
import MegaMenu from '@/components/features/navigation/MegaMenu'
import ScrollToTop from '@/components/ui/ScrollToTop'

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const { scrollY } = useScroll()

    useMotionValueEvent(scrollY, "change", (latest) => {
        setScrolled(latest > 50)
    })

    return (
        <>
            <ScrollToTop />

            {/* Row 1: Top Bar - Disappears naturally on scroll */}
            <div className="bg-[#0a0a0a] text-white text-[11px] py-2 hidden md:block border-b border-white/5">
                <div className="container px-4 mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2 text-primary font-bold animate-pulse tracking-wide"><Sparkles size={12} /> OFFRES SPÉCIALES 2025</span>
                        <Link href="/track-order" className="hover:text-primary transition-colors flex items-center gap-2 text-gray-400 hover:text-white"><Truck size={12} /> Suivi de commande</Link>
                    </div>
                    <div className="flex items-center gap-6 text-gray-400">
                        <span className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer"><Phone size={12} /> Service Client: 33 800 00 00</span>
                        <Link href="/stores" className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer"><MapPin size={12} /> Nos Boutiques</Link>
                    </div>
                </div>
            </div>

            {/* Row 2: Main Header - STICKY */}
            <header
                className={cn(
                    "w-full bg-white/95 backdrop-blur-xl border-b border-gray-100 transition-all duration-300 z-50",
                    "sticky top-0",
                    scrolled ? "shadow-md py-2 lg:py-3" : "py-4 lg:py-5"
                )}
            >
                <div className="container px-4 mx-auto">
                    <div className="flex items-center justify-between gap-4 xl:gap-8">

                        {/* Logo */}
                        <Link href="/" className="flex-shrink-0 relative w-32 h-10 md:w-40 md:h-12 group">
                            <Image
                                src="https://darkslateblue-narwhal-655051.hostingersite.com/wp-content/uploads/2025/11/WhatsApp-Image-2025-08-30-at-22.56.22-2.png"
                                alt="Baraka Shop"
                                fill
                                className="object-contain object-left group-hover:opacity-80 transition-opacity"
                                priority
                            />
                        </Link>

                        {/* Search Bar - Modernized with Pill Button inside */}
                        <div className="hidden lg:flex flex-1 max-w-2xl mx-auto">
                            <div className="flex w-full relative group">
                                <input
                                    type="text"
                                    placeholder="Rechercher un produit..."
                                    className="w-full h-12 pl-6 pr-32 rounded-full border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-black focus:ring-0 outline-none transition-all text-sm font-medium placeholder:text-gray-400 shadow-sm focus:shadow-md"
                                />
                                <button className="absolute right-1.5 top-1.5 h-9 px-5 bg-black text-white rounded-full flex items-center justify-center gap-2 hover:bg-primary transition-all hover:scale-105 shadow-md active:scale-95 group-focus-within:bg-primary">
                                    <Search size={16} />
                                    <span className="text-xs font-bold uppercase tracking-wide">Trouver</span>
                                </button>
                            </div>
                        </div>

                        {/* Actions Icons - Premium Pill Style */}
                        <div className="flex items-center gap-3">

                            {/* Wishlist Pill */}
                            <Link href="/wishlist" className="hidden xl:flex items-center gap-3 bg-white border border-gray-100 text-gray-900 pl-4 pr-1.5 py-1.5 rounded-full hover:border-black hover:shadow-md transition-all group">
                                <div className="flex flex-col items-end leading-none">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider group-hover:text-black transition-colors">Mes Favoris</span>
                                    <span className="text-xs font-black">0 Articles</span>
                                </div>
                                <div className="w-9 h-9 bg-gray-50 group-hover:bg-red-50 rounded-full flex items-center justify-center transition-colors">
                                    <Heart size={18} className="text-gray-900 group-hover:text-red-500 group-hover:fill-red-500 transition-all duration-300" />
                                </div>
                            </Link>

                            {/* Account Pill */}
                            <Link href="/account" className="hidden md:flex items-center gap-3 bg-white border border-gray-100 text-gray-900 pl-4 pr-1.5 py-1.5 rounded-full hover:border-black hover:shadow-md transition-all group">
                                <div className="flex flex-col items-end leading-none hidden xl:flex">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider group-hover:text-black transition-colors">Bonjour !</span>
                                    <span className="text-xs font-black">Mon Compte</span>
                                </div>
                                <div className="w-9 h-9 bg-gray-50 group-hover:bg-primary/10 rounded-full flex items-center justify-center transition-colors">
                                    <User size={18} className="text-gray-900 group-hover:text-primary transition-colors" />
                                </div>
                            </Link>

                            {/* Cart Pill */}
                            <Link href="/cart" className="flex items-center gap-3 bg-black text-white px-1.5 py-1.5 pl-4 rounded-full hover:bg-gray-800 transition-all hover:scale-105 shadow-xl hover:shadow-2xl">
                                <div className="flex flex-col items-end leading-none hidden sm:flex">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Mon Panier</span>
                                    <span className="text-xs font-black">79.000 F</span>
                                </div>
                                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm relative">
                                    <ShoppingCart size={18} className="text-white" />
                                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-black rounded-full"></span>
                                </div>
                            </Link>

                            {/* Mobile Menu Toggle */}
                            <button className="lg:hidden p-2 text-gray-900 bg-gray-100 rounded-full hover:bg-gray-200 ml-2" onClick={() => setIsOpen(!isOpen)}>
                                {isOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Search */}
                    <div className="lg:hidden mt-4 relative">
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            className="w-full h-10 pl-4 pr-10 rounded-lg border border-gray-200 bg-gray-50 focus:border-black outline-none text-sm transition-all"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                </div>
            </header>

            {/* Row 3: Navigation Bar - Premium Dark UI */}
            <div className="hidden lg:block bg-[#0f0f0f] text-white border-t border-white/5 relative z-40 shadow-inner">
                <div className="container px-4 mx-auto">
                    <div className="flex items-center h-14">

                        {/* Mega Menu Button - Standout */}
                        <div className="relative h-full flex items-center pr-8 mr-8 border-r border-white/10">
                            <MegaMenu />
                        </div>

                        {/* Main Nav Links - Elegant & Spaced */}
                        <nav className="flex-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-gray-400">

                            {/* Accueil - Premium Floating Pill */}
                            <Link href="/" className="group flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-full transition-all duration-300 mr-4 border border-white/5 hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                <motion.span
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.5 }}
                                    className="text-primary"
                                >
                                    <MapPin size={16} fill="currentColor" />
                                </motion.span>
                                <span className="group-hover:tracking-widest transition-all duration-300">Accueil</span>
                            </Link>

                            {/* Standard Links - Minimalist Kinetic Hover */}
                            <Link href="/shop?category=laptops" className="relative group px-4 py-2 hover:text-white transition-colors overflow-hidden rounded-lg">
                                <span className="relative z-10">Ordinateurs</span>
                                <span className="absolute inset-0 bg-white/5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                            </Link>
                            <Link href="/shop?category=smartphones" className="relative group px-4 py-2 hover:text-white transition-colors overflow-hidden rounded-lg">
                                <span className="relative z-10">Smartphones</span>
                                <span className="absolute inset-0 bg-white/5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                            </Link>
                            <Link href="/shop?category=tv-son" className="relative group px-4 py-2 hover:text-white transition-colors overflow-hidden rounded-lg">
                                <span className="relative z-10">Audio & Vision</span>
                                <span className="absolute inset-0 bg-white/5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                            </Link>

                            {/* Ventes Flash - Ultimate Gradient Button */}
                            <Link href="/shop?tag=deals" className="group relative flex items-center gap-3 ml-auto px-6 py-2.5 rounded-full bg-gradient-to-r from-[#FF3D00] to-[#FF9100] text-white font-black tracking-widest overflow-hidden shadow-[0_4px_15px_rgba(255,61,0,0.4)] hover:shadow-[0_6px_25px_rgba(255,61,0,0.6)] transition-all duration-300 hover:-translate-y-0.5 border border-white/20">
                                {/* Shimmer Overlay */}
                                <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer" />

                                <span className="relative z-10 flex items-center gap-2">
                                    <Sparkles size={16} className="animate-pulse" fill="white" />
                                    VENTES FLASH
                                </span>
                                <span className="relative z-10 bg-black/20 px-1.5 py-0.5 rounded text-[9px] font-bold border border-white/20 shadow-inner">
                                    LIVE
                                </span>
                            </Link>
                        </nav>

                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                        className="fixed inset-y-0 right-0 w-full sm:w-[300px] bg-white z-[60] shadow-2xl p-6 flex flex-col h-full"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black">Menu</h2>
                            <button onClick={() => setIsOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-2 font-medium text-lg flex-1 overflow-y-auto">
                            <Link href="/" className="px-4 py-3 bg-gray-50 rounded-xl text-black hover:bg-black hover:text-white transition-all">Accueil</Link>

                            <div className="mt-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Nos Univers</div>
                            <Link href="/shop?category=laptops" className="px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors">Informatique</Link>
                            <Link href="/shop?category=smartphones" className="px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors">Téléphonie</Link>
                            <Link href="/shop?category=tv-son" className="px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors">Image & Son</Link>

                            <div className="mt-auto pt-6 border-t border-gray-100">
                                <Link href="/account" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors font-bold">
                                    <User size={20} /> Mon Compte
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
