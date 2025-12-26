'use client'

import React from 'react'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export default function PromoGrid() {
    return (
        <section className="py-12">
            <div className="container px-4 mx-auto space-y-8">

                {/* Large Main Banner - Audio Focus */}
                <div className="relative w-full rounded-[2.5rem] overflow-hidden bg-[#F4F4F4] min-h-[350px] md:min-h-[450px] flex flex-col md:flex-row items-center group cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500">
                    <div className="flex-1 p-8 md:p-20 text-center md:text-left z-10">
                        <span className="text-orange-500 font-bold uppercase tracking-[0.2em] text-xs mb-4 block">Audio Premium</span>
                        <h2 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 leading-[0.9] tracking-tighter">
                            Pure <br /> Sound.
                        </h2>
                        <p className="text-gray-500 mb-8 max-w-sm font-medium">Découvrez la réduction de bruit active nouvelle génération à -50% aujourd'hui.</p>
                        <button className="bg-black text-white hover:bg-orange-500 font-bold py-4 px-10 rounded-full uppercase tracking-wide transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center gap-2 mx-auto md:mx-0">
                            Shopper <ArrowRight size={18} />
                        </button>
                    </div>
                    {/* Artistic Product Image */}
                    <div className="flex-1 relative w-full h-[300px] md:h-full">
                        <Image
                            src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1000&auto=format&fit=crop"
                            alt="Headphones"
                            fill
                            className="object-contain object-center scale-90 md:scale-110 md:translate-x-[-10%] group-hover:scale-125 group-hover:rotate-6 transition-transform duration-700 ease-out"
                        />
                    </div>
                </div>

                {/* Grid of 4 Promo Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Card 1 - Pink/Creative */}
                    <div className="bg-[#FFE5E8] rounded-[2rem] p-8 relative overflow-hidden h-[380px] group cursor-pointer hover:shadow-xl transition-shadow duration-300">
                        <span className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Nouveau</span>
                        <h3 className="text-2xl font-black mt-4 text-gray-900 leading-tight">iPad Pro <br />Creative</h3>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">Dès 290.000 F</p>
                        <div className="absolute -bottom-10 right-0 w-3/4 h-3/4">
                            <Image
                                src="https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=600"
                                alt="iPad"
                                fill
                                className="object-contain object-bottom group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500"
                            />
                        </div>
                    </div>

                    {/* Card 2 - Blue/Accessory */}
                    <div className="bg-[#E3F2FD] rounded-[2rem] p-8 relative overflow-hidden h-[380px] group cursor-pointer hover:shadow-xl transition-shadow duration-300">
                        <span className="bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Grosse Promo</span>
                        <h3 className="text-2xl font-black mt-4 text-gray-900 leading-tight">Sonos <br />Move 2</h3>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">-25% Off</p>
                        <div className="absolute bottom-5 -right-5 w-3/4 h-3/5">
                            <Image
                                src="https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=600"
                                alt="Speaker"
                                fill
                                className="object-contain object-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500"
                            />
                        </div>
                    </div>

                    {/* Card 3 - Purple/Wearable */}
                    <div className="bg-[#F3E5F5] rounded-[2rem] p-8 relative overflow-hidden h-[380px] group cursor-pointer hover:shadow-xl transition-shadow duration-300">
                        <span className="bg-purple-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Weekend Deal</span>
                        <h3 className="text-2xl font-black mt-4 text-gray-900 leading-tight">Apple <br />Watch</h3>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">Carte Cadeau +</p>
                        <div className="absolute bottom-0 right-[-10%] w-4/5 h-3/5">
                            <Image
                                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600"
                                alt="Watch"
                                fill
                                className="object-contain object-center group-hover:scale-110 transition-transform duration-500"
                            />
                        </div>
                    </div>

                    {/* Card 4 - Indigo/Mobile */}
                    <div className="bg-[#E8EAF6] rounded-[2rem] p-8 relative overflow-hidden h-[380px] group cursor-pointer hover:shadow-xl transition-shadow duration-300">
                        <span className="bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Top Vente</span>
                        <h3 className="text-2xl font-black mt-4 text-gray-900 leading-tight">iPhone <br />15 Pro</h3>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">Stock Limité</p>
                        <div className="absolute bottom-0 right-0 w-3/4 h-3/4">
                            <Image
                                src="https://images.unsplash.com/photo-1592899677712-a170135c97f5?auto=format&fit=crop&q=80&w=600"
                                alt="Phone"
                                fill
                                className="object-contain object-bottom group-hover:-translate-y-4 group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                    </div>
                </div>

            </div>
        </section>
    )
}
