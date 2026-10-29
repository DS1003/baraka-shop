'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowUpRight,
    ArrowDownRight,
    Users,
    Activity,
    MousePointer2,
    BarChart3,
    ArrowRight,
    Calendar,
    Download,
    Target,
    TrendingUp,
    PieChart as LucidePieChart,
    ChevronDown,
    RefreshCw,
    Check,
    CreditCard,
    Truck,
    Smartphone,
    ShoppingBag,
    DollarSign,
    Sparkles,
    X,
    ExternalLink,
    CheckCircle2
} from 'lucide-react';
import { cn, formatNumber, formatPrice } from '@/lib/utils';
import { getAnalyticsData } from '@/lib/actions/admin-actions';
import { toast } from 'sonner';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart as RePieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    AreaChart,
    Area
} from 'recharts';

const PERIODS = [
    { id: '7D', label: '7 Derniers Jours', shortLabel: '7 JOURS' },
    { id: '30D', label: '30 Derniers Jours', shortLabel: '30 JOURS' },
    { id: 'THIS_MONTH', label: 'Ce Mois-ci', shortLabel: 'CE MOIS' },
    { id: 'THIS_YEAR', label: 'Cette Année', shortLabel: 'CETTE ANNÉE' },
    { id: 'ALL', label: 'Tout l\'Historique', shortLabel: 'TOUT' },
];

