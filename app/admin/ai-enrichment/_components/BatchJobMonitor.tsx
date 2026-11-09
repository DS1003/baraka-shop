'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Clock,
    CheckCircle2,
    AlertCircle,
    XCircle,
    RefreshCw,
    Ban,
    Sparkles,
    Eye,
    ChevronDown,
    ChevronUp,
    DollarSign,
    RotateCcw,
    Layers,
    Filter,
    HelpCircle,
    Check,
    AlertTriangle,
    Activity
} from 'lucide-react';
import { toast } from 'sonner';
import {
    getBulkJobStatusAction,
    cancelBulkJobAction,
    retryFailedJobItemsAction,
    retrySingleJobItemAction,
    getRecentBulkJobsAction,
    getAiProposalAction
} from '@/lib/actions/ai-enrichment-actions';
import { ProposalDetailModal } from './ProposalDetailModal';
import Image from 'next/image';

interface BatchJobMonitorProps {
    activeJobId?: string | null;
    onJobCompleted?: () => void;
}

/**
 * Traduit et humanise les messages d'erreurs techniques de l'API (notamment JSON brut)
 */
function humanizeError(rawError?: string | null): { title: string; detail: string; isHighDemand: boolean } {
    if (!rawError) {
        return { title: "Erreur inconnue", detail: "Aucun détail disponible.", isHighDemand: false };
    }

    try {
        // Tentative de parsing JSON si l'API a renvoyé un dump JSON
        if (rawError.trim().startsWith('{') && rawError.trim().endsWith('}')) {
            const parsed = JSON.parse(rawError);
            const errMsg = parsed.error?.message || parsed.message || '';
            const code = parsed.error?.code || parsed.code;

            if (code === 503 || errMsg.toLowerCase().includes('high demand') || errMsg.toLowerCase().includes('unavailable')) {
                return {
                    title: "Capacité Google temporairement saturée",
                    detail: "L'API Gemini subit un pic de demande passager. Cliquez sur Réessayer.",
                    isHighDemand: true
                };
            }
            if (code === 404 || errMsg.toLowerCase().includes('not available')) {
                return {
                    title: "Modèle en cours de maintenance",
                    detail: "Le modèle sélectionné n'est pas accessible temporairement.",
                    isHighDemand: false
                };
            }
            if (code === 429 || errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('rate limit')) {
                return {
                    title: "Quota d'appels temporairement atteint",
                    detail: "Veuillez patienter quelques instants avant de relancer.",
                    isHighDemand: false
                };
            }
            return {
                title: "Échec de génération IA",
                detail: errMsg || rawError,
                isHighDemand: false
            };
        }
    } catch {
        // Pas du JSON, traitement standard
    }

    if (rawError.includes('UND_ERR_HEADERS_TIMEOUT') || rawError.toLowerCase().includes('timeout') || rawError.toLowerCase().includes('fetch failed')) {
        return {
            title: "Délai de connexion dépassé",
            detail: "Le serveur distant a mis trop de temps à répondre. Réessayez.",
            isHighDemand: false
        };
    }

    return {
        title: "Échec du traitement",
        detail: rawError,
        isHighDemand: false
    };
}

