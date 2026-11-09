'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Sparkles,
    Layers,
    Tag,
    AlertCircle,
    CheckCircle2,
    Clock,
    Play,
    ListFilter,
    BarChart3,
    BookOpen,
    RefreshCw,
    ShieldCheck,
    Cpu,
    Zap,
    Box,
    ArrowUpRight,
    TrendingUp,
    FileText,
    Check,
    Copy,
    Info,
    ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { getBulkEnrichmentCatalogStatsAction } from '@/lib/actions/ai-enrichment-actions';
import { BatchConfigurator } from './_components/BatchConfigurator';
import { BatchJobMonitor } from './_components/BatchJobMonitor';
import { ProposalsReviewGrid } from './_components/ProposalsReviewGrid';

export default function AiEnrichmentPage() {
    const [activeTab, setActiveTab] = useState<'configure' | 'monitor' | 'review' | 'guidelines'>('configure');
    const [stats, setStats] = useState<any | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [activeJobId, setActiveJobId] = useState<string | null>(null);
    const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        setLoadingStats(true);
        try {
            const res = await getBulkEnrichmentCatalogStatsAction();
            if (res.success && res.stats) {
                setStats(res.stats);
            }
        } catch (err: any) {
            console.error("Erreur stats IA:", err);
        } finally {
            setLoadingStats(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const handleJobStarted = (jobId: string) => {
        setActiveJobId(jobId);
        setActiveTab('monitor');
        fetchStats();
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedSnippet(id);
        toast.success("Exemple copié dans le presse-papier !");
        setTimeout(() => setCopiedSnippet(null), 2000);
    };

    // Calculate completion metrics
    const totalProducts = stats?.totalProducts || 0;
    const incompleteCount = stats?.incompleteProductsCount || 0;
    const completedCount = Math.max(0, totalProducts - incompleteCount);
    const completionRate = totalProducts > 0
        ? Math.round((completedCount / totalProducts) * 100)
        : 0;

    const toReviewCount = stats?.statusCounts?.TO_REVIEW || 0;
    const validatedCount = stats?.statusCounts?.VALIDATED || 0;

    return (
        <div className="space-y-6 pb-16 max-w-7xl mx-auto">
            {/* Page Hero Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-6 md:p-8 shadow-xl border border-emerald-500/20">
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-3 max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                                Assistant Rédactionnel Baraka
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-slate-200 border border-white/10">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                Gemini 3.6 Flash actif
                            </span>
                        </div>

                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                            Enrichissement Intelligent du Catalogue
                        </h1>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            Automatisez la rédaction des descriptions, caractéristiques clés et fiches techniques normalisées aux standards officiels Baraka Shop, avec contrôle humain garanti.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <button
                            onClick={fetchStats}
                            disabled={loadingStats}
                            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-xl text-xs font-semibold transition backdrop-blur-md flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                            title="Actualiser les statistiques"
                        >
                            <RefreshCw className={`w-4 h-4 ${loadingStats ? 'animate-spin text-emerald-400' : ''}`} />
                            <span>Actualiser</span>
                        </button>

                        <div className="px-4 py-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs font-medium text-emerald-200 backdrop-blur-md flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            <span>Brouillons isolés • Zéro publication directe</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI Cards Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Total Catalogue */}
                <div className="group bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Total Catalogue
                            </span>
                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-gray-200/70 transition">
                                <Box className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <span className="text-3xl font-black text-gray-900 tracking-tight">
                                {loadingStats ? '...' : totalProducts.toLocaleString('fr-FR')}
                            </span>
                            <span className="text-xs text-gray-400 block mt-0.5">produits référencés</span>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100">
                        <div className="flex justify-between items-center text-[11px] font-medium text-gray-500 mb-1.5">
                            <span>Complétude globale</span>
                            <span className="font-bold text-gray-800">{completionRate}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700"
                                style={{ width: `${completionRate}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Fiches Incomplètes */}
                <div className="group bg-gradient-to-br from-white to-amber-50/30 p-5 rounded-2xl border border-amber-200/80 shadow-sm hover:shadow-md hover:border-amber-300 transition-all duration-200 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
                                    À Compléter
                                </span>
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <span className="text-3xl font-black text-amber-800 tracking-tight">
                                {loadingStats ? '...' : incompleteCount.toLocaleString('fr-FR')}
                            </span>
                            <span className="text-xs text-amber-700/80 block mt-0.5 font-medium">fiches prioritaires</span>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-amber-200/50">
                        <button
                            onClick={() => setActiveTab('configure')}
                            className="w-full py-1.5 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 text-xs font-bold transition flex items-center justify-between group/btn"
                        >
                            <span>Lancer un lot d'enrichissement</span>
                            <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition" />
                        </button>
                    </div>
                </div>

                {/* 3. Propositions à vérifier */}
                <div className="group bg-gradient-to-br from-white to-blue-50/30 p-5 rounded-2xl border border-blue-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-blue-900 uppercase tracking-wider">
                                À Valider
                            </span>
                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-105 transition">
                                <Clock className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <span className="text-3xl font-black text-blue-800 tracking-tight">
                                {loadingStats ? '...' : toReviewCount.toLocaleString('fr-FR')}
                            </span>
                            <span className="text-xs text-blue-700/80 block mt-0.5 font-medium">prêtes pour relecture</span>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-blue-200/50">
                        <button
                            onClick={() => setActiveTab('review')}
                            className="w-full py-1.5 px-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-900 text-xs font-bold transition flex items-center justify-between group/btn"
                        >
                            <span>Examiner & Valider</span>
                            <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition" />
                        </button>
                    </div>
                </div>

                {/* 4. Propositions Validées */}
                <div className="group bg-gradient-to-br from-white to-emerald-50/30 p-5 rounded-2xl border border-emerald-200/80 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-200 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">
                                Fiches Validées
                            </span>
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <span className="text-3xl font-black text-emerald-800 tracking-tight">
                                {loadingStats ? '...' : validatedCount.toLocaleString('fr-FR')}
                            </span>
                            <span className="text-xs text-emerald-700/80 block mt-0.5 font-medium">injectées au catalogue</span>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-emerald-200/50 flex items-center justify-between text-xs text-emerald-800 font-semibold">
                        <span>Standard Baraka</span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            ✓ Actives
                        </span>
                    </div>
                </div>
            </div>

            {/* Elevated Segmented Navigation Tabs */}
            <div className="bg-white rounded-2xl p-1.5 border border-gray-200/80 shadow-sm flex flex-wrap items-center gap-1.5">
                <button
                    onClick={() => setActiveTab('configure')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                        activeTab === 'configure'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Lancer un lot d'enrichissement
                </button>

                <button
                    onClick={() => setActiveTab('monitor')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                        activeTab === 'monitor'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                    <BarChart3 className="w-4 h-4" />
                    Traitement & File d'attente
                    {activeJobId && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    )}
                </button>

                <button
                    onClick={() => setActiveTab('review')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                        activeTab === 'review'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                    <ListFilter className="w-4 h-4" />
                    Propositions à vérifier & Valider
                    {toReviewCount > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            activeTab === 'review'
                                ? 'bg-white text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                        }`}>
                            {toReviewCount}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => setActiveTab('guidelines')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                        activeTab === 'guidelines'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                    <BookOpen className="w-4 h-4" />
                    Standards éditoriaux Baraka
                </button>
            </div>

            {/* Tab Contents */}
            <div>
                {activeTab === 'configure' && (
                    <BatchConfigurator
                        categories={stats?.categories || []}
                        brands={stats?.brands || []}
                        incompleteCount={incompleteCount}
                        onJobStarted={handleJobStarted}
                    />
                )}

                {activeTab === 'monitor' && (
                    <BatchJobMonitor
                        activeJobId={activeJobId}
                        onJobCompleted={fetchStats}
                    />
                )}

                {activeTab === 'review' && (
                    <ProposalsReviewGrid onStatsChanged={fetchStats} />
                )}

                {activeTab === 'guidelines' && (
                    <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-6 md:p-8 space-y-8">
                        <div className="border-b border-gray-100 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2.5">
                                    <BookOpen className="w-6 h-6 text-emerald-600" />
                                    Charte Rédactionnelle & Base de Connaissances Baraka Shop
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 max-w-2xl">
                                    Ces règles sont dynamiquement injectées dans chaque prompt IA pour garantir une rigueur irréprochable, une cohérence de marque et l'absence totale d'hallucinations techniques.
                                </p>
                            </div>
                            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1.5 self-start">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                Few-Shot Dynamique Actif
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-700">
                            {/* Column 1 */}
                            <div className="space-y-6">
                                <div className="p-5 bg-gradient-to-br from-emerald-50/60 to-white rounded-2xl border border-emerald-200/70 shadow-sm space-y-3">
                                    <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-700 flex items-center justify-center">
                                            <Sparkles className="w-4 h-4" />
                                        </div>
                                        <span>Ton et Voix de Baraka Shop</span>
                                    </div>
                                    <ul className="space-y-2 list-disc list-inside text-emerald-950/90 leading-relaxed">
                                        <li><strong>Professionnel, chaleureux et orienté client sénégalais et ouest-africain.</strong></li>
                                        <li>Mise en avant des bénéfices concrets (durabilité, garantie 100% originale, tranquillité d'esprit).</li>
                                        <li>Vocabulaire soigné, phrases fluides et percutantes, sans jargon inutile.</li>
                                    </ul>
                                </div>

                                <div className="p-5 bg-gray-50/80 rounded-2xl border border-gray-200 space-y-3">
                                    <div className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-gray-600" />
                                        Les 5 Sections Éditoriales Normalisées
                                    </div>
                                    <div className="space-y-2.5 text-gray-700">
                                        <div className="p-2.5 bg-white rounded-xl border border-gray-200/60">
                                            <span className="font-bold text-gray-900 block">1. Description courte :</span>
                                            <span className="text-[11px] text-gray-500">Accroche synthétique de 1 à 2 phrases pour le haut de page.</span>
                                        </div>
                                        <div className="p-2.5 bg-white rounded-xl border border-gray-200/60">
                                            <span className="font-bold text-gray-900 block">2. Description générale :</span>
                                            <span className="text-[11px] text-gray-500">Paragraphe fluide et engageant expliquant la proposition de valeur.</span>
                                        </div>
                                        <div className="p-2.5 bg-white rounded-xl border border-gray-200/60">
                                            <span className="font-bold text-gray-900 block">3. Description classique (HTML Baraka) :</span>
                                            <span className="text-[11px] text-gray-500">Structure signature avec titres &lt;b&gt; et sauts de ligne &lt;br&gt;&lt;br&gt;.</span>
                                        </div>
                                        <div className="p-2.5 bg-white rounded-xl border border-gray-200/60">
                                            <span className="font-bold text-gray-900 block">4. Caractéristiques principales :</span>
                                            <span className="text-[11px] text-gray-500">Tableau de 6 à 10 points clés concis et percutants.</span>
                                        </div>
                                        <div className="p-2.5 bg-white rounded-xl border border-gray-200/60">
                                            <span className="font-bold text-gray-900 block">5. Fiche technique normalisée :</span>
                                            <span className="text-[11px] text-gray-500">Clés françaises standardisées avec unités physiques (W, mAh, kg, Hz).</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Column 2 */}
                            <div className="space-y-6">
                                <div className="p-5 bg-gradient-to-br from-amber-50/60 to-white rounded-2xl border border-amber-200/70 shadow-sm space-y-3">
                                    <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
                                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center">
                                            <AlertCircle className="w-4 h-4" />
                                        </div>
                                        <span>Règle d'or : Zéro Hallucination Technique</span>
                                    </div>
                                    <ul className="space-y-2 list-disc list-inside text-amber-950/90 leading-relaxed">
                                        <li>Ne <strong>JAMAIS</strong> inventer une dimension, une autonomie de batterie ou une puissance en Watts.</li>
                                        <li>Si une caractéristique est absente ou douteuse, l'IA l'omet plutôt que de risquer une désinformation.</li>
                                        <li>Préservation intégrale des références exactes du fabricant.</li>
                                    </ul>
                                </div>

                                <div className="p-5 bg-gradient-to-br from-blue-50/60 to-white rounded-2xl border border-blue-200/70 shadow-sm space-y-3">
                                    <div className="flex items-center gap-2 text-blue-950 font-bold text-sm">
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-700 flex items-center justify-center">
                                            <ShieldCheck className="w-4 h-4" />
                                        </div>
                                        <span>Protocole d'Intégrité & Workflow Sécurisé</span>
                                    </div>
                                    <ul className="space-y-2 list-disc list-inside text-blue-950/90 leading-relaxed">
                                        <li>L'IA fonctionne comme un <strong>assistant rédacteur</strong> et ne publie jamais directement en boutique.</li>
                                        <li>Toutes les propositions sont isolées dans un espace de relecture dédié.</li>
                                        <li>Validation humaine granulaire : vous choisissez précisément quels champs appliquer à la fiche finale.</li>
                                    </ul>
                                </div>

                                <div className="p-4 bg-emerald-950 text-emerald-100 rounded-2xl space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="font-mono text-[11px] text-emerald-400 font-semibold uppercase">Exemple HTML Signature Baraka</span>
                                        <button
                                            onClick={() => handleCopy("<b>Performance Professionnelle</b><br><br>Conçu pour répondre aux exigences des utilisateurs quotidiens avec une fiabilité exemplaire.", "html-sample")}
                                            className="px-2 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded text-[10px] font-medium transition flex items-center gap-1"
                                        >
                                            {copiedSnippet === 'html-sample' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                            {copiedSnippet === 'html-sample' ? 'Copié' : 'Copier'}
                                        </button>
                                    </div>
                                    <code className="font-mono text-[11px] text-emerald-200 block p-2 bg-emerald-900/60 rounded-lg">
                                        &lt;b&gt;Performance Professionnelle&lt;/b&gt;&lt;br&gt;&lt;br&gt;Conçu pour répondre aux exigences des utilisateurs quotidiens...
                                    </code>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
