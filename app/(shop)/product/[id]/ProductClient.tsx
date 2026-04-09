'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/ui/Container'
import { Button } from '@/ui/Button'
import {
    Star,
    Heart,
    Share2,
    Plus,
    Minus,
    ShoppingCart,
    Zap,
    ChevronRight,
    ChevronLeft,
    MessageSquare,
    Info,
    LayoutGrid
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ProductCard } from '@/ui/ProductCard'
import { useCart } from '@/context/CartContext'

interface ProductClientProps {
    product: any
    similarProducts: any[]
}

export function ProductClient({ product, similarProducts }: ProductClientProps) {
    const { addToCart } = useCart()
    const [activeImg, setActiveImg] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [activeTab, setActiveTab] = useState('description')

    const [currentIndexSimilar, setCurrentIndexSimilar] = useState(0)
    const [directionSimilar, setDirectionSimilar] = useState(0)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const productImages = product.images && product.images.length > 0
        ? product.images
        : ['/placeholder.png']

    const chunkSize = isMobile ? 2 : 4
    const similarProductChunks = similarProducts.reduce((resultArray: any[][], item, index) => {
        const chunkIndex = Math.floor(index / chunkSize);
        if (!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = [];
        }
        resultArray[chunkIndex].push(item);
        return resultArray;
    }, []);

    const slideNextSimilar = () => {
        if (similarProductChunks.length <= 1) return
        setDirectionSimilar(1)
        setCurrentIndexSimilar((prev) => (prev + 1) % similarProductChunks.length)
    }

    const slidePrevSimilar = () => {
        if (similarProductChunks.length <= 1) return
        setDirectionSimilar(-1)
        setCurrentIndexSimilar((prev) => (prev - 1 + similarProductChunks.length) % similarProductChunks.length)
    }

    const carouselVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 500 : -500,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 500 : -500,
            opacity: 0
        })
    }

    const tabs = [
        { id: 'description', label: 'Description', icon: Info },
        { id: 'specs', label: 'Spécifications', icon: LayoutGrid },
        { id: 'reviews', label: 'Avis Clients', icon: MessageSquare },
    ]

    return (
        <Container className="py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Image Gallery */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex items-center justify-center p-8 md:p-12">
                        <motion.div
                            key={activeImg}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                            className="relative w-full h-full"
                        >
                            <Image
                                src={productImages[activeImg]}
                                alt={product.name}
                                fill
                                className="object-contain"
                                priority
                                unoptimized
                            />
                        </motion.div>
                        {product.oldPrice && (
                            <div className="absolute top-8 left-8">
                                <span className="bg-primary text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg shadow-primary/20 uppercase tracking-widest">
                                    Promotion
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        {productImages.map((img: string, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImg(idx)}
                                className={cn(
                                    "relative aspect-square bg-white rounded-2xl overflow-hidden border-2 transition-all p-2",
                                    activeImg === idx ? "border-primary shadow-lg shadow-primary/10" : "border-gray-100 hover:border-gray-200"
                                )}
                            >
                                <Image src={img} alt={`Thumb ${idx}`} fill className="object-contain p-2" unoptimized />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Info */}
                <div className="lg:col-span-7 flex flex-col pt-2">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#1B1F3B] uppercase tracking-tight leading-tight mb-4">
                        {product.name}
                    </h1>
                    {/* Description courte */}
                    {product.description && (
                        <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-6 font-medium line-clamp-2">
                            {product.description.length > 120
                                ? product.description.substring(0, 120) + '…'
                                : product.description}
                        </p>
                    )}

                    <div className="flex items-center gap-3 mb-6">
                        <span className="bg-[#1B1F3B] text-white text-[10px] font-black px-4 py-1.5 rounded-lg uppercase tracking-widest shadow-sm">
                            {product.brand?.name || product.brand || 'Baraka Premium'}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Catégorie: {product.category?.name || product.category}
                        </span>
                    </div>

                    <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-black text-[#1B1F3B]">{product.rating || 5}.0</span>
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide border-l border-gray-200 ml-2 pl-2">
                                {product.reviews?.length || 0} Avis clients
                            </span>
                        </div>
                        <div className="flex items-center gap-6 text-gray-500">
                            <button className="group hover:text-primary transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                <Heart className="w-4 h-4 group-hover:fill-primary transition-colors" />
                                <span className="hidden sm:inline">Liste de souhaits</span>
                            </button>
                            <button className="group hover:text-primary transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                <Share2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Partager</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-baseline gap-4">
                                    <span className="text-3xl md:text-4xl font-black text-[#1B1F3B] tracking-tighter">
                                        {product.price.toLocaleString()} <span className="text-sm uppercase font-bold text-gray-400">CFA</span>
                                    </span>
                                    {product.oldPrice && (
                                        <span className="text-lg font-bold text-gray-300 line-through tracking-tighter">
                                            {product.oldPrice.toLocaleString()} CFA
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                    {product.stock > 0 ? (
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-green-100">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                            En Stock ({product.stock})
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-red-100">
                                            Hors Stock
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="flex items-center bg-gray-50 rounded-2xl p-1.5 border border-gray-100 shadow-inner">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-11 h-11 rounded-xl flex items-center justify-center text-[#1B1F3B] hover:bg-white hover:shadow-md transition-all active:scale-90"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-14 text-center font-black text-lg">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-11 h-11 rounded-xl flex items-center justify-center text-[#1B1F3B] hover:bg-white hover:shadow-md transition-all active:scale-90"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex-1 w-full flex flex-col sm:flex-row gap-3">
                                <Button
                                    onClick={() => addToCart(product, quantity)}
                                    disabled={product.stock <= 0}
                                    className="flex-1 h-14 bg-white border-2 border-[#1B1F3B] text-[#1B1F3B] rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[#1B1F3B] hover:text-white transition-all flex items-center justify-center gap-3 group"
                                >
                                    <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    Ajouter au panier
                                </Button>

                                <Button
                                    onClick={() => {
                                        addToCart(product, quantity);
                                        // On attend un tout petit peu pour que l'état du panier se mette à jour si nécessaire
                                        setTimeout(() => window.location.href = '/checkout', 100);
                                    }}
                                    disabled={product.stock <= 0}
                                    className="flex-1 h-14 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-[0_15px_30px_rgba(249,115,22,0.3)] hover:bg-[#1B1F3B] hover:shadow-none transition-all flex items-center justify-center gap-3 group"
                                >
                                    <Zap className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                                    Acheter maintenant
                                </Button>
                        </div>
                        <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col items-center">
                            <a
                                href={`https://wa.me/221770000000?text=${encodeURIComponent(`Bonjour Baraka Shop, je souhaiterais commander le produit : ${product.name} (Prix: ${product.price.toLocaleString()} CFA)`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 text-[#25D366] font-black text-[12px] uppercase tracking-[0.2em] hover:scale-105 transition-transform group"
                            >
                                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                                Commander par WhatsApp
                                <div className="h-[1px] w-0 group-hover:w-full bg-[#25D366] transition-all duration-300" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

            {/* Tabs */}
            <div className="mt-24">
                <div className="flex items-center gap-12 border-b border-gray-100 mb-12 overflow-x-auto scrollbar-hide">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "pb-6 text-sm font-black uppercase tracking-[0.15em] relative transition-all flex items-center gap-3 whitespace-nowrap",
                                activeTab === tab.id ? "text-primary" : "text-gray-300 hover:text-gray-500"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
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

                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100 min-h-[300px]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'description' && (
                            <motion.div
                                key="desc"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="prose prose-sm max-w-none text-gray-500 leading-relaxed font-medium"
                            >
                                <h3 className="text-2xl font-black text-[#1B1F3B] uppercase tracking-tighter mb-6">Description du produit</h3>
                                <p>{product.description}</p>
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
                                {product.metadata && typeof product.metadata === 'object' ? (
                                    Object.entries(product.metadata).map(([key, value], i) => (
                                        <div key={i} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0 md:last:border-b">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{key}</span>
                                            <span className="text-sm font-bold text-[#1B1F3B]">{String(value)}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-400 italic">Aucune spécification technique détaillée disponible.</p>
                                )}
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
                                <MessageSquare className="w-12 h-12 text-gray-200 mb-6" />
                                <h4 className="text-xl font-black text-[#1B1F3B] uppercase tracking-tighter mb-2">Avis clients</h4>
                                <p className="text-gray-400 text-sm mb-8">Service bientôt disponible.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Similar Products */}
            {similarProducts.length > 0 && (
                <div className="mt-32">
                    <div className="flex items-end justify-between mb-12">
                        <div className="flex flex-col gap-2">
                            <span className="text-primary font-black text-[11px] uppercase tracking-[0.4em]">Découverte</span>
                            <h2 className="text-3xl font-black text-[#1B1F3B] uppercase tracking-tight">Produits <span className="text-primary italic">Similaires</span></h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={slidePrevSimilar}
                                disabled={similarProductChunks.length <= 1}
                                className="w-11 h-11 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm text-[#1B1F3B] disabled:opacity-20 transition-all"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={slideNextSimilar}
                                disabled={similarProductChunks.length <= 1}
                                className="w-11 h-11 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm text-[#1B1F3B] disabled:opacity-20 transition-all"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="relative h-[450px]">
                        <AnimatePresence initial={false} custom={directionSimilar} mode="wait">
                            <motion.div
                                key={currentIndexSimilar}
                                custom={directionSimilar}
                                variants={carouselVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ x: { type: "spring", stiffness: 200, damping: 25 }, opacity: { duration: 0.3 } }}
                                className={cn("grid gap-8 absolute inset-0", isMobile ? "grid-cols-2" : "grid-cols-4")}
                            >
                                {similarProductChunks[currentIndexSimilar]?.map((prod) => (
                                    <ProductCard key={prod.id} product={prod} />
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </Container>
    )
}
