'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    X,
    Search,
    Loader2,
    Check,
    AlertCircle,
    CloudDownload,
    Image as ImageIcon,
    FileText,
    AlignLeft,
    Sparkles,
    CheckSquare,
    Square,
    ChevronLeft,
    ChevronRight,
    ArrowRight,
    RefreshCw,
    ShieldCheck,
    CheckCircle2,
    XCircle,
    Filter,
    Layers,
    Tag,
    Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    searchDjangoProductsAction,
    batchImportDjangoProductsAction
} from '@/lib/actions/admin-django-actions';
import { getAdminCategories, getAdminBrands } from '@/lib/actions/admin-actions';
import { DjangoCleanProduct, BatchImportItemInput, BatchImportResultItem } from '@/lib/services/django-service';
import { SearchableDropdown } from './SearchableDropdown';
import { toast } from 'sonner';

interface DjangoBatchImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccessRefresh?: () => void;
    categories?: Array<{ id: string; name: string }>;
    brands?: Array<{ id: string; name: string; image?: string | null }>;
}

export function DjangoBatchImportModal({
    isOpen,
    onClose,
    onSuccessRefresh,
    categories: initialCategories = [],
    brands: initialBrands = []
}: DjangoBatchImportModalProps) {
    // Categories & Brands for Select2 filters
    const [categoriesList, setCategoriesList] = useState<Array<{ id: string; name: string }>>(initialCategories);
    const [brandsList, setBrandsList] = useState<Array<{ id: string; name: string; image?: string | null }>>(initialBrands);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBrandName, setSelectedBrandName] = useState('');
    const [selectedCategoryName, setSelectedCategoryName] = useState('');
    const [filterTab, setFilterTab] = useState<'all' | 'existing' | 'new'>('all');

    // Pagination
    const [page, setPage] = useState(1);
    const pageSize = 12;
    const [isSearching, setIsSearching] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [products, setProducts] = useState<DjangoCleanProduct[]>([]);
    const [searchError, setSearchError] = useState<string | null>(null);

    // Selection: Map of reference -> DjangoCleanProduct
    const [selectedMap, setSelectedMap] = useState<Map<string, DjangoCleanProduct>>(new Map());

    // Import settings (Step 2)
    const [importName, setImportName] = useState(true);
    const [importShortDesc, setImportShortDesc] = useState(true);
    const [importFeatures, setImportFeatures] = useState(true);
    const [importImages, setImportImages] = useState(true);
    const [imageMode, setImageMode] = useState<'append' | 'replace'>('append');
    const [targetCategoryId, setTargetCategoryId] = useState('');

    // Workflow step: 'search' | 'preview' | 'processing' | 'report'
    const [step, setStep] = useState<'search' | 'preview' | 'processing' | 'report'>('search');

    // Execution progress & results
    const [progressCurrent, setProgressCurrent] = useState(0);
    const [progressTotal, setProgressTotal] = useState(0);
    const [importReport, setImportReport] = useState<{
        successCount: number;
        failureCount: number;
        results: BatchImportResultItem[];
    } | null>(null);

    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Load categories & brands if not provided
    useEffect(() => {
        if (!isOpen) return;

        if (categoriesList.length === 0) {
            getAdminCategories().then(cats => {
                if (Array.isArray(cats)) setCategoriesList(cats);
            }).catch(() => {});
        }
        if (brandsList.length === 0) {
            getAdminBrands().then(brs => {
                if (Array.isArray(brs)) setBrandsList(brs);
            }).catch(() => {});
        }
    }, [isOpen]);

    // Build the combined Django query string from search text + brand + category
    const buildSearchQuery = (text: string, brandName: string, categoryName: string) => {
        const parts: string[] = [];
        if (brandName.trim()) parts.push(brandName.trim());
        if (categoryName.trim()) parts.push(categoryName.trim());
        if (text.trim()) parts.push(text.trim());
        return parts.join(' ');
    };

    // Execute Django search
    const executeSearch = async (text: string, brand: string, cat: string, pageNum: number) => {
        setIsSearching(true);
        setSearchError(null);
        try {
            const combinedQuery = buildSearchQuery(text, brand, cat);
            const res = await searchDjangoProductsAction({
                q: combinedQuery || undefined,
                page: pageNum,
                pageSize
            });
            if (res.success) {
                setProducts(res.results);
                setTotalCount(res.count);
            } else {
                setSearchError(res.error || "Erreur de chargement des produits Django.");
            }
        } catch (err: any) {
            setSearchError("Impossible de contacter le serveur.");
        } finally {
            setIsSearching(false);
        }
    };

    // Reset when modal opens
    useEffect(() => {
        if (!isOpen) {
            setStep('search');
            setSelectedMap(new Map());
            setSearchQuery('');
            setSelectedBrandName('');
            setSelectedCategoryName('');
            setPage(1);
            setImportReport(null);
            return;
        }
        executeSearch('', '', '', 1);
    }, [isOpen]);

    // Debounced search trigger
    const triggerSearchDebounced = (text: string, brand: string, cat: string) => {
        setPage(1);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            executeSearch(text, brand, cat, 1);
        }, 350);
    };

    // Filter changes
    const handleTextChange = (val: string) => {
        setSearchQuery(val);
        triggerSearchDebounced(val, selectedBrandName, selectedCategoryName);
    };

    const handleBrandChange = (brandIdOrName: string) => {
        const found = brandsList.find(b => b.id === brandIdOrName);
        const nameToUse = found ? found.name : brandIdOrName;
        setSelectedBrandName(nameToUse);
        triggerSearchDebounced(searchQuery, nameToUse, selectedCategoryName);
    };

    const handleCategoryChange = (catIdOrName: string) => {
        const found = categoriesList.find(c => c.id === catIdOrName);
        const nameToUse = found ? found.name : catIdOrName;
        setSelectedCategoryName(nameToUse);
        triggerSearchDebounced(searchQuery, selectedBrandName, nameToUse);
    };

    const handleClearAllFilters = () => {
        setSearchQuery('');
        setSelectedBrandName('');
        setSelectedCategoryName('');
        setPage(1);
        executeSearch('', '', '', 1);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        executeSearch(searchQuery, selectedBrandName, selectedCategoryName, newPage);
    };

    // Filter products on current page by tab
    const filteredProducts = useMemo(() => {
        if (filterTab === 'existing') {
            return products.filter(p => p.barakaMatch?.exists === true);
        }
        if (filterTab === 'new') {
            return products.filter(p => !p.barakaMatch || p.barakaMatch.exists !== true);
        }
        return products;
    }, [products, filterTab]);

    // Selection handlers
    const toggleSelect = (p: DjangoCleanProduct) => {
        setSelectedMap(prev => {
            const next = new Map(prev);
            if (next.has(p.reference)) {
                next.delete(p.reference);
            } else {
                next.set(p.reference, p);
            }
            return next;
        });
    };

    const isAllPageSelected = filteredProducts.length > 0 && filteredProducts.every(p => selectedMap.has(p.reference));
    const toggleSelectAllPage = () => {
        setSelectedMap(prev => {
            const next = new Map(prev);
            if (isAllPageSelected) {
                filteredProducts.forEach(p => next.delete(p.reference));
            } else {
                filteredProducts.forEach(p => next.set(p.reference, p));
            }
            return next;
        });
    };

    const clearAllSelection = () => {
        setSelectedMap(new Map());
    };

    const selectedList = Array.from(selectedMap.values());
    const existingCount = selectedList.filter(p => p.barakaMatch?.exists === true).length;
    const newCount = selectedList.length - existingCount;
    const hasActiveFilters = Boolean(searchQuery.trim() || selectedBrandName || selectedCategoryName);

    // Options for Select2 dropdowns
    const brandOptions = useMemo(() => {
        return brandsList.map(b => ({
            id: b.id,
            name: b.name,
            image: b.image || null
        }));
    }, [brandsList]);

    const categoryOptions = useMemo(() => {
        return categoriesList.map(c => ({
            id: c.id,
            name: c.name
        }));
    }, [categoriesList]);

    // Selected brand ID for Select2
    const selectedBrandId = useMemo(() => {
        const found = brandsList.find(b => b.name === selectedBrandName);
        return found ? found.id : '';
    }, [brandsList, selectedBrandName]);

    // Selected category ID for Select2
    const selectedCategoryId = useMemo(() => {
        const found = categoriesList.find(c => c.name === selectedCategoryName);
        return found ? found.id : '';
    }, [categoriesList, selectedCategoryName]);

    // Start Batch Import
    const handleStartBatchImport = async () => {
        if (selectedList.length === 0) return;

        setStep('processing');
        setProgressCurrent(0);
        setProgressTotal(selectedList.length);

        const itemsInput: BatchImportItemInput[] = selectedList.map(p => ({
            djangoId: p.id,
            reference: p.reference,
            selectedFields: {
                name: importName,
                shortDescription: importShortDesc,
                features: importFeatures,
                images: importImages,
                imageMode
            }
        }));

        try {
            const result = await batchImportDjangoProductsAction(itemsInput, {
                defaultCategoryId: targetCategoryId || undefined
            });
            if (result.success) {
                setImportReport({
                    successCount: result.successCount,
                    failureCount: result.failureCount,
                    results: result.results
                });
                setStep('report');
                if (onSuccessRefresh) onSuccessRefresh();
            } else {
                toast.error(result.error || "Erreur lors du traitement par lot.");
                setStep('preview');
            }
        } catch (err: any) {
            toast.error(err.message || "Erreur réseau.");
            setStep('preview');
        }
    };

    const totalPages = Math.ceil(totalCount / pageSize);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 8 }}
                className="w-full max-w-7xl h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden"
            >
                {/* 1. Modal Top Bar Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0 shadow-inner">
                            <CloudDownload size={22} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-[16px] tracking-tight">Importation Globale depuis Django</h3>
                                <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-mono border border-orange-500/30 font-bold">
                                    API v0 • Baraka DRF
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium">
                                Recherchez et synchronisez vos fiches produits sans écraser vos prix, stocks ni configurations personnalisées.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        disabled={step === 'processing'}
                        className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-40"
                        title="Fermer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* 2. Stepper Navigation Header */}
                <div className="px-6 py-3 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-4 shrink-0">
                    <div className="flex items-center gap-3 text-[12px] font-medium">
                        <button
                            type="button"
                            onClick={() => step !== 'processing' && setStep('search')}
                            disabled={step === 'processing'}
                            className={cn(
                                "flex items-center gap-2 font-bold px-3 py-1.5 rounded-xl transition-all",
                                step === 'search'
                                    ? "bg-white text-orange-600 shadow-xs border border-orange-200"
                                    : "text-slate-600 hover:text-slate-900"
                            )}
                        >
                            <span className={cn(
                                "w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold",
                                step === 'search' ? "bg-orange-600 text-white" : "bg-slate-200 text-slate-600"
                            )}>1</span>
                            <span>Recherche & Sélection</span>
                            <span className="px-1.5 py-0.2 rounded-md bg-orange-100 text-orange-700 font-mono text-[11px]">
                                {selectedList.length}
                            </span>
                        </button>

                        <ChevronRight size={14} className="text-slate-300" />

                        <button
                            type="button"
                            onClick={() => step !== 'processing' && selectedList.length > 0 && setStep('preview')}
                            disabled={selectedList.length === 0 || step === 'processing'}
                            className={cn(
                                "flex items-center gap-2 font-bold px-3 py-1.5 rounded-xl transition-all disabled:opacity-40",
                                step === 'preview'
                                    ? "bg-white text-orange-600 shadow-xs border border-orange-200"
                                    : "text-slate-600 hover:text-slate-900"
                            )}
                        >
                            <span className={cn(
                                "w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold",
                                step === 'preview' ? "bg-orange-600 text-white" : "bg-slate-200 text-slate-600"
                            )}>2</span>
                            <span>Paramètres d'import & Validation</span>
                        </button>

                        {step === 'report' && (
                            <>
                                <ChevronRight size={14} className="text-slate-300" />
                                <span className="flex items-center gap-2 font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
                                    <span className="w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold bg-emerald-600 text-white">3</span>
                                    <span>Rapport d'exécution</span>
                                </span>
                            </>
                        )}
                    </div>

                    {/* Quick Selection Summary in Header */}
                    {selectedList.length > 0 && step === 'search' && (
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-slate-600">Sélectionnés :</span>
                            <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                                {existingCount} existant(s)
                            </span>
                            <span className="text-[11px] bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full font-bold">
                                {newCount} nouveau(x)
                            </span>
                            <button
                                type="button"
                                onClick={clearAllSelection}
                                className="text-[11px] text-slate-400 hover:text-rose-600 font-medium underline transition-colors ml-1"
                            >
                                Tout désélectionner
                            </button>
                        </div>
                    )}
                </div>

                {/* STEP 1: Search, Select2 Filters & Selection */}
                {step === 'search' && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* 3. Filter Bar with Select2 Dropdowns */}
                        <div className="p-4 border-b border-slate-200/80 bg-white space-y-3 shrink-0 relative z-20">
                            {/* Row 1: Search + Select 2 Brand + Select 2 Category */}
                            <div className="flex flex-col lg:flex-row items-stretch gap-3">
                                {/* Search input */}
                                <div className="relative flex-1">
                                    <Search className={cn(
                                        "absolute left-4 top-1/2 -translate-y-1/2 transition-colors",
                                        isSearching ? "text-orange-500 animate-pulse" : "text-slate-400"
                                    )} size={17} />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => handleTextChange(e.target.value)}
                                        placeholder="Rechercher par référence (ex: RS143, DE195V67A), mot-clé..."
                                        className="w-full pl-11 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all placeholder:text-slate-400"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => handleTextChange('')}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/50"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>

                                {/* Select 2 Marque */}
                                <div className="w-full lg:w-56 shrink-0 relative z-30">
                                    <SearchableDropdown
                                        options={brandOptions}
                                        value={selectedBrandId}
                                        onChange={handleBrandChange}
                                        placeholder="Toutes les marques"
                                        defaultLabel="Toutes les marques"
                                        triggerClassName="py-2.5 bg-slate-50 text-[12px] rounded-xl border-slate-200"
                                    />
                                </div>

                                {/* Select 2 Catégorie */}
                                <div className="w-full lg:w-64 shrink-0 relative z-20">
                                    <SearchableDropdown
                                        options={categoryOptions}
                                        value={selectedCategoryId}
                                        onChange={handleCategoryChange}
                                        placeholder="Toutes les catégories"
                                        defaultLabel="Toutes les catégories"
                                        triggerClassName="py-2.5 bg-slate-50 text-[12px] rounded-xl border-slate-200"
                                    />
                                </div>

                                {/* Reset filters button if any active */}
                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={handleClearAllFilters}
                                        className="px-3.5 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[12px] flex items-center gap-1.5 transition-colors shrink-0"
                                        title="Réinitialiser tous les filtres"
                                    >
                                        <Trash2 size={14} />
                                        <span>Effacer filtres</span>
                                    </button>
                                )}
                            </div>

                            {/* Row 2: Status Chips & Selection Controls */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => setFilterTab('all')}
                                            className={cn(
                                                "px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all",
                                                filterTab === 'all'
                                                    ? "bg-white text-slate-900 shadow-xs"
                                                    : "text-slate-500 hover:text-slate-800"
                                            )}
                                        >
                                            Tous ({products.length})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFilterTab('existing')}
                                            className={cn(
                                                "px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5",
                                                filterTab === 'existing'
                                                    ? "bg-white text-emerald-700 shadow-xs"
                                                    : "text-slate-500 hover:text-slate-800"
                                            )}
                                        >
                                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                            <span>Existants Baraka</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFilterTab('new')}
                                            className={cn(
                                                "px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5",
                                                filterTab === 'new'
                                                    ? "bg-white text-sky-700 shadow-xs"
                                                    : "text-slate-500 hover:text-slate-800"
                                            )}
                                        >
                                            <span className="w-2 h-2 rounded-full bg-sky-500" />
                                            <span>Nouveaux</span>
                                        </button>
                                    </div>

                                    {(selectedBrandName || selectedCategoryName) && (
                                        <div className="flex items-center gap-1.5 text-[11px]">
                                            {selectedBrandName && (
                                                <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 font-bold flex items-center gap-1">
                                                    <Tag size={10} />
                                                    Marque: {selectedBrandName}
                                                </span>
                                            )}
                                            {selectedCategoryName && (
                                                <span className="px-2 py-0.5 rounded-md bg-violet-100 text-violet-800 font-bold flex items-center gap-1">
                                                    <Layers size={10} />
                                                    Cat: {selectedCategoryName}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={toggleSelectAllPage}
                                    className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-xl flex items-center gap-2 transition-all"
                                >
                                    {isAllPageSelected ? (
                                        <CheckSquare size={15} className="text-orange-600" />
                                    ) : (
                                        <Square size={15} className="text-slate-400" />
                                    )}
                                    <span>{isAllPageSelected ? "Tout désélectionner (cette page)" : "Tout sélectionner (cette page)"}</span>
                                </button>
                            </div>
                        </div>

                        {/* 4. Products Grid */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/40">
                            {searchError && (
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-[12px] flex items-center gap-3">
                                    <AlertCircle size={20} className="text-amber-600 shrink-0" />
                                    <div className="flex-1">
                                        <p className="font-bold">Attention</p>
                                        <p>{searchError}</p>
                                    </div>
                                </div>
                            )}

                            {!searchError && filteredProducts.length === 0 && !isSearching && (
                                <div className="text-center py-16 text-slate-400 space-y-3">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                                        <CloudDownload size={28} />
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-base">Aucun produit trouvé dans Django</h4>
                                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                        Modifiez les termes de recherche ou réinitialisez les filtres de marque et de catégorie.
                                    </p>
                                    {hasActiveFilters && (
                                        <button
                                            type="button"
                                            onClick={handleClearAllFilters}
                                            className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-orange-700 transition-all"
                                        >
                                            Réinitialiser les filtres
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                {filteredProducts.map((p) => {
                                    const isSelected = selectedMap.has(p.reference);
                                    const existsInBaraka = p.barakaMatch?.exists === true;
                                    const firstImg = p.images[0];
                                    const imageSrc = firstImg ? (firstImg.proxyUrl || firstImg.resolvedUrl) : '';

                                    return (
                                        <motion.div
                                            key={p.id}
                                            whileHover={{ y: -2 }}
                                            onClick={() => toggleSelect(p)}
                                            className={cn(
                                                "p-4 rounded-2xl border text-left flex flex-col justify-between cursor-pointer transition-all duration-200 select-none relative group",
                                                isSelected
                                                    ? "bg-white border-orange-500 ring-2 ring-orange-500/30 shadow-md shadow-orange-500/5"
                                                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
                                            )}
                                        >
                                            {/* Card Top: Reference + Status + Checkbox */}
                                            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <span className="font-mono font-black text-[11px] text-slate-800 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md truncate">
                                                        {p.reference}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    {existsInBaraka ? (
                                                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                            <span>MAJ Baraka</span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                                                            <span>Nouveau</span>
                                                        </span>
                                                    )}

                                                    {/* Custom Checkbox */}
                                                    <div className={cn(
                                                        "w-5 h-5 rounded-lg border flex items-center justify-center transition-all",
                                                        isSelected
                                                            ? "bg-orange-600 border-orange-600 text-white shadow-xs"
                                                            : "border-slate-300 bg-white group-hover:border-slate-400"
                                                    )}>
                                                        {isSelected && <Check size={13} strokeWidth={3} />}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Card Middle: Image + Text info */}
                                            <div className="flex items-start gap-3.5 my-3">
                                                {/* Image Thumbnail with proxy and fallback */}
                                                <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200/80 overflow-hidden flex items-center justify-center shrink-0 p-1 relative group-hover:scale-105 transition-transform">
                                                    <ImageIcon size={22} className="text-slate-300 pointer-events-none" />
                                                    {imageSrc && (
                                                        <img
                                                            src={imageSrc}
                                                            alt={p.name}
                                                            referrerPolicy="no-referrer"
                                                            loading="lazy"
                                                            onError={(e) => {
                                                                if (firstImg?.resolvedUrl && e.currentTarget.src !== firstImg.resolvedUrl) {
                                                                    e.currentTarget.src = firstImg.resolvedUrl;
                                                                } else {
                                                                    e.currentTarget.style.display = 'none';
                                                                }
                                                            }}
                                                            className="absolute inset-0 w-full h-full object-contain p-1 bg-white"
                                                        />
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-[13px] text-slate-900 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors" title={p.name}>
                                                        {p.name}
                                                    </h4>
                                                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-1 font-medium" title={p.libelle || ''}>
                                                        {p.libelle || "Aucun libellé court"}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Card Bottom: Metadata Badges */}
                                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex items-center gap-1 text-slate-600">
                                                        <ImageIcon size={12} className="text-slate-400" />
                                                        <strong>{p.imageCount}</strong> img{p.imageCount > 1 ? 's' : ''}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-slate-600">
                                                        <Sparkles size={12} className="text-slate-400" />
                                                        <strong>{p.features.length}</strong> caracs
                                                    </span>
                                                </div>
                                                <span className="font-mono text-[10px] text-slate-400">
                                                    ID: {p.id}
                                                </span>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 5. Pagination & Bottom Action Bar */}
                        <div className="px-6 py-3.5 bg-white border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-4 shrink-0">
                            <span className="text-[12px] text-slate-500 font-medium">
                                Total Django : <strong className="text-slate-900 font-bold">{totalCount}</strong> produits actifs
                                {totalPages > 1 && ` — Page ${page} sur ${totalPages}`}
                            </span>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page <= 1 || isSearching}
                                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 disabled:opacity-40 shadow-xs"
                                >
                                    <ChevronLeft size={16} />
                                    <span>Précédent</span>
                                </button>

                                <span className="font-mono text-[12px] font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                                    {page} / {totalPages || 1}
                                </span>

                                <button
                                    type="button"
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page >= totalPages || isSearching}
                                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 disabled:opacity-40 shadow-xs"
                                >
                                    <span>Suivant</span>
                                    <ChevronRight size={16} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStep('preview')}
                                    disabled={selectedList.length === 0}
                                    className="ml-4 px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-[12px] rounded-xl flex items-center gap-2 shadow-md shadow-orange-600/20 transition-all disabled:opacity-40 active:scale-95"
                                >
                                    <span>Configurer l'import ({selectedList.length})</span>
                                    <ArrowRight size={15} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: Preview & Import Settings */}
                {step === 'preview' && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                            {/* Summary banner */}
                            <div className="p-5 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <h4 className="font-bold text-[15px] text-orange-950 flex items-center gap-2">
                                        <ShieldCheck className="text-orange-600" size={20} />
                                        Validation de l'import : {selectedList.length} produit(s) sélectionné(s)
                                    </h4>
                                    <p className="text-[12px] text-orange-900">
                                        <strong className="text-orange-950">{existingCount}</strong> produit(s) déjà présent(s) dans Baraka seront mis à jour de façon ciblée.
                                        {newCount > 0 && (
                                            <> <strong className="text-orange-950">{newCount}</strong> nouveau(x) produit(s) seront créés en <strong>brouillon non publié</strong>.</>
                                        )}
                                    </p>
                                </div>
                                <div className="text-[11px] font-bold text-orange-800 bg-white/90 border border-orange-200 px-3.5 py-1.5 rounded-xl shadow-xs">
                                    🔒 Prix & stocks protégés à 100%
                                </div>
                            </div>

                            {/* Destination Category for new products */}
                            {newCount > 0 && (
                                <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                        <Layers size={14} className="text-orange-500" />
                                        Catégorie d'affectation pour les {newCount} nouveau(x) produit(s)
                                    </label>
                                    <div className="max-w-md">
                                        <SearchableDropdown
                                            options={categoryOptions}
                                            value={targetCategoryId}
                                            onChange={setTargetCategoryId}
                                            placeholder="Choisir une catégorie Baraka (ou catégorie par défaut)"
                                            defaultLabel="Catégorie par défaut"
                                            triggerClassName="py-2.5 bg-slate-50 text-[12px] rounded-xl border-slate-200"
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-400">
                                        Si non spécifiée, la première catégorie disponible sera attribuée par défaut. Vous pourrez la modifier ensuite.
                                    </p>
                                </div>
                            )}

                            {/* Field Selection Toggles */}
                            <div className="space-y-3">
                                <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    Champs ciblés à importer pour toute la sélection :
                                </h5>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                    {/* Nom */}
                                    <label className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between cursor-pointer hover:border-slate-300 shadow-xs">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={importName}
                                                onChange={(e) => setImportName(e.target.checked)}
                                                className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                                            />
                                            <div>
                                                <span className="font-bold text-[13px] text-slate-800 flex items-center gap-1.5">
                                                    <FileText size={15} className="text-orange-500" />
                                                    Nom du produit
                                                </span>
                                                <p className="text-[11px] text-slate-400">Importe le nom source exact de Django</p>
                                            </div>
                                        </div>
                                    </label>

                                    {/* Description courte */}
                                    <label className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between cursor-pointer hover:border-slate-300 shadow-xs">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={importShortDesc}
                                                onChange={(e) => setImportShortDesc(e.target.checked)}
                                                className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                                            />
                                            <div>
                                                <span className="font-bold text-[13px] text-slate-800 flex items-center gap-1.5">
                                                    <AlignLeft size={15} className="text-orange-500" />
                                                    Description courte (Libellé)
                                                </span>
                                                <p className="text-[11px] text-slate-400">Préserve l'existant si le libellé Django est vide</p>
                                            </div>
                                        </div>
                                    </label>

                                    {/* Caractéristiques */}
                                    <label className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between cursor-pointer hover:border-slate-300 shadow-xs">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={importFeatures}
                                                onChange={(e) => setImportFeatures(e.target.checked)}
                                                className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                                            />
                                            <div>
                                                <span className="font-bold text-[13px] text-slate-800 flex items-center gap-1.5">
                                                    <Sparkles size={15} className="text-orange-500" />
                                                    Caractéristiques principales
                                                </span>
                                                <p className="text-[11px] text-slate-400">Nettoyage automatique des puces en début de ligne</p>
                                            </div>
                                        </div>
                                    </label>

                                    {/* Images */}
                                    <div className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between gap-3 shadow-xs">
                                        <div className="flex items-center justify-between">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={importImages}
                                                    onChange={(e) => setImportImages(e.target.checked)}
                                                    className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                                                />
                                                <span className="font-bold text-[13px] text-slate-800 flex items-center gap-1.5">
                                                    <ImageIcon size={15} className="text-orange-500" />
                                                    Galeries d'images
                                                </span>
                                            </label>
                                            <select
                                                value={imageMode}
                                                onChange={(e) => setImageMode(e.target.value as 'append' | 'replace')}
                                                disabled={!importImages}
                                                className="text-[11px] font-bold bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1 text-slate-700"
                                            >
                                                <option value="append">Ajouter à la suite</option>
                                                <option value="replace">Remplacer toute la galerie</option>
                                            </select>
                                        </div>
                                        <p className="text-[11px] text-slate-400">
                                            Transfert sécurisé vers Cloudinary avec respect strict de l'ordre d'origine.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* List of items preview */}
                            <div className="space-y-3">
                                <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    Aperçu des {selectedList.length} fiches sélectionnées :
                                </h5>

                                <div className="border border-slate-200/80 rounded-2xl overflow-hidden max-h-64 overflow-y-auto bg-white shadow-xs">
                                    <table className="w-full text-left text-[12px]">
                                        <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 sticky top-0">
                                            <tr>
                                                <th className="py-3 px-4">Réf.</th>
                                                <th className="py-3 px-4">Nom Django</th>
                                                <th className="py-3 px-4">Statut Baraka</th>
                                                <th className="py-3 px-4 text-center">Images</th>
                                                <th className="py-3 px-4 text-center">Caractéristiques</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {selectedList.map(p => (
                                                <tr key={p.id} className="hover:bg-slate-50/50">
                                                    <td className="py-2.5 px-4 font-mono font-bold text-orange-600 text-[11px]">
                                                        {p.reference}
                                                    </td>
                                                    <td className="py-2.5 px-4 font-semibold text-slate-800 max-w-sm truncate">
                                                        {p.name}
                                                    </td>
                                                    <td className="py-2.5 px-4">
                                                        {p.barakaMatch?.exists ? (
                                                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                                                Mise à jour ({p.barakaMatch.productId?.slice(0, 8)}...)
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                                                                Nouveau brouillon
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500 text-center">
                                                        {p.imageCount}
                                                    </td>
                                                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500 text-center">
                                                        {p.features.length} lignes
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
                            <button
                                type="button"
                                onClick={() => setStep('search')}
                                className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[12px] rounded-xl transition-all"
                            >
                                ← Revenir à la sélection
                            </button>

                            <button
                                type="button"
                                onClick={handleStartBatchImport}
                                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-[12px] rounded-xl shadow-lg shadow-orange-600/20 flex items-center gap-2 transition-all active:scale-95"
                            >
                                <CloudDownload size={16} />
                                <span>Confirmer et lancer l'importation ({selectedList.length})</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: Processing Animation */}
                {step === 'processing' && (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-6 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shadow-inner">
                            <Loader2 size={32} className="animate-spin" />
                        </div>

                        <div className="space-y-2 max-w-md">
                            <h4 className="font-bold text-[17px] text-slate-900">
                                Importation en cours...
                            </h4>
                            <p className="text-[12px] text-slate-500 leading-relaxed">
                                Transfert sécurisé des données et des images vers Cloudinary. Veuillez patienter sans fermer la fenêtre.
                            </p>
                        </div>

                        <div className="w-full max-w-md space-y-2">
                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                <div
                                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300"
                                    style={{ width: `${progressTotal > 0 ? (progressCurrent / progressTotal) * 100 : 50}%` }}
                                />
                            </div>
                            <span className="font-mono text-[11px] text-slate-400">
                                Concurrence contrôlée pour préserver la stabilité du serveur
                            </span>
                        </div>
                    </div>
                )}

                {/* STEP 4: Execution Report */}
                {step === 'report' && importReport && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                            {/* Summary stat cards */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-5 bg-white border border-slate-200 rounded-2xl text-center shadow-xs">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Traités</span>
                                    <p className="text-3xl font-black text-slate-900 mt-1">{importReport.results.length}</p>
                                </div>
                                <div className="p-5 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-center shadow-xs">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Succès</span>
                                    <p className="text-3xl font-black text-emerald-800 mt-1">{importReport.successCount}</p>
                                </div>
                                <div className="p-5 bg-rose-50/80 border border-rose-200 rounded-2xl text-center shadow-xs">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Échecs</span>
                                    <p className="text-3xl font-black text-rose-800 mt-1">{importReport.failureCount}</p>
                                </div>
                            </div>

                            {/* Detailed Results List */}
                            <div className="space-y-3">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    Détail de chaque produit traité :
                                </span>

                                <div className="border border-slate-200/80 rounded-2xl overflow-hidden max-h-80 overflow-y-auto divide-y divide-slate-100 bg-white shadow-xs">
                                    {importReport.results.map((r) => (
                                        <div key={r.reference} className="p-3.5 flex items-center justify-between text-[12px] hover:bg-slate-50/50">
                                            <div className="flex items-center gap-3">
                                                {r.success ? (
                                                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                                                ) : (
                                                    <XCircle size={18} className="text-rose-500 shrink-0" />
                                                )}
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono font-bold text-[11px] text-slate-800">
                                                            {r.reference}
                                                        </span>
                                                        <span className={cn(
                                                            "text-[9px] font-bold uppercase px-2 py-0.5 rounded-full",
                                                            r.action === 'updated' && "bg-emerald-100 text-emerald-800",
                                                            r.action === 'created' && "bg-sky-100 text-sky-800",
                                                            r.action === 'skipped' && "bg-amber-100 text-amber-800",
                                                            r.action === 'failed' && "bg-rose-100 text-rose-800"
                                                        )}>
                                                            {r.action}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 mt-0.5">{r.message}</p>
                                                </div>
                                            </div>

                                            {r.importedFields.length > 0 && (
                                                <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                                    {r.importedFields.join(', ')}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-end shrink-0">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[12px] rounded-xl shadow-sm transition-all"
                            >
                                Fermer et actualiser
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
