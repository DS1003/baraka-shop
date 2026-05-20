'use client';

import React, { useState, useEffect, useRef } from 'react';
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
    Image as ImageIcon,
    Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { getAdminBrands, deleteBrand, upsertBrand } from '@/lib/actions/admin-actions';

export default function BrandsPage() {
    const [brands, setBrands] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    // Upload Logo States
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setMounted(true);
        loadBrands();
    }, []);

    useEffect(() => {
        if (editingBrand) {
            setLogoUrl(editingBrand.image || null);
        } else {
            setLogoUrl(null);
        }
    }, [editingBrand]);

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

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingBrand(null);
        setLogoUrl(null);
    };

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

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const fd = new FormData();
            fd.append('files', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: fd,
            });
            const data = await res.json();

            if (data.urls && data.urls.length > 0) {
                setLogoUrl(data.urls[0]);
            } else {
                alert(data.error || "Erreur lors de l'upload.");
            }
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'upload du logo.");
        } finally {
            setIsUploading(false);
            if (e.target) e.target.value = '';
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
            image: logoUrl,
        };

        const res = await upsertBrand(data, editingBrand?.id);
        if (res.success) {
            handleCloseModal();
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
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                        Gestion des <span className="text-primary tracking-tighter italic font-serif">Marques.</span>
                    </h1>
                    <p className="text-[13px] text-slate-500 font-medium">
                        Administrez les partenaires et marques de votre catalogue premium.
                    </p>
                </div>

                <button
                    onClick={() => { setEditingBrand(null); setLogoUrl(null); setIsModalOpen(true); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#1B1F3B] text-white rounded-lg font-bold text-[12px] hover:bg-primary hover:shadow-xl transition-all shadow-lg group"
                >
                    <Plus size={16} />
                    <span>Nouvelle Marque</span>
                </button>
            </div>

            {/* Tools Bar */}
            <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="relative flex-1 w-full max-w-xl group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-primary transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Rechercher une marque..."
                        className="w-full pl-11 pr-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-medium focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
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
                            whileHover={{ y: -4, boxShadow: "0 15px 30px -15px rgba(0,0,0,0.06)" }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white p-6 rounded-2xl border border-slate-200/50 shadow-sm transition-all group overflow-hidden relative min-h-[200px] flex flex-col justify-between"
                        >
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center border bg-slate-50 text-slate-400 transition-all duration-500 group-hover:scale-110 group-hover:bg-primary/5 group-hover:text-primary">
                                    {brand.image ? (
                                        <img src={brand.image} alt={brand.name} className="w-full h-full object-contain p-1.5" />
                                    ) : (
                                        <Briefcase size={22} strokeWidth={2.5} />
                                    )}
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === brand.id ? null : brand.id); }}
                                        className={cn(
                                            "w-9 h-9 flex items-center justify-center rounded-lg transition-all border",
                                            activeMenuId === brand.id
                                                ? "bg-white text-slate-900 border-slate-200 shadow-sm"
                                                : "bg-slate-50 text-slate-400 border-transparent hover:bg-white hover:text-slate-900 hover:border-slate-200"
                                        )}
                                    >
                                        <MoreVertical size={16} />
                                    </button>
                                    {activeMenuId === brand.id && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                                            <div className="absolute right-0 top-full mt-2 w-36 z-20 animate-in fade-in slide-in-from-top-1 duration-150">
                                                <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-1">
                                                    <button
                                                        onClick={() => { setActiveMenuId(null); setEditingBrand(brand); setIsModalOpen(true); }}
                                                        className="w-full text-left p-2.5 rounded-lg text-[12px] font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors flex items-center gap-2"
                                                    >
                                                        <Edit size={14} /> Modifier
                                                    </button>
                                                    <button
                                                        onClick={() => { setActiveMenuId(null); handleDelete(brand.id); }}
                                                        className="w-full text-left p-2.5 rounded-lg text-[12px] font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2"
                                                    >
                                                        <Trash2 size={14} /> Supprimer
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
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
                        onClick={() => { setEditingBrand(null); setLogoUrl(null); setIsModalOpen(true); }}
                        className="border-2 border-dashed border-slate-200/60 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 group hover:border-primary/20 hover:bg-primary/5 transition-all text-slate-400 hover:text-primary"
                    >
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg border border-slate-100 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                            <Plus size={24} strokeWidth={2.5} />
                        </div>
                        <div className="text-center">
                            <span className="block text-[11px] font-bold uppercase tracking-widest">Ajouter</span>
                            <span className="text-[10px] font-medium text-slate-400 mt-0.5">Marque Partner</span>
                        </div>
                    </button>
                </div>
            )}

            {/* Modal */}
            {mounted && createPortal(
                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden">
                                <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                    <h3 className="text-[18px] font-bold text-slate-900">{editingBrand ? 'Modifier' : 'Nouvelle'} Marque</h3>
                                    <button onClick={handleCloseModal} className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100/50 text-slate-400 hover:text-rose-500 transition-colors">
                                        <X size={18} />
                                    </button>
                                </div>
                                <form onSubmit={handleUpsert} className="p-6 space-y-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Nom de la Marque</label>
                                        <input
                                            name="name"
                                            defaultValue={editingBrand?.name}
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/5 transition-all font-bold text-[14px]"
                                            placeholder="Ex: Apple, Samsung, etc."
                                        />
                                    </div>
                                    
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Logo de la Marque</label>
                                        
                                        {logoUrl ? (
                                            <div className="relative group/logo border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center p-4 h-32">
                                                <img src={logoUrl} alt="Logo Preview" className="h-full object-contain" />
                                                <button
                                                    type="button"
                                                    onClick={() => setLogoUrl(null)}
                                                    className="absolute top-2 right-2 w-7 h-7 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover/logo:opacity-100 transition-all scale-75 group-hover/logo:scale-100"
                                                >
                                                    <X size={14} strokeWidth={3} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className={cn(
                                                    "border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/20 hover:bg-slate-50 transition-all min-h-[128px] text-slate-400",
                                                    isUploading && "pointer-events-none opacity-60"
                                                )}
                                            >
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                                                    className="hidden"
                                                    onChange={handleLogoUpload}
                                                />
                                                {isUploading ? (
                                                    <>
                                                        <Loader2 size={24} className="animate-spin text-primary" />
                                                        <span className="text-[11px] font-bold text-slate-500">Upload en cours...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload size={24} />
                                                        <div className="text-center">
                                                            <span className="block text-[11px] font-bold uppercase tracking-widest">Sélectionner un logo</span>
                                                            <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WebP • Max 5 MB</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button type="button" onClick={handleCloseModal} className="flex-1 py-3.5 border border-slate-200 rounded-xl font-bold text-[12px] text-slate-500 hover:bg-slate-50 transition-all">Annuler</button>
                                        <button type="submit" disabled={isSaving || isUploading} className="flex-[2] py-3.5 bg-[#1B1F3B] text-white rounded-xl font-bold text-[12px] flex items-center justify-center gap-2 hover:bg-primary shadow-lg transition-all disabled:opacity-75">
                                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                            {editingBrand ? 'Sauvegarder' : 'Créer'}
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
