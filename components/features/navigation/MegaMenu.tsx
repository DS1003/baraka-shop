'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Menu, Laptop, Smartphone, Speaker, Gamepad, Watch, ArrowRight, Sparkles, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const CATEGORIES = [
    {
        id: 'informatique',
        label: 'Informatique',
        icon: Laptop,
        image: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&q=80&w=400',
        subcategories: [
            { title: 'Ordinateurs', links: ['MacBook Pro & Air', 'Laptops Gamer', 'Microsoft Surface', 'Ultrabooks Pro'] },
            { title: 'Composants', links: ['Cartes Graphiques', 'Processeurs', 'Mémoires Vive', 'Stockage SSD'] },
        ]
    },
    {
        id: 'telephonie',
        label: 'Téléphonie',
        icon: Smartphone,
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400',
        subcategories: [
            { title: 'Smartphones', links: ['iPhone Premium', 'Samsung Galaxy S', 'Google Pixel Super'] },
            { title: 'Écosystème', links: ['Apple Watch', 'AirPods Pro', 'Chargeurs MagSafe'] },
        ]
    },
    {
        id: 'gaming',
        label: 'Gaming',
        icon: Gamepad,
        image: 'https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?auto=format&fit=crop&q=80&w=400',
        subcategories: [
            { title: 'Consoles', links: ['PlayStation 5', 'Xbox Series X', 'Nintendo Switch'] },
            { title: 'Setup', links: ['PC Baraka One', 'Périphériques Elite', 'Sièges Ergonomiques'] },
        ]
    },
    {
        id: 'tv-son',
        label: 'Image & Son',
        icon: Speaker,
        image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=400',
        subcategories: [
            { title: 'Audio', links: ['Enceintes Hi-Fi', 'Casques Studio', 'Barres de Son'] },
            { title: 'Photo & Vidéo', links: ['Boîtiers Hybrides', 'Drones Pro', 'Objectifs'] },
        ]
    }
]

export default function MegaMenu() {
    const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0].id)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const activeData = CATEGORIES.find(c => c.id === activeCategory) || CATEGORIES[0]

    return (
        <div
            className="h-full"
            onMouseEnter={() => setIsMenuOpen(true)}
            onMouseLeave={() => setIsMenuOpen(false)}
        >
            {/* Trigger Button - Clean & Solid Block */}
            <button
                className={cn(
                    "flex items-center gap-4 px-10 h-full font-black text-[11px] tracking-[0.25em] uppercase transition-all duration-300 outline-none",
                    isMenuOpen ? "bg-white text-black" : "bg-primary text-white"
                )}
            >
                <Menu size={16} />
                <span>Rayons</span>
                <ChevronDown size={14} className={cn("ml-2 opacity-50 transition-transform duration-300", isMenuOpen && "rotate-180")} />
            </button>

            {/* MINIMALIST MEGA MENU DROP-DOWN */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 0 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute top-full left-0 w-[1000px] h-[500px] bg-white text-black shadow-[0_40px_100px_rgba(0,0,0,0.1)] flex border border-gray-100 z-[120]"
                    >
                        {/* 1. Sidebar Category Selection - Ultra Minimal */}
                        <div className="w-[280px] bg-white border-r border-gray-50 flex flex-col py-8">
                            {CATEGORIES.map((cat) => (
                                <div
                                    key={cat.id}
                                    onMouseEnter={() => setActiveCategory(cat.id)}
                                    className={cn(
                                        "px-10 py-5 cursor-pointer transition-all duration-300 flex items-center justify-between group",
                                        activeCategory === cat.id ? "text-primary bg-gray-50/50" : "text-gray-400 hover:text-black"
                                    )}
                                >
                                    <span className="font-bold text-[12px] uppercase tracking-widest">{cat.label}</span>
                                    <ChevronRight size={14} className={cn("transition-transform", activeCategory === cat.id ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2")} />
                                </div>
                            ))}
                        </div>

                        {/* 2. Content Area - Simple & Airy */}
                        <div className="flex-1 p-16 flex justify-between gap-12 bg-white">
                            <div className="flex-1 grid grid-cols-2 gap-x-12 gap-y-12">
                                {activeData.subcategories.map((sub, idx) => (
                                    <div key={idx} className="space-y-6">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 border-b border-gray-50 pb-3">
                                            {sub.title}
                                        </h4>
                                        <ul className="space-y-3">
                                            {sub.links.map((link, i) => (
                                                <li key={i}>
                                                    <Link
                                                        href="/shop"
                                                        className="text-[13px] font-medium text-gray-500 hover:text-primary transition-colors block"
                                                    >
                                                        {link}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>

                            {/* 3. Visual Feature - Minimalist Integrated Block */}
                            <div className="w-[300px] flex flex-col pt-2">
                                <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-gray-50 mb-6 group/img">
                                    <Image
                                        src={activeData.image}
                                        alt={activeData.label}
                                        fill
                                        className="object-cover group-hover/img:scale-105 transition-transform duration-1000"
                                    />
                                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                                </div>
                                <div className="space-y-2 mb-6">
                                    <h3 className="text-lg font-black uppercase italic tracking-tighter text-gray-900 leading-none">{activeData.label}</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Édition Premium 2025</p>
                                </div>
                                <Link
                                    href="/shop"
                                    className="mt-auto border-2 border-black py-4 px-6 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] text-center hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2 group"
                                >
                                    Tout explorer <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
