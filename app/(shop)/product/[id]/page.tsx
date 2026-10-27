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
        title: {
            absolute: `${product.name} | Baraka Electronique (Baraka Shop) Sénégal`,
        },
        description: `${product.description?.substring(0, 150) || product.name} - Disponible chez Baraka Electronique (Baraka Shop) à Dakar (90 Rue Av. K. Bourgi). Livraison express au Sénégal.`,
        keywords: [product.name, product.brand?.name, 'Baraka electronique', 'baraka electronique dakar', 'baraka shop', 'baraka sn', 'acheter au Sénégal'].filter(Boolean) as string[],
        alternates: {
            canonical: `https://baraka.sn/product/${product.id}`,
        },
        openGraph: {
            title: `${product.name} | Baraka Electronique`,
            description: `${product.description?.substring(0, 150) || product.name} - Baraka Electronique Dakar.`,
            images: product.images?.[0] ? [{ url: product.images[0], width: 800, height: 800, alt: product.name }] : [],
            type: 'website',
        }
    }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    // Fetch data server-side
    const product = await getProductByIdAction(id)

    // Un produit désactivé ou en rupture n'est plus accessible publiquement
    if (!product || !product.isPublished || product.stock <= 0) {
        notFound()
    }

    // Fetch similar products based on the full category hierarchy (intelligent matching) in parallel with top rated
    const [similarProducts, topRatedProducts] = await Promise.all([
        getSimilarProductsAction(product, 8),
        getProductsAction({ sort: 'top_rated', limit: 8 })
    ])

    // Calculate reviews and ratings for schema.org rich snippets
    const productReviews: any[] = (product as any).reviews || []
    const reviewCount = productReviews.length
    const averageRating = reviewCount > 0
        ? Number((productReviews.reduce((sum: number, r: any) => sum + (r.rating || 5), 0) / reviewCount).toFixed(1))
        : null

    // Build JSON-LD Product structured data for Google rich snippets
    const currentYear = new Date().getFullYear()
    const productJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.images || [],
        description: product.description?.substring(0, 300) || product.name,
        sku: product.reference || product.id,
        brand: {
            '@type': 'Brand',
            name: product.brand?.name || 'Baraka Electronique',
        },
        offers: {
            '@type': 'Offer',
            url: `https://baraka.sn/product/${product.id}`,
            priceCurrency: 'XOF',
            price: product.price,
            priceValidUntil: `${currentYear + 1}-12-31`,
            availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',
            seller: {
                '@type': 'Organization',
                name: 'Baraka Electronique',
                alternateName: 'Baraka Shop',
                url: 'https://baraka.sn',
            },
            hasMerchantReturnPolicy: {
                '@type': 'MerchantReturnPolicy',
                applicableCountry: 'SN',
                returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
                merchantReturnDays: 7,
                returnMethod: 'https://schema.org/ReturnInStore',
                returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
                url: 'https://baraka.sn/faq',
            },
            shippingDetails: {
                '@type': 'OfferShippingDetails',
                shippingRate: {
                    '@type': 'MonetaryAmount',
                    value: product.price && product.price >= 50000 ? 0 : 2000,
                    currency: 'XOF',
                },
                shippingDestination: {
                    '@type': 'DefinedRegion',
                    addressCountry: 'SN',
                },
                deliveryTime: {
                    '@type': 'ShippingDeliveryTime',
                    handlingTime: {
                        '@type': 'QuantitativeValue',
                        minValue: 0,
                        maxValue: 1,
                        unitCode: 'DAY',
                    },
                    transitTime: {
                        '@type': 'QuantitativeValue',
                        minValue: 1,
                        maxValue: 3,
                        unitCode: 'DAY',
                    },
                },
            },
        },
        ...(reviewCount > 0 && averageRating ? {
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: averageRating,
                reviewCount: reviewCount,
                bestRating: 5,
                worstRating: 1,
            },
            review: productReviews.slice(0, 5).map((r: any) => ({
                '@type': 'Review',
                reviewRating: {
                    '@type': 'Rating',
                    ratingValue: r.rating || 5,
                    bestRating: 5,
                    worstRating: 1,
                },
                author: {
                    '@type': 'Person',
                    name: r.user?.username || 'Client vérifié',
                },
                datePublished: r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : undefined,
                reviewBody: r.comment || 'Avis vérifié client Baraka Shop.',
            })),
        } : {}),
    }

    return (
        <main className="bg-[#f8f9fb] min-h-screen">
            <script
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
