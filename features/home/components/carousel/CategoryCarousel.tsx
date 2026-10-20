'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/ui/Container'
import { ArrowRight, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { formatUniverseHref, getOptimizedImageUrl } from '@/lib/utils'

// Images locales dans /public/categories/ - garanties d'affichage (Fallback)
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
    'DEFAULT': '/categories/batterie.png'
};

const SUBTITLES: Record<string, string> = {
    'INFORMATIQUE': 'MacBook, PC & Portables',
    'PC PORTABLES': 'MacBook, Asus & HP',
    'PC PORTABLE': 'MacBook, Asus & HP',
    'IMPRIMANTE': 'Epson, Canon & Laser',
    'IMPRIMANTES': 'Epson, Canon & Laser',
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

export function CategoryCarousel({ 
    initialCategories, 
    initialUniverses 
}: { 
    initialCategories?: any[],
    initialUniverses?: any[]
}) {
    const [currentIndex, setCurrentIndex] = React.useState(0)
    const [direction, setDirection] = React.useState(0)

    // If we have managed universes, use them. Otherwise fallback to categories logic.
    const hasManagedUniverses = initialUniverses && initialUniverses.length > 0;
    
    let displayItems: any[] = [];
    
    if (hasManagedUniverses) {
        displayItems = initialUniverses.map(u => {
            return {
                id: u.id,
                name: u.name,
                subtitle: u.subtitle,
                image: u.image,
                href: formatUniverseHref(u.href)
            };
        });
    } else if (initialCategories && initialCategories.length > 0) {
        // Fallback logic
        let categories = [...initialCategories];
        const informatiqueCat = categories.find(c => c.name.toUpperCase() === 'INFORMATIQUE');
        categories = categories.filter(c => c.name.toUpperCase() !== 'CABLE');
        const finalDisplay = categories.slice(0, 8);
        if (informatiqueCat && !finalDisplay.find(c => c.id === informatiqueCat.id)) {
            finalDisplay[finalDisplay.length - 1] = informatiqueCat;
        }
        displayItems = finalDisplay.map(cat => {
            const catKey = (cat.name || '').trim().toUpperCase();
            return {
                id: cat.id,
                name: cat.name,
                subtitle: SUBTITLES[catKey] || 'Découvrez nos offres',
                image: CLEAN_IMAGES[catKey] || CLEAN_IMAGES['DEFAULT'],
                href: `/univers/${cat.slug}`
            };
        });
    }

    if (displayItems.length === 0) return null;

    const mobileScrollRef = React.useRef<HTMLDivElement>(null)
    const desktopScrollRef = React.useRef<HTMLDivElement>(null)

    const mobileDrag = useDragToScroll()
    const desktopDrag = useDragToScroll()

    const slideNext = () => {
        if (mobileScrollRef.current) {
            const first = mobileScrollRef.current.firstElementChild as HTMLElement
            const stride = first ? first.offsetWidth + 12 : 172
            mobileScrollRef.current.scrollBy({ left: stride * 1.5, behavior: 'smooth' })
        }
        if (desktopScrollRef.current) {
            const stride = desktopScrollRef.current.clientWidth * 0.8
            desktopScrollRef.current.scrollBy({ left: stride, behavior: 'smooth' })
        }
    }

    const slidePrev = () => {
        if (mobileScrollRef.current) {
            const first = mobileScrollRef.current.firstElementChild as HTMLElement
            const stride = first ? first.offsetWidth + 12 : 172
            mobileScrollRef.current.scrollBy({ left: -stride * 1.5, behavior: 'smooth' })
        }
        if (desktopScrollRef.current) {
            const stride = desktopScrollRef.current.clientWidth * 0.8
            desktopScrollRef.current.scrollBy({ left: -stride, behavior: 'smooth' })
        }
    }

    return (
        <section className="py-1 md:py-3 overflow-hidden select-none">
            <Container>
                <div className="mb-3 md:mb-8">
                    {/* Mobile Top Row: Eyebrow + Mobile Arrows */}
                    <div className="flex md:hidden items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <div className="w-5 h-[2px] bg-primary rounded-full shrink-0" />
                            <span className="text-primary font-black text-[8.5px] uppercase tracking-[0.25em] truncate">Exploration</span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-auto">
                            <button
                                onClick={slidePrev}
                                aria-label="Univers précédent"
                                className="w-7 h-7 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-xs active:scale-90 transition-all text-[#1B1F3B] cursor-pointer"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={slideNext}
                                aria-label="Univers suivant"
                                className="w-7 h-7 rounded-full bg-[#1B1F3B] text-white flex items-center justify-center shadow-xs active:scale-90 transition-all text-primary cursor-pointer"
                            >
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Main Header Row */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-4">
                        <div className="flex flex-col gap-0.5 md:gap-2">
                            {/* Desktop Eyebrow */}
                            <div className="hidden md:flex items-center gap-3">
                                <div className="w-8 md:w-10 h-[2px] bg-primary rounded-full" />
                                <span className="text-primary font-black text-[9px] md:text-[11px] uppercase tracking-[0.4em]">Exploration</span>
                            </div>

                            {/* Title: 100% full width, no overlap with buttons */}
                            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-[#1B1F3B] uppercase tracking-tight leading-none">
                                Univers <span className="text-primary italic inline-block pr-1.5">Populaires</span>
                            </h2>

                            <p className="text-gray-400 text-xs md:text-base font-medium italic mt-0.5">
                               Tout ce que vous aimez est là
                            </p>
                        </div>

                        {/* Desktop Arrows + See All Button */}
                        <div className="hidden md:flex items-center gap-3">
                            <div className="flex gap-2">
                                <button
                                    onClick={slidePrev}
                                    aria-label="Précédent"
                                    className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm hover:shadow-md active:scale-95 transition-all text-[#1B1F3B] cursor-pointer"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={slideNext}
                                    aria-label="Suivant"
                                    className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm hover:shadow-md active:scale-95 transition-all text-[#1B1F3B] cursor-pointer"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                            <Link
                                href="/univers"
                                className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#1B1F3B] text-white flex items-center justify-center shadow-xl shadow-black/10 active:scale-95 group/plus-premium transition-all hover:bg-primary cursor-pointer"
                                title="Voir tous les univers"
                            >
                                <Plus className="w-6 h-6 md:w-7 md:h-7 transition-transform group-hover/plus-premium:rotate-90" strokeWidth={3} />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Desktop Carousel Rail (Smooth hardware accelerated + Drag to scroll) */}
                <div
                    ref={desktopScrollRef}
                    className="hidden md:flex items-stretch gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-2 scroll-pl-1 cursor-grab active:cursor-grabbing select-none"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch',
                        touchAction: 'pan-x pan-y'
                    }}
                    {...desktopDrag}
                >
                    {displayItems.map((item, idx) => (
                        <div key={item.id} className="w-[calc(25%-18px)] shrink-0 snap-start">
                            <UniverseCard item={item} idx={idx} />
                        </div>
                    ))}
                    {/* Final Discovery Card Desktop */}
                    <div className="w-[calc(25%-18px)] shrink-0 snap-start">
                        <Link
                            href="/univers"
                            draggable={false}
                            className="relative overflow-hidden flex flex-col items-center justify-center h-[280px] bg-gradient-to-br from-[#15192D] via-[#1B1F3B] to-[#0D101E] text-white rounded-3xl p-6 text-center group active:scale-95 transition-all shadow-md border border-white/10 hover:border-primary/50 select-none"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:border-primary transition-all duration-300 shadow-sm group-hover:rotate-90 pointer-events-none">
                                <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
                            </div>
                            <span className="text-base font-black uppercase tracking-wider text-white pointer-events-none">Tous les univers</span>
                            <span className="text-xs font-bold text-primary uppercase tracking-widest mt-2 flex items-center gap-1.5 pointer-events-none">
                                Explorer tout le catalogue <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Mobile Snap-Scroll Rail (Ultra-fluid finger swipe + DevTools mouse drag) */}
                <div className="md:hidden">
                    <div
                        ref={mobileScrollRef}
                        className="flex items-stretch gap-3 overflow-x-auto overflow-y-hidden snap-x snap-mandatory no-scrollbar py-2 -mx-4 px-4 overscroll-x-contain scroll-pl-4 scroll-pr-4 transform-gpu cursor-grab active:cursor-grabbing select-none"
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            WebkitOverflowScrolling: 'touch',
                            touchAction: 'pan-x pan-y'
                        }}
                        {...mobileDrag}
                    >
                        {displayItems.map((item, idx) => (
                            <div key={item.id} className="w-[160px] sm:w-[180px] shrink-0 snap-start">
                                <UniverseCard item={item} idx={idx} />
                            </div>
                        ))}
                        {/* Final Discovery Card Mobile */}
                        <div className="w-[140px] shrink-0 snap-start">
                            <Link
                                href="/univers"
                                draggable={false}
                                className="relative overflow-hidden flex flex-col items-center justify-center h-[215px] bg-gradient-to-br from-[#15192D] via-[#1B1F3B] to-[#0D101E] text-white rounded-2xl p-4 text-center group active:scale-95 transition-all shadow-md border border-white/10 select-none"
                            >
                                <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:border-primary transition-all duration-300 shadow-sm group-hover:rotate-90 pointer-events-none">
                                    <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
                                </div>
                                <span className="text-xs font-black uppercase tracking-wider text-white pointer-events-none">Tous les univers</span>
                                <span className="text-[9px] font-bold text-primary uppercase tracking-widest mt-1 flex items-center gap-1 pointer-events-none">
                                    Voir tout <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    )
}

