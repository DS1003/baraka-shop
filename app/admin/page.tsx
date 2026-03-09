'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    CreditCard,
    TrendingUp,
    TrendingDown,
    Users,
    Target,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Download,
    Eye,
    ChevronDown,
    ShoppingBag,
    Activity,
    ArrowRight,
    LayoutGrid,
    MoreHorizontal,
    Loader2,
    PieChart as PieChartIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDashboardStats, getCategoryRevenue, getRecentActivity } from '@/lib/actions/admin-actions';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';

export default function AdminDashboard() {
    const [chartMode, setChartMode] = useState<'revenues' | 'orders' | 'basket'>('revenues');
    const [stats, setStats] = useState<any>(null);
    const [revenueHistory, setRevenueHistory] = useState<any[]>([]);
    const [categoryRevenue, setCategoryRevenue] = useState<any[]>([]);
    const [recentActivities, setRecentActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const [dashStats, catRev, activities] = await Promise.all([
                    getDashboardStats(),
                    getCategoryRevenue(),
                    getRecentActivity()
                ]);
                setStats(dashStats.stats);
                setRevenueHistory(dashStats.revenueHistory);
                setCategoryRevenue(catRev);
                setRecentActivities(activities);
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center text-slate-400 gap-4">
                <Loader2 className="animate-spin text-orange-600" size={48} />
                <p className="font-bold uppercase tracking-widest text-[11px]">Chargement des données stratégiques...</p>
            </div>
        );
    }

    const totalCategoryRev = categoryRevenue.reduce((acc, c) => acc + c.value, 0);

    return (
        <div className="space-y-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-2 border-b border-slate-200/40">
                <div className="space-y-1.5">
                    <h1 className="text-[36px] font-bold text-slate-900 tracking-tight leading-tight">
                        Tableau <span className="text-orange-600 italic">Stratégique.</span>
                    </h1>
                    <p className="text-[15px] text-slate-500 font-medium">
                        Suivez votre croissance et analysez vos indicateurs clés en temps réel.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2.5 px-5 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-[13px] hover:bg-slate-50 transition-all shadow-sm">
                        <Calendar size={18} className="text-slate-400" />
                        <span>FÉVRIER 2026</span>
                        <ChevronDown size={14} className="text-slate-300" />
                    </button>
                    <button className="flex items-center gap-3 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold text-[13px] hover:bg-orange-700 hover:shadow-xl hover:shadow-orange-200 transition-all shadow-lg shadow-orange-100 group">
                        <Download size={18} />
                        <span>Générer Rapport</span>
                    </button>
                </div>
            </div>

            {/* Premium KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <KPICard
                    icon={CreditCard}
                    label="Volume d'affaires"
                    value={`${stats?.revenue?.total?.toLocaleString() || 0} F`}
                    percentage={stats?.revenue?.trend || "+0%"}
                    sparkData={[10, 40, 20, 50, 30, 70, 45, 80]}
                    color="orange"
                />
                <KPICard
                    icon={ShoppingBag}
                    label="Commandes reçues"
                    value={stats?.orders?.total || 0}
                    percentage={stats?.orders?.trend || "+0%"}
                    sparkData={[30, 20, 40, 30, 60, 40, 70, 65]}
                    color="emerald"
                />
                <KPICard
                    icon={Users}
                    label="Utilisateurs"
                    value={stats?.customers?.total || 0}
                    percentage={stats?.customers?.trend || "+0%"}
                    sparkData={[80, 70, 75, 60, 65, 50, 55, 45]}
                    color="rose"
                />
                <KPICard
                    icon={Activity}
                    label="Panier Moyen"
                    value={`${Math.round(stats?.avgBasket?.total || 0).toLocaleString()} F`}
                    percentage={stats?.avgBasket?.trend || "+0%"}
                    sparkData={[20, 30, 25, 40, 35, 50, 55, 60]}
                    color="violet"
                />
            </div>

            {/* Strategic Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-white rounded-[24px] p-10 border border-slate-200/50 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] relative overflow-hidden group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10">
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Performance des Ventes</h3>
                            <p className="text-[14px] text-slate-400 font-medium">Analyse comparative des revenus sur les derniers jours.</p>
                        </div>
                        <div className="flex bg-slate-100/60 p-1.5 rounded-xl border border-slate-200/40">
                            {(['revenues', 'orders'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setChartMode(mode)}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-[12px] font-bold transition-all",
                                        chartMode === mode
                                            ? "bg-white text-orange-600 shadow-sm border border-slate-200/60"
                                            : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    {mode === 'revenues' ? 'Revenus' : 'Commandes'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[340px] w-full mt-8">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
                                    tickFormatter={(value) => chartMode === 'revenues' ? `${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}` : value}
                                    dx={-10}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', padding: '12px 16px', fontWeight: 'bold' }}
                                    itemStyle={{ color: '#1E293B', fontWeight: 900 }}
                                    formatter={(value: any) => [chartMode === 'revenues' ? `${Number(value).toLocaleString()} F` : value, chartMode === 'revenues' ? 'Revenu' : 'Commandes']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey={chartMode === 'revenues' ? 'value' : 'orders'}
                                    stroke={chartMode === 'revenues' ? "#4F46E5" : "#F97316"}
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill={`url(#${chartMode === 'revenues' ? 'colorRevenue' : 'colorOrders'})`}
                                    activeDot={{ r: 8, strokeWidth: 0, fill: chartMode === 'revenues' ? "#4F46E5" : "#F97316" }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-[24px] p-10 border border-slate-200/50 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">Ventes par <br /><span className="text-orange-600 underline decoration-orange-200">Catégorie.</span></h3>
                        <p className="text-[13px] text-slate-400 font-medium mt-1">Répartition de votre mix produit.</p>
                    </div>

                    <div className="relative flex items-center justify-center my-10 h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryRevenue}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={95}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {categoryRevenue.map((entry, index) => {
                                        const colors = ["#4F46E5", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#3B82F6"];
                                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                    })}
                                </Pie>
                                <Tooltip
                                    formatter={(value: any) => [`${Number(value).toLocaleString()} F`, 'Ventes']}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Global</span>
                            <span className="text-[22px] font-black text-slate-900 truncate px-4">{totalCategoryRev >= 1000000 ? (totalCategoryRev / 1000000).toFixed(1) + 'M' : totalCategoryRev >= 1000 ? (totalCategoryRev / 1000).toFixed(1) + 'k' : totalCategoryRev.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="space-y-3 h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                        {categoryRevenue.length > 0 ? categoryRevenue.map((cat, i) => {
                            const colors = ["#4F46E5", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#3B82F6"];
                            return (
                                <CategoryItem
                                    key={i}
                                    color={colors[i % colors.length]}
                                    label={cat.name}
                                    percentage={`${Math.round((cat.value / totalCategoryRev) * 100)}%`}
                                    value={`${cat.value.toLocaleString()} F`}
                                />
                            );
                        }) : (
                            <div className="h-full flex flex-col items-center justify-center gap-3 opacity-50">
                                <PieChartIcon size={32} className="text-slate-300" />
                                <p className="text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">Aucune donnée</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Secondary: Recent Activity */}
            <div className="bg-white rounded-[24px] border border-slate-200/50 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="p-10 flex items-center justify-between border-b border-slate-50">
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Flux d'Activité</h3>
                        <p className="text-[14px] text-slate-400 font-medium">Dernières interactions système & transactions.</p>
                    </div>
                </div>

                <div className="p-10 divide-y divide-slate-100">
                    {recentActivities.map((act) => (
                        <div key={act.id} className="py-4 flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[12px]",
                                    act.type === 'ORDER' ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                                )}>
                                    {act.type === 'ORDER' ? 'ORD' : 'USR'}
                                </div>
                                <div>
                                    <p className="text-[14px] font-bold text-slate-900">{act.title}</p>
                                    <p className="text-[12px] text-slate-400 font-medium">{new Date(act.time).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}</p>
                                </div>
                            </div>
                            {act.amount && <span className="text-[14px] font-black text-slate-900">{act.amount.toLocaleString()} F</span>}
                        </div>
                    ))}
                    {recentActivities.length === 0 && (
                        <p className="text-center py-10 text-slate-300 font-bold text-[14px]">Aucune activité récente détectée.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function KPICard({ icon: Icon, label, value, percentage, sparkData, isNegative, color }: any) {
    const colorMap: any = {
        orange: 'text-orange-600 bg-orange-50 border-orange-100',
        emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        rose: 'text-rose-600 bg-rose-50 border-rose-100',
        violet: 'text-violet-600 bg-violet-50 border-violet-100'
    };

    return (
        <motion.div
            whileHover={{ y: -6, boxShadow: "0 25px 40px -20px rgba(0,0,0,0.08)" }}
            className="bg-white rounded-[24px] p-8 border border-slate-200/50 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] transition-all group overflow-hidden relative"
        >
            <div className="flex items-start justify-between mb-8 relative z-10">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110", colorMap[color])}>
                    <Icon size={26} strokeWidth={2.5} />
                </div>
                <div className={cn(
                    "px-3 py-1.5 rounded-full text-[12px] font-bold flex items-center gap-1 shadow-sm",
                    isNegative ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                )}>
                    {isNegative ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                    {percentage}
                </div>
            </div>
            <div className="space-y-1.5 relative z-10">
                <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                <h4 className="text-[28px] font-black text-slate-900 tracking-tighter leading-none">{value}</h4>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-slate-50 rounded-full blur-3xl group-hover:bg-orange-50/50 transition-colors duration-700" />
        </motion.div>
    );
}

function CategoryItem({ color, label, percentage, value }: any) {
    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-transparent hover:border-slate-100 transition-all group">
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <div>
                    <p className="text-[13px] font-bold text-slate-900 leading-none mb-1">{label}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{percentage}</p>
                </div>
            </div>
            <span className="text-[14px] font-black text-slate-900 tabular-nums">{value}</span>
        </div>
    );
}
