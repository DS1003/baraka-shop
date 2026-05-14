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
    Wand2,
    Check,
    ArrowRight,
    LayoutGrid,
    AlertCircle,
    Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    getPopularUniverses,
    upsertPopularUniverse,
    deletePopularUniverse,
    getAdminCategories
} from '@/lib/actions/admin-actions';
import { uploadToCloudinaryAction } from '@/lib/actions/media-actions';
import { toast } from 'sonner';

const DEFAULT_UNIVERSES = [
    { name: 'BATTERIE', subtitle: 'EXTERNES & INTERNES', image: '/categories/batterie.png', href: '/category/batterie', order: 1 },
    { name: 'CHARGEUR', subtitle: 'SECTEUR & INDUCTION', image: '/categories/chargeur.png', href: '/category/chargeur', order: 2 },
    { name: 'CONNECTIQUE', subtitle: 'ADAPTATEURS & HUBS', image: '/categories/connectique.png', href: '/category/connectique', order: 3 },
    { name: 'CONSOMMABLES', subtitle: 'ENCRE & PAPIER', image: '/categories/consommables.png', href: '/category/consommables', order: 4 },
    { name: 'ELECTRONIQUE', subtitle: 'COMPOSANTS & GADGETS', image: '/categories/electronique.png', href: '/category/electronique', order: 5 },
    { name: 'GÉNÉRAL', subtitle: 'UNIVERS HIGH-TECH', image: '/categories/general.png', href: '/category/general', order: 6 },
    { name: 'IMAGE & SON', subtitle: 'TV, CASQUES & CAMÉRAS', image: '/categories/image-son.png', href: '/category/image-son', order: 7 },
    { name: 'INFORMATIQUE', subtitle: 'MACBOOK, PC & PORTABLES', image: '/categories/informatique.png', href: '/category/informatique', order: 8 },
];

