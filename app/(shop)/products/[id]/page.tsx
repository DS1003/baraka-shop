'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Star, Truck, ShieldCheck, RefreshCw, Minus, Plus, ShoppingCart, Heart, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock Data
const product = {
    id: 1,
    name: 'Apple MacBook Pro 14" M3 Pro (2025)',
    price: 1850000,
    oldPrice: 1950000,
    description: "Le nouveau MacBook Pro repousse les limites avec la puce M3 Pro. Une autonomie exceptionnelle jusqu'à 22 heures et un superbe écran Liquid Retina XDR. Idéal pour les pro et les créatifs exigeants.",
    images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&q=80&w=1000',
    ],
    features: [
        'Puce Apple M3 Pro',
        '18 Go de mémoire unifiée',
        'SSD 512 Go',
        'Écran Liquid Retina XDR 14 pouces',
        'Jusqu’à 18 heures d’autonomie',
    ],
    reviews: 124,
    rating: 4.8,
    stock: 5
}

export default function ProductResultPage({ params }: { params: { id: string } }) {
    const [selectedImage, setSelectedImage] = useState(0)
    const [quantity, setQuantity] = useState(1)

    return (
        <div className="bg-background min-h-screen py-12">
            <div className="container px-4 mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">

                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="relative aspect-square rounded-2xl overflow-hidden bg-secondary border border-border"
                        >
                            <Image
                                src={product.images[selectedImage]}
                                alt={product.name}
                                fill
                                className="object-cover"
                            />
                            {product.oldPrice && (
                                <span className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    Promo
                                </span>
                            )}
                        </motion.div>
                        <div className="grid grid-cols-4 gap-4">
                            {product.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={cn(
                                        "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                                        selectedImage === idx ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-gray-300"
                                    )}
                                >
                                    <Image src={img} alt={`View ${idx}`} fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col">
                        <div className="mb-4">
                            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{product.name}</h1>
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center text-yellow-400">
                                    <Star className="fill-current w-4 h-4" />
                                    <span className="ml-1 font-medium text-foreground">{product.rating}</span>
                                </div>
                                <span className="text-muted-foreground">{product.reviews} avis client</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                <span className="text-green-600 font-medium">En stock ({product.stock})</span>
                            </div>
                        </div>

                        <div className="mb-8 p-6 bg-secondary/30 rounded-xl border border-border/50">
                            <div className="flex items-end gap-3 mb-2">
                                <span className="text-3xl font-bold text-primary">{product.price.toLocaleString('fr-FR')} FCFA</span>
                                {product.oldPrice && (
                                    <span className="text-lg text-muted-foreground line-through mb-1">{product.oldPrice.toLocaleString('fr-FR')} FCFA</span>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">Prix TTC. Livraison gratuite à Dakar.</p>
                        </div>

                        <p className="text-muted-foreground leading-relaxed mb-8">
                            {product.description}
                        </p>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <div className="flex items-center border border-input rounded-full h-12 w-fit bg-background">
                                <button
                                    className="h-full px-4 hover:bg-secondary rounded-l-full transition-colors"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-12 text-center font-medium">{quantity}</span>
                                <button
                                    className="h-full px-4 hover:bg-secondary rounded-r-full transition-colors"
                                    onClick={() => setQuantity(quantity + 1)}
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <button className="flex-1 btn btn-primary h-12 rounded-full text-base gap-2 shadow-lg hover:shadow-primary/25 transition-all">
                                <ShoppingCart className="w-5 h-5" /> Ajouter au Panier
                            </button>
                            <button className="h-12 w-12 flex items-center justify-center rounded-full border border-input hover:border-primary hover:text-primary transition-colors bg-background">
                                <Heart className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Features List */}
                        <div className="space-y-4 mb-8">
                            <h3 className="font-bold border-b border-border pb-2">Caractéristiques Clés</h3>
                            <ul className="space-y-2">
                                {product.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-foreground/80">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary" /> {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                            <div className="flex flex-col items-center text-center gap-2">
                                <Truck className="w-6 h-6 text-primary" />
                                <span className="text-xs font-medium">Livraison Rapide</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-2">
                                <ShieldCheck className="w-6 h-6 text-primary" />
                                <span className="text-xs font-medium">Garantie 1 An</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-2">
                                <RefreshCw className="w-6 h-6 text-primary" />
                                <span className="text-xs font-medium">Retours Faciles</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
