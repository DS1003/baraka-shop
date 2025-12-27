'use client'

import React, { useState } from 'react'
import { User, Lock, Bell, ShieldCheck, CreditCard, ChevronRight, Save, Camera, Smartphone } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile')

    const tabs = [
        { id: 'profile', label: 'Profil', icon: User },
        { id: 'security', label: 'Sécurité', icon: Lock },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'billing', label: 'Paiement', icon: CreditCard },
    ]

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Paramètres <span className="text-primary italic">Compte.</span></h1>
                <p className="text-gray-400 font-medium">Gérez vos informations personnelles et vos préférences de sécurité.</p>
            </div>

            {/* Horizontal Tabs for Mobile / Sidebar for Desktop */}
            <div className="flex overflow-x-auto pb-4 gap-2 scrollbar-hide">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap",
                            activeTab === tab.id
                                ? "bg-black text-white shadow-xl shadow-black/10"
                                : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-black"
                        )}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="mt-10">
                {activeTab === 'profile' && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                        {/* Profile Photo */}
                        <div className="flex flex-col md:flex-row items-center gap-8 p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-xl overflow-hidden">
                                    <div className="w-full h-full bg-gray-200 animate-pulse" />
                                </div>
                                <button className="absolute bottom-0 right-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center border-2 border-white hover:bg-primary transition-all">
                                    <Camera size={14} />
                                </button>
                            </div>
                            <div className="text-center md:text-left">
                                <h3 className="text-xl font-black text-gray-900">Photo de profil</h3>
                                <p className="text-xs text-gray-400 font-medium mt-1">PNG, JPG jusqu'à 5MB. 500x500 conseillé.</p>
                                <div className="flex gap-3 mt-4 justify-center md:justify-start">
                                    <button className="px-4 py-2 bg-black text-white rounded-xl text-[9px] font-black uppercase tracking-widest">Changer</button>
                                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50">Supprimer</button>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { label: 'Prénom', val: 'Mouhamed' },
                                { label: 'Nom', val: 'Diop' },
                                { label: 'Email', val: 'mouhamed.diop@example.sn' },
                                { label: 'Téléphone', val: '+221 77 000 00 00' },
                            ].map(field => (
                                <div key={field.label} className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">{field.label}</label>
                                    <input
                                        type="text"
                                        defaultValue={field.val}
                                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 px-6 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Adresse Complète</label>
                            <textarea
                                rows={3}
                                defaultValue="123 Avenue Blaise Diagne, Immeuble Baraka, Dakar, Sénégal"
                                className="w-full bg-gray-50 border-2 border-transparent rounded-[1.5rem] py-4 px-6 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none resize-none"
                            />
                        </div>

                        <div className="pt-6 border-t border-gray-50 flex justify-end">
                            <button className="bg-primary text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-3">
                                <Save size={18} /> Sauvegarder
                            </button>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'security' && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                        <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex items-center justify-between group cursor-pointer hover:bg-white hover:shadow-xl transition-all">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-primary">
                                    <Smartphone size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 leading-none mb-2">Double Authentification</h3>
                                    <p className="text-xs text-gray-400 font-medium">Ajoutez une couche de sécurité par SMS ou Email.</p>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-gray-200/50 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-all">
                                <ChevronRight size={20} />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Mot de passe</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Ancien mot de passe</label>
                                    <input type="password" placeholder="••••••••" className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 px-6 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Nouveau mot de passe</label>
                                    <input type="password" placeholder="••••••••" className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 px-6 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none" />
                                </div>
                            </div>
                            <button className="bg-black text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest mt-4">Mettre à Jour</button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