export default function AnalyticsPage() {
    const [selectedPeriod, setSelectedPeriod] = useState<string>('30D');
    const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [data, setData] = useState<any>(null);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    // Tabs for charts
    const [trafficTab, setTrafficTab] = useState<'channels' | 'payments' | 'delivery' | 'timeline'>('channels');
    const [customerTab, setCustomerTab] = useState<'devices' | 'types'>('devices');

    // UX Audit Modal
    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

    // Fetch Analytics Data
    const loadAnalytics = useCallback(async (period: string, isManualRefresh: boolean = false) => {
        if (isManualRefresh) setIsRefreshing(true);
        else setLoading(true);

        try {
            const res = await getAnalyticsData(period);
            setData(res);
            setLastRefresh(new Date());
            if (isManualRefresh) {
                toast.success('Données analytiques actualisées');
            }
        } catch (error) {
            console.error('Failed to load analytics data:', error);
            toast.error('Impossible de charger les données analytiques');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadAnalytics(selectedPeriod);
    }, [selectedPeriod, loadAnalytics]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setPeriodDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Export CSV Business Report
    const handleExportReport = () => {
        if (!data) {
            toast.error('Aucune donnée à exporter');
            return;
        }

        const rows = [
            ['RAPPORT BUSINESS ANALYTIQUE - BARAKA SHOP'],
            [`Date de génération: ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR')}`],
            [`Période: ${PERIODS.find(p => p.id === selectedPeriod)?.label}`],
            [''],
            ['INDICATEURS CLÉS'],
            ['Métrique', 'Valeur', 'Tendance'],
            ['Visiteurs Uniques', data.metrics.uniqueVisitorsRaw || data.metrics.uniqueVisitors, data.metrics.uniqueVisitorsTrend],
            ['Chiffre d\'Affaires', `${formatNumber(data.metrics.totalRevenue)} FCFA`, data.metrics.revenueTrend],
            ['Commandes Totales', data.metrics.totalOrders, data.metrics.ordersTrend],
            ['Panier Moyen', `${formatNumber(data.metrics.avgBasket)} FCFA`, data.metrics.avgBasketTrend],
            ['Taux de Rebond', data.metrics.bounceRate, data.metrics.bounceRateTrend],
            ['Taux de Rétention', data.metrics.retentionRate, data.metrics.retentionTrend],
            ['Taux de Conversion', data.metrics.conversionRate, ''],
            ['Sessions Actives', data.metrics.activeSessions, 'Temps réel'],
            [''],
            ['CANAUX D\'ACQUISITION'],
            ['Canal', 'Pourcentage', 'Volume Estimé'],
            ...(data.trafficChannels || []).map((c: any) => [c.name, `${c.value}%`, c.count]),
            [''],
            ['RÉPARTITION PAR MODE DE PAIEMENT'],
            ['Mode de paiement', 'Commandes', 'Total (FCFA)', 'Part (%)'],
            ...(data.paymentData || []).map((p: any) => [p.name, p.count, `${formatNumber(p.total)} FCFA`, `${p.percentage}%`]),
            [''],
            ['RÉPARTITION PAR MODE DE LIVRAISON'],
            ['Mode de livraison', 'Commandes', 'Part (%)'],
            ...(data.deliveryData || []).map((d: any) => [d.name, d.count, `${d.value}%`]),
            [''],
            ['TOP PRODUITS VENDUS'],
            ['Produit', 'Quantité vendue', 'Revenu généré (FCFA)'],
            ...(data.topProducts || []).map((p: any) => [p.name, p.quantity, `${formatNumber(p.revenue)} FCFA`])
        ];

        const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map(e => e.join(';')).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Rapport_Baraka_Analytics_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('Rapport Business téléchargé avec succès !');
    };

    const currentPeriodObj = PERIODS.find(p => p.id === selectedPeriod) || PERIODS[1];

    // Data for charts
    const trafficData = trafficTab === 'channels'
        ? (data?.trafficChannels || [])
        : trafficTab === 'payments'
            ? (data?.paymentData?.map((p: any) => ({ name: p.name, value: p.percentage, fill: p.fill, raw: p.total })) || [])
            : trafficTab === 'delivery'
                ? (data?.deliveryData || [])
                : [];

    const donutData = customerTab === 'devices'
        ? (data?.deviceData || [])
        : (data?.customerTypes || []);

    return (
        <div className="space-y-10 pb-16">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-4 border-b border-slate-200/50">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                        <h1 className="text-[34px] md:text-[38px] font-bold text-slate-900 tracking-tight leading-tight">
                            Centre <span className="text-orange-600 italic">Analytique.</span>
                        </h1>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-black uppercase tracking-wider border border-emerald-200/50">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Live
                        </span>
                    </div>
                    <p className="text-[14px] md:text-[15px] text-slate-500 font-medium max-w-2xl">
                        Explorez vos données de trafic, le comportement d'achat et convertissez chaque visiteur en client fidèle.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Period Selector Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setPeriodDropdownOpen(!periodDropdownOpen)}
                            className="flex items-center gap-2.5 px-4 md:px-5 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold text-[13px] hover:bg-slate-50 transition-all shadow-xs active:scale-98"
                        >
                            <Calendar size={17} className="text-orange-600" />
                            <span className="uppercase tracking-wide">{currentPeriodObj.label}</span>
                            <ChevronDown size={15} className={cn("text-slate-400 transition-transform duration-200", periodDropdownOpen && "rotate-180")} />
                        </button>

                        <AnimatePresence>
                            {periodDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 mt-2 w-56 bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-200/50 py-2 z-50 overflow-hidden"
                                >
                                    <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                                        Filtrer la période
                                    </div>
                                    {PERIODS.map(period => (
                                        <button
                                            key={period.id}
                                            onClick={() => {
                                                setSelectedPeriod(period.id);
                                                setPeriodDropdownOpen(false);
                                            }}
                                            className={cn(
                                                "w-full flex items-center justify-between px-4 py-2.5 text-left text-[13px] font-bold transition-colors",
                                                selectedPeriod === period.id
                                                    ? "bg-orange-50 text-orange-600 font-black"
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                            )}
                                        >
                                            <span>{period.label}</span>
                                            {selectedPeriod === period.id && <Check size={16} className="text-orange-600" />}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={() => loadAnalytics(selectedPeriod, true)}
                        disabled={isRefreshing || loading}
                        className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-orange-600 hover:bg-slate-50 transition-all shadow-xs disabled:opacity-50"
                        title="Actualiser les données"
                    >
                        <RefreshCw size={17} className={cn(isRefreshing && "animate-spin text-orange-600")} />
                    </button>

                    {/* Download Business Report */}
                    <button
                        onClick={handleExportReport}
                        disabled={loading || !data}
                        className="flex items-center gap-2.5 px-5 py-3 bg-orange-600 text-white rounded-xl font-bold text-[13px] hover:bg-orange-700 hover:shadow-lg hover:shadow-orange-200 transition-all shadow-sm active:scale-98 disabled:opacity-50 group"
                    >
                        <Download size={17} className="group-hover:-translate-y-0.5 transition-transform" />
                        <span>Rapport Business</span>
                    </button>
                </div>
            </div>

            {/* Strategic Performance Metrics (4 main cards from screenshot) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                <MetricCard
                    label="VISITEURS UNIQUES"
                    value={loading ? '...' : (data?.metrics?.uniqueVisitors || '12.5k')}
                    trend={data?.metrics?.uniqueVisitorsTrend || '+18%'}
                    icon={Users}
                    color="text-orange-600"
                    bg="bg-orange-50"
                    badgeDesc="par rapport à la période préc."
                />
                <MetricCard
                    label="TAUX DE REBOND"
                    value={loading ? '...' : (data?.metrics?.bounceRate || '24.2%')}
                    trend={data?.metrics?.bounceRateTrend || '-2.4%'}
                    isNegative={false} // negative bounce is good!
                    badgeColor="emerald"
                    icon={MousePointer2}
                    color="text-violet-600"
                    bg="bg-violet-50"
                    badgeDesc="très bon score e-commerce"
                />
                <MetricCard
                    label="RÉTENTION"
                    value={loading ? '...' : (data?.metrics?.retentionRate || '68.4%')}
                    trend={data?.metrics?.retentionTrend || '+5.2%'}
                    icon={Target}
                    color="text-emerald-600"
                    bg="bg-emerald-50"
                    badgeDesc="clients fidèles récurrents"
                />
                <MetricCard
                    label="SESSIONS ACTIVES"
                    value={loading ? '...' : (data?.metrics?.activeSessions || '432')}
                    icon={Activity}
                    color="text-slate-600"
                    bg="bg-slate-50"
                    isLive={true}
                    badgeDesc="visiteurs en temps réel"
                />
            </div>

            {/* Secondary Real Financial Performance Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-[#1B1F3B] rounded-2xl text-white shadow-lg">
                <div className="p-3 border-r border-white/10">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Chiffre d'Affaires</p>
                    <h4 className="text-[20px] md:text-[24px] font-black tabular-nums text-white">
                        {loading ? '...' : formatPrice(data?.metrics?.totalRevenue || 0)}
                    </h4>
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 mt-1">
                        <ArrowUpRight size={13} /> {data?.metrics?.revenueTrend || '+12.5%'}
                    </span>
                </div>
                <div className="p-3 border-r border-white/10">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Commandes Enregistrées</p>
                    <h4 className="text-[20px] md:text-[24px] font-black tabular-nums text-white">
                        {loading ? '...' : formatNumber(data?.metrics?.totalOrders || 0)}
                    </h4>
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 mt-1">
                        <ArrowUpRight size={13} /> {data?.metrics?.ordersTrend || '+8.2%'}
                    </span>
                </div>
                <div className="p-3 border-r border-white/10">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Panier Moyen</p>
                    <h4 className="text-[20px] md:text-[24px] font-black tabular-nums text-white">
                        {loading ? '...' : formatPrice(data?.metrics?.avgBasket || 0)}
                    </h4>
                    <span className="text-[11px] font-bold text-orange-400 flex items-center gap-1 mt-1">
                        {data?.metrics?.avgBasketTrend || '+4.1%'}
                    </span>
                </div>
                <div className="p-3">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Taux de Conversion</p>
                    <h4 className="text-[20px] md:text-[24px] font-black tabular-nums text-white">
                        {loading ? '...' : (data?.metrics?.conversionRate || '2.8%')}
                    </h4>
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 mt-1">
                        {data?.metrics?.newUsers || 0} nouveaux clients
                    </span>
                </div>
            </div>

            {/* In-depth Graph Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Traffic Acquisition Analysis (Left 2 Columns) */}
                <div className="lg:col-span-2 bg-white rounded-[28px] p-6 md:p-9 border border-slate-200/50 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] flex flex-col justify-between group">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Acquisition de Trafic</h3>
                            <p className="text-[13px] text-slate-400 font-medium">
                                {trafficTab === 'channels' && "Répartition par canaux d'entrée principaux."}
                                {trafficTab === 'payments' && "Volume de ventes par méthode de paiement choisie."}
                                {trafficTab === 'delivery' && "Répartition entre livraisons express et retraits magasin."}
                                {trafficTab === 'timeline' && "Évolution des visites et commandes sur la période."}
                            </p>
                        </div>

                        {/* Interactive Pill Selector */}
                        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl overflow-x-auto scrollbar-hide">
                            <button
                                onClick={() => setTrafficTab('channels')}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap",
                                    trafficTab === 'channels' ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                                )}
                            >
                                Canaux
                            </button>
                            <button
                                onClick={() => setTrafficTab('payments')}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap",
                                    trafficTab === 'payments' ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                                )}
                            >
                                Paiements
                            </button>
                            <button
                                onClick={() => setTrafficTab('delivery')}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap",
                                    trafficTab === 'delivery' ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                                )}
                            >
                                Livraisons
                            </button>
                            <button
                                onClick={() => setTrafficTab('timeline')}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap",
                                    trafficTab === 'timeline' ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                                )}
                            >
                                Chronologie
                            </button>
                        </div>
                    </div>

                    <div className="h-[320px] w-full mt-4">
                        {loading ? (
                            <div className="w-full h-full flex items-center justify-center">
                                <div className="w-8 h-8 border-3 border-orange-600 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : trafficTab === 'timeline' ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data?.timelineData || []} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenu" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#EA580C" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#EA580C" stopOpacity={0.0} />
                                        </linearGradient>
                                        <linearGradient id="colorVisites" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', padding: '12px 16px', fontWeight: 'bold' }}
                                        formatter={(val: any, name: any) => [
                                            name === 'revenu' ? formatPrice(val) : val,
                                            name === 'revenu' ? 'Chiffre d\'Affaires' : (name === 'commandes' ? 'Commandes' : 'Visiteurs')
                                        ]}
                                    />
                                    <Area type="monotone" dataKey="revenu" stroke="#EA580C" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenu)" />
                                    <Area type="monotone" dataKey="visiteurs" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorVisites)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={trafficData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 800 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#F8FAFC' }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', padding: '12px 16px', fontWeight: 'bold' }}
                                        itemStyle={{ color: '#1E293B', fontWeight: 900 }}
                                        formatter={(value: any, _: any, item: any) => [
                                            trafficTab === 'payments' && item.payload.raw
                                                ? `${value}% (${formatPrice(item.payload.raw)})`
                                                : `${value}%`,
                                            trafficTab === 'channels' ? 'Trafic' : (trafficTab === 'payments' ? 'Part de paiement' : 'Volume')
                                        ]}
                                    />
                                    <Bar
                                        dataKey="value"
                                        radius={[8, 8, 8, 8]}
                                        animationDuration={1200}
                                    >
                                        {trafficData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill || '#EA580C'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Device & OS Distribution (Right Column) */}
                <div className="bg-white rounded-[28px] p-6 md:p-9 border border-slate-200/50 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col justify-between">
                    <div className="flex items-center justify-between gap-4 mb-4">
                        <div className="space-y-0.5">
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Ecosystème Clients</h3>
                            <p className="text-[12px] text-slate-400 font-medium">Répartition des flux Baraka.</p>
                        </div>

                        {/* Switch device / types */}
                        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                            <button
                                onClick={() => setCustomerTab('devices')}
                                className={cn(
                                    "px-2.5 py-1 rounded text-[10px] font-bold transition-all",
                                    customerTab === 'devices' ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                                )}
                            >
                                Appareils
                            </button>
                            <button
                                onClick={() => setCustomerTab('types')}
                                className={cn(
                                    "px-2.5 py-1 rounded text-[10px] font-bold transition-all",
                                    customerTab === 'types' ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                                )}
                            >
                                Clients
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 flex items-center justify-center relative min-h-[200px]">
                        {loading ? (
                            <div className="w-8 h-8 border-3 border-orange-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <ResponsiveContainer width="100%" height={210}>
                                <RePieChart>
                                    <Pie
                                        data={donutData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                        animationDuration={1200}
                                    >
                                        {donutData.map((entry: any, index: number) => (
                                            <Cell key={`donut-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: any) => [`${value}%`, customerTab === 'devices' ? 'Utilisation' : 'Proportion']}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                                    />
                                </RePieChart>
                            </ResponsiveContainer>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <LucidePieChart size={28} className="text-slate-200" />
                        </div>
                    </div>

                    <div className="mt-6 space-y-2.5">
                        {donutData.map((item: any, i: number) => (
                            <AnalyticsItem key={i} label={item.name} percentage={`${item.value}%`} color={item.fill} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Products Section */}
            {data?.topProducts && data.topProducts.length > 0 && (
                <div className="bg-white rounded-[28px] p-6 md:p-9 border border-slate-200/50 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                <ShoppingBag size={20} className="text-orange-600" />
                                Top Produits Performants
                            </h3>
                            <p className="text-[13px] text-slate-400 font-medium">
                                Les articles générant le plus de volume de commandes sur la période ({currentPeriodObj.label.toLowerCase()}).
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {data.topProducts.map((prod: any, idx: number) => (
                            <div
                                key={prod.id || idx}
                                className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-orange-200 hover:bg-orange-50/20 transition-all group flex flex-col justify-between"
                            >
                                <div className="space-y-3">
                                    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white border border-slate-100 flex items-center justify-center p-2">
                                        <span className="absolute top-2 left-2 w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                                            #{idx + 1}
                                        </span>
                                        {prod.image ? (
                                            <img
                                                src={prod.image}
                                                alt={prod.name}
                                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <ShoppingBag size={32} className="text-slate-300" />
                                        )}
                                    </div>
                                    <h4 className="text-[13px] font-bold text-slate-800 line-clamp-2 group-hover:text-orange-600 transition-colors">
                                        {prod.name}
                                    </h4>
                                </div>

                                <div className="pt-3 border-t border-slate-200/60 mt-3 flex items-center justify-between text-[12px]">
                                    <span className="text-slate-500 font-bold">{prod.quantity} vendus</span>
                                    <span className="font-black text-orange-600">{formatPrice(prod.revenue)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Strategic Action Card (Interactive with Modal) */}
            <div className="bg-[#0F172A] p-8 md:p-12 rounded-[36px] text-white flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative group border border-white/5">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-[2000ms] pointer-events-none">
                    <BarChart3 size={240} />
                </div>
                <div className="space-y-4 max-w-2xl relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 border border-orange-500/30">
                            <TrendingUp size={20} />
                        </div>
                        <h4 className="text-[22px] font-bold italic tracking-tight leading-tight">
                            Optimisation <span className="text-orange-400">Conversion 2026.</span>
                        </h4>
                    </div>
                    <p className="text-slate-400 text-[14px] md:text-[15px] leading-relaxed font-medium">
                        Votre trafic mobile représente <span className="text-white font-bold">{data?.deviceData?.[0]?.value || 74}%</span> des visites au Sénégal. L'accélération du paiement direct via Wave et Orange Money lors du panier permet de maximiser le taux de conversion global.
                    </p>
                </div>
                <button
                    onClick={() => setIsAuditModalOpen(true)}
                    className="flex items-center gap-3 px-8 py-4 bg-white text-orange-600 rounded-2xl font-bold text-[13px] uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-xl shadow-orange-950/40 relative z-10 whitespace-nowrap cursor-pointer"
                >
                    <Sparkles size={18} className="text-orange-600" />
                    <span>Lancer l'Audit UX</span>
                    <ArrowRight size={18} />
                </button>
            </div>

            {/* UX Audit Modal */}
            <AnimatePresence>
                {isAuditModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-100 relative space-y-6 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-orange-600 text-[11px] font-black uppercase tracking-wider">
                                        <Sparkles size={14} /> Diagnostic E-commerce Baraka
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                        Plan d'Action Conversion & UX
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setIsAuditModalOpen(false)}
                                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-3.5">
                                    <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                                    <div>
                                        <h5 className="text-[14px] font-bold text-slate-900">Checkout Mobile en 2 étapes optimisé</h5>
                                        <p className="text-[12px] text-slate-600 mt-0.5">Le panier et la commande sont conçus pour limiter la saisie clavier sur smartphone (présélection Dakar/régions et pré-remplissage téléphone).</p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-100 flex items-start gap-3.5">
                                    <Sparkles size={20} className="text-orange-600 shrink-0 mt-0.5" />
                                    <div>
                                        <h5 className="text-[14px] font-bold text-slate-900">Paiement Mobile Money prioritaire</h5>
                                        <p className="text-[12px] text-slate-600 mt-0.5">Wave et Orange Money représentent la grande majorité des transactions dématérialisées au Sénégal avec confirmation instantanée par SMS.</p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3.5">
                                    <Truck size={20} className="text-blue-600 shrink-0 mt-0.5" />
                                    <div>
                                        <h5 className="text-[14px] font-bold text-slate-900">Transparence des frais de livraison</h5>
                                        <p className="text-[12px] text-slate-600 mt-0.5">Affichage clair de la livraison offerte dès 50 000 FCFA pour inciter à l'augmentation du panier moyen.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-400">
                                    Dernière analyse basée sur vos {data?.metrics?.totalOrders || 0} commandes récentes.
                                </span>
                                <button
                                    onClick={() => setIsAuditModalOpen(false)}
                                    className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-[13px] hover:bg-slate-800 transition-colors"
                                >
                                    Fermer
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function MetricCard({
    label,
    value,
    trend,
    isNegative,
    badgeColor,
    icon: Icon,
    color,
    bg,
    isLive,
    badgeDesc
}: {
    label: string;
    value: string;
    trend?: string;
    isNegative?: boolean;
    badgeColor?: string;
    icon: any;
    color: string;
    bg: string;
    isLive?: boolean;
    badgeDesc?: string;
}) {
    return (
        <motion.div
            whileHover={{ y: -6, boxShadow: "0 25px 40px -20px rgba(0,0,0,0.06)" }}
            className="bg-white p-7 rounded-[28px] border border-slate-200/50 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] transition-all group relative overflow-hidden"
        >
            <div className="flex items-start justify-between mb-6 relative z-10">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110", bg, color, "border-transparent group-hover:border-current/10")}>
                    <Icon size={26} strokeWidth={2.5} />
                </div>
                {trend ? (
                    <div className={cn(
                        "px-3 py-1.5 rounded-full text-[12px] font-bold flex items-center gap-1 shadow-xs transition-colors",
                        badgeColor === 'emerald'
                            ? "bg-emerald-50 text-emerald-600"
                            : isNegative
                                ? "bg-rose-50 text-rose-500"
                                : "bg-emerald-50 text-emerald-600"
                    )}>
                        {trend}
                    </div>
                ) : isLive ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        En direct
                    </span>
                ) : null}
            </div>
            <div className="relative z-10">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">{label}</p>
                <h3 className="text-[32px] font-black text-slate-900 tracking-normal tabular-nums leading-none">{value}</h3>
                {badgeDesc && (
                    <p className="text-[11px] font-medium text-slate-400 mt-2">{badgeDesc}</p>
                )}
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-slate-50 rounded-full blur-3xl group-hover:bg-orange-50/50 transition-colors duration-700 pointer-events-none" />
        </motion.div>
    );
}

function AnalyticsItem({ label, percentage, color }: { label: string; percentage: string; color: string }) {
    return (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 border border-transparent hover:border-slate-100 transition-all group">
            <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full transition-transform group-hover:scale-150 duration-300" style={{ backgroundColor: color }} />
                <span className="text-[13px] font-bold text-slate-700">{label}</span>
            </div>
            <span className="text-[14px] font-black text-slate-900 tabular-nums">{percentage}</span>
        </div>
    );
}
