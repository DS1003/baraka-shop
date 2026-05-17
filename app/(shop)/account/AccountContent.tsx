'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Container } from '@/ui/Container';
import {
    Package,
    Heart,
    MapPin,
    Settings,
    LogOut,
    ChevronRight,
    Clock,
    Shield,
    Save,
    Phone,
    User as UserIcon,
    Trash2,
    Lock,
    Bell,
    ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { updateProfile, toggleWishlistAction } from '@/lib/actions/user-actions';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';

export default function AccountContent({ user }: { user: any }) {
    const router = useRouter();
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

        const cleanedData = {
            username: profileData.username.trim(),
            phone: profileData.phone.trim(),
            address: profileData.address.trim()
        };

        const result = await updateProfile(cleanedData);

        if (result.success) {
            setMessage({ type: 'success', text: 'Profil mis à jour avec succès' });
            toast.success('Profil mis à jour avec succès');
            router.refresh();
        } else {
            setMessage({ type: 'error', text: result.error || 'Erreur lors de la mise à jour' });
            toast.error('Erreur lors de la mise à jour');
        }
        setIsUpdating(false);
    };

    const handleRemoveWishlist = async (id: string) => {
        const result = await toggleWishlistAction(id);
        if (result.success) {
            toast.success('Retiré de votre liste d\'envies');
            router.refresh();
        }
    };

    const menuItems = [
        { id: 'orders', label: 'Mes Commandes', icon: Package },
        { id: 'wishlist', label: 'Liste d\'envies', icon: Heart },
        { id: 'profile', label: 'Mon Profil', icon: UserIcon },
        { id: 'settings', label: 'Paramètres', icon: Settings },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="w-full py-8 md:py-12 relative flex-grow">
            <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-orange-50/60 to-transparent pointer-events-none" />
            
            <Container className="relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

                    {/* Sidebar */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white shadow-[0_2px_20px_rgb(0,0,0,0.03)] flex flex-col items-center text-center relative overflow-hidden"
                        >
                            <motion.div 
                                whileHover={{ scale: 1.05 }}
                                className="relative w-20 h-20 rounded-full overflow-hidden mb-4 border-[3px] border-white shadow-md bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center z-10"
                            >
                                <UserIcon className="w-8 h-8 text-gray-300" />
                            </motion.div>
                            
                            <h2 className="text-lg font-black text-[#1B1F3B] uppercase tracking-tight mb-1 relative z-10">
                                {user.username || "Client Privilège"}
                            </h2>
                            <p className="text-gray-500 text-xs font-medium mb-4 relative z-10">{user.email}</p>

                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full mb-4 border border-emerald-100/50">
                                <Shield className="w-3 h-3" /> {user.role === 'ADMIN' ? 'Administrateur' : 'Membre'}
                            </div>

                            {user.role === 'ADMIN' && (
                                <Link
                                    href="/admin"
                                    className="w-full h-10 bg-[#1B1F3B] text-white rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-orange-500 transition-all shadow-md active:scale-95"
                                >
                                    <Settings className="w-3.5 h-3.5" />
                                    <span>Panel Administrateur</span>
                                </Link>
                            )}
                        </motion.div>

                        {/* Menu Navigation */}
                        <motion.nav
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/80 backdrop-blur-md rounded-3xl p-2 border border-white shadow-[0_2px_20px_rgb(0,0,0,0.03)] flex flex-col gap-1"
                        >
                            {menuItems.map((item) => {
                                const isActive = activeTab === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={cn(
                                            "relative w-full px-5 py-3 flex items-center gap-3 transition-all duration-300 rounded-2xl group outline-none",
                                            isActive ? "text-orange-600" : "text-gray-500 hover:text-[#1B1F3B]"
                                        )}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-tab-bg"
                                                className="absolute inset-0 bg-orange-50/80 rounded-2xl border border-orange-100/50"
                                                initial={false}
                                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                            />
                                        )}
                                        <div className="relative z-10 flex items-center gap-3 w-full">
                                            <item.icon className={cn(
                                                "w-4 h-4 transition-transform duration-300", 
                                                isActive ? "text-orange-500" : "group-hover:scale-110 group-hover:text-[#1B1F3B]"
                                            )} />
                                            <span className="text-[11px] font-bold uppercase tracking-widest flex-1 text-left">{item.label}</span>
                                        </div>
                                    </button>
                                );
                            })}
                            
                            <div className="mx-4 my-2 h-px bg-gray-100" />
                            
                            <button
                                onClick={() => signOut()}
                                className="w-full px-5 py-3 flex items-center gap-3 text-red-500 hover:text-red-600 hover:bg-red-50/50 rounded-2xl transition-all"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="text-[11px] font-bold uppercase tracking-widest">Déconnexion</span>
                            </button>
                        </motion.nav>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10, filter: 'blur(2px)' }}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, y: -10, filter: 'blur(2px)' }}
                                transition={{ duration: 0.25 }}
                                className="bg-white/90 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white shadow-[0_2px_20px_rgb(0,0,0,0.03)] min-h-[500px]"
                            >
                                {activeTab === 'orders' && (
                                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-6">
                                        <div className="border-b border-gray-100 pb-4">
                                            <h3 className="text-2xl font-black text-[#1B1F3B] uppercase tracking-tight mb-1">Historique</h3>
                                            <p className="text-xs text-gray-500">Suivez et gérez vos commandes récentes.</p>
                                        </div>

                                        {user.orders.length > 0 ? (
                                            <div className="flex flex-col gap-4">
                                                {user.orders.map((order: any) => (
                                                    <motion.div key={order.id} variants={itemVariants}>
                                                        <OrderCard order={order} />
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <motion.div variants={itemVariants} className="flex flex-col items-center justify-center py-20 text-center">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                    <Package className="w-8 h-8 text-gray-300" />
                                                </div>
                                                <p className="text-xs font-bold text-[#1B1F3B] uppercase tracking-widest mb-1">Aucune commande</p>
                                                <p className="text-gray-400 text-xs">Vous n'avez pas encore effectué d'achats.</p>
                                                <Link href="/store" className="mt-6 h-10 px-6 bg-orange-50 text-orange-600 rounded-lg font-bold text-[10px] uppercase tracking-widest flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all active:scale-95">
                                                    Découvrir nos produits
                                                </Link>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'wishlist' && (
                                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-6">
                                        <div className="border-b border-gray-100 pb-4">
                                            <h3 className="text-2xl font-black text-[#1B1F3B] uppercase tracking-tight mb-1">Coups de cœur</h3>
                                            <p className="text-xs text-gray-500">Les articles que vous avez mis de côté.</p>
                                        </div>

                                        {user.wishlist.length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {user.wishlist.map((product: any) => (
                                                    <motion.div key={product.id} variants={itemVariants} className="group relative bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md hover:border-orange-100 transition-all flex items-center gap-4">
                                                        <div className="w-16 h-16 bg-gray-50 rounded-xl flex-shrink-0 flex items-center justify-center">
                                                            <Heart className="w-6 h-6 text-gray-300 group-hover:text-orange-400 transition-colors" />
                                                        </div>
                                                        <div className="flex-1 pr-6">
                                                            <h4 className="font-bold text-sm text-[#1B1F3B] line-clamp-2">{product.name}</h4>
                                                            <Link href={`/product/${product.id}`} className="inline-block mt-1 text-[10px] text-orange-500 font-bold uppercase tracking-widest hover:text-orange-600">
                                                                Voir le produit
                                                            </Link>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleRemoveWishlist(product.id)}
                                                            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center hover:bg-red-500 hover:text-white text-gray-400 transition-colors z-20"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <motion.div variants={itemVariants} className="flex flex-col items-center justify-center py-20 text-center">
                                                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                                    <Heart className="w-8 h-8 text-red-300" />
                                                </div>
                                                <p className="text-xs font-bold text-[#1B1F3B] uppercase tracking-widest mb-1">Liste vide</p>
                                                <p className="text-gray-400 text-xs">Aucun produit dans votre liste d'envies.</p>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'profile' && (
                                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-6">
                                        <div className="border-b border-gray-100 pb-4">
                                            <h3 className="text-2xl font-black text-[#1B1F3B] uppercase tracking-tight mb-1">Mon Profil</h3>
                                            <p className="text-xs text-gray-500">Gérez vos informations personnelles.</p>
                                        </div>

                                        <form onSubmit={handleUpdateProfile} className="flex flex-col gap-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <motion.div variants={itemVariants} className="flex flex-col gap-2">
                                                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Nom d'utilisateur</label>
                                                    <div className="relative">
                                                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                        <input
                                                            type="text"
                                                            value={profileData.username}
                                                            onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-orange-500 outline-none transition-all text-sm font-bold text-[#1B1F3B]"
                                                            placeholder="Nom"
                                                        />
                                                    </div>
                                                </motion.div>

                                                <motion.div variants={itemVariants} className="flex flex-col gap-2">
                                                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Téléphone</label>
                                                    <div className="relative">
                                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                        <input
                                                            type="text"
                                                            value={profileData.phone}
                                                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-orange-500 outline-none transition-all text-sm font-bold text-[#1B1F3B]"
                                                            placeholder="+221 ..."
                                                        />
                                                    </div>
                                                </motion.div>
                                            </div>

                                            <motion.div variants={itemVariants} className="flex flex-col gap-2">
                                                <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Adresse de livraison</label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-4 text-gray-400 w-4 h-4" />
                                                    <textarea
                                                        rows={2}
                                                        value={profileData.address}
                                                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-orange-500 outline-none transition-all text-sm font-bold text-[#1B1F3B] resize-none"
                                                        placeholder="Votre adresse complète..."
                                                    />
                                                </div>
                                            </motion.div>

                                            <motion.div variants={itemVariants}>
                                                <button
                                                    type="submit"
                                                    disabled={isUpdating}
                                                    className="w-full sm:w-auto px-8 h-12 bg-[#1B1F3B] text-white rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-orange-500 transition-all disabled:opacity-50 active:scale-95"
                                                >
                                                    {isUpdating ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                                                    <span>Enregistrer</span>
                                                </button>
                                            </motion.div>
                                        </form>
                                    </motion.div>
                                )}

                                {activeTab === 'settings' && (
                                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-6">
                                        <div className="border-b border-gray-100 pb-4">
                                            <h3 className="text-2xl font-black text-[#1B1F3B] uppercase tracking-tight mb-1">Paramètres</h3>
                                            <p className="text-xs text-gray-500">Gérez vos préférences de sécurité et de notification.</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <motion.div variants={itemVariants} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                                                        <Lock className="w-4 h-4" />
                                                    </div>
                                                    <h4 className="font-bold text-[#1B1F3B] text-sm">Sécurité</h4>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex flex-col gap-2">
                                                        <label className="text-[10px] font-bold uppercase text-gray-500">Nouveau mot de passe</label>
                                                        <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-orange-500 outline-none" />
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <label className="text-[10px] font-bold uppercase text-gray-500">Confirmer le mot de passe</label>
                                                        <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-orange-500 outline-none" />
                                                    </div>
                                                    <button onClick={() => toast.success("Le mot de passe sera mis à jour prochainement.")} className="mt-2 w-full h-10 bg-white border border-gray-200 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:border-orange-500 hover:text-orange-500 transition-colors">
                                                        Mettre à jour
                                                    </button>
                                                </div>
                                            </motion.div>

                                            <motion.div variants={itemVariants} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                                        <Bell className="w-4 h-4" />
                                                    </div>
                                                    <h4 className="font-bold text-[#1B1F3B] text-sm">Notifications</h4>
                                                </div>
                                                <div className="space-y-4">
                                                    <label className="flex items-center justify-between cursor-pointer">
                                                        <span className="text-xs font-medium text-gray-700">Emails promotionnels</span>
                                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500 relative"></div>
                                                    </label>
                                                    <label className="flex items-center justify-between cursor-pointer">
                                                        <span className="text-xs font-medium text-gray-700">Alertes de commande (SMS)</span>
                                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500 relative"></div>
                                                    </label>
                                                </div>
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </Container>
        </div>
    );
}

function OrderCard({ order }: { order: any }) {
    const [expanded, setExpanded] = useState(false);

    const statusColors: any = {
        PENDING: 'bg-yellow-500',
        COMPLETED: 'bg-emerald-500',
        CANCELLED: 'bg-red-500',
        SHIPPED: 'bg-blue-500'
    };

    return (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-orange-100 hover:shadow-sm transition-all duration-300">
            <div 
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-[#1B1F3B] shrink-0">
                        <Package className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="text-base font-black text-[#1B1F3B] uppercase">#{order.id.slice(0, 8)}</span>
                            <div className={cn("px-2 py-0.5 rounded-md text-[8px] font-bold text-white uppercase tracking-widest", statusColors[order.status] || 'bg-gray-400')}>
                                {order.status}
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 border-t border-gray-50 md:border-t-0 pt-4 md:pt-0">
                    <span className="text-lg font-black text-[#1B1F3B]">
                        {order.total.toLocaleString()} CFA
                    </span>
                    <button className={cn("w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-orange-50 hover:text-orange-600 transition-all", expanded && "rotate-180 bg-orange-50 text-orange-600")}>
                        <ChevronDown className="w-4 h-4" />
                    </button>
                </div>
            </div>
            
            <AnimatePresence>
                {expanded && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-gray-50/50 border-t border-gray-100"
                    >
                        <div className="p-5">
                            <h5 className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-3">Articles commandés</h5>
                            {order.orderItems && order.orderItems.length > 0 ? (
                                <div className="space-y-3">
                                    {order.orderItems.map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center text-sm bg-white p-3 rounded-xl border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center text-xs font-bold text-gray-500">
                                                    x{item.quantity}
                                                </div>
                                                <span className="font-medium text-[#1B1F3B]">{item.product?.name || "Produit supprimé"}</span>
                                            </div>
                                            <span className="font-bold text-gray-600">{(item.price * item.quantity).toLocaleString()} CFA</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500">Détails indisponibles.</p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
