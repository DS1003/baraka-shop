import React from 'react'
import { Container } from '@/ui/Container'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { getProductByIdAction, getSimilarProductsAction, getProductsAction } from '@/lib/actions/product-actions'
import { ProductClient } from './ProductClient'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
    const { products } = await getProductsAction({ limit: 50 })
    return products.map((product: any) => ({
        id: product.id,
    }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params
    const product = await getProductByIdAction(id)

    if (!product) {
        return {
            title: 'Produit non trouvé | Baraka Shop'
        }
    }

    return {
        title: `${product.name} | Baraka Shop`,
        description: product.description?.substring(0, 160),
        openGraph: {
            title: product.name,
            description: product.description?.substring(0, 160),
            images: product.images?.[0] ? [{ url: product.images[0] }] : []
        }
    }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    // Fetch data server-side
    const product = await getProductByIdAction(id)

    if (!product) {
        notFound()
    }

    // Fetch similar products based on the same category
    const similarProducts = await getSimilarProductsAction(id, product.categoryId, 8)

    return (
        <main className="bg-[#f8f9fb] min-h-screen">
            {/* Breadcrumbs */}
            <div className="bg-white border-b border-gray-100 py-4">
                <Container>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 overflow-x-auto whitespace-nowrap scrollbar-hide">
                        <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
                        <ChevronRight className="w-3 h-3 flex-shrink-0" />
                        <Link href="/boutique" className="hover:text-primary transition-colors">Boutique</Link>
                        <ChevronRight className="w-3 h-3 flex-shrink-0" />
                        <Link href={`/boutique?category=${product.category?.slug}`} className="hover:text-primary transition-colors">{product.category?.name}</Link>
                        <ChevronRight className="w-3 h-3 flex-shrink-0" />
                        <span className="text-[#1B1F3B] truncate max-w-[200px]">{product.name}</span>
                    </div>
                </Container>
            </div>

            {/* Client Side Interactive Area */}
            <ProductClient
                product={product}
                similarProducts={similarProducts}
            />
        </main>
    )
}
