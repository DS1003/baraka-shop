'use client';

import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    ArrowUpDown,
    Save,
    Box,
    AlertTriangle,
    Loader2,
    Minus,
    Plus,
    History,
    RefreshCw,
    TrendingUp,
    Download,
    PackageCheck,
    Truck,
    ArrowRight,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getAdminProducts, updateProductStock, getAdminCategories, getAdminBrands } from '@/lib/actions/admin-actions';
import { createPortal } from 'react-dom';

export default function InventoryPage() {
    const [inventory, setInventory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [totalProducts, setTotalProducts] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    
    // Filters state
    const [categories, setCategories] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [stockStatus, setStockStatus] = useState<string>('');
    
    // Modal state
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [adjustingProduct, setAdjustingProduct] = useState<any>(null);
    const [adjustValue, setAdjustValue] = useState<number>(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        async function loadInitialData() {
            try {
                const [cats, brs] = await Promise.all([
                    getAdminCategories(),
                    getAdminBrands()
                ]);
                setCategories(cats);
                setBrands(brs);
            } catch (err) {
                console.error("Initial load error:", err);
            }
        }
        loadInitialData();
    }, []);

    useEffect(() => {
        async function loadInventory() {
            setLoading(true);
            try {
                const filters: any = {};
                if (selectedCategory) filters.categoryId = selectedCategory;
                if (selectedBrand) filters.brandId = selectedBrand;
                if (stockStatus) filters.stockStatus = stockStatus;

                const data = await getAdminProducts(searchQuery, page, pageSize, filters);
                setInventory(data.products);
                setTotalProducts(data.total);
            } catch (err) {
                console.error("Load inventory error:", err);
            } finally {
                setLoading(false);
            }
        }
        loadInventory();
    }, [searchQuery, page, selectedCategory, selectedBrand, stockStatus, pageSize]);

    const handleAdjustConfirm = async () => {
        if (!adjustingProduct) return;
        setIsSaving(true);
        try {
            const res = await updateProductStock(adjustingProduct.id, adjustValue);
            if (res.success) {
                setInventory(prev => prev.map(item =>
                    item.id === adjustingProduct.id ? { ...item, stock: adjustValue } : item
                ));
                setIsAdjustModalOpen(false);
            }
        } catch (err) {
            console.error("Adjust confirm error:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const totalStock = inventory.reduce((acc, i) => acc + (i.stock || 0), 0);
    const totalValue = inventory.reduce((acc, i) => acc + ((i.price || 0) * (i.stock || 0)), 0);
    const criticalRupture = inventory.filter(i => i.stock === 0).length;

    return (
        <div className="space-y-12 pb-20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-2 border-b border-slate-200/40">
                <div className="space-y-1.5">
                    <h1 className="text-[36px] font-bold text-slate-900 tracking-tight leading-tight">
                        Contrôle <span className="text-orange-600">Inventaire.</span>
                    </h1>
                    <p className="text-[15px] text-slate-500 font-medium">
                        Gérez vos niveaux de stock et optimisez votre chaîne logistique.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2.5 px-5 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-[13px] hover:bg-slate-50 transition-all shadow-sm">
                        <History size={18} className="text-slate-400" />
                        <span>Historique</span>
                    </button>
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setPage(1);
                            setSelectedCategory('');
                            setSelectedBrand('');
                            setStockStatus('');
                        }}
                        className="flex items-center gap-2.5 px-5 py-3 bg-slate-900 text-white rounded-xl font-bold text-[13px] hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                    >
                        <RefreshCw size={18} />
                        <span>Réinitialiser</span>
                    </button>
                </div>
            </div>

            {/* Strategic KPI Grid */}
            {!loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <InventoryStatCard label="VALEUR STOCK" value={`${Math.round(totalValue / 1000).toLocaleString()}k F`} icon={TrendingUp} color="text-orange-600" bg="bg-orange-50" trend="+0%" />
                    <InventoryStatCard label="UNITÉS TOTALES" value={totalStock.toLocaleString()} icon={Box} color="text-slate-600" bg="bg-slate-50" />
                    <InventoryStatCard label="RUPTURE CRITIQUE" value={criticalRupture} icon={AlertTriangle} color="text-rose-600" bg="bg-rose-50" isWarning={criticalRupture > 0} />
                    <InventoryStatCard label="SANTÉ STOCK" value="98%" icon={PackageCheck} color="text-emerald-600" bg="bg-emerald-50" />
                </div>
            )}

            {/* Technical Tools Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="relative col-span-1 md:col-span-2 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-orange-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher par nom de produit..."
                        className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all shadow-sm"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                    />
                </div>
                
                <select 
                    value={selectedCategory}
                    onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                    className="px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all shadow-sm appearance-none cursor-pointer"
                >
                    <option value="">Tous les Rayons</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>

                <select 
                    value={stockStatus}
                    onChange={(e) => { setStockStatus(e.target.value); setPage(1); }}
                    className="px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all shadow-sm appearance-none cursor-pointer"
                >
                    <option value="">Tous les États</option>
                    <option value="in_stock">En Stock</option>
                    <option value="low_stock">Alerte Stock</option>
                    <option value="out_of_stock">Rupture</option>
                </select>
            </div>

            {/* Technical Inventory Table */}
            <div className="bg-white rounded-[24px] border border-slate-200/50 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="h-[400px] flex flex-col items-center justify-center text-slate-400 gap-4">
                        <Loader2 className="animate-spin text-orange-600" size={32} />
                        <p className="font-bold uppercase tracking-widest text-[10px]">Inventaire temps-réel...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-10 py-6 text-[12px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-left">Produit</th>
                                    <th className="px-10 py-6 text-[12px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Stock</th>
                                    <th className="px-10 py-6 text-[12px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Indicateur</th>
                                    <th className="px-10 py-6 text-[12px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {inventory.map((item) => {
                                    const isOut = item.stock === 0;
                                    const isLow = item.stock < 10 && item.stock > 0;

                                    return (
                                        <tr key={item.id} className="group hover:bg-slate-50/40 transition-all duration-200">
                                            <td className="px-10 py-6 text-left">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200/50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500 overflow-hidden font-black text-slate-200 text-[10px]">
                                                        {item.images?.[0] ? <img src={item.images[0]} alt="" className="w-full h-full object-cover" /> : 'IMG'}
                                                    </div>
                                                    <div>
                                                        <p className="text-[14px] font-bold text-slate-900 leading-snug truncate max-w-[200px] mb-0.5">{item.name}</p>
                                                        <p className="text-[11px] text-slate-400 font-mono tracking-tighter uppercase">{item.brand?.name || 'Général'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <span className={cn(
                                                        "text-[20px] font-black tabular-nums leading-none",
                                                        isOut ? "text-rose-500" : isLow ? "text-amber-500" : "text-slate-900"
                                                    )}>
                                                        {item.stock}
                                                    </span>
                                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">UNITÉS</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 text-center">
                                                <div className="flex justify-center">
                                                    <div className={cn(
                                                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold border",
                                                        isOut ? "bg-rose-50 text-rose-600 border-rose-100" :
                                                            isLow ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                                "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                    )}>
                                                        <div className={cn("w-2 h-2 rounded-full",
                                                            isOut ? "bg-rose-500 animate-pulse" :
                                                                isLow ? "bg-amber-500" :
                                                                    "bg-emerald-500"
                                                        )} />
                                                        <span className="uppercase tracking-tight">{isOut ? 'Rupture' : isLow ? 'Alerte' : 'Stable'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <button
                                                    onClick={() => {
                                                        setAdjustingProduct(item);
                                                        setAdjustValue(item.stock);
                                                        setIsAdjustModalOpen(true);
                                                    }}
                                                    className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg active:scale-95"
                                                >
                                                    Ajust
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {!loading && totalProducts > pageSize && (
                <div className="flex items-center justify-center gap-2 pt-8">
                    <button
                        onClick={() => setPage(prev => Math.max(1, prev - 1))}
                        disabled={page === 1}
                        className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-orange-600 hover:border-orange-500 transition-all disabled:opacity-50"
                    >
                        <ArrowUpDown size={18} className="rotate-90" />
                    </button>
                    
                    {(() => {
                        const totalPages = Math.ceil(totalProducts / pageSize);
                        const pages = [];
                        const window = 2; // Show 2 pages before and after
                        
                        for (let i = 1; i <= totalPages; i++) {
                            if (
                                i === 1 || 
                                i === totalPages || 
                                (i >= page - window && i <= page + window)
                            ) {
                                pages.push(
                                    <button
                                        key={i}
                                        onClick={() => setPage(i)}
                                        className={cn(
                                            "w-12 h-12 flex items-center justify-center rounded-xl font-bold text-[14px] transition-all",
                                            i === page
                                                ? "bg-orange-600 text-white shadow-lg shadow-orange-100"
                                                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                                        )}
                                    >
                                        {i}
                                    </button>
                                );
                            } else if (
                                i === page - window - 1 || 
                                i === page + window + 1
                            ) {
                                pages.push(
                                    <span key={`ellipsis-${i}`} className="w-8 text-center text-slate-300 font-bold">...</span>
                                );
                            }
                        }
                        return pages;
                    })()}

                    <button
                        onClick={() => setPage(prev => Math.min(Math.ceil(totalProducts / pageSize), prev + 1))}
                        disabled={page === Math.ceil(totalProducts / pageSize)}
                        className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-orange-600 hover:border-orange-500 transition-all disabled:opacity-50"
                    >
                        <ArrowUpDown size={18} className="-rotate-90" />
                    </button>
                </div>
            )}

            {/* Ajust Modal */}
            {mounted && createPortal(
                <AnimatePresence>
                    {isAdjustModalOpen && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                exit={{ opacity: 0 }} 
                                onClick={() => setIsAdjustModalOpen(false)} 
                                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
                            />
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                                animate={{ opacity: 1, scale: 1, y: 0 }} 
                                exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                                className="bg-white w-full max-w-md rounded-[40px] shadow-2xl relative z-10 overflow-hidden text-slate-900"
                            >
                                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                                    <div>
                                        <h3 className="text-[20px] font-bold tracking-tight">Ajustement Stock</h3>
                                        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">{adjustingProduct?.name}</p>
                                    </div>
                                    <button onClick={() => setIsAdjustModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100/50 text-slate-400 hover:text-rose-600 transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                                
                                <div className="p-8 space-y-8">
                                    <div className="flex flex-col items-center justify-center py-6 bg-slate-50 rounded-[32px] border border-slate-100">
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">Quantité Actuelle</span>
                                        <div className="text-[48px] font-black text-slate-900 leading-none tracking-tighter tabular-nums">
                                            {adjustValue}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        {[1, 5, 10].map(v => (
                                            <button 
                                                key={v}
                                                onClick={() => setAdjustValue(prev => prev + v)}
                                                className="py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-[14px] hover:bg-emerald-100 transition-all border border-emerald-100"
                                            >
                                                +{v}
                                            </button>
                                        ))}
                                        {[-1, -5, -10].map(v => (
                                            <button 
                                                key={v}
                                                onClick={() => setAdjustValue(prev => Math.max(0, prev + v))}
                                                className="py-3 bg-rose-50 text-rose-600 rounded-2xl font-black text-[14px] hover:bg-rose-100 transition-all border border-rose-100"
                                            >
                                                {v}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button 
                                            onClick={() => setIsAdjustModalOpen(false)} 
                                            className="flex-1 py-4 border border-slate-200 rounded-[20px] font-bold text-[13px] text-slate-500 hover:bg-slate-50 transition-all"
                                        >
                                            Annuler
                                        </button>
                                        <button 
                                            onClick={handleAdjustConfirm}
                                            disabled={isSaving}
                                            className="flex-[2] py-4 bg-slate-900 text-white rounded-[20px] font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-orange-600 shadow-xl transition-all shadow-orange-100/20 disabled:opacity-50"
                                        >
                                            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                            Confirmer
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}

function InventoryStatCard({ label, value, icon: Icon, color, bg, isWarning, trend }: any) {
    return (
        <motion.div
            whileHover={{ y: -6, boxShadow: "0 25px 40px -20px rgba(0,0,0,0.06)" }}
            className="bg-white p-8 rounded-[28px] border border-slate-200/50 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] flex flex-col gap-6 group relative overflow-hidden"
        >
            <div className="flex items-center justify-between relative z-10">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110", bg, color, "border-transparent group-hover:border-current/10")}>
                    <Icon size={26} strokeWidth={2.5} className={cn(isWarning && "animate-bounce")} />
                </div>
            </div>
            <div className="relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
                <h3 className="text-[28px] font-black text-slate-900 tracking-tighter leading-none">{value}</h3>
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-slate-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-1000 pointer-events-none" />
        </motion.div>
    );
}
