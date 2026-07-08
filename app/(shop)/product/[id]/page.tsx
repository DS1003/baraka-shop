import React from 'react'
import { Container } from '@/ui/Container'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { getProductByIdAction, getSimilarProductsAction, getProductsAction } from '@/lib/actions/product-actions'
import { ProductClient } from './ProductClient'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Script from 'next/script'

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
        title: `${product.name} | Acheter chez Baraka Shop Sénégal`,
        description: `${product.description?.substring(0, 140) || product.name} - Disponible chez Baraka Electronique. Livraison rapide à Dakar et partout au Sénégal.`,
        keywords: [product.name, product.brand?.name, 'Baraka electronique', 'baraka shop', 'baraka sn', 'acheter au Sénégal'].filter(Boolean),
        openGraph: {
            title: `${product.name} | Baraka Shop`,
            description: `${product.description?.substring(0, 140) || product.name} - Baraka Electronique Dakar.`,
            images: product.images?.[0] ? [{ url: product.images[0], width: 800, height: 800, alt: product.name }] : [],
            type: 'website',
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

    // Fetch similar products based on the full category hierarchy (intelligent matching)
    const similarProducts = await getSimilarProductsAction(product, 8)
    const topRatedProducts = await getProductsAction({ sort: 'top_rated', limit: 8 })

    // Build JSON-LD Product structured data for Google rich snippets
    const productJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.images || [],
        description: product.description?.substring(0, 300) || product.name,
        brand: {
            '@type': 'Brand',
            name: product.brand?.name || 'Baraka Shop',
        },
        offers: {
            '@type': 'Offer',
            url: `https://www.baraka.sn/product/${product.id}`,
            priceCurrency: 'XOF',
            price: product.price,
            availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            seller: {
                '@type': 'Organization',
                name: 'Baraka Shop',
            },
        },
        ...(product.averageRating && product.averageRating > 0 ? {
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: product.averageRating,
                reviewCount: product.reviewCount || 1,
            }
        } : {}),
    }

    return (
        <main className="bg-[#f8f9fb] min-h-screen">
            <Script
                id={`product-jsonld-${product.id}`}
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
            />
            {/* Breadcrumbs */}
            <div className="bg-white border-b border-gray-100 py-2.5">
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
                bestSellers={topRatedProducts.products}
            />
        </main>
    )
}
