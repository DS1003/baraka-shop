'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Search,
    Filter,
    CheckCircle2,
    Clock,
    AlertCircle,
    Eye,
    Check,
    Trash2,
    RefreshCw,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    Cpu,
    ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import {
    getProposalsForReviewAction,
    bulkValidateProposalsAction,
    applyAiProposalAction,
    deleteAiProposalAction
} from '@/lib/actions/ai-enrichment-actions';
import { ProposalDetailModal } from './ProposalDetailModal';
import Image from 'next/image';
import Link from 'next/link';

interface ProposalsReviewGridProps {
    onStatsChanged?: () => void;
}

export function ProposalsReviewGrid({ onStatsChanged }: ProposalsReviewGridProps) {
    const [proposals, setProposals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [statusFilter, setStatusFilter] = useState<string>('TO_REVIEW');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkValidating, setIsBulkValidating] = useState(false);

    // Modal inspection state
    const [inspectingProposal, setInspectingProposal] = useState<any | null>(null);

    const fetchProposals = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getProposalsForReviewAction({
                page,
                pageSize: 15,
                status: statusFilter,
                search: searchQuery
            });

            if (res.success && res.proposals) {
                setProposals(res.proposals);
                setTotal(res.total || 0);
                setTotalPages(res.totalPages || 1);
            } else {
                toast.error(res.error || "Impossible de charger les propositions.");
            }
        } catch (err: any) {
            toast.error(err?.message || "Erreur de chargement.");
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, searchQuery]);

    useEffect(() => {
        fetchProposals();
    }, [fetchProposals]);

    // Handle check all
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(proposals.map(p => p.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleToggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // Bulk validate
    const handleBulkValidate = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Confirmer la validation et l'injection des contenus pour les ${selectedIds.length} propositions sélectionnées ?`)) {
            return;
        }

        setIsBulkValidating(true);
        try {
            const res = await bulkValidateProposalsAction(selectedIds);
            if (res.success) {
                toast.success(`${res.count} propositions validées et appliquées aux produits.`);
                setSelectedIds([]);
                fetchProposals();
                if (onStatsChanged) onStatsChanged();
            } else {
                toast.error(res.error || "Erreur lors de la validation groupée.");
            }
        } catch (err: any) {
            toast.error(err?.message || "Erreur réseau.");
        } finally {
            setIsBulkValidating(false);
        }
    };

    // Quick single apply
    const handleQuickApply = async (proposal: any) => {
        try {
            const res = await applyAiProposalAction(proposal.productId, [
                'shortDescription',
                'classicDescription',
                'features',
                'specifications'
            ]);
            if (res.success) {
                toast.success(`Proposition validée pour ${proposal.product?.name}`);
                fetchProposals();
                if (onStatsChanged) onStatsChanged();
            } else {
                toast.error(res.error || "Erreur d'application.");
            }
        } catch (err: any) {
            toast.error(err?.message || "Erreur.");
        }
    };

    // Quick single delete
    const handleQuickDelete = async (proposalId: string) => {
        if (!confirm("Supprimer cette proposition ?")) return;
        try {
            const res = await deleteAiProposalAction(proposalId);
            if (res.success) {
                toast.success("Proposition supprimée.");
                fetchProposals();
                if (onStatsChanged) onStatsChanged();
            } else {
                toast.error(res.error || "Erreur.");
            }
        } catch (err: any) {
            toast.error(err?.message || "Erreur.");
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden flex flex-col">
            {/* Header & Controls */}
            <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/40">
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 md:w-80">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Rechercher par produit, référence, marque..."
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                        />
                    </div>

                    {/* Status filter tabs */}
                    <div className="flex items-center bg-gray-100/80 p-1 rounded-xl text-xs">
                        {[
                            { value: 'TO_REVIEW', label: 'À vérifier' },
                            { value: 'VALIDATED', label: 'Validés' },
                            { value: 'ALL', label: 'Tous' }
                        ].map(tab => (
                            <button
                                key={tab.value}
                                onClick={() => {
                                    setStatusFilter(tab.value);
                                    setPage(1);
                                }}
                                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                                    statusFilter === tab.value
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={fetchProposals}
                        title="Actualiser"
                        className="p-2 hover:bg-white text-gray-400 hover:text-gray-700 rounded-xl border border-transparent hover:border-gray-200 transition"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
                    </button>
                </div>

                {/* Bulk Actions */}
                {selectedIds.length > 0 && (
                    <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl animate-in fade-in">
                        <span className="text-xs font-semibold text-emerald-900">
                            {selectedIds.length} proposition{selectedIds.length > 1 ? 's' : ''} sélectionnée{selectedIds.length > 1 ? 's' : ''}
                        </span>
                        <button
                            onClick={handleBulkValidate}
                            disabled={isBulkValidating}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shadow-sm"
                        >
                            <Check className="w-3.5 h-3.5" />
                            {isBulkValidating ? "Validation en cours..." : "Valider la sélection"}
                        </button>
                    </div>
                )}
            </div>

            {/* Proposals Table */}
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                            <th className="py-3 px-4 w-10 text-center">
                                <input
                                    type="checkbox"
                                    checked={proposals.length > 0 && selectedIds.length === proposals.length}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                                />
                            </th>
                            <th className="py-3 px-4">Produit</th>
                            <th className="py-3 px-4">Statut</th>
                            <th className="py-3 px-4">Modèle & Tokens</th>
                            <th className="py-3 px-4">Généré le</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="py-16 text-center text-gray-400">
                                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
                                    Chargement des propositions...
                                </td>
                            </tr>
                        ) : proposals.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-16 text-center text-gray-400">
                                    <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    Aucune proposition trouvée avec ces critères.
                                </td>
                            </tr>
                        ) : (
                            proposals.map((proposal) => {
                                const product = proposal.product || {};
                                const productImage = product.images?.[0] || '/images/placeholder.png';
                                const isSelected = selectedIds.includes(proposal.id);

                                return (
                                    <tr
                                        key={proposal.id}
                                        className={`hover:bg-gray-50/80 transition ${
                                            isSelected ? 'bg-emerald-50/30' : ''
                                        }`}
                                    >
                                        <td className="py-3 px-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => handleToggleSelect(proposal.id)}
                                                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                                            />
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 relative overflow-hidden border border-gray-200 flex-shrink-0">
                                                    <Image
                                                        src={productImage}
                                                        alt={product.name || 'Produit'}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="max-w-md">
                                                    <span className="font-semibold text-gray-900 line-clamp-1 block">
                                                        {product.name}
                                                    </span>
                                                    <span className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                                                        <span>Réf: <strong>{product.reference || 'N/A'}</strong></span>
                                                        <span>•</span>
                                                        <span>{product.brand?.name || 'Sans marque'}</span>
                                                        <span>•</span>
                                                        <span>{product.category?.name || 'Sans catégorie'}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                                                proposal.status === 'VALIDATED'
                                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                                    : proposal.status === 'FAILED'
                                                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                                                    : 'bg-amber-50 border-amber-200 text-amber-800'
                                            }`}>
                                                {proposal.status === 'VALIDATED' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                                                {proposal.status === 'TO_REVIEW' && <Clock className="w-3 h-3 text-amber-600" />}
                                                {proposal.status === 'FAILED' && <AlertCircle className="w-3 h-3 text-rose-600" />}
                                                {proposal.status === 'VALIDATED' ? 'Validé' : proposal.status === 'FAILED' ? 'Erreur' : 'À vérifier'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex flex-col">
                                                <span className="font-mono text-[11px] text-gray-700 flex items-center gap-1">
                                                    <Cpu className="w-3 h-3 text-gray-400" />
                                                    {proposal.modelUsed || 'gemini-flash'}
                                                </span>
                                                <span className="text-[10px] text-gray-400">
                                                    {(proposal.promptTokens || 0) + (proposal.completionTokens || 0)} tokens
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-500 text-[11px]">
                                            {proposal.generatedAt
                                                ? new Date(proposal.generatedAt).toLocaleDateString('fr-FR', {
                                                      day: '2-digit',
                                                      month: '2-digit',
                                                      year: 'numeric',
                                                      hour: '2-digit',
                                                      minute: '2-digit'
                                                  })
                                                : '-'}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => setInspectingProposal(proposal)}
                                                    className="px-2.5 py-1.5 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 rounded-lg text-xs font-semibold transition flex items-center gap-1 border border-gray-200"
                                                    title="Examiner et comparer"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    Examiner
                                                </button>

                                                {proposal.status !== 'VALIDATED' && (
                                                    <button
                                                        onClick={() => handleQuickApply(proposal)}
                                                        className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition border border-emerald-200"
                                                        title="Valider et appliquer au produit"
                                                    >
                                                        <Check className="w-3.5 h-3.5" />
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleQuickDelete(proposal.id)}
                                                    className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition"
                                                    title="Supprimer la proposition"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-gray-50/30">
                <span>
                    Affichage de <strong>{proposals.length}</strong> sur <strong>{total}</strong> propositions
                </span>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-semibold text-gray-700">
                        Page {page} / {totalPages || 1}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className="p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Proposal Detail & Diff Modal */}
            {inspectingProposal && (
                <ProposalDetailModal
                    proposal={inspectingProposal}
                    isOpen={!!inspectingProposal}
                    onClose={() => setInspectingProposal(null)}
                    onSuccess={() => {
                        fetchProposals();
                        if (onStatsChanged) onStatsChanged();
                    }}
                />
            )}
        </div>
    );
}
