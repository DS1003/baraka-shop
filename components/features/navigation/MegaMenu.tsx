'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Menu, Laptop, Smartphone, Speaker, Gamepad, Watch, Printer, Grid, ArrowRight, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const CATEGORIES = [
    {
        id: 'informatique',
        label: 'Informatique',
        icon: Laptop,
        image: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&q=80&w=400',
        color: "text-blue-600",
        bg: "bg-blue-50",
        gradient: "from-blue-500/20 to-cyan-500/20",
        subcategories: [
            {
                title: 'Ordinateurs',
                links: ['MacBook Pro & Air', 'PC Portables Gamer', 'Ultrabooks', 'Microsoft Surface']
            },
            {
                title: 'Composants',
                links: ['Cartes Graphiques', 'Processeurs', 'Moniteurs 4K', 'SSD NVMe']
            },
            {
                title: 'Périphériques',
                links: ['Claviers Mécaniques', 'Souris Gamer', 'Casques PC', 'Webcams Stream']
            }
        ]
    },
    {
        id: 'telephonie',
        label: 'Téléphonie',
        icon: Smartphone,
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400',
        color: "text-purple-600",
        bg: "bg-purple-50",
        gradient: "from-purple-500/20 to-pink-500/20",
        subcategories: [
            {
                title: 'Smartphones',
                links: ['iPhone 15 Pro', 'Samsung S24 Ultra', 'Google Pixel 8', 'Xiaomi 13']
            },
            {
                title: 'Tablettes',
                links: ['iPad Pro M2', 'Galaxy Tab S9', 'iPad Air', 'Lenovo Tab']
            },
            {
                title: 'Accessoires',
                links: ['AirPods Pro', 'Galaxy Buds', 'Chargeurs MagSafe', 'Coques Rhinoshield']
            }
        ]
    },
    {
        id: 'tv-son',
        label: 'Image & Son',
        icon: Speaker,
        image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=400',
        color: "text-red-600",
        bg: "bg-red-50",
        gradient: "from-red-500/20 to-orange-500/20",
        subcategories: [
            {
                title: 'TV & Cinéma',
                links: ['TV OLED 4K', 'QLED Samsung', 'Vidéoprojecteurs', 'Android TV']
            },
            {
                title: 'Audio',
                links: ['Enceintes JBL', 'Casques Sony', 'Barres de son', 'Home Cinéma']
            },
            {
                title: 'Photo',
                links: ['Hybrides Canon', 'GoPro Hero', 'Drones DJI', 'Objectifs']
            }
        ]
    },
    {
        id: 'gaming',
        label: 'Gaming',
        icon: Gamepad,
        image: 'https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?auto=format&fit=crop&q=80&w=400',
        color: "text-green-600",
        bg: "bg-green-50",
        gradient: "from-green-500/20 to-emerald-500/20",
        subcategories: [
            {
                title: 'Consoles',
                links: ['PlayStation 5 Slim', 'Xbox Series X', 'Nintendo Switch OLED', 'Steam Deck']
            },
            {
                title: 'Jeux',
                links: ['Nouveautés PS5', 'Précommandes', 'Jeux Switch', 'Cartes PSN']
            },
            {
                title: 'Accessoires',
                links: ['Manettes DualSense', 'Volants Racing', 'Sièges Gamer', 'Casques VR']
            }
        ]
    },
    {
        id: 'smart-home',
        label: 'Connecté',
        icon: Watch,
        image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=400',
        color: "text-orange-600",
        bg: "bg-orange-50",
        gradient: "from-orange-500/20 to-yellow-500/20",
        subcategories: [
            {
                title: 'Wearables',
                links: ['Apple Watch Ultra', 'Galaxy Watch 6', 'Garmin Fenix', 'Bracelets']
            },
            {
                title: 'Maison',
                links: ['Philips Hue', 'Caméras Arlo', 'Nest Hub', 'Aspirateurs Robots']
            }
        ]
    }
]

