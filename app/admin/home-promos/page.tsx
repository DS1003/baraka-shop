'use client'

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    MoreVertical,
    ChevronRight,
    Layout,
    Image as ImageIcon,
    Zap,
    ExternalLink,
    GripVertical,
    ChevronDown,
    Palette,
    Maximize
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    getHomePromos,
    upsertHomePromo,
    deleteHomePromo,
    initializeHomePromos
} from '@/lib/actions/admin-actions';
import { uploadToCloudinaryAction } from '@/lib/actions/media-actions';

export default function HomePromosPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    
    // Controlled inputs
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [badge, setBadge] = useState('');
    const [price, setPrice] = useState('');
    const [href, setHref] = useState('');
    const [bg, setBg] = useState('bg-slate-50');
    const [border, setBorder] = useState('border-slate-100');
    const [size, setSize] = useState('md:col-span-1');
    const [order, setOrder] = useState(0);

    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    useEffect(() => {
        loadItems();
    }, []);

    async function loadItems() {
        setLoading(true);
        try {
            const data = await getHomePromos();
            setItems(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const filteredItems = items.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    async function handleUpsert(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSaving(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            title: title,
            subtitle: subtitle,
            badge: badge,
            price: price,
            href: href,
            bg: bg,
            border: border,
            size: size,
            order: parseInt(formData.get('order') as string) || 0,
            image: previewImage
        };

        const res = await upsertHomePromo(data, editingItem?.id);

        if (res.success) {
            setIsModalOpen(false);
            resetForm();
            loadItems();
        } else {
            alert(res.message || "Erreur lors de la sauvegarde.");
        }
        setIsSaving(false);
    }

    function resetForm() {
        setEditingItem(null);
        setPreviewImage(null);
        setTitle('');
        setSubtitle('');
        setBadge('');
        setPrice('');
        setHref('');
        setBg('bg-slate-50');
        setBorder('border-slate-100');
        setSize('md:col-span-1');
        setOrder(0);
    }

    async function handleDelete(id: string) {
        if (!confirm("Supprimer cette promotion ?")) return;
        const res = await deleteHomePromo(id);
        if (res.success) loadItems();
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        const res = await uploadToCloudinaryAction(formData);
        if (res.success && res.media?.url) {
            setPreviewImage(res.media.url);
        }
        setIsUploading(false);
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-8 py-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-600/20">
                                <Zap size={18} className="text-white fill-current" />
                            </div>
                            <h1 className="text-2xl font-black text-[#1B1F3B] tracking-tight uppercase">Promotions <span className="text-orange-600 italic">Accueil</span></h1>
                        </div>
                        <p className="text-slate-400 text-sm font-medium">Gérez la grille des promotions incontournables.</p>
                    </div>

                    <div className="flex gap-4">
                        {items.length === 0 && (
                            <button
                                onClick={async () => {
                                    if (confirm("Initialiser les promotions par défaut ?")) {
                                        setLoading(true);
                                        await initializeHomePromos();
                                        loadItems();
                                    }
                                }}
                                className="flex items-center gap-3 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-[13px] hover:bg-slate-200 transition-all"
                            >
                                <Zap size={16} />
                                Initialiser les défauts
                            </button>
                        )}
                        <button
                            onClick={() => { resetForm(); setIsModalOpen(true); }}
                            className="flex items-center gap-3 px-6 py-3 bg-[#1B1F3B] text-white rounded-xl font-bold text-[13px] hover:bg-orange-600 hover:shadow-xl transition-all shadow-lg group"
                        >
                            <Plus size={20} />
                            Nouvelle Promo
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 pt-10">
                {/* Search */}
                <div className="relative mb-10 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher une promotion..."
                        className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all text-sm font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-[200px] bg-white rounded-[28px] animate-pulse border border-slate-100" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence>
                            {filteredItems.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="group bg-white rounded-[28px] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all relative overflow-hidden"
                                >
                                    <div className="flex gap-6 items-start">
                                        <div className="relative w-24 h-24 rounded-2xl bg-slate-50 flex-shrink-0 overflow-hidden border border-slate-100">
                                            {item.image ? (
                                                <img src={item.image} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <ImageIcon size={32} />
                                                </div>
                                            )}
                                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur rounded text-[8px] font-black uppercase text-[#1B1F3B]">
                                                #{item.order}
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <span className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded text-[9px] font-black uppercase tracking-wider">
                                                    {item.badge || 'PROMO'}
                                                </span>
                                                <div className="relative">
                                                    <button 
                                                        onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                                                        className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-400"
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>
                                                    
                                                    {activeMenuId === item.id && (
                                                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 z-20 p-1.5 overflow-hidden">
                                                            <button
                                                                onClick={(e) => { 
                                                                    e.stopPropagation();
                                                                    setEditingItem(item); 
                                                                    setPreviewImage(item.image);
                                                                    setTitle(item.title);
                                                                    setSubtitle(item.subtitle || '');
                                                                    setBadge(item.badge || '');
                                                                    setPrice(item.price || '');
                                                                    setHref(item.href);
                                                                    setBg(item.bg);
                                                                    setBorder(item.border);
                                                                    setSize(item.size);
                                                                    setOrder(item.order);
                                                                    setIsModalOpen(true); 
                                                                    setActiveMenuId(null);
                                                                }}
                                                                className="w-full text-left p-2.5 rounded-lg text-[12px] font-bold text-slate-600 hover:bg-slate-50 hover:text-orange-600 transition-colors flex items-center gap-2"
                                                            >
                                                                <Edit2 size={14} /> Modifier
                                                            </button>
                                                            <button
                                                                onClick={() => { handleDelete(item.id); setActiveMenuId(null); }}
                                                                className="w-full text-left p-2.5 rounded-lg text-[12px] font-bold text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
                                                            >
                                                                <Trash2 size={14} /> Supprimer
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <h3 className="text-[15px] font-black text-[#1B1F3B] truncate mb-1">{item.title}</h3>
                                            <p className="text-slate-400 text-[12px] font-medium line-clamp-1 mb-2">{item.subtitle}</p>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                                <ExternalLink size={12} />
                                                <span className="truncate">{item.href}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-[11px] font-black uppercase tracking-wider">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <div className={cn("w-3 h-3 rounded-full border", item.bg, item.border)} />
                                            <span>Style: {item.size}</span>
                                        </div>
                                        <div className="text-orange-600">
                                            {item.price}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        <button
                            onClick={() => { resetForm(); setIsModalOpen(true); }}
                            className="border-2 border-dashed border-slate-200/60 rounded-[28px] p-8 flex flex-col items-center justify-center gap-4 group hover:border-orange-600/20 hover:bg-orange-600/5 transition-all text-slate-400 hover:text-orange-600"
                        >
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-slate-100 group-hover:scale-110 group-hover:rotate-12 transition-transform">
                                <Plus size={32} />
                            </div>
                            <span className="text-sm font-black uppercase tracking-widest">Nouvelle Promotion</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-[#1B1F3B]/40 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden"
                        >
                            <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-black text-[#1B1F3B] uppercase tracking-tight">
                                        {editingItem ? "Modifier" : "Nouvelle"} <span className="text-orange-600 italic">Promotion</span>
                                    </h2>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors shadow-sm border border-slate-100">
                                    <ChevronDown size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleUpsert} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Titre de la promo</label>
                                        <input
                                            name="title"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-[16px] focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all text-[14px] font-bold"
                                            placeholder="Ex: Pack Gaming Ultimate"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Badge</label>
                                        <input
                                            name="badge"
                                            value={badge}
                                            onChange={(e) => setBadge(e.target.value)}
                                            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-[16px] focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all text-[14px] font-bold"
                                            placeholder="Ex: Exclusivité"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sous-titre / Description</label>
                                    <input
                                        name="subtitle"
                                        value={subtitle}
                                        onChange={(e) => setSubtitle(e.target.value)}
                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-[16px] focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all text-[14px] font-medium"
                                        placeholder="Ex: PS5 + 2 Jeux + Manette"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prix (Texte libre)</label>
                                        <input
                                            name="price"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-[16px] focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all text-[14px] font-medium"
                                            placeholder="Ex: 499.000FCFA"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lien (URL)</label>
                                        <input
                                            name="href"
                                            value={href}
                                            onChange={(e) => setHref(e.target.value)}
                                            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-[16px] focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all text-[14px] font-medium"
                                            placeholder="Ex: /boutique?category=jeux"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Background (Tailwind)</label>
                                        <input
                                            name="bg"
                                            value={bg}
                                            onChange={(e) => setBg(e.target.value)}
                                            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-[16px] focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all text-[14px] font-medium"
                                            placeholder="Ex: bg-[#F8FAFC]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Taille (Colspan)</label>
                                        <select
                                            name="size"
                                            value={size}
                                            onChange={(e) => setSize(e.target.value)}
                                            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-[16px] focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all text-[14px] font-medium"
                                        >
                                            <option value="md:col-span-1">Simple (1 col)</option>
                                            <option value="md:col-span-2">Large (2 cols)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ordre</label>
                                        <input
                                            name="order"
                                            type="number"
                                            value={order}
                                            onChange={(e) => setOrder(parseInt(e.target.value || '0'))}
                                            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-[16px] focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all text-[14px] font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Image de la promotion</label>
                                    <div className="flex gap-4 items-center">
                                        <div className="w-24 h-24 bg-slate-50 rounded-[20px] border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group/img relative">
                                            {previewImage ? (
                                                <>
                                                    <img src={previewImage} className="w-full h-full object-cover" />
                                                    <button 
                                                        type="button"
                                                        onClick={() => setPreviewImage(null)}
                                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white transition-opacity"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </>
                                            ) : (
                                                <ImageIcon size={24} className="text-slate-300" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                id="img-upload"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                            />
                                            <label
                                                htmlFor="img-upload"
                                                className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-[12px] font-bold text-slate-600 cursor-pointer hover:bg-slate-50 transition-all shadow-sm"
                                            >
                                                {isUploading ? "Téléchargement..." : "Choisir une image"}
                                            </label>
                                            <p className="mt-2 text-[10px] text-slate-400 font-medium">PNG, JPG jusqu'à 5Mo. PNG transparent recommandé.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={isSaving || isUploading}
                                        className="flex-1 py-4 bg-[#1B1F3B] text-white rounded-[18px] font-black text-[13px] uppercase tracking-[0.1em] hover:bg-orange-600 disabled:opacity-50 transition-all shadow-xl shadow-orange-600/10 active:scale-95"
                                    >
                                        {isSaving ? "Sauvegarde..." : (editingItem ? "Modifier la promo" : "Créer la promotion")}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-8 py-4 bg-slate-100 text-slate-600 rounded-[18px] font-black text-[13px] uppercase tracking-[0.1em] hover:bg-slate-200 transition-all"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
