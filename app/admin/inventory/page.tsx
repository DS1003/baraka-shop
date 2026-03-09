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
    ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getAdminProducts, updateProductStock } from '@/lib/actions/admin-actions';

export default function InventoryPage() {
    const [inventory, setInventory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [changedIds, setChangedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        async function loadInventory() {
            setLoading(true);
            try {
                const data = await getAdminProducts('', 1, 1000); // Admin inventory needs large set
                setInventory(data.products);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        loadInventory();
    }, []);

    const handleStockChange = (id: string, newStock: number) => {
        setInventory(prev => prev.map(item =>
            item.id === id ? { ...item, stock: Math.max(0, newStock) } : item
        ));
        setChangedIds(prev => new Set(prev).add(id));
    };

    const saveChanges = async () => {
        setIsSaving(true);
        try {
            for (const id of changedIds) {
                const item = inventory.find(i => i.id === id);
                if (item) {
                    await updateProductStock(id, item.stock);
                }
            }
            setChangedIds(new Set());
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalStock = inventory.reduce((acc, i) => acc + i.stock, 0);
    const totalValue = inventory.reduce((acc, i) => acc + (i.price * i.stock), 0);
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
                        onClick={saveChanges}
                        disabled={changedIds.size === 0 || isSaving}
                        className={cn(
                            "flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-[13px] transition-all shadow-lg active:scale-95 disabled:opacity-50",
                            changedIds.size > 0
                                ? "bg-orange-600 text-white hover:bg-orange-700 shadow-orange-100"
                                : "bg-slate-100 text-slate-400"
                        )}
                    >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        <span>{isSaving ? 'SYNCHRONISATION...' : `SAUVEGARDER (${changedIds.size})`}</span>
                    </button>
                </div>
            </div>

            {/* Strategic KPI Grid */}
            {!loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <InventoryStatCard label="VALEUR STOCK" value={`${Math.round(totalValue / 1000000).toLocaleString()}M F`} icon={TrendingUp} color="text-orange-600" bg="bg-orange-50" trend="+0%" />
                    <InventoryStatCard label="UNITÉS TOTALES" value={totalStock.toLocaleString()} icon={Box} color="text-slate-600" bg="bg-slate-50" />
                    <InventoryStatCard label="RUPTURE CRITIQUE" value={criticalRupture} icon={AlertTriangle} color="text-rose-600" bg="bg-rose-50" isWarning={criticalRupture > 0} />
                    <InventoryStatCard label="SANTÉ STOCK" value="98%" icon={PackageCheck} color="text-emerald-600" bg="bg-emerald-50" />
                </div>
            )}

            {/* Technical Tools Bar */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="relative flex-1 w-full max-w-xl group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-orange-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher par nom de produit ou marque..."
                        className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
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
                                <tr className="bg-slate-50/50 text-center">
                                    <th className="px-10 py-6 text-[12px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-left">Produit</th>
                                    <th className="px-10 py-6 text-[12px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Disponibilité</th>
                                    <th className="px-10 py-6 text-[12px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Ajustement</th>
                                    <th className="px-10 py-6 text-[12px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Indicateur</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredInventory.map((item) => {
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
                                            <td className="px-10 py-6">
                                                <div className="flex justify-center">
                                                    <div className="inline-flex items-center bg-slate-50 border border-slate-200 p-1 rounded-[16px] shadow-inner">
                                                        <button
                                                            onClick={() => handleStockChange(item.id, item.stock - 1)}
                                                            className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all active:scale-90"
                                                        >
                                                            <Minus size={14} strokeWidth={3} />
                                                        </button>
                                                        <input
                                                            type="number"
                                                            value={item.stock}
                                                            onChange={(e) => handleStockChange(item.id, parseInt(e.target.value) || 0)}
                                                            className="w-16 bg-transparent text-center font-black text-[14px] text-slate-900 focus:outline-none tabular-nums"
                                                        />
                                                        <button
                                                            onClick={() => handleStockChange(item.id, item.stock + 1)}
                                                            className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-500 transition-all active:scale-90"
                                                        >
                                                            <Plus size={14} strokeWidth={3} />
                                                        </button>
                                                    </div>
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
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
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
