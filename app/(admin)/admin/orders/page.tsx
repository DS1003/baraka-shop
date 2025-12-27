'use client'

import React, { useState } from 'react'
import {
    Calendar,
    ShoppingCart,
    Search,
    Filter,
    Download,
    ChevronRight,
    Eye,
    Truck,
    Package,
    CheckCircle2,
    Clock,
    MoreHorizontal,
    MapPin,
    ArrowUpDown,
    ArrowLeft,
    X,
    Printer,
    Mail
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const ORDERS = [
    { id: 'BRK-9901', customer: 'Mouhamed Diop', date: '27 Dec 2025', total: '1.250.000 F', status: 'Payé', delivery: 'En cours', items: 2 },
    { id: 'BRK-9902', customer: 'Fatou Ndiaye', date: '26 Dec 2025', total: '85.000 F', status: 'En attente', delivery: 'Programmé', items: 3 },
    { id: 'BRK-9895', customer: 'Amadou Fall', date: '25 Dec 2025', total: '450.000 F', status: 'Payé', delivery: 'Livré', items: 1 },
    { id: 'BRK-9880', customer: 'Binta Sarr', date: '24 Dec 2025', total: '12.000 F', status: 'Annulé', delivery: '-', items: 1 },
    { id: 'BRK-9872', customer: 'Modou Gueye', date: '23 Dec 2025', total: '2.400.000 F', status: 'Payé', delivery: 'Livré', items: 5 },
]

export default function AdminOrdersPage() {
    const [selectedOrder, setSelectedOrder] = useState<any>(null)

    return (
        <div className="space-y-10">

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-2">
                        Gestion des Ventes
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter leading-none uppercase">
                        Flux <span className="text-primary italic">Commandes.</span>
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-3 bg-gray-50 text-gray-400 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                        <Download size={14} /> Exporter CSV
                    </button>
                    <button className="flex items-center gap-3 bg-primary text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                        <Printer size={14} /> Imprimer Manifeste
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Commandes', value: '1,840', color: 'text-gray-900' },
                    { label: 'En Traitement', value: '42', color: 'text-orange-500' },
                    { label: 'Terminées', value: '1,750', color: 'text-green-500' },
                    { label: 'Annulations', value: '48', color: 'text-red-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-xl shadow-gray-200/40">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">{stat.label}</p>
                        <h3 className={cn("text-2xl font-black tracking-tight", stat.color)}>{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Table Controller */}
            <div className="bg-white border border-gray-100 rounded-[3rem] shadow-2xl shadow-gray-200/40 overflow-hidden relative">

                {/* Search & Filter Bar */}
                <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100 flex-1 max-w-xl group focus-within:bg-white focus-within:border-primary/20 transition-all">
                        <Search size={18} className="text-gray-300 group-focus-within:text-primary" />
                        <input
                            type="text"
                            placeholder="RECHERCHER PAR ID, NOM OU STATUT..."
                            className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest w-full placeholder:text-gray-300"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-3 bg-gray-50 text-gray-400 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:text-black transition-colors">
                            <Filter size={14} /> Filtrer
                        </button>
                        <button className="flex items-center gap-3 bg-gray-50 text-gray-400 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:text-black transition-colors">
                            <ArrowUpDown size={14} /> Trier
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Commande</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Client</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Total</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Paiement</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Livraison</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {ORDERS.map((order, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-10 py-8">
                                        <div className="text-sm font-black text-gray-900 group-hover:text-primary transition-colors cursor-pointer">{order.id}</div>
                                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase mt-1">
                                            <Calendar size={10} /> {order.date}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="text-sm font-black text-gray-900">{order.customer}</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">{order.items} Articles</div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="text-base font-black italic">{order.total}</div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className={cn(
                                            "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                            order.status === 'Payé' ? "bg-green-50 text-green-600 border-green-100" :
                                                order.status === 'En attente' ? "bg-orange-50 text-orange-600 border-orange-100" :
                                                    "bg-red-50 text-red-600 border-red-100"
                                        )}>
                                            <div className={cn("w-1.5 h-1.5 rounded-full", order.status === 'Payé' ? "bg-green-600" : order.status === 'En attente' ? "bg-orange-600" : "bg-red-600")} />
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-3 text-xs font-black text-gray-500 uppercase">
                                            <Truck size={14} className={order.delivery === 'Livré' ? "text-green-500" : "text-gray-300"} />
                                            {order.delivery}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center hover:bg-primary transition-all active:scale-90"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button className="w-10 h-10 bg-gray-100 text-gray-400 rounded-xl flex items-center justify-center hover:bg-black hover:text-white transition-all">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-10 border-t border-gray-50 flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Affichage de 1 à 10 sur 1,840 résultats</p>
                    <div className="flex items-center gap-2">
                        <button className="px-5 py-3 bg-gray-50 text-gray-300 rounded-xl font-black text-[10px] uppercase tracking-widest cursor-not-allowed">Précédent</button>
                        <button className="px-5 py-3 bg-black text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all active:scale-95">Suivant</button>
                    </div>
                </div>
            </div>

            {/* Sidebar Details Panel - Floating right */}
            <AnimatePresence>
                {selectedOrder && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedOrder(null)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 h-screen w-full max-w-xl bg-white z-[101] shadow-2xl flex flex-col"
                        >
                            <div className="p-10 flex items-center justify-between border-b border-gray-50">
                                <div className="flex items-center gap-6">
                                    <button
                                        onClick={() => setSelectedOrder(null)}
                                        className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-black hover:text-white transition-all"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900 leading-none mb-1">Détails Commande</h3>
                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">{selectedOrder.id}</p>
                                    </div>
                                </div>
                                <button className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 space-y-12 pb-24">
                                {/* Order Summary Card */}
                                <div className="bg-gray-50 rounded-[2.5rem] p-10 relative overflow-hidden group">
                                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                                        <div>
                                            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Total de la commande</p>
                                            <h4 className="text-4xl font-black text-gray-900 tracking-tighter tabular-nums">{selectedOrder.total}</h4>
                                        </div>
                                        <div className="px-6 py-4 bg-white rounded-3xl shadow-xl shadow-black/5 text-center">
                                            <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Mode de Paiement</p>
                                            <p className="text-xs font-black uppercase tracking-widest leading-none">Virement Bancaire</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Tracking Progress */}
                                <div className="space-y-6">
                                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Suivi Logistique</h5>
                                    <div className="grid grid-cols-4 gap-4">
                                        {[
                                            { label: 'Confirmé', icon: CheckCircle2, active: true },
                                            { label: 'Préparation', icon: Package, active: true },
                                            { label: 'En Route', icon: Truck, active: false },
                                            { label: 'Livré', icon: MapPin, active: false },
                                        ].map((step, i) => (
                                            <div key={i} className="flex flex-col items-center gap-3">
                                                <div className={cn(
                                                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                                                    step.active ? "bg-black text-white shadow-xl" : "bg-gray-50 text-gray-200 border border-gray-100"
                                                )}>
                                                    <step.icon size={24} />
                                                </div>
                                                <span className={cn("text-[9px] font-black uppercase tracking-widest", step.active ? "text-black" : "text-gray-300")}>{step.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Customer Info */}
                                <div className="space-y-6">
                                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Informations Acheteur</h5>
                                    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/40 space-y-6 relative group overflow-hidden">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center text-white text-xl font-black">
                                                {selectedOrder.customer.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black text-gray-900">{selectedOrder.customer}</h4>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <button className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                                        <Mail size={12} /> Email Client
                                                    </button>
                                                    <span className="w-1 h-1 bg-gray-200 rounded-full" />
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID: {idxToUserId(selectedOrder.id)}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Adresse de Livraison</p>
                                            <p className="text-sm font-bold text-gray-700 leading-relaxed">
                                                123 Avenue Blaise Diagne, <br /> Dakar Plateau, Sénégal. <br /> Tel: +221 77 000 00 00
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="grid grid-cols-2 gap-4">
                                    <button className="bg-black text-white py-6 rounded-3xl font-black text-[11px] uppercase tracking-widest shadow-2xl hover:bg-primary transition-all">
                                        Valider Préparation
                                    </button>
                                    <button className="bg-gray-50 text-gray-400 py-6 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                                        Modifier Commande
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

        </div>
    )
}

function idxToUserId(id: string) {
    return id.split('-')[1] || '0000'
}