export default function PopularUniversesPage() {
    const [items, setItems] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isSeeding, setIsSeeding] = useState(false);
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
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const [universesData, categoriesData] = await Promise.all([
                getPopularUniverses(),
                getAdminCategories()
            ]);
            setItems(universesData);
            setCategories(categoriesData);
        } catch (err) {
            console.error(err);
            toast.error("Erreur de chargement");
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async () => {
        if (!itemToDelete) return;
        
        const res = await deletePopularUniverse(itemToDelete);
        if (res.success) {
            setItems(prev => prev.filter(c => c.id !== itemToDelete));
            toast.success("Supprimé avec succès");
        } else {
            toast.error(res.message || "Erreur lors de la suppression.");
        }
        setIsConfirmOpen(false);
        setItemToDelete(null);
    };

    const handleSeed = async () => {
        setIsSeeding(true);
        try {
            for (const uni of DEFAULT_UNIVERSES) {
                await upsertPopularUniverse(uni);
            }
            await loadData();
            toast.success("Univers initialisés !");
        } catch (err) {
            console.error(err);
            toast.error("Erreur lors de l'initialisation.");
        } finally {
            setIsSeeding(false);
        }
    };

    const handleUpsert = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.currentTarget);
        
        let imageUrl = editingItem?.image || previewImage || '';
        
        const imageFile = formData.get('imageFile') as File;
        if (imageFile && imageFile.size > 0) {
            setIsUploading(true);
            const uploadFormData = new FormData();
            uploadFormData.append('file', imageFile);
            const uploadRes = await uploadToCloudinaryAction(uploadFormData);
            if (uploadRes.success && uploadRes.media?.url) {
                imageUrl = uploadRes.media.url;
            } else {
                toast.error("Échec de l'upload de l'image");
                setIsUploading(false);
                setIsSaving(false);
                return;
            }
            setIsUploading(false);
        }

        const data = {
            name: (formData.get('name') as string).toUpperCase(),
            subtitle: (formData.get('subtitle') as string).toUpperCase(),
            href: formData.get('href') as string,
            image: imageUrl,
            order: parseInt(formData.get('order') as string || '0'),
        };
        
        const res = await upsertPopularUniverse(data, editingItem?.id);

        if (res.success) {
            setIsModalOpen(false);
            setEditingItem(null);
            setPreviewImage(null);
            loadData();
            toast.success("Enregistré avec succès");
        } else {
            toast.error(res.message || "Erreur lors de la sauvegarde.");
        }
        setIsSaving(false);
    };

    const handleCategorySelect = (categoryId: string) => {
        const cat = categories.find(c => c.id === categoryId);
        if (cat) {
            const nameInput = document.getElementsByName('name')[0] as HTMLInputElement;
            const hrefInput = document.getElementsByName('href')[0] as HTMLInputElement;
            const subtitleInput = document.getElementsByName('subtitle')[0] as HTMLInputElement;
            
            if (nameInput) nameInput.value = cat.name.toUpperCase();
            if (hrefInput) hrefInput.value = `/category/${cat.slug}`;
            
            const defaultSubtitles: Record<string, string> = {
                'INFORMATIQUE': 'MACBOOK, PC & PORTABLES',
                'BATTERIE': 'EXTERNES & INTERNES',
                'CHARGEUR': 'SECTEUR & INDUCTION',
                'CONNECTIQUE': 'ADAPTATEURS & HUBS',
                'CONSOMMABLES': 'ENCRE & PAPIER',
                'ELECTRONIQUE': 'COMPOSANTS & GADGETS',
                'IMAGE & SON': 'TV, CASQUES & CAMÉRAS',
                'GÉNÉRAL': 'UNIVERS HIGH-TECH'
            };
            
            if (subtitleInput) {
                subtitleInput.value = defaultSubtitles[cat.name.toUpperCase()] || 'DÉCOUVREZ NOS OFFRES';
            }
            
            if (cat.image) {
                setPreviewImage(cat.image);
            }
        }
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => a.order - b.order);

    return (
        <div className="space-y-10 pb-20 max-w-[1400px] mx-auto px-4 md:px-6">
            {/* Minimalist Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <span className="w-2 h-8 bg-orange-600 rounded-full" />
                        Univers Populaires
                    </h1>
                    <p className="text-slate-400 font-medium text-sm mt-1 ml-5">
                        Gérez les rayons phares de votre boutique.
                    </p>
                </div>

                <div className="flex gap-3">
                    {items.length === 0 && (
                        <button
                            onClick={handleSeed}
                            disabled={isSeeding}
                            className="flex items-center gap-2 px-5 py-2.5 bg-orange-50 text-orange-600 rounded-xl font-bold text-xs hover:bg-orange-100 transition-all border border-orange-200/30"
                        >
                            {isSeeding ? <Loader2 className="animate-spin" size={14} /> : <Wand2 size={14} />}
                            Initialiser
                        </button>
                    )}
                    <button
                        onClick={() => { setEditingItem(null); setPreviewImage(null); setIsModalOpen(true); }}
                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-orange-600 transition-all shadow-md active:scale-95"
                    >
                        <Plus size={16} />
                        Ajouter
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Rechercher..."
                    className="w-full pl-12 pr-6 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-200 transition-all shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Grid */}
            {loading ? (
                <div className="h-[400px] flex items-center justify-center">
                    <Loader2 className="animate-spin text-orange-600" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="group bg-white rounded-3xl border border-slate-50 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col overflow-hidden relative"
                        >
                            <div className="absolute top-4 left-4 z-10 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-lg">
                                {item.order}
                            </div>

                            <div className="h-[200px] flex items-center justify-center p-8 bg-slate-50/30 group-hover:bg-white transition-colors">
                                {item.image ? (
                                    <img 
                                        src={item.image} 
                                        alt={item.name} 
                                        className="max-w-full max-h-full object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-500" 
                                    />
                                ) : (
                                    <ImageIcon size={40} className="text-slate-100" />
                                )}
                            </div>

                            <div className="p-6 pt-2 space-y-4">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-900 text-base uppercase truncate group-hover:text-orange-600 transition-colors tracking-tight">
                                            {item.name}
                                        </h3>
                                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest truncate mt-0.5">
                                            {item.subtitle}
                                        </p>
                                    </div>
                                    
                                    <div className="relative">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenuId(activeMenuId === item.id ? null : item.id);
                                            }}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-400 transition-colors"
                                        >
                                            <MoreVertical size={16} />
                                        </button>
                                        
                                        <AnimatePresence>
                                            {activeMenuId === item.id && (
                                                <motion.div 
                                                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                                    className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-2xl border border-slate-50 p-1 z-50"
                                                >
                                                    <button
                                                        onClick={() => { 
                                                            setEditingItem(item); 
                                                            setPreviewImage(item.image);
                                                            setIsModalOpen(true); 
                                                            setActiveMenuId(null);
                                                        }}
                                                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                                                    >
                                                        <Edit size={14} /> Modifier
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setItemToDelete(item.id);
                                                            setIsConfirmOpen(true);
                                                            setActiveMenuId(null);
                                                        }}
                                                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                                                    >
                                                        <Trash2 size={14} /> Supprimer
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                                    <div className="flex-1 flex items-center gap-2 text-[9px] font-bold text-slate-300 uppercase tracking-tighter truncate">
                                        <ExternalLink size={12} />
                                        {item.href}
                                    </div>
                                    <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-orange-600 group-hover:text-white transition-all">
                                        <ArrowRight size={12} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    <button
                        onClick={() => { setEditingItem(null); setPreviewImage(null); setIsModalOpen(true); }}
                        className="h-[360px] border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center gap-4 text-slate-300 hover:border-orange-200 hover:text-orange-500 hover:bg-orange-50/30 transition-all group"
                    >
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <Plus size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Nouvel Univers</span>
                    </button>
                </div>
            )}

            {/* Edit Modal */}
            {mounted && createPortal(
                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                                onClick={() => setIsModalOpen(false)} 
                                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
                            />
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} 
                                className="bg-white w-full max-w-xl rounded-[32px] shadow-2xl relative z-10 overflow-hidden text-slate-900"
                            >
                                <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
                                    <h3 className="text-xl font-black">{editingItem ? 'Modifier' : 'Ajouter'} un Univers</h3>
                                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-600 transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                                
                                <form onSubmit={handleUpsert} className="p-8 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">Assistant Rapide</label>
                                        <select 
                                            onChange={(e) => handleCategorySelect(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-sm font-bold text-slate-600 appearance-none cursor-pointer"
                                        >
                                            <option value="">Pré-remplir depuis une catégorie...</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">Nom (Titre)</label>
                                            <input
                                                name="name"
                                                defaultValue={editingItem?.name}
                                                className="w-full px-4 py-3 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-sm font-bold"
                                                placeholder="Ex: INFORMATIQUE"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">Position (1-8)</label>
                                            <input
                                                name="order"
                                                type="number"
                                                defaultValue={editingItem?.order || items.length + 1}
                                                className="w-full px-4 py-3 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-sm font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">Sous-titre</label>
                                        <input
                                            name="subtitle"
                                            defaultValue={editingItem?.subtitle}
                                            className="w-full px-4 py-3 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-sm font-medium"
                                            placeholder="Ex: MACBOOK, PC & PORTABLES"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">Lien URL</label>
                                        <input
                                            name="href"
                                            defaultValue={editingItem?.href}
                                            className="w-full px-4 py-3 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-sm font-medium"
                                            placeholder="/category/informatique"
                                            required
                                        />
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">Visuel</label>
                                        <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-3xl border border-slate-100">
                                            <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden">
                                                {previewImage ? (
                                                    <img src={previewImage} alt="Preview" className="w-full h-full object-contain p-2" />
                                                ) : (
                                                    <ImageIcon size={20} className="text-slate-200" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="file" name="imageFile" ref={fileInputRef}
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => setPreviewImage(reader.result as string);
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                    className="hidden" accept="image/*"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 hover:text-orange-600 transition-colors shadow-sm"
                                                >
                                                    TÉLÉCHARGER
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest">Annuler</button>
                                        <button 
                                            type="submit" disabled={isSaving || isUploading} 
                                            className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all disabled:opacity-50"
                                        >
                                            {isSaving ? <Loader2 className="animate-spin mx-auto" /> : (editingItem ? 'Mettre à jour' : 'Enregistrer')}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {/* Custom Confirmation Modal */}
            {mounted && createPortal(
                <AnimatePresence>
                    {isConfirmOpen && (
                        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                                onClick={() => setIsConfirmOpen(false)} 
                                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" 
                            />
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} 
                                className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl relative z-10 overflow-hidden p-8 text-center"
                            >
                                <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <AlertCircle size={32} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-2">Êtes-vous sûr ?</h3>
                                <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                                    Cette action est irréversible. L'univers populaire sera définitivement retiré de la page d'accueil.
                                </p>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setIsConfirmOpen(false)}
                                        className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button 
                                        onClick={handleDelete}
                                        className="flex-1 py-3.5 bg-rose-600 text-white rounded-xl font-bold text-xs hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all active:scale-95"
                                    >
                                        Oui, supprimer
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
