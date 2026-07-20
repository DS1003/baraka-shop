'use client'

import React, { useState, useTransition } from 'react'
import { Container } from '@/ui/Container'
import Image from 'next/image'
import Link from 'next/link'
import {
    Heart,
    ShoppingCart,
    Trash2,
    ArrowRight,
    Star,
    Package,
    Share2,
    Grid3x3,
    List,
    Sparkles
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useCart } from '@/context/CartContext'
import { toggleWishlistAction } from '@/lib/actions/user-actions'
import { useRouter } from 'next/navigation'

interface WishlistContentProps {
    products: any[]
}

export default function WishlistContent({ products: initialProducts }: WishlistContentProps) {
    const [products, setProducts] = useState(initialProducts)
    const [removingId, setRemovingId] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const { addToCart } = useCart()
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleRemove = async (productId: string) => {
        setRemovingId(productId)
        const result = await toggleWishlistAction(productId)
        if (result.success) {
            // Animate out then remove
            setTimeout(() => {
                setProducts(prev => prev.filter(p => p.id !== productId))
                setRemovingId(null)
            }, 300)
        } else {
            setRemovingId(null)
        }
    }

    const handleAddToCart = (product: any) => {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price || 0,
            image: product.images?.[0] || '/placeholder.png',
            quantity: 1,
        })
    }

    const handleAddAllToCart = () => {
        products.forEach(product => {
            if (product.stock > 0) {
                handleAddToCart(product)
            }
        })
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-SN', {
            style: 'decimal',
            minimumFractionDigits: 0,
        }).format(price) + ' FCFA'
    }

    return (
        <main className="bg-[#f8f9fb] min-h-screen pb-32">
            {/* Hero Header */}
            <div className="bg-[#1B1F3B] py-24 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: `url('https://res.cloudinary.com/dgro5x4h8/image/upload/v1768669738/pattern_2_kln9c6.png')`, backgroundSize: '400px' }} />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-500/10 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none" />

                <Container className="relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col items-center gap-6"
                    >
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                            <Heart className="w-4 h-4 text-primary fill-primary" />
                            <span className="text-white text-xs font-black uppercase tracking-[0.3em]">Ma Liste d'Envies</span>
                        </div>
                        <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter">
                            Mes <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-yellow-300">Favoris</span>
                        </h1>
                        <p className="text-gray-400 max-w-xl mx-auto text-lg font-medium">
                            {products.length > 0
                                ? `Vous avez ${products.length} produit${products.length > 1 ? 's' : ''} dans votre liste d'envies.`
                                : "Votre liste d'envies est vide pour le moment."
                            }
                        </p>
                    </motion.div>
                </Container>
            </div>

            <Container className="pt-12">
                {products.length > 0 ? (
                    <>
                        {/* Actions Bar */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-black text-[#1B1F3B]">{products.length} article{products.length > 1 ? 's' : ''}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                <span className="text-sm font-bold text-gray-400">Liste d'envies</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleAddAllToCart}
                                    className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-primary/80 transition-all shadow-lg shadow-primary/20"
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    Tout ajouter au panier
                                </button>
                                <div className="flex bg-white rounded-xl border border-gray-100 overflow-hidden">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={cn("p-3 transition-colors", viewMode === 'grid' ? "bg-[#1B1F3B] text-white" : "text-gray-400 hover:text-gray-600")}
                                    >
                                        <Grid3x3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={cn("p-3 transition-colors", viewMode === 'list' ? "bg-[#1B1F3B] text-white" : "text-gray-400 hover:text-gray-600")}
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Products Grid/List */}
                        <AnimatePresence mode="popLayout">
                            {viewMode === 'grid' ? (
                                <motion.div
                                    key="grid"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                                >
                                    {products.map((product, idx) => (
                                        <WishlistCard
                                            key={product.id}
                                            product={product}
                                            index={idx}
                                            isRemoving={removingId === product.id}
                                            onRemove={() => handleRemove(product.id)}
                                            onAddToCart={() => handleAddToCart(product)}
                                            formatPrice={formatPrice}
                                        />
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="list"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col gap-4"
                                >
                                    {products.map((product, idx) => (
                                        <WishlistListItem
                                            key={product.id}
                                            product={product}
                                            index={idx}
                                            isRemoving={removingId === product.id}
                                            onRemove={() => handleRemove(product.id)}
                                            onAddToCart={() => handleAddToCart(product)}
                                            formatPrice={formatPrice}
                                        />
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                ) : (
                    <EmptyWishlist />
                )}
            </Container>
        </main>
    )
}

function WishlistCard({ product, index, isRemoving, onRemove, onAddToCart, formatPrice }: {
    product: any
    index: number
    isRemoving: boolean
    onRemove: () => void
    onAddToCart: () => void
    formatPrice: (price: number) => string
}) {
    const displayImage = product.images?.[0] || '/placeholder.png'
    const categoryName = product.category?.name || 'Non classé'
    const brandName = product.brand?.name || ''
    const hasDiscount = product.oldPrice && product.oldPrice > (product.price || 0)
    const discountPercent = hasDiscount ? Math.round((1 - (product.price || 0) / product.oldPrice) * 100) : 0

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isRemoving ? 0 : 1, y: 0, scale: isRemoving ? 0.9 : 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="group bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-gray-200 transition-all duration-500 relative"
        >
            {/* Image */}
            <Link href={`/product/${product.id}`} className="relative aspect-square bg-gray-50 flex items-center justify-center p-8 overflow-hidden block">
                <Image
                    src={displayImage}
                    alt={product.name}
                    fill
                    className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    {hasDiscount && (
                        <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full">
                            -{discountPercent}%
                        </span>
                    )}
                    {product.isNew && (
                        <span className="bg-[#1B1F3B] text-white text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Nouveau
                        </span>
                    )}
                </div>

                {/* Remove Button */}
                <button
                    onClick={(e) => { e.preventDefault(); onRemove() }}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all z-10 opacity-0 group-hover:opacity-100"
                    title="Retirer de la liste"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </Link>

            {/* Info */}
            <div className="p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">{categoryName}</span>
                    {product.stock > 0 ? (
                        <span className="bg-green-50 text-green-600 text-[8px] font-black px-2 py-0.5 rounded-full border border-green-100 flex items-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                            En Stock
                        </span>
                    ) : (
                        <span className="bg-red-50 text-red-600 text-[8px] font-black px-2 py-0.5 rounded-full border border-red-100">
                            Rupture
                        </span>
                    )}
                </div>

                <Link href={`/product/${product.id}`}>
                    <h3 className="font-black text-[#1B1F3B] text-sm leading-tight line-clamp-2 hover:text-primary transition-colors">
                        {product.name}
                    </h3>
                </Link>

                {brandName && (
                    <span className="text-[10px] font-bold text-gray-400">{brandName}</span>
                )}

                {/* Price */}
                <div className="flex items-center gap-3 mt-1">
                    <span className="text-lg font-black text-[#1B1F3B]">
                        {product.price ? formatPrice(product.price) : 'Prix sur demande'}
                    </span>
                    {hasDiscount && (
                        <span className="text-xs text-gray-400 line-through font-bold">
                            {formatPrice(product.oldPrice)}
                        </span>
                    )}
                </div>

                {/* Add to Cart */}
                <button
                    onClick={onAddToCart}
                    disabled={product.stock <= 0}
                    className={cn(
                        "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all mt-1",
                        product.stock > 0
                            ? "bg-[#1B1F3B] text-white hover:bg-primary shadow-lg"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    )}
                >
                    <ShoppingCart className="w-4 h-4" />
                    {product.stock > 0 ? "Ajouter au panier" : "Indisponible"}
                </button>
            </div>
        </motion.div>
    )
}

function WishlistListItem({ product, index, isRemoving, onRemove, onAddToCart, formatPrice }: {
    product: any
    index: number
    isRemoving: boolean
    onRemove: () => void
    onAddToCart: () => void
    formatPrice: (price: number) => string
}) {
    const displayImage = product.images?.[0] || '/placeholder.png'
    const categoryName = product.category?.name || 'Non classé'
    const brandName = product.brand?.name || ''
    const hasDiscount = product.oldPrice && product.oldPrice > (product.price || 0)
    const discountPercent = hasDiscount ? Math.round((1 - (product.price || 0) / product.oldPrice) * 100) : 0

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: isRemoving ? 0 : 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: index * 0.03 }}
            className="group bg-white rounded-[1.5rem] border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row"
        >
            {/* Image */}
            <Link href={`/product/${product.id}`} className="relative w-full md:w-[200px] aspect-square md:aspect-auto bg-gray-50 flex items-center justify-center p-6 shrink-0 overflow-hidden block">
                <Image
                    src={displayImage}
                    alt={product.name}
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                />
                {hasDiscount && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full z-10">
                        -{discountPercent}%
                    </span>
                )}
            </Link>

            {/* Info */}
            <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">{categoryName}</span>
                        {brandName && <span className="text-[10px] font-bold text-gray-400">• {brandName}</span>}
                    </div>
                    <Link href={`/product/${product.id}`}>
                        <h3 className="font-black text-[#1B1F3B] text-base leading-tight line-clamp-2 hover:text-primary transition-colors mb-2">
                            {product.name}
                        </h3>
                    </Link>
                    <div className="flex items-center gap-2">
                        {product.stock > 0 ? (
                            <span className="bg-green-50 text-green-600 text-[8px] font-black px-2 py-0.5 rounded-full border border-green-100 flex items-center gap-1 w-fit">
                                <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                                En Stock
                            </span>
                        ) : (
                            <span className="bg-red-50 text-red-600 text-[8px] font-black px-2 py-0.5 rounded-full border border-red-100 w-fit">
                                Rupture
                            </span>
                        )}
                    </div>
                </div>

                {/* Price */}
                <div className="flex flex-col items-start md:items-end gap-1 shrink-0">
                    <span className="text-xl font-black text-[#1B1F3B]">
                        {product.price ? formatPrice(product.price) : 'Sur demande'}
                    </span>
                    {hasDiscount && (
                        <span className="text-sm text-gray-400 line-through font-bold">
                            {formatPrice(product.oldPrice)}
                        </span>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={onAddToCart}
                        disabled={product.stock <= 0}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all",
                            product.stock > 0
                                ? "bg-[#1B1F3B] text-white hover:bg-primary shadow-lg"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        )}
                    >
                        <ShoppingCart className="w-4 h-4" />
                        <span className="hidden lg:inline">{product.stock > 0 ? "Ajouter" : "Indisponible"}</span>
                    </button>
                    <button
                        onClick={onRemove}
                        className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                        title="Retirer de la liste"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}

function EmptyWishlist() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-lg mx-auto text-center py-12"
        >
            <div className="w-32 h-32 rounded-[2rem] bg-primary/5 border border-primary/10 flex items-center justify-center mx-auto mb-8">
                <Heart className="w-14 h-14 text-primary/30" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-[#1B1F3B] uppercase tracking-tighter mb-4">
                Votre liste est <span className="text-primary">vide</span>
            </h2>
            <p className="text-gray-400 font-medium text-lg mb-10 max-w-md mx-auto">
                Parcourez notre catalogue et ajoutez vos produits favoris pour les retrouver facilement.
            </p>
            <Link
                href="/boutique"
                className="inline-flex items-center gap-3 bg-[#1B1F3B] text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-primary transition-all shadow-xl shadow-[#1B1F3B]/20 hover:-translate-y-1"
            >
                Découvrir nos produits <ArrowRight className="w-4 h-4" />
            </Link>
        </motion.div>
    )
}
