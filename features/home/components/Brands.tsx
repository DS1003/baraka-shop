'use client'

import React from 'react'
import { Container } from '@/ui/Container'

const brands = [
    "Apple", "Samsung", "Sony", "Canon", "Nikon", "DJI", "Bose", "JBL"
]

export function Brands() {
    return (
        <section className="py-12 border-y border-border/50 bg-gray-50/50">
            <Container>
                <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-8">
                    Marques Officielles Partenaires
                </p>
                <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                    {brands.map((brand) => (
                        <span key={brand} className="text-xl md:text-2xl font-bold text-foreground/80 hover:text-primary transition-colors cursor-pointer">
                            {brand}
                        </span>
                    ))}
                </div>
            </Container>
        </section>
    )
}
