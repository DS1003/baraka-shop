'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
    Search, Download, Eye, Truck, PackageCheck, Clock, XCircle,
    ShoppingCart, Calendar, Zap, History, Loader2, X,
    MapPin, Phone, User, RefreshCw, Inbox,
    CheckCircle2, Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { updateOrderStatus, bulkUpdateOrderStatuses } from '@/lib/actions/admin-actions';
import { toast } from 'sonner';
import { useRealtimeOrders } from '@/lib/hooks/useRealtimeOrders';

const statusConfig: any = {
    PENDING: { label: 'En attente', color: 'text-amber-600', dot: 'bg-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock, next: 'PROCESSING', nextLabel: 'Traiter' },
    PROCESSING: { label: 'En cours', color: 'text-blue-600', dot: 'bg-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', icon: History, next: 'SHIPPED', nextLabel: 'Expédier' },
    SHIPPED: { label: 'Expédiée', color: 'text-violet-600', dot: 'bg-violet-500', bg: 'bg-violet-50', border: 'border-violet-200', icon: Truck, next: 'DELIVERED', nextLabel: 'Livrer' },
    DELIVERED: { label: 'Livrée', color: 'text-emerald-600', dot: 'bg-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: PackageCheck, next: null },
    CANCELLED: { label: 'Annulée', color: 'text-rose-600', dot: 'bg-rose-500', bg: 'bg-rose-50', border: 'border-rose-200', icon: XCircle, next: null },
};

export default function OrdersPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('Toutes');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isUpdatingBulk, setIsUpdatingBulk] = useState(false);
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

    const handleNewOrder = useCallback((order: any) => {}, []);

    const {
        orders, setOrders, loading, isLive, newOrderCount,
        clearNewOrderCount, lastRefresh, refresh
    } = useRealtimeOrders({
        enabled: true,
        interval: 10_000,
        onNewOrder: handleNewOrder,
    });

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        if (updatingOrderId) return;
        setUpdatingOrderId(orderId);
        try {
            const res = await updateOrderStatus(orderId, newStatus);
            if (res?.success) {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
                if (selectedOrder?.id === orderId) {
                    setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
                }
                toast.success(`Statut mis à jour avec succès.`);
            } else {
                toast.error(`Erreur: ${res?.error || 'Inconnue'}`);
            }
        } catch (err: any) {
            console.error("Status update error:", err);
            toast.error("La connexion au serveur a échoué. Veuillez réessayer.");
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const handleBulkUpdate = async (status: string) => {
        if (selectedIds.length === 0 || isUpdatingBulk) return;
        setIsUpdatingBulk(true);
        try {
            const res = await bulkUpdateOrderStatuses(selectedIds, status);
            if (res?.success) {
                setOrders(prev => prev.map(o => selectedIds.includes(o.id) ? { ...o, status } : o));
                setSelectedIds([]);
                toast.success(`Statut mis à jour pour ${selectedIds.length} commandes`);
            } else {
                toast.error(res?.error || "Erreur lors de la mise à jour massive");
            }
        } catch (err: any) {
            console.error("Bulk update error:", err);
            toast.error("Erreur de connexion lors de la mise à jour massive");
        } finally {
            setIsUpdatingBulk(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredOrders.length && filteredOrders.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredOrders.map(o => o.id));
        }
    };

    const toggleSelect = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesSearch = order.user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.user.phone?.includes(searchQuery) ||
                order.id.includes(searchQuery);

            if (activeTab === 'Toutes') return matchesSearch;
            const statusMap: any = { 'En attente': 'PENDING', 'En cours': 'PROCESSING', 'Expédiées': 'SHIPPED', 'Livrées': 'DELIVERED', 'Annulées': 'CANCELLED' };
            return matchesSearch && order.status === statusMap[activeTab];
        });
    }, [orders, searchQuery, activeTab]);

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
                        <div style="margin-top: 16px;">
                            <div class="title">Mode de réception</div>
                            <div style="font-size: 14px; font-weight: 800; color: #1B1F3B;">
                                ${order.deliveryMethod === 'retrait' ? '🏪 Retrait en boutique' : '🚚 Livraison à domicile'}
                            </div>
                            ${order.deliveryMethod === 'livraison' && order.deliveryZone ? `
                                <div style="font-size: 13px; font-weight: 700; color: #F97316; margin-top: 4px;">
                                    Zone: ${order.deliveryZone} — ${(order.shippingCost || 0).toLocaleString()} FCFA
                                </div>
                            ` : ''}
                        </div>
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
                                <td>
                                    ${item.product.name}
                                    ${item.selectedColor ? `<br/><span style="font-size: 10px; color: #F97316; font-weight: bold; text-transform: uppercase;">Couleur: ${item.selectedColor}</span>` : ''}
                                </td>
                                <td>${item.price.toLocaleString()} F</td>
                                <td>${item.quantity}</td>
                                <td style="text-align: right;">${(item.price * item.quantity).toLocaleString()} F</td>
                            </tr>
                        `).join('')}
                        <tr class="total-row">
                            <td colspan="3" style="text-align: right;">Montant Net à Payer :</td>
                            <td style="text-align: right; color: #F97316;">${order.total.toLocaleString()} FCFA</td>
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
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                            Gestion <span className="text-orange-600">Commandes.</span>
                        </h1>
                        <div className={cn(
                            "flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                            isLive ? "bg-emerald-50/50 text-emerald-600 border-emerald-200/60" : "bg-slate-50 text-slate-500 border-slate-200"
                        )}>
                            <span className="relative flex h-1.5 w-1.5">
                                {isLive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />}
                                <span className={cn("relative inline-flex rounded-full h-1.5 w-1.5", isLive ? "bg-emerald-500" : "bg-slate-400")} />
                            </span>
                            {isLive ? 'Temps Réel' : 'Hors Ligne'}
                        </div>
                    </div>
                    <p className="text-slate-400 text-[14px] font-medium">
                        Suivez et traitez vos commandes en un clin d'œil.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {newOrderCount > 0 && (
                        <motion.button
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            onClick={clearNewOrderCount}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-50 text-orange-600 border border-orange-200/60 font-bold text-[12px] hover:bg-orange-100 transition-colors shadow-sm"
                        >
                            <span className="flex h-1.5 w-1.5 rounded-full bg-orange-600" />
                            {newOrderCount} nouvelle{newOrderCount > 1 ? 's' : ''}
                        </motion.button>
                    )}
                    <button
                        onClick={refresh}
                        disabled={loading}
                        className="flex items-center justify-center px-3 py-2 bg-white border border-slate-200/60 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm disabled:opacity-50 text-[12px] font-semibold gap-2"
                    >
                        <RefreshCw size={14} className={cn(loading && "animate-spin")} />
                        Rafraîchir
                    </button>
                    <button
                        className="flex items-center justify-center px-3 py-2 bg-white border border-slate-200/60 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm text-[12px] font-semibold gap-2"
                    >
                        <Download size={14} />
                        Export
                    </button>
                </div>
            </div>

            {/* Controls (Tabs + Search) */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
                {/* Minimalist Tabs */}
                <div className="flex items-center overflow-x-auto w-full lg:w-auto custom-scrollbar hide-scrollbar gap-1">
                    {['Toutes', 'En attente', 'En cours', 'Expédiées', 'Livrées', 'Annulées'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-4 py-1.5 text-[13px] font-semibold rounded-md transition-all whitespace-nowrap",
                                activeTab === tab
                                    ? "bg-slate-900 text-white shadow-sm"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/50"
                            )}>
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Search - Matches DA */}
                <div className="relative w-full lg:w-72 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={14} />
                    <input
                        type="text"
                        placeholder="Recherche globale..."
                        className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200/60 rounded-md text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all placeholder:text-slate-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Bulk Actions Banner */}
            <AnimatePresence>
                {selectedIds.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        className="flex items-center justify-between px-4 py-2 bg-slate-900 text-white rounded-lg shadow-sm overflow-hidden"
                    >
                        <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center w-5 h-5 rounded-md bg-white/20 text-[11px] font-bold">
                                {selectedIds.length}
                            </span>
                            <span className="text-[13px] font-medium">sélectionnées</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleBulkUpdate('PROCESSING')} className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-md text-[12px] font-semibold transition-all">
                                En cours
                            </button>
                            <button onClick={() => handleBulkUpdate('SHIPPED')} className="px-3 py-1 bg-white text-slate-900 rounded-md text-[12px] font-semibold transition-all">
                                Expédier
                            </button>
                            <button onClick={() => setSelectedIds([])} className="p-1.5 text-slate-400 hover:text-white transition-colors">
                                <X size={14} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Table Area */}
            {loading ? (
                <div className="h-[400px] flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
                    <Loader2 className="animate-spin text-orange-600 mb-4" size={28} />
                    <p className="font-bold text-[13px]">Chargement des données...</p>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="h-[400px] flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200/60 shadow-sm p-8 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Inbox size={24} className="text-slate-300" />
                    </div>
                    <h3 className="text-[15px] font-bold text-slate-900 mb-1">Aucun résultat</h3>
                    <p className="text-[13px] text-slate-500 max-w-sm">Les critères de recherche n'ont retourné aucune commande.</p>
                </div>
            ) : (
                <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-200/60">
                                    <th className="px-5 py-3 w-[40px]">
                                        <input
                                            type="checkbox"
                                            className="w-3.5 h-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                                            checked={selectedIds.length === filteredOrders.length && filteredOrders.length > 0}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Réf.</th>
                                    <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
                                    <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Client</th>
                                    <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Valeur</th>
                                    <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Statut</th>
                                    <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <AnimatePresence>
                                    {filteredOrders.map((order) => {
                                        const config = statusConfig[order.status] || statusConfig.PENDING;
                                        return (
                                            <motion.tr 
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                key={order.id} 
                                                onClick={() => setSelectedOrder(order)}
                                                className={cn(
                                                    "group hover:bg-slate-50/50 transition-colors cursor-pointer",
                                                    selectedIds.includes(order.id) && "bg-slate-50/80"
                                                )}
                                            >
                                                <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        className="w-3.5 h-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                                                        checked={selectedIds.includes(order.id)}
                                                        onChange={(e) => toggleSelect(order.id, e as any)}
                                                    />
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="text-[13px] font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                                                        #{order.id.substring(0, 8).toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-[13px] font-medium text-slate-700">
                                                            {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                                        </span>
                                                        <span className="text-[11px] text-slate-400">
                                                            {new Date(order.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-500 border border-slate-200/60">
                                                            {(order.user.username || order.user.email).substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-[13px] font-bold text-slate-900 truncate">
                                                                {order.user.username || 'Client'}
                                                            </span>
                                                            <span className="text-[11px] text-slate-500 truncate">
                                                                {order.user.phone || order.user.email}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[13px] font-bold text-slate-900">{order.total.toLocaleString()} F</span>
                                                        <span className="text-[11px] text-slate-400">{order.items.length} art.</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    {/* Minimalist Status Badge */}
                                                    <div className={cn(
                                                        "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold",
                                                        config.bg, config.color
                                                    )}>
                                                        <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
                                                        {config.label}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex justify-end gap-1.5 items-center">
                                                        {/* Quick Action */}
                                                        {config.next && (
                                                            <button
                                                                disabled={updatingOrderId === order.id}
                                                                onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order.id, config.next); }}
                                                                className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 text-[11px] font-bold rounded-md shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                                                            >
                                                                {updatingOrderId === order.id && (
                                                                    <Loader2 size={11} className="animate-spin text-orange-600" />
                                                                )}
                                                                {config.nextLabel}
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                                                            className="w-7 h-7 flex items-center justify-center rounded-md bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
                                                            title="Détails"
                                                        >
                                                            <Eye size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Slide-over Drawer for Order Details */}
            <AnimatePresence>
                {selectedOrder && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedOrder(null)}
                            className="fixed inset-0 bg-slate-900/10 backdrop-blur-[2px] z-[100]"
                        />
                        <motion.div
                            initial={{ x: '100%', opacity: 0.5 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0.5 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white shadow-2xl z-[110] border-l border-slate-200/60 flex flex-col"
                        >
                            {/* Drawer Header */}
                            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
                                <div>
                                    <h2 className="text-[18px] font-black text-slate-900 tracking-tight">
                                        Commande #{selectedOrder.id.substring(0, 8).toUpperCase()}
                                    </h2>
                                    <p className="text-[12px] text-slate-500 font-medium mt-0.5">
                                        {new Date(selectedOrder.createdAt).toLocaleString('fr-FR')}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => printInvoice(selectedOrder)}
                                        className="w-8 h-8 flex items-center justify-center rounded-md bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 shadow-sm transition-colors"
                                        title="Imprimer Facture"
                                    >
                                        <Printer size={14} />
                                    </button>
                                    <button
                                        onClick={() => setSelectedOrder(null)}
                                        className="w-8 h-8 flex items-center justify-center rounded-md bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Drawer Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/30">
                                
                                {/* Status Control Panel */}
                                <section className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm">
                                    <h3 className="text-[11px] font-bold text-slate-400 mb-3 uppercase tracking-widest flex items-center gap-2">
                                        <Zap size={12} /> Modification du statut
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(statusConfig).map(([statusKey, config]: [string, any]) => {
                                            const isActive = selectedOrder.status === statusKey;
                                            const isThisUpdating = updatingOrderId === selectedOrder.id;
                                            return (
                                                <button
                                                    key={statusKey}
                                                    disabled={isThisUpdating}
                                                    onClick={() => handleStatusUpdate(selectedOrder.id, statusKey)}
                                                    className={cn(
                                                        "flex items-center gap-2.5 p-2.5 rounded-lg border transition-all text-left relative",
                                                        isActive 
                                                            ? cn(config.border, config.bg, "shadow-sm", config.color)
                                                            : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50 text-slate-600",
                                                        isThisUpdating && "opacity-60 cursor-not-allowed"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "flex items-center justify-center w-6 h-6 rounded-md",
                                                        isActive ? "bg-white/50" : "bg-slate-100 text-slate-400"
                                                    )}>
                                                        <config.icon size={12} />
                                                    </div>
                                                    <span className="text-[12px] font-bold flex-1">
                                                        {config.label}
                                                    </span>
                                                    {isThisUpdating && !isActive && (
                                                        <Loader2 size={12} className="animate-spin text-slate-400" />
                                                    )}
                                                    {isActive && (
                                                        isThisUpdating ? (
                                                            <Loader2 size={14} className="animate-spin text-current" />
                                                        ) : (
                                                            <CheckCircle2 size={14} className="text-current opacity-70" />
                                                        )
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </section>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Customer Box */}
                                    <section className="bg-white rounded-xl p-4 border border-slate-200/60 shadow-sm">
                                        <h3 className="text-[11px] font-bold text-slate-400 mb-3 uppercase tracking-widest flex items-center gap-2">
                                            <User size={12} /> Client
                                        </h3>
                                        <div className="space-y-2">
                                            <p className="text-[13px] font-bold text-slate-900">{selectedOrder.user.username || 'Non renseigné'}</p>
                                            <p className="text-[12px] text-slate-500 break-all">{selectedOrder.user.email}</p>
                                            {selectedOrder.user.phone && (
                                                <p className="text-[12px] text-slate-600 font-medium flex items-center gap-1.5 pt-1">
                                                    <Phone size={12} className="text-slate-400" /> {selectedOrder.user.phone}
                                                </p>
                                            )}
                                        </div>
                                    </section>

                                    {/* Delivery Box */}
                                    <section className="bg-white rounded-xl p-4 border border-slate-200/60 shadow-sm">
                                        <h3 className="text-[11px] font-bold text-slate-400 mb-3 uppercase tracking-widest flex items-center gap-2">
                                            <MapPin size={12} /> Logistique
                                        </h3>
                                        <div className="space-y-2 text-[12px]">
                                            <p className="font-bold text-slate-900 flex items-center gap-1.5">
                                                {selectedOrder.deliveryMethod === 'livraison' ? <Truck size={14} className="text-slate-400"/> : <MapPin size={14} className="text-slate-400"/>}
                                                {selectedOrder.deliveryMethod === 'livraison' ? 'Livraison Domicile' : 'Retrait Boutique'}
                                            </p>
                                            {selectedOrder.deliveryMethod === 'livraison' && (
                                                <>
                                                    <p className="text-slate-600 line-clamp-2 leading-relaxed">
                                                        {selectedOrder.shippingAddress || 'Aucune adresse'}
                                                    </p>
                                                    <p className="text-slate-500 font-medium pt-1">
                                                        Zone: <span className="text-slate-900">{selectedOrder.deliveryZone || 'Standard'}</span>
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </section>
                                </div>

                                {/* Order Items list */}
                                <section className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
                                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <ShoppingCart size={12} /> Panier ({selectedOrder.items.length})
                                        </h3>
                                    </div>
                                    <div className="divide-y divide-slate-50 p-2">
                                        {selectedOrder.items.map((item: any) => (
                                            <div key={item.id} className="flex gap-3 p-2 hover:bg-slate-50/50 rounded-lg transition-colors">
                                                <div className="w-12 h-12 rounded-md bg-slate-100 border border-slate-200/60 overflow-hidden shrink-0">
                                                    {item.product.images?.[0] ? (
                                                        <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                            <ShoppingCart size={14} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                                    <div>
                                                        <p className="text-[12px] font-bold text-slate-900 truncate">{item.product.name}</p>
                                                        {item.selectedColor && (
                                                            <p className="text-[10px] text-slate-500 uppercase font-medium mt-0.5">Coul: {item.selectedColor}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[11px] font-semibold text-slate-500">x{item.quantity}</span>
                                                        <span className="text-[12px] font-black text-slate-900">{(item.price * item.quantity).toLocaleString()} F</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Subtotals & Total */}
                                    <div className="bg-slate-50 p-4 border-t border-slate-100 space-y-2 text-[12px]">
                                        <div className="flex justify-between items-center text-slate-500 font-medium">
                                            <span>Sous-total articles</span>
                                            <span>{(selectedOrder.total - (selectedOrder.shippingCost || 0)).toLocaleString()} F</span>
                                        </div>
                                        <div className="flex justify-between items-center text-slate-500 font-medium pb-2 border-b border-slate-200/60">
                                            <span>Frais de livraison</span>
                                            <span>{(selectedOrder.shippingCost || 0).toLocaleString()} F</span>
                                        </div>
                                        <div className="flex justify-between items-end pt-2">
                                            <div>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Total Net</p>
                                                <span className="inline-block px-1.5 py-0.5 bg-slate-200/50 rounded text-[10px] font-bold text-slate-600 uppercase">
                                                    {selectedOrder.paymentMethod === 'cash' ? 'Payé Livraison' : selectedOrder.paymentMethod}
                                                </span>
                                            </div>
                                            <span className="text-[18px] font-black text-slate-900 leading-none">{selectedOrder.total.toLocaleString()} F</span>
                                        </div>
                                    </div>
                                </section>

                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
