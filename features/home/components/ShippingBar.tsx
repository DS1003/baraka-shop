'use client'

import React from 'react'
import { Container } from '@/ui/Container'
import { Truck, Refresh as RotateCcw, ShieldCheck, Headphones, CreditCard } from 'reicon-react'

const features = [
    {
        icon: Truck,
        title: "Livraison Rapide",
        description: "Dakar & partout au Sénégal"
    },
    {
        icon: RotateCcw,
        title: "Retours Faciles",
        description: "Satisfait ou remboursé"
    },
    {
        icon: ShieldCheck,
        title: "Paiement à la Réception",
        description: "Réglez à la livraison"
    },
    {
        icon: Headphones,
        title: "Support 24/7",
        description: "Une équipe à votre écoute"
    }
]

export function ShippingBar() {
    return (
        <div className="hidden md:block bg-white md:rounded-[2rem] border border-gray-100/90 py-4 md:py-5 lg:py-5 px-3 md:px-5 lg:px-6 xl:px-8 shadow-xs my-1 md:my-2">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-4 md:gap-y-5 gap-x-2 md:gap-x-3 lg:gap-x-4 xl:gap-x-6 items-center">
                {features.map((feature, index) => (
                    <div key={index} className="flex items-center text-left gap-2.5 md:gap-3 lg:gap-3 xl:gap-3.5 group cursor-default min-w-0">
                        <div className="w-10 h-10 md:w-11 md:h-11 lg:w-11 lg:h-11 xl:w-12 xl:h-12 rounded-xl lg:rounded-2xl bg-gray-50 flex items-center justify-center text-[#1B1F3B] group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-xs border border-gray-100 shrink-0">
                            <feature.icon className="w-5 h-5 md:w-5.5 md:h-5.5 lg:w-5.5 lg:h-5.5 xl:w-6 xl:h-6" strokeWidth={1.5} />
                        </div>
                        <div className="flex flex-col min-w-0 justify-center">
                            <span className="font-black text-[11px] md:text-[12px] lg:text-[11.5px] xl:text-[13px] text-[#1B1F3B] uppercase tracking-tight leading-tight whitespace-nowrap truncate">
                                {feature.title}
                            </span>
                            <span className="text-[9.5px] md:text-[10px] lg:text-[10px] xl:text-[11.5px] text-gray-400 font-medium mt-0.5 whitespace-nowrap truncate">
                                {feature.description}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
