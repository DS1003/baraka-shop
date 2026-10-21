'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
    Search, Download, Eye, Truck, PackageCheck, Clock, XCircle,
    ShoppingCart, Calendar, Zap, History, Loader2, X,
    MapPin, Phone, User, RefreshCw, Inbox,
    CheckCircle2, Printer, CreditCard, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { updateOrderStatus, bulkUpdateOrderStatuses, updateOrderPaymentStatus } from '@/lib/actions/admin-actions';
import { toast } from 'sonner';
import { useRealtimeOrders } from '@/lib/hooks/useRealtimeOrders';
import { useSiteLogos } from '@/lib/hooks/useSiteLogos';

const statusConfig: any = {
    PENDING: { label: 'En attente', color: 'text-amber-600', dot: 'bg-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock, next: 'PROCESSING', nextLabel: 'Traiter' },
    PROCESSING: { label: 'En cours', color: 'text-blue-600', dot: 'bg-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', icon: History, next: 'SHIPPED', nextLabel: 'Expédier' },
    SHIPPED: { label: 'Expédiée', color: 'text-violet-600', dot: 'bg-violet-500', bg: 'bg-violet-50', border: 'border-violet-200', icon: Truck, next: 'DELIVERED', nextLabel: 'Livrer' },
    DELIVERED: { label: 'Livrée', color: 'text-emerald-600', dot: 'bg-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: PackageCheck, next: null },
    CANCELLED: { label: 'Annulée', color: 'text-rose-600', dot: 'bg-rose-500', bg: 'bg-rose-50', border: 'border-rose-200', icon: XCircle, next: null },
};

const paymentStatusConfig: Record<string, { label: string; color: string; dot: string; bg: string; border: string }> = {
    PAID: { label: 'Payée', color: 'text-emerald-700', dot: 'bg-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    PENDING: { label: 'En attente', color: 'text-amber-700', dot: 'bg-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
    FAILED: { label: 'Échoué', color: 'text-rose-700', dot: 'bg-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' },
    REFUNDED: { label: 'Remboursée', color: 'text-purple-700', dot: 'bg-purple-500', bg: 'bg-purple-50', border: 'border-purple-200' },
};

export default function OrdersPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('Toutes');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isUpdatingBulk, setIsUpdatingBulk] = useState(false);
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
    const [updatingPaymentOrderId, setUpdatingPaymentOrderId] = useState<string | null>(null);

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
                setOrders(prev => prev.map(o => {
                    if (o.id !== orderId) return o;
                    return {
                        ...o,
                        status: newStatus,
                        paymentStatus: (newStatus === 'DELIVERED' && (o.paymentStatus === 'PENDING' || !o.paymentStatus)) ? 'PAID' : o.paymentStatus
                    };
                }));
                if (selectedOrder?.id === orderId) {
                    setSelectedOrder((prev: any) => ({
                        ...prev,
                        status: newStatus,
                        paymentStatus: (newStatus === 'DELIVERED' && (prev.paymentStatus === 'PENDING' || !prev.paymentStatus)) ? 'PAID' : prev.paymentStatus
                    }));
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

    const handlePaymentStatusUpdate = async (orderId: string, newPaymentStatus: string) => {
        if (updatingPaymentOrderId) return;
        setUpdatingPaymentOrderId(orderId);
        try {
            const res = await updateOrderPaymentStatus(orderId, newPaymentStatus);
            if (res?.success) {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: newPaymentStatus } : o));
                if (selectedOrder?.id === orderId) {
                    setSelectedOrder((prev: any) => ({ ...prev, paymentStatus: newPaymentStatus }));
                }
                const label = paymentStatusConfig[newPaymentStatus]?.label || newPaymentStatus;
                toast.success(`Statut paiement : ${label}`);
            } else {
                toast.error(res?.error || 'Erreur lors de la mise à jour');
            }
        } catch (err: any) {
            console.error("Payment status update error:", err);
            toast.error("La connexion au serveur a échoué.");
        } finally {
            setUpdatingPaymentOrderId(null);
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

    const { headerLogo } = useSiteLogos();

    const printInvoice = (order: any) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        // Resolve absolute URL for logo in new window
        const logoUrl = headerLogo ? (headerLogo.startsWith('http') ? headerLogo : `${window.location.origin}${headerLogo}`) : `${window.location.origin}/logo.png`;
        const orderRef = order.id.substring(0, 8).toUpperCase();
        const formattedDate = new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
        const formattedTime = new Date(order.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const subtotal = order.total - (order.shippingCost || 0);
        const shippingCost = order.shippingCost || 0;
        const isDelivery = order.deliveryMethod === 'livraison';
        const paymentLabel = order.paymentMethod === 'cash' ? 'Paiement à la livraison' : (order.paymentMethod ? order.paymentMethod.toUpperCase() : 'Non spécifié');
        const isPaid = order.paymentStatus === 'PAID';
        const paymentStatusText = isPaid ? '✅ Payée' : (order.paymentStatus === 'REFUNDED' ? '↩️ Remboursée' : '⏳ En attente de règlement');
        const paymentStatusStyle = isPaid 
            ? 'background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0;' 
            : 'background: #FFFBEB; color: #92400E; border: 1px solid #FDE68A;';

        const html = `
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <title>Bon de Livraison & Facture #${orderRef} — Baraka Shop</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
                <style>
                    @page {
                        size: A4 portrait;
                        margin: 10mm 12mm 12mm 12mm;
                    }
                    * {
                        box-sizing: border-box;
                        margin: 0;
                        padding: 0;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    body {
                        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                        color: #0F172A;
                        background: #FFFFFF;
                        line-height: 1.45;
                        font-size: 12.5px;
                        padding: 24px 30px;
                        max-width: 860px;
                        margin: 0 auto;
                        -webkit-font-smoothing: antialiased;
                    }

                    /* Minimalist Top Accent Bar */
                    .top-accent-bar {
                        height: 3px;
                        background: linear-gradient(90deg, #EA580C 0%, #F97316 40%, #0F172A 100%);
                        border-radius: 9999px;
                        margin-bottom: 24px;
                    }

                    /* Header brand banner */
                    .header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding-bottom: 22px;
                        border-bottom: 1px solid #E2E8F0;
                        margin-bottom: 22px;
                    }
                    .brand-area {
                        display: flex;
                        flex-direction: column;
                        gap: 6px;
                    }
                    .logo-img {
                        height: 44px;
                        max-width: 190px;
                        object-fit: contain;
                        display: block;
                    }
                    .company-tagline {
                        font-size: 11px;
                        font-weight: 500;
                        color: #64748B;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                    }
                    .dot-separator {
                        width: 3px;
                        height: 3px;
                        background-color: #CBD5E1;
                        border-radius: 50%;
                        display: inline-block;
                    }

                    .doc-badge-area {
                        text-align: right;
                    }
                    .doc-badge {
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        background: #FFF7ED;
                        border: 1px solid #FED7AA;
                        color: #C2410C;
                        padding: 3px 10px;
                        border-radius: 9999px;
                        font-size: 10px;
                        font-weight: 800;
                        letter-spacing: 0.8px;
                        text-transform: uppercase;
                        margin-bottom: 6px;
                    }
                    .doc-title {
                        font-size: 17px;
                        font-weight: 800;
                        letter-spacing: -0.4px;
                        color: #0F172A;
                    }
                    .doc-meta {
                        margin-top: 4px;
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 11px;
                        color: #64748B;
                        line-height: 1.6;
                    }
                    .doc-ref {
                        display: inline-block;
                        padding: 1.5px 7px;
                        background: #F1F5F9;
                        border-radius: 4px;
                        color: #0F172A;
                        font-weight: 700;
                        letter-spacing: 0.5px;
                    }

                    /* 2-Column Info Cards (Clean editorial) */
                    .info-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 16px;
                        margin-bottom: 22px;
                    }
                    .info-card {
                        background: #FAFAFA;
                        border: 1px solid #EDEDED;
                        border-radius: 10px;
                        padding: 14px 16px;
                    }
                    .info-card-header {
                        font-size: 10px;
                        font-weight: 800;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        color: #94A3B8;
                        margin-bottom: 8px;
                        display: flex;
                        align-items: center;
                        gap: 5px;
                    }
                    .info-card-header svg {
                        width: 13px;
                        height: 13px;
                        color: #EA580C;
                    }
                    .client-name {
                        font-size: 14.5px;
                        font-weight: 700;
                        color: #0F172A;
                        margin-bottom: 4px;
                    }
                    .client-details {
                        font-size: 11.5px;
                        color: #475569;
                        line-height: 1.6;
                    }
                    .badge-pill {
                        display: inline-flex;
                        align-items: center;
                        gap: 4px;
                        padding: 2.5px 8px;
                        border-radius: 6px;
                        font-size: 11px;
                        font-weight: 700;
                    }
                    .badge-orange {
                        background: #FFF7ED;
                        color: #C2410C;
                        border: 1px solid #FFEDD5;
                    }
                    .badge-slate {
                        background: #F1F5F9;
                        color: #334155;
                        border: 1px solid #E2E8F0;
                    }

                    /* Table styling (Ultra-clean modern) */
                    .table-wrapper {
                        border: 1px solid #E2E8F0;
                        border-radius: 10px;
                        overflow: hidden;
                        margin-bottom: 20px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        text-align: left;
                    }
                    thead th {
                        background: #F8FAFC;
                        padding: 10px 14px;
                        font-size: 10px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.8px;
                        color: #64748B;
                        border-bottom: 1px solid #E2E8F0;
                    }
                    tbody td {
                        padding: 12px 14px;
                        font-size: 12.5px;
                        border-bottom: 1px solid #F1F5F9;
                        vertical-align: middle;
                    }
                    tbody tr:last-child td {
                        border-bottom: none;
                    }
                    .item-cell {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    }
                    .item-thumb {
                        width: 36px;
                        height: 36px;
                        border-radius: 6px;
                        background: #F8FAFC;
                        border: 1px solid #E2E8F0;
                        object-fit: cover;
                        flex-shrink: 0;
                    }
                    .item-thumb-placeholder {
                        width: 36px;
                        height: 36px;
                        border-radius: 6px;
                        background: #F1F5F9;
                        border: 1px solid #E2E8F0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #94A3B8;
                        flex-shrink: 0;
                    }
                    .item-thumb-placeholder svg {
                        width: 16px;
                        height: 16px;
                    }
                    .product-name {
                        font-weight: 600;
                        color: #0F172A;
                        font-size: 12.5px;
                        line-height: 1.35;
                    }
                    .product-variant {
                        display: inline-block;
                        margin-top: 3px;
                        font-size: 10px;
                        font-weight: 600;
                        color: #EA580C;
                        background: #FFF7ED;
                        padding: 1.5px 6px;
                        border-radius: 4px;
                        text-transform: uppercase;
                        letter-spacing: 0.3px;
                    }
                    .mono-num {
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 12px;
                        color: #1E293B;
                        font-weight: 500;
                    }

                    /* Bottom Financial & Validation Section */
                    .bottom-grid {
                        display: grid;
                        grid-template-columns: 1fr 310px;
                        gap: 20px;
                        align-items: start;
                        margin-bottom: 22px;
                    }

                    .signatures-area {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 12px;
                    }
                    .signature-box {
                        border: 1px dashed #CBD5E1;
                        border-radius: 8px;
                        padding: 10px 12px;
                        min-height: 90px;
                        background: #FAFAFA;
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                    }
                    .signature-label {
                        font-size: 9.5px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        color: #94A3B8;
                    }
                    .signature-dots {
                        border-bottom: 1px dotted #CBD5E1;
                        margin-top: 35px;
                    }

                    .summary-box {
                        background: #FAFAFA;
                        border: 1px solid #E2E8F0;
                        border-radius: 10px;
                        padding: 14px 16px;
                    }
                    .summary-line {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        font-size: 12px;
                        color: #64748B;
                        margin-bottom: 7px;
                    }
                    .summary-line strong {
                        font-family: 'JetBrains Mono', monospace;
                        color: #0F172A;
                        font-weight: 600;
                    }
                    .summary-total {
                        display: flex;
                        justify-content: space-between;
                        align-items: baseline;
                        padding-top: 10px;
                        margin-top: 6px;
                        border-top: 1.5px solid #E2E8F0;
                    }
                    .summary-total-label {
                        font-size: 12.5px;
                        font-weight: 800;
                        color: #0F172A;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    .summary-total-val {
                        font-size: 18px;
                        font-weight: 800;
                        color: #EA580C;
                        font-family: 'JetBrains Mono', monospace;
                    }

                    /* Footer */
                    .doc-footer {
                        border-top: 1px solid #E2E8F0;
                        padding-top: 14px;
                        text-align: center;
                        font-size: 10.5px;
                        color: #94A3B8;
                        font-weight: 500;
                        display: flex;
                        flex-direction: column;
                        gap: 2px;
                    }
                    .doc-footer strong {
                        color: #475569;
                        font-weight: 600;
                    }

                    @media print {
                        body {
                            padding: 0;
                            max-width: 100%;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="top-accent-bar"></div>

                <!-- Header -->
                <header class="header">
                    <div class="brand-area">
                        <img src="${logoUrl}" alt="Baraka Shop" class="logo-img" onerror="this.style.display='none'; document.getElementById('text-logo-fallback').style.display='block';" />
                        <div id="text-logo-fallback" style="display: none; font-size: 24px; font-weight: 900; color: #EA580C; letter-spacing: -0.5px;">BARAKA SHOP</div>
                        <div class="company-tagline">
                            <span>Dakar, Sénégal</span>
                            <span class="dot-separator"></span>
                            <span>Service Client : +221 33 822 34 22</span>
                        </div>
                    </div>
                    <div class="doc-badge-area">
                        <div class="doc-badge">Document Officiel</div>
                        <div class="doc-title">Bon de Livraison & Facture</div>
                        <div class="doc-meta">
                            <div>Réf : <span class="doc-ref">#ORD-${orderRef}</span></div>
                            <div style="margin-top: 2px;">Date : <strong>${formattedDate} à ${formattedTime}</strong></div>
                        </div>
                    </div>
                </header>

                <!-- Information Grid -->
                <div class="info-grid">
                    <!-- Client -->
                    <div class="info-card">
                        <div class="info-card-header">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            Destinataire / Client
                        </div>
                        <div class="client-name">${order.user.username || 'Client'}</div>
                        <div class="client-details">
                            <div><strong>Email :</strong> ${order.user.email}</div>
                            <div><strong>Téléphone :</strong> <span style="font-weight: 700; color: #0F172A;">${order.user.phone || 'Non renseigné'}</span></div>
                        </div>
                    </div>

                    <!-- Logistique & Paiement -->
                    <div class="info-card">
                        <div class="info-card-header">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                            Expédition & Règlement
                        </div>
                        <div class="client-details">
                            <div style="margin-bottom: 4px;">
                                <strong>Réception :</strong> 
                                <span class="badge-pill ${isDelivery ? 'badge-orange' : 'badge-slate'}">
                                    ${isDelivery ? '🚚 Livraison à domicile' : '🏪 Retrait en boutique'}
                                </span>
                            </div>
                            ${isDelivery && order.shippingAddress ? `
                                <div><strong>Adresse :</strong> ${order.shippingAddress}</div>
                            ` : ''}
                            ${isDelivery && order.deliveryZone ? `
                                <div><strong>Zone :</strong> ${order.deliveryZone}</div>
                            ` : ''}
                            <div style="margin-top: 4px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                                <strong>Règlement :</strong> 
                                <span style="font-weight: 700; color: #0F172A;">${paymentLabel}</span>
                                <span style="display: inline-block; padding: 1.5px 7px; border-radius: 9999px; font-size: 10px; font-weight: 800; ${paymentStatusStyle}">
                                    ${paymentStatusText}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Product Table -->
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 52%;">Désignation Article</th>
                                <th style="width: 18%; text-align: right;">Prix Unitaire</th>
                                <th style="width: 10%; text-align: center;">Qté</th>
                                <th style="width: 20%; text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map((item: any) => {
                                const prodImg = item.product?.images?.[0];
                                return `
                                    <tr>
                                        <td>
                                            <div class="item-cell">
                                                ${prodImg ? `
                                                    <img src="${prodImg}" alt="${item.product.name}" class="item-thumb" onerror="this.style.display='none'" />
                                                ` : `
                                                    <div class="item-thumb-placeholder">
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                                    </div>
                                                `}
                                                <div>
                                                    <div class="product-name">${item.product.name}</div>
                                                    ${item.selectedColor ? `<span class="product-variant">Option: ${item.selectedColor}</span>` : ''}
                                                </div>
                                            </div>
                                        </td>
                                        <td style="text-align: right;" class="mono-num">${item.price.toLocaleString()} F</td>
                                        <td style="text-align: center;" class="mono-num">${item.quantity}</td>
                                        <td style="text-align: right; font-weight: 700;" class="mono-num">${(item.price * item.quantity).toLocaleString()} F</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Bottom Section: Signatures & Summary -->
                <div class="bottom-grid">
                    <!-- Signatures -->
                    <div class="signatures-area">
                        <div class="signature-box">
                            <span class="signature-label">Signature Expéditeur / Livreur</span>
                            <div class="signature-dots"></div>
                        </div>
                        <div class="signature-box">
                            <span class="signature-label">Signature & Date Client (Réception)</span>
                            <div class="signature-dots"></div>
                        </div>
                    </div>

                    <!-- Summary -->
                    <div class="summary-box">
                        <div class="summary-line">
                            <span>Sous-total articles</span>
                            <strong>${subtotal.toLocaleString()} FCFA</strong>
                        </div>
                        <div class="summary-line">
                            <span>Frais de livraison</span>
                            <strong>${shippingCost > 0 ? `${shippingCost.toLocaleString()} FCFA` : 'Offerte (0 F)'}</strong>
                        </div>
                        <div class="summary-total">
                            <span class="summary-total-label">Net à Payer</span>
                            <span class="summary-total-val">${order.total.toLocaleString()} FCFA</span>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <footer class="doc-footer">
                    <div><strong>Baraka Shop Sénégal</strong> — Électronique certifiée, high-tech et accessoires de qualité.</div>
                    <div>Merci pour votre achat ! En cas de besoin ou de réclamation, contactez le support au +221 33 822 34 22 ou par email.</div>
                </footer>

                <script>
                    window.onload = () => {
                        setTimeout(() => {
                            window.print();
                        }, 400);
                    };
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
                                    <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Paiement</th>
                                    <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <AnimatePresence>
                                    {filteredOrders.map((order) => {
                                        const config = statusConfig[order.status] || statusConfig.PENDING;
                                        const pStatusKey = order.paymentStatus || 'PENDING';
                                        const pConf = paymentStatusConfig[pStatusKey] || paymentStatusConfig.PENDING;
                                        const isThisPaymentUpdating = updatingPaymentOrderId === order.id;

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
                                                <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                                                    {/* Quick Payment Status Dropdown */}
                                                    <div className="relative inline-flex items-center">
                                                        <select
                                                            value={pStatusKey}
                                                            disabled={isThisPaymentUpdating}
                                                            onChange={(e) => handlePaymentStatusUpdate(order.id, e.target.value)}
                                                            className={cn(
                                                                "appearance-none cursor-pointer text-[11px] font-bold rounded-md px-2.5 py-1 pr-6 border transition-all focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-2xs",
                                                                pConf.bg,
                                                                pConf.color,
                                                                pConf.border,
                                                                isThisPaymentUpdating && "opacity-50 pointer-events-none"
                                                            )}
                                                        >
                                                            <option value="PENDING">⏳ En attente</option>
                                                            <option value="PAID">✅ Payée</option>
                                                            <option value="FAILED">❌ Échoué</option>
                                                            <option value="REFUNDED">↩️ Remboursée</option>
                                                        </select>
                                                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-70">
                                                            {isThisPaymentUpdating ? (
                                                                <Loader2 size={10} className="animate-spin text-orange-600" />
                                                            ) : (
                                                                <ChevronDown size={11} />
                                                            )}
                                                        </div>
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

                                {/* Payment Status Control Panel */}
                                <section className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <CreditCard size={12} /> Statut du paiement
                                        </h3>
                                        {(() => {
                                            const pKey = selectedOrder.paymentStatus || 'PENDING';
                                            const pConf = paymentStatusConfig[pKey] || paymentStatusConfig.PENDING;
                                            return (
                                                <span className={cn(
                                                    "text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1",
                                                    pConf.bg, pConf.color, pConf.border
                                                )}>
                                                    <span className={cn("w-1.5 h-1.5 rounded-full", pConf.dot)} />
                                                    {pConf.label}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(paymentStatusConfig).map(([pKey, pConf]) => {
                                            const isPActive = (selectedOrder.paymentStatus || 'PENDING') === pKey;
                                            const isPUpdating = updatingPaymentOrderId === selectedOrder.id;
                                            return (
                                                <button
                                                    key={pKey}
                                                    disabled={isPUpdating}
                                                    onClick={() => handlePaymentStatusUpdate(selectedOrder.id, pKey)}
                                                    className={cn(
                                                        "flex items-center gap-2.5 p-2.5 rounded-lg border transition-all text-left relative",
                                                        isPActive 
                                                            ? cn(pConf.border, pConf.bg, "shadow-sm", pConf.color)
                                                            : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50 text-slate-600",
                                                        isPUpdating && "opacity-60 cursor-not-allowed"
                                                    )}
                                                >
                                                    <span className={cn("w-2 h-2 rounded-full shrink-0", pConf.dot)} />
                                                    <span className="text-[12px] font-bold flex-1 truncate">
                                                        {pConf.label}
                                                    </span>
                                                    {isPUpdating && !isPActive && (
                                                        <Loader2 size={12} className="animate-spin text-slate-400" />
                                                    )}
                                                    {isPActive && (
                                                        isPUpdating ? (
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
                                                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Règlement & Total</p>
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="inline-block px-2 py-0.5 bg-slate-200/60 rounded text-[10px] font-bold text-slate-700">
                                                        {selectedOrder.paymentMethod === 'cash' ? 'Paiement à la livraison' : (selectedOrder.paymentMethod || 'Paiement en ligne')}
                                                    </span>
                                                    {(() => {
                                                        const pKey = selectedOrder.paymentStatus || 'PENDING';
                                                        const pConf = paymentStatusConfig[pKey] || paymentStatusConfig.PENDING;
                                                        return (
                                                            <span className={cn(
                                                                "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border",
                                                                pConf.bg, pConf.color, pConf.border
                                                            )}>
                                                                <span className={cn("w-1.5 h-1.5 rounded-full", pConf.dot)} />
                                                                {pConf.label}
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
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
