'use client';

import React, { useState, useCallback } from 'react';
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
    Loader2,
    X,
    MapPin,
    Phone,
    Mail,
    User,
    Radio,
    RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { updateOrderStatus, bulkUpdateOrderStatuses } from '@/lib/actions/admin-actions';
import { toast } from 'sonner';
import { useRealtimeOrders } from '@/lib/hooks/useRealtimeOrders';


const statusConfig: any = {
    PENDING: { label: 'En attente', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: Clock },
    PROCESSING: { label: 'Traitement', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', icon: History },
    SHIPPED: { label: 'Expédiée', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', icon: Truck },
    DELIVERED: { label: 'Livrée', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: PackageCheck },
    CANCELLED: { label: 'Annulée', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', icon: XCircle },
};

export default function OrdersPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('Toutes');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isUpdatingBulk, setIsUpdatingBulk] = useState(false);

    const handleNewOrder = useCallback((order: any) => {
        setSelectedOrder(order);
    }, []);

    const {
        orders,
        setOrders,
        loading,
        isLive,
        newOrderCount,
        clearNewOrderCount,
        lastRefresh,
        refresh
    } = useRealtimeOrders({
        enabled: true,
        interval: 10_000,
        onNewOrder: handleNewOrder,
    });

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        const res = await updateOrderStatus(orderId, newStatus);
        if (res.success) {
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.user.phone?.includes(searchQuery) ||
            order.id.includes(searchQuery);

        if (activeTab === 'Toutes') return matchesSearch;
        const statusMap: any = { 'En cours': 'PROCESSING', 'Prêtes': 'SHIPPED', 'Livrées': 'DELIVERED', 'Annulées': 'CANCELLED' };
        return matchesSearch && order.status === statusMap[activeTab];
    });

    const handleBulkUpdate = async (status: string) => {
        if (selectedIds.length === 0) return;
        setIsUpdatingBulk(true);
        const res = await bulkUpdateOrderStatuses(selectedIds, status);
        if (res.success) {
            setOrders(prev => prev.map(o => selectedIds.includes(o.id) ? { ...o, status } : o));
            setSelectedIds([]);
            toast.success(`Statut mis à jour pour ${selectedIds.length} commandes`);
        } else {
            toast.error("Erreur lors de la mise à jour");
        }
        setIsUpdatingBulk(false);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredOrders.length && filteredOrders.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredOrders.map(o => o.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const exportCSV = () => {
        const headers = ['Reference', 'Date', 'Client', 'Email', 'Telephone', 'Statut', 'Paiement', 'Total_F_CFA', 'Articles'];
        const rows = filteredOrders.map(o => [
            `#ORD-${o.id.substring(0, 8).toUpperCase()}`,
            new Date(o.createdAt).toLocaleDateString('fr-FR'),
            o.user.username ? o.user.username.replace(/,/g, ' ') : 'N/A',
            o.user.email,
            o.user.phone || 'N/A',
            statusConfig[o.status]?.label || o.status,
            o.paymentMethod,
            o.total,
            o.items.length
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `export_commandes_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const printInvoice = (order: any) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Facture / Bon de Livraison #${order.id.substring(0, 8).toUpperCase()}</title>
                <style>
                    body { font-family: 'Inter', -apple-system, sans-serif; padding: 40px; color: #1B1F3B; line-height: 1.5; }
                    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 50px; border-bottom: 3px solid #F1F5F9; padding-bottom: 30px; }
                    .logo { font-size: 32px; font-weight: 900; letter-spacing: -1px; color: #F97316; }
                    .info { text-align: right; font-size: 14px; }
                    .info strong { font-size: 20px; display: block; margin-bottom: 4px; color: #1B1F3B; }
                    .title { font-size: 12px; color: #94A3B8; text-transform: uppercase; letter-spacing: 2px; font-weight: 800; margin-bottom: 8px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 30px; }
                    th, td { text-align: left; padding: 16px 12px; border-bottom: 1px solid #F1F5F9; }
                    th { font-size: 11px; text-transform: uppercase; color: #94A3B8; font-weight: 800; letter-spacing: 1px; }
                    td { font-size: 14px; font-weight: 600; }
                    .total-row td { font-weight: 900; font-size: 20px; color: #1B1F3B; border-bottom: none; border-top: 3px solid #F1F5F9; padding-top: 24px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <div class="logo">BARAKA SHOP</div>
                        <div style="font-size: 12px; font-weight: 600; color: #94A3B8; margin-top: 4px;">Dakar, Sénégal</div>
                    </div>
                    <div class="info">
                        <strong>FACTURE</strong>
                        Réf. #ORD-${order.id.substring(0, 8).toUpperCase()}<br/>
                        Date: ${new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 40px; background: #F8FAFC; padding: 24px; border-radius: 16px;">
                    <div>
                        <div class="title">Informations Client</div>
                        <div style="font-size: 18px; font-weight: 800; margin-bottom: 8px;">${order.user.username || order.user.email}</div>
                        Email: ${order.user.email}<br/>
                        Téléphone: <span style="font-weight: 700">${order.user.phone || 'Non renseigné'}</span><br/>
                    </div>
                    <div style="text-align: right;">
                        <div class="title">Modalité de paiement</div>
                        <div style="font-size: 16px; font-weight: 800; color: #F97316;">${order.paymentMethod === 'cash' ? 'Paiement à la livraison' : order.paymentMethod.toUpperCase()}</div>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Désignation Produit</th>
                            <th>Prix Unitaire</th>
                            <th>Qté</th>
                            <th style="text-align: right;">Montant Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map((item: any) => `
                            <tr>
                                <td>${item.product.name}</td>
                                <td>${item.price.toLocaleString()} F</td>
                                <td>${item.quantity}</td>
                                <td style="text-align: right;">${(item.price * item.quantity).toLocaleString()} F</td>
                            </tr>
                        `).join('')}
                        <tr class="total-row">
                            <td colspan="3" style="text-align: right;">Montant Net à Payer :</td>
                            <td style="text-align: right; color: #F97316;">${order.total.toLocaleString()} CFA</td>
                        </tr>
                    </tbody>
                </table>
                <div style="margin-top: 80px; font-size: 11px; color: #94A3B8; text-align: center; text-transform: uppercase; font-weight: 800; letter-spacing: 1px;">
                    Merci pour votre confiance. Retrouvez-nous sur notre boutique en ligne.
                </div>
                <script>
                    window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 500); }
                </script>
            </body>
            </html>
        `;
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
    };

    return (
        <div className="space-y-12 pb-20">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-2 border-b border-slate-200/40">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-4">
                        <h1 className="text-[36px] font-bold text-slate-900 tracking-tight leading-tight">
                            Flux <span className="text-orange-600">Commandes.</span>
                        </h1>
                        {/* LIVE Indicator */}
                        <div className={cn(
                            "flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border transition-all",
                            isLive
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                : "bg-slate-100 text-slate-400 border-slate-200"
                        )}>
                            <span className="relative flex h-2.5 w-2.5">
                                {isLive && (
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                )}
                                <span className={cn(
                                    "relative inline-flex rounded-full h-2.5 w-2.5",
                                    isLive ? "bg-emerald-500" : "bg-slate-400"
                                )} />
                            </span>
                            {isLive ? 'LIVE' : 'HORS LIGNE'}
                        </div>
                        {newOrderCount > 0 && (
                            <motion.button
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                onClick={clearNewOrderCount}
                                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-600 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-orange-200 animate-bounce"
                            >
                                +{newOrderCount} nouvelle{newOrderCount > 1 ? 's' : ''}
                            </motion.button>
                        )}
                    </div>
                    <p className="text-[15px] text-slate-500 font-medium flex items-center gap-3">
                        Pilotez vos opérations logistiques en temps réel.
                        <span className="text-[11px] text-slate-400 font-medium">
                            Dernière maj: {lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={refresh}
                        disabled={loading}
                        className="flex items-center gap-2.5 px-5 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-[13px] hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={cn("text-slate-400", loading && "animate-spin")} />
                        <span>Rafraîchir</span>
                    </button>
                    <button onClick={exportCSV} className="flex items-center gap-2.5 px-5 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-[13px] hover:bg-slate-50 transition-all shadow-sm">
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
                            placeholder="Chercher référence, client ou téléphone..."
                            className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {/* Bulk Actions Banner */}
                    <AnimatePresence>
                        {selectedIds.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex items-center gap-4 px-5 py-3 bg-slate-900 rounded-2xl shadow-xl border border-slate-800"
                            >
                                <span className="text-[12px] font-black text-white uppercase tracking-widest border-r border-slate-700 pr-5">
                                    {selectedIds.length} SÉLECTIONNÉ(S)
                                </span>
                                <div className="flex items-center gap-2 pl-1">
                                    <span className="text-[10px] text-slate-400 uppercase font-black mr-2">Action:</span>
                                    <button onClick={() => handleBulkUpdate('SHIPPED')} disabled={isUpdatingBulk} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[11px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
                                        <Truck size={14} /> Expédier
                                    </button>
                                    <button onClick={() => handleBulkUpdate('DELIVERED')} disabled={isUpdatingBulk} className="px-3 py-1.5 bg-white/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
                                        <PackageCheck size={14} /> Livrer
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
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
                                    <th className="px-6 py-6 w-[50px]">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                                            checked={selectedIds.length === filteredOrders.length && filteredOrders.length > 0}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th className="px-4 py-6 text-[12px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Commande</th>
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
                                        <tr key={order.id} className={cn(
                                            "group transition-all duration-200",
                                            selectedIds.includes(order.id) ? "bg-orange-50/50" : "hover:bg-slate-50/40"
                                        )}>
                                            <td className="px-6 py-6">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                                                    checked={selectedIds.includes(order.id)}
                                                    onChange={() => toggleSelect(order.id)}
                                                />
                                            </td>
                                            <td className="px-4 py-6">
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
                                                    <button
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-white hover:text-orange-600 border border-transparent hover:border-slate-200 shadow-sm transition-all"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <div className="relative group/more">
                                                        <button className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200 shadow-sm transition-all">
                                                            <MoreHorizontal size={16} />
                                                        </button>
                                                        {/* Status Update Quick Menu */}
                                                        <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 opacity-0 group-hover/more:opacity-100 pointer-events-none group-hover/more:pointer-events-auto transition-all p-2 z-50">
                                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest p-2 mb-1 border-b border-slate-50">Modifier Statut</p>
                                                            {(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).map(s => (
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
                                        <td colSpan={6} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[12px]">Aucune commande trouvée.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedOrder(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden relative z-10 flex flex-col md:flex-row"
                        >
                            {/* Left Col: Order Context */}
                            <div className="md:w-1/3 bg-slate-50 border-r border-slate-100 p-8 flex flex-col gap-8 overflow-y-auto hidden-scrollbar">
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <span className={cn(
                                            "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold border",
                                            statusConfig[selectedOrder.status].bg,
                                            statusConfig[selectedOrder.status].color,
                                            statusConfig[selectedOrder.status].border
                                        )}>
                                            {React.createElement(statusConfig[selectedOrder.status].icon, { size: 13, strokeWidth: 2.5 })}
                                            <span className="uppercase tracking-widest">{statusConfig[selectedOrder.status].label}</span>
                                        </span>
                                    </div>
                                    <h2 className="text-[20px] font-black text-slate-900 tracking-tight uppercase mb-2">
                                        #ORD-{selectedOrder.id.substring(0, 8)}
                                    </h2>
                                    <p className="text-[12px] text-slate-400 font-medium flex items-center gap-2">
                                        <History size={14} />
                                        {new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>

                                {/* Customer Box */}
                                <div className="bg-white rounded-2xl p-5 border border-slate-200/50 shadow-sm flex flex-col gap-4">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <User size={12} /> Client
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center font-black text-[14px]">
                                            {(selectedOrder.user.username || selectedOrder.user.email).substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-[14px] font-bold text-slate-900 truncate">{selectedOrder.user.username || 'Non renseigné'}</p>
                                            <p className="text-[12px] text-slate-500 truncate flex items-center gap-1">
                                                <Mail size={10} /> {selectedOrder.user.email}
                                            </p>
                                        </div>
                                    </div>
                                    {(selectedOrder.user.phone) && (
                                        <div className="pt-3 border-t border-slate-50 flex flex-col gap-2">
                                            <p className="text-[12px] font-medium text-slate-600 flex items-center gap-2">
                                                <Phone size={14} className="text-slate-400" /> {selectedOrder.user.phone || 'Aucun numéro'}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Shipping / Payment Box */}
                                <div className="bg-white rounded-2xl p-5 border border-slate-200/50 shadow-sm flex flex-col gap-4">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Truck size={12} /> Paiement & Livraison
                                    </h3>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-start gap-2 text-slate-600">
                                            <CreditCard size={14} className="mt-0.5 text-slate-400 shrink-0" />
                                            <div>
                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Moyen de paiement</p>
                                                <p className="text-[13px] font-medium uppercase">{selectedOrder.paymentMethod === 'cash' ? 'Payé à la livraison' : selectedOrder.paymentMethod}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Col: Items Context */}
                            <div className="md:w-2/3 p-8 flex flex-col bg-white overflow-hidden relative">
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-all z-10"
                                >
                                    <X size={18} />
                                </button>

                                <h3 className="text-[16px] font-black text-slate-900 uppercase tracking-widest mb-6">Articles Commandés</h3>

                                <div className="flex-1 overflow-y-auto pr-4 space-y-4 mb-6 hidden-scrollbar">
                                    {selectedOrder.items.map((item: any) => (
                                        <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-slate-50 transition-colors">
                                            <div className="w-16 h-16 rounded-xl bg-white border border-slate-200/50 flex items-center justify-center overflow-hidden shrink-0">
                                                {item.product.images?.[0] ? (
                                                    <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <ShoppingCart size={20} className="text-slate-300" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[14px] font-bold text-slate-900 mb-1 truncate">{item.product.name}</p>
                                                <p className="text-[12px] text-slate-500 font-medium">Prix unitaire: {item.price.toLocaleString()} F</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-[16px] font-black text-slate-900 tabular-nums">{(item.price * item.quantity).toLocaleString()} F</p>
                                                <p className="text-[11px] font-black text-orange-500 uppercase tracking-widest">x{item.quantity}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-slate-900 rounded-[24px] p-6 text-white shadow-xl flex items-center justify-between mt-auto shrink-0">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Total Payé</span>
                                        <span className="text-[28px] font-black text-orange-500 tabular-nums leading-none">
                                            {selectedOrder.total.toLocaleString()} F
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="relative group/change">
                                            <button
                                                onClick={() => printInvoice(selectedOrder)}
                                                className="px-6 py-3.5 bg-white text-slate-900 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 transition-all hover:bg-slate-100 shadow-lg"
                                            >
                                                IMPRIMER FACTURE
                                            </button>
                                        </div>
                                        <div className="relative group/change">
                                            <button className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-[13px] flex items-center gap-2 transition-all">
                                                <ArrowUpDown size={16} /> Changer Statut
                                            </button>
                                            <div className="absolute bottom-full right-0 mb-3 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 opacity-0 group-hover/change:opacity-100 pointer-events-none group-hover/change:pointer-events-auto transition-all p-2 z-50">
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest p-2 mb-1 border-b border-slate-50">Appliquer statut</p>
                                                {(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).map(s => (
                                                    <button
                                                        key={s}
                                                        onClick={() => {
                                                            handleStatusUpdate(selectedOrder.id, s);
                                                            setSelectedOrder({ ...selectedOrder, status: s });
                                                        }}
                                                        className="w-full text-left p-2 rounded-xl text-[12px] font-bold text-slate-600 hover:bg-slate-50 hover:text-orange-600 transition-colors"
                                                    >
                                                        {statusConfig[s].label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
