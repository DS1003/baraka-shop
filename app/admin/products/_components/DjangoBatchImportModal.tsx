
'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
    Trash2,
    ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    searchDjangoProductsAction,
    getDjangoFiltersAction,
    batchImportDjangoProductsAction
} from '@/lib/actions/admin-django-actions';
import { getAdminCategories, getSubCategories } from '@/lib/actions/admin-actions';
import { DjangoCleanProduct, BatchImportResultItem } from '@/lib/services/django-service';
import { SearchableDropdown } from './SearchableDropdown';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------

interface DjangoBrandOption {
    id: string;
    name: string;
    count: number;
}

interface DjangoSubCategoryOption {
    id: string;
    name: string;
    count: number;
}

interface DjangoCategoryOption {
    id: string;
    name: string;
    count: number;
    subCategories: DjangoSubCategoryOption[];
}

interface DjangoBatchImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccessRefresh?: () => void;
    categories?: Array<{ id: string; name: string }>;
    brands?: Array<{ id: string; name: string; image?: string | null }>;
}

// ---------------------------------------------------------------------------
// SUBCOMPONENTS
// ---------------------------------------------------------------------------

function SimpleMinimalLoader({
    text = "Chargement des données...",
    size = "default"
}: {
    text?: string;
    size?: "small" | "default" | "large";
}) {
    const isSmall = size === "small";
    const isLarge = size === "large";

    return (
        <div className={cn(
            "flex flex-col items-center justify-center text-center select-none animate-in fade-in duration-150",
            isLarge ? "py-12 space-y-3" : isSmall ? "py-3 space-y-1.5" : "py-8 space-y-2.5"
        )}>
            <svg
                className={cn(
                    "animate-spin text-orange-500",
                    isLarge ? "w-8 h-8" : isSmall ? "w-4 h-4" : "w-6 h-6"
                )}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <circle
                    cx="12"
                    cy="12"
                    r="9.5"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="text-slate-200/80"
                />
                <path
                    d="M12 2.5C6.75329 2.5 2.5 6.75329 2.5 12"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="text-orange-500"
                />
            </svg>

            {text && (
                <p className={cn(
                    "font-medium text-slate-500 tracking-normal",
                    isLarge ? "text-[13px]" : "text-[12px]"
                )}>
                    {text}
                </p>
            )}
        </div>
    );
}

