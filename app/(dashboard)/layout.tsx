'use client'

import React from 'react'
import Link from 'next/link'
import { User, Package, Heart, LogOut, Settings } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    const links = [
        { href: '/account', label: 'Mon Compte', icon: User },
        { href: '/account/orders', label: 'Mes Commandes', icon: Package },
        { href: '/wishlist', label: 'Ma Wishlist', icon: Heart },
        { href: '/account/settings', label: 'Paramètres', icon: Settings },
    ]

    return (
        <div className="bg-background min-h-screen py-10">
            <div className="container px-4 mx-auto">
                <h1 className="text-3xl font-bold mb-8">Mon Espace Client</h1>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <aside className="md:col-span-1">
                        <div className="bg-card border border-border rounded-xl p-4 shadow-sm sticky top-24">
                            <div className="flex items-center gap-3 mb-6 p-2">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                                    M
                                </div>
                                <div>
                                    <p className="font-bold">Mouhamed Diop</p>
                                    <p className="text-xs text-muted-foreground">Membre depuis 2024</p>
                                </div>
                            </div>

                            <nav className="space-y-1">
                                {links.map((link) => {
                                    const isActive = pathname === link.href
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium",
                                                isActive
                                                    ? "bg-primary text-primary-foreground shadow-md"
                                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                            )}
                                        >
                                            <link.icon size={18} />
                                            {link.label}
                                        </Link>
                                    )
                                })}
                                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors font-medium mt-4">
                                    <LogOut size={18} />
                                    Déconnexion
                                </button>
                            </nav>
                        </div>
                    </aside>

                    {/* Content */}
                    <main className="md:col-span-3">
                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm min-h-[500px]">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}
