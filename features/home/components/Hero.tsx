'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/ui/Button'
import { Container } from '@/ui/Container'
import { ArrowRight } from 'lucide-react'

export function Hero() {
    return (
        <section className="relative overflow-hidden bg-[#1B1F3B] py-16 lg:py-24">
            {/* Background Pattern - subtle dots or mesh if needed */}
            <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-5 mix-blend-overlay"></div>

            <Container className="relative grid lg:grid-cols-2 gap-12 items-center z-10">
                {/* Text Content */}
                <div className="flex flex-col gap-6 items-start animate-fade-in-up order-2 lg:order-1">
                    <span className="inline-block px-4 py-1.5 rounded-sm bg-[#FF4747] text-white font-bold text-xs uppercase tracking-widest ">
                        Weekend Deal
                    </span>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                        All New <br />
                        For A Better You
                    </h1>

                    <p className="text-gray-400 font-medium tracking-wide text-sm md:text-base uppercase">
                        Amazing Discounts and Deals
                    </p>

                    <div className="flex flex-col gap-1 mt-2">
                        <span className="text-gray-400 text-sm">From</span>
                        <span className="text-4xl font-bold text-[#FFD700]">$399.99</span>
                    </div>

                    <div className="pt-6">
                        <Button size="lg" className="h-14 px-10 rounded-sm bg-[#007BFF] hover:bg-[#0069d9] text-white font-bold uppercase tracking-wider text-sm transition-transform active:scale-95 shadow-lg shadow-blue-900/20">
                            Shop Now
                        </Button>
                    </div>

                    {/* Pagination Dots */}
                    <div className="flex gap-2 mt-12">
                        <div className="w-8 h-2 rounded-full bg-[#007BFF]"></div>
                        <div className="w-2 h-2 rounded-full bg-white/20"></div>
                        <div className="w-2 h-2 rounded-full bg-white/20"></div>
                    </div>
                </div>

                {/* Image Content */}
                <div className="relative order-1 lg:order-2 flex items-center justify-center lg:justify-end">
                    {/* Using a placeholder circle/glow behind the product */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-white/5 rounded-full blur-[80px]" />

                    {/* Main Product Image - Simulating the 3 watches. 
                 Since I don't have the watch image, I will use iPhone as placeholder but name it properly in alt.
                 Ideally, if I had the `apple-watch.png`, I'd use it.
             */}
                    <div className="relative w-full aspect-square max-w-[500px] animate-float">
                        <Image
                            src="/iphone-15-pro.png"
                            alt="Latest Technology Deals"
                            fill
                            className="object-contain drop-shadow-2xl z-10"
                            priority
                        // If you want to simulate rotation or specific positioning:
                        // style={{ transform: 'rotate(-5deg)' }}
                        />
                    </div>
                </div>
            </Container>
        </section>
    )
}
