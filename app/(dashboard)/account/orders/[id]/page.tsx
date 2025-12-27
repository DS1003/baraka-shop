'use client'

import React from 'react'
import { ArrowLeft, Clock, CreditCard, MapPin, Package, Phone, CheckCircle2, Truck, ChevronRight, FileText } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function OrderDetailsPage() {
    const params = useParams()
    const id = params.id

    return (
        <div className="space-y-10">
            {/* Header with Back Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <Link href="/account/orders" className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-black hover:text-white transition-all active:scale-90 shadow-sm">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-1">
                            Détails de Commande
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">#{id}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-4 py-2 bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-orange-100">
                        En Cours
                    </span>
                    <button className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-black transition-colors">
                        <FileText size={20} />
                    </button>
                </div>
            </div>

            {/* Tracking Progress Bar */}
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-xl shadow-gray-200/40">
                <div className="relative flex justify-between items-center max-w-2xl mx-auto">
                    {/* Background Line */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-50" />
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2/3 h-1 bg-primary" />

                    {[
                        { label: 'Confirmé', icon: CheckCircle2, done: true },
                        { label: 'Traitement', icon: Package, done: true },
                        { label: 'Livraison', icon: Truck, active: true },
                        { label: 'Terminé', icon: Home, done: false },
                    ].map((step, idx) => (
                        <div key={idx} className="relative z-10 flex flex-col items-center gap-4">
                            <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                                step.done ? "bg-primary text-white shadow-lg shadow-primary/30" :
                                    step.active ? "bg-black text-white shadow-xl animate-pulse" : "bg-white border border-gray-100 text-gray-200"
                            )}>
                                <step.icon size={24} />
                            </div>
                            <span className={cn("text-[9px] font-black uppercase tracking-widest", step.done || step.active ? "text-black" : "text-gray-300")}>
                                {step.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Product List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-gray-100 rounded-[3rem] p-8 md:p-10 shadow-2xl shadow-gray-200/40">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8 ml-2">Articles de la commande</h3>
                        <div className="space-y-8">
                            {[1].map((item) => (
                                <div key={item} className="flex flex-col md:flex-row gap-8 pb-8 border-b border-gray-50 last:border-0 last:pb-0 group">
                                    <div className="relative w-full md:w-32 aspect-square bg-gray-50 rounded-[2rem] overflow-hidden shrink-0">
                                        <Image
                                            src="https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&q=80&w=400"
                                            alt="Product"
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-xl font-black text-gray-900 group-hover:text-primary transition-colors">Apple MacBook Pro 14" M3</h4>
                                            <div className="text-right">
                                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Prix</div>
                                                <div className="text-xl font-black italic">1.850.000 F</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-4">
                                            <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">Quantité: 01</span>
                                            <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">Garantie: 12 Mois</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Totals Summary */}
                    <div className="bg-gray-50 rounded-[2.5rem] p-8 md:p-10 border border-gray-100 space-y-4">
                        <div className="flex justify-between text-xs font-black uppercase tracking-widest text-gray-400">
                            <span>Sous-total</span>
                            <span>1.850.000 F</span>
                        </div>
                        <div className="flex justify-between text-xs font-black uppercase tracking-widest text-gray-400">
                            <span>Livraison</span>
                            <span className="text-green-600">Offerte</span>
                        </div>
                        <div className="pt-6 mt-6 border-t border-gray-200 flex justify-between items-end">
                            <span className="text-sm font-black uppercase tracking-widest text-gray-900">Total payé</span>
                            <span className="text-3xl font-black text-primary italic">1.850.000 F</span>
                        </div>
                    </div>
                </div>

                {/* Right: Info Cards */}
                <div className="space-y-8">
                    {/* Delivery Info */}
                    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/40">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                                <MapPin size={22} />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Livraison</h3>
                        </div>
                        <div className="space-y-2">
                            <p className="text-lg font-black text-gray-900 leading-tight">Mouhamed Diop</p>
                            <p className="text-sm font-medium text-gray-500 leading-relaxed">123 Avenue Blaise Diagne, <br /> Dakar Plateau, Sénégal</p>
                            <div className="pt-4 mt-4 border-t border-gray-50 flex items-center gap-3 text-sm font-bold text-gray-900">
                                <Phone size={16} className="text-primary" /> +221 77 000 00 00
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/40">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                                <CreditCard size={22} />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Paiement</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-400">Méthode</span>
                                <span className="text-xs font-black uppercase tracking-widest">Espèces / COD</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-400">Statut</span>
                                <span className="px-3 py-1 bg-yellow-50 text-yellow-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-yellow-100">À Encaisser</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Help */}
                    <div className="bg-black rounded-[2.5rem] p-8 text-white text-center">
                        <h4 className="text-lg font-black mb-4 leading-tight">Un problème avec <br /> cette commande ?</h4>
                        <button className="w-full bg-white text-black py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-primary hover:text-white transition-all">
                            Service Client
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Home({ className, size }: { className?: string, size?: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    )
}
