'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import {
    ImageIcon,
    Upload,
    Trash2,
    Loader2,
    Check,
    Monitor,
    ArrowDown,
    Sparkles,
    RefreshCw,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { getSiteConfigForAdmin, updateSiteLogos } from '@/lib/actions/site-config-actions'

interface LogoSlot {
    key: 'headerLogo' | 'footerLogo' | 'loaderLogo'
    label: string
    description: string
    icon: React.ReactNode
    previewBg: string
    accentColor: string
}

const LOGO_SLOTS: LogoSlot[] = [
    {
        key: 'headerLogo',
        label: 'Logo Header',
        description: 'Navigation principale du site (Desktop & Mobile)',
        icon: <Monitor size={20} />,
        previewBg: 'bg-white',
        accentColor: 'orange',
    },
    {
        key: 'footerLogo',
        label: 'Logo Footer',
        description: 'Pied de page et section bas du site',
        icon: <ArrowDown size={20} />,
        previewBg: 'bg-[#0A0B14]',
        accentColor: 'violet',
    },
    {
        key: 'loaderLogo',
        label: 'Logo Loader',
        description: 'Écran de chargement et page maintenance',
        icon: <Sparkles size={20} />,
        previewBg: 'bg-white',
        accentColor: 'emerald',
    },
]

const DEFAULT_LOGO = '/logo.png'

