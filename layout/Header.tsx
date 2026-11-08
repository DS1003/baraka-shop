'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
    Search, User, ShoppingCart, Heart, Menu, ChevronDown, Flash as Zap, Location as MapPin, Call as PhoneCall, 
    ArrowRight, X, ShoppingBag, Sparkles, ShieldCheck, Store,
    Laptop, Mobile as Smartphone, Tv, Gamepad2, Printer, Plug as Cable, Cpu, Home as HomeIcon, Shield, Wifi, Watch, BatteryCharging 
} from 'reicon-react'
import { Container } from '@/ui/Container'
import { cn, formatPrice } from '@/lib/utils'
import dynamic from 'next/dynamic'
import { AnimatePresence, motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useCart } from '@/context/CartContext'
import { useRouter, usePathname } from 'next/navigation'
import { getProductsAction, getMegaMenuAction } from '@/lib/actions/product-actions'
import { getStoresAction } from '@/lib/actions/store-actions'
import { useSiteLogos } from '@/lib/hooks/useSiteLogos'
import { getSmartSearchSuggestionsAction, SmartSearchResult } from '@/lib/actions/smart-search-actions'
const MegaMenu = dynamic(() => import('@/features/home/components/MegaMenu').then(mod => mod.MegaMenu), { ssr: false })
const CartToast = dynamic(() => import('@/components/CartToast').then(mod => mod.CartToast), { ssr: false })
const MiniCart = dynamic(() => import('@/components/MiniCart').then(mod => mod.MiniCart), { ssr: false })
import { BorderGlow } from '@/components/BorderGlow'
import { ProfileDropdown } from './ProfileDropdown'

const CATEGORY_ICONS: Record<string, any> = {
    'INFORMATIQUE': Laptop,
    'TELEPHONE & TABLETTE': Smartphone,
    'TELEPHONE': Smartphone,
    'IMAGE & SON': Tv,
    'CONSOLES & JEUX': Gamepad2,
    'JEUX & LOISIRS': Gamepad2,
    'CONSOMMABLES': Printer,
    'CONNECTIQUE': Cable,
    'CABLE': Cable,
    'CHARGEUR': BatteryCharging,
    'BATTERIE': BatteryCharging,
    'ELECTRONIQUE': Cpu,
    'ELECTROMENAGER': HomeIcon,
    'SECURITE': Shield,
    'RESEAUX': Wifi,
    'OBJETS CONNECTES': Watch,
    'OBJETS CONNECTÉS': Watch,
}

