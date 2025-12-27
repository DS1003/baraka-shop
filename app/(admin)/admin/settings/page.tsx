'use client'

import React, { useState } from 'react'
import {
    Settings,
    Globe,
    ShieldCheck,
    Bell,
    CreditCard,
    Truck,
    Mail,
    Smartphone,
    Palette,
    Database,
    Lock,
    Eye,
    ChevronRight,
    Save,
    RotateCcw,
    Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const SETTINGS_TABS = [
    { id: 'general', label: 'Général', icon: Globe },
    { id: 'payment', label: 'Paiements', icon: CreditCard },
    { id: 'shipping', label: 'Livraison', icon: Truck },
    { id: 'security', label: 'Sécurité', icon: ShieldCheck },
    { id: 'notifications', label: 'Alertes', icon: Bell },
    { id: 'advanced', label: 'Avancé', icon: Database },
]

export default function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState('general')

    return (
        <div className="space-y-12">

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-2">
                        Configuration Système
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter leading-none uppercase">
                        Master <span className="text-primary italic">Config.</span>
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-3 bg-gray-50 text-gray-400 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                        <RotateCcw size={14} /> Reset
                    </button>
                    <button className="flex items-center gap-4 bg-black text-white px-8 py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-black/20 hover:bg-primary transition-all active:scale-95">
                        <Save size={18} /> Sauvegarder
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Navigation Tabs - Sidebar Style */}
                <div className="lg:col-span-3 space-y-2">
                    {SETTINGS_TABS.map((tab) => {
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "w-full flex items-center justify-between p-5 rounded-3xl transition-all group relative overflow-hidden",
                                    isActive ? "bg-black text-white shadow-xl shadow-black/10" : "bg-white border border-gray-100 text-gray-400 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    <tab.icon size={20} className={cn(isActive ? "text-primary" : "group-hover:scale-110 transition-transform")} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                                </div>
                                <ChevronRight size={16} className={cn("transition-transform", isActive ? "opacity-100" : "opacity-0")} />
                                {isActive && (
                                    <motion.div layoutId="setting-active" className="absolute left-0 top-0 w-1 h-full bg-primary" />
                                )}
                            </button>
                        )
                    })}

                    <div className="mt-12 p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10">
                        <Zap className="text-primary mb-4" size={24} fill="currentColor" />
                        <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-2">Statut Serveur</h4>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Opérationnel</span>
                        </div>
                    </div>
                </div>

                {/* Settings Form Area */}
                <div className="lg:col-span-9 space-y-10">

                    <div className="bg-white border border-gray-100 rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-gray-200/40">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-12"
                            >
                                {activeTab === 'general' && (
                                    <div className="space-y-10">
                                        <div>
                                            <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Paramètres de la Boutique</h3>
                                            <p className="text-gray-400 font-medium text-xs">Configurez l'identité et les paramètres de base de votre plateforme.</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Nom de la Plateforme</label>
                                                <input
                                                    type="text"
                                                    defaultValue="Baraka Shop Senegal"
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Email de Contact Public</label>
                                                <input
                                                    type="email"
                                                    defaultValue="support@baraka.sn"
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Devise Principale</label>
                                                <select className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 appearance-none focus:bg-white transition-all outline-none cursor-pointer">
                                                    <option>Franc CFA (BCEAO)</option>
                                                    <option>Dollar US ($)</option>
                                                    <option>Euro (€)</option>
                                                </select>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Fuseau Horaire</label>
                                                <select className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 appearance-none focus:bg-white transition-all outline-none cursor-pointer">
                                                    <option>(GMT+00:00) Dakar, Senegal</option>
                                                    <option>(GMT+01:00) Paris, France</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="pt-10 border-t border-gray-50 space-y-8">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">Mode Maintenance</h4>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Désactive l'accès public à la boutique</p>
                                                </div>
                                                <div className="w-14 h-8 bg-gray-100 rounded-full relative p-1 cursor-pointer transition-colors group">
                                                    <div className="w-6 h-6 bg-white rounded-full shadow-md group-hover:translate-x-0 transition-transform" />
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">Inscription Clients</h4>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Autoriser les nouveaux comptes</p>
                                                </div>
                                                <div className="w-14 h-8 bg-primary rounded-full relative p-1 cursor-pointer transition-colors group">
                                                    <div className="w-6 h-6 bg-white rounded-full shadow-md translate-x-6" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'payment' && (
                                    <div className="space-y-10">
                                        <div>
                                            <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Systèmes de Paiement</h3>
                                            <p className="text-gray-400 font-medium text-xs">Gérez vos passerelles de paiement et frais de transaction.</p>
                                        </div>

                                        <div className="space-y-6">
                                            {[
                                                { name: 'Wave Senegal', logo: '🌊', active: true, fee: '0%' },
                                                { name: 'Orange Money', logo: '🧡', active: true, fee: '1%' },
                                                { name: 'Stripe (International)', logo: '💳', active: false, fee: '2.9%' },
                                            ].map((method, i) => (
                                                <div key={i} className="flex items-center justify-between p-8 bg-gray-50 rounded-[2rem] border border-gray-100 hover:bg-white hover:shadow-xl transition-all group">
                                                    <div className="flex items-center gap-6">
                                                        <div className="text-3xl">{method.logo}</div>
                                                        <div>
                                                            <h4 className="text-sm font-black text-gray-900 uppercase">{method.name}</h4>
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Status: {method.active ? 'Connecté' : 'Non configuré'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-8">
                                                        <div className="text-right">
                                                            <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Frais</p>
                                                            <p className="text-sm font-black text-gray-900">{method.fee}</p>
                                                        </div>
                                                        <button className={cn(
                                                            "px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all",
                                                            method.active ? "bg-black text-white hover:bg-red-500" : "bg-primary text-white"
                                                        )}>
                                                            {method.active ? 'Configurer' : 'Installer'}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'security' && (
                                    <div className="space-y-10">
                                        <div>
                                            <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Sécurité & Accès</h3>
                                            <p className="text-gray-400 font-medium text-xs">Protégez votre infrastructure et gérez les clés d'accès.</p>
                                        </div>
                                        <div className="bg-orange-50 border border-orange-100 p-8 rounded-[2rem] flex items-start gap-6 text-orange-700">
                                            <Lock size={24} className="shrink-0 mt-1" />
                                            <div>
                                                <h5 className="font-black text-sm uppercase mb-1">Authentification à deux facteurs</h5>
                                                <p className="text-xs font-medium opacity-80 leading-relaxed mb-6">Ajoutez une couche de sécurité supplémentaire à votre compte administrateur.</p>
                                                <button className="bg-orange-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-orange-600/20">Activer le 2FA</button>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Clés API (Live)</h4>
                                            <div className="bg-gray-900 rounded-3xl p-6 flex items-center justify-between group">
                                                <code className="text-primary text-xs font-mono truncate max-w-md">sk_live_••••••••••••••••••••••••••••••••</code>
                                                <button className="p-3 bg-white/10 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-all"><Eye size={18} /></button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Bottom Utility Info */}
                    <div className="bg-gray-50 border border-gray-100 rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                <Palette size={24} className="text-primary" />
                            </div>
                            <div>
                                <h5 className="text-sm font-black text-gray-900 uppercase">Apparence & Theme</h5>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Personnalisez le visuel client</p>
                            </div>
                        </div>
                        <button className="px-8 py-4 bg-white border-2 border-gray-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-black transition-all">Aller au designer UI</button>
                    </div>
                </div>

            </div>

        </div>
    )
}
