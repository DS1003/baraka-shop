'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Filter, ChevronDown } from 'lucide-react'
import ProductCard from '@/components/features/product/ProductCard'
import { cn } from '@/lib/utils'

import { MOCK_PRODUCTS } from '@/lib/data'

// Mock Data
const filters = [
    // ... existing filters ...
    {
        id: 'category',
        name: 'Catégories',
        options: [
            { label: 'Smartphones', value: 'smartphones', count: 120 },
            { label: 'Ordinateurs', value: 'laptops', count: 85 },
            { label: 'Audio', value: 'audio', count: 45 },
            { label: 'Accessoires', value: 'accessories', count: 200 },
        ]
    },
    {
        id: 'price',
        name: 'Prix',
        options: [
            { label: '0 - 50.000 FCFA', value: '0-50000', count: 50 },
            { label: '50.000 - 200.000 FCFA', value: '50000-200000', count: 120 },
            { label: '200.000 - 500.000 FCFA', value: '200000-500000', count: 80 },
            { label: '+ 500.000 FCFA', value: '500000-plus', count: 45 },
        ]
    },
    {
        id: 'brand',
        name: 'Marques',
        options: [
            { label: 'Apple', value: 'apple', count: 60 },
            { label: 'Samsung', value: 'samsung', count: 55 },
            { label: 'HP', value: 'hp', count: 30 },
            { label: 'Sony', value: 'sony', count: 25 },
        ]
    }
]

export default function ShopPage() {
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

    return (
        <div className="bg-background min-h-screen pb-20 pt-10">
            <div className="container px-4 mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">La Boutique</h1>
                        <p className="text-muted-foreground">Découvrez nos meilleurs produits technologiques.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            className="md:hidden flex items-center gap-2 px-4 py-2 border rounded-lg bg-card"
                            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                        >
                            <Filter size={18} /> Filtres
                        </button>
                        <div className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-card">
                            <span className="text-sm text-muted-foreground">Trier par:</span>
                            <select className="bg-transparent text-sm font-medium focus:outline-none">
                                <option>Pertinence</option>
                                <option>Prix croisant</option>
                                <option>Prix décroissant</option>
                                <option>Nouveautés</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex gap-8">
                    {/* Sidebar Filters (Desktop) */}
                    <div className="hidden md:block w-64 flex-shrink-0 space-y-8">
                        {filters.map((section) => (
                            <div key={section.id} className="border-b border-border pb-6 last:border-0">
                                <h3 className="font-bold mb-4 flex items-center justify-between">
                                    {section.name}
                                    <ChevronDown size={16} className="text-muted-foreground" />
                                </h3>
                                <div className="space-y-3">
                                    {section.options.map((option) => (
                                        <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                                            <div className="relative flex items-center">
                                                <input type="checkbox" className="peer w-4 h-4 border-2 border-muted-foreground rounded checked:bg-primary checked:border-primary transition-colors appearance-none" />
                                                <svg className="absolute left-0 top-0 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </div>
                                            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{option.label}</span>
                                            <span className="text-xs text-muted-foreground ml-auto bg-secondary px-2 py-0.5 rounded-full">{option.count}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {MOCK_PRODUCTS.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                >
                                    <ProductCard product={product} />
                                </motion.div>
                            ))}
                        </div>

                        {/* Pagination Mockup */}
                        <div className="mt-12 flex justify-center gap-2">
                            <button className="w-10 h-10 rounded-lg flex items-center justify-center border border-border hover:border-primary hover:text-primary transition-colors text-muted-foreground">1</button>
                            <button className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary text-primary-foreground font-bold shadow-lg">2</button>
                            <button className="w-10 h-10 rounded-lg flex items-center justify-center border border-border hover:border-primary hover:text-primary transition-colors text-muted-foreground">3</button>
                            <span className="w-10 h-10 flex items-center justify-center text-muted-foreground">...</span>
                            <button className="w-10 h-10 rounded-lg flex items-center justify-center border border-border hover:border-primary hover:text-primary transition-colors text-muted-foreground">12</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
