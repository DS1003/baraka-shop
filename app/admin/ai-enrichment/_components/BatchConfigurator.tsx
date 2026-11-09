'use client';

import React, { useState, useEffect } from 'react';
import {
    Sparkles,
    Layers,
    Tag,
    AlertCircle,
    CheckCircle2,
    Sliders,
    Search,
    Play,
    Info,
    Clock,
    DollarSign,
    Check,
    X,
    Cpu,
    ShieldCheck,
    ArrowRight,
    Zap,
    Boxes
} from 'lucide-react';
import { toast } from 'sonner';
import {
    startBulkEnrichmentJobAction,
    getProductsForEnrichmentAction
} from '@/lib/actions/ai-enrichment-actions';
import Image from 'next/image';

interface BatchConfiguratorProps {
    categories: any[];
    brands: any[];
    incompleteCount: number;
    onJobStarted: (jobId: string) => void;
}

export function BatchConfigurator({
    categories,
    brands,
    incompleteCount,
    onJobStarted
}: BatchConfiguratorProps) {
    const [filterType, setFilterType] = useState<'INCOMPLETE' | 'CATEGORY' | 'BRAND' | 'MANUAL'>('INCOMPLETE');
    const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.id || '');
    const [selectedBrand, setSelectedBrand] = useState<string>(brands[0]?.id || '');

    // Quantity presets
    const [quantity, setQuantity] = useState<number>(20);
    const [isCustomQty, setIsCustomQty] = useState(false);
    const [customQtyValue, setCustomQtyValue] = useState<string>('30');

    // Manual selection state
    const [manualSearch, setManualSearch] = useState('');
    const [manualProducts, setManualProducts] = useState<any[]>([]);
    const [selectedManualIds, setSelectedManualIds] = useState<string[]>([]);
    const [loadingManual, setLoadingManual] = useState(false);

    // Confirmation Modal state
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch manual products when manual mode is selected
    useEffect(() => {
        if (filterType === 'MANUAL') {
            const fetchManual = async () => {
                setLoadingManual(true);
                try {
                    const res = await getProductsForEnrichmentAction({
                        page: 1,
                        pageSize: 50,
                        search: manualSearch
                    });
                    if (res.success && res.products) {
                        setManualProducts(res.products);
                    }
                } catch (err) {
                    console.error("Erreur chargement produits:", err);
                } finally {
                    setLoadingManual(false);
                }
            };
            const debounce = setTimeout(fetchManual, 300);
            return () => clearTimeout(debounce);
        }
    }, [filterType, manualSearch]);

    // Effective quantity targeted
    const effectiveLimit = isCustomQty
        ? Math.min(100, Math.max(1, parseInt(customQtyValue) || 10))
        : quantity;

    // Calculate approximate items count
    let estimatedCount = effectiveLimit;
    if (filterType === 'INCOMPLETE') {
        estimatedCount = Math.min(effectiveLimit, incompleteCount);
    } else if (filterType === 'CATEGORY') {
        const cat = categories.find(c => c.id === selectedCategory);
        estimatedCount = Math.min(effectiveLimit, cat?._count?.products || 0);
    } else if (filterType === 'BRAND') {
        const br = brands.find(b => b.id === selectedBrand);
        estimatedCount = Math.min(effectiveLimit, br?._count?.products || 0);
    } else if (filterType === 'MANUAL') {
        estimatedCount = selectedManualIds.length;
    }

    // Cost & time estimation with Gemini 3.6 Flash
    const estimatedCost = (estimatedCount * 0.0003).toFixed(4);
    const estimatedTimeSec = estimatedCount * 2;
    const estimatedTimeMin = Math.max(1, Math.ceil(estimatedTimeSec / 60));

    const handleSelectManualProduct = (id: string) => {
        setSelectedManualIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleSelectAllManual = () => {
        if (selectedManualIds.length === manualProducts.length) {
            setSelectedManualIds([]);
        } else {
            setSelectedManualIds(manualProducts.map(p => p.id));
        }
    };

    const handleLaunchClick = () => {
        if (filterType === 'MANUAL' && selectedManualIds.length === 0) {
            toast.error("Veuillez sélectionner au moins un produit.");
            return;
        }
        if (estimatedCount === 0) {
            toast.error("Aucun produit ne correspond à ces critères.");
            return;
        }
        setIsConfirmModalOpen(true);
    };

    const handleConfirmStartJob = async () => {
        setIsSubmitting(true);
        try {
            const filterValue = filterType === 'CATEGORY'
                ? selectedCategory
                : filterType === 'BRAND'
                ? selectedBrand
                : undefined;

            const res = await startBulkEnrichmentJobAction({
                filterType,
                filterValue,
                limit: effectiveLimit,
                manualProductIds: filterType === 'MANUAL' ? selectedManualIds : undefined
            });

            if (res.success && res.jobId) {
                toast.success("✨ Lot d'enrichissement IA démarré avec succès !");
                setIsConfirmModalOpen(false);
                onJobStarted(res.jobId);
            } else {
                toast.error(res.error || "Impossible de démarrer le traitement.");
            }
        } catch (err: any) {
            toast.error(err?.message || "Erreur de communication.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-6 md:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                <div>
                    <h3 className="text-lg font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-sm">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <span>Configurer un Lot d'Enrichissement IA</span>
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                        Sélectionnez les critères de ciblage. L'IA générera des propositions éditoriales complètes en arrière-plan sans impacter votre boutique en ligne.
                    </p>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200/70 rounded-xl text-xs font-bold text-emerald-800">
                    <Zap className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Modèle : Gemini 3.6 Flash</span>
                </div>
            </div>

            {/* Criteria Mode Selection Cards */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                    1. Méthode de ciblage :
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Mode 1 : Incomplete */}
                    <button
                        type="button"
                        onClick={() => setFilterType('INCOMPLETE')}
                        className={`p-5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between relative group ${
                            filterType === 'INCOMPLETE'
                                ? 'border-emerald-500 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/20 ring-2 ring-emerald-500/30 shadow-sm'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 bg-white'
                        }`}
                    >
                        {filterType === 'INCOMPLETE' && (
                            <span className="absolute top-4 right-4 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                                <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                        )}
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-amber-800 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <h4 className="font-extrabold text-gray-900 text-sm">Produits incomplets</h4>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                Priorité aux fiches sans description courte, longue ou caractéristiques.
                            </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-[11px] font-black text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-lg">
                                {incompleteCount.toLocaleString('fr-FR')} fiches
                            </span>
                            <span className="text-[10px] text-gray-400 font-semibold">Prioritaire</span>
                        </div>
                    </button>

                    {/* Mode 2 : Category */}
                    <button
                        type="button"
                        onClick={() => setFilterType('CATEGORY')}
                        className={`p-5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between relative group ${
                            filterType === 'CATEGORY'
                                ? 'border-emerald-500 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/20 ring-2 ring-emerald-500/30 shadow-sm'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 bg-white'
                        }`}
                    >
                        {filterType === 'CATEGORY' && (
                            <span className="absolute top-4 right-4 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                                <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                        )}
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-800 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                                <Layers className="w-5 h-5" />
                            </div>
                            <h4 className="font-extrabold text-gray-900 text-sm">Par catégorie</h4>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                Cibler tous les produits d'un rayon spécifique du catalogue.
                            </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-[11px] font-black text-blue-800 bg-blue-50 border border-blue-200/80 px-2.5 py-1 rounded-lg">
                                {categories.length} catégories
                            </span>
                            <span className="text-[10px] text-gray-400 font-semibold">Rayon</span>
                        </div>
                    </button>

                    {/* Mode 3 : Brand */}
                    <button
                        type="button"
                        onClick={() => setFilterType('BRAND')}
                        className={`p-5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between relative group ${
                            filterType === 'BRAND'
                                ? 'border-emerald-500 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/20 ring-2 ring-emerald-500/30 shadow-sm'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 bg-white'
                        }`}
                    >
                        {filterType === 'BRAND' && (
                            <span className="absolute top-4 right-4 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                                <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                        )}
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-purple-100/80 text-purple-800 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                                <Tag className="w-5 h-5" />
                            </div>
                            <h4 className="font-extrabold text-gray-900 text-sm">Par marque</h4>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                Harmoniser et valoriser l'ensemble des fiches d'une marque.
                            </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-[11px] font-black text-purple-800 bg-purple-50 border border-purple-200/80 px-2.5 py-1 rounded-lg">
                                {brands.length} marques
                            </span>
                            <span className="text-[10px] text-gray-400 font-semibold">Fabricant</span>
                        </div>
                    </button>

                    {/* Mode 4 : Manual Selection */}
                    <button
                        type="button"
                        onClick={() => setFilterType('MANUAL')}
                        className={`p-5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between relative group ${
                            filterType === 'MANUAL'
                                ? 'border-emerald-500 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/20 ring-2 ring-emerald-500/30 shadow-sm'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 bg-white'
                        }`}
                    >
                        {filterType === 'MANUAL' && (
                            <span className="absolute top-4 right-4 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                                <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                        )}
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                                <Sliders className="w-5 h-5" />
                            </div>
                            <h4 className="font-extrabold text-gray-900 text-sm">Sélection manuelle</h4>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                Choisir individuellement des produits cibles dans la liste.
                            </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-[11px] font-black text-gray-800 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-lg">
                                {selectedManualIds.length} sélectionné{selectedManualIds.length > 1 ? 's' : ''}
                            </span>
                            <span className="text-[10px] text-gray-400 font-semibold">Sur mesure</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Sub-selector Section */}
            {filterType === 'CATEGORY' && (
                <div className="p-5 bg-gradient-to-r from-blue-50/40 via-white to-blue-50/20 rounded-2xl border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                        <label className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                            <Layers className="w-4 h-4 text-blue-600" />
                            Sélectionner la catégorie :
                        </label>
                        <p className="text-[11px] text-gray-500">
                            Tous les produits de cette catégorie seront ciblés dans la limite choisie.
                        </p>
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full sm:w-96 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
                    >
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name} ({cat._count?.products || 0} produits)
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {filterType === 'BRAND' && (
                <div className="p-5 bg-gradient-to-r from-purple-50/40 via-white to-purple-50/20 rounded-2xl border border-purple-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                        <label className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                            <Tag className="w-4 h-4 text-purple-600" />
                            Sélectionner la marque :
                        </label>
                        <p className="text-[11px] text-gray-500">
                            Harmonisation éditoriale de toutes les références de ce fabricant.
                        </p>
                    </div>
                    <select
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="w-full sm:w-96 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
                    >
                        {brands.map(br => (
                            <option key={br.id} value={br.id}>
                                {br.name} ({br._count?.products || 0} produits)
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {filterType === 'MANUAL' && (
                <div className="p-5 bg-gray-50/60 rounded-2xl border border-gray-200 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={manualSearch}
                                onChange={(e) => setManualSearch(e.target.value)}
                                placeholder="Rechercher par nom, référence ou marque..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleSelectAllManual}
                                className="px-3 py-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 transition"
                            >
                                {selectedManualIds.length === manualProducts.length && manualProducts.length > 0
                                    ? "Tout désélectionner"
                                    : "Tout sélectionner"}
                            </button>
                            <span className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-black text-emerald-800">
                                {selectedManualIds.length} produit{selectedManualIds.length > 1 ? 's' : ''} coché{selectedManualIds.length > 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-1 divide-y divide-gray-100 bg-white rounded-2xl border border-gray-200 p-2 scrollbar-thin">
                        {loadingManual ? (
                            <div className="py-8 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                                <span>Recherche dans le catalogue...</span>
                            </div>
                        ) : manualProducts.length === 0 ? (
                            <p className="text-center text-xs text-gray-400 py-8">Aucun produit ne correspond à la recherche.</p>
                        ) : (
                            manualProducts.map(p => {
                                const isChecked = selectedManualIds.includes(p.id);
                                return (
                                    <label
                                        key={p.id}
                                        className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition ${
                                            isChecked
                                                ? 'bg-emerald-50/70 border border-emerald-200/60'
                                                : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => handleSelectManualProduct(p.id)}
                                                className="rounded-lg border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                                            />
                                            <div className="w-9 h-9 rounded-lg bg-gray-100 relative overflow-hidden flex-shrink-0 border border-gray-200">
                                                <Image
                                                    src={p.images?.[0] || '/images/placeholder.png'}
                                                    alt={p.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="truncate">
                                                <span className="text-xs font-bold text-gray-900 truncate block">
                                                    {p.name}
                                                </span>
                                                <span className="text-[10px] text-gray-400 block">
                                                    Réf : {p.reference || 'N/A'} • {p.brand?.name || 'Sans marque'} • {p.category?.name || 'Sans catégorie'}
                                                </span>
                                            </div>
                                        </div>
                                    </label>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* Step 2: Quantity Selector (when not manual) */}
            {filterType !== 'MANUAL' && (
                <div className="space-y-3 pt-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                        2. Volume du lot (Nombre de fiches à traiter) :
                    </label>

                    <div className="flex flex-wrap items-center gap-2">
                        {[10, 20, 50, 100].map(qty => (
                            <button
                                key={qty}
                                type="button"
                                onClick={() => {
                                    setQuantity(qty);
                                    setIsCustomQty(false);
                                }}
                                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                                    !isCustomQty && quantity === qty
                                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 ring-2 ring-emerald-500/30'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                                }`}
                            >
                                {qty} produits
                            </button>
                        ))}

                        <button
                            type="button"
                            onClick={() => setIsCustomQty(true)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                                isCustomQty
                                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 ring-2 ring-emerald-500/30'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                            }`}
                        >
                            Personnalisé
                        </button>

                        {isCustomQty && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={customQtyValue}
                                    onChange={(e) => setCustomQtyValue(e.target.value)}
                                    placeholder="ex: 35"
                                    className="w-24 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-center font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                                />
                                <span className="text-xs text-gray-400 font-medium">(max 100 par lot)</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Step 3: Live Summary & Impact Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white shadow-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <Boxes className="w-4 h-4" />
                        Récapitulatif prévisionnel du traitement
                    </span>
                    <span className="text-[11px] font-medium text-slate-300">
                        File d'attente asynchrone non-bloquante
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                        <span className="text-slate-400 block text-[11px]">Produits ciblés</span>
                        <span className="text-lg font-black text-white mt-0.5 block">
                            {estimatedCount} produit{estimatedCount > 1 ? 's' : ''}
                        </span>
                    </div>

                    <div>
                        <span className="text-slate-400 block text-[11px]">Durée estimée</span>
                        <span className="text-lg font-black text-white mt-0.5 block flex items-center gap-1">
                            <Clock className="w-4 h-4 text-amber-400" />
                            ~{estimatedTimeMin} min
                        </span>
                    </div>

                    <div>
                        <span className="text-slate-400 block text-[11px]">Coût IA indicatif</span>
                        <span className="text-lg font-black text-emerald-400 mt-0.5 block font-mono">
                            ~${estimatedCost} USD
                        </span>
                    </div>

                    <div>
                        <span className="text-slate-400 block text-[11px]">Sécurité catalogue</span>
                        <span className="text-xs font-bold text-teal-300 mt-1 block flex items-center gap-1">
                            <ShieldCheck className="w-4 h-4 text-teal-400" />
                            Brouillons 100% isolés
                        </span>
                    </div>
                </div>
            </div>

            {/* Launch Action Bar */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs text-gray-500 flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span>
                        Les données existantes restent intactes. Vous pourrez vérifier et ajuster chaque proposition avant publication.
                    </span>
                </div>

                <button
                    type="button"
                    onClick={handleLaunchClick}
                    disabled={estimatedCount === 0}
                    className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl transition-all duration-200 flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/30"
                >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Lancer le lot d'enrichissement ({estimatedCount})</span>
                </button>
            </div>

            {/* Confirmation Modal */}
            {isConfirmModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-5 border border-gray-100">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-2.5 font-extrabold text-gray-900 text-base">
                                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <span>Confirmation du Lot IA</span>
                            </div>
                            <button
                                onClick={() => setIsConfirmModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4 text-xs text-gray-600">
                            <p className="leading-relaxed">
                                Vous allez initier un traitement d'enrichissement pour <strong>{estimatedCount} produit{estimatedCount > 1 ? 's' : ''}</strong>.
                            </p>

                            <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200 space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 font-medium">Critère de ciblage :</span>
                                    <span className="font-bold text-gray-900">
                                        {filterType === 'INCOMPLETE' && "Produits incomplets"}
                                        {filterType === 'CATEGORY' && "Par catégorie"}
                                        {filterType === 'BRAND' && "Par marque"}
                                        {filterType === 'MANUAL' && "Sélection manuelle"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 font-medium">Temps d'exécution prévu :</span>
                                    <span className="font-bold text-gray-900">~{estimatedTimeMin} minute{estimatedTimeMin > 1 ? 's' : ''}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 font-medium">Coût API estimé :</span>
                                    <span className="font-bold text-emerald-700 font-mono">~${estimatedCost} USD</span>
                                </div>
                            </div>

                            <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-emerald-950 space-y-1.5">
                                <p className="font-bold flex items-center gap-1.5 text-xs text-emerald-900">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                    Garanties de sécurité Baraka Shop :
                                </p>
                                <ul className="list-disc list-inside text-[11px] text-emerald-800/90 space-y-1">
                                    <li>Aucune modification directe du catalogue en ligne.</li>
                                    <li>Chaque proposition est stockée sous forme de brouillon isolé.</li>
                                    <li>Validation et injection manuelles modulaires par vos soins.</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setIsConfirmModalOpen(false)}
                                disabled={isSubmitting}
                                className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmStartJob}
                                disabled={isSubmitting}
                                className="px-5 py-2.5 text-xs font-extrabold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl transition flex items-center gap-2 shadow-md shadow-emerald-600/20 disabled:opacity-50"
                            >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                {isSubmitting ? "Démarrage..." : "Confirmer et lancer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
