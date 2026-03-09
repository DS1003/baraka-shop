'use client';

import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Download,
    Eye,
    Truck,
    PackageCheck,
    Clock,
    XCircle,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    MoreHorizontal,
    ArrowUpDown,
    ShoppingCart,
    Calendar,
    Zap,
    History,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getAdminOrders, updateOrderStatus } from '@/lib/actions/admin-actions';
import { OrderStatus } from '@prisma/client';

const statusConfig: any = {
    PENDING: { label: 'En attente', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: Clock },
    PROCESSING: { label: 'Traitement', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', icon: History },
    SHIPPED: { label: 'Expédiée', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', icon: Truck },
    DELIVERED: { label: 'Livrée', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: PackageCheck },
    CANCELLED: { label: 'Annulée', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', icon: XCircle },
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('Toutes');

    useEffect(() => {
        async function loadOrders() {
            setLoading(true);
            try {
                const data = await getAdminOrders();
                setOrders(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        loadOrders();
    }, []);

    const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
        const res = await updateOrderStatus(orderId, newStatus);
        if (res.success) {
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.id.includes(searchQuery);

        if (activeTab === 'Toutes') return matchesSearch;
        const statusMap: any = { 'En cours': 'PROCESSING', 'Prêtes': 'SHIPPED', 'Livrées': 'DELIVERED', 'Annulées': 'CANCELLED' };
        return matchesSearch && order.status === statusMap[activeTab];
    });

    return (
        <div className="space-y-12 pb-20">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-2 border-b border-slate-200/40">
                <div className="space-y-1.5">
                    <h1 className="text-[36px] font-bold text-slate-900 tracking-tight leading-tight">
                        Flux <span className="text-orange-600">Commandes.</span>
                    </h1>
                    <p className="text-[15px] text-slate-500 font-medium">
                        Pilotez vos opérations logistiques et assurez la satisfaction client.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2.5 px-5 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-[13px] hover:bg-slate-50 transition-all shadow-sm">
                        <Download size={18} className="text-slate-400" />
                        <span>Export CSV</span>
                    </button>
                    <button className="flex items-center gap-3 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold text-[13px] hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 group">
                        <Zap size={18} />
                        <span>Flash Processing</span>
                    </button>
                </div>
            </div>

            {/* Filter System */}
            <div className="flex flex-col gap-8">
                <div className="flex items-center gap-2 p-1.5 bg-slate-100/60 rounded-2xl border border-slate-200/40 w-fit">
                    {['Toutes', 'En cours', 'Prêtes', 'Livrées', 'Annulées'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-6 py-2.5 text-[12px] font-bold rounded-xl transition-all",
                                activeTab === tab
                                    ? "bg-white text-orange-600 shadow-sm border border-slate-200/60"
                                    : "text-slate-500 hover:text-slate-800"
                            )}>
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div className="relative flex-1 w-full max-w-xl group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-orange-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Chercher une référence, un client ou un email..."
                            className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-[24px] border border-slate-200/50 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="h-[400px] flex flex-col items-center justify-center text-slate-400 gap-4">
                        <Loader2 className="animate-spin text-orange-600" size={32} />
                        <p className="font-bold uppercase tracking-widest text-[10px]">Synchronisation du flux...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-10 py-6 text-[12px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Commande</th>
                                    <th className="px-10 py-6 text-[12px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Client</th>
                                    <th className="px-10 py-6 text-[12px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Status</th>
                                    <th className="px-10 py-6 text-[12px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Valeur</th>
                                    <th className="px-10 py-6 text-[12px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredOrders.map((order) => {
                                    const config = statusConfig[order.status] || statusConfig.PENDING;
                                    return (
                                        <tr key={order.id} className="group hover:bg-slate-50/40 transition-all duration-200">
                                            <td className="px-10 py-6">
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-[14px] font-black text-slate-900 tracking-tight uppercase">#ORD-{order.id.substring(0, 8)}</p>
                                                    <p className="text-[11px] text-slate-400 font-medium flex items-center gap-2">
                                                        <History size={12} /> {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center font-bold text-[12px] border border-slate-200/40">
                                                        {(order.user.username || order.user.email).substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-[14px] font-bold text-slate-900 mb-0.5 line-clamp-1">{order.user.username || 'Client Baraka'}</p>
                                                        <p className="text-[11px] text-slate-400 font-medium tracking-tight truncate max-w-[120px]">{order.user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="flex justify-center">
                                                    <div className={cn(
                                                        "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold border transition-all",
                                                        config.bg, config.color, config.border
                                                    )}>
                                                        <config.icon size={13} strokeWidth={2.5} />
                                                        <span className="uppercase tracking-tight">{config.label}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-[16px] font-black text-slate-900 tabular-nums">{order.total.toLocaleString()} F</span>
                                                    <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase px-1.5 py-0.5 bg-slate-50 rounded border border-slate-100">{order.items.length} PRODUITS</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                                    <button className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-white hover:text-orange-600 border border-transparent hover:border-slate-200 shadow-sm transition-all">
                                                        <Eye size={16} />
                                                    </button>
                                                    <div className="relative group/more">
                                                        <button className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200 shadow-sm transition-all">
                                                            <MoreHorizontal size={16} />
                                                        </button>
                                                        {/* Status Update Quick Menu */}
                                                        <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 opacity-0 group-hover/more:opacity-100 pointer-events-none group-hover/more:pointer-events-auto transition-all p-2 z-50">
                                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest p-2 mb-1 border-b border-slate-50">Modifier Statut</p>
                                                            {(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as OrderStatus[]).map(s => (
                                                                <button
                                                                    key={s}
                                                                    onClick={() => handleStatusUpdate(order.id, s)}
                                                                    className="w-full text-left p-2 rounded-xl text-[12px] font-bold text-slate-600 hover:bg-slate-50 hover:text-orange-600 transition-colors"
                                                                >
                                                                    {statusConfig[s].label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredOrders.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[12px]">Aucune commande trouvée.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