function formatCategoryTitle(name: string) {
    if (!name) return ''
    return name
        .toLowerCase()
        .replace(/(?:^|\s|-|\/)\S/g, (char) => char.toUpperCase())
        .replace(/\bEt\b/g, '&')
}

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
    const [smartSearchResult, setSmartSearchResult] = useState<SmartSearchResult | null>(null)
    const [activeResultIndex, setActiveResultIndex] = useState<number>(-1)
    const [isSearching, setIsSearching] = useState(false)
    const [categories, setCategories] = useState<any[]>([])
    const [stores, setStores] = useState<any[]>([])
    const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const megaMenuRef = useRef<HTMLDivElement | null>(null)
    const toggleButtonRef = useRef<HTMLDivElement | null>(null)
    const stickyBurgerRef = useRef<HTMLDivElement | null>(null)
    const desktopSearchInputRef = useRef<HTMLInputElement | null>(null)
    const mobileSearchInputRef = useRef<HTMLInputElement | null>(null)

    const focusSearchInput = (newVal?: string) => {
        setIsSearchFocused(true)
        const applyFocus = () => {
            const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
            const input = (isMobile ? mobileSearchInputRef.current : desktopSearchInputRef.current) 
                       || desktopSearchInputRef.current 
                       || mobileSearchInputRef.current
            if (input) {
                input.focus()
                const targetLen = newVal !== undefined ? newVal.length : input.value.length
                try {
                    input.setSelectionRange(targetLen, targetLen)
                } catch {
                    // ignore if not supported
                }
            }
        }
        applyFocus()
        setTimeout(applyFocus, 10)
    }

    useEffect(() => {
        if (activeResultIndex >= 0) {
            const el = document.getElementById(`search-item-${activeResultIndex}`)
            if (el) {
                el.scrollIntoView({ block: 'nearest' })
            }
        }
    }, [activeResultIndex])

    const handleMenuEnter = () => {
        if (menuTimeoutRef.current) {
            clearTimeout(menuTimeoutRef.current)
            menuTimeoutRef.current = null
        }
        menuTimeoutRef.current = setTimeout(() => {
            setShowMegaMenu(true)
            if (categories.length === 0) {
                getMegaMenuAction().then(data => {
                    if (data && data.length > 0) setCategories(data)
                }).catch(() => {})
            }
        }, 150)
    }

    const handleMenuKeepOpen = () => {
        if (menuTimeoutRef.current) {
            clearTimeout(menuTimeoutRef.current)
            menuTimeoutRef.current = null
        }
    }

    const handleMenuLeave = () => {
        if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current)
        menuTimeoutRef.current = setTimeout(() => {
            setShowMegaMenu(false)
        }, 120)
    }

    const toggleMegaMenu = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault()
            e.stopPropagation()
        }
        if (menuTimeoutRef.current) {
            clearTimeout(menuTimeoutRef.current)
            menuTimeoutRef.current = null
        }
        setShowMegaMenu(prev => {
            const next = !prev
            if (next && categories.length === 0) {
                getMegaMenuAction().then(data => {
                    if (data && data.length > 0) setCategories(data)
                }).catch(() => {})
            }
            return next
        })
    }

    useEffect(() => {
        if (!showMegaMenu) return
        const handleClickOutside = (e: MouseEvent | TouchEvent) => {
            const target = e.target as Node | null
            if (!target) return
            if (
                megaMenuRef.current?.contains(target) ||
                toggleButtonRef.current?.contains(target) ||
                stickyBurgerRef.current?.contains(target)
            ) {
                return
            }
            setShowMegaMenu(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showMegaMenu])

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

    const scrollPosOnKeyDownRef = useRef<number | null>(null)

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        scrollPosOnKeyDownRef.current = window.scrollY
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActiveResultIndex(prev => {
                const max = (searchSuggestions.length || 0) - 1
                return prev < max ? prev + 1 : 0
            })
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveResultIndex(prev => {
                const max = (searchSuggestions.length || 0) - 1
                return prev > 0 ? prev - 1 : max
            })
        } else if (e.key === 'Escape') {
            setIsSearchFocused(false)
        } else if (e.key === 'Enter') {
            if (activeResultIndex >= 0 && searchSuggestions[activeResultIndex]) {
                e.preventDefault()
                const sel = searchSuggestions[activeResultIndex]
                router.push(`/product/${sel.id}`)
                setIsSearchFocused(false)
                setSearchQuery('')
            } else {
                handleSearch()
            }
        }
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        const savedScroll = scrollPosOnKeyDownRef.current ?? window.scrollY
        setSearchQuery(val)

        // Safety: If Chromium's sticky input bug shifted scrollY during keystroke
        if (scrollPosOnKeyDownRef.current !== null && window.scrollY !== savedScroll) {
            window.scrollTo({ top: savedScroll, behavior: 'instant' as ScrollBehavior })
        }

        requestAnimationFrame(() => {
            if (scrollPosOnKeyDownRef.current !== null && window.scrollY !== savedScroll) {
                window.scrollTo({ top: savedScroll, behavior: 'instant' as ScrollBehavior })
            }
        })
    }

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
            if (searchQuery.trim().length >= 2) {
                setIsSearching(true)
                try {
                    const result = await getSmartSearchSuggestionsAction(searchQuery.trim(), 10)
                    setSmartSearchResult(result)
                    setSearchSuggestions(result.products || [])
                    setActiveResultIndex(-1)
                } catch (error) {
                    console.error('Search suggestions error:', error)
                    setSearchSuggestions([])
                    setSmartSearchResult(null)
                } finally {
                    setIsSearching(false)
                }
            } else {
                setSearchSuggestions([])
                setSmartSearchResult(null)
                setActiveResultIndex(-1)
            }
        }
        const timer = setTimeout(fetchSuggestions, 200)
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
            // Lazy load categories and stores only if not already loaded
            if (categories.length === 0) {
                getMegaMenuAction().then(data => {
                    if (data && data.length > 0) setCategories(data)
                }).catch(() => {})
            }
            if (stores.length === 0) {
                getStoresAction().then(data => {
                    if (Array.isArray(data) && data.length > 0) setStores(data)
                }).catch(() => {})
            }
        } else {
            document.body.style.overflow = ''
        }
    }, [isMenuOpen])

    React.useEffect(() => {
        let isScrolled = window.scrollY > 50
        setScrolled(isScrolled)
        const handleScroll = () => {
            const nextScrolled = window.scrollY > 50
            if (nextScrolled !== isScrolled) {
                isScrolled = nextScrolled
                setScrolled(nextScrolled)
                setShowMegaMenu(false)
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

            {/* 2. Main Header (Sticky) */}
            <div className={cn(
                "sticky top-0 w-full transition-all duration-300 hidden md:block",
                isSearchFocused ? "z-[130]" : "z-[100]",
                scrolled ? "shadow-[0_10px_30px_rgba(0,0,0,0.08)] bg-white" : "bg-white"
            )}>
                <div className={cn(
                    "py-2 border-b border-gray-100 transition-all duration-300 w-full",
                    scrolled ? "py-2.5" : ""
                )}>
                    <Container className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 lg:gap-6">
                        <Link href="/" className="shrink-0 flex items-center">
                            <img
                                src={headerLogo}
                                alt="Baraka Electronique - Baraka Shop Dakar"
                                className="h-10 md:h-12 lg:h-14 w-auto object-contain"
                            />
                        </Link>

                        {/* Middle Section : Burger MegaMenu (sticky uniquement) + Recherche */}
                        <div className="flex-1 w-full max-w-2xl px-2 sm:px-4 min-w-0 flex items-center">
                            <AnimatePresence initial={false}>
                                {scrolled && (
                                    <motion.div
                                        key="sticky-burger"
                                        ref={stickyBurgerRef}
                                        initial={{ width: 0, opacity: 0, marginRight: 0 }}
                                        animate={{ width: 'auto', opacity: 1, marginRight: 10 }}
                                        exit={{ width: 0, opacity: 0, marginRight: 0 }}
                                        transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
                                        className="shrink-0 overflow-hidden"
                                        onMouseEnter={handleMenuEnter}
                                        onMouseLeave={handleMenuLeave}
                                    >
                                        <button
                                            id="sticky-megamenu-toggle"
                                            type="button"
                                            onClick={toggleMegaMenu}
                                            aria-label="Ouvrir le menu des catégories"
                                            aria-expanded={showMegaMenu}
                                            className={cn(
                                                "group h-[40px] flex items-center gap-2.5 pl-1.5 pr-3.5 rounded-lg border bg-white whitespace-nowrap select-none",
                                                "transition-all duration-300 active:scale-[0.97]",
                                                showMegaMenu
                                                    ? "border-primary/40 bg-primary/[0.04] shadow-[0_4px_14px_-4px_rgba(232,98,26,0.35)]"
                                                    : "border-gray-200 hover:border-gray-300 hover:shadow-[0_4px_14px_-6px_rgba(27,31,59,0.25)]"
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    "relative w-[30px] h-[30px] rounded-md flex items-center justify-center text-white transition-colors duration-300",
                                                    showMegaMenu ? "bg-primary" : "bg-[#1B1F3B] group-hover:bg-primary"
                                                )}
                                            >
                                                <AnimatePresence mode="wait" initial={false}>
                                                    {showMegaMenu ? (
                                                        <motion.span
                                                            key="close"
                                                            initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                                                            animate={{ rotate: 0, opacity: 1, scale: 1 }}
                                                            exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                                                            transition={{ duration: 0.18 }}
                                                            className="flex"
                                                        >
                                                            <X className="w-4 h-4" strokeWidth={2} />
                                                        </motion.span>
                                                    ) : (
                                                        <motion.span
                                                            key="open"
                                                            initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
                                                            animate={{ rotate: 0, opacity: 1, scale: 1 }}
                                                            exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
                                                            transition={{ duration: 0.18 }}
                                                            className="flex"
                                                        >
                                                            <Menu className="w-4 h-4" strokeWidth={2} />
                                                        </motion.span>
                                                    )}
                                                </AnimatePresence>
                                            </span>
                                            <span className="flex flex-col items-start leading-none">
                                                <span className={cn(
                                                    "text-[11px] font-black uppercase tracking-[0.12em] transition-colors duration-300",
                                                    showMegaMenu ? "text-primary" : "text-[#1B1F3B] group-hover:text-primary"
                                                )}>
                                                    Menu
                                                </span>
                                                <span className="hidden lg:block text-[9px] font-semibold text-gray-400 mt-1 tracking-wide">
                                                    Catégories
                                                </span>
                                            </span>
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                        {/* Search Bar & Auto-suggestions */}
                        <div className={cn("flex-1 relative min-w-0", isSearchFocused ? "z-[120]" : "z-10")}>
                                <form onSubmit={handleSearch} className={cn(
                                    "relative z-[120] flex w-full h-[44px] md:h-[46px] rounded-full overflow-hidden transition-all duration-200 border",
                                    isSearchFocused
                                        ? "bg-white border-primary ring-4 ring-primary/20 shadow-xl shadow-primary/10"
                                        : "bg-[#f4f4f4] border-gray-200 hover:border-gray-300",
                                    scrolled && "h-[40px]"
                                )}>
                                    <div className="flex-1 relative flex items-center min-w-0 bg-transparent">
                                        <input
                                            ref={desktopSearchInputRef}
                                            type="text"
                                            placeholder="Rechercher un produit, une marque, une référence..."
                                            value={searchQuery}
                                            onChange={handleSearchChange}
                                            onFocus={() => setIsSearchFocused(true)}
                                            onKeyDown={handleSearchKeyDown}
                                            className="w-full pl-5 md:pl-6 pr-4 h-full bg-transparent outline-none text-sm md:text-base text-gray-900 placeholder:text-gray-400 font-medium truncate"
                                        />
                                        {searchQuery && (
                                            <button
                                                type="button"
                                                onMouseDown={(e) => e.preventDefault()}
                                                onClick={() => {
                                                    setSearchQuery('');
                                                    focusSearchInput('');
                                                }}
                                                className="absolute right-2 p-1.5 text-gray-400 hover:text-primary transition-colors cursor-pointer"
                                                title="Effacer la recherche"
                                                aria-label="Effacer"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        aria-label="Lancer la recherche"
                                        className="bg-primary hover:bg-primary/90 text-white w-[50px] md:w-[56px] h-full flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                                    >
                                        <Search className="w-4 h-4 md:w-5 md:h-5" />
                                    </button>
                                </form>

                                <AnimatePresence>
                                    {isSearchFocused && searchQuery.length >= 2 && (
                                        <>
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.99 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 8, scale: 0.99 }}
                                                transition={{ duration: 0.15 }}
                                                onMouseDown={(e) => {
                                                    // Évite que cliquer dans le panneau de suggestions ne fasse perdre le focus à l'input
                                                    const target = e.target as HTMLElement;
                                                    if (!target.closest('a')) {
                                                        e.preventDefault();
                                                        focusSearchInput();
                                                    }
                                                }}
                                                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.22)] border border-gray-100 z-[120] overflow-hidden"
                                            >
                                                {/* Header bar */}
                                                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50/90 via-white to-gray-50/90 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[11px] font-black text-gray-500 uppercase tracking-wider">
                                                            Résultats pour <span className="text-primary">"{searchQuery}"</span>
                                                        </span>
                                                        {isSearching ? (
                                                            <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                                                                {smartSearchResult?.total || searchSuggestions.length}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 font-medium hidden sm:inline-flex items-center gap-1">
                                                        Utilisez <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-[9px] font-mono">↑</kbd><kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-[9px] font-mono">↓</kbd> pour naviguer
                                                    </span>
                                                </div>

                                                {/* Did You Mean Suggestion Bar (Google-like) */}
                                                {smartSearchResult?.didYouMean && (
                                                    <div className="px-4 py-2 bg-amber-50/90 border-b border-amber-100/80 flex items-center justify-between text-xs animate-in fade-in">
                                                        <span className="text-amber-900 font-medium text-[11px]">
                                                            Essayez avec l'orthographe :{' '}
                                                            <button
                                                                type="button"
                                                                onMouseDown={(e) => e.preventDefault()}
                                                                onClick={() => {
                                                                    const corrected = smartSearchResult.didYouMean!;
                                                                    setSearchQuery(corrected);
                                                                    setIsSearchFocused(true);
                                                                    focusSearchInput(corrected);
                                                                }}
                                                                className="font-extrabold text-primary hover:underline italic ml-1 cursor-pointer"
                                                            >
                                                                {smartSearchResult.didYouMean}
                                                            </button>
                                                        </span>
                                                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                                    </div>
                                                )}

                                                {/* Autocomplete query suggestions (Chips) */}
                                                {smartSearchResult?.suggestions && smartSearchResult.suggestions.length > 0 && (
                                                    <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/40 flex flex-wrap items-center gap-1.5 text-xs">
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider mr-1">Suggestions :</span>
                                                        {smartSearchResult.suggestions.map((sug, idx) => (
                                                            <button
                                                                key={idx}
                                                                type="button"
                                                                onMouseDown={(e) => e.preventDefault()}
                                                                onClick={() => {
                                                                    setSearchQuery(sug);
                                                                    setIsSearchFocused(true);
                                                                    focusSearchInput(sug);
                                                                }}
                                                                className="px-2.5 py-1 rounded-full bg-white hover:bg-primary hover:text-white text-gray-700 text-[11px] font-medium border border-gray-200/90 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer group"
                                                                title={`Affiner avec "${sug}"`}
                                                            >
                                                                <Search className="w-3 h-3 text-gray-400 group-hover:text-white/80 transition-colors" />
                                                                <span>{sug}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Categories & Brands matching badges */}
                                                {((smartSearchResult?.categories && smartSearchResult.categories.length > 0) ||
                                                  (smartSearchResult?.brands && smartSearchResult.brands.length > 0)) && (
                                                    <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/30 flex flex-wrap items-center gap-1.5 text-xs">
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider mr-1">Filtres rapides :</span>
                                                        {smartSearchResult?.categories?.map((cat) => (
                                                            <div
                                                                key={cat.id}
                                                                className="inline-flex items-center rounded-lg bg-white border border-gray-200 overflow-hidden shadow-2xs group text-[11px]"
                                                            >
                                                                <button
                                                                    type="button"
                                                                    onMouseDown={(e) => e.preventDefault()}
                                                                    onClick={() => {
                                                                        const newQ = searchQuery.toLowerCase().includes(cat.name.toLowerCase())
                                                                            ? searchQuery
                                                                            : `${searchQuery} ${cat.name}`.trim();
                                                                        setSearchQuery(newQ);
                                                                        setIsSearchFocused(true);
                                                                        focusSearchInput(newQ);
                                                                    }}
                                                                    className="px-2.5 py-1 text-gray-700 hover:bg-primary hover:text-white font-semibold transition-all flex items-center gap-1 cursor-pointer"
                                                                    title={`Ajouter ${cat.name} à la recherche`}
                                                                >
                                                                    <span className="text-gray-400 group-hover:text-white/80">Rayon :</span>
                                                                    <strong>{cat.name}</strong>
                                                                </button>
                                                                <Link
                                                                    href={`/boutique?category=${cat.slug}&q=${encodeURIComponent(searchQuery)}`}
                                                                    onClick={() => {
                                                                        setIsSearchFocused(false);
                                                                        setSearchQuery('');
                                                                    }}
                                                                    className="px-1.5 py-1 text-gray-400 hover:text-white hover:bg-primary border-l border-gray-100 transition-colors"
                                                                    title={`Voir tout le rayon ${cat.name}`}
                                                                >
                                                                    <ArrowRight className="w-3 h-3" />
                                                                </Link>
                                                            </div>
                                                        ))}
                                                        {smartSearchResult?.brands?.map((br) => (
                                                            <div
                                                                key={br.id}
                                                                className="inline-flex items-center rounded-lg bg-white border border-gray-200 overflow-hidden shadow-2xs group text-[11px]"
                                                            >
                                                                <button
                                                                    type="button"
                                                                    onMouseDown={(e) => e.preventDefault()}
                                                                    onClick={() => {
                                                                        const newQ = searchQuery.toLowerCase().includes(br.name.toLowerCase())
                                                                            ? searchQuery
                                                                            : `${searchQuery} ${br.name}`.trim();
                                                                        setSearchQuery(newQ);
                                                                        setIsSearchFocused(true);
                                                                        focusSearchInput(newQ);
                                                                    }}
                                                                    className="px-2.5 py-1 text-gray-700 hover:bg-primary hover:text-white font-semibold transition-all flex items-center gap-1 cursor-pointer"
                                                                    title={`Ajouter ${br.name} à la recherche`}
                                                                >
                                                                    <span className="text-gray-400 group-hover:text-white/80">Marque :</span>
                                                                    <strong>{br.name}</strong>
                                                                </button>
                                                                <Link
                                                                    href={`/boutique?brand=${br.slug}`}
                                                                    onClick={() => {
                                                                        setIsSearchFocused(false);
                                                                        setSearchQuery('');
                                                                    }}
                                                                    className="px-1.5 py-1 text-gray-400 hover:text-white hover:bg-primary border-l border-gray-100 transition-colors"
                                                                    title={`Voir tous les produits ${br.name}`}
                                                                >
                                                                    <ArrowRight className="w-3 h-3" />
                                                                </Link>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Products List (Re-ranked by Google Relevance) */}
                                                <div className="max-h-[440px] md:max-h-[480px] overflow-y-auto search-dropdown-scrollbar divide-y divide-gray-50 pr-1">
                                                    {searchSuggestions.map((item: any, idx: number) => (
                                                        <Link
                                                            key={item.id}
                                                            id={`search-item-${idx}`}
                                                            href={`/product/${item.id}`}
                                                            className={`flex items-center gap-3.5 p-3.5 hover:bg-primary/5 transition-all group ${
                                                                activeResultIndex === idx ? 'bg-primary/5 ring-1 ring-inset ring-primary/20' : ''
                                                            }`}
                                                            onClick={() => {
                                                                setIsSearchFocused(false);
                                                                setSearchQuery('');
                                                            }}
                                                        >
                                                            <div className="relative w-12 h-12 bg-white rounded-lg border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
                                                                <Image
                                                                    src={item.images?.[0] || item.image || '/placeholder.png'}
                                                                    alt={item.name}
                                                                    fill
                                                                    className="object-contain p-1"
                                                                    unoptimized
                                                                />
                                                            </div>
                                                            <div className="flex flex-col min-w-0 flex-1">
                                                                <span
                                                                    className="text-xs font-bold text-[#1B1F3B] group-hover:text-primary transition-colors line-clamp-1"
                                                                    dangerouslySetInnerHTML={{ __html: item.highlightedName || item.name }}
                                                                />
                                                                <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-gray-400">
                                                                    <span className="font-medium uppercase">{item.category?.name || item.category || 'Produit'}</span>
                                                                    {item.brand?.name && (
                                                                        <>
                                                                            <span>•</span>
                                                                            <span className="font-semibold text-gray-500">{item.brand.name}</span>
                                                                        </>
                                                                    )}
                                                                    {item.reference && (
                                                                        <>
                                                                            <span>•</span>
                                                                            <span className="font-mono text-gray-400">{item.reference}</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="ml-auto flex flex-col items-end gap-1 shrink-0">
                                                                <span className="text-xs md:text-sm font-black text-[#1B1F3B] tabular-nums">
                                                                    {formatPrice(item.price)}
                                                                </span>
                                                                {item.stock > 0 ? (
                                                                    <span className="bg-emerald-50 text-emerald-600 text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-widest border border-emerald-100 flex items-center gap-1">
                                                                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
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

                                                    {searchSuggestions.length === 0 && !isSearching && (
                                                        <div className="p-8 text-center text-gray-400 text-xs font-medium space-y-1">
                                                            <Search className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                                                            <p className="font-semibold text-gray-600">Aucun produit trouvé pour "{searchQuery}"</p>
                                                            <p className="text-[11px] text-gray-400">Vérifiez l'orthographe ou essayez un terme plus générique.</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Footer Bar */}
                                                <div className="p-3 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between text-xs">
                                                    <span className="text-[11px] text-gray-500">
                                                        {smartSearchResult?.total || searchSuggestions.length} produit{(smartSearchResult?.total || searchSuggestions.length) > 1 ? 's' : ''} correspondant{(smartSearchResult?.total || searchSuggestions.length) > 1 ? 's' : ''}
                                                    </span>
                                                    <Link
                                                        href={`/boutique?q=${encodeURIComponent(searchQuery)}`}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition shadow-sm"
                                                        onClick={() => {
                                                            setIsSearchFocused(false);
                                                            setSearchQuery('');
                                                        }}
                                                    >
                                                        <span>Voir tous les résultats</span>
                                                        <ArrowRight className="w-3.5 h-3.5" />
                                                    </Link>
                                                </div>
                                            </motion.div>
                                            <div
                                                className="fixed inset-0 z-[105] bg-black/25 backdrop-blur-[2px] transition-opacity"
                                                onClick={() => setIsSearchFocused(false)}
                                            />
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4 md:gap-4 lg:gap-8 shrink-0">
                            <HeaderAction icon={MapPin} label="Boutiques" href="/boutiques" />
                            <ProfileDropdown
                                isLoggedIn={isLoggedIn}
                                session={session}
                            />
                            <div
                                onClick={() => setIsCartOpen(true)}
                                className="relative flex items-center group bg-gray-50 hover:bg-primary/5 pl-2 pr-3 md:pr-4 py-1.5 rounded-2xl border border-gray-100 transition-all hover:border-primary/20 cursor-pointer"
                            >
                                <div className="relative flex flex-col items-center">
                                    <div className="relative p-1.5 transition-all duration-300">
                                        <ShoppingCart className="w-6 h-6 md:w-7 md:h-7 text-[#1B1F3B] group-hover:text-primary transition-all duration-300 group-hover:scale-110" strokeWidth={1.5} />
                                        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-white text-[10px] font-black flex items-center justify-center rounded-full ring-2 ring-white shadow-lg shadow-primary/30">
                                            {itemCount}
                                        </span>
                                    </div>
                                </div>
                                <div className="hidden lg:flex flex-col ml-3 pl-3 border-l border-gray-200">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Panier</span>
                                    <span className="text-[12px] font-black text-[#1B1F3B] group-hover:text-primary transition-colors tabular-nums">{formatPrice(subtotal)}</span>
                                </div>
                            </div>
                        </div>
                    </Container>
                </div>

                {/* MegaMenu Dropdown when Header is Sticky (No blocking overlay) */}
                <AnimatePresence>
                    {scrolled && showMegaMenu && (
                        <div
                            ref={megaMenuRef}
                            className="absolute top-full left-0 w-full z-[120] px-3 sm:px-4 md:px-6 lg:px-8 pointer-events-none"
                        >
                            <div
                                className="w-full max-w-[1500px] mx-auto pointer-events-auto"
                                onMouseEnter={handleMenuKeepOpen}
                                onMouseLeave={handleMenuLeave}
                            >
                                <MegaMenu categories={categories} onClose={() => setShowMegaMenu(false)} />
                            </div>
                        </div>
                    )}
                </AnimatePresence>
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
                <Container className="relative flex items-center h-[52px] md:h-[55px] lg:h-[60px] z-10">
                    {/* Menu Categories - Fixed Left */}
                    <div
                        ref={toggleButtonRef}
                        className="h-full flex items-center mr-2 md:mr-3 lg:mr-6 pr-2 md:pr-3 lg:pr-6 border-r border-white/10 cursor-pointer group shrink-0"
                        onMouseEnter={handleMenuEnter}
                        onMouseLeave={handleMenuLeave}
                        onClick={toggleMegaMenu}
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
                            className="text-white px-3 md:px-4 lg:px-6 w-auto h-[36px] md:h-[40px] lg:h-[48px] font-black text-xs lg:text-sm uppercase tracking-wide shadow-[0_0_15px_rgba(232,98,26,0.2)] transition-all overflow-visible flex items-center justify-center border-none"
                        >
                            <div className="flex items-center justify-between w-full h-full gap-2 md:gap-3 py-1">
                                <div className="flex items-center gap-1.5 lg:gap-3">
                                    <Menu className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 shrink-0" />
                                    <span className="whitespace-nowrap">Tous nos produits</span>
                                </div>
                                <ChevronDown className={cn("w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 opacity-70 transition-transform duration-300 shrink-0", showMegaMenu && "rotate-180")} />
                            </div>
                        </BorderGlow>
                    </div>

                    {/* Scrollable Container for Links and Stores on Tablet */}
                    <div className="flex-1 flex items-center min-w-0 h-full overflow-x-auto no-scrollbar scroll-smooth">
                        <div className="flex items-center justify-between w-full min-w-max gap-2 lg:gap-6 xl:gap-8">
                            {/* Middle Navigation Links */}
                            <nav className="flex items-center gap-1 lg:gap-2 xl:gap-3 shrink-0">
                                {navigation.map((item) => (
                                    <div
                                        key={item.name}
                                        className="relative h-full flex items-center shrink-0"
                                        onMouseEnter={item.hasMegaMenu ? handleMenuEnter : undefined}
                                        onMouseLeave={item.hasMegaMenu ? handleMenuLeave : undefined}
                                    >
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                "text-[10px] md:text-[11px] lg:text-[12px] xl:text-[13px] font-bold transition-all uppercase tracking-tight hover:text-primary flex items-center gap-1 whitespace-nowrap px-2 md:px-2.5 lg:px-3 py-1 md:py-1.5 rounded-lg shrink-0",
                                                item.active ? "text-primary bg-white/5" : "text-gray-300 hover:bg-white/5 hover:text-white"
                                            )}
                                        >
                                            <span className="whitespace-nowrap">{item.name}</span>
                                            {item.hasMegaMenu && <ChevronDown className="w-2.5 h-2.5 md:w-3 md:h-3 lg:w-3.5 lg:h-3.5 opacity-50 shrink-0" />}
                                            {item.isNew && <span className="text-[7px] md:text-[8px] lg:text-[9px] bg-red-500 text-white px-1 md:px-1.5 py-0.5 rounded-md ml-0.5 font-black shadow-sm shrink-0">HOT</span>}
                                        </Link>
                                    </div>
                                ))}
                            </nav>

                            {/* Right Link - Dynamic Stores */}
                            <div className="flex items-center gap-1.5 lg:gap-2 shrink-0 pl-2 lg:pl-6 xl:pl-8 border-l border-white/10">
                                {stores.length > 0 ? (
                                    <div className="flex items-center gap-1.5 lg:gap-2 shrink-0">
                                        {stores.map((store) => (
                                            <Link
                                                key={store.id}
                                                href={`/store/${store.slug}`}
                                                className="group flex items-center gap-1.5 lg:gap-2 px-2 md:px-2.5 lg:px-3 py-1 lg:py-1.5 rounded-full border border-white/10 hover:bg-white transition-all shrink-0 bg-white/5 hover:shadow-[0_0_15px_rgba(255,255,255,0.15)]"
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
                                                <span className="text-[9px] md:text-[10px] lg:text-[11px] xl:text-xs font-black text-gray-300 group-hover:text-[#1B1F3B] uppercase tracking-wider whitespace-nowrap transition-colors">
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

                {/* Non-sticky MegaMenu Dropdown (No blocking overlay) */}
                <AnimatePresence>
                    {!scrolled && showMegaMenu && (
                        <div
                            ref={megaMenuRef}
                            className="absolute top-full left-0 w-full z-[120] px-3 sm:px-4 md:px-6 lg:px-8 pointer-events-none"
                        >
                            <div
                                className="w-full max-w-[1500px] mx-auto pointer-events-auto"
                                onMouseEnter={handleMenuKeepOpen}
                                onMouseLeave={handleMenuLeave}
                            >
                                <MegaMenu categories={categories} onClose={() => setShowMegaMenu(false)} />
                            </div>
                        </div>
                    )}
                </AnimatePresence>
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
                    <img src={headerLogo} alt="Baraka Electronique - Baraka Shop Dakar" className="h-10 sm:h-12 w-auto object-contain" />
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
            <div className="md:hidden bg-white px-3 py-1.5 border-b border-gray-100 relative z-[100]">
                <form onSubmit={handleSearch} className={cn(
                    "relative z-[150] flex items-center w-full h-[38px] rounded-full pl-3 pr-1 border transition-all duration-200",
                    isSearchFocused
                        ? "bg-white border-primary ring-2 ring-primary/20 shadow-sm"
                        : "bg-[#F3F4F6] border-gray-200/60"
                )}>
                    <Search className="w-3.5 h-3.5 text-gray-400 shrink-0 pointer-events-none" />
                    <input
                        ref={mobileSearchInputRef}
                        type="text"
                        placeholder="Rechercher un produit, une marque..."
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                        className="flex-1 min-w-0 bg-transparent pl-2 pr-1.5 outline-none text-xs font-normal text-[#1B1F3B] placeholder:text-gray-400"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={() => setIsSearchFocused(true)}
                        onKeyDown={handleSearchKeyDown}
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                                setSearchQuery('')
                                focusSearchInput('')
                            }}
                            className="w-5 h-5 mr-1 rounded-full bg-gray-200/80 hover:bg-gray-300 text-gray-500 hover:text-gray-700 flex items-center justify-center shrink-0 active:scale-90 transition-all cursor-pointer"
                            aria-label="Effacer la recherche"
                        >
                            <X className="w-2.5 h-2.5" />
                        </button>
                    )}
                    <button
                        type="submit"
                        aria-label="Rechercher"
                        className="w-7 h-7 rounded-full bg-primary hover:bg-[#d95213] text-white flex items-center justify-center shrink-0 active:scale-95 shadow-xs shadow-primary/20 transition-all cursor-pointer"
                    >
                        <Search className="w-3 h-3" />
                    </button>
                </form>

                {/* Mobile Backdrop to close suggestions on outside tap */}
                {isSearchFocused && (
                    <div
                        className="fixed inset-0 z-[140] bg-black/20 backdrop-blur-[1px] md:hidden"
                        onClick={() => setIsSearchFocused(false)}
                    />
                )}

                {/* Mobile Search Suggestions */}
                <AnimatePresence>
                    {isSearchFocused && (searchQuery.length > 1 || searchSuggestions.length > 0) && (
                        <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 6 }}
                            onMouseDown={(e) => {
                                const target = e.target as HTMLElement
                                if (!target.closest('a')) {
                                    e.preventDefault()
                                    focusSearchInput()
                                }
                            }}
                            className="absolute left-0 right-0 top-full bg-white z-[150] shadow-xl border-t border-gray-100 max-h-[65vh] overflow-y-auto search-dropdown-scrollbar rounded-b-xl"
                        >
                            {isSearching ? (
                                <div className="py-6 px-4 text-center">
                                    <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2.5" />
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Recherche en cours...</p>
                                </div>
                            ) : searchSuggestions.length > 0 ? (
                                <div className="flex flex-col">
                                    <div className="px-3.5 py-2 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                            {smartSearchResult?.total || searchSuggestions.length} résultat{(smartSearchResult?.total || searchSuggestions.length) > 1 ? 's' : ''}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-medium">Pertinence Google-like</span>
                                    </div>

                                    {smartSearchResult?.didYouMean && (
                                        <div className="px-3 py-1.5 bg-amber-50 border-b border-amber-100 text-[11px] text-amber-900 flex items-center justify-between">
                                            <span>
                                                Orthographe :{' '}
                                                <button
                                                    type="button"
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={() => {
                                                        const corrected = smartSearchResult.didYouMean!
                                                        setSearchQuery(corrected)
                                                        setIsSearchFocused(true)
                                                        focusSearchInput(corrected)
                                                    }}
                                                    className="font-bold text-primary underline italic cursor-pointer"
                                                >
                                                    {smartSearchResult.didYouMean}
                                                </button>
                                            </span>
                                            <Sparkles className="w-3 h-3 text-amber-500" />
                                        </div>
                                    )}

                                    {/* Mobile Autocomplete Suggestions */}
                                    {smartSearchResult?.suggestions && smartSearchResult.suggestions.length > 0 && (
                                        <div className="px-3 py-1.5 bg-gray-50/60 border-b border-gray-100 flex flex-wrap items-center gap-1">
                                            {smartSearchResult.suggestions.map((sug, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={() => {
                                                        setSearchQuery(sug)
                                                        setIsSearchFocused(true)
                                                        focusSearchInput(sug)
                                                    }}
                                                    className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-700 text-[10px] font-medium flex items-center gap-1 active:bg-primary active:text-white transition-colors cursor-pointer"
                                                >
                                                    <Search className="w-2.5 h-2.5 text-gray-400" />
                                                    <span>{sug}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Mobile Quick Category & Brand Chips */}
                                    {((smartSearchResult?.categories && smartSearchResult.categories.length > 0) ||
                                      (smartSearchResult?.brands && smartSearchResult.brands.length > 0)) && (
                                        <div className="px-3 py-1.5 bg-gray-50/30 border-b border-gray-100 flex flex-wrap items-center gap-1 text-[10px]">
                                            {smartSearchResult?.categories?.map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={() => {
                                                        const newQ = searchQuery.toLowerCase().includes(cat.name.toLowerCase())
                                                            ? searchQuery
                                                            : `${searchQuery} ${cat.name}`.trim()
                                                        setSearchQuery(newQ)
                                                        setIsSearchFocused(true)
                                                        focusSearchInput(newQ)
                                                    }}
                                                    className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-700 font-semibold flex items-center gap-1 cursor-pointer active:bg-primary active:text-white"
                                                >
                                                    <span className="text-gray-400">Rayon:</span>
                                                    <span>{cat.name}</span>
                                                </button>
                                            ))}
                                            {smartSearchResult?.brands?.map((br) => (
                                                <button
                                                    key={br.id}
                                                    type="button"
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={() => {
                                                        const newQ = searchQuery.toLowerCase().includes(br.name.toLowerCase())
                                                            ? searchQuery
                                                            : `${searchQuery} ${br.name}`.trim()
                                                        setSearchQuery(newQ)
                                                        setIsSearchFocused(true)
                                                        focusSearchInput(newQ)
                                                    }}
                                                    className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-700 font-semibold flex items-center gap-1 cursor-pointer active:bg-primary active:text-white"
                                                >
                                                    <span className="text-gray-400">Marque:</span>
                                                    <span>{br.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {searchSuggestions.map((item: any) => (
                                        <Link
                                            key={item.id}
                                            href={`/product/${item.id}`}
                                            className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-gray-50 transition-colors group border-b border-gray-50 last:border-0"
                                            onClick={() => {
                                                setIsSearchFocused(false)
                                                setSearchQuery('')
                                            }}
                                        >
                                            <div className="relative w-10 h-10 bg-white rounded-lg border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                                                <Image src={item.images?.[0] || item.image || '/placeholder.png'} alt={item.name} fill className="object-contain p-0.5 group-hover:scale-105 transition-transform" unoptimized />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4
                                                    className="text-xs font-semibold text-[#1B1F3B] truncate group-hover:text-primary transition-colors"
                                                    dangerouslySetInnerHTML={{ __html: item.highlightedName || item.name }}
                                                />
                                                <p className="text-[11px] font-bold text-primary tabular-nums mt-0.5">{formatPrice(item.price)}</p>
                                            </div>
                                        </Link>
                                    ))}
                                    <Link
                                        href={`/boutique?q=${encodeURIComponent(searchQuery)}`}
                                        className="block py-2.5 px-4 text-center text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all bg-primary/5"
                                        onClick={() => {
                                            setIsSearchFocused(false)
                                            setSearchQuery('')
                                        }}
                                    >
                                        Voir tous les résultats ({smartSearchResult?.total || searchSuggestions.length})
                                    </Link>
                                </div>
                            ) : searchQuery.length > 1 ? (
                                <div className="py-6 px-4 text-center text-gray-400">
                                    <Search className="w-6 h-6 mx-auto mb-2 opacity-25" />
                                    <p className="text-xs font-bold text-gray-500">Aucun résultat trouvé pour "{searchQuery}"</p>
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
                                                        className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50/90 border border-slate-100 hover:bg-white hover:border-primary/30 hover:shadow-xs transition-all group text-left active:scale-[0.98]"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                            <ShoppingBag className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-xs font-bold text-[#1B1F3B] tracking-tight group-hover:text-primary transition-colors">Boutique</span>
                                                            <span className="text-[9px] font-medium text-slate-400">Tout explorer</span>
                                                        </div>
                                                    </button>

                                                    <button
                                                        onClick={() => navigateTo('/promotions')}
                                                        className="flex items-center gap-2.5 p-2.5 rounded-xl bg-rose-50/70 border border-rose-100/80 hover:bg-rose-50 hover:border-rose-200 hover:shadow-xs transition-all group relative overflow-hidden text-left active:scale-[0.98]"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                            <Zap className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-xs font-bold text-rose-600 tracking-tight">Promos</span>
                                                                <span className="bg-rose-500 text-white text-[7.5px] px-1 py-0.5 rounded-full font-black leading-none uppercase">Hot</span>
                                                            </div>
                                                            <span className="text-[9px] font-medium text-rose-400">Bons plans</span>
                                                        </div>
                                                    </button>
                                                </div>

                                                {/* Nos Boutiques Partenaires */}
                                                {stores.length > 0 && (
                                                    <div className="mb-3.5 p-3 rounded-2xl bg-gradient-to-br from-[#0F1420] to-[#182032] text-white border border-white/10 shadow-sm shrink-0">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                                                                <Store className="w-3.5 h-3.5 text-primary" />
                                                                Nos Boutiques
                                                            </span>
                                                            <button
                                                                onClick={() => navigateTo('/boutiques')}
                                                                className="text-[9.5px] font-bold text-primary hover:text-orange-400 uppercase tracking-wider flex items-center gap-0.5 transition-colors"
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
                                                                    className="group flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 bg-white/10 hover:bg-white active:scale-95 transition-all text-left shadow-xs"
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
                                                                    <span className="text-[10px] font-semibold text-slate-200 group-hover:text-[#1B1F3B] transition-colors whitespace-nowrap">
                                                                        {store.name}
                                                                    </span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block shrink-0">
                                                    Univers Populaires
                                                </span>
                                                <div className="space-y-1.5">
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
                                                            const CategoryIcon = CATEGORY_ICONS[catKey] || Laptop;
                                                            const hasSubs = cat.subCategories && cat.subCategories.length > 0;
                                                            const subtitle = SUBTITLES[catKey] || 'Découvrir';

                                                            return (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 6 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ delay: idx * 0.02 }}
                                                                    key={cat.id}
                                                                >
                                                                    <button
                                                                        onClick={() => {
                                                                            if (hasSubs) {
                                                                                handlePushMenu(formatCategoryTitle(cat.name), 'category', cat);
                                                                            } else {
                                                                                navigateTo(`/boutique?category=${cat.slug}`);
                                                                            }
                                                                        }}
                                                                        className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50/70 hover:bg-white active:bg-slate-100 border border-slate-100 hover:border-slate-200 hover:shadow-xs transition-all text-left group"
                                                                    >
                                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-700 shadow-xs shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                                                                <CategoryIcon className="w-4 h-4 stroke-[1.8]" />
                                                                            </div>
                                                                            <div className="flex flex-col min-w-0">
                                                                                <span className="text-[12px] font-bold text-slate-900 truncate group-hover:text-primary transition-colors">
                                                                                    {formatCategoryTitle(cat.name)}
                                                                                </span>
                                                                                <span className="text-[9.5px] font-medium text-slate-400 truncate">
                                                                                    {subtitle}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        {hasSubs ? (
                                                                            <ChevronDown className="w-3.5 h-3.5 text-slate-300 -rotate-90 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                                                                        ) : (
                                                                            <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                                                                        )}
                                                                    </button>
                                                                </motion.div>
                                                            );
                                                        });
                                                    })()}
                                                </div>

                                                <div className="mt-3.5 pt-3.5 border-t border-gray-100 mb-3 shrink-0">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Explorer</span>
                                                    <div className="space-y-1">
                                                        <button
                                                            onClick={() => navigateTo('/nouveautes')}
                                                            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 active:bg-slate-100 text-xs font-bold text-[#1B1F3B] transition-colors group text-left"
                                                        >
                                                            <div className="flex items-center gap-2.5">
                                                                <Sparkles className="w-4 h-4 text-primary" />
                                                                <span>Nouveautés</span>
                                                            </div>
                                                            <span className="text-[8px] font-black uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">New</span>
                                                        </button>

                                                        <button
                                                            onClick={() => navigateTo('/boutiques')}
                                                            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 active:bg-slate-100 text-xs font-bold text-[#1B1F3B] transition-colors group text-left"
                                                        >
                                                            <div className="flex items-center gap-2.5">
                                                                <MapPin className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                                                                <span>Nos Boutiques</span>
                                                            </div>
                                                            <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                                                        </button>

                                                        <button
                                                            onClick={() => navigateTo('/contact')}
                                                            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 active:bg-slate-100 text-xs font-bold text-primary transition-colors group text-left"
                                                        >
                                                            <span>Vendre sur Baraka</span>
                                                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                                        </button>

                                                        <a
                                                            href="https://wa.me/221765149898"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={resetMenu}
                                                            className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 text-emerald-700 font-bold text-xs transition-colors active:scale-98 mt-1"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-emerald-600 shrink-0" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                                                </svg>
                                                                <span className="text-[11px] font-bold text-slate-800">WhatsApp 7j/7</span>
                                                            </div>
                                                            <span className="text-[8px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-full">En ligne</span>
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
                                                                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-white active:bg-slate-100 transition-colors text-left"
                                                            >
                                                                <span className="text-xs sm:text-sm font-bold text-[#1B1F3B] truncate">{sub.name}</span>
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
                                                            className="w-full h-11 flex items-center justify-center mt-4 bg-black text-white rounded-xl font-bold text-[11px] uppercase tracking-wider hover:bg-primary transition-colors shadow-sm active:scale-98"
                                                        >
                                                            Voir tout {formatCategoryTitle(currentMenu.data.name)}
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
                            <div className="p-3 bg-white border-t border-gray-100 shrink-0 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
                                {isLoggedIn ? (
                                    <div className="space-y-1.5">
                                        <button
                                            onClick={() => navigateTo('/account')}
                                            className="w-full h-10 bg-slate-100 hover:bg-slate-200 active:scale-[0.99] text-[#1B1F3B] rounded-xl flex items-center justify-between px-3 font-bold text-xs transition-all text-left"
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-[#1B1F3B] shadow-xs shrink-0">
                                                    <User className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="truncate">{session?.user?.name || "Mon Compte"}</span>
                                            </div>
                                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        </button>

                                        {(session?.user as any)?.role === 'ADMIN' && (
                                            <button
                                                onClick={() => navigateTo('/admin')}
                                                className="w-full h-10 bg-[#0F1420] hover:bg-primary active:scale-[0.99] text-white rounded-xl flex items-center justify-between px-3 font-bold text-xs shadow-xs transition-all text-left"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0">
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
                                        className="w-full h-10 bg-primary hover:bg-[#d95213] text-white rounded-xl flex items-center justify-between px-3.5 font-bold text-xs shadow-sm shadow-primary/25 transition-all active:scale-[0.99] group text-left"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                                                <User className="w-3.5 h-3.5" />
                                            </div>
                                            <span>Connexion / Inscription</span>
                                        </div>
                                        <ArrowRight className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                )}
                                <p className="text-center mt-2 text-[9px] font-medium text-slate-400 tracking-wider">
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
