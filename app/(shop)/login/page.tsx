'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import {
    User,
    Lock,
    Loader2,
    AlertCircle,
    ShieldCheck,
    Eye,
    EyeOff,
    ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

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
            const result = await signIn('credentials', {
                identifier,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Identifiants invalides. Veuillez réessayer.');
                setIsLoading(false);
            } else {
                // Récupérer les paramètres de l'URL pour gérer le callbackUrl
                const searchParams = new URLSearchParams(window.location.search);
                const callbackUrl = searchParams.get('callbackUrl');

                // Si on a un callbackUrl spécifique, on l'utilise
                if (callbackUrl && callbackUrl !== '/') {
                    window.location.href = callbackUrl;
                    return;
                }

                // Sinon, on vérifie le rôle pour la redirection par défaut
                const sessionResponse = await fetch('/api/auth/session');
                const session = await sessionResponse.json();

                if (session?.user?.role === 'ADMIN') {
                    window.location.href = '/admin';
                } else {
                    window.location.href = '/';
                }
            }
        } catch (err) {
            setError('Une erreur est survenue.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 bg-[radial-gradient(#E2E8F0_1px,transparent_1px)] [background-size:20px_20px]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Banner/Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1B1F3B] rounded-2xl shadow-xl shadow-gray-200 mb-4 transition-transform hover:scale-105 duration-500">
                        <ShieldCheck size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-[#1B1F3B] tracking-tight">Baraka Shop</h1>
                    <p className="text-[#64748B] mt-2 font-medium italic">Accès sécurisé à votre espace</p>
                </div>

                {/* Form Card */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-[#E2E8F0] shadow-2xl shadow-gray-200/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-x-12 -translate-y-12" />

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium"
                            >
                                <AlertCircle size={18} />
                                {error}
                            </motion.div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-[#1B1F3B] mb-2 px-1">Identifiant</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors group-focus-within:text-[#1B1F3B]" size={20} />
                                <input
                                    type="text"
                                    placeholder="Email, Username ou Téléphone"
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-[15px] focus:outline-none focus:ring-4 focus:ring-[#1B1F3B]/5 focus:border-[#1B1F3B] transition-all font-medium"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#1B1F3B] mb-2 px-1">Mot de passe</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors group-focus-within:text-[#1B1F3B]" size={20} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-12 pr-12 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-[15px] focus:outline-none focus:ring-4 focus:ring-[#1B1F3B]/5 focus:border-[#1B1F3B] transition-all font-medium"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#1B1F3B] transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded border-[#E2E8F0] text-[#1B1F3B] focus:ring-[#1B1F3B]/20" />
                                <span className="text-sm font-medium text-[#64748B] group-hover:text-[#1B1F3B] transition-colors">Rester connecté</span>
                            </label>
                            <button type="button" className="text-sm font-bold text-[#1B1F3B] hover:text-primary transition-colors">
                                Perdu ?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#1B1F3B] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#2D3663] transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 shadow-xl shadow-[#1B1F3B]/20"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Se connecter</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-[#E2E8F0] text-center">
                        <p className="text-[#64748B] text-sm font-medium">
                            Nouveau sur Baraka Shop ?{' '}
                            <Link href="/register" className="text-[#1B1F3B] font-bold hover:text-primary transition-colors inline-flex items-center gap-1 group">
                                Créer un compte
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-8 text-center text-[#94A3B8] text-xs font-medium uppercase tracking-widest">
                    &copy; 2024 Baraka Shop Senegal - Tous droits réservés
                </div>
            </motion.div>
        </div>
    );
}
