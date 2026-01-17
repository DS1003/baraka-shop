'use client'

import React, { useState, use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/ui/Container'
import { Button } from '@/ui/Button'
import {
    Star,
    Truck,
    ShieldCheck,
    RotateCcw,
    Heart,
    Share2,
    Plus,
    Minus,
    CheckCircle2,
    ShoppingCart,
    Zap,
    ChevronRight,
    MessageSquare,
    Info
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ProductCard } from '@/ui/ProductCard'

// Mock products for "Similar Products"
const similarProducts = [
    { id: '2', name: 'iPhone 15 Pro Max 256GB Natural Titanium', category: 'Smartphones', price: 850000, oldPrice: 900000, rating: 5, image: "https://media.ldlc.com/r705/ld/products/00/06/06/39/LD0006063994.jpg", badges: [{ text: 'NEW', color: 'bg-green-500' }] },
    { id: '3', name: 'Sony WH-1000XM5 Wireless Headphones', category: 'Audio & Son', price: 250000, rating: 4, image: "https://sony.scene7.com/is/image/sonyglobalsolutions/360-RA-category-icon-20221202?$S7Product$&fmt=png-alpha" },
    { id: '4', name: 'Canon EOS R6 Mark II Mirrorless Camera', category: 'Image & Son', price: 1800000, oldPrice: 1950000, rating: 5, image: 'https://in.canon/media/image/2022/11/01/c8c8ab88ead148e9b64490fdd764bcf4_EOS+R6+Mark+II+RF24-105mm+f4-7.1+IS+STM+front+slant.png' },
    { id: '1', name: 'MacBook Pro M3 Max 14" - Space Black', category: 'Informatique', price: 2500000, oldPrice: 2800000, rating: 5, image: 'https://media.ldlc.com/r705/ld/products/00/06/22/20/LD0006222055.jpg', badges: [{ text: '-15%', color: 'bg-primary' }] },
]

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [activeImg, setActiveImg] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [activeTab, setActiveTab] = useState('description')

    // Mock detailed product data
    const product = {
        id: id,
        name: "MacBook Pro M3 Max 14\" - Space Black",
        brand: "Apple",
        category: "Informatique",
        sku: "MBP-M3-14-SB",
        price: 2500000,
        oldPrice: 2800000,
        rating: 4.9,
        reviewsCount: 42,
        stock: "In Stock",
        images: [
            'https://media.ldlc.com/r705/ld/products/00/06/22/20/LD0006222055.jpg',
            'https://media.ldlc.com/r705/ld/products/00/06/06/39/LD0006063994.jpg', // Placeholder thumbnails
            'https://media.ldlc.com/encart/p/28885_b.jpg',
            'https://media.ldlc.com/encart/p/28828_b.jpg',
        ],
        description: "Le MacBook Pro 14 pouces s'envole avec les puces M3, M3 Pro et M3 Max. Conçues selon une technologie de gravure en 3 nanomètres et dotées d'une toute nouvelle architecture GPU, ce sont les puces les plus avancées jamais conçues pour un ordinateur personnel. Chaque puce offre plus de performances et de capacités pour les pros.",
        features: [
            "Puce Apple M3 Max avec CPU 14 cœurs et GPU 30 cœurs",
            "Écran Liquid Retina XDR de 14,2 pouces",
            "36 Go de mémoire unifiée",
            "Disque SSD de 1 To",
            "Jusqu'à 18 heures d'autonomie",
        ],
        specs: [
            { label: "Processeur", value: "Apple M3 Max (14 cœurs)" },
            { label: "Mémoire Vive", value: "36 Go RAM" },
            { label: "Stockage", value: "1 To SSD" },
            { label: "Écran", value: "14.2\" Liquid Retina XDR (3024 x 1964)" },
            { label: "Système", value: "macOS Sonoma" },
            { label: "Garantie", value: "12 Mois Officiel" },
        ]
    }

    const tabs = [
        { id: 'description', label: 'Description', icon: Info },
        { id: 'specs', label: 'Spécifications', icon: LayoutGridIcon },
        { id: 'reviews', label: 'Avis Clients', icon: MessageSquare },
    ]

    return (
        <main className="bg-[#f8f9fb] min-h-screen">
            {/* Breadcrumbs */}
            <div className="bg-white border-b border-gray-100 py-4">
                <Container>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
                        <ChevronRight className="w-3 h-3" />
                        <Link href="/boutique" className="hover:text-primary transition-colors">Boutique</Link>
                        <ChevronRight className="w-3 h-3" />
                        <Link href={`/category/${product.category.toLowerCase()}`} className="hover:text-primary transition-colors">{product.category}</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-[#1B1F3B] truncate max-w-[200px]">{product.name}</span>
                    </div>
                </Container>
            </div>

            <section className="py-12">
                <Container>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                        {/* 1. Left: Image Gallery (5 columns) */}
                        <div className="lg:col-span-5 flex flex-col gap-6">
                            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex items-center justify-center p-12 group">
                                <motion.div
                                    key={activeImg}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4 }}
                                    className="relative w-full h-full"
                                >
                                    <Image
                                        src={product.images[activeImg]}
                                        alt={product.name}
                                        fill
                                        className="object-contain"
                                        priority
                                    />
                                </motion.div>

                                {/* Badge Overlay */}
                                <div className="absolute top-8 left-8 flex flex-col gap-3">
                                    <span className="bg-primary text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg shadow-primary/20 uppercase tracking-widest">
                                        Promotion
                                    </span>
                                </div>
                            </div>

                            {/* Thumbnails */}
                            <div className="grid grid-cols-4 gap-4">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImg(idx)}
                                        className={cn(
                                            "relative aspect-square bg-white rounded-2xl overflow-hidden border-2 transition-all p-2",
                                            activeImg === idx ? "border-primary shadow-lg shadow-primary/10" : "border-gray-100 hover:border-gray-200"
                                        )}
                                    >
                                        <Image src={img} alt={`Thumb ${idx}`} fill className="object-contain p-2" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. Right: Product Info (7 columns) */}
                        <div className="lg:col-span-7 flex flex-col">
                            {/* Brand & Stats */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="bg-[#1B1F3B] text-white text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest">{product.brand}</span>
                                    <div className="flex items-center gap-1 border-l border-gray-200 pl-3">
                                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                        <span className="text-xs font-black text-[#1B1F3B]">{product.rating}</span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">({product.reviewsCount} Avis)</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-gray-400">
                                    <button className="hover:text-primary transition-colors flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tight">
                                        <Heart className="w-4 h-4" /> Wishlist
                                    </button>
                                    <button className="hover:text-primary transition-colors flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tight">
                                        <Share2 className="w-4 h-4" /> Partager
                                    </button>
                                </div>
                            </div>

                            <h1 className="text-3xl md:text-5xl font-black text-[#1B1F3B] uppercase tracking-tighter leading-[0.95] mb-6">
                                {product.name}
                            </h1>

                            {/* Price Section */}
                            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm mb-8">
                                <div className="flex flex-col gap-1 mb-6">
                                    <div className="flex items-baseline gap-4">
                                        <span className="text-4xl font-black text-[#1B1F3B] tracking-tighter">
                                            {product.price.toLocaleString()} <span className="text-sm uppercase font-bold text-gray-400">CFA</span>
                                        </span>
                                        {product.oldPrice && (
                                            <span className="text-xl font-bold text-gray-300 line-through tracking-tighter">
                                                {product.oldPrice.toLocaleString()} CFA
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 rounded text-[9px] font-black uppercase tracking-widest border border-green-100">
                                            <CheckCircle2 className="w-3 h-3" /> En Stock
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SKU: {product.sku}</span>
                                    </div>
                                </div>

                                <p className="text-gray-500 text-sm leading-relaxed mb-8 border-t border-gray-50 pt-6">
                                    {product.description}
                                </p>

                                {/* Features List */}
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 mb-8">
                                    {product.features.map((feat, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                                <Zap className="w-2.5 h-2.5 text-primary fill-current" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-600 leading-tight">{feat}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row items-center gap-6">
                                    {/* Qty Selector */}
                                    <div className="flex items-center bg-gray-50 rounded-xl p-1.5 border border-gray-100">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-10 h-10 rounded-lg flex items-center justify-center text-[#1B1F3B] hover:bg-white hover:shadow-sm transition-all"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-12 text-center font-black text-sm">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="w-10 h-10 rounded-lg flex items-center justify-center text-[#1B1F3B] hover:bg-white hover:shadow-sm transition-all"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <Button
                                        onClick={() => {
                                            // Simulate adding to cart and redirect
                                            const btn = document.getElementById('add-to-cart-btn');
                                            if (btn) btn.innerHTML = 'Ajouté !';
                                            setTimeout(() => {
                                                window.location.href = '/cart';
                                            }, 500);
                                        }}
                                        id="add-to-cart-btn"
                                        className="flex-1 w-full sm:w-auto h-14 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-[#1B1F3B] transition-all flex items-center justify-center gap-3"
                                    >
                                        <ShoppingCart className="w-4 h-4" /> Ajouter au panier
                                    </Button>
                                </div>
                            </div>

                            {/* Service Badges */}
                            <div className="grid grid-cols-3 gap-4">
                                <ServiceBadge icon={Truck} label="Livraison Express" sub="Dakar & Régions" />
                                <ServiceBadge icon={ShieldCheck} label="Garantie Officielle" sub="12 Mois Inclus" />
                                <ServiceBadge icon={RotateCcw} label="Retours Faciles" sub="Sous 7 Jours" />
                            </div>
                        </div>
                    </div>

                    {/* 3. Detailed Tabs Section */}
                    <div className="mt-12 md:mt-24">
                        <div className="flex items-center gap-6 md:gap-12 border-b border-gray-100 mb-8 md:mb-12 overflow-x-auto scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "pb-6 text-[10px] md:text-sm font-black uppercase tracking-[0.15em] relative transition-all flex items-center gap-3 whitespace-nowrap",
                                        activeTab === tab.id ? "text-primary" : "text-gray-300 hover:text-gray-500"
                                    )}
                                >
                                    <tab.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeTabDetails"
                                            className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-gray-100 min-h-[400px]">
                            <AnimatePresence mode="wait">
                                {activeTab === 'description' && (
                                    <motion.div
                                        key="desc"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="prose prose-sm max-w-none text-gray-500 leading-relaxed font-medium"
                                    >
                                        <h3 className="text-2xl font-black text-[#1B1F3B] uppercase tracking-tighter mb-6">L'ordinateur portable pro le plus performant au monde.</h3>
                                        <p className="mb-6">Le MacBook Pro propulsera votre créativité vers de nouveaux sommets. Avec les puces M3, l'ordinateur portable pro le plus populaire repousse encore les limites avec jusqu'à 128 Go de mémoire unifiée. Son magnifique écran Liquid Retina XDR est devenu encore meilleur avec une luminosité de pointe atteignant 1600 nits. Et son autonomie de batterie record vous permet de tenir toute la journée.</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
                                            <div className="space-y-4">
                                                <h4 className="text-sm font-black text-[#1B1F3B] uppercase tracking-widest">Performances Extrêmes</h4>
                                                <p>La puce M3 Max intègre plus de 92 milliards de transistors. Elle dispose d'un GPU à 30 ou 40 cœurs avec accélération matérielle du ray tracing.</p>
                                            </div>
                                            <div className="space-y-4">
                                                <h4 className="text-sm font-black text-[#1B1F3B] uppercase tracking-widest">Affichage XDR</h4>
                                                <p>Contraste extrême et couleurs éclatantes. L'écran est étalonné en usine pour offrir les meilleurs rendus HDR et SDR.</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'specs' && (
                                    <motion.div
                                        key="specs"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-4"
                                    >
                                        {product.specs.map((spec, i) => (
                                            <div key={i} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0 md:last:border-b">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{spec.label}</span>
                                                <span className="text-sm font-bold text-[#1B1F3B]">{spec.value}</span>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}

                                {activeTab === 'reviews' && (
                                    <motion.div
                                        key="reviews"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="flex flex-col items-center justify-center text-center py-20"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mb-6">
                                            <MessageSquare className="w-8 h-8" />
                                        </div>
                                        <h4 className="text-xl font-black text-[#1B1F3B] uppercase tracking-tighter mb-2">Pas encore d'avis sur ce produit</h4>
                                        <p className="text-gray-400 text-sm mb-8">Soyez le premier à donner votre avis et aidez nos futurs clients !</p>
                                        <Button variant="outline" className="rounded-xl px-10 h-14 font-black text-[10px] uppercase tracking-widest">
                                            Écrire un avis
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* 4. Similar Products Section */}
                    <div className="mt-32">
                        <div className="flex flex-col gap-2 mb-12">
                            <div className="flex items-center gap-3">
                                <div className="h-[2px] w-8 bg-primary rounded-full" />
                                <span className="text-primary font-black text-[11px] uppercase tracking-[0.4em]">Recommendations</span>
                            </div>
                            <h2 className="text-3xl font-black text-[#1B1F3B] uppercase tracking-tight">Produits Similaires</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {similarProducts.map((prod) => (
                                <ProductCard key={prod.id} product={prod} />
                            ))}
                        </div>
                    </div>
                </Container>
            </section>
        </main>
    )
}

function ServiceBadge({ icon: Icon, label, sub }: { icon: any, label: string, sub: string }) {
    return (
        <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-xl border border-gray-100 group hover:bg-white hover:border-primary transition-all duration-300 cursor-default">
            <Icon className="w-5 h-5 text-primary mb-2 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
            <span className="text-[9px] font-black text-[#1B1F3B] uppercase tracking-tight mb-0.5">{label}</span>
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{sub}</span>
        </div>
    )
}



// Icon fallbacks if LayoutGrid isn't available from lucide
function LayoutGridIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="7" height="7" x="3" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="14" rx="1" />
            <rect width="7" height="7" x="3" y="14" rx="1" />
        </svg>
    )
}
