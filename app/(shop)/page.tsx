import React from 'react'
import { HomeSlider } from '@/features/home/components/slider/HomeSlider'
import { ShippingBar } from '@/features/home/components/ShippingBar'
import { CategoryCarousel } from '@/features/home/components/carousel/CategoryCarousel'
import { PromoGrid } from '@/features/home/components/PromoGrid'
import { ProductSection } from '@/features/home/components/ProductSection'
import { HeadphonePromo } from '@/features/home/components/HeadphonePromo'
import { ShippingPromoBand } from '@/features/home/components/ShippingPromoBand'
import { BrandsAndSocial } from '@/features/home/components/BrandsAndSocial'
import { 
  getProductsAction, 
  getCategoriesAction, 
  getPopularUniversesAction,
  getBrandsAction
} from '@/lib/actions/product-actions'
import { getHomePromos, getBigBanners } from '@/lib/actions/admin-actions'

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Baraka Shop (Baraka Electronique) | Vente en ligne High-Tech au Sénégal',
  description: 'Bienvenue chez Baraka Shop (anciennement Baraka Electronique). Découvrez notre sélection de smartphones, ordinateurs, accessoires High-Tech et multimédia au meilleur prix à Dakar, Sandaga, Sénégal.',
  keywords: ['Baraka electronique', 'baraka shop', 'baraka sn', 'baraka', 'electronique sn', 'baraka sandaga', 'smartphone', 'ordinateur', 'dakar', 'sénégal', 'vente en ligne'],
  alternates: {
    canonical: 'https://baraka.sn',
  },
}

import { Container } from '@/ui/Container'
import Script from 'next/script'

export default async function Home() {
  // Pre-fetch all data server-side to avoid client-side waterfalls
  const [categories, newestProducts, topRatedProducts, promoProductsResult, popularUniverses, brands, promos, banners] = await Promise.all([
    getCategoriesAction(),
    getProductsAction({ sort: 'newest', limit: 8 }),
    getProductsAction({ sort: 'top_rated', limit: 8 }),
    getProductsAction({ onSale: true, limit: 8 }),
    getPopularUniversesAction(),
    getBrandsAction(),
    getHomePromos(),
    getBigBanners()
  ])

  const sliderSlides = categories.slice(0, 6).map((cat: any) => ({
    id: cat.id,
    image: cat.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    title: cat.name,
    href: `/boutique?category=${cat.slug}`
  }))

  const promoProducts = (promoProductsResult?.products && promoProductsResult.products.length > 0)
    ? promoProductsResult.products
    : newestProducts.products.filter((p: any) => p.oldPrice && p.oldPrice > p.price);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://www.baraka.sn/#website',
        url: 'https://www.baraka.sn',
        name: 'Baraka Shop',
        alternateName: ['Baraka Electronique', 'Baraka sn', 'Baraka', 'Electronique sn', 'Baraka Sandaga'],
        description: 'Vente de matériel électronique, informatique, smartphones et accessoires.',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://www.baraka.sn/boutique?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Store',
        '@id': 'https://www.baraka.sn/#store',
        name: 'Baraka Shop',
        alternateName: ['Baraka Electronique', 'Baraka sn', 'Baraka', 'Electronique sn', 'Baraka Sandaga'],
        image: 'https://baraka.sn/wp-content/uploads/2025/10/logo-contour-blanc-01-scaled-e1761208403239.png',
        description: 'Spécialiste de la vente de matériel électronique, informatique, smartphones et accessoires.',
        url: 'https://www.baraka.sn',
        telephone: '+221338223422',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Rue Avenue ABDOU, 90 Rue Av. K. Bourgi',
          addressLocality: 'Dakar',
          addressCountry: 'SN'
        },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            opens: '08:00',
            closes: '18:30'
          },
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: 'Sunday',
            opens: '09:00',
            closes: '13:00'
          }
        ]
      }
    ]
  }

  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Container className="flex flex-col gap-6 md:gap-12 py-6">
        <HomeSlider initialSlides={sliderSlides} />
        <ShippingBar />

        {/* Univers Populaires */}
        <CategoryCarousel initialUniverses={popularUniverses} initialCategories={categories} />

        <HeadphonePromo initialBanner={banners?.[0]} />

        {/* Nouveautés */}
        <ProductSection
          eyebrow="Arrivages & Exclusivités"
          title="Nouveautés"
          highlightedWord="High-Tech"
          subtitle="Découvrez nos tout derniers produits récemment ajoutés au catalogue."
          products={newestProducts.products}
          viewAllHref="/boutique?sort=newest"
          priority={true}
        />

        {/* Meilleures Ventes */}
        <ProductSection
          eyebrow="Tendances & Succès"
          title="Meilleures"
          highlightedWord="Ventes"
          subtitle="Les produits les plus plébiscités et recherchés par nos clients."
          products={topRatedProducts.products}
          viewAllHref="/boutique?sort=top_rated"
        />

        {/* Nos Incontournables */}
        <PromoGrid initialPromos={promos} />

        {/* Bandeau Livraison Express & Garantie juste au-dessus des Promotions */}
        <ShippingPromoBand />

        {/* Promotions */}
        <ProductSection
          eyebrow="Offres Spéciales"
          title="Promotions"
          highlightedWord="Du Moment"
          subtitle="Profitez de nos réductions exceptionnelles et bons plans exclusifs."
          products={promoProducts}
          viewAllHref="/boutique?onSale=true"
        />

        <BrandsAndSocial initialBrands={brands} />
      </Container>
    </>
  )
}
