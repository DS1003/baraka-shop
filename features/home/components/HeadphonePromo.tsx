'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/ui/Container'
import { Button } from '@/ui/Button'
import { ArrowRight, Flash as Zap } from 'reicon-react'
import { getOptimizedImageUrl } from '@/lib/utils'

export function HeadphonePromo({ initialBanner }: { initialBanner?: any }) {
    const banner = initialBanner || {
        title: "Le Son Absolu.",
        subtitle: "Série Sony XM5",
        description: "Découvrez la nouvelle gamme Sony Noise Cancelling. Une immersion totale, un confort inégalé. Jusqu'à -40% ce weekend.",
        badge: "Offre Spéciale",
        image: "https://sony.scene7.com/is/image/sonyglobalsolutions/360-RA-category-icon-20221202?$S7Product$&fmt=png-alpha",
        href: "/boutique",
        buttonText: "Commander"
    }

    const displayTitle = banner.title || "Le Son Absolu."

    return (
        <section>
            <div className="relative rounded-2xl md:rounded-[3rem] overflow-hidden bg-[#1B1F3B] flex items-center group shadow-sm transition-all duration-500">
                {/* Background Accents */}
                <div className="absolute top-0 right-0 w-2/3 md:w-1/2 h-full bg-primary/15 blur-[90px] md:blur-[120px] rounded-full translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-1/2 md:w-1/3 h-1/2 bg-blue-500/15 blur-[80px] md:blur-[100px] rounded-full -translate-x-1/3 pointer-events-none" />

                <div className="flex flex-col md:grid md:grid-cols-2 gap-5 md:gap-8 lg:gap-12 items-center w-full px-5 py-6 sm:px-8 sm:py-8 md:px-8 lg:px-14 xl:px-20 md:py-8 lg:py-0 relative z-10">
                    {/* Text Content */}
                    <div className="flex flex-col gap-2.5 md:gap-4 lg:gap-6 items-center md:items-start text-center md:text-left w-full">
                        <span className="flex items-center gap-1.5 md:gap-2 px-2.5 py-1 md:px-3 md:py-1 bg-primary text-white text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-xs">
                            <Zap className="w-2.5 h-2.5 md:w-3 md:h-3 fill-current" /> {banner.badge}
                        </span>

                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-tight md:leading-[1] lg:leading-[0.95] tracking-tight uppercase">
                            <span className="md:hidden">{displayTitle}</span>
                            <span className="hidden md:inline whitespace-pre-line">
                                {displayTitle.includes(' ') && !displayTitle.includes('\n') ? displayTitle.replace(' ', '\n') : displayTitle}
                            </span>
                        </h2>

                        <p className="text-gray-300 text-[11px] sm:text-xs md:text-sm max-w-xs md:max-w-md leading-relaxed line-clamp-2 md:line-clamp-none">
                            {banner.description}
                        </p>

                        <div className="pt-1 md:pt-4 flex flex-row items-center justify-center md:justify-start gap-3 md:gap-6 w-full sm:w-auto">
                            <Link href={banner.href}>
                                <Button size="sm" className="rounded-xl px-6 h-10 md:h-12 lg:h-14 md:px-8 lg:px-12 bg-primary text-white hover:bg-white hover:text-black font-black text-[10px] md:text-xs uppercase tracking-wider md:tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95">
                                    {banner.buttonText}
                                </Button>
                            </Link>
                            <Link href="/boutique" className="group flex items-center gap-1.5 md:gap-3 text-white text-[10px] md:text-xs font-black uppercase tracking-wider md:tracking-widest hover:text-primary transition-colors">
                                <span>Voir la gamme</span>
                                <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    {/* Image Content */}
                    <div className="relative h-[170px] sm:h-[240px] md:h-[300px] lg:h-[400px] xl:h-[480px] w-full flex items-center justify-center">
                        <div className="absolute w-[180px] md:w-[80%] aspect-square rounded-full border border-white/5 animate-pulse" />
                        <div className="absolute w-[140px] md:w-[60%] aspect-square rounded-full border border-white/10" />

                        <Image
                            src={getOptimizedImageUrl(banner.image, 800)}
                            alt={banner.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
                            className="object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.8)] transition-transform duration-700 group-hover:scale-105 z-10"
                            unoptimized
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
