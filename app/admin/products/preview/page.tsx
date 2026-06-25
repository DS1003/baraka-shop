'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Container } from '@/ui/Container'
import { ProductClient } from '@/app/(shop)/product/[id]/ProductClient'

export default function ProductPreviewPage() {
    const [product, setProduct] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        try {
            const raw = localStorage.getItem('baraka-product-preview')
            if (raw) {
                const data = JSON.parse(raw)
                setProduct(data)
            }
        } catch (e) {
            console.error('Failed to load preview data:', e)
        } finally {
            setLoading(false)
        }
    }, [])

    if (loading) {
        return (
            <main className="bg-[#f8f9fb] min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-bold text-slate-500">Chargement de l&apos;aperçu...</p>
                </div>
            </main>
        )
    }

    if (!product) {
        return (
            <main className="bg-[#f8f9fb] min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <p className="text-lg font-bold text-slate-800">Aucun aperçu disponible</p>
                    <p className="text-sm text-slate-500">Retournez dans le formulaire et cliquez sur &quot;Aperçu&quot;.</p>
                </div>
            </main>
        )
    }

    return (
        <main className="bg-[#f8f9fb] min-h-screen">
            {/* Preview Banner */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white py-2">
                <Container>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            <span className="text-[11px] font-black uppercase tracking-widest">
                                Mode Aperçu — Les modifications ne sont pas enregistrées
                            </span>
                        </div>
                        <button
                            onClick={() => window.close()}
                            className="text-[11px] font-bold uppercase tracking-wider bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-full transition-all"
                        >
                            Fermer
                        </button>
                    </div>
                </Container>
            </div>

            {/* Breadcrumbs */}
            <div className="bg-white border-b border-gray-100 py-2.5">
                <Container>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 overflow-x-auto whitespace-nowrap scrollbar-hide">
                        <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
                        <ChevronRight className="w-3 h-3 flex-shrink-0" />
                        <Link href="/boutique" className="hover:text-primary transition-colors">Boutique</Link>
                        <ChevronRight className="w-3 h-3 flex-shrink-0" />
                        <span className="text-gray-400">{product.category?.name || 'Catégorie'}</span>
                        <ChevronRight className="w-3 h-3 flex-shrink-0" />
                        <span className="text-[#1B1F3B] truncate max-w-[200px]">{product.name}</span>
                    </div>
                </Container>
            </div>

            {/* Product Client */}
            <ProductClient
                product={product}
                similarProducts={[]}
            />
        </main>
    )
}
