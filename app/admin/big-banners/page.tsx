'use client'

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    MoreVertical,
    ChevronDown,
    Zap,
    ExternalLink,
    Image as ImageIcon,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    getBigBanners,
    upsertBigBanner,
    deleteBigBanner,
    initializeBigBanners
} from '@/lib/actions/admin-actions';
import { uploadToCloudinaryAction } from '@/lib/actions/media-actions';

export default function BigBannersPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    
    // Controlled inputs
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [description, setDescription] = useState('');
    const [badge, setBadge] = useState('');
    const [href, setHref] = useState('');
    const [buttonText, setButtonText] = useState('Commander');
    const [isActive, setIsActive] = useState(true);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        loadItems();
    }, []);

    async function loadItems() {
        setLoading(true);
        try {
            const data = await getBigBanners();
            setItems(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleUpsert(e: React.FormEvent) {
        e.preventDefault();
        setIsSaving(true);

        const data = {
            title,
            subtitle,
            description,
            badge,
            href,
            buttonText,
            isActive,
            image: previewImage
        };

        const res = await upsertBigBanner(data, editingItem?.id);

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
        setDescription('');
        setBadge('');
        setHref('');
        setButtonText('Commander');
        setIsActive(true);
    }

    async function handleDelete(id: string) {
        if (!confirm("Supprimer cette bannière ?")) return;
        const res = await deleteBigBanner(id);
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
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
                                <Maximize size={18} className="text-white" />
                            </div>
                            <h1 className="text-2xl font-black text-[#1B1F3B] tracking-tight uppercase">Grandes <span className="text-indigo-600 italic">Bannières</span></h1>
                        </div>
                        <p className="text-slate-400 text-sm font-medium">Gérez les bannières larges de la page d'accueil.</p>
                    </div>

                    <div className="flex gap-4">
                        {items.length === 0 && (
                            <button
                                onClick={async () => {
                                    if (confirm("Initialiser la bannière par défaut ?")) {
                                        setLoading(true);
                                        await initializeBigBanners();
                                        loadItems();
                                    }
                                }}
                                className="flex items-center gap-3 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-[13px] hover:bg-slate-200 transition-all"
                            >
                                <Zap size={16} />
                                Initialiser Sony
                            </button>
                        )}
                        <button
                            onClick={() => { resetForm(); setIsModalOpen(true); }}
                            className="flex items-center gap-3 px-6 py-3 bg-[#1B1F3B] text-white rounded-xl font-bold text-[13px] hover:bg-indigo-600 hover:shadow-xl transition-all shadow-lg"
                        >
                            <Plus size={20} />
                            Nouvelle Bannière
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 pt-10">
                {loading ? (
                    <div className="h-[400px] bg-white rounded-[32px] animate-pulse border border-slate-100" />
                ) : (
                    <div className="space-y-8">
                        {items.map((item) => (
                            <div 
                                key={item.id}
                                className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
                            >
                                <div className="flex flex-col lg:grid lg:grid-cols-2">
                                    <div className="p-8 lg:p-12 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center gap-3 mb-6">
                                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                    {item.badge}
                                                </span>
                                                {item.isActive ? (
                                                    <span className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-bold uppercase tracking-widest">
                                                        <CheckCircle size={12} /> Actif
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                                        <XCircle size={12} /> Inactif
                                                    </span>
                                                )}
                                            </div>
                                            <h2 className="text-4xl font-black text-[#1B1F3B] mb-4 uppercase leading-none">{item.title}</h2>
                                            <p className="text-indigo-600 font-bold mb-4">{item.subtitle}</p>
                                            <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-md">{item.description}</p>
                                        </div>

                                        <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                                            <div className="flex gap-4">
                                                <button 
                                                    onClick={() => {
                                                        setEditingItem(item);
                                                        setPreviewImage(item.image);
                                                        setTitle(item.title);
                                                        setSubtitle(item.subtitle || '');
                                                        setDescription(item.description || '');
                                                        setBadge(item.badge || '');
                                                        setHref(item.href);
                                                        setButtonText(item.buttonText);
                                                        setIsActive(item.isActive);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="px-6 py-3 bg-slate-50 text-[#1B1F3B] rounded-xl font-bold text-[12px] uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center gap-2"
                                                >
                                                    <Edit2 size={16} /> Modifier
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                            <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                                                {item.href}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative h-[300px] lg:h-auto bg-[#1B1F3B] flex items-center justify-center p-12 overflow-hidden">
                                        <div className="absolute top-0 right-0 w-full h-full bg-indigo-600/10 blur-[100px] rounded-full translate-x-1/2" />
                                        <img 
                                            src={item.image} 
                                            alt="" 
                                            className="relative z-10 max-h-full max-w-full object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-700" 
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {items.length === 0 && (
                            <div className="py-20 text-center bg-white rounded-[32px] border border-slate-100 border-dashed">
                                <ImageIcon size={48} className="mx-auto text-slate-200 mb-4" />
                                <h3 className="text-lg font-bold text-[#1B1F3B] mb-2">Aucune bannière configurée</h3>
                                <p className="text-slate-400 text-sm max-w-xs mx-auto mb-8">Commencez par ajouter une nouvelle bannière publicitaire pour votre page d'accueil.</p>
                                <button
                                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                                    className="px-8 py-4 bg-[#1B1F3B] text-white rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-600/10"
                                >
                                    Créer ma première bannière
                                </button>
                            </div>
                        )}
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
                            className="relative w-full max-w-3xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
                        >
                            <div className="bg-slate-50 px-10 py-8 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-[#1B1F3B] uppercase tracking-tight">
                                        {editingItem ? "Editer" : "Nouvelle"} <span className="text-indigo-600 italic">Bannière</span>
                                    </h2>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors shadow-sm border border-slate-100">
                                    <ChevronDown size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleUpsert} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Titre principal</label>
                                        <input
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 transition-all text-[15px] font-bold"
                                            placeholder="Ex: Le Son Absolu."
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Petit Titre / Gamme</label>
                                        <input
                                            value={subtitle}
                                            onChange={(e) => setSubtitle(e.target.value)}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 transition-all text-[15px] font-bold text-indigo-600"
                                            placeholder="Ex: Série Sony XM5"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 transition-all text-[14px] font-medium resize-none"
                                        placeholder="Décrivez l'offre en quelques lignes..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Badge</label>
                                        <input
                                            value={badge}
                                            onChange={(e) => setBadge(e.target.value)}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 transition-all text-[14px] font-bold"
                                            placeholder="Ex: Offre Spéciale"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Texte du bouton</label>
                                        <input
                                            value={buttonText}
                                            onChange={(e) => setButtonText(e.target.value)}
                                            onInput={(e: any) => setButtonText(e.target.value)}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 transition-all text-[14px] font-bold"
                                            placeholder="Ex: Commander"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lien (URL)</label>
                                        <input
                                            value={href}
                                            onChange={(e) => setHref(e.target.value)}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 transition-all text-[14px] font-medium"
                                            placeholder="Ex: /boutique"
                                        />
                                    </div>
                                    <div className="flex items-end pb-4">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div 
                                                onClick={() => setIsActive(!isActive)}
                                                className={cn(
                                                    "w-12 h-6 rounded-full transition-all relative",
                                                    isActive ? "bg-emerald-500 shadow-lg shadow-emerald-200" : "bg-slate-200"
                                                )}
                                            >
                                                <div className={cn(
                                                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                                    isActive ? "left-7" : "left-1"
                                                )} />
                                            </div>
                                            <span className="text-sm font-bold text-slate-600">Bannière active</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Image du produit (PNG conseillé)</label>
                                    <div className="flex gap-8 items-center p-6 bg-slate-50 rounded-[28px] border-2 border-dashed border-slate-200">
                                        <div className="w-40 h-40 bg-white rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100 shadow-inner group/img relative">
                                            {previewImage ? (
                                                <>
                                                    <img src={previewImage} className="w-full h-full object-contain p-2" />
                                                    <button 
                                                        type="button"
                                                        onClick={() => setPreviewImage(null)}
                                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white transition-opacity"
                                                    >
                                                        <Trash2 size={24} />
                                                    </button>
                                                </>
                                            ) : (
                                                <ImageIcon size={40} className="text-slate-200" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                id="banner-upload"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                            />
                                            <label
                                                htmlFor="banner-upload"
                                                className="inline-flex items-center gap-3 px-8 py-4 bg-[#1B1F3B] text-white rounded-[18px] text-[13px] font-black uppercase tracking-widest cursor-pointer hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-600/10 active:scale-95"
                                            >
                                                {isUploading ? "Envoi en cours..." : "Télécharger l'image"}
                                            </label>
                                            <p className="mt-4 text-[11px] text-slate-400 font-medium max-w-xs">Utilisez une image PNG sans fond pour un résultat premium comme le design actuel.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 flex gap-4 border-t border-slate-100 mt-10">
                                    <button
                                        type="submit"
                                        disabled={isSaving || isUploading}
                                        className="flex-1 py-5 bg-indigo-600 text-white rounded-[24px] font-black text-[15px] uppercase tracking-widest hover:bg-[#1B1F3B] disabled:opacity-50 transition-all shadow-2xl shadow-indigo-600/20 active:scale-95"
                                    >
                                        {isSaving ? "Sauvegarde..." : (editingItem ? "Enregistrer les modifications" : "Créer la bannière")}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-10 py-5 bg-slate-100 text-slate-600 rounded-[24px] font-black text-[15px] uppercase tracking-widest hover:bg-slate-200 transition-all"
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

import { Maximize } from 'lucide-react';
