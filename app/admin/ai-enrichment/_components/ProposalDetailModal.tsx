'use client';

import React, { useState } from 'react';
import {
    X,
    Sparkles,
    Check,
    Save,
    Trash2,
    Eye,
    Code,
    CheckCircle2,
    AlertCircle,
    Copy,
    ExternalLink,
    Zap,
    Cpu,
    ArrowRightLeft,
    Clock,
    User
} from 'lucide-react';
import { toast } from 'sonner';
import {
    updateAiProposalContentAction,
    applyAiProposalAction,
    deleteAiProposalAction
} from '@/lib/actions/ai-enrichment-actions';
import Image from 'next/image';

interface ProposalDetailModalProps {
    proposal: any;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ProposalDetailModal({ proposal, isOpen, onClose, onSuccess }: ProposalDetailModalProps) {
    if (!isOpen || !proposal) return null;

    const product = proposal.product || {};
    const [activeTab, setActiveTab] = useState<'classic' | 'short' | 'general' | 'features' | 'specs'>('classic');
    const [htmlViewMode, setHtmlViewMode] = useState<'preview' | 'code'>('preview');

    // Local state for editable fields
    const [shortDescription, setShortDescription] = useState<string>(proposal.shortDescription || '');
    const [generalDescription, setGeneralDescription] = useState<string>(proposal.generalDescription || '');
    const [classicDescription, setClassicDescription] = useState<string>(proposal.classicDescription || '');
    const [features, setFeatures] = useState<string[]>(
        Array.isArray(proposal.features) ? proposal.features : []
    );
    const [newFeatureText, setNewFeatureText] = useState('');
    const [specifications, setSpecifications] = useState<Record<string, any>>(
        proposal.specifications && typeof proposal.specifications === 'object' ? proposal.specifications : {}
    );

    // Selected fields to apply
    const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({
        shortDescription: true,
        classicDescription: true,
        features: true,
        specifications: true
    });

    const [isSavingProposal, setIsSavingProposal] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Toggle field selection
    const toggleField = (field: string) => {
        setSelectedFields(prev => ({ ...prev, [field]: !prev[field] }));
    };

    // Feature manipulation
    const handleRemoveFeature = (idx: number) => {
        setFeatures(features.filter((_, i) => i !== idx));
    };

    const handleAddFeature = () => {
        if (!newFeatureText.trim()) return;
        setFeatures([...features, newFeatureText.trim()]);
        setNewFeatureText('');
    };

    // Spec key-value update
    const handleSpecChange = (key: string, value: string) => {
        setSpecifications(prev => ({ ...prev, [key]: value }));
    };

    // Save changes made to the AI proposal without applying to live product
    const handleSaveProposalOnly = async () => {
        setIsSavingProposal(true);
        try {
            const res = await updateAiProposalContentAction(proposal.id, {
                shortDescription,
                generalDescription,
                classicDescription,
                features,
                specifications
            });

            if (res.success) {
                toast.success("Proposition IA mise à jour avec succès.");
                onSuccess();
            } else {
                toast.error(res.error || "Erreur lors de la mise à jour.");
            }
        } catch (err: any) {
            toast.error(err?.message || "Erreur de connexion.");
        } finally {
            setIsSavingProposal(false);
        }
    };

    // Apply selected fields to the live product
    const handleApplyToProduct = async () => {
        const fieldsToApply = Object.entries(selectedFields)
            .filter(([_, checked]) => checked)
            .map(([field]) => field as 'shortDescription' | 'classicDescription' | 'generalDescription' | 'features' | 'specifications');

        if (fieldsToApply.length === 0) {
            toast.error("Veuillez sélectionner au moins un champ à injecter dans le produit.");
            return;
        }

        setIsApplying(true);
        try {
            // First update proposal in DB with user edits
            await updateAiProposalContentAction(proposal.id, {
                shortDescription,
                generalDescription,
                classicDescription,
                features,
                specifications
            });

            // Then apply to product
            const res = await applyAiProposalAction(product.id, fieldsToApply);
            if (res.success) {
                toast.success(`Les ${fieldsToApply.length} champs sélectionnés ont été appliqués au produit avec succès.`);
                onSuccess();
                onClose();
            } else {
                toast.error(res.error || "Erreur lors de l'application de la proposition.");
            }
        } catch (err: any) {
            toast.error(err?.message || "Erreur d'application.");
        } finally {
            setIsApplying(false);
        }
    };

    // Delete proposal
    const handleDeleteProposal = async () => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette proposition IA ?")) return;
        setIsDeleting(true);
        try {
            const res = await deleteAiProposalAction(proposal.id);
            if (res.success) {
                toast.success("Proposition supprimée.");
                onSuccess();
                onClose();
            } else {
                toast.error(res.error || "Erreur de suppression.");
            }
        } catch (err: any) {
            toast.error(err?.message || "Erreur.");
        } finally {
            setIsDeleting(false);
        }
    };

