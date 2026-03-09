'use client';

import React, { useState, useEffect } from 'react';
import {
    Image as ImageIcon,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Download,
    Trash2,
    Eye,
    LayoutGrid,
    List,
    FileText,
    FolderPlus,
    Maximize2,
    CheckCircle2,
    CloudUpload,
    Calendar,
    Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    syncMediaAction,
    getMediaItems,
    startMediaMatchingJob,
    getMediaJobStatus,
    getLatestMediaJob,
    uploadToCloudinaryAction
} from '@/lib/actions/media-actions';
import { Loader2, Zap } from 'lucide-react';
import { toast } from 'sonner';

const mockMedia = [
    { id: '1', name: 'abaya_royal_silk_v1.jpg', size: '1.2 MB', date: '25 Fév 2026', type: 'image', dimensions: '1200x1800' },
    { id: '2', name: 'catalog_winter_26.pdf', size: '4.5 MB', date: '24 Fév 2026', type: 'file', dimensions: '-' },
    { id: '3', name: 'lifestyle_dakar_shoot_01.jpg', size: '2.8 MB', date: '22 Fév 2026', type: 'image', dimensions: '2400x3600' },
    { id: '4', name: 'product_video_demo.mp4', size: '12.4 MB', date: '20 Fév 2026', type: 'image', dimensions: '1080p' },
    { id: '5', name: 'logo_baraka_official.svg', size: '45 KB', date: '15 Fév 2026', type: 'image', dimensions: 'Vector' },
    { id: '6', name: 'banner_promo_march.jpg', size: '3.1 MB', date: '10 Fév 2026', type: 'image', dimensions: '1920x1080' },
];

