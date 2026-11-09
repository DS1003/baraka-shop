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
    ExternalLink,
    FileText,
    Boxes,
    X,
    CheckCheck
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
                toast.success(`✨ ${res.count} propositions validées et appliquées au catalogue avec succès !`);
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
                toast.success(`✨ Fiche validée pour ${proposal.product?.name}`);
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
        if (!confirm("Voulez-vous supprimer ce brouillon de proposition IA ?")) return;
        try {
            const res = await deleteAiProposalAction(proposalId);
            if (res.success) {
                toast.success("Brouillon supprimé.");
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
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden flex flex-col space-y-0">
            {/* Toolbar Header */}
            <div className="p-5 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-gray-50/80 via-white to-emerald-50/20">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                    {/* Search bar */}
                    <div className="relative flex-1 min-w-[240px] max-w-md">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Rechercher par nom, référence ou marque..."
                            className="w-full pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm transition"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => { setSearchQuery(''); setPage(1); }}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Status filter tabs */}
                    <div className="flex items-center bg-gray-100/80 p-1 rounded-xl text-xs font-bold">
                        {[
                            { value: 'TO_REVIEW', label: 'À vérifier' },
                            { value: 'VALIDATED', label: 'Validées' },
                            { value: 'ALL', label: 'Toutes' }
                        ].map(tab => (
                            <button
                                key={tab.value}
                                onClick={() => {
                                    setStatusFilter(tab.value);
                                    setPage(1);
                                }}
                                className={`px-3 py-1.5 rounded-lg transition-all ${
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
                        title="Actualiser la liste"
                        className="p-2.5 bg-white hover:bg-gray-50 text-gray-600 rounded-xl border border-gray-200 transition shadow-sm"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
                    </button>
                </div>

                {/* Bulk Actions Button */}
                {selectedIds.length > 0 && (
                    <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-300/80 px-4 py-2 rounded-2xl animate-in fade-in shadow-sm">
                        <span className="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5">
                            <CheckCheck className="w-4 h-4 text-emerald-600" />
                            {selectedIds.length} sélectionnée{selectedIds.length > 1 ? 's' : ''}
                        </span>
                        <button
                            onClick={handleBulkValidate}
                            disabled={isBulkValidating}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50"
                        >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>{isBulkValidating ? "Validation..." : "Tout valider & Publier"}</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Proposals Table */}
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/70 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                            <th className="py-3.5 px-4 w-12 text-center">
                                <input
                                    type="checkbox"
                                    checked={proposals.length > 0 && selectedIds.length === proposals.length}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    className="rounded-md border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                                />
                            </th>
                            <th className="py-3.5 px-4">Produit</th>
                            <th className="py-3.5 px-4">Contenus générés</th>
                            <th className="py-3.5 px-4">Statut</th>
                            <th className="py-3.5 px-4">Modèle IA</th>
                            <th className="py-3.5 px-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="py-16 text-center text-gray-400">
                                    <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                                    <span className="font-medium text-xs">Chargement des propositions éditoriales...</span>
                                </td>
                            </tr>
                        ) : proposals.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-16 text-center text-gray-400">
                                    <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <span className="font-semibold text-gray-600 block text-xs">Aucune proposition trouvée</span>
                                    <span className="text-[11px] text-gray-400 block mt-0.5">
                                        Lancez un lot d'enrichissement pour créer des fiches prêtes pour validation.
                                    </span>
                                </td>
                            </tr>
                        ) : (
                            proposals.map((proposal) => {
                                const product = proposal.product || {};
                                const productImage = product.images?.[0] || '/images/placeholder.png';
                                const isSelected = selectedIds.includes(proposal.id);

                                const hasShortDesc = !!proposal.shortDescription;
                                const hasClassicDesc = !!proposal.classicDescription;
                                const hasFeatures = Array.isArray(proposal.features) && proposal.features.length > 0;
                                const hasSpecs = proposal.specifications && Object.keys(proposal.specifications).length > 0;

                                return (
                                    <tr
                                        key={proposal.id}
                                        className={`hover:bg-gray-50/70 transition group ${
                                            isSelected ? 'bg-emerald-50/40' : ''
                                        }`}
                                    >
                                        <td className="py-3.5 px-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => handleToggleSelect(proposal.id)}
                                                className="rounded-md border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                                            />
                                        </td>

                                        {/* Product Info */}
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-11 h-11 rounded-xl bg-gray-100 relative overflow-hidden border border-gray-200 flex-shrink-0">
                                                    <Image
                                                        src={productImage}
                                                        alt={product.name || 'Produit'}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="max-w-md">
                                                    <span className="font-bold text-gray-900 line-clamp-1 block group-hover:text-emerald-700 transition">
                                                        {product.name}
                                                    </span>
                                                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-gray-400 mt-0.5">
                                                        <span>Réf : <strong>{product.reference || 'N/A'}</strong></span>
                                                        <span>•</span>
                                                        <span>{product.brand?.name || 'Sans marque'}</span>
                                                        <span>•</span>
                                                        <span>{product.category?.name || 'Sans catégorie'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Content Badges */}
                                        <td className="py-3.5 px-4">
                                            <div className="flex flex-wrap items-center gap-1">
                                                {hasShortDesc && (
                                                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold" title="Description courte générée">
                                                        Courte
                                                    </span>
                                                )}
                                                {hasClassicDesc && (
                                                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold" title="HTML Baraka généré">
                                                        HTML
                                                    </span>
                                                )}
                                                {hasFeatures && (
                                                    <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-bold" title={`${proposal.features.length} caractéristiques`}>
                                                        {proposal.features.length} pts
                                                    </span>
                                                )}
                                                {hasSpecs && (
                                                    <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold" title={`${Object.keys(proposal.specifications).length} spécifications techniques`}>
                                                        {Object.keys(proposal.specifications).length} specs
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                                                proposal.status === 'VALIDATED'
                                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                                    : proposal.status === 'FAILED'
                                                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                                                    : 'bg-amber-50 border-amber-200 text-amber-900'
                                            }`}>
                                                {proposal.status === 'VALIDATED' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                                                {proposal.status === 'TO_REVIEW' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                                                {proposal.status === 'FAILED' && <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
                                                {proposal.status === 'VALIDATED' ? 'Validé' : proposal.status === 'FAILED' ? 'Erreur' : 'À vérifier'}
                                            </span>
                                        </td>

                                        {/* Model IA */}
                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="font-mono text-[11px] text-gray-700 font-semibold flex items-center gap-1">
                                                    <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                                                    {proposal.modelUsed || 'gemini-3.6-flash'}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-mono">
                                                    {((proposal.promptTokens || 0) + (proposal.completionTokens || 0)).toLocaleString()} tokens
                                                </span>
                                            </div>
                                        </td>

                                        {/* Action Buttons */}
                                        <td className="py-3.5 px-6 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => setInspectingProposal(proposal)}
                                                    className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-gray-200 hover:border-emerald-300 shadow-sm"
                                                    title="Examiner en détail et éditer"
                                                >
                                                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                                    Examiner
                                                </button>

                                                {proposal.status !== 'VALIDATED' && (
                                                    <button
                                                        onClick={() => handleQuickApply(proposal)}
                                                        className="p-1.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 rounded-xl transition border border-emerald-200 shadow-sm"
                                                        title="Valider et injecter dans la fiche produit en 1-clic"
                                                    >
                                                        <Check className="w-4 h-4 stroke-[2.5]" />
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleQuickDelete(proposal.id)}
                                                    className="p-1.5 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-xl transition border border-transparent hover:border-rose-200"
                                                    title="Supprimer ce brouillon"
                                                >
                                                    <Trash2 className="w-4 h-4" />
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

            {/* Pagination Controls */}
            <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 bg-gray-50/50">
                <span className="font-medium">
                    Total : <strong>{total}</strong> proposition{total > 1 ? 's' : ''} • Page {page} sur {totalPages}
                </span>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 disabled:opacity-40 transition shadow-sm flex items-center gap-1"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Précédent
                    </button>
                    <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl font-black">
                        {page}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 disabled:opacity-40 transition shadow-sm flex items-center gap-1"
                    >
                        Suivant
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Modal Detail Inspection */}
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
