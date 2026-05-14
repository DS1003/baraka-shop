'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/ui/Container'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

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
    'INFORMATIQUE': 'MACBOOK, PC & PORTABLES',
    'TELEPHONE & TABLETTE': 'IPHONE, GALAXY & IPAD',
    'IMAGE & SON': 'TV, CASQUES & CAMÉRAS',
    'CONSOLES & JEUX': 'PS5, XBOX & GAMING',
    'RESEAUX': 'ROUTEURS & WIFI 7',
    'SECURITE': 'CAMÉRAS & ALARMES',
    'ELECTROMENAGER': 'MAISON INTELLIGENTE',
    'BUREAUTIQUE': 'IMPRIMANTES & IMPRESSION',
    'MULTIMEDIA': 'STREAMING & CINÉMA',
    'BATTERIE': 'EXTERNES & INTERNES',
    'CABLE': 'HDMI, USB & RÉSEAU',
    'CHARGEUR': 'SECTEUR & INDUCTION',
    'CONNECTIQUE': 'ADAPTATEURS & HUBS',
    'CONSOMMABLES': 'ENCRE & PAPIER',
    'ELECTRONIQUE': 'COMPOSANTS & GADGETS',
    'GÉNÉRAL': 'UNIVERS HIGH-TECH',
    'GÉNERAL': 'UNIVERS HIGH-TECH'
};

export function CategoryCarousel({ 
    initialCategories, 
    initialUniverses 
}: { 
    initialCategories?: any[],
    initialUniverses?: any[]
}) {
    // If we have managed universes, use them. Otherwise fallback to categories logic.
    const hasManagedUniverses = initialUniverses && initialUniverses.length > 0;
    
    let displayItems: any[] = [];
    
    if (hasManagedUniverses) {
        displayItems = initialUniverses.map(u => ({
            id: u.id,
            name: u.name,
            subtitle: u.subtitle,
            image: u.image,
            href: u.href
        }));
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
                subtitle: SUBTITLES[catKey] || 'DÉCOUVREZ NOS OFFRES',
                image: CLEAN_IMAGES[catKey] || CLEAN_IMAGES['DEFAULT'],
                href: `/category/${cat.slug}`
            };
        });
    }

    if (displayItems.length === 0) return null;

    return (
        <section className="py-16 md:py-24">
            <Container>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-16 md:mb-20">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <span className="w-10 h-[2px] bg-primary rounded-full" />
                            <span className="text-primary font-black text-[11px] uppercase tracking-[0.6em]">Exploration</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-[#1B1F3B] uppercase tracking-tighter leading-[0.9]">
                            Univers <span className="text-primary italic">Populaires</span>
                        </h2>
                        <p className="text-slate-400 text-base md:text-xl font-medium italic opacity-80">
                           Une sélection exclusive pour vous
                        </p>
                    </div>

                    <Link 
                        href="/categories" 
                        className="mt-8 md:mt-0 group flex items-center gap-6 text-[12px] font-black uppercase tracking-[0.3em] text-[#1B1F3B] hover:text-primary transition-all duration-300"
                    >
                        Explorer Tout 
                        <div className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-500 shadow-sm group-hover:shadow-lg group-hover:shadow-primary/20">
                             <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-500" />
                        </div>
                    </Link>
                </div>

                {/* Grid - 4x2 Layout Optimized */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
                    {displayItems.map((item, idx) => {
                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ 
                                    delay: idx * 0.08, 
                                    duration: 0.8, 
                                    ease: [0.22, 1, 0.36, 1] 
                                }}
                            >
                                <Link
                                    href={item.href}
                                    className="group relative flex flex-col h-[280px] md:h-[380px] bg-white rounded-[40px] border border-slate-50 transition-all duration-700 hover:-translate-y-3 p-8 md:p-10 overflow-hidden shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_70px_-20px_rgba(245,131,32,0.15)]"
                                >
                                    {/* Card Header - Minimalist */}
                                    <div className="relative z-10 flex flex-col items-center text-center space-y-2">
                                        <h3 className="text-lg md:text-2xl font-black text-[#1B1F3B] group-hover:text-primary transition-colors duration-500 uppercase tracking-tight line-clamp-1">
                                            {item.name}
                                        </h3>
                                        <p className="text-[9px] md:text-[11px] font-bold text-slate-300 uppercase tracking-[0.25em] group-hover:text-primary/50 transition-colors duration-500 line-clamp-1">
                                            {item.subtitle}
                                        </p>
                                    </div>

                                    {/* Visual Core */}
                                    <div className="relative flex-1 flex items-center justify-center my-6">
                                        {/* Subtle background glow on hover */}
                                        <div className="absolute inset-0 bg-primary/5 rounded-full scale-0 group-hover:scale-125 transition-transform duration-1000 blur-3xl opacity-0 group-hover:opacity-100" />
                                        
                                        <div className="relative w-full h-full max-h-[160px] md:max-h-[200px] transform transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-115 group-hover:rotate-2">
                                            <Image
                                                src={item.image || CLEAN_IMAGES['DEFAULT']}
                                                alt={item.name}
                                                fill
                                                className="object-contain drop-shadow-2xl"
                                                sizes="(max-width: 768px) 50vw, 25vw"
                                                priority={idx < 4}
                                            />
                                        </div>
                                    </div>

                                    {/* Minimalist Action */}
                                    <div className="relative z-10 flex justify-center">
                                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-[#1B1F3B] text-white flex items-center justify-center transition-all duration-700 group-hover:bg-primary group-hover:scale-110 shadow-2xl group-hover:shadow-primary/40">
                                            <ArrowRight className="w-5 h-5 md:w-7 md:h-7" />
                                        </div>
                                    </div>

                                    {/* Glassmorphism border effect on hover */}
                                    <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/10 rounded-[40px] transition-colors duration-700" />
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </Container>
        </section>
    )
}
