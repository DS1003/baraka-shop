'use client';

import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Filter,
    Download,
    Mail,
    Phone,
    MapPin,
    Calendar,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    Star,
    ExternalLink,
    ArrowUpDown,
    UserPlus,
    Activity,
    ShoppingBag,
    Trash2,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getAdminCustomers, deleteCustomer } from '@/lib/actions/admin-actions';

export default function CustomersPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadCustomers() {
            setLoading(true);
            try {
                const data = await getAdminCustomers(searchQuery);
                setCustomers(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        const timer = setTimeout(loadCustomers, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleDelete = async (id: string) => {
        if (confirm("Supprimer ce client ? Cela peut échouer s'il a des commandes.")) {
            const res = await deleteCustomer(id);
            if (res.success) {
                setCustomers(prev => prev.filter(c => c.id !== id));
            } else {
                alert(res.message);
            }
        }
    };

    const customersTotal = customers.length;
    const activeCount = customers.filter(c => c._count.orders > 0).length;

    return (
        <div className="space-y-12">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-2 border-b border-slate-200/40">
                <div className="space-y-1.5">
                    <h1 className="text-[36px] font-bold text-slate-900 tracking-tight leading-tight">
                        Gestion <span className="text-orange-600">Clients.</span>
                    </h1>
                    <p className="text-[15px] text-slate-500 font-medium">
                        Analysez le comportement de vos clients et fidélisez votre audience.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2.5 px-5 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-[13px] hover:bg-slate-50 transition-all shadow-sm">
                        <Download size={18} className="text-slate-400" />
                        <span>Export CSV</span>
                    </button>
                    <button className="flex items-center gap-3 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold text-[13px] hover:bg-orange-700 hover:shadow-xl hover:shadow-orange-200 transition-all shadow-lg shadow-orange-100 group">
                        <UserPlus size={18} />
                        <span>Ajouter un Client</span>
                    </button>
                </div>
            </div>

            {/* Quick Insights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <InsightCard label="CLIENTS TOTAUX" value={customersTotal.toString()} trend="+0" icon={Users} color="orange" />
                <InsightCard label="CLIENTS ACTIFS" value={activeCount.toString()} trend="+0" icon={Activity} color="emerald" />
                <InsightCard label="VALEUR MOYENNE" value="N/A" trend="0" icon={ShoppingBag} color="violet" />
                <InsightCard label="FIDÉLITÉ" value="N/A" trend="0" icon={Star} color="amber" />
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="relative flex-1 w-full max-w-xl group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-orange-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Chercher un nom, email, téléphone ou ville..."
                        className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all shadow-sm placeholder:text-slate-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2.5 px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-[13px] hover:bg-slate-50 transition-all shadow-sm">
                        <Filter size={18} className="text-slate-400" />
                        <span>Segments</span>
                    </button>
                </div>
            </div>

            {/* Premium Customer Table */}
            <div className="bg-white rounded-[24px] border border-slate-200/50 shadow-[0_10px_30_rgba(0,0,0,0.04)] overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="h-[400px] flex flex-col items-center justify-center text-slate-400 gap-4">
                        <Loader2 className="animate-spin text-orange-600" size={32} />
                        <p className="font-bold uppercase tracking-widest text-[10px]">Chargement des clients...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-10 py-6 text-[12px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-left">Profil Client</th>
                                    <th className="px-10 py-6 text-[12px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Contact</th>
                                    <th className="px-10 py-6 text-[12px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Activité</th>
                                    <th className="px-10 py-6 text-[12px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Email</th>
                                    <th className="px-10 py-6 text-[12px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {customers.map((customer) => (
                                    <tr key={customer.id} className="group hover:bg-slate-50/40 transition-all duration-200">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-black text-[13px] border border-orange-100/50 group-hover:scale-110 transition-transform shadow-sm">
                                                    {(customer.username || 'U').split(' ').map((n: string) => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-[15px] font-bold text-slate-900 leading-snug">{customer.username || 'Client Sans Nom'}</p>
                                                        {customer._count.orders > 5 && (
                                                            <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-700">VIP</span>
                                                        )}
                                                    </div>
                                                    <p className="text-[12px] text-slate-400 font-medium">Inscrit le {new Date(customer.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex flex-col gap-1.5 text-[12px] font-medium text-slate-500">
                                                <span className="flex items-center gap-2">
                                                    <Phone size={12} className="text-slate-300" /> {customer.phone || 'Non renseigné'}
                                                </span>
                                                <span className="flex items-center gap-2">
                                                    <MapPin size={12} className="text-slate-300" /> {customer.address || 'Non renseignée'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-[16px] font-black text-slate-900 leading-none">{customer._count.orders}</span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Commandes</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-right text-[13px] text-slate-500 font-medium">
                                            {customer.email}
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="flex justify-end gap-2 pr-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 duration-300">
                                                <button onClick={() => handleDelete(customer.id)} className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-white hover:text-rose-600 hover:shadow-md transition-all border border-transparent hover:border-slate-200">
                                                    <Trash2 size={18} />
                                                </button>
                                                <button className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-md transition-all border border-transparent hover:border-slate-200">
                                                    <MoreHorizontal size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {customers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[12px]">Aucun client trouvé.</td>
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

function InsightCard({ label, value, trend, icon: Icon, color }: { label: string, value: string, trend: string, icon: any, color: string }) {
    const colorMap: any = {
        orange: "bg-orange-50 text-orange-600",
        emerald: "bg-emerald-50 text-emerald-600",
        violet: "bg-violet-50 text-violet-600",
        amber: "bg-amber-50 text-amber-600",
    };

    return (
        <motion.div
            whileHover={{ y: -6 }}
            className="bg-white p-8 rounded-[28px] border border-slate-200/50 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] group relative overflow-hidden"
        >
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110", colorMap[color], "border-transparent group-hover:border-current/10")}>
                    <Icon size={26} strokeWidth={2.5} />
                </div>
                <div className="px-3 py-1 bg-slate-50 rounded-lg text-[12px] font-bold text-slate-500">
                    {trend}
                </div>
            </div>
            <div className="relative z-10">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
                <h3 className="text-[30px] font-black text-slate-900 tracking-tighter tabular-nums leading-none">{value}</h3>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-slate-50 rounded-full blur-3xl group-hover:bg-orange-50/50 transition-colors duration-1000 pointer-events-none" />
        </motion.div>
    );
}
