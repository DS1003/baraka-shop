'use client'

import { Truck, RotateCcw, ShieldCheck, Headphones, Tag } from 'lucide-react'

export default function ServiceFeatures() {
    const features = [
        {
            icon: Truck,
            title: "Livraison Gratuite",
            description: "Dès 200.000 FCFA"
        },
        {
            icon: RotateCcw,
            title: "Retours Gratuits",
            description: "Sous 15 jours"
        },
        {
            icon: ShieldCheck,
            title: "Paiement Sécurisé",
            description: "100% garanti"
        },
        {
            icon: Headphones,
            title: "Support 24/7",
            description: "Expert dédié"
        },
        {
            icon: Tag,
            title: "Offres du Jour",
            description: "Jusqu'à -70%"
        }
    ]

    return (
        <section className="py-6">
            <div className="container px-4 mx-auto">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-8 justify-items-center">
                    {features.map((feature, index) => (
                        <div key={index} className="flex flex-col md:flex-row items-center gap-3 group cursor-pointer text-center md:text-left hover:scale-105 transition-transform duration-300">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-500 shadow-sm">
                                <feature.icon size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-xs md:text-sm text-gray-800">{feature.title}</h3>
                                <p className="text-[10px] md:text-xs text-gray-500 font-medium">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
