'use client'

import React, { useState } from 'react'
import {
    Upload,
    X,
    Package,
    ArrowLeft,
    Plus,
    Image as ImageIcon,
    Trash2,
    ChevronRight,
    Save,
    Eye,
    Zap,
    Sparkles,
    Smartphone,
    Monitor,
    Watch,
    Headphones
} from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function NewProductPage() {
    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-24">

            {/* Header / Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <Link href="/admin/products" className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-black hover:text-white transition-all shadow-sm">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-1">
                            Catalogue Dynamique
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">Ajouter un <span className="text-primary italic">Produit.</span></h1>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-3 bg-gray-50 text-gray-400 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-black transition-colors">
                        Conserver Brouillon
                    </button>
                    <button className="flex items-center gap-4 bg-black text-white px-8 py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-black/20 hover:bg-primary transition-all active:scale-95">
                        <Save size={18} /> Publier le Produit
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Left Column: Core Data */}
                <div className="lg:col-span-8 space-y-10">

                    {/* Basic Info */}
                    <div className="bg-white border border-gray-100 rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-gray-200/40 space-y-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                <Package size={20} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">Informations de Base</h3>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 italic">Titre du Produit <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    placeholder="Ex: iPhone 16 Pro Max 1TB - Desert Titanium"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-6 text-lg font-black text-gray-900 focus:bg-white focus:ring-8 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none placeholder:text-gray-200 placeholder:italic placeholder:font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 italic">Prix de Vente (FCFA)</label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            placeholder="0"
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-8 py-5 text-xl font-black text-primary focus:bg-white transition-all outline-none"
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-gray-300 group-focus-within:text-primary">F</div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 italic">Prix Barré (Optionnel)</label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            placeholder="0"
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-8 py-5 text-xl font-black text-gray-300 line-through focus:bg-white focus:text-gray-400 transition-all outline-none"
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-gray-200">F</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 italic">Description Marketing</label>
                                <textarea
                                    placeholder="Décrivez les atouts majeurs de ce produit..."
                                    className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] px-8 py-6 text-sm font-medium text-gray-900 focus:bg-white transition-all outline-none min-h-[200px] resize-none leading-relaxed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Media Management */}
                    <div className="bg-white border border-gray-100 rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-gray-200/40">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                                    <ImageIcon size={20} />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">Média & Rendu</h3>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-300">Format Recommandé: 1000px x 1000px</span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {/* Upload Trigger */}
                            <label className="aspect-square bg-gray-50 border-2 border-dashed border-gray-100 rounded-[2rem] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all group">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                                    <Plus size={20} />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:text-primary transition-colors">Ajouter Image</span>
                                <input type="file" className="hidden" />
                            </label>

                            {/* Previews (Mock) */}
                            {[1, 2].map((i) => (
                                <div key={i} className="aspect-square bg-gray-100 rounded-[2rem] relative overflow-hidden group">
                                    <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 text-white">
                                        <button className="w-8 h-8 bg-red-500 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-[8px] font-black uppercase text-white tracking-widest">Aperçu {i}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Config & Inventory */}
                <div className="lg:col-span-4 space-y-10">

                    {/* Inventory Control */}
                    <div className="bg-black rounded-[3rem] p-10 text-white shadow-2xl shadow-black/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                    <Zap size={20} className="text-primary" />
                                </div>
                                <h3 className="text-lg font-black tracking-tight uppercase">Logistique</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Stock Initial Disponible</label>
                                    <input
                                        type="number"
                                        defaultValue="0"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xl font-black text-white focus:bg-white/10 focus:border-primary/50 transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Limite Alerte Bas Stock</label>
                                    <input
                                        type="number"
                                        defaultValue="5"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xl font-black text-white focus:bg-white/10 focus:border-primary/50 transition-all outline-none"
                                    />
                                </div>
                                <div className="flex items-center justify-between pt-4">
                                    <span className="text-[10px] font-black uppercase text-gray-400">Suivre le Stock</span>
                                    <div className="w-12 h-6 bg-primary rounded-full relative p-1 cursor-pointer">
                                        <div className="w-4 h-4 bg-white rounded-full translate-x-6" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Categorization */}
                    <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-2xl shadow-gray-200/40">
                        <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase mb-8">Classification</h3>
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Appartenance Univers</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { id: 'mobile', icon: Smartphone, label: 'Mobile' },
                                        { id: 'computing', icon: Monitor, label: 'Laptops' },
                                        { id: 'audio', icon: Headphones, label: 'Audio' },
                                        { id: 'wear', icon: Watch, label: 'Wearable' },
                                    ].map((cat) => (
                                        <button key={cat.id} className="flex flex-col items-center gap-3 p-4 bg-gray-50 border border-transparent rounded-2xl hover:border-black transition-all group">
                                            <cat.icon size={20} className="text-gray-300 group-hover:text-black transition-colors" />
                                            <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 group-hover:text-black">{cat.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3 pt-6 border-t border-gray-50">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Tags de Visibilité</label>
                                <div className="flex flex-wrap gap-2 text-primary">
                                    <span className="px-3 py-1 bg-primary/10 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2">Flash Deals <X size={10} /></span>
                                    <span className="px-3 py-1 bg-primary/10 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2">Exclusif <X size={10} /></span>
                                    <button className="px-3 py-1 bg-gray-50 text-gray-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-dashed border-gray-200 hover:border-black hover:text-black transition-all flex items-center gap-2">
                                        <Plus size={10} /> Add Tag
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Preview Card */}
                    <div className="bg-indigo-600 rounded-[3rem] p-10 text-white relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <div className="relative z-10">
                            <Sparkles className="text-white/50 mb-6" size={32} />
                            <h4 className="text-xl font-black mb-2 uppercase italic leading-tight tracking-tighter">Vérification <br /> Esthétique</h4>
                            <p className="text-xs text-indigo-100 font-medium mb-8 leading-relaxed opacity-80 italic">Visualisez le rendu final côté client avant la mise en ligne.</p>
                            <button className="w-full bg-white text-indigo-600 py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest shadow-2xl hover:bg-black hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3">
                                <Eye size={18} /> Aperçu Live
                            </button>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    )
}