export function SiteLogosPanel() {
    const [logos, setLogos] = useState<Record<string, string | null>>({
        headerLogo: null,
        footerLogo: null,
        loaderLogo: null,
    })
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState<string | null>(null)
    const [saving, setSaving] = useState<string | null>(null)
    const [deleting, setDeleting] = useState<string | null>(null)
    const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

    useEffect(() => {
        loadLogos()
    }, [])

    const loadLogos = async () => {
        try {
            const result = await getSiteConfigForAdmin()
            if (result.success && result.config) {
                setLogos({
                    headerLogo: result.config.headerLogo || null,
                    footerLogo: result.config.footerLogo || null,
                    loaderLogo: result.config.loaderLogo || null,
                })
            }
        } catch (error) {
            console.error('Error loading logos:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpload = async (slotKey: string, file: File) => {
        if (!file) return

        // Validate
        const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif']
        if (!allowedTypes.includes(file.type)) {
            toast.error('Format non supporté. Utilisez PNG, JPG, WebP, SVG ou GIF.')
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Le fichier est trop volumineux (max 5 Mo).')
            return
        }

        setUploading(slotKey)

        try {
            // Upload to Cloudinary
            const formData = new FormData()
            formData.append('files', file)

            const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
            const uploadData = await uploadRes.json()

            if (!uploadRes.ok || !uploadData.urls?.length) {
                throw new Error(uploadData.error || 'Upload échoué')
            }

            const logoUrl = uploadData.urls[0]

            // Save to DB
            setSaving(slotKey)
            const saveRes = await updateSiteLogos({ [slotKey]: logoUrl })

            if (saveRes.success) {
                setLogos(prev => ({ ...prev, [slotKey]: logoUrl }))
                toast.success(`${LOGO_SLOTS.find(s => s.key === slotKey)?.label} mis à jour avec succès !`)
            } else {
                throw new Error(saveRes.error || 'Erreur de sauvegarde')
            }
        } catch (error: any) {
            toast.error(error.message || 'Erreur lors de l\'upload du logo.')
        } finally {
            setUploading(null)
            setSaving(null)
        }
    }

    const handleDelete = async (slotKey: string) => {
        setDeleting(slotKey)
        try {
            const res = await updateSiteLogos({ [slotKey]: null })
            if (res.success) {
                setLogos(prev => ({ ...prev, [slotKey]: null }))
                toast.success('Logo supprimé. Le logo par défaut sera utilisé.')
            } else {
                throw new Error(res.error)
            }
        } catch (error: any) {
            toast.error(error.message || 'Erreur lors de la suppression.')
        } finally {
            setDeleting(null)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16 gap-4">
                <Loader2 size={24} className="animate-spin text-orange-600" />
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                    Chargement des logos...
                </span>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Section Title */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-100">
                        <ImageIcon size={22} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 className="text-[18px] font-black text-slate-900 tracking-tight">
                            Gestion des Logos
                        </h3>
                        <p className="text-[12px] text-slate-400 font-medium mt-0.5">
                            Uploadez et gérez les logos du Header, Footer et Loader du site
                        </p>
                    </div>
                </div>
                <button
                    onClick={loadLogos}
                    className="flex items-center gap-2 px-4 py-2 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
                >
                    <RefreshCw size={14} />
                    Actualiser
                </button>
            </div>

            {/* Logo Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {LOGO_SLOTS.map((slot, idx) => {
                    const currentLogo = logos[slot.key]
                    const isUploading = uploading === slot.key
                    const isSaving = saving === slot.key
                    const isDeleting = deleting === slot.key
                    const isProcessing = isUploading || isSaving || isDeleting

                    const accentClasses = {
                        orange: {
                            badge: 'bg-orange-50 text-orange-600 border-orange-100',
                            icon: 'bg-orange-50 text-orange-600',
                            ring: 'ring-orange-500/20',
                            upload: 'border-orange-200 hover:bg-orange-50/50 hover:border-orange-300',
                            btn: 'bg-orange-600 hover:bg-orange-700 shadow-orange-100',
                        },
                        violet: {
                            badge: 'bg-violet-50 text-violet-600 border-violet-100',
                            icon: 'bg-violet-50 text-violet-600',
                            ring: 'ring-violet-500/20',
                            upload: 'border-violet-200 hover:bg-violet-50/50 hover:border-violet-300',
                            btn: 'bg-violet-600 hover:bg-violet-700 shadow-violet-100',
                        },
                        emerald: {
                            badge: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                            icon: 'bg-emerald-50 text-emerald-600',
                            ring: 'ring-emerald-500/20',
                            upload: 'border-emerald-200 hover:bg-emerald-50/50 hover:border-emerald-300',
                            btn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100',
                        },
                    }[slot.accentColor]!

                    return (
                        <motion.div
                            key={slot.key}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all group"
                        >
                            {/* Card Header */}
                            <div className="p-5 border-b border-slate-50 flex items-center gap-3">
                                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", accentClasses.icon)}>
                                    {slot.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-[14px] font-black text-slate-900 truncate">{slot.label}</h4>
                                    <p className="text-[10px] text-slate-400 font-medium truncate">{slot.description}</p>
                                </div>
                                {currentLogo && (
                                    <span className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border", accentClasses.badge)}>
                                        Actif
                                    </span>
                                )}
                            </div>

                            {/* Preview Area */}
                            <div className={cn(
                                "relative mx-5 mt-5 rounded-2xl border border-slate-100 overflow-hidden flex items-center justify-center",
                                slot.previewBg,
                                "h-[120px]"
                            )}>
                                {/* Checkerboard pattern for transparency */}
                                <div
                                    className="absolute inset-0 opacity-[0.03]"
                                    style={{
                                        backgroundImage: `linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)`,
                                        backgroundSize: '16px 16px',
                                        backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                                    }}
                                />
                                <div className="relative w-[70%] h-[60%] flex items-center justify-center">
                                    <Image
                                        src={currentLogo || DEFAULT_LOGO}
                                        alt={slot.label}
                                        fill
                                        className="object-contain"
                                        unoptimized
                                    />
                                </div>
                                {!currentLogo && (
                                    <div className="absolute bottom-2 right-2">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-300 bg-white/80 px-2 py-0.5 rounded-md">
                                            Par défaut
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="p-5 space-y-3">
                                {/* Upload Button */}
                                <input
                                    type="file"
                                    ref={el => { fileRefs.current[slot.key] = el }}
                                    accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) handleUpload(slot.key, file)
                                        e.target.value = ''
                                    }}
                                />

                                <button
                                    onClick={() => fileRefs.current[slot.key]?.click()}
                                    disabled={isProcessing}
                                    className={cn(
                                        "w-full flex items-center justify-center gap-2.5 px-4 py-3 border-2 border-dashed rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                                        accentClasses.upload
                                    )}
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" />
                                            <span>Upload en cours...</span>
                                        </>
                                    ) : isSaving ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" />
                                            <span>Sauvegarde...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={14} />
                                            <span>Changer le logo</span>
                                        </>
                                    )}
                                </button>

                                {/* Delete Button - Only show if custom logo exists */}
                                <AnimatePresence>
                                    {currentLogo && (
                                        <motion.button
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            onClick={() => handleDelete(slot.key)}
                                            disabled={isProcessing}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-50"
                                        >
                                            {isDeleting ? (
                                                <>
                                                    <Loader2 size={12} className="animate-spin" />
                                                    <span>Suppression...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Trash2 size={12} />
                                                    <span>Supprimer (retour au défaut)</span>
                                                </>
                                            )}
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Info Note */}
            <div className="flex items-start gap-3 p-5 bg-slate-50/80 rounded-2xl border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ImageIcon size={16} />
                </div>
                <div>
                    <p className="text-[12px] font-bold text-slate-600 leading-relaxed">
                        Les logos sont mis à jour en temps réel sur tout le site. Formats acceptés : <span className="font-black text-slate-900">PNG, JPG, WebP, SVG, GIF</span>. 
                        Taille max : <span className="font-black text-slate-900">5 Mo</span>. 
                        Pour un rendu optimal, utilisez un logo avec fond transparent (PNG ou SVG).
                    </p>
                </div>
            </div>
        </div>
    )
}
