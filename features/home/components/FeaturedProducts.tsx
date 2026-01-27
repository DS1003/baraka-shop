'use client'

import React from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Container } from '@/ui/Container'
import { ProductCard } from '@/ui/ProductCard'
import { Product } from '@/types'

const products: Product[] = [
    {
        id: '1',
        name: 'Apple iPhone 15 Pro Max 256GB Titane Naturel',
        price: 890000,
        rating: 5,
        reviews: 24,
        image: '/iphone-15-pro.png',
        category: 'Smartphone',
        isNew: true
    },
    {
        id: '2',
        name: 'Samsung Galaxy S24 Ultra 512GB Gris',
        price: 825000,
        compareAtPrice: 850000,
        rating: 4.8,
        reviews: 18,
        image: '/samsung-s24.png',
        category: 'Smartphone',
        isSale: true
    },
    {
        id: '3',
        name: 'Apple MacBook Air 15" M2 512GB Minuit',
        price: 990000,
        rating: 4.9,
        reviews: 12,
        image: '/macbook-air.png',
        category: 'Ordinateurs'
    },
    {
        id: '4',
        name: 'Apple AirPods Pro (2e génération) USB-C',
        price: 165000,
        rating: 4.7,
        reviews: 156,
        image: '/airpods-pro.png',
        category: 'Audio'
    }
]

export function FeaturedProducts() {
    return (
        <section className="py-16 bg-gray-50/50 block">
            <Container>
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight mb-2">Meilleures Ventes</h2>
                        <p className="text-muted-foreground">Les produits préférés de nos clients cette semaine.</p>
                    </div>
                    <Link
                        href="/shop"
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-[#ea580c] text-white flex items-center justify-center shadow-[0_10px_20px_-5px_rgba(249,115,22,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(249,115,22,0.6)] transition-all duration-300 hover:-translate-y-1 active:scale-95 group/plus border border-white/10"
                        title="Voir tout les produits"
                    >
                        <Plus className="w-6 h-6 transition-transform duration-500 group-hover/plus:rotate-90" strokeWidth={3} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </Container>
        </section>
    )
}