    const productImage = product.images?.[0] || '/images/placeholder.png';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 via-white to-emerald-50/30">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 relative overflow-hidden border border-gray-200 flex-shrink-0">
                            <Image
                                src={productImage}
                                alt={product.name || 'Produit'}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-gray-900 text-lg line-clamp-1 max-w-lg">
                                    {product.name}
                                </h3>
                                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                                    proposal.status === 'VALIDATED'
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                                }`}>
                                    {proposal.status === 'VALIDATED' ? '✓ Validé' : 'À vérifier'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                                <span>Réf: <strong>{product.reference || 'N/A'}</strong></span>
                                <span>•</span>
                                <span>{product.brand?.name || 'Sans marque'}</span>
                                <span>•</span>
                                <span>{product.category?.name || 'Sans catégorie'}</span>
                                {proposal.modelUsed && (
                                    <>
                                        <span>•</span>
                                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-mono">
                                            <Cpu className="w-3 h-3" /> {proposal.modelUsed}
                                        </span>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-700 rounded-xl transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Tabs & Field Selectors */}
                <div className="px-6 py-2.5 border-b border-gray-100 bg-gray-50/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setActiveTab('classic')}
                            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                                activeTab === 'classic'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            Description classique (HTML)
                        </button>
                        <button
                            onClick={() => setActiveTab('short')}
                            className={`px-3 py-1.5 rounded-lg font-medium transition ${
                                activeTab === 'short'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                            Description courte
                        </button>
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`px-3 py-1.5 rounded-lg font-medium transition ${
                                activeTab === 'general'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                            Description générale
                        </button>
                        <button
                            onClick={() => setActiveTab('features')}
                            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1 ${
                                activeTab === 'features'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                            <Zap className="w-3.5 h-3.5" />
                            Caractéristiques ({features.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('specs')}
                            className={`px-3 py-1.5 rounded-lg font-medium transition ${
                                activeTab === 'specs'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                            Fiche technique ({Object.keys(specifications).length})
                        </button>
                    </div>

                    {/* Checkbox pills for application */}
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-medium">À injecter:</span>
                        {[
                            { key: 'shortDescription', label: 'Courte' },
                            { key: 'classicDescription', label: 'Classique' },
                            { key: 'features', label: 'Caract.' },
                            { key: 'specifications', label: 'Technique' }
                        ].map(({ key, label }) => (
                            <label
                                key={key}
                                className={`cursor-pointer inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold border transition select-none ${
                                    selectedFields[key]
                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                        : 'bg-white border-gray-200 text-gray-400'
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={!!selectedFields[key]}
                                    onChange={() => toggleField(key)}
                                    className="hidden"
                                />
                                {selectedFields[key] ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-3 h-3 block" />}
                                {label}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Content body with side-by-side comparison */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Tab 1: Classic Description (HTML) */}
                    {activeTab === 'classic' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                            {/* Current Product Content */}
                            <div className="flex flex-col border border-gray-200 rounded-xl bg-gray-50/50 p-4 overflow-hidden">
                                <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-200">
                                    <span className="font-semibold text-gray-700 text-xs uppercase tracking-wider">
                                        Contenu actuel du produit
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {product.description ? `${product.description.length} car.` : 'Vide'}
                                    </span>
                                </div>
                                <div className="flex-1 overflow-y-auto bg-white rounded-lg p-3 border border-gray-200 text-sm text-gray-700 font-sans prose prose-sm max-w-none">
                                    {product.description ? (
                                        <div dangerouslySetInnerHTML={{ __html: product.description }} />
                                    ) : (
                                        <p className="text-gray-400 italic text-center py-12">
                                            Aucune description classique renseignée sur le produit.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* AI Generated Proposal */}
                            <div className="flex flex-col border border-emerald-200 rounded-xl bg-emerald-50/20 p-4 overflow-hidden">
                                <div className="flex items-center justify-between pb-2 mb-3 border-b border-emerald-200">
                                    <div className="flex items-center gap-1.5 font-semibold text-emerald-900 text-xs uppercase tracking-wider">
                                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                        Proposition IA (Éditable)
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex bg-white rounded-md p-0.5 border border-emerald-200 text-xs">
                                            <button
                                                onClick={() => setHtmlViewMode('preview')}
                                                className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 ${
                                                    htmlViewMode === 'preview'
                                                        ? 'bg-emerald-600 text-white'
                                                        : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                            >
                                                <Eye className="w-3 h-3" /> Rendu
                                            </button>
                                            <button
                                                onClick={() => setHtmlViewMode('code')}
                                                className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 ${
                                                    htmlViewMode === 'code'
                                                        ? 'bg-emerald-600 text-white'
                                                        : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                            >
                                                <Code className="w-3 h-3" /> Code HTML
                                            </button>
                                        </div>
                                        <span className="text-xs text-emerald-700 font-mono">
                                            {classicDescription.length} car.
                                        </span>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col overflow-hidden">
                                    {htmlViewMode === 'preview' ? (
                                        <div className="flex-1 overflow-y-auto bg-white rounded-lg p-3 border border-emerald-300 text-sm text-gray-800 prose prose-sm max-w-none">
                                            <div dangerouslySetInnerHTML={{ __html: classicDescription }} />
                                        </div>
                                    ) : (
                                        <textarea
                                            value={classicDescription}
                                            onChange={(e) => setClassicDescription(e.target.value)}
                                            className="w-full flex-1 p-3 text-xs font-mono bg-white border border-emerald-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                            rows={12}
                                            placeholder="Code HTML de la description classique..."
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Short Description */}
                    {activeTab === 'short' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="border border-gray-200 rounded-xl bg-gray-50/50 p-4">
                                <span className="font-semibold text-gray-700 text-xs uppercase tracking-wider block mb-2">
                                    Description courte actuelle
                                </span>
                                <div className="bg-white rounded-lg p-4 border border-gray-200 text-sm text-gray-700 min-h-[140px]">
                                    {product.shortDescription || (
                                        <span className="text-gray-400 italic">Non renseignée</span>
                                    )}
                                </div>
                            </div>

                            <div className="border border-emerald-200 rounded-xl bg-emerald-50/20 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-emerald-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                        Proposition IA (Éditable)
                                    </span>
                                    <span className="text-xs text-emerald-700 font-mono">
                                        {shortDescription.length} car.
                                    </span>
                                </div>
                                <textarea
                                    value={shortDescription}
                                    onChange={(e) => setShortDescription(e.target.value)}
                                    className="w-full p-3 text-sm bg-white border border-emerald-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[140px]"
                                    placeholder="Description courte percutante..."
                                />
                            </div>
                        </div>
                    )}

                    {/* Tab 3: General Description */}
                    {activeTab === 'general' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="border border-gray-200 rounded-xl bg-gray-50/50 p-4">
                                <span className="font-semibold text-gray-700 text-xs uppercase tracking-wider block mb-2">
                                    Description générale actuelle
                                </span>
                                <div className="bg-white rounded-lg p-4 border border-gray-200 text-sm text-gray-700 min-h-[180px]">
                                    {product.description ? (
                                        <div dangerouslySetInnerHTML={{ __html: product.description }} />
                                    ) : (
                                        <span className="text-gray-400 italic">Non renseignée</span>
                                    )}
                                </div>
                            </div>

                            <div className="border border-emerald-200 rounded-xl bg-emerald-50/20 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-emerald-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                        Proposition IA (Éditable)
                                    </span>
                                    <span className="text-xs text-emerald-700 font-mono">
                                        {generalDescription.length} car.
                                    </span>
                                </div>
                                <textarea
                                    value={generalDescription}
                                    onChange={(e) => setGeneralDescription(e.target.value)}
                                    className="w-full p-3 text-sm bg-white border border-emerald-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[180px]"
                                    placeholder="Description générale..."
                                />
                            </div>
                        </div>
                    )}

                    {/* Tab 4: Features */}
                    {activeTab === 'features' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="border border-gray-200 rounded-xl bg-gray-50/50 p-4">
                                <span className="font-semibold text-gray-700 text-xs uppercase tracking-wider block mb-3">
                                    Caractéristiques actuelles
                                </span>
                                <div className="space-y-2">
                                    {Array.isArray(product.features) && product.features.length > 0 ? (
                                        product.features.map((feat: string, i: number) => (
                                            <div key={i} className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-gray-200 text-xs text-gray-800">
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                                                <span>{feat}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-400 italic text-xs py-4 text-center">Aucune caractéristique renseignée.</p>
                                    )}
                                </div>
                            </div>

                            <div className="border border-emerald-200 rounded-xl bg-emerald-50/20 p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-semibold text-emerald-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                                        <Zap className="w-3.5 h-3.5 text-emerald-600" />
                                        Proposition IA ({features.length} points)
                                    </span>
                                </div>

                                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                                    {features.map((feat, idx) => (
                                        <div key={idx} className="flex items-start justify-between gap-2 bg-white p-2.5 rounded-lg border border-emerald-200 text-xs text-gray-900 group">
                                            <div className="flex items-start gap-2 flex-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                                                <input
                                                    type="text"
                                                    value={feat}
                                                    onChange={(e) => {
                                                        const updated = [...features];
                                                        updated[idx] = e.target.value;
                                                        setFeatures(updated);
                                                    }}
                                                    className="w-full bg-transparent border-0 p-0 text-xs text-gray-900 focus:ring-0 focus:outline-none"
                                                />
                                            </div>
                                            <button
                                                onClick={() => handleRemoveFeature(idx)}
                                                className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100 p-0.5"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-emerald-200">
                                    <input
                                        type="text"
                                        value={newFeatureText}
                                        onChange={(e) => setNewFeatureText(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddFeature()}
                                        placeholder="Ajouter une caractéristique..."
                                        className="flex-1 px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                    <button
                                        onClick={handleAddFeature}
                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
                                    >
                                        Ajouter
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 5: Specifications */}
                    {activeTab === 'specs' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="border border-gray-200 rounded-xl bg-gray-50/50 p-4">
                                <span className="font-semibold text-gray-700 text-xs uppercase tracking-wider block mb-3">
                                    Fiche technique actuelle
                                </span>
                                <div className="space-y-1.5 max-h-[380px] overflow-y-auto">
                                    {product.metadata && typeof product.metadata === 'object' && Object.keys(product.metadata).filter(k => k !== '_order').length > 0 ? (
                                        Object.entries(product.metadata)
                                            .filter(([k]) => k !== '_order')
                                            .map(([key, val]: [string, any], idx) => (
                                                <div key={idx} className="flex justify-between py-1.5 px-3 bg-white rounded border border-gray-200 text-xs">
                                                    <span className="font-medium text-gray-600">{key}</span>
                                                    <span className="text-gray-900 font-mono text-right">{String(val)}</span>
                                                </div>
                                            ))
                                    ) : (
                                        <p className="text-gray-400 italic text-xs py-4 text-center">Aucune fiche technique renseignée.</p>
                                    )}
                                </div>
                            </div>

                            <div className="border border-emerald-200 rounded-xl bg-emerald-50/20 p-4">
                                <span className="font-semibold text-emerald-900 text-xs uppercase tracking-wider block mb-3">
                                    Fiche technique IA normalisée ({Object.keys(specifications).length} attributs)
                                </span>
                                <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                                    {Object.entries(specifications).map(([key, val], idx) => (
                                        <div key={idx} className="flex items-center justify-between py-1 px-2.5 bg-white rounded border border-emerald-200 text-xs gap-3">
                                            <span className="font-medium text-gray-700 w-1/3 truncate" title={key}>{key}</span>
                                            <input
                                                type="text"
                                                value={String(val)}
                                                onChange={(e) => handleSpecChange(key, e.target.value)}
                                                className="w-2/3 px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs font-mono text-gray-900 focus:bg-white focus:ring-1 focus:ring-emerald-500"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                    <button
                        onClick={handleDeleteProposal}
                        disabled={isDeleting}
                        className="px-3 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition flex items-center gap-1.5"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        {isDeleting ? "Suppression..." : "Rejeter la proposition"}
                    </button>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSaveProposalOnly}
                            disabled={isSavingProposal}
                            className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                        >
                            <Save className="w-3.5 h-3.5" />
                            {isSavingProposal ? "Enregistrement..." : "Enregistrer la proposition"}
                        </button>

                        <button
                            onClick={handleApplyToProduct}
                            disabled={isApplying}
                            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition flex items-center gap-2 shadow-sm"
                        >
                            <Check className="w-4 h-4" />
                            {isApplying ? "Application..." : "Appliquer au produit"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
