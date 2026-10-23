'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Youtube, Check, Loader2 } from 'lucide-react'
import { Instagram, Sms as Mail, ArrowRight, ChevronLeft, ChevronRight, Plus } from 'reicon-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { getBrandLogoUrl } from '@/lib/brand-logos'
import { subscribeToNewsletter } from '@/lib/actions/newsletter-actions'
import { toast } from 'sonner'

const XIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
)

function useDragToScroll() {
    const isDown = React.useRef(false)
    const startX = React.useRef(0)
    const scrollLeft = React.useRef(0)
    const hasDragged = React.useRef(false)

    const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.button !== 0) return
        const el = e.currentTarget
        isDown.current = true
        hasDragged.current = false
        startX.current = e.pageX - el.offsetLeft
        scrollLeft.current = el.scrollLeft
    }

    const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDown.current) return
        const el = e.currentTarget
        const x = e.pageX - el.offsetLeft
        const walk = (x - startX.current) * 1.3
        if (Math.abs(walk) > 4) {
            hasDragged.current = true
            el.scrollLeft = scrollLeft.current - walk
        }
    }

    const onMouseUp = () => {
        isDown.current = false
        setTimeout(() => {
            hasDragged.current = false
        }, 80)
    }

    const onClickCapture = (e: React.MouseEvent) => {
        if (hasDragged.current) {
            e.preventDefault()
            e.stopPropagation()
        }
    }

    return {
        onMouseDown,
        onMouseMove,
        onMouseUp,
        onMouseLeave: onMouseUp,
        onClickCapture
    }
}

