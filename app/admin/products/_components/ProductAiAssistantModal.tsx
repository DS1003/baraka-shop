'use client';

import React, { useState, useEffect } from 'react';
import {
    Sparkles,
    X,
    Loader2,
    RefreshCw,
    Check,
    Eye,
    Code,
    Sliders,
    Layers,
    FileText,
    ListChecks,
    Table,
    ArrowRight,
    AlertCircle,
    Info,
    ShieldCheck,
    Copy,
    Wand2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
    generateProductAiContentAction,
    regenerateAiFieldAction,
    saveAiProposalAction
} from '@/lib/actions/ai-enrichment-actions';
import { EnrichmentOutput } from '@/lib/ai/product-enrichment-service';

interface ProductAiAssistantModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId?: string;
    productName: string;
    brandName?: string;
    categoryName?: string;
    subCategoryName?: string;
    categoryId?: string;
    brandId?: string;
    reference?: string;
    currentShortDescription?: string;
    currentDescription?: string;
    currentFeatures?: string[];
    currentSpecsText?: string;
    onApplyToForm: (data: {
        shortDescription?: string;
        description?: string;
        features?: string[];
        specsText?: string;
    }) => void;
}

export function ProductAiAssistantModal({
    isOpen,
    onClose,
    productId,
    productName,
    brandName,
    categoryName,
    subCategoryName,
    categoryId,
    brandId,
    reference,
    currentShortDescription = '',
    currentDescription = '',
    currentFeatures = [],
    currentSpecsText = '',
    onApplyToForm
}: ProductAiAssistantModalProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [regeneratingField, setRegeneratingField] = useState<string | null>(null);
    const [customInstructions, setCustomInstructions] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'short' | 'classic' | 'features' | 'specs'>('all');
    const [classicViewMode, setClassicViewMode] = useState<'preview' | 'html'>('preview');

    // Champs sélectionnés pour la génération
    const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({
        shortDescription: true,
        generalDescription: true,
        classicDescription: true,
        features: true,
        specifications: true
    });

    // Champs sélectionnés pour l'application dans le formulaire
    const [fieldsToApply, setFieldsToApply] = useState<Record<string, boolean>>({
        shortDescription: true,
        classicDescription: true,
        features: true,
        specifications: true
    });

    // Données de proposition éditables
    const [proposal, setProposal] = useState<EnrichmentOutput | null>(null);
    const [isSavingProposal, setIsSavingProposal] = useState(false);

    // Réinitialiser les états lors de l'ouverture
    useEffect(() => {
        if (isOpen && !proposal) {
            // Si pas encore de proposition, prêt à générer
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const toggleFieldSelection = (field: string) => {
        setSelectedFields(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const toggleFieldToApply = (field: string) => {
        setFieldsToApply(prev => ({ ...prev, [field]: !prev[field] }));
    };

    // Déclenchement de la génération globale
    const handleGenerate = async () => {
        if (!productName || productName.trim() === '') {
            toast.warning("Veuillez renseigner le nom du produit avant de lancer la génération.");
            return;
        }

        const fieldsToGenerate = Object.entries(selectedFields)
            .filter(([, v]) => v)
            .map(([k]) => k as any);

        if (fieldsToGenerate.length === 0) {
            toast.warning("Veuillez sélectionner au moins un champ à générer.");
            return;
        }

        setIsGenerating(true);
        try {
            const res = await generateProductAiContentAction({
                id: productId,
                name: productName,
                brandName,
                categoryName,
                subCategoryName,
                categoryId,
                brandId,
                reference,
                existingShortDescription: currentShortDescription,
                existingDescription: currentDescription,
                existingFeatures: currentFeatures,
                existingSpecs: currentSpecsText,
                fieldsToGenerate,
                customInstructions: customInstructions.trim() || undefined
            });

            if (res.success && res.data) {
                setProposal(res.data);
                toast.success("✨ Contenus générés avec succès par l'Assistant IA !");
            } else {
                toast.error(res.error || "Erreur lors de la génération IA.");
            }
        } catch (err: any) {
            toast.error(err?.message || "Erreur réseau.");
        } finally {
            setIsGenerating(false);
        }
    };

    // Régénération d'un champ individuel
    const handleRegenerateField = async (fieldName: 'shortDescription' | 'generalDescription' | 'classicDescription' | 'features' | 'specifications') => {
        setRegeneratingField(fieldName);
        try {
            const res = await regenerateAiFieldAction({
                id: productId,
                name: productName,
                brandName,
                categoryName,
                subCategoryName,
                categoryId,
                brandId,
                reference,
                existingShortDescription: currentShortDescription,
                existingDescription: currentDescription,
                existingFeatures: currentFeatures,
                existingSpecs: currentSpecsText,
                customInstructions: customInstructions.trim() || undefined
            }, fieldName);

            if (res.success && res.data && proposal) {
                setProposal(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        ...res.data,
                        specifications: res.data?.specifications || prev.specifications,
                        rawSpecsText: res.data?.rawSpecsText || prev.rawSpecsText
                    } as EnrichmentOutput;
                });
                toast.success(`Le champ "${fieldName}" a été régénéré avec succès !`);
            } else {
                toast.error(res.error || "Impossible de régénérer ce champ.");
            }
        } catch (err: any) {
            toast.error(err?.message || "Erreur réseau.");
        } finally {
            setRegeneratingField(null);
        }
    };

    // Enregistrement de la proposition sans modifier le produit
    const handleSaveAsDraft = async () => {
        if (!productId) {
            toast.info("Enregistrez d'abord le produit une première fois pour conserver un historique d'IA en base.");
            return;
        }
        if (!proposal) return;

        setIsSavingProposal(true);
        try {
            const res = await saveAiProposalAction(productId, proposal, "TO_REVIEW");
            if (res.success) {
                toast.success("💾 Proposition IA enregistrée en brouillon (isolée du catalogue public).");
            } else {
                toast.error(res.error || "Erreur d'enregistrement.");
            }
        } catch (err: any) {
            toast.error(err?.message || "Erreur réseau.");
        } finally {
            setIsSavingProposal(false);
        }
    };

    // Injection dans le formulaire ProductForm
    const handleApply = () => {
        if (!proposal) return;

        const payload: any = {};

        if (fieldsToApply.shortDescription) {
            payload.shortDescription = proposal.shortDescription;
        }

        if (fieldsToApply.classicDescription) {
            payload.description = proposal.classicDescription;
        }

        if (fieldsToApply.features) {
            payload.features = proposal.features;
        }

        if (fieldsToApply.specifications) {
            payload.specsText = proposal.rawSpecsText;
        }

        onApplyToForm(payload);
        toast.success("✅ Contenus IA injectés dans le formulaire ! Pensez à cliquer sur 'Enregistrer' pour valider.");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-5xl h-[92vh] max-h-[850px] rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-orange-50/50 via-white to-amber-50/30 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
                            <Sparkles size={20} className="animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-black text-slate-800 tracking-tight">Assistant IA Baraka</h3>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-700">
                                    Éditorial & Spécifications
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 font-medium truncate max-w-md">
                                {productName} {brandName && `• ${brandName}`} {categoryName && `• ${categoryName}`}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-[11px] font-bold">
                            <ShieldCheck size={13} />
                            <span>Brouillon isolé (aucune publication automatique)</span>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Configuration Bar */}
                <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600">
                        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-black mr-1">Champs :</span>
                        {[
                            { key: 'shortDescription', label: 'Courte' },
                            { key: 'generalDescription', label: 'Générale' },
                            { key: 'classicDescription', label: 'Classique HTML' },
                            { key: 'features', label: 'Caractéristiques' },
                            { key: 'specifications', label: 'Fiche technique' }
                        ].map(f => (
                            <button
                                key={f.key}
                                type="button"
                                onClick={() => toggleFieldSelection(f.key)}
                                className={cn(
                                    "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border",
                                    selectedFields[f.key]
                                        ? "bg-orange-500 text-white border-orange-500 shadow-xs shadow-orange-500/20"
                                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                                )}
                            >
                                {selectedFields[f.key] && <Check size={11} className="inline mr-1" />}
                                {f.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={customInstructions}
                            onChange={(e) => setCustomInstructions(e.target.value)}
                            placeholder="Instruction spécifique (ex: focus autonomie)..."
                            className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 w-56 md:w-64 font-medium"
                        />
                        <button
                            type="button"
                            disabled={isGenerating}
                            onClick={handleGenerate}
                            className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-orange-500/20 flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 size={13} className="animate-spin" />
                                    <span>Génération en cours...</span>
                                </>
                            ) : (
                                <>
                                    <Wand2 size={13} />
                                    <span>{proposal ? "Régénérer tout" : "Lancer la génération IA"}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {!proposal && !isGenerating ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                            <div className="w-16 h-16 rounded-3xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4 shadow-inner">
                                <Sparkles size={28} />
                            </div>
                            <h4 className="text-base font-black text-slate-800 uppercase tracking-tight mb-2">
                                Prêt à enrichir cette fiche produit
                            </h4>
                            <p className="text-xs text-slate-500 max-w-md leading-relaxed mb-6 font-medium">
                                L'assistant va s'appuyer sur la <strong>base éditoriale Baraka Shop</strong> et les données existantes pour rédiger la description courte, le pitch commercial HTML, les puces de caractéristiques et la fiche technique normalisée.
                            </p>
                            <button
                                type="button"
                                onClick={handleGenerate}
                                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-500/25 transition-all flex items-center gap-2"
                            >
                                <Wand2 size={15} />
                                <span>Générer avec l'IA maintenant</span>
                            </button>
                        </div>
                    ) : isGenerating ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                            <div className="relative w-16 h-16">
                                <div className="absolute inset-0 rounded-full border-4 border-orange-100" />
                                <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center text-orange-500">
                                    <Sparkles size={20} className="animate-pulse" />
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-1">
                                    Rédaction éditoriale en cours...
                                </h4>
                                <p className="text-xs text-slate-400 font-medium">
                                    Analyse des standards Baraka et formulation des 5 sections...
                                </p>
                            </div>
                        </div>
                    ) : proposal && (
                        <div className="space-y-6">

                            {/* Section 1 : Description Courte */}
                            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="apply-short"
                                            checked={fieldsToApply.shortDescription}
                                            onChange={() => toggleFieldToApply('shortDescription')}
                                            className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500/20 cursor-pointer"
                                        />
                                        <label htmlFor="apply-short" className="text-xs font-black text-slate-800 uppercase tracking-wider cursor-pointer">
                                            1. Description Courte
                                        </label>
                                        <span className="text-[10px] text-slate-400 font-medium">(Haut de page produit)</span>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={regeneratingField === 'shortDescription'}
                                        onClick={() => handleRegenerateField('shortDescription')}
                                        className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors disabled:opacity-50"
                                    >
                                        <RefreshCw size={11} className={cn(regeneratingField === 'shortDescription' && "animate-spin")} />
                                        <span>Régénérer</span>
                                    </button>
                                </div>

                                {currentShortDescription && (
                                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500">
                                        <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block mb-0.5">Actuel :</span>
                                        {currentShortDescription}
                                    </div>
                                )}

                                <div>
                                    <span className="font-bold text-orange-500 uppercase tracking-wider text-[9px] block mb-1">Proposition IA (modifiable) :</span>
                                    <textarea
                                        value={proposal.shortDescription}
                                        onChange={(e) => setProposal({ ...proposal, shortDescription: e.target.value })}
                                        rows={2}
                                        className="w-full px-3 py-2 bg-orange-50/30 border border-orange-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                                    />
                                </div>
                            </div>

                            {/* Section 2 : Description Classique (HTML Baraka) */}
                            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="apply-classic"
                                            checked={fieldsToApply.classicDescription}
                                            onChange={() => toggleFieldToApply('classicDescription')}
                                            className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500/20 cursor-pointer"
                                        />
                                        <label htmlFor="apply-classic" className="text-xs font-black text-slate-800 uppercase tracking-wider cursor-pointer">
                                            2. Description Classique Commerciale (HTML)
                                        </label>
                                        <span className="text-[10px] text-slate-400 font-medium">(Onglet Description)</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                                            <button
                                                type="button"
                                                onClick={() => setClassicViewMode('preview')}
                                                className={cn(
                                                    "px-2 py-0.5 rounded-md transition-all",
                                                    classicViewMode === 'preview' ? "bg-white text-slate-800 shadow-xs" : "text-slate-500"
                                                )}
                                            >
                                                <Eye size={11} className="inline mr-1" />
                                                Aperçu
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setClassicViewMode('html')}
                                                className={cn(
                                                    "px-2 py-0.5 rounded-md transition-all",
                                                    classicViewMode === 'html' ? "bg-white text-slate-800 shadow-xs" : "text-slate-500"
                                                )}
                                            >
                                                <Code size={11} className="inline mr-1" />
                                                Code HTML
                                            </button>
                                        </div>
                                        <button
                                            type="button"
                                            disabled={regeneratingField === 'classicDescription'}
                                            onClick={() => handleRegenerateField('classicDescription')}
                                            className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors disabled:opacity-50"
                                        >
                                            <RefreshCw size={11} className={cn(regeneratingField === 'classicDescription' && "animate-spin")} />
                                            <span>Régénérer</span>
                                        </button>
                                    </div>
                                </div>

                                {classicViewMode === 'preview' ? (
                                    <div
                                        className="p-4 bg-orange-50/20 border border-orange-200 rounded-xl text-xs md:text-sm text-slate-700 font-medium leading-relaxed max-h-48 overflow-y-auto [&_b]:font-bold [&_b]:text-slate-900"
                                        dangerouslySetInnerHTML={{ __html: proposal.classicDescription }}
                                    />
                                ) : (
                                    <textarea
                                        value={proposal.classicDescription}
                                        onChange={(e) => setProposal({ ...proposal, classicDescription: e.target.value })}
                                        rows={6}
                                        className="w-full px-3 py-2 bg-slate-900 text-slate-100 font-mono text-[11px] rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                                    />
                                )}
                            </div>

                            {/* Section 3 : Caractéristiques Principales */}
                            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="apply-features"
                                            checked={fieldsToApply.features}
                                            onChange={() => toggleFieldToApply('features')}
                                            className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500/20 cursor-pointer"
                                        />
                                        <label htmlFor="apply-features" className="text-xs font-black text-slate-800 uppercase tracking-wider cursor-pointer">
                                            3. Caractéristiques Principales ({proposal.features.length} puces)
                                        </label>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={regeneratingField === 'features'}
                                        onClick={() => handleRegenerateField('features')}
                                        className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors disabled:opacity-50"
                                    >
                                        <RefreshCw size={11} className={cn(regeneratingField === 'features' && "animate-spin")} />
                                        <span>Régénérer</span>
                                    </button>
                                </div>

                                <div className="space-y-1.5 max-h-48 overflow-y-auto p-1">
                                    {proposal.features.map((feat, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                            <input
                                                type="text"
                                                value={feat}
                                                onChange={(e) => {
                                                    const updated = [...proposal.features];
                                                    updated[idx] = e.target.value;
                                                    setProposal({ ...proposal, features: updated });
                                                }}
                                                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Section 4 : Fiche Technique */}
                            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="apply-specs"
                                            checked={fieldsToApply.specifications}
                                            onChange={() => toggleFieldToApply('specifications')}
                                            className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500/20 cursor-pointer"
                                        />
                                        <label htmlFor="apply-specs" className="text-xs font-black text-slate-800 uppercase tracking-wider cursor-pointer">
                                            4. Fiche Technique ({Object.keys(proposal.specifications || {}).length} spécifications)
                                        </label>
                                        <span className="text-[10px] text-slate-400 font-medium">(Onglet Spécifications)</span>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={regeneratingField === 'specifications'}
                                        onClick={() => handleRegenerateField('specifications')}
                                        className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors disabled:opacity-50"
                                    >
                                        <RefreshCw size={11} className={cn(regeneratingField === 'specifications' && "animate-spin")} />
                                        <span>Régénérer</span>
                                    </button>
                                </div>

                                <textarea
                                    value={proposal.rawSpecsText}
                                    onChange={(e) => setProposal({ ...proposal, rawSpecsText: e.target.value })}
                                    rows={6}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                                    placeholder="Désignation: ...&#10;Marque: ...&#10;Modèle: ..."
                                />
                            </div>

                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-[11px] text-slate-400 font-medium">
                        {proposal && (
                            <span>
                                Modèle : <strong>{proposal.modelUsed}</strong> • Tokens : {proposal.promptTokens || 0} p / {proposal.completionTokens || 0} c
                                {proposal.generationTimeMs && ` • ${Math.round(proposal.generationTimeMs / 100) / 10}s`}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition-colors"
                        >
                            Fermer
                        </button>

                        {proposal && productId && (
                            <button
                                type="button"
                                disabled={isSavingProposal}
                                onClick={handleSaveAsDraft}
                                className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
                            >
                                {isSavingProposal ? "Sauvegarde..." : "Garder en proposition"}
                            </button>
                        )}

                        {proposal && (
                            <button
                                type="button"
                                onClick={handleApply}
                                className="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/25 transition-all flex items-center gap-1.5"
                            >
                                <Check size={14} />
                                <span>Injecter dans le formulaire</span>
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
