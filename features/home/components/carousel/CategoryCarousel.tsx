'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/ui/Container'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, Plus } from 'lucide-react'

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
            const slug = u.href ? u.href.split('/').pop() : '';
            return {
                id: u.id,
                name: u.name,
                subtitle: u.subtitle,
                image: u.image,
                href: `/univers/${slug}`
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

    const slideNext = () => {
        setDirection(1)
        setCurrentIndex((prev) => (prev + 1) % displayItems.length)
    }

    const slidePrev = () => {
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
        <section className="py-12 md:py-20 overflow-hidden">
            <Container>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 md:mb-16">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-[2px] bg-primary rounded-full" />
                            <span className="text-primary font-black text-[11px] uppercase tracking-[0.4em]">Exploration</span>
                        </div>
                        <div className="flex items-center justify-between w-full">
                            <h2 className="text-3xl md:text-5xl font-black text-[#1B1F3B] uppercase tracking-tighter leading-none">
                                Univers <span className="text-primary italic">Populaires</span>
                            </h2>
                            
                            {/* Mobile Arrows + Button */}
                            <div className="flex md:hidden gap-2 items-center">
                                <button
                                    onClick={slidePrev}
                                    className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm active:scale-95 transition-all"
                                >
                                    <ChevronLeft className="w-4 h-4 text-[#1B1F3B]" />
                                </button>
                                <button
                                    onClick={slideNext}
                                    className="w-10 h-10 rounded-full bg-[#1B1F3B] text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
                                >
                                    <ChevronRight className="w-4 h-4 text-primary" />
                                </button>
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm md:text-base font-medium italic">
                           Tout ce que vous aimez est là
                        </p>
                    </div>

                    {/* Desktop Arrows + See All Button */}
                    <div className="hidden md:flex items-center gap-3">
                        <div className="flex gap-2">
                            <button
                                onClick={slidePrev}
                                className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm hover:shadow-md transition-all text-[#1B1F3B]"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={slideNext}
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

                {/* Desktop Grid */}
                <div className="hidden md:grid grid-cols-4 gap-6">
                    {displayItems.map((item, idx) => (
                        <div key={item.id}>
                            <UniverseCard item={item} idx={idx} />
                        </div>
                    ))}
                </div>

                {/* Mobile Carousel */}
                <div className="md:hidden">
                    <div className="relative h-[250px] w-full mb-8">
                        <AnimatePresence initial={false} custom={direction}>
                            <motion.div
                                key={currentIndex}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: "spring", stiffness: 300, damping: 32 },
                                    opacity: { duration: 0.3 }
                                }}
                                className="absolute inset-0"
                            >
                                <UniverseCard item={displayItems[currentIndex]} idx={0} />
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Dots */}
                    <div className="flex justify-center gap-2">
                        {displayItems.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setDirection(idx > currentIndex ? 1 : -1)
                                    setCurrentIndex(idx)
                                }}
                                className={`h-1.5 rounded-full transition-all duration-500 ${currentIndex === idx ? "w-8 bg-[#1B1F3B]" : "w-1.5 bg-slate-200"
                                    }`}
                            />
                        ))}
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
