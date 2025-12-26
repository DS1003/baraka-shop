'use client'

import React from 'react'
import { Package, Eye } from 'lucide-react'
import Link from 'next/link'

export default function OrdersPage() {
    const orders = [
        { id: 'BRK-8902', date: '20 Déc 2024', total: '850.000 FCFA', status: 'En cours', items: 2 },
        { id: 'BRK-8810', date: '15 Nov 2024', total: '125.000 FCFA', status: 'Livré', items: 1 },
        { id: 'BRK-8750', date: '02 Oct 2024', total: '45.000 FCFA', status: 'Livré', items: 3 },
    ]

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Mes Commandes</h2>

            <div className="space-y-4">
                {orders.map((order) => (
                    <div key={order.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors gap-4">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center text-muted-foreground">
                                <Package size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold">Commande #{order.id}</h3>
                                <p className="text-sm text-muted-foreground">{order.date} • {order.items} articles</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <span className="font-bold">{order.total}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'Livré' ? 'bg-green-100 text-green-700' :
                                    order.status === 'En cours' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                {order.status}
                            </span>
                            <Link href={`/account/orders/${order.id}`} className="p-2 hover:bg-secondary rounded-full text-primary transition-colors">
                                <Eye size={20} />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
