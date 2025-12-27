'use client'

import React from 'react'
import { Package, Clock, CreditCard, ChevronRight, Zap, Target, History, Sparkles, Truck } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function AccountPage() {
    return (
        <div className="space-y-12">
            {/* Greetings */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-2">Heureux de vous revoir ! 👋</h1>
                <p className="text-gray-400 font-medium">Voici ce qui se passe sur votre compte aujourd'hui.</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Commandes', value: '12', icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'En Livraison', value: '02', icon: Truck, color: 'text-primary', bg: 'bg-orange-50' },
                    { label: 'Bons d\'achat', value: '15.000 F', icon: CreditCard, color: 'text-green-600', bg: 'bg-green-50' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -5 }}
                        className={cn("p-6 rounded-[2rem] border border-transparent transition-all", stat.bg)}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                <stat.icon className={stat.color} size={24} />
                            </div>
                            <span className={cn("text-3xl font-black", stat.color)}>{stat.value}</span>
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-black/40">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Main Action Zones */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                {/* Recent Activity / Last Order */}
                <div className="space-y-6">
                    <div className="flex justify-between items-end">
                        <h3 className="font-black text-sm uppercase tracking-[0.2em] text-gray-400 leading-none">Dernière Commande</h3>
                        <Link href="/account/orders" className="text-[10px] font-black uppercase text-primary tracking-widest hover:underline">Voir tout</Link>
                    </div>

                    <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 relative group overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">#BRK-8902</div>
                                    <h4 className="text-xl font-black">Sony WH-1000XM5</h4>
                                </div>
                                <span className="px-3 py-1.5 bg-orange-100 text-primary text-[9px] font-black uppercase tracking-widest rounded-full border border-primary/10">En transit</span>
                            </div>

                            <div className="flex -space-x-4 mb-8">
                                {[1, 2].map(i => (
                                    <div key={i} className="w-14 h-14 rounded-2xl border-4 border-gray-50 bg-white overflow-hidden shadow-sm">
                                        <div className="w-full h-full bg-gray-100 animate-pulse" />
                                    </div>
                                ))}
                                <div className="w-14 h-14 rounded-2xl border-4 border-gray-50 bg-black text-white flex items-center justify-center text-[10px] font-bold">
                                    +1
                                </div>
                            </div>

                            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100">
                                <div className="text-xs font-bold text-gray-400">Total payé</div>
                                <div className="text-lg font-black italic">852.000 F</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loyalty / Next Goal */}
                <div className="space-y-6">
                    <h3 className="font-black text-sm uppercase tracking-[0.2em] text-gray-400 leading-none">Programme Fidélité</h3>
                    <div className="h-full bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform" />
                        <Sparkles className="absolute top-8 right-8 text-white/20" size={60} />

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="mb-auto">
                                <div className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-2">Niveau Silver</div>
                                <h4 className="text-3xl font-black mb-4 leading-tight">Baraka <br /> Rewards Plus</h4>
                                <div className="text-xs font-medium text-indigo-100 max-w-[200px]">Plus que 45.000 F d'achats pour passer au niveau Gold !</div>
                            </div>

                            <div className="mt-8 space-y-3">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span>Progression</span>
                                    <span>85%</span>
                                </div>
                                <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '85%' }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 rounded-[2.5rem] border border-gray-100 bg-white hover:border-black transition-all group">
                    <History className="text-gray-300 mb-6 group-hover:text-black transition-colors" size={32} />
                    <h4 className="text-lg font-black mb-2">Dernière activité</h4>
                    <p className="text-sm text-gray-400 font-medium leading-relaxed">Vous avez mis à jour votre adresse de livraison au Plateau.</p>
                </div>
                <div className="p-8 rounded-[2.5rem] border border-gray-100 bg-white hover:border-black transition-all group">
                    <Target className="text-gray-300 mb-6 group-hover:text-black transition-colors" size={32} />
                    <h4 className="text-lg font-black mb-2">Préférences</h4>
                    <p className="text-sm text-gray-400 font-medium leading-relaxed">Notifications mobiles activées pour les offres flash.</p>
                </div>
            </div>
        </div>
    )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ')
}
