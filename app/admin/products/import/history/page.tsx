'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Clock,
    ExternalLink,
    Database,
    AlertCircle,
    Trash2,
    Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getAllImportJobs, clearImportJobs } from '@/lib/actions/import-bg-actions';

export default function ImportHistoryPage() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadJobs = async () => {
        setLoading(true);
        const data = await getAllImportJobs();
        setJobs(data);
        setLoading(false);
    };

    useEffect(() => {
        loadJobs();
        const interval = setInterval(loadJobs, 5000); // Polling every 5s
        return () => clearInterval(interval);
    }, []);

    const handleClear = async () => {
        if (confirm("Voulez-vous vraiment effacer tout l'historique des injections ?")) {
            await clearImportJobs();
            loadJobs();
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'FAILED': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'PROCESSING': return 'bg-blue-50 text-blue-600 border-blue-100 animate-pulse';
            default: return 'bg-slate-50 text-slate-400 border-slate-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle2 size={16} />;
            case 'FAILED': return <AlertCircle size={16} />;
            case 'PROCESSING': return <RefreshCw size={16} className="animate-spin" />;
            default: return <Clock size={16} />;
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto space-y-10 pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4 border-b border-slate-200/40">
                <div className="flex items-center gap-6">
                    <Link
                        href="/admin/products/import"
                        className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-orange-600 hover:shadow-xl transition-all active:scale-95 group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <div className="space-y-1.5">
                        <h1 className="text-[36px] font-bold text-slate-900 tracking-tight leading-tight">
                            Logs <span className="text-orange-600">Injections.</span>
                        </h1>
                        <p className="text-[15px] text-slate-500 font-medium">Historique et suivi en temps réel des importations de catalogue.</p>
                    </div>
                </div>

                <button
                    onClick={handleClear}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 rounded-xl font-bold text-[13px] transition-all"
                >
                    <Trash2 size={16} /> Effacer les logs
                </button>
            </div>

            {loading && jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[40px] border border-slate-100 shadow-xl">
                    <RefreshCw className="text-orange-500 animate-spin mb-6" size={48} />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[12px]">Chargement des logs...</p>
                </div>
            ) : jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[40px] border border-slate-100 shadow-xl text-center px-10">
                    <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center mb-8 border border-slate-100 text-slate-300">
                        <Database size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Aucun log disponible</h3>
                    <p className="text-slate-400 max-w-sm font-medium">Vous n'avez pas encore effectué d'importation via le nouveau système de fond.</p>
                    <Link href="/admin/products/import" className="mt-8 px-10 py-4 bg-orange-600 text-white rounded-2xl font-black text-[13px] uppercase tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-500/20">Lancer un Import</Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {jobs.map((job) => (
                        <motion.div
                            layout
                            key={job.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-xl shadow-slate-200/30 group hover:border-orange-200/50 transition-all"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                <div className="flex items-center gap-6">
                                    <div className={cn(
                                        "w-16 h-16 rounded-[24px] flex items-center justify-center border-2 shadow-sm transition-transform group-hover:scale-110",
                                        getStatusStyle(job.status)
                                    )}>
                                        {getStatusIcon(job.status)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1.5">
                                            <h3 className="text-[17px] font-black text-[#1B1F3B]">Job #{job.id.substring(0, 8)}</h3>
                                            <span className={cn(
                                                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border",
                                                getStatusStyle(job.status)
                                            )}>
                                                {job.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-6 text-[12px] text-slate-400 font-bold uppercase tracking-widest">
                                            <span className="flex items-center gap-2">
                                                <Calendar size={14} className="text-slate-300" />
                                                {new Date(job.createdAt).toLocaleString()}
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <Database size={14} className="text-slate-300" />
                                                {job.totalItems} Produits
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 max-w-md">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-[12px] font-black text-slate-500 uppercase tracking-widest">
                                            <span>Progression</span>
                                            <span className="text-[#1B1F3B]">{job.progress}%</span>
                                        </div>
                                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 p-0.5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${job.progress}%` }}
                                                className={cn(
                                                    "h-full rounded-full shadow-sm transition-all duration-1000",
                                                    job.status === 'FAILED' ? 'bg-rose-500' : 'bg-orange-500'
                                                )}
                                            />
                                        </div>
                                        <div className="text-[11px] font-bold text-slate-400">
                                            {job.processedItems} sur {job.totalItems} produits injectés
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 lg:border-l lg:border-slate-100 lg:pl-10">
                                    {job.error && (
                                        <div className="flex items-center gap-2 text-rose-500 bg-rose-50 px-4 py-2 rounded-xl text-[11px] font-bold max-w-xs line-clamp-2">
                                            <AlertCircle size={14} />
                                            {job.error}
                                        </div>
                                    )}
                                    <Link
                                        href="/admin/products"
                                        className="flex items-center justify-center w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl hover:bg-[#1B1F3B] hover:text-white transition-all shadow-sm"
                                    >
                                        <ExternalLink size={18} />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
