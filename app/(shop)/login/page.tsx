'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import {
    User,
    Lock,
    Loader2,
    AlertCircle,
    Eye,
    EyeOff,
    ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function LoginPage() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const searchParams = new URLSearchParams(window.location.search);
            const rawCallback = searchParams.get('callbackUrl');
            let redirectTo = '/';

            if (rawCallback) {
                try {
                    const url = new URL(rawCallback, window.location.origin);
                    if (url.origin === window.location.origin) {
                        redirectTo = url.pathname + url.search;
                    }
                } catch {
                    /* keep default */
                }
            }

            await signIn('credentials', {
                identifier,
                password,
                redirect: false,
                redirectTo,
            }).then((result) => {
                if (result?.error) {
                    setError('Identifiants invalides. Veuillez réessayer.');
                    setIsLoading(false);
                    return;
                }
                window.location.href = redirectTo;
            });
        } catch (err) {
            setError('Une erreur est survenue.');
            setIsLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { 
            opacity: 1, 
            y: 0,
            transition: {
                type: "spring" as const,
                stiffness: 100,
                damping: 15
            }
        }
    };

    return (
        <div className="relative min-h-[calc(100vh-180px)] flex flex-col items-center justify-start pt-8 sm:pt-12 pb-16 px-4 sm:px-6 overflow-hidden">
            {/* Glowing background shapes */}
            <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#1B1F3B]/5 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
            
            {/* Dotted pattern overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#E2E8F0_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

            <motion.div
                initial="hidden"
                animate="show"
                variants={containerVariants}
                className="w-full max-w-[390px] relative z-10"
            >
                {/* Heading */}
                <motion.div variants={itemVariants} className="text-center mb-6 flex flex-col items-center">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B1F3B] tracking-tight">Connexion</h1>
                    <p className="text-[#64748B] text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mt-2">Accès sécurisé à votre espace</p>
                </motion.div>

                {/* Form Card */}
                <motion.div 
                    variants={itemVariants}
                    className="bg-white/95 backdrop-blur-md p-6 sm:p-7 rounded-2xl border border-gray-100/80 shadow-[0_12px_40px_-12px_rgba(27,31,59,0.08)] relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-x-12 -translate-y-12" />

                    <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-3 p-3 bg-red-50/80 border border-red-100 rounded-xl text-red-600 text-xs font-medium"
                            >
                                <AlertCircle size={16} className="shrink-0" />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        <motion.div variants={itemVariants}>
                            <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5 px-1">Identifiant</label>
                            <div className="relative group">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#1B1F3B]" size={16} />
                                <input
                                    type="text"
                                    placeholder="Email, Username ou Téléphone"
                                    required
                                    className="w-full h-11 pl-10 pr-4 bg-slate-50/50 focus:bg-white border border-slate-200 rounded-lg text-base sm:text-sm focus:outline-none focus:ring-4 focus:ring-[#1B1F3B]/5 focus:border-[#1B1F3B] transition-all duration-300 font-medium text-[#1B1F3B] placeholder-gray-400"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5 px-1">Mot de passe</label>
                            <div className="relative group">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#1B1F3B]" size={16} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    required
                                    className="w-full h-11 pl-10 pr-10 bg-slate-50/50 focus:bg-white border border-slate-200 rounded-lg text-base sm:text-sm focus:outline-none focus:ring-4 focus:ring-[#1B1F3B]/5 focus:border-[#1B1F3B] transition-all duration-300 font-medium text-[#1B1F3B] placeholder-gray-400"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1B1F3B] transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex items-center justify-between px-1">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-200 text-[#1B1F3B] focus:ring-[#1B1F3B]/10 transition-colors" />
                                <span className="text-xs font-semibold text-[#64748B] group-hover:text-[#1B1F3B] transition-colors">Rester connecté</span>
                            </label>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                whileHover={{ y: -1, boxShadow: "0 12px 20px -8px rgba(27, 31, 59, 0.25)" }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full h-11 bg-[#1B1F3B] hover:bg-[#2D3663] text-white rounded-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:pointer-events-none"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <span>Se connecter</span>
                                        <ArrowRight size={14} />
                                    </>
                                )}
                            </motion.button>
                        </motion.div>
                    </form>

                    <motion.div variants={itemVariants} className="mt-5 pt-4 border-t border-slate-100 text-center">
                        <p className="text-[#64748B] text-xs font-medium">
                            Nouveau sur Baraka Shop ?{' '}
                            <Link href="/register" className="text-[#1B1F3B] font-bold hover:text-primary transition-colors inline-flex items-center gap-0.5 group">
                                Créer un compte
                                <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform duration-300" />
                            </Link>
                        </p>
                    </motion.div>
                </motion.div>

                <motion.div variants={itemVariants} className="mt-5 text-center text-[#94A3B8] text-[9px] font-black uppercase tracking-[0.15em] opacity-80">
                    &copy; 2024 Baraka Shop Senegal - Tous droits réservés
                </motion.div>
            </motion.div>
        </div>
    );
}
