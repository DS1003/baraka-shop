'use client'

import React from 'react'
import Image from 'next/image'
import { Container } from '@/ui/Container'
import { Button } from '@/ui/Button'
import { ArrowRight } from 'lucide-react'

export function PromoSection() {
    return (
        <section className="py-16">
            <Container>
                <div className="relative overflow-hidden rounded-3xl bg-black text-white">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-50" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

                    <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center p-8 md:p-16 lg:p-20">
                        <div className="flex flex-col gap-6 items-start">
                            <span className="bg-red-600 text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-widest">
                                Offre Spéciale
                            </span>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                                50% de Réduction <br />
                                <span className="text-gray-300 font-bold text-3xl md:text-4xl block mt-2">Sur tous les casques</span>
                            </h2>
                            <p className="text-gray-300 max-w-md text-lg">
                                Plongez dans un son d'exception. Profitez de nos offres limitées sur une large sélection de casques premium.
                            </p>
                            <div className="flex flex-wrap gap-4 pt-4">
                                <Button size="lg" className="rounded-full bg-white text-black hover:bg-gray-100">
                                    J'en profite <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                                <div className="text-sm font-medium flex flex-col justify-center">
                                    <span className="text-gray-400 uppercase text-[10px]">Temps restant</span>
                                    <span>02j : 14h : 36m</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    )
}
