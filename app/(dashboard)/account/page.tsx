'use client'

import { Package, Clock, CreditCard } from 'lucide-react'

export default function AccountPage() {
    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold">Vue d'ensemble</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white rounded-lg"><Package size={20} /></div>
                        <span className="font-bold text-lg">12</span>
                    </div>
                    <p className="text-sm font-medium">Commandes Totales</p>
                </div>
                <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 text-orange-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white rounded-lg"><Clock size={20} /></div>
                        <span className="font-bold text-lg">2</span>
                    </div>
                    <p className="text-sm font-medium">En cours de livraison</p>
                </div>
                <div className="p-4 rounded-xl bg-green-50 border border-green-100 text-green-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white rounded-lg"><CreditCard size={20} /></div>
                        <span className="font-bold text-lg">0 FCFA</span>
                    </div>
                    <p className="text-sm font-medium">Bons d'achat</p>
                </div>
            </div>

            <div>
                <h3 className="font-bold text-lg mb-4">Dernière Commande</h3>
                <div className="border border-border rounded-lg p-4">
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-4 pb-4 border-b border-border">
                        <div>
                            <p className="font-bold">Commande #BRK-8902</p>
                            <p className="text-sm text-muted-foreground mr-4">Passée le 20 Déc 2024</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">En cours de traitement</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-secondary rounded-md" />
                        <div className="w-16 h-16 bg-secondary rounded-md" />
                        <span className="text-sm text-muted-foreground">+ 1 autre</span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                        <span className="font-bold">Total: 850.000 FCFA</span>
                        <button className="text-sm font-medium text-primary hover:underline">Voir détails</button>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="font-bold text-lg mb-4">Informations Personnelles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">Nom complet</p>
                        <p className="font-medium">Mouhamed Diop</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">Email</p>
                        <p className="font-medium">mouhamed@example.com</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">Téléphone</p>
                        <p className="font-medium">+221 77 000 00 00</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">Adresse par défaut</p>
                        <p className="font-medium">123 Avenue Blaise Diagne, Dakar</p>
                    </div>
                </div>
                <button className="mt-4 text-sm font-medium text-primary hover:underline">Modifier mes informations</button>
            </div>
        </div>
    )
}
