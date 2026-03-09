'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Container } from '@/ui/Container';
import {
    User,
    Package,
    Heart,
    MapPin,
    Settings,
    LogOut,
    ChevronRight,
    Clock,
    CreditCard,
    Shield,
    Save,
    Phone,
    Mail,
    User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { updateProfile } from '@/lib/actions/user-actions';
import { signOut } from 'next-auth/react';

export default function AccountContent({ user }: { user: any }) {
    const [activeTab, setActiveTab] = useState('orders');
    const [isUpdating, setIsUpdating] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Profile state
    const [profileData, setProfileData] = useState({
        username: user.username || '',
        phone: user.phone || '',
        address: user.address || ''
    });

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        setMessage({ type: '', text: '' });

        const result = await updateProfile(profileData);

        if (result.success) {
            setMessage({ type: 'success', text: 'Profil mis à jour avec succès' });
        } else {
            setMessage({ type: 'error', text: result.error || 'Erreur lors de la mise à jour' });
        }
        setIsUpdating(false);
    };

    const menuItems = [
        { id: 'orders', label: 'Mes Commandes', icon: Package },
        { id: 'wishlist', label: 'Liste d\'envies', icon: Heart },
        { id: 'profile', label: 'Mon Profil', icon: UserIcon },
        { id: 'settings', label: 'Paramètres', icon: Settings },
    ];

    return (
        <main className="bg-[#f8f9fb] min-h-screen py-12 md:py-20">
            <Container>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Sidebar / Profile Info */}
                    <div className="lg:col-span-4 flex flex-col gap-8">
                        {/* Profile Card Summary */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[2rem] p-6 md:p-10 border border-gray-100 shadow-sm flex flex-col items-center text-center"
                        >
                            <div className="relative w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-primary/10 p-1 bg-gray-50 flex items-center justify-center">
                                <UserIcon className="w-16 h-16 text-gray-300" />
                            </div>
                            <h2 className="text-2xl font-black text-[#1B1F3B] uppercase tracking-tighter mb-1">
                                {user.username || "Client"}
                            </h2>
                            <p className="text-gray-400 text-sm mb-6">{user.email}</p>

                            <div className="flex items-center gap-3 text-[10px] font-black uppercase text-gray-400 tracking-widest mb-6">
                                <Shield className="w-4 h-4 text-emerald-500" /> Compte {user.role}
                            </div>

                            {user.role === 'ADMIN' && (
                                <Link
                                    href="/admin"
                                    className="w-full h-14 bg-orange-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#1B1F3B] hover:shadow-xl hover:shadow-gray-200 transition-all shadow-lg shadow-orange-500/20 active:scale-95 group"
                                >
                                    <Shield className="w-4 h-4 group-hover:animate-pulse" />
                                    <span>Accéder au Panel Admin</span>
                                </Link>
                            )}
                        </motion.div>

                        {/* Navigation Menu */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm py-4"
                        >
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={cn(
                                        "w-full px-10 py-5 flex items-center justify-between transition-all group border-l-4",
                                        activeTab === item.id
                                            ? "bg-primary/5 border-primary text-[#1B1F3B]"
                                            : "border-transparent text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-primary" : "text-gray-300 group-hover:text-gray-400")} />
                                        <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                                    </div>
                                    <ChevronRight className={cn("w-4 h-4 transition-transform", activeTab === item.id && "translate-x-1")} />
                                </button>
                            ))}
                            <div className="mx-10 my-4 h-px bg-gray-50" />
                            <button
                                onClick={() => signOut()}
                                className="w-full px-10 py-5 flex items-center gap-4 text-red-500 hover:bg-red-50 transition-all"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="text-[11px] font-black uppercase tracking-widest">Déconnexion</span>
                            </button>
                        </motion.div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-8">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-[2rem] p-6 md:p-12 border border-gray-100 shadow-sm min-h-[600px]"
                        >
                            {activeTab === 'orders' && (
                                <div className="flex flex-col gap-10">
                                    <h3 className="text-2xl font-black text-[#1B1F3B] uppercase tracking-tighter">Mes Commandes</h3>

                                    {user.orders.length > 0 ? (
                                        <div className="flex flex-col gap-6">
                                            {user.orders.map((order: any) => (
                                                <OrderCard key={order.id} order={order} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                                            <Package className="w-16 h-16 text-gray-200 mb-4" />
                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Aucune commande trouvée</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'wishlist' && (
                                <div className="flex flex-col gap-10">
                                    <h3 className="text-2xl font-black text-[#1B1F3B] uppercase tracking-tighter">Ma Liste d'envies</h3>

                                    {user.wishlist.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {user.wishlist.map((product: any) => (
                                                <div key={product.id} className="border border-gray-100 rounded-3xl p-6">
                                                    {/* Product content would go here */}
                                                    <p className="font-bold">{product.name}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                                            <Heart className="w-16 h-16 text-gray-200 mb-4" />
                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Votre liste est vide</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'profile' && (
                                <div className="flex flex-col gap-10">
                                    <h3 className="text-2xl font-black text-[#1B1F3B] uppercase tracking-tighter">Informations Personnelles</h3>

                                    <form onSubmit={handleUpdateProfile} className="flex flex-col gap-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Username */}
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Nom d'utilisateur</label>
                                                <div className="relative">
                                                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                                                    <input
                                                        type="text"
                                                        value={profileData.username}
                                                        onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:border-primary outline-none transition-all font-bold text-[#1B1F3B]"
                                                        placeholder="Votre nom d'utilisateur"
                                                    />
                                                </div>
                                            </div>

                                            {/* Phone */}
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Téléphone</label>
                                                <div className="relative">
                                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                                                    <input
                                                        type="text"
                                                        value={profileData.phone}
                                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:border-primary outline-none transition-all font-bold text-[#1B1F3B]"
                                                        placeholder="+221 ..."
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Address */}
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Adresse de livraison</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-6 text-gray-300 w-5 h-5" />
                                                <textarea
                                                    rows={3}
                                                    value={profileData.address}
                                                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:border-primary outline-none transition-all font-bold text-[#1B1F3B] resize-none"
                                                    placeholder="Votre adresse complète..."
                                                />
                                            </div>
                                        </div>

                                        {message.text && (
                                            <div className={cn(
                                                "p-4 rounded-xl text-xs font-bold uppercase tracking-widest text-center",
                                                message.type === 'success' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                                            )}>
                                                {message.text}
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={isUpdating}
                                            className="bg-[#1B1F3B] text-white h-16 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary transition-all disabled:opacity-50"
                                        >
                                            <Save size={18} />
                                            {isUpdating ? "Mise à jour..." : "Enregistrer les modifications"}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <div className="flex flex-col items-center justify-center h-[400px] text-center gap-6">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                                        <Settings className="w-10 h-10" />
                                    </div>
                                    <h4 className="text-xl font-black text-[#1B1F3B] uppercase tracking-tight">Paramètres de sécurité</h4>
                                    <p className="text-gray-400 text-sm max-w-xs">Le changement de mot de passe et l'authentification à deux facteurs seront disponibles prochainement.</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </Container>
        </main>
    );
}

function OrderCard({ order }: { order: any }) {
    const statusColors: any = {
        PENDING: 'bg-yellow-500',
        COMPLETED: 'bg-green-500',
        CANCELLED: 'bg-red-500',
        SHIPPED: 'bg-blue-500'
    };

    return (
        <div className="group border border-gray-100 rounded-3xl p-8 hover:border-primary/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-[#1B1F3B] shrink-0">
                    <Package className="w-6 h-6" />
                </div>
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <span className="text-lg font-black text-[#1B1F3B] tracking-tight uppercase">#{order.id.slice(0, 8)}</span>
                        <div className={cn("px-2.5 py-1 rounded-md text-[8px] font-black text-white uppercase tracking-widest", statusColors[order.status] || 'bg-gray-400')}>
                            {order.status}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Commandé le {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:items-end gap-1">
                <span className="text-xl font-black text-[#1B1F3B] tracking-tighter">
                    {order.total.toLocaleString()} CFA
                </span>
            </div>

            <button className="h-12 px-6 rounded-xl bg-gray-50 text-[#1B1F3B] font-black text-[10px] uppercase tracking-widest hover:bg-[#1B1F3B] hover:text-white transition-all">
                Détails
            </button>
        </div>
    );
}
