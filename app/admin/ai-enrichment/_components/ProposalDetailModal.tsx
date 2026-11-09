'use client';

import React, { useState, useEffect } from 'react';
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
    Clock,
    Globe,
    Layers,
    FileText,
    ListPlus,
    SlidersHorizontal,
    CheckSquare,
    Square,
    Package,
    Plus,
    Loader2,
    Calendar,
    ArrowRight,
    Tag
} from 'lucide-react';
import { toast } from 'sonner';
import {
    updateAiProposalContentAction,
    applyAiProposalAction,
    deleteAiProposalAction
} from '@/lib/actions/ai-enrichment-actions';
import Image from 'next/image';
import Link from 'next/link';

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
    const [newSpecKey, setNewSpecKey] = useState('');
    const [newSpecValue, setNewSpecValue] = useState('');
    const [isAddingSpec, setIsAddingSpec] = useState(false);
    const [specSearch, setSpecSearch] = useState('');

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

    // Lock body scroll & escape listener
    useEffect(() => {
        if (!isOpen) return;
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = originalStyle;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    // Toggle field selection
    const toggleField = (field: string) => {
        setSelectedFields(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const selectAllFields = (val: boolean) => {
        setSelectedFields({
            shortDescription: val,
            classicDescription: val,
            features: val,
            specifications: val
        });
    };

    const selectedCount = Object.values(selectedFields).filter(Boolean).length;

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

    const handleRemoveSpec = (key: string) => {
        setSpecifications(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };

    const handleAddSpec = () => {
        if (!newSpecKey.trim()) return;
        setSpecifications(prev => ({
            ...prev,
            [newSpecKey.trim()]: newSpecValue.trim()
        }));
        setNewSpecKey('');
        setNewSpecValue('');
        setIsAddingSpec(false);
    };

    // Copy helper
    const handleCopy = (text: string, label: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast.success(`${label} copié dans le presse-papier !`);
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
                toast.success("Proposition IA enregistrée avec succès.");
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
                toast.success(`Les ${fieldsToApply.length} champ(s) sélectionné(s) ont été appliqués au produit avec succès.`);
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

    const productImage = product.images?.[0] || null;

    // Filtered specs
    const filteredSpecs = Object.entries(specifications).filter(([k, v]) => {
        if (!specSearch.trim()) return true;
        const q = specSearch.toLowerCase();
        return k.toLowerCase().includes(q) || String(v).toLowerCase().includes(q);
    });

    const isCurrentProductEmpty = (tab: typeof activeTab) => {
        switch (tab) {
            case 'classic':
                return !product.description || product.description.trim() === '';
            case 'short':
                return !product.shortDescription || product.shortDescription.trim() === '';
            case 'general':
                return !product.description || product.description.trim() === '';
            case 'features':
                return !Array.isArray(product.features) || product.features.length === 0;
            case 'specs':
                return !product.metadata || typeof product.metadata !== 'object' || Object.keys(product.metadata).filter(k => k !== '_order').length === 0;
        }
    };

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-6xl xl:max-w-7xl h-[92vh] max-h-[940px] flex flex-col overflow-hidden ring-1 ring-black/5 animate-in zoom-in-95 duration-200">
                {/* 1. Enhanced Modal Header */}
                <div className="px-6 py-4 border-b border-slate-200/80 bg-gradient-to-r from-slate-50 via-white to-emerald-50/40 flex items-center justify-between gap-4 flex-shrink-0">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                        {/* Thumbnail */}
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 relative overflow-hidden border border-slate-200/80 flex-shrink-0 shadow-xs flex items-center justify-center">
                            {productImage ? (
                                <Image
                                    src={productImage}
                                    alt={product.name || 'Produit'}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <Package className="w-6 h-6 text-slate-400" />
                            )}
                        </div>

                        {/* Title & Metadata chips */}
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h3 className="font-bold text-slate-900 text-lg sm:text-xl truncate tracking-tight" title={product.name}>
                                    {product.name || 'Produit sans titre'}
                                </h3>

                                {/* Status Badge */}
                                <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold border shadow-2xs ${
                                    proposal.status === 'VALIDATED'
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                        proposal.status === 'VALIDATED' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                                    }`} />
                                    {proposal.status === 'VALIDATED' ? 'Validé' : 'À vérifier'}
                                </span>

                                {product.id && (
                                    <Link
                                        href={`/admin/products?search=${encodeURIComponent(product.reference || product.name || '')}`}
                                        target="_blank"
                                        className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-emerald-700 hover:underline transition"
                                        title="Voir dans le catalogue produits"
                                    >
                                        <ExternalLink className="w-3 h-3" /> Fiche produit
                                    </Link>
                                )}
                            </div>

                            {/* Meta items */}
                            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 mt-1">
                                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono text-[11px]">
                                    <Tag className="w-3 h-3 text-slate-400" />
                                    {product.reference || 'Réf: N/A'}
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="font-medium text-slate-700">{product.brand?.name || 'Sans marque'}</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-slate-600">{product.category?.name || 'Sans catégorie'}</span>

                                {proposal.modelUsed && (
                                    <>
                                        <span className="text-slate-300">•</span>
                                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50/80 border border-emerald-200/60 px-2 py-0.5 rounded-md font-mono text-[11px]">
                                            <Cpu className="w-3 h-3 text-emerald-600" />
                                            {proposal.modelUsed}
                                        </span>
                                    </>
                                )}

                                {proposal.generatedAt && (
                                    <>
                                        <span className="text-slate-300">•</span>
                                        <span className="inline-flex items-center gap-1 text-slate-400 text-[11px]">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(proposal.generatedAt).toLocaleDateString('fr-FR', {
                                                day: '2-digit',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Close action */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            onClick={onClose}
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100/80 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
                            title="Fermer (Échap)"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* 2. Unified Navigation & Injection Toolbar */}
                <div className="px-6 py-2.5 border-b border-slate-200/80 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0">
                    {/* Segmented Tabs */}
                    <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('classic')}
                            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                                activeTab === 'classic'
                                    ? 'bg-white text-emerald-700 shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                            }`}
                        >
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            Description classique (HTML)
                        </button>

                        <button
                            onClick={() => setActiveTab('short')}
                            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                                activeTab === 'short'
                                    ? 'bg-white text-emerald-700 shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                            }`}
                        >
                            <FileText className="w-3.5 h-3.5" />
                            Description courte
                        </button>

                        <button
                            onClick={() => setActiveTab('general')}
                            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                                activeTab === 'general'
                                    ? 'bg-white text-emerald-700 shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                            }`}
                        >
                            <Layers className="w-3.5 h-3.5" />
                            Description générale
                        </button>

                        <button
                            onClick={() => setActiveTab('features')}
                            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                                activeTab === 'features'
                                    ? 'bg-white text-emerald-700 shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                            }`}
                        >
                            <ListPlus className="w-3.5 h-3.5" />
                            Caractéristiques
                            <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-slate-200">
                                {features.length}
                            </span>
                        </button>

                        <button
                            onClick={() => setActiveTab('specs')}
                            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                                activeTab === 'specs'
                                    ? 'bg-white text-emerald-700 shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                            }`}
                        >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            Fiche technique
                            <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-slate-200">
                                {Object.keys(specifications).length}
                            </span>
                        </button>
                    </div>

                    {/* Injection selector group */}
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
                        <div className="flex items-center gap-1.5">
                            <span className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                                Synchronisation :
                            </span>
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/60">
                                {selectedCount}/4
                            </span>
                        </div>

                        <div className="h-4 w-px bg-slate-200 mx-1" />

                        <div className="flex items-center gap-1.5">
                            {[
                                { key: 'shortDescription', label: 'Courte' },
                                { key: 'classicDescription', label: 'Classique' },
                                { key: 'features', label: 'Caract.' },
                                { key: 'specifications', label: 'Technique' }
                            ].map(({ key, label }) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => toggleField(key)}
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all select-none cursor-pointer ${
                                        selectedFields[key]
                                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs'
                                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                                    }`}
                                >
                                    {selectedFields[key] ? (
                                        <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                                    ) : (
                                        <span className="w-3 h-3 rounded-xs border border-slate-300 block" />
                                    )}
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className="h-4 w-px bg-slate-200 mx-1" />

                        <button
                            type="button"
                            onClick={() => selectAllFields(selectedCount !== 4)}
                            className="text-[11px] font-medium text-slate-500 hover:text-emerald-700 hover:underline transition px-1"
                        >
                            {selectedCount === 4 ? 'Tout désélectionner' : 'Tout cocher'}
                        </button>
                    </div>
                </div>

                {/* 3. Main Workspace - Two-Column Side-by-Side Comparison */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50/40">
                    {/* Tab 1: Classic Description (HTML) */}
                    {activeTab === 'classic' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 h-full min-h-[480px]">
                            {/* Left Panel: Current Product */}
                            <div className="flex flex-col border border-slate-200 rounded-2xl bg-white shadow-xs overflow-hidden">
                                <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-slate-200/80 flex items-center justify-center text-slate-600">
                                            <Globe className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                                            Actuellement en ligne
                                        </span>
                                    </div>
                                    <span className="text-xs font-mono text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                                        {product.description ? `${product.description.length} car.` : 'Vide'}
                                    </span>
                                </div>

                                <div className="flex-1 overflow-y-auto p-5 text-sm text-slate-700">
                                    {product.description ? (
                                        <div 
                                            className="prose prose-sm prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:leading-relaxed prose-li:my-0.5"
                                            dangerouslySetInnerHTML={{ __html: product.description }} 
                                        />
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                                                <Layers className="w-6 h-6" />
                                            </div>
                                            <p className="font-semibold text-slate-600 text-sm">Aucune description classique renseignée</p>
                                            <p className="text-xs text-slate-400 max-w-xs mt-1">
                                                Ce champ est actuellement vide sur votre boutique. L'application de la proposition IA viendra enrichir votre fiche produit.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Panel: AI Proposal */}
                            <div className="flex flex-col border-2 border-emerald-300 rounded-2xl bg-white shadow-sm overflow-hidden ring-4 ring-emerald-500/5">
                                <div className="px-4 py-2.5 bg-gradient-to-r from-emerald-50 via-emerald-50/60 to-white border-b border-emerald-200 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                                            <Sparkles className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                            <span className="font-bold text-emerald-950 text-xs uppercase tracking-wider block">
                                                Proposition IA
                                            </span>
                                            <span className="text-[10px] text-emerald-700">Contenu enrichi et éditable</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {/* View Switcher: Preview vs Code */}
                                        <div className="flex bg-white rounded-lg p-0.5 border border-emerald-200 shadow-2xs text-xs">
                                            <button
                                                type="button"
                                                onClick={() => setHtmlViewMode('preview')}
                                                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                                                    htmlViewMode === 'preview'
                                                        ? 'bg-emerald-600 text-white shadow-2xs'
                                                        : 'text-slate-600 hover:text-slate-900'
                                                }`}
                                            >
                                                <Eye className="w-3.5 h-3.5" /> Rendu
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setHtmlViewMode('code')}
                                                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                                                    htmlViewMode === 'code'
                                                        ? 'bg-emerald-600 text-white shadow-2xs'
                                                        : 'text-slate-600 hover:text-slate-900'
                                                }`}
                                            >
                                                <Code className="w-3.5 h-3.5" /> Code HTML
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleCopy(classicDescription, "Code HTML de la description")}
                                            className="p-1.5 rounded-lg border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-700 transition"
                                            title="Copier le contenu"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                        </button>

                                        <span className="text-xs font-mono text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold">
                                            {classicDescription.length} car.
                                        </span>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col overflow-hidden bg-white">
                                    {htmlViewMode === 'preview' ? (
                                        <div className="flex-1 overflow-y-auto p-5 text-sm text-slate-800">
                                            <div 
                                                className="prose prose-sm prose-slate max-w-none prose-headings:text-slate-900 prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-base prose-h3:text-sm prose-p:leading-relaxed prose-ul:my-2 prose-li:my-0.5"
                                                dangerouslySetInnerHTML={{ __html: classicDescription }} 
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col p-4 bg-slate-900 text-emerald-400">
                                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400 font-mono">
                                                <span>Éditeur HTML direct</span>
                                                <span>Balises supportées: &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;</span>
                                            </div>
                                            <textarea
                                                value={classicDescription}
                                                onChange={(e) => setClassicDescription(e.target.value)}
                                                className="w-full flex-1 p-3 text-xs font-mono bg-slate-950 border border-slate-800 rounded-xl text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none leading-relaxed"
                                                placeholder="Code HTML de la description classique..."
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Short Description */}
                    {activeTab === 'short' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 h-full">
                            {/* Current */}
                            <div className="flex flex-col border border-slate-200 rounded-2xl bg-white shadow-xs overflow-hidden">
                                <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-slate-200/80 flex items-center justify-center text-slate-600">
                                            <Globe className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                                            Description courte en ligne
                                        </span>
                                    </div>
                                    <span className="text-xs font-mono text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                                        {product.shortDescription ? `${product.shortDescription.length} car.` : 'Vide'}
                                    </span>
                                </div>
                                <div className="p-5 flex-1 flex flex-col justify-center">
                                    {product.shortDescription ? (
                                        <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                                            {product.shortDescription}
                                        </p>
                                    ) : (
                                        <div className="text-center py-12 text-slate-400">
                                            <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                                            <p className="font-medium text-slate-600 text-sm">Aucune description courte renseignée</p>
                                            <p className="text-xs text-slate-400 mt-1">Utilisée pour les aperçus cartes et le SEO.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Proposal */}
                            <div className="flex flex-col border-2 border-emerald-300 rounded-2xl bg-white shadow-sm overflow-hidden ring-4 ring-emerald-500/5">
                                <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-white border-b border-emerald-200 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                                            <Sparkles className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="font-bold text-emerald-950 text-xs uppercase tracking-wider">
                                            Proposition IA (Éditable)
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(shortDescription, "Description courte")}
                                            className="p-1 rounded-md border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-700"
                                            title="Copier"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                        </button>
                                        <span className="text-xs font-mono text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold">
                                            {shortDescription.length} car.
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <textarea
                                        value={shortDescription}
                                        onChange={(e) => setShortDescription(e.target.value)}
                                        className="w-full flex-1 min-h-[220px] p-4 text-sm bg-white border border-emerald-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed shadow-xs"
                                        placeholder="Description courte percutante..."
                                    />
                                    <p className="text-[11px] text-slate-400 mt-2">
                                        Conseil : gardez la description courte entre 120 et 200 caractères pour maximiser l'impact SEO et sur mobile.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 3: General Description */}
                    {activeTab === 'general' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 h-full">
                            {/* Current */}
                            <div className="flex flex-col border border-slate-200 rounded-2xl bg-white shadow-xs overflow-hidden">
                                <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-slate-200/80 flex items-center justify-center text-slate-600">
                                            <Globe className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                                            Description générale en ligne
                                        </span>
                                    </div>
                                    <span className="text-xs font-mono text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                                        {product.description ? `${product.description.length} car.` : 'Vide'}
                                    </span>
                                </div>
                                <div className="p-5 flex-1 overflow-y-auto">
                                    {product.description ? (
                                        <div 
                                            className="prose prose-sm prose-slate max-w-none text-slate-700"
                                            dangerouslySetInnerHTML={{ __html: product.description }} 
                                        />
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                                            <Layers className="w-10 h-10 text-slate-300 mb-2" />
                                            <p className="font-medium text-slate-600 text-sm">Aucune description générale renseignée</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Proposal */}
                            <div className="flex flex-col border-2 border-emerald-300 rounded-2xl bg-white shadow-sm overflow-hidden ring-4 ring-emerald-500/5">
                                <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-white border-b border-emerald-200 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                                            <Sparkles className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="font-bold text-emerald-950 text-xs uppercase tracking-wider">
                                            Proposition IA (Éditable)
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(generalDescription, "Description générale")}
                                            className="p-1 rounded-md border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-700"
                                            title="Copier"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                        </button>
                                        <span className="text-xs font-mono text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold">
                                            {generalDescription.length} car.
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <textarea
                                        value={generalDescription}
                                        onChange={(e) => setGeneralDescription(e.target.value)}
                                        className="w-full flex-1 min-h-[220px] p-4 text-sm bg-white border border-emerald-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed shadow-xs"
                                        placeholder="Description générale textuelle..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 4: Features */}
                    {activeTab === 'features' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 h-full">
                            {/* Current */}
                            <div className="flex flex-col border border-slate-200 rounded-2xl bg-white shadow-xs overflow-hidden">
                                <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-slate-200/80 flex items-center justify-center text-slate-600">
                                            <Globe className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                                            Caractéristiques en ligne
                                        </span>
                                    </div>
                                    <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                        {Array.isArray(product.features) ? product.features.length : 0} points
                                    </span>
                                </div>

                                <div className="p-5 flex-1 overflow-y-auto">
                                    {Array.isArray(product.features) && product.features.length > 0 ? (
                                        <div className="space-y-2">
                                            {product.features.map((feat: string, i: number) => (
                                                <div key={i} className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-800">
                                                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                                                        {i + 1}
                                                    </span>
                                                    <span className="leading-relaxed">{feat}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                                            <ListPlus className="w-10 h-10 text-slate-300 mb-2" />
                                            <p className="font-medium text-slate-600 text-sm">Aucune caractéristique renseignée</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Proposal */}
                            <div className="flex flex-col border-2 border-emerald-300 rounded-2xl bg-white shadow-sm overflow-hidden ring-4 ring-emerald-500/5">
                                <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-white border-b border-emerald-200 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                                            <Zap className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                            <span className="font-bold text-emerald-950 text-xs uppercase tracking-wider block">
                                                Points clés générés
                                            </span>
                                            <span className="text-[10px] text-emerald-700">Avantages et arguments de vente</span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-md">
                                        {features.length} points
                                    </span>
                                </div>

                                <div className="p-5 flex-1 flex flex-col overflow-hidden">
                                    <div className="space-y-2 flex-1 overflow-y-auto pr-1">
                                        {features.map((feat, idx) => (
                                            <div key={idx} className="flex items-center justify-between gap-2.5 bg-slate-50 hover:bg-emerald-50/40 p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 transition text-xs text-slate-900 group">
                                                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                                                    {idx + 1}
                                                </span>
                                                <input
                                                    type="text"
                                                    value={feat}
                                                    onChange={(e) => {
                                                        const updated = [...features];
                                                        updated[idx] = e.target.value;
                                                        setFeatures(updated);
                                                    }}
                                                    className="w-full bg-transparent border-0 p-0 text-xs text-slate-800 focus:ring-0 focus:outline-none font-medium"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveFeature(idx)}
                                                    className="w-6 h-6 rounded-md hover:bg-rose-100 text-slate-300 hover:text-rose-600 transition flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100"
                                                    title="Supprimer ce point"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add feature input */}
                                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-200">
                                        <input
                                            type="text"
                                            value={newFeatureText}
                                            onChange={(e) => setNewFeatureText(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddFeature()}
                                            placeholder="Ajouter une caractéristique percutante..."
                                            className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddFeature}
                                            disabled={!newFeatureText.trim()}
                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            Ajouter
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 5: Specifications */}
                    {activeTab === 'specs' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 h-full">
                            {/* Current */}
                            <div className="flex flex-col border border-slate-200 rounded-2xl bg-white shadow-xs overflow-hidden">
                                <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-slate-200/80 flex items-center justify-center text-slate-600">
                                            <Globe className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                                            Fiche technique en ligne
                                        </span>
                                    </div>
                                    <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                        {product.metadata && typeof product.metadata === 'object'
                                            ? Object.keys(product.metadata).filter(k => k !== '_order').length
                                            : 0} attributs
                                    </span>
                                </div>

                                <div className="p-5 flex-1 overflow-y-auto">
                                    {product.metadata && typeof product.metadata === 'object' && Object.keys(product.metadata).filter(k => k !== '_order').length > 0 ? (
                                        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                                            {Object.entries(product.metadata)
                                                .filter(([k]) => k !== '_order')
                                                .map(([key, val]: [string, any], idx) => (
                                                    <div key={idx} className="flex justify-between items-center py-2 px-3 text-xs">
                                                        <span className="font-medium text-slate-600">{key}</span>
                                                        <span className="text-slate-900 font-mono text-right bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60">
                                                            {String(val)}
                                                        </span>
                                                    </div>
                                                ))}
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                                            <SlidersHorizontal className="w-10 h-10 text-slate-300 mb-2" />
                                            <p className="font-medium text-slate-600 text-sm">Aucune fiche technique renseignée</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Proposal */}
                            <div className="flex flex-col border-2 border-emerald-300 rounded-2xl bg-white shadow-sm overflow-hidden ring-4 ring-emerald-500/5">
                                <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-white border-b border-emerald-200 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                                            <SlidersHorizontal className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                            <span className="font-bold text-emerald-950 text-xs uppercase tracking-wider block">
                                                Fiche technique IA normalisée
                                            </span>
                                            <span className="text-[10px] text-emerald-700">Attributs structurés clé-valeur</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingSpec(!isAddingSpec)}
                                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition flex items-center gap-1 shadow-2xs"
                                        >
                                            <Plus className="w-3 h-3" /> Attribut
                                        </button>
                                        <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-md">
                                            {Object.keys(specifications).length}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4 flex-1 flex flex-col overflow-hidden">
                                    {/* New spec row form */}
                                    {isAddingSpec && (
                                        <div className="p-3 mb-3 bg-emerald-50/70 border border-emerald-300 rounded-xl flex items-center gap-2 animate-in fade-in duration-150">
                                            <input
                                                type="text"
                                                value={newSpecKey}
                                                onChange={(e) => setNewSpecKey(e.target.value)}
                                                placeholder="Propriété (ex: Autonomie)"
                                                className="w-1/2 px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                            />
                                            <input
                                                type="text"
                                                value={newSpecValue}
                                                onChange={(e) => setNewSpecValue(e.target.value)}
                                                placeholder="Valeur (ex: 8 heures)"
                                                className="w-1/2 px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddSpec}
                                                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                                            >
                                                Ajouter
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsAddingSpec(false)}
                                                className="p-1.5 text-slate-400 hover:text-slate-600"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}

                                    {/* Specs table */}
                                    <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
                                        {Object.entries(specifications).map(([key, val], idx) => (
                                            <div 
                                                key={idx} 
                                                className="flex items-center justify-between py-1.5 px-3 bg-slate-50 hover:bg-emerald-50/40 rounded-xl border border-slate-200 hover:border-emerald-300 transition text-xs gap-3 group"
                                            >
                                                <span className="font-semibold text-slate-700 w-1/3 truncate" title={key}>
                                                    {key}
                                                </span>
                                                <input
                                                    type="text"
                                                    value={String(val)}
                                                    onChange={(e) => handleSpecChange(key, e.target.value)}
                                                    className="w-2/3 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSpec(key)}
                                                    className="w-6 h-6 rounded-md hover:bg-rose-100 text-slate-300 hover:text-rose-600 transition flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100"
                                                    title="Supprimer cet attribut"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 4. Enhanced Footer Controls */}
                <div className="px-6 py-4 border-t border-slate-200/80 bg-white flex flex-wrap items-center justify-between gap-4 flex-shrink-0">
                    {/* Left: Danger Action */}
                    <button
                        onClick={handleDeleteProposal}
                        disabled={isDeleting}
                        className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                        {isDeleting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                        )}
                        {isDeleting ? "Suppression en cours..." : "Rejeter la proposition"}
                    </button>

                    {/* Right: Primary & Secondary Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSaveProposalOnly}
                            disabled={isSavingProposal}
                            className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition flex items-center gap-2 shadow-2xs cursor-pointer disabled:opacity-50"
                        >
                            {isSavingProposal ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
                            ) : (
                                <Save className="w-3.5 h-3.5 text-slate-500" />
                            )}
                            {isSavingProposal ? "Enregistrement..." : "Sauvegarder les modifications"}
                        </button>

                        <button
                            onClick={handleApplyToProduct}
                            disabled={isApplying || selectedCount === 0}
                            className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl transition flex items-center gap-2 shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isApplying ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Check className="w-4 h-4 stroke-[3]" />
                            )}
                            {isApplying ? "Application..." : `Appliquer au produit (${selectedCount} champ${selectedCount > 1 ? 's' : ''})`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
