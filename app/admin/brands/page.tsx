'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Briefcase,
    MoreVertical,
    Loader2,
    X,
    Save,
    Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getAdminBrands, deleteBrand, upsertBrand } from '@/lib/actions/admin-actions';

export default function BrandsPage() {
    const [brands, setBrands] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadBrands();
    }, []);

    async function loadBrands() {
        setLoading(true);
        try {
            const data = await getAdminBrands();
            setBrands(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm("Supprimer cette marque ?")) {
            const res = await deleteBrand(id);
            if (res.success) {
                setBrands(prev => prev.filter(b => b.id !== id));
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
        const data = {
            name,
            slug: name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
            image: formData.get('image') as string || null,
        };

        const res = await upsertBrand(data, editingBrand?.id);
        if (res.success) {
            setIsModalOpen(false);
            setEditingBrand(null);
            loadBrands();
        } else {
            alert("Erreur lors de la sauvegarde.");
        }
        setIsSaving(false);
    };

    const filteredBrands = brands.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-12 pb-20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-2 border-b border-slate-200/40">
                <div className="space-y-1.5">
                    <h1 className="text-[36px] font-bold text-slate-900 tracking-tight leading-tight">
                        Gestion des <span className="text-primary tracking-tighter italic font-serif">Marques.</span>
                    </h1>
                    <p className="text-[15px] text-slate-500 font-medium">
                        Administrez les partenaires et marques de votre catalogue premium.
                    </p>
                </div>

                <button
                    onClick={() => { setEditingBrand(null); setIsModalOpen(true); }}
                    className="flex items-center gap-3 px-6 py-3 bg-[#1B1F3B] text-white rounded-xl font-bold text-[13px] hover:bg-primary hover:shadow-xl hover:shadow-primary/20 transition-all shadow-lg shadow-slate-200 group"
                >
                    <Plus size={20} />
                    <span>Nouvelle Marque</span>
                </button>
            </div>

            {/* Tools Bar */}
            <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="relative flex-1 w-full max-w-xl group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-primary transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher une marque..."
                        className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid Layout */}
            {loading ? (
                <div className="h-[400px] flex flex-col items-center justify-center text-slate-400 gap-4">
                    <Loader2 className="animate-spin text-primary" size={32} />
                    <p className="font-bold uppercase tracking-widest text-[10px]">Chargement des marques...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredBrands.map((brand, i) => (
                        <motion.div
                            key={brand.id}
                            whileHover={{ y: -6, boxShadow: "0 25px 40px -20px rgba(0,0,0,0.06)" }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white p-8 rounded-[28px] border border-slate-200/50 shadow-sm transition-all group overflow-hidden relative min-h-[220px] flex flex-col justify-between"
                        >
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center border bg-slate-50 text-slate-400 transition-all duration-500 group-hover:scale-110 group-hover:bg-primary/5 group-hover:text-primary">
                                    <Briefcase size={26} strokeWidth={2.5} />
                                </div>
                                <div className="relative group/opt">
                                    <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-white hover:text-slate-900 transition-all border border-transparent hover:border-slate-200">
                                        <MoreVertical size={18} />
                                    </button>
                                    <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 group-hover/opt:opacity-100 pointer-events-none group-hover/opt:pointer-events-auto transition-all p-1 z-20">
                                        <button
                                            onClick={() => { setEditingBrand(brand); setIsModalOpen(true); }}
                                            className="w-full text-left p-2 rounded-lg text-[12px] font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors flex items-center gap-2"
                                        >
                                            <Edit size={14} /> Modifier
                                        </button>
                                        <button
                                            onClick={() => handleDelete(brand.id)}
                                            className="w-full text-left p-2 rounded-lg text-[12px] font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2"
                                        >
                                            <Trash2 size={14} /> Supprimer
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <div>
                                    <h3 className="text-[20px] font-bold text-slate-900 tracking-tight transition-colors group-hover:text-primary">{brand.name}</h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">{brand._count?.products || 0} Produits</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    <button
                        onClick={() => { setEditingBrand(null); setIsModalOpen(true); }}
                        className="border-2 border-dashed border-slate-200/60 rounded-[28px] p-8 flex flex-col items-center justify-center gap-4 group hover:border-primary/20 hover:bg-primary/5 transition-all duration-500 text-slate-400 hover:text-primary"
                    >
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-slate-100 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                            <Plus size={32} strokeWidth={2.5} />
                        </div>
                        <div className="text-center">
                            <span className="block text-[13px] font-bold uppercase tracking-widest">Ajouter</span>
                            <span className="text-[11px] font-medium text-slate-400 mt-1">Marque Partner</span>
                        </div>
                    </button>
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-md rounded-[32px] shadow-2xl relative z-10 overflow-hidden">
                            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-[18px] font-bold text-slate-900">{editingBrand ? 'Modifier' : 'Nouvelle'} Marque</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleUpsert} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Nom de la Marque</label>
                                    <input
                                        name="name"
                                        defaultValue={editingBrand?.name}
                                        required
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/5 transition-all font-bold"
                                        placeholder="Ex: Apple, Samsung, etc."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">URL du Logo (Optionnel)</label>
                                    <div className="relative">
                                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input
                                            name="image"
                                            defaultValue={editingBrand?.image}
                                            className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/5 transition-all font-bold"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-[13px] text-slate-500 hover:bg-slate-50 transition-all">Annuler</button>
                                    <button type="submit" disabled={isSaving} className="flex-[2] py-4 bg-[#1B1F3B] text-white rounded-2xl font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-primary shadow-lg transition-all">
                                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                        {editingBrand ? 'Sauvegarder' : 'Créer'}
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
