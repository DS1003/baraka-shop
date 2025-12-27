'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Menu, X, Search, User, Heart, Phone, MapPin, Truck, Sparkles, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import { cn } from '@/lib/utils'
import MegaMenu from '@/components/features/navigation/MegaMenu'
import ScrollToTop from '@/components/ui/ScrollToTop'
import MobileBottomNav from '@/components/features/navigation/MobileBottomNav'

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const { scrollY } = useScroll()

    useMotionValueEvent(scrollY, "change", (latest) => {
        setScrolled(latest > 50)
    })

    const toggleMenu = () => setIsOpen(!isOpen)

    return (
        <>
            <ScrollToTop />

            {/* Mobile Bottom Navigation - App Style */}
            <MobileBottomNav onMenuToggle={toggleMenu} />

            {/* Row 1: Top Bar - Desktop Only */}
            <div className="bg-[#0a0a0a] text-white text-[11px] py-2 hidden lg:block border-b border-white/5">
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

            {/* Main Header - Sticky */}
            <header
                className={cn(
                    "w-full bg-white/95 backdrop-blur-xl border-b border-gray-100 transition-all duration-300 z-50",
                    "sticky top-0",
                    scrolled ? "shadow-md py-2 md:py-3" : "py-3 md:py-5"
                )}
            >
                <div className="container px-4 mx-auto">
                    <div className="flex items-center justify-between gap-4">

                        {/* Logo - Smaller on Mobile */}
                        <Link href="/" className="flex-shrink-0 relative w-28 h-8 md:w-36 md:h-10 lg:w-40 lg:h-12 group transition-all">
                            <Image
                                src="https://darkslateblue-narwhal-655051.hostingersite.com/wp-content/uploads/2025/11/WhatsApp-Image-2025-08-30-at-22.56.22-2.png"
                                alt="Baraka Shop"
                                fill
                                className="object-contain object-left"
                                priority
                            />
                        </Link>

                        {/* Search Bar - Desktop Only */}
                        <div className="hidden lg:flex flex-1 max-w-2xl mx-auto px-8">
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

                        {/* Action Icons */}
                        <div className="flex items-center gap-2 md:gap-3">

                            {/* Desktop/Tablet Icons */}
                            <Link href="/wishlist" className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 text-gray-900 transition-all hover:bg-red-50 hover:text-red-500 overflow-hidden lg:hidden xl:flex xl:w-auto xl:h-auto xl:bg-white xl:border xl:border-gray-100 xl:px-4 xl:py-2 xl:gap-3 xl:rounded-full">
                                <div className="hidden xl:flex flex-col items-end leading-none">
                                    <span className="text-[9px] text-gray-400 font-bold uppercase">Mes Favoris</span>
                                    <span className="text-xs font-black">0 Items</span>
                                </div>
                                <Heart size={18} className="xl:text-gray-900 group-hover:scale-110 transition-transform" />
                            </Link>

                            <Link href="/account" className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 text-gray-900 transition-all hover:bg-primary/10 hover:text-primary xl:hidden">
                                <User size={18} />
                            </Link>

                            {/* Big Account Pill (XL Desktop) */}
                            <Link href="/account" className="hidden xl:flex items-center gap-3 bg-white border border-gray-100 text-gray-900 pl-4 pr-1.5 py-1.5 rounded-full hover:border-black hover:shadow-md transition-all group">
                                <div className="flex flex-col items-end leading-none">
                                    <span className="text-[9px] text-gray-400 font-bold uppercase">Compte</span>
                                    <span className="text-xs font-black">Login</span>
                                </div>
                                <div className="w-9 h-9 bg-gray-50 group-hover:bg-primary/10 rounded-full flex items-center justify-center transition-colors">
                                    <User size={18} className="text-gray-900 group-hover:text-primary" />
                                </div>
                            </Link>

                            {/* Cart - Always Visible Header Right */}
                            <Link href="/cart" className="flex items-center gap-1.5 md:gap-3 bg-black text-white px-3 py-1.5 md:pl-4 md:pr-1.5 md:py-1.5 rounded-full hover:bg-gray-800 transition-all shadow-lg">
                                <div className="flex flex-col items-end leading-none hidden md:flex">
                                    <span className="text-[9px] text-gray-400 font-bold uppercase">Panier</span>
                                    <span className="text-xs font-black tracking-tight">79.000F</span>
                                </div>
                                <div className="w-7 h-7 md:w-9 md:h-9 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm relative transition-transform hover:scale-110">
                                    <ShoppingCart size={16} className="md:size-18" />
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-black rounded-full text-[10px] flex items-center justify-center font-bold">2</span>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Search Row - visible on scroll or always? Lets keep it always on mobile header for easy access */}
                    <div className="lg:hidden mt-3 relative">
                        <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2 hover:bg-white hover:border-black/10 transition-all cursor-text shadow-inner">
                            <Search size={16} className="text-gray-400 mr-3" />
                            <input
                                type="text"
                                placeholder="Rechercher sur Baraka..."
                                className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium placeholder:text-gray-400"
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* Desktop Navigation Bar Lower */}
            <div className="hidden lg:block bg-[#050505] text-white border-t border-white/10 relative z-40 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                <div className="container px-4 mx-auto">
                    <div className="flex items-center h-16">
                        <div className="relative h-full flex items-center pr-8 mr-8 border-r border-white/10">
                            <MegaMenu />
                        </div>
                        <nav className="flex-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                            <Link href="/" className="group flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-full transition-all duration-300 mr-4 border border-white/5">
                                <motion.span whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }} className="text-primary"><MapPin size={16} fill="currentColor" /></motion.span>
                                <span className="group-hover:tracking-widest transition-all">Accueil</span>
                            </Link>
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
                            <Link href="/shop?tag=deals" className="group relative flex items-center gap-3 ml-auto px-6 py-2.5 rounded-full bg-gradient-to-r from-[#FF3D00] to-[#FF9100] text-white font-black tracking-widest overflow-hidden shadow-lg transition-all hover:scale-105">
                                <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer" />
                                <span className="relative z-10 flex items-center gap-2"><Sparkles size={16} className="animate-pulse" fill="white" />VENTES FLASH</span>
                            </Link>
                        </nav>
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Sheet Overlay - App Experience */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] lg:hidden"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                            className="fixed inset-x-0 bottom-0 min-h-[60vh] max-h-[90vh] bg-white z-[80] shadow-[0_-20px_50px_rgba(0,0,0,0.2)] flex flex-col lg:hidden rounded-t-[3rem] overflow-hidden pb-10"
                        >
                            {/* Grab handle for sheet feel */}
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-4 mb-2" />

                            <div className="p-8 pb-4 relative flex items-center justify-between border-b border-gray-50">
                                <h3 className="text-xl font-black text-gray-900 tracking-tight">Nos Rayons</h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto px-6 py-6 pb-24">
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'Informatique', icon: '💻', href: '/shop?category=laptops', bg: 'bg-blue-50' },
                                        { label: 'Smartphones', icon: '📱', href: '/shop?category=smartphones', bg: 'bg-purple-50' },
                                        { label: 'Image & Son', icon: '🔊', href: '/shop?category=tv-son', bg: 'bg-red-50' },
                                        { label: 'Gaming', icon: '🎮', href: '/shop?category=gaming', bg: 'bg-green-50' },
                                        { label: 'Connecté', icon: '⌚', href: '/shop?category=smart-home', bg: 'bg-orange-50' },
                                        { label: 'Flash Deals', icon: '⚡', href: '/shop?tag=deals', bg: 'bg-yellow-50' },
                                    ].map((item) => (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className={cn("group flex flex-col p-5 rounded-3xl transition-all border border-transparent active:scale-95", item.bg)}
                                        >
                                            <div className="text-3xl mb-3">{item.icon}</div>
                                            <div className="font-black text-gray-900 text-sm">{item.label}</div>
                                            <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase mt-1">
                                                Voir Tout <ChevronRight size={10} />
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                <div className="mt-8 space-y-4">
                                    <Link href="/account" onClick={() => setIsOpen(false)} className="flex items-center gap-4 p-5 bg-gray-50 rounded-3xl group border border-gray-100">
                                        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                            <User size={20} className="text-gray-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-black text-gray-900 text-sm">Mon Compte</div>
                                            <div className="text-[10px] text-gray-400 font-bold">Gérer mes commandes</div>
                                        </div>
                                    </Link>
                                    <Link href="/track-order" onClick={() => setIsOpen(false)} className="flex items-center gap-4 p-5 bg-gray-50 rounded-3xl group border border-gray-100">
                                        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                            <Truck size={20} className="text-gray-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-black text-gray-900 text-sm">Suivi Colis</div>
                                            <div className="text-[10px] text-gray-400 font-bold">Où est ma commande ?</div>
                                        </div>
                                    </Link>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Link href="/stores" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <MapPin size={16} className="text-gray-400" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Nos Boutiques</span>
                                        </Link>
                                        <Link href="/contact" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <Phone size={16} className="text-gray-400" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Aide & Contact</span>
                                        </Link>
                                    </div>
                                </div>
                                <div className="mt-10 px-4 flex flex-wrap justify-center gap-6 text-[9px] font-black uppercase tracking-[0.2em] text-gray-300">
                                    <Link href="/faq">FAQ</Link>
                                    <Link href="/terms">CGV</Link>
                                    <Link href="/privacy">Confidentialité</Link>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}

function ArrowRight({ className, size }: { className?: string, size?: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size || 24}
            height={size || 24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    )
}
