"use client"

import { Heart, ShoppingCart, Eye, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface Product {
    id: string | number
    name: string
    price: number
    oldPrice?: number
    image: string
    category: string
    rating?: number
    isNew?: boolean
    isHot?: boolean
    discount?: number
}

interface ProductCardProps {
    product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            viewport={{ once: true }}
            className="group relative bg-card rounded-xl border border-border/50 hover:border-primary/50 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
        >
            {/* Badges */}
            <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
                {product.isNew && (
                    <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-blue-500 rounded-sm shadow-sm">
                        Nouveau
                    </span>
                )}
                {product.isHot && (
                    <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-red-500 rounded-sm shadow-sm">
                        Hot
                    </span>
                )}
                {product.discount && (
                    <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-primary rounded-sm shadow-sm">
                        -{product.discount}%
                    </span>
                )}
            </div>

            {/* Actions (Wishlist / Quick View) */}
            <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-4 group-hover:translate-x-0">
                <button className="p-2 rounded-full bg-background/90 backdrop-blur shadow-md text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors" aria-label="Add to wishlist">
                    <Heart className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-full bg-background/90 backdrop-blur shadow-md text-muted-foreground hover:text-primary hover:bg-orange-50 transition-colors" aria-label="Quick view">
                    <Eye className="w-4 h-4" />
                </button>
            </div>

            {/* Image Container */}
            <div className="relative aspect-[4/5] bg-secondary/30 overflow-hidden group-hover:bg-secondary/50 transition-colors">
                <Link href={`/products/${product.id}`}>
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover object-center group-hover:scale-110 transition-transform duration-500 ease-out"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </Link>

                {/* Add to Cart - Slide Up on Hover */}
                <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
                    <button className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-medium py-3 rounded-lg shadow-lg hover:bg-primary/90 transition-colors">
                        <ShoppingCart className="w-4 h-4" /> Ajouter au panier
                    </button>
                </div>
            </div>

            {/* Product Info */}
            <div className="p-4">
                <div className="text-xs text-muted-foreground mb-1">{product.category}</div>
                <Link href={`/products/${product.id}`}>
                    <h3 className="font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors cursor-pointer" title={product.name}>
                        {product.name}
                    </h3>
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                            key={i}
                            className={cn(
                                "w-3 h-3",
                                product.rating && i < product.rating ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"
                            )}
                        />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">({product.rating || 0})</span>
                </div>

                {/* Price Area */}
                <div className="flex items-center justify-between mt-2">
                    <div className="flex flex-col">
                        {product.oldPrice && (
                            <span className="text-xs text-muted-foreground line-through decoration-red-500/50">
                                {product.oldPrice.toLocaleString('fr-FR')} FCFA
                            </span>
                        )}
                        <span className="font-bold text-lg text-primary">
                            {product.price.toLocaleString('fr-FR')} FCFA
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
