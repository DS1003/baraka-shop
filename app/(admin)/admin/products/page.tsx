'use client'

import { Plus, Search, Edit, Trash, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'

export default function AdminProductsPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Produits</h2>
                <Link href="/admin/products/new" className="btn btn-primary px-4 py-2 rounded-lg flex items-center gap-2">
                    <Plus size={18} /> Nouveau Produit
                </Link>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                {/* Toolbar */}
                <div className="p-4 border-b border-border flex gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher un produit..."
                            className="pl-10 pr-4 py-2 w-full rounded-lg border bg-background text-sm"
                        />
                    </div>
                </div>

                {/* Table */}
                <table className="w-full text-sm text-left">
                    <thead className="bg-secondary/50 text-muted-foreground uppercase font-medium">
                        <tr>
                            <th className="px-6 py-4">Nom</th>
                            <th className="px-6 py-4">Catégorie</th>
                            <th className="px-6 py-4">Prix</th>
                            <th className="px-6 py-4">Stock</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {[1, 2, 3, 4, 5].map((item) => (
                            <tr key={item} className="hover:bg-secondary/30 transition-colors">
                                <td className="px-6 py-4 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-secondary rounded-lg" />
                                    <span className="font-medium">Produit Demo {item}</span>
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">Électronique</td>
                                <td className="px-6 py-4 font-bold text-foreground">50.000 FCFA</td>
                                <td className="px-6 py-4">
                                    <span className="text-green-600 font-medium">12 en stock</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-primary transition-colors">
                                        <Edit size={16} />
                                    </button>
                                    <button className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-red-500 transition-colors">
                                        <Trash size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
