'use client'

import React from 'react'
import { Container } from '@/ui/Container'
import { MapPin, Phone, Clock, Navigation, CheckCircle2, Search } from 'lucide-react'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface StoresClientProps {
    initialStores: any[];
}

export default function BoutiquesClient({ initialStores }: StoresClientProps) {
    const [stores, setStores] = React.useState(initialStores);
    return (
        <main className="bg-[#f8f9fb] min-h-screen">
            {/* Page Header */}
            <div className="bg-[#1B1F3B] py-12 md:py-24 relative overflow-hidden text-center">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
                    style={{ backgroundImage: `url('https://res.cloudinary.com/dgro5x4h8/image/upload/v1768669738/pattern_2_kln9c6.png')`, backgroundSize: 'cover' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/5 blur-[120px] rounded-full" />

                <Container className="relative z-10 px-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-center gap-3 mb-6"
                    >
                        <div className="w-6 md:w-10 h-px bg-primary" />
                        <span className="text-primary font-black text-[9px] md:text-[11px] uppercase tracking-[0.4em]">Nos Points de Vente</span>
                        <div className="w-6 md:w-10 h-px bg-primary" />
                    </motion.div>
                    <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter mb-4 md:mb-6 leading-none">Nos Boutiques</h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-lg font-medium leading-relaxed">
                        Venez découvrir l'univers Baraka Shop en boutique. Profitez des conseils de nos experts et d'une prise en main immédiate.
                    </p>
                </Container>
            </div>

            <section className="py-12 md:py-20">
                <Container className="px-4 md:px-8">
                    {/* Filter / Search Bar */}
                    <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-gray-100 shadow-sm mb-12 md:mb-16 flex flex-col md:flex-row items-center gap-4 md:gap-6">
                        <div className="flex-1 relative w-full">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher une zone..."
                                className="w-full h-14 md:h-16 bg-gray-50 rounded-xl md:rounded-2xl pl-16 pr-6 outline-none border border-gray-100 focus:border-primary focus:bg-white transition-all text-sm font-bold"
                            />
                        </div>
                        <button className="h-14 md:h-16 px-8 md:px-10 bg-[#1B1F3B] text-white rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 w-full md:w-auto shrink-0">
                            <Navigation className="w-4 h-4" /> Autour de moi
                        </button>
                    </div>

                    {/* Stores Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                        {stores.map((store, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group bg-white rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200 transition-all duration-500"
                            >
                                <div className="relative h-48 md:h-64 w-full overflow-hidden">
                                    <div className="w-full h-full bg-[#1B1F3B] flex items-center justify-center relative">
                                        {store.image ? (
                                            <img src={store.image} alt={store.name} className="w-full h-full object-cover opacity-80" />
                                        ) : (
                                            <MapPin className="w-12 md:w-16 h-12 md:h-16 text-primary/30 relative z-10" strokeWidth={1} />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#1B1F3B] to-transparent opacity-60 z-10" />
                                    </div>
                                    {store.type && (
                                        <div className="absolute top-6 left-6 bg-primary text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                                            {store.type}
                                        </div>
                                    )}
                                </div>

                                <div className="p-8 md:p-10 flex flex-col gap-4 md:gap-6">
                                    <div>
                                        <span className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 block">{store.city || "Ville non précisée"}</span>
                                        <h3 className="text-xl md:text-2xl font-black text-[#1B1F3B] uppercase tracking-tighter mb-4">{store.name}</h3>
                                        <div className="flex items-start gap-3 text-gray-400 text-xs md:text-sm font-medium leading-relaxed">
                                            <MapPin className="w-4 h-4 md:w-5 md:h-5 text-[#1B1F3B] shrink-0 mt-0.5" />
                                            {store.address || "Adresse non précisée"}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 py-4 md:py-6 border-y border-gray-50">
                                        <div className="flex items-center gap-3 text-xs md:text-sm font-bold text-[#1B1F3B]">
                                            <Phone className="w-4 h-4 text-primary" />
                                            {store.phone || "Téléphone non précisé"}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs md:text-sm font-bold text-[#1B1F3B]">
                                            <Clock className="w-4 h-4 text-primary" />
                                            {store.hours || "Horaires non précisés"}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {store.isClickCollect && (
                                            <div className="flex items-center gap-2 text-[8px] md:text-[9px] font-black text-gray-400 uppercase">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Click & Collect
                                            </div>
                                        )}
                                        {store.isSav && (
                                            <div className="flex items-center gap-2 text-[8px] md:text-[9px] font-black text-gray-400 uppercase">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> S.A.V Officiel
                                            </div>
                                        )}
                                    </div>

                                    {store.mapUrl && (
                                        <a href={store.mapUrl} target="_blank" rel="noreferrer" className="w-full h-12 md:h-14 bg-gray-50 text-[#1B1F3B] rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all mt-2 md:mt-4 flex items-center justify-center">
                                            Voir sur Google Maps
                                        </a>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </Container>
            </section>
        </main>
    )
}
