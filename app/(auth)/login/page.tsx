'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Facebook, Globe, Sparkles, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        router.push('/account')
    }

    return (
        <div className="min-h-screen bg-black flex overflow-hidden">

            {/* Left Side: Visual/Branding (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 overflow-hidden">
                <div className="relative z-10">
                    <Link href="/" className="inline-block relative w-32 h-12 mb-20 group">
                        <div className="text-white font-black text-3xl tracking-tighter">Baraka<span className="text-primary italic">.</span></div>
                    </Link>
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-7xl font-black text-white leading-none tracking-tighter mb-8">
                            Entrez dans <br /> l'univers <br /> <span className="text-primary">Premium.</span>
                        </h1>
                        <p className="text-gray-400 text-lg font-medium max-w-sm">
                            Connectez-vous pour accéder à vos offres exclusives et suivre vos commandes.
                        </p>
                    </motion.div>
                </div>

                <div className="relative z-10 flex items-center gap-6 text-white/40 text-xs font-black uppercase tracking-widest">
                    <span className="flex items-center gap-2"><Globe size={14} /> baraka.sn</span>
                    <span className="flex items-center gap-2"><Sparkles size={14} /> 2025 Edition</span>
                </div>

                {/* Animated Background Glows */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] -mr-96 -mt-96 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] -ml-40 -mb-40" />
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 bg-white lg:rounded-l-[4rem] flex flex-col justify-center px-8 md:px-20 relative shadow-[-20px_0_60px_rgba(0,0,0,0.3)]">

                {/* Mobile Header */}
                <div className="lg:hidden absolute top-8 left-8 right-8 flex justify-between items-center">
                    <div className="text-black font-black text-2xl tracking-tighter">Baraka<span className="text-primary italic">.</span></div>
                    <Link href="/register" className="text-[10px] font-black uppercase tracking-widest text-primary">S'inscrire</Link>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full mx-auto"
                >
                    <div className="mb-12">
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-none mb-4">Bon retour.</h2>
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Votre porte d'entrée vers l'excellence</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Adresse Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 px-6 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none"
                                    placeholder="nom@exemple.sn"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between px-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Mot de passe</label>
                                    <button type="button" className="text-[9px] font-black uppercase text-primary tracking-widest hover:underline">Oublié ?</button>
                                </div>
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
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-black text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-black/20 hover:bg-primary transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            Se Connecter <ArrowRight size={18} />
                        </button>
                    </form>

                    <div className="mt-12 text-center">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest leading-none">
                                <span className="px-4 bg-white text-gray-300">Ou continuer avec</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-3 py-4 border-2 border-gray-100 rounded-2xl hover:border-black transition-all group">
                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span className="font-black text-[10px] uppercase tracking-widest text-gray-400 group-hover:text-black">Google</span>
                            </button>
                            <button className="flex items-center justify-center gap-3 py-4 border-2 border-gray-100 rounded-2xl hover:border-black transition-all group">
                                <Facebook className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                                <span className="font-black text-[10px] uppercase tracking-widest text-gray-400 group-hover:text-black">Facebook</span>
                            </button>
                        </div>

                        <p className="mt-12 text-gray-400 font-bold text-xs">
                            Nouveau ici ?{' '}
                            <Link href="/register" className="text-primary hover:underline">Créer un compte gratuitement</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
