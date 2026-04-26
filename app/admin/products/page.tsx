'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Plus,
    Search,
    Filter,
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
    Download,
    Layers,
    Tag,
    BarChart3,
    Loader2,
    Image as ImageIcon,
    ImagePlus,
    X,
    Save,
    ExternalLink,
    Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { RichTextEditor } from '@/ui/RichTextEditor';
import {
    getAdminProducts,
    deleteProduct,
    deleteBulkProducts,
    upsertProduct,
    getAdminCategories,
    getAdminBrands as getBrands,
    getAdminStores,
    getSubCategories,
    getThirdLevelCategories,
    deleteAllProducts
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [detailProduct, setDetailProduct] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [formImages, setFormImages] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Selection
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isGlobalSelected, setIsGlobalSelected] = useState(false);
    const [isDeletingBulk, setIsDeletingBulk] = useState(false);

    // Filters
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [activeFilters, setActiveFilters] = useState<{
        categoryId?: string;
        subCategoryId?: string;
        thirdLevelCategoryId?: string;
        brandId?: string;
        stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock';
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
        if (editingProduct) {
            if (editingProduct.categoryId) {
                getSubCategories(editingProduct.categoryId).then(setSubCategories);
            }
            if (editingProduct.subCategoryId) {
                getThirdLevelCategories(editingProduct.subCategoryId).then(setThirdCategories);
            }
            setFormImages(editingProduct.images || []);
        } else {
            setSubCategories([]);
            setThirdCategories([]);
            setFormImages([]);
        }
    }, [editingProduct]);

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

    const handleUpsert = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name') as string,
            slug: (formData.get('name') as string).toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
            description: formData.get('description') as string,
            price: parseFloat(formData.get('price') as string),
            stock: parseInt(formData.get('stock') as string),
            categoryId: formData.get('categoryId') as string,
            subCategoryId: formData.get('subCategoryId') as string || null,
            thirdLevelCategoryId: formData.get('thirdLevelCategoryId') as string || null,
            brandId: formData.get('brandId') as string || null,
            storeId: formData.get('storeId') as string || null,
            images: formImages,
            shortDescription: formData.get('shortDescription') as string || null,
            features: (formData.get('features') as string || "").split('\n').filter(f => f.trim() !== ""),
            metadata: (() => {
                const raw = formData.get('metadata') as string;
                try { return JSON.parse(raw); } catch { return { info: raw }; }
            })()
        };

        const res = await upsertProduct(data, editingProduct?.id);
        if (res.success) {
            setIsModalOpen(false);
            setEditingProduct(null);
            const updated = await getAdminProducts(searchQuery, page, pageSize);
            setProducts(updated.products);
            setTotal(updated.total);
            toast.success(editingProduct ? '✅ Produit mis à jour !' : '✅ Produit créé !');
        } else {
            toast.error("Erreur lors de la sauvegarde.");
        }
        setIsSaving(false);
    };

    // Removed local KPI calculations - now using 'stats' from server

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-2 border-b border-slate-200/40">
                <div className="space-y-1.5">
                    <h1 className="text-[36px] font-bold text-slate-900 tracking-tight leading-tight">
                        Gestion <span className="text-orange-600">Catalogue.</span>
                    </h1>
                    <p className="text-[15px] text-slate-500 font-medium">
                        Administrez vos produits et optimisez votre inventaire digital.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/products/import"
                        className="flex items-center gap-2.5 px-5 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-[13px] hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <Upload size={18} className="text-slate-400" />
                        <span>Importer CSV</span>
                    </Link>
                    <button
                        onClick={handleBulkDelete}
                        className="flex items-center gap-2.5 px-5 py-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 font-bold text-[13px] hover:bg-rose-100 transition-all shadow-sm"
                    >
                        <Trash2 size={18} />
                        <span>Tout Vider</span>
                    </button>
                    <button
                        onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
                        className="flex items-center gap-3 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold text-[13px] hover:bg-orange-700 hover:shadow-xl hover:shadow-orange-200 transition-all shadow-lg shadow-orange-100 group"
                    >
                        <Plus size={20} />
                        <span>Nouveau Produit</span>
                    </button>
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
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div className="relative flex-1 w-full max-w-xl group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-orange-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher par nom, SKU ou mots-clés..."
                            className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all shadow-sm placeholder:text-slate-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={() => setIsFilterVisible(!isFilterVisible)}
                            className={cn(
                                "flex-1 md:flex-none flex items-center justify-center gap-2.5 px-5 py-3.5 bg-white border rounded-xl font-bold text-[13px] transition-all shadow-sm",
                                isFilterVisible ? "border-orange-200 bg-orange-50 text-orange-600" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                            )}
                        >
                            <Filter size={18} className={isFilterVisible ? "text-orange-500" : "text-slate-400"} />
                            <span>{isFilterVisible ? "Masquer Filtres" : "Afficher Filtres"}</span>
                        </button>
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2.5 px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-[13px] hover:bg-slate-50 transition-all shadow-sm">
                            <Download size={18} className="text-slate-400" />
                            <span>Export</span>
                        </button>
                    </div>
                </div>

                {/* Filter Options Bar */}
                <AnimatePresence>
                    {isFilterVisible && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="p-6 bg-slate-50/50 rounded-[24px] border border-slate-200/50 flex flex-wrap gap-4 items-end">
                                <div className="space-y-2 flex-1 min-w-[200px]">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Catégorie N1</label>
                                    <select
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/10"
                                        value={activeFilters.categoryId || ''}
                                        onChange={(e) => setActiveFilters(prev => ({ ...prev, categoryId: e.target.value || undefined, subCategoryId: undefined, thirdLevelCategoryId: undefined }))}
                                    >
                                        <option value="">Toutes les catégories</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>

                                {filterSubCategories.length > 0 && (
                                    <div className="space-y-2 flex-1 min-w-[200px]">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Catégorie N2</label>
                                        <select
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/10"
                                            value={activeFilters.subCategoryId || ''}
                                            onChange={(e) => setActiveFilters(prev => ({ ...prev, subCategoryId: e.target.value || undefined, thirdLevelCategoryId: undefined }))}
                                        >
                                            <option value="">Toutes les sous-catégories</option>
                                            {filterSubCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                )}

                                {filterThirdCategories.length > 0 && (
                                    <div className="space-y-2 flex-1 min-w-[200px]">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Catégorie N3</label>
                                        <select
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/10"
                                            value={activeFilters.thirdLevelCategoryId || ''}
                                            onChange={(e) => setActiveFilters(prev => ({ ...prev, thirdLevelCategoryId: e.target.value || undefined }))}
                                        >
                                            <option value="">Toutes les catégories N3</option>
                                            {filterThirdCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                )}

                                <div className="space-y-2 flex-1 min-w-[200px]">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Marque</label>
                                    <select
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/10"
                                        value={activeFilters.brandId || ''}
                                        onChange={(e) => setActiveFilters(prev => ({ ...prev, brandId: e.target.value || undefined }))}
                                    >
                                        <option value="">Toutes les marques</option>
                                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2 flex-1 min-w-[200px]">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Statut Stock</label>
                                    <select
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/10"
                                        value={activeFilters.stockStatus || ''}
                                        onChange={(e) => setActiveFilters(prev => ({ ...prev, stockStatus: (e.target.value || undefined) as any }))}
                                    >
                                        <option value="">Tous les statuts</option>
                                        <option value="in_stock">En stock (&gt;10)</option>
                                        <option value="low_stock">Stock faible (&lt;10)</option>
                                        <option value="out_of_stock">Rupture (0)</option>
                                    </select>
                                </div>

                                <button
                                    onClick={() => {
                                        setActiveFilters({});
                                        setSearchQuery('');
                                    }}
                                    className="px-6 py-2.5 text-rose-500 font-bold text-[13px] hover:bg-rose-50 rounded-xl transition-all"
                                >
                                    Réinitialiser
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Premium Table Container */}
            <div className="bg-white rounded-[24px] border border-slate-200/50 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] overflow-hidden min-h-[400px]">
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
                                    <th className="px-6 py-6 border-b border-slate-100 text-center w-16">
                                        <button
                                            onClick={toggleSelectAll}
                                            className="w-6 h-6 rounded-md flex items-center justify-center transition-all bg-white border border-slate-200 text-slate-400 hover:border-orange-500 hover:text-orange-500"
                                        >
                                            {selectedIds.length === products.length && products.length > 0 ? (
                                                <CheckSquare size={16} className="text-orange-600" />
                                            ) : selectedIds.length > 0 ? (
                                                <div className="w-2 h-0.5 bg-orange-600 rounded-full" />
                                            ) : (
                                                <Square size={16} />
                                            )}
                                        </button>
                                    </th>
                                    <th className="px-6 py-6 text-[12px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                        Produit
                                    </th>
                                    <th className="px-4 py-6 text-[12px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Catégorie N1</th>
                                    <th className="px-4 py-6 text-[12px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Catégorie N2</th>
                                    <th className="px-4 py-6 text-[12px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Catégorie N3</th>
                                    <th className="px-4 py-6 text-[12px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Boutique</th>
                                    <th className="px-4 py-6 text-[12px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Prix</th>
                                    <th className="px-4 py-6 text-[12px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Stock</th>
                                    <th className="px-4 py-6 text-[12px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Status</th>
                                    <th className="px-4 py-6 text-[12px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {/* Banner for Global Selection */}
                                {selectedIds.length === products.length && total > products.length && !isGlobalSelected && (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-3 bg-orange-50 border-b border-orange-100 text-center">
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
                                        <td colSpan={9} className="px-6 py-3 bg-orange-100 border-b border-orange-200 text-center">
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
                                        <td className="px-6 py-4 text-center border-b border-slate-50">
                                            <button
                                                onClick={() => toggleSelectOne(p.id)}
                                                className={cn(
                                                    "w-6 h-6 rounded-md flex items-center justify-center transition-all bg-white border",
                                                    selectedIds.includes(p.id)
                                                        ? "border-orange-500 text-orange-500 shadow-sm"
                                                        : "border-slate-200 text-slate-300 group-hover:border-slate-300"
                                                )}
                                            >
                                                {selectedIds.includes(p.id) ? <Check size={14} strokeWidth={3} /> : <Square size={14} />}
                                            </button>
                                        </td>
                                        <td className="px-4 py-4 border-b border-slate-50">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200/50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-2 transition-transform duration-500 overflow-hidden shadow-sm">
                                                    {p.images?.[0] ? (
                                                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ImageIcon size={18} className="text-slate-200" />
                                                    )}
                                                </div>
                                                <div className="min-w-[150px]">
                                                    <p className="text-[14px] font-bold text-slate-900 leading-snug mb-0.5 line-clamp-1">{p.name}</p>
                                                    <p className="text-[11px] text-slate-400 font-medium font-mono uppercase truncate">{p.brand?.name || 'Marque No Name'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 border-b border-slate-50">
                                            <span className="inline-flex px-3 py-1 rounded-lg bg-orange-50 text-orange-600 text-[10px] font-bold uppercase tracking-tight">
                                                {p.category?.name || '-'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 border-b border-slate-50">
                                            {p.subCategory ? (
                                                <span className="inline-flex px-3 py-1 rounded-lg bg-slate-50 border border-slate-200/60 text-slate-600 text-[10px] font-bold uppercase tracking-tight">
                                                    {p.subCategory.name}
                                                </span>
                                            ) : (
                                                <span className="text-slate-300">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 border-b border-slate-50">
                                            {p.thirdLevelCategory ? (
                                                <span className="inline-flex px-3 py-1 rounded-lg bg-slate-50 border border-slate-200/60 text-slate-600 text-[10px] font-bold uppercase tracking-tight">
                                                    {p.thirdLevelCategory.name}
                                                </span>
                                            ) : (
                                                <span className="text-slate-300">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 border-b border-slate-50">
                                            {p.store ? (
                                                <span className="inline-flex px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-tight">
                                                    {p.store.name}
                                                </span>
                                            ) : (
                                                <span className="text-slate-300">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-right font-black text-slate-900 text-[15px] tabular-nums whitespace-nowrap border-b border-slate-50">
                                            {p.price.toLocaleString()} F
                                        </td>
                                        <td className="px-4 py-4 border-b border-slate-50">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <div className="flex items-center gap-1">
                                                    <span className={cn("text-[13px] font-bold", p.stock < 10 ? "text-rose-600" : "text-slate-700")}>{p.stock}</span>
                                                </div>
                                                <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className={cn("h-full rounded-full transition-all duration-700", p.stock < 10 ? "bg-rose-500" : "bg-emerald-500")} style={{ width: `${Math.min(100, (p.stock / 50) * 100)}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center border-b border-slate-50">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight border whitespace-nowrap",
                                                p.stock > 0 ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" : "bg-rose-50 text-rose-600 border-rose-100/50"
                                            )}>
                                                <div className={cn("w-1.5 h-1.5 rounded-full", p.stock > 0 ? "bg-emerald-500" : "bg-rose-500")} />
                                                {p.stock > 0 ? 'En vente' : 'Rupture'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right border-b border-slate-50">
                                            <div className="flex justify-end gap-2 pr-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 duration-300">
                                                <button
                                                    onClick={() => { setEditingProduct(p); setIsModalOpen(true); }}
                                                    className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-white hover:text-orange-600 hover:shadow-md transition-all border border-transparent hover:border-slate-200"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p.id)}
                                                    className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-white hover:text-rose-600 hover:shadow-md transition-all border border-transparent hover:border-slate-200"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="px-10 py-16 text-center text-slate-400 font-bold text-[14px]">
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
                    <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-[13px] text-slate-500 font-medium">
                            Affichage de <span className="font-bold text-slate-900">{(page - 1) * pageSize + 1}</span> à <span className="font-bold text-slate-900">{Math.min(page * pageSize, total)}</span> sur <span className="font-bold text-slate-900">{total}</span> produits
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft size={20} />
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
                                            <span key={`dots-${i}`} className="w-10 h-10 flex items-center justify-center text-slate-400 font-bold">...</span>
                                        ) : (
                                            <button
                                                key={pageNum}
                                                onClick={() => setPage(pageNum)}
                                                className={cn(
                                                    "w-10 h-10 rounded-lg font-bold text-[13px] transition-all",
                                                    page === pageNum
                                                        ? "bg-orange-600 text-white shadow-lg shadow-orange-200"
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
                                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {isDetailOpen && detailProduct && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDetailOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden relative z-10 flex flex-col md:flex-row"
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

                                    <h2 className="text-[32px] font-black text-slate-900 leading-tight mb-4">{detailProduct.name}</h2>

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
                                    <button
                                        onClick={() => { setEditingProduct(detailProduct); setIsModalOpen(true); setIsDetailOpen(false); }}
                                        className="flex-1 flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-2xl font-bold text-[14px] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                                    >
                                        <Edit size={18} />
                                        Modifier
                                    </button>
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
            </AnimatePresence>

            {/* Upsert Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white w-full max-w-3xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden relative z-10 flex flex-col"
                        >
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
                                <div>
                                    <h3 className="text-[20px] font-bold text-slate-900">{editingProduct ? 'Modifier' : 'Ajouter un'} Produit</h3>
                                    <p className="text-[12px] text-slate-400 font-medium">Configurez les détails techniques du produit.</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleUpsert} className="p-8 space-y-8 overflow-y-auto scrollbar-thin flex-1 pb-10">
                                <section className="space-y-6">
                                    <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <div className="w-4 h-[2px] bg-orange-500 rounded-full" />
                                        Informations de Base
                                    </h4>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Nom du Produit</label>
                                            <input
                                                name="name"
                                                defaultValue={editingProduct?.name}
                                                required
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all font-medium"
                                                placeholder="Ex: Abaya Silk Premium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Prix (F CFA)</label>
                                            <input
                                                name="price"
                                                type="number"
                                                defaultValue={editingProduct?.price}
                                                required
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Stock Initial</label>
                                            <input
                                                name="stock"
                                                type="number"
                                                defaultValue={editingProduct?.stock}
                                                required
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <div className="w-4 h-[2px] bg-orange-500 rounded-full" />
                                        Catégorisation & Marque
                                    </h4>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Catégorie (L1)</label>
                                            <select
                                                name="categoryId"
                                                defaultValue={editingProduct?.categoryId}
                                                required
                                                onChange={(e) => {
                                                    const catId = e.target.value;
                                                    getSubCategories(catId).then(setSubCategories);
                                                    setThirdCategories([]);
                                                }}
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all font-medium appearance-none"
                                            >
                                                <option value="">Sélectionner</option>
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Sous-catégorie (L2)</label>
                                            <select
                                                name="subCategoryId"
                                                defaultValue={editingProduct?.subCategoryId}
                                                onChange={(e) => {
                                                    const subId = e.target.value;
                                                    if (subId) getThirdLevelCategories(subId).then(setThirdCategories);
                                                    else setThirdCategories([]);
                                                }}
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all font-medium appearance-none"
                                            >
                                                <option value="">Aucune</option>
                                                {subCategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Sous-sous (L3)</label>
                                            <select
                                                name="thirdLevelCategoryId"
                                                defaultValue={editingProduct?.thirdLevelCategoryId}
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all font-medium appearance-none"
                                            >
                                                <option value="">Aucune</option>
                                                {thirdCategories.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Marque</label>
                                            <select
                                                name="brandId"
                                                defaultValue={editingProduct?.brandId}
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all font-medium appearance-none"
                                            >
                                                <option value="">Aucune</option>
                                                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Boutique (Vendor)</label>
                                            <select
                                                name="storeId"
                                                defaultValue={editingProduct?.storeId}
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all font-medium appearance-none"
                                            >
                                                <option value="">Aucune (Baraka General)</option>
                                                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <div className="w-4 h-[2px] bg-orange-500 rounded-full" />
                                        Gestion des Photos
                                    </h4>

                                    <div className="space-y-4">
                                        {/* Upload Zone - Drag & Drop */}
                                        <div
                                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                                            onDrop={async (e) => {
                                                e.preventDefault();
                                                setIsDragging(false);
                                                const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                                                if (files.length === 0) return;
                                                setIsUploading(true);
                                                try {
                                                    const fd = new FormData();
                                                    files.forEach(f => fd.append('files', f));
                                                    const res = await fetch('/api/upload', { method: 'POST', body: fd });
                                                    const data = await res.json();
                                                    if (data.urls) setFormImages(prev => [...prev, ...data.urls]);
                                                    else toast.error(data.error || 'Erreur upload');
                                                } catch { toast.error('Erreur lors de l\'upload.'); }
                                                finally { setIsUploading(false); }
                                            }}
                                            onClick={() => fileInputRef.current?.click()}
                                            className={cn(
                                                "relative py-10 border-2 border-dashed rounded-[24px] flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300",
                                                isDragging
                                                    ? "border-orange-500 bg-orange-50/80 scale-[1.02] shadow-lg shadow-orange-100"
                                                    : "border-slate-200 bg-slate-50/50 hover:border-orange-300 hover:bg-orange-50/30",
                                                isUploading && "pointer-events-none opacity-60"
                                            )}
                                        >
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                multiple
                                                accept="image/jpeg,image/png,image/webp,image/gif"
                                                className="hidden"
                                                onChange={async (e) => {
                                                    const files = Array.from(e.target.files || []);
                                                    if (files.length === 0) return;
                                                    setIsUploading(true);
                                                    try {
                                                        const fd = new FormData();
                                                        files.forEach(f => fd.append('files', f));
                                                        const res = await fetch('/api/upload', { method: 'POST', body: fd });
                                                        const data = await res.json();
                                                        if (data.urls) setFormImages(prev => [...prev, ...data.urls]);
                                                        else toast.error(data.error || 'Erreur upload');
                                                    } catch { toast.error('Erreur lors de l\'upload.'); }
                                                    finally { setIsUploading(false); e.target.value = ''; }
                                                }}
                                            />
                                            {isUploading ? (
                                                <>
                                                    <Loader2 size={32} className="animate-spin text-orange-500" />
                                                    <p className="text-[13px] font-bold text-orange-600">Upload en cours...</p>
                                                </>
                                            ) : (
                                                <>
                                                    <div className={cn(
                                                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                                                        isDragging ? "bg-orange-500 text-white" : "bg-white border border-slate-200 text-slate-400"
                                                    )}>
                                                        <Upload size={24} />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-[13px] font-bold text-slate-600">
                                                            {isDragging ? 'Déposez vos images ici' : 'Glissez-déposez vos images ici'}
                                                        </p>
                                                        <p className="text-[11px] text-slate-400 font-medium mt-1">
                                                            ou <span className="text-orange-500 font-bold">cliquez pour parcourir</span> — JPG, PNG, WebP • Max 5 MB
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* Image Thumbnails */}
                                        {formImages.length > 0 && (
                                            <div className="grid grid-cols-5 gap-4 bg-slate-50 p-6 rounded-[24px] border border-slate-200/50">
                                                {formImages.map((img, i) => (
                                                    <div key={i} className="relative aspect-square group">
                                                        <div className="w-full h-full rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormImages(prev => prev.filter((_, idx) => idx !== i))}
                                                            className="absolute -top-2 -right-2 w-7 h-7 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
                                                        >
                                                            <X size={14} strokeWidth={3} />
                                                        </button>
                                                        {i === 0 && (
                                                            <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-orange-600 text-white text-[8px] font-black uppercase rounded-md tracking-wider shadow-sm">
                                                                Principal
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <div className="w-4 h-[2px] bg-orange-500 rounded-full" />
                                        Contenu Détaillé
                                    </h4>
                                    
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Description Courte</label>
                                        <textarea
                                            name="shortDescription"
                                            defaultValue={editingProduct?.shortDescription}
                                            rows={2}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all font-medium leading-relaxed"
                                            placeholder="Résumé accrocheur pour le haut de page..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Description Détaillée</label>
                                        <RichTextEditor
                                            name="description"
                                            defaultValue={editingProduct?.description}
                                            placeholder="Décrivez les caractéristiques, matières, coupes..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Caractéristiques (1 par ligne)</label>
                                            <textarea
                                                name="features"
                                                defaultValue={Array.isArray(editingProduct?.features) ? editingProduct.features.join('\n') : ""}
                                                rows={6}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all font-medium leading-relaxed font-mono text-[13px]"
                                                placeholder="Ex: Coton 100%&#10;Lavage 30°C&#10;Coupe ajustée"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Fiche Technique (JSON)</label>
                                            <textarea
                                                name="metadata"
                                                defaultValue={editingProduct?.metadata ? JSON.stringify(editingProduct.metadata, null, 2) : ""}
                                                rows={6}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all font-medium leading-relaxed font-mono text-[13px]"
                                                placeholder='{"Ecran": "15 pouces", "RAM": "16GB"}'
                                            />
                                        </div>
                                    </div>
                                </section>

                                <div className="pt-4 flex gap-4 border-t border-slate-100 pt-8 mt-4 sticky bottom-0 bg-white/80 backdrop-blur-md">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-6 py-4 border border-slate-200 rounded-2xl font-bold text-[14px] text-slate-500 hover:bg-slate-50 transition-all"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex-[2] px-6 py-4 bg-orange-600 text-white rounded-2xl font-bold text-[14px] flex items-center justify-center gap-3 hover:bg-orange-700 shadow-xl shadow-orange-100 transition-all disabled:opacity-50"
                                    >
                                        {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                        <span>{editingProduct ? 'Mettre à jour' : 'Créer le Produit'}</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
                                    onClick={() => setSelectedIds([])}
                                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-[13px] transition-all"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleBulkDelete}
                                    disabled={isDeletingBulk}
                                    className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-[13px] flex items-center gap-2.5 transition-all shadow-lg shadow-rose-900/20 disabled:opacity-50"
                                >
                                    {isDeletingBulk ? <Loader2 size={16} className="animate-spin" /> : <Trash size={16} />}
                                    <span>Supprimer la sélection</span>
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
            whileHover={{ y: -4, boxShadow: "0 15px 30px -10px rgba(0,0,0,0.05)" }}
            className="p-6 bg-white border border-slate-200/50 rounded-[22px] shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] flex flex-col gap-4 group transition-all"
        >
            <div className="flex items-center justify-between">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110", color)}>
                    <Icon size={22} strokeWidth={2.5} />
                </div>
                {trend !== "0" && (
                    <span className={cn(
                        "text-[11px] font-bold px-2 py-1 rounded-lg",
                        isPositiveTrend ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    )}>
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
                <h4 className="text-[24px] font-black text-slate-900 leading-none mt-1">{value}</h4>
            </div>
        </motion.div>
    );
}
