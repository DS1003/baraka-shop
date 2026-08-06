'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
    Search,
    Download,
    Eye,
    Truck,
    PackageCheck,
    Clock,
    XCircle,
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
    RefreshCw,
    Inbox
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { updateOrderStatus, bulkUpdateOrderStatuses } from '@/lib/actions/admin-actions';
import { toast } from 'sonner';
import { useRealtimeOrders } from '@/lib/hooks/useRealtimeOrders';

const statusConfig: any = {
    PENDING: { label: 'En attente', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock },
    PROCESSING: { label: 'Traitement', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: History },
    SHIPPED: { label: 'Expédiée', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: Truck },
    DELIVERED: { label: 'Livrée', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: PackageCheck },
    CANCELLED: { label: 'Annulée', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', icon: XCircle },
};

export default function OrdersPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('Toutes');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isUpdatingBulk, setIsUpdatingBulk] = useState(false);
    
    // Dropdown states for click-to-open logic
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [drawerDropdownOpen, setDrawerDropdownOpen] = useState(false);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setActiveDropdown(null);
            setDrawerDropdownOpen(false);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleNewOrder = useCallback((order: any) => {
        // Automatically handled by hook, just updating counter
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
        setActiveDropdown(null);
        setDrawerDropdownOpen(false);
        const res = await updateOrderStatus(orderId, newStatus);
        if (res.success) {
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            if (selectedOrder?.id === orderId) {
                setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
            }
            toast.success(`Le statut a été mis à jour avec succès.`);
        } else {
            toast.error(`Erreur lors de la mise à jour du statut.`);
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
            toast.error("Erreur lors de la mise à jour massive");
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

    const toggleSelect = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
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
        <div className="space-y-10 pb-20 max-w-[1400px] mx-auto">
            {/* Page Header */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-6 border-b border-slate-200/50">
                <div className="space-y-2">
                    <div className="flex items-center gap-4 flex-wrap">
                        <h1 className="text-[32px] md:text-[40px] font-bold text-slate-900 tracking-tight leading-tight">
                            Flux <span className="text-orange-600">Commandes.</span>
                        </h1>
                        {/* LIVE Indicator */}
                        <div className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all shadow-sm",
                            isLive
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                : "bg-slate-100 text-slate-400 border-slate-200"
                        )}>
                            <span className="relative flex h-2 w-2">
                                {isLive && (
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                )}
                                <span className={cn(
                                    "relative inline-flex rounded-full h-2 w-2",
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
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-200 animate-bounce"
                            >
                                +{newOrderCount} nouvelle{newOrderCount > 1 ? 's' : ''}
                            </motion.button>
                        )}
                    </div>
                    <p className="text-[14px] md:text-[15px] text-slate-500 font-medium flex items-center gap-3">
                        Pilotez vos opérations logistiques en temps réel.
                        <span suppressHydrationWarning className="hidden md:inline text-[11px] text-slate-400 font-medium bg-slate-100 px-2 py-1 rounded-md">
                            Dernière maj: {lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0 custom-scrollbar">
                    <button
                        onClick={refresh}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-[13px] hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50 min-w-[120px]"
                    >
                        <RefreshCw size={16} className={cn("text-slate-400", loading && "animate-spin")} />
                        <span>Rafraîchir</span>
                    </button>
                    <button onClick={exportCSV} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-[13px] hover:bg-slate-50 transition-all shadow-sm min-w-[120px]">
                        <Download size={16} className="text-slate-400" />
                        <span>Export CSV</span>
                    </button>
                    <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-xl font-bold text-[13px] hover:bg-orange-700 transition-all shadow-lg shadow-orange-100/50 min-w-[140px]">
                        <Zap size={16} />
                        <span>Flash Actions</span>
                    </button>
                </div>
            </div>

            {/* Actions & Filters */}
            <div className="flex flex-col gap-6">
                <div className="flex overflow-x-auto gap-2 p-1 bg-slate-100/80 rounded-[14px] border border-slate-200/50 w-full lg:w-fit custom-scrollbar">
                    {['Toutes', 'En cours', 'Prêtes', 'Livrées', 'Annulées'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-5 py-2 text-[13px] font-bold rounded-[10px] transition-all whitespace-nowrap",
                                activeTab === tab
                                    ? "bg-white text-orange-600 shadow-sm border border-slate-200/60"
                                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
                            )}>
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full max-w-2xl group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-orange-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Chercher référence, client ou téléphone..."
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all shadow-sm placeholder:text-slate-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {/* Bulk Actions Banner */}
                    <AnimatePresence>
                        {selectedIds.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex items-center gap-3 px-4 py-2 bg-slate-900 rounded-xl shadow-xl border border-slate-800 w-full lg:w-auto overflow-x-auto custom-scrollbar"
                            >
                                <span className="text-[11px] font-black text-white uppercase tracking-widest border-r border-slate-700 pr-3 whitespace-nowrap">
                                    {selectedIds.length} SÉLECTION(S)
                                </span>
                                <div className="flex items-center gap-2 pl-1 whitespace-nowrap">
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

            {/* List / Table Area */}
            {loading ? (
                <div className="h-[400px] flex flex-col items-center justify-center text-slate-400 gap-4 bg-white rounded-3xl border border-slate-200/50 shadow-sm">
                    <Loader2 className="animate-spin text-orange-600" size={32} />
                    <p className="font-bold uppercase tracking-widest text-[11px]">Synchronisation...</p>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="min-h-[400px] flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200/50 shadow-sm p-8 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Inbox size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-[18px] font-bold text-slate-900 mb-2">Aucune commande trouvée</h3>
                    <p className="text-[14px] text-slate-500 max-w-md">Nous n'avons trouvé aucune commande correspondant à vos critères de recherche actuels.</p>
                </div>
            ) : (
                <>
                    {/* Mobile Cards View (Visible only on small screens) */}
                    <div className="lg:hidden flex flex-col gap-4">
                        <AnimatePresence>
                            {filteredOrders.map(order => {
                                const config = statusConfig[order.status] || statusConfig.PENDING;
                                return (
                                    <motion.div 
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        key={order.id} 
                                        className={cn(
                                            "bg-white rounded-2xl p-4 border shadow-sm flex flex-col gap-4 relative overflow-hidden transition-all",
                                            selectedIds.includes(order.id) ? "border-orange-300 bg-orange-50/10" : "border-slate-200/60"
                                        )}
                                    >
                                        {/* Status Line */}
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                                                    checked={selectedIds.includes(order.id)}
                                                    onChange={(e) => toggleSelect(order.id, e as any)}
                                                />
                                                <p className="text-[14px] font-black text-slate-900 tracking-tight uppercase">#ORD-{order.id.substring(0, 8)}</p>
                                            </div>
                                            <div className={cn(
                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold border",
                                                config.bg, config.color, config.border
                                            )}>
                                                <config.icon size={12} strokeWidth={2.5} />
                                                <span className="uppercase tracking-tight">{config.label}</span>
                                            </div>
                                        </div>
                                        {/* Customer Info */}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[14px] font-bold text-slate-900 mb-0.5">{order.user.username || 'Client'}</p>
                                                <p className="text-[12px] text-slate-500 flex items-center gap-1"><History size={12}/> {new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[16px] font-black text-slate-900">{order.total.toLocaleString()} F</span>
                                                <p className="text-[11px] font-bold text-slate-400 uppercase">{order.items.length} produit{order.items.length > 1 ? 's' : ''}</p>
                                            </div>
                                        </div>
                                        {/* Actions */}
                                        <div className="grid grid-cols-2 gap-2 pt-2">
                                            <button 
                                                onClick={() => setSelectedOrder(order)}
                                                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 text-slate-600 font-bold text-[12px] hover:bg-slate-100 transition-colors"
                                            >
                                                <Eye size={14} /> Voir détails
                                            </button>
                                            <div className="relative">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === order.id ? null : order.id); }}
                                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-[12px] hover:bg-slate-800 transition-colors"
                                                >
                                                    <ArrowUpDown size={14} /> Statut
                                                </button>
                                                <AnimatePresence>
                                                    {activeDropdown === order.id && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, y: 5 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: 5 }}
                                                            className="absolute bottom-full right-0 mb-2 w-full min-w-[160px] bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-20 origin-bottom"
                                                        >
                                                            {(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).map(s => (
                                                                <button
                                                                    key={s}
                                                                    onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order.id, s); }}
                                                                    className="w-full text-left p-2 rounded-lg text-[12px] font-bold text-slate-600 hover:bg-slate-50 hover:text-orange-600 transition-colors"
                                                                >
                                                                    {statusConfig[s].label}
                                                                </button>
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>
                    </div>

                    {/* Desktop Table View (Hidden on small screens) */}
                    <div className="hidden lg:block bg-white rounded-[24px] border border-slate-200/60 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] overflow-hidden">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-6 py-5 w-[50px]">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                                                checked={selectedIds.length === filteredOrders.length && filteredOrders.length > 0}
                                                onChange={toggleSelectAll}
                                            />
                                        </th>
                                        <th className="px-4 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Commande</th>
                                        <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                                        <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Statut</th>
                                        <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Valeur</th>
                                        <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 relative">
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
                                                        "group transition-all duration-200 cursor-pointer",
                                                        selectedIds.includes(order.id) ? "bg-orange-50/40" : "hover:bg-slate-50/60"
                                                    )}
                                                >
                                                    <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                                                            checked={selectedIds.includes(order.id)}
                                                            onChange={(e) => toggleSelect(order.id, e as any)}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-5">
                                                        <div className="flex flex-col gap-1">
                                                            <p className="text-[14px] font-black text-slate-900 tracking-tight uppercase group-hover:text-orange-600 transition-colors">#ORD-{order.id.substring(0, 8)}</p>
                                                            <p className="text-[12px] text-slate-400 font-medium flex items-center gap-1.5">
                                                                <History size={12} /> {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-[11px] border border-slate-200/60 shrink-0">
                                                                {(order.user.username || order.user.email).substring(0, 2).toUpperCase()}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-[14px] font-bold text-slate-900 mb-0.5 truncate">{order.user.username || 'Client Baraka'}</p>
                                                                <p className="text-[12px] text-slate-500 font-medium tracking-tight truncate">{order.user.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-center">
                                                        <div className={cn(
                                                            "inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all",
                                                            config.bg, config.color, config.border
                                                        )}>
                                                            <config.icon size={14} strokeWidth={2.5} />
                                                            <span className="uppercase tracking-tight">{config.label}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <div className="flex flex-col items-end gap-1">
                                                            <span className="text-[15px] font-black text-slate-900 tabular-nums">{order.total.toLocaleString()} F</span>
                                                            <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200/60">{order.items.length} prod.</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-right relative" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                                                                className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-orange-600 hover:border-orange-200 shadow-sm flex items-center justify-center transition-all"
                                                                title="Voir les détails"
                                                            >
                                                                <Eye size={16} />
                                                            </button>
                                                            <div className="relative">
                                                                <button 
                                                                    onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === order.id ? null : order.id); }}
                                                                    className={cn(
                                                                        "w-9 h-9 rounded-lg border shadow-sm flex items-center justify-center transition-all",
                                                                        activeDropdown === order.id 
                                                                            ? "bg-slate-900 text-white border-slate-900" 
                                                                            : "bg-white border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-300"
                                                                    )}
                                                                    title="Changer le statut"
                                                                >
                                                                    <MoreHorizontal size={16} />
                                                                </button>
                                                                <AnimatePresence>
                                                                    {activeDropdown === order.id && (
                                                                        <motion.div 
                                                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                                            transition={{ duration: 0.15 }}
                                                                            className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-20 origin-top-right"
                                                                        >
                                                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-2 py-1.5 mb-1 border-b border-slate-50">Statut</p>
                                                                            {(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).map(s => (
                                                                                <button
                                                                                    key={s}
                                                                                    onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order.id, s); }}
                                                                                    className="w-full text-left px-3 py-2.5 rounded-xl text-[12px] font-bold text-slate-600 hover:bg-slate-50 hover:text-orange-600 transition-colors flex items-center gap-2"
                                                                                >
                                                                                    {React.createElement(statusConfig[s].icon, { size: 14, className: statusConfig[s].color })}
                                                                                    {statusConfig[s].label}
                                                                                </button>
                                                                            ))}
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>
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
                </>
            )}

            {/* Slide-over Drawer for Order Details */}
            <AnimatePresence>
                {selectedOrder && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedOrder(null)}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
                        />
                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '100%', opacity: 0.5 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0.5 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-slate-50 shadow-2xl z-[110] border-l border-slate-200/60 flex flex-col overflow-hidden"
                        >
                            {/* Drawer Header */}
                            <div className="bg-white px-6 py-5 border-b border-slate-200/60 flex items-center justify-between shrink-0">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-[22px] font-black text-slate-900 tracking-tight uppercase">
                                            #ORD-{selectedOrder.id.substring(0, 8)}
                                        </h2>
                                        <div className={cn(
                                            "inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold border",
                                            statusConfig[selectedOrder.status].bg,
                                            statusConfig[selectedOrder.status].color,
                                            statusConfig[selectedOrder.status].border
                                        )}>
                                            {React.createElement(statusConfig[selectedOrder.status].icon, { size: 12, strokeWidth: 2.5 })}
                                            <span className="uppercase tracking-tight">{statusConfig[selectedOrder.status].label}</span>
                                        </div>
                                    </div>
                                    <p className="text-[12px] text-slate-500 font-medium flex items-center gap-1.5">
                                        <Calendar size={12} />
                                        {new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Drawer Content - Scrollable */}
                            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
                                {/* Customer Info */}
                                <div className="bg-white rounded-2xl p-5 border border-slate-200/50 shadow-sm flex flex-col gap-4">
                                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <User size={14} /> Informations Client
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center font-black text-[16px] border border-orange-100">
                                            {(selectedOrder.user.username || selectedOrder.user.email).substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-[16px] font-bold text-slate-900 truncate mb-0.5">{selectedOrder.user.username || 'Client Baraka'}</p>
                                            <div className="flex flex-col gap-1">
                                                <p className="text-[13px] text-slate-500 truncate flex items-center gap-2">
                                                    <Mail size={12} className="text-slate-400" /> {selectedOrder.user.email}
                                                </p>
                                                {selectedOrder.user.phone && (
                                                    <p className="text-[13px] font-medium text-slate-700 flex items-center gap-2">
                                                        <Phone size={12} className="text-slate-400" /> {selectedOrder.user.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Shipping & Payment */}
                                <div className="bg-white rounded-2xl p-5 border border-slate-200/50 shadow-sm flex flex-col gap-5">
                                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Truck size={14} /> Logistique & Paiement
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <div className="flex items-center gap-2 text-slate-500 mb-1">
                                                <CreditCard size={14} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Paiement</span>
                                            </div>
                                            <p className="text-[13px] font-bold text-slate-900 uppercase">
                                                {selectedOrder.paymentMethod === 'cash' ? 'À la livraison' : selectedOrder.paymentMethod}
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <div className="flex items-center gap-2 text-slate-500 mb-1">
                                                <MapPin size={14} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Réception</span>
                                            </div>
                                            <p className="text-[13px] font-bold text-slate-900 uppercase">
                                                {selectedOrder.deliveryMethod === 'retrait' ? 'Boutique' : 'Livraison'}
                                            </p>
                                        </div>
                                    </div>
                                    {selectedOrder.deliveryMethod === 'livraison' && selectedOrder.deliveryZone && (
                                        <div className="flex items-start gap-3 text-slate-600 bg-orange-50/50 p-3 rounded-xl border border-orange-100/50">
                                            <MapPin size={16} className="mt-0.5 text-orange-500 shrink-0" />
                                            <div>
                                                <p className="text-[11px] font-bold text-orange-600/80 uppercase tracking-widest mb-0.5">Adresse / Zone</p>
                                                <p className="text-[14px] font-bold text-orange-700">{selectedOrder.deliveryZone}</p>
                                                {selectedOrder.shippingCost != null && (
                                                    <p className="text-[12px] font-black text-emerald-600 mt-1">
                                                        Frais de livraison: {selectedOrder.shippingCost.toLocaleString()} FCFA
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Items List */}
                                <div className="bg-white rounded-2xl p-5 border border-slate-200/50 shadow-sm flex flex-col gap-4">
                                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <ShoppingCart size={14} /> Contenu de la commande
                                    </h3>
                                    <div className="flex flex-col gap-3">
                                        {selectedOrder.items.map((item: any) => (
                                            <div key={item.id} className="flex items-center gap-4 py-2 border-b border-slate-100 last:border-0 last:pb-0">
                                                <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200/50 flex items-center justify-center overflow-hidden shrink-0">
                                                    {item.product.images?.[0] ? (
                                                        <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ShoppingCart size={16} className="text-slate-300" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[13px] font-bold text-slate-900 mb-0.5 truncate">{item.product.name}</p>
                                                    {item.selectedColor && (
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                            Couleur: {item.selectedColor}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-[14px] font-black text-slate-900 tabular-nums">{(item.price * item.quantity).toLocaleString()} F</p>
                                                    <p className="text-[11px] font-bold text-slate-400">
                                                        {item.price.toLocaleString()} F × {item.quantity}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Drawer Footer Actions */}
                            <div className="bg-white border-t border-slate-200/60 p-6 shrink-0 z-10 flex flex-col gap-4">
                                <div className="flex items-end justify-between bg-slate-900 rounded-2xl p-5 text-white shadow-lg">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Montant Total</span>
                                        <span className="text-[32px] font-black text-orange-500 tabular-nums leading-none">
                                            {selectedOrder.total.toLocaleString()} F
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[12px] font-medium text-slate-300 bg-white/10 px-3 py-1 rounded-lg">
                                            {selectedOrder.items.length} Article{selectedOrder.items.length > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => printInvoice(selectedOrder)}
                                        className="flex items-center justify-center gap-2 py-4 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold text-[13px] uppercase tracking-widest transition-colors"
                                    >
                                        Imprimer
                                    </button>
                                    <div className="relative">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setDrawerDropdownOpen(!drawerDropdownOpen); }}
                                            className="w-full flex items-center justify-center gap-2 py-4 bg-orange-600 text-white hover:bg-orange-700 rounded-xl font-bold text-[13px] uppercase tracking-widest transition-colors shadow-lg shadow-orange-200/50"
                                        >
                                            <ArrowUpDown size={16} /> Statut
                                        </button>
                                        <AnimatePresence>
                                            {drawerDropdownOpen && (
                                                <motion.div 
                                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                    className="absolute bottom-full right-0 mb-3 w-full min-w-[200px] bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 origin-bottom"
                                                >
                                                    <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest p-2 mb-1 border-b border-slate-50">Appliquer statut</p>
                                                    {(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).map(s => (
                                                        <button
                                                            key={s}
                                                            onClick={(e) => { e.stopPropagation(); handleStatusUpdate(selectedOrder.id, s); }}
                                                            className="w-full text-left px-3 py-2.5 rounded-xl text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:text-orange-600 transition-colors flex items-center gap-2"
                                                        >
                                                            {React.createElement(statusConfig[s].icon, { size: 16, className: statusConfig[s].color })}
                                                            {statusConfig[s].label}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