/**
 * Hook de glissement fluide à la souris et au doigt
 * Permet de glisser avec le doigt sur smartphone tout en autorisant le drag souris dans Chrome DevTools
 */
function useDragToScroll() {
    const isDown = React.useRef(false)
    const startX = React.useRef(0)
    const scrollLeft = React.useRef(0)
    const hasDragged = React.useRef(false)

    const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.button !== 0) return
        const el = e.currentTarget
        isDown.current = true
        hasDragged.current = false
        startX.current = e.pageX - el.offsetLeft
        scrollLeft.current = el.scrollLeft
    }

    const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDown.current) return
        const el = e.currentTarget
        const x = e.pageX - el.offsetLeft
        const walk = (x - startX.current) * 1.3
        if (Math.abs(walk) > 4) {
            hasDragged.current = true
            el.scrollLeft = scrollLeft.current - walk
        }
    }

    const onMouseUp = () => {
        isDown.current = false
        setTimeout(() => {
            hasDragged.current = false
        }, 80)
    }

    const onClickCapture = (e: React.MouseEvent) => {
        if (hasDragged.current) {
            e.preventDefault()
            e.stopPropagation()
        }
    }

    return {
        onMouseDown,
        onMouseMove,
        onMouseUp,
        onMouseLeave: onMouseUp,
        onClickCapture
    }
}

