'use client'

import React, { useState } from 'react'
import {
    Plus,
    Search,
    Edit,
    Trash2,
    MoreHorizontal,
    Filter,
    Package,
    ChevronRight,
    Layers,
    Eye,
    TrendingUp,
    Zap,
    Download,
    ArrowUpDown,
    CheckCircle2,
    AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { MOCK_PRODUCTS } from '@/lib/data'

export default function AdminProductsPage() {
    const [searchTerm, setSearchTerm] = useState('')

    return (
        <div className="space-y-12">

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-2">
                        Inventaire Physique
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter leading-none uppercase">
                        Gestion <span className="text-primary italic">Catalogue.</span>
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-3 bg-gray-50 text-gray-400 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                        <Download size={14} /> Rapport Stock
                    </button>
                    <Link href="/admin/products/new" className="flex items-center gap-4 bg-black text-white px-8 py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-black/20 hover:bg-primary transition-all active:scale-95">
                        <Plus size={18} /> Nouveau Produit
                    </Link>
                </div>
            </div>

            {/* Micro Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Références', value: '2,450', icon: Layers, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Low Stock Items', value: '14', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
                    { label: 'Nouvelles Sorties', value: '32', icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50' },
                    { label: 'Activement en Ligne', value: '2,310', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 flex items-center gap-5">
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", stat.bg, stat.color)}>
                            <stat.icon size={20} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">{stat.label}</p>
                            <h4 className="text-xl font-black text-gray-900 leading-none">{stat.value}</h4>
                        </div>
                    </div>
                ))}
            </div>

            {/* Products Table Hub */}
            <div className="bg-white border border-gray-100 rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden">

                {/* Filtration Bar */}
                <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100 flex-1 max-w-xl group focus-within:bg-white focus-within:border-primary/20 transition-all">
                        <Search size={18} className="text-gray-300 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="RECHERCHER DANS LE CATALOGUE BARAKA..."
                            className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-[0.2em] w-full placeholder:text-gray-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-3 bg-gray-50 text-gray-400 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:text-black transition-colors">
                            <Filter size={14} /> Filtres
                        </button>
                        <button className="flex items-center gap-3 bg-gray-100 text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                            <ArrowUpDown size={14} /> Trier Par
                        </button>
                    </div>
                </div>

                {/* Table Context */}
                <div className="overflow-x-auto overflow-y-hidden">
                    <table className="w-full text-left table-fixed">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="w-[45%] px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Désignation Produit</th>
                                <th className="w-[15%] px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Stock Status</th>
                                <th className="w-[15%] px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Prix Vente</th>
                                <th className="w-[15%] px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Analytics</th>
                                <th className="w-[10%] px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {MOCK_PRODUCTS.slice(0, 10).map((product, idx) => (
                                <tr key={product.id} className="hover:bg-gray-50/80 transition-all group">
                                    <td className="px-10 py-10">
                                        <div className="flex items-center gap-6">
                                            <div className="w-20 h-20 bg-gray-100 rounded-[1.5rem] overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-500 relative border border-gray-100 p-2">
                                                <Image src={product.image} fill className="object-contain mix-blend-multiply" alt={product.name} />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <h3 className="text-sm font-black text-gray-900 group-hover:text-primary transition-colors truncate leading-tight uppercase tracking-tight">{product.name}</h3>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-md">{product.category}</span>
                                                    <span className="w-1 h-1 bg-gray-200 rounded-full" />
                                                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">SKU: BRK-{product.id}0{idx}0X</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-10">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[10px] font-black text-gray-900 uppercase">12 Items</span>
                                                <span className="text-[10px] font-black text-green-600 uppercase">En Ligne</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-gray-100 rounded-full relative overflow-hidden">
                                                <div className="absolute inset-y-0 left-0 bg-green-500 w-[70%] rounded-full" />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-10">
                                        <div className="text-lg font-black italic text-gray-900 leading-none mb-1">{product.price.toLocaleString()} F</div>
                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">TVA Incluse (18%)</div>
                                    </td>
                                    <td className="px-10 py-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                                                <TrendingUp size={16} />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black uppercase text-gray-900">High Demand</div>
                                                <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">+14% ce mois</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-10 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                            <button className="w-10 h-10 bg-white border border-gray-100 shadow-sm rounded-xl flex items-center justify-center text-gray-400 hover:bg-black hover:text-white transition-all">
                                                <Eye size={16} />
                                            </button>
                                            <button className="w-10 h-10 bg-white border border-gray-100 shadow-sm rounded-xl flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all">
                                                <Edit size={16} />
                                            </button>
                                            <button className="w-10 h-10 bg-white border border-gray-100 shadow-sm rounded-xl flex items-center justify-center text-gray-400 hover:bg-red-500 hover:text-white transition-all">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Pagination */}
                <div className="p-10 border-t border-gray-50 flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Affichage de 1 à 10 sur {MOCK_PRODUCTS.length} produits</p>
                    <div className="flex items-center gap-2">
                        <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-50 text-gray-300 pointer-events-none">
                            <ChevronRight size={20} className="rotate-180" />
                        </button>
                        {[1, 2, 3].map(p => (
                            <button key={p} className={cn(
                                "w-12 h-12 flex items-center justify-center rounded-2xl font-black text-xs transition-all",
                                p === 1 ? "bg-black text-white shadow-xl" : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                            )}>
                                {p}
                            </button>
                        ))}
                        <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-50 text-gray-400 hover:bg-black hover:text-white transition-all">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

            </div>

        </div>
    )
}