export default function MediaPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [mediaItems, setMediaItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [matchingJob, setMatchingJob] = useState<any>(null);
    const [isStartingJob, setIsStartingJob] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const loadMedia = async () => {
        setLoading(true);
        const items = await getMediaItems();
        setMediaItems(items || []);
        setLoading(false);
    };

    const checkJobStatus = async () => {
        const latest = await getLatestMediaJob();
        if (latest) {
            setMatchingJob(latest);
            if (latest.status === 'PROCESSING') {
                const interval = setInterval(async () => {
                    const status = await getMediaJobStatus(latest.id);
                    if (!status || status.status !== 'PROCESSING') {
                        clearInterval(interval);
                        loadMedia(); // Refresh items after matching if needed (though they shouldn't change, products do)
                    }
                    setMatchingJob(status);
                }, 2000);
                return () => clearInterval(interval);
            }
        }
    };

    useEffect(() => {
        loadMedia();
        checkJobStatus();
    }, []);

    const handleStartMatching = async () => {
        setIsStartingJob(true);
        const res = await startMediaMatchingJob();
        if (res.success && res.jobId) {
            const status = await getMediaJobStatus(res.jobId);
            setMatchingJob(status);
            checkJobStatus();
            toast.info('🤖 Matching IA lancé ! Analyse en cours...', { icon: false });
        } else {
            toast.error('Impossible de démarrer le matching.');
        }
        setIsStartingJob(false);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const filesArray = Array.from(files);
        let successCount = 0;
        let errorCount = 0;

        try {
            for (const file of filesArray) {
                const formData = new FormData();
                formData.append('file', file);

                const res = await uploadToCloudinaryAction(formData);
                if (res.success && res.media) {
                    setMediaItems(prev => [res.media, ...prev]);
                    successCount++;
                } else {
                    errorCount++;
                    toast.error(`❌ Erreur : ${file.name}`, {
                        duration: 6000,
                    });
                }
            }

            if (successCount > 0) {
                toast.success(`✅ ${successCount} fichier${successCount > 1 ? 's' : ''} envoyé${successCount > 1 ? 's' : ''} avec succès !`);
            }
        } catch (err) {
            toast.error("Erreur critique lors de l'envoi des fichiers.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-12 pb-20" suppressHydrationWarning>
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-2 border-b border-slate-200/40" suppressHydrationWarning>
                <div className="space-y-1.5" suppressHydrationWarning>
                    <h1 className="text-[36px] font-bold text-slate-900 tracking-tight leading-tight">
                        Médiathèque <span className="text-orange-600">Assets.</span>
                    </h1>
                    <p className="text-[15px] text-slate-500 font-medium">
                        Centralisez et organisez toutes vos ressources visuelles et documents.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleStartMatching}
                        disabled={isStartingJob || matchingJob?.status === 'PROCESSING'}
                        className="flex items-center gap-2.5 px-5 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 font-bold text-[13px] hover:bg-amber-100 transition-all shadow-sm disabled:opacity-50"
                    >
                        {isStartingJob || matchingJob?.status === 'PROCESSING' ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Zap size={18} fill="currentColor" />
                        )}
                        <span>{matchingJob?.status === 'PROCESSING' ? 'Matching en cours...' : 'Lancer le Matching'}</span>
                    </button>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        multiple
                        className="hidden"
                        accept="image/*,video/*,.pdf"
                    />

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-3 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold text-[13px] hover:bg-orange-700 hover:shadow-xl hover:shadow-orange-200 transition-all shadow-lg shadow-orange-100 group disabled:opacity-50"
                    >
                        {isUploading ? <Loader2 size={18} className="animate-spin" /> : <CloudUpload size={18} />}
                        <span>{isUploading ? 'Envoi...' : 'Téléverser'}</span>
                    </button>
                </div>
            </div>

            {/* Matching Job Status Banner */}
            {matchingJob && matchingJob.status === 'PROCESSING' && (
                <div className="bg-amber-50 border border-amber-100 rounded-[32px] p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
                    <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-200 animate-pulse">
                        <Zap size={32} fill="currentColor" />
                    </div>
                    <div className="flex-1 space-y-3 w-full">
                        <div className="flex justify-between items-end">
                            <div>
                                <h4 className="text-[16px] font-black text-amber-900 tracking-tight">Intelligence Artificielle de Matching en cours...</h4>
                                <p className="text-[12px] text-amber-600 font-bold uppercase tracking-widest mt-0.5">
                                    Analyse : {matchingJob.processedItems} / {matchingJob.totalItems} Produits — <span className="text-emerald-600">{matchingJob.matchedCount} Associés</span>
                                </p>
                            </div>
                            <span className="text-[13px] font-black text-amber-900 italic">{matchingJob.progress}%</span>
                        </div>
                        <div className="h-2 w-full bg-amber-200/50 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${matchingJob.progress}%` }}
                                className="h-full bg-amber-500 rounded-full"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Storage Insight */}
            <div className="bg-white p-8 rounded-[32px] border border-slate-200/50 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] flex flex-col md:flex-row items-center gap-10">
                <div className="flex-1 space-y-4 w-full">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">UTILISATION STOCKAGE</p>
                            <h4 className="text-[20px] font-black text-slate-900">12.4 GB <span className="text-slate-300">/ 50 GB</span></h4>
                        </div>
                        <span className="text-[13px] font-bold text-orange-600">25% utilisé</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                        <div className="h-full bg-orange-600 w-1/4 rounded-full" />
                        <div className="h-full bg-violet-400 w-1/6 ml-0.5 rounded-full" />
                        <div className="h-full bg-emerald-400 w-[5%] ml-0.5 rounded-full" />
                    </div>
                    <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-600" /> Images</div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-violet-400" /> Vidéos</div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400" /> Documents</div>
                    </div>
                </div>
                <div className="h-16 w-px bg-slate-100 hidden md:block" />
                <div className="flex gap-6">
                    <button className="flex flex-col items-center gap-2 group">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-600 transition-all border border-transparent group-hover:border-orange-100">
                            <Settings size={20} />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gérer</span>
                    </button>
                </div>
            </div>

            {/* Browser Controls */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="relative flex-1 w-full max-w-xl group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-orange-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher par nom de fichier, tag ou type..."
                        className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all shadow-sm placeholder:text-slate-400"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-100/60 p-1 rounded-xl border border-slate-200/40">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                "p-2 px-4 rounded-lg transition-all",
                                viewMode === 'grid' ? "bg-white text-orange-600 shadow-sm border border-slate-200/60" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn(
                                "p-2 px-4 rounded-lg transition-all",
                                viewMode === 'list' ? "bg-white text-orange-600 shadow-sm border border-slate-200/60" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Media Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 flex flex-col items-center gap-4 text-slate-300">
                        <Loader2 className="animate-spin" size={40} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Chargement des assets...</span>
                    </div>
                ) : mediaItems.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-slate-300 border-2 border-dashed border-slate-100 rounded-[32px]">
                        <p className="text-[12px] font-bold uppercase tracking-widest">Aucun asset dans votre médiathèque</p>
                    </div>
                ) : (
                    mediaItems.map((item, i) => (
                        <motion.div
                            key={item.id}
                            whileHover={{ y: -6, boxShadow: "0 25px 40px -20px rgba(0,0,0,0.06)" }}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.02 }}
                            className="bg-white rounded-[24px] border border-slate-200/60 shadow-sm group overflow-hidden relative active:scale-95 transition-all"
                        >
                            <div className="aspect-square bg-slate-50 relative overflow-hidden flex items-center justify-center">
                                {item.type === 'image' || item.format === 'jpg' || item.format === 'png' || item.format === 'webp' ? (
                                    <div className="w-full h-full relative group-hover:scale-110 transition-transform duration-700">
                                        <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-orange-600 shadow-lg group-hover:rotate-12 transition-transform duration-500">
                                        <FileText size={32} />
                                    </div>
                                )}

                                {/* Hover Actions Bar */}
                                <div className="absolute inset-0 bg-orange-900/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white text-slate-900 flex items-center justify-center hover:bg-slate-100 transition-all">
                                        <Eye size={18} />
                                    </a>
                                </div>
                            </div>

                            <div className="p-4 space-y-1">
                                <p className="text-[13px] font-bold text-slate-900 truncate tracking-tight">{item.name}</p>
                                <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <span>{(item.size / 1024 / 1024).toFixed(1)} MB</span>
                                    <span>{item.format}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}

                {/* Manual Upload Trigger */}
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="aspect-square border-2 border-dashed border-slate-200 rounded-[24px] flex flex-col items-center justify-center gap-4 group hover:border-orange-300 hover:bg-orange-50/20 transition-all duration-500 disabled:opacity-50"
                >
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-100 border border-slate-200 group-hover:scale-110 group-hover:rotate-12 transition-all">
                        {isUploading ? (
                            <Loader2 size={32} className="text-orange-600 animate-spin" />
                        ) : (
                            <Plus size={32} className="text-slate-400 group-hover:text-orange-600 transition-colors" />
                        )}
                    </div>
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                        {isUploading ? 'Chargement...' : 'Ajouter Asset'}
                    </span>
                </button>
            </div>

            {/* Action Bar for Selected Items (Mockup) */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 px-8 py-3 bg-[#0F172A] rounded-full border border-white/10 shadow-2xl z-50 flex items-center gap-6 text-white scale-0 hover:scale-100 transition-transform">
                <span className="text-[12px] font-bold">3 assets sélectionnés</span>
                <div className="w-px h-6 bg-white/10" />
                <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-all"><Download size={16} /></button>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-all"><Maximize2 size={16} /></button>
                    <button className="p-2 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-all"><Trash2 size={16} /></button>
                </div>
            </div>
        </div>
    );
}
