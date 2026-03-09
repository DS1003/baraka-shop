'use client';

import React from 'react';
import { motion } from 'framer-motion';
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
    PieChart as LucidePieChart
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
    Legend
} from 'recharts';

const trafficData = [
    { name: 'Direct', value: 85, fill: '#EA580C' }, // orange-600
    { name: 'Social', value: 65, fill: '#8B5CF6' }, // violet-500
    { name: 'Search', value: 45, fill: '#E2E8F0' }, // slate-200
    { name: 'Referral', value: 95, fill: '#FB923C' }, // orange-400
    { name: 'Ads', value: 30, fill: '#F1F5F9' }, // slate-100
    { name: 'Email', value: 55, fill: '#1E293B' }, // slate-800
];

const deviceData = [
    { name: 'Mobile', value: 65, fill: '#EA580C' },
    { name: 'Desktop', value: 25, fill: '#8B5CF6' },
    { name: 'Tablet', value: 10, fill: '#E2E8F0' },
];

export default function AnalyticsPage() {
    return (
        <div className="space-y-12">
            {/* Page Header: High Hierarchy & Sophisticated */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-2 border-b border-slate-200/40">
                <div className="space-y-1.5">
                    <h1 className="text-[36px] font-bold text-slate-900 tracking-tight leading-tight">
                        Centre <span className="text-orange-600 italic">Analytique.</span>
                    </h1>
                    <p className="text-[15px] text-slate-500 font-medium">
                        Explorez vos données de trafic et convertissez chaque visiteur en client fidèle.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2.5 px-5 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-[13px] hover:bg-slate-50 transition-all shadow-sm">
                        <Calendar size={18} className="text-slate-400" />
                        <span>DERNIERS 30 JOURS</span>
                    </button>
                    <button className="flex items-center gap-3 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold text-[13px] hover:bg-orange-700 hover:shadow-xl hover:shadow-orange-200 transition-all shadow-lg shadow-orange-100 group">
                        <Download size={18} />
                        <span>Rapport Business</span>
                    </button>
                </div>
            </div>

            {/* Strategic Performance Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <MetricCard
                    label="VISITEURS UNIQUES"
                    value="12.5k"
                    trend="+18%"
                    icon={Users}
                    color="text-orange-600"
                    bg="bg-orange-50"
                />
                <MetricCard
                    label="TAUX DE REBOND"
                    value="24.2%"
                    trend="-2.4%"
                    isNegative={true}
                    icon={MousePointer2}
                    color="text-violet-600"
                    bg="bg-violet-50"
                />
                <MetricCard
                    label="RÉTENTION"
                    value="68.4%"
                    trend="+5.2%"
                    icon={Target}
                    color="text-emerald-600"
                    bg="bg-emerald-50"
                />
                <MetricCard
                    label="SESSIONS ACTIVES"
                    value="432"
                    icon={Activity}
                    color="text-slate-600"
                    bg="bg-slate-50"
                />
            </div>

            {/* In-depth Graph Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Traffic Acquisition Analysis */}
                <div className="lg:col-span-2 bg-white rounded-[28px] p-10 border border-slate-200/50 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] overflow-hidden group">
                    <div className="flex items-center justify-between mb-12">
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Acquisition de Trafic</h3>
                            <p className="text-[14px] text-slate-400 font-medium">Répartition par canaux d'entrée principaux.</p>
                        </div>
                    </div>

                    <div className="h-[300px] w-full mt-8">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trafficData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 900 }}
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
                                    formatter={(value: any) => [`${value}%`, 'Acquisition']}
                                />
                                <Bar
                                    dataKey="value"
                                    radius={[8, 8, 8, 8]}
                                    animationDuration={1500}
                                >
                                    {trafficData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Device & OS Distribution */}
                <div className="bg-white rounded-[28px] p-10 border border-slate-200/50 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col justify-between">
                    <div className="space-y-1 mb-8">
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Ecosystème Clients</h3>
                    </div>

                    <div className="flex-1 flex items-center justify-center relative min-h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie
                                    data={deviceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                    animationDuration={1500}
                                >
                                    {deviceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: any) => [`${value}%`, 'Utilisation']}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                                />
                            </RePieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <LucidePieChart size={28} className="text-slate-200" />
                        </div>
                    </div>

                    <div className="mt-10 space-y-4">
                        {deviceData.map((device, i) => (
                            <AnalyticsItem key={i} label={device.name} percentage={`${device.value}%`} color={device.fill} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Strategic Action Card */}
            <div className="bg-[#0F172A] p-12 rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative group border border-white/5">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-[2000ms] pointer-events-none">
                    <BarChart3 size={240} />
                </div>
                <div className="space-y-6 max-w-2xl relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 border border-orange-500/30">
                            <TrendingUp size={20} />
                        </div>
                        <h4 className="text-[22px] font-bold italic tracking-tight leading-tight">Optimisation <span className="text-orange-400">Conversion 2026.</span></h4>
                    </div>
                    <p className="text-slate-400 text-[15px] leading-relaxed font-medium">
                        Votre trafic mobile a augmenté de <span className="text-white font-bold">24%</span> ce mois-ci, mais le taux de conversion y est inférieur de <span className="text-rose-400 font-bold">12%</span> par rapport au Desktop. Nous suggérons une révision du flux de checkout mobile.
                    </p>
                </div>
                <button className="flex items-center gap-3 px-8 py-4 bg-white text-orange-600 rounded-2xl font-bold text-[13px] uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-xl shadow-orange-900/40 relative z-10 whitespace-nowrap">
                    <span>Lancer l'Audit UX</span>
                    <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
}

function MetricCard({ label, value, trend, isNegative, icon: Icon, color, bg }: { label: string, value: string, trend?: string, isNegative?: boolean, icon: any, color: string, bg: string }) {
    return (
        <motion.div
            whileHover={{ y: -6, boxShadow: "0 25px 40px -20px rgba(0,0,0,0.06)" }}
            className="bg-white p-8 rounded-[28px] border border-slate-200/50 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] transition-all group relative overflow-hidden"
        >
            <div className="flex items-start justify-between mb-8 relative z-10">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110", bg, color, "border-transparent group-hover:border-current/10")}>
                    <Icon size={26} strokeWidth={2.5} />
                </div>
                {trend && (
                    <div className={cn(
                        "px-3 py-1.5 rounded-full text-[12px] font-bold flex items-center gap-1 shadow-sm transition-colors",
                        isNegative ? "bg-rose-50 text-rose-500" : "bg-emerald-50 text-emerald-600"
                    )}>
                        {trend}
                    </div>
                )}
            </div>
            <div className="relative z-10">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
                <h3 className="text-[30px] font-black text-slate-900 tracking-tighter tabular-nums leading-none">{value}</h3>
            </div>
            {/* Subtle Gradient Halo */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-slate-50 rounded-full blur-3xl group-hover:bg-orange-50/50 transition-colors duration-700 pointer-events-none" />
        </motion.div>
    );
}

function AnalyticsItem({ label, percentage, color }: { label: string, percentage: string, color: string }) {
    return (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-slate-100 transition-all group">
            <div className="flex items-center gap-4">
                <div className="w-2.5 h-2.5 rounded-full transition-transform group-hover:scale-150 duration-300" style={{ backgroundColor: color }} />
                <span className="text-[14px] font-bold text-slate-700">{label}</span>
            </div>
            <span className="text-[15px] font-black text-slate-900 tabular-nums">{percentage}</span>
        </div>
    );
}
