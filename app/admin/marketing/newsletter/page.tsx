'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Mail,
    Search,
    RefreshCw,
    CheckCircle2,
    Users,
    UserX,
    Clock,
    Trash2,
    Send,
    Download,
    Plus,
    X,
    Loader2,
    AlertCircle,
    Calendar,
    ExternalLink,
    Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    getNewsletterSubscribers,
    getNewsletterStats,
    updateNewsletterSubscriberStatus,
    deleteNewsletterSubscriber,
    getNewsletterCampaigns,
    createNewsletterCampaign,
    sendNewsletterCampaign,
} from '@/lib/actions/newsletter-actions';

interface SubscriberItem {
    id: string;
    email: string;
    status: 'ACTIVE' | 'PENDING' | 'UNSUBSCRIBED';
    source?: string | null;
    confirmedAt?: string | Date | null;
    unsubscribedAt?: string | Date | null;
    createdAt: string | Date;
}

interface CampaignItem {
    id: string;
    subject: string;
    heading: string;
    content: string;
    imageUrl?: string | null;
    ctaText?: string | null;
    ctaUrl?: string | null;
    status: string;
    recipientCount: number;
    sentCount: number;
    failedCount: number;
    sentAt?: string | Date | null;
    createdAt: string | Date;
}

export default function AdminNewsletterPage() {
    const [activeView, setActiveView] = useState<'subscribers' | 'campaigns'>('subscribers');
    const [subscribers, setSubscribers] = useState<SubscriberItem[]>([]);
    const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
    const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, unsubscribed: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'UNSUBSCRIBED'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Modal Campagne
    const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
    const [isSendingCampaign, setIsSendingCampaign] = useState(false);
    const [campaignForm, setCampaignForm] = useState({
        subject: '',
        previewText: '',
        heading: '',
        content: '',
        imageUrl: '',
        ctaText: 'Découvrir nos offres',
        ctaUrl: 'https://baraka.sn/boutique',
    });

    const loadData = useCallback(async (silent = false) => {
        if (!silent) setIsLoading(true);
        else setIsRefreshing(true);

        try {
            const [subRes, statsRes, campRes] = await Promise.all([
                getNewsletterSubscribers({
                    status: activeTab,
                    search: searchQuery,
                    page: currentPage,
                    pageSize: 30,
                }),
                getNewsletterStats(),
                getNewsletterCampaigns(),
            ]);

            setSubscribers(subRes.subscribers as SubscriberItem[]);
            setTotalPages(subRes.totalPages || 1);
            setStats(statsRes);
            setCampaigns(campRes as CampaignItem[]);
        } catch (error) {
            console.error('Erreur chargement données newsletter:', error);
            toast.error('Impossible de charger les données de la newsletter.');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [activeTab, searchQuery, currentPage]);

    // Modals de Confirmation personnalisés
    const [isConfirmSendModalOpen, setIsConfirmSendModalOpen] = useState(false);
    const [subscriberToDelete, setSubscriberToDelete] = useState<SubscriberItem | null>(null);
    const [isDeletingSubscriber, setIsDeletingSubscriber] = useState(false);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const nextStatus = currentStatus === 'ACTIVE' ? 'UNSUBSCRIBED' : 'ACTIVE';
        try {
            await updateNewsletterSubscriberStatus(id, nextStatus);
            toast.success(`Statut mis à jour : ${nextStatus === 'ACTIVE' ? 'Actif' : 'Désinscrit'}`);
            loadData(true);
        } catch {
            toast.error('Erreur lors du changement de statut');
        }
    };

    const confirmDeleteSubscriber = async () => {
        if (!subscriberToDelete) return;
        setIsDeletingSubscriber(true);
        try {
            await deleteNewsletterSubscriber(subscriberToDelete.id);
            toast.success(`Abonné "${subscriberToDelete.email}" supprimé avec succès`);
            setSubscriberToDelete(null);
            loadData(true);
        } catch {
            toast.error('Erreur lors de la suppression');
        } finally {
            setIsDeletingSubscriber(false);
        }
    };

    const handleExportCSV = () => {
        if (subscribers.length === 0) {
            toast.error('Aucun abonné à exporter');
            return;
        }

        const activeEmails = subscribers
            .filter(s => activeTab === 'ALL' || s.status === activeTab)
            .map(s => `"${s.email}","${s.status}","${new Date(s.createdAt).toISOString()}"`);

        const csvContent = 'data:text/csv;charset=utf-8,Email,Statut,Date\n' + activeEmails.join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `newsletter_baraka_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`${activeEmails.length} abonné(s) exporté(s) au format CSV !`);
    };

    const handleInitiateSendCampaign = (e: React.FormEvent) => {
        e.preventDefault();
        if (!campaignForm.subject || !campaignForm.heading || !campaignForm.content) {
            toast.error('Veuillez remplir au minimum le sujet, le titre et le contenu.');
            return;
        }

        if (stats.active === 0) {
            toast.error('Aucun abonné actif pour recevoir cette campagne.');
            return;
        }

        setIsConfirmSendModalOpen(true);
    };

    const executeSendCampaign = async () => {
        setIsSendingCampaign(true);
        try {
            // 1. Créer la campagne
            const created = await createNewsletterCampaign(campaignForm);
            if (!created.success || !created.campaign) {
                toast.error(created.error || 'Erreur lors de la création de la campagne.');
                setIsSendingCampaign(false);
                return;
            }

            // 2. Envoyer la campagne
            toast.info(`Diffusion en cours vers ${stats.active} abonné(s)...`);
            const sendRes = await sendNewsletterCampaign(created.campaign.id);

            if (sendRes.success) {
                toast.success(sendRes.message || 'Campagne diffusée avec succès !');
                setIsConfirmSendModalOpen(false);
                setIsCampaignModalOpen(false);
                setCampaignForm({
                    subject: '',
                    previewText: '',
                    heading: '',
                    content: '',
                    imageUrl: '',
                    ctaText: 'Découvrir nos offres',
                    ctaUrl: 'https://baraka.sn/boutique',
                });
                loadData(true);
                setActiveView('campaigns');
            } else {
                toast.error(sendRes.error || 'Erreur lors de l\'envoi de la campagne.');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Une erreur est survenue lors de l\'envoi.');
        } finally {
            setIsSendingCampaign(false);
        }
    };

    return (
        <div className="space-y-8 pb-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-sm">
                            <Mail className="w-5 h-5" />
                        </div>
                        Newsletter & Abonnés
                        {stats.active > 0 && (
                            <span className="text-xs bg-emerald-500 text-white font-black px-2.5 py-1 rounded-full">
                                {stats.active} actif{stats.active > 1 ? 's' : ''}
                            </span>
                        )}
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Gérez vos listes d'inscrits, suivez la croissance de la communauté et diffusez des campagnes d'emailing via Resend.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportCSV}
                        className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <Download className="w-4 h-4 text-slate-500" />
                        Exporter CSV
                    </button>

                    <button
                        onClick={() => setIsCampaignModalOpen(true)}
                        className="px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-orange-600 transition-colors shadow-md shadow-primary/25 cursor-pointer"
                    >
                        <Send className="w-4 h-4" />
                        Diffuser une Newsletter
                    </button>

                    <button
                        onClick={() => loadData(true)}
                        disabled={isRefreshing}
                        className="p-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
                        title="Actualiser"
                    >
                        <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin text-orange-600")} />
                    </button>
                </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Inscrits</span>
                        <div className="text-2xl font-black text-slate-900 mt-1">{stats.total}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                        <Users className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-sm flex items-center justify-between bg-emerald-50/30">
                    <div>
                        <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Abonnés Actifs</span>
                        <div className="text-2xl font-black text-emerald-600 mt-1">{stats.active}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">En Attente</span>
                        <div className="text-2xl font-black text-amber-600 mt-1">{stats.pending}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                        <Clock className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Désinscrits</span>
                        <div className="text-2xl font-black text-slate-500 mt-1">{stats.unsubscribed}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-bold">
                        <UserX className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* View Switcher: Liste des abonnés vs Historique des campagnes */}
            <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
                <button
                    onClick={() => setActiveView('subscribers')}
                    className={cn(
                        "px-4 py-2 text-sm font-bold rounded-xl transition-all cursor-pointer",
                        activeView === 'subscribers'
                            ? "bg-[#1B1F3B] text-white shadow-sm"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    )}
                >
                    Liste des Abonnés ({stats.total})
                </button>
                <button
                    onClick={() => setActiveView('campaigns')}
                    className={cn(
                        "px-4 py-2 text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2",
                        activeView === 'campaigns'
                            ? "bg-[#1B1F3B] text-white shadow-sm"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    )}
                >
                    <Send className="w-3.5 h-3.5" />
                    Historique des Campagnes ({campaigns.length})
                </button>
            </div>

            {activeView === 'subscribers' ? (
                <>
                    {/* Filters & Search */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                            {[
                                { id: 'ALL', label: 'Tous', count: stats.total },
                                { id: 'ACTIVE', label: 'Actifs', count: stats.active, highlight: true },
                                { id: 'PENDING', label: 'En attente', count: stats.pending },
                                { id: 'UNSUBSCRIBED', label: 'Désinscrits', count: stats.unsubscribed },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id as any);
                                        setCurrentPage(1);
                                    }}
                                    className={cn(
                                        "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer",
                                        activeTab === tab.id
                                            ? "bg-slate-900 text-white shadow-sm"
                                            : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                                    )}
                                >
                                    {tab.label}
                                    <span className={cn(
                                        "text-[10px] px-1.5 py-0.5 rounded-md",
                                        activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                                    )}>
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full md:w-80">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Rechercher par adresse email..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-primary focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    {/* Subscribers Table */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                        {isLoading ? (
                            <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <span className="text-sm font-medium">Chargement des abonnés...</span>
                            </div>
                        ) : subscribers.length === 0 ? (
                            <div className="p-12 text-center text-slate-400">
                                <Mail className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                                <p className="text-sm font-bold text-slate-600">Aucun abonné trouvé</p>
                                <p className="text-xs text-slate-400 mt-1">
                                    {searchQuery ? "Aucun résultat ne correspond à votre recherche." : "Les inscriptions apparaîtront ici."}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px] font-black">
                                            <th className="py-3.5 px-4">Email</th>
                                            <th className="py-3.5 px-4">Statut</th>
                                            <th className="py-3.5 px-4">Origine</th>
                                            <th className="py-3.5 px-4">Date d'inscription</th>
                                            <th className="py-3.5 px-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-medium">
                                        {subscribers.map((sub) => (
                                            <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="py-3 px-4 font-bold text-slate-900">
                                                    {sub.email}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={cn(
                                                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                                                        sub.status === 'ACTIVE' && "bg-emerald-50 text-emerald-700 border border-emerald-200",
                                                        sub.status === 'PENDING' && "bg-amber-50 text-amber-700 border border-amber-200",
                                                        sub.status === 'UNSUBSCRIBED' && "bg-slate-100 text-slate-500 border border-slate-200"
                                                    )}>
                                                        <span className={cn(
                                                            "w-1.5 h-1.5 rounded-full",
                                                            sub.status === 'ACTIVE' && "bg-emerald-500",
                                                            sub.status === 'PENDING' && "bg-amber-500",
                                                            sub.status === 'UNSUBSCRIBED' && "bg-slate-400"
                                                        )} />
                                                        {sub.status === 'ACTIVE' ? 'Actif' : sub.status === 'PENDING' ? 'En attente' : 'Désinscrit'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-slate-500">
                                                    <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                                                        {sub.source || 'HOME'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-slate-500">
                                                    {new Date(sub.createdAt).toLocaleDateString('fr-FR', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </td>
                                                <td className="py-3 px-4 text-right space-x-2">
                                                    <button
                                                        onClick={() => handleToggleStatus(sub.id, sub.status)}
                                                        className="text-[11px] font-bold text-slate-600 hover:text-primary transition-colors cursor-pointer"
                                                        title={sub.status === 'ACTIVE' ? 'Désinscrire' : 'Réactiver'}
                                                    >
                                                        {sub.status === 'ACTIVE' ? 'Désinscrire' : 'Activer'}
                                                    </button>
                                                    <button
                                                        onClick={() => setSubscriberToDelete(sub)}
                                                        className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 inline" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                <span>Page {currentPage} sur {totalPages}</span>
                                <div className="flex gap-2">
                                    <button
                                        disabled={currentPage <= 1}
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        className="px-3 py-1 bg-white border border-slate-200 rounded-lg disabled:opacity-40"
                                    >
                                        Précédent
                                    </button>
                                    <button
                                        disabled={currentPage >= totalPages}
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        className="px-3 py-1 bg-white border border-slate-200 rounded-lg disabled:opacity-40"
                                    >
                                        Suivant
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                /* Campaigns History View */
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
                    {campaigns.length === 0 ? (
                        <div className="py-12 text-center text-slate-400">
                            <Send className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                            <p className="text-sm font-bold text-slate-600">Aucune campagne diffusée pour le moment</p>
                            <p className="text-xs text-slate-400 mt-1">
                                Cliquez sur "Diffuser une Newsletter" pour lancer votre première campagne auprès de vos abonnés.
                            </p>
                            <button
                                onClick={() => setIsCampaignModalOpen(true)}
                                className="mt-4 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 hover:bg-orange-600 transition-all cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                Créer une campagne
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {campaigns.map((camp) => (
                                <div key={camp.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-900 text-sm">{camp.subject}</span>
                                            <span className={cn(
                                                "text-[9px] font-black uppercase px-2 py-0.5 rounded-full",
                                                camp.status === 'SENT' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                            )}>
                                                {camp.status === 'SENT' ? 'Envoyée' : camp.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 line-clamp-1">{camp.heading} — {camp.content}</p>
                                        <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                                            <span>Destinataires : <strong className="text-slate-700">{camp.sentCount}</strong> / {camp.recipientCount}</span>
                                            {camp.sentAt && (
                                                <span>Envoyé le : {new Date(camp.sentAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                                            Resend OK
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Modal de Diffusion de Campagne */}
            <AnimatePresence>
                {isCampaignModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                                        <Send className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-slate-900">Diffuser une Newsletter</h2>
                                        <p className="text-xs text-slate-500">
                                            Envoi immédiat à <strong className="text-primary">{stats.active} abonné(s) actif(s)</strong> via Resend.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => !isSendingCampaign && setIsCampaignModalOpen(false)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleInitiateSendCampaign} className="space-y-4 text-xs font-semibold text-slate-700">
                                <div>
                                    <label className="block mb-1">Objet de l'email (Sujet) *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ex: 🔥 Ventes Flash Baraka : Jusqu'à -30% ce week-end !"
                                        value={campaignForm.subject}
                                        onChange={(e) => setCampaignForm(f => ({ ...f, subject: e.target.value }))}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary focus:bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1">Texte d'aperçu (Preheader)</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Offres valables sur tous les ordinateurs et casques audio..."
                                        value={campaignForm.previewText}
                                        onChange={(e) => setCampaignForm(f => ({ ...f, previewText: e.target.value }))}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary focus:bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1">Titre principal dans l'email *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ex: Arrivages Exclusifs & Réductions Abonnés"
                                        value={campaignForm.heading}
                                        onChange={(e) => setCampaignForm(f => ({ ...f, heading: e.target.value }))}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary focus:bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1">Contenu du message *</label>
                                    <textarea
                                        required
                                        rows={4}
                                        placeholder="Rédigez le texte de votre newsletter ici..."
                                        value={campaignForm.content}
                                        onChange={(e) => setCampaignForm(f => ({ ...f, content: e.target.value }))}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary focus:bg-white leading-relaxed"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1">URL de l'image de bannière (optionnel)</label>
                                    <input
                                        type="url"
                                        placeholder="https://res.cloudinary.com/..."
                                        value={campaignForm.imageUrl}
                                        onChange={(e) => setCampaignForm(f => ({ ...f, imageUrl: e.target.value }))}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary focus:bg-white"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block mb-1">Texte du bouton CTA</label>
                                        <input
                                            type="text"
                                            value={campaignForm.ctaText}
                                            onChange={(e) => setCampaignForm(f => ({ ...f, ctaText: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary focus:bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1">Lien de destination</label>
                                        <input
                                            type="url"
                                            value={campaignForm.ctaUrl}
                                            onChange={(e) => setCampaignForm(f => ({ ...f, ctaUrl: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary focus:bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        disabled={isSendingCampaign}
                                        onClick={() => setIsCampaignModalOpen(false)}
                                        className="px-4 py-2.5 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer disabled:opacity-50"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSendingCampaign || stats.active === 0}
                                        className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-orange-600 transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-primary/30"
                                    >
                                        <Send className="w-4 h-4" />
                                        <span>Diffuser à {stats.active} abonné(s)</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Custom Confirmation Modal: Diffuser la Campagne */}
            <AnimatePresence>
                {isConfirmSendModalOpen && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 overflow-hidden"
                        >
                            <div className="flex items-center gap-3.5 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 shadow-inner">
                                    <Send className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900 tracking-tight">Confirmer l'envoi immédiat</h3>
                                    <p className="text-xs text-slate-500">Diffusion via l'API Resend</p>
                                </div>
                            </div>

                            <div className="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-600 mb-4">
                                <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                                    <span className="font-semibold text-slate-500">Destinataires :</span>
                                    <span className="font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full text-[11px]">
                                        {stats.active} abonné{stats.active > 1 ? 's' : ''} actif{stats.active > 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-semibold text-slate-500 block text-[11px] mb-0.5">Sujet :</span>
                                    <span className="font-bold text-slate-900 line-clamp-1">{campaignForm.subject}</span>
                                </div>
                                <div>
                                    <span className="font-semibold text-slate-500 block text-[11px] mb-0.5">Titre principal :</span>
                                    <span className="font-medium text-slate-800 line-clamp-1">{campaignForm.heading}</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/60 text-amber-800 text-xs mb-5">
                                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                                <span className="leading-relaxed text-[11px]">
                                    Cette action expédiera immédiatement cette newsletter par e-mail à tous vos abonnés actifs. Cette opération est irréversible.
                                </span>
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    disabled={isSendingCampaign}
                                    onClick={() => setIsConfirmSendModalOpen(false)}
                                    className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    Modifier l'e-mail
                                </button>
                                <button
                                    type="button"
                                    disabled={isSendingCampaign}
                                    onClick={executeSendCampaign}
                                    className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-orange-600 transition-all cursor-pointer shadow-md shadow-primary/25 disabled:opacity-50"
                                >
                                    {isSendingCampaign ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Diffusion en cours...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            <span>Confirmer et diffuser</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Custom Confirmation Modal: Supprimer un Abonné */}
            <AnimatePresence>
                {subscriberToDelete && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 overflow-hidden"
                        >
                            <div className="flex items-center gap-3.5 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 shadow-inner">
                                    <Trash2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900 tracking-tight">Supprimer cet abonné ?</h3>
                                    <p className="text-xs text-slate-500">Action irréversible</p>
                                </div>
                            </div>

                            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                                Êtes-vous sûr de vouloir supprimer définitivement l'abonné <strong className="text-slate-900 font-bold bg-slate-100 px-1.5 py-0.5 rounded">{subscriberToDelete.email}</strong> de votre base de données ?
                            </p>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    disabled={isDeletingSubscriber}
                                    onClick={() => setSubscriberToDelete(null)}
                                    className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    disabled={isDeletingSubscriber}
                                    onClick={confirmDeleteSubscriber}
                                    className="px-5 py-2.5 bg-rose-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-rose-700 transition-all cursor-pointer shadow-md shadow-rose-600/25 disabled:opacity-50"
                                >
                                    {isDeletingSubscriber ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Suppression...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            <span>Supprimer définitivement</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
