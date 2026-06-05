'use client'

import React, { useState, useEffect, useMemo } from 'react'
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
    Play,
    Maximize2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ProductCard } from '@/ui/ProductCard'
import { useCart } from '@/context/CartContext'
import { MediaViewer, buildProductMedia, getYouTubeId, getYouTubeThumbnail } from '@/components/MediaViewer'
import type { MediaItem } from '@/components/MediaViewer'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { checkWishlistAction, toggleWishlistAction } from '@/lib/actions/user-actions'

interface ProductClientProps {
    product: any
    similarProducts: any[]
}

export function ProductClient({ product, similarProducts }: ProductClientProps) {
    const { addToCart } = useCart()
    const { data: session } = useSession()
    const [isWishlisted, setIsWishlisted] = useState(false)
    const [isWishlisting, setIsWishlisting] = useState(false)

    useEffect(() => {
        if (session?.user?.id) {
            checkWishlistAction(product.id).then(setIsWishlisted)
        }
    }, [session?.user?.id, product.id])

    const handleWishlistToggle = async () => {
        if (!session?.user?.id) {
            toast.error("Veuillez vous connecter pour utiliser la liste d'envies.")
            return
        }
        setIsWishlisting(true)
        const res = await toggleWishlistAction(product.id)
        if (res.success) {
            setIsWishlisted(res.isWishlisted)
            toast.success(res.message)
        } else {
            toast.error(res.message)
        }
        setIsWishlisting(false)
    }

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: product.name,
                    text: `Découvrez ${product.name} sur Baraka Shop !`,
                    url: window.location.href,
                })
            } else {
                await navigator.clipboard.writeText(window.location.href)
                toast.success("Lien copié dans le presse-papiers !")
            }
        } catch (error) {
            console.error("Erreur lors du partage", error)
        }
    }
    const [activeImg, setActiveImg] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [activeTab, setActiveTab] = useState('description')
    const [showStickyBar, setShowStickyBar] = useState(false)
    const [viewerOpen, setViewerOpen] = useState(false)
    const [viewerIndex, setViewerIndex] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            const scrollThreshold = 600
            if (window.scrollY > scrollThreshold) {
                setShowStickyBar(true)
            } else {
                setShowStickyBar(false)
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const [currentIndexSimilar, setCurrentIndexSimilar] = useState(0)
    const [directionSimilar, setDirectionSimilar] = useState(0)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const [selectedColor, setSelectedColor] = useState<any>(
        product.colorVariants && product.colorVariants.length > 0 ? product.colorVariants[0] : null
    )

    useEffect(() => {
        if (product.colorVariants && product.colorVariants.length > 0) {
            setSelectedColor(product.colorVariants[0])
            setActiveImg(0)
        }
    }, [product])

    const productImages = selectedColor && selectedColor.images && selectedColor.images.length > 0
        ? selectedColor.images
        : product.images && product.images.length > 0
            ? product.images
            : ['/placeholder.png']

    const productVideos: string[] = product.videos || []

    // Build media items for the viewer (images + videos combined)
    const allMedia: MediaItem[] = useMemo(() => {
        return buildProductMedia(productImages, productVideos)
    }, [productImages, productVideos])

    const openViewer = (mediaIndex: number) => {
        setViewerIndex(mediaIndex)
        setViewerOpen(true)
    }

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
        { id: 'specs', label: 'Fiche Technique', icon: LayoutGrid },
        { id: 'reviews', label: 'Avis Clients', icon: MessageSquare },
    ]

    return (
        <Container className="pt-2 pb-8 md:pt-4 md:pb-12">
            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-2 md:gap-4 lg:gap-8">
                {/* Mobile Header: Name & Brand - Hidden on Desktop */}
                <div className="flex flex-col gap-1 lg:hidden">
                    <h1 className="text-2xl font-black text-[#1B1F3B] tracking-tight leading-tight">
                        {product.name}
                    </h1>
                </div>

                {/* Image & Video Gallery */}
                <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-2 md:gap-4">
                    {/* Desktop Gallery: Main Image + Thumbnails */}
                    <div className="hidden md:flex flex-col gap-4">
                        <div
                            className="relative aspect-square bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm flex items-center justify-center p-12 group/main-img cursor-pointer"
                            onClick={() => openViewer(activeImg)}
                        >
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
                            <div className="absolute bottom-6 right-6 w-10 h-10 bg-white/90 rounded-xl flex items-center justify-center opacity-0 group-hover/main-img:opacity-100 transition-all shadow-lg border border-gray-100">
                                <Maximize2 className="w-4 h-4 text-gray-600" />
                            </div>
                        </div>

                        {/* Thumbnails */}
                        <div className="flex flex-wrap gap-3 pb-2">
                            {(() => {
                                const MAX_IMAGES = productVideos.length > 0 ? 4 : 5;
                                const visibleImagesCount = Math.min(productImages.length, MAX_IMAGES);
                                const extraImagesCount = productImages.length - MAX_IMAGES;

                                const thumbs = [];

                                // 1. Render Image Thumbnails
                                for (let idx = 0; idx < visibleImagesCount; idx++) {
                                    const img = productImages[idx];
                                    const isLastVisibleImage = idx === MAX_IMAGES - 1;
                                    const hasExtraImages = extraImagesCount > 0;
                                    const showOverlay = isLastVisibleImage && hasExtraImages;

                                    thumbs.push(
                                        <button
                                            key={`img-${idx}`}
                                            onClick={() => showOverlay ? openViewer(idx) : setActiveImg(idx)}
                                            className={cn(
                                                "relative w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 shrink-0 bg-white rounded-xl md:rounded-2xl overflow-hidden border-2 transition-all p-1.5 md:p-2",
                                                activeImg === idx && !showOverlay ? "border-primary shadow-lg shadow-primary/10" : "border-gray-100 hover:border-gray-200"
                                            )}
                                        >
                                            <Image src={img} alt={`Thumb ${idx}`} fill className="object-contain p-1.5 md:p-2" unoptimized />
                                            {showOverlay && (
                                                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10 rounded-xl md:rounded-2xl">
                                                    <span className="text-white font-black text-lg md:text-xl lg:text-2xl">+{extraImagesCount}</span>
                                                </div>
                                            )}
                                        </button>
                                    );
                                }

                                // 2. Render Video Thumbnail (Max 1)
                                if (productVideos.length > 0) {
                                    const vid = productVideos[0];
                                    const ytId = getYouTubeId(vid);
                                    const thumbSrc = ytId ? getYouTubeThumbnail(ytId) : undefined;
                                    const hasExtraVideos = productVideos.length > 1;

                                    thumbs.push(
                                        <button
                                            key={`vid-0`}
                                            onClick={() => openViewer(productImages.length)}
                                            className={cn(
                                                "relative w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 shrink-0 bg-gray-900 rounded-xl md:rounded-2xl overflow-hidden border-2 transition-all group/vid",
                                                "border-gray-100 hover:border-orange-400"
                                            )}
                                        >
                                            {thumbSrc ? (
                                                <img src={thumbSrc} alt="Video" className="w-full h-full object-cover opacity-80 group-hover/vid:opacity-100 transition-opacity" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center" />
                                            )}
                                            
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full bg-orange-500/90 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover/vid:scale-110 transition-transform">
                                                    <Play className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 text-white fill-white ml-0.5" />
                                                </div>
                                            </div>
                                            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/70 text-white text-[7px] md:text-[8px] font-black uppercase rounded tracking-wider">
                                                {ytId ? 'YT' : 'VID'}
                                            </span>

                                            {hasExtraVideos && (
                                                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10 rounded-xl md:rounded-2xl">
                                                    <span className="text-white font-black text-lg md:text-xl lg:text-2xl">+{productVideos.length - 1}</span>
                                                </div>
                                            )}
                                        </button>
                                    );
                                }

                                return thumbs;
                            })()}
                        </div>
                    </div>

                    {/* Mobile Gallery: Horizontal Swipeable Snap Scroll Carousel */}
                    <div className="block md:hidden relative aspect-square w-full rounded-3xl overflow-hidden border border-gray-100 shadow-sm bg-white">
                        <div 
                            className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            onScroll={(e) => {
                                const container = e.currentTarget;
                                const width = container.clientWidth;
                                const newIdx = Math.round(container.scrollLeft / width);
                                if (newIdx !== activeImg) {
                                    setActiveImg(newIdx);
                                }
                            }}
                        >
                            {allMedia.map((media: any, idx: number) => (
                                <div 
                                    key={idx} 
                                    className="w-full h-full flex-shrink-0 snap-start flex items-center justify-center p-6 relative cursor-pointer"
                                    onClick={() => openViewer(idx)}
                                >
                                    {media.type === 'image' ? (
                                        <Image
                                            src={media.url}
                                            alt={`${product.name} - ${idx}`}
                                            fill
                                            className="object-contain p-4"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gray-900 border border-gray-100 flex items-center justify-center group/vid">
                                            {media.thumbnailUrl ? (
                                                <img src={media.thumbnailUrl} alt="Video" className="w-full h-full object-cover opacity-80" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center" />
                                            )}
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="w-12 h-12 rounded-full bg-orange-500/90 flex items-center justify-center shadow-lg shadow-orange-500/30">
                                                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {product.oldPrice && (
                            <div className="absolute top-4 left-4 z-10">
                                <span className="bg-primary text-white text-[8px] font-black px-2.5 py-1.5 rounded-lg shadow-lg shadow-primary/20 uppercase tracking-widest">
                                    Promotion Flash
                                </span>
                            </div>
                        )}

                        <div className="absolute bottom-4 right-4 z-10 w-8 h-8 bg-white/90 rounded-lg flex items-center justify-center shadow-md border border-gray-100" onClick={() => openViewer(activeImg)}>
                            <Maximize2 className="w-3.5 h-3.5 text-gray-600" />
                        </div>

                        {/* Pagination Dots */}
                        {allMedia.length > 1 && (
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
                                {allMedia.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={cn(
                                            "h-1.5 rounded-full transition-all duration-300",
                                            activeImg === idx ? "w-4 bg-primary" : "w-1.5 bg-gray-300"
                                        )}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Product Info */}
                <div className="lg:col-span-12 xl:col-span-7 flex flex-col pt-0 lg:pt-2">
                    {/* Desktop Header - Hidden on Mobile */}
                    <div className="hidden lg:flex flex-col">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#1B1F3B] tracking-tight leading-[1.1] mb-4">
                            {product.name}
                        </h1>

                    </div>

                    {/* Description Courte */}
                    <div className="mb-1 md:mb-2 max-w-2xl">
                        <p className="text-gray-500 text-sm md:text-[16px] leading-relaxed font-medium">
                            {product.shortDescription || product.description?.substring(0, 160) + "..." || "Découvrez l'élégance et la technologie de pointe combinées dans ce produit d'exception, sélectionné par Baraka Shop."}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-2 md:mb-3">
                        <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span className="text-[10px] font-black text-[#1B1F3B] uppercase tracking-widest">{product.brand?.name || product.brand || 'Baraka Shop'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-wider">
                            {product.category?.name || product.category}
                        </div>
                    </div>

                    <div className="flex items-center gap-6 md:gap-8 mb-3 md:mb-4 pb-3 md:pb-4 border-b border-gray-100/60">
                        <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3.5 h-3.5 md:w-4 md:h-4 fill-yellow-400 text-yellow-400" />)}
                            </div>
                            <span className="text-xs md:text-sm font-black text-[#1B1F3B] ml-1">{product.rating || 5}.0</span>
                        </div>
                        <div className="h-4 w-px bg-gray-200" />
                        <div className="flex items-center gap-4 md:gap-6 text-gray-500">
                            <button 
                                onClick={handleWishlistToggle}
                                disabled={isWishlisting}
                                className={cn(
                                    "group transition-all flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest disabled:opacity-50",
                                    isWishlisted ? "text-primary" : "hover:text-primary"
                                )}
                            >
                                <Heart className={cn("w-3.5 h-3.5 md:w-4 md:h-4 transition-colors", isWishlisted ? "fill-primary" : "group-hover:fill-primary")} />
                                <span>{isWishlisted ? "Dans ma liste" : "Ma liste"}</span>
                            </button>
                            <button 
                                onClick={handleShare}
                                className="group hover:text-primary transition-all flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest"
                            >
                                <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                <span>Partager</span>
                            </button>
                        </div>
                    </div>

                    {/* Variantes de Couleur */}
                    {product.colorVariants && product.colorVariants.length > 0 && (
                        <div className="mb-6 md:mb-8">
                            <span className="text-[12px] md:text-[13px] font-bold text-[#1B1F3B] mb-4 block">
                                Couleur ({product.colorVariants.length}) : <span className="font-black uppercase tracking-tight">{selectedColor?.colorName || ''}</span>
                            </span>
                            <div className="flex flex-wrap gap-3 md:gap-4">
                                {product.colorVariants.map((color: any, idx: number) => {
                                    const variantImage = color.images && color.images.length > 0 ? color.images[0] : (product.images && product.images.length > 0 ? product.images[0] : '/placeholder.png');
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setSelectedColor(color);
                                                setActiveImg(0); 
                                            }}
                                            className={cn(
                                                "relative w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl border-2 transition-all p-1 bg-white overflow-hidden group",
                                                selectedColor?.id === color.id 
                                                    ? "border-[#1B1F3B] shadow-lg scale-105" 
                                                    : "border-gray-100 hover:border-gray-300"
                                            )}
                                            title={color.colorName}
                                        >
                                            <div className="relative w-full h-full">
                                                <Image 
                                                    src={variantImage} 
                                                    alt={color.colorName} 
                                                    fill 
                                                    className="object-contain p-1 group-hover:scale-110 transition-transform duration-500"
                                                    unoptimized
                                                />
                                            </div>
                                            {selectedColor?.id === color.id && (
                                                <div className="absolute inset-0 bg-[#1B1F3B]/5 pointer-events-none" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="bg-[#1B1F3B] rounded-3xl md:rounded-[2.5rem] p-5 md:p-8 shadow-2xl shadow-blue-900/10 mb-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8">
                            <div className="flex flex-col gap-1">
                                <span className="text-gray-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest">Prix de vente officiel</span>
                                <div className="flex items-baseline gap-3 md:gap-4">
                                    <span className="text-2xl md:text-5xl font-black text-white tracking-tighter">
                                        {product.price.toLocaleString()} <span className="text-sm uppercase font-black text-primary italic">FCFA</span>
                                    </span>
                                    {product.oldPrice && (
                                        <span className="text-sm md:text-xl font-bold text-gray-500 line-through tracking-tighter italic">
                                            {product.oldPrice.toLocaleString()} FCFA
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col items-start md:items-end gap-2">
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
                            <div className="flex items-center justify-between bg-white/5 rounded-2xl p-1.5 md:p-2 border border-white/10 w-full sm:w-auto h-14 md:h-16">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-white hover:bg-white/10 transition-all active:scale-90"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-14 text-center font-black text-xl text-white">{quantity}</span>
                                <button
                                    onClick={() => {
                                        if (quantity < product.stock) {
                                            setQuantity(quantity + 1);
                                        } else {
                                            toast.error(`Stock maximum atteint (${product.stock} disponibles)`);
                                        }
                                    }}
                                    className={cn(
                                        "w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-white transition-all",
                                        quantity >= product.stock ? "opacity-50 cursor-not-allowed" : "hover:bg-white/10 active:scale-90"
                                    )}
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex-1 w-full flex flex-col sm:flex-row gap-3 md:gap-4">
                                <Button
                                    onClick={() => addToCart({ ...product, selectedColor: selectedColor?.colorName }, quantity)}
                                    disabled={product.stock <= 0}
                                    className="flex-1 h-14 md:h-16 bg-white text-[#1B1F3B] hover:bg-gray-100 rounded-2xl font-black text-[11px] md:text-[12px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 md:gap-3 border border-white/10 shadow-sm"
                                >
                                    <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                                    Ajouter au panier
                                </Button>

                                <Button
                                    onClick={() => {
                                        addToCart({ ...product, selectedColor: selectedColor?.colorName }, quantity);
                                        setTimeout(() => window.location.href = '/checkout', 100);
                                    }}
                                    disabled={product.stock <= 0}
                                    className="flex-1 h-14 md:h-16 bg-primary text-white hover:bg-[#1B1F3B] hover:border hover:border-white/10 rounded-2xl font-black text-[11px] md:text-[12px] uppercase tracking-widest shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 md:gap-3 border border-primary/20"
                                >
                                    <Zap className="w-4 h-4 md:w-5 md:h-5 fill-white" />
                                    Achat Rapide
                                </Button>
                            </div>
                        </div>

                        {quantity >= product.stock && product.stock > 0 && (
                            <div className="mt-3 text-center sm:text-left">
                                <span className="text-orange-400 text-[10px] md:text-[11px] font-bold tracking-wide flex items-center justify-center sm:justify-start gap-1.5">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Quantité maximale disponible atteinte ({product.stock} en stock)
                                </span>
                            </div>
                        )}

                        <div className="mt-6 pt-6 border-t border-white/5 flex flex-col items-center">
                            <a
                                href={`https://wa.me/221770000000?text=${encodeURIComponent(`Bonjour Baraka Shop, je souhaiterais commander le produit : ${product.name} (Prix: ${product.price.toLocaleString()} FCFA)`)}`}
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
                </div>
            </div>

            <div className="mt-4 md:mt-8 px-0 md:px-0">
                <div className="sticky top-[60px] md:top-[85px] z-40 flex p-1 bg-white/80 backdrop-blur-xl rounded-2xl md:rounded-[2rem] border border-gray-200 mb-6 md:mb-8 w-full scrollbar-hide shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "relative flex-1 px-2 md:px-8 py-2.5 md:py-4 text-[8px] md:text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 md:gap-3 whitespace-nowrap rounded-xl md:rounded-[1.5rem] z-10",
                                activeTab === tab.id ? "text-white" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <tab.icon className={cn("w-3 h-3 md:w-4 md:h-4", activeTab === tab.id ? "text-white" : "text-gray-400")} />
                            <span className="truncate">{tab.label}</span>
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTabPill"
                                    className="absolute inset-0 bg-primary rounded-xl md:rounded-[1.5rem] -z-10 shadow-lg shadow-primary/20"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-3xl md:rounded-[3rem] p-4 md:p-10 border border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.015)] min-h-[300px] md:min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'description' && (
                            <motion.div
                                key="desc"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="max-w-none"
                            >
                                {(!product.detailedDescription || !Array.isArray(product.detailedDescription) || !product.detailedDescription.some((b: any) => b.type === 'LOGO')) && product.brand?.image && (
                                    <div className="flex justify-center mb-6 md:mb-10">
                                        <div className="relative w-32 h-12 md:w-48 md:h-20">
                                            <Image
                                                src={product.brand.image}
                                                alt={product.brand.name}
                                                fill
                                                className="object-contain"
                                                unoptimized
                                            />
                                        </div>
                                    </div>
                                )}
                                
                                {product.description && (
                                    <div
                                        className="text-gray-500 text-sm md:text-lg leading-relaxed font-medium mb-6 md:mb-8 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic [&_u]:underline [&>div]:mb-2 [&>p]:mb-4 [&>*:last-child]:mb-0 [&>*:first-child]:text-xl [&>*:first-child]:md:text-3xl [&>*:first-child]:font-black [&>*:first-child]:text-[#1B1F3B] [&>*:first-child]:uppercase [&>*:first-child]:tracking-tight [&>*:first-child]:mb-6 [&>*:first-child_strong]:font-black [&>*:first-child_b]:font-black"
                                        dangerouslySetInnerHTML={{ __html: product.description }}
                                    />
                                )}
                                
                                {product.detailedDescription && Array.isArray(product.detailedDescription) && product.detailedDescription.length > 0 && (
                                    <div className="space-y-4 md:space-y-6 mb-8 md:mb-10">
                                        {(() => {
                                            let imgTextCount = 0;
                                            return product.detailedDescription.map((block: any, idx: number) => {
                                            switch (block.type) {
                                                case 'LOGO':
                                                    return (
                                                        <div key={idx} className="flex justify-center">
                                                            <div className="relative w-32 h-12 md:w-48 md:h-20">
                                                                <Image src={block.image} alt="" fill className="object-contain" unoptimized />
                                                            </div>
                                                        </div>
                                                    );
                                                case 'TITLE_CENTERED':
                                                    return (
                                                        <div key={idx} className="text-center max-w-4xl mx-auto py-12 font-montserrat">
                                                            <h2 className="text-[20px] md:text-[24px] font-bold text-[#282828] uppercase tracking-[0.1em] leading-tight">
                                                                {block.title}
                                                            </h2>
                                                        </div>
                                                    );
                                                case 'TEXT_CENTERED':
                                                    return (
                                                        <div key={idx} className="text-center max-w-2xl mx-auto">
                                                            <p className="text-gray-500 text-sm md:text-lg leading-relaxed font-medium">
                                                                {block.text}
                                                            </p>
                                                        </div>
                                                    );
                                                case 'IMAGE_FULL':
                                                    return (
                                                        <div key={idx} className="relative w-full aspect-[16/7] rounded-[2.5rem] md:rounded-[4rem] overflow-hidden bg-slate-50 shadow-sm border border-slate-100">
                                                            <Image src={block.image} alt="" fill className="object-cover" unoptimized />
                                                        </div>
                                                    );
                                                case 'IMAGE_LEFT': {
                                                    const isGrey = imgTextCount % 2 === 0;
                                                    imgTextCount++;
                                                    return (
                                                        <div key={idx} className={cn("flex flex-col md:flex-row items-center gap-6 md:gap-12 py-6 md:py-8 font-montserrat -mx-4 md:-mx-10 px-4 md:px-10 transition-colors duration-300", isGrey ? "bg-gray-50 border-y border-gray-100/50" : "bg-white")}>
                                                            <div className="w-full md:w-1/2 flex justify-center">
                                                                <div className="relative w-full max-w-[600px] aspect-square overflow-hidden">
                                                                    <Image src={block.image} alt="" fill className="object-contain" unoptimized />
                                                                </div>
                                                            </div>
                                                            <div className="w-full md:w-1/2 space-y-6">
                                                                <h3 className="text-[18px] md:text-[20px] font-bold text-[#282828] uppercase tracking-wider leading-snug">
                                                                    {block.title}
                                                                </h3>
                                                                <div 
                                                                    className="text-[#505050] text-[14px] leading-[1.8] font-normal whitespace-pre-wrap"
                                                                    dangerouslySetInnerHTML={{ __html: block.text }}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                case 'IMAGE_RIGHT': {
                                                    const isGrey = imgTextCount % 2 === 0;
                                                    imgTextCount++;
                                                    return (
                                                        <div key={idx} className={cn("flex flex-col-reverse md:flex-row items-center gap-6 md:gap-12 py-6 md:py-8 font-montserrat -mx-4 md:-mx-10 px-4 md:px-10 transition-colors duration-300", isGrey ? "bg-gray-50 border-y border-gray-100/50" : "bg-white")}>
                                                            <div className="w-full md:w-1/2 space-y-6">
                                                                <h3 className="text-[18px] md:text-[20px] font-bold text-[#282828] uppercase tracking-wider leading-snug">
                                                                    {block.title}
                                                                </h3>
                                                                <div 
                                                                    className="text-[#505050] text-[14px] leading-[1.8] font-normal whitespace-pre-wrap"
                                                                    dangerouslySetInnerHTML={{ __html: block.text }}
                                                                />
                                                            </div>
                                                            <div className="w-full md:w-1/2 flex justify-center">
                                                                <div className="relative w-full max-w-[600px] aspect-square overflow-hidden">
                                                                    <Image src={block.image} alt="" fill className="object-contain" unoptimized />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                case 'VIDEO_LEFT': {
                                                    const isGrey = imgTextCount % 2 === 0;
                                                    imgTextCount++;
                                                    return (
                                                        <div key={idx} className={cn("flex flex-col md:flex-row items-center gap-6 md:gap-12 py-6 md:py-8 font-montserrat -mx-4 md:-mx-10 px-4 md:px-10 transition-colors duration-300", isGrey ? "bg-gray-50 border-y border-gray-100/50" : "bg-white")}>
                                                            <div className="w-full md:w-1/2 relative aspect-video overflow-hidden rounded-2xl md:rounded-3xl bg-black shadow-lg">
                                                                {(() => {
                                                                    const url = block.video || '';
                                                                    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/);
                                                                    if (ytMatch) return <iframe src={`https://www.youtube.com/embed/${ytMatch[1]}`} className="w-full h-full absolute inset-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Video" />;
                                                                    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
                                                                    if (vimeoMatch) return <iframe src={`https://player.vimeo.com/video/${vimeoMatch[1]}`} className="w-full h-full absolute inset-0" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title="Video" />;
                                                                    if (url) return <video src={url} controls className="w-full h-full absolute inset-0 object-contain bg-black" />;
                                                                    return null;
                                                                })()}
                                                            </div>
                                                            <div className="w-full md:w-1/2 space-y-6">
                                                                <h3 className="text-[18px] md:text-[20px] font-bold text-[#282828] uppercase tracking-wider leading-snug">
                                                                    {block.title}
                                                                </h3>
                                                                <div 
                                                                    className="text-[#505050] text-[14px] leading-[1.8] font-normal whitespace-pre-wrap"
                                                                    dangerouslySetInnerHTML={{ __html: block.text }}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                case 'VIDEO_RIGHT': {
                                                    const isGrey = imgTextCount % 2 === 0;
                                                    imgTextCount++;
                                                    return (
                                                        <div key={idx} className={cn("flex flex-col-reverse md:flex-row items-center gap-6 md:gap-12 py-6 md:py-8 font-montserrat -mx-4 md:-mx-10 px-4 md:px-10 transition-colors duration-300", isGrey ? "bg-gray-50 border-y border-gray-100/50" : "bg-white")}>
                                                            <div className="w-full md:w-1/2 space-y-6">
                                                                <h3 className="text-[18px] md:text-[20px] font-bold text-[#282828] uppercase tracking-wider leading-snug">
                                                                    {block.title}
                                                                </h3>
                                                                <div 
                                                                    className="text-[#505050] text-[14px] leading-[1.8] font-normal whitespace-pre-wrap"
                                                                    dangerouslySetInnerHTML={{ __html: block.text }}
                                                                />
                                                            </div>
                                                            <div className="w-full md:w-1/2 relative aspect-video overflow-hidden rounded-2xl md:rounded-3xl bg-black shadow-lg">
                                                                {(() => {
                                                                    const url = block.video || '';
                                                                    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/);
                                                                    if (ytMatch) return <iframe src={`https://www.youtube.com/embed/${ytMatch[1]}`} className="w-full h-full absolute inset-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Video" />;
                                                                    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
                                                                    if (vimeoMatch) return <iframe src={`https://player.vimeo.com/video/${vimeoMatch[1]}`} className="w-full h-full absolute inset-0" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title="Video" />;
                                                                    if (url) return <video src={url} controls className="w-full h-full absolute inset-0 object-contain bg-black" />;
                                                                    return null;
                                                                })()}
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                default:
                                                    return null;
                                            }
                                        });
                                        })()}
                                    </div>
                                )}

                                {!product.description && (!product.detailedDescription || product.detailedDescription.length === 0) && (
                                    <p className="text-gray-500 text-sm md:text-lg leading-relaxed font-medium mb-8 md:mb-12">
                                        Une description complète pour ce produit sera bientôt disponible.
                                    </p>
                                )}

                                <div className="pt-6 md:pt-8 border-t border-gray-100">
                                    <h4 className="text-[9px] md:text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 md:mb-5">Caractéristiques principales</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 md:gap-y-3">
                                        {(Array.isArray(product.features) && product.features.length > 0 ? product.features : [
                                            "Qualité Premium Certifiée",
                                            "Garantie Baraka Shop 12 mois",
                                            "Performance & Durabilité",
                                            "Design Minimaliste & Moderne",
                                            "Service Après-Vente Local",
                                            "Authenticité Garantie"
                                        ]).map((feature: any, i: number) => (
                                            <div key={i} className="flex items-start md:items-center gap-2.5 md:gap-3 group">
                                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-green-50 flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all shrink-0 mt-0.5 md:mt-0">
                                                    <Zap className="w-3.5 h-3.5 md:w-4 md:h-4" fill="currentColor" />
                                                </div>
                                                <span className="text-[13px] md:text-[15px] font-bold text-[#1B1F3B] pt-0.5 md:pt-0 leading-snug">{feature}</span>
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
                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                                {product.metadata && typeof product.metadata === 'object' ? (() => {
                                    const meta = product.metadata as any;
                                    const order = meta._order as string[];
                                    const entries = Object.entries(meta)
                                        .filter(([key]) => !['id', 'importedat', 'customfields', 'images', 'description', '_order'].includes(key.toLowerCase()));
                                    if (Array.isArray(order)) {
                                        entries.sort((a, b) => {
                                            const indexA = order.indexOf(a[0]);
                                            const indexB = order.indexOf(b[0]);
                                            if (indexA === -1 && indexB === -1) return 0;
                                            if (indexA === -1) return 1;
                                            if (indexB === -1) return -1;
                                            return indexA - indexB;
                                        });
                                    }
                                    return entries.map(([key, value], i) => {
                                        // Format key: Convert camelCase to Title Case but preserve normal words and acronyms
                                        const formattedKey = key
                                            // Only add space before a capital letter if it follows a lowercase letter (e.g. storageCapacity -> storage Capacity)
                                            .replace(/([a-z])([A-Z])/g, '$1 $2')
                                            .replace(/^./, str => str.toUpperCase())
                                            .replace('Subcategory 1', 'Sous-catégorie')
                                            .replace('Subcategory 2', 'Type')
                                            .replace('Category', 'Catégorie')
                                            .replace('Price', 'Prix')
                                            .replace('Name', 'Désignation')
                                            .replace('Stock', 'État du stock');

                                        // Format value
                                        let formattedValue = String(value);
                                        if (key.toLowerCase() === 'price') {
                                            formattedValue = `${Number(value).toLocaleString()} FCFA`;
                                        } else if (key.toLowerCase().includes('date') || key.toLowerCase() === 'createdat') {
                                            formattedValue = new Date(String(value)).toLocaleDateString('fr-FR');
                                        } else if (typeof value === 'object') {
                                            formattedValue = 'Détails disponibles';
                                        }

                                        return (
                                            <div key={i} className="flex flex-col gap-1 p-5 md:p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] hover:border-orange-500/20 hover:bg-orange-50/50 transition-all">
                                                <span className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-widest">{formattedKey}</span>
                                                <span className="text-sm md:text-base font-bold text-[#1B1F3B] leading-snug">{formattedValue}</span>
                                            </div>
                                        );
                                    });
                                })() : (
                                    <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[2rem]">
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

                    <div className="relative h-auto">
                        <AnimatePresence initial={false} custom={directionSimilar} mode="wait">
                            <motion.div
                                key={currentIndexSimilar}
                                custom={directionSimilar}
                                variants={carouselVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ x: { type: "spring", stiffness: 200, damping: 25 }, opacity: { duration: 0.3 } }}
                                className={cn("grid gap-4 md:gap-8 relative w-full", isMobile ? "grid-cols-2" : "grid-cols-4")}
                            >
                                {similarProductChunks[currentIndexSimilar]?.map((prod) => (
                                    <ProductCard key={prod.id} product={prod} />
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            )}
            {/* Sticky Buy Bar */}
            <AnimatePresence>
                {showStickyBar && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] py-4"
                    >
                        <Container>
                            <div className="flex items-center justify-between gap-8">
                                <div className="hidden lg:flex flex-col gap-1 max-w-md">
                                    <h4 className="font-black text-[#1B1F3B] text-sm tracking-tight line-clamp-1">{product.name}</h4>
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400">{(product.rating || 5)}.0</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 ml-auto">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Prix Total</span>
                                        <span className="text-xl md:text-2xl font-black text-[#1B1F3B] tracking-tighter">
                                            {(product.price * quantity).toLocaleString()} <span className="text-[10px] text-primary italic lowercase">FCFA</span>
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => addToCart({ ...product, selectedColor: selectedColor?.colorName }, quantity)}
                                            className="h-12 px-6 md:px-8 bg-primary text-white hover:bg-[#1B1F3B] rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                                        >
                                            <ShoppingCart className="w-4 h-4" />
                                            <span className="hidden sm:inline">Ajouter</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                addToCart({ ...product, selectedColor: selectedColor?.colorName }, quantity);
                                                window.location.href = '/checkout';
                                            }}
                                            className="h-12 px-6 md:px-8 bg-white text-[#1B1F3B] border-2 border-primary hover:bg-primary/5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2"
                                        >
                                            <Zap className="w-4 h-4 text-primary fill-primary" />
                                            <span className="hidden sm:inline">Achat Rapide</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Container>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Media Viewer Lightbox */}
            <MediaViewer
                media={allMedia}
                initialIndex={viewerIndex}
                isOpen={viewerOpen}
                onClose={() => setViewerOpen(false)}
            />
        </Container>
    )
}
