'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
    Settings,
    Bell,
    Lock,
    Globe,
    CreditCard,
    User,
    Shield,
    Store,
    Smartphone,
    Mail,
    ChevronRight,
    Search,
    Save,
    Camera,
    Check,
    Loader2,
    LogOut,
    Key,
    UserCheck,
    History,
    SmartphoneNfc,
    Trash2,
    Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getUserSettings, updateUserSettings } from '@/lib/actions/user-actions';
import { signOut } from 'next-auth/react';
import { SiteMaintenancePanel } from './_components/SiteMaintenancePanel';
import { SiteLogosPanel } from './_components/SiteLogosPanel';

export default function SettingsPage() {
    const [activeSection, setActiveSection] = useState('Boutique');
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    // Form States
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        phone: '',
        bio: '',
        avatar: null as string | null
    });

    const [notifSettings, setNotifSettings] = useState({
        emails: true,
        push: true,
        sms: false,
        reports: true,
        marketing: false
    });

    const [securitySettings, setSecuritySettings] = useState({
        twoFactor: false,
        loginAlerts: true,
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setMounted(true);
        const fetchData = async () => {
            const data = await getUserSettings();
            if (data) {
                // Split username into first/last if needed, or just use as is
                setProfileData({
                    firstName: data.username?.split(' ')[0] || '',
                    lastName: data.username?.split(' ').slice(1).join(' ') || '',
                    username: data.username || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    bio: (data as any).metadata?.bio || '',
                    avatar: data.image || null
                });
                setNotifSettings(data.settings.notifications);
                setSecuritySettings(data.settings.security);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await updateUserSettings({
                profile: {
                    username: `${profileData.firstName} ${profileData.lastName}`.trim(),
                    phone: profileData.phone,
                    email: profileData.email,
                    image: profileData.avatar || undefined,
                },
                settings: {
                    notifications: notifSettings,
                    security: securitySettings
                }
            });

            if (res.success) {
                toast.success('Configurations mises à jour avec succès !');
            } else {
                toast.error(res.error || 'Erreur lors de la mise à jour.');
            }
        } catch (error) {
            toast.error('Une erreur est survenue.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileData(prev => ({ ...prev, avatar: reader.result as string }));
                toast.info('Aperçu de l\'avatar mis à jour.');
            };
            reader.readAsDataURL(file);
        }
    };

    if (!mounted) return null;

    const sections = [
        { id: 'Boutique', icon: Store, label: 'Site & Boutique', desc: 'Maintenance et disponibilité du site' },
        { id: 'Profil', icon: User, label: 'Profil Personnel', desc: 'Identité et informations de contact' },
        { id: 'Notifications', icon: Bell, label: 'Notifications', desc: 'Alertes et préférences d\'envoi' },
        { id: 'Sécurité', icon: Lock, label: 'Sécurité & Accès', desc: 'Mots de passe et authentification' },
        { id: 'Localisation', icon: Globe, label: 'Zone & Langues', desc: 'Région et langue d\'interface' },
        { id: 'Paiements', icon: CreditCard, label: 'Paiements', desc: 'Méthodes de règlement et factures' },
        { id: 'Confidentialité', icon: Shield, label: 'Confidentialité', desc: 'Gestion des données privées' },
    ];

    return (
        <div className="max-w-[1400px] mx-auto pb-20">
            {/* Minimal Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-slate-100 pb-8">
                <div className="space-y-1">
                    <h1 className="text-[28px] font-black text-slate-900 tracking-tight">
                        Centre <span className="text-orange-600">Paramètres.</span>
                    </h1>
                    <p className="text-[13px] text-slate-400 font-medium uppercase tracking-widest">
                        Configuration globale du compte administrateur
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={isSaving || loading}
                    className="flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-[13px] hover:bg-orange-600 transition-all shadow-xl shadow-slate-100 disabled:opacity-50"
                >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    <span>{isSaving ? 'Sauvegarde...' : 'Enregistrer les modifications'}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Navigation Sidebar */}
                <div className="lg:col-span-3 space-y-2">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={cn(
                                "w-full flex items-center gap-4 p-4 rounded-2xl transition-all group text-left",
                                activeSection === section.id
                                    ? "bg-white border border-slate-100 shadow-xl shadow-slate-100/50 text-slate-900"
                                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50/50"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                activeSection === section.id ? "bg-orange-600 text-white shadow-lg shadow-orange-100" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                            )}>
                                <section.icon size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="text-[14px] font-black leading-none mb-1">{section.label}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{section.id}</p>
                            </div>
                            {activeSection === section.id && (
                                <motion.div layoutId="active-indicator" className="ml-auto">
                                    <ChevronRight size={16} className="text-orange-600" />
                                </motion.div>
                            )}
                        </button>
                    ))}

                    <div className="pt-8 mt-8 border-t border-slate-100">
                        <button 
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <LogOut size={20} strokeWidth={2.5} />
                            </div>
                            <span className="text-[14px] font-black">Déconnexion</span>
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-9">
                    {loading ? (
                        <div className="bg-white rounded-[32px] border border-slate-100 h-96 flex flex-col items-center justify-center text-slate-400 gap-4">
                            <Loader2 size={32} className="animate-spin text-orange-600" />
                            <p className="text-[11px] font-black uppercase tracking-widest">Chargement de vos préférences...</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeSection}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white rounded-[32px] border border-slate-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] overflow-hidden"
                            >
                                {/* Section Header */}
                                <div className="p-10 border-b border-slate-50 bg-slate-50/30">
                                    <h2 className="text-[20px] font-black text-slate-900 tracking-tight">
                                        {sections.find(s => s.id === activeSection)?.label}
                                    </h2>
                                    <p className="text-[13px] text-slate-400 font-medium mt-1">
                                        {sections.find(s => s.id === activeSection)?.desc}
                                    </p>
                                </div>

                                <div className="p-10">
                                    {activeSection === 'Boutique' && (
                                        <div className="space-y-10">
                                            <SiteMaintenancePanel />
                                            <div className="border-t border-slate-100 pt-10">
                                                <SiteLogosPanel />
                                            </div>
                                        </div>
                                    )}

                                    {activeSection === 'Profil' && (
                                        <div className="space-y-12">
                                            {/* Avatar Section */}
                                            <div className="flex flex-col sm:flex-row items-center gap-10 bg-slate-50/50 p-8 rounded-3xl border border-slate-100">
                                                <div className="relative group">
                                                    <div className="w-32 h-32 rounded-[48px] bg-slate-900 flex items-center justify-center text-white font-black text-4xl shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                                                        {profileData.avatar ? (
                                                            <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span>{profileData.firstName[0] || 'A'}{profileData.lastName[0] || 'B'}</span>
                                                        )}
                                                    </div>
                                                    <button 
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-xl hover:bg-slate-900 transition-all border-4 border-white group-hover:rotate-12"
                                                    >
                                                        <Camera size={20} />
                                                    </button>
                                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                                </div>
                                                <div className="space-y-4 text-center sm:text-left flex-1">
                                                    <div>
                                                        <h3 className="text-[20px] font-black text-slate-900">{profileData.firstName || 'Administrateur'} {profileData.lastName}</h3>
                                                        <p className="text-[13px] text-slate-400 font-bold uppercase tracking-widest mt-1">Super Admin · Baraka Shop</p>
                                                    </div>
                                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600">
                                                            <Mail size={14} className="text-slate-300" />
                                                            {profileData.email}
                                                        </div>
                                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600">
                                                            <Smartphone size={14} className="text-slate-300" />
                                                            {profileData.phone || 'Non renseigné'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Form Fields */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <SettingsInput 
                                                    label="Prénom" 
                                                    value={profileData.firstName} 
                                                    onChange={(v: string) => setProfileData({...profileData, firstName: v})} 
                                                />
                                                <SettingsInput 
                                                    label="Nom" 
                                                    value={profileData.lastName} 
                                                    onChange={(v: string) => setProfileData({...profileData, lastName: v})} 
                                                />
                                                <SettingsInput 
                                                    label="Adresse Email" 
                                                    value={profileData.email} 
                                                    icon={Mail} 
                                                    onChange={(v: string) => setProfileData({...profileData, email: v})} 
                                                />
                                                <SettingsInput 
                                                    label="Numéro de téléphone" 
                                                    value={profileData.phone} 
                                                    onChange={(v: string) => setProfileData({...profileData, phone: v})} 
                                                />
                                                <div className="md:col-span-2">
                                                    <SettingsInput 
                                                        label="Bio Professionnelle" 
                                                        value={profileData.bio} 
                                                        isTextArea 
                                                        onChange={(v: string) => setProfileData({...profileData, bio: v})} 
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeSection === 'Notifications' && (
                                        <div className="space-y-8">
                                            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                                                    <Bell size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[14px] font-black text-slate-900">Préférences de Canaux</p>
                                                    <p className="text-[12px] text-slate-400 font-medium">Choisissez comment vous souhaitez être informé des activités de la boutique.</p>
                                                </div>
                                            </div>

                                            <div className="divide-y divide-slate-100 border-y border-slate-100">
                                                <SettingsToggle 
                                                    label="Notifications par Email" 
                                                    desc="Rapports quotidiens, alertes de stock et nouvelles commandes." 
                                                    enabled={notifSettings.emails}
                                                    onChange={(v: boolean) => setNotifSettings({...notifSettings, emails: v})}
                                                />
                                                <SettingsToggle 
                                                    label="Notifications Push" 
                                                    desc="Alertes instantanées sur votre navigateur et mobile." 
                                                    enabled={notifSettings.push}
                                                    onChange={(v: boolean) => setNotifSettings({...notifSettings, push: v})}
                                                />
                                                <SettingsToggle 
                                                    label="Alertes SMS" 
                                                    desc="Uniquement pour les urgences critiques et sécurité." 
                                                    enabled={notifSettings.sms}
                                                    onChange={(v: boolean) => setNotifSettings({...notifSettings, sms: v})}
                                                />
                                                <SettingsToggle 
                                                    label="Rapports Hebdomadaires" 
                                                    desc="Synthèse des performances de vente chaque lundi matin." 
                                                    enabled={notifSettings.reports}
                                                    onChange={(v: boolean) => setNotifSettings({...notifSettings, reports: v})}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {activeSection === 'Sécurité' && (
                                        <div className="space-y-12">
                                            {/* Password Change */}
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Key size={18} className="text-orange-600" />
                                                    <h3 className="text-[16px] font-black text-slate-900">Modifier le mot de passe</h3>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <SettingsInput label="Ancien mot de passe" type="password" placeholder="••••••••" />
                                                    <div className="hidden md:block" />
                                                    <SettingsInput label="Nouveau mot de passe" type="password" placeholder="••••••••" />
                                                    <SettingsInput label="Confirmer le nouveau mot de passe" type="password" placeholder="••••••••" />
                                                </div>
                                                <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-[12px] hover:bg-orange-600 transition-all">
                                                    Mettre à jour le mot de passe
                                                </button>
                                            </div>

                                            {/* 2FA Section */}
                                            <div className="p-8 bg-slate-900 rounded-3xl text-white flex flex-col md:flex-row items-center gap-8 border border-slate-800 shadow-2xl">
                                                <div className="w-20 h-20 rounded-[28px] bg-white/10 flex items-center justify-center flex-shrink-0 backdrop-blur-md border border-white/5">
                                                    <SmartphoneNfc size={32} className="text-orange-500" />
                                                </div>
                                                <div className="flex-1 text-center md:text-left">
                                                    <h3 className="text-[18px] font-black mb-1">Authentification à deux facteurs (2FA)</h3>
                                                    <p className="text-[13px] text-slate-400 font-medium">Ajoutez une couche de sécurité supplémentaire à votre compte en exigeant un code de vérification.</p>
                                                </div>
                                                <button 
                                                    onClick={() => setSecuritySettings({...securitySettings, twoFactor: !securitySettings.twoFactor})}
                                                    className={cn(
                                                        "px-6 py-3 rounded-xl font-black text-[12px] transition-all whitespace-nowrap",
                                                        securitySettings.twoFactor ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white" : "bg-orange-600 text-white hover:bg-orange-700"
                                                    )}
                                                >
                                                    {securitySettings.twoFactor ? "Désactiver le 2FA" : "Configurer le 2FA"}
                                                </button>
                                            </div>

                                            {/* Login Sessions */}
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <History size={18} className="text-orange-600" />
                                                        <h3 className="text-[16px] font-black text-slate-900">Sessions de Connexion</h3>
                                                    </div>
                                                    <button className="text-[11px] font-black text-rose-500 uppercase tracking-widest hover:underline">Déconnecter tous les autres appareils</button>
                                                </div>
                                                <div className="space-y-3">
                                                    <SessionItem device="MacBook Pro · Dakar, SN" browser="Chrome 124.0.0" time="Actuellement actif" isCurrent />
                                                    <SessionItem device="iPhone 15 Pro · Thiès, SN" browser="Safari Mobile" time="Il y a 2 heures" />
                                                    <SessionItem device="Windows PC · Saint-Louis, SN" browser="Firefox 125.0" time="Hier à 14:22" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeSection === 'Paiements' && (
                                        <div className="space-y-10">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Payment Card Mockup */}
                                                <div className="p-8 bg-gradient-to-br from-[#1B1F3B] to-[#0F172A] rounded-[32px] text-white relative overflow-hidden group border border-white/5 shadow-2xl">
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/20 blur-3xl -mr-10 -mt-10" />
                                                    <div className="relative z-10 space-y-12">
                                                        <div className="flex justify-between items-start">
                                                            <div className="w-12 h-8 bg-white/10 rounded-md backdrop-blur-md border border-white/10" />
                                                            <div className="text-[11px] font-black text-orange-500 uppercase tracking-widest">Premium Partner</div>
                                                        </div>
                                                        <div>
                                                            <p className="text-[20px] font-mono tracking-[0.2em] mb-1">••••  ••••  ••••  4492</p>
                                                            <div className="flex justify-between items-end">
                                                                <div>
                                                                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Titulaire</p>
                                                                    <p className="text-[13px] font-bold">BARAKA SHOP GROUP</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Expire</p>
                                                                    <p className="text-[13px] font-bold">08/28</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button className="border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center gap-4 hover:border-orange-500 hover:bg-orange-50/20 transition-all group">
                                                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all">
                                                        <Plus size={24} className="text-slate-400 group-hover:text-orange-600" />
                                                    </div>
                                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Ajouter une méthode</span>
                                                </button>
                                            </div>

                                            <div className="space-y-4 pt-4">
                                                <h3 className="text-[15px] font-black text-slate-900">Historique des Transactions</h3>
                                                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl divide-y divide-slate-100">
                                                    <TransactionItem label="Abonnement Baraka Pro" date="15 Mai 2026" amount="-45,000 F" />
                                                    <TransactionItem label="Crédits Publicitaires Facebook" date="12 Mai 2026" amount="-12,500 F" />
                                                    <TransactionItem label="Frais de Service Stripe" date="10 Mai 2026" amount="-3,200 F" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {(activeSection === 'Localisation' || activeSection === 'Confidentialité') && (
                                        <div className="h-96 flex flex-col items-center justify-center text-slate-400 gap-4 opacity-50">
                                            <Smartphone size={48} strokeWidth={1} />
                                            <p className="text-[14px] font-bold uppercase tracking-[0.3em]">Module en développement</p>
                                            <p className="text-[11px] text-slate-400 font-medium">Bientôt disponible dans votre interface.</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
}

function SettingsInput({ label, value, onChange, icon: Icon, placeholder, type = "text", isTextArea = false }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            <div className="relative group">
                {isTextArea ? (
                    <textarea
                        value={value}
                        onChange={(e) => onChange?.(e.target.value)}
                        placeholder={placeholder}
                        rows={4}
                        className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all text-[14px] font-bold text-slate-900 resize-none scrollbar-thin"
                    />
                ) : (
                    <div className="relative">
                        <input
                            type={type}
                            value={value}
                            onChange={(e) => onChange?.(e.target.value)}
                            placeholder={placeholder}
                            className={cn(
                                "w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all text-[14px] font-bold text-slate-900",
                                Icon && "pl-12"
                            )}
                        />
                        {Icon && <Icon size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors" />}
                    </div>
                )}
            </div>
        </div>
    );
}

function SettingsToggle({ label, desc, enabled, onChange }: any) {
    return (
        <div className="flex items-center justify-between py-6 group">
            <div className="space-y-1 pr-10">
                <h4 className="text-[15px] font-black text-slate-900 group-hover:text-orange-600 transition-colors">{label}</h4>
                <p className="text-[12px] text-slate-400 font-medium leading-relaxed">{desc}</p>
            </div>
            <button
                onClick={() => onChange?.(!enabled)}
                className={cn(
                    "w-[56px] h-[30px] rounded-full relative transition-all duration-500 p-1 flex-shrink-0 border",
                    enabled ? "bg-orange-600 border-orange-500 shadow-lg shadow-orange-100" : "bg-slate-100 border-slate-200"
                )}>
                <motion.div
                    layout
                    initial={false}
                    animate={{ x: enabled ? 26 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="w-[22px] h-[22px] rounded-full bg-white shadow-sm"
                />
            </button>
        </div>
    );
}

function SessionItem({ device, browser, time, isCurrent }: any) {
    return (
        <div className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:border-slate-200 transition-all">
            <div className="flex items-center gap-4">
                <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    isCurrent ? "bg-emerald-50 text-emerald-600" : "bg-slate-200 text-slate-500"
                )}>
                    {isCurrent ? <UserCheck size={18} /> : <Smartphone size={18} />}
                </div>
                <div>
                    <p className="text-[13px] font-black text-slate-900">{device}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{browser} · {time}</p>
                </div>
            </div>
            {!isCurrent && (
                <button className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                    <Trash2 size={16} />
                </button>
            )}
        </div>
    );
}

function TransactionItem({ label, date, amount }: any) {
    return (
        <div className="flex items-center justify-between p-5 group hover:bg-white transition-all">
            <div>
                <p className="text-[13px] font-black text-slate-900">{label}</p>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{date}</p>
            </div>
            <p className="text-[14px] font-black text-slate-900 tabular-nums">{amount}</p>
        </div>
    );
}
