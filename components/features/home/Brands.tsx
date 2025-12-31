'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Facebook, Twitter, Youtube, Instagram, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const BRANDS = [
    { name: 'Apple', logo: 'https://cdn.worldvectorlogo.com/logos/apple-11.svg' },
    { name: 'Lego', logo: 'https://cdn.worldvectorlogo.com/logos/lego-1.svg' },
    { name: 'Logitech', logo: 'https://cdn.worldvectorlogo.com/logos/logitech-2.svg' },
    { name: 'Logitech G', logo: 'https://cdn.worldvectorlogo.com/logos/logitech-g-1.svg' },
    { name: 'Razer', logo: 'https://cdn.worldvectorlogo.com/logos/razer-logo.svg' },
    { name: 'Corsair', logo: 'https://cdn.worldvectorlogo.com/logos/corsair-2.svg' },
]

export default function Brands() {
    return (
        <section className="py-20 bg-white">
            <div className="container px-4 mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* Brands Column */}
                    <div>
                        <div className="flex justify-between items-end mb-10">
                            <div className="flex flex-col">
                                <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">Nos Marques <span className="text-primary italic">Partenaires.</span></h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-3">Ils nous font confiance depuis 10 ans</p>
                            </div>
                            <Link href="/shop" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-primary transition-colors">
                                VOIR TOUT <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        <div className="bg-gray-50 rounded-[2.5rem] p-12 border border-gray-100">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-12 items-center">
                                {BRANDS.map((brand) => (
                                    <div key={brand.name} className="relative h-10 flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer group">
                                        <Image
                                            src={brand.logo}
                                            alt={brand.name}
                                            fill
                                            className="object-contain group-hover:scale-110 transition-transform"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Community Column */}
                    <div>
                        <div className="flex flex-col mb-10">
                            <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">Suivez l'aventure <span className="text-primary italic">Baraka.</span></h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-3">Rejoignez une communauté de passionnés</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Review Box */}
                            <div className="bg-white rounded-[2.5rem] p-8 border-2 border-primary/20 shadow-xl flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="flex gap-1 text-primary">
                                        {[1, 2, 3, 4, 5].map(s => <span key={s}>★</span>)}
                                    </div>
                                    <h3 className="text-lg font-black text-gray-900 italic uppercase tracking-tighter">"Le top de la tech au Sénégal !"</h3>
                                    <p className="text-[10px] text-gray-500 font-medium leading-relaxed uppercase tracking-wider">
                                        Avis vérifié - Plus de 10,000 clients satisfaits cette année.
                                    </p>
                                </div>
                                <div className="mt-8 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full" />
                                    <div>
                                        <p className="text-[10px] font-black text-gray-900 uppercase">Moussa Diop</p>
                                        <p className="text-[8px] font-bold text-gray-400 uppercase">Acheteur Certifié</p>
                                    </div>
                                </div>
                            </div>

                            {/* Social Grid */}
                            <div className="grid grid-cols-2 gap-6">
                                {[
                                    { icon: <Facebook size={24} />, color: 'bg-[#1877f2]', label: 'Facebook' },
                                    { icon: <Instagram size={24} />, color: 'bg-gradient-to-tr from-[#f09433] to-[#bc1888]', label: 'Instagram' },
                                    { icon: <Twitter size={24} />, color: 'bg-black', label: 'Twitter' },
                                    { icon: <Youtube size={24} />, color: 'bg-[#ff0000]', label: 'Youtube' },
                                ].map((social, i) => (
                                    <div key={i} className="bg-white rounded-[2rem] border border-gray-100 p-6 flex flex-col items-center justify-center gap-3 hover:shadow-xl transition-all cursor-pointer group">
                                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform", social.color)}>
                                            {social.icon}
                                        </div>
                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{social.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
