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
    Tag,
    Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
    getCampaigns,
    createCampaign,
    deleteCampaign,
    toggleCampaignActive,
    getCampaignById
} from '@/lib/actions/campaign-actions';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function MarketingCampaignsPage() {
    const [view, setView] = useState<'list' | 'detail'>('list');
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Detail View State
    const [currentCampaign, setCurrentCampaign] = useState<any>(null);

    // Create Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (view === 'list') {
            loadCampaigns();
        }
    }, [view, searchQuery]);

    const loadCampaigns = async () => {
        setLoading(true);
        try {
            const data = await getCampaigns(searchQuery);
            setCampaigns(data);
        } catch (error) {
            toast.error("Erreur lors du chargement des campagnes.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDetail = async (camp: any) => {
        setCurrentCampaign(camp);
        setView('detail');
        const fullData = await getCampaignById(camp.id);
        if (fullData) {
            setCurrentCampaign(fullData);
        }
    };

    const handleToggleActive = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            const res = await toggleCampaignActive(id);
            if (res.success) {
                setCampaigns(prev => prev.map(c => c.id === id ? { ...c, isActive: res.isActive } : c));
                toast.success(res.isActive ? "Campagne activée" : "Campagne désactivée");
            } else {
                toast.error(res.message || "Erreur de modification");
            }
        } catch {
            toast.error("Erreur réseau.");
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm("Voulez-vous vraiment supprimer cette campagne ?")) return;
        try {
            const res = await deleteCampaign(id);
            if (res.success) {
                setCampaigns(prev => prev.filter(c => c.id !== id));
                toast.success("Campagne supprimée");
                if (view === 'detail' && currentCampaign?.id === id) {
                    setView('list');
                }
            } else {
                toast.error(res.message || "Erreur de suppression");
            }
        } catch {
            toast.error("Erreur réseau.");
        }
    };

    const handleCreateCampaign = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);

        const data = {
            name: formData.get('name') as string,
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            discountType: formData.get('discountType') as string,
            discountValue: parseFloat(formData.get('discountValue') as string),
            couponCode: formData.get('couponCode') as string,
            startDate: new Date(formData.get('startDate') as string),
            endDate: new Date(formData.get('endDate') as string),
            isActive: formData.get('isActive') === 'on',
            showPopup: formData.get('showPopup') === 'on',
            popupTitle: formData.get('popupTitle') as string,
            popupDescription: formData.get('popupDescription') as string,
            popupImage: formData.get('popupImage') as string,
            ctaText: (formData.get('ctaText') as string) || "Profiter de l'offre",
            ctaLink: (formData.get('ctaLink') as string) || "/boutique",
            firstPurchaseOnly: formData.get('firstPurchaseOnly') === 'on',
            minimumOrderAmount: formData.get('minimumOrderAmount') ? parseFloat(formData.get('minimumOrderAmount') as string) : undefined,
        };

        try {
            const res = await createCampaign(data);
            if (res.success) {
                toast.success("Campagne créée avec succès !");
                setIsCreateModalOpen(false);
                loadCampaigns();
            } else {
                toast.error(res.message || "Erreur création.");
            }
        } catch (error) {
            toast.error("Erreur inattendue.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#f8f9fb]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-[#1B1F3B] uppercase tracking-tight flex items-center gap-3">
                        <Tag className="w-8 h-8 text-primary" />
                        Campagnes Marketing
                    </h1>
                    <p className="text-sm text-gray-500 font-medium mt-1">Gérez vos codes promo, popups de bienvenue et offres spéciales</p>
                </div>
                {view === 'list' && (
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="h-12 px-6 bg-[#1B1F3B] hover:bg-primary text-white rounded-xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-[#1B1F3B]/20 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Nouvelle Campagne
                    </button>
                )}
            </div>

            {/* Content area */}
            <div className="flex-1 min-h-0 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col relative">
                
                {/* List View */}
                <AnimatePresence mode="wait">
                    {view === 'list' && (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex-1 flex flex-col p-6 h-full"
                        >
                            <div className="relative mb-6">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher par nom, code promo..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl pl-11 pr-4 text-sm font-medium outline-none focus:bg-white focus:border-primary transition-all"
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center h-40 gap-3">
                                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Chargement...</span>
                                    </div>
                                ) : campaigns.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-40 gap-3 text-gray-400">
                                        <Tag className="w-10 h-10 opacity-20" />
                                        <span className="text-xs font-bold">Aucune campagne trouvée.</span>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {campaigns.map(camp => (
                                            <div
                                                key={camp.id}
                                                onClick={() => handleOpenDetail(camp)}
                                                className="group p-5 bg-white border border-gray-100 rounded-2xl hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer flex flex-col gap-4 relative overflow-hidden"
                                            >
                                                {/* Header card */}
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn(
                                                            "w-2 h-2 rounded-full",
                                                            camp.isActive ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-gray-300"
                                                        )} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                            {camp.isActive ? 'Active' : 'Inactif'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={(e) => handleToggleActive(e, camp.id)}
                                                            className="p-1.5 text-gray-400 hover:text-primary transition-colors"
                                                            title="Activer/Désactiver"
                                                        >
                                                            {camp.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleDelete(e, camp.id)}
                                                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="text-base font-black text-[#1B1F3B] uppercase tracking-tight mb-1 truncate group-hover:text-primary transition-colors">
                                                        {camp.name}
                                                    </h3>
                                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary">
                                                        <Tag className="w-3 h-3" /> {camp.couponCode}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 mt-2">
                                                    <div className="bg-gray-50 p-3 rounded-xl flex flex-col gap-1">
                                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Réduction</span>
                                                        <span className="text-sm font-black text-[#1B1F3B]">
                                                            {camp.discountType === 'PERCENTAGE' ? `${camp.discountValue}%` : `${camp.discountValue} F`}
                                                        </span>
                                                    </div>
                                                    <div className="bg-gray-50 p-3 rounded-xl flex flex-col gap-1">
                                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Utilisations</span>
                                                        <span className="text-sm font-black text-[#1B1F3B]">{camp._count?.usages || 0}</span>
                                                    </div>
                                                </div>

                                                <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-auto">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500">
                                                        <Calendar className="w-3 h-3" />
                                                        {format(new Date(camp.endDate), 'dd MMM yyyy', { locale: fr })}
                                                    </div>
                                                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-transform group-hover:translate-x-1" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {view === 'detail' && currentCampaign && (
                        <motion.div
                            key="detail"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex-1 flex flex-col h-full bg-[#f8f9fb]"
                        >
                            {/* Detail Header */}
                            <div className="bg-white p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setView('list')}
                                        className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-primary hover:text-white transition-all"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                    </button>
                                    <div>
                                        <h2 className="text-xl font-black text-[#1B1F3B] uppercase tracking-tight">{currentCampaign.name}</h2>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-md uppercase">{currentCampaign.couponCode}</span>
                                            <span className="text-[10px] font-medium text-gray-400">Créé le {format(new Date(currentCampaign.createdAt), 'dd MMM yyyy', { locale: fr })}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => handleDelete(e, currentCampaign.id)}
                                        className="h-10 px-4 bg-red-50 text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" /> Supprimer
                                    </button>
                                </div>
                            </div>

                            {/* Detail Body */}
                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    
                                    {/* Infos Left */}
                                    <div className="lg:col-span-2 flex flex-col gap-6">
                                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                                                <Settings className="w-4 h-4" /> Configuration Générale
                                            </h3>
                                            
                                            <div className="grid grid-cols-2 gap-6 mb-6">
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Titre (Interne)</p>
                                                    <p className="font-bold text-[#1B1F3B]">{currentCampaign.title || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Description</p>
                                                    <p className="text-sm text-gray-600">{currentCampaign.description || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Type de Réduction</p>
                                                    <p className="font-bold text-[#1B1F3B]">{currentCampaign.discountType === 'PERCENTAGE' ? 'Pourcentage (%)' : 'Montant Fixe (FCFA)'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Valeur</p>
                                                    <p className="font-bold text-primary text-lg">{currentCampaign.discountValue}{currentCampaign.discountType === 'PERCENTAGE' ? '%' : ' F'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Dates</p>
                                                    <p className="text-sm font-bold text-[#1B1F3B]">
                                                        {format(new Date(currentCampaign.startDate), 'dd/MM/yyyy')} au {format(new Date(currentCampaign.endDate), 'dd/MM/yyyy')}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">1er achat uniquement</p>
                                                    <p className="font-bold text-[#1B1F3B]">{currentCampaign.firstPurchaseOnly ? 'Oui' : 'Non'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Min. Achat</p>
                                                    <p className="font-bold text-[#1B1F3B]">{currentCampaign.minimumOrderAmount ? `${currentCampaign.minimumOrderAmount} FCFA` : 'Aucun'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                                                <ImageIcon className="w-4 h-4" /> Configuration Popup
                                            </h3>
                                            
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Afficher Popup</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn("w-2 h-2 rounded-full", currentCampaign.showPopup ? "bg-green-500" : "bg-red-500")} />
                                                        <p className="font-bold text-[#1B1F3B]">{currentCampaign.showPopup ? 'Oui' : 'Non'}</p>
                                                    </div>
                                                </div>
                                                {currentCampaign.showPopup && (
                                                    <>
                                                        <div>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Titre Popup</p>
                                                            <p className="font-bold text-[#1B1F3B]">{currentCampaign.popupTitle || '-'}</p>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Description Popup</p>
                                                            <p className="text-sm text-gray-600">{currentCampaign.popupDescription || '-'}</p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Right */}
                                    <div className="flex flex-col gap-6">
                                        <div className="bg-[#1B1F3B] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                                            <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/20 blur-[40px] rounded-full pointer-events-none" />
                                            <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-6">Performances</h3>
                                            
                                            <div className="flex flex-col gap-6">
                                                <div>
                                                    <p className="text-[10px] font-bold text-white/50 uppercase mb-1">Utilisations</p>
                                                    <p className="text-4xl font-black text-white">{currentCampaign._count?.usages || 0}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex-1">
                                            <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4">Dernières Utilisations</h3>
                                            
                                            <div className="flex flex-col gap-3">
                                                {currentCampaign.usages?.length === 0 ? (
                                                    <p className="text-xs text-gray-400 text-center py-4 font-medium">Aucune utilisation pour le moment.</p>
                                                ) : (
                                                    currentCampaign.usages?.slice(0, 5).map((usage: any) => (
                                                        <div key={usage.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                            <div>
                                                                <p className="text-[10px] font-black text-gray-500 uppercase">Commande: {usage.orderId.slice(-6)}</p>
                                                                <p className="text-xs font-bold text-[#1B1F3B] mt-0.5">{format(new Date(usage.usedAt), 'dd/MM/yyyy HH:mm')}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                            onClick={() => setIsCreateModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed top-[5%] bottom-[5%] left-1/2 -translate-x-1/2 w-full max-w-3xl bg-white rounded-3xl shadow-2xl z-[101] flex flex-col overflow-hidden border border-gray-100"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0 bg-gray-50/50">
                                <h2 className="text-xl font-black uppercase tracking-tight text-[#1B1F3B] flex items-center gap-2">
                                    <Plus className="w-5 h-5 text-primary" />
                                    Créer une Campagne
                                </h2>
                                <button onClick={() => setIsCreateModalOpen(false)} className="p-2 bg-white rounded-xl text-gray-400 hover:text-[#1B1F3B] shadow-sm border border-gray-100 transition-all">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            
                            <form id="create-campaign-form" onSubmit={handleCreateCampaign} className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                                <div className="space-y-8">
                                    {/* Paramètres Généraux */}
                                    <div>
                                        <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4 border-b border-gray-100 pb-2">Informations Générales</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Nom (Interne) *</label>
                                                <input required name="name" type="text" className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:border-primary focus:bg-white transition-all outline-none" placeholder="Ex: Lancement Automne 2026" />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Titre (Public)</label>
                                                <input name="title" type="text" className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:border-primary focus:bg-white transition-all outline-none" placeholder="Titre optionnel" />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Code Promo *</label>
                                                <input required name="couponCode" type="text" className="w-full h-11 px-4 bg-primary/5 text-primary border border-primary/20 rounded-xl text-sm font-black uppercase focus:border-primary focus:bg-white transition-all outline-none" placeholder="Ex: BIENVENUE10" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Type de Réduction *</label>
                                                <select required name="discountType" className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:border-primary focus:bg-white transition-all outline-none">
                                                    <option value="PERCENTAGE">Pourcentage (%)</option>
                                                    <option value="FIXED">Montant Fixe (FCFA)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Valeur *</label>
                                                <input required name="discountValue" type="number" step="0.01" min="0" className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:border-primary focus:bg-white transition-all outline-none" placeholder="Ex: 10" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Date Début *</label>
                                                <input required name="startDate" type="datetime-local" className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:border-primary focus:bg-white transition-all outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Date Fin *</label>
                                                <input required name="endDate" type="datetime-local" className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:border-primary focus:bg-white transition-all outline-none" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Conditions */}
                                    <div>
                                        <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4 border-b border-gray-100 pb-2">Conditions</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Montant Min. Achat (FCFA)</label>
                                                <input name="minimumOrderAmount" type="number" min="0" className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:border-primary focus:bg-white transition-all outline-none" placeholder="Optionnel" />
                                            </div>
                                            <div className="flex items-center gap-3 pt-6">
                                                <input name="firstPurchaseOnly" type="checkbox" id="firstPurchaseOnly" className="w-5 h-5 rounded text-primary focus:ring-primary border-gray-300" />
                                                <label htmlFor="firstPurchaseOnly" className="text-xs font-bold text-[#1B1F3B] cursor-pointer">Nouveaux clients (1er achat) uniquement</label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Configuration Popup */}
                                    <div>
                                        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Configuration Popup (Optionnel)</h3>
                                            <div className="flex items-center gap-2">
                                                <input name="showPopup" type="checkbox" id="showPopup" defaultChecked className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300" />
                                                <label htmlFor="showPopup" className="text-[10px] font-black uppercase text-[#1B1F3B] cursor-pointer">Activer le popup</label>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 opacity-90">
                                            <div>
                                                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Titre du Popup</label>
                                                <input name="popupTitle" type="text" className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:border-primary focus:bg-white transition-all outline-none" placeholder="Ex: Offre de Lancement Exclusif !" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Description du Popup</label>
                                                <textarea name="popupDescription" rows={3} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:border-primary focus:bg-white transition-all outline-none resize-none" placeholder="Ex: Profitez de 10% sur tout le site..."></textarea>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Texte Bouton Action</label>
                                                <input name="ctaText" type="text" className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:border-primary focus:bg-white transition-all outline-none" placeholder="Ex: J'en profite" />
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </form>
                            
                            <div className="p-6 border-t border-gray-100 bg-gray-50/50 shrink-0 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <input form="create-campaign-form" name="isActive" type="checkbox" id="isActive" defaultChecked className="w-4 h-4 rounded text-green-500 focus:ring-green-500 border-gray-300" />
                                    <label htmlFor="isActive" className="text-[10px] font-black uppercase text-[#1B1F3B] cursor-pointer">Active dès la création</label>
                                </div>
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="h-11 px-6 rounded-xl font-black text-[11px] uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-all">
                                        Annuler
                                    </button>
                                    <button form="create-campaign-form" disabled={isSubmitting} type="submit" className="h-11 px-8 bg-primary text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-[#1B1F3B] transition-all flex items-center gap-2 disabled:opacity-50">
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Créer</>}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
