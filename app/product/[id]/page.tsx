'use client'

import React from 'react'
import Image from 'next/image'
import { Container } from '@/ui/Container'
import { Button } from '@/ui/Button'
import { Star, Truck, ShieldCheck, RefreshCcw } from 'lucide-react'

export default function ProductPage({ params }: { params: { id: string } }) {
    // Mock data - in real app fetch based on params.id
    const product = {
        name: "Apple iPhone 15 Pro Max 256GB Titane Naturel",
        price: 890000,
        description: "L'iPhone 15 Pro Max. Forgé dans le titane. La puce A17 Pro change la donne. Un bouton Action personnalisable. Le système photo le plus puissant sur iPhone. Et l'USB-C avec USB 3 pour des vitesses de transfert inédites.",
        specs: [
            { label: "Écran", value: "Super Retina XDR OLED 6,7\"" },
            { label: "Puce", value: "A17 Pro" },
            { label: "Stockage", value: "256 Go" },
            { label: "Couleur", value: "Titane Naturel" },
        ]
    }

    return (
        <div className="bg-white min-h-screen py-10">
            <Container>
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
                    {/* Gallery */}
                    <div className="flex flex-col gap-4">
                        <div className="relative aspect-square w-full bg-gray-50 rounded-2xl overflow-hidden border border-border/50">
                            <Image
                                src="/iphone-15-pro.png"
                                alt={product.name}
                                fill
                                className="object-contain p-8"
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="aspect-square bg-gray-50 rounded-lg cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all border border-border/50"></div>
                            ))}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="flex flex-col">
                        <div className="mb-6 border-b border-border pb-6">
                            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">{product.name}</h1>
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center text-yellow-400">
                                    {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-4 h-4 fill-current" />)}
                                </div>
                                <span className="text-muted-foreground">128 avis</span>
                                <span className="text-green-600 font-medium ml-auto">En stock</span>
                            </div>
                        </div>

                        <div className="mb-8">
                            <p className="text-4xl font-bold text-primary mb-2">
                                {new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }).format(product.price)}
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        <div className="flex gap-4 mb-8">
                            <Button size="lg" className="flex-1 h-14 text-lg rounded-full">
                                Ajouter au panier
                            </Button>
                            <Button size="lg" variant="outline" className="h-14 w-14 rounded-full p-0 flex items-center justify-center">
                                <span className="sr-only">Favoris</span>
                                <Star className="w-6 h-6" />
                            </Button>
                        </div>

                        <div className="flex flex-col gap-4 text-sm text-muted-foreground bg-gray-50 p-6 rounded-xl">
                            <div className="flex items-center gap-3">
                                <Truck className="w-5 h-5 text-foreground" />
                                <span>Livraison gratuite partout à Dakar sous 24h.</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5 text-foreground" />
                                <span>Garantie officielle 1 an Apple.</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <RefreshCcw className="w-5 h-5 text-foreground" />
                                <span>Retours gratuits sous 7 jours.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    )
}
