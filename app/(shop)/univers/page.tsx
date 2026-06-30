import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Container } from '@/ui/Container'
import { getPopularUniversesAction } from '@/lib/actions/product-actions'
import { ArrowRight, Grid3x3 } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Tous les Univers | Baraka Shop',
    description: 'Explorez tous nos univers de produits high-tech. Informatique, Image & Son, Téléphone & Tablette et bien plus.',
}

// Fallback images
const CLEAN_IMAGES: Record<string, string> = {
    'INFORMATIQUE': '/categories/informatique.png',
    'IMAGE & SON': '/categories/image-son.png',
    'CONSOMMABLES': '/categories/consommables.png',
    'ELECTRONIQUE': '/categories/electronique.png',
    'CHARGEUR': '/categories/chargeur.png',
    'CABLE': '/categories/cable.png',
    'CONNECTIQUE': '/categories/connectique.png',
    'DEFAULT': '/categories/batterie.png'
}

export default async function AllUniversPage() {
    const popularUniverses = await getPopularUniversesAction()

    return (
        <main className="bg-[#f8f9fb] min-h-screen">
            {/* HERO */}
            <div className="relative bg-[#05050A] overflow-hidden pt-10 pb-24 md:pb-28">
                <div className="absolute inset-0 opacity-10"
                     style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
                <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/10 blur-[80px] rounded-full animate-pulse" />
                <div className="absolute top-10 left-10 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />

                <Container className="relative z-10 flex flex-col items-center text-center">
                    <div className="space-y-6 max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                            <Grid3x3 className="w-3.5 h-3.5 text-primary" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Tous les Univers</span>
                        </div>

                        <h1 className="flex flex-col items-center gap-3">
                            <span className="text-white/80 text-xl md:text-3xl font-black italic tracking-tight uppercase leading-none">
                                Explorez nos
                            </span>
                            <div className="relative inline-block mt-1">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary to-orange-400 rotate-[-1deg] rounded-2xl shadow-lg" />
                                <span className="relative block bg-[#05050A] text-white px-6 md:px-10 py-3 md:py-4 rounded-2xl text-3xl md:text-5xl font-black uppercase tracking-tighter rotate-[1deg] border-[3px] border-primary/50">
                                    Univers
                                </span>
                            </div>
                        </h1>

                        <p className="text-gray-400 font-medium text-sm max-w-md mx-auto leading-relaxed">
                            Naviguez à travers nos catégories pour trouver exactement ce que vous cherchez.
                        </p>
                    </div>
                </Container>
            </div>

            {/* GRID */}
            <Container className="relative z-20 -mt-12 md:-mt-16 pb-20">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {popularUniverses.map((univ: any) => {
                        const univKey = (univ.name || '').trim().toUpperCase()
                        const imageSrc = univ.image || CLEAN_IMAGES[univKey] || CLEAN_IMAGES['DEFAULT']
                        // Gérer le fallback des slugs 
                        const slug = univ.href ? univ.href.split('/').pop() : ''

                        return (
                            <Link
                                key={univ.id}
                                href={`/univers/${slug}`}
                                className="group relative flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1"
                            >
                                {/* Top gradient bar */}
                                <div className="h-1 w-full bg-gradient-to-r from-gray-100 to-gray-50 group-hover:from-primary group-hover:to-orange-400 transition-all duration-500" />

                                {/* Image */}
                                <div className="relative w-full h-40 bg-gray-50 overflow-hidden">
                                    <Image
                                        src={imageSrc}
                                        alt={univ.name}
                                        fill
                                        className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                                        unoptimized={imageSrc.startsWith('http')}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent" />
                                </div>

                                {/* Content */}
                                <div className="p-5 flex flex-col flex-1">
                                    <h3 className="text-sm font-black text-[#1B1F3B] uppercase tracking-tight group-hover:text-primary transition-colors mb-1">
                                        {univ.name}
                                    </h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-4 line-clamp-1">
                                        {univ.subtitle || "Découvrez nos offres"}
                                    </p>

                                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-50">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-primary transition-colors">
                                            Explorer
                                        </span>
                                        <div className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                            <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </Container>
        </main>
    )
}
