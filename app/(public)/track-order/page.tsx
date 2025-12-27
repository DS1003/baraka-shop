'use client'

import React, { useState } from 'react'
import { Search, Package, Truck, CheckCircle2, Clock, MapPin, ChevronRight, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const STEPS = [
    { id: 'ordered', label: 'Commandé', date: '25 Déc, 10:30', icon: Clock, done: true },
    { id: 'shipped', label: 'Expédié', date: '26 Déc, 14:15', icon: Truck, done: true },
    { id: 'transit', label: 'En transit', date: 'En cours...', icon: Package, done: false, active: true },
    { id: 'delivered', label: 'Livré', date: 'Estimation: 28 Déc', icon: CheckCircle2, done: false },
]

export default function TrackOrderPage() {
    const [orderId, setOrderId] = useState('')
    const [showStatus, setShowStatus] = useState(false)

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (orderId) setShowStatus(true)
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-32">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-6 py-6 sticky top-0 z-40 lg:hidden">
                <div className="flex items-center gap-4">
                    <Link href="/" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-lg font-black tracking-tight leading-none uppercase">Suivi de commande</h1>
                </div>
            </div>

            <div className="container mx-auto max-w-2xl px-4 py-12">
                {!showStatus ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-gray-200/50 text-center"
                    >
                        <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                            <Truck size={36} />
                        </div>
                        <h2 className="text-3xl font-black mb-4 tracking-tight leading-none">Où est votre colis ?</h2>
                        <p className="text-gray-400 text-sm mb-10 max-w-xs mx-auto font-medium">Saisissez votre numéro de commande pour connaître l'état de votre livraison en temps réel.</p>

                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="relative group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Ex: #BK-8829-2025"
                                    className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-5 pl-16 pr-6 text-sm font-black focus:bg-white focus:border-black transition-all outline-none"
                                    value={orderId}
                                    onChange={(e) => setOrderId(e.target.value)}
                                />
                            </div>
                            <button className="w-full bg-black text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-black/20 hover:bg-primary transition-all active:scale-95">
                                Rechercher le colis
                            </button>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6"
                    >
                        {/* Order Summary Card */}
                        <div className="bg-black text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                            <div className="relative z-10 flex justify-between items-start mb-10">
                                <div>
                                    <div className="text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-2">Ref: {orderId}</div>
                                    <h3 className="text-2xl font-black leading-none">MacBook Pro 14" M3</h3>
                                    <p className="text-gray-400 text-xs mt-2 font-medium">Expédié le 26 Décembre 2025</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border border-white/10">
                                    En transit
                                </div>
                            </div>

                            {/* Visual Progress Bar */}
                            <div className="relative z-10 flex items-center gap-1">
                                <div className="h-1.5 flex-1 bg-primary rounded-full" />
                                <div className="h-1.5 flex-1 bg-primary rounded-full" />
                                <div className="h-1.5 flex-1 bg-white/20 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ x: '-100%' }}
                                        animate={{ x: '0%' }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="h-full bg-primary/50 w-full"
                                    />
                                </div>
                                <div className="h-1.5 flex-1 bg-white/20 rounded-full" />
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50">
                            <h4 className="font-black uppercase tracking-widest text-xs text-gray-400 mb-8">Détails de l'acheminement</h4>
                            <div className="space-y-8">
                                {STEPS.map((step, idx) => (
                                    <div key={step.id} className="relative flex gap-6">
                                        {idx !== STEPS.length - 1 && (
                                            <div className={cn(
                                                "absolute left-6 top-10 bottom-[-2rem] w-0.5",
                                                step.done ? "bg-primary" : "bg-gray-100"
                                            )} />
                                        )}
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 z-10 animate-in",
                                            step.done ? "bg-primary text-white shadow-lg shadow-primary/30" :
                                                step.active ? "bg-black text-white shadow-xl animate-pulse" : "bg-gray-50 text-gray-300"
                                        )}>
                                            <step.icon size={20} />
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <div className={cn("font-black text-sm", step.done || step.active ? "text-gray-900" : "text-gray-300")}>{step.label}</div>
                                                <div className="text-[10px] font-bold text-gray-400">{step.date}</div>
                                            </div>
                                            {step.active && (
                                                <div className="flex items-center gap-2 text-xs text-primary font-bold mt-2">
                                                    <MapPin size={12} /> Dakar Plateau, Hub Nord
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setShowStatus(false)}
                            className="w-full py-5 text-gray-400 font-bold text-sm flex items-center justify-center gap-2 hover:text-black transition-all"
                        >
                            Changer de commande
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
