'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Settings,
    Bell,
    Search,
    Menu,
    X,
    ChevronRight,
    LogOut,
    Sparkles,
    ShieldCheck,
    HelpCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { label: 'Produits', icon: Package, href: '/admin/products' },
    { label: 'Commandes', icon: ShoppingCart, href: '/admin/orders' },
    { label: 'Clients', icon: Users, href: '/admin/customers' },
    { label: 'Paramètres', icon: Settings, href: '/admin/settings' },
]

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const pathname = usePathname()

    return (
        <div className="min-h-screen bg-white flex overflow-hidden font-sans">

            {/* Sidebar - High Impact Glassmorphic Design */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 bg-[#0a0a0a] text-white transition-all duration-500 ease-in-out lg:relative",
                    isSidebarOpen ? "w-80" : "w-0 lg:w-24 overflow-hidden"
                )}
            >
                <div className="flex flex-col h-full py-10 px-6">
                    {/* Logo Area */}
                    <div className="flex items-center gap-4 mb-20 px-2 overflow-hidden whitespace-nowrap">
                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform">
                            <ShieldCheck className="text-white" size={24} />
                        </div>
                        <div className={cn("transition-opacity duration-300", isSidebarOpen ? "opacity-100" : "opacity-0 invisible")}>
                            <h2 className="text-xl font-black tracking-tighter">BARAKA <span className="text-primary italic">CORE.</span></h2>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Admin Control Panel</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-4">
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-4 py-4 px-4 rounded-2xl transition-all relative group overflow-hidden",
                                        isActive ? "bg-white text-black" : "text-gray-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <item.icon size={22} className={cn("shrink-0", isActive ? "text-primary" : "group-hover:scale-110 transition-transform")} />
                                    <span className={cn("font-black text-xs uppercase tracking-[0.15em] whitespace-nowrap transition-all duration-300", isSidebarOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10")}>
                                        {item.label}
                                    </span>
                                    {isActive && isSidebarOpen && (
                                        <motion.div layoutId="active-pill" className="absolute right-[-10px] w-5 h-5 bg-primary rounded-full blur-sm" />
                                    )}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Bottom Support/LogOut */}
                    <div className="pt-10 border-t border-white/5 space-y-4">
                        <div className={cn("mb-6 px-4 bg-primary/10 rounded-2xl p-6 relative overflow-hidden transition-all", isSidebarOpen ? "opacity-100" : "opacity-0 invisible")}>
                            <div className="relative z-10">
                                <Sparkles className="text-primary mb-2" size={18} />
                                <h4 className="text-[11px] font-black uppercase tracking-widest text-white mb-1">Besoin d'aide?</h4>
                                <p className="text-[10px] text-gray-400 font-medium leading-relaxed">Contactez l'assistance <br /> tech de Baraka 24/7.</p>
                            </div>
                            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10" />
                        </div>
                        <button className="flex items-center gap-4 py-4 px-4 w-full text-red-400 hover:text-red-300 transition-colors">
                            <LogOut size={22} className="shrink-0" />
                            <span className={cn("font-black text-xs uppercase tracking-[0.15em] transition-all", isSidebarOpen ? "opacity-100" : "opacity-0")}>Déconnexion</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#fcfcfc]">

                {/* Header - Glassmorphic floating */}
                <header className="h-24 bg-white/50 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-8 md:px-12 relative z-40">
                    <div className="flex items-center gap-8">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-black hover:text-white transition-all active:scale-90"
                        >
                            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>

                        <div className="hidden md:flex items-center gap-4 bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100 group transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10">
                            <Search size={18} className="text-gray-300 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Rechercher une commande, un client..."
                                className="bg-transparent border-none outline-none text-sm font-medium placeholder:text-gray-300 w-64"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-primary/10 hover:text-primary transition-all">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                        </button>

                        <div className="flex items-center gap-4 pl-6 border-l border-gray-100">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-gray-900 uppercase tracking-widest leading-none mb-1">Admin Account</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Master Editor</p>
                            </div>
                            <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white font-black text-xs ring-4 ring-gray-50 shadow-xl overflow-hidden">
                                <span className="p-3 bg-gradient-to-br from-primary to-orange-400 w-full h-full flex items-center justify-center">AD</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dynamic Content Frame */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="max-w-[1600px] mx-auto p-8 md:p-12">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            {children}
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    )
}
