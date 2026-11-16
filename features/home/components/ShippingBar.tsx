'use client'

import React from 'react'
import { TruckFast, RotateLeft2, ShieldTick, Headset } from 'reicon-react'

const features = [
    {
        icon: TruckFast,
        title: "Livraison Rapide",
        description: "Dakar & dans toutes les régions",
    },
    {
        icon: RotateLeft2,
        title: "Retours Faciles",
        description: "Satisfait ou remboursé sous 7j",
    },
    {
        icon: ShieldTick,
        title: "Paiement à la Réception",
        description: "Espèces, Wave ou Orange Money",
    },
    {
        icon: Headset,
        title: "Support Dédié 24/7",
        description: "Conseils et suivi personnalisé",
    }
]

export function ShippingBar() {
    return (
        <section aria-label="Garanties et engagements Baraka Shop" className="w-full my-2 md:my-3">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl md:rounded-3xl border border-slate-100/90 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.03)] py-3 sm:py-3.5 md:py-4 px-4 sm:px-6 md:px-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 lg:divide-x lg:divide-slate-100">
                    {features.map((feature, index) => {
                        const Icon = feature.icon

                        return (
                            <div
                                key={index}
                                className={`flex items-center text-left gap-3 md:gap-3.5 group cursor-default min-w-0 transition-all duration-200 ${
                                    index > 0 ? 'lg:pl-6' : ''
                                }`}
                            >
                                {/* Minimalist Squircle Icon Container */}
                                <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-xl md:rounded-2xl bg-slate-50/90 border border-slate-100/90 text-slate-700 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:border-primary group-hover:shadow-[0_8px_18px_-4px_rgba(232,98,26,0.3)] group-hover:scale-105">
                                    <Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5 transition-transform duration-300 group-hover:scale-110" strokeWidth={1.8} />
                                </div>

                                {/* Typography */}
                                <div className="flex flex-col min-w-0 justify-center">
                                    <span className="font-bold text-[11.5px] sm:text-xs md:text-[13px] text-slate-900 tracking-tight leading-snug whitespace-nowrap truncate group-hover:text-primary transition-colors duration-200">
                                        {feature.title}
                                    </span>
                                    <span className="text-[10px] sm:text-[10.5px] md:text-[11.5px] text-slate-400 group-hover:text-slate-500 font-medium mt-0.5 whitespace-nowrap truncate transition-colors duration-200">
                                        {feature.description}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