function UniverseCard({ item, idx }: { item: any, idx: number }) {
    const rawImage = item.image || CLEAN_IMAGES[(item.name || '').trim().toUpperCase()] || CLEAN_IMAGES['DEFAULT'];
    const imageSrc = getOptimizedImageUrl(rawImage, 320);
    const subtitle = item.subtitle || SUBTITLES[(item.name || '').trim().toUpperCase()] || 'Découvrir nos offres';

    return (
        <div className="h-full transform-gpu select-none" suppressHydrationWarning>
            <Link
                href={item.href}
                draggable={false}
                suppressHydrationWarning
                className="group relative flex flex-col h-[215px] md:h-[280px] bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-[0_12px_32px_rgba(232,98,26,0.12)] hover:border-primary/30 md:hover:-translate-y-1 p-3.5 md:p-5 overflow-hidden select-none cursor-pointer"
            >
                {/* Card Header */}
                <div className="relative z-10 flex flex-col items-center text-center select-none pointer-events-none">
                    <h3 className="text-[11px] sm:text-xs md:text-base font-black text-[#1B1F3B] group-hover:text-primary transition-colors duration-300 uppercase tracking-tight line-clamp-1">
                        {item.name}
                    </h3>
                    <p className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 group-hover:text-primary/70 transition-colors line-clamp-1">
                        {subtitle}
                    </p>
                </div>

                {/* Image */}
                <div className="relative flex-1 flex items-center justify-center my-1.5 md:my-2 select-none pointer-events-none">
                    <div className="relative w-full h-[105px] md:h-[145px] transform transition-transform duration-300 group-hover:scale-105 md:group-hover:-translate-y-0.5">
                        <Image
                            src={imageSrc}
                            alt={item.name}
                            fill
                            priority={idx < 3}
                            loading={idx < 3 ? undefined : 'lazy'}
                            draggable={false}
                            className="object-contain pointer-events-none select-none"
                            sizes="(max-width: 768px) 170px, 25vw"
                        />
                    </div>
                </div>

                {/* Action Pill */}
                <div className="relative z-10 flex items-center justify-center mt-auto pt-1 select-none pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 group-hover:bg-primary text-[#1B1F3B] group-hover:text-white transition-all duration-300 shadow-xs group-hover:shadow-md group-hover:shadow-primary/25">
                        <span className="text-[8.5px] md:text-[10px] font-black uppercase tracking-wider">Explorer</span>
                        <ArrowRight className="w-2.5 h-2.5 md:w-3 md:h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                </div>
            </Link>
        </div>
    )
}
