'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Layers,
    ChevronRight,
    Loader2,
    X,
    Save,
    ChevronLeft,
    FolderTree,
    Folder
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
    deleteThirdLevelCategory
} from '@/lib/actions/admin-actions';

export default function CategoriesPage() {
    const [view, setView] = useState<'l1' | 'l2' | 'l3'>('l1');
    const [selectedL1, setSelectedL1] = useState<any>(null);
    const [selectedL2, setSelectedL2] = useState<any>(null);

    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadItems();
    }, [view, selectedL1, selectedL2]);

    async function loadItems() {
        setLoading(true);
        try {
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
        const name = formData.get('name') as string;
        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

        let res: any;
        if (view === 'l1') {
            res = await upsertCategory({ name, slug }, editingItem?.id);
        } else if (view === 'l2') {
            res = await upsertSubCategory({ name, slug, categoryId: selectedL1.id }, editingItem?.id);
        } else {
            res = await upsertThirdLevelCategory({ name, slug, subCategoryId: selectedL2.id }, editingItem?.id);
        }

        if (res.success) {
            setIsModalOpen(false);
            setEditingItem(null);
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
        if (view === 'l1') return <h1 className="text-[36px] font-bold text-slate-900 leading-tight">Architecture <span className="text-primary italic font-serif">Niveau 1.</span></h1>;
        if (view === 'l2') return <h1 className="text-[36px] font-bold text-slate-900 leading-tight">Sous-catégories de <span className="text-primary italic font-serif">{selectedL1.name}.</span></h1>;
        return <h1 className="text-[36px] font-bold text-slate-900 leading-tight">Sous-sous de <span className="text-primary italic font-serif">{selectedL2.name}.</span></h1>;
    };

    return (
        <div className="space-y-12 pb-20">
            {/* Navigation Breadcrumb */}
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                <button onClick={() => setView('l1')} className={cn("hover:text-primary transition-colors", view === 'l1' && "text-primary")}>Catalogue</button>
                {view !== 'l1' && (
                    <>
                        <ChevronRight size={12} strokeWidth={3} />
                        <button onClick={() => setView('l2')} className={cn("hover:text-primary transition-colors", view === 'l2' && "text-primary")}>{selectedL1?.name}</button>
                    </>
                )}
                {view === 'l3' && (
                    <>
                        <ChevronRight size={12} strokeWidth={3} />
                        <span className="text-primary">{selectedL2?.name}</span>
                    </>
                )}
            </div>

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
                        onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
                        className="flex items-center gap-3 px-6 py-3 bg-[#1B1F3B] text-white rounded-xl font-bold text-[13px] hover:bg-primary hover:shadow-xl transition-all shadow-lg group"
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
                    <Loader2 className="animate-spin text-primary" size={32} />
                    <p className="font-bold uppercase tracking-widest text-[10px]">Chargement des données...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredItems.map((item, i) => (
                        <motion.div
                            key={item.id}
                            whileHover={{ y: -6, boxShadow: "0 25px 40px -20px rgba(0,0,0,0.06)" }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white p-8 rounded-[28px] border border-slate-200/50 shadow-sm transition-all group relative min-h-[220px] flex flex-col justify-between"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center border bg-slate-50 text-slate-400 transition-all group-hover:bg-primary/5 group-hover:text-primary">
                                    {view === 'l1' ? <Layers size={26} /> : view === 'l2' ? <FolderTree size={26} /> : <Folder size={26} />}
                                </div>
                                <div className="relative group/opt">
                                    <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-white hover:text-slate-900 transition-all border border-transparent hover:border-slate-200">
                                        <Plus size={18} />
                                    </button>
                                    <div className="absolute right-0 top-full mt-2 w-36 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 group-hover/opt:opacity-100 pointer-events-none group-hover/opt:pointer-events-auto transition-all p-1 z-20">
                                        <button
                                            onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                                            className="w-full text-left p-2.5 rounded-lg text-[12px] font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors flex items-center gap-2"
                                        >
                                            <Edit size={14} /> Modifier
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="w-full text-left p-2.5 rounded-lg text-[12px] font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2"
                                        >
                                            <Trash2 size={14} /> Supprimer
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-[20px] font-bold text-slate-900 tracking-tight group-hover:text-primary transition-colors">{item.name}</h3>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{item._count?.products || 0} Produits</span>
                                    </div>
                                    {view !== 'l3' && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                                {view === 'l1' ? `${item._count?.subCategories || 0} Sous-cats` : `${item._count?.thirdLevelCategories || 0} Sous-sous`}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {view !== 'l3' && (
                                    <button
                                        onClick={() => {
                                            if (view === 'l1') { setSelectedL1(item); setView('l2'); }
                                            else if (view === 'l2') { setSelectedL2(item); setView('l3'); }
                                        }}
                                        className="mt-4 w-full py-3 bg-slate-50 rounded-xl text-[11px] font-bold uppercase tracking-widest text-[#1B1F3B] opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white"
                                    >
                                        Explorer Niveau {view === 'l1' ? '2' : '3'}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    <button
                        onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
                        className="border-2 border-dashed border-slate-200/60 rounded-[28px] p-8 flex flex-col items-center justify-center gap-4 group hover:border-primary/20 hover:bg-primary/5 transition-all text-slate-400 hover:text-primary"
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

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-md rounded-[32px] shadow-2xl relative z-10 overflow-hidden text-slate-900">
                            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-[18px] font-bold">
                                    {editingItem ? 'Modifier' : 'Nouveau'} {view === 'l1' ? 'Rayon' : view === 'l2' ? 'Sous-rayon' : 'Niveau 3'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleUpsert} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Nom de l'élément</label>
                                    <input
                                        name="name"
                                        defaultValue={editingItem?.name}
                                        required
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/5 transition-all font-bold"
                                        placeholder="Ex: Électroménager, Smartphones..."
                                    />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-[13px] text-slate-500 hover:bg-slate-50 transition-all">Annuler</button>
                                    <button type="submit" disabled={isSaving} className="flex-[2] py-4 bg-[#1B1F3B] text-white rounded-2xl font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-primary shadow-lg transition-all">
                                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                        {editingItem ? 'Sauvegarder' : 'Créer'}
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
