'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, User, ShoppingCart, Heart, Menu, ChevronDown, Zap, MapPin, PhoneCall, ArrowRight, X } from 'lucide-react'
import { Container } from '@/ui/Container'
import { cn } from '@/lib/utils'
import { MegaMenu } from '@/features/home/components/MegaMenu'
import { AnimatePresence, motion } from 'framer-motion'
import { MENU_CATEGORIES } from '@/lib/data'

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

    // Mobile Menu Stack: [{ title: string, items: any[], type: 'main' | 'category' | 'subcategory' }]
    const [menuStack, setMenuStack] = useState<any[]>([{ title: 'Menu', type: 'main' }])

    const currentMenu = menuStack[menuStack.length - 1]

    const handlePushMenu = (title: string, type: string, data?: any) => {
        setMenuStack(prev => [...prev, { title, type, data }])
    }

    const handlePopMenu = () => {
        if (menuStack.length > 1) {
            setMenuStack(prev => prev.slice(0, -1))
        }
    }

    const resetMenu = () => {
        setIsMenuOpen(false)
        setTimeout(() => setMenuStack([{ title: 'Menu', type: 'main' }]), 300)
    }

    React.useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'auto'
        }
    }, [isMenuOpen])

    React.useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header className="w-full flex flex-col font-sans relative">
            {/* ... (Top Bar remains the same) */}
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

            {/* 2. Main Header (Existing code) */}
            <div className={cn(
                "w-full transition-all duration-300 hidden md:block",
                scrolled ? "h-[70px] md:h-[80px]" : "h-auto"
            )}>
                <div className={cn(
                    "bg-white py-4 border-b border-gray-100 transition-all duration-300 z-[100] w-full",
                    scrolled ? "fixed top-0 left-0 right-0 shadow-[0_10px_30px_rgba(0,0,0,0.08)] py-2.5 backdrop-blur-xl bg-white/95" : "relative"
                )}>
                    <Container className="flex flex-col md:flex-row items-center justify-between gap-6">
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
                                            </div>
                                            <Link href="/search" className="block p-4 text-center text-xs font-black text-primary hover:bg-primary hover:text-white transition-all uppercase tracking-widest bg-primary/5"> Voir tous les résultats </Link>
                                        </motion.div>
                                        <div className="fixed inset-0 z-[105] bg-black/5" onClick={() => setIsSearchFocused(false)} />
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex items-center gap-6 md:gap-8">
                            <HeaderAction icon={MapPin} label="Boutiques" href="/boutiques" />
                            <HeaderAction icon={User} label="Compte" href="/login" />
                            <Link href="/cart" className="relative flex items-center group bg-gray-50 hover:bg-primary/5 pl-2 pr-4 py-1.5 rounded-2xl border border-gray-100 transition-all hover:border-primary/20">
                                <div className="relative flex flex-col items-center">
                                    <div className="relative p-1.5 transition-all duration-300">
                                        <ShoppingCart className="w-7 h-7 text-[#1B1F3B] group-hover:text-primary transition-all duration-300 group-hover:scale-110" strokeWidth={1.5} />
                                        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-white text-[10px] font-black flex items-center justify-center rounded-full ring-2 ring-white shadow-lg shadow-primary/30">
                                            2
                                        </span>
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

            {/* 3. Navigation Bar (Desktop) */}
            <div className="bg-black text-white border-t border-white/10 hidden md:block">
                <Container className="relative flex items-center h-[55px]">
                    <div
                        className="h-full flex items-center mr-8 pr-8 border-r border-white/10 cursor-pointer group relative"
                        onMouseEnter={() => setShowMegaMenu(true)}
                        onMouseLeave={() => setShowMegaMenu(false)}
                    >
                        <div className="flex items-center gap-3 bg-primary text-white px-6 h-[40px] rounded-lg font-bold text-xs uppercase tracking-wide group-hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                            <Menu className="w-4 h-4" />
                            <span>Catégories</span>
                            <ChevronDown className="w-3.5 h-3.5 opacity-70 group-hover:rotate-180 transition-transform" />
                        </div>
                        <AnimatePresence>
                            {showMegaMenu && (
                                <div className="absolute top-full left-0 mt-[1px]" onMouseEnter={() => setShowMegaMenu(true)} onMouseLeave={() => setShowMegaMenu(false)}>
                                    <MegaMenu />
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

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

                    {/* Right Link */}
                    <div className="ml-auto flex items-center gap-6">
                        <Link href="/vendre" className="text-xs font-black text-white uppercase border border-white/20 px-4 py-1.5 rounded-md hover:bg-primary hover:border-primary transition-all">Vendre sur Baraka</Link>
                    </div>
                </Container>
            </div>

            {/* Mobile Header */}
            <div className={cn(
                "md:hidden bg-white border-b border-gray-100 py-3 px-4 flex items-center justify-between z-[110] transition-all duration-300",
                scrolled ? "fixed top-0 left-0 right-0 shadow-md py-2" : "relative"
            )}>
                <button onClick={() => setIsMenuOpen(true)} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                    <Menu className="w-6 h-6 text-[#1B1F3B]" />
                </button>
                <Link href="/" className="absolute left-1/2 -translate-x-1/2">
                    <div className="relative w-[120px] h-[35px]">
                        <Image src="https://baraka.sn/wp-content/uploads/2025/11/WhatsApp-Image-2025-08-30-at-22.56.22-2.png" alt="Baraka Shop" fill className="object-contain" priority />
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

            {/* Mobile Search Bar */}
            <div className="md:hidden bg-white px-4 py-3 border-b border-gray-50">
                <div className="flex w-full h-[42px] bg-[#f4f4f4] border border-gray-200 rounded-xl overflow-hidden group">
                    <input type="text" placeholder="Rechercher..." className="flex-1 px-4 bg-transparent outline-none text-sm font-medium" />
                    <button className="px-4 text-gray-400">
                        <Search className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Premium Mobile Menu Drawer with Drill-down */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={resetMenu}
                            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[150]"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: "spring", damping: 28, stiffness: 220 }}
                            className="fixed top-0 left-0 bottom-0 w-[88%] max-w-[340px] bg-white z-[160] shadow-2xl flex flex-col overflow-hidden"
                        >
                            {/* Drawer Header - Refined & Premium */}
                            <div className="px-6 py-8 flex items-center justify-between">
                                {menuStack.length > 1 ? (
                                    <motion.button
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        onClick={handlePopMenu}
                                        className="flex items-center gap-2 text-[#1B1F3B] group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                            <ChevronDown className="w-5 h-5 rotate-90" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Retour</span>
                                    </motion.button>
                                ) : (
                                    <div className="relative w-[110px] h-[35px]">
                                        <Image src="https://baraka.sn/wp-content/uploads/2025/11/WhatsApp-Image-2025-08-30-at-22.56.22-2.png" alt="Baraka" fill className="object-contain object-left" />
                                    </div>
                                )}

                                <button
                                    onClick={resetMenu}
                                    className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-primary transition-all shadow-lg shadow-black/10"
                                    aria-label="Fermer le menu"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Drawer Content */}
                            <div className="flex-1 overflow-x-hidden overflow-y-auto relative bg-white px-6">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={menuStack.length}
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: -20, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                        className="h-full"
                                    >
                                        {currentMenu.type === 'main' && (
                                            <div className="py-2 flex flex-col h-full">
                                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-6 block">Catégories</span>
                                                <div className="space-y-3">
                                                    {MENU_CATEGORIES.map((cat, idx) => (
                                                        <motion.button
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: idx * 0.05 }}
                                                            key={cat.id}
                                                            onClick={() => handlePushMenu(cat.title, 'category', cat)}
                                                            className="w-full flex items-center justify-between p-4 bg-[#fcfcfc] border border-gray-50 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all text-left group"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="relative w-11 h-11 bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm group-hover:scale-110 transition-transform">
                                                                    <Image src={cat.image} alt={cat.title} fill className="object-cover" />
                                                                </div>
                                                                <span className="text-sm font-black text-[#1B1F3B] uppercase tracking-tight">{cat.title}</span>
                                                            </div>
                                                            <ChevronDown className="w-4 h-4 text-gray-300 -rotate-90 group-hover:text-primary transition-colors" />
                                                        </motion.button>
                                                    ))}
                                                </div>

                                                <div className="mt-12 pt-8 border-t border-gray-50 mb-10">
                                                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-6 block">Explorer</span>
                                                    <div className="grid grid-cols-1 gap-5">
                                                        <Link href="/promotions" onClick={resetMenu} className="flex items-center justify-between group">
                                                            <span className="text-sm font-black text-[#1B1F3B] uppercase group-hover:text-primary transition-colors">Promotions</span>
                                                            <span className="bg-red-500 text-white text-[8px] px-2 py-0.5 rounded-full font-black">HOT</span>
                                                        </Link>
                                                        <Link href="/boutiques" onClick={resetMenu} className="text-sm font-black text-[#1B1F3B] uppercase hover:text-primary transition-colors">Nos Boutiques</Link>
                                                        <Link href="/vendre" onClick={resetMenu} className="text-sm font-black text-primary uppercase flex items-center gap-2 group">
                                                            Vendre sur Baraka <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {currentMenu.type === 'category' && (
                                            <div className="py-2">
                                                <div className="space-y-2">
                                                    {currentMenu.data.subcategories.map((sub: any, idx: number) => (
                                                        <motion.button
                                                            initial={{ opacity: 0, x: 10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: idx * 0.04 }}
                                                            key={idx}
                                                            onClick={() => handlePushMenu(sub.label, 'subcategory', sub)}
                                                            className="w-full flex items-center justify-between p-5 rounded-2xl border-b border-gray-50 hover:bg-gray-50 transition-colors text-left"
                                                        >
                                                            <span className="text-sm font-bold text-[#1B1F3B] uppercase tracking-wide">{sub.label}</span>
                                                            <ChevronDown className="w-4 h-4 text-gray-300 -rotate-90" />
                                                        </motion.button>
                                                    ))}
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: 0.3 }}
                                                    >
                                                        <Link
                                                            href={`/category/${currentMenu.data.id}`}
                                                            onClick={resetMenu}
                                                            className="w-full flex items-center justify-center p-5 mt-8 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] hover:bg-primary transition-colors shadow-lg shadow-black/10"
                                                        >
                                                            Voir tout {currentMenu.data.title}
                                                        </Link>
                                                    </motion.div>
                                                </div>
                                            </div>
                                        )}

                                        {currentMenu.type === 'subcategory' && (
                                            <div className="py-2">
                                                <div className="space-y-1">
                                                    {currentMenu.data.links.map((link: string, idx: number) => (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 5 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: idx * 0.03 }}
                                                            key={link}
                                                        >
                                                            <Link
                                                                href={`/category/${link.toLowerCase().replace(/ /g, '-')}`}
                                                                onClick={resetMenu}
                                                                className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-all group"
                                                            >
                                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-primary transition-all group-hover:scale-150" />
                                                                <span className="text-sm font-medium text-gray-500 group-hover:text-[#1B1F3B] transition-colors uppercase">{link}</span>
                                                                <ChevronDown className="w-3.5 h-3.5 text-gray-300 -rotate-90 ml-auto opacity-0 group-hover:opacity-100 transition-all translate-x-1" />
                                                            </Link>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Drawer Footer - Refined & Standard */}
                            <div className="p-8 bg-white border-t border-gray-50">
                                <Link
                                    href="/login"
                                    onClick={resetMenu}
                                    className="w-full h-[60px] bg-[#1B1F3B] text-white rounded-xl flex items-center justify-between px-6 font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-[#1B1F3B]/20 hover:bg-[#252a50] transition-all group"
                                >
                                    <span>Espace Client</span>
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                                        <User className="w-4 h-4" />
                                    </div>
                                </Link>
                                <p className="text-center mt-6 text-[8px] font-black text-gray-300 uppercase tracking-[0.3em]">
                                    Baraka Shop — Qualité & Service
                                </p>
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
