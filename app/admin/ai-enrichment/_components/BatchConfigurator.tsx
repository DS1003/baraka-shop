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
    Cpu
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

    // Cost & time estimation
    const estimatedCost = (estimatedCount * 0.0003).toFixed(4); // approx $0.0003 per product on Gemini Flash
    const estimatedTimeSec = estimatedCount * 2; // ~2 seconds per product with 1.5s delay
    const estimatedTimeMin = Math.ceil(estimatedTimeSec / 60);

    const handleSelectManualProduct = (id: string) => {
        setSelectedManualIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
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
                toast.success("Lot d'enrichissement IA démarré avec succès !");
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
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 space-y-6">
            <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    Configurer un lot d'enrichissement par l'IA
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                    Sélectionnez les critères des produits à traiter. L'IA générera des propositions éditoriales complètes en arrière-plan sans impacter le catalogue en ligne.
                </p>
            </div>

            {/* Mode selection cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button
                    type="button"
                    onClick={() => setFilterType('INCOMPLETE')}
                    className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                        filterType === 'INCOMPLETE'
                            ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/20'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                >
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="p-2 rounded-lg bg-amber-50 text-amber-700">
                                <AlertCircle className="w-4 h-4" />
                            </span>
                            {filterType === 'INCOMPLETE' && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            )}
                        </div>
                        <h4 className="font-semibold text-gray-900 text-sm">Produits incomplets</h4>
                        <p className="text-xs text-gray-500 mt-1">
                            Fiches sans description courte, longue ou caractéristiques.
                        </p>
                    </div>
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md mt-3 inline-block w-fit">
                        {incompleteCount} fiches à compléter
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setFilterType('CATEGORY')}
                    className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                        filterType === 'CATEGORY'
                            ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/20'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                >
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="p-2 rounded-lg bg-blue-50 text-blue-700">
                                <Layers className="w-4 h-4" />
                            </span>
                            {filterType === 'CATEGORY' && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            )}
                        </div>
                        <h4 className="font-semibold text-gray-900 text-sm">Par catégorie</h4>
                        <p className="text-xs text-gray-500 mt-1">
                            Cibler tous les produits d'un rayon spécifique.
                        </p>
                    </div>
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md mt-3 inline-block w-fit">
                        {categories.length} catégories
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setFilterType('BRAND')}
                    className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                        filterType === 'BRAND'
                            ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/20'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                >
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="p-2 rounded-lg bg-purple-50 text-purple-700">
                                <Tag className="w-4 h-4" />
                            </span>
                            {filterType === 'BRAND' && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            )}
                        </div>
                        <h4 className="font-semibold text-gray-900 text-sm">Par marque</h4>
                        <p className="text-xs text-gray-500 mt-1">
                            Harmoniser les fiches d'une marque précise.
                        </p>
                    </div>
                    <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md mt-3 inline-block w-fit">
                        {brands.length} marques
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setFilterType('MANUAL')}
                    className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                        filterType === 'MANUAL'
                            ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/20'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                >
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="p-2 rounded-lg bg-gray-100 text-gray-700">
                                <Sliders className="w-4 h-4" />
                            </span>
                            {filterType === 'MANUAL' && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            )}
                        </div>
                        <h4 className="font-semibold text-gray-900 text-sm">Sélection manuelle</h4>
                        <p className="text-xs text-gray-500 mt-1">
                            Choisir individuellement les produits dans une liste.
                        </p>
                    </div>
                    <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md mt-3 inline-block w-fit">
                        {selectedManualIds.length} sélectionné{selectedManualIds.length > 1 ? 's' : ''}
                    </span>
                </button>
            </div>

            {/* Sub-selectors depending on mode */}
            {filterType === 'CATEGORY' && (
                <div className="bg-gray-50/60 p-4 rounded-xl border border-gray-200/60 flex flex-col sm:flex-row items-center gap-4">
                    <label className="text-xs font-semibold text-gray-700 whitespace-nowrap">
                        Catégorie ciblée :
                    </label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full sm:w-80 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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
                <div className="bg-gray-50/60 p-4 rounded-xl border border-gray-200/60 flex flex-col sm:flex-row items-center gap-4">
                    <label className="text-xs font-semibold text-gray-700 whitespace-nowrap">
                        Marque ciblée :
                    </label>
                    <select
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="w-full sm:w-80 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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
                <div className="bg-gray-50/60 p-4 rounded-xl border border-gray-200/60 space-y-3">
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={manualSearch}
                            onChange={(e) => setManualSearch(e.target.value)}
                            placeholder="Rechercher des produits à ajouter au lot..."
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 divide-y divide-gray-100 bg-white rounded-xl border border-gray-200 p-2">
                        {loadingManual ? (
                            <p className="text-center text-xs text-gray-400 py-6">Recherche...</p>
                        ) : manualProducts.length === 0 ? (
                            <p className="text-center text-xs text-gray-400 py-6">Aucun produit trouvé.</p>
                        ) : (
                            manualProducts.map(p => {
                                const isChecked = selectedManualIds.includes(p.id);
                                return (
                                    <label
                                        key={p.id}
                                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                                            isChecked ? 'bg-emerald-50/50' : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => handleSelectManualProduct(p.id)}
                                                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                                            />
                                            <div className="w-8 h-8 rounded bg-gray-100 relative overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={p.images?.[0] || '/images/placeholder.png'}
                                                    alt={p.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div>
                                                <span className="text-xs font-medium text-gray-900 line-clamp-1">
                                                    {p.name}
                                                </span>
                                                <span className="text-[10px] text-gray-400">
                                                    Réf: {p.reference || 'N/A'} • {p.brand?.name || 'Sans marque'}
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

            {/* Quantity selector (when not manual) */}
            {filterType !== 'MANUAL' && (
                <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-700">
                            Quantité à traiter :
                        </span>
                        {[10, 20, 50, 100].map(qty => (
                            <button
                                key={qty}
                                type="button"
                                onClick={() => {
                                    setQuantity(qty);
                                    setIsCustomQty(false);
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                    !isCustomQty && quantity === qty
                                        ? 'bg-emerald-600 text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {qty}
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={() => setIsCustomQty(true)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                isCustomQty
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Personnalisé
                        </button>
                        {isCustomQty && (
                            <input
                                type="number"
                                min={1}
                                max={100}
                                value={customQtyValue}
                                onChange={(e) => setCustomQtyValue(e.target.value)}
                                className="w-20 px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs text-center font-bold text-gray-900"
                            />
                        )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            ~{estimatedTimeMin} min
                        </span>
                        <span className="flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                            Coût estimé: ~${estimatedCost}
                        </span>
                    </div>
                </div>
            )}

            {/* Action Bar */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="text-xs text-gray-500 flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span>
                        <strong>{estimatedCount} produit{estimatedCount > 1 ? 's' : ''}</strong> concerné{estimatedCount > 1 ? 's' : ''}. Les fiches originales restent intactes.
                    </span>
                </div>

                <button
                    type="button"
                    onClick={handleLaunchClick}
                    disabled={estimatedCount === 0}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition flex items-center gap-2 shadow-sm"
                >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Lancer le lot d'enrichissement ({estimatedCount})
                </button>
            </div>

            {/* Confirmation Modal */}
            {isConfirmModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-gray-100">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
                                <Sparkles className="w-4 h-4 text-emerald-600" />
                                Confirmation du lot d'enrichissement
                            </div>
                            <button
                                onClick={() => setIsConfirmModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs text-gray-600">
                            <p>
                                Vous êtes sur le point de lancer la génération IA pour <strong>{estimatedCount} produit{estimatedCount > 1 ? 's' : ''}</strong>.
                            </p>

                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Mode :</span>
                                    <span className="font-semibold text-gray-800">
                                        {filterType === 'INCOMPLETE' && "Produits incomplets"}
                                        {filterType === 'CATEGORY' && "Par catégorie"}
                                        {filterType === 'BRAND' && "Par marque"}
                                        {filterType === 'MANUAL' && "Sélection manuelle"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Temps estimé :</span>
                                    <span className="font-semibold text-gray-800">~{estimatedTimeMin} minute{estimatedTimeMin > 1 ? 's' : ''}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Coût estimé API :</span>
                                    <span className="font-semibold text-emerald-700 font-mono">~${estimatedCost} USD</span>
                                </div>
                            </div>

                            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/60 text-emerald-900 space-y-1">
                                <p className="font-semibold flex items-center gap-1.5 text-[11px]">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    Garanties de sécurité Baraka Shop :
                                </p>
                                <ul className="list-disc list-inside text-[11px] text-emerald-800 space-y-0.5">
                                    <li>Aucune écrasement automatique des données existantes.</li>
                                    <li>Aucune publication automatique sur le catalogue en ligne.</li>
                                    <li>Chaque proposition est stockée et soumise à votre vérification.</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setIsConfirmModalOpen(false)}
                                disabled={isSubmitting}
                                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmStartJob}
                                disabled={isSubmitting}
                                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                            >
                                <Play className="w-3 h-3 fill-current" />
                                {isSubmitting ? "Démarrage..." : "Confirmer et lancer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
