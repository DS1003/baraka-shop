'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/ui/Container'
import { ChevronRight, Zap } from 'lucide-react'

const promos = [
    {
        badge: "Exclusivité",
        title: "Pack Gaming Ultimate",
        subtitle: "PS5 + 2 Jeux + Manette",
        price: "499.000 CFA",
        image: "https://media.ldlc.com/encart/p/26671_b.jpg",
        bg: "bg-[#f2f4f7]",
        size: "md:col-span-2",
        href: "/category/jeux"
    },
    {
        badge: "Tendance",
        title: "Apple Ecosystem",
        subtitle: "MacBook & iPad M3",
        price: "Dès 650.000 CFA",
        image: "https://media.ldlc.com/encart/p/28885_b.jpg",
        bg: "bg-[#faf1e6]",
        size: "md:col-span-2",
        href: "/category/informatique"
    },
    {
        badge: "Vente Flash",
        title: "Smartphones",
        subtitle: "Derniers modèles arrivés",
        image: "https://media.ldlc.com/encart/p/28828_b.jpg",
        bg: "bg-[#eef2ff]",
        size: "md:col-span-2 lg:col-span-1",
        href: "/category/smartphones"
    },
    {
        badge: "Promo",
        title: "Accessoires",
        subtitle: "Optimisez votre setup",
        image: "https://media.ldlc.com/encart/p/22889_b.jpg",
        bg: "bg-[#fdf2f8]",
        size: "md:col-span-2 lg:col-span-1",
        href: "/category/informatique"
    },
    {
        badge: "Nouveau",
        title: "Son & Image",
        subtitle: "Le cinéma à la maison",
        image: "https://media.ldlc.com/encart/p/28829_b.jpg",
        bg: "bg-[#ecfdf5]",
        size: "md:col-span-2 lg:col-span-2",
        href: "/category/image-son"
    }
]

export function PromoGrid() {
    return (
        <section className="py-16">
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {promos.map((promo, idx) => (
                        <Link
                            key={idx}
                            href={promo.href}
                            className={`relative overflow-hidden rounded-[2rem] min-h-[300px] p-10 flex flex-col items-start justify-between ${promo.bg} group shadow-sm hover:shadow-2xl hover:shadow-gray-200 transition-all duration-500 ${promo.size}`}
                        >
                            <div className="relative z-10 flex flex-col gap-4 w-full">
                                <span className="inline-block px-3 py-1 bg-white text-[#1B1F3B] text-[9px] font-black uppercase tracking-[0.2em] rounded-full w-fit shadow-sm">
                                    {promo.badge}
                                </span>

                                <div className="flex flex-col gap-1">
                                    <h3 className="text-2xl font-black text-[#1B1F3B] leading-tight uppercase tracking-tight">
                                        {promo.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm font-medium">
                                        {promo.subtitle}
                                    </p>
                                </div>

                                {promo.price && (
                                    <span className="text-primary font-black text-lg">{promo.price}</span>
                                )}
                            </div>

                            <div className="relative z-10 mt-6 flex items-center gap-2 text-[#1B1F3B] font-black text-[10px] uppercase tracking-widest group-hover:gap-4 transition-all">
                                Découvrir <ChevronRight className="w-4 h-4 text-primary" />
                            </div>

                            {/* Floating Image */}
                            <div className="absolute right-[-20px] bottom-[-20px] w-1/2 h-full flex items-end justify-end transition-transform duration-700 group-hover:scale-110 group-hover:-translate-y-4 group-hover:-translate-x-4">
                                <div className="relative w-full h-[80%]">
                                    <Image
                                        src={promo.image}
                                        alt={promo.title}
                                        fill
                                        className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)]"
                                    />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </Container>
        </section>
    )
}
