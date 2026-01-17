'use client'

import React from 'react'
import { Container } from '@/ui/Container'
import { ProductCard } from '@/ui/ProductCard'
import { Product } from '@/types'

// Mock Data
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
        rating: 4.8,
        reviews: 18,
        image: '/samsung-s24.png',
        category: 'Smartphone',
        isSale: true
    },
    // Duplicate for filling the grid
    {
        id: '3',
        name: 'Apple iPhone 14 Pro 128GB',
        price: 750000,
        rating: 4.5,
        reviews: 40,
        image: '/iphone-15-pro.png',
        category: 'Smartphone'
    },
    {
        id: '4',
        name: 'Samsung S23 Ultra',
        price: 600000,
        rating: 4.6,
        reviews: 55,
        image: '/samsung-s24.png',
        category: 'Smartphone'
    }
]

export default function CategoryPage({ params }: { params: { slug: string } }) {
    // In real app, fetch products by params.slug
    const categoryName = params.slug.replace('-', ' ').toUpperCase();

    return (
        <div className="bg-gray-50 min-h-screen py-10">
            <Container>
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Catégorie</span>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">{categoryName}</h1>
                        <p className="text-muted-foreground max-w-2xl">
                            Découvrez notre sélection de {categoryName.toLowerCase()}. Qualité garantie et meilleurs prix au Sénégal.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </Container>
        </div>
    )
}
