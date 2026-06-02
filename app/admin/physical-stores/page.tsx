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
    MapPin,
    CloudUpload,
    MoreVertical,
    X,
    Phone,
    Clock,
    Globe,
    CheckCircle2,
    Eye,
    EyeOff,
    GripVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, slugify } from '@/lib/utils';
import { uploadToCloudinaryAction } from '@/lib/actions/media-actions';
import { toast } from 'sonner';

export default function PhysicalStoresPage() {
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
            const res = await fetch('/api/admin/physical-stores');
            const data = await res.json();
            setItems(data.stores || []);
            setStats(data.stats || { total: 0, published: 0 });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm("Supprimer cette boutique physique ?")) {
            const res = await fetch('/api/admin/physical-stores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', id })
            });
            const data = await res.json();
            if (data.success) {
                setItems(prev => prev.filter(c => c.id !== id));
                toast.success('Boutique supprimée');
            } else {
                toast.error(data.message);
            }
        }
    };

    const handleTogglePublish = async (item: any) => {
        const res = await fetch('/api/admin/physical-stores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'upsert',
                id: item.id,
                data: { ...item, isPublished: !item.isPublished }
            })
        });
        const data = await res.json();
        if (data.success) {
            setItems(prev => prev.map(i => i.id === item.id ? { ...i, isPublished: !i.isPublished } : i));
            toast.success(item.isPublished ? 'Boutique masquée' : 'Boutique publiée');
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
            const imgFormData = new FormData();
            imgFormData.append('file', imageFile);
            const res = await uploadToCloudinaryAction(imgFormData);
            if (res.success && res.media?.url) imageUrl = res.media.url;
            setIsUploading(false);
        }

        const name = formData.get('name') as string;
        const storeData = {
            name,
            slug: slugify(name),
            image: imageUrl,
            description: formData.get('description') as string,
            address: formData.get('address') as string,
            phone: formData.get('phone') as string,
            hours: formData.get('hours') as string,
            type: formData.get('type') as string,
            city: formData.get('city') as string,
            mapUrl: formData.get('mapUrl') as string,
            isClickCollect: formData.get('isClickCollect') === 'on',
            isSav: formData.get('isSav') === 'on',
            isPublished: formData.get('isPublished') === 'on',
            order: parseInt(formData.get('order') as string) || 0,
        };

        const res = await fetch('/api/admin/physical-stores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'upsert',
                id: editingItem?.id || undefined,
                data: storeData
            })
        });
        const result = await res.json();
        if (result.success) {
            toast.success(editingItem ? 'Boutique modifiée' : 'Boutique créée');
            setIsModalOpen(false);
            setEditingItem(null);
            setPreviewImage(null);
            loadItems();
        } else {
            toast.error(result.message || "Erreur lors de la sauvegarde.");
        }
        setIsSaving(false);
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.city || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-12 pb-20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-2 border-b border-slate-200/40">
                <div className="space-y-1.5">
                    <h1 className="text-[36px] font-bold text-slate-900 leading-tight">
                        <span className="text-orange-600 italic font-serif">Boutiques Physiques.</span>
                    </h1>
                    <p className="text-[15px] text-slate-500 font-medium">
                        Gérez vos points de vente physiques Baraka Shop (Plateau, Sea Plaza, Almadies, etc.).
                    </p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            setEditingItem(null);
                            setPreviewImage(null);
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-3 px-6 py-3 bg-[#1B1F3B] text-white rounded-xl font-bold text-[13px] hover:bg-orange-600 hover:shadow-xl transition-all shadow-lg group"
                    >
                        <Plus size={20} />
                        <span>Nouvelle Boutique</span>
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                            <MapPin size={22} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">BOUTIQUES TOTAL</p>
                            <p className="text-[28px] font-black text-slate-900 leading-none mt-1">{stats.total}</p>
                        </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Eye size={22} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PUBLIÉES</p>
                            <p className="text-[28px] font-black text-slate-900 leading-none mt-1">{stats.published}</p>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Chercher une boutique..."
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all text-[13px] font-medium"
                />
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                </div>
            )}

            {/* Stores Grid */}
            {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredItems.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "bg-white rounded-[24px] border shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300 relative",
                                item.isPublished ? "border-slate-200/60" : "border-dashed border-slate-300 opacity-70"
                            )}
                        >
                            {/* Image */}
                            <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <MapPin className="w-12 h-12 text-slate-200" strokeWidth={1} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                                {/* Badges */}
                                <div className="absolute top-4 left-4 flex gap-2">
                                    {item.type && (
                                        <span className="bg-orange-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                                            {item.type}
                                        </span>
                                    )}
                                    {!item.isPublished && (
                                        <span className="bg-slate-800 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                                            Masquée
                                        </span>
                                    )}
                                </div>

                                {/* Menu */}
                                <div className="absolute top-4 right-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveMenuId(activeMenuId === item.id ? null : item.id);
                                        }}
                                        className="w-8 h-8 bg-white/90 backdrop-blur rounded-lg flex items-center justify-center text-slate-600 hover:text-orange-600 transition-colors shadow-sm"
                                    >
                                        <MoreVertical size={16} />
                                    </button>
                                    <AnimatePresence>
                                        {activeMenuId === item.id && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9, y: -5 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9, y: -5 }}
                                                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 z-50"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <button
                                                    onClick={() => {
                                                        setEditingItem(item);
                                                        setPreviewImage(item.image);
                                                        setIsModalOpen(true);
                                                        setActiveMenuId(null);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                                                >
                                                    <Edit size={14} /> Modifier
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        handleTogglePublish(item);
                                                        setActiveMenuId(null);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                                                >
                                                    {item.isPublished ? <><EyeOff size={14} /> Masquer</> : <><Eye size={14} /> Publier</>}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        handleDelete(item.id);
                                                        setActiveMenuId(null);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold text-rose-500 hover:bg-rose-50 transition-colors"
                                                >
                                                    <Trash2 size={14} /> Supprimer
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4">
                                {item.city && (
                                    <span className="text-[9px] font-black text-orange-600 uppercase tracking-[0.15em]">{item.city}</span>
                                )}
                                <h3 className="text-[16px] font-black text-slate-900 leading-tight">{item.name}</h3>

                                {item.address && (
                                    <div className="flex items-start gap-2 text-[12px] text-slate-500 font-medium">
                                        <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                                        <span className="line-clamp-2">{item.address}</span>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-4 text-[11px] font-bold text-slate-700">
                                    {item.phone && (
                                        <div className="flex items-center gap-1.5">
                                            <Phone size={12} className="text-orange-500" /> {item.phone}
                                        </div>
                                    )}
                                    {item.hours && (
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={12} className="text-orange-500" /> {item.hours}
                                        </div>
                                    )}
                                </div>

                                {/* Features */}
                                <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
                                    {item.isClickCollect && (
                                        <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 uppercase tracking-wider">
                                            <CheckCircle2 size={12} /> Click & Collect
                                        </span>
                                    )}
                                    {item.isSav && (
                                        <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 uppercase tracking-wider">
                                            <CheckCircle2 size={12} /> S.A.V
                                        </span>
                                    )}
                                    {item.mapUrl && (
                                        <a href={item.mapUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[9px] font-black text-blue-600 uppercase tracking-wider hover:underline">
                                            <Globe size={12} /> Maps
                                        </a>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Add Card */}
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => {
                            setEditingItem(null);
                            setPreviewImage(null);
                            setIsModalOpen(true);
                        }}
                        className="bg-white/60 border-2 border-dashed border-slate-200 rounded-[24px] min-h-[320px] flex flex-col items-center justify-center gap-3 hover:border-orange-300 hover:bg-orange-50/30 transition-all group"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 group-hover:bg-orange-100 flex items-center justify-center transition-colors">
                            <Plus size={24} className="text-slate-400 group-hover:text-orange-600" />
                        </div>
                        <div className="text-center">
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">NOUVELLE</p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Boutique Physique</p>
                        </div>
                    </motion.button>
                </div>
            )}

            {/* Modal */}
            {mounted && isModalOpen && createPortal(
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="bg-white rounded-[28px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
                                <div>
                                    <h2 className="text-[18px] font-black text-slate-900">
                                        {editingItem ? 'Modifier la boutique' : 'Nouvelle boutique physique'}
                                    </h2>
                                    <p className="text-[12px] text-slate-400 font-medium mt-0.5">
                                        Point de vente Baraka Shop
                                    </p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleUpsert} className="p-8 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                                {/* Name */}
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom de la boutique *</label>
                                    <input
                                        name="name"
                                        required
                                        defaultValue={editingItem?.name}
                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all text-[14px] font-bold"
                                        placeholder="Ex: Baraka Shop - Plateau"
                                    />
                                </div>

                                {/* Type + City */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Type de boutique</label>
                                        <input
                                            name="type"
                                            defaultValue={editingItem?.type}
                                            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all text-[14px] font-medium"
                                            placeholder="Ex: Flagship Store"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Ville / Quartier</label>
                                        <input
                                            name="city"
                                            defaultValue={editingItem?.city}
                                            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all text-[14px] font-medium"
                                            placeholder="Ex: Dakar Plateau"
                                        />
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Adresse complète</label>
                                    <input
                                        name="address"
                                        defaultValue={editingItem?.address}
                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all text-[14px] font-medium"
                                        placeholder="Ex: Avenue Lamine Gueye x Rue Sandiniery, Dakar"
                                    />
                                </div>

                                {/* Phone + Hours */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Téléphone</label>
                                        <input
                                            name="phone"
                                            defaultValue={editingItem?.phone}
                                            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all text-[14px] font-medium"
                                            placeholder="Ex: +221 33 821 44 44"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Horaires</label>
                                        <input
                                            name="hours"
                                            defaultValue={editingItem?.hours}
                                            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all text-[14px] font-medium"
                                            placeholder="Ex: Lun-Sam: 09:00 - 19:30"
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                                    <textarea
                                        name="description"
                                        defaultValue={editingItem?.description}
                                        rows={2}
                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all text-[14px] font-medium resize-none"
                                        placeholder="Courte description..."
                                    />
                                </div>

                                {/* Google Maps + Order */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Lien Google Maps</label>
                                        <input
                                            name="mapUrl"
                                            defaultValue={editingItem?.mapUrl}
                                            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all text-[14px] font-medium"
                                            placeholder="https://maps.app.goo.gl/..."
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Ordre d'affichage</label>
                                        <input
                                            name="order"
                                            type="number"
                                            defaultValue={editingItem?.order || 0}
                                            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all text-[14px] font-medium"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                {/* Image Upload */}
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Photo de la boutique</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            name="imageFile"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) setPreviewImage(URL.createObjectURL(file));
                                            }}
                                            className="hidden"
                                            id="imageUpload"
                                        />
                                        <label
                                            htmlFor="imageUpload"
                                            className={cn(
                                                "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all",
                                                previewImage ? "border-orange-300 bg-orange-50/30" : "border-slate-200 hover:border-orange-300 hover:bg-orange-50/10"
                                            )}
                                        >
                                            {previewImage ? (
                                                <img src={previewImage} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 text-slate-400">
                                                    <CloudUpload size={28} />
                                                    <span className="text-[11px] font-bold">Cliquez pour ajouter une photo</span>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>

                                {/* Checkboxes */}
                                <div className="flex flex-wrap gap-6 pt-2 border-t border-slate-100">
                                    <label className="flex items-center gap-2.5 cursor-pointer">
                                        <input type="checkbox" name="isClickCollect" defaultChecked={editingItem?.isClickCollect} className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                                        <span className="text-[13px] font-bold text-slate-700">Click & Collect</span>
                                    </label>
                                    <label className="flex items-center gap-2.5 cursor-pointer">
                                        <input type="checkbox" name="isSav" defaultChecked={editingItem?.isSav} className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                                        <span className="text-[13px] font-bold text-slate-700">S.A.V Officiel</span>
                                    </label>
                                    <label className="flex items-center gap-2.5 cursor-pointer">
                                        <input type="checkbox" name="isPublished" defaultChecked={editingItem?.isPublished ?? true} className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                                        <span className="text-[13px] font-bold text-slate-700">Publié sur le site</span>
                                    </label>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full flex items-center justify-center gap-3 py-4 bg-[#1B1F3B] text-white rounded-2xl font-black text-[13px] uppercase tracking-widest hover:bg-orange-600 transition-all disabled:opacity-50 shadow-lg"
                                >
                                    {isSaving ? (
                                        <><Loader2 size={16} className="animate-spin" /> {isUploading ? 'Upload en cours...' : 'Sauvegarde...'}</>
                                    ) : (
                                        <><Save size={16} /> {editingItem ? 'Mettre à jour' : 'Créer la boutique'}</>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
