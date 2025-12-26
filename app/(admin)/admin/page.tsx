'use client'

import { DollarSign, Package, ShoppingCart, Users } from 'lucide-react'

export default function AdminDashboardPage() {
    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Revenu Total', value: '12.5M FCFA', icon: DollarSign, color: 'text-green-500' },
                    { label: 'Commandes', value: '+540', icon: ShoppingCart, color: 'text-blue-500' },
                    { label: 'Produits', value: '1,203', icon: Package, color: 'text-orange-500' },
                    { label: 'Clients Actifs', value: '3,450', icon: Users, color: 'text-purple-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-card p-6 rounded-xl border border-border shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-lg bg-secondary ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                        <span className="text-xs text-green-500 font-medium flex items-center gap-1">
                            +12% <span className="text-muted-foreground">depuis le mois dernier</span>
                        </span>
                    </div>
                ))}
            </div>

            {/* Recent Orders Table Mockup */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border">
                    <h3 className="font-bold text-lg">Commandes Récentes</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-secondary/50 text-muted-foreground uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Client</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Montant</th>
                                <th className="px-6 py-4">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {[101, 102, 103, 104, 105].map((id) => (
                                <tr key={id} className="hover:bg-secondary/30 transition-colors">
                                    <td className="px-6 py-4 font-medium">#{id}</td>
                                    <td className="px-6 py-4">Mouhamed Diop</td>
                                    <td className="px-6 py-4 text-muted-foreground">25 Dec 2025</td>
                                    <td className="px-6 py-4 font-bold">150.000 FCFA</td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Payé</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
