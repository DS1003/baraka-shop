import React from 'react'
import { HomeSlider } from '@/features/home/components/slider/HomeSlider'
import { ShippingBar } from '@/features/home/components/ShippingBar'
import { CategoryCarousel } from '@/features/home/components/carousel/CategoryCarousel'
import { PromoGrid } from '@/features/home/components/PromoGrid'
import { ProductTabs } from '@/features/home/components/ProductTabs'
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
  title: 'Baraka Shop | Accueil - Électronique Premier au Sénégal',
  description: 'Bievenue chez Baraka Shop. Découvrez notre sélection exclusive de smartphones, ordinateurs et accessoires High-Tech au meilleur prix au Sénégal.',
}

import { Container } from '@/ui/Container'
import Script from 'next/script'

export default async function Home() {
  // Pre-fetch all data server-side to avoid client-side waterfalls
  const [categories, newestProducts, topRatedProducts, popularUniverses, brands, promos, banners] = await Promise.all([
    getCategoriesAction(),
    getProductsAction({ sort: 'newest', limit: 8 }),
    getProductsAction({ sort: 'top_rated', limit: 8 }),
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

  const initialProductTabsData = {
    'Nouveautés': newestProducts.products,
    'Meilleures Ventes': topRatedProducts.products,
    'Promotions': newestProducts.products.filter((p: any) => p.oldPrice && p.oldPrice > p.price)
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://www.baraka.sn/#website',
        url: 'https://www.baraka.sn',
        name: 'Baraka Shop',
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
      <Container className="flex flex-col gap-4 md:gap-8 py-6">
        <HomeSlider initialSlides={sliderSlides} />
        <ShippingBar />
        <CategoryCarousel initialUniverses={popularUniverses} initialCategories={categories} />
        <HeadphonePromo initialBanner={banners?.[0]} />
        <PromoGrid initialPromos={promos} />
        <ShippingPromoBand />
        <ProductTabs initialData={initialProductTabsData} />
        <BrandsAndSocial initialBrands={brands} />
      </Container>
    </>
  )
}

