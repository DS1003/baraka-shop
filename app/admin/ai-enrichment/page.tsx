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
    Box
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

    return (
        <div className="space-y-6 pb-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                                Enrichissement IA du Catalogue
                            </h1>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Automatisation rédactionnelle, standardisation éditoriale et fiches techniques Baraka Shop
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchStats}
                        className="p-2.5 bg-white border border-gray-200 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition shadow-sm"
                        title="Rafraîchir les statistiques"
                    >
                        <RefreshCw className={`w-4 h-4 ${loadingStats ? 'animate-spin text-emerald-600' : ''}`} />
                    </button>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Sécurité active : 0 publication automatique
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-xs font-medium text-gray-500 block">Total Catalogue</span>
                        <span className="text-2xl font-extrabold text-gray-900 mt-1 block">
                            {loadingStats ? '-' : stats?.totalProducts?.toLocaleString('fr-FR') || 0}
                        </span>
                        <span className="text-[11px] text-gray-400 mt-0.5 block">Produits référencés</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700">
                        <Box className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-white to-amber-50/20 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-xs font-medium text-amber-800 block">Fiches Incomplètes</span>
                        <span className="text-2xl font-extrabold text-amber-700 mt-1 block">
                            {loadingStats ? '-' : stats?.incompleteProductsCount?.toLocaleString('fr-FR') || 0}
                        </span>
                        <span className="text-[11px] text-amber-700/80 mt-0.5 block">À enrichir d'urgence</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-blue-200/80 bg-gradient-to-br from-white to-blue-50/20 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-xs font-medium text-blue-800 block">Propositions à vérifier</span>
                        <span className="text-2xl font-extrabold text-blue-700 mt-1 block">
                            {loadingStats ? '-' : stats?.statusCounts?.TO_REVIEW?.toLocaleString('fr-FR') || 0}
                        </span>
                        <span className="text-[11px] text-blue-700/80 mt-0.5 block">Prêtes pour relecture</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                        <Clock className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-white to-emerald-50/20 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-xs font-medium text-emerald-800 block">Propositions Validées</span>
                        <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">
                            {loadingStats ? '-' : stats?.statusCounts?.VALIDATED?.toLocaleString('fr-FR') || 0}
                        </span>
                        <span className="text-[11px] text-emerald-700/80 mt-0.5 block">Injectées aux fiches</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 bg-white rounded-2xl p-1.5 shadow-sm flex flex-wrap items-center gap-2">
                <button
                    onClick={() => setActiveTab('configure')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                        activeTab === 'configure'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Lancer un lot d'enrichissement
                </button>

                <button
                    onClick={() => setActiveTab('monitor')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                        activeTab === 'monitor'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                    <BarChart3 className="w-4 h-4" />
                    Traitement & File d'attente
                </button>

                <button
                    onClick={() => setActiveTab('review')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                        activeTab === 'review'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                    <ListFilter className="w-4 h-4" />
                    Propositions à vérifier & Valider
                    {stats?.statusCounts?.TO_REVIEW > 0 && (
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                            activeTab === 'review' ? 'bg-white text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                            {stats.statusCounts.TO_REVIEW}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => setActiveTab('guidelines')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                        activeTab === 'guidelines'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                    <BookOpen className="w-4 h-4" />
                    Standards éditoriaux Baraka
                </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'configure' && (
                <BatchConfigurator
                    categories={stats?.categories || []}
                    brands={stats?.brands || []}
                    incompleteCount={stats?.incompleteProductsCount || 0}
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
                <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 space-y-6">
                    <div className="border-b border-gray-100 pb-4">
                        <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-emerald-600" />
                            Base de connaissances et charte rédactionnelle Baraka Shop
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            L'IA s'appuie dynamiquement sur ces règles pour chaque produit généré afin de garantir l'authenticité, la cohérence stylistique et l'absence totale d'hallucination.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-700">
                        {/* Rules column 1 */}
                        <div className="space-y-4">
                            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/60">
                                <h4 className="font-bold text-emerald-950 mb-2 flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4 text-emerald-600" />
                                    Ton et Voix de Baraka Shop
                                </h4>
                                <ul className="space-y-1.5 list-disc list-inside text-emerald-900">
                                    <li><strong>Professionnel, chaleureux et orienté client sénégalais et ouest-africain.</strong></li>
                                    <li>Mise en avant des bénéfices concrets (durabilité, qualité originale garantie, tranquillité d'esprit).</li>
                                    <li>Vocabulaire soigné, phrases fluides et percutantes, sans jargon inutile.</li>
                                </ul>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <h4 className="font-bold text-gray-900 mb-2">
                                    Les 5 champs éditoriaux et leurs rôles stricts
                                </h4>
                                <div className="space-y-2">
                                    <div>
                                        <span className="font-semibold text-gray-900">1. Description courte :</span>
                                        <p className="text-gray-600 text-[11px]">Accroche percutante de 1 à 2 phrases résumant l'usage majeur et le positionnement du produit.</p>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-900">2. Description générale :</span>
                                        <p className="text-gray-600 text-[11px]">Paragraphe fluide et engageant décrivant l'expérience d'utilisation.</p>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-900">3. Description classique (HTML) :</span>
                                        <p className="text-gray-600 text-[11px]">Format signature Baraka avec titres en gras &lt;b&gt; et espacements aérés &lt;br&gt;&lt;br&gt;.</p>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-900">4. Caractéristiques principales :</span>
                                        <p className="text-gray-600 text-[11px]">4 à 6 points clés concis affichés en puces vertes sur la fiche produit.</p>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-900">5. Fiche technique normalisée :</span>
                                        <p className="text-gray-600 text-[11px]">Dictionnaire Clé/Valeur sans répétitions avec unités physiques normalisées (mAh, W, kg, cm, Go, Hz).</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rules column 2 */}
                        <div className="space-y-4">
                            <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/60">
                                <h4 className="font-bold text-amber-950 mb-2 flex items-center gap-1.5">
                                    <AlertCircle className="w-4 h-4 text-amber-600" />
                                    Règle d'or : Zéro Hallucination Technique
                                </h4>
                                <ul className="space-y-1.5 list-disc list-inside text-amber-900">
                                    <li>Ne <strong>JAMAIS</strong> inventer une dimension, une compatibilité, une autonomie de batterie ou une puissance en Watts.</li>
                                    <li>Si une caractéristique est absente des données d'origine et incertaine, l'IA l'omet plutôt que de risquer une information erronée pour le client.</li>
                                    <li>Préservation intégrale des références constructeurs et modèles exacts.</li>
                                </ul>
                            </div>

                            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200/60">
                                <h4 className="font-bold text-blue-950 mb-2 flex items-center gap-1.5">
                                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                                    Protocole d'Intégrité & Validation Humaine
                                </h4>
                                <ul className="space-y-1.5 list-disc list-inside text-blue-900">
                                    <li>L'IA fonctionne comme un <strong>assistant rédacteur</strong> et ne publie jamais directement en boutique.</li>
                                    <li>Toutes les propositions restent isolées dans la table <code>ProductAiProposal</code> jusqu'à validation explicite.</li>
                                    <li>Les prix, stocks, catégories et galeries d'images restent sous le contrôle strict des collaborateurs.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
