'use client'

import React, { useEffect, useState, useCallback } from 'react'
import {
    Power,
    Wrench,
    Globe,
    Loader2,
    AlertTriangle,
    Shield,
    Eye,
    X,
    Check,
    Clock,
    RefreshCw,
    ExternalLink,
    ShieldAlert,
    ShieldCheck,
    Ban,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
    getSiteConfigForAdmin,
    updateSiteConfig,
    type SiteConfigData,
} from '@/lib/actions/site-config-actions'

export function SiteMaintenancePanel() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [config, setConfig] = useState<SiteConfigData>({
        maintenanceMode: false,
        maintenanceTitle: 'Site en maintenance',
        maintenanceMessage:
            'Nous effectuons des améliorations. Le site sera de retour très bientôt.',
    })
    const [showConfirm, setShowConfirm] = useState<'online' | 'maintenance' | null>(null)
    const [confirmText, setConfirmText] = useState('')
    const [showPreview, setShowPreview] = useState(false)
    const [lastChanged, setLastChanged] = useState<Date | null>(null)

    useEffect(() => {
        getSiteConfigForAdmin().then((res) => {
            if (res.success && res.config) {
                setConfig(res.config)
            }
            setLoading(false)
        })
    }, [])

    const toggleOnline = useCallback(async (goOnline: boolean) => {
        setSaving(true)
        const res = await updateSiteConfig({ maintenanceMode: !goOnline })
        if (res.success) {
            setConfig((c) => ({ ...c, maintenanceMode: !goOnline }))
            setLastChanged(new Date())
            toast.success(
                goOnline
                    ? '✅ Le site est maintenant EN LIGNE !'
                    : '🔧 Le site est passé en mode MAINTENANCE.'
            )
        } else {
            toast.error(res.error || 'Erreur lors du changement de statut')
        }
        setSaving(false)
        setShowConfirm(null)
        setConfirmText('')
    }, [])

    const handleSaveMessages = async () => {
        setSaving(true)
        const res = await updateSiteConfig({
            maintenanceTitle: config.maintenanceTitle,
            maintenanceMessage: config.maintenanceMessage,
        })
        if (res.success) {
            toast.success('Messages de maintenance enregistrés ✓')
        } else {
            toast.error(res.error || 'Erreur lors de la sauvegarde')
        }
        setSaving(false)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
                <span className="text-[11px] font-black uppercase tracking-widest">
                    Chargement…
                </span>
            </div>
        )
    }

    const isOnline = !config.maintenanceMode
    const confirmWord = showConfirm === 'maintenance' ? 'MAINTENANCE' : 'EN LIGNE'

    return (
        <div className="space-y-10">
            {/* ─── Status card ─── */}
            <div
                className={cn(
                    'rounded-3xl border-2 p-6 sm:p-8 transition-all duration-500',
                    isOnline
                        ? 'border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-emerald-50/30'
                        : 'border-amber-200 bg-gradient-to-br from-amber-50/80 to-amber-50/30'
                )}
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="relative">
                            <div
                                className={cn(
                                    'w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-all duration-500',
                                    isOnline
                                        ? 'bg-emerald-500 text-white shadow-emerald-200'
                                        : 'bg-amber-500 text-white shadow-amber-200'
                                )}
                            >
                                {isOnline ? (
                                    <Globe className="w-7 h-7" />
                                ) : (
                                    <Wrench className="w-7 h-7" />
                                )}
                            </div>
                            {/* Status dot */}
                            <div className={cn(
                                'absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white',
                                isOnline ? 'bg-emerald-400' : 'bg-amber-400'
                            )}>
                                <div className={cn(
                                    'w-full h-full rounded-full animate-ping',
                                    isOnline ? 'bg-emerald-400' : 'bg-amber-400'
                                )} />
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                Statut actuel
                            </p>
                            <h3
                                className={cn(
                                    'text-2xl font-black uppercase tracking-tight transition-colors duration-500',
                                    isOnline ? 'text-emerald-700' : 'text-amber-700'
                                )}
                            >
                                {isOnline ? 'Site en ligne' : 'Maintenance active'}
                            </h3>
                            <p className="text-sm text-slate-500 font-medium mt-2 max-w-md">
                                {isOnline
                                    ? 'Les visiteurs accèdent normalement à la boutique.'
                                    : 'Les visiteurs voient la page de maintenance. Vous (admin) y accédez toujours.'}
                            </p>
                            {lastChanged && (
                                <div className="flex items-center gap-1.5 mt-2 text-slate-400">
                                    <Clock className="w-3 h-3" />
                                    <span className="text-[10px] font-bold">
                                        Dernier changement : {lastChanged.toLocaleTimeString('fr-FR')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                        <button
                            type="button"
                            disabled={saving || isOnline}
                            onClick={() => setShowConfirm('online')}
                            className={cn(
                                'h-12 px-6 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2',
                                isOnline
                                    ? 'bg-emerald-600 text-white cursor-default opacity-80'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 hover:scale-[1.02] active:scale-[0.98]'
                            )}
                        >
                            <Power className="w-4 h-4" />
                            Mettre en ligne
                        </button>
                        <button
                            type="button"
                            disabled={saving || !isOnline}
                            onClick={() => setShowConfirm('maintenance')}
                            className={cn(
                                'h-12 px-6 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2',
                                !isOnline
                                    ? 'bg-amber-500 text-white cursor-default opacity-80'
                                    : 'bg-slate-900 text-white hover:bg-amber-600 hover:scale-[1.02] active:scale-[0.98]'
                            )}
                        >
                            <Wrench className="w-4 h-4" />
                            Mode maintenance
                        </button>
                    </div>
                </div>
            </div>

            {/* ─── Confirmation Dialog ─── */}
            {showConfirm && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className={cn(
                            'p-6 sm:p-8 text-center',
                            showConfirm === 'maintenance'
                                ? 'bg-gradient-to-br from-amber-50 to-amber-100/50'
                                : 'bg-gradient-to-br from-emerald-50 to-emerald-100/50'
                        )}>
                            <div className={cn(
                                'w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center',
                                showConfirm === 'maintenance'
                                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-200'
                                    : 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                            )}>
                                {showConfirm === 'maintenance' ? (
                                    <ShieldAlert className="w-8 h-8" />
                                ) : (
                                    <ShieldCheck className="w-8 h-8" />
                                )}
                            </div>
                            <h3 className="text-xl font-black text-slate-900">
                                {showConfirm === 'maintenance'
                                    ? 'Activer la maintenance ?'
                                    : 'Remettre le site en ligne ?'}
                            </h3>
                            <p className="text-sm text-slate-500 font-medium mt-2">
                                {showConfirm === 'maintenance'
                                    ? 'Tous les visiteurs seront redirigés vers la page de maintenance. Seuls les administrateurs pourront accéder au site.'
                                    : 'Le site sera à nouveau accessible à tous les visiteurs.'}
                            </p>
                        </div>

                        {/* Confirmation input */}
                        <div className="p-6 sm:p-8 space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    Tapez <span className={cn(
                                        'font-black px-2 py-0.5 rounded text-[11px]',
                                        showConfirm === 'maintenance'
                                            ? 'bg-amber-100 text-amber-700'
                                            : 'bg-emerald-100 text-emerald-700'
                                    )}>{confirmWord}</span> pour confirmer
                                </label>
                                <input
                                    type="text"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                                    placeholder={confirmWord}
                                    autoFocus
                                    className="w-full h-12 px-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-center text-lg font-black text-slate-900 uppercase tracking-widest outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                                />
                            </div>

                            {showConfirm === 'maintenance' && (
                                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
                                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <p className="text-[11px] font-medium leading-relaxed">
                                        <strong>Attention :</strong> Les commandes en cours ne seront pas affectées,
                                        mais aucun nouveau client ne pourra passer commande pendant la maintenance.
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowConfirm(null)
                                        setConfirmText('')
                                    }}
                                    className="flex-1 h-12 px-4 rounded-xl font-black text-[11px] uppercase tracking-widest border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    disabled={confirmText !== confirmWord || saving}
                                    onClick={() => toggleOnline(showConfirm === 'online')}
                                    className={cn(
                                        'flex-1 h-12 px-4 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed',
                                        showConfirm === 'maintenance'
                                            ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-200'
                                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200'
                                    )}
                                >
                                    {saving ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Check className="w-4 h-4" />
                                    )}
                                    {saving ? 'En cours...' : 'Confirmer'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Maintenance active warning ─── */}
            {!isOnline && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-100/80 border border-amber-200 text-amber-800">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-xs font-bold">Le site public est inaccessible</p>
                        <p className="text-xs font-medium leading-relaxed opacity-80">
                            Pensez à le remettre en ligne une fois vos corrections terminées.
                            Les administrateurs continuent d&apos;avoir accès à toutes les pages.
                        </p>
                    </div>
                </div>
            )}

            {/* ─── Security info ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-start gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Shield className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-slate-700">Accès admin</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">Toujours accessible</p>
                    </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <RefreshCw className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-slate-700">Auto-refresh</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">Visiteurs avertis</p>
                    </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                    <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                        <Ban className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-slate-700">API protégées</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">Routes bloquées</p>
                    </div>
                </div>
            </div>

            {/* ─── Custom messages ─── */}
            <div className="space-y-6 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                        Messages de la page maintenance
                    </h4>
                    <button
                        type="button"
                        onClick={() => setShowPreview(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                    >
                        <Eye className="w-3 h-3" />
                        Aperçu
                    </button>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">
                        Titre
                    </label>
                    <input
                        type="text"
                        value={config.maintenanceTitle}
                        onChange={(e) =>
                            setConfig((c) => ({ ...c, maintenanceTitle: e.target.value }))
                        }
                        className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">
                        Message
                    </label>
                    <textarea
                        value={config.maintenanceMessage}
                        onChange={(e) =>
                            setConfig((c) => ({ ...c, maintenanceMessage: e.target.value }))
                        }
                        rows={4}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 resize-none"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleSaveMessages}
                        disabled={saving}
                        className="h-11 px-6 bg-slate-900 text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-orange-600 transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Enregistrement…' : 'Enregistrer les messages'}
                    </button>
                    {!isOnline && (
                        <a
                            href="/maintenance"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 h-11 px-4 text-[11px] font-black text-slate-500 uppercase tracking-widest border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Voir la page
                        </a>
                    )}
                </div>
            </div>

            {/* ─── Preview modal ─── */}
            {showPreview && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
                    <div className="relative w-full max-w-2xl bg-[#0A0E1A] rounded-3xl shadow-2xl overflow-hidden border border-white/10">
                        {/* Close */}
                        <button
                            onClick={() => setShowPreview(false)}
                            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-xl bg-white/10 text-white/60 hover:text-white hover:bg-white/20 flex items-center justify-center transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Preview content */}
                        <div className="p-8 sm:p-12 text-center relative overflow-hidden">
                            {/* BG effects */}
                            <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-orange-600/10 blur-[100px] rounded-full" />
                            <div className="absolute bottom-[-30%] left-[-15%] w-[250px] h-[250px] bg-orange-500/5 blur-[80px] rounded-full" />

                            <div className="relative z-10">
                                {/* Icon */}
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-600/30">
                                    <Wrench className="w-8 h-8 text-white" />
                                </div>

                                {/* Brand */}
                                <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] mb-4">
                                    Baraka Shop
                                </p>

                                {/* Title */}
                                <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-3 leading-tight">
                                    {config.maintenanceTitle}
                                </h2>

                                {/* Message */}
                                <p className="text-gray-400 text-sm font-medium leading-relaxed mb-6 max-w-sm mx-auto">
                                    {config.maintenanceMessage}
                                </p>

                                {/* Fake progress */}
                                <div className="max-w-[200px] mx-auto">
                                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full w-[60%] rounded-full bg-gradient-to-r from-orange-600 to-orange-500" />
                                    </div>
                                </div>

                                {/* Label */}
                                <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-6">
                                    Aperçu de la page de maintenance
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
