'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Loader2, CheckCircle2, AlertCircle, X, Maximize2, Minimize2, Pause, Play, Square } from 'lucide-react';
import { getImportStatus, getLatestActiveJob, togglePauseImport, cancelImport, clearImportJobs } from '@/lib/actions/import-bg-actions';
import { cn } from '@/lib/utils';

export function ImportToast() {
    const [job, setJob] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    // Vérification périodique du statut
    useEffect(() => {
        let interval: NodeJS.Timeout;

        const checkStatus = async () => {
            // Si on n'a pas de job, on cherche s'il y en a un actif
            if (!job || job.status === 'COMPLETED' || job.status === 'FAILED' || job.status === 'CANCELLED') {
                const latest = await getLatestActiveJob();

                // Vérifier si le job a déjà été fermé manuellement
                const dismissed = localStorage.getItem('dismissed_job_id');
                if (latest && latest.id !== dismissed) {
                    setJob(latest);
                    setIsVisible(true);
                } else if (job && (job.status === 'COMPLETED' || job.status === 'FAILED' || job.status === 'CANCELLED')) {
                    // Garder affiché pendant quelques secondes après la fin/annulation
                    setTimeout(() => setIsVisible(false), 5000);
                }
                return;
            }

            // Rafraîchir le job actuel
            const updated = await getImportStatus(job.id);
            if (updated) {
                setJob(updated);
                if (updated.status === 'COMPLETED' || updated.status === 'FAILED') {
                    // Notification sonore ou visuelle forte ici si besoin
                }
            }
        };

        checkStatus();
        interval = setInterval(checkStatus, 3000);

        return () => clearInterval(interval);
    }, [job?.id, job?.status]);

    if (!isVisible || !job) return null;

    const isProcessing = job.status === 'PROCESSING' || job.status === 'PENDING';
    const isPaused = job.status === 'PAUSED';
    const isCompleted = job.status === 'COMPLETED';
    const isFailed = job.status === 'FAILED';
    const isCancelled = job.status === 'CANCELLED';

    const handleTogglePause = async () => {
        await togglePauseImport(job.id);
        const updated = await getImportStatus(job.id);
        if (updated) setJob(updated);
    };

    const handleCancel = async () => {
        if (confirm("Voulez-vous vraiment annuler l'importation ?")) {
            await cancelImport(job.id);
            const updated = await getImportStatus(job.id);
            if (updated) setJob(updated);
            // On le dismissed aussi pour éviter qu'il revienne au refresh
            localStorage.setItem('dismissed_job_id', job.id);
            setTimeout(() => setIsVisible(false), 2000); // Cacher après 2s
        }
    };

    const handleDismiss = () => {
        if (job) {
            localStorage.setItem('dismissed_job_id', job.id);
        }
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={cn(
                    "fixed bottom-8 right-8 z-[100] bg-white border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[32px] overflow-hidden transition-all duration-500",
                    isMinimized ? "w-16 h-16" : "w-80 md:w-96"
                )}
            >
                {isMinimized ? (
                    <button
                        onClick={() => setIsMinimized(false)}
                        className={cn(
                            "w-full h-full flex items-center justify-center text-white relative",
                            isPaused ? "bg-amber-500" : isProcessing ? "bg-orange-600" : isCompleted ? "bg-emerald-600" : "bg-rose-600"
                        )}
                    >
                        {isProcessing ? (
                            <div className="relative">
                                <Loader2 className="animate-spin" size={24} />
                                <span className="absolute -top-4 -right-4 bg-white text-orange-600 text-[10px] font-bold px-1.5 rounded-full border border-orange-100">
                                    {job.progress}%
                                </span>
                            </div>
                        ) : isPaused ? (
                            <Pause size={24} />
                        ) : isCompleted ? (
                            <CheckCircle2 size={24} />
                        ) : (
                            <AlertCircle size={24} />
                        )}
                    </button>
                ) : (
                    <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "p-2.5 rounded-xl",
                                    isPaused ? "bg-amber-50 text-amber-600" :
                                        isProcessing ? "bg-orange-50 text-orange-600" :
                                            isCompleted ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                )}>
                                    {isPaused ? <Pause size={20} /> :
                                        isProcessing ? <Database size={20} className="animate-pulse" /> :
                                            isCompleted ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                                </div>
                                <div>
                                    <h4 className="text-[14px] font-black text-slate-900 tracking-tight">
                                        {isPaused ? "Injection Suspendue" :
                                            isProcessing ? "Injection en cours..." :
                                                isCancelled ? "Importation Annulée" :
                                                    isCompleted ? "Importation Terminée" : "Erreur d'importation"}
                                    </h4>
                                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                        {job.processedItems} / {job.totalItems} Produits
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setIsMinimized(true)} className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                                    <Minimize2 size={16} />
                                </button>
                                <button onClick={handleDismiss} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-3">
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${job.progress}%` }}
                                    className={cn(
                                        "h-full transition-all duration-500",
                                        isPaused ? "bg-amber-500" :
                                            isProcessing ? "bg-orange-600" :
                                                isCompleted ? "bg-emerald-500" : "bg-rose-500"
                                    )}
                                />
                            </div>
                            <div className="flex justify-between items-center text-[11px] font-black italic">
                                <span className={cn(
                                    isPaused ? "text-amber-600" :
                                        isProcessing ? "text-orange-600" :
                                            isCompleted ? "text-emerald-600" : "text-rose-600"
                                )}>
                                    {isPaused ? 'EN PAUSE' : job.status === 'FAILED' ? 'OPÉRATION ÉCHOUÉE' : isCancelled ? 'ANNULÉE' : `${job.progress}% EFFECTUÉ`}
                                </span>
                                <span className="text-slate-300 uppercase tracking-tighter">Baraka Sync Engine</span>
                            </div>
                        </div>

                        {/* Controls */}
                        {(isProcessing || isPaused) && (
                            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-3">
                                <button
                                    onClick={handleTogglePause}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[12px] transition-all",
                                        isPaused ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-amber-50 text-amber-600 hover:bg-amber-100"
                                    )}
                                >
                                    {isPaused ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}
                                    <span>{isPaused ? "Reprendre" : "Suspendre"}</span>
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 rounded-xl font-bold text-[12px] hover:bg-rose-100 transition-all"
                                >
                                    <Square size={14} fill="currentColor" />
                                    <span>Annuler</span>
                                </button>
                            </div>
                        )}

                        {job.error && (
                            <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-[11px] text-rose-600 font-medium">
                                {job.error}
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
