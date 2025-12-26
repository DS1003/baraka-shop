'use client'

import React from 'react'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-secondary/30 flex">
            {/* Sidebar Placeholder */}
            <aside className="w-64 bg-card border-r border-border hidden md:flex flex-col">
                <div className="p-6 border-b border-border">
                    <h2 className="text-xl font-bold">Baraka <span className="text-primary">Admin</span></h2>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <a href="/admin" className="block px-4 py-2 rounded-lg bg-primary/10 text-primary font-medium">Dashboard</a>
                    <a href="/admin/products" className="block px-4 py-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">Produits</a>
                    <a href="/admin/orders" className="block px-4 py-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">Commandes</a>
                    <a href="/admin/customers" className="block px-4 py-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">Clients</a>
                    <a href="/admin/settings" className="block px-4 py-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">Paramètres</a>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
                    <h1 className="font-semibold">Vue d'ensemble</h1>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/20" />
                    </div>
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
