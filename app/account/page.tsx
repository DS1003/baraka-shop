'use client'

import React, { useState } from 'react'
import { Container } from '@/ui/Container'
import {
    User,
    Package,
    Heart,
    MapPin,
    Settings,
    LogOut,
    ChevronRight,
    Clock,
    CreditCard,
    Shield
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import Image from 'next/image'

export default function AccountPage() {
    const [activeTab, setActiveTab] = useState('orders')

    const user = {
        name: "Abdoulaye Diop",
        email: "abdoulaye@example.com",
        memberSince: "Octobre 2024",
        avatar: "https://media.ldlc.com/ld/products/00/06/22/20/LD0006222055.jpg" // Placeholder
    }

    const menuItems = [
        { id: 'orders', label: 'Mes Commandes', icon: Package },
        { id: 'wishlist', label: 'Liste d\'envies', icon: Heart },
        { id: 'addresses', label: 'Adresses', icon: MapPin },
        { id: 'payments', label: 'Paiements', icon: CreditCard },
        { id: 'settings', label: 'Paramètres', icon: Settings },
    ]

    return (
        <main className="bg-[#f8f9fb] min-h-screen py-12 md:py-20">
            <Container>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Sidebar / Profile Info */}
                    <div className="lg:col-span-4 flex flex-col gap-8">
                        {/* Profile Card */}
                        <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm flex flex-col items-center text-center">
                            <div className="relative w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-primary/10 p-1">
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                                    <User className="w-16 h-16" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-black text-[#1B1F3B] uppercase tracking-tighter mb-1">{user.name}</h2>
                            <p className="text-gray-400 text-sm mb-6">{user.email}</p>

                            <div className="w-full h-px bg-gray-50 mb-6" />

                            <div className="flex items-center gap-3 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                <Shield className="w-4 h-4 text-green-500" /> Compte Vérifié
                            </div>
                        </div>

                        {/* Navigation Menu */}
                        <div className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm py-4">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={cn(
                                        "w-full px-10 py-5 flex items-center justify-between transition-all group border-l-4",
                                        activeTab === item.id
                                            ? "bg-primary/5 border-primary text-[#1B1F3B]"
                                            : "border-transparent text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-primary" : "text-gray-300 group-hover:text-gray-400")} />
                                        <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                                    </div>
                                    <ChevronRight className={cn("w-4 h-4 transition-transform", activeTab === item.id && "translate-x-1")} />
                                </button>
                            ))}
                            <div className="mx-10 my-4 h-px bg-gray-50" />
                            <button className="w-full px-10 py-5 flex items-center gap-4 text-red-500 hover:bg-red-50 transition-all">
                                <LogOut className="w-5 h-5" />
                                <span className="text-[11px] font-black uppercase tracking-widest">Déconnexion</span>
                            </button>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-[2.5rem] p-12 border border-gray-100 shadow-sm min-h-[600px]">
                            {activeTab === 'orders' && (
                                <div className="flex flex-col gap-10">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-black text-[#1B1F3B] uppercase tracking-tighter">Historique de commandes</h3>
                                        <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Voir tout</button>
                                    </div>

                                    {/* Order List */}
                                    <div className="flex flex-col gap-6">
                                        <OrderCard
                                            id="#BK-10524"
                                            date="14 Janvier 2024"
                                            status="En cours"
                                            total="2.500.000 CFA"
                                            items={1}
                                            statusColor="bg-blue-500"
                                        />
                                        <OrderCard
                                            id="#BK-10218"
                                            date="28 Décembre 2023"
                                            status="Livré"
                                            total="850.000 CFA"
                                            items={1}
                                            statusColor="bg-green-500"
                                        />
                                    </div>

                                    {/* Empty State Mock */}
                                    {/* <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                                        <Package className="w-16 h-16 text-gray-200 mb-4" />
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Aucune commande trouvée</p>
                                    </div> */}
                                </div>
                            )}

                            {activeTab === 'wishlist' && (
                                <div className="flex flex-col gap-10">
                                    <h3 className="text-2xl font-black text-[#1B1F3B] uppercase tracking-tighter">Ma Liste d'envies</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-center py-20">
                                        <div className="col-span-full flex flex-col items-center gap-4">
                                            <Heart className="w-16 h-16 text-gray-100" />
                                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Votre liste est vide</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'addresses' && (
                                <div className="flex flex-col gap-10">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-black text-[#1B1F3B] uppercase tracking-tighter">Mes Adresses</h3>
                                        <button className="bg-primary text-white text-[9px] font-black px-4 py-2 rounded-lg uppercase tracking-widest">Ajouter</button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="border border-primary rounded-2xl p-6 relative bg-primary/5">
                                            <div className="absolute top-6 right-6 bg-primary text-white text-[8px] font-black px-2 py-1 rounded uppercase">Défaut</div>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block">Livraison & Facturation</span>
                                            <h4 className="font-bold text-[#1B1F3B] mb-2 uppercase">Domicile</h4>
                                            <p className="text-sm text-gray-500 leading-relaxed mb-6">
                                                Cité Keur Gorgui, Immeuble Horizon<br />
                                                2ème étage, Dakar, Sénégal
                                            </p>
                                            <button className="text-xs font-black text-primary uppercase tracking-widest">Modifier</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Simple Message for others */}
                            {['payments', 'settings'].includes(activeTab) && (
                                <div className="flex flex-col items-center justify-center h-[400px] text-center gap-6">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                                        <Settings className="w-10 h-10" />
                                    </div>
                                    <h4 className="text-xl font-black text-[#1B1F3B] uppercase tracking-tight">Espace en maintenance</h4>
                                    <p className="text-gray-400 text-sm max-w-xs">Nous travaillons sur cette section pour vous offrir la meilleure expérience utilisateur possible.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Container>
        </main>
    )
}

function OrderCard({ id, date, status, total, items, statusColor }: any) {
    return (
        <div className="group border border-gray-100 rounded-3xl p-8 hover:border-primary/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-[#1B1F3B] shrink-0">
                    <Package className="w-6 h-6" />
                </div>
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <span className="text-lg font-black text-[#1B1F3B] tracking-tight">{id}</span>
                        <div className={cn("px-2.5 py-1 rounded-md text-[8px] font-black text-white uppercase tracking-widest", statusColor)}>
                            {status}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Commandé le {date}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:items-end gap-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{items} Article(s)</span>
                <span className="text-xl font-black text-[#1B1F3B] tracking-tighter">{total}</span>
            </div>

            <button className="h-12 px-6 rounded-xl bg-gray-50 text-[#1B1F3B] font-black text-[10px] uppercase tracking-widest hover:bg-[#1B1F3B] hover:text-white transition-all">
                Détails
            </button>
        </div>
    )
}
