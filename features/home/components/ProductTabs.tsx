'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Container } from '@/ui/Container'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProductCard } from '@/ui/ProductCard'
import { getProductsAction } from '@/lib/actions/product-actions'

interface Product {
    id: string
    name: string
    category: string
    price: number
    oldPrice?: number
    rating: number
    image: string
    badges?: { text: string; color: string }[]
}



const tabs = ['Nouveautés', 'Meilleures Ventes', 'Promotions']

export function ProductTabs({ initialData }: { initialData?: Record<string, any[]> }) {
    const [activeTab, setActiveTab] = useState('Nouveautés')
    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState(0)
    const [isMobile, setIsMobile] = useState(false)
    const [allProducts, setAllProducts] = useState<Record<string, any[]>>(initialData || {
        'Nouveautés': [],
        'Meilleures Ventes': [],
        'Promotions': []
    })
    const [loading, setLoading] = useState(!initialData)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    useEffect(() => {
        if (initialData) return

        const fetchAll = async () => {
            setLoading(true)
            const [newArrivals, topRated] = await Promise.all([
                getProductsAction({ sort: 'newest', limit: 8 }),
                getProductsAction({ sort: 'top_rated', limit: 8 }),
            ])
            setAllProducts({
                'Nouveautés': newArrivals.products,
                'Meilleures Ventes': topRated.products,
                'Promotions': newArrivals.products.filter((p: any) => p.oldPrice && p.oldPrice > p.price)
            })
            setLoading(false)
        }
        fetchAll()
    }, [initialData])

    const activeProducts = allProducts[activeTab] || []

    const chunkSize = isMobile ? 2 : 4
    const productChunks = activeProducts.reduce((resultArray: any[][], item, index) => {
        const chunkIndex = Math.floor(index / chunkSize);
        if (!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = [];
        }
        resultArray[chunkIndex].push(item);
        return resultArray;
    }, []);

    const slideNext = () => {
        if (productChunks.length <= 1) return
        setDirection(1)
        setCurrentIndex((prev) => (prev + 1) % productChunks.length)
    }

    const slidePrev = () => {
        if (productChunks.length <= 1) return
        setDirection(-1)
        setCurrentIndex((prev) => (prev - 1 + productChunks.length) % productChunks.length)
    }

    const variants = {
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

    const handleTabChange = (tab: string) => {
        setActiveTab(tab)
        setCurrentIndex(0)
    }

    return (
        <section className="relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: `url('https://res.cloudinary.com/dgro5x4h8/image/upload/v1768669738/pattern_2_kln9c6.png')`, backgroundSize: '400px' }} />
            <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-[10%] -right-[10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10">
                {/* Header Style from Screenshot */}
                <div className="flex flex-col gap-4 md:gap-6 mb-12 md:mb-16">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="flex flex-col gap-2 w-full md:w-auto">
                            <span className="text-primary font-black text-[9px] md:text-[10px] uppercase tracking-[0.5em] mb-1">Exploration</span>
                            <div className="flex items-center gap-x-6 md:gap-x-10 overflow-x-auto overflow-y-hidden pt-2 pb-6 md:pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                                {tabs.map((tab) => {
                                    const words = tab.split(' ');
                                    return (
                                        <button
                                            key={tab}
                                            onClick={() => handleTabChange(tab)}
                                            className={cn(
                                                "whitespace-nowrap text-xl md:text-3xl font-extrabold transition-all relative uppercase tracking-tight py-1",
                                                activeTab === tab ? "text-[#1B1F3B]" : "text-gray-300 hover:text-[#1B1F3B]/40"
                                            )}
                                        >
                                            {words[0]} {words[1] && <span className="text-primary italic font-black ml-1.5">{words[1]}</span>}
                                            {activeTab === tab && (
                                                <motion.div
                                                    layoutId="activeTabUnderline"
                                                    className="absolute -bottom-1 md:-bottom-1.5 left-0 w-full h-[2px] md:h-[3px] bg-primary rounded-full shadow-[0_2px_10px_rgba(255,140,0,0.3)]"
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Cluster Buttons from Screenshot */}
                        <div className="flex items-center gap-3 self-stretch md:self-end justify-end">
                            <div className="flex gap-2">
                                <button
                                    onClick={slidePrev}
                                    disabled={productChunks.length <= 1}
                                    className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm hover:shadow-md transition-all text-[#1B1F3B] disabled:opacity-20 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={slideNext}
                                    disabled={productChunks.length <= 1}
                                    className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm hover:shadow-md transition-all text-[#1B1F3B] disabled:opacity-20 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>

                            <Link
                                href="/boutique"
                                className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#1B1F3B] text-white flex items-center justify-center shadow-xl shadow-black/10 active:scale-95 group/plus-premium transition-all"
                            >
                                <Plus className="w-6 h-6 md:w-7 md:h-7 transition-transform group-hover/plus-premium:rotate-90" strokeWidth={3} />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Carousel Content */}
                <div className="relative h-[320px] md:h-[450px] mb-12">
                    <AnimatePresence initial={false} custom={direction} mode="wait">
                        {productChunks.length > 0 ? (
                            <motion.div
                                key={`${activeTab}-${currentIndex}`}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: "spring", stiffness: 200, damping: 25 },
                                    opacity: { duration: 0.3 }
                                }}
                                className={cn(
                                    "absolute inset-0 grid gap-4 md:gap-8",
                                    isMobile ? "grid-cols-2" : "grid-cols-4"
                                )}
                            >
                                {productChunks[currentIndex].map((product, idx) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        priority={activeTab === 'Nouveautés' && currentIndex === 0 && idx < 4}
                                    />
                                ))}
                            </motion.div>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-3xl w-full">
                                    <p className="text-gray-400 font-black uppercase tracking-widest text-[10px] md:text-xs">Arrivage en cours...</p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Subtle Pagination */}
                <div className="flex justify-center gap-2">
                    {productChunks.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setDirection(idx > currentIndex ? 1 : -1)
                                setCurrentIndex(idx)
                            }}
                            className={cn(
                                "h-1 rounded-full transition-all duration-500",
                                currentIndex === idx ? "w-8 bg-primary" : "w-1 bg-gray-200"
                            )}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}