export default function MegaMenu() {
    const [activeCategory, setActiveCategory] = useState<string | null>(null)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    // Default to first category if none active to show something immediately on open? 
    // Or better, wait for hover. Let's wait for hover but maybe default to 'informatique' if we wanted.

    // Using explicit types to resolve 'any' errors
    const activeData = CATEGORIES.find(c => c.id === activeCategory)

    return (
        <div className="relative group/menu z-50" onMouseLeave={() => setIsMenuOpen(false)}>
            {/* Trigger Button - Ultra Clean & Kinetic */}
            <button
                className={cn(
                    "relative flex items-center gap-3 bg-white text-black pl-5 pr-8 py-2.5 rounded-full font-bold text-xs tracking-[0.15em] uppercase transition-all duration-300 border border-transparent overflow-hidden group",
                    isMenuOpen ? "shadow-xl ring-2 ring-white/20" : "hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] opacity-90 hover:opacity-100"
                )}
                onMouseEnter={() => setIsMenuOpen(true)}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
                {/* Background Animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                    <Grid size={14} className="group-hover:rotate-90 transition-transform duration-500" />
                </div>
                <span className="relative z-10">Nos Rayons</span>
                <ChevronRight size={14} className={cn("relative z-10 ml-auto transition-transform duration-300", isMenuOpen ? "rotate-90" : "group-hover:translate-x-1")} />
            </button>

            {/* Dropdown Container - Floating Glassmorphism */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.98, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: 15, scale: 0.98, filter: "blur(10px)" }}
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        className="absolute top-full left-0 mt-5 w-[1000px] h-[550px] bg-white rounded-[2rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] border border-gray-100 flex overflow-hidden origin-top-left"
                        onMouseLeave={() => setActiveCategory(null)}
                    >
                        {/* Sidebar: Navigation Pylons */}
                        <div className="w-[300px] bg-gray-50/80 backdrop-blur-sm flex flex-col py-6 px-4 gap-2 border-r border-gray-100 relative">
                            {/* Decorative header */}
                            <div className="px-4 pb-4 mb-2 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200/50">
                                <Sparkles size={12} />
                                Catégories
                            </div>

                            {CATEGORIES.map((cat) => (
                                <motion.div
                                    key={cat.id}
                                    className={cn(
                                        "relative group flex items-center justify-between px-4 py-4 rounded-xl cursor-pointer transition-all duration-300",
                                        activeCategory === cat.id
                                            ? "bg-white shadow-lg shadow-gray-200/50"
                                            : "hover:bg-white/60 hover:shadow-sm"
                                    )}
                                    onMouseEnter={() => setActiveCategory(cat.id)}
                                >
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm",
                                            activeCategory === cat.id
                                                ? `${cat.bg} ${cat.color} ring-2 ring-white`
                                                : "bg-white text-gray-400 border border-gray-100"
                                        )}>
                                            <cat.icon size={18} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <span className={cn(
                                                "block font-bold text-sm transition-colors duration-200",
                                                activeCategory === cat.id ? "text-gray-900" : "text-gray-600"
                                            )}>{cat.label}</span>
                                            {activeCategory === cat.id && (
                                                <motion.span
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-[10px] text-gray-400 font-medium"
                                                >
                                                    {cat.subcategories.length} Univers
                                                </motion.span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Active State Indicator */}
                                    {activeCategory === cat.id && (
                                        <motion.div
                                            layoutId="sidebar-active"
                                            className="absolute inset-0 bg-white rounded-xl shadow-sm z-0"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}

                                    {/* Arrow */}
                                    <ChevronRight
                                        size={14}
                                        className={cn(
                                            "relative z-10 transition-all duration-300",
                                            activeCategory === cat.id ? "text-primary opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                                        )}
                                    />
                                </motion.div>
                            ))}
                        </div>

                        {/* Content Area: Staggered Grid & Immersive Card */}
                        <div className="flex-1 relative bg-white">
                            <AnimatePresence mode='wait'>
                                {activeCategory && activeData ? (
                                    <div className="absolute inset-0 flex">

                                        {/* Soft Color Gradient Background based on category */}
                                        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-30 pointer-events-none", activeData.gradient)} />

                                        {/* Subcategories Grid */}
                                        <div className="flex-1 p-10 grid grid-cols-2 gap-10 content-start relative z-10">
                                            {activeData.subcategories.map((sub, idx) => (
                                                <motion.div
                                                    key={sub.title}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.1, duration: 0.4 }}
                                                    className="space-y-5"
                                                >
                                                    <h4 className="flex items-center gap-3 font-black text-gray-900 text-sm uppercase tracking-wider">
                                                        <span className={cn("w-2 h-2 rounded-full", activeData.color.replace('text', 'bg'))} />
                                                        {sub.title}
                                                    </h4>
                                                    <ul className="space-y-3">
                                                        {sub.links.map((link, i) => (
                                                            <li key={i}>
                                                                <Link
                                                                    href={`/shop?category=${activeCategory}&sub=${link}`}
                                                                    className="group/link flex items-center gap-0 text-[13px] font-medium text-gray-500 hover:text-black transition-all duration-300"
                                                                >
                                                                    <ArrowRight size={12} className="opacity-0 -ml-4 group-hover/link:opacity-100 group-hover/link:ml-0 text-primary transition-all duration-300 mr-2" />
                                                                    <span className="group-hover/link:translate-x-1 transition-transform duration-300">{link}</span>
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </motion.div>
                                            ))}

                                            {/* 'View All' Bottom Link */}
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.4 }}
                                                className="col-span-2 pt-8 border-t border-gray-100"
                                            >
                                                <Link href={`/shop?category=${activeCategory}`} className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-900 hover:text-primary transition-colors">
                                                    Tout voir dans {activeData.label}
                                                    <div className="w-6 h-6 rounded-full bg-gray-100 group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-all duration-300">
                                                        <ArrowRight size={12} />
                                                    </div>
                                                </Link>
                                            </motion.div>
                                        </div>

                                        {/* Immersive Feature Card (Right Side) */}
                                        <motion.div
                                            initial={{ opacity: 0, x: 50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.5, ease: "easeOut" }}
                                            className="w-[320px] p-4 flex flex-col justify-center my-4 mr-4 bg-gray-50 rounded-[2rem] relative overflow-hidden group cursor-pointer"
                                        >
                                            {/* Image with Parallax-like scale */}
                                            <div className="absolute inset-0">
                                                <Image
                                                    src={activeData.image}
                                                    alt={activeData.label}
                                                    fill
                                                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                                            </div>

                                            {/* Content Layer */}
                                            <div className="relative z-10 mt-auto p-6 text-white transform transition-transform duration-500 group-hover:-translate-y-2">
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[10px] font-bold uppercase mb-4">
                                                    <Sparkles size={10} fill="currentColor" />
                                                    Collection 2026
                                                </div>
                                                <h3 className="text-3xl font-black mb-2 leading-none">{activeData.label}</h3>
                                                <p className="text-xs text-gray-300 line-clamp-3 mb-6 opacity-90 font-medium leading-relaxed">
                                                    Explorez notre gamme premium. Des innovations technologiques sélectionnées pour vous.
                                                </p>
                                                <button className="w-full py-3 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all duration-300 shadow-xl">
                                                    Découvrir
                                                </button>
                                            </div>
                                        </motion.div>

                                    </div>
                                ) : (
                                    /* Empty State / Initial State */
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50/30">
                                        <div className="text-center space-y-4 opacity-30">
                                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                                                <Grid size={40} />
                                            </div>
                                            <p className="text-lg font-medium text-gray-400">Passez la souris pour explorer nos univers</p>
                                        </div>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
