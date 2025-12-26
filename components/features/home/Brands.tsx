'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const BRANDS = [
    { name: 'Apple', logo: 'https://cdn.worldvectorlogo.com/logos/apple-11.svg' },
    { name: 'Lego', logo: 'https://cdn.worldvectorlogo.com/logos/lego-1.svg' },
    { name: 'Logitech', logo: 'https://cdn.worldvectorlogo.com/logos/logitech-2.svg' },
    { name: 'Logitech G', logo: 'https://cdn.worldvectorlogo.com/logos/logitech-g-1.svg' },
    { name: 'Razer', logo: 'https://cdn.worldvectorlogo.com/logos/razer-logo.svg' },
    { name: 'Corsair', logo: 'https://cdn.worldvectorlogo.com/logos/corsair-2.svg' },
]

export default function Brands() {
    return (
        <section className="py-12 bg-gray-50/50">
            <div className="container px-4 mx-auto">
                {/* Header */}
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-2xl font-light text-gray-800 uppercase tracking-widest">
                            NOS <span className="font-bold text-gray-900">MARQUES</span>
                        </h2>
                        <p className="text-sm text-gray-500 italic mt-1">Ils nous font confiance !</p>
                    </div>
                    <Link href="/brands" className="bg-[#0f172a] hover:bg-primary text-white text-xs font-bold px-6 py-2.5 rounded-full transition-colors flex items-center gap-2">
                        VOIR +
                    </Link>
                </div>

                {/* Card Container */}
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-16 items-center justify-items-center">
                        {BRANDS.map((brand, index) => (
                            <motion.div
                                key={brand.name}
                                whileHover={{ scale: 1.1, filter: 'grayscale(0%)' }}
                                className="relative w-full h-16 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer"
                            >
                                <Image
                                    src={brand.logo}
                                    alt={brand.name}
                                    fill
                                    className="object-contain max-h-12 md:max-h-16"
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
