'use client'

import React, { useState } from 'react'
import { Container } from '@/ui/Container'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    Filter,
    LayoutGrid,
    List,
    ChevronDown,
    Star,
    ShoppingCart,
    Heart,
    Eye,
    Zap,
    Search
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock categories for filters
const categories = [
    { name: 'Informatique', count: 124 },
    { name: 'Smartphones', count: 85 },
    { name: 'Audio & Son', count: 64 },
    { name: 'Jeux Vidéo', count: 42 },
    { name: 'Image & Son', count: 31 },
    { name: 'Tablettes', count: 19 },
]

// Mock brands for filters
const brands = [
    { name: 'Apple', count: 45 },
    { name: 'Samsung', count: 32 },
    { name: 'Sony', count: 28 },
    { name: 'Dell', count: 15 },
    { name: 'HP', count: 12 },
]

// Mock products (same data structure as homepage selective list)
const products = [
    { id: '1', name: 'MacBook Pro M3 Max 14" - Space Black', category: 'Informatique', price: 2500000, oldPrice: 2800000, rating: 5, image: 'https://media.ldlc.com/r705/ld/products/00/06/22/20/LD0006222055.jpg', badges: [{ text: '-15%', color: 'bg-primary' }] },
    { id: '2', name: 'iPhone 15 Pro Max 256GB Natural Titanium', category: 'Smartphones', price: 850000, oldPrice: 900000, rating: 5, image: "https://media.ldlc.com/r705/ld/products/00/06/06/39/LD0006063994.jpg", badges: [{ text: 'NEW', color: 'bg-green-500' }] },
    { id: '3', name: 'Sony WH-1000XM5 Wireless Headphones', category: 'Audio & Son', price: 250000, rating: 4, image: "https://sony.scene7.com/is/image/sonyglobalsolutions/360-RA-category-icon-20221202?$S7Product$&fmt=png-alpha" },
    { id: '4', name: 'Canon EOS R6 Mark II Mirrorless Camera', category: 'Image & Son', price: 1800000, oldPrice: 1950000, rating: 5, image: 'https://in.canon/media/image/2022/11/01/c8c8ab88ead148e9b64490fdd764bcf4_EOS+R6+Mark+II+RF24-105mm+f4-7.1+IS+STM+front+slant.png' },
    { id: '5', name: 'PlayStation 5 Slim Digital Edition', category: 'Jeux Vidéo', price: 450000, oldPrice: 500000, rating: 5, image: 'https://media.ldlc.com/encart/p/26671_b.jpg' },
    { id: '6', name: 'iPad Air M2 11" Blue 128GB', category: 'Tablettes', price: 650000, rating: 4, image: 'https://media.ldlc.com/encart/p/28858_b.jpg' },
    { id: '7', name: 'MacBook Air M2 13" Stellar', category: 'Informatique', price: 950000, oldPrice: 1050000, rating: 5, image: 'https://media.ldlc.com/encart/p/28885_b.jpg' },
    { id: '8', name: 'Samsung S24 Ultra 5G Grey', category: 'Smartphones', price: 1100000, rating: 5, image: 'https://media.ldlc.com/encart/p/28828_b.jpg' },
]

