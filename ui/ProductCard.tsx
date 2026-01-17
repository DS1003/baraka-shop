'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/types'
import { Button } from '@/ui/Button'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    return (
        <div className="group relative bg-white rounded-xl border border-transparent hover:border-border/50 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden h-full">
            {/* Badges */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                {product.isNew && (
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                        Nouveau
                    </span>
                )}
                {product.isSale && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                        -{(100 - (product.price / (product.compareAtPrice || product.price)) * 100).toFixed(0)}%
                    </span>
                )}
            </div>

            {/* Actions Overlay */}
            <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-4 group-hover:translate-x-0">
                <button className="bg-white p-2 rounded-full shadow-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Heart className="w-4 h-4" />
                </button>
            </div>

            {/* Product Image */}
            <div className="relative aspect-square w-full bg-gray-50 p-6 flex items-center justify-center">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-500"
                />
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-grow">
                <div className="text-xs text-muted-foreground mb-1">{product.category}</div>
                <Link href={`/product/${product.id}`} className="font-semibold text-foreground text-sm hover:text-primary transition-colors line-clamp-2 mb-2">
                    {product.name}
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                            key={i}
                            className={cn("w-3 h-3 fill-current", i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-200")}
                        />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">({product.reviews})</span>
                </div>

                <div className="mt-auto flex items-center justify-between">
                    <div className="flex flex-col">
                        {product.compareAtPrice && (
                            <span className="text-xs text-muted-foreground line-through">
                                {new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }).format(product.compareAtPrice)}
                            </span>
                        )}
                        <span className="font-bold text-lg text-primary">
                            {new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }).format(product.price)}
                        </span>
                    </div>
                    <Button size="icon" className="rounded-full h-8 w-8 hover:bg-primary hover:text-primary-foreground transform active:scale-95 transition-all">
                        <ShoppingCart className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
