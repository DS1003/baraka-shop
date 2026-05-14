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
                subtitle: SUBTITLES[catKey] || 'Découvrez nos offres',
                image: CLEAN_IMAGES[catKey] || CLEAN_IMAGES['DEFAULT'],
                href: `/category/${cat.slug}`
            };
        });
    }

    if (displayItems.length === 0) return null;

    return (
        <section className="py-12 md:py-20 overflow-hidden">
            <Container>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 md:mb-16">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-[2px] bg-primary rounded-full" />
                            <span className="text-primary font-black text-[11px] uppercase tracking-[0.4em]">Exploration</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-[#1B1F3B] uppercase tracking-tighter leading-none">
                            Univers <span className="text-primary italic">Populaires</span>
                        </h2>
                        <p className="text-gray-400 text-sm md:text-base font-medium italic">
                           Tout ce que vous aimez est là
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

                {/* Grid - 2 columns on mobile, 4 on desktop */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                    {displayItems.map((item, idx) => {
                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.02, duration: 0.3, ease: "easeOut" }}
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
                                                src={item.image || CLEAN_IMAGES['DEFAULT']}
                                                alt={item.name}
                                                fill
                                                className="object-contain"
                                                sizes="(max-width: 768px) 50vw, 25vw"
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
                        );
                    })}
                </div>
            </Container>
        </section>
    )
}