export default function ShopPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [priceRange, setPriceRange] = useState([0, 3000000])

    return (
        <main className="bg-[#f8f9fb] min-h-screen">
            {/* Page Header / Breadcrumbs */}
            <div className="bg-[#1B1F3B] py-16 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/10 blur-[100px] rounded-full translate-x-1/2" />
                <Container className="relative z-10 flex flex-col items-center">
                    <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">Notre Boutique</h1>
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
                        <a href="/" className="hover:text-primary transition-colors">Accueil</a>
                        <span className="w-1 h-1 bg-gray-600 rounded-full" />
                        <span className="text-white">Boutique</span>
                    </div>
                </Container>
            </div>

            <Container className="py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Filters Sidebar */}
                    <aside className="lg:col-span-1 flex flex-col gap-8">
                        {/* Categories Filter */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                            <h3 className="text-sm font-black text-[#1B1F3B] uppercase tracking-widest mb-6 flex items-center justify-between border-b border-gray-50 pb-4">
                                Catégories <ChevronDown className="w-4 h-4 text-gray-400" />
                            </h3>
                            <div className="flex flex-col gap-3">
                                {categories.map((cat) => (
                                    <label key={cat.name} className="flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-200 text-primary focus:ring-primary transition-all cursor-pointer" />
                                            <span className="text-sm font-bold text-gray-500 group-hover:text-[#1B1F3B] transition-colors">{cat.name}</span>
                                        </div>
                                        <span className="text-[10px] font-black text-gray-300 group-hover:text-primary transition-colors">({cat.count})</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Filter */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                            <h3 className="text-sm font-black text-[#1B1F3B] uppercase tracking-widest mb-6 border-b border-gray-50 pb-4">
                                Prix (CFA)
                            </h3>
                            <div className="px-2 py-4 flex flex-col gap-6">
                                {/* Placeholder for a real slider - using standard range inputs for simplicity in first iteration */}
                                <div className="flex items-center justify-between text-[11px] font-black text-gray-400 uppercase">
                                    <span>{priceRange[0].toLocaleString()} CFA</span>
                                    <span>{priceRange[1].toLocaleString()} CFA</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="3000000"
                                    className="w-full accent-primary h-1 bg-gray-100 rounded-full appearance-none cursor-pointer"
                                />
                                <button className="w-full h-11 bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-[#1B1F3B] transition-all shadow-lg shadow-primary/20">
                                    Appliquer
                                </button>
                            </div>
                        </div>

                        {/* Brands Filter */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                            <h3 className="text-sm font-black text-[#1B1F3B] uppercase tracking-widest mb-6 border-b border-gray-50 pb-4">
                                Marques
                            </h3>
                            <div className="flex flex-col gap-3">
                                {brands.map((brand) => (
                                    <label key={brand.name} className="flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-200 text-primary focus:ring-primary transition-all cursor-pointer" />
                                            <span className="text-sm font-bold text-gray-500 group-hover:text-[#1B1F3B] transition-colors">{brand.name}</span>
                                        </div>
                                        <span className="text-[10px] font-black text-gray-300 group-hover:text-primary transition-colors">({brand.count})</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Product Listing Area */}
                    <div className="lg:col-span-3">
                        {/* Toolbar */}
                        <div className="bg-white rounded-[2rem] p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4">
                                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Affichage :</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", viewMode === 'grid' ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-gray-50 text-gray-400 hover:bg-gray-100")}
                                    >
                                        <LayoutGrid className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", viewMode === 'list' ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-gray-50 text-gray-400 hover:bg-gray-100")}
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                </div>
                                <span className="text-xs font-bold text-[#1B1F3B] border-l border-gray-100 pl-4">{products.length} Produits trouvés</span>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Trier par :</span>
                                <div className="relative flex-1 md:flex-none min-w-[180px]">
                                    <select className="w-full h-11 bg-gray-50 border border-gray-100 rounded-xl px-4 text-xs font-bold text-[#1B1F3B] outline-none appearance-none focus:border-primary transition-all pr-10">
                                        <option>Dernières Nouveautés</option>
                                        <option>Prix : Croissant</option>
                                        <option>Prix : Décroissant</option>
                                        <option>Mieux notés</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div className={cn(
                            "grid gap-8",
                            viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                        )}>
                            {products.map((product) => (
                                <ShopProductCard key={product.id} product={product} viewMode={viewMode} />
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="mt-16 flex items-center justify-center gap-3">
                            {[1, 2, 3, '...', 12].map((page, i) => (
                                <button
                                    key={i}
                                    className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-black transition-all",
                                        page === 1 ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white text-gray-500 hover:bg-gray-100 border border-transparent hover:border-gray-200"
                                    )}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </Container>
        </main>
    )
}

function ShopProductCard({ product, viewMode }: { product: any, viewMode: 'grid' | 'list' }) {
    if (viewMode === 'list') {
        return (
            <div className="group flex flex-col md:flex-row bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200 transition-all duration-500">
                <Link href={`/product/${product.id}`} className="relative w-full md:w-[300px] aspect-square bg-white flex items-center justify-center p-8 shrink-0">
                    <Image src={product.image} alt={product.name} fill className="object-contain p-8 group-hover:scale-105 transition-transform duration-500" />
                </Link>
                <div className="p-10 flex flex-col justify-center flex-1">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{product.category}</span>
                        <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-[10px] font-black text-gray-400">{product.rating}.0</span>
                        </div>
                    </div>
                    <Link href={`/product/${product.id}`}>
                        <h3 className="text-xl font-black text-[#1B1F3B] mb-4 hover:text-primary transition-colors cursor-pointer leading-tight uppercase tracking-tight">
                            {product.name}
                        </h3>
                    </Link>
                    <p className="text-gray-400 text-sm mb-6 leading-relaxed line-clamp-2">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                            {product.oldPrice && <span className="text-gray-300 text-xs line-through font-bold">{product.oldPrice.toLocaleString()} CFA</span>}
                            <span className="text-2xl font-black text-[#1B1F3B] tracking-tighter">{product.price.toLocaleString()} <span className="text-xs">CFA</span></span>
                        </div>
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            className="flex items-center gap-3 bg-[#1B1F3B] text-white px-8 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all shadow-xl hover:shadow-primary/20"
                        >
                            <ShoppingCart className="w-4 h-4" /> Ajouter au panier
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="group flex flex-col h-full bg-white rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-gray-200/50 border border-gray-50 p-2">
            {/* Image Area */}
            <div className="relative aspect-square bg-[#fff] rounded-2xl overflow-hidden group/img border border-gray-50">
                <Link href={`/product/${product.id}`} className="absolute inset-0 z-10">
                    <span className="sr-only">Voir {product.name}</span>
                </Link>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
                    {product.badges?.map((badge: any, idx: number) => (
                        <span key={idx} className={cn("text-white text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest shadow-sm", badge.color)}>
                            {badge.text}
                        </span>
                    ))}
                </div>

                {/* Actions */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 z-20 translate-x-12 opacity-0 group-hover/img:translate-x-0 group-hover/img:opacity-100 transition-all duration-500">
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        className="w-9 h-9 rounded-full bg-white text-[#1B1F3B] flex items-center justify-center shadow-md border border-gray-100 hover:bg-primary hover:text-white transition-all scale-90 hover:scale-100 z-20"
                    >
                        <Heart className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        className="w-9 h-9 rounded-full bg-white text-[#1B1F3B] flex items-center justify-center shadow-md border border-gray-100 hover:bg-primary hover:text-white transition-all scale-90 hover:scale-100 z-20"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                </div>

                <div className="relative w-full h-full p-6 flex items-center justify-center transition-transform duration-700 group-hover/img:scale-110">
                    <Image src={product.image} alt={product.name} fill className="object-contain p-6" />
                </div>

                {/* Add to Cart Overlay */}
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    className="absolute bottom-4 left-4 right-4 bg-primary text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transform translate-y-20 opacity-0 group-hover/img:translate-y-0 group-hover/img:opacity-100 transition-all duration-500 flex items-center justify-center gap-2 hover:bg-[#1B1F3B] shadow-xl shadow-primary/20 z-20"
                >
                    <ShoppingCart className="w-3.5 h-3.5" /> Ajouter
                </button>
            </div>

            {/* Content */}
            <div className="p-6 pt-4 flex flex-col gap-2 flex-1">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{product.category}</span>
                    <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-[10px] font-bold text-gray-500">{product.rating}.0</span>
                    </div>
                </div>

                <Link href={`/product/${product.id}`}>
                    <h3 className="font-bold text-sm text-[#1B1F3B] hover:text-primary transition-colors leading-snug line-clamp-2 min-h-[40px]">
                        {product.name}
                    </h3>
                </Link>

                <div className="mt-8 flex items-center justify-between">
                    <div className="flex flex-col">
                        {product.oldPrice && <span className="text-gray-400 text-[10px] line-through font-bold">{product.oldPrice.toLocaleString()} CFA</span>}
                        <span className="text-[#1B1F3B] font-black text-lg tracking-tight">
                            {product.price.toLocaleString()} <span className="text-[10px] font-bold text-gray-400 ml-0.5 uppercase">CFA</span>
                        </span>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                        <Zap className="w-4 h-4 fill-current" />
                    </div>
                </div>
            </div>
        </div>
    )
}
