'use client'

import { useState, useEffect, useRef } from 'react'
import { Server, Settings, RotateCw, History, CheckCircle2, XCircle, AlertCircle, Clock, Play, Terminal, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export default function FtpSyncPage() {
    const [config, setConfig] = useState<any>(null)
    const [history, setHistory] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isSyncing, setIsSyncing] = useState(false)
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
    const [syncProgress, setSyncProgress] = useState(0)
    const [syncStep, setSyncStep] = useState('')
    const [syncLogs, setSyncLogs] = useState<{time: string, message: string, type: 'info' | 'success' | 'error'}[]>([])
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const lastStepRef = useRef('')
    const logsEndRef = useRef<HTMLDivElement | null>(null)
    const [newTime, setNewTime] = useState('12:00')

    const SYNC_STEPS = [
        { at: 5,  label: 'Connexion au serveur FTP...' },
        { at: 15, label: 'Téléchargement du fichier Excel...' },
        { at: 35, label: 'Analyse des produits...' },
        { at: 60, label: 'Mise à jour des prix et stocks...' },
        { at: 85, label: 'Finalisation...' },
    ]

    const now = () => new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

    const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
        setSyncLogs(prev => [...prev, { time: now(), message, type }])
    }

    useEffect(() => {
        if (logsEndRef.current && logsEndRef.current.parentElement) {
            logsEndRef.current.parentElement.scrollTop = logsEndRef.current.parentElement.scrollHeight
        }
    }, [syncLogs])

    const startProgressSimulation = () => {
        setSyncProgress(0)
        setSyncLogs([])
        lastStepRef.current = ''
        setSyncStep(SYNC_STEPS[0].label)
        addLog('Démarrage de la synchronisation FTP...')
        let current = 0
        progressIntervalRef.current = setInterval(() => {
            current += Math.random() * 3 + 0.5
            if (current > 95) current = 95
            setSyncProgress(Math.round(current))
            const step = [...SYNC_STEPS].reverse().find(s => current >= s.at)
            if (step && step.label !== lastStepRef.current) {
                lastStepRef.current = step.label
                setSyncStep(step.label)
                setSyncLogs(prev => [...prev, { time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }), message: step.label, type: 'info' }])
            }
        }, 400)
    }

    const stopProgressSimulation = (success: boolean) => {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
        setSyncProgress(100)
        setSyncStep(success ? 'Synchronisation terminée !' : 'Échec de la synchronisation')
    }

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [configRes, historyRes] = await Promise.all([
                fetch('/api/admin/sync/config'),
                fetch('/api/admin/sync/history')
            ])
            const configData = await configRes.json()
            const historyData = await historyRes.json()
            
            // Set default schedules if empty
            if (!configData.scheduleTimes || configData.scheduleTimes.length === 0) {
                configData.scheduleTimes = ["00:00", "12:00"]
            }
            
            setConfig(configData)
            setHistory(historyData)
        } catch (error) {
            toast.error("Erreur lors du chargement des données")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSaveConfig = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            const res = await fetch('/api/admin/sync/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            })
            if (!res.ok) throw new Error("Erreur de sauvegarde")
            toast.success("Configuration sauvegardée avec succès")
        } catch (error: any) {
            toast.error(error.message || "Erreur de sauvegarde")
        } finally {
            setIsSaving(false)
        }
    }

    const handleManualSync = async () => {
        setIsConfirmModalOpen(false)
        setIsSyncing(true)
        startProgressSimulation()
        try {
            const res = await fetch('/api/admin/sync/run', { method: 'POST' })
            
            let data;
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await res.json();
            } else {
                const text = await res.text();
                console.error("Non-JSON response:", text);
                let errorMessage = `Erreur serveur (${res.status}): Réponse invalide.`;
                if (res.status === 504) {
                    errorMessage = "Délai d'attente dépassé (Timeout). L'opération prend trop de temps pour ce serveur.";
                } else if (text.includes('<!DOCTYPE') || text.includes('<html')) {
                    errorMessage = `Erreur système (${res.status}): Le serveur a renvoyé une page HTML au lieu de JSON (possible timeout ou erreur de configuration).`;
                }
                throw new Error(errorMessage);
            }
            
            if (!res.ok) throw new Error(data.error || "Erreur inconnue")
            
            stopProgressSimulation(true)
            addLog(`✅ ${data.productsUpdatedCount} produit(s) mis à jour avec succès`, 'success')
            if (data.productsUpdatedCount === 0) {
                addLog('ℹ️ Aucun produit correspondant trouvé dans la base de données', 'info')
            }
            addLog('Synchronisation terminée sans erreur.', 'success')
            toast.success(`Synchronisation réussie ! ${data.productsUpdatedCount} produit(s) mis à jour.`)
            fetchData()
        } catch (error: any) {
            stopProgressSimulation(false)
            addLog(`❌ Erreur : ${error.message}`, 'error')
            addLog('La synchronisation a échoué. Vérifiez vos paramètres de connexion FTP.', 'error')
            toast.error(error.message || "La synchronisation a échoué")
            fetchData()
        } finally {
            setIsSyncing(false)
        }
    }

    if (isLoading) {
        return (
            <div className="h-[400px] flex flex-col items-center justify-center text-slate-400 gap-4">
                <Loader2 className="animate-spin text-orange-600" size={32} />
                <p className="font-bold uppercase tracking-widest text-[10px]">Chargement de la configuration...</p>
            </div>
        )
    }

    const lastSuccess = history.find(h => h.status === 'SUCCESS')

    return (
        <div className="space-y-12 pb-20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-2 border-b border-slate-200/40">
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                        Synchronisation <span className="text-orange-600 italic font-serif">FTP.</span>
                    </h1>
                    <p className="text-[15px] text-slate-500 font-medium font-serif italic">
                        Importez et mettez à jour automatiquement vos produits depuis votre serveur distant.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Column - Config & Quick Actions */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Quick Sync Card */}
                    <div className="bg-white rounded-2xl border border-slate-200/50 shadow-sm p-8 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-orange-50 rounded-bl-full -mr-20 -mt-20 pointer-events-none transition-transform group-hover:scale-110" />
                        
                        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between">
                            <div className="flex-1">
                                <h2 className="text-[18px] font-bold text-slate-900 tracking-tight flex items-center gap-2 mb-2">
                                    <Play className="w-5 h-5 text-orange-600" fill="currentColor" />
                                    Synchronisation Manuelle
                                </h2>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    Dernière synchro réussie : <span className="font-semibold text-slate-700">
                                        {lastSuccess ? new Date(lastSuccess.startedAt).toLocaleString('fr-FR') : 'Aucune'}
                                    </span>
                                </p>
                            </div>
                            <button
                                onClick={() => setIsConfirmModalOpen(true)}
                                disabled={isSyncing || !config?.isActive}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-[13px] transition-all shadow-lg shrink-0",
                                    isSyncing || !config?.isActive 
                                        ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" 
                                        : "bg-[#1B1F3B] text-white hover:bg-orange-600 hover:shadow-orange-100/50"
                                )}
                            >
                                {isSyncing ? (
                                    <>
                                        <RotateCw className="w-4 h-4 animate-spin" />
                                        Synchronisation en cours...
                                    </>
                                ) : (
                                    <>
                                        <RotateCw className="w-4 h-4 transition-transform duration-500 group-hover:rotate-180" />
                                        Mettre à jour maintenant
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <AnimatePresence>
                            {(isSyncing || syncProgress > 0) && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="relative z-10 overflow-hidden"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[12px] font-bold text-slate-600 flex items-center gap-2">
                                            {syncProgress < 100 && <RotateCw className="w-3 h-3 animate-spin text-orange-600" />}
                                            {syncProgress >= 100 && syncStep.includes('terminée') && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                                            {syncProgress >= 100 && syncStep.includes('Échec') && <XCircle className="w-3.5 h-3.5 text-red-600" />}
                                            {syncStep}
                                        </span>
                                        <span className="text-[12px] font-black text-orange-600 tabular-nums">{syncProgress}%</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            className={cn(
                                                "h-full rounded-full transition-colors duration-300",
                                                syncProgress >= 100 && syncStep.includes('terminée') ? 'bg-emerald-500' :
                                                syncProgress >= 100 && syncStep.includes('Échec') ? 'bg-red-500' :
                                                'bg-gradient-to-r from-orange-500 to-orange-600'
                                            )}
                                            initial={{ width: '0%' }}
                                            animate={{ width: `${syncProgress}%` }}
                                            transition={{ duration: 0.4, ease: 'easeOut' }}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Live Logs Console */}
                        <AnimatePresence>
                            {syncLogs.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="relative z-10"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Terminal className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Journal de synchronisation</span>
                                    </div>
                                    <div className="bg-slate-900 rounded-xl p-4 max-h-[180px] overflow-y-auto custom-scrollbar">
                                        {syncLogs.map((log, i) => (
                                            <div key={i} className="flex items-start gap-3 py-1 first:pt-0 last:pb-0">
                                                <span className="text-[10px] font-mono text-slate-500 shrink-0 pt-0.5">{log.time}</span>
                                                <span className={cn(
                                                    "text-[12px] font-medium leading-relaxed",
                                                    log.type === 'success' ? 'text-emerald-400' :
                                                    log.type === 'error' ? 'text-red-400' :
                                                    'text-slate-300'
                                                )}>{log.message}</span>
                                            </div>
                                        ))}
                                        <div ref={logsEndRef} />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Configuration Form */}
                    <div className="bg-white rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden">
                        <div className="px-8 py-5 border-b border-slate-50 flex items-center gap-3 bg-slate-50/30">
                            <Settings className="w-5 h-5 text-slate-400" />
                            <h2 className="text-[16px] font-bold text-slate-900 tracking-tight">Paramètres de connexion</h2>
                        </div>
                        <form onSubmit={handleSaveConfig} className="p-8 space-y-6">
                            
                            <div className="flex items-center gap-4 p-5 rounded-xl bg-slate-50/50 border border-slate-100">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer"
                                        checked={config?.isActive || false}
                                        onChange={e => setConfig({...config, isActive: e.target.checked})}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                                </label>
                                <div>
                                    <span className="text-[13px] font-bold text-slate-900 block">Activer le module FTP</span>
                                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">Permet les requêtes manuelles et automatiques</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Serveur (Hôte)</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all text-[14px] font-bold text-slate-900"
                                        placeholder="ex: rs5.cloudlws.com"
                                        value={config?.ftpServer || ''}
                                        onChange={e => setConfig({...config, ftpServer: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chemin du dossier</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all text-[14px] font-bold text-slate-900"
                                        placeholder="/files/BARAKA/"
                                        value={config?.ftpPath || ''}
                                        onChange={e => setConfig({...config, ftpPath: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Utilisateur</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all text-[14px] font-bold text-slate-900"
                                        value={config?.ftpUser || ''}
                                        onChange={e => setConfig({...config, ftpUser: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mot de passe</label>
                                    <input 
                                        type="password" 
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all text-[14px] font-bold text-slate-900"
                                        value={config?.ftpPassword || ''}
                                        onChange={e => setConfig({...config, ftpPassword: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                        <Clock className="w-3 h-3" /> Planification (Heures de synchronisation automatique)
                                    </label>
                                    
                                    <div className="flex flex-wrap gap-2">
                                        {config?.scheduleTimes?.map((time: string) => (
                                            <div key={time} className="flex items-center gap-2 bg-orange-50 border border-orange-200/60 text-orange-700 px-3 py-1.5 rounded-lg text-[13px] font-bold shadow-sm">
                                                <span>{time}</span>
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        const times = config.scheduleTimes.filter((t: string) => t !== time)
                                                        setConfig({...config, scheduleTimes: times})
                                                    }}
                                                    className="hover:bg-orange-200/50 p-0.5 rounded-md transition-colors"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                        
                                        {(!config?.scheduleTimes || config.scheduleTimes.length === 0) && (
                                            <span className="text-[13px] text-slate-400 font-medium py-1.5 italic">Aucune heure configurée</span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="time" 
                                            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/30 transition-all text-[14px] font-bold text-slate-900 cursor-pointer"
                                            value={newTime}
                                            onChange={e => setNewTime(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (!newTime) return
                                                const currentTimes = config?.scheduleTimes || []
                                                if (!currentTimes.includes(newTime)) {
                                                    const newTimes = [...currentTimes, newTime].sort()
                                                    setConfig({...config, scheduleTimes: newTimes})
                                                }
                                            }}
                                            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[13px] font-bold transition-colors"
                                        >
                                            <Plus className="w-4 h-4" /> Ajouter
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-slate-400 font-medium ml-1">L'application synchronisera automatiquement vos produits à ces heures précises tous les jours.</p>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-6 py-3.5 bg-[#1B1F3B] text-white rounded-xl font-bold text-[13px] flex items-center gap-2 hover:bg-orange-600 shadow-xl transition-all shadow-orange-100/20 disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <>
                                            <RotateCw className="w-4 h-4 animate-spin" />
                                            Sauvegarde...
                                        </>
                                    ) : (
                                        "Enregistrer les paramètres"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Sidebar - History */}
                <div className="bg-white rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden flex flex-col h-[700px] sticky top-4">
                    <div className="px-6 py-5 border-b border-slate-50 flex items-center gap-3 shrink-0 bg-slate-50/30">
                        <History className="w-5 h-5 text-slate-400" />
                        <h2 className="text-[16px] font-bold text-slate-900 tracking-tight">Historique</h2>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {history.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center px-4">
                                <History className="w-12 h-12 text-slate-200 mb-3" />
                                <p className="text-[12px] text-slate-500 font-medium">Aucune synchronisation n'a encore été effectuée.</p>
                            </div>
                        ) : (
                            history.map(item => (
                                <div key={item.id} className="p-4 rounded-xl border border-slate-100 bg-white hover:border-orange-500/20 hover:bg-orange-50/10 transition-all group shadow-sm hover:shadow-md">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            {item.status === 'SUCCESS' && <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center"><CheckCircle2 className="w-4 h-4" /></div>}
                                            {item.status === 'ERROR' && <div className="w-6 h-6 rounded-md bg-red-50 text-red-600 flex items-center justify-center"><XCircle className="w-4 h-4" /></div>}
                                            {item.status === 'IN_PROGRESS' && <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center"><RotateCw className="w-4 h-4 animate-spin" /></div>}
                                            
                                            <span className={`text-[11px] font-bold uppercase tracking-widest ${
                                                item.status === 'SUCCESS' ? 'text-emerald-700' :
                                                item.status === 'ERROR' ? 'text-red-700' : 'text-blue-700'
                                            }`}>
                                                {item.status === 'SUCCESS' ? 'SUCCÈS' : 
                                                 item.status === 'ERROR' ? 'ÉCHEC' : 'EN COURS'}
                                            </span>
                                        </div>
                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-full">
                                            {item.type}
                                        </span>
                                    </div>
                                    
                                    <p className="text-[12px] text-slate-500 font-medium mb-3 flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        {new Date(item.startedAt).toLocaleString('fr-FR', {
                                            day: '2-digit', month: 'short', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                    
                                    {item.status === 'SUCCESS' && (
                                        <div className="flex gap-2">
                                            <div className="flex-1 bg-slate-50 rounded-lg p-2.5 border border-slate-100 text-center">
                                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Produits</span>
                                                <span className="text-[14px] font-black text-slate-900">{item.productsUpdated}</span>
                                            </div>
                                            <div className="flex-1 bg-slate-50 rounded-lg p-2.5 border border-slate-100 text-center">
                                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Catégories</span>
                                                <span className="text-[14px] font-black text-slate-900">{item.categoriesUpdated}</span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {item.status === 'ERROR' && (
                                        <div className="p-3 bg-red-50 text-red-700 text-[11px] rounded-lg font-medium border border-red-100 flex items-start gap-2">
                                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                                            <span className="break-all leading-relaxed">{item.errorDetails}</span>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Custom Confirm Modal */}
            <AnimatePresence>
                {isConfirmModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mb-4">
                                    <AlertCircle className="w-6 h-6 text-orange-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Lancer la synchronisation ?</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    Cette opération va se connecter au serveur FTP, télécharger les fichiers et mettre à jour les produits de votre boutique. Cela peut prendre plusieurs minutes.
                                </p>
                            </div>
                            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
                                <button
                                    onClick={() => setIsConfirmModalOpen(false)}
                                    className="px-4 py-2.5 text-[13px] font-bold text-slate-600 hover:text-slate-900 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleManualSync}
                                    className="px-6 py-2.5 bg-orange-600 text-white rounded-xl text-[13px] font-bold shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all hover:shadow-orange-600/40 flex items-center gap-2"
                                >
                                    <Play className="w-3.5 h-3.5" fill="currentColor" />
                                    Confirmer
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

function Loader2(props: any) {
    return <RotateCw {...props} />
}
