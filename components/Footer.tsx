'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
    Facebook,
    Instagram,
    Twitter,
    Youtube,
    Phone,
    Mail,
    Trophy,
    ArrowRight,
    Smartphone
} from 'lucide-react'

export default function Footer() {
    return (
        <footer className="bg-[#f0f2f5] pt-12">
            <div className="container px-4 mx-auto">

                {/* 1. TOP FOOTER: BRANDS & NEWSLETTER (LDLC Style) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Brands Box */}
                    <div className="bg-white rounded-lg p-10 shadow-sm border border-gray-100 relative">
                        <div className="flex items-center gap-4 mb-10">
                            <h3 className="text-[14px] font-black uppercase tracking-widest text-gray-800">NOS SHOPS</h3>
                            <span className="text-[11px] font-bold text-gray-400 italic">Ils nous ont élu !</span>
                        </div>
                        <div className="grid grid-cols-4 gap-8 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all">
                            {['Apple', 'Lego', 'Logitech', 'Razer', 'Corsair', 'Sony', 'Samsung', 'MSI'].map((b) => (
                                <div key={b} className="h-8 relative">
                                    <Image
                                        src={`https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png`} // Placeholder
                                        alt={b}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Newsletter & Socials Box */}
                    <div className="bg-white rounded-lg p-10 shadow-sm border border-gray-100 relative">
                        <div className="flex items-center gap-4 mb-6">
                            <h3 className="text-[14px] font-black uppercase tracking-widest text-gray-800">NOUS REJOINDRE</h3>
                            <span className="text-[11px] font-bold text-gray-400 italic">On est drôles et super sympas !</span>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex-1">
                                <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-4 text-center md:text-left">Newsletter Baraka</p>
                                <form className="flex gap-2">
                                    <input
                                        type="email"
                                        placeholder="Votre email"
                                        className="flex-1 bg-gray-50 border border-gray-200 py-3 px-6 rounded-md text-[11px] font-bold tracking-widest outline-none focus:border-primary transition-all"
                                    />
                                    <button className="bg-primary text-white px-6 rounded-md hover:bg-black transition-colors font-black uppercase text-[10px] tracking-widest">
                                        OK
                                    </button>
                                </form>
                            </div>
                            <div className="md:border-l md:border-gray-100 md:pl-8">
                                <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-4 text-center md:text-left">Sur les réseaux</p>
                                <div className="flex gap-3 justify-center md:justify-start">
                                    {[Facebook, Twitter, Youtube, Instagram].map((Icon, i) => (
                                        <a key={i} href="#" className="w-10 h-10 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center hover:bg-primary transition-all shadow-lg">
                                            <Icon size={16} />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. MAIN NAV FOOTER (LDLC Screen Dark Style) */}
                <div className="bg-[#002b5c] rounded-t-[2rem] p-12 lg:p-20 text-white relative overflow-hidden">
                    {/* Use dark orange/brown if strict user branding, but screen shows dark blue. 
                        Let's use a very dark version of the brand or keep the structure. 
                        User said "same UI but orange". So I'll use a deep professional grey/black instead of LDLC blue to stay premium. */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]" />

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-20">
                        {/* Column 1 */}
                        <div>
                            <h4 className="text-[13px] font-black uppercase tracking-[0.2em] mb-10 text-white border-b border-white/10 pb-4">QUI SOMMES NOUS ?</h4>
                            <ul className="space-y-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                {['Notre Histoire', 'CGV / Avis clients', 'Données personnelles et Cookies', 'Gérer mes cookies', 'Mentions légales'].map(l => (
                                    <li key={l}><Link href="#" className="hover:text-primary transition-colors">{l}</Link></li>
                                ))}
                            </ul>
                        </div>

                        {/* Column 2 */}
                        <div>
                            <h4 className="text-[13px] font-black uppercase tracking-[0.2em] mb-10 text-white border-b border-white/10 pb-4">NOUS REJOINDRE</h4>
                            <ul className="space-y-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                {['Vendez sur Baraka', 'Recrutement', 'L\'École Baraka', 'Marketplace'].map(l => (
                                    <li key={l}><Link href="#" className="hover:text-primary transition-colors">{l}</Link></li>
                                ))}
                            </ul>
                        </div>

                        {/* Column 3 */}
                        <div>
                            <h4 className="text-[13px] font-black uppercase tracking-[0.2em] mb-10 text-white border-b border-white/10 pb-4">BESOIN D'AIDE ?</h4>
                            <ul className="space-y-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                {['Questions fréquentes', 'Modes de livraison', 'Modes de règlement', 'Garanties et Pack Confort', 'Demander un retour'].map(l => (
                                    <li key={l}><Link href="#" className="hover:text-primary transition-colors">{l}</Link></li>
                                ))}
                            </ul>
                        </div>

                        {/* Column 4: Contact & Award */}
                        <div className="flex flex-col items-center md:items-start text-center md:text-left">
                            <h4 className="text-[13px] font-black uppercase tracking-[0.2em] mb-10 text-white border-b border-white/10 pb-4 w-full">NOUS CONTACTER</h4>

                            <div className="bg-primary/10 border border-primary/20 p-6 rounded-xl mb-8 flex items-center gap-4 group cursor-pointer hover:bg-primary/20 transition-all">
                                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <p className="text-[14px] font-black text-white italic">04 27 46 60 00</p>
                                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Appel non surtaxé</p>
                                </div>
                            </div>

                            <div className="relative w-full aspect-[4/3] max-w-[200px] mb-6">
                                <div className="absolute inset-0 bg-white p-6 rounded-2xl flex flex-col items-center justify-center transform group hover:scale-105 transition-transform shadow-2xl">
                                    <Trophy size={40} className="text-primary mb-2 shadow-sm" />
                                    <p className="text-[10px] font-black text-black leading-tight uppercase tracking-tighter">ÉLU SERVICE CLIENT <br /> <span className="text-primary">DE L'ANNÉE 2026</span></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Features Strip (Black Style) */}
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12 mt-20 pt-12 border-t border-white/5 opacity-50">
                        <div className="flex items-center gap-6">
                            <span className="text-3xl font-black italic tracking-tighter text-white">12x</span>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">PAIEMENT JUSQU'EN 10/12X</span>
                                <span className="text-[8px] font-bold text-gray-500 uppercase">Dès 250€ d'achat.</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <Smartphone size={32} />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">LIVRAISON PARTOUT</span>
                                <span className="text-[8px] font-bold text-gray-500 uppercase">Au Sénégal et dans la sous-région.</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-8 relative">
                                <Image src="https://upload.wikimedia.org/wikipedia/commons/e/ea/Mastercard-logo.svg" alt="Mastercard" fill className="object-contain" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">LIVRAISON ULTRA-RAPIDE</span>
                                <span className="text-[8px] font-bold text-gray-500 uppercase">Dès le lendemain !</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LDLC Bottom Logo & Final Legal */}
                <div className="py-20 flex flex-col items-center">
                    <Link href="/" className="relative w-40 h-10 opacity-30 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
                        <Image
                            src="https://darkslateblue-narwhal-655051.hostingersite.com/wp-content/uploads/2025/11/WhatsApp-Image-2025-08-30-at-22.56.22-2.png"
                            alt="Baraka Shop"
                            fill
                            className="object-contain"
                        />
                    </Link>
                    <p className="mt-8 text-[8px] font-black text-gray-400 uppercase tracking-[0.4em]">HAUTE-TECHNOLOGIE EXPÉRIENCE</p>
                </div>
            </div>
        </footer>
    )
}
