'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Loader2,
    Save,
    ImageIcon,
    Store,
    CloudUpload,
    MoreVertical,
    X,
    Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, slugify } from '@/lib/utils';
import { uploadToCloudinaryAction } from '@/lib/actions/media-actions';

export default function StoresPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setMounted(true);
        const handleClickOutside = () => setActiveMenuId(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        loadItems();
    }, []);

    async function loadItems() {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/stores');
            const data = await res.json();
            setItems(data.stores || []);
            setStats(data.stats || { stores: 0, productWithStore: 0 });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm("Supprimer cette boutique ?")) {
            const res = await fetch('/api/admin/stores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', id })
            });
            const data = await res.json();
            if (data.success) {
                setItems(prev => prev.filter(c => c.id !== id));
            } else {
                alert(data.message);
            }
        }
    };

    const handleUpsert = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.currentTarget);
        
        let logoUrl = editingItem?.logo || '';
        
        const imageFile = formData.get('imageFile') as File;
        if (imageFile && imageFile.size > 0) {
            setIsUploading(true);
            const uploadFormData = new FormData();
            uploadFormData.append('file', imageFile);
            const uploadRes = await uploadToCloudinaryAction(uploadFormData);
            if (uploadRes.success && uploadRes.media?.url) {
                logoUrl = uploadRes.media.url;
            } else {
                alert("Échec de l'upload du logo");
                setIsUploading(false);
                setIsSaving(false);
                return;
            }
            setIsUploading(false);
        }

        const name = formData.get('name') as string;
        const storeData = {
            name,
            logo: logoUrl,
            slug: slugify(name),
            description: formData.get('description') as string,
        };
        
        const res = await fetch('/api/admin/stores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'upsert', data: storeData, id: editingItem?.id })
        });
        const result = await res.json();

        if (result.success) {
            setIsModalOpen(false);
            setEditingItem(null);
            setPreviewImage(null);
            loadItems();
        } else {
            alert(result.message || "Erreur lors de la sauvegarde.");
        }
        setIsSaving(false);
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-12 pb-20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-2 border-b border-slate-200/40">
                <div className="space-y-1.5">
                    <h1 className="text-[36px] font-bold text-slate-900 leading-tight">
                        Gestion des <span className="text-orange-600 italic font-serif">Boutiques.</span>
                    </h1>
                    <p className="text-[15px] text-slate-500 font-medium">
                        Gérez vos boutiques indépendantes (Airflux, RS Car, Baraka Beauty World, etc.).
                    </p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => { setEditingItem(null); setPreviewImage(null); setIsModalOpen(true); }}
                        className="flex items-center gap-3 px-6 py-3 bg-[#1B1F3B] text-white rounded-xl font-bold text-[13px] hover:bg-orange-600 hover:shadow-xl transition-all shadow-lg group"
                    >
                        <Plus size={20} />
                        <span>Nouvelle Boutique</span>
                    </button>
                </div>
            </div>

            {/* Stat Cards Section */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                            <Store size={22} />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Boutiques Actives</p>
                            <h4 className="text-2xl font-black text-slate-900 leading-none">{stats.stores}</h4>
                        </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Package size={22} />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Produits en Boutique</p>
                            <h4 className="text-2xl font-black text-slate-900 leading-none">{stats.productWithStore}</h4>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Search Bar */}
            <div className="relative max-w-xl group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-orange-500 transition-colors" size={18} />
                <input
                    type="text"
                    placeholder="Chercher une boutique..."
                    className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Grid Layout */}
            {loading ? (
                <div className="h-[400px] flex flex-col items-center justify-center text-slate-400 gap-4">
                    <Loader2 className="animate-spin text-orange-600" size={32} />
                    <p className="font-bold uppercase tracking-widest text-[10px]">Chargement des boutiques...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredItems.map((item, i) => (
                        <motion.div
                            key={item.id}
                            whileHover={{ y: -6, boxShadow: "0 25px 40px -20px rgba(0,0,0,0.08)" }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white rounded-[32px] border border-slate-200/50 shadow-sm transition-all group relative flex flex-col overflow-hidden min-h-[300px]"
                        >
                            <div className="p-8 flex flex-col flex-1">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center border bg-slate-50 overflow-hidden shadow-inner group-hover:scale-110 transition-transform">
                                        {item.logo ? (
                                            <img src={item.logo} alt={item.name} className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <Store size={28} className="text-slate-200" />
                                        )}
                                    </div>
                                    
                                    <div className="relative">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenuId(activeMenuId === item.id ? null : item.id);
                                            }}
                                            className={cn(
                                                "w-10 h-10 flex items-center justify-center rounded-xl transition-all border",
                                                activeMenuId === item.id 
                                                    ? "bg-white text-orange-600 border-orange-200 shadow-md" 
                                                    : "bg-slate-50 text-slate-400 hover:bg-white hover:text-slate-900 border-transparent hover:border-slate-200"
                                            )}
                                        >
                                            <MoreVertical size={18} />
                                        </button>
                                        
                                        <AnimatePresence>
                                            {activeMenuId === item.id && (
                                                <motion.div 
                                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="absolute right-0 top-full mt-2 w-36 bg-white rounded-xl shadow-2xl border border-slate-100 p-1 z-20"
                                                >
                                                    <button
                                                        onClick={(e) => { 
                                                            e.stopPropagation();
                                                            setEditingItem(item); 
                                                            setPreviewImage(item.logo);
                                                            setIsModalOpen(true); 
                                                            setActiveMenuId(null);
                                                        }}
                                                        className="w-full text-left p-2.5 rounded-lg text-[12px] font-bold text-slate-600 hover:bg-slate-50 hover:text-orange-600 transition-colors flex items-center gap-2"
                                                    >
                                                        <Edit size={14} /> Modifier
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(item.id);
                                                            setActiveMenuId(null);
                                                        }}
                                                        className="w-full text-left p-2.5 rounded-lg text-[12px] font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2"
                                                    >
                                                        <Trash2 size={14} /> Supprimer
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="space-y-4 flex-1">
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-[20px] group-hover:text-orange-600 transition-colors">{item.name}</h3>
                                        <p className="text-[12px] text-slate-400 font-medium truncate">/{item.slug}</p>
                                    </div>
                                    
                                    <p className="text-[13px] text-slate-500 line-clamp-2 leading-relaxed">
                                        {item.description || "Aucune description fournie pour cette boutique."}
                                    </p>

                                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Package size={14} className="text-orange-600" />
                                            {item._count?.products || 0} Produits
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    <button
                        onClick={() => { setEditingItem(null); setPreviewImage(null); setIsModalOpen(true); }}
                        className="border-2 border-dashed border-slate-200/60 rounded-[32px] p-8 flex flex-col items-center justify-center gap-4 group hover:border-orange-600/20 hover:bg-orange-600/5 transition-all text-slate-400 hover:text-orange-600 min-h-[300px]"
                    >
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-slate-100 group-hover:scale-110 group-hover:rotate-12 transition-transform">
                            <Plus size={32} strokeWidth={2.5} />
                        </div>
                        <div className="text-center">
                            <span className="block text-[13px] font-bold uppercase tracking-widest">Nouvelle</span>
                            <span className="text-[11px] font-medium text-slate-400 mt-1">Boutique Indépendante</span>
                        </div>
                    </button>
                </div>
            )}

            {/* Modal */}
            {mounted && createPortal(
                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                exit={{ opacity: 0 }} 
                                onClick={() => setIsModalOpen(false)} 
                                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
                            />
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                                animate={{ opacity: 1, scale: 1, y: 0 }} 
                                exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                                className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl relative z-10 overflow-hidden text-slate-900"
                            >
                                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                                    <div>
                                        <h3 className="text-[20px] font-bold tracking-tight">
                                            {editingItem ? 'Modifier' : 'Nouvelle'} Boutique
                                        </h3>
                                        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">Identité Visuelle & Infos</p>
                                    </div>
                                    <button onClick={() => { setIsModalOpen(false); setPreviewImage(null); }} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100/50 text-slate-400 hover:text-rose-600 transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                                
                                <form onSubmit={handleUpsert} className="p-8 space-y-8">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom de la boutique</label>
                                            <input
                                                name="name"
                                                defaultValue={editingItem?.name}
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all text-[15px] font-bold"
                                                placeholder="Ex: Airflux, RS Car..."
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                                            <textarea
                                                name="description"
                                                defaultValue={editingItem?.description}
                                                rows={3}
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all text-[14px] font-medium"
                                                placeholder="Courte description de la boutique..."
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Logo / Icône (Header)</label>
                                        
                                        <div className="flex items-center gap-6 p-4 bg-slate-50/50 border border-slate-100 rounded-[24px]">
                                            <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-inner">
                                                {previewImage ? (
                                                    <img src={previewImage} alt="Preview" className="w-full h-full object-contain p-2" />
                                                ) : (
                                                    <ImageIcon size={32} strokeWidth={1} className="text-slate-200" />
                                                )}
                                            </div>
                                            
                                            <div className="flex-1 space-y-2">
                                                <input
                                                    type="file"
                                                    name="imageFile"
                                                    ref={fileInputRef}
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => setPreviewImage(reader.result as string);
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                    className="hidden"
                                                    accept="image/*"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[12px] font-bold text-slate-600 hover:border-orange-500 hover:text-orange-600 transition-all shadow-sm"
                                                >
                                                    <CloudUpload size={18} /> Télécharger
                                                </button>
                                                <p className="text-[10px] text-slate-400 font-medium italic">Format carré recommandé</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button 
                                            type="button" 
                                            onClick={() => { setIsModalOpen(false); setPreviewImage(null); }} 
                                            className="flex-1 py-4 border border-slate-200 rounded-[20px] font-bold text-[13px] text-slate-500 hover:bg-slate-50 transition-all"
                                        >
                                            Annuler
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={isSaving || isUploading} 
                                            className="flex-[2] py-4 bg-slate-900 text-white rounded-[20px] font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-orange-600 shadow-xl transition-all disabled:opacity-50"
                                        >
                                            {(isSaving || isUploading) ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                            {editingItem ? 'Mettre à jour' : 'Créer la boutique'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
