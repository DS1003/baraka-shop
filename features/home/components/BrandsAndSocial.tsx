'use client'

import React from 'react'
import { Container } from '@/ui/Container'
import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Youtube, Instagram, Music2, Mail, Send, ArrowRight, ShieldCheck, Globe, Star, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const XIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
)

const brands = [
    { name: "Apple", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" },
    { name: "Samsung", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Samsung_old_logo_before_year_2015.svg/1280px-Samsung_old_logo_before_year_2015.svg.png" },
    { name: "Sony", logo: "https://www.freepnglogos.com/uploads/sony-png-logo/brand-sony-png-logo-5.png" },
    { name: "Dell", logo: "https://upload.wikimedia.org/wikipedia/commons/1/18/Dell_logo_2016.svg" },
    { name: "HP", logo: "https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg" },
    { name: "LG", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/LG_logo_%282014%29.svg/1280px-LG_logo_%282014%29.svg.png" },
]

export function BrandsAndSocial() {
    const [currentIndex, setCurrentIndex] = React.useState(0)
    const [direction, setDirection] = React.useState(0)
    const [isMobile, setIsMobile] = React.useState(false)

    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const chunkSize = isMobile ? 2 : 3
    const brandChunks = brands.reduce((resultArray: any[][], item, index) => {
        const chunkIndex = Math.floor(index / chunkSize);
        if (!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = [];
        }
        resultArray[chunkIndex].push(item);
        return resultArray;
    }, []);

    const slideNext = () => {
        if (brandChunks.length <= 1) return
        setDirection(1)
        setCurrentIndex((prev) => (prev + 1) % brandChunks.length)
    }

    const slidePrev = () => {
        if (brandChunks.length <= 1) return
        setDirection(-1)
        setCurrentIndex((prev) => (prev - 1 + brandChunks.length) % brandChunks.length)
    }

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 300 : -300,
            opacity: 0
        })
    }

    return (
        <section className="bg-[#fafafa] py-20 border-t border-gray-100 relative overflow-hidden">
            <Container>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                    {/* Left Side: Premium Brands Carousel */}
                    <div className="flex flex-col gap-10">
                        <div className="flex flex-col gap-6 px-2">
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-[2px] w-8 bg-primary rounded-full" />
                                    <span className="text-primary font-black text-[11px] uppercase tracking-[0.4em]">Partenaires</span>
                                </div>

                                <div className="flex flex-row items-center justify-between gap-4">
                                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#1B1F3B] uppercase tracking-tight leading-tight">Nos Marques <span className="text-primary italic">Officielles</span></h2>

                                    {/* Cluster Buttons - Now aligned with H2 on mobile too */}
                                    <div className="flex items-center gap-2 md:gap-3 shrink-0">
                                        <div className="flex gap-1.5 md:gap-2">
                                            <button
                                                onClick={slidePrev}
                                                disabled={brandChunks.length <= 1}
                                                className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm hover:shadow-md transition-all text-[#1B1F3B] disabled:opacity-20 disabled:cursor-not-allowed"
                                            >
                                                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                                            </button>
                                            <button
                                                onClick={slideNext}
                                                disabled={brandChunks.length <= 1}
                                                className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm hover:shadow-md transition-all text-[#1B1F3B] disabled:opacity-20 disabled:cursor-not-allowed"
                                            >
                                                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                                            </button>
                                        </div>
                                        <Link
                                            href="/marques"
                                            className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl shadow-black/10 active:scale-95 group/plus-premium transition-all"
                                        >
                                            <Plus className="w-5 h-5 md:w-7 md:h-7 transition-transform group-hover/plus-premium:rotate-90" strokeWidth={3} />
                                        </Link>
                                    </div>
                                </div>

                                <p className="text-gray-400 text-sm max-w-sm leading-relaxed">Nous collaborons avec les leaders mondiaux pour vous garantir l'excellence technologique.</p>
                            </div>
                        </div>

                        <div className="relative h-56 md:h-64 mt-4">
                            <AnimatePresence initial={false} custom={direction} mode="wait">
                                <motion.div
                                    key={currentIndex}
                                    custom={direction}
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{
                                        x: { type: "spring", stiffness: 200, damping: 25 },
                                        opacity: { duration: 0.2 }
                                    }}
                                    className={cn(
                                        "absolute inset-0 grid gap-6",
                                        isMobile ? "grid-cols-2" : "grid-cols-3"
                                    )}
                                >
                                    {brandChunks[currentIndex]?.map((brand) => (
                                        <Link
                                            key={brand.name}
                                            href={`/boutique?brand=${brand.name.toLowerCase()}`}
                                            className="h-24 md:h-28 bg-white rounded-3xl border border-gray-100/50 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center transition-all duration-300 group cursor-pointer hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 p-6"
                                        >
                                            <div className="relative w-full h-full flex items-center justify-center">
                                                <div className="relative h-10 w-full">
                                                    <Image
                                                        src={brand.logo}
                                                        alt={brand.name}
                                                        fill
                                                        className="object-contain"
                                                    />
                                                </div>
                                            </div>
                                            <span className="mt-2 text-[9px] font-black text-gray-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Reseller officiel</span>
                                        </Link>
                                    ))}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Pagination dots for Brands */}
                        <div className="flex justify-center md:justify-start gap-2">
                            {brandChunks.map((_, idx) => (
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

                    {/* Right Side: Community & Newsletter */}
                    <div className="bg-[#1B1F3B] rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between relative overflow-hidden group/card shadow-2xl shadow-blue-900/10 min-h-max lg:h-full">
                        {/* Decorative circles */}
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover/card:bg-primary/10 transition-colors" />

                        <div className="relative z-10">
                            <h3 className="text-white text-xl md:text-2xl font-black uppercase tracking-tight mb-4 text-center sm:text-left">Rejoignez la Communauté</h3>
                            <p className="text-gray-400 text-sm mb-8 leading-relaxed max-w-sm text-center sm:text-left mx-auto sm:mx-0">
                                Recevez nos offres flash, actualités technologiques et codes promos exclusifs directement dans votre boîte mail.
                            </p>

                            {/* Newsletter Input */}
                            <div className="relative max-w-md mx-auto sm:mx-0">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 hidden sm:block" />
                                <input
                                    type="email"
                                    placeholder="Votre adresse email"
                                    className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-6 sm:pl-12 sm:pr-32 text-white outline-none focus:border-primary transition-all text-sm mb-4 sm:mb-0"
                                />
                                <button className="relative sm:absolute sm:right-1.5 sm:top-1.5 w-full sm:w-auto h-12 sm:h-11 px-6 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-white hover:text-black transition-all">
                                    S'abonner
                                </button>
                            </div>
                        </div>

                        <div className="relative z-10 mt-12 pt-8 sm:pt-12 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div className="flex justify-center sm:justify-start gap-4">
                                <SocialIcon icon={Facebook} />
                                <SocialIcon icon={Instagram} />
                                <SocialIcon icon={XIcon} />
                                <SocialIcon icon={Youtube} />
                            </div>
                            <div className="flex flex-col items-center sm:items-end">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 italic">Suivez-nous @barakashop</span>
                                <div className="flex items-center gap-2">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-[#1B1F3B] bg-gray-700" />)}
                                    </div>
                                    <span className="text-white text-xs font-bold">+12k followers</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    )
}

function SocialIcon({ icon: Icon }: { icon: any }) {
    return (
        <a href="#" className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white border border-white/10 hover:bg-primary hover:border-primary hover:-translate-y-1 transition-all">
            <Icon className="w-5 h-5" />
        </a>
    )
}
