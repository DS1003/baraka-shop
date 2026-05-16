'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Plus,
    Search,
    Filter,
    Download,
    Upload,
    Edit,
    Trash2,
    Trash,
    Check,
    Square,
    CheckSquare,
    ChevronLeft,
    ChevronRight,
    Box as BoxIcon,
    MoreHorizontal,
    Eye,
    ArrowUpDown,
    Layers,
    Tag,
    BarChart3,
    Loader2,
    ImageIcon,
    X,
    ExternalLink,
    Maximize2,
    GripVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import {
    getAdminProducts,
    deleteProduct,
    deleteBulkProducts,
    getAdminCategories,
    getAdminBrands as getBrands,
    getAdminStores,
    getSubCategories,
    getThirdLevelCategories,
    deleteAllProducts,
    toggleProductPublish,
    bulkTogglePublishProducts,
    globalTogglePublishProducts
} from '@/lib/actions/admin-actions';
import { clearImportJobs } from '@/lib/actions/import-bg-actions';
import { testConnection } from '@/lib/actions/debug-actions';
import { toast } from 'sonner';

export default function ProductsPage() {
    const [debugInfo, setDebugInfo] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [stats, setStats] = useState({ activeCount: 0, lowStockCount: 0, categoriesCount: 0 });
    const [page, setPage] = useState(1);
    const pageSize = 12;

    const [loading, setLoading] = useState(true);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [detailProduct, setDetailProduct] = useState<any>(null);

    // Selection
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isGlobalSelected, setIsGlobalSelected] = useState(false);
    const [isDeletingBulk, setIsDeletingBulk] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Filters
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [activeFilters, setActiveFilters] = useState<{
        categoryId?: string;
        subCategoryId?: string;
        thirdLevelCategoryId?: string;
        brandId?: string;
        stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock';
        publishStatus?: 'published' | 'hidden';
    }>({});

    // Form fields
    const [categories, setCategories] = useState<any[]>([]);
    const [subCategories, setSubCategories] = useState<any[]>([]);
    const [thirdCategories, setThirdCategories] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [stores, setStores] = useState<any[]>([]);

    const [filterSubCategories, setFilterSubCategories] = useState<any[]>([]);
    const [filterThirdCategories, setFilterThirdCategories] = useState<any[]>([]);

    useEffect(() => {
        async function loadProducts() {
            setLoading(true);
            try {
                const data = await getAdminProducts(searchQuery, page, pageSize, activeFilters);
                setProducts(data.products || []);
                setTotal(data.total || 0);
                if (data.stats) setStats(data.stats);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        const timer = setTimeout(loadProducts, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, page, activeFilters]);

    // Reset selection on page change OR search change
    useEffect(() => {
        setSelectedIds([]);
        setIsGlobalSelected(false);
    }, [page, searchQuery, activeFilters]);

    useEffect(() => {
        testConnection().then(setDebugInfo);
    }, []);

    useEffect(() => {
        const loadMetadata = async () => {
            const [cats, brs, sts] = await Promise.all([
                getAdminCategories(), 
                getBrands(),
                getAdminStores()
            ]);
            setCategories(cats);
            setBrands(brs);
            setStores(sts);
        };
        loadMetadata();
    }, []);

    useEffect(() => {
        if (activeFilters.categoryId) {
            getSubCategories(activeFilters.categoryId).then(setFilterSubCategories);
        } else {
            setFilterSubCategories([]);
            setActiveFilters(prev => ({ ...prev, subCategoryId: undefined, thirdLevelCategoryId: undefined }));
        }
    }, [activeFilters.categoryId]);

    useEffect(() => {
        if (activeFilters.subCategoryId) {
            getThirdLevelCategories(activeFilters.subCategoryId).then(setFilterThirdCategories);
        } else {
            setFilterThirdCategories([]);
            setActiveFilters(prev => ({ ...prev, thirdLevelCategoryId: undefined }));
        }
    }, [activeFilters.subCategoryId]);

    const handleDelete = async (id: string) => {
        if (confirm("Supprimer ce produit définitivement ?")) {
            const res = await deleteProduct(id);
            if (res.success) {
                setProducts(prev => prev.filter(p => p.id !== id));
                toast.success('🗑️ Produit supprimé avec succès.');
            } else {
                toast.error(res.message || 'Erreur lors de la suppression.');
            }
        }
    };

    const handleBulkDelete = async () => {
        if (!isGlobalSelected && selectedIds.length === 0) return;

        const message = isGlobalSelected
            ? `⚠️ ATTENTION : Supprimer DÉFINITIVEMENT TOUS les produits (${total}) du catalogue ? Cette action est irréversible.`
            : `Supprimer définitivement les ${selectedIds.length} produits sélectionnés ?`;

        if (confirm(message)) {
            setIsDeletingBulk(true);
            try {
                let res;
                if (isGlobalSelected) {
                    res = await deleteAllProducts();
                    if (res?.success !== false) {
                        await clearImportJobs(); // Nettoie aussi les jobs coincés
                    }
                } else {
                    res = await deleteBulkProducts(selectedIds);
                }

                if (res && res.success === false) {
                    toast.error(res.message || "Erreur lors de la suppression.");
                    return;
                }

                if (isGlobalSelected) {
                    setProducts([]);
                    setTotal(0);
                } else {
                    setProducts(prev => prev.filter(p => !selectedIds.includes(p.id)));
                    setTotal(prev => prev - selectedIds.length);
                }
                setSelectedIds([]);
                setIsGlobalSelected(false);
                toast.success(isGlobalSelected
                    ? '🗑️ Catalogue vidé avec succès.'
                    : `🗑️ ${selectedIds.length} produit${selectedIds.length > 1 ? 's' : ''} supprimé${selectedIds.length > 1 ? 's' : ''}.`
                );
            } catch (err) {
                toast.error("Erreur lors de la suppression.");
            } finally {
                setIsDeletingBulk(false);
            }
        }
    };

    const handleTogglePublish = async (id: string, isPublished: boolean) => {
        try {
            const res = await toggleProductPublish(id, isPublished);
            if (res.success) {
                setProducts(prev => prev.map(p => p.id === id ? { ...p, isPublished } : p));
                toast.success(`Produit ${isPublished ? 'publié' : 'dépublié'}.`);
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("Erreur lors de la modification.");
        }
    };

    const handleBulkPublish = async (isPublished: boolean) => {
        if (selectedIds.length === 0 && !isGlobalSelected) return;
        setIsDeletingBulk(true);
        try {
            if (isGlobalSelected) {
                const res = await globalTogglePublishProducts(isPublished);
                if (res.success) {
                    setProducts(prev => prev.map(p => ({ ...p, isPublished })));
                    toast.success(`Le catalogue ENTIER (${total} produits) a été ${isPublished ? 'publié' : 'dépublié'}.`);
                    setSelectedIds([]);
                    setIsGlobalSelected(false);
                } else {
                    toast.error(res.message);
                }
            } else {
                const res = await bulkTogglePublishProducts(selectedIds, isPublished);
                if (res.success) {
                    setProducts(prev => prev.map(p => selectedIds.includes(p.id) ? { ...p, isPublished } : p));
                    toast.success(`${selectedIds.length} produit(s) ${isPublished ? 'publié(s)' : 'dépublié(s)'}.`);
                    setSelectedIds([]);
                } else {
                    toast.error(res.message);
                }
            }
        } catch (error) {
            toast.error("Erreur serveur.");
        } finally {
            setIsDeletingBulk(false);
        }
    };

    const toggleSelectAll = () => {
        if (isGlobalSelected) {
            setIsGlobalSelected(false);
            setSelectedIds([]);
            return;
        }

        if (selectedIds.length === products.length && products.length > 0) {
            setSelectedIds([]);
            setIsGlobalSelected(false);
        } else {
            setSelectedIds(products.map(p => p.id));
        }
    };

    const toggleSelectOne = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    // Removed local KPI calculations - now using 'stats' from server

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-slate-200/40">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Gestion <span className="text-orange-600">Catalogue.</span>
                    </h1>
                    <p className="text-[13px] text-slate-400 font-medium">
                        Administrez vos produits et optimisez votre inventaire digital.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/products/import"
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-bold text-[12px] hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <Upload size={16} className="text-slate-400" />
                        <span>Importer CSV</span>
                    </Link>
                    <button
                        onClick={handleBulkDelete}
                        className="flex items-center gap-2 px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-600 font-bold text-[12px] hover:bg-rose-100 transition-all shadow-sm"
                    >
                        <Trash2 size={16} />
                        <span>Tout Vider</span>
                    </button>
                    <Link
                        href="/admin/products/new"
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg font-bold text-[12px] hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 group"
                    >
                        <Plus size={18} />
                        <span>Nouveau Produit</span>
                    </Link>
                </div>
            </div>

            {/* Performance Snapshot */}
            {!loading && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <ProductQuickStat label="TOTAL PRODUITS" value={total.toString()} trend="+0" icon={BoxIcon} color="bg-orange-50 text-orange-600" />
                    <ProductQuickStat label="CATÉGORIES" value={stats.categoriesCount.toString()} trend="0" icon={Layers} color="bg-violet-50 text-violet-600" />
                    <ProductQuickStat label="EN STOCK" value={stats.activeCount.toString()} trend="+0" icon={BarChart3} color="bg-emerald-50 text-emerald-600" />
                    <ProductQuickStat label="STOCK FAIBLE" value={stats.lowStockCount.toString()} trend="0" isPositiveTrend icon={Tag} color="bg-rose-50 text-rose-600" />
                </div>
            )}

            {/* Tools & Search Bar */}
            <div className="space-y-3">
                <div className="flex flex-col xl:flex-row gap-3 items-stretch">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-orange-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Rechercher par nom, SKU..."
                            className="w-full pl-11 pr-6 py-3 bg-white border border-slate-200 rounded-xl text-[13px] font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all shadow-sm placeholder:text-slate-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex-1 min-w-[150px]">
                            <select
                                className="w-full px-3 py-3 bg-white border border-slate-200 rounded-xl text-[12px] font-bold focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all appearance-none cursor-pointer"
                                value={activeFilters.categoryId || ''}
                                onChange={(e) => setActiveFilters(prev => ({ ...prev, categoryId: e.target.value || undefined, subCategoryId: undefined, thirdLevelCategoryId: undefined }))}
                            >
                                <option value="">Toutes Catégories</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        {filterSubCategories.length > 0 && (
                            <div className="flex-1 min-w-[150px]">
                                <select
                                    className="w-full px-3 py-3 bg-white border border-slate-200 rounded-xl text-[12px] font-bold focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all appearance-none cursor-pointer"
                                    value={activeFilters.subCategoryId || ''}
                                    onChange={(e) => setActiveFilters(prev => ({ ...prev, subCategoryId: e.target.value || undefined, thirdLevelCategoryId: undefined }))}
                                >
                                    <option value="">Sous-catégories</option>
                                    {filterSubCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        )}

                        <div className="flex-1 min-w-[130px]">
                            <select
                                className="w-full px-3 py-3 bg-white border border-slate-200 rounded-xl text-[12px] font-bold focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all appearance-none cursor-pointer"
                                value={activeFilters.brandId || ''}
                                onChange={(e) => setActiveFilters(prev => ({ ...prev, brandId: e.target.value || undefined }))}
                            >
                                <option value="">Marque</option>
                                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>

                        <div className="flex-1 min-w-[130px]">
                            <select
                                className="w-full px-3 py-3 bg-white border border-slate-200 rounded-xl text-[12px] font-bold focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all appearance-none cursor-pointer"
                                value={activeFilters.stockStatus || ''}
                                onChange={(e) => setActiveFilters(prev => ({ ...prev, stockStatus: (e.target.value || undefined) as any }))}
                            >
                                <option value="">Stock</option>
                                <option value="in_stock">En stock (&gt;10)</option>
                                <option value="low_stock">Faible (&lt;10)</option>
                                <option value="out_of_stock">Rupture (0)</option>
                            </select>
                        </div>

                        <div className="flex-1 min-w-[130px]">
                            <select
                                className="w-full px-3 py-3 bg-white border border-slate-200 rounded-xl text-[12px] font-bold focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all appearance-none cursor-pointer"
                                value={activeFilters.publishStatus || ''}
                                onChange={(e) => setActiveFilters(prev => ({ ...prev, publishStatus: (e.target.value || undefined) as any }))}
                            >
                                <option value="">Statut de publication</option>
                                <option value="published">Publiés</option>
                                <option value="hidden">Cachés</option>
                            </select>
                        </div>

                        <button 
                            onClick={() => {
                                setActiveFilters({});
                                setSearchQuery('');
                            }}
                            className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all border border-transparent hover:border-rose-100"
                            title="Réinitialiser"
                        >
                            <X size={18} />
                        </button>

                        <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                            <Download size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Premium Table Container */}
            <div className="bg-white rounded-xl border border-slate-200/50 shadow-sm overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="h-[400px] flex flex-col items-center justify-center text-slate-400 gap-4">
                        <Loader2 className="animate-spin text-orange-600" size={32} />
                        <p className="font-bold uppercase tracking-widest text-[10px]">Indexation du catalogue...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-4 py-4 border-b border-slate-100 text-center w-12">
                                        <button
                                            onClick={toggleSelectAll}
                                            className="w-5 h-5 rounded flex items-center justify-center transition-all bg-white border border-slate-200 text-slate-400 hover:border-orange-500 hover:text-orange-500"
                                        >
                                            {selectedIds.length === products.length && products.length > 0 ? (
                                                <CheckSquare size={14} className="text-orange-600" />
                                            ) : selectedIds.length > 0 ? (
                                                <div className="w-1.5 h-0.5 bg-orange-600 rounded-full" />
                                            ) : (
                                                <Square size={14} />
                                            )}
                                        </button>
                                    </th>
                                    <th className="px-4 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                        Produit
                                    </th>
                                    <th className="px-3 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Réf.</th>
                                    <th className="px-3 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Catégorie N1</th>
                                    <th className="px-3 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Catégorie N2</th>
                                    <th className="px-3 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Catégorie N3</th>
                                    <th className="px-3 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Boutique</th>
                                    <th className="px-3 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Prix</th>
                                    <th className="px-3 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Stock</th>
                                    <th className="px-3 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Status</th>
                                    <th className="px-3 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {/* Banner for Global Selection */}
                                {selectedIds.length === products.length && total > products.length && !isGlobalSelected && (
                                    <tr>
                                        <td colSpan={10} className="px-6 py-3 bg-orange-50 border-b border-orange-100 text-center">
                                            <p className="text-[13px] font-medium text-orange-800">
                                                Les {products.length} produits de cette page sont sélectionnés.
                                                <button
                                                    onClick={() => setIsGlobalSelected(true)}
                                                    className="ml-2 font-black underline hover:text-orange-900 transition-colors"
                                                >
                                                    Sélectionner les {total} produits du catalogue
                                                </button>
                                            </p>
                                        </td>
                                    </tr>
                                )}
                                {isGlobalSelected && (
                                    <tr>
                                        <td colSpan={10} className="px-6 py-3 bg-orange-100 border-b border-orange-200 text-center">
                                            <p className="text-[13px] font-black text-orange-900">
                                                ⚠️ Sélection globale active : TOUS les {total} produits du catalogue sont sélectionnés.
                                                <button
                                                    onClick={() => { setIsGlobalSelected(false); setSelectedIds([]); }}
                                                    className="ml-4 text-orange-700 underline font-bold"
                                                >
                                                    Désélectionner tout
                                                </button>
                                            </p>
                                        </td>
                                    </tr>
                                )}
                                {products.map((p, i) => (
                                    <tr
                                        key={p.id}
                                        className={cn(
                                            "group transition-all duration-200 cursor-pointer",
                                            selectedIds.includes(p.id) ? "bg-orange-50/30" : "hover:bg-slate-50/40"
                                        )}
                                        onClick={(e) => {
                                            // Don't open if clicked on selection button or specific buttons
                                            if ((e.target as HTMLElement).closest('button')) return;
                                            setDetailProduct(p);
                                            setIsDetailOpen(true);
                                        }}
                                    >
                                        <td className="px-4 py-3 text-center border-b border-slate-50">
                                            <button
                                                onClick={() => toggleSelectOne(p.id)}
                                                className={cn(
                                                    "w-5 h-5 rounded flex items-center justify-center transition-all bg-white border",
                                                    selectedIds.includes(p.id)
                                                        ? "border-orange-500 text-orange-500 shadow-sm"
                                                        : "border-slate-200 text-slate-300 group-hover:border-slate-300"
                                                )}
                                            >
                                                {selectedIds.includes(p.id) ? <Check size={12} strokeWidth={3} /> : <Square size={12} />}
                                            </button>
                                        </td>
                                        <td className="px-3 py-3 border-b border-slate-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200/50 flex items-center justify-center flex-shrink-0 transition-transform duration-500 overflow-hidden">
                                                    {p.images?.[0] ? (
                                                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ImageIcon size={16} className="text-slate-200" />
                                                    )}
                                                </div>
                                                <div className="min-w-[150px]">
                                                    <p className="text-[13px] font-bold text-slate-900 leading-snug mb-0.5 line-clamp-1">{p.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium font-mono uppercase truncate">{p.brand?.name || 'Marque No Name'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 border-b border-slate-50">
                                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{p.reference || '-'}</span>
                                        </td>
                                        <td className="px-3 py-3 border-b border-slate-50">
                                            <span className="inline-flex px-2 py-0.5 rounded bg-orange-50 text-orange-600 text-[10px] font-bold uppercase tracking-tight">
                                                {p.category?.name || '-'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 border-b border-slate-50">
                                            {p.subCategory ? (
                                                <span className="inline-flex px-2 py-0.5 rounded bg-slate-50 border border-slate-200/60 text-slate-600 text-[10px] font-bold uppercase tracking-tight">
                                                    {p.subCategory.name}
                                                </span>
                                            ) : (
                                                <span className="text-slate-300">-</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-3 border-b border-slate-50">
                                            {p.thirdLevelCategory ? (
                                                <span className="inline-flex px-2 py-0.5 rounded bg-slate-50 border border-slate-200/60 text-slate-600 text-[10px] font-bold uppercase tracking-tight">
                                                    {p.thirdLevelCategory.name}
                                                </span>
                                            ) : (
                                                <span className="text-slate-300">-</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-3 border-b border-slate-50">
                                            {p.store ? (
                                                <span className="inline-flex px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-tight">
                                                    {p.store.name}
                                                </span>
                                            ) : (
                                                <span className="text-slate-300">-</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-3 text-right font-bold text-slate-900 text-[14px] tabular-nums whitespace-nowrap border-b border-slate-50">
                                            {p.price.toLocaleString()} F
                                        </td>
                                        <td className="px-3 py-3 border-b border-slate-50">
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="flex items-center gap-1">
                                                    <span className={cn("text-[12px] font-bold", p.stock < 10 ? "text-rose-600" : "text-slate-700")}>{p.stock}</span>
                                                </div>
                                                <div className="w-10 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className={cn("h-full rounded-full transition-all duration-700", p.stock < 10 ? "bg-rose-500" : "bg-emerald-500")} style={{ width: `${Math.min(100, (p.stock / 50) * 100)}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center border-b border-slate-50">
                                            <div className="flex flex-col items-center gap-2">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight border whitespace-nowrap",
                                                    p.stock > 0 ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" : "bg-rose-50 text-rose-600 border-rose-100/50"
                                                )}>
                                                    <div className={cn("w-1.5 h-1.5 rounded-full", p.stock > 0 ? "bg-emerald-500" : "bg-rose-500")} />
                                                    {p.stock > 0 ? 'En vente' : 'Rupture'}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleTogglePublish(p.id, !p.isPublished);
                                                    }}
                                                    className={cn(
                                                        "inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight border whitespace-nowrap transition-all",
                                                        p.isPublished ? "bg-blue-50 text-blue-600 border-blue-100/50 hover:bg-blue-100" : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                                                    )}
                                                >
                                                    <div className={cn("w-1.5 h-1.5 rounded-full", p.isPublished ? "bg-blue-500" : "bg-slate-400")} />
                                                    {p.isPublished ? 'Publié' : 'Caché'}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right border-b border-slate-50">
                                            <div className="flex justify-end gap-1.5 pr-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 duration-300">
                                                <Link
                                                    href={`/admin/products/${p.id}/edit`}
                                                    className="p-2 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-white hover:text-orange-600 hover:shadow-sm transition-all border border-transparent hover:border-slate-200"
                                                >
                                                    <Edit size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(p.id)}
                                                    className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-white hover:text-rose-600 hover:shadow-sm transition-all border border-transparent hover:border-slate-200"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr>
                                        <td colSpan={10} className="px-10 py-16 text-center text-slate-400 font-bold text-[14px]">
                                            Aucun produit trouvé selon vos critères.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination Controls */}
                {!loading && total > pageSize && (
                    <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-[12px] text-slate-500 font-medium">
                            Affichage de <span className="font-bold text-slate-900">{(page - 1) * pageSize + 1}</span> à <span className="font-bold text-slate-900">{Math.min(page * pageSize, total)}</span> sur <span className="font-bold text-slate-900">{total}</span> produits
                        </p>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <div className="flex items-center gap-1">
                                {(() => {
                                    const pageCount = Math.ceil(total / pageSize);
                                    const pages: (number | string)[] = [];
                                    if (pageCount <= 7) {
                                        for (let i = 1; i <= pageCount; i++) pages.push(i);
                                    } else {
                                        pages.push(1);
                                        if (page > 3) pages.push('...');
                                        const start = Math.max(2, page - 1);
                                        const end = Math.min(pageCount - 1, page + 1);
                                        for (let i = start; i <= end; i++) pages.push(i);
                                        if (page < pageCount - 2) pages.push('...');
                                        pages.push(pageCount);
                                    }

                                    return pages.map((pageNum, i) => (
                                        typeof pageNum === 'string' ? (
                                            <span key={`dots-${i}`} className="w-8 h-8 flex items-center justify-center text-slate-400 font-bold">...</span>
                                        ) : (
                                            <button
                                                key={pageNum}
                                                onClick={() => setPage(pageNum)}
                                                className={cn(
                                                    "w-8 h-8 rounded-lg font-bold text-[12px] transition-all",
                                                    page === pageNum
                                                        ? "bg-orange-600 text-white shadow-sm"
                                                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                                                )}
                                            >
                                                {pageNum}
                                            </button>
                                        )
                                    ));
                                })()}
                            </div>
                            <button
                                onClick={() => setPage(p => Math.min(Math.ceil(total / pageSize), p + 1))}
                                disabled={page >= Math.ceil(total / pageSize)}
                                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {mounted && createPortal(
                <AnimatePresence>
                    {isDetailOpen && detailProduct && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsDetailOpen(false)}
                                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden relative z-10 flex flex-col md:flex-row"
                            >
                                {/* Left: Product Images */}
                                <div className="md:w-1/2 bg-slate-50 p-8 flex flex-col gap-6 border-r border-slate-100 overflow-y-auto">
                                    <div className="aspect-square bg-white rounded-3xl border border-slate-200/50 flex items-center justify-center overflow-hidden shadow-inner">
                                        {detailProduct.images?.[0] ? (
                                            <img src={detailProduct.images[0]} alt={detailProduct.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon size={64} className="text-slate-200" />
                                        )}
                                    </div>
                                    <div className="grid grid-cols-4 gap-4">
                                        {detailProduct.images?.slice(1).map((img: string, i: number) => (
                                            <div key={i} className="aspect-square bg-white rounded-xl border border-slate-200/50 flex items-center justify-center overflow-hidden hover:border-orange-500 transition-all cursor-pointer">
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                        {(!detailProduct.images || detailProduct.images.length === 0) && (
                                            <div className="col-span-4 py-8 text-center text-slate-400 font-bold text-[11px] uppercase tracking-widest bg-white border border-dashed border-slate-200 rounded-2xl">
                                                Aucune image secondaire
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right: Product Info */}
                                <div className="md:w-1/2 p-10 flex flex-col justify-between overflow-y-auto">
                                    <div>
                                        <div className="flex items-center justify-between mb-8">
                                            <span className="px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                Détails Produit
                                            </span>
                                            <button onClick={() => setIsDetailOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                                <X size={24} />
                                            </button>
                                        </div>

                                        <h2 className="text-2xl font-black text-slate-900 leading-tight mb-4">{detailProduct.name}</h2>

                                        <div className="flex items-center gap-2 mb-8">
                                            <p className="text-[28px] font-black text-orange-600">{detailProduct.price.toLocaleString()} F</p>
                                            <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[13px] font-bold">CFA</span>
                                        </div>

                                        <div className="space-y-6 mb-10">
                                            <div className="grid grid-cols-2 gap-8">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Marque</p>
                                                    <p className="font-bold text-slate-700">{detailProduct.brand?.name || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Stock</p>
                                                    <p className={cn("font-bold", detailProduct.stock < 10 ? "text-rose-500" : "text-emerald-500")}>
                                                        {detailProduct.stock} unités disponibles
                                                    </p>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Hiérarchie Catégories</p>
                                                <div className="flex flex-wrap gap-2">
                                                    <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[12px] font-bold text-slate-700">{detailProduct.category?.name}</span>
                                                    {detailProduct.subCategory && (
                                                        <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[12px] font-bold text-slate-700">{detailProduct.subCategory.name}</span>
                                                    )}
                                                    {detailProduct.thirdLevelCategory && (
                                                        <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[12px] font-bold text-slate-700">{detailProduct.thirdLevelCategory.name}</span>
                                                    )}
                                                </div>
                                            </div>

                                            {detailProduct.shortDescription && (
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description Courte</p>
                                                    <p className="text-[13px] text-slate-600 font-medium italic">{detailProduct.shortDescription}</p>
                                                </div>
                                            )}

                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-wrap">Description Détaillée</p>
                                                <p className="text-[14px] text-slate-500 font-medium leading-relaxed max-h-[100px] overflow-y-auto pr-4 scrollbar-thin">
                                                    {detailProduct.description || 'Aucune description fournie.'}
                                                </p>
                                            </div>

                                            {Array.isArray(detailProduct.features) && detailProduct.features.length > 0 && (
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Caractéristiques</p>
                                                    <ul className="list-disc list-inside text-[13px] text-slate-600 font-medium space-y-1">
                                                        {detailProduct.features.map((f: string, i: number) => <li key={i}>{f}</li>)}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-4 border-t border-slate-100 pt-8 mt-auto">
                                        <Link
                                            href={`/admin/products/${detailProduct.id}/edit`}
                                            className="flex-1 flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-2xl font-bold text-[14px] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                                        >
                                            <Edit size={18} />
                                            Modifier
                                        </Link>
                                        <button
                                            onClick={() => { handleDelete(detailProduct.id); setIsDetailOpen(false); }}
                                            className="flex-1 flex items-center justify-center gap-3 py-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl font-bold text-[14px] hover:bg-rose-100 transition-all"
                                        >
                                            <Trash2 size={18} />
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}



            {/* Selection Floating Bar */}
            <AnimatePresence>
                {
                    selectedIds.length > 0 && (
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] px-8 py-5 bg-[#1B1F3B] rounded-[24px] shadow-2xl flex items-center gap-10 border border-white/10 backdrop-blur-md"
                        >
                            <div className="flex items-center gap-4 border-r border-white/10 pr-10">
                                <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center font-black text-white text-[15px] shadow-lg shadow-orange-500/20">
                                    {isGlobalSelected ? total : selectedIds.length}
                                </div>
                                <span className="text-white font-bold text-[14px] whitespace-nowrap">
                                    {isGlobalSelected ? "TOUS les produits sélectionnés" : "Produits sélectionnés"}
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleBulkPublish(true)}
                                    disabled={isDeletingBulk}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[12px] flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
                                >
                                    <Eye size={14} /> Publier
                                </button>
                                <button
                                    onClick={() => handleBulkPublish(false)}
                                    disabled={isDeletingBulk}
                                    className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-bold text-[12px] flex items-center gap-2 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-50"
                                >
                                    <X size={14} /> Cacher
                                </button>
                                <button
                                    onClick={handleBulkDelete}
                                    disabled={isDeletingBulk}
                                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[12px] flex items-center gap-2 transition-all shadow-lg shadow-rose-900/20 disabled:opacity-50"
                                >
                                    {isDeletingBulk ? <Loader2 size={14} className="animate-spin" /> : <Trash size={14} />}
                                    <span>Supprimer</span>
                                </button>
                                <button
                                    onClick={() => setSelectedIds([])}
                                    className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold text-[12px] transition-all ml-2"
                                >
                                    Annuler
                                </button>
                            </div>
                        </motion.div>
                    )
                }
            </AnimatePresence >
        </div >
    );
}

function ProductQuickStat({ label, value, trend, isPositiveTrend, icon: Icon, color }: any) {
    return (
        <motion.div
            whileHover={{ y: -2, boxShadow: "0 10px 20px -10px rgba(0,0,0,0.04)" }}
            className="p-5 bg-white border border-slate-200/50 rounded-xl shadow-sm flex flex-col gap-3 group transition-all"
        >
            <div className="flex items-center justify-between">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110", color)}>
                    <Icon size={18} strokeWidth={2.5} />
                </div>
                {trend !== "0" && (
                    <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-md",
                        isPositiveTrend ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    )}>
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
                <h4 className="text-[20px] font-black text-slate-900 leading-none mt-1">{value}</h4>
            </div>
        </motion.div>
    );
}
