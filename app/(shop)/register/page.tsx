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
    ShieldCheck,
    Eye,
    EyeOff,
    ArrowRight,
    CheckCircle2,
    Shield
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
                const loginRes = await signIn('credentials', {
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

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-12 rounded-[3rem] shadow-2xl text-center max-w-sm"
                >
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                        <CheckCircle2 size={48} />
                    </div>
                    <h2 className="text-2xl font-bold text-[#1B1F3B] mb-2">Compte créé !</h2>
                    <p className="text-gray-500 mb-8">Vous allez être redirigé vers la page de connexion...</p>
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-500" />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 bg-[radial-gradient(#E2E8F0_1px,transparent_1px)] [background-size:20px_20px]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Banner/Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1B1F3B] rounded-2xl shadow-xl shadow-gray-200 mb-4">
                        <ShieldCheck size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-[#1B1F3B] tracking-tight">Inscription</h1>
                    <p className="text-[#64748B] mt-2 font-medium">Rejoignez la communauté Baraka Shop</p>
                </div>

                {/* Form Card */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-[#E2E8F0] shadow-2xl shadow-gray-200/50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -translate-x-12 -translate-y-12" />

                    <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
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
                            <label className="block text-sm font-bold text-[#1B1F3B] mb-2 px-1">Nom d'utilisateur</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors group-focus-within:text-[#1B1F3B]" size={20} />
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="ex: baraka_user"
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-[15px] focus:outline-none focus:ring-4 focus:ring-[#1B1F3B]/5 focus:border-[#1B1F3B] transition-all font-medium"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#1B1F3B] mb-2 px-1">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors group-focus-within:text-[#1B1F3B]" size={20} />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="votre@email.com"
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-[15px] focus:outline-none focus:ring-4 focus:ring-[#1B1F3B]/5 focus:border-[#1B1F3B] transition-all font-medium"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#1B1F3B] mb-2 px-1">Téléphone (Optionnel)</label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors group-focus-within:text-[#1B1F3B]" size={20} />
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="77 000 00 00"
                                    className="w-full pl-12 pr-4 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-[15px] focus:outline-none focus:ring-4 focus:ring-[#1B1F3B]/5 focus:border-[#1B1F3B] transition-all font-medium"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#1B1F3B] mb-2 px-1 text-xs">Mot de passe</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors group-focus-within:text-[#1B1F3B]" size={20} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-12 pr-12 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-[15px] focus:outline-none focus:ring-4 focus:ring-[#1B1F3B]/5 focus:border-[#1B1F3B] transition-all font-medium"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#1B1F3B] transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            {/* Password Strength Indicator */}
                            {formData.password && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-3 px-1"
                                >
                                    <div className="flex gap-1.5 h-1.5">
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
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2 block">
                                        {formData.password.length > 8 ? "Sécurisé" : formData.password.length > 5 ? "Normal" : "Trop court"}
                                    </span>
                                </motion.div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#1B1F3B] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#2D3663] transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 shadow-xl shadow-[#1B1F3B]/20 pt-6"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>S'inscrire</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-[#E2E8F0] text-center">
                        <p className="text-[#64748B] text-sm font-medium">
                            Déjà membre ?{' '}
                            <Link href="/login" className="text-[#1B1F3B] font-bold hover:text-primary transition-colors inline-flex items-center gap-1 group">
                                Se connecter
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
