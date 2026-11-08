'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Clock,
    CheckCircle2,
    AlertCircle,
    XCircle,
    RefreshCw,
    Pause,
    Play,
    Ban,
    Sparkles,
    Eye,
    ChevronDown,
    ChevronUp,
    Cpu,
    DollarSign,
    RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import {
    getBulkJobStatusAction,
    cancelBulkJobAction,
    retryFailedJobItemsAction,
    getRecentBulkJobsAction,
    getAiProposalAction
} from '@/lib/actions/ai-enrichment-actions';
import { ProposalDetailModal } from './ProposalDetailModal';
import Image from 'next/image';

interface BatchJobMonitorProps {
    activeJobId?: string | null;
    onJobCompleted?: () => void;
}

export function BatchJobMonitor({ activeJobId, onJobCompleted }: BatchJobMonitorProps) {
    const [currentJobId, setCurrentJobId] = useState<string | null>(activeJobId || null);
    const [job, setJob] = useState<any | null>(null);
    const [recentJobs, setRecentJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [inspectingProposal, setInspectingProposal] = useState<any | null>(null);
    const [loadingProposal, setLoadingProposal] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [isRetrying, setIsRetrying] = useState(false);

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
                // If no current job selected, pick the latest one
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

    // Retry failed items
    const handleRetry = async () => {
        if (!currentJobId) return;
        setIsRetrying(true);
        try {
            const res = await retryFailedJobItemsAction(currentJobId);
            if (res.success) {
                toast.success(`${res.count} éléments relancés !`);
                fetchJobStatus();
            } else {
                toast.error(res.error || "Impossible de relancer.");
            }
        } catch (err: any) {
            toast.error(err?.message || "Erreur.");
        } finally {
            setIsRetrying(false);
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

    if (!job && recentJobs.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-12 text-center text-gray-400 space-y-3">
                <Sparkles className="w-10 h-10 text-gray-300 mx-auto" />
                <h4 className="font-semibold text-gray-700 text-sm">Aucun traitement récent</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    Lancez un premier lot depuis l'onglet « Lancer un lot d'enrichissement » pour suivre son avancement en direct.
                </p>
            </div>
        );
    }

    const progressPercent = job && job.totalProducts > 0
        ? Math.round((job.processedCount / job.totalProducts) * 100)
        : 0;

    return (
        <div className="space-y-6">
            {/* Recent jobs switcher */}
            {recentJobs.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        Lots récents :
                    </span>
                    {recentJobs.map(j => (
                        <button
                            key={j.id}
                            onClick={() => setCurrentJobId(j.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition flex items-center gap-2 border ${
                                currentJobId === j.id
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold shadow-sm'
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <span className={`w-2 h-2 rounded-full ${
                                j.status === 'RUNNING' ? 'bg-amber-500 animate-pulse' :
                                j.status === 'COMPLETED' ? 'bg-emerald-500' :
                                j.status === 'CANCELLED' ? 'bg-gray-400' : 'bg-red-500'
                            }`} />
                            {j.name}
                        </button>
                    ))}
                </div>
            )}

            {job && (
                <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-gray-50 via-white to-emerald-50/20">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h3 className="font-bold text-gray-900 text-base">{job.name}</h3>
                                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                                    job.status === 'RUNNING'
                                        ? 'bg-amber-50 border-amber-200 text-amber-800 animate-pulse'
                                        : job.status === 'COMPLETED'
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                        : job.status === 'CANCELLED'
                                        ? 'bg-gray-100 border-gray-200 text-gray-600'
                                        : 'bg-rose-50 border-rose-200 text-rose-800'
                                }`}>
                                    {job.status === 'RUNNING' && '⚡ Traitement en cours...'}
                                    {job.status === 'COMPLETED' && '✓ Terminé'}
                                    {job.status === 'CANCELLED' && '✕ Annulé'}
                                    {job.status === 'FAILED' && '⚠ En échec'}
                                    {job.status === 'PENDING' && 'En file d\'attente'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                                <span>Créé le {new Date(job.createdAt).toLocaleDateString('fr-FR', {
                                    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                                })}</span>
                                <span>•</span>
                                <span className="font-mono text-emerald-700 font-semibold flex items-center gap-1">
                                    <DollarSign className="w-3.5 h-3.5" />
                                    Coût cumulé: ${(job.costEstimate || 0).toFixed(4)} USD
                                </span>
                            </p>
                        </div>

                        {/* Job actions */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={fetchJobStatus}
                                title="Actualiser"
                                className="p-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-gray-600 transition"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>

                            {job.status === 'RUNNING' && (
                                <button
                                    onClick={handleCancel}
                                    disabled={isCancelling}
                                    className="px-3 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                                >
                                    <Ban className="w-3.5 h-3.5" />
                                    {isCancelling ? "Annulation..." : "Interrompre"}
                                </button>
                            )}

                            {job.errorCount > 0 && job.status !== 'RUNNING' && (
                                <button
                                    onClick={handleRetry}
                                    disabled={isRetrying}
                                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    {isRetrying ? "Relance..." : `Relancer les ${job.errorCount} erreurs`}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar & KPI Stats */}
                    <div className="p-6 border-b border-gray-100 bg-gray-50/40 space-y-4">
                        <div>
                            <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                                <span className="text-gray-700">Progression du traitement</span>
                                <span className="text-emerald-700 font-bold">{progressPercent}% ({job.processedCount} / {job.totalProducts})</span>
                            </div>
                            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                            <div className="bg-white p-3 rounded-xl border border-gray-200 text-center">
                                <span className="text-[11px] text-gray-500 font-medium block">Total produits</span>
                                <span className="text-lg font-bold text-gray-900">{job.totalProducts}</span>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-gray-200 text-center">
                                <span className="text-[11px] text-gray-500 font-medium block">Traités</span>
                                <span className="text-lg font-bold text-gray-900">{job.processedCount}</span>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-emerald-200 bg-emerald-50/30 text-center">
                                <span className="text-[11px] text-emerald-800 font-medium block">Succès (Propositions)</span>
                                <span className="text-lg font-bold text-emerald-700">{job.successCount}</span>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-rose-200 bg-rose-50/30 text-center">
                                <span className="text-[11px] text-rose-800 font-medium block">Erreurs</span>
                                <span className="text-lg font-bold text-rose-700">{job.errorCount}</span>
                            </div>
                        </div>
                    </div>

                    {/* Queue Items Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/60 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                                    <th className="py-3 px-4">Produit</th>
                                    <th className="py-3 px-4">Statut de la file</th>
                                    <th className="py-3 px-4">Détail / Erreur</th>
                                    <th className="py-3 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs">
                                {job.items?.map((item: any) => {
                                    const product = item.product || {};
                                    const productImage = product.images?.[0] || '/images/placeholder.png';

                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50/60 transition">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-lg bg-gray-100 relative overflow-hidden flex-shrink-0 border border-gray-200">
                                                        <Image
                                                            src={productImage}
                                                            alt={product.name || 'Produit'}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-gray-900 line-clamp-1 block">
                                                            {product.name}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400">
                                                            Réf: {product.reference || 'N/A'} • {product.category?.name || 'Sans catégorie'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                                                    item.status === 'COMPLETED'
                                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                                        : item.status === 'PROCESSING'
                                                        ? 'bg-blue-50 border-blue-200 text-blue-800 animate-pulse'
                                                        : item.status === 'FAILED'
                                                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                                                        : 'bg-gray-100 border-gray-200 text-gray-600'
                                                }`}>
                                                    {item.status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                                                    {item.status === 'PROCESSING' && <RefreshCw className="w-3 h-3 text-blue-600 animate-spin" />}
                                                    {item.status === 'FAILED' && <AlertCircle className="w-3 h-3 text-rose-600" />}
                                                    {item.status === 'PENDING' && <Clock className="w-3 h-3 text-gray-400" />}

                                                    {item.status === 'COMPLETED' && 'Proposition prête'}
                                                    {item.status === 'PROCESSING' && 'Génération IA...'}
                                                    {item.status === 'FAILED' && 'Échec'}
                                                    {item.status === 'PENDING' && 'En attente'}
                                                </span>
                                            </td>

                                            <td className="py-3 px-4 text-gray-500 text-[11px]">
                                                {item.errorMessage ? (
                                                    <span className="text-rose-600 font-mono text-[10px] line-clamp-1" title={item.errorMessage}>
                                                        {item.errorMessage}
                                                    </span>
                                                ) : item.completedAt ? (
                                                    <span>Terminé à {new Date(item.completedAt).toLocaleTimeString('fr-FR')}</span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>

                                            <td className="py-3 px-4 text-right">
                                                {item.status === 'COMPLETED' && (
                                                    <button
                                                        onClick={() => handleInspectItemProposal(item.productId)}
                                                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1 border border-emerald-200"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        Examiner
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
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
