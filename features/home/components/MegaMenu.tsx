'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ChevronRight, Laptop, Smartphone, Headphones, Camera,
    Zap, Tablet, Monitor, Cpu, Mouse, Tv, Speaker, HardDrive, Gamepad2,
    WashingMachine, Scissors, Cable, LayoutGrid, Radio
} from 'lucide-react'
import { cn } from '@/lib/utils'

import { MENU_CATEGORIES } from '@/lib/data'

export function MegaMenu() {
    const [activeTab, setActiveTab] = useState(MENU_CATEGORIES[0].id)
    const activeCategory = MENU_CATEGORIES.find(c => c.id === activeTab) || MENU_CATEGORIES[0]

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 w-screen max-w-[1240px] h-[600px] bg-white text-black shadow-2xl border border-gray-100 rounded-b-2xl overflow-hidden z-50 flex"
        >
            {/* Left Column: Categories List (LDLC Style Sidebar) */}
            <div className="w-[280px] bg-white border-r border-gray-100 flex flex-col pt-2">
                {MENU_CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        onMouseEnter={() => setActiveTab(cat.id)}
                        className={cn(
                            "flex items-center justify-between px-6 py-3.5 text-left transition-all border-b border-gray-50 last:border-0",
                            activeTab === cat.id
                                ? "bg-gray-50 text-primary"
                                : "text-[#1B1F3B] hover:bg-gray-50/50"
                        )}
                    >
                        <span className={cn(
                            "text-[12px] font-black tracking-tight uppercase",
                            activeTab === cat.id ? "text-primary" : "text-[#1B1F3B]"
                        )}>
                            {cat.title}
                        </span>
                        <ChevronRight className={cn("w-3.5 h-3.5", activeTab === cat.id ? "text-primary opacity-100" : "text-gray-300 opacity-60")} />
                    </button>
                ))}

                {/* Divers & Autres Category (Simple list items) */}
                <div className="mt-2 border-t border-gray-100">
                    <button className="w-full text-left px-6 py-3.5 text-[12px] font-black uppercase text-[#1B1F3B] hover:bg-gray-50">DIVERS</button>
                    <button className="w-full text-left px-6 py-3.5 text-[12px] font-black uppercase text-[#1B1F3B] hover:bg-gray-50">OBJETS CONNECTES</button>
                </div>
            </div>

            {/* Right Content: Sub-categories + Image Grid */}
            <div className="flex-1 flex bg-[#fafafa]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.15 }}
                        className="flex-1 flex overflow-hidden p-8"
                    >
                        {/* Sub-categories Grid (LDLC Style Columns) */}
                        <div className="flex-1 grid grid-cols-3 gap-x-8 gap-y-10 overflow-y-auto pr-8 custom-scrollbar">
                            {activeCategory.subcategories.map((sub, idx) => (
                                <div key={idx} className="flex flex-col gap-4">
                                    <h4 className="text-[12px] font-black uppercase text-[#1B1F3B] tracking-wider pb-2 border-b border-gray-200">
                                        {sub.label}
                                    </h4>
                                    <ul className="flex flex-col gap-2.5">
                                        {sub.links.map((link) => (
                                            <li key={link}>
                                                <Link
                                                    href={`/category/${link.toLowerCase().replace(/ /g, '-')}`}
                                                    className="text-[13px] text-gray-500 hover:text-primary transition-colors uppercase font-medium"
                                                >
                                                    {link}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Visual Banner (Right Side) */}
                        <div className="w-[280px] shrink-0">
                            <div className="relative h-[350px] w-full rounded-xl overflow-hidden shadow-lg group">
                                <Image
                                    src={activeCategory.image}
                                    alt={activeCategory.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                                    <span className="text-primary font-black text-[10px] uppercase tracking-[0.2em] mb-2">En vedette</span>
                                    <h5 className="text-white font-black text-xl leading-tight uppercase">
                                        {activeCategory.title}
                                    </h5>
                                    <div className="mt-4 flex items-center gap-2 text-white/80 text-xs font-bold uppercase transition-all group-hover:gap-4 group-hover:text-white">
                                        Découvrir <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 p-5 bg-white border border-gray-100 rounded-xl shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Zap className="w-5 h-5 fill-current" />
                                    </div>
                                    <p className="text-[#1B1F3B] font-black text-sm">Vente Flash</p>
                                </div>
                                <p className="text-gray-500 text-xs leading-relaxed">Profitez de réductions exclusives sur cette catégorie pendant 24h !</p>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e5e7eb;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #d1d5db;
                }
            `}</style>
        </motion.div>
    )
}
