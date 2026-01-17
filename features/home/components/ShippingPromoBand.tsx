'use client'

import React from 'react'
import { Container } from '@/ui/Container'
import { Ticket, Truck, CreditCard, RotateCcw } from 'lucide-react'

export function ShippingPromoBand() {
    return (
        <section className="py-12 bg-white">
            <Container>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Free Shipping Promo */}
                    <div className="relative overflow-hidden rounded-[2rem] bg-[#1B1F3B] p-6 md:p-10 flex flex-col justify-between min-h-[220px] group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />

                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                <Truck className="w-6 h-6" />
                            </div>
                            <h3 className="text-white text-2xl font-black uppercase tracking-tight">Livraison Express Gratuite</h3>
                        </div>

                        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                            <p className="text-gray-400 text-sm max-w-[200px] text-center sm:text-left">Sur toutes les commandes de plus de <span className="text-white font-bold">500.000 CFA</span></p>
                            <div className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-white text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                                Code: EXPRESS24
                            </div>
                        </div>
                    </div>

                    {/* Quality Guarantee Promo */}
                    <div className="relative overflow-hidden rounded-[2rem] bg-gray-50 border border-gray-100 p-6 md:p-10 flex flex-col justify-between min-h-[220px] group">
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2" />

                        <div className="relative z-10 flex flex-col gap-4 items-center sm:items-start">
                            <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-[#1B1F3B] shadow-sm">
                                <Ticket className="w-6 h-6" />
                            </div>
                            <h3 className="text-[#1B1F3B] text-xl md:text-2xl font-black uppercase tracking-tight text-center sm:text-left">Garantie & Sérénité</h3>
                        </div>

                        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                            <p className="text-gray-500 text-sm max-w-[200px] text-center sm:text-left">Service après-vente officiel et retours sous <span className="text-[#1B1F3B] font-black">7 jours</span></p>
                            <button className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest group-hover:gap-4 transition-all whitespace-nowrap">
                                Nos services <div className="p-1.5 rounded-full bg-primary text-white"><CreditCard className="w-3 h-3" /></div>
                            </button>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    )
}
