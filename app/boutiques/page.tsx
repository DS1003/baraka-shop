'use client'

import React from 'react'
import { Container } from '@/ui/Container'
import { MapPin, Phone, Clock, Navigation, CheckCircle2, Search } from 'lucide-react'
import Image from 'next/image'
import { motion } from 'framer-motion'

const STORES = [
    {
        name: "Baraka Shop - Plateau",
        address: "Avenue Lamine Gueye x Rue Sandiniery, Dakar",
        phone: "+221 33 821 44 44",
        hours: "Mon-Sat: 09:00 - 19:30",
        type: "Flagship Store",
        city: "Dakar Plateau",
        image: "https://media.ldlc.com/ld/products/00/06/22/20/LD0006222055.jpg" // Placeholder
    },
    {
        name: "Baraka Shop - Sea Plaza",
        address: "Centre Commercial Sea Plaza, Corniche Ouest",
        phone: "+221 33 864 12 12",
        hours: "Mon-Sun: 10:00 - 21:00",
        type: "Concept Store",
        city: "Corniche Ouest",
        image: "https://media.ldlc.com/encart/p/28828_b.jpg" // Placeholder
    },
    {
        name: "Baraka Shop - Almadies",
        address: "Route des Almadies, en face de l'Ambassade des USA",
        phone: "+221 33 820 99 99",
        hours: "Mon-Sat: 09:00 - 20:00",
        type: "Express Store",
        city: "Almadies",
        image: "https://media.ldlc.com/encart/p/28885_b.jpg" // Placeholder
    }
]

export default function StoresPage() {
    return (
        <main className="bg-[#f8f9fb] min-h-screen">
            {/* Page Header */}
            <div className="bg-[#1B1F3B] py-24 relative overflow-hidden text-center">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
                    style={{ backgroundImage: `url('https://res.cloudinary.com/dgro5x4h8/image/upload/v1768669738/pattern_2_kln9c6.png')`, backgroundSize: 'cover' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/5 blur-[120px] rounded-full" />

                <Container className="relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-center gap-3 mb-6"
                    >
                        <div className="w-10 h-px bg-primary" />
                        <span className="text-primary font-black text-[11px] uppercase tracking-[0.4em]">Nos Points de Vente</span>
                        <div className="w-10 h-px bg-primary" />
                    </motion.div>
                    <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter mb-6">Nos Boutiques</h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg font-medium">
                        Venez découvrir l'univers Baraka Shop en boutique. Profitez des conseils de nos experts et d'une prise en main immédiate.
                    </p>
                </Container>
            </div>

            <section className="py-20">
                <Container>
                    {/* Filter / Search Bar */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm mb-16 flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-1 relative w-full">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher une zone, un quartier..."
                                className="w-full h-16 bg-gray-50 rounded-2xl pl-16 pr-6 outline-none border border-gray-100 focus:border-primary focus:bg-white transition-all text-sm font-bold"
                            />
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <button className="h-16 px-10 bg-[#1B1F3B] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 grow md:grow-0">
                                <Navigation className="w-4 h-4" /> Autour de moi
                            </button>
                        </div>
                    </div>

                    {/* Stores Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {STORES.map((store, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group bg-white rounded-[3rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200 transition-all duration-500"
                            >
                                <div className="relative h-64 w-full overflow-hidden">
                                    {/* Simple Color placeholder or actual image if available */}
                                    {/* <Image src={store.image} alt={store.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" /> */}
                                    <div className="w-full h-full bg-[#1B1F3B] flex items-center justify-center">
                                        <MapPin className="w-16 h-16 text-primary/30" strokeWidth={1} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#1B1F3B] to-transparent opacity-60" />
                                    </div>
                                    <div className="absolute top-6 left-6 bg-primary text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                                        {store.type}
                                    </div>
                                </div>

                                <div className="p-10 flex flex-col gap-6">
                                    <div>
                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 block">{store.city}</span>
                                        <h3 className="text-2xl font-black text-[#1B1F3B] uppercase tracking-tighter mb-4">{store.name}</h3>
                                        <div className="flex items-start gap-3 text-gray-400 text-sm font-medium leading-relaxed">
                                            <MapPin className="w-5 h-5 text-[#1B1F3B] shrink-0 mt-0.5" />
                                            {store.address}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4 py-6 border-y border-gray-50">
                                        <div className="flex items-center gap-3 text-sm font-bold text-[#1B1F3B]">
                                            <Phone className="w-4 h-4 text-primary" />
                                            {store.phone}
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-bold text-[#1B1F3B]">
                                            <Clock className="w-4 h-4 text-primary" />
                                            {store.hours}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Click & Collect
                                        </div>
                                        <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> S.A.V Officiel
                                        </div>
                                    </div>

                                    <button className="w-full h-14 bg-gray-50 text-[#1B1F3B] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all mt-4">
                                        Voir sur Google Maps
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </Container>
            </section>
        </main>
    )
}
