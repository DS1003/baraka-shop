'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Layers,
    ChevronRight,
    Loader2,
    Save,
    ChevronLeft,
    Folder,
    ImageIcon,
    TrendingUp,
    PackageCheck,
    Boxes,
    Upload,
    CloudUpload,
    MoreVertical,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    getAdminCategories,
    deleteCategory,
    upsertCategory,
    getSubCategories,
    upsertSubCategory,
    deleteSubCategory,
    getThirdLevelCategories,
    upsertThirdLevelCategory,
    deleteThirdLevelCategory,
    getCategoryStats
} from '@/lib/actions/admin-actions';
import { uploadToCloudinaryAction } from '@/lib/actions/media-actions';
import { uploadToCloudinaryAction as mediaUploadAction } from '@/lib/actions/media-actions';

export default function CategoriesPage() {
    const [view, setView] = useState<'l1' | 'l2' | 'l3'>('l1');
    const [selectedL1, setSelectedL1] = useState<any>(null);
    const [selectedL2, setSelectedL2] = useState<any>(null);

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
    }, [view, selectedL1, selectedL2]);

    async function loadItems() {
        setLoading(true);
        try {
            const statsData = await getCategoryStats();
            setStats(statsData);

            let data;
            if (view === 'l1') data = await getAdminCategories();
            else if (view === 'l2') data = await getSubCategories(selectedL1?.id);
            else data = await getThirdLevelCategories(selectedL2?.id);
            setItems(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm("Supprimer cet élément ?")) {
            let res: any;
            if (view === 'l1') res = await deleteCategory(id);
            else if (view === 'l2') res = await deleteSubCategory(id);
            else res = await deleteThirdLevelCategory(id);

            if (res.success) {
                setItems(prev => prev.filter(c => c.id !== id));
            } else {
                alert(res.message);
            }
        }
    };

    const handleUpsert = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.currentTarget);
        
        let imageUrl = editingItem?.image || '';
        
        // Handle File Upload if present
        const imageFile = formData.get('imageFile') as File;
        if (imageFile && imageFile.size > 0) {
            setIsUploading(true);
            const uploadFormData = new FormData();
            uploadFormData.append('file', imageFile);
            const uploadRes = await uploadToCloudinaryAction(uploadFormData);
            if (uploadRes.success && uploadRes.media?.url) {
                imageUrl = uploadRes.media.url;
            } else {
                alert("Échec de l'upload de l'image"); // Replaced toast.error with alert
                setIsUploading(false);
                setIsSaving(false);
                return;
            }
            setIsUploading(false);
        }

        const data = {
            name: formData.get('name') as string,
            image: imageUrl,
            slug: (formData.get('name') as string).toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        };
        
        let res: any;
        if (view === 'l1') {
            res = await upsertCategory({ name: data.name, slug: data.slug, image: data.image }, editingItem?.id);
        } else if (view === 'l2') {
            res = await upsertSubCategory({ name: data.name, slug: data.slug, categoryId: selectedL1.id }, editingItem?.id);
        } else {
            res = await upsertThirdLevelCategory({ name: data.name, slug: data.slug, subCategoryId: selectedL2.id }, editingItem?.id);
        }

        if (res.success) {
            setIsModalOpen(false);
            setEditingItem(null);
            setPreviewImage(null); // Clear preview image on success
            loadItems();
        } else {
            alert("Erreur lors de la sauvegarde.");
        }
        setIsSaving(false);
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getTitle = () => {
        if (view === 'l1') return <h1 className="text-[36px] font-bold text-slate-900 leading-tight">Rayons <span className="text-orange-600 italic font-serif">Niveau 1.</span></h1>;
        if (view === 'l2') return <h1 className="text-[36px] font-bold text-slate-900 leading-tight">Sous-catégories de <span className="text-orange-600 italic font-serif">{selectedL1.name}.</span></h1>;
        return <h1 className="text-[36px] font-bold text-slate-900 leading-tight">Sous-sous de <span className="text-orange-600 italic font-serif">{selectedL2.name}.</span></h1>;
    };

    return (
        <div className="space-y-12 pb-20">
            {/* Navigation Breadcrumb */}
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                <button onClick={() => setView('l1')} className={cn("px-3 py-1.5 rounded-lg transition-all", view === 'l1' ? "bg-orange-600 text-white font-bold shadow-md shadow-orange-100" : "hover:bg-slate-100 text-slate-500 font-medium")}>Catalogue</button>
                {view !== 'l1' && (
                    <>
                        <ChevronRight size={14} className="text-slate-300" strokeWidth={2.5} />
                        <button onClick={() => setView('l2')} className={cn("px-3 py-1.5 rounded-lg transition-all", view === 'l2' ? "bg-orange-600/10 text-orange-600 font-bold" : "hover:bg-slate-100 text-slate-500 font-medium")}>{selectedL1?.name}</button>
                    </>
                )}
                {view === 'l3' && (
                    <>
                        <ChevronRight size={14} className="text-slate-300" strokeWidth={2.5} />
                        <span className="px-3 py-1.5 rounded-lg bg-orange-600/5 text-orange-600 font-bold">{selectedL2?.name}</span>
                    </>
                )}
            </div>

            {/* Stat Cards Section */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                            <Layers size={22} />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Rayons L1</p>
                            <h4 className="text-2xl font-black text-slate-900 leading-none">{stats.l1}</h4>
                        </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Boxes size={22} />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Sous-cats L2</p>
                            <h4 className="text-2xl font-black text-slate-900 leading-none">{stats.l2}</h4>
                        </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <TrendingUp size={22} />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Lvl 3</p>
                            <h4 className="text-2xl font-black text-slate-900 leading-none">{stats.l3}</h4>
                        </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-100">
                            <PackageCheck size={22} />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Total Produits</p>
                            <h4 className="text-2xl font-black text-slate-900 leading-none">{stats.products}</h4>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-2 border-b border-slate-200/40">
                <div className="space-y-1.5">
                    {getTitle()}
                    <p className="text-[15px] text-slate-500 font-medium font-serif italic italic font-serif">
                        {view === 'l1' ? "Gérez les rayons principaux de votre boutique." : "Affinez la segmentation pour une navigation optimale."}
                    </p>
                </div>

                <div className="flex gap-4">
                    {view !== 'l1' && (
                        <button
                            onClick={() => view === 'l2' ? setView('l1') : setView('l2')}
                            className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-[13px] hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <ChevronLeft size={20} />
                            <span>Retour</span>
                        </button>
                    )}
                    <button
                        onClick={() => { setEditingItem(null); setPreviewImage(null); setIsModalOpen(true); }}
                        className="flex items-center gap-3 px-6 py-3 bg-[#1B1F3B] text-white rounded-xl font-bold text-[13px] hover:bg-orange-600 hover:shadow-xl transition-all shadow-lg group"
                    >
                        <Plus size={20} />
                        <span>Nouvel Élément</span>
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-xl group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-primary transition-colors" size={18} />
                <input
                    type="text"
                    placeholder="Rechercher..."
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
                <div className={cn(
                    "grid gap-8",
                    view === 'l1' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                )}>
                    {filteredItems.map((item, i) => (
                        <motion.div
                            key={item.id}
                            whileHover={{ y: -6, boxShadow: "0 25px 40px -20px rgba(0,0,0,0.08)" }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={cn(
                                "bg-white rounded-[32px] border border-slate-200/50 shadow-sm transition-all group relative flex flex-col overflow-hidden",
                                view === 'l1' ? "min-h-[400px]" : "min-h-[240px]"
                            )}
                        >
                            {/* Image Header for L1 */}
                            {view === 'l1' && (
                                <div className="h-[200px] bg-slate-100 relative group-hover:scale-105 transition-transform duration-700">
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <ImageIcon size={48} strokeWidth={1} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-60" />
                                </div>
                            )}

                            <div className="p-8 flex flex-col flex-1 justify-between relative">
                                {view !== 'l1' && (
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center border bg-slate-50 text-slate-400 transition-all group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600 group-hover:shadow-lg group-hover:shadow-orange-100 overflow-hidden">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <>
                                                    {view === 'l2' ? <Boxes size={26} /> : <Folder size={26} />}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <div className="flex justify-between items-start">
                                        <h3 className={cn(
                                            "font-bold text-slate-900 tracking-tight group-hover:text-orange-600 transition-colors",
                                            view === 'l1' ? "text-[24px]" : "text-[20px]"
                                        )}>{item.name}</h3>
                                        
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
                                                                setPreviewImage(item.image);
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

                                    {/* Detailed Stats for L1 */}
                                    {view === 'l1' && item.subCategories?.length > 0 && (
                                        <div className="mt-6 flex flex-wrap gap-2">
                                            {item.subCategories.slice(0, 5).map((sub: any) => (
                                                <span key={sub.id} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                                    {sub.name}
                                                </span>
                                            ))}
                                            {item._count.subCategories > 5 && (
                                                <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-bold uppercase tracking-tight">
                                                    +{item._count.subCategories - 5} de plus
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-2 mt-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-600/40" />
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{item._count?.products || 0} Produits directs</span>
                                        </div>
                                        {view !== 'l3' && (
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40" />
                                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                                    {view === 'l1' ? `${item._count?.subCategories || 0} Sous-catégories` : `${item._count?.thirdLevelCategories || 0} Sous-sous`}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {view !== 'l3' && (
                                    <button
                                        onClick={() => {
                                            if (view === 'l1') { setSelectedL1(item); setView('l2'); }
                                            else if (view === 'l2') { setSelectedL2(item); setView('l3'); }
                                        }}
                                        className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl text-[12px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all hover:bg-orange-600 shadow-xl shadow-slate-200 hover:shadow-orange-100"
                                    >
                                        Explorer Niveau {view === 'l1' ? '2' : '3'}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    <button
                        onClick={() => { setEditingItem(null); setPreviewImage(null); setIsModalOpen(true); }}
                        className="border-2 border-dashed border-slate-200/60 rounded-[28px] p-8 flex flex-col items-center justify-center gap-4 group hover:border-orange-600/20 hover:bg-orange-600/5 transition-all text-slate-400 hover:text-orange-600"
                    >
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-slate-100 group-hover:scale-110 group-hover:rotate-12 transition-transform">
                            <Plus size={32} strokeWidth={2.5} />
                        </div>
                        <div className="text-center">
                            <span className="block text-[13px] font-bold uppercase tracking-widest">Ajouter</span>
                            <span className="text-[11px] font-medium text-slate-400 mt-1">Niveau {view === 'l1' ? '1' : view === 'l2' ? '2' : '3'}</span>
                        </div>
                    </button>
                </div>
            )}

            {/* Modal - Portaled to Body for full screen blur coverage */}
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
                                            {editingItem ? 'Modifier' : 'Nouveau'} {view === 'l1' ? 'Rayon' : view === 'l2' ? 'Sous-rayon' : 'Niveau 3'}
                                        </h3>
                                        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">Configuration de la structure</p>
                                    </div>
                                    <button onClick={() => { setIsModalOpen(false); setPreviewImage(null); }} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100/50 text-slate-400 hover:text-rose-600 transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                                
                                <form onSubmit={handleUpsert} className="p-8 space-y-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Désignation du rayon</label>
                                        <input
                                            name="name"
                                            defaultValue={editingItem?.name}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all text-[15px] font-bold"
                                            placeholder="Ex: Électronique, Smartphones..."
                                            required
                                        />
                                    </div>
                                    
                                    {view === 'l1' && (
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Image de Couverture</label>
                                            
                                            <div className="flex items-center gap-6 p-4 bg-slate-50/50 border border-slate-100 rounded-[24px]">
                                                <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-inner">
                                                    {previewImage ? (
                                                        <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
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
                                                    <p className="text-[10px] text-slate-400 font-medium italic">Recommandé: 800x600px</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

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
                                            className="flex-[2] py-4 bg-slate-900 text-white rounded-[20px] font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-orange-600 shadow-xl transition-all shadow-orange-100/20 disabled:opacity-50"
                                        >
                                            {(isSaving || isUploading) ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                            {editingItem ? 'Mettre à jour' : 'Confirmer la création'}
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
