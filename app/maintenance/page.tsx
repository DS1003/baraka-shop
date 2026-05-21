'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ShieldCheck, RefreshCw, Clock, ArrowRight, Settings2, User, Lock, Eye, EyeOff, Loader2, X, AlertCircle } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'

export const dynamic = 'force-dynamic'

function useMaintenanceConfig() {
    const [config, setConfig] = useState({
        maintenanceTitle: 'Site en maintenance',
        maintenanceMessage: 'Nous effectuons des améliorations. Le site sera de retour très bientôt.',
    })

    useEffect(() => {
        fetch('/api/site-status', { cache: 'no-store' })
            .then((r) => r.json())
            .then((data) => {
                if (!data.maintenanceMode) {
                    window.location.href = '/'
                    return
                }
                if (data.maintenanceTitle) {
                    setConfig((c) => ({ ...c, maintenanceTitle: data.maintenanceTitle }))
                }
                if (data.maintenanceMessage) {
                    setConfig((c) => ({ ...c, maintenanceMessage: data.maintenanceMessage }))
                }
            })
            .catch(() => {})
    }, [])

    return config
}

function useAutoRefresh() {
    const [countdown, setCountdown] = useState(30)

    useEffect(() => {
        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    fetch('/api/site-status', { cache: 'no-store' })
                        .then((r) => r.json())
                        .then((data) => {
                            if (!data.maintenanceMode) {
                                window.location.href = '/'
                            }
                        })
                        .catch(() => {})
                    return 30
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    return countdown
}

export default function MaintenancePage() {
    const config = useMaintenanceConfig()
    const countdown = useAutoRefresh()
    const [mounted, setMounted] = useState(false)

    // Login Modal State
    const [showLoginModal, setShowLoginModal] = useState(false)
    const [identifier, setIdentifier] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => e.preventDefault()
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
                (e.ctrlKey && e.key === 'u')
            ) {
                e.preventDefault()
            }
        }
        document.addEventListener('contextmenu', handleContextMenu)
        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('contextmenu', handleContextMenu)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const result = await signIn('credentials', {
                identifier,
                password,
                redirect: false,
            })

            if (result?.error) {
                setError('Identifiants invalides.')
                setIsLoading(false)
            } else {
                const sessionResponse = await fetch('/api/auth/session')
                const session = await sessionResponse.json()

                if (session?.user?.role === 'ADMIN') {
                    window.location.href = '/admin/settings'
                } else {
                    setError('Accès refusé. Vous n\'êtes pas administrateur.')
                    setIsLoading(false)
                }
            }
        } catch (err) {
            setError('Une erreur est survenue.')
            setIsLoading(false)
        }
    }

    if (!mounted) return null

    // Motion variants for the modal content
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { 
            opacity: 1, 
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    }

    return (
        <main className="h-screen bg-[#FAFAFA] flex flex-col relative selection:bg-orange-500/20 selection:text-orange-900 font-sans overflow-hidden">
            {/* Ultra-subtle Animated Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
                <div 
                    className="absolute inset-0 opacity-[0.015]"
                    style={{
                        backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
                        backgroundSize: '40px 40px',
                    }}
                />
                
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-orange-100/60 rounded-full blur-[100px] opacity-60 mix-blend-multiply animate-[pulse_8s_ease-in-out_infinite]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-blue-50/50 rounded-full blur-[120px] opacity-60 mix-blend-multiply" />
            </div>

            {/* Top Navigation */}
            <header className="w-full relative z-10 pt-6 sm:pt-8 px-6 sm:px-10 flex items-center justify-between">
                <div className="relative w-32 h-10 sm:w-44 sm:h-12">
                    <Image
                        src="/logo.png"
                        alt="Baraka Shop"
                        fill
                        className="object-contain object-left"
                        priority
                        unoptimized
                    />
                </div>
                
                <button
                    onClick={() => setShowLoginModal(true)}
                    className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-500 hover:text-slate-900 font-semibold text-[10px] sm:text-xs uppercase tracking-widest rounded-full border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
                >
                    <Settings2 className="w-3.5 h-3.5" />
                    Admin
                </button>
            </header>

            {/* Central Content */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-4 sm:px-6 w-full max-w-4xl mx-auto py-8">
                
                {/* Status Badge */}
                <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-orange-200/50 bg-orange-50/50 mb-6 sm:mb-8 shadow-sm backdrop-blur-sm animate-[fade-in-up_0.6s_ease-out]">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-60"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-orange-700 uppercase tracking-[0.2em]">
                        Système en maintenance
                    </span>
                </div>

                {/* Hero Typography */}
                <div className="text-center max-w-3xl mx-auto animate-[fade-in-up_0.8s_ease-out]">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-[-0.04em] leading-[1.05] mb-6">
                        {config.maintenanceTitle}
                    </h1>

                    <p className="text-base sm:text-lg lg:text-xl text-slate-500 font-medium leading-relaxed max-w-xl mx-auto mb-10">
                        {config.maintenanceMessage}
                    </p>
                </div>

                {/* Info Cards */}
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 animate-[fade-in-up_1s_ease-out] max-w-3xl mx-auto">
                    
                    <div className="group relative bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all overflow-hidden flex items-start gap-4">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                        
                        <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-inner">
                            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="relative pt-0.5">
                            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">Données sécurisées</h3>
                            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                                L'intégrité de vos informations est totalement garantie.
                            </p>
                        </div>
                    </div>

                    <div className="group relative bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all overflow-hidden flex items-start gap-4">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                        
                        <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-inner">
                            <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 animate-[spin_4s_linear_infinite]" />
                        </div>
                        <div className="relative pt-0.5">
                            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">Auto-actualisation</h3>
                            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                                Vérification automatique dans <span className="font-black text-blue-600">{countdown}</span> secondes.
                            </p>
                        </div>
                    </div>

                </div>

                {/* Primary CTA */}
                <div className="mt-10 sm:mt-12 animate-[fade-in-up_1.2s_ease-out]">
                    <a
                        href="https://wa.me/221338000000"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative inline-flex items-center justify-center gap-3 h-12 sm:h-14 px-6 sm:px-8 bg-slate-900 text-white rounded-full font-bold text-xs sm:text-sm tracking-wide overflow-hidden transition-all shadow-[0_8px_30px_-8px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_30px_-8px_rgba(234,88,12,0.6)] hover:-translate-y-1 active:translate-y-0"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <svg 
                            viewBox="0 0 24 24" 
                            className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 fill-current group-hover:scale-110 transition-transform"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                        
                        <span className="relative z-10">Contacter le support client</span>
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 ml-1 group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>
            </div>

            {/* Footer */}
            <footer className="w-full relative z-10 py-5 sm:py-6 px-6 sm:px-10 flex items-center justify-between mt-auto">
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    © 2026 Baraka Shop
                </p>
                <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
                        Merci de votre patience
                    </p>
                </div>
            </footer>

            {/* Mobile Admin Link */}
            <button
                onClick={() => setShowLoginModal(true)}
                className="sm:hidden absolute top-6 right-6 p-2.5 bg-white text-slate-400 hover:text-slate-900 rounded-full border border-slate-200 shadow-sm cursor-pointer z-10"
            >
                <Settings2 className="w-4 h-4" />
            </button>

            {/* Global Styles for Animations */}
            <style jsx global>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {/* In-Page Admin Login Modal with Framer Motion */}
            <AnimatePresence>
                {showLoginModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-md"
                            onClick={() => setShowLoginModal(false)}
                        />

                        {/* Modal Content - Pure, Clean, Minimalist */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative w-full max-w-[400px] bg-[#FAFAFA] rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] overflow-hidden"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setShowLoginModal(false)}
                                className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors z-20"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            <motion.div 
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                                className="p-8 sm:p-10 flex flex-col"
                            >
                                {/* Header */}
                                <motion.div variants={itemVariants} className="flex flex-col items-center text-center mb-8">
                                    <motion.div 
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: "spring", delay: 0.2 }}
                                        className="mb-5 relative"
                                    >
                                        <Lock className="w-8 h-8 text-[#111424] relative z-10" strokeWidth={1.5} />
                                    </motion.div>
                                    <h2 className="text-[26px] font-black text-[#111424] tracking-tight">Accès Admin</h2>
                                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] mt-1">Espace sécurisé</p>
                                </motion.div>

                                {/* Form */}
                                <form 
                                    onSubmit={(e) => {
                                        e.preventDefault()
                                        if (!identifier || !password) {
                                            setError('Veuillez remplir tous les champs.')
                                            return
                                        }
                                        handleAdminLogin(e)
                                    }} 
                                    className="space-y-5"
                                    noValidate
                                >
                                    <AnimatePresence>
                                        {error && (
                                            <motion.div 
                                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                                animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-semibold">
                                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                                    <span>{error}</span>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <motion.div variants={itemVariants}>
                                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 px-1">Identifiant</label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#111424] transition-colors z-10" size={18} strokeWidth={1.5} />
                                            <input
                                                type="text"
                                                placeholder="Email ou Username"
                                                className="w-full h-14 pl-12 pr-4 bg-[#F0F4F8] focus:bg-[#E8EEF4] border-none rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111424]/10 transition-all font-semibold text-[#111424] placeholder-slate-400"
                                                value={identifier}
                                                onChange={(e) => {
                                                    setIdentifier(e.target.value)
                                                    if (error) setError(null)
                                                }}
                                            />
                                        </div>
                                    </motion.div>

                                    <motion.div variants={itemVariants}>
                                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 px-1">Mot de passe</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#111424] transition-colors z-10" size={18} strokeWidth={1.5} />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                className="w-full h-14 pl-12 pr-12 bg-[#F0F4F8] focus:bg-[#E8EEF4] border-none rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111424]/10 transition-all font-semibold text-[#111424] placeholder-slate-400"
                                                value={password}
                                                onChange={(e) => {
                                                    setPassword(e.target.value)
                                                    if (error) setError(null)
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#111424] transition-colors z-10"
                                            >
                                                {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                                            </button>
                                        </div>
                                    </motion.div>

                                    <motion.div variants={itemVariants}>
                                        <motion.button
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full h-14 mt-4 bg-[#111424] text-white rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-colors shadow-lg shadow-[#111424]/20 hover:bg-[#1C2038] disabled:opacity-70 disabled:pointer-events-none"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                            <>
                                                <span>Connexion sécurisée</span>
                                                <ArrowRight size={16} />
                                            </>
                                            )}
                                        </motion.button>
                                    </motion.div>
                                </form>
                            </motion.div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    )
}
