'use client'

import React from 'react'
import Link from 'next/link'
import { User, Package, Heart, LogOut, Settings, CreditCard, Bell, ShieldCheck, ChevronRight } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    const navLinks = [
        { href: '/account', label: 'Dashboard', icon: User, desc: 'Vue d\'ensemble' },
        { href: '/account/orders', label: 'Commandes', icon: Package, desc: 'Suivi & Historique' },
        { href: '/wishlist', label: 'Wishlist', icon: Heart, desc: 'Mes favoris' },
        { href: '/account/settings', label: 'Paramètres', icon: Settings, desc: 'Sécurité & Profil' },
    ]

    return (
        <div className="bg-[#fcfcfc] min-h-screen">
            <div className="container px-4 mx-auto py-8 md:py-16">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

                    {/* Floating Premium Sidebar */}
                    <aside className="lg:w-[320px] shrink-0">
                        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-xl shadow-gray-200/40 sticky top-24">
                            {/* Profile Header */}
                            <div className="relative mb-8 text-center">
                                <div className="w-24 h-24 mx-auto mb-4 relative p-1 rounded-full bg-gradient-to-tr from-primary to-orange-400 group">
                                    <div className="w-full h-full rounded-full border-4 border-white overflow-hidden bg-gray-100 relative">
                                        <Image
                                            src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&h=200&fit=crop"
                                            alt="Profil"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-black text-white rounded-full border-2 border-white flex items-center justify-center hover:bg-primary transition-all active:scale-90 shadow-lg">
                                        <Settings size={14} />
                                    </button>
                                </div>
                                <h2 className="text-xl font-black text-gray-900 leading-tight">Mouhamed Diop</h2>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Client Premium</p>
                            </div>

                            {/* Nav Links */}
                            <nav className="space-y-2">
                                {navLinks.map((link) => {
                                    const isActive = pathname === link.href
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={cn(
                                                "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all relative group overflow-hidden",
                                                isActive
                                                    ? "bg-black text-white shadow-xl shadow-black/10"
                                                    : "text-gray-500 hover:bg-gray-50 hover:text-black"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors border",
                                                isActive ? "bg-white/10 border-white/10" : "bg-white border-gray-100 group-hover:bg-black group-hover:text-white group-hover:border-black"
                                            )}>
                                                <link.icon size={18} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-black text-xs uppercase tracking-widest">{link.label}</div>
                                                <div className={cn("text-[10px] font-medium", isActive ? "text-gray-400" : "text-gray-400")}>{link.desc}</div>
                                            </div>
                                            {isActive && (
                                                <motion.div layoutId="sidebar-active" className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary rounded-r-full" />
                                            )}
                                        </Link>
                                    )
                                })}

                                <div className="pt-4 mt-4 border-t border-gray-100">
                                    <button className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-black text-[10px] uppercase tracking-widest leading-none">
                                        <div className="w-10 h-10 bg-white border border-red-100 rounded-xl flex items-center justify-center">
                                            <LogOut size={18} />
                                        </div>
                                        Déconnexion
                                    </button>
                                </div>
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-gray-200/40 min-h-[600px]"
                        >
                            {children}
                        </motion.div>
                    </main>
                </div>
            </div>
        </div>
    )
}
