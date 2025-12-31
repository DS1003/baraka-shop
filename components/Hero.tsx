'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ChevronRight,
    Laptop,
    Smartphone,
    Tv,
    Gamepad2,
    Watch,
    Zap,
    ShieldCheck,
    Trophy,
    Cpu,
    Monitor,
    MousePointer2,
    Speaker
} from 'lucide-react'
import { cn } from '@/lib/utils'

const SIDEBAR_LINKS = [
    { label: 'Informatique', icon: Laptop, id: 'informatique' },
    { label: 'Image & Son', icon: Tv, id: 'audio' },
    { label: 'Téléphonie & Auto', icon: Smartphone, id: 'mobile' },
    { label: 'Seconde vie', icon: Zap, id: 'second' },
    { label: 'Jeux & Loisirs', icon: Gamepad2, id: 'gaming' },
    { label: 'Objets connectés', icon: Watch, id: 'connected' },
    { label: 'Consommables', icon: Cpu, id: 'consum' },
    { label: 'Connectique', icon: MousePointer2, id: 'connect' },
]

const SLIDES = [
    {
        id: 1,
        title: 'Petits prix, grosses économies',
        discount: '-20%',
        subtitle: 'sur le coin des affaires',
        code: 'YOUPI',
        bg: 'bg-gradient-to-br from-[#f0f0f0] to-[#e0e0e0]',
        image: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?q=80&w=1200'
    },
    {
        id: 2,
        title: 'PC sur mesure Baraka',
        discount: 'Expertise',
        subtitle: 'Montage & Installation',
        code: 'TECH26',
        bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
        image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=1200'
    }
]

const TABS = [
    'L\'OFFRE DU JOUR',
    'PODIUM',
    'TÉLÉCHARGEZ L\'APPLI !',
    'PC BARAKA',
    'DEMANDEZ UNE REPRISE'
]

export default function Hero() {
    const [activeTab, setActiveTab] = useState(0)
    const [currentSlide, setCurrentSlide] = useState(0)

    return (
        <section className="bg-[#f0f2f5] py-4">
            <div className="container mx-auto px-4">
                <div className="flex gap-4 min-h-[500px]">

                    {/* 1. LEFT SIDEBAR (LDLC Style) */}
                    <div className="w-[280px] bg-white rounded-lg shadow-sm hidden lg:flex flex-col border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Rayons</h3>
                        </div>
                        <div className="flex-1">
                            {SIDEBAR_LINKS.map((link) => (
                                <Link
                                    key={link.id}
                                    href={`/shop?cat=${link.id}`}
                                    className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 group border-b border-gray-50 last:border-0 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <link.icon size={18} className="text-gray-400 group-hover:text-primary transition-colors" />
                                        <span className="text-[12px] font-bold text-gray-700 group-hover:text-black">{link.label}</span>
                                    </div>
                                    <ChevronRight size={14} className="text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </Link>
                            ))}
                        </div>
                        <div className="p-4 bg-orange-50 mt-auto">
                            <Link href="/promotions" className="flex items-center gap-2 text-[11px] font-black text-primary uppercase tracking-widest hover:underline">
                                <Zap size={14} /> Toutes nos promos
                            </Link>
                        </div>
                    </div>

                    {/* 2. MAIN CENTER AREA (Slider + Lower Tabs) */}
                    <div className="flex-1 flex flex-col gap-4">

                        {/* THE SLIDER */}
                        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-100 relative overflow-hidden group">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentSlide}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className={cn("absolute inset-0 flex items-center p-12", SLIDES[currentSlide].bg)}
                                >
                                    <div className="max-w-md z-10">
                                        <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-2">{SLIDES[currentSlide].title}</h2>
                                        <div className="text-7xl font-black text-gray-900 leading-none mb-4 italic tracking-tighter">
                                            {SLIDES[currentSlide].discount}
                                        </div>
                                        <p className="text-xl font-bold text-gray-600 uppercase tracking-wide mb-8">{SLIDES[currentSlide].subtitle}</p>

                                        <div className="inline-flex items-center bg-white rounded-full p-2 pl-6 shadow-xl border border-gray-100">
                                            <span className="text-xs font-black uppercase tracking-widest mr-4">Avec le code : {SLIDES[currentSlide].code}</span>
                                            <button className="bg-primary text-white p-3 rounded-full hover:bg-black transition-colors">
                                                <ChevronRight size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Abstract background text decoration (LDLC Style) */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] font-black text-black/5 uppercase italic pointer-events-none whitespace-nowrap">
                                        BARAKA SHOP
                                    </div>

                                    <div className="absolute right-0 top-0 bottom-0 w-1/2">
                                        <Image
                                            src={SLIDES[currentSlide].image}
                                            alt="Offer"
                                            fill
                                            className="object-cover mix-blend-multiply opacity-80"
                                        />
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* Slider Nav Dots */}
                            <div className="absolute bottom-6 right-6 flex gap-2 z-20">
                                {SLIDES.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentSlide(i)}
                                        className={cn(
                                            "w-2 h-2 rounded-full transition-all",
                                            currentSlide === i ? "w-6 bg-primary" : "bg-gray-300 hover:bg-gray-400"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* LOWER TABS (LDLC Style) */}
                        <div className="grid grid-cols-2 md:grid-cols-5 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                            {TABS.map((tab, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveTab(i)}
                                    className={cn(
                                        "py-4 px-2 text-[9px] font-black uppercase tracking-widest border-r border-gray-50 last:border-0 transition-all",
                                        activeTab === i
                                            ? "bg-primary text-white"
                                            : "text-gray-500 hover:bg-gray-50 hover:text-black"
                                    )}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
