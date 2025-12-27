'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Globe, Sparkles, ArrowRight, ShieldCheck, UserPlus } from 'lucide-react'
import { motion } from 'framer-motion'

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault()
        router.push('/account')
    }

    return (
        <div className="min-h-screen bg-black flex overflow-hidden">

            {/* Left Side: Branding (Cinematic) */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 overflow-hidden">
                <div className="relative z-10">
                    <Link href="/" className="inline-block relative group">
                        <div className="text-white font-black text-3xl tracking-tighter">Baraka<span className="text-primary italic">.</span></div>
                    </Link>
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="mt-20"
                    >
                        <h1 className="text-7xl font-black text-white leading-none tracking-tighter mb-8">
                            Privilège <br /> & <span className="text-primary italic">Innovation.</span>
                        </h1>
                        <p className="text-gray-400 text-lg font-medium max-w-sm">
                            Rejoignez plus de 50,000 clients satisfaits à travers le Sénégal et profitez du meilleur de la technologie.
                        </p>
                    </motion.div>
                </div>

                <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-4 text-white/60">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <ShieldCheck size={20} className="text-primary" />
                        </div>
                        <p className="text-xs font-bold leading-tight uppercase tracking-wider">Données 100% sécurisées <br /> & chiffrées</p>
                    </div>
                </div>

                {/* Animated Background Glows */}
                <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] -mr-96 -mb-96" />
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -ml-40 -mt-20" />
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 bg-white lg:rounded-l-[4rem] flex flex-col justify-center px-8 md:px-20 relative shadow-[-20px_0_60px_rgba(0,0,0,0.3)]">

                {/* Mobile Header */}
                <div className="lg:hidden absolute top-8 left-8 right-8 flex justify-between items-center">
                    <div className="text-black font-black text-2xl tracking-tighter">Baraka<span className="text-primary italic">.</span></div>
                    <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-primary">Se Connecter</Link>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full mx-auto py-12"
                >
                    <div className="mb-10 text-center lg:text-left">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-[1.5rem] mb-6 lg:hidden">
                            <UserPlus size={28} />
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-none mb-4">Créer un compte.</h2>
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Simple. Rapide. Sécurisé.</p>
                    </div>

                    <form className="space-y-4" onSubmit={handleRegister}>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Prénom</label>
                                <input type="text" required className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 px-6 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none" placeholder="Moussa" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Nom</label>
                                <input type="text" required className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 px-6 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none" placeholder="Diop" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Adresse Email</label>
                            <input type="email" required className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 px-6 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none" placeholder="nom@exemple.sn" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Mot de passe</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 px-6 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full bg-black text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-black/20 hover:bg-primary transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                Créer l'Espace Premium <ArrowRight size={18} />
                            </button>
                        </div>
                    </form>

                    <div className="mt-8">
                        <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                            En créant un compte, vous acceptez nos <Link href="/terms" className="text-black font-black underline">Conditions Générales</Link> et notre <Link href="/privacy" className="text-black font-black underline">Politique de Confidentialité</Link>.
                        </p>

                        <p className="mt-10 text-center text-gray-400 font-bold text-xs">
                            Déjà un compte ?{' '}
                            <Link href="/login" className="text-primary hover:underline">Se connecter maintenant</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
