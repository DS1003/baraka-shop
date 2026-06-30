import React from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Container } from '@/ui/Container'
import prisma from '@/lib/prisma'
import { getPopularUniversesAction } from '@/lib/actions/product-actions'
import { ChevronRight, ArrowRight, Sparkles, Layers, Box } from 'lucide-react'
import { Metadata } from 'next'

interface PageProps {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const category = await prisma.category.findFirst({
        where: { slug: { equals: slug, mode: 'insensitive' } }
    })
    
    if (!category) return { title: 'Univers non trouvé | Baraka Shop' }
    
    return {
        title: `Univers ${category.name} | Baraka Shop`,
        description: `Explorez notre univers ${category.name} et découvrez toutes nos catégories et sous-catégories.`
    }
}

export default async function UniversPage({ params }: PageProps) {
    const rawSlug = (await params).slug
    const decodedSlug = decodeURIComponent(rawSlug)
    
    // Fonction pour normaliser les slugs (retirer les tirets et caractères spéciaux)
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
    const targetSlug = normalize(decodedSlug)

    // Récupérer toutes les catégories pour faire une correspondance floue
    const allCategories = await prisma.category.findMany({
        where: { isPublished: true },
        include: {
            subCategories: {
                include: {
                    thirdLevelCategories: true
                },
                orderBy: { name: 'asc' }
            }
        }
    })

    // Trouver la catégorie correspondante
    const category = allCategories.find(c => normalize(c.slug) === targetSlug)

    if (!category) {
        notFound()
    }

    // Récupérer les autres univers populaires pour la navigation latérale
    const popularUniverses = await getPopularUniversesAction()
    // Si la table PopularUniverse est vide, on récupère les catégories principales (fallback)
    let allUniverses = []
    if (popularUniverses && popularUniverses.length > 0) {
        allUniverses = popularUniverses
    } else {
        const fallbackCats = await prisma.category.findMany({
            where: { isPublished: true },
            take: 10,
            orderBy: { name: 'asc' }
        })
        allUniverses = fallbackCats.map((c: any) => ({
            name: c.name,
            slug: c.slug,
            href: `/univers/${c.slug}`
        }))
    }

    return (
        <main className="bg-[#f8f9fb] min-h-screen">
            {/* HERO SECTION (Premium & Sleek) */}
            <div className="relative bg-[#05050A] overflow-hidden pt-10 pb-24 md:pb-32">
                {/* Texture Overlay */}
                <div className="absolute inset-0 opacity-10" 
                     style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
                
                {/* Animated light rays & orbs (Subdued) */}
                <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/10 blur-[80px] rounded-full animate-pulse" />
                <div className="absolute top-10 left-10 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                
                <Container className="relative z-10">
                    {/* Fil d'Ariane */}
                    <nav className="flex items-center gap-2 text-[10px] md:text-xs text-white/40 mb-8 font-bold uppercase tracking-widest">
                        <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Accueil
                        </Link>
                        <ChevronRight className="w-3 h-3 text-white/20" />
                        <span className="text-white/80">{category.name}</span>
                    </nav>

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 lg:gap-12 text-center md:text-left">
                        {category.image && (
                            <div className="relative w-32 h-32 md:w-48 md:h-48 shrink-0 rounded-[2rem] overflow-hidden shadow-[0_0_40px_rgba(249,115,22,0.15)] border-4 border-white/5 group bg-[#0F111A] transform transition-all duration-700 hover:scale-105 hover:border-primary/30">
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                                <Image 
                                    src={category.image} 
                                    alt={category.name} 
                                    fill 
                                    className="object-cover group-hover:scale-110 transition-transform duration-700 p-1"
                                    unoptimized={category.image?.startsWith('http')}
                                />
                            </div>
                        )}
                        
                        <div className="space-y-6 max-w-2xl pt-2">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-sm">
                                <Sparkles className="w-3.5 h-3.5 text-primary" />
                                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Explorez l'Univers</span>
                            </div>

                            <h1 className="flex flex-col items-center md:items-start gap-2">
                                <span className="text-white/80 text-xl md:text-3xl font-black italic tracking-tight uppercase leading-none">
                                    Découvrez
                                </span>
                                <div className="relative inline-block mt-1 group cursor-default">
                                    <div className="absolute -inset-2 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-orange-400 rotate-[-1deg] rounded-2xl shadow-lg transition-transform duration-500 group-hover:rotate-0" />
                                    <span className="relative block bg-[#05050A] text-white px-6 md:px-8 py-3 md:py-4 rounded-2xl text-3xl md:text-5xl font-black uppercase tracking-tighter rotate-[1deg] border-[3px] border-primary/50 transition-transform duration-500 group-hover:rotate-0">
                                        {category.name}
                                    </span>
                                </div>
                            </h1>
                            
                            <p className="text-gray-400 font-medium text-sm max-w-lg leading-relaxed mx-auto md:mx-0">
                                Des milliers de produits sélectionnés pour vous. Plongez dans l'excellence de notre catégorie <span className="text-white font-bold">{category.name}</span>.
                            </p>

                            <div className="pt-2">
                                <Link 
                                    href={`/boutique?category=${category.slug}`}
                                    className="group/btn inline-flex items-center gap-3 bg-white text-[#05050A] px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary hover:text-white shadow-md hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 uppercase tracking-wide"
                                >
                                    Explorer la boutique
                                    <div className="w-6 h-6 rounded-full bg-[#05050A]/10 group-hover/btn:bg-white/20 flex items-center justify-center transition-colors">
                                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>

            {/* CONTENU PRINCIPAL */}
            <Container className="relative z-20 -mt-12 md:-mt-16 pb-20">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                        {/* Grille des sous-catégories */}
                        {category.subCategories.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {category.subCategories.map((sub: any, index: number) => (
                                    <div 
                                        key={sub.id} 
                                        className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-xl hover:border-primary/20 transition-all duration-300 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-100 to-gray-50 group-hover:from-primary group-hover:to-orange-400 transition-all duration-500" />
                                        
                                        <h3 className="text-[15px] md:text-base font-black text-[#1B1F3B] uppercase tracking-tight mb-5 pb-4 border-b border-gray-50 flex items-start sm:items-center justify-between group-hover:text-primary transition-colors mt-1 gap-4 flex-col sm:flex-row">
                                            <span className="flex items-center gap-3">
                                                <div className="w-10 h-10 shrink-0 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                                    <Box className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                                                </div>
                                                {sub.name}
                                            </span>
                                            {sub.thirdLevelCategories?.length > 0 && (
                                                <span className="shrink-0 text-[10px] font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                    {sub.thirdLevelCategories.length} TYPES
                                                </span>
                                            )}
                                        </h3>
                                        
                                        <div className="flex-1">
                                            {sub.thirdLevelCategories?.length > 0 ? (
                                                <div className="flex flex-wrap gap-2 mb-6">
                                                    {sub.thirdLevelCategories.map((third: any) => (
                                                        <Link 
                                                            key={third.id}
                                                            href={`/boutique?category=${category.slug}&subCategory=${sub.slug}&thirdLevelCategory=${third.slug}`}
                                                            className="inline-flex items-center bg-gray-50 text-gray-600 hover:bg-[#1B1F3B] hover:text-white text-[11px] font-bold px-3 py-2 rounded-lg border border-transparent hover:border-[#1B1F3B] transition-all uppercase tracking-wide"
                                                        >
                                                            {third.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-gray-400 italic mb-6">Aucune sous-catégorie spécifique.</p>
                                            )}
                                        </div>

                                        <Link 
                                            href={`/boutique?category=${category.slug}&subCategory=${sub.slug}`}
                                            className="group/link flex items-center justify-between w-full py-3.5 px-5 rounded-xl bg-gray-50/80 text-[11px] font-black text-gray-500 hover:bg-primary/10 hover:text-primary transition-all mt-auto uppercase tracking-widest border border-transparent hover:border-primary/20"
                                        >
                                            Découvrir tout
                                            <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200 flex-1">
                                <p className="text-gray-500 font-medium">Cet univers n'a pas encore de sous-catégories.</p>
                            </div>
                        )}
                    </div>
            </Container>
        </main>
    )
}
