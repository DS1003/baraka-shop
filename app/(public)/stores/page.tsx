'use client'

import React from 'react'
import { MapPin, Phone, Clock, Navigation, Globe, ArrowLeft, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

const STORES = [
    {
        id: 1,
        name: 'Baraka Shop - Dakar Plateau',
        address: 'Avenue Pompidou, Dakar',
        phone: '+221 33 800 00 01',
        hours: '09:00 - 20:00',
        img: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=800&auto=format&fit=crop',
        rating: 4.8,
        tags: ['Smartphone Expert', 'Service Après Vente']
    },
    {
        id: 2,
        name: 'Baraka Shop - Almadies',
        address: 'Route des Almadies, Dakar',
        phone: '+221 33 800 00 02',
        hours: '10:00 - 22:00',
        img: 'https://images.unsplash.com/photo-1544441893-675973e31d35?q=80&w=800&auto=format&fit=crop',
        rating: 4.9,
        tags: ['Apple Authorized', 'Gaming Center']
    },
    {
        id: 3,
        name: 'Baraka Shop - Mermoz',
        address: 'Vdn, Immeuble Baraka, Dakar',
        phone: '+221 33 800 00 03',
        hours: '08:30 - 19:30',
        img: 'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?q=80&w=800&auto=format&fit=crop',
        rating: 4.7,
        tags: ['Computing Pro', 'B2B Services']
    }
]

export default function StoresPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header Area */}
            <div className="relative h-[250px] md:h-[400px] bg-black overflow-hidden flex items-center justify-center">
                <Image
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2000&auto=format&fit=crop"
                    alt="Baraka Stores"
                    fill
                    className="object-cover opacity-60"
                />
                <div className="relative z-10 text-center px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <h1 className="text-4xl md:text-7xl font-black text-white mb-4 tracking-tighter">Boutiques <span className="text-primary italic">Baraka.</span></h1>
                        <p className="text-gray-300 font-medium max-w-lg mx-auto text-sm md:text-base">Retrouvez-nous partout au Sénégal pour des conseils d'experts et un service après-vente de qualité.</p>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-10 md:-mt-20 relative z-20 pb-32">
                <div className="flex flex-col gap-8 md:gap-12">
                    {STORES.map((store, idx) => (
                        <motion.div
                            key={store.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white rounded-[3rem] shadow-2xl shadow-black/5 border border-gray-100 flex flex-col lg:flex-row overflow-hidden group"
                        >
                            {/* Store Image */}
                            <div className="lg:w-[45%] h-[300px] lg:h-auto relative overflow-hidden">
                                <Image
                                    src={store.img}
                                    alt={store.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-1000"
                                />
                                <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                                    {store.tags.map(tag => (
                                        <span key={tag} className="bg-black/60 backdrop-blur-md text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-full border border-white/10 tracking-widest">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Store Details */}
                            <div className="flex-1 p-8 md:p-12">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <div className="flex items-center gap-1 mb-2">
                                            <div className="flex text-yellow-500">
                                                <Star size={12} fill="currentColor" />
                                            </div>
                                            <span className="text-xs font-black">{store.rating} / 5</span>
                                        </div>
                                        <h2 className="text-3xl font-black text-gray-900 leading-none">{store.name}</h2>
                                    </div>
                                    <div className="flex items-center gap-2 bg-green-50 text-green-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Ouvert
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                    <div className="space-y-6">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-colors">
                                                <MapPin size={22} />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Localisation</div>
                                                <div className="text-sm font-bold text-gray-700">{store.address}</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-colors">
                                                <Phone size={22} />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Téléphone</div>
                                                <div className="text-sm font-bold text-gray-700">{store.phone}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-colors">
                                                <Clock size={22} />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Horaires</div>
                                                <div className="text-sm font-bold text-gray-700">{store.hours}</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-colors">
                                                <Globe size={22} />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Social</div>
                                                <div className="text-sm font-bold text-primary">@barakashop.sn</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button className="flex-1 bg-black text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:shadow-black/20 transition-all flex items-center justify-center gap-2 active:scale-95">
                                        <Navigation size={18} /> Itinéraire
                                    </button>
                                    <button className="flex-1 border-2 border-gray-100 text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:border-black transition-all active:scale-95">
                                        Contacter
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}
