'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, User, ShoppingCart, Heart, Menu, ChevronDown, Zap, MapPin, PhoneCall, ArrowRight, X, ShoppingBag, Sparkles, ShieldCheck, Store } from 'lucide-react'
import { Container } from '@/ui/Container'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'
import { AnimatePresence, motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useCart } from '@/context/CartContext'
import { useRouter, usePathname } from 'next/navigation'
import { getProductsAction, getMegaMenuAction } from '@/lib/actions/product-actions'
import { getStoresAction } from '@/lib/actions/store-actions'
import { useSiteLogos } from '@/lib/hooks/useSiteLogos'
const MegaMenu = dynamic(() => import('@/features/home/components/MegaMenu').then(mod => mod.MegaMenu), { ssr: false })
const CartToast = dynamic(() => import('@/components/CartToast').then(mod => mod.CartToast), { ssr: false })
const MiniCart = dynamic(() => import('@/components/MiniCart').then(mod => mod.MiniCart), { ssr: false })
import { BorderGlow } from '@/components/BorderGlow'
import { ProfileDropdown } from './ProfileDropdown'

const SUGGESTIONS = [
    { id: 1, name: "MacBook Pro M3 Max", category: "INFORMATIQUE", price: "2 500 000FCFA", image: "https://media.ldlc.com/encart/p/28885_b.jpg" },
    { id: 2, name: "iPhone 15 Pro Titanium", category: "TELEPHONE & TABLETTE", price: "850 000FCFA", image: "https://media.ldlc.com/encart/p/28828_b.jpg" },
    { id: 3, name: "Sony WH-1000XM5 Black", category: "IMAGE & SON", price: "250 000FCFA", image: "https://media.ldlc.com/encart/p/28829_b.jpg" },
    { id: 4, name: "Canon EOS R6 Mark II", category: "IMAGE & SON", price: "1 800 000FCFA", image: "https://media.ldlc.com/encart/p/22889_b.jpg" },
]

const CLEAN_IMAGES: Record<string, string> = {
    'BATTERIE': '/categories/batterie.png',
    'CABLE': '/categories/cable.png',
    'CHARGEUR': '/categories/chargeur.png',
    'CONNECTIQUE': '/categories/connectique.png',
    'CONSOMMABLES': '/categories/consommables.png',
    'ELECTRONIQUE': '/categories/electronique.png',
    'GÉNÉRAL': '/categories/general.png',
    'GÉNERAL': '/categories/general.png',
    'IMAGE & SON': '/categories/image-son.png',
    'INFORMATIQUE': '/categories/informatique.png',
    'TELEPHONE & TABLETTE': '/categories/chargeur.png',
    'RESEAUX': '/categories/connectique.png',
    'SECURITE': '/categories/electronique.png',
    'ELECTROMENAGER': '/categories/chargeur.png',
    'BUREAUTIQUE': '/categories/consommables.png',
    'MULTIMEDIA': '/categories/cable.png',
    'CONSOLES & JEUX': '/categories/electronique.png',
    'JEUX & LOISIRS': '/categories/electronique.png',
    'DEFAULT': '/categories/general.png'
};

const SUBTITLES: Record<string, string> = {
    'INFORMATIQUE': 'MacBook, PC & Portables',
    'TELEPHONE & TABLETTE': 'iPhone, Galaxy & iPad',
    'IMAGE & SON': 'TV, Casques & Caméras',
    'CONSOLES & JEUX': 'PS5, Xbox & Gaming',
    'JEUX & LOISIRS': 'PS5, Xbox & Gaming',
    'RESEAUX': 'Routeurs & Wifi 7',
    'SECURITE': 'Caméras & Alarmes',
    'ELECTROMENAGER': 'Maison Intelligente',
    'BUREAUTIQUE': 'Imprimantes & Impression',
    'MULTIMEDIA': 'Streaming & Cinéma',
    'BATTERIE': 'Externes & Internes',
    'CABLE': 'HDMI, USB & Réseau',
    'CHARGEUR': 'Secteur & Induction',
    'CONNECTIQUE': 'Adaptateurs & Hubs',
    'CONSOMMABLES': 'Encre & Papier',
    'ELECTRONIQUE': 'Composants & Gadgets',
    'GÉNÉRAL': 'Univers High-Tech',
    'GÉNERAL': 'Univers High-Tech'
};

interface NavigationItem {
    name: string;
    href: string;
    active?: boolean;
    hasMegaMenu?: boolean;
    isNew?: boolean;
}

const navigation: NavigationItem[] = [
    { name: 'Boutique', href: '/boutique', active: true },
    { name: 'Consommable', href: '/boutique?category=consommables&page=1' },
    { name: 'Promotions', href: '/promotions', isNew: true },
    { name: 'Nouveautés', href: '/nouveautes', isNew: true },
]

