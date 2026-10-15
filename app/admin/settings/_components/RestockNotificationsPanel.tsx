'use client'

import React, { useState, useEffect } from 'react'
import {
    Mail,
    Plus,
    Trash2,
    Send,
    CheckCircle2,
    AlertTriangle,
    Bell,
    Loader2,
    ShieldCheck,
    Check,
    Sparkles,
    RefreshCw
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
    getSiteConfigForAdmin,
    updateSiteConfig,
    sendTestRestockEmailAction,
    type SiteConfigData
} from '@/lib/actions/site-config-actions'

export function RestockNotificationsPanel() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [testingEmail, setTestingEmail] = useState<string | null>(null)
    const [newEmail, setNewEmail] = useState('')
    const [emailError, setEmailError] = useState('')
    const [emails, setEmails] = useState<string[]>([])
    const [enabled, setEnabled] = useState(true)

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    const loadConfig = async () => {
        setLoading(true)
        try {
            const res = await getSiteConfigForAdmin()
            if (res.success && res.config) {
                setEmails(res.config.restockNotificationEmails || [])
                setEnabled(res.config.restockNotificationsEnabled ?? true)
            }
        } catch (err) {
            toast.error('Erreur lors du chargement des paramètres de notification')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadConfig()
    }, [])

    const handleAddEmail = (emailToAdd?: string) => {
        const target = (emailToAdd || newEmail).trim().toLowerCase()
        if (!target) {
            setEmailError('Veuillez saisir une adresse e-mail')
            return
        }

        if (!EMAIL_REGEX.test(target)) {
            setEmailError('Format d’adresse e-mail invalide (ex: admin@baraka.sn)')
            return
        }

        if (emails.includes(target)) {
            setEmailError('Cette adresse est déjà dans la liste')
            return
        }

        setEmailError('')
        const updated = [...emails, target]
        setEmails(updated)
        if (!emailToAdd) setNewEmail('')
    }

    const handleRemoveEmail = (indexToRemove: number) => {
        const updated = emails.filter((_, idx) => idx !== indexToRemove)
        setEmails(updated)
    }

    const handleSave = async (updatedEmails?: string[], updatedEnabled?: boolean) => {
        const toSaveEmails = updatedEmails !== undefined ? updatedEmails : emails
        const toSaveEnabled = updatedEnabled !== undefined ? updatedEnabled : enabled

        setSaving(true)
        try {
            const res = await updateSiteConfig({
                restockNotificationEmails: toSaveEmails,
                restockNotificationsEnabled: toSaveEnabled,
            })

            if (res.success) {
                toast.success('Paramètres de notifications enregistrés avec succès')
            } else {
                toast.error(res.error || 'Erreur lors de l’enregistrement')
            }
        } catch (err) {
            toast.error('Une erreur inattendue est survenue')
        } finally {
            setSaving(false)
        }
    }

    const handleTestEmail = async (targetEmail: string) => {
        setTestingEmail(targetEmail)
        try {
            const res = await sendTestRestockEmailAction(targetEmail)
            if (res.success) {
                toast.success(`E-mail de test envoyé avec succès à ${targetEmail}`)
            } else {
                toast.error(res.error || 'Échec de l’envoi de l’e-mail de test')
            }
        } catch (err: any) {
            toast.error(err.message || 'Erreur lors de l’envoi du test')
        } finally {
            setTestingEmail(null)
        }
    }

    const addDefaultOfficialEmail = () => {
        const official = 'contact@barakagroup.sn'
        if (!emails.includes(official)) {
            const updated = [official, ...emails]
            setEmails(updated)
            handleSave(updated, enabled)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12 text-slate-400 gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
                <span className="text-[11px] font-black uppercase tracking-widest">
                    Chargement des configurations e-mails...
                </span>
            </div>
        )
    }

    return (
        <div id="restock-notifications" className="space-y-8">
            {/* Header / Intro */}
            <div className="bg-slate-50/50 p-6 sm:p-8 rounded-3xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-100">
                        <Bell size={24} strokeWidth={2.2} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h3 className="text-[17px] font-black text-slate-900 tracking-tight">
                                Notifications de réapprovisionnement
                            </h3>
                            <span
                                className={cn(
                                    'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider',
                                    enabled && emails.length > 0
                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                        : !enabled
                                        ? 'bg-slate-100 text-slate-500'
                                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                                )}
                            >
                                {!enabled
                                    ? 'Désactivé'
                                    : emails.length === 0
                                    ? 'Non configuré'
                                    : 'Actif & Opérationnel'}
                            </span>
                        </div>
                        <p className="text-[13px] text-slate-500 font-medium mt-1 leading-relaxed max-w-xl">
                            Recevez automatiquement une alerte par e-mail dès qu’un produit précédemment
                            en rupture de stock reçoit de nouvelles unités et nécessite votre validation pour être réactivé.
                        </p>
                    </div>
                </div>

                {/* Main Toggle */}
                <div className="flex items-center gap-3 self-end md:self-auto bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                    <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider px-2">
                        {enabled ? 'Alertes activées' : 'Alertes suspendues'}
                    </span>
                    <button
                        type="button"
                        onClick={() => {
                            const newStatus = !enabled
                            setEnabled(newStatus)
                            handleSave(emails, newStatus)
                        }}
                        className={cn(
                            'w-[52px] h-[28px] rounded-full relative transition-all duration-300 p-1 flex-shrink-0 border',
                            enabled
                                ? 'bg-orange-600 border-orange-500 shadow-md shadow-orange-200'
                                : 'bg-slate-200 border-slate-300'
                        )}
                    >
                        <motion.div
                            layout
                            initial={false}
                            animate={{ x: enabled ? 24 : 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            className="w-[20px] h-[20px] rounded-full bg-white shadow-sm"
                        />
                    </button>
                </div>
            </div>

            {/* Warning when no email configured */}
            {emails.length === 0 && (
                <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[13px] font-black text-amber-900">
                                Aucune adresse e-mail configurée
                            </p>
                            <p className="text-[12px] text-amber-700 font-medium mt-0.5 leading-relaxed">
                                Les réapprovisionnements seront correctement enregistrés dans l’espace d’administration,
                                mais aucun administrateur ne recevra d’e-mail d’alerte tant qu’une adresse n’aura pas été renseignée.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={addDefaultOfficialEmail}
                        className="px-4 py-2 bg-amber-600 text-white rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-amber-700 transition-all shrink-0 flex items-center gap-2 shadow-sm"
                    >
                        <Sparkles size={14} />
                        Ajouter Baraka Officiel
                    </button>
                </div>
            )}

            {/* Add email input */}
            <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    Ajouter un destinataire administrateur
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => {
                                setNewEmail(e.target.value)
                                if (emailError) setEmailError('')
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleAddEmail()
                                }
                            }}
                            placeholder="ex: admin@baraka.sn, direction@barakagroup.sn..."
                            className={cn(
                                'w-full h-12 pl-11 pr-4 bg-white border rounded-2xl text-[14px] font-bold text-slate-900 outline-none transition-all',
                                emailError
                                    ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                                    : 'border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10'
                            )}
                        />
                        <Mail
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => handleAddEmail()}
                        className="h-12 px-6 bg-slate-900 text-white rounded-2xl font-black text-[12px] uppercase tracking-wider hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-md shrink-0"
                    >
                        <Plus size={16} strokeWidth={2.5} />
                        Ajouter l’adresse
                    </button>
                </div>
                {emailError && (
                    <p className="text-[12px] font-bold text-rose-500 ml-1 flex items-center gap-1.5">
                        <AlertTriangle size={13} />
                        {emailError}
                    </p>
                )}
            </div>

            {/* Configured Emails List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Destinataires enregistrés ({emails.length})
                    </p>
                    {emails.length > 0 && (
                        <span className="text-[11px] text-slate-400 font-medium">
                            Tous les destinataires ci-dessous reçoivent une notification simultanée
                        </span>
                    )}
                </div>

                {emails.length === 0 ? (
                    <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl text-center bg-slate-50/30">
                        <Mail size={32} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-[13px] font-bold text-slate-500">
                            Aucune adresse renseignée pour le moment
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium mt-1">
                            Ajoutez au moins une adresse pour être averti lors des réapprovisionnements.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {emails.map((email, idx) => (
                            <div
                                key={email}
                                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all group"
                            >
                                <div className="flex items-center gap-3 min-w-0 pr-2">
                                    <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                                        <Mail size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[13px] font-black text-slate-900 truncate">
                                            {email}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            Destinataire #{idx + 1}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                        type="button"
                                        disabled={testingEmail === email}
                                        onClick={() => handleTestEmail(email)}
                                        title="Envoyer un e-mail de test à cette adresse"
                                        className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors disabled:opacity-50"
                                    >
                                        {testingEmail === email ? (
                                            <Loader2 size={16} className="animate-spin text-orange-600" />
                                        ) : (
                                            <Send size={16} />
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveEmail(idx)}
                                        title="Supprimer ce destinataire"
                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Save Button & Security Note */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-slate-400 text-[11px] font-medium">
                    <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                    <span>
                        Les adresses sont stockées de façon sécurisée et ne sont jamais exposées publiquement.
                    </span>
                </div>

                <button
                    type="button"
                    onClick={() => handleSave()}
                    disabled={saving}
                    className="h-12 px-8 bg-slate-900 text-white rounded-2xl font-black text-[12px] uppercase tracking-wider hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-100 disabled:opacity-50"
                >
                    {saving ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <Check size={16} strokeWidth={2.5} />
                    )}
                    <span>{saving ? 'Enregistrement...' : 'Enregistrer la configuration'}</span>
                </button>
            </div>
        </div>
    )
}