export function BrandsAndSocial({ initialBrands }: { initialBrands?: any[] }) {
    const [currentIndex, setCurrentIndex] = React.useState(0)
    const [direction, setDirection] = React.useState(0)
    const [newsletterEmail, setNewsletterEmail] = React.useState('')
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [isSubscribed, setIsSubscribed] = React.useState(false)
    const [feedbackMessage, setFeedbackMessage] = React.useState('')

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault()
        const cleanEmail = newsletterEmail.trim()
        if (!cleanEmail || isSubmitting) return

        setIsSubmitting(true)
        try {
            const res = await subscribeToNewsletter({ email: cleanEmail, source: 'HOME' })
            if (res.success) {
                setIsSubscribed(true)
                setFeedbackMessage(res.message || 'Merci pour votre inscription !')
                toast.success(res.message || 'Inscription réussie !')
            } else {
                toast.error(res.error || "Impossible d'enregistrer votre inscription.")
            }
        } catch (err: any) {
            toast.error('Une erreur est survenue lors de votre inscription.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const brands = initialBrands || []
    const validBrands = React.useMemo(() => {
        return brands.filter(b => getBrandLogoUrl(b.name, b.image))
    }, [brands])

    const mobileScrollRef = React.useRef<HTMLDivElement>(null)
    const mobileDrag = useDragToScroll()

    if (validBrands.length === 0) return null

    // Desktop chunk size (6 per slide: 2 rows of 3)
    const chunkSize = 6
    const brandChunks = validBrands.reduce((resultArray: any[][], item, index) => {
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
        <section className="relative overflow-hidden pb-2 sm:pb-6 md:pb-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Left Side: Premium Brands */}
                <div className="flex flex-col gap-4 md:gap-8">
                    {/* Header */}
                    <div className="flex flex-col gap-2">
                        {/* Mobile Eyebrow + Direct Action Link */}
                        <div className="flex md:hidden items-center justify-between gap-2 mb-0.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                                <div className="h-[2px] w-5 bg-primary rounded-full shrink-0" />
                                <span className="text-primary font-black text-[8.5px] uppercase tracking-[0.25em] truncate">Partenaires</span>
                            </div>

                            <Link
                                href="/marques"
                                className="text-[10px] font-bold text-primary hover:text-[#1B1F3B] flex items-center gap-1 uppercase tracking-wider transition-colors shrink-0 py-0.5"
                            >
                                <span>Toutes les marques</span>
                                <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>

                        {/* Title & Subtitle */}
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 md:gap-4">
                            <div className="flex flex-col gap-0.5 md:gap-2">
                                {/* Desktop Eyebrow */}
                                <div className="hidden md:flex items-center gap-3">
                                    <div className="h-[2px] w-8 bg-primary rounded-full" />
                                    <span className="text-primary font-black text-[11px] uppercase tracking-[0.4em]">Partenaires</span>
                                </div>

                                <h2 className="text-2xl sm:text-2xl md:text-3xl font-black text-[#1B1F3B] uppercase tracking-tight leading-none">
                                    Nos Marques <span className="text-primary italic inline-block pr-1.5">Officielles</span>
                                </h2>

                                <p className="text-gray-400 text-xs md:text-sm max-w-sm leading-relaxed mt-0.5">
                                    Nous collaborons avec les leaders mondiaux pour vous garantir l'excellence technologique.
                                </p>
                            </div>

                            {/* Desktop Controls (Arrows + Button) */}
                            <div className="hidden md:flex items-center gap-3 shrink-0 self-end">
                                {brandChunks.length > 1 && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={slidePrev}
                                            aria-label="Précédent"
                                            className="w-11 h-11 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm hover:shadow-md transition-all text-[#1B1F3B] cursor-pointer"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={slideNext}
                                            aria-label="Suivant"
                                            className="w-11 h-11 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm hover:shadow-md transition-all text-[#1B1F3B] cursor-pointer"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                                <Link
                                    href="/marques"
                                    className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl shadow-black/10 active:scale-95 group/plus-premium transition-all cursor-pointer"
                                    title="Voir toutes les marques"
                                >
                                    <Plus className="w-7 h-7 transition-transform group-hover/plus-premium:rotate-90" strokeWidth={3} />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Mobile: Fluid 2-Row Horizontal Swipe Track */}
                    <div className="md:hidden">
                        <div
                            ref={mobileScrollRef}
                            className="grid grid-rows-2 grid-flow-col auto-cols-[130px] sm:auto-cols-[145px] gap-2.5 overflow-x-auto overflow-y-hidden snap-x snap-mandatory no-scrollbar py-2 -mx-4 px-4 overscroll-x-contain scroll-pl-4 scroll-pr-4 transform-gpu cursor-grab active:cursor-grabbing select-none"
                            style={{
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                                WebkitOverflowScrolling: 'touch',
                                touchAction: 'pan-x pan-y'
                            }}
                            {...mobileDrag}
                        >
                            {validBrands.map((brand) => {
                                const logoUrl = getBrandLogoUrl(brand.name, brand.image)
                                if (!logoUrl) return null
                                return (
                                    <Link
                                        key={brand.id ?? brand.name}
                                        href={`/boutique?brand=${brand.slug ?? brand.name.toLowerCase()}`}
                                        draggable={false}
                                        className="h-[68px] sm:h-[74px] bg-white rounded-2xl border border-gray-100/90 shadow-xs hover:border-primary/40 active:scale-95 flex items-center justify-center p-3 transition-all snap-start select-none group"
                                    >
                                        <Image
                                            src={logoUrl}
                                            alt={brand.name}
                                            width={120}
                                            height={38}
                                            draggable={false}
                                            className="object-contain h-7 sm:h-8 w-auto max-w-[85%] group-hover:scale-105 transition-transform pointer-events-none select-none"
                                            unoptimized
                                        />
                                    </Link>
                                )
                            })}

                            {/* Discovery Card at end of mobile track */}
                            <Link
                                href="/marques"
                                draggable={false}
                                className="row-span-2 h-full min-h-[146px] w-[115px] bg-gradient-to-br from-[#15192D] to-[#0D101E] text-white rounded-2xl border border-white/10 flex flex-col items-center justify-center p-3 text-center active:scale-95 transition-all snap-start select-none shadow-sm group cursor-pointer"
                            >
                                <div className="w-9 h-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center mb-2 group-hover:bg-primary group-hover:text-white transition-all pointer-events-none">
                                    <Plus className="w-5 h-5" strokeWidth={2.5} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-wider leading-tight text-white pointer-events-none">Toutes les marques</span>
                                <span className="text-[8.5px] font-bold text-primary uppercase tracking-widest mt-1.5 flex items-center gap-1 pointer-events-none">
                                    Voir tout <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                                </span>
                            </Link>
                        </div>
                    </div>

                    {/* Desktop: 6-Card Carousel with Slide Motion */}
                    <div className="hidden md:block">
                        <div className="relative min-h-[250px] mt-2">
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
                                    className="absolute inset-0 grid gap-5 grid-rows-2 grid-cols-3"
                                >
                                    {brandChunks[currentIndex]?.map((brand) => {
                                        const logoUrl = getBrandLogoUrl(brand.name, brand.image)
                                        if (!logoUrl) return null
                                        return (
                                            <Link
                                                key={brand.id ?? brand.name}
                                                href={`/boutique?brand=${brand.slug ?? brand.name.toLowerCase()}`}
                                                className="h-24 md:h-28 bg-white rounded-3xl border border-gray-100/70 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center justify-center p-5 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:border-primary/30 group"
                                            >
                                                <Image
                                                    src={logoUrl}
                                                    alt={brand.name}
                                                    width={140}
                                                    height={48}
                                                    className="object-contain h-10 md:h-12 w-auto max-w-[90%] group-hover:scale-105 transition-transform"
                                                    unoptimized
                                                />
                                            </Link>
                                        )
                                    })}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Pagination dots for Desktop */}
                        {brandChunks.length > 1 && (
                            <div className="flex justify-start gap-2 pt-4">
                                {brandChunks.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setDirection(idx > currentIndex ? 1 : -1)
                                            setCurrentIndex(idx)
                                        }}
                                        className={cn(
                                            "h-1 rounded-full transition-all duration-500 cursor-pointer",
                                            currentIndex === idx ? "w-8 bg-primary" : "w-1.5 bg-gray-200 hover:bg-gray-300"
                                        )}
                                        aria-label={`Page ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Community & Newsletter (Mobile-First, aligned with site DA) */}
                <CommunityCard
                    newsletterEmail={newsletterEmail}
                    setNewsletterEmail={setNewsletterEmail}
                    isSubmitting={isSubmitting}
                    isSubscribed={isSubscribed}
                    feedbackMessage={feedbackMessage}
                    handleSubscribe={handleSubscribe}
                />
            </div>
        </section>
    )
}

const SOCIALS = [
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Instagram, href: 'https://www.instagram.com/baraka.sn/', label: 'Instagram' },
    { icon: XIcon, href: 'https://twitter.com', label: 'X' },
    { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
]

function CommunityCard({
    newsletterEmail,
    setNewsletterEmail,
    isSubmitting,
    isSubscribed,
    feedbackMessage,
    handleSubscribe,
}: {
    newsletterEmail: string
    setNewsletterEmail: (v: string) => void
    isSubmitting: boolean
    isSubscribed: boolean
    feedbackMessage: string
    handleSubscribe: (e: React.FormEvent) => void
}) {
    return (
        <div className="relative overflow-hidden bg-[#1B1F3B] rounded-3xl md:rounded-[2.5rem] p-5 sm:p-7 md:p-9 flex flex-col justify-between gap-5 sm:gap-7 group/card shadow-xl shadow-[#1B1F3B]/15 lg:h-full">
            {/* Decorative glows (brand orange only) */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/15 rounded-full blur-3xl pointer-events-none group-hover/card:bg-primary/25 transition-colors duration-500" />
            <div className="absolute -bottom-28 -left-20 w-56 h-56 bg-primary/[0.06] rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
                {/* Eyebrow — same pattern as « Partenaires » */}
                <div className="flex items-center gap-1.5 md:gap-3 mb-2 md:mb-3">
                    <div className="h-[2px] w-5 md:w-8 bg-primary rounded-full shrink-0" />
                    <span className="text-primary font-black text-[8.5px] md:text-[11px] uppercase tracking-[0.25em] md:tracking-[0.4em]">
                        Newsletter
                    </span>
                </div>

                {/* Title — same typographic DA as « Nos Marques Officielles » */}
                <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight leading-none">
                    Rejoignez la <span className="text-primary italic inline-block pr-1.5">Communauté</span>
                </h3>

                <p className="text-gray-400 text-xs md:text-sm max-w-sm leading-relaxed mt-2 md:mt-3">
                    Offres flash, nouveautés tech et codes promo exclusifs, directement dans votre boîte mail.
                </p>

                {/* Newsletter form */}
                <div className="mt-4 md:mt-6">
                    {isSubscribed ? (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.06] border border-primary/30"
                            role="status"
                        >
                            <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
                                <Check className="w-4 h-4" strokeWidth={3} />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="font-black text-white text-xs uppercase tracking-wide">Inscription confirmée</span>
                                <span className="text-[11px] text-gray-300 truncate">
                                    {feedbackMessage || 'Bienvenue dans la communauté Baraka !'}
                                </span>
                            </div>
                        </motion.div>
                    ) : (
                        <>
                            {/* Mobile-first: stacked field + full-width CTA → inline pill from `sm` */}
                            <form
                                id="newsletter-form"
                                onSubmit={handleSubscribe}
                                className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-0 sm:bg-white/[0.07] sm:border sm:border-white/10 sm:rounded-2xl sm:p-1.5 sm:focus-within:border-primary/60 sm:focus-within:bg-white/10 transition-all w-full sm:max-w-md"
                            >
                                <div className="relative flex-1 min-w-0">
                                    <Mail className="absolute left-3.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                    <label htmlFor="newsletter-email" className="sr-only">Adresse email</label>
                                    <input
                                        id="newsletter-email"
                                        type="email"
                                        required
                                        disabled={isSubmitting}
                                        inputMode="email"
                                        autoComplete="email"
                                        enterKeyHint="send"
                                        value={newsletterEmail}
                                        onChange={(e) => setNewsletterEmail(e.target.value)}
                                        placeholder="Votre adresse email"
                                        className="w-full h-11 pl-10 sm:pl-9 pr-3 sm:pr-2 bg-white/[0.07] sm:bg-transparent border border-white/10 sm:border-0 rounded-xl sm:rounded-none text-white placeholder:text-gray-500 outline-none focus:border-primary/60 focus:bg-white/10 sm:focus:bg-transparent text-base sm:text-sm font-medium transition-colors disabled:opacity-50"
                                    />
                                </div>
                                <button
                                    id="newsletter-submit"
                                    type="submit"
                                    disabled={isSubmitting}
                                    aria-label="S'abonner à la newsletter"
                                    className="w-full sm:w-auto h-10 sm:h-11 px-6 bg-primary text-white font-black text-[11px] sm:text-xs uppercase tracking-wider rounded-xl hover:bg-white hover:text-[#1B1F3B] transition-all shrink-0 active:scale-[0.98] shadow-md shadow-primary/25 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span>Envoi...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>S'abonner</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </>
                                    )}
                                </button>
                            </form>
                            <p className="mt-2 text-[10px] md:text-[11px] text-gray-500 font-medium text-center sm:text-left">
                                Gratuit · Sans spam · Désinscription en 1 clic
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Social block */}
            <div className="relative z-10 pt-4 md:pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6">
                <div className="flex items-center justify-between sm:flex-col sm:items-start gap-1">
                    <span className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        Suivez-nous
                    </span>
                    <span className="text-[11px] md:text-xs font-bold text-white">
                        @barakashop <span className="text-primary">· +12k abonnés</span>
                    </span>
                </div>

                {/* Mobile: 4 equal touch targets — Desktop: compact squares */}
                <div className="grid grid-cols-4 gap-2 sm:flex sm:gap-2.5">
                    {SOCIALS.map((s) => (
                        <SocialIcon key={s.label} icon={s.icon} href={s.href} ariaLabel={s.label} />
                    ))}
                </div>
            </div>
        </div>
    )
}

function SocialIcon({ icon: Icon, href = "#", ariaLabel }: { icon: any, href?: string, ariaLabel?: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={ariaLabel}
            className="h-11 sm:w-11 md:w-12 md:h-12 rounded-xl bg-white/[0.06] flex items-center justify-center text-white border border-white/10 hover:bg-primary hover:border-primary hover:-translate-y-0.5 active:scale-95 transition-all"
        >
            <Icon className="w-4 h-4 md:w-5 md:h-5" />
        </a>
    )
}
