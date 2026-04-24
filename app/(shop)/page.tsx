import React from 'react'
import { HomeSlider } from '@/features/home/components/slider/HomeSlider'
import { ShippingBar } from '@/features/home/components/ShippingBar'
import { CategoryCarousel } from '@/features/home/components/carousel/CategoryCarousel'
import { PromoGrid } from '@/features/home/components/PromoGrid'
import { ProductTabs } from '@/features/home/components/ProductTabs'
import { HeadphonePromo } from '@/features/home/components/HeadphonePromo'
import { ShippingPromoBand } from '@/features/home/components/ShippingPromoBand'
import { BrandsAndSocial } from '@/features/home/components/BrandsAndSocial'
import { getProductsAction, getCategoriesAction } from '@/lib/actions/product-actions'

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Baraka Shop | Accueil - Électronique Premier au Sénégal',
  description: 'Bievenue chez Baraka Shop. Découvrez notre sélection exclusive de smartphones, ordinateurs et accessoires High-Tech au meilleur prix au Sénégal.',
}

import { Container } from '@/ui/Container'

export default async function Home() {
  // Pre-fetch all data server-side to avoid client-side waterfalls
  const [categories, newestProducts, topRatedProducts] = await Promise.all([
    getCategoriesAction(),
    getProductsAction({ sort: 'newest', limit: 8 }),
    getProductsAction({ sort: 'top_rated', limit: 8 }),
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

  return (
    <Container className="flex flex-col gap-4 md:gap-8 py-6">
      <HomeSlider initialSlides={sliderSlides} />
      <ShippingBar />
      <CategoryCarousel initialCategories={categories} />
      <HeadphonePromo />
      <PromoGrid />
      <ShippingPromoBand />
      <ProductTabs initialData={initialProductTabsData} />
      <BrandsAndSocial />
    </Container>
  )
}

