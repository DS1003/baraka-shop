'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Sparkles, Laptop, Smartphone, Headphones, Gamepad2, Watch, Camera, Tv, Speaker } from 'lucide-react'

const DEPARTMENTS = [
    {
        name: 'Informatique',
        icon: Laptop,
        img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800',
        sub: ['Laptops Pro', 'Gaming PCs', 'Tablettes', 'Accessoires PC'],
        color: 'from-orange-500/20 to-primary/20'
    },
    {
        name: 'Téléphonie',
        icon: Smartphone,
        img: 'https://images.unsplash.com/photo-1592899677712-a170135c97f5?q=80&w=800',
        sub: ['iPhone', 'Samsung Galaxy', 'Xiaomi', 'Accessoires Mobile'],
        color: 'from-primary/20 to-orange-500/20'
    },
    {
        name: 'Audio & Son',
        icon: Headphones,
        img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800',
        sub: ['Casques Bluetooth', 'Airpods/Buds', 'Enceintes JBL', 'Home Cinema'],
        color: 'from-orange-500/20 to-red-500/20'
    },
    {
        name: 'Gaming',
        icon: Gamepad2,
        img: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?q=80&w=800',
        sub: ['PS5 & Xbox', 'Consoles Portables', 'Jeux Vidéo', 'Chaise Gaming'],
        color: 'from-green-500/20 to-emerald-500/20'
    },
    {
        name: 'Connecté',
        icon: Watch,
        img: 'https://images.unsplash.com/photo-1544117518-30dd0575e7a9?q=80&w=800',
        sub: ['Smartwatches', 'Domotique', 'Bracelets Sport', 'Caméras IP'],
        color: 'from-orange-500/20 to-primary/20'
    },
    {
        name: 'Photo & Vidéo',
        icon: Camera,
        img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800',
        sub: ['Canon/Sony', 'Drones DJI', 'Objectifs', 'Trépieds'],
        color: 'from-yellow-500/20 to-orange-500/20'
    }
]

export default function CategoriesPage() {
    return (
        <div className="min-h-screen bg-[#f8f9fa] pb-32">
            {/* Hero Header */}
            <div className="bg-white border-b border-gray-100 pt-10 pb-16">
                <div className="container px-4 mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                            <Sparkles size={14} /> Explorer Baraka Shop
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-4 tracking-tighter">Nos <span className="text-primary italic">Univers.</span></h1>
                        <p className="text-gray-400 font-medium max-w-xl mx-auto text-sm md:text-base">
                            Naviguez à travers nos différentes catégories pour trouver les meilleurs produits tech au Sénégal.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="container px-4 mx-auto -mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {DEPARTMENTS.map((dept, idx) => (
                        <motion.div
                            key={dept.name}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-gray-200/50 group border border-gray-50 flex flex-col h-full"
                        >
                            {/* Visual Header */}
                            <div className="relative h-[200px] overflow-hidden">
                                <Image
                                    src={dept.img}
                                    alt={dept.name}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className={cn("absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent", dept.color)} />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-[1.5rem] border border-white/20 flex items-center justify-center text-white scale-125">
                                        <dept.icon size={28} />
                                    </div>
                                </div>
                                <div className="absolute bottom-6 left-8">
                                    <h2 className="text-2xl font-black text-white">{dept.name}</h2>
                                </div>
                            </div>

                            {/* Links Section */}
                            <div className="p-8 flex-1 flex flex-col">
                                <div className="grid grid-cols-1 gap-4 mb-8">
                                    {dept.sub.map(s => (
                                        <Link
                                            key={s}
                                            href={`/shop?category=${s.toLowerCase()}`}
                                            className="flex items-center justify-between text-gray-600 hover:text-primary transition-colors group/link"
                                        >
                                            <span className="font-bold text-sm">{s}</span>
                                            <ChevronRight size={14} className="text-gray-300 group-hover/link:translate-x-1 transition-transform" />
                                        </Link>
                                    ))}
                                </div>

                                <Link
                                    href={`/shop?department=${dept.name.toLowerCase()}`}
                                    className="mt-auto w-full bg-gray-50 text-black py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center hover:bg-black hover:text-white transition-all active:scale-95"
                                >
                                    Voir tout l'univers
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ')
}
