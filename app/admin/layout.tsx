'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    BarChart2,
    Box,
    Layers,
    Image as ImageIcon,
    ShoppingBag,
    ShoppingCart,
    Package,
    Users,
    User,
    Settings,
    LogOut,
    Search,
    Bell,
    ExternalLink,
    Command,
    ChevronLeft,
    Menu,
    Activity,
    CreditCard,
    ShieldCheck,
    Tag,
    Zap,
    Store
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';
import { getAdminNotifications } from '@/lib/actions/admin-actions';
import { ImportToast } from '@/features/admin/components/ImportToast';
import { Toaster } from 'sonner';

const sidebarGroups = [
    {
        label: "Vue d'ensemble",
        items: [
            { icon: LayoutDashboard, label: 'Tableau de Bord', href: '/admin' },
            { icon: BarChart2, label: 'Analytiques', href: '/admin/analytics' },
        ]
    },
    {
        label: "Catalogue",
        items: [
            { icon: Box, label: 'Produits', href: '/admin/products' },
            { icon: Store, label: 'Boutiques', href: '/admin/stores' },
            { icon: Layers, label: 'Catégories', href: '/admin/categories' },
            { icon: Tag, label: 'Marques', href: '/admin/brands' },
            { icon: Zap, label: 'Promotions', href: '/admin/promotions' },
            { icon: ImageIcon, label: 'Médiathèque', href: '/admin/media' },
        ]
    },
    {
        label: "Opérations",
        items: [
            { icon: ShoppingBag, label: 'Vente Boutique', href: '/admin/pos' },
            { icon: ShoppingCart, label: 'Commandes', href: '/admin/orders' },
            { icon: Package, label: 'Stock & Inventaire', href: '/admin/inventory' },
            { icon: Users, label: 'Gestion Clients', href: '/admin/customers' },
        ]
    },
    {
        label: "Système",
        items: [
            { icon: Settings, label: 'Configuration', href: '/admin/settings' },
        ]
    }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        async function loadNotifications() {
            const data = await getAdminNotifications();
            setNotifications(data);
        }
        loadNotifications();
    }, []);

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans text-slate-900 selection:bg-orange-100 selection:text-orange-900">
            {/* SaaS Minimalist Sidebar */}
            <motion.aside
                animate={{ width: isSidebarCollapsed ? 80 : 260 }}
                className="bg-[#F9FAFB] flex flex-col z-30 transition-all duration-300 ease-in-out relative border-r border-slate-200/60"
            >
                {/* Logo Section - High Profile */}
                <div className="p-6 h-[88px] flex items-center justify-between">
                    <Link href="/admin" className="flex items-center gap-3 overflow-hidden">
                        <div className="flex-shrink-0 w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-lg shadow-orange-100/50 overflow-hidden p-1.5">
                            <img
                                src="https://baraka-shop-alpha.vercel.app/_next/image?url=https%3A%2F%2Fbaraka.sn%2Fwp-content%2Fuploads%2F2025%2F11%2FWhatsApp-Image-2025-08-30-at-22.56.22-2.png&w=2048&q=75"
                                alt="Baraka Shop"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        {!isSidebarCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex flex-col whitespace-nowrap"
                            >
                                <span className="font-bold text-[15px] text-slate-900 tracking-tight leading-none mb-1">
                                    Baraka Admin
                                </span>
                                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-none">
                                    Control Panel
                                </span>
                            </motion.div>
                        )}
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-7 overflow-y-auto custom-scrollbar">
                    {sidebarGroups.map((group, idx) => (
                        <div key={idx} className="space-y-1.5">
                            {!isSidebarCollapsed && (
                                <h3 className="px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                    {group.label}
                                </h3>
                            )}
                            <div className="space-y-0.5">
                                {group.items.map((item) => {
                                    const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                "flex items-center gap-3.5 px-4 py-2.5 rounded-xl transition-all duration-200 group relative",
                                                isActive
                                                    ? "bg-white text-orange-600 shadow-sm border border-slate-200/50 font-semibold"
                                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "transition-all duration-200",
                                                    isActive ? "text-orange-600" : "group-hover:text-slate-800"
                                                )}
                                            >
                                                <item.icon
                                                    size={18}
                                                    strokeWidth={isActive ? 2.5 : 2}
                                                />
                                            </div>
                                            {!isSidebarCollapsed && (
                                                <span className="text-[14px]">
                                                    {item.label}
                                                </span>
                                            )}
                                            {isActive && !isSidebarCollapsed && (
                                                <motion.div
                                                    layoutId="active-pill"
                                                    className="absolute right-3 w-1 h-1 bg-orange-500 rounded-full"
                                                />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Footer Section */}
                <div className="p-4 mt-auto border-t border-slate-200/50">
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="flex items-center gap-3.5 w-full px-4 py-2.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 group"
                    >
                        <LogOut size={18} strokeWidth={2} />
                        {!isSidebarCollapsed && <span className="text-[14px] font-medium">Déconnexion</span>}
                    </button>

                    <button
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="absolute -right-3 top-[100px] w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-orange-600 transition-all z-40 shadow-sm"
                    >
                        {isSidebarCollapsed ? <Menu size={11} /> : <ChevronLeft size={11} />}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Elevated Topbar */}
                <header className="h-[88px] flex items-center justify-between px-10 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 transition-all">
                    <div className="flex-1 max-w-xl">
                        <div className="relative group flex items-center">
                            <Search className="absolute left-4 text-slate-400 group-focus-within:text-orange-500 transition-colors pointer-events-none" size={16} strokeWidth={2} />
                            <input
                                type="text"
                                placeholder="Recherche globale..."
                                className="w-full pl-11 pr-12 py-2.5 bg-slate-100/50 border border-transparent rounded-[14px] focus:outline-none focus:bg-white focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all text-[14px] font-medium placeholder:text-slate-400"
                            />
                            <div className="absolute right-4 flex items-center gap-1.5 text-slate-300 pointer-events-none border border-slate-200 rounded-lg px-2 py-0.5 bg-white">
                                <Command size={10} strokeWidth={2.5} />
                                <span className="text-[10px] font-bold">K</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 ml-6">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setIsNotificationsOpen(!isNotificationsOpen);
                                        setIsProfileOpen(false);
                                    }}
                                    className={cn(
                                        "relative w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                        isNotificationsOpen ? "bg-orange-600 text-white shadow-lg shadow-orange-100" : "text-slate-500 hover:text-orange-600 hover:bg-white border border-transparent hover:border-slate-200"
                                    )}
                                >
                                    <Bell size={20} strokeWidth={2} />
                                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                                </button>

                                <AnimatePresence>
                                    {isNotificationsOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-3 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden"
                                            >
                                                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                                                    <h4 className="font-bold text-[14px]">Notifications</h4>
                                                    <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-bold">3 NOUVELLES</span>
                                                </div>
                                                <div className="max-h-96 overflow-y-auto">
                                                    {notifications.map((n) => (
                                                        <div key={n.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group">
                                                            <div className="flex gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center flex-shrink-0">
                                                                    <Activity size={14} />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-[12px] font-bold text-slate-800 line-clamp-1">{n.title}</p>
                                                                    <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                                                                </div>
                                                                {!n.read && <div className="w-2 h-2 rounded-full bg-orange-500 mt-1" />}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button className="w-full p-3 text-[12px] font-bold text-slate-400 hover:text-orange-600 transition-colors bg-slate-50/50">
                                                    Voir tout l'historique
                                                </button>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>

                            <Link
                                href="/"
                                target="_blank"
                                className="hidden md:flex items-center gap-2.5 px-4 py-2.5 text-slate-500 hover:text-orange-900 hover:bg-slate-100 rounded-xl transition-all group font-medium text-[13px]"
                            >
                                <ExternalLink size={16} className="text-slate-400 group-hover:text-orange-500" />
                                <span>Voir le site</span>
                            </Link>
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => {
                                    setIsProfileOpen(!isProfileOpen);
                                    setIsNotificationsOpen(false);
                                }}
                                className="flex items-center gap-3 pl-6 border-l border-slate-200/60 group hover:opacity-80 transition-opacity"
                            >
                                <div className="flex flex-col items-end mr-1">
                                    <span className="text-[13px] font-bold text-slate-900 leading-none">Admin Baraka</span>
                                    <span className="text-[10px] text-slate-400 font-medium mt-1">Super Admin</span>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold text-[13px] shadow-lg shadow-orange-100 group-hover:scale-105 transition-transform">
                                    AB
                                </div>
                            </button>

                            <AnimatePresence>
                                {isProfileOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-3 w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 p-2"
                                        >
                                            <div className="p-3 border-b border-slate-50">
                                                <p className="text-[14px] font-bold text-slate-900">Admin Baraka</p>
                                                <p className="text-[11px] text-slate-400 truncate">admin@baraka-shop.com</p>
                                            </div>
                                            <div className="py-2">
                                                <Link href="/admin/settings" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-[13px] font-medium text-slate-600 transition-colors">
                                                    <User size={16} className="text-slate-400" />
                                                    Mon Profil
                                                </Link>
                                                <Link href="/admin/settings" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-[13px] font-medium text-slate-600 transition-colors">
                                                    <ShieldCheck size={16} className="text-slate-400" />
                                                    Sécurité
                                                </Link>
                                            </div>
                                            <div className="pt-2 border-t border-slate-50">
                                                <button
                                                    onClick={() => signOut({ callbackUrl: '/login' })}
                                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-rose-50 text-rose-600 text-[13px] font-bold transition-colors"
                                                >
                                                    <LogOut size={16} />
                                                    Déconnexion
                                                </button>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0, scale: 0.99, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                        className="w-full max-w-[1500px] mx-auto min-h-full"
                    >
                        {children}
                    </motion.div>
                </div>
                <ImportToast />
                <Toaster
                    position="bottom-right"
                    richColors
                    closeButton
                    duration={4000}
                    toastOptions={{
                        style: {
                            borderRadius: '16px',
                            fontWeight: 600,
                            fontSize: '13px',
                            boxShadow: '0 20px 40px -12px rgba(0,0,0,0.12)',
                            border: '1px solid rgba(0,0,0,0.05)',
                        },
                    }}
                />
            </main>
        </div>
    );
}
