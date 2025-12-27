'use client'

import React from 'react'
import {
    Users,
    Search,
    Filter,
    Download,
    Star,
    Mail,
    Phone,
    MapPin,
    ShieldCheck,
    ChevronRight,
    ArrowUpDown,
    MoreHorizontal,
    UserCircle,
    ShoppingBag,
    TrendingUp,
    Eye
} from 'lucide-react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const CUSTOMERS = [
    { id: 'C-8902', name: 'Mouhamed Diop', email: 'm.diop@email.com', phone: '+221 77 000 00 00', location: 'Dakar', spent: '4.5M F', orders: 12, rating: 5, avatar: 'MD' },
    { id: 'C-8815', name: 'Fatou Ndiaye', email: 'fatou.n@email.com', phone: '+221 76 111 22 33', location: 'Saint-Louis', spent: '850K F', orders: 5, rating: 4, avatar: 'FN' },
    { id: 'C-8750', name: 'Amadou Fall', email: 'a.fall@email.com', phone: '+221 70 555 66 77', location: 'Thies', spent: '12M F', orders: 48, rating: 5, avatar: 'AF' },
    { id: 'C-8720', name: 'Binta Sarr', email: 'b.sarr@email.com', phone: '+221 78 888 99 00', location: 'Dakar', spent: '120K F', orders: 2, rating: 3, avatar: 'BS' },
    { id: 'C-8690', name: 'Modou Gueye', email: 'modou.g@email.com', phone: '+221 77 333 44 55', location: 'Kaolack', spent: '2.4M F', orders: 8, rating: 5, avatar: 'MG' },
]

export default function AdminCustomersPage() {
    return (
        <div className="space-y-12">

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-2">
                        Base de Données Clients
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter leading-none uppercase">
                        Gestion <span className="text-primary italic">Audience.</span>
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-3 bg-gray-50 text-gray-400 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                        <Download size={14} /> Exporter Contacts
                    </button>
                    <button className="flex items-center gap-4 bg-black text-white px-8 py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-black/20 hover:bg-primary transition-all active:scale-95">
                        Campagne Email
                    </button>
                </div>
            </div>

            {/* Loyalty Insights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: 'Clients VIP', value: '450', sub: 'Plus de 1M F d\'achats', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Nouveaux Inscrits', value: '+128', sub: 'Ces 30 derniers jours', color: 'text-orange-500', bg: 'bg-orange-50' },
                    { label: 'Score Sat. Client', value: '4.8/5', sub: 'Basé sur 2.5K avis', color: 'text-green-600', bg: 'bg-green-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/40 relative overflow-hidden group">
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">{stat.label}</p>
                            <h3 className={cn("text-4xl font-black tracking-tight mb-2", stat.color)}>{stat.value}</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{stat.sub}</p>
                        </div>
                        <div className={cn("absolute bottom-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mb-16 opacity-20", stat.bg.replace('bg-', 'bg-'))} />
                    </div>
                ))}
            </div>

            {/* Customers Table Hub */}
            <div className="bg-white border border-gray-100 rounded-[3rem] shadow-2xl shadow-gray-200/40 overflow-hidden">

                {/* Filtration Bar */}
                <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100 flex-1 max-w-xl group focus-within:bg-white focus-within:border-primary/20 transition-all">
                        <Search size={18} className="text-gray-300 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="RECHERCHER PAR NOM, EMAIL OU TELEPHONE..."
                            className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-[0.2em] w-full placeholder:text-gray-300"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-3 bg-gray-50 text-gray-400 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:text-black transition-colors">
                            <Filter size={14} /> Segments
                        </button>
                        <button className="flex items-center gap-3 bg-gray-50 text-gray-400 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:text-black transition-colors">
                            <ArrowUpDown size={14} /> Trier Par
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Client Info</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Statistiques</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Localisation</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Satisfaction</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {CUSTOMERS.map((customer, idx) => (
                                <tr key={customer.id} className="hover:bg-gray-50/50 transition-all group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg group-hover:bg-primary transition-colors">
                                                {customer.avatar}
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-gray-900 group-hover:text-primary transition-colors cursor-pointer">{customer.name}</div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase mt-1 flex items-center gap-2">
                                                    <Mail size={12} /> {customer.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center">
                                                <ShoppingBag size={14} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-gray-900">{customer.spent}</div>
                                                <div className="text-[9px] text-gray-400 font-bold uppercase">{customer.orders} Commandes</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-2 text-xs font-black text-gray-900 uppercase">
                                            <MapPin size={14} className="text-gray-300" />
                                            {customer.location}, Sénégal
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={12} className={cn(i < customer.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200")} />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                            <button className="w-10 h-10 bg-white border border-gray-100 shadow-sm rounded-xl flex items-center justify-center text-gray-400 hover:bg-black hover:text-white transition-all">
                                                <Eye size={16} />
                                            </button>
                                            <button className="w-10 h-10 bg-white border border-gray-100 shadow-sm rounded-xl flex items-center justify-center text-indigo-100 hover:bg-indigo-600 hover:text-white transition-all">
                                                <Mail size={16} />
                                            </button>
                                            <button className="w-10 h-10 bg-white border border-gray-100 shadow-sm rounded-xl flex items-center justify-center text-gray-300 hover:bg-black hover:text-white transition-all">
                                                <MoreHorizontal size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-10 border-t border-gray-50 flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Affichage de 1 à 10 sur 5,890 clients</p>
                    <div className="flex items-center gap-2">
                        <button className="px-6 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all active:scale-95 shadow-xl shadow-black/10">
                            Charger Plus de Clients
                        </button>
                    </div>
                </div>
            </div>

            {/* Loyalty Visualizer Card (Bottom) */}
            <div className="bg-black rounded-[4rem] p-12 md:p-16 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/20 to-transparent pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="max-w-xl">
                        <div className="inline-flex items-center gap-3 text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] mb-6">
                            <ShieldCheck size={18} fill="currentColor" /> Rétention Master
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 leading-none uppercase">
                            Vision <span className="text-indigo-400 italic">Analytique.</span>
                        </h2>
                        <p className="text-gray-400 font-medium text-lg leading-relaxed">
                            Découvrez quels segments de votre audience génèrent le plus de valeur et automatisez vos processus de fidélisation.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md text-center">
                            <TrendingUp className="text-green-400 mx-auto mb-4" size={32} />
                            <div className="text-3xl font-black mb-1">82%</div>
                            <div className="text-[9px] font-black uppercase tracking-widest text-gray-500">Taux de Rétention</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md text-center">
                            <ShoppingBag className="text-indigo-400 mx-auto mb-4" size={32} />
                            <div className="text-3xl font-black mb-1">2.4K F</div>
                            <div className="text-[9px] font-black uppercase tracking-widest text-gray-500">Panier Moyen</div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}
