'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Github, Chrome } from 'lucide-react'
import { Button } from '@/ui/Button'
import { cn } from '@/lib/utils'

export default function AuthPage() {
    const [mode, setMode] = useState<'login' | 'register'>('login')
    const [showPassword, setShowPassword] = useState(false)

    return (
        <main className="min-h-screen bg-[#f8f9fb] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#1B1F3B]/5 blur-[120px] rounded-full pointer-events-none" />

            {/* Logo Wrapper */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10 relative z-10"
            >
                <a href="/">
                    <div className="relative w-[220px] h-[60px]">
                        <Image
                            src="https://baraka.sn/wp-content/uploads/2025/11/WhatsApp-Image-2025-08-30-at-22.56.22-2.png"
                            alt="Baraka Shop Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </a>
            </motion.div>

            {/* Main Auth Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-[450px] bg-white rounded-[2rem] border border-gray-100 shadow-[0_20px_60px_rgba(0,0,0,0.05)] p-8 md:p-12 relative z-10"
            >
                {/* Mode Selector */}
                <div className="flex bg-gray-50 p-1.5 rounded-2xl mb-10 relative">
                    <motion.div
                        animate={{ x: mode === 'login' ? '0%' : '100%' }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="absolute top-1.5 left-1.5 w-[calc(50%-6px)] h-[calc(100%-12px)] bg-white rounded-xl shadow-sm border border-gray-100"
                    />
                    <button
                        onClick={() => setMode('login')}
                        className={cn(
                            "flex-1 relative z-10 py-3 text-xs font-black uppercase tracking-widest transition-colors",
                            mode === 'login' ? "text-primary" : "text-gray-400"
                        )}
                    >
                        Connexion
                    </button>
                    <button
                        onClick={() => setMode('register')}
                        className={cn(
                            "flex-1 relative z-10 py-3 text-xs font-black uppercase tracking-widest transition-colors",
                            mode === 'register' ? "text-primary" : "text-gray-400"
                        )}
                    >
                        Créer un compte
                    </button>
                </div>

                {/* Form Heading */}
                <div className="mb-8">
                    <h1 className="text-2xl font-black text-[#1B1F3B] uppercase tracking-tighter">
                        {mode === 'login' ? 'Bon retour parmi nous' : 'Devenez membre Baraka'}
                    </h1>
                    <p className="text-gray-400 text-sm mt-2 font-medium">
                        {mode === 'login'
                            ? 'Connectez-vous pour accéder à vos offres exclusives.'
                            : 'Inscrivez-vous pour profiter d\'une expérience personnalisée.'}
                    </p>
                </div>

                {/* Forms Section */}
                <AnimatePresence mode="wait">
                    <motion.form
                        key={mode}
                        initial={{ opacity: 0, x: mode === 'login' ? -10 : 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: mode === 'login' ? 10 : -10 }}
                        className="flex flex-col gap-5"
                        onSubmit={(e) => e.preventDefault()}
                    >
                        {mode === 'register' && (
                            <div className="relative">
                                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Nom complet"
                                    className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl pl-14 pr-6 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-all"
                                />
                            </div>
                        )}

                        <div className="relative">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="email"
                                placeholder="Adresse email"
                                className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl pl-14 pr-6 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-all"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Mot de passe"
                                className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl pl-14 pr-14 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        {mode === 'login' && (
                            <div className="flex justify-end">
                                <Link href="#" className="text-[11px] font-black text-primary uppercase tracking-widest hover:underline">
                                    Mot de passe oublié ?
                                </Link>
                            </div>
                        )}

                        <Button className="h-16 rounded-2xl bg-[#1B1F3B] hover:bg-primary text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-gray-200 mt-4 group">
                            {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </motion.form>
                </AnimatePresence>

                {/* Divider */}
                <div className="flex items-center gap-4 my-10">
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">OU</span>
                    <div className="flex-1 h-px bg-gray-100" />
                </div>

                {/* Social Login */}
                <div className="grid grid-cols-2 gap-4">
                    <SocialButton icon={Chrome} label="Google" />
                    <SocialButton icon={Github} label="Github" />
                </div>

                {/* Policy Notice */}
                <p className="mt-10 text-center text-[10px] text-gray-400 font-medium leading-relaxed">
                    En continuant, vous acceptez les <Link href="#" className="underline text-gray-600">Conditions d'Utilisation</Link> et la <Link href="#" className="underline text-gray-600">Politique de Confidentialité</Link> de Baraka Shop.
                </p>
            </motion.div>

            {/* Back to Home Link */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-12"
            >
                <Link href="/" className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-primary transition-colors">
                    Retour à la boutique
                </Link>
            </motion.div>
        </main>
    )
}

function SocialButton({ icon: Icon, label }: { icon: any, label: string }) {
    return (
        <button className="flex items-center justify-center gap-3 h-14 bg-white border border-gray-100 rounded-2xl hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all group">
            <Icon className="w-5 h-5 text-[#1B1F3B] group-hover:text-primary transition-colors" />
            <span className="text-sm font-bold text-[#1B1F3B]">{label}</span>
        </button>
    )
}
