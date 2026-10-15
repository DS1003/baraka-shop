'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    AlertOctagon,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Search,
    RefreshCw,
    Edit3,
    Eye,
    PackageCheck,
    Layers,
    ArrowUpDown,
    Loader2,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    X,
    Bell,
    Mail,
    Plus,
    Tag,
    Info,
    Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getOutOfStockProducts, updateProductStock, reactivateProductAction } from '@/lib/actions/admin-actions';

export default function OutOfStockPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(15);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'ALL' | 'OUT_OF_STOCK' | 'RESTOCKED_PENDING' | 'MANUAL_DEACTIVATED'>('ALL');
    const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'name_asc' | 'name_desc' | 'stock_desc' | 'stock_asc'>('date_desc');
    const [stats, setStats] = useState({
        outOfStockCount: 0,
        restockedPendingCount: 0,
    });

    // Modals
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [isReactivatingId, setIsReactivatingId] = useState<string | null>(null);
    const [confirmModalProduct, setConfirmModalProduct] = useState<any>(null);

    // Stock Adjust Modal
    const [adjustModalProduct, setAdjustModalProduct] = useState<any>(null);
    const [adjustValue, setAdjustValue] = useState<number>(0);
    const [isSavingStock, setIsSavingStock] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getOutOfStockProducts({
                query: searchQuery,
                page,
                pageSize,
                filter,
                sortBy,
            });

            if (res.success) {
                setProducts(res.products || []);
                setTotal(res.total || 0);
                setTotalPages(res.totalPages || 1);
                if (res.stats) setStats(res.stats);
            } else {
                toast.error(res.error || "Erreur de chargement des produits");
            }
        } catch (err) {
            console.error('Error loading out-of-stock products:', err);
            toast.error("Impossible de joindre le serveur");
        } finally {
            setLoading(false);
        }
    }, [searchQuery, page, pageSize, filter, sortBy]);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadData();
        }, 300);
        return () => clearTimeout(timer);
    }, [loadData]);

    const handleConfirmReactivation = async (product: any) => {
        if (!product) return;

        if (product.stock <= 0) {
            toast.error("Impossible de réactiver ce produit : aucune unité n'est disponible en stock.");
            setConfirmModalProduct(null);
            return;
        }

        setIsReactivatingId(product.id);
        try {
            const res = await reactivateProductAction(product.id);
            if (res.success) {
                toast.success("Le produit a été réactivé et est désormais disponible sur le site Baraka.");
                setConfirmModalProduct(null);
                loadData();
            } else {
                toast.error(res.error || "Erreur lors de la réactivation du produit");
            }
        } catch (err: any) {
            console.error("Reactivation error:", err);
            toast.error(err.message || "Erreur serveur lors de la réactivation");
        } finally {
            setIsReactivatingId(null);
        }
    };

    const handleSaveStockAdjust = async () => {
        if (!adjustModalProduct) return;
        setIsSavingStock(true);
        try {
            const res = await updateProductStock(adjustModalProduct.id, adjustValue);
            if (res.success) {
                toast.success("Stock mis à jour avec succès.");
                setAdjustModalProduct(null);
                loadData();
            } else {
                toast.error(res.error || "Erreur lors de la modification du stock.");
            }
        } catch (err: any) {
            toast.error(err.message || "Erreur serveur");
        } finally {
            setIsSavingStock(false);
        }
    };

    return (
        <div className="space-y-8 pb-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-xs">
                            <AlertOctagon size={22} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                                Produits en <span className="text-orange-600">Rupture.</span>
                            </h1>
                            <p className="text-slate-400 text-[13px] font-medium">
                                Suivi des ruptures de stock automatiques et validation des réapprovisionnements.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={() => loadData()}
                        disabled={loading}
                        className="px-3 py-2 bg-white border border-slate-200/80 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-[12px] font-bold shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={cn(loading && "animate-spin text-orange-600")} />
                        <span>Actualiser</span>
                    </button>
                    <Link
                        href="/admin/settings"
                        className="px-3.5 py-2 bg-orange-50 border border-orange-200/70 text-orange-700 hover:bg-orange-100 rounded-xl text-[12px] font-bold shadow-xs transition-all flex items-center gap-1.5"
                    >
                        <Bell size={14} />
                        <span>Notifications Email</span>
                    </Link>
                </div>
            </div>

            {/* Synthetic Dashboard KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. Out of stock */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs relative overflow-hidden flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">En Rupture Totale</p>
                        <h3 className="text-3xl font-black text-rose-600 mt-1">{stats.outOfStockCount}</h3>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">Automatiquement masqués du public</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                        <AlertTriangle size={24} />
                    </div>
                </div>

                {/* 2. Restocked pending validation */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs relative overflow-hidden flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Réapprovisionnés en attente</p>
                        <h3 className="text-3xl font-black text-amber-500 mt-1">{stats.restockedPendingCount}</h3>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">Stock &gt; 0, vérification admin requise</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Clock size={24} />
                    </div>
                </div>

                {/* 3. Total tracked items */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs relative overflow-hidden flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Total Produits Suivis</p>
                        <h3 className="text-3xl font-black text-slate-900 mt-1">{total}</h3>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">Dans la vue actuelle filtrée</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
                        <PackageCheck size={24} />
                    </div>
                </div>
            </div>

            {/* Filters & Search Toolbar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-xs flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
                {/* Search input */}
                <div className="relative flex-1 max-w-md">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, référence ou SKU..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(1);
                        }}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Filter Tabs & Sort */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => { setFilter('ALL'); setPage(1); }}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                filter === 'ALL' ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                            )}
                        >
                            Tous ({total})
                        </button>
                        <button
                            onClick={() => { setFilter('RESTOCKED_PENDING'); setPage(1); }}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                                filter === 'RESTOCKED_PENDING' ? "bg-white text-amber-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
                            )}
                        >
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            Réapprovisionnés ({stats.restockedPendingCount})
                        </button>
                        <button
                            onClick={() => { setFilter('OUT_OF_STOCK'); setPage(1); }}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                                filter === 'OUT_OF_STOCK' ? "bg-white text-rose-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
                            )}
                        >
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            Ruptures ({stats.outOfStockCount})
                        </button>
                    </div>

                    <select
                        value={sortBy}
                        onChange={(e: any) => { setSortBy(e.target.value); setPage(1); }}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-orange-500"
                    >
                        <option value="date_desc">Plus récents d'abord</option>
                        <option value="date_asc">Plus anciens d'abord</option>
                        <option value="stock_desc">Stock le plus élevé</option>
                        <option value="stock_asc">Stock le plus bas</option>
                        <option value="name_asc">Nom A-Z</option>
                        <option value="name_desc">Nom Z-A</option>
                    </select>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                        <Loader2 size={32} className="animate-spin text-orange-600" />
                        <p className="text-xs font-bold uppercase tracking-wider">Chargement des produits...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center px-4">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                            <CheckCircle2 size={32} />
                        </div>
                        <h3 className="text-lg font-black text-slate-900">
                            {filter === 'RESTOCKED_PENDING'
                                ? "Aucun produit réapprovisionné en attente de validation."
                                : "Aucun produit en rupture de stock correspondant aux critères."}
                        </h3>
                        <p className="text-slate-400 text-xs font-medium max-w-md mt-1">
                            Tous les produits en vente disposent d'un stock sain et actif sur la boutique en ligne.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/70 text-[10.5px] font-black uppercase tracking-wider text-slate-400">
                                    <th className="py-3.5 px-4">Produit</th>
                                    <th className="py-3.5 px-3">Catégorie</th>
                                    <th className="py-3.5 px-3">Prix</th>
                                    <th className="py-3.5 px-3 text-center">Quantité</th>
                                    <th className="py-3.5 px-3">Statut Rupture / Réappro</th>
                                    <th className="py-3.5 px-3">Date Désactivation</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs font-medium">
                                {products.map((product) => {
                                    const isRestockedPending = product.restockPendingReview && product.stock > 0;
                                    const isOutOfStock = product.stock <= 0;
                                    const prodImg = product.images?.[0] || '/placeholder.png';

                                    return (
                                        <tr key={product.id} className="hover:bg-slate-50/60 transition-colors">
                                            {/* Produit Thumbnail + Name + SKU */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={prodImg}
                                                        alt={product.name}
                                                        className="w-11 h-11 rounded-xl object-cover bg-slate-100 border border-slate-200/60 shrink-0"
                                                        onError={(e: any) => { e.target.src = '/placeholder.png'; }}
                                                    />
                                                    <div className="min-w-0 max-w-xs md:max-w-sm">
                                                        <p className="font-bold text-slate-900 truncate leading-snug" title={product.name}>
                                                            {product.name}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            {product.reference && (
                                                                <span className="text-[10px] font-mono font-bold text-slate-400">
                                                                    RÉF: {product.reference}
                                                                </span>
                                                            )}
                                                            {product.brand && (
                                                                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.2 rounded">
                                                                    {product.brand.name}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Category */}
                                            <td className="py-3.5 px-3 text-slate-600">
                                                {product.category?.name || 'Sans catégorie'}
                                            </td>

                                            {/* Price */}
                                            <td className="py-3.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                                                {(product.price || 0).toLocaleString()} F
                                            </td>

                                            {/* Stock */}
                                            <td className="py-3.5 px-3 text-center whitespace-nowrap">
                                                <span className={cn(
                                                    "inline-flex items-center justify-center px-2 py-0.5 rounded-lg text-xs font-black",
                                                    product.stock <= 0 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                                                )}>
                                                    {product.stock} u.
                                                </span>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="py-3.5 px-3 whitespace-nowrap">
                                                {isRestockedPending ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                                                        <Clock size={12} />
                                                        Réapprovisionné — Vérif. requise
                                                    </span>
                                                ) : isOutOfStock ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                                                        <AlertTriangle size={12} />
                                                        En rupture de stock
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200">
                                                        {product.isPublished ? 'En vente' : 'Désactivé'}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Deactivation date */}
                                            <td className="py-3.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                                                {product.deactivatedAt ? (
                                                    new Date(product.deactivatedAt).toLocaleDateString('fr-FR', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })
                                                ) : (
                                                    new Date(product.updatedAt).toLocaleDateString('fr-FR', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* Bouton Réactiver (si stock > 0) */}
                                                    <button
                                                        onClick={() => setConfirmModalProduct(product)}
                                                        disabled={isOutOfStock || isReactivatingId === product.id}
                                                        className={cn(
                                                            "px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1",
                                                            isOutOfStock 
                                                                ? "bg-slate-100 text-slate-400 cursor-not-allowed opacity-60" 
                                                                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                                                        )}
                                                        title={isOutOfStock ? "Impossible : stock à zéro" : "Réactiver sur le site public"}
                                                    >
                                                        {isReactivatingId === product.id ? (
                                                            <Loader2 size={12} className="animate-spin" />
                                                        ) : (
                                                            <PackageCheck size={13} />
                                                        )}
                                                        <span>Réactiver</span>
                                                    </button>

                                                    {/* Modifier Stock */}
                                                    <button
                                                        onClick={() => {
                                                            setAdjustModalProduct(product);
                                                            setAdjustValue(product.stock || 0);
                                                        }}
                                                        className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center transition-colors shadow-xs"
                                                        title="Gérer le stock / Réapprovisionner"
                                                    >
                                                        <Plus size={14} />
                                                    </button>

                                                    {/* Modifier fiche produit */}
                                                    <Link
                                                        href={`/admin/products/${product.id}/edit`}
                                                        className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 text-slate-600 hover:text-orange-600 hover:bg-slate-50 flex items-center justify-center transition-colors shadow-xs"
                                                        title="Modifier le produit"
                                                    >
                                                        <Edit3 size={14} />
                                                    </Link>

                                                    {/* Détails Drawer */}
                                                    <button
                                                        onClick={() => setSelectedProduct(product)}
                                                        className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center transition-colors shadow-xs"
                                                        title="Voir les détails"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                        <div>
                            Affichage de la page <span className="font-bold text-slate-900">{page}</span> sur{' '}
                            <span className="font-bold text-slate-900">{totalPages}</span> ({total} produits)
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors flex items-center gap-1"
                            >
                                <ChevronLeft size={14} /> Précédent
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages}
                                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors flex items-center gap-1"
                            >
                                Suivant <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de Confirmation de Réactivation */}
            <AnimatePresence>
                {confirmModalProduct && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                                <PackageCheck size={26} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 leading-snug">
                                Réactiver ce produit sur le catalogue public ?
                            </h3>
                            <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
                                Le produit <strong>{confirmModalProduct.name}</strong> possède actuellement{' '}
                                <strong className="text-emerald-600">{confirmModalProduct.stock} unité(s)</strong> en stock.
                                En validant, il redeviendra immédiatement visible et commandable pour les clients de Baraka.
                            </p>

                            <div className="mt-6 flex items-center justify-end gap-2.5">
                                <button
                                    onClick={() => setConfirmModalProduct(null)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={() => handleConfirmReactivation(confirmModalProduct)}
                                    disabled={isReactivatingId === confirmModalProduct.id}
                                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
                                >
                                    {isReactivatingId === confirmModalProduct.id && (
                                        <Loader2 size={13} className="animate-spin" />
                                    )}
                                    Confirmer la remise en ligne
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Ajustement Rapide du Stock */}
            <AnimatePresence>
                {adjustModalProduct && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100"
                        >
                            <h3 className="text-base font-black text-slate-900">
                                Réapprovisionner / Ajuster le Stock
                            </h3>
                            <p className="text-xs text-slate-400 font-medium mt-1 truncate">
                                {adjustModalProduct.name}
                            </p>

                            <div className="mt-5 space-y-3">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Nouvelle quantité disponible
                                </label>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setAdjustValue(v => Math.max(0, v - 1))}
                                        className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 font-black hover:bg-slate-200 transition-colors"
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        min="0"
                                        value={adjustValue}
                                        onChange={(e) => setAdjustValue(Math.max(0, parseInt(e.target.value) || 0))}
                                        className="flex-1 text-center font-mono font-black text-xl py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setAdjustValue(v => v + 1)}
                                        className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 font-black hover:bg-slate-200 transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                                {adjustValue > 0 && adjustModalProduct.stock <= 0 && (
                                    <div className="p-3 bg-amber-50 border border-amber-200/70 rounded-xl text-[11px] text-amber-800 font-medium">
                                        💡 Le produit passera en statut <strong>« Réapprovisionné — vérification requise »</strong> et restera masqué jusqu’à votre validation.
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex items-center justify-end gap-2.5">
                                <button
                                    onClick={() => setAdjustModalProduct(null)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                                >
                                    Fermer
                                </button>
                                <button
                                    onClick={handleSaveStockAdjust}
                                    disabled={isSavingStock}
                                    className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
                                >
                                    {isSavingStock && <Loader2 size={13} className="animate-spin" />}
                                    Enregistrer
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Slide-over Drawer for Product Stock Details */}
            <AnimatePresence>
                {selectedProduct && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedProduct(null)}
                            className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-50"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-full sm:w-[460px] bg-white shadow-2xl z-50 border-l border-slate-200 flex flex-col"
                        >
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-base font-black text-slate-900">Fiche Stock & Statut</h3>
                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                                <div className="flex gap-4">
                                    <img
                                        src={selectedProduct.images?.[0] || '/placeholder.png'}
                                        alt={selectedProduct.name}
                                        className="w-20 h-20 rounded-2xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                                    />
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm leading-snug">{selectedProduct.name}</h4>
                                        <p className="text-xs text-orange-600 font-bold mt-1">
                                            {(selectedProduct.price || 0).toLocaleString()} FCFA
                                        </p>
                                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                            REF: {selectedProduct.reference || 'Aucune'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3 bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs">
                                    <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Stock Actuel</span>
                                        <span className={cn("font-black text-sm", selectedProduct.stock > 0 ? "text-emerald-600" : "text-rose-600")}>
                                            {selectedProduct.stock} unité(s)
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Visibilité Publique</span>
                                        <span className="font-bold text-slate-900">
                                            {selectedProduct.isPublished && selectedProduct.stock > 0 ? '🟢 En Ligne' : '🔴 Masqué du site'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Motif Désactivation</span>
                                        <span className="font-bold text-slate-700">
                                            {selectedProduct.deactivationReason === 'OUT_OF_STOCK'
                                                ? 'Rupture de Stock Automatique'
                                                : selectedProduct.deactivationReason === 'MANUAL'
                                                ? 'Désactivation Manuelle Admin'
                                                : 'Aucun'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Vérification Réappro</span>
                                        <span className="font-bold text-slate-700">
                                            {selectedProduct.restockPendingReview ? '⚠️ En attente de validation' : 'Aucune'}
                                        </span>
                                    </div>
                                </div>

                                {selectedProduct.restockedAt && (
                                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                                        Dernier réapprovisionnement détecté le{' '}
                                        <strong>{new Date(selectedProduct.restockedAt).toLocaleString('fr-FR')}</strong>.
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50">
                                <Link
                                    href={`/admin/products/${selectedProduct.id}/edit`}
                                    className="flex-1 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold text-center transition-colors shadow-xs"
                                >
                                    Modifier la fiche
                                </Link>
                                <button
                                    onClick={() => {
                                        setSelectedProduct(null);
                                        setConfirmModalProduct(selectedProduct);
                                    }}
                                    disabled={selectedProduct.stock <= 0}
                                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs disabled:opacity-50"
                                >
                                    Réactiver en ligne
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