export function Header() {
    const router = useRouter()
    const { data: session, status } = useSession()
    const isLoggedIn = status === "authenticated"
    const { itemCount, subtotal, lastAddedItem, isToastVisible, hideToast } = useCart()
    const { headerLogo } = useSiteLogos()

    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isCartOpen, setIsCartOpen] = useState(false) // Pour le MiniCart futur
    const [showMegaMenu, setShowMegaMenu] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [searchSuggestions, setSearchSuggestions] = useState<any[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [categories, setCategories] = useState<any[]>([])
    const [stores, setStores] = useState<any[]>([])
    const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const handleMenuEnter = () => {
        if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current)
        menuTimeoutRef.current = setTimeout(() => {
            setShowMegaMenu(true)
            // Re-fetch categories each time the menu opens to ensure dynamic content
            getMegaMenuAction().then(data => {
                if (data && data.length > 0) setCategories(data)
            }).catch(() => {})
        }, 250) // S'ouvre après 250ms de survol (intent delay)
    }

    const handleMenuLeave = () => {
        if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current)
        menuTimeoutRef.current = setTimeout(() => {
            setShowMegaMenu(false)
        }, 150)
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesData, storesList] = await Promise.all([
                    getMegaMenuAction(),
                    getStoresAction()
                ]);

                setCategories(categoriesData || []);
                setStores(Array.isArray(storesList) ? storesList : []);
            } catch (err) {
                console.error('Header fetch error:', err);
            }
        }
        fetchData();
    }, [])

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/boutique?q=${encodeURIComponent(searchQuery.trim())}`)
            setIsSearchFocused(false)
            setSearchQuery('')
        }
    }

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchQuery.length >= 2) {
                setIsSearching(true)
                try {
                    const result = await getProductsAction({ query: searchQuery, limit: 5 })
                    setSearchSuggestions(result.products)
                } catch (error) {
                    console.error('Search suggestions error:', error)
                    setSearchSuggestions([])
                } finally {
                    setIsSearching(false)
                }
            } else {
                setSearchSuggestions([])
            }
        }
        const timer = setTimeout(fetchSuggestions, 300)
        return () => clearTimeout(timer)
    }, [searchQuery])

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

    const pathname = usePathname()

    const resetMenu = () => {
        setIsMenuOpen(false)
        document.body.style.overflow = ''
        setTimeout(() => setMenuStack([{ title: 'Menu', type: 'main' }]), 250)
    }

    const navigateTo = (url: string) => {
        setIsMenuOpen(false)
        document.body.style.overflow = ''
        setTimeout(() => setMenuStack([{ title: 'Menu', type: 'main' }]), 250)
        router.push(url)
        router.refresh()
    }

    React.useEffect(() => {
        setIsMenuOpen(false)
        document.body.style.overflow = ''
        setMenuStack([{ title: 'Menu', type: 'main' }])
    }, [pathname])

    React.useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden'
            // Re-fetch categories and stores when mobile menu opens
            getMegaMenuAction().then(data => {
                if (data && data.length > 0) setCategories(data)
            }).catch(() => {})
            getStoresAction().then(data => {
                if (Array.isArray(data) && data.length > 0) setStores(data)
            }).catch(() => {})
        } else {
            document.body.style.overflow = ''
        }
    }, [isMenuOpen])

    React.useEffect(() => {
        let isScrolled = false
        const handleScroll = () => {
            const nextScrolled = window.scrollY > 50
            if (nextScrolled !== isScrolled) {
                isScrolled = nextScrolled
                setScrolled(nextScrolled)
            }
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <>
            {/* ... (Top Bar remains the same) */}
            <div className="bg-black text-white text-[11px] md:text-xs py-2.5 font-medium tracking-wide hidden md:block">
                    <Container className="flex justify-between items-center">
                        <div className="flex items-center gap-6">
                            <Link href="/promotions" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                                <Zap className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                                <span>Flash Sale</span>
                            </Link>
                            <Link href="/contact" className="hidden sm:block hover:text-primary transition-colors border-l border-white/20 pl-6">Nous Contacter</Link>
                        </div>

                        <div className="flex items-center gap-6">
                            <Link
                                href={isLoggedIn ? ((session?.user as any)?.role === 'ADMIN' ? "/admin" : "/account") : "/login"}
                                className="hover:text-primary transition-colors border-r border-white/20 pr-6 uppercase font-black"
                            >
                                {isLoggedIn ? (session?.user as any)?.username || "Mon Compte" : "Connexion"}
                            </Link>
                            <span className="flex items-center gap-2 text-gray-400">
                                Besoin d'aide ? <PhoneCall className="w-3 h-3 text-primary" /> <span className="text-white">+221 33 822 34 22</span>
                            </span>
                        </div>
                    </Container>
                </div>

            {/* 2. Main Header (Existing code) */}
            <div className={cn(
                "sticky top-0 z-[100] w-full transition-all duration-300 hidden md:block",
                scrolled ? "shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl bg-white/95" : "bg-white"
            )}>
                <div className={cn(
                    "py-2 border-b border-gray-100 transition-all duration-300 w-full",
                    scrolled ? "py-2.5" : ""
                )}>
                    <Container className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <Link href="/" className="shrink-0 flex items-center">
                            <img
                                src={headerLogo}
                                alt="Baraka Shop"
                                className="h-10 md:h-14 w-auto object-contain"
                            />
                        </Link>

                        <div className="flex-1 w-full max-w-2xl px-4 relative">
                            <form onSubmit={handleSearch} className={cn(
                                "flex w-full h-[46px] bg-[#f4f4f4] border border-gray-200 rounded-lg overflow-hidden transition-all focus-within:bg-white focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10",
                                scrolled && "h-[40px]"
                            )}>
                                <div className="flex-1 relative flex items-center">
                                    <input
                                        type="text"
                                        placeholder="Rechercher un produit, une marque..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => setIsSearchFocused(true)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="w-full px-6 h-full bg-transparent outline-none text-base placeholder:text-gray-400 font-medium"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-2 p-1.5 text-gray-400 hover:text-primary transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <button type="submit" className="bg-primary hover:bg-primary/90 text-white w-[50px] h-full flex items-center justify-center transition-colors shrink-0">
                                    <Search className="w-5 h-5" />
                                </button>
                            </form>

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
                                                {searchSuggestions.map((item: any) => (
                                                    <Link
                                                        key={item.id}
                                                        href={`/product/${item.id}`}
                                                        className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group border-b border-gray-50 last:border-0"
                                                        onClick={() => {
                                                            setIsSearchFocused(false)
                                                            setSearchQuery('')
                                                        }}
                                                    >
                                                        <div className="relative w-12 h-12 bg-white rounded-md border border-gray-100 overflow-hidden shrink-0">
                                                            <Image src={item.images?.[0] || item.image || '/placeholder.png'} alt={item.name} fill className="object-contain p-1 group-hover:scale-110 transition-transform" unoptimized />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-[#1B1F3B] group-hover:text-primary transition-colors">{item.name}</span>
                                                            <span className="text-[11px] text-gray-400 font-medium uppercase">{item.category?.name || item.category}</span>
                                                        </div>
                                                        <div className="ml-auto flex flex-col items-end gap-1">
                                                            <span className="text-sm font-black text-[#1B1F3B]">{item.price.toLocaleString()} FCFA</span>
                                                            {item.stock > 0 ? (
                                                                <span className="bg-green-50 text-green-600 text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-widest border border-green-100 flex items-center gap-1">
                                                                    <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                                                                    En Stock
                                                                </span>
                                                            ) : (
                                                                <span className="bg-red-50 text-red-600 text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-widest border border-red-100">
                                                                    Rupture
                                                                </span>
                                                            )}
                                                        </div>
                                                    </Link>
                                                ))}
                                                {searchSuggestions.length === 0 && (
                                                    <div className="p-8 text-center text-gray-400 text-xs font-medium italic">
                                                        Aucun produit trouvé...
                                                    </div>
                                                )}
                                            </div>
                                            <Link
                                                href={`/boutique?q=${searchQuery}`}
                                                className="block p-4 text-center text-xs font-black text-primary hover:bg-primary hover:text-white transition-all uppercase tracking-widest bg-primary/5"
                                                onClick={() => {
                                                    setIsSearchFocused(false)
                                                    setSearchQuery('')
                                                }}
                                            >
                                                Voir tous les résultats
                                            </Link>
                                        </motion.div>
                                        <div className="fixed inset-0 z-[105] bg-black/5" onClick={() => setIsSearchFocused(false)} />
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex items-center gap-6 md:gap-8">
                            <HeaderAction icon={MapPin} label="Boutiques" href="/boutiques" />
                            <ProfileDropdown
                                isLoggedIn={isLoggedIn}
                                session={session}
                            />
                            <div
                                onClick={() => setIsCartOpen(true)}
                                className="relative flex items-center group bg-gray-50 hover:bg-primary/5 pl-2 pr-4 py-1.5 rounded-2xl border border-gray-100 transition-all hover:border-primary/20 cursor-pointer"
                            >
                                <div className="relative flex flex-col items-center">
                                    <div className="relative p-1.5 transition-all duration-300">
                                        <ShoppingCart className="w-7 h-7 text-[#1B1F3B] group-hover:text-primary transition-all duration-300 group-hover:scale-110" strokeWidth={1.5} />
                                        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-white text-[10px] font-black flex items-center justify-center rounded-full ring-2 ring-white shadow-lg shadow-primary/30">
                                            {itemCount}
                                        </span>
                                    </div>
                                </div>
                                <div className="hidden lg:flex flex-col ml-3 pl-3 border-l border-gray-200">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Panier</span>
                                    <span className="text-[12px] font-black text-[#1B1F3B] group-hover:text-primary transition-colors">{subtotal.toLocaleString()} FCFA</span>
                                </div>
                            </div>
                        </div>
                    </Container>
                </div>
            </div>

            <div className="bg-black text-white border-t border-white/10 hidden md:block relative z-[90]">
                {/* Subtle Electronics & Computing Tech Pattern Background */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.22] select-none overflow-hidden">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        {/* On va diminuer l'opacité du fond en 1/4 pour qu'il soit plus subtil */}
                        <defs opacity="0.25">
                            {/* Sleek micro-dot matrix pattern */}
                            <pattern id="dot-matrix" width="16" height="16" patternUnits="userSpaceOnUse">
                                <circle cx="8" cy="8" r="0.75" fill="rgba(255, 255, 255, 0.45)" />
                            </pattern>
                            {/* Premium carbon fiber diagonal tech stripes */}
                            <pattern id="diagonal-stripes" width="10" height="10" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                                <line x1="0" y1="0" x2="0" y2="10" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1.5" />
                                <line x1="0" y1="0" x2="0" y2="10" stroke="rgba(249, 115, 22, 0.18)" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#dot-matrix)" />
                        <rect width="100%" height="100%" fill="url(#diagonal-stripes)" />
                    </svg>
                </div>
                <Container className="relative flex items-center h-[55px] lg:h-[60px] z-10">
                    {/* Menu Categories - Fixed Left */}
                    <div
                        className="h-full flex items-center mr-2 md:mr-4 lg:mr-8 pr-2 md:pr-4 lg:pr-8 border-r border-white/10 cursor-pointer group shrink-0"
                        onMouseEnter={handleMenuEnter}
                        onMouseLeave={handleMenuLeave}
                    >
                        <BorderGlow
                            glowColor="21 82 51"
                            backgroundColor="#E8621A"
                            borderRadius={9999}
                            glowRadius={14}
                            glowIntensity={1.6}
                            colors={['#d95213', '#ffffff', '#E8621A']}
                            animated={true}
                            edgeSensitivity={20}
                            className="text-white px-4 lg:px-6 w-auto h-[36px] md:h-[40px] lg:h-[48px] font-black text-xs lg:text-sm uppercase tracking-wide shadow-[0_0_15px_rgba(232,98,26,0.2)] transition-all overflow-visible flex items-center justify-center border-none"
                        >
                            <div className="flex items-center justify-between w-full h-full gap-3 py-1">
                                <div className="flex items-center gap-1.5 lg:gap-3">
                                    <Menu className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                                    <span className="whitespace-nowrap">Tous nos produits</span>
                                </div>
                                <ChevronDown className={cn("w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 opacity-70 transition-transform duration-300", showMegaMenu && "rotate-180")} />
                            </div>
                        </BorderGlow>
                        <AnimatePresence>
                            {showMegaMenu && (
                                <div className="absolute top-full left-0 w-full z-[120] px-4 md:px-6 lg:px-8">
                                    <MegaMenu categories={categories} onClose={() => setShowMegaMenu(false)} />
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Adaptive Container for Links and Stores (No Scroll) */}
                    <div className="flex-1 flex items-center min-w-0 h-full">
                        <div className="flex items-center justify-between w-full min-w-0 gap-2 lg:gap-8">
                            {/* Middle Navigation Links */}
                            <nav className="flex items-center gap-0.5 md:gap-1 lg:gap-3 shrink min-w-0">
                                {navigation.map((item) => (
                                    <div
                                        key={item.name}
                                        className="relative h-full flex items-center shrink min-w-0"
                                        onMouseEnter={item.hasMegaMenu ? handleMenuEnter : undefined}
                                        onMouseLeave={item.hasMegaMenu ? handleMenuLeave : undefined}
                                    >
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                "text-[9px] md:text-[10px] lg:text-[12px] xl:text-[13px] font-bold transition-all uppercase tracking-tight hover:text-primary flex items-center gap-1 whitespace-nowrap px-1.5 md:px-2 lg:px-2.5 py-1 md:py-1.5 rounded-lg truncate",
                                                item.active ? "text-primary bg-white/5" : "text-gray-300 hover:bg-white/5 hover:text-white"
                                            )}
                                        >
                                            <span className="truncate">{item.name}</span>
                                            {item.hasMegaMenu && <ChevronDown className="w-2.5 h-2.5 md:w-3 md:h-3 lg:w-3.5 lg:h-3.5 opacity-50 shrink-0" />}
                                            {item.isNew && <span className="text-[7px] md:text-[8px] lg:text-[9px] bg-red-500 text-white px-1 md:px-1.5 py-0.5 rounded-md ml-0.5 font-black shadow-sm shrink-0">HOT</span>}
                                        </Link>
                                    </div>
                                ))}
                            </nav>

                            {/* Right Link - Dynamic Stores */}
                            <div className="flex items-center gap-1 lg:gap-2 shrink min-w-0 pl-2 lg:pl-8 border-l border-white/10">
                                {stores.length > 0 ? (
                                    <div className="flex items-center gap-1 lg:gap-2 min-w-0">
                                        {stores.map((store) => (
                                            <Link
                                                key={store.id}
                                                href={`/store/${store.slug}`}
                                                className="group flex items-center gap-1 md:gap-1.5 lg:gap-2 px-1.5 md:px-2 lg:px-3 py-1 lg:py-1.5 rounded-full border border-white/10 hover:bg-white transition-all shrink min-w-0 bg-white/5 hover:shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                                                title={store.name}
                                            >
                                                {store.logo && (
                                                    <div className="relative w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 rounded-full overflow-hidden bg-white/10 group-hover:bg-gray-100 transition-all shrink-0">
                                                        <Image
                                                            src={store.logo}
                                                            alt={store.name}
                                                            fill
                                                            className="object-contain p-[2px]"
                                                        />
                                                    </div>
                                                )}
                                                <span className="text-[8px] md:text-[9px] lg:text-[11px] xl:text-xs font-black text-gray-300 group-hover:text-[#1B1F3B] uppercase tracking-wider truncate transition-colors">
                                                    {store.name}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <Link href="/contact" className="text-[8px] md:text-[10px] lg:text-xs font-black text-white uppercase border border-white/20 px-2 md:px-3 lg:px-4 py-1 lg:py-1.5 rounded-md hover:bg-primary hover:border-primary hover:shadow-[0_0_15px_rgba(var(--primary),0.3)] transition-all whitespace-nowrap shrink-0">
                                        Vendre sur Baraka
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </Container>
            </div>

            {/* Mobile Header (Mobile First) */}
            <div className={cn(
                "sticky top-0 md:hidden bg-white/95 backdrop-blur-md border-b border-gray-100 py-2.5 px-3 sm:px-4 flex items-center justify-between z-[110] transition-all duration-300",
                scrolled ? "shadow-md py-2" : ""
            )}>
                <button
                    onClick={() => setIsMenuOpen(true)}
                    className="w-10 h-10 rounded-xl hover:bg-gray-100 active:scale-95 flex items-center justify-center transition-all text-[#1B1F3B]"
                    aria-label="Ouvrir le menu"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center">
                    <img src={headerLogo} alt="Baraka Shop" className="h-10 sm:h-12 w-auto object-contain" />
                </Link>

                <div className="flex items-center gap-1">
                    <ProfileDropdown
                        isLoggedIn={isLoggedIn}
                        session={session}
                        isMobile
                    />
                    <Link
                        href="/cart"
                        className="w-10 h-10 rounded-xl hover:bg-gray-100 active:scale-95 flex items-center justify-center transition-all relative text-[#1B1F3B]"
                        aria-label="Panier d'achats"
                    >
                        <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                        {itemCount > 0 && (
                            <span className="absolute top-1 right-1 min-w-[17px] h-[17px] px-1 bg-primary text-white text-[8px] font-black flex items-center justify-center rounded-full ring-2 ring-white">
                                {itemCount > 99 ? '99+' : itemCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>

            {/* Mobile Search Bar */}
            <div className="md:hidden bg-white px-3 sm:px-4 py-2.5 border-b border-gray-100 relative">
                <form onSubmit={handleSearch} className="flex w-full h-11 bg-[#f4f4f4] border border-gray-200/80 rounded-xl overflow-hidden focus-within:bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                    <div className="flex-1 relative flex items-center">
                        <Search className="w-4 h-4 text-gray-400 ml-3 shrink-0 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Rechercher un produit..."
                            className={cn(
                                "w-full pl-2 bg-transparent outline-none text-xs sm:text-sm font-medium text-[#1B1F3B] placeholder:text-gray-400",
                                searchQuery ? "pr-8" : "pr-2"
                            )}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-1 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 active:scale-90"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <button type="submit" aria-label="Rechercher" className="w-11 bg-primary hover:bg-[#d95213] text-white flex items-center justify-center transition-colors shrink-0 active:scale-95">
                        <Search className="w-4 h-4" />
                    </button>
                </form>

                {/* Mobile Search Suggestions */}
                <AnimatePresence>
                    {isSearchFocused && (searchQuery.length > 1 || searchSuggestions.length > 0) && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute left-0 right-0 top-full bg-white z-[150] shadow-2xl border-t border-gray-100 max-h-[70vh] overflow-y-auto"
                        >
                            {isSearching ? (
                                <div className="p-8 text-center">
                                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Recherche en cours...</p>
                                </div>
                            ) : searchSuggestions.length > 0 ? (
                                <div className="flex flex-col">
                                    <div className="p-4 bg-gray-50/50 border-b border-gray-100">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Résultats suggérés</span>
                                    </div>
                                    {searchSuggestions.map((item: any) => (
                                        <Link
                                            key={item.id}
                                            href={`/product/${item.id}`}
                                            className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group border-b border-gray-50 last:border-0"
                                            onClick={() => {
                                                setIsSearchFocused(false)
                                                setSearchQuery('')
                                            }}
                                        >
                                            <div className="relative w-12 h-12 bg-white rounded-md border border-gray-100 overflow-hidden shrink-0">
                                                <Image src={item.images?.[0] || item.image || '/placeholder.png'} alt={item.name} fill className="object-contain p-1 group-hover:scale-110 transition-transform" unoptimized />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-[#1B1F3B] truncate group-hover:text-primary transition-colors uppercase tracking-tight">{item.name}</h4>
                                                <p className="text-[10px] font-black text-primary">{item.price.toLocaleString()} FCFA</p>
                                            </div>
                                        </Link>
                                    ))}
                                    <Link
                                        href={`/boutique?q=${searchQuery}`}
                                        className="block p-4 text-center text-xs font-black text-primary hover:bg-primary hover:text-white transition-all uppercase tracking-widest bg-primary/5"
                                        onClick={() => {
                                            setIsSearchFocused(false)
                                            setSearchQuery('')
                                        }}
                                    >
                                        Voir tous les résultats
                                    </Link>
                                </div>
                            ) : searchQuery.length > 1 ? (
                                <div className="p-8 text-center text-gray-400">
                                    <Search className="w-8 h-8 mx-auto mb-4 opacity-20" />
                                    <p className="text-xs font-black uppercase tracking-widest">Aucun résultat trouvé</p>
                                </div>
                            ) : null}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Mobile Boutiques Strip (Quick access to stores on mobile) */}
            {stores.length > 0 && (
                <div className="md:hidden bg-[#0A0D14] text-white border-b border-white/10 px-3 py-1.5 relative overflow-hidden">
                    {/* Subtle dot matrix pattern */}
                    <div className="absolute inset-0 pointer-events-none opacity-20">
                        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="dot-matrix-mobile" width="12" height="12" patternUnits="userSpaceOnUse">
                                    <circle cx="6" cy="6" r="0.75" fill="rgba(255, 255, 255, 0.5)" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#dot-matrix-mobile)" />
                        </svg>
                    </div>
                    <div className="relative z-10 flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                        {stores.map((store) => (
                            <Link
                                key={store.id}
                                href={`/store/${store.slug}`}
                                className="group flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/15 bg-white/5 active:scale-95 hover:bg-white transition-all shrink-0"
                                title={store.name}
                            >
                                {store.logo && (
                                    <div className="relative w-3.5 h-3.5 rounded-full overflow-hidden bg-white/10 group-hover:bg-gray-100 transition-all shrink-0">
                                        <Image
                                            src={store.logo}
                                            alt={store.name}
                                            fill
                                            className="object-contain p-[1px]"
                                            unoptimized
                                        />
                                    </div>
                                )}
                                <span className="text-[9px] sm:text-[10px] font-black text-gray-200 group-hover:text-[#1B1F3B] uppercase tracking-wider whitespace-nowrap transition-colors">
                                    {store.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

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
                            className="fixed top-0 left-0 bottom-0 w-[86vw] max-w-[360px] bg-white z-[160] shadow-2xl flex flex-col overflow-hidden border-r border-gray-100"
                        >
                            {/* Drawer Header - Compact & Sleek */}
                            <div className="px-4 sm:px-5 py-3.5 flex items-center justify-between border-b border-gray-100 bg-white/95 backdrop-blur-md shrink-0">
                                {menuStack.length > 1 ? (
                                    <motion.button
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        onClick={handlePopMenu}
                                        className="flex items-center gap-2 text-[#1B1F3B] group"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                            <ChevronDown className="w-4 h-4 rotate-90" />
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Retour</span>
                                            <span className="text-xs font-black uppercase tracking-tight text-[#1B1F3B] truncate max-w-[170px]">{currentMenu.title}</span>
                                        </div>
                                    </motion.button>
                                ) : (
                                    <img src={headerLogo} alt="Baraka" className="h-8 sm:h-9 w-auto object-contain" />
                                )}

                                <button
                                    onClick={resetMenu}
                                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-100 hover:bg-black hover:text-white text-[#1B1F3B] flex items-center justify-center transition-all active:scale-90"
                                    aria-label="Fermer le menu"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Drawer Content */}
                            <div className="flex-1 overflow-x-hidden overflow-y-auto relative bg-white px-4 sm:px-5 py-3">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={menuStack.length}
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: -20, opacity: 0 }}
                                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                                        className="h-full flex flex-col"
                                    >
                                        {currentMenu.type === 'main' && (
                                            <div className="flex flex-col h-full">
                                                {/* Top Quick Customer Shortcuts */}
                                                <div className="grid grid-cols-2 gap-2 mb-3 shrink-0">
                                                    <button
                                                        onClick={() => navigateTo('/boutique')}
                                                        className="flex items-center gap-2 p-2 sm:p-2.5 rounded-xl bg-gray-50 border border-gray-100/80 hover:bg-white hover:border-primary/30 transition-all group text-left active:scale-98"
                                                    >
                                                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-[11px] font-black uppercase text-[#1B1F3B] tracking-tight group-hover:text-primary transition-colors">Boutique</span>
                                                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Tout voir</span>
                                                        </div>
                                                    </button>

                                                    <button
                                                        onClick={() => navigateTo('/promotions')}
                                                        className="flex items-center gap-2 p-2 sm:p-2.5 rounded-xl bg-red-50/70 border border-red-100/80 hover:bg-red-50 hover:border-red-200 transition-all group relative overflow-hidden text-left active:scale-98"
                                                    >
                                                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-[11px] font-black uppercase text-red-600 tracking-tight">Promos</span>
                                                                <span className="bg-red-500 text-white text-[7px] px-1 py-0.2 rounded-full font-black leading-none">HOT</span>
                                                            </div>
                                                            <span className="text-[8px] font-bold text-red-400 uppercase tracking-wider">Bons plans</span>
                                                        </div>
                                                    </button>
                                                </div>

                                                {/* Nos Boutiques Partenaires */}
                                                {stores.length > 0 && (
                                                    <div className="mb-3.5 p-3 rounded-2xl bg-[#0F1420] text-white border border-white/10 shadow-sm shrink-0">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-300 flex items-center gap-1.5">
                                                                <Store className="w-3.5 h-3.5 text-primary" />
                                                                Nos Boutiques
                                                            </span>
                                                            <button
                                                                onClick={() => navigateTo('/boutiques')}
                                                                className="text-[9px] font-black text-primary hover:text-orange-400 uppercase tracking-wider flex items-center gap-0.5 transition-colors"
                                                            >
                                                                Tout voir
                                                                <ArrowRight className="w-2.5 h-2.5" />
                                                            </button>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-1.5">
                                                            {stores.map((store) => (
                                                                <button
                                                                    key={store.id}
                                                                    onClick={() => navigateTo(`/store/${store.slug}`)}
                                                                    className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 hover:bg-white active:scale-95 transition-all text-left shadow-xs"
                                                                    title={store.name}
                                                                >
                                                                    {store.logo && (
                                                                        <div className="relative w-4 h-4 rounded-full overflow-hidden bg-white/10 group-hover:bg-gray-100 transition-all shrink-0">
                                                                            <Image
                                                                                src={store.logo}
                                                                                alt={store.name}
                                                                                fill
                                                                                className="object-contain p-[1px]"
                                                                                unoptimized
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    <span className="text-[10px] sm:text-[11px] font-black text-gray-200 group-hover:text-[#1B1F3B] uppercase tracking-wider transition-colors whitespace-nowrap">
                                                                        {store.name}
                                                                    </span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block shrink-0">Univers Populaires</span>
                                                <div className="space-y-1.5 sm:space-y-2">
                                                    {(() => {
                                                        const prioritizedSlugs = [
                                                            'informatique',
                                                            'telephone-tablette',
                                                            'telephone',
                                                            'image-son',
                                                            'consommables',
                                                            'jeux-loisirs',
                                                            'electromenager',
                                                            'coiffure',
                                                            'connectique'
                                                        ];

                                                        let cats = [...categories];

                                                        // Sort by prioritized slugs
                                                        cats.sort((a, b) => {
                                                            const idxA = prioritizedSlugs.indexOf(a.slug);
                                                            const idxB = prioritizedSlugs.indexOf(b.slug);
                                                            if (idxA === -1 && idxB === -1) return 0;
                                                            if (idxA === -1) return 1;
                                                            if (idxB === -1) return -1;
                                                            return idxA - idxB;
                                                        });

                                                        let finalDisplay = cats;

                                                        return finalDisplay.map((cat, idx) => {
                                                            const catKey = cat.name.trim().toUpperCase();
                                                            const icon = cat.image || CLEAN_IMAGES[catKey] || CLEAN_IMAGES['DEFAULT'];
                                                            const hasSubs = cat.subCategories && cat.subCategories.length > 0;

                                                            return (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 8 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ delay: idx * 0.03 }}
                                                                    key={cat.id}
                                                                >
                                                                    <button
                                                                        onClick={() => {
                                                                            if (hasSubs) {
                                                                                handlePushMenu(cat.name, 'category', cat);
                                                                            } else {
                                                                                navigateTo(`/boutique?category=${cat.slug}`);
                                                                            }
                                                                        }}
                                                                        className="w-full flex items-center justify-between p-2 sm:p-2.5 bg-gray-50/70 hover:bg-white active:bg-gray-100 border border-gray-100/90 rounded-xl transition-all text-left group"
                                                                    >
                                                                        <div className="flex items-center gap-3 min-w-0">
                                                                            <div className="relative w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-lg border border-gray-100/90 overflow-hidden shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                                                                                <Image src={icon} alt={cat.name} fill className="object-contain p-1.5" unoptimized />
                                                                            </div>
                                                                            <div className="flex flex-col min-w-0">
                                                                                <span className="text-xs sm:text-[13px] font-black text-[#1B1F3B] uppercase tracking-tight truncate group-hover:text-primary transition-colors">{cat.name}</span>
                                                                                <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider truncate">{SUBTITLES[catKey] || 'Découvrir'}</span>
                                                                            </div>
                                                                        </div>
                                                                        {hasSubs ? (
                                                                            <ChevronDown className="w-4 h-4 text-gray-300 -rotate-90 group-hover:text-primary transition-colors shrink-0 ml-2" />
                                                                        ) : (
                                                                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors shrink-0 ml-2" />
                                                                        )}
                                                                    </button>
                                                                </motion.div>
                                                            );
                                                        });
                                                    })()}
                                                </div>

                                                <div className="mt-4 pt-4 border-t border-gray-100 mb-4 shrink-0">
                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2.5 block">Explorer</span>
                                                    <div className="space-y-1.5">
                                                        <button
                                                            onClick={() => navigateTo('/nouveautes')}
                                                            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 active:bg-gray-100 text-xs font-bold text-[#1B1F3B] uppercase tracking-wide transition-colors group text-left"
                                                        >
                                                            <div className="flex items-center gap-2.5">
                                                                <Sparkles className="w-4 h-4 text-primary" />
                                                                <span>Nouveautés</span>
                                                            </div>
                                                            <span className="text-[8px] font-black uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">New</span>
                                                        </button>

                                                        <button
                                                            onClick={() => navigateTo('/boutiques')}
                                                            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 active:bg-gray-100 text-xs font-bold text-[#1B1F3B] uppercase tracking-wide transition-colors group text-left"
                                                        >
                                                            <div className="flex items-center gap-2.5">
                                                                <MapPin className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                                                                <span>Nos Boutiques</span>
                                                            </div>
                                                            <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                                                        </button>

                                                        <button
                                                            onClick={() => navigateTo('/contact')}
                                                            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 active:bg-gray-100 text-xs font-bold text-primary uppercase tracking-wide transition-colors group text-left"
                                                        >
                                                            <span>Vendre sur Baraka</span>
                                                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                                        </button>

                                                        <a
                                                            href="https://wa.me/221765149898"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={resetMenu}
                                                            className="flex items-center justify-between p-2.5 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 text-[#128C7E] font-bold text-xs transition-colors active:scale-98 mt-1"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#25D366] shrink-0" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                                                </svg>
                                                                <span className="text-[11px] font-bold text-[#1B1F3B]">WhatsApp 7j/7</span>
                                                            </div>
                                                            <span className="text-[8px] font-black uppercase tracking-wider bg-[#25D366] text-white px-2 py-0.5 rounded-full">En ligne</span>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {currentMenu.type === 'category' && (
                                            <div className="py-2">
                                                <div className="space-y-1.5">
                                                    {currentMenu.data.subCategories?.map((sub: any, idx: number) => {
                                                        const hasThird = sub.thirdLevelCategories && sub.thirdLevelCategories.length > 0;
                                                        return (
                                                            <motion.button
                                                                initial={{ opacity: 0, x: 10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: idx * 0.03 }}
                                                                key={sub.id}
                                                                onClick={() => {
                                                                    if (hasThird) {
                                                                        handlePushMenu(sub.name, 'subcategory', {
                                                                            ...sub,
                                                                            categorySlug: currentMenu.data.slug,
                                                                            categoryName: currentMenu.data.name
                                                                        });
                                                                    } else {
                                                                        navigateTo(`/boutique?category=${currentMenu.data.slug}&subCategory=${sub.slug}`);
                                                                    }
                                                                }}
                                                                className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-white active:bg-gray-100 transition-colors text-left"
                                                            >
                                                                <span className="text-xs sm:text-sm font-bold text-[#1B1F3B] uppercase tracking-wide truncate">{sub.name}</span>
                                                                {hasThird ? (
                                                                    <ChevronDown className="w-4 h-4 text-gray-300 -rotate-90 shrink-0 ml-2" />
                                                                ) : (
                                                                    <ArrowRight className="w-4 h-4 text-gray-300 shrink-0 ml-2" />
                                                                )}
                                                            </motion.button>
                                                        );
                                                    })}
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: 0.2 }}
                                                    >
                                                        <button
                                                            onClick={() => navigateTo(`/boutique?category=${currentMenu.data.slug}`)}
                                                            className="w-full h-11 flex items-center justify-center mt-4 bg-black text-white rounded-xl font-black text-[10px] uppercase tracking-[0.15em] hover:bg-primary transition-colors shadow-sm active:scale-98"
                                                        >
                                                            Voir tout {currentMenu.data.name}
                                                        </button>
                                                    </motion.div>
                                                </div>
                                            </div>
                                        )}

                                        {currentMenu.type === 'subcategory' && (
                                            <div className="py-2">
                                                {/* Option to view all products in this subcategory */}
                                                <button
                                                    onClick={() => navigateTo(`/boutique?category=${currentMenu.data.categorySlug}&subCategory=${currentMenu.data.slug}`)}
                                                    className="w-full flex items-center justify-between p-2.5 sm:p-3 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-xl transition-all text-left mb-2 text-primary font-bold text-xs uppercase group active:scale-98"
                                                >
                                                    <span className="truncate">Voir tout dans {currentMenu.data.name}</span>
                                                    <ArrowRight className="w-3.5 h-3.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                                                </button>

                                                <div className="space-y-1">
                                                    {currentMenu.data.thirdLevelCategories?.map((third: any, idx: number) => (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 5 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: idx * 0.02 }}
                                                            key={third.id}
                                                        >
                                                            <button
                                                                onClick={() => navigateTo(`/boutique?category=${currentMenu.data.categorySlug}&subCategory=${currentMenu.data.slug}&thirdLevelCategory=${third.slug}`)}
                                                                className="w-full flex items-center gap-3 p-2.5 sm:p-3 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-all group text-left"
                                                            >
                                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-primary transition-all group-hover:scale-150 shrink-0" />
                                                                <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-[#1B1F3B] transition-colors uppercase truncate">{third.name}</span>
                                                                <ChevronDown className="w-3.5 h-3.5 text-gray-400 -rotate-90 ml-auto opacity-0 group-hover:opacity-100 transition-all translate-x-1 shrink-0" />
                                                            </button>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Drawer Footer - Refined, Mobile-first & Safe Area Padded */}
                            <div className="p-3.5 sm:p-4 bg-white border-t border-gray-100 shrink-0 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
                                {isLoggedIn ? (
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => navigateTo('/account')}
                                            className="w-full h-10 sm:h-11 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-[#1B1F3B] rounded-xl flex items-center justify-between px-3.5 font-black text-[11px] uppercase tracking-wider transition-all text-left"
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-[#1B1F3B] shadow-xs shrink-0">
                                                    <User className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="truncate">{session?.user?.name || "Mon Compte"}</span>
                                            </div>
                                            <ArrowRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                        </button>

                                        {(session?.user as any)?.role === 'ADMIN' && (
                                            <button
                                                onClick={() => navigateTo('/admin')}
                                                className="w-full h-10 sm:h-11 bg-[#1E293B] hover:bg-primary active:bg-primary/90 text-white rounded-xl flex items-center justify-between px-3.5 font-black text-[11px] uppercase tracking-wider shadow-sm transition-all text-left"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0">
                                                        <ShieldCheck className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span>Administration</span>
                                                </div>
                                                <ArrowRight className="w-3.5 h-3.5 text-white/60 shrink-0" />
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => navigateTo('/login')}
                                        className="w-full h-11 sm:h-12 bg-primary hover:bg-[#d95213] text-white rounded-xl flex items-center justify-between px-4 font-black text-[11px] uppercase tracking-wider shadow-md shadow-primary/20 transition-all active:scale-98 group text-left"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                                                <User className="w-3.5 h-3.5" />
                                            </div>
                                            <span>Connexion / Inscription</span>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                )}
                                <p className="text-center mt-2.5 text-[8px] sm:text-[9px] font-bold text-gray-300 uppercase tracking-widest">
                                    Baraka Shop — Qualité & Service
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Notification d'ajout au panier */}
            <CartToast
                product={lastAddedItem}
                isVisible={isToastVisible}
                onClose={hideToast}
                itemCount={itemCount}
                subtotal={subtotal}
            />

            {/* Mini Cart Side Panel */}
            <MiniCart
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
            />
        </>
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
