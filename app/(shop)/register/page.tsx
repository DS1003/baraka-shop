'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import {
    User,
    Mail,
    Phone,
    Lock,
    Loader2,
    AlertCircle,
    Eye,
    EyeOff,
    ArrowRight,
    CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Une erreur est survenue");
            } else {
                setIsSuccess(true);
                // Auto-login
                await signIn('credentials', {
                    redirect: false,
                    email: formData.email,
                    password: formData.password,
                });

                setTimeout(() => {
                    router.push('/boutique');
                    router.refresh();
                }, 2000);
            }
        } catch (err) {
            setError('Une erreur est survenue.');
        } finally {
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

    if (isSuccess) {
        return (
            <div className="relative min-h-[calc(100vh-180px)] flex flex-col items-center justify-start pt-16 pb-16 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#E2E8F0_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/95 backdrop-blur-md p-8 sm:p-10 rounded-2xl border border-gray-100/80 shadow-[0_12px_40px_-12px_rgba(27,31,59,0.08)] text-center max-w-[390px] w-full relative z-10"
                >
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                        <CheckCircle2 size={36} />
                    </div>
                    <h2 className="text-xl font-bold text-[#1B1F3B] mb-1">Compte créé !</h2>
                    <p className="text-gray-500 text-xs mb-6">Vous allez être redirigé vers la boutique...</p>
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-green-500" />
                </motion.div>
            </div>
        );
    }

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
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B1F3B] tracking-tight">Inscription</h1>
                    <p className="text-[#64748B] text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mt-2">Rejoignez la communauté Baraka Shop</p>
                </motion.div>

                {/* Form Card */}
                <motion.div 
                    variants={itemVariants}
                    className="bg-white/95 backdrop-blur-md p-6 sm:p-7 rounded-2xl border border-gray-100/80 shadow-[0_12px_40px_-12px_rgba(27,31,59,0.08)] relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -translate-x-12 -translate-y-12" />

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
                            <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5 px-1">Nom d'utilisateur</label>
                            <div className="relative group">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#1B1F3B]" size={16} />
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="ex: baraka_user"
                                    required
                                    className="w-full h-11 pl-10 pr-4 bg-slate-50/50 focus:bg-white border border-slate-200 rounded-lg text-base sm:text-sm focus:outline-none focus:ring-4 focus:ring-[#1B1F3B]/5 focus:border-[#1B1F3B] transition-all duration-300 font-medium text-[#1B1F3B] placeholder-gray-400"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5 px-1">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#1B1F3B]" size={16} />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="votre@email.com"
                                    required
                                    className="w-full h-11 pl-10 pr-4 bg-slate-50/50 focus:bg-white border border-slate-200 rounded-lg text-base sm:text-sm focus:outline-none focus:ring-4 focus:ring-[#1B1F3B]/5 focus:border-[#1B1F3B] transition-all duration-300 font-medium text-[#1B1F3B] placeholder-gray-400"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5 px-1">Téléphone (Optionnel)</label>
                            <div className="relative group">
                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#1B1F3B]" size={16} />
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="77 000 00 00"
                                    className="w-full h-11 pl-10 pr-4 bg-slate-50/50 focus:bg-white border border-slate-200 rounded-lg text-base sm:text-sm focus:outline-none focus:ring-4 focus:ring-[#1B1F3B]/5 focus:border-[#1B1F3B] transition-all duration-300 font-medium text-[#1B1F3B] placeholder-gray-400"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5 px-1">Mot de passe</label>
                            <div className="relative group">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#1B1F3B]" size={16} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="••••••••"
                                    required
                                    className="w-full h-11 pl-10 pr-10 bg-slate-50/50 focus:bg-white border border-slate-200 rounded-lg text-base sm:text-sm focus:outline-none focus:ring-4 focus:ring-[#1B1F3B]/5 focus:border-[#1B1F3B] transition-all duration-300 font-medium text-[#1B1F3B] placeholder-gray-400"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1B1F3B] transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>

                            {/* Password Strength Indicator */}
                            {formData.password && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-3 px-1"
                                >
                                    <div className="flex gap-1.5 h-1">
                                        {[1, 2, 3, 4].map((step) => {
                                            const strength = formData.password.length > 8 ? 4 : formData.password.length > 5 ? 3 : formData.password.length > 3 ? 2 : 1;
                                            return (
                                                <div
                                                    key={step}
                                                    className={cn(
                                                        "flex-1 rounded-full transition-all duration-500",
                                                        step <= strength
                                                            ? (strength <= 2 ? "bg-red-400" : strength === 3 ? "bg-yellow-400" : "bg-green-500")
                                                            : "bg-gray-100"
                                                    )}
                                                />
                                            );
                                        })}
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 mt-1.5 block">
                                        {formData.password.length > 8 ? "Sécurisé" : formData.password.length > 5 ? "Normal" : "Trop court"}
                                    </span>
                                </motion.div>
                            )}
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
                                        <span>S'inscrire</span>
                                        <ArrowRight size={14} />
                                    </>
                                )}
                            </motion.button>
                        </motion.div>
                    </form>

                    <motion.div variants={itemVariants} className="mt-5 pt-4 border-t border-slate-100 text-center">
                        <p className="text-[#64748B] text-xs font-medium">
                            Déjà membre ?{' '}
                            <Link href="/login" className="text-[#1B1F3B] font-bold hover:text-primary transition-colors inline-flex items-center gap-0.5 group">
                                Se connecter
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
