'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, User, ShoppingCart, Heart, Menu, ChevronDown, Zap, MapPin, PhoneCall, ArrowRight } from 'lucide-react'
import { Button } from '@/ui/Button'
import { Container } from '@/ui/Container'
import { cn } from '@/lib/utils'
import { MegaMenu } from '@/features/home/components/MegaMenu'
import { AnimatePresence, motion } from 'framer-motion'

const SUGGESTIONS = [
    { id: 1, name: "MacBook Pro M3 Max", category: "INFORMATIQUE", price: "2 500 000 CFA", image: "https://media.ldlc.com/encart/p/28885_b.jpg" },
    { id: 2, name: "iPhone 15 Pro Titanium", category: "TELEPHONE & TABLETTE", price: "850 000 CFA", image: "https://media.ldlc.com/encart/p/28828_b.jpg" },
    { id: 3, name: "Sony WH-1000XM5 Black", category: "IMAGE & SON", price: "250 000 CFA", image: "https://media.ldlc.com/encart/p/28829_b.jpg" },
    { id: 4, name: "Canon EOS R6 Mark II", category: "IMAGE & SON", price: "1 800 000 CFA", image: "https://media.ldlc.com/encart/p/22889_b.jpg" },
]

const navigation = [
    { name: 'Boutique', href: '/boutique', active: true },
    { name: 'Laptops', href: '/category/laptops' },
    { name: 'Smartphone', href: '/category/smartphones', hasMegaMenu: true },
    { name: 'Headphones', href: '/category/headphones' },
    { name: 'Camera', href: '/category/cameras' },
    { name: 'Promotions', href: '/promotions', isNew: true },
]

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [showMegaMenu, setShowMegaMenu] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    React.useEffect(() => {
        const handleScroll = () => {
            // Trigger sooner for better reactivity
            setScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header className="w-full flex flex-col font-sans relative">
            {/* 1. Top Bar - Black */}
            {!scrolled && (
                <div className="bg-black text-white text-[11px] md:text-xs py-2.5 font-medium tracking-wide hidden md:block">
                    <Container className="flex justify-between items-center">
                        <div className="flex items-center gap-6">
                            <Link href="/flash-sale" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                                <Zap className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                                <span>Flash Sale</span>
                            </Link>
                            <Link href="/track-order" className="hidden sm:block hover:text-primary transition-colors border-l border-white/20 pl-6">Track Order</Link>
                        </div>

                        <div className="flex items-center gap-6">
                            <Link href="/login" className="hover:text-primary transition-colors border-r border-white/20 pr-6">Connexion</Link>
                            <span className="flex items-center gap-2 text-gray-400">
                                Besoin d'aide ? <PhoneCall className="w-3 h-3 text-primary" /> <span className="text-white">+221 33 800 00 00</span>
                            </span>
                        </div>
                    </Container>
                </div>
            )}

            {/* 2. Main Header - White (Enhanced Sticky/Fixed Logic) */}
            <div className={cn(
                "w-full transition-all duration-300 hidden md:block",
                scrolled ? "h-[70px] md:h-[80px]" : "h-auto"
            )}>
                <div className={cn(
                    "bg-white py-4 border-b border-gray-100 transition-all duration-300 z-[100] w-full",
                    scrolled ? "fixed top-0 left-0 right-0 shadow-[0_10px_30px_rgba(0,0,0,0.08)] py-2.5 backdrop-blur-xl bg-white/95" : "relative"
                )}>
                    <Container className="flex flex-col md:flex-row items-center justify-between gap-6">
                        {/* Logo - Scales on scroll */}
                        <a href="/" className="flex-shrink-0">
                            <motion.div
                                animate={{
                                    scale: scrolled ? 0.85 : 1,
                                    y: scrolled ? -2 : 0
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="relative w-[160px] h-[45px] md:w-[190px] md:h-[50px]"
                            >
                                <Image
                                    src="https://baraka.sn/wp-content/uploads/2025/11/WhatsApp-Image-2025-08-30-at-22.56.22-2.png"
                                    alt="Baraka Shop"
                                    fill
                                    className="object-contain object-left"
                                    priority
                                />
                            </motion.div>
                        </a>

                        {/* Dynamic Search Bar */}
                        <div className="flex-1 w-full max-w-2xl px-4 relative">
                            <div className={cn(
                                "flex w-full h-[46px] bg-[#f4f4f4] border border-gray-200 rounded-lg overflow-hidden transition-all focus-within:bg-white focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10",
                                scrolled && "h-[40px]"
                            )}>
                                <input
                                    type="text"
                                    placeholder="Rechercher un produit, une marque..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setIsSearchFocused(true)}
                                    className="flex-1 px-6 h-full bg-transparent outline-none text-sm placeholder:text-gray-400 font-medium"
                                />
                                <button className="bg-primary hover:bg-primary/90 text-white w-[50px] h-full flex items-center justify-center transition-colors shrink-0">
                                    <Search className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Search Results Dropdown (Same as before) */}
                            <AnimatePresence>
                                {isSearchFocused && searchQuery.length >= 2 && (
                                    <>
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute top-full left-4 right-4 mt-2 bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 z-[110] overflow-hidden"
                                        >
                                            <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Résultats pour "{searchQuery}"</span>
                                            </div>
                                            <div className="max-h-[400px] overflow-y-auto">
                                                {SUGGESTIONS.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
                                                    <Link
                                                        key={item.id}
                                                        href={`/product/${item.id}`}
                                                        className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group border-b border-gray-50 last:border-0"
                                                        onClick={() => setIsSearchFocused(false)}
                                                    >
                                                        <div className="relative w-12 h-12 bg-white rounded-md border border-gray-100 overflow-hidden shrink-0">
                                                            <Image src={item.image} alt={item.name} fill className="object-contain p-1 group-hover:scale-110 transition-transform" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-[#1B1F3B] group-hover:text-primary transition-colors">{item.name}</span>
                                                            <span className="text-[11px] text-gray-400 font-medium uppercase">{item.category}</span>
                                                        </div>
                                                        <span className="ml-auto text-sm font-black text-[#1B1F3B]">{item.price}</span>
                                                    </Link>
                                                ))}
                                                {SUGGESTIONS.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                                                    <div className="p-8 text-center text-gray-400 text-sm italic">
                                                        Aucun produit trouvé pour votre recherche...
                                                    </div>
                                                )}
                                            </div>
                                            <Link href="/search" className="block p-4 text-center text-xs font-black text-primary hover:bg-primary hover:text-white transition-all uppercase tracking-widest bg-primary/5"> Voir tous les résultats </Link>
                                        </motion.div>
                                        <div className="fixed inset-0 z-[105] bg-black/5" onClick={() => setIsSearchFocused(false)} />
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Icons / Account */}
                        <div className="flex items-center gap-6 md:gap-8">
                            <HeaderAction icon={MapPin} label="Boutiques" href="/boutiques" />
                            <HeaderAction icon={User} label="Compte" href="/login" />

                            {/* Dynamic Premium Cart Button */}
                            <Link href="/cart" className="relative flex items-center group bg-gray-50 hover:bg-primary/5 pl-2 pr-4 py-1.5 rounded-2xl border border-gray-100 transition-all hover:border-primary/20">
                                <div className="relative flex flex-col items-center">
                                    <div className="relative p-1.5 transition-all duration-300">
                                        <ShoppingCart className="w-7 h-7 text-[#1B1F3B] group-hover:text-primary transition-all duration-300 group-hover:scale-110" strokeWidth={1.5} />
                                        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-white text-[10px] font-black flex items-center justify-center rounded-full ring-2 ring-white shadow-lg shadow-primary/30">
                                            2
                                        </span>
                                        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary rounded-full animate-ping opacity-25" />
                                    </div>
                                </div>

                                <div className="hidden lg:flex flex-col ml-3 pl-3 border-l border-gray-200">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Panier</span>
                                    <span className="text-[12px] font-black text-[#1B1F3B] group-hover:text-primary transition-colors">1.250.000 CFA</span>
                                </div>
                            </Link>
                        </div>
                    </Container>
                </div>
            </div>

            {/* 3. Navigation Bar - Black (Updated) */}
            <div className="bg-black text-white border-t border-white/10 hidden md:block">
                <Container className="relative flex items-center h-[55px]">
                    {/* Shop Categories Button */}
                    <div
                        className="h-full flex items-center mr-8 pr-8 border-r border-white/10 cursor-pointer group"
                        onMouseEnter={() => setShowMegaMenu(true)}
                        onMouseLeave={() => setShowMegaMenu(false)}
                    >
                        <div className="flex items-center gap-3 bg-primary text-white px-6 h-[40px] rounded-lg font-bold text-xs uppercase tracking-wide group-hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                            <Menu className="w-4 h-4" />
                            <span>Catégories</span>
                            <ChevronDown className="w-3.5 h-3.5 opacity-70 group-hover:rotate-180 transition-transform" />
                        </div>
                    </div>

                    {/* Links */}
                    <nav className="flex items-center gap-10">
                        {navigation.map((item) => (
                            <div
                                key={item.name}
                                className="relative h-full flex items-center"
                                onMouseEnter={item.hasMegaMenu ? () => setShowMegaMenu(true) : undefined}
                                onMouseLeave={item.hasMegaMenu ? () => setShowMegaMenu(false) : undefined}
                            >
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "text-sm font-bold transition-all uppercase tracking-tight hover:text-primary flex items-center gap-1",
                                        item.active ? "text-primary px-3 py-1 bg-white/5 rounded-md" : "text-gray-300"
                                    )}
                                >
                                    {item.name}
                                    {item.hasMegaMenu && <ChevronDown className="w-3.5 h-3.5 opacity-50" />}
                                    {item.isNew && <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-full ml-1">HOT</span>}
                                </Link>
                            </div>
                        ))}
                    </nav>

                    {/* Mega Menu Overlay */}
                    <AnimatePresence>
                        {showMegaMenu && (
                            <div
                                className="absolute top-full left-0 mt-[1px]"
                                onMouseEnter={() => setShowMegaMenu(true)}
                                onMouseLeave={() => setShowMegaMenu(false)}
                            >
                                <MegaMenu />
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Right Link */}
                    <div className="ml-auto flex items-center gap-6">
                        <Link href="/vendre" className="text-xs font-black text-white uppercase border border-white/20 px-4 py-1.5 rounded-md hover:bg-primary hover:border-primary transition-all">Vendre sur Baraka</Link>
                    </div>
                </Container>
            </div>

            {/* Mobile Header (Visible only on small screens) */}
            <div className={cn(
                "md:hidden bg-white border-b border-gray-100 py-3 px-4 flex items-center justify-between z-[110] transition-all duration-300",
                scrolled ? "fixed top-0 left-0 right-0 shadow-md py-2" : "relative"
            )}>
                <button
                    onClick={() => setIsMenuOpen(true)}
                    className="p-2 hover:bg-gray-50 rounded-xl transition-colors"
                >
                    <Menu className="w-6 h-6 text-[#1B1F3B]" />
                </button>

                <Link href="/" className="absolute left-1/2 -translate-x-1/2">
                    <div className="relative w-[120px] h-[35px]">
                        <Image
                            src="https://baraka.sn/wp-content/uploads/2025/11/WhatsApp-Image-2025-08-30-at-22.56.22-2.png"
                            alt="Baraka Shop"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </Link>

                <div className="flex items-center gap-2">
                    <Link href="/login" className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                        <User className="w-6 h-6 text-[#1B1F3B]" />
                    </Link>
                    <Link href="/cart" className="p-2 hover:bg-gray-50 rounded-xl transition-colors relative">
                        <ShoppingCart className="w-6 h-6 text-[#1B1F3B]" />
                        <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[8px] font-black flex items-center justify-center rounded-full ring-2 ring-white">2</span>
                    </Link>
                </div>
            </div>

            {/* Mobile Search Bar (Always visible on mobile below header) */}
            <div className="md:hidden bg-white px-4 py-3 border-b border-gray-50">
                <div className="flex w-full h-[42px] bg-[#f4f4f4] border border-gray-200 rounded-xl overflow-hidden group">
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        className="flex-1 px-4 bg-transparent outline-none text-sm font-medium"
                    />
                    <button className="px-4 text-gray-400">
                        <Search className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-white z-[160] shadow-2xl flex flex-col"
                        >
                            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                                <div className="relative w-[100px] h-[30px]">
                                    <Image
                                        src="https://baraka.sn/wp-content/uploads/2025/11/WhatsApp-Image-2025-08-30-at-22.56.22-2.png"
                                        alt="Baraka"
                                        fill
                                        className="object-contain object-left"
                                    />
                                </div>
                                <button onClick={() => setIsMenuOpen(false)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                                    <ChevronDown className="w-5 h-5 rotate-90" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto py-6">
                                <nav className="flex flex-col gap-1 px-4">
                                    <span className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Navigation</span>
                                    {navigation.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setIsMenuOpen(false)}
                                            className={cn(
                                                "px-4 py-4 rounded-xl flex items-center justify-between text-sm font-black uppercase tracking-tight transition-all",
                                                item.active ? "bg-primary/5 text-primary" : "text-[#1B1F3B] hover:bg-gray-50"
                                            )}
                                        >
                                            {item.name}
                                            {item.isNew && <span className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full">HOT</span>}
                                        </Link>
                                    ))}
                                </nav>

                                <div className="mt-8 px-8 pt-8 border-t border-gray-50">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 block">Support</span>
                                    <div className="flex flex-col gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-primary">
                                                <PhoneCall className="w-5 h-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-gray-400 uppercase">Service Client</span>
                                                <span className="text-sm font-black text-[#1B1F3B]">+221 33 800 00 00</span>
                                            </div>
                                        </div>
                                        <Link
                                            href="/boutiques"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-4"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-primary">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-gray-400 uppercase">Localisation</span>
                                                <span className="text-sm font-black text-[#1B1F3B]">Nos Boutiques</span>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-gray-50">
                                <Link
                                    href="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="w-full h-14 bg-[#1B1F3B] text-white rounded-xl flex items-center justify-center font-black text-[11px] uppercase tracking-widest gap-2 shadow-xl shadow-gray-200"
                                >
                                    Se connecter <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    )
}

function HeaderAction({ icon: Icon, label, href, badge }: { icon: any, label: string, href: string, badge?: number }) {
    return (
        <Link href={href} className="flex flex-col items-center gap-1 group">
            <div className="relative p-2 bg-gray-50 rounded-xl group-hover:bg-primary/10 transition-all duration-300">
                <Icon className="w-6 h-6 text-[#1B1F3B] group-hover:text-primary transition-all duration-300 group-hover:scale-110" strokeWidth={1.5} />
                {badge !== undefined && badge > 0 && (
                    <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-primary text-white text-[9px] font-bold flex items-center justify-center rounded-full ring-2 ring-white">
                        {badge}
                    </span>
                )}
            </div>
            <span className="text-[10px] font-black uppercase text-[#1B1F3B] tracking-tight group-hover:text-primary transition-all">
                {label}
            </span>
        </Link>
    )
}
