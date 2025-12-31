'use client'

import React from 'react'
import Hero from '@/components/Hero'
import Categories from '@/components/Categories'
import PromoGrid from '@/components/features/home/PromoGrid'
import FeaturedProducts from '@/components/FeaturedProducts'
import FlashDeals from '@/components/features/home/FlashDeals'
import Brands from '@/components/features/home/Brands'
import ServiceFeatures from '@/components/features/ServiceFeatures'
import PromoBento from '@/components/features/home/PromoBento'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f0f2f5] overflow-x-hidden pb-12">

      {/* 1. HERO AREA: SIDEBAR + SLIDER + TABS */}
      <Hero />

      {/* 2. TRUST BLOCKS: STORE, WARRANTY, AWARD */}
      <ServiceFeatures />

      {/* 3. POPULAR UNIVERS GRID */}
      <Categories />

      {/* 4. DISCOVERY GRID: À DÉCOUVRIR */}
      <PromoGrid />

      {/* 5. FLASH DEALS (Keep this as part of the functional e-commerce flow) */}
      <div className="container mx-auto px-4 mt-8">
        <FlashDeals />
      </div>

      {/* 6. BEST SELLERS / FEATURED */}
      <FeaturedProducts />

      {/* 7. SECONDARY CAMPAIGNS */}
      <div className="container mx-auto px-4 mt-8">
        <PromoBento />
      </div>

    </main>
  )
}
