'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/ui/Container'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { formatUniverseHref } from '@/lib/utils'

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
    'TELEPHONE & TABLETTE': 'iPhone, Galaxy & iPad',
    'IMAGE & SON': 'TV, Casques & Caméras',
    'CONSOLES & JEUX': 'PS5, Xbox & Gaming',
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
    const [isMobileView, setIsMobileView] = React.useState(false)

    React.useEffect(() => {
        const checkMobile = () => {
            setIsMobileView(window.innerWidth < 768)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

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

    const slideNext = () => {
        if (mobileScrollRef.current) {
            mobileScrollRef.current.scrollBy({ left: 180, behavior: 'smooth' })
        }
        setDirection(1)
        setCurrentIndex((prev) => (prev + 1) % displayItems.length)
    }

    const slidePrev = () => {
        if (mobileScrollRef.current) {
            mobileScrollRef.current.scrollBy({ left: -180, behavior: 'smooth' })
        }
        setDirection(-1)
        setCurrentIndex((prev) => (prev - 1 + displayItems.length) % displayItems.length)
    }

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 300 : -300,
            opacity: 0
        })
    }

    return (
        <section className="py-1 md:py-3 overflow-hidden">
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
                                className="w-7 h-7 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-xs active:scale-95 transition-all text-[#1B1F3B]"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={slideNext}
                                aria-label="Univers suivant"
                                className="w-7 h-7 rounded-full bg-[#1B1F3B] text-white flex items-center justify-center shadow-xs active:scale-95 transition-all text-primary"
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
                                className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm hover:shadow-md transition-all text-[#1B1F3B]"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={slideNext}
                                aria-label="Suivant"
                                className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm hover:shadow-md transition-all text-[#1B1F3B]"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                        <Link
                            href="/univers"
                            className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#1B1F3B] text-white flex items-center justify-center shadow-xl shadow-black/10 active:scale-95 group/plus-premium transition-all hover:bg-primary"
                            title="Voir tous les univers"
                        >
                            <Plus className="w-6 h-6 md:w-7 md:h-7 transition-transform group-hover/plus-premium:rotate-90" strokeWidth={3} />
                        </Link>
                    </div>
                </div>
            </div>

                {/* Desktop Grid */}
                <div className="hidden md:grid grid-cols-4 gap-6">
                    {displayItems.map((item, idx) => (
                        <div key={item.id}>
                            <UniverseCard item={item} idx={idx} />
                        </div>
                    ))}
                </div>

                {/* Mobile Snap-Scroll Rail (Mobile First) */}
                <div className="md:hidden">
                    <div
                        ref={mobileScrollRef}
                        className="flex items-stretch gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar pb-3 -mx-4 px-4"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {displayItems.map((item, idx) => (
                            <div key={item.id} className="w-[155px] sm:w-[175px] shrink-0 snap-start">
                                <UniverseCard item={item} idx={idx} />
                            </div>
                        ))}
                        {/* Final Discovery Card */}
                        <div className="w-[130px] shrink-0 snap-start">
                            <Link
                                href="/univers"
                                className="flex flex-col items-center justify-center h-[220px] bg-gradient-to-br from-[#1B1F3B] to-[#2A3158] text-white rounded-xl p-4 text-center group active:scale-95 transition-all shadow-md"
                            >
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-2.5 group-hover:bg-primary transition-colors">
                                    <Plus className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-wider">Tous les univers</span>
                                <span className="text-[9px] text-gray-300 font-medium mt-1">Explorer tout</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    )
}

function UniverseCard({ item, idx }: { item: any, idx: number }) {
    const imageSrc = item.image || CLEAN_IMAGES[(item.name || '').trim().toUpperCase()] || CLEAN_IMAGES['DEFAULT'];

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.02, duration: 0.3, ease: "easeOut" }}
            className="h-full"
        >
            <Link
                href={item.href}
                className="group relative flex flex-col h-[220px] md:h-[280px] bg-white rounded-xl border border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:border-primary/20 hover:-translate-y-1 p-3 md:p-5 overflow-hidden"
            >
                {/* Card Header */}
                <div className="relative z-10 flex flex-col items-center text-center">
                    <h3 className="text-[10px] md:text-base font-black text-[#1B1F3B] group-hover:text-primary transition-colors duration-300 uppercase tracking-tight line-clamp-1">
                        {item.name}
                    </h3>
                    <p className="text-[7px] md:text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-0.5 opacity-80 group-hover:text-gray-400 transition-all line-clamp-1">
                        {item.subtitle}
                    </p>
                </div>

                {/* Image */}
                <div className="relative flex-1 flex items-center justify-center my-1 md:my-2">
                    <div className="relative w-full h-[110px] md:h-[150px] transform transition-all duration-500 group-hover:scale-110">
                        <Image
                            src={imageSrc}
                            alt={item.name}
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, 25vw"
                        />
                    </div>
                </div>

                {/* Action Button */}
                <div className="relative z-10 flex justify-center mt-auto">
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#1B1F3B] text-white flex items-center justify-center transition-all duration-300 group-hover:bg-primary shadow-md">
                        <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5" />
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}
