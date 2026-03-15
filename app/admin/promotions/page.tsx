'use client';

import React, { useState, useEffect } from 'react';
import {
    Zap,
    Search,
    Plus,
    Trash2,
    Calendar,
    ArrowRight,
    ArrowLeft,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    Percent,
    X,
    Settings,
    Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
    getAdminPromotions,
    createPromotion,
    deletePromotion,
    getPromotionProducts,
    searchProductsForPromo,
    addProductToPromo,
    removeProductFromPromo
} from '@/lib/actions/admin-actions';

export default function PromotionsCampaignsPage() {
    const [view, setView] = useState<'list' | 'detail'>('list');
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Detail View State
    const [currentCampaign, setCurrentCampaign] = useState<any>(null);
    const [campaignProducts, setCampaignProducts] = useState<any[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    // Create Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Product Search State (inside detail view)
    const [productSearch, setProductSearch] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (view === 'list') {
            loadCampaigns();
        }
    }, [view, searchQuery]);

    const loadCampaigns = async () => {
        setLoading(true);
        try {
            const data = await getAdminPromotions(searchQuery);
            setCampaigns(data);
        } catch (error) {
            toast.error("Erreur lors du chargement des campagnes.");
        } finally {
            setLoading(false);
        }
    };

    const loadCampaignProducts = async (campId: string) => {
        setLoadingProducts(true);
        try {
            const prods = await getPromotionProducts(campId);
            setCampaignProducts(prods);
        } catch (e) {
            toast.error("Erreur chargement produits.");
        } finally {
            setLoadingProducts(false);
        }
    };

    const handleOpenDetail = (camp: any) => {
        setCurrentCampaign(camp);
        setView('detail');
        loadCampaignProducts(camp.id);
    };

    const handleCreateCampaign = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);

        const data = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            startDate: new Date(formData.get('startDate') as string),
            endDate: new Date(formData.get('endDate') as string),
            discountPercentage: parseFloat(formData.get('discount') as string)
        };

        if (data.startDate >= data.endDate) {
            toast.error("La date de fin doit être après la date de début.");
            setIsSubmitting(false);
            return;
        }

        try {
            const res = await createPromotion(data);
            if (res.success) {
                toast.success('Campagne créée avec succès !');
                setIsCreateModalOpen(false);
                loadCampaigns();
            } else {
                toast.error(res.message);
            }
        } catch (err) {
            toast.error("Erreur inattendue.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCampaign = async (id: string, name: string) => {
        if (confirm(`Supprimer la campagne "${name}" et restaurer les prix originaux de tous ses produits ?`)) {
            try {
                const res = await deletePromotion(id);
                if (res.success) {
                    toast.success("Campagne supprimée !");
                    loadCampaigns();
                } else {
                    toast.error(res.message);
                }
            } catch (err) {
                toast.error("Erreur de suppression.");
            }
        }
    };

    // Product Assignment
    const handleSearchProduct = async (query: string) => {
        setProductSearch(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const results = await searchProductsForPromo(query);
            setSearchResults(results);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddProduct = async (productId: string) => {
        if (!currentCampaign) return;
        try {
            const res = await addProductToPromo(productId, currentCampaign.id);
            if (res.success) {
                toast.success("Produit ajouté à la campagne !");
                setProductSearch('');
                setSearchResults([]);
                loadCampaignProducts(currentCampaign.id);
            } else {
                toast.error(res.message);
            }
        } catch (e) {
            toast.error("Erreur lors de l'ajout.");
        }
    };

    const handleRemoveProduct = async (productId: string) => {
        try {
            const res = await removeProductFromPromo(productId);
            if (res.success) {
                toast.success("Produit retiré. Prix restauré.");
                loadCampaignProducts(currentCampaign.id);
            } else {
                toast.error(res.message);
            }
        } catch (e) {
            toast.error("Erreur lors du retrait.");
        }
    };

    const getCampaignStatus = (start: Date, end: Date) => {
        const now = new Date();
        const s = new Date(start);
        const e = new Date(end);

        if (now < s) return { label: 'Programmée', color: 'text-blue-600 bg-blue-50 border-blue-100', icon: Clock };
        if (now > e) return { label: 'Terminée', color: 'text-slate-500 bg-slate-100 border-slate-200', icon: XCircle };
        return { label: 'En Cours', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: CheckCircle2 };
    };

    return (
        <div className="space-y-8">
            {/* Main Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-200/40">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                        {view === 'detail' && (
                            <button onClick={() => setView('list')} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                <ArrowLeft size={24} className="text-slate-500" />
                            </button>
                        )}
                        <h1 className="text-[36px] font-bold text-slate-900 tracking-tight leading-tight flex items-center gap-3">
                            {view === 'list' ? (
                                <>Campagnes <span className="text-orange-600">Promo.</span> <Zap size={32} className="text-orange-500 fill-orange-500" /></>
                            ) : (
                                <>{currentCampaign?.name}</>
                            )}
                        </h1>
                    </div>
                    <p className="text-[15px] text-slate-500 font-medium ml-1">
                        {view === 'list'
                            ? "Créez et gérez vos événements promotionnels planifiés."
                            : "Gérez les produits affectés à cette campagne globale."}
                    </p>
                </div>

                {view === 'list' && (
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-[13px] hover:bg-slate-800 hover:shadow-xl transition-all shadow-lg"
                        >
                            <Calendar size={18} />
                            <span>Nouvelle Campagne</span>
                        </button>
                    </div>
                )}
            </div>

            {/* List View */}
            {view === 'list' && (
                <div className="space-y-6">
                    {/* Search Bar */}
                    <div className="relative w-full max-w-xl group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-orange-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher une campagne..."
                            className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all shadow-sm placeholder:text-slate-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Campaigns Grid */}
                    {loading ? (
                        <div className="h-[300px] flex items-center justify-center text-slate-400">
                            <Loader2 className="animate-spin text-orange-600 mb-2" size={32} />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {campaigns.map((camp) => {
                                const status = getCampaignStatus(camp.startDate, camp.endDate);
                                const StatusIcon = status.icon;

                                return (
                                    <div key={camp.id} className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border", status.color)}>
                                                    <StatusIcon size={12} />
                                                    {status.label}
                                                </div>
                                                <div className="flex items-center gap-1 bg-orange-50 text-orange-600 px-3 py-1 rounded-lg text-[13px] font-black border border-orange-100">
                                                    <Percent size={14} />
                                                    {camp.discountPercentage}%
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-1">{camp.name}</h3>
                                            <p className="text-slate-500 text-[13px] line-clamp-2 mb-6 min-h-[40px]">
                                                {camp.description || "Aucune description fournie pour cette campagne."}
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[12px] font-medium text-slate-600">
                                                <div>
                                                    <span className="block text-[10px] text-slate-400 font-bold uppercase mb-0.5">Début</span>
                                                    {new Date(camp.startDate).toLocaleDateString('fr-FR')}
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] text-slate-400 font-bold uppercase mb-0.5">Fin</span>
                                                    {new Date(camp.endDate).toLocaleDateString('fr-FR')}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-2">
                                                <div className="flex items-center gap-1.5 text-slate-500 text-[13px] font-bold">
                                                    <Tag size={16} />
                                                    {camp._count?.products || 0} produits
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleDeleteCampaign(camp.id, camp.name)}
                                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenDetail(camp)}
                                                        className="px-4 py-2 bg-slate-900 text-white rounded-lg text-[13px] font-bold hover:bg-orange-600 transition-colors"
                                                    >
                                                        Gérer
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {campaigns.length === 0 && (
                                <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-20 bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
                                    <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
                                    <h3 className="text-lg font-bold text-slate-700 mb-1">Aucune campagne trouvée</h3>
                                    <p className="text-slate-500 text-[14px]">Commencez par créer votre première campagne de promotion.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Detail View */}
            {view === 'detail' && currentCampaign && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left col - Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm">
                            <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                                <Settings size={18} className="text-slate-400" />
                                Configuration
                            </h3>

                            <div className="space-y-5">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Réduction Globale</label>
                                    <div className="text-3xl font-black text-orange-600">
                                        -{currentCampaign.discountPercentage}%
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Début</label>
                                        <div className="font-bold text-slate-700 text-[14px]">{new Date(currentCampaign.startDate).toLocaleDateString('fr-FR')}</div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Fin</label>
                                        <div className="font-bold text-slate-700 text-[14px]">{new Date(currentCampaign.endDate).toLocaleDateString('fr-FR')}</div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Description</label>
                                    <p className="text-[13px] text-slate-500">{currentCampaign.description || 'Aucune description.'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Search & Add Product */}
                        <div className="bg-slate-900 rounded-[24px] p-6 shadow-xl text-white">
                            <h3 className="font-bold text-white text-lg mb-2">Ajouter un produit</h3>
                            <p className="text-slate-400 text-[13px] mb-4">La remise de {currentCampaign.discountPercentage}% s'appliquera automatiquement.</p>

                            <div className="relative mb-4">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input
                                    type="text"
                                    placeholder="Chercher dans le catalogue..."
                                    value={productSearch}
                                    onChange={(e) => handleSearchProduct(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-[13px] text-white placeholder:text-slate-500"
                                />
                                {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-500 animate-spin" size={16} />}
                            </div>

                            {searchResults.length > 0 && (
                                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin">
                                    {searchResults.map(prod => (
                                        <div key={prod.id} className="bg-slate-800 rounded-xl p-3 flex flex-col gap-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-lg overflow-hidden flex-shrink-0">
                                                    {prod.images?.[0] ? <img src={prod.images[0]} className="w-full h-full object-cover" /> : null}
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-bold text-white leading-tight mb-0.5">{prod.name}</p>
                                                    <p className="text-[11px] text-slate-400">{prod.price.toLocaleString()} CFA</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleAddProduct(prod.id)}
                                                className="w-full py-2 bg-slate-700 hover:bg-orange-600 text-white rounded-lg text-[12px] font-bold transition-colors flex justify-center items-center gap-2"
                                            >
                                                <Plus size={14} /> Ajouter
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right col - Products list */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-[24px] border border-slate-200/50 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="font-bold text-slate-900">Produits en promotion ({campaignProducts.length})</h3>
                            </div>

                            {loadingProducts ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <Loader2 className="animate-spin text-slate-300" size={32} />
                                </div>
                            ) : campaignProducts.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                                    <Tag size={48} className="text-slate-200 mb-4" />
                                    <p className="text-slate-500 font-bold mb-1">Aucun produit dans cette campagne</p>
                                    <p className="text-slate-400 text-[13px]">Utilisez la barre de recherche à gauche pour en ajouter.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr>
                                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Produit</th>
                                                <th className="px-4 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Ancien Prix</th>
                                                <th className="px-4 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Prix Soldé</th>
                                                <th className="px-4 py-4 border-b border-slate-100"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {campaignProducts.map(p => (
                                                <tr key={p.id} className="hover:bg-slate-50/50 group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 overflow-hidden flex-shrink-0">
                                                                {p.images?.[0] && <img src={p.images[0]} className="w-full h-full object-cover" />}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-[13px] font-bold text-slate-900 truncate">{p.name}</p>
                                                                <p className="text-[11px] text-slate-500 uppercase">{p.brand?.name || 'Sans marque'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <span className="text-[13px] text-slate-400 line-through font-medium">
                                                            {p.oldPrice?.toLocaleString()} F
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <span className="text-[14px] font-black text-orange-600">
                                                            {p.price.toLocaleString()} F
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <button
                                                            onClick={() => handleRemoveProduct(p.id)}
                                                            className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                            title="Retirer de la campagne"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Create Campaign Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCreateModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
                        >
                            <form onSubmit={handleCreateCampaign}>
                                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">Nouvelle Campagne</h2>
                                        <p className="text-[13px] text-slate-500 mt-1">Définissez les règles de votre événement.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-200/50 rounded-xl transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="p-8 space-y-5 flex-1">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Nom de la campagne</label>
                                        <input
                                            name="name"
                                            required
                                            type="text"
                                            placeholder="Ex: Black Friday 2026"
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 font-bold text-[14px] transition-colors"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Date de début</label>
                                            <input
                                                name="startDate"
                                                required
                                                type="date"
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 font-medium text-[14px] transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Date de fin</label>
                                            <input
                                                name="endDate"
                                                required
                                                type="date"
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 font-medium text-[14px] transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                            Réduction (%) <Percent size={12} className="text-orange-500" />
                                        </label>
                                        <input
                                            name="discount"
                                            required
                                            type="number"
                                            min="1"
                                            max="99"
                                            placeholder="Ex: 20"
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-black text-orange-600 text-[15px] transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Description (optionnel)</label>
                                        <textarea
                                            name="description"
                                            rows={2}
                                            placeholder="Détails de l'événement..."
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 font-medium text-[13px] transition-colors resize-none"
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="px-5 py-2.5 text-slate-600 font-bold text-[13px] hover:bg-slate-200/50 rounded-xl transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-[13px] hover:bg-orange-600 transition-all shadow-md flex items-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Calendar size={16} />}
                                        Programmer
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
