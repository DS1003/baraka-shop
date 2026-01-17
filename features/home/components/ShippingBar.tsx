'use client'

import React from 'react'
import { Container } from '@/ui/Container'
import { Truck, RotateCcw, ShieldCheck, Headphones, CreditCard } from 'lucide-react'

const features = [
    {
        icon: Truck,
        title: "Livraison Gratuite",
        description: "Dès 200.000 CFA d'achat"
    },
    {
        icon: RotateCcw,
        title: "Retours Faciles",
        description: "Satisfait ou remboursé"
    },
    {
        icon: ShieldCheck,
        title: "Paiement Sécurisé",
        description: "Transactions 100% sûres"
    },
    {
        icon: Headphones,
        title: "Support 24/7",
        description: "Une équipe à votre écoute"
    }
]

export function ShippingBar() {
    return (
        <div className="bg-white border-b border-gray-100 py-10">
            <Container>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-5 group cursor-default">
                            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-[#1B1F3B] group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm border border-gray-100">
                                <feature.icon className="w-7 h-7" strokeWidth={1.5} />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-sm text-[#1B1F3B] uppercase tracking-tight leading-tight">
                                    {feature.title}
                                </span>
                                <span className="text-[12px] text-gray-400 font-medium mt-0.5">
                                    {feature.description}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </div>
    )
}
