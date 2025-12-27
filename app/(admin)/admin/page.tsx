'use client'

import React from 'react'
import {
    DollarSign,
    Package,
    ShoppingCart,
    Users,
    TrendingUp,
    TrendingDown,
    ArrowRight,
    Calendar,
    ChevronRight,
    Zap,
    Clock,
    Search,
    Filter,
    Download,
    Eye,
    HelpCircle
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function AdminDashboardPage() {
    return (
        <div className="space-y-12">

            {/* Header Welcome Card */}
            <div className="bg-black rounded-[3rem] p-10 md:p-14 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/30 to-transparent pointer-events-none" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-6">
                        <Zap size={14} fill="currentColor" /> Live Insights
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-4 leading-none uppercase">
                        Bonjour, <span className="text-primary italic">Commandant.</span>
                    </h1>
                    <p className="text-gray-400 font-medium max-w-xl text-lg mb-10 leading-relaxed">
                        Votre écosystème Baraka se porte à merveille aujourd'hui. Les ventes sont en hausse de <span className="text-green-400 font-black">+24%</span> par rapport à hier.
                    </p>

                    <div className="flex flex-wrap gap-6">
                        <Link href="/admin/products/new" className="bg-white text-black px-10 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-black/20 hover:bg-primary hover:text-white transition-all active:scale-95">
                            Ajouter un Produit
                        </Link>
                        <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-white/20 transition-all">
                            Voir les Rapports
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: 'Chiffre d\'Affaires', value: '14.2M F', icon: DollarSign, trend: '+12.5%', color: 'text-indigo-600', bg: 'bg-indigo-50', up: true },
                    { label: 'Commandes Total', value: '1,840', icon: ShoppingCart, trend: '+8.2%', color: 'text-orange-600', bg: 'bg-orange-50', up: true },
                    { label: 'Catalogue Items', value: '2,450', icon: Package, trend: '-2.1%', color: 'text-green-600', bg: 'bg-green-50', up: false },
                    { label: 'Clients Uniques', value: '5,890', icon: Users, trend: '+18.4%', color: 'text-blue-600', bg: 'bg-blue-50', up: true },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 hover:-translate-y-2 transition-all group"
                    >
                        <div className="flex justify-between items-start mb-10">
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110", stat.bg, stat.color)}>
                                <stat.icon size={24} />
                            </div>
                            <div className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                                stat.up ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"
                            )}>
                                {stat.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                {stat.trend}
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">{stat.label}</p>
                            <h3 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Area: Charts & Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Visual Analytics Chart View (Placeholder Visualization) */}
                <div className="lg:col-span-8 space-y-10">
                    <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-2xl shadow-gray-200/40">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-1">Performance Commerciale</h3>
                                <p className="text-gray-400 font-medium text-xs">Evolution des ventes sur les 30 derniers jours</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-black transition-colors"><Calendar size={18} /></button>
                                <button className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-black transition-colors"><Download size={18} /></button>
                            </div>
                        </div>

                        {/* Mock Chart - Sophisticated Design */}
                        <div className="h-80 flex items-end justify-between gap-4 px-4 border-b border-gray-50 pb-8">
                            {[40, 70, 45, 90, 65, 80, 55, 100, 75, 40, 85, 95].map((val, idx) => (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-4 group">
                                    <div className="relative w-full">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${val}%` }}
                                            transition={{ duration: 1, delay: idx * 0.05 }}
                                            className={cn(
                                                "w-full rounded-t-2xl transition-all group-hover:bg-primary group-hover:scale-x-110",
                                                idx % 3 === 0 ? "bg-black" : "bg-gray-100"
                                            )}
                                        />
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-black text-white px-2 py-1 rounded text-[8px] font-black opacity-0 group-hover:opacity-100 transition-opacity">
                                            {val}M F
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{idx + 13} Dec</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex gap-8">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-black rounded-full" />
                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none">Ventes Baraka Pay</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-gray-100 rounded-full" />
                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none">Ventes Tierces</span>
                            </div>
                        </div>
                    </div>

                    {/* Table: Commandes Récentes - Premium Style */}
                    <div className="bg-white border border-gray-100 rounded-[3rem] overflow-hidden shadow-2xl shadow-gray-200/40">
                        <div className="p-10 flex items-center justify-between border-b border-gray-50">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Ventes en Temps Réel</h3>
                                <p className="text-gray-400 font-medium text-xs">Les 10 dernières transactions validées</p>
                            </div>
                            <Link href="/admin/orders" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:tracking-[0.3shared.em] transition-all">
                                Voir Tout →
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">ID / Commandes</th>
                                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Client</th>
                                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Montant</th>
                                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Statut</th>
                                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {[1, 2, 3, 4, 5].map((id) => (
                                        <tr key={id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xs">
                                                        BK
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black text-gray-900 group-hover:text-primary transition-colors cursor-pointer">#BRK-09{id}25</div>
                                                        <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">Il y a 12 min.</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="text-sm font-black text-gray-900">Mouhamed Diop</div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">Dakar Plateau, SN</div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="text-base font-black italic">1.250.000 F</div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <span className="px-3 py-1 bg-green-50 text-green-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-green-100">
                                                    Livré
                                                </span>
                                            </td>
                                            <td className="px-10 py-6">
                                                <button className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 hover:bg-black hover:text-white transition-all group-hover:bg-primary group-hover:text-white">
                                                    <ChevronRight size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column: Stock & Activities */}
                <div className="lg:col-span-4 space-y-10">

                    {/* Alerte Stock */}
                    <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-2xl shadow-gray-200/40">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight">Alertes Stock</h3>
                            <button className="text-[10px] font-black uppercase text-gray-400 hover:text-primary transition-colors">Réappro</button>
                        </div>
                        <div className="space-y-6">
                            {[
                                { name: 'MacBook Pro M3 Max', stock: 2, color: 'text-red-500', bg: 'bg-red-50' },
                                { name: 'Sony WH-1000XM5', stock: 5, color: 'text-orange-500', bg: 'bg-orange-50' },
                                { name: 'iPhone 16 Pro Desert', stock: 1, color: 'text-red-500', bg: 'bg-red-50' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 group cursor-pointer hover:bg-gray-50 p-2 rounded-2xl transition-all">
                                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", item.bg, item.color)}>
                                        <Package size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-xs font-black text-gray-900 mb-1 group-hover:text-primary transition-colors">{item.name}</h4>
                                        <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 relative overflow-hidden">
                                            <div className={cn("absolute inset-y-0 left-0 rounded-full", item.color === 'text-red-500' ? "bg-red-500 w-[10%]" : "bg-orange-500 w-[30%]")} />
                                        </div>
                                    </div>
                                    <div className={cn("text-xs font-black", item.color)}>
                                        {item.stock} Restants
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Timeline Activity */}
                    <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-2xl shadow-gray-200/40">
                        <h3 className="text-xl font-black text-gray-900 tracking-tight mb-10">Journal Activité</h3>
                        <div className="space-y-10 px-2">
                            {[
                                { user: 'Admin Sarah', action: 'Produit modifié', time: 'Il y a 2 min', color: 'bg-primary' },
                                { user: 'Système', action: 'Vente validée (#BK902)', time: 'Il y a 5 min', color: 'bg-green-500' },
                                { user: 'Admin Jean', action: 'Profil maj', time: 'Il y a 10 min', color: 'bg-blue-500' },
                                { user: 'Système', action: 'Alerte Stock iPhone', time: 'Il y a 15 min', color: 'bg-red-500' },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-6 relative group">
                                    {i !== 3 && <div className="absolute left-1.5 top-8 w-px h-10 bg-gray-100" />}
                                    <div className={cn("w-3 h-3 rounded-full mt-1 shrink-0 relative z-10", item.color)} />
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-xs font-black text-gray-900">{item.user}</span>
                                            <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">{item.time}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">{item.action}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Support / Contact Admin */}
                    <div className="bg-indigo-600 rounded-[3rem] p-10 text-white text-center relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <HelpCircle size={40} className="mx-auto mb-6 text-white/50" />
                        <h4 className="text-xl font-black mb-2 leading-tight uppercase">Support <br /> Prioritaire Admin</h4>
                        <p className="text-xs text-indigo-100 font-medium mb-8 leading-relaxed opacity-80">En cas d'incident technique sur la plateforme CORE.</p>
                        <button className="w-full bg-white text-indigo-600 py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest shadow-2xl hover:bg-black hover:text-white transition-all active:scale-95">
                            Ouvrir un Ticket
                        </button>
                    </div>

                </div>

            </div>

        </div>
    )
}
