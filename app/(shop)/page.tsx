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
  title: {
    absolute: 'Baraka Electronique (Baraka Shop) | Magasin Informatique & High-Tech à Dakar, Sénégal',
  },
  description: 'Au cœur de Sandaga, Baraka Electronique (Baraka Shop) est plus qu\'un distributeur : le partenaire de confiance qui connecte le Sénégal avec le meilleur de la technologie mondiale sans compromis sur la qualité, sans concession sur les prix.',
  keywords: [
    'Baraka electronique', 'baraka electronique dakar', 'baraka electronics', 'baraka electronics dakar',
    'baraka shop', 'baraka sn', 'baraka', 'electronique sn', 'baraka sandaga', 'baraka senegal',
    'magasin informatique dakar', 'materiel informatique dakar', 'ordinateur dakar', 'smartphone dakar',
    '90 Rue Av. K. Bourgi', 'vente en ligne sénégal'
  ],
  alternates: {
    canonical: 'https://baraka.sn',
  },
}

export const revalidate = 60;

import { Container } from '@/ui/Container'

export default async function Home() {
  // Pre-fetch all data server-side to avoid client-side waterfalls
  // 1. Fetch newest products and other static homepage sections in parallel
  const [categories, newestProducts, promoProductsResult, popularUniverses, brands, promos, banners] = await Promise.all([
    getCategoriesAction(),
    getProductsAction({ sort: 'newest', limit: 10 }),
    getProductsAction({ onSale: true, limit: 10 }),
    getPopularUniversesAction(),
    getBrandsAction(),
    getHomePromos(),
    getBigBanners()
  ]);

  // Extract newest product IDs so that "Meilleures Ventes" displays completely distinct products
  const newestIds = (newestProducts?.products || []).map((p: any) => p.id);

  // 2. Fetch top rated / best sellers, excluding the newest products to guarantee 100% distinct lists
  const topRatedProducts = await getProductsAction({
    sort: 'top_rated',
    limit: 10,
    excludeIds: newestIds
  });

  const sliderSlides = categories.slice(0, 6).map((cat: any) => ({
    id: cat.id,
    image: cat.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    title: cat.name,
    href: `/boutique?category=${cat.slug}`
  }))

  const promoProducts = (promoProductsResult?.products && promoProductsResult.products.length > 0)
    ? promoProductsResult.products
    : newestProducts.products.filter((p: any) => p.oldPrice && p.oldPrice > p.price);

  return (
    <>
      <Container className="flex flex-col gap-4 md:gap-8 py-3 md:py-5">
        {/* SEO Semantic H1 Heading */}
        <h1 className="sr-only">
          Baraka Electronique (Baraka Shop) — Magasin de Matériel Informatique, Électronique, Smartphones &amp; PC Portables à Dakar, Sénégal (90 Rue Av. K. Bourgi, Sandaga)
        </h1>

        <HomeSlider initialSlides={sliderSlides} />
        <ShippingBar />

        {/* Univers Populaires */}
        <CategoryCarousel initialUniverses={popularUniverses} initialCategories={categories} />

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

        {/* Le Son Absolu */}
        <HeadphonePromo initialBanner={banners?.[0]} />

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

        {/* Promotions - Masqué s'il n'y a pas de promotions */}
        {promoProducts && promoProducts.length > 0 && (
          <ProductSection
            eyebrow="Offres Spéciales"
            title="Promotions"
            highlightedWord="Du Moment"
            subtitle="Profitez de nos réductions exceptionnelles et bons plans exclusifs."
            products={promoProducts}
            viewAllHref="/boutique?onSale=true"
            hideIfEmpty
          />
        )}

        <BrandsAndSocial initialBrands={brands} />
      </Container>
    </>
  )
}