export function BatchJobMonitor({ activeJobId, onJobCompleted }: BatchJobMonitorProps) {
    const [currentJobId, setCurrentJobId] = useState<string | null>(activeJobId || null);
    const [job, setJob] = useState<any | null>(null);
    const [recentJobs, setRecentJobs] = useState<any[]>([]);
    const [inspectingProposal, setInspectingProposal] = useState<any | null>(null);
    const [loadingProposal, setLoadingProposal] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [isRetryingAll, setIsRetryingAll] = useState(false);
    const [retryingItemId, setRetryingItemId] = useState<string | null>(null);
    const [tableFilter, setTableFilter] = useState<'ALL' | 'COMPLETED' | 'FAILED' | 'PENDING'>('ALL');

    // Sync activeJobId prop
    useEffect(() => {
        if (activeJobId) {
            setCurrentJobId(activeJobId);
        }
    }, [activeJobId]);

    // Fetch recent jobs list
    const fetchRecentJobs = useCallback(async () => {
        try {
            const res = await getRecentBulkJobsAction(5);
            if (res.success && res.jobs) {
                setRecentJobs(res.jobs);
                if (!currentJobId && res.jobs.length > 0) {
                    setCurrentJobId(res.jobs[0].id);
                }
            }
        } catch (err) {
            console.error("Erreur récents jobs:", err);
        }
    }, [currentJobId]);

    // Fetch active job status
    const fetchJobStatus = useCallback(async () => {
        if (!currentJobId) return;
        try {
            const res = await getBulkJobStatusAction(currentJobId);
            if (res.success && res.job) {
                setJob(res.job);
                if (res.job.status === 'COMPLETED' && onJobCompleted) {
                    onJobCompleted();
                }
            }
        } catch (err) {
            console.error("Erreur statut job:", err);
        }
    }, [currentJobId, onJobCompleted]);

    // Initial load
    useEffect(() => {
        fetchRecentJobs();
    }, [fetchRecentJobs]);

    // Polling while RUNNING or PENDING
    useEffect(() => {
        fetchJobStatus();

        if (job?.status === 'RUNNING' || job?.status === 'PENDING') {
            const interval = setInterval(fetchJobStatus, 2500);
            return () => clearInterval(interval);
        }
    }, [currentJobId, job?.status, fetchJobStatus]);

    // Cancel job
    const handleCancel = async () => {
        if (!currentJobId) return;
        if (!confirm("Voulez-vous interrompre ce traitement en cours ?")) return;
        setIsCancelling(true);
        try {
            const res = await cancelBulkJobAction(currentJobId);
            if (res.success) {
                toast.success("Traitement interrompu.");
                fetchJobStatus();
            } else {
                toast.error(res.error || "Impossible d'annuler.");
            }
        } catch (err: any) {
            toast.error(err?.message || "Erreur.");
        } finally {
            setIsCancelling(false);
        }
    };

    // Retry all failed items
    const handleRetryAll = async () => {
        if (!currentJobId) return;
        setIsRetryingAll(true);
        try {
            const res = await retryFailedJobItemsAction(currentJobId);
            if (res.success) {
                toast.success(`${res.count} éléments relancés avec succès !`);
                fetchJobStatus();
            } else {
                toast.error(res.error || "Impossible de relancer.");
            }
        } catch (err: any) {
            toast.error(err?.message || "Erreur.");
        } finally {
            setIsRetryingAll(false);
        }
    };

    // Retry a single item
    const handleRetrySingle = async (jobItemId: string) => {
        setRetryingItemId(jobItemId);
        try {
            const res = await retrySingleJobItemAction(jobItemId);
            if (res.success) {
                toast.success("Produit relancé en traitement !");
                fetchJobStatus();
            } else {
                toast.error(res.error || "Échec de la relance.");
            }
        } catch (err: any) {
            toast.error(err?.message || "Erreur réseau.");
        } finally {
            setRetryingItemId(null);
        }
    };

    // Inspect item proposal
    const handleInspectItemProposal = async (productId: string) => {
        setLoadingProposal(true);
        try {
            const res = await getAiProposalAction(productId);
            if (res.success && res.proposal) {
                setInspectingProposal(res.proposal);
            } else {
                toast.error("Proposition introuvable.");
            }
        } catch (err) {
            toast.error("Erreur lors de la récupération.");
        } finally {
            setLoadingProposal(false);
        }
    };

    // Filter items
    const filteredItems = useMemo(() => {
        if (!job?.items) return [];
        if (tableFilter === 'ALL') return job.items;
        if (tableFilter === 'COMPLETED') return job.items.filter((it: any) => it.status === 'COMPLETED');
        if (tableFilter === 'FAILED') return job.items.filter((it: any) => it.status === 'FAILED');
        if (tableFilter === 'PENDING') return job.items.filter((it: any) => it.status === 'PENDING' || it.status === 'PROCESSING');
        return job.items;
    }, [job?.items, tableFilter]);

    if (!job && recentJobs.length === 0) {
        return (
            <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-12 text-center text-gray-400 space-y-4 max-w-xl mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                    <Sparkles className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                    <h4 className="font-bold text-gray-800 text-base">Aucun lot de traitement récent</h4>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto">
                        Lancez votre premier lot depuis l'onglet <strong>« Lancer un lot d'enrichissement »</strong> pour suivre la progression en temps réel.
                    </p>
                </div>
            </div>
        );
    }

    const progressPercent = job && job.totalProducts > 0
        ? Math.round((job.processedCount / job.totalProducts) * 100)
        : 0;

    const isRunning = job?.status === 'RUNNING' || job?.status === 'PENDING';

    return (
        <div className="space-y-6">
            {/* Recent jobs switcher bar */}
            {recentJobs.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap pl-1">
                        Lots récents :
                    </span>
                    {recentJobs.map(j => {
                        const isSelected = currentJobId === j.id;
                        return (
                            <button
                                key={j.id}
                                onClick={() => setCurrentJobId(j.id)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
                                    isSelected
                                        ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300 text-emerald-950 font-bold shadow-sm ring-1 ring-emerald-400/30'
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                <span className={`w-2 h-2 rounded-full ${
                                    j.status === 'RUNNING' ? 'bg-amber-500 animate-ping' :
                                    j.status === 'COMPLETED' ? 'bg-emerald-500' :
                                    j.status === 'CANCELLED' ? 'bg-gray-400' : 'bg-rose-500'
                                }`} />
                                <span>{j.name}</span>
                                {j.errorCount > 0 && (
                                    <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black">
                                        {j.errorCount}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {job && (
                <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-gray-50/80 via-white to-emerald-50/20">
                        <div>
                            <div className="flex flex-wrap items-center gap-2.5">
                                <h3 className="font-extrabold text-gray-900 text-lg tracking-tight">
                                    {job.name}
                                </h3>

                                <span className={`text-xs px-3 py-1 rounded-full font-bold border flex items-center gap-1.5 ${
                                    job.status === 'RUNNING'
                                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                                        : job.status === 'COMPLETED'
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                        : job.status === 'CANCELLED'
                                        ? 'bg-gray-100 border-gray-200 text-gray-700'
                                        : 'bg-rose-50 border-rose-200 text-rose-900'
                                }`}>
                                    {job.status === 'RUNNING' && (
                                        <>
                                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                                            Traitement en cours...
                                        </>
                                    )}
                                    {job.status === 'COMPLETED' && (
                                        <>
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                            Terminé avec succès
                                        </>
                                    )}
                                    {job.status === 'CANCELLED' && '✕ Interrompu'}
                                    {job.status === 'FAILED' && '⚠ En échec'}
                                    {job.status === 'PENDING' && 'En file d\'attente'}
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1.5">
                                <span>
                                    Créé le {new Date(job.createdAt).toLocaleDateString('fr-FR', {
                                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                                    })}
                                </span>
                                <span>•</span>
                                <span className="font-mono text-emerald-800 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/50">
                                    <DollarSign className="w-3 h-3 text-emerald-600" />
                                    Coût cumulé : ${(job.costEstimate || 0).toFixed(4)} USD
                                </span>
                            </div>
                        </div>

                        {/* Top action buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={fetchJobStatus}
                                title="Actualiser l'état du lot"
                                className="p-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-gray-600 hover:text-gray-900 transition shadow-sm"
                            >
                                <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin text-emerald-600' : ''}`} />
                            </button>

                            {isRunning && (
                                <button
                                    onClick={handleCancel}
                                    disabled={isCancelling}
                                    className="px-3.5 py-2.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                                >
                                    <Ban className="w-4 h-4" />
                                    <span>{isCancelling ? "Annulation..." : "Interrompre"}</span>
                                </button>
                            )}

                            {job.errorCount > 0 && !isRunning && (
                                <button
                                    onClick={handleRetryAll}
                                    disabled={isRetryingAll}
                                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md shadow-emerald-600/20 disabled:opacity-50"
                                >
                                    <RotateCcw className={`w-4 h-4 ${isRetryingAll ? 'animate-spin' : ''}`} />
                                    <span>{isRetryingAll ? "Relance en cours..." : `Relancer les ${job.errorCount} erreurs`}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar & Metric Pills */}
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 space-y-5">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs font-bold">
                                <span className="text-gray-700 flex items-center gap-1.5">
                                    <Activity className="w-4 h-4 text-emerald-600" />
                                    Progression globale du traitement
                                </span>
                                <span className="text-emerald-800 font-extrabold bg-emerald-100/70 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                    {progressPercent}% • {job.processedCount} / {job.totalProducts} produits
                                </span>
                            </div>
                            <div className="w-full h-3.5 bg-gray-200 rounded-full overflow-hidden p-0.5 shadow-inner">
                                <div
                                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 rounded-full transition-all duration-500 shadow-sm"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>

                        {/* Metric Boxes */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm text-center">
                                <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider block">Total Produits</span>
                                <span className="text-2xl font-black text-gray-900 mt-1 block">{job.totalProducts}</span>
                            </div>

                            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm text-center">
                                <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider block">Traités</span>
                                <span className="text-2xl font-black text-gray-900 mt-1 block">{job.processedCount}</span>
                            </div>

                            <div className="bg-gradient-to-br from-white to-emerald-50/40 p-4 rounded-2xl border border-emerald-200 shadow-sm text-center">
                                <span className="text-[11px] text-emerald-900 font-semibold uppercase tracking-wider block">Succès (Propositions)</span>
                                <span className="text-2xl font-black text-emerald-700 mt-1 block">{job.successCount}</span>
                            </div>

                            <div className="bg-gradient-to-br from-white to-rose-50/40 p-4 rounded-2xl border border-rose-200 shadow-sm text-center">
                                <span className="text-[11px] text-rose-900 font-semibold uppercase tracking-wider block">Erreurs</span>
                                <span className="text-2xl font-black text-rose-700 mt-1 block">{job.errorCount}</span>
                            </div>
                        </div>
                    </div>

                    {/* Table Filters Toolbar */}
                    <div className="px-6 py-3.5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-white">
                        <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-gray-400 font-bold mr-1 flex items-center gap-1">
                                <Filter className="w-3.5 h-3.5" />
                                Filtrer :
                            </span>
                            <button
                                onClick={() => setTableFilter('ALL')}
                                className={`px-3 py-1 rounded-lg font-bold transition text-xs ${
                                    tableFilter === 'ALL'
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                Tous ({job.items?.length || 0})
                            </button>
                            <button
                                onClick={() => setTableFilter('COMPLETED')}
                                className={`px-3 py-1 rounded-lg font-bold transition text-xs ${
                                    tableFilter === 'COMPLETED'
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                                }`}
                            >
                                Succès ({job.successCount || 0})
                            </button>
                            <button
                                onClick={() => setTableFilter('FAILED')}
                                className={`px-3 py-1 rounded-lg font-bold transition text-xs ${
                                    tableFilter === 'FAILED'
                                        ? 'bg-rose-600 text-white'
                                        : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                                }`}
                            >
                                Erreurs ({job.errorCount || 0})
                            </button>
                            <button
                                onClick={() => setTableFilter('PENDING')}
                                className={`px-3 py-1 rounded-lg font-bold transition text-xs ${
                                    tableFilter === 'PENDING'
                                        ? 'bg-amber-600 text-white'
                                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                                }`}
                            >
                                En attente ({Math.max(0, job.totalProducts - job.processedCount)})
                            </button>
                        </div>

                        <span className="text-[11px] text-gray-400">
                            Affichage de {filteredItems.length} produit{filteredItems.length > 1 ? 's' : ''}
                        </span>
                    </div>

                    {/* Products Queue Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/70 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                    <th className="py-3.5 px-6">Produit</th>
                                    <th className="py-3.5 px-4">Statut</th>
                                    <th className="py-3.5 px-4">Détail du traitement</th>
                                    <th className="py-3.5 px-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs">
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-10 text-center text-gray-400">
                                            Aucun élément dans cette catégorie de filtre.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item: any) => {
                                        const product = item.product || {};
                                        const productImage = product.images?.[0] || '/images/placeholder.png';
                                        const errorDetails = humanizeError(item.errorMessage);
                                        const isRetryingThis = retryingItemId === item.id;

                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50/60 transition group">
                                                {/* Product Col */}
                                                <td className="py-3.5 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-gray-100 relative overflow-hidden flex-shrink-0 border border-gray-200">
                                                            <Image
                                                                src={productImage}
                                                                alt={product.name || 'Produit'}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                        <div className="min-w-0 max-w-md">
                                                            <span className="font-bold text-gray-900 truncate block group-hover:text-emerald-700 transition">
                                                                {product.name}
                                                            </span>
                                                            <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                                                                <span>Réf : {product.reference || 'N/A'}</span>
                                                                <span>•</span>
                                                                <span className="text-gray-600 font-medium">{product.category?.name || 'Sans catégorie'}</span>
                                                                {product.brand?.name && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span className="text-emerald-700 font-semibold">{product.brand.name}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Status Col */}
                                                <td className="py-3.5 px-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                                                        item.status === 'COMPLETED'
                                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                                            : item.status === 'PROCESSING'
                                                            ? 'bg-blue-50 border-blue-200 text-blue-900 animate-pulse'
                                                            : item.status === 'FAILED'
                                                            ? 'bg-rose-50 border-rose-200 text-rose-900'
                                                            : 'bg-gray-100 border-gray-200 text-gray-700'
                                                    }`}>
                                                        {item.status === 'COMPLETED' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                                                        {item.status === 'PROCESSING' && <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />}
                                                        {item.status === 'FAILED' && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                                                        {item.status === 'PENDING' && <Clock className="w-3.5 h-3.5 text-gray-400" />}

                                                        {item.status === 'COMPLETED' && 'Proposition prête'}
                                                        {item.status === 'PROCESSING' && 'Génération IA...'}
                                                        {item.status === 'FAILED' && 'Échec'}
                                                        {item.status === 'PENDING' && 'En file d\'attente'}
                                                    </span>
                                                </td>

                                                {/* Detail / Error Col (HUMANIZED) */}
                                                <td className="py-3.5 px-4">
                                                    {item.status === 'FAILED' ? (
                                                        <div className="space-y-0.5 max-w-sm">
                                                            <div className="flex items-center gap-1 text-rose-700 font-bold text-xs">
                                                                <span>{errorDetails.title}</span>
                                                            </div>
                                                            <p className="text-[11px] text-gray-500 leading-snug truncate" title={item.errorMessage}>
                                                                {errorDetails.detail}
                                                            </p>
                                                        </div>
                                                    ) : item.completedAt ? (
                                                        <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                                                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                            <span>Terminé à {new Date(item.completedAt).toLocaleTimeString('fr-FR', {
                                                                hour: '2-digit', minute: '2-digit', second: '2-digit'
                                                            })}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">-</span>
                                                    )}
                                                </td>

                                                {/* Action Col */}
                                                <td className="py-3.5 px-6 text-right whitespace-nowrap">
                                                    {item.status === 'COMPLETED' && (
                                                        <button
                                                            onClick={() => handleInspectItemProposal(item.productId)}
                                                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 shadow-sm"
                                                        >
                                                            <Eye className="w-3.5 h-3.5 text-emerald-700" />
                                                            Examiner
                                                        </button>
                                                    )}

                                                    {item.status === 'FAILED' && (
                                                        <button
                                                            onClick={() => handleRetrySingle(item.id)}
                                                            disabled={isRetryingThis}
                                                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                                                            title="Relancer immédiatement ce produit"
                                                        >
                                                            <RotateCcw className={`w-3.5 h-3.5 text-rose-700 ${isRetryingThis ? 'animate-spin' : ''}`} />
                                                            {isRetryingThis ? "Relance..." : "Réessayer"}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Inspect Modal */}
            {inspectingProposal && (
                <ProposalDetailModal
                    proposal={inspectingProposal}
                    isOpen={!!inspectingProposal}
                    onClose={() => setInspectingProposal(null)}
                    onSuccess={() => {
                        fetchJobStatus();
                    }}
                />
            )}
        </div>
    );
}
