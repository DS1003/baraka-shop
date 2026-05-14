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
    CloudUpload,
    MoreVertical,
    X,
    Zap,
    ExternalLink,
    GripVertical,
    ChevronDown,
    LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    getPopularUniverses,
    upsertPopularUniverse,
    deletePopularUniverse,
    getAdminCategories,
    initializePopularUniverses
} from '@/lib/actions/admin-actions';
import { uploadToCloudinaryAction } from '@/lib/actions/media-actions';

export default function PopularUniversesPage() {
    const [items, setItems] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    
    // Controlled inputs for pre-filling
    const [name, setName] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [href, setHref] = useState('');
    const [order, setOrder] = useState(0);

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
            const [data, cats] = await Promise.all([
                getPopularUniverses(),
                getAdminCategories()
            ]);
            setItems(data);
            setCategories(cats);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm("Supprimer cet univers populaire ?")) {
            const res = await deletePopularUniverse(id);
            if (res.success) {
                setItems(prev => prev.filter(c => c.id !== id));
            } else {
                alert(res.message || "Erreur lors de la suppression.");
            }
        }
    };

    const handleUpsert = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.currentTarget);
        
        let imageUrl = editingItem?.image || '';
        
        const imageFile = formData.get('imageFile') as File;
        if (imageFile && imageFile.size > 0) {
            setIsUploading(true);
            const uploadFormData = new FormData();
            uploadFormData.append('file', imageFile);
            const uploadRes = await uploadToCloudinaryAction(uploadFormData);
            if (uploadRes.success && uploadRes.media?.url) {
                imageUrl = uploadRes.media.url;
            } else {
                alert("Échec de l'upload de l'image");
                setIsUploading(false);
                setIsSaving(false);
                return;
            }
            setIsUploading(false);
        }

        const data = {
            name: formData.get('name') as string,
            subtitle: formData.get('subtitle') as string,
            href: formData.get('href') as string,
            image: imageUrl,
            order: parseInt(formData.get('order') as string || '0'),
        };
        
        const res = await upsertPopularUniverse(data, editingItem?.id);

        if (res.success) {
            setIsModalOpen(false);
            setEditingItem(null);
            setPreviewImage(null);
            setName('');
            setSubtitle('');
            setHref('');
            setOrder(0);
            loadItems();
        } else {
            alert(res.message || "Erreur lors de la sauvegarde.");
        }
        setIsSaving(false);
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-12 pb-20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-2 border-b border-slate-200/40">
                <div className="space-y-1.5">
                    <h1 className="text-[36px] font-bold text-slate-900 leading-tight">
                        Univers <span className="text-orange-600 italic font-serif">Populaires.</span>
                    </h1>
                    <p className="text-[15px] text-slate-500 font-medium font-serif italic">
                        Gérez les catégories mises en avant sur la page d'accueil.
                    </p>
                </div>

                <div className="flex gap-4">
                    {items.length === 0 && (
                        <button
                            onClick={async () => {
                                if (confirm("Initialiser les univers par défaut ?")) {
                                    setLoading(true);
                                    await initializePopularUniverses();
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
                        onClick={() => { 
                            setEditingItem(null); 
                            setPreviewImage(null); 
                            setName('');
                            setSubtitle('');
                            setHref('');
                            setOrder(items.length);
                            setIsModalOpen(true); 
                        }}
                        className="flex items-center gap-3 px-6 py-3 bg-[#1B1F3B] text-white rounded-xl font-bold text-[13px] hover:bg-orange-600 hover:shadow-xl transition-all shadow-lg group"
                    >
                        <Plus size={20} />
                        <span>Nouvel Univers</span>
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-xl group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-primary transition-colors" size={18} />
                <input
                    type="text"
                    placeholder="Rechercher un univers..."
                    className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Grid Layout */}
            {loading ? (
                <div className="h-[400px] flex flex-col items-center justify-center text-slate-400 gap-4">
                    <Loader2 className="animate-spin text-orange-600" size={32} />
                    <p className="font-bold uppercase tracking-widest text-[10px]">Chargement des données...</p>
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
                            <div className="h-[180px] bg-slate-100 relative group-hover:scale-105 transition-transform duration-700">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-contain p-4" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <ImageIcon size={48} strokeWidth={1} />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur shadow-sm rounded-full text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                    <Zap size={10} className="text-orange-600" fill="currentColor" />
                                    Ordre: {item.order}
                                </div>
                            </div>

                            <div className="p-6 flex flex-col flex-1 justify-between">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-[18px] group-hover:text-orange-600 transition-colors">{item.name}</h3>
                                            <p className="text-[12px] text-slate-400 font-medium line-clamp-1 mt-0.5">{item.subtitle || 'Pas de sous-titre'}</p>
                                        </div>
                                        
                                        <div className="relative">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveMenuId(activeMenuId === item.id ? null : item.id);
                                                }}
                                                className={cn(
                                                    "w-9 h-9 flex items-center justify-center rounded-xl transition-all border",
                                                    activeMenuId === item.id 
                                                        ? "bg-white text-orange-600 border-orange-200 shadow-md" 
                                                        : "bg-slate-50 text-slate-400 hover:bg-white hover:text-slate-900 border-transparent hover:border-slate-200"
                                                )}
                                            >
                                                <MoreVertical size={16} />
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
                                                                setPreviewImage(item.image);
                                                                setName(item.name);
                                                                setSubtitle(item.subtitle || '');
                                                                setHref(item.href);
                                                                setOrder(item.order);
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

                                    <div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                        <ExternalLink size={12} />
                                        <span className="truncate max-w-[200px]">{item.href}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    <button
                        onClick={() => { 
                            setEditingItem(null); 
                            setPreviewImage(null); 
                            setName('');
                            setSubtitle('');
                            setHref('');
                            setOrder(items.length);
                            setIsModalOpen(true); 
                        }}
                        className="border-2 border-dashed border-slate-200/60 rounded-[28px] p-8 flex flex-col items-center justify-center gap-4 group hover:border-orange-600/20 hover:bg-orange-600/5 transition-all text-slate-400 hover:text-orange-600"
                    >
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-slate-100 group-hover:scale-110 group-hover:rotate-12 transition-transform">
                            <Plus size={32} strokeWidth={2.5} />
                        </div>
                        <div className="text-center">
                            <span className="block text-[13px] font-bold uppercase tracking-widest">Ajouter un univers</span>
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
                                            {editingItem ? 'Modifier' : 'Nouvel'} Univers Populaire
                                        </h3>
                                        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">Mise en avant accueil</p>
                                    </div>
                                    <button onClick={() => { setIsModalOpen(false); setPreviewImage(null); }} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100/50 text-slate-400 hover:text-rose-600 transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                                
                                <form onSubmit={handleUpsert} className="p-8 space-y-6">
                                    {/* Category Selector for Quick Fill */}
                                    {!editingItem && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                <LayoutGrid size={12} className="text-orange-600" />
                                                Pré-remplir via un Rayon
                                            </label>
                                            <select
                                                onChange={(e) => {
                                                    const cat = categories.find(c => c.id === e.target.value);
                                                    if (cat) {
                                                        setName(cat.name);
                                                        setHref(`/category/${cat.slug}`);
                                                        if (cat.image) setPreviewImage(cat.image);
                                                    }
                                                }}
                                                className="w-full px-5 py-3 bg-orange-50/50 border border-orange-100 rounded-[16px] focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all text-[14px] font-medium"
                                            >
                                                <option value="">Sélectionner un rayon (facultatif)</option>
                                                {categories.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom de l'univers</label>
                                            <input
                                                name="name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-[16px] focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all text-[14px] font-bold"
                                                placeholder="Ex: Informatique"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ordre d'affichage</label>
                                            <input
                                                name="order"
                                                type="number"
                                                value={order}
                                                onChange={(e) => setOrder(parseInt(e.target.value || '0'))}
                                                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-[16px] focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all text-[14px] font-bold"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sous-titre (Description courte)</label>
                                        <input
                                            name="subtitle"
                                            value={subtitle}
                                            onChange={(e) => setSubtitle(e.target.value)}
                                            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-[16px] focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all text-[14px] font-medium"
                                            placeholder="Ex: MacBook, PC & Portables"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lien (URL)</label>
                                        <input
                                            name="href"
                                            value={href}
                                            onChange={(e) => setHref(e.target.value)}
                                            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-[16px] focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all text-[14px] font-medium"
                                            placeholder="Ex: /category/informatique"
                                            required
                                        />
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Image illustrative</label>
                                        
                                        <div className="flex items-center gap-6 p-4 bg-slate-50/50 border border-slate-100 rounded-[24px]">
                                            <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-inner">
                                                {previewImage ? (
                                                    <img src={previewImage} alt="Preview" className="w-full h-full object-contain p-2" />
                                                ) : (
                                                    <ImageIcon size={24} strokeWidth={1} className="text-slate-200" />
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
                                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-600 hover:border-orange-500 hover:text-orange-600 transition-all shadow-sm"
                                                >
                                                    <CloudUpload size={16} /> Télécharger
                                                </button>
                                                <p className="text-[9px] text-slate-400 font-medium italic">Format PNG/WebP recommandé</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button 
                                            type="button" 
                                            onClick={() => { setIsModalOpen(false); setPreviewImage(null); }} 
                                            className="flex-1 py-3.5 border border-slate-200 rounded-[16px] font-bold text-[13px] text-slate-500 hover:bg-slate-50 transition-all"
                                        >
                                            Annuler
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={isSaving || isUploading} 
                                            className="flex-[2] py-3.5 bg-slate-900 text-white rounded-[16px] font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-orange-600 shadow-xl transition-all shadow-orange-100/20 disabled:opacity-50"
                                        >
                                            {(isSaving || isUploading) ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                            {editingItem ? 'Mettre à jour' : 'Enregistrer l\'univers'}
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