function ProductCardSkeleton() {
    return (
        <div className="p-4 rounded-2xl border border-slate-200/70 bg-white flex flex-col justify-between animate-pulse select-none min-h-[160px]">
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                <div className="h-5 w-20 bg-slate-100 rounded-lg" />
                <div className="flex items-center gap-2">
                    <div className="h-4 w-16 bg-slate-100 rounded-full" />
                    <div className="h-5 w-5 bg-slate-100 rounded-lg" />
                </div>
            </div>
            <div className="flex items-start gap-3.5 my-3">
                <div className="w-16 h-16 rounded-xl bg-slate-100 shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-slate-100 rounded-md w-4/5" />
                    <div className="h-3 bg-slate-100 rounded-md w-2/3" />
                </div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-3 w-12 bg-slate-100 rounded" />
                    <div className="h-3 w-14 bg-slate-100 rounded" />
                </div>
                <div className="h-3 w-10 bg-slate-100 rounded" />
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------------------------

export function DjangoBatchImportModal({
    isOpen,
    onClose,
    onSuccessRefresh,
}: DjangoBatchImportModalProps) {
    // -----------------------------------------------------------------------
    // DJANGO FILTER OPTIONS (loaded from server on modal open)
    // -----------------------------------------------------------------------
    const [djangoBrands, setDjangoBrands] = useState<DjangoBrandOption[]>([]);
    const [djangoCategories, setDjangoCategories] = useState<DjangoCategoryOption[]>([]);
    const [filtersLoading, setFiltersLoading] = useState(false);
    const [filtersError, setFiltersError] = useState<string | null>(null);

    // -----------------------------------------------------------------------
    // FILTER SELECTIONS (by ID, not name — all Django-only)
    // -----------------------------------------------------------------------
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBrandId, setSelectedBrandId] = useState('');
    const [selectedCategoryFamily, setSelectedCategoryFamily] = useState('');
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState('');
    const [filterTab, setFilterTab] = useState<'all' | 'existing' | 'new'>('all');

    // -----------------------------------------------------------------------
    // SERVER-COMPUTED TAB COUNTS & PAGINATION
    // -----------------------------------------------------------------------
    const [tabCounts, setTabCounts] = useState({ all: 0, existing: 0, new: 0 });
    const [totalPages, setTotalPages] = useState(1);

    // -----------------------------------------------------------------------
    // PAGINATION & PRODUCTS
    // -----------------------------------------------------------------------
    const [page, setPage] = useState(1);
    const pageSize = 12;
    const [isSearching, setIsSearching] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [products, setProducts] = useState<DjangoCleanProduct[]>([]);
    const [searchError, setSearchError] = useState<string | null>(null);

    // -----------------------------------------------------------------------
    // SELECTION: Map of reference -> DjangoCleanProduct
    // -----------------------------------------------------------------------
    const [selectedMap, setSelectedMap] = useState<Map<string, DjangoCleanProduct>>(new Map());

    // -----------------------------------------------------------------------
    // IMPORT SETTINGS (Step 2)
    // -----------------------------------------------------------------------
    const [importName, setImportName] = useState(true);
    const [importShortDesc, setImportShortDesc] = useState(true);
    const [importFeatures, setImportFeatures] = useState(true);
    const [importImages, setImportImages] = useState(true);
    const [imageMode, setImageMode] = useState<'append' | 'replace'>('append');
    const [targetCategoryId, setTargetCategoryId] = useState('');
    const [targetSubCategoryId, setTargetSubCategoryId] = useState('');

    // Step 2 Baraka categories (lazy-loaded only when entering preview step)
    const [barakaCategoriesList, setBarakaCategoriesList] = useState<Array<{ id: string; name: string }>>([]);
    const [barakaSubCategoriesList, setBarakaSubCategoriesList] = useState<Array<{ id: string; name: string; categoryId: string }>>([]);
    const [barakaCatsLoaded, setBarakaCatsLoaded] = useState(false);

    // -----------------------------------------------------------------------
    // WORKFLOW STEP & EXECUTION
    // -----------------------------------------------------------------------
    const [step, setStep] = useState<'search' | 'preview' | 'processing' | 'report'>('search');
    const [progressCurrent, setProgressCurrent] = useState(0);
    const [progressTotal, setProgressTotal] = useState(0);
    const [importReport, setImportReport] = useState<{
        successCount: number;
        failureCount: number;
        results: BatchImportResultItem[];
    } | null>(null);

    // -----------------------------------------------------------------------
    // REFS
    // -----------------------------------------------------------------------
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const requestIdRef = useRef(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // -----------------------------------------------------------------------
    // Body scroll lock & Escape key handling
    // -----------------------------------------------------------------------
    useEffect(() => {
        if (!isOpen) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && step !== 'processing') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, step, onClose]);

    // -----------------------------------------------------------------------
    // LOAD DJANGO FILTER OPTIONS on modal open
    // -----------------------------------------------------------------------
    useEffect(() => {
        if (!isOpen) return;

        setFiltersLoading(true);
        setFiltersError(null);
        getDjangoFiltersAction()
            .then(res => {
                if (res.success) {
                    setDjangoBrands(res.brands);
                    setDjangoCategories(res.categories);
                } else {
                    setFiltersError(res.error || "Erreur lors du chargement des filtres.");
                }
            })
            .catch(() => {
                setFiltersError("Erreur réseau lors du chargement des filtres Django.");
            })
            .finally(() => setFiltersLoading(false));
    }, [isOpen]);

    // -----------------------------------------------------------------------
    // EXECUTE SEARCH — sends ALL filter params to server action
    // -----------------------------------------------------------------------
    const executeSearch = useCallback(async (pageNum: number, overrides?: {
        q?: string;
        brandId?: string;
        categoryFamily?: string;
        subCategoryId?: string;
        tab?: 'all' | 'existing' | 'new';
    }) => {
        setIsSearching(true);
        setSearchError(null);

        const currentRequestId = ++requestIdRef.current;

        const q = overrides?.q ?? searchQuery;
        const brand = overrides?.brandId ?? selectedBrandId;
        const catFamily = overrides?.categoryFamily ?? selectedCategoryFamily;
        const subCat = overrides?.subCategoryId ?? selectedSubCategoryId;
        const tab = overrides?.tab ?? filterTab;

        try {
            const res = await searchDjangoProductsAction({
                q: q.trim() || undefined,
                brandId: brand || undefined,
                categoryFamily: catFamily || undefined,
                subCategoryId: subCat || undefined,
                tab,
                page: pageNum,
                pageSize
            });

            // Race condition guard: ignore stale responses
            if (currentRequestId !== requestIdRef.current) return;

            if (res.success) {
                setProducts(res.results);
                setTotalCount(res.count);
                setTotalPages(res.totalPages || 1);
                if (res.tabCounts) {
                    setTabCounts(res.tabCounts);
                }
            } else {
                setSearchError(res.error || "Erreur de chargement des produits Django.");
            }
        } catch {
            if (currentRequestId !== requestIdRef.current) return;
            setSearchError("Impossible de contacter le serveur Django.");
        } finally {
            if (currentRequestId === requestIdRef.current) {
                setIsSearching(false);
            }
        }
    }, [searchQuery, selectedBrandId, selectedCategoryFamily, selectedSubCategoryId, filterTab]);

    // -----------------------------------------------------------------------
    // RESET when modal opens/closes
    // -----------------------------------------------------------------------
    useEffect(() => {
        if (!isOpen) {
            setStep('search');
            setSelectedMap(new Map());
            setSearchQuery('');
            setSelectedBrandId('');
            setSelectedCategoryFamily('');
            setSelectedSubCategoryId('');
            setFilterTab('all');
            setPage(1);
            setImportReport(null);
            setTabCounts({ all: 0, existing: 0, new: 0 });
            setTotalPages(1);
            setTotalCount(0);
            setProducts([]);
            setBarakaCatsLoaded(false);
            return;
        }
        // Initial load: all products, no filters
        executeSearch(1, { q: '', brandId: '', categoryFamily: '', subCategoryId: '', tab: 'all' });
    }, [isOpen]);

    // -----------------------------------------------------------------------
    // LAZY-LOAD Baraka categories when entering Step 2 (preview)
    // -----------------------------------------------------------------------
    useEffect(() => {
        if (step !== 'preview' || barakaCatsLoaded) return;

        getAdminCategories().then(cats => {
            if (Array.isArray(cats)) setBarakaCategoriesList(cats);
        }).catch(() => {});

        getSubCategories().then(subs => {
            if (Array.isArray(subs)) setBarakaSubCategoriesList(subs as any);
        }).catch(() => {});

        setBarakaCatsLoaded(true);
    }, [step, barakaCatsLoaded]);

    // -----------------------------------------------------------------------
    // DEBOUNCED SEARCH TRIGGER
    // -----------------------------------------------------------------------
    const triggerSearchDebounced = useCallback((overrides: {
        q?: string;
        brandId?: string;
        categoryFamily?: string;
        subCategoryId?: string;
        tab?: 'all' | 'existing' | 'new';
    }) => {
        setPage(1);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            executeSearch(1, overrides);
        }, 180);
    }, [executeSearch]);

    // -----------------------------------------------------------------------
    // FILTER CHANGE HANDLERS
    // -----------------------------------------------------------------------
    const handleTextChange = (val: string) => {
        setSearchQuery(val);
        triggerSearchDebounced({ q: val });
    };

    const handleBrandChange = (brandId: string) => {
        setSelectedBrandId(brandId);
        setPage(1);
        executeSearch(1, { brandId });
    };

    const handleCategoryChange = (catFamily: string) => {
        setSelectedCategoryFamily(catFamily);
        // Reset sub-category since it may no longer be valid
        setSelectedSubCategoryId('');
        setPage(1);
        executeSearch(1, { categoryFamily: catFamily, subCategoryId: '' });
    };

    const handleSubCategoryChange = (subCatId: string) => {
        setSelectedSubCategoryId(subCatId);
        setPage(1);
        executeSearch(1, { subCategoryId: subCatId });
    };

    const handleTabChange = (tab: 'all' | 'existing' | 'new') => {
        setFilterTab(tab);
        setPage(1);
        executeSearch(1, { tab });
    };

    const handleClearAllFilters = () => {
        setSearchQuery('');
        setSelectedBrandId('');
        setSelectedCategoryFamily('');
        setSelectedSubCategoryId('');
        setFilterTab('all');
        setPage(1);
        executeSearch(1, { q: '', brandId: '', categoryFamily: '', subCategoryId: '', tab: 'all' });
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        executeSearch(newPage);
    };

    // -----------------------------------------------------------------------
    // DERIVED: Sub-category options (dependent on selected category)
    // -----------------------------------------------------------------------
    const subCategoryOptions = useMemo(() => {
        if (!selectedCategoryFamily) {
            // No category selected: show all subcategories from all categories
            const allSubs: Array<{ id: string; name: string; type?: string }> = [];
            for (const cat of djangoCategories) {
                for (const sub of cat.subCategories) {
                    allSubs.push({
                        id: sub.id,
                        name: sub.name,
                        type: cat.name
                    });
                }
            }
            return allSubs.sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
        }
        const cat = djangoCategories.find(c => c.id === selectedCategoryFamily);
        return cat ? cat.subCategories.map(s => ({ id: s.id, name: s.name })) : [];
    }, [djangoCategories, selectedCategoryFamily]);

    // -----------------------------------------------------------------------
    // DERIVED: Brand options for SearchableDropdown
    // -----------------------------------------------------------------------
    const brandOptions = useMemo(() => {
        return djangoBrands.map(b => ({
            id: b.id,
            name: `${b.name} (${b.count})`
        }));
    }, [djangoBrands]);

    // -----------------------------------------------------------------------
    // DERIVED: Category options for SearchableDropdown
    // -----------------------------------------------------------------------
    const categoryOptions = useMemo(() => {
        return djangoCategories.map(c => ({
            id: c.id,
            name: `${c.name} (${c.count})`
        }));
    }, [djangoCategories]);

    // -----------------------------------------------------------------------
    // DERIVED: Display names for filter chips
    // -----------------------------------------------------------------------
    const selectedBrandName = useMemo(() => {
        if (!selectedBrandId) return '';
        const found = djangoBrands.find(b => b.id === selectedBrandId);
        return found ? found.name : '';
    }, [djangoBrands, selectedBrandId]);

    const selectedCategoryName = useMemo(() => {
        return selectedCategoryFamily || '';
    }, [selectedCategoryFamily]);

    const selectedSubCategoryName = useMemo(() => {
        if (!selectedSubCategoryId) return '';
        for (const cat of djangoCategories) {
            const sub = cat.subCategories.find(s => s.id === selectedSubCategoryId);
            if (sub) return sub.name;
        }
        return '';
    }, [djangoCategories, selectedSubCategoryId]);

    // -----------------------------------------------------------------------
    // SELECTION HANDLERS
    // -----------------------------------------------------------------------
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

    const isAllPageSelected = products.length > 0 && products.every(p => selectedMap.has(p.reference));
    const toggleSelectAllPage = () => {
        setSelectedMap(prev => {
            const next = new Map(prev);
            if (isAllPageSelected) {
                products.forEach(p => next.delete(p.reference));
            } else {
                products.forEach(p => next.set(p.reference, p));
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
    const hasActiveFilters = Boolean(searchQuery.trim() || selectedBrandId || selectedCategoryFamily || selectedSubCategoryId);

    // -----------------------------------------------------------------------
    // Step 2: Baraka category/subcategory options for import destination
    // -----------------------------------------------------------------------
    const barakaCategoryOptions = useMemo(() => {
        return barakaCategoriesList.map(c => ({ id: c.id, name: c.name }));
    }, [barakaCategoriesList]);

    const barakaSubCategoryOptions = useMemo(() => {
        let filteredSubs = barakaSubCategoriesList;
        if (targetCategoryId) {
            filteredSubs = barakaSubCategoriesList.filter(s => s.categoryId === targetCategoryId);
        }
        return filteredSubs.map(s => ({ id: s.id, name: s.name }));
    }, [barakaSubCategoriesList, targetCategoryId]);

    // -----------------------------------------------------------------------
    // START BATCH IMPORT
    // -----------------------------------------------------------------------
    const handleStartBatchImport = async () => {
        if (selectedList.length === 0) return;

        setStep('processing');
        setProgressCurrent(0);
        setProgressTotal(selectedList.length);

        const itemsInput = selectedList.map(p => ({
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
                defaultCategoryId: targetCategoryId || undefined,
                defaultSubCategoryId: targetSubCategoryId || undefined
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
            toast.error(err.message || "Erreur réseau lors de l'importation.");
            setStep('preview');
        }
    };

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
            {/* Standard Backdrop Overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => {
                    if (step !== 'processing') onClose();
                }}
                className="absolute inset-0 bg-slate-950/65 backdrop-blur-md"
                aria-hidden="true"
            />

            {/* Modal Dialog Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 10 }}
                transition={{ duration: 0.2 }}
                className="relative z-10 w-full max-w-7xl h-[92vh] max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden"
                role="dialog"
                aria-modal="true"
            >
                {/* 1. Header */}
                <div className="px-5 sm:px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100/80 flex items-center justify-center text-orange-600 shrink-0 shadow-xs">
                            <CloudDownload size={20} strokeWidth={2.2} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h3 className="font-bold text-[16px] text-slate-900 tracking-tight">Catalogue Source Django</h3>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200/60">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Synchronisation active
                                </span>
                            </div>
                            <p className="text-[12px] text-slate-500 font-normal mt-0.5">
                                Importation sécurisée des informations textuelles et médias sans altérer vos prix ni stocks.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        disabled={step === 'processing'}
                        className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-all disabled:opacity-40"
                        title="Fermer la fenêtre"
                    >
                        <X size={18} strokeWidth={2.2} />
                    </button>
                </div>

                {/* 2. Stepper Navigation */}
                <div className="px-5 sm:px-6 py-2.5 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
                    <div className="inline-flex items-center p-1 bg-slate-200/60 rounded-xl gap-1">
                        <button
                            type="button"
                            onClick={() => step !== 'processing' && setStep('search')}
                            disabled={step === 'processing'}
                            className={cn(
                                "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-all",
                                step === 'search'
                                    ? "bg-white text-slate-900 shadow-xs"
                                    : "text-slate-600 hover:text-slate-900"
                            )}
                        >
                            <span>1. Sélection des fiches</span>
                            <span className={cn(
                                "px-2 py-0.5 rounded-md text-[11px] font-mono font-bold transition-colors",
                                selectedList.length > 0 ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-500"
                            )}>
                                {selectedList.length}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => step !== 'processing' && selectedList.length > 0 && setStep('preview')}
                            disabled={selectedList.length === 0 || step === 'processing'}
                            className={cn(
                                "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed",
                                step === 'preview'
                                    ? "bg-white text-slate-900 shadow-xs"
                                    : "text-slate-600 hover:text-slate-900"
                            )}
                        >
                            <span>2. Options & Validation</span>
                        </button>

                        {step === 'report' && (
                            <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[12px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-xs">
                                <span>3. Résultat</span>
                            </span>
                        )}
                    </div>

                    {/* Quick Selection Summary */}
                    {selectedList.length > 0 && step === 'search' && (
                        <div className="flex items-center gap-2">
                            <span className="text-[12px] text-slate-500 font-medium">Sélection :</span>
                            {existingCount > 0 && (
                                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                                    {existingCount} existant(s)
                                </span>
                            )}
                            {newCount > 0 && (
                                <span className="text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200/60 px-2.5 py-0.5 rounded-full">
                                    {newCount} nouveau(x)
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={clearAllSelection}
                                className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline ml-1 transition-colors"
                            >
                                Désélectionner tout
                            </button>
                        </div>
                    )}
                </div>

                {/* ============================================================= */}
                {/* STEP 1: Search, Django Filters & Selection                     */}
                {/* ============================================================= */}
                {step === 'search' && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* 3. Filter Toolbar */}
                        <div className="p-4 sm:p-5 border-b border-slate-100 bg-white space-y-3 shrink-0 relative z-20">
                            {/* Row 1: Search + Brand + Category + Sub-category */}
                            <div className="flex flex-col sm:flex-row items-stretch gap-3">
                                {/* Search input */}
                                <div className="relative flex-1">
                                    {isSearching ? (
                                        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="2.5" className="text-slate-200/80" />
                                            <path d="M12 2.5C6.75329 2.5 2.5 6.75329 2.5 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-orange-500" />
                                        </svg>
                                    ) : (
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    )}
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => handleTextChange(e.target.value)}
                                        placeholder="Rechercher par référence (ex: RS143, DE195V67A), mot-clé..."
                                        className="w-full h-11 pl-10 pr-9 bg-slate-50 border border-slate-200/80 rounded-xl text-[13px] font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/40 transition-all shadow-xs"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => handleTextChange('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/50 transition-colors"
                                            title="Effacer"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>

                                {/* Brand dropdown (Django) */}
                                <div className="w-full sm:w-48 shrink-0 relative z-30">
                                    <SearchableDropdown
                                        options={brandOptions}
                                        value={selectedBrandId}
                                        onChange={handleBrandChange}
                                        placeholder="Toutes les marques"
                                        defaultLabel="Toutes les marques"
                                        disabled={filtersLoading}
                                        triggerClassName="h-11 bg-slate-50 text-[12px] rounded-xl border-slate-200/80 hover:bg-white shadow-xs"
                                    />
                                </div>

                                {/* Category dropdown (Django families) */}
                                <div className="w-full sm:w-56 shrink-0 relative z-20">
                                    <SearchableDropdown
                                        options={categoryOptions}
                                        value={selectedCategoryFamily}
                                        onChange={handleCategoryChange}
                                        placeholder="Toutes les catégories"
                                        defaultLabel="Toutes les catégories"
                                        disabled={filtersLoading}
                                        triggerClassName="h-11 bg-slate-50 text-[12px] rounded-xl border-slate-200/80 hover:bg-white shadow-xs"
                                    />
                                </div>

                                {/* Sub-category dropdown (Django, dependent on category) */}
                                <div className="w-full sm:w-56 shrink-0 relative z-20">
                                    <SearchableDropdown
                                        options={subCategoryOptions}
                                        value={selectedSubCategoryId}
                                        onChange={handleSubCategoryChange}
                                        placeholder="Toutes les sous-catégories"
                                        defaultLabel="Toutes les sous-catégories"
                                        disabled={filtersLoading || subCategoryOptions.length === 0}
                                        triggerClassName="h-11 bg-slate-50 text-[12px] rounded-xl border-slate-200/80 hover:bg-white shadow-xs"
                                    />
                                </div>

                                {/* Reset filters button */}
                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={handleClearAllFilters}
                                        className="h-11 px-3.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[12px] flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-xs"
                                        title="Réinitialiser tous les filtres"
                                    >
                                        <Trash2 size={14} />
                                        <span>Effacer</span>
                                    </button>
                                )}
                            </div>

                            {/* Row 2: Tabs + Filter Chips + Select All */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => handleTabChange('all')}
                                            className={cn(
                                                "px-3 py-1 rounded-lg text-[11px] font-bold transition-all",
                                                filterTab === 'all'
                                                    ? "bg-white text-slate-900 shadow-xs"
                                                    : "text-slate-500 hover:text-slate-800"
                                            )}
                                        >
                                            Tous ({tabCounts.all})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleTabChange('existing')}
                                            className={cn(
                                                "px-3 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5",
                                                filterTab === 'existing'
                                                    ? "bg-white text-emerald-700 shadow-xs"
                                                    : "text-slate-500 hover:text-slate-800"
                                            )}
                                        >
                                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                            <span>Existants Baraka ({tabCounts.existing})</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleTabChange('new')}
                                            className={cn(
                                                "px-3 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5",
                                                filterTab === 'new'
                                                    ? "bg-white text-sky-700 shadow-xs"
                                                    : "text-slate-500 hover:text-slate-800"
                                            )}
                                        >
                                            <span className="w-2 h-2 rounded-full bg-sky-500" />
                                            <span>Nouveaux ({tabCounts.new})</span>
                                        </button>
                                    </div>

                                    {(selectedBrandName || selectedCategoryName || selectedSubCategoryName) && (
                                        <div className="flex items-center gap-1.5 text-[11px]">
                                            {selectedBrandName && (
                                                <span className="px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200/60 text-orange-800 font-semibold flex items-center gap-1">
                                                    <Tag size={11} className="text-orange-500" />
                                                    Marque : {selectedBrandName}
                                                </span>
                                            )}
                                            {selectedCategoryName && (
                                                <span className="px-2.5 py-1 rounded-lg bg-violet-50 border border-violet-200/60 text-violet-800 font-semibold flex items-center gap-1">
                                                    <Layers size={11} className="text-violet-500" />
                                                    Cat : {selectedCategoryName}
                                                </span>
                                            )}
                                            {selectedSubCategoryName && (
                                                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200/60 text-indigo-800 font-semibold flex items-center gap-1">
                                                    <Layers size={11} className="text-indigo-500" />
                                                    Sous-cat : {selectedSubCategoryName}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={toggleSelectAllPage}
                                    className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 text-[11px] font-bold rounded-xl flex items-center gap-2 transition-all shadow-xs"
                                >
                                    {isAllPageSelected ? (
                                        <CheckSquare size={14} className="text-orange-600" />
                                    ) : (
                                        <Square size={14} className="text-slate-400" />
                                    )}
                                    <span>{isAllPageSelected ? "Tout désélectionner (cette page)" : "Tout sélectionner (cette page)"}</span>
                                </button>
                            </div>
                        </div>

                        {/* Top progress indicator when refreshing existing results */}
                        {isSearching && products.length > 0 && (
                            <div className="h-0.5 w-full bg-slate-100 overflow-hidden shrink-0">
                                <div className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 w-full animate-pulse" />
                            </div>
                        )}

                        {/* 4. Products Grid */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 bg-slate-50/50 relative">
                            {searchError && (
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-[12px] flex items-center gap-3 shadow-xs mb-4">
                                    <AlertCircle size={20} className="text-amber-600 shrink-0" />
                                    <div className="flex-1">
                                        <p className="font-bold">Information</p>
                                        <p>{searchError}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => executeSearch(page)}
                                        className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 rounded-lg text-amber-900 text-[11px] font-bold flex items-center gap-1.5 transition-colors"
                                    >
                                        <RefreshCw size={12} />
                                        Réessayer
                                    </button>
                                </div>
                            )}

                            {/* Full loader + skeleton only when initial load with no cards */}
                            {isSearching && products.length === 0 && (
                                <div className="py-6 space-y-6">
                                    <SimpleMinimalLoader text="Chargement du catalogue..." size="large" />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 opacity-60">
                                        {Array.from({ length: 6 }).map((_, i) => (
                                            <ProductCardSkeleton key={i} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!searchError && products.length === 0 && !isSearching && (
                                <div className="text-center py-20 text-slate-400 space-y-3">
                                    <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-slate-400 shadow-xs">
                                        <CloudDownload size={28} />
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-base">Aucun produit trouvé dans Django</h4>
                                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                                        Modifiez les termes de recherche ou réinitialisez les filtres de marque et de catégorie.
                                    </p>
                                    {hasActiveFilters && (
                                        <button
                                            type="button"
                                            onClick={handleClearAllFilters}
                                            className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-orange-600 transition-all"
                                        >
                                            Réinitialiser les filtres
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Cards Grid - kept stable during search without unmount churn */}
                            {products.length > 0 && (
                                <div className={cn(
                                    "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 transition-opacity duration-150",
                                    isSearching && "opacity-65"
                                )}>
                                    {products.map((p) => {
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
                                                        ? "bg-orange-50/25 border-orange-500 ring-2 ring-orange-500/20 shadow-sm"
                                                        : "bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-sm"
                                                )}
                                            >
                                                {/* Card Top: Reference + Status + Checkbox */}
                                                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                                                    <span className="font-mono font-bold text-[11px] text-slate-700 bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded-lg truncate max-w-[140px]" title={p.reference}>
                                                        {p.reference}
                                                    </span>

                                                    <div className="flex items-center gap-2 shrink-0">
                                                        {existsInBaraka ? (
                                                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                                <span>MAJ Baraka</span>
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                                                                <span>Nouveau</span>
                                                            </span>
                                                        )}

                                                        <div className={cn(
                                                            "w-5 h-5 rounded-lg border flex items-center justify-center transition-all",
                                                            isSelected
                                                                ? "bg-orange-500 border-orange-500 text-white shadow-xs"
                                                                : "border-slate-300 bg-white group-hover:border-slate-400"
                                                        )}>
                                                            {isSelected && <Check size={12} strokeWidth={3} />}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Card Middle: Thumbnail + Title */}
                                                <div className="flex items-start gap-3.5 my-3">
                                                    <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center shrink-0 p-1 relative group-hover:scale-105 transition-transform">
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
                                                                className="absolute inset-0 w-full h-full object-contain p-1.5 bg-white"
                                                            />
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-[13px] text-slate-900 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors" title={p.name}>
                                                            {p.name}
                                                        </h4>
                                                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-1 font-normal" title={p.libelle || ''}>
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
                                                        ID #{p.id}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* 5. Bottom Action & Pagination Bar */}
                        <div className="px-5 sm:px-6 py-3.5 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 shrink-0">
                            <span className="text-[12px] text-slate-500 font-medium flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span>Total catalogue : <strong className="text-slate-900 font-bold">{totalCount}</strong> produits</span>
                                {totalPages > 1 && (
                                    <span className="text-slate-400 hidden sm:inline">• Page {page} sur {totalPages}</span>
                                )}
                            </span>

                            <div className="flex items-center gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page <= 1 || isSearching}
                                    className="px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 disabled:opacity-40 transition-colors shadow-xs"
                                >
                                    <ChevronLeft size={15} />
                                    <span>Précédent</span>
                                </button>

                                <span className="font-mono text-[12px] font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/60">
                                    {page} / {totalPages || 1}
                                </span>

                                <button
                                    type="button"
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page >= totalPages || isSearching}
                                    className="px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 disabled:opacity-40 transition-colors shadow-xs"
                                >
                                    <span>Suivant</span>
                                    <ChevronRight size={15} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStep('preview')}
                                    disabled={selectedList.length === 0}
                                    className="ml-2 px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-[12px] rounded-xl flex items-center gap-2 shadow-sm hover:shadow-md transition-all disabled:opacity-40 active:scale-95"
                                >
                                    <span>Configurer l&apos;import ({selectedList.length})</span>
                                    <ArrowRight size={15} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ============================================================= */}
                {/* STEP 2: Preview & Import Settings                              */}
                {/* ============================================================= */}
                {step === 'preview' && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-slate-50/50">
                            {/* Summary banner */}
                            <div className="p-5 bg-white border border-slate-200/80 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                                <div className="space-y-1">
                                    <h4 className="font-bold text-[15px] text-slate-900 flex items-center gap-2">
                                        <ShieldCheck className="text-orange-500" size={20} />
                                        Validation de l&apos;import : {selectedList.length} produit(s) sélectionné(s)
                                    </h4>
                                    <p className="text-[12px] text-slate-600 leading-relaxed">
                                        <strong className="text-slate-900">{existingCount}</strong> produit(s) déjà présent(s) dans Baraka seront mis à jour de façon ciblée.
                                        {newCount > 0 && (
                                            <> <strong className="text-slate-900">{newCount}</strong> nouveau(x) produit(s) seront créés en <strong>brouillon non publié</strong>.</>
                                        )}
                                    </p>
                                </div>
                                <div className="text-[11px] font-bold text-slate-700 bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-xl shadow-xs self-start md:self-center">
                                    🔒 Prix & stocks protégés à 100%
                                </div>
                            </div>

                            {/* Destination Category & SubCategory for new products (BARAKA DB) */}
                            {newCount > 0 && (
                                <div className="p-5 bg-white border border-slate-200/80 rounded-2xl space-y-4 shadow-xs">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                            <Layers size={14} className="text-orange-500" />
                                            Catégorie d&apos;affectation pour les {newCount} nouveau(x) produit(s)
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
                                            <div>
                                                <span className="text-[11px] font-medium text-slate-400 block mb-1">Catégorie principale</span>
                                                <SearchableDropdown
                                                    options={barakaCategoryOptions}
                                                    value={targetCategoryId}
                                                    onChange={(val) => {
                                                        setTargetCategoryId(val);
                                                        setTargetSubCategoryId('');
                                                    }}
                                                    placeholder="Choisir une catégorie principale"
                                                    defaultLabel="Catégorie par défaut"
                                                    triggerClassName="h-11 bg-slate-50 text-[12px] rounded-xl border-slate-200/80 hover:bg-white"
                                                />
                                            </div>
                                            <div>
                                                <span className="text-[11px] font-medium text-slate-400 block mb-1">Sous-catégorie (optionnel)</span>
                                                <SearchableDropdown
                                                    options={barakaSubCategoryOptions}
                                                    value={targetSubCategoryId}
                                                    onChange={setTargetSubCategoryId}
                                                    placeholder="Toutes les sous-catégories"
                                                    defaultLabel="Aucune sous-catégorie"
                                                    triggerClassName="h-11 bg-slate-50 text-[12px] rounded-xl border-slate-200/80 hover:bg-white"
                                                />
                                            </div>
                                        </div>
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
                                    <label className="p-4 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-between cursor-pointer hover:border-slate-300 shadow-xs transition-colors">
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
                                    <label className="p-4 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-between cursor-pointer hover:border-slate-300 shadow-xs transition-colors">
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
                                                <p className="text-[11px] text-slate-400">Préserve l&apos;existant si le libellé Django est vide</p>
                                            </div>
                                        </div>
                                    </label>

                                    {/* Caractéristiques */}
                                    <label className="p-4 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-between cursor-pointer hover:border-slate-300 shadow-xs transition-colors">
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
                                    <div className="p-4 bg-white border border-slate-200/80 rounded-2xl flex flex-col justify-between gap-3 shadow-xs">
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
                                                    Galeries d&apos;images
                                                </span>
                                            </label>
                                            <select
                                                value={imageMode}
                                                onChange={(e) => setImageMode(e.target.value as 'append' | 'replace')}
                                                disabled={!importImages}
                                                className="text-[11px] font-bold bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1 text-slate-700"
                                            >
                                                <option value="append">Ajouter à la suite</option>
                                                <option value="replace">Remplacer toute la galerie</option>
                                            </select>
                                        </div>
                                        <p className="text-[11px] text-slate-400">
                                            Transfert sécurisé vers Cloudinary avec respect strict de l&apos;ordre d&apos;origine.
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
                                        <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200/80 sticky top-0">
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
                                                    <td className="py-2.5 px-4 font-mono font-bold text-slate-800 text-[11px]">
                                                        {p.reference}
                                                    </td>
                                                    <td className="py-2.5 px-4 font-semibold text-slate-800 max-w-sm truncate">
                                                        {p.name}
                                                    </td>
                                                    <td className="py-2.5 px-4">
                                                        {p.barakaMatch?.exists ? (
                                                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                                                                Mise à jour ({p.barakaMatch.productId?.slice(0, 8)}...)
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200/60">
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
                        <div className="px-5 sm:px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
                            <button
                                type="button"
                                onClick={() => setStep('search')}
                                className="px-4 py-2 border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[12px] rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                            >
                                <ArrowLeft size={14} />
                                <span>Retour à la sélection</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleStartBatchImport}
                                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-[12px] rounded-xl shadow-sm hover:shadow-md flex items-center gap-2 transition-all active:scale-95"
                            >
                                <CloudDownload size={16} />
                                <span>Confirmer et lancer l&apos;importation ({selectedList.length})</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* ============================================================= */}
                {/* STEP 3: Processing State                                       */}
                {/* ============================================================= */}
                {step === 'processing' && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 space-y-6 text-center bg-slate-50/40">
                        <SimpleMinimalLoader text="Importation en cours..." size="large" />

                        <div className="w-full max-w-sm space-y-2.5 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                            <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                                <span className="flex items-center gap-1.5 text-orange-600">
                                    <Loader2 size={12} className="animate-spin" />
                                    <span>Traitement par lot</span>
                                </span>
                                <span className="font-mono text-slate-900 font-bold text-[13px]">
                                    {progressTotal > 0 ? Math.round((progressCurrent / progressTotal) * 100) : 0}%
                                </span>
                            </div>

                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-orange-500 rounded-full transition-all duration-300"
                                    style={{ width: `${progressTotal > 0 ? (progressCurrent / progressTotal) * 100 : 25}%` }}
                                />
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                                <span>Fiches traitées</span>
                                <span className="font-mono font-semibold text-slate-600">
                                    {progressCurrent} / {progressTotal}
                                </span>
                            </div>
                        </div>

                        <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
                            Transfert sécurisé des données et des images. Ne fermez pas cette fenêtre.
                        </p>

                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[11px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Prix, stocks et configurations protégés</span>
                        </div>
                    </div>
                )}

                {/* ============================================================= */}
                {/* STEP 4: Execution Report                                       */}
                {/* ============================================================= */}
                {step === 'report' && importReport && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-slate-50/50">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-5 bg-white border border-slate-200/80 rounded-2xl text-center shadow-xs">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Traités</span>
                                    <p className="text-3xl font-black text-slate-900 mt-1">{importReport.results.length}</p>
                                </div>
                                <div className="p-5 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl text-center shadow-xs">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Succès</span>
                                    <p className="text-3xl font-black text-emerald-800 mt-1">{importReport.successCount}</p>
                                </div>
                                <div className="p-5 bg-rose-50/80 border border-rose-200/80 rounded-2xl text-center shadow-xs">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Échecs</span>
                                    <p className="text-3xl font-black text-rose-800 mt-1">{importReport.failureCount}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    Détail de chaque produit traité :
                                </span>

                                <div className="border border-slate-200/80 rounded-2xl overflow-hidden max-h-80 overflow-y-auto divide-y divide-slate-100 bg-white shadow-xs">
                                    {importReport.results.map((r) => (
                                        <div key={r.reference} className="p-3.5 flex items-center justify-between text-[12px] hover:bg-slate-50/50 transition-colors">
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
                        <div className="px-5 sm:px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-end shrink-0">
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
        </div>,
        document.body
    );
}
