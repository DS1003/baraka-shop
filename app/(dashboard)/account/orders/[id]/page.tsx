'use client'

import { ArrowLeft, Clock, CreditCard, MapPin, Package, Phone } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Image from 'next/image'

export default function OrderDetailsPage() {
    const params = useParams()
    const id = params.id

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/account/orders" className="p-2 hover:bg-secondary rounded-full transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h2 className="text-2xl font-bold">Commande #{id}</h2>
                    <p className="text-sm text-muted-foreground">Passée le 20 Déc 2024 • 17:45</p>
                </div>
                <span className="ml-auto px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">En cours de traitement</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Order Items */}
                <div className="md:col-span-2 space-y-4">
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <Package size={20} className="text-primary" /> Articles (2)
                        </h3>
                        <div className="space-y-4">
                            {[1, 2].map((item) => (
                                <div key={item} className="flex gap-4 border-b border-border last:border-0 pb-4 last:pb-0">
                                    <div className="relative w-20 h-20 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                                        <Image
                                            src="https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&q=80&w=200"
                                            alt="Product"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold line-clamp-1">Apple MacBook Pro 14" M3</h4>
                                        <p className="text-sm text-muted-foreground">Qté: 1</p>
                                        <p className="font-medium text-primary mt-1">1.850.000 FCFA</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-4 border-t border-border space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Sous-total</span>
                                <span>3.700.000 FCFA</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Livraison</span>
                                <span>2.000 FCFA</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-2 border-t border-border mt-2">
                                <span>Total</span>
                                <span className="text-primary">3.702.000 FCFA</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <div className="space-y-6">
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <MapPin size={20} className="text-primary" /> Livraison
                        </h3>
                        <div className="space-y-1 text-sm">
                            <p className="font-medium">Mouhamed Diop</p>
                            <p className="text-muted-foreground">123 Avenue Blaise Diagne</p>
                            <p className="text-muted-foreground">Dakar, Sénégal</p>
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border text-muted-foreground">
                                <Phone size={14} /> +221 77 000 00 00
                            </div>
                        </div>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <CreditCard size={20} className="text-primary" /> Paiement
                        </h3>
                        <p className="text-sm text-foreground">Paiement à la livraison (Espèces)</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
