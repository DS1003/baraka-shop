'use client'

import React from 'react'
import Link from 'next/link'
import { Container } from '@/ui/Container'
import { Laptop, Camera, Smartphone, Tv, Gamepad2, Headphones } from 'lucide-react'
import { cn } from '@/lib/utils'

const categories = [
    { name: 'Ordinateurs & Tablettes', icon: Laptop, href: '/category/computers', color: 'bg-blue-50 text-blue-600' },
    { name: 'Photo & Caméras', icon: Camera, href: '/category/cameras', color: 'bg-indigo-50 text-indigo-600' },
    { name: 'Téléphones', icon: Smartphone, href: '/category/phones', color: 'bg-orange-50 text-orange-600' },
    { name: 'TV & Home Cinema', icon: Tv, href: '/category/tv', color: 'bg-rose-50 text-rose-600' },
    { name: 'Jeux Vidéo', icon: Gamepad2, href: '/category/gaming', color: 'bg-purple-50 text-purple-600' },
    { name: 'Audio & Casques', icon: Headphones, href: '/category/audio', color: 'bg-green-50 text-green-600' },
]

export function CategoryGrid() {
    return (
        <section className="py-16 bg-white">
            <Container>
                <div className="flex flex-col gap-2 mb-10 text-center">
                    <h2 className="text-3xl font-bold tracking-tight">Catégories Populaires</h2>
                    <p className="text-muted-foreground">Tout ce dont vous avez besoin, au même endroit.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {categories.map((cat) => (
                        <Link
                            key={cat.name}
                            href={cat.href}
                            className="group flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border border-transparent bg-muted/20 hover:bg-white hover:border-border hover:shadow-lg transition-all duration-300"
                        >
                            <div className={cn("p-4 rounded-full transition-transform group-hover:scale-110", cat.color)}>
                                <cat.icon className="w-8 h-8" />
                            </div>
                            <span className="font-medium text-sm text-center text-foreground/80 group-hover:text-foreground">
                                {cat.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </Container>
        </section>
    )
}
