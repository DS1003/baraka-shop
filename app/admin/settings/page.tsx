'use client';

import React, { useState } from 'react';
import {
    Settings,
    Bell,
    Lock,
    Globe,
    CreditCard,
    User,
    Shield,
    Smartphone,
    Mail,
    ChevronRight,
    Search,
    Save,
    Camera,
    Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
    const [activeSection, setActiveSection] = useState('Profil');
    const [toggles, setToggles] = useState({
        emailNotifications: true,
        realtime: true,
        security2fa: false,
    });

    return (
        <div className="space-y-12">
            {/* Page Header: Clean & Actionable */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-2 border-b border-slate-200/40">
                <div className="space-y-1.5">
                    <h1 className="text-[36px] font-bold text-slate-900 tracking-tight leading-tight">
                        Centre <span className="text-orange-600">Configuration.</span>
                    </h1>
                    <p className="text-[15px] text-slate-500 font-medium">
                        Personnalisez votre environnement de travail et gérez vos protocoles de sécurité.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-3 px-8 py-3 bg-orange-600 text-white rounded-xl font-bold text-[13px] hover:bg-orange-700 hover:shadow-xl hover:shadow-orange-200 transition-all shadow-lg shadow-orange-100 group">
                        <Save size={18} />
                        <span>Appliquer les changements</span>
                    </button>
                </div>
            </div>

            {/* Layout Grid: Sidebar Navigation Style */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Sidebar Navigation: Premium Pill Style */}
                <div className="lg:col-span-1 space-y-2">
                    <SettingsNavItem
                        icon={User}
                        label="Profil"
                        active={activeSection === 'Profil'}
                        onClick={() => setActiveSection('Profil')}
                    />
                    <SettingsNavItem
                        icon={Bell}
                        label="Notifications"
                        active={activeSection === 'Notifications'}
                        onClick={() => setActiveSection('Notifications')}
                    />
                    <SettingsNavItem
                        icon={Lock}
                        label="Sécurité"
                        active={activeSection === 'Sécurité'}
                        onClick={() => setActiveSection('Sécurité')}
                    />
                    <SettingsNavItem
                        icon={Globe}
                        label="Localisation"
                        active={activeSection === 'Localisation'}
                        onClick={() => setActiveSection('Localisation')}
                    />
                    <SettingsNavItem
                        icon={CreditCard}
                        label="Paiements"
                        active={activeSection === 'Paiements'}
                        onClick={() => setActiveSection('Paiements')}
                    />
                    <SettingsNavItem
                        icon={Shield}
                        label="Confidentialité"
                        active={activeSection === 'Confidentialité'}
                        onClick={() => setActiveSection('Confidentialité')}
                    />
                </div>

                {/* Content Area: Focused & Structured */}
                <div className="lg:col-span-3 space-y-10">
                    {/* Active Section: Profile Example */}
                    <div className="bg-white rounded-[32px] border border-slate-200/50 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] overflow-hidden">
                        <div className="p-10 border-b border-slate-100">
                            <h3 className="text-[20px] font-bold text-slate-900 tracking-tight">Paramètres du Profil</h3>
                            <p className="text-[14px] text-slate-400 font-medium mt-1">Gérez votre identité numérique sur la plateforme.</p>
                        </div>

                        <div className="p-10 space-y-10">
                            {/* Avatar Adjustment */}
                            <div className="flex flex-col sm:flex-row items-center gap-10">
                                <div className="relative group">
                                    <div className="w-28 h-28 rounded-[40px] bg-[#0F172A] flex items-center justify-center text-white font-black text-3xl shadow-2xl group-hover:scale-105 transition-transform duration-500">
                                        SA
                                    </div>
                                    <button className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-xl hover:bg-orange-700 transition-all border-4 border-white group-hover:rotate-12">
                                        <Camera size={20} />
                                    </button>
                                </div>
                                <div className="space-y-3 text-center sm:text-left">
                                    <div>
                                        <h4 className="text-[18px] font-bold text-slate-900">Sarah Ahmed</h4>
                                        <p className="text-[14px] text-slate-400 font-medium">Administrateur Senior · Baraka Shop Group</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button className="text-[12px] font-black text-orange-600 uppercase tracking-widest hover:text-orange-800 transition-colors">Modifier l'avatar</button>
                                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                                        <button className="text-[12px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-700 transition-colors">Supprimer</button>
                                    </div>
                                </div>
                            </div>

                            {/* Inputs Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 pt-4">
                                <SettingsInputGroup label="PRÉNOM" placeholder="Sarah" />
                                <SettingsInputGroup label="NOM" placeholder="Ahmed" />
                                <SettingsInputGroup label="ADRESSE EMAIL Professionnelle" placeholder="sarah@barakashop.com" icon={Mail} />
                                <SettingsInputGroup label="LIGNE DIRECTE" placeholder="+221 77 000 00 00" />
                                <div className="md:col-span-2">
                                    <SettingsInputGroup label="BIO / PRÉSENTATION" placeholder="Passionnée par l'innovation E-commerce et le design minimaliste." isTextArea />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Operational Preferences Card */}
                    <div className="bg-white rounded-[32px] border border-slate-200/50 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] overflow-hidden">
                        <div className="p-10 border-b border-slate-100">
                            <h3 className="text-[20px] font-bold text-slate-900 tracking-tight">Préférences Opérationnelles</h3>
                            <p className="text-[14px] text-slate-400 font-medium mt-1">Personnalisez votre expérience de monitoring.</p>
                        </div>
                        <div className="p-10 divide-y divide-slate-100">
                            <SettingsToggleItem
                                label="Alertes de Revenus Critiques"
                                description="Être notifiée immédiatement en cas de baisse anormale du CA."
                                enabled={toggles.emailNotifications}
                                onToggle={() => setToggles({ ...toggles, emailNotifications: !toggles.emailNotifications })}
                            />
                            <SettingsToggleItem
                                label="Flux Data Temps Réel"
                                description="Mise à jour instantanée des charts sans rechargement (Socket.io)."
                                enabled={toggles.realtime}
                                onToggle={() => setToggles({ ...toggles, realtime: !toggles.realtime })}
                            />
                            <SettingsToggleItem
                                label="Authentification Hardware (FIDO2)"
                                description="Sécuriser l'accès via une clé physique de sécurité."
                                enabled={toggles.security2fa}
                                onToggle={() => setToggles({ ...toggles, security2fa: !toggles.security2fa })}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SettingsNavItem({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center justify-between px-6 py-4 rounded-[20px] transition-all group relative overflow-hidden",
                active
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-100"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}>
            <div className="flex items-center gap-4 relative z-10">
                <Icon size={20} className={cn("transition-colors", active ? "text-white" : "text-slate-400 group-hover:text-slate-900")} />
                <span className="text-[14px] font-bold">{label}</span>
            </div>
            {active && <Check size={18} className="relative z-10" />}
        </button>
    );
}

function SettingsInputGroup({ label, placeholder, icon: Icon, disabled, isTextArea }: { label: string, placeholder: string, icon?: any, disabled?: boolean, isTextArea?: boolean }) {
    return (
        <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</label>
            <div className="relative group/input">
                {isTextArea ? (
                    <textarea
                        placeholder={placeholder}
                        rows={3}
                        className="w-full px-6 py-4 rounded-[18px] border border-slate-200 bg-white transition-all text-[15px] font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 text-slate-900 placeholder:text-slate-300 resize-none"
                    />
                ) : (
                    <input
                        type="text"
                        placeholder={placeholder}
                        disabled={disabled}
                        className={cn(
                            "w-full px-6 py-4 rounded-[18px] border border-slate-200 transition-all text-[15px] font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20",
                            disabled ? "bg-slate-50 text-slate-400 cursor-not-allowed" : "bg-white text-slate-900 placeholder:text-slate-300"
                        )}
                    />
                )}
                {Icon && <Icon size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-orange-500 transition-colors" />}
            </div>
        </div>
    );
}

function SettingsToggleItem({ label, description, enabled, onToggle }: { label: string, description: string, enabled?: boolean, onToggle: () => void }) {
    return (
        <div className="flex items-center justify-between py-8 first:pt-0 last:pb-0 group">
            <div className="space-y-1.5 pr-8">
                <h4 className="text-[16px] font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{label}</h4>
                <p className="text-[14px] text-slate-400 font-medium leading-relaxed">{description}</p>
            </div>
            <button
                onClick={onToggle}
                className={cn(
                    "w-[60px] h-[32px] rounded-full relative transition-all duration-500 p-1 flex-shrink-0",
                    enabled ? "bg-orange-600" : "bg-slate-200"
                )}>
                <motion.div
                    layout
                    initial={false}
                    animate={{ x: enabled ? 28 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="w-[24px] h-[24px] rounded-full bg-white shadow-lg"
                />
            </button>
        </div>
    );
}
