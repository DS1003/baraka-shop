'use client'

import React from 'react'
import { Container } from '@/ui/Container'
import Link from 'next/link'
import { Facebook, Youtube, Instagram, Music2, Mail, Send, ArrowRight, ShieldCheck, Globe, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

const XIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
)

const brands = [
    { name: "Apple", logo: <path d="M17.05 20.28c-.96.95-2.06 1.72-3.3 1.72-1.25 0-1.63-.77-3.14-.77-1.5 0-1.95.74-3.14.77-1.16.03-2.15-.84-3.15-1.74-2.18-1.96-3.83-5.59-3.83-8.8 0-3.3 2.1-5.06 4.14-5.06 1.08 0 2 1.25 3.03 1.25s1.95-1.24 3.04-1.24c1.1 0 2.22.61 2.92 1.58-2.6 1.51-2.19 5.31.63 6.31-.76 1.91-1.78 3.92-3.23 5.98zM13.25 1.5c.34 2.25-1.6 4.45-3.5 4.4 0-1.9 1.7-4.13 3.5-4.4z" /> },
    { name: "Samsung", logo: null, customText: "SAMSUNG", color: "text-[#034EA2]" },
    { name: "Sony", logo: null, customText: "SONY", color: "text-black" },
    { name: "Dell", logo: null, customText: "DELL", color: "text-[#007DB8]" },
    { name: "HP", logo: null, customText: "hp", color: "text-[#0096D6]" },
    { name: "LG", logo: null, customText: "LG", color: "text-[#A50034]" },
]

export function BrandsAndSocial() {
    return (
        <section className="bg-[#fafafa] py-20 border-t border-gray-100">
            <Container>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left Side: Premium Brands */}
                    <div className="flex flex-col gap-10">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-[2px] w-8 bg-primary rounded-full" />
                                    <span className="text-primary font-black text-[11px] uppercase tracking-[0.4em]">Partenaires</span>
                                </div>
                                <h2 className="text-3xl font-black text-[#1B1F3B] uppercase tracking-tight">Nos Marques Officielles</h2>
                                <p className="text-gray-400 text-sm max-w-sm leading-relaxed">Nous collaborons avec les leaders mondiaux pour vous garantir l'excellence technologique.</p>
                            </div>

                            <a href="/marques" className="flex items-center gap-2 group/btn">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#1B1F3B] group-hover/btn:text-primary transition-colors">Voir Plus</span>
                                <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center group-hover/btn:bg-primary group-hover/btn:text-white group-hover/btn:border-primary transition-all">
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </div>
                            </a>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {brands.map((brand, i) => (
                                <Link
                                    key={i}
                                    href={`/boutique?brand=${brand.name.toLowerCase()}`}
                                    className="h-28 bg-white rounded-3xl border border-gray-100/50 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center grayscale hover:grayscale-0 transition-all duration-700 group cursor-pointer hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 p-4"
                                >
                                    {brand.logo ? (
                                        <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" className="text-gray-300 group-hover:text-black transition-colors">{brand.logo}</svg>
                                    ) : (
                                        <span className={cn("font-black text-2xl italic tracking-tighter opacity-20 group-hover:opacity-100 transition-opacity", brand.color)}>
                                            {brand.customText}
                                        </span>
                                    )}
                                    <span className="mt-3 text-[9px] font-black text-gray-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Reseller officiel</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right Side: Community & Newsletter */}
                    <div className="bg-[#1B1F3B] rounded-[2.5rem] p-8 md:p-12 flex flex-col justify-between relative overflow-hidden group/card shadow-2xl shadow-blue-900/10">
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
