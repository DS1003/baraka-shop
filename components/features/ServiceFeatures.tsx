'use client'

import React from 'react'
import Image from 'next/image'
import { MapPin, ShieldCheck, Trophy, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ServiceFeatures() {
    return (
        <section className="py-8 bg-[#f0f2f5]">
            <div className="container px-4 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* 1. STORE LOCATOR BLOCK (LDLC Screen Style) */}
                    <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100 flex flex-col items-start min-h-[280px] relative overflow-hidden group">
                        <div className="relative z-10 max-w-[200px]">
                            <h3 className="text-2xl font-black text-[#1a1a1a] leading-tight mb-6">
                                BARAKA près <br /> de chez vous :
                            </h3>
                            <p className="text-xs text-gray-400 font-bold mb-8 uppercase tracking-wider leading-relaxed">
                                Coordonnées, plan d'accès, horaires d'ouvertures...
                            </p>
                            <LinkBtn href="/stores" label="Trouver ma boutique" />
                        </div>
                        {/* Map Image Backdrop (Senegal context) */}
                        <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-[180px] h-[180px] opacity-20 group-hover:opacity-40 transition-opacity">
                            <Image
                                src="https://images.unsplash.com/photo-1542744094-24638eff58bb?q=80&w=400"
                                alt="Map"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>

                    {/* 2. WARRANTY BLOCK (LDLC Screen Style) */}
                    <div className="bg-primary rounded-lg p-8 shadow-sm border border-primary/20 flex flex-col items-center justify-center text-center min-h-[280px] text-white relative overflow-hidden group">
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] mb-2">Ordinateurs, Smartphones & Écrans</span>
                        <h3 className="text-4xl font-black leading-none uppercase tracking-tighter mb-2">
                            GARANTIE <br /> 5 ANS <br /> <span className="text-white/80 text-2xl font-bold">GRATUITE !*</span>
                        </h3>
                        <div className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest mt-4">
                            Uniquement chez Baraka
                        </div>
                        <button className="mt-8 text-[9px] font-black uppercase tracking-[0.2em] border-b border-white hover:text-white/70 transition-colors">
                            Voir conditions
                        </button>
                    </div>

                    {/* 3. AWARD BLOCK (LDLC Screen Style) */}
                    <div className="bg-[#002b5c] rounded-lg p-8 shadow-sm border border-blue-900/20 flex flex-col items-center justify-center text-center min-h-[280px] text-white relative overflow-hidden group">
                        {/* We'll use a deep blue or dark grey here for contrast as per LDLC screens */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#002b5c] to-[#001a38]" />
                        <div className="relative z-10 flex flex-col items-center">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] mb-4">Élu Service Client de l'Année</span>
                            <h3 className="text-3xl font-black leading-tight uppercase tracking-tighter mb-4">
                                POUR LA <br /> 12e FOIS* <br /> <span className="text-primary italic">2026.</span>
                            </h3>
                            <div className="bg-white p-4 rounded-xl shadow-2xl transform -rotate-6 mt-4">
                                <Trophy size={40} className="text-primary" />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}

function LinkBtn({ href, label }: { href: string; label: string }) {
    return (
        <Link href={href} className="bg-primary text-white px-6 py-3 rounded-md text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center gap-2 group-hover:shadow-lg">
            {label} <ChevronRight size={14} />
        </Link>
    )
}

import Link from 'next/link'
