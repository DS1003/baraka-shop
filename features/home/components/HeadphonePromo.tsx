'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/ui/Container'
import { Button } from '@/ui/Button'
import { ArrowRight, Zap } from 'lucide-react'

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

    return (
        <section>
            <div className="relative rounded-2xl md:rounded-[3rem] overflow-hidden bg-[#1B1F3B] min-h-[300px] md:min-h-[500px] flex items-center group shadow-sm transition-all duration-500">
                {/* Background Accents */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 blur-[120px] rounded-full translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-blue-500/10 blur-[100px] rounded-full -translate-x-1/2" />

                <div className="flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-12 items-center w-full px-6 md:px-20 py-10 md:py-0 relative z-10">
                    {/* Text Content */}
                    <div className="flex flex-col gap-4 md:gap-6 items-center md:items-start text-center md:text-left">
                        <span className="flex items-center gap-2 px-3 py-1 bg-primary text-white text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                            <Zap className="w-3 h-3 fill-current" /> {banner.badge}
                        </span>

                        <h2 className="text-4xl md:text-7xl font-black text-white leading-[0.95] tracking-tight uppercase whitespace-pre-line">
                            {banner.title.includes(' ') && !banner.title.includes('\n') ? banner.title.replace(' ', '\n') : banner.title}
                        </h2>

                        <p className="text-gray-400 text-[11px] md:text-sm max-w-[280px] md:max-w-md leading-relaxed">
                            {banner.description}
                        </p>

                        <div className="pt-2 md:pt-4 flex flex-col sm:flex-row items-center gap-4 md:gap-6 w-full sm:w-auto">
                            <Link href={banner.href} className="w-full sm:w-auto">
                                <Button size="lg" className="w-full sm:w-auto rounded-xl px-12 h-14 bg-primary text-white hover:bg-white hover:text-black font-black text-[11px] md:text-xs uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95">
                                    {banner.buttonText}
                                </Button>
                            </Link>
                            <Link href="/boutique" className="group flex items-center gap-3 text-white text-[10px] md:text-xs font-black uppercase tracking-widest">
                                Voir la gamme <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-2 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    {/* Image Content */}
                    <div className="relative h-[250px] sm:h-[350px] md:h-[500px] w-full flex items-center justify-center">
                        <div className="absolute w-[80%] aspect-square rounded-full border border-white/5 animate-pulse" />
                        <div className="absolute w-[60%] aspect-square rounded-full border border-white/10" />

                        <Image
                            src={banner.image}
                            alt={banner.title}
                            fill
                            className="object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.8)] transition-transform duration-700 group-hover:scale-105 z-10"
                            unoptimized
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
