'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import Hero from '@/components/Hero'
import Categories from '@/components/Categories'
import ServiceFeatures from '@/components/features/ServiceFeatures'
import FeaturedProducts from '@/components/FeaturedProducts'
import FlashDeals from '@/components/features/home/FlashDeals'
import CategoryBlock from '@/components/features/home/CategoryBlock'
import Brands from '@/components/features/home/Brands'
import PromoGrid from '@/components/features/home/PromoGrid'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8f9fa] overflow-x-hidden">

      {/* Hero Section - Full Width, Immersive */}
      <Hero />

      {/* Service Features - Floating overlap with Glassmorphism */}
      <div className="relative z-10 -mt-10 mb-16 container mx-auto px-4">
        <ScrollReveal delay={0.2} direction="up">
          <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl p-2">
            <ServiceFeatures />
          </div>
        </ScrollReveal>
      </div>

      <div className="space-y-24 pb-24">

        {/* Modern Categories - Pill Style */}
        <ScrollReveal>
          <Categories />
        </ScrollReveal>

        {/* New Promo Grid Section - Big Visual Impact */}
        <ScrollReveal>
          <PromoGrid />
        </ScrollReveal>

        {/* Flash Deals - Dark & Immersive */}
        <ScrollReveal>
          <div className="py-8">
            <FlashDeals />
          </div>
        </ScrollReveal>

        {/* Featured Section */}
        <ScrollReveal>
          <FeaturedProducts />
        </ScrollReveal>

        {/* Category Blocks - Computing */}
        <ScrollReveal direction="left">
          <CategoryBlock
            title="Univers Informatique"
            category="laptops"
            description="Puissance et performance pour les créateurs et gamers."
            image="https://images.unsplash.com/photo-1661961110218-35af7210f803?auto=format&fit=crop&q=80&w=1200"
          />
        </ScrollReveal>

        {/* Banner Interstitial - Future Tech */}
        <ScrollReveal>
          <div className="container px-4 mx-auto">
            <div className="relative w-full h-[350px] md:h-[500px] rounded-[3rem] overflow-hidden shadow-2xl group cursor-pointer">
              <Image
                src="https://images.unsplash.com/photo-1617802690992-15d93263d3a9?q=80&w=2000&auto=format&fit=crop"
                alt="Future Tech"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent flex flex-col justify-center text-white p-8 md:p-24">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <span className="inline-block px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-[0.2em] mb-8">
                    Next Gen
                  </span>
                  <h2 className="text-5xl md:text-8xl font-black mb-8 leading-none">
                    Vision <br /> Pro 2026.
                  </h2>
                  <button className="group bg-white text-black hover:bg-primary hover:text-white font-bold py-4 px-12 rounded-full transition-all duration-300 transform hover:scale-105 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-3">
                    Précommander
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </motion.div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Category Blocks - Phones */}
        <ScrollReveal direction="right">
          <CategoryBlock
            title="Mobile & Connecté"
            category="smartphones"
            description="L'innovation au bout des doigts."
            image="https://images.unsplash.com/photo-1556656793-02f13a06f63d?q=80&w=1200&auto=format&fit=crop"
          />
        </ScrollReveal>

        <ScrollReveal>
          <Brands />
        </ScrollReveal>
      </div>
    </main>
  )
}
