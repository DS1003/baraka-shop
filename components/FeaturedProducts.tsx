'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Star, ShoppingCart, Heart } from 'lucide-react'
import { MOCK_PRODUCTS } from '@/lib/data'

export default function FeaturedProducts() {
    return (
        <section className="py-20 bg-background">
            <div className="container px-4 mx-auto">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Nos Meilleures <span className="text-primary">Ventes</span></h2>
                        <p className="text-muted-foreground">Les produits les plus plébiscités par nos clients.</p>
                    </div>
                    <Link href="/shop" className="hidden md:flex items-center gap-2 text-primary font-medium hover:underline">
                        Voir tout le catalogue <ArrowRight size={16} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {MOCK_PRODUCTS.slice(0, 4).map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            {/* Image Container */}
                            <div className="relative aspect-square bg-secondary/50 overflow-hidden">
                                {product.isNew && (
                                    <span className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-md z-10 uppercase tracking-wide">
                                        Nouveau
                                    </span>
                                )}
                                {product.oldPrice && (
                                    <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md z-10 uppercase tracking-wide">
                                        Promo
                                    </span>
                                )}

                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover object-center group-hover:scale-110 transition-transform duration-500"
                                />

                                {/* Quick Actions Overlay */}
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                                    <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-foreground hover:bg-primary hover:text-white transition-colors shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                                        <ShoppingCart size={18} />
                                    </button>
                                    <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-foreground hover:bg-red-500 hover:text-white transition-colors shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-100">
                                        <Heart size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <div className="flex items-center gap-1 mb-2">
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={12} fill={i < product.rating ? "currentColor" : "none"} strokeWidth={i < product.rating ? 0 : 1.5} />
                                        ))}
                                    </div>
                                    <span className="text-xs text-muted-foreground">({product.reviews})</span>
                                </div>
                                <Link href={`/products/${product.id}`}>
                                    <h3 className="font-bold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
                                </Link>
                                <p className="text-xs text-muted-foreground mb-3 line-clamp-1">{product.category}</p>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-lg">{product.price.toLocaleString()} FCFA</span>
                                    {product.oldPrice && (
                                        <span className="text-sm text-muted-foreground line-through decoration-red-500 decoration-2">
                                            {product.oldPrice.toLocaleString()} FCFA
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
