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
    LayoutGrid,
    ShieldCheck,
    Globe
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
        { id: 'features', label: 'Caractéristiques', icon: Zap },
        { id: 'specs', label: 'Fiche Technique', icon: LayoutGrid },
        { id: 'reviews', label: 'Avis Clients', icon: MessageSquare },
    ]

    return (
        <Container className="py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Image Gallery */}
                <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-6">
                    <div className="relative aspect-square bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm flex items-center justify-center p-8 md:p-12 group/main-img">
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
                                className="object-contain group-hover/main-img:scale-110 transition-transform duration-700"
                                priority
                                unoptimized
                            />
                        </motion.div>
                        {product.oldPrice && (
                            <div className="absolute top-8 left-8">
                                <span className="bg-primary text-white text-[10px] font-black px-4 py-2 rounded-xl shadow-xl shadow-primary/20 uppercase tracking-widest">
                                    Promotion Flash
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        {productImages.map((img: string, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImg(idx)}
                                className={cn(
                                    "relative w-20 h-20 md:w-24 md:h-24 shrink-0 bg-white rounded-2xl overflow-hidden border-2 transition-all p-2",
                                    activeImg === idx ? "border-primary shadow-lg shadow-primary/10" : "border-gray-100 hover:border-gray-200"
                                )}
                            >
                                <Image src={img} alt={`Thumb ${idx}`} fill className="object-contain p-2" unoptimized />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Info */}
                <div className="lg:col-span-12 xl:col-span-7 flex flex-col pt-2">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-primary font-black text-[10px] uppercase tracking-[0.3em]">Premium Quality</span>
                        <div className="h-px flex-1 bg-gray-100" />
                    </div>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#1B1F3B] uppercase tracking-tight leading-[1.1] mb-3">
                        {product.name}
                    </h1>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-primary" />
                             <span className="text-[11px] font-black text-[#1B1F3B] uppercase tracking-widest">{product.brand?.name || product.brand || 'Baraka Shop'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                            {product.category?.name || product.category}
                        </div>
                    </div>

                    <div className="flex items-center gap-8 mb-6 pb-6 border-b border-gray-100/60">
                        <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                                {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                            </div>
                            <span className="text-sm font-black text-[#1B1F3B] ml-1">{product.rating || 5}.0</span>
                        </div>
                        <div className="h-4 w-px bg-gray-200" />
                        <div className="flex items-center gap-6 text-gray-500">
                            <button className="group hover:text-primary transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                <Heart className="w-4 h-4 group-hover:fill-primary transition-colors" />
                                <span>Ma liste</span>
                            </button>
                            <button className="group hover:text-primary transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                <Share2 className="w-4 h-4" />
                                <span>Partager</span>
                            </button>
                        </div>
                    </div>

                    {/* Description Courte */}
                    <div className="mb-6">
                        <div className="space-y-2 max-w-2xl">
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Description courte</h3>
                            <p className="text-gray-500 text-[16px] leading-relaxed font-medium">
                                {product.description || "Découvrez l'élégance et la technologie de pointe combinées dans ce produit d'exception, sélectionné par Baraka Shop pour son rapport qualité-prix imbattable."}
                            </p>
                        </div>
                    </div>

                    <div className="bg-[#1B1F3B] rounded-[2.5rem] p-8 shadow-2xl shadow-blue-900/10 mb-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Prix de vente officiel</span>
                                <div className="flex items-baseline gap-4">
                                    <span className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                                        {product.price.toLocaleString()} <span className="text-sm uppercase font-black text-primary italic">CFA</span>
                                    </span>
                                    {product.oldPrice && (
                                        <span className="text-xl font-bold text-gray-500 line-through tracking-tighter italic">
                                            {product.oldPrice.toLocaleString()} CFA
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                {product.stock > 0 ? (
                                    <div className="flex items-center gap-2 text-green-400">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                        <span className="text-[11px] font-black uppercase tracking-widest">Disponible immédiatement</span>
                                    </div>
                                ) : (
                                    <span className="text-red-400 text-[11px] font-black uppercase tracking-widest">Stock épuisé</span>
                                )}
                                <span className="text-gray-500 text-[9px] font-bold uppercase tracking-widest">Livraison gratuite sur Dakar</span>
                            </div>
                        </div>

                        <div className="h-px bg-white/5 my-4" />

                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="flex items-center bg-white/5 rounded-2xl p-2 border border-white/10 w-full sm:w-auto">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white hover:bg-white/10 transition-all active:scale-90"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-14 text-center font-black text-xl text-white">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white hover:bg-white/10 transition-all active:scale-90"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex-1 w-full flex flex-col sm:flex-row gap-4">
                                <Button
                                    onClick={() => addToCart(product, quantity)}
                                    disabled={product.stock <= 0}
                                    className="flex-1 h-14 bg-white text-[#1B1F3B] hover:bg-gray-100 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 border border-gray-100"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    Ajouter au panier
                                </Button>

                                <Button
                                    onClick={() => {
                                        addToCart(product, quantity);
                                        setTimeout(() => window.location.href = '/checkout', 100);
                                    }}
                                    disabled={product.stock <= 0}
                                    className="flex-1 h-14 bg-primary text-white hover:bg-[#1B1F3B] hover:border hover:border-white/10 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3"
                                >
                                    <Zap className="w-5 h-5 fill-white" />
                                    Achat Rapide
                                </Button>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col items-center">
                            <a
                                href={`https://wa.me/221770000000?text=${encodeURIComponent(`Bonjour Baraka Shop, je souhaiterais commander le produit : ${product.name} (Prix: ${product.price.toLocaleString()} CFA)`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 text-[#25D366] font-black text-[11px] uppercase tracking-[0.2em] hover:scale-105 transition-transform group"
                            >
                                <div className="w-8 h-8 rounded-full bg-[#25D366]/10 flex items-center justify-center">
                                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                    </svg>
                                </div>
                                <span className="group-hover:underline underline-offset-4 decoration-2 decoration-[#25D366]/30 transition-all">Commander via WhatsApp</span>
                            </a>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-8 py-4">
                         <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                             <ShieldCheck size={14} className="text-primary" />
                             Garantie 1 an
                         </div>
                         <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                             <Globe size={14} className="text-primary" />
                             SAV Local
                         </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="mt-12">
                <div className="flex items-center gap-8 md:gap-14 border-b border-gray-100 mb-6 overflow-x-auto scrollbar-hide px-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "pb-6 text-[12px] font-black uppercase tracking-[0.2em] relative transition-all flex items-center gap-3 whitespace-nowrap",
                                activeTab === tab.id ? "text-primary" : "text-gray-300 hover:text-gray-500"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTabDetails"
                                    className="absolute bottom-0 left-0 w-full h-1.5 bg-primary rounded-full"
                                />
                            )}
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-[3rem] p-8 md:p-16 border border-gray-100 shadow-[0_30px_60px_rgba(0,0,0,0.02)] min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'description' && (
                            <motion.div
                                key="desc"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="max-w-4xl"
                            >
                                <h3 className="text-3xl font-black text-[#1B1F3B] uppercase tracking-tight mb-8">Description Détaillée</h3>
                                <p className="text-gray-500 text-lg leading-relaxed font-medium mb-12">
                                    {product.description || "Une description complète pour ce produit sera bientôt disponible."}
                                </p>

                                <div className="pt-12 border-t border-gray-100">
                                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Caractéristiques principales</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                        {[
                                            "Qualité Premium Certifiée",
                                            "Garantie Baraka Shop 12 mois",
                                            "Performance & Durabilité",
                                            "Design Minimaliste & Moderne",
                                            "Service Après-Vente Local",
                                            "Authenticité Garantie"
                                        ].map((feature, i) => (
                                            <div key={i} className="flex items-center gap-4 group">
                                                <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all">
                                                    <Zap size={16} fill="currentColor" />
                                                </div>
                                                <span className="text-[15px] font-bold text-[#1B1F3B]">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'features' && (
                             <motion.div
                                 key="features-tab"
                                 initial={{ opacity: 0, y: 20 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 exit={{ opacity: 0, y: -20 }}
                                 className="grid grid-cols-1 md:grid-cols-3 gap-8"
                             >
                                 {[
                                     { title: "Performance", desc: "Optimisé pour des résultats exceptionnels dans toutes les conditions." },
                                     { title: "Mobilité", desc: "Design ultra-fin et léger pour vous accompagner partout sans compromis." },
                                     { title: "Garantie", desc: "Support technique dédié et garantie complète pièce et main d'œuvre." }
                                 ].map((feat, i) => (
                                     <div key={i} className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 hover:scale-105 transition-transform">
                                         <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                                             <Zap size={24} fill="currentColor" />
                                         </div>
                                         <h4 className="text-lg font-black text-[#1B1F3B] uppercase tracking-tight mb-4">{feat.title}</h4>
                                         <p className="text-gray-500 text-sm leading-relaxed">{feat.desc}</p>
                                     </div>
                                 ))}
                             </motion.div>
                        )}

                        {activeTab === 'specs' && (
                            <motion.div
                                key="specs"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-2"
                            >
                                {product.metadata && typeof product.metadata === 'object' ? (
                                    Object.entries(product.metadata).map(([key, value], i) => (
                                        <div key={i} className="flex items-center justify-between py-6 border-b border-gray-100 last:border-0 group">
                                            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest group-hover:text-primary transition-colors">{key}</span>
                                            <span className="text-base font-bold text-[#1B1F3B]">{String(value)}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-2 py-20 text-center border-2 border-dashed border-gray-100 rounded-[2rem]">
                                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Fiche technique en cours de saisie...</p>
                                    </div>
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
                <div className="mt-16">
                    <div className="flex items-end justify-between mb-8">
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
