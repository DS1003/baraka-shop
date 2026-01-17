import React from 'react'
import { HomeSlider } from '@/features/home/components/slider/HomeSlider'
import { ShippingBar } from '@/features/home/components/ShippingBar'
import { CategoryCarousel } from '@/features/home/components/carousel/CategoryCarousel'
import { PromoGrid } from '@/features/home/components/PromoGrid'
import { ProductTabs } from '@/features/home/components/ProductTabs'
import { HeadphonePromo } from '@/features/home/components/HeadphonePromo'
import { ShippingPromoBand } from '@/features/home/components/ShippingPromoBand'
import { BrandsAndSocial } from '@/features/home/components/BrandsAndSocial'

export default function Home() {
  return (
    <>
      <HomeSlider />
      <ShippingBar />
      <CategoryCarousel />
      <HeadphonePromo />
      <PromoGrid />
      <ShippingPromoBand />
      <ProductTabs />
      <BrandsAndSocial />
    </>
  )
}
