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
    ArrowRight,
    MapPin,
    ShieldCheck,
    CreditCard,
    Globe
} from 'lucide-react'

export default function Footer() {
    const LOGO_BARAKA = "https://darkslateblue-narwhal-655051.hostingersite.com/wp-content/uploads/2025/10/logo-contour-blanc-01-scaled-e1761208403239.png"

    return (
        <footer className="w-full bg-[#050505] text-white pt-32 pb-12 overflow-hidden relative">
            {/* Background Decorative Element - Huge Text 2025 Style */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 select-none pointer-events-none opacity-[0.02] whitespace-nowrap">
                <span className="text-[30vw] font-black italic tracking-tighter uppercase leading-none">
                    BARAKA SHOP
                </span>
            </div>

            <div className="w-full px-8 md:px-16 lg:px-24 mx-auto relative z-10">
                {/* Header Section: Logo & Newsletter */}
                <div className="flex flex-col lg:flex-row justify-between items-start gap-16 pb-24 border-b border-white/10">
                    <div className="flex flex-col gap-8 max-w-sm">
                        <Link href="/" className="relative w-72 h-16 group">
                            <Image
                                src={LOGO_BARAKA}
                                alt="Baraka Shop"
                                fill
                                className="object-contain object-left group-hover:scale-105 transition-transform duration-500"
                                priority
                            />
                        </Link>
                        <p className="text-gray-500 text-[13px] font-medium leading-relaxed uppercase tracking-widest">
                            L'excellence technologique au Sénégal. <br />
                            Une expérience d'achat épurée, une expertise garantie.
                        </p>
                        <div className="flex gap-4">
                            {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                                <a key={i} href="#" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300">
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 w-full lg:max-w-xl">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary mb-8">Newsletter Privée</h3>
                        <p className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase mb-10 leading-none">
                            Rejoignez l'élite <br /> <span className="text-primary">Technologique.</span>
                        </p>
                        <form className="relative group">
                            <input
                                type="email"
                                placeholder="VOTRE ADRESSE EMAIL"
                                className="w-full bg-transparent border-b-2 border-white/10 py-6 px-2 text-xl font-black tracking-tighter uppercase focus:border-primary outline-none transition-all placeholder:text-white/10"
                            />
                            <button className="absolute right-0 bottom-6 text-primary hover:text-white transition-colors group-hover:translate-x-2 duration-300">
                                <ArrowRight size={32} />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Main Navigation Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 py-24 border-b border-white/10">
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-10">Univers</h4>
                        <ul className="space-y-4">
                            {['Informatique', 'Téléphonie', 'Gaming', 'Image & Son', 'Objets Connectés'].map(item => (
                                <li key={item}>
                                    <Link href="#" className="text-[12px] font-black uppercase tracking-widest hover:text-primary transition-colors">{item}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-10">Services</h4>
                        <ul className="space-y-4">
                            {['Configurateur PC', 'Montage Expert', 'SAV Baraka', 'Reprise Client', 'Financement'].map(item => (
                                <li key={item}>
                                    <Link href="#" className="text-[12px] font-black uppercase tracking-widest hover:text-primary transition-colors">{item}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-10">Aide</h4>
                        <ul className="space-y-4">
                            {['Suivi commande', 'Nous Contacter', 'FAQ', 'Boutiques', 'Livraison'].map(item => (
                                <li key={item}>
                                    <Link href="#" className="text-[12px] font-black uppercase tracking-widest hover:text-primary transition-colors">{item}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="col-span-2 hidden lg:block">
                        <div className="bg-white/5 p-12 rounded-[2rem] border border-white/10 relative overflow-hidden group hover:border-primary/50 transition-colors">
                            <div className="absolute top-0 right-0 p-8">
                                <Globe size={40} className="text-primary/20 group-hover:rotate-45 transition-transform duration-1000" />
                            </div>
                            <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary mb-6">Service Client</h4>
                            <p className="text-4xl font-black italic tracking-tighter uppercase mb-4">+221 33 800 00 00</p>
                            <p className="text-xs font-black uppercase tracking-widest text-gray-500">
                                Disponible de 09h à 19h. Appel non surtaxé.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar: Legal & Payments */}
                <div className="flex flex-col lg:flex-row justify-between items-center gap-10 pt-16">
                    <div className="flex flex-col gap-2 items-center lg:items-start">
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">
                            © {new Date().getFullYear()} BARAKA SHOP SÉNÉGAL. LUXURY TECH EXPERIENCE.
                        </p>
                        <div className="flex gap-8 text-[9px] font-black text-gray-500 uppercase tracking-widest">
                            <Link href="#" className="hover:text-white transition-colors">Mentions Légales</Link>
                            <Link href="#" className="hover:text-white transition-colors">Confidentialité</Link>
                            <li>Gérer les cookies</li>
                        </div>
                    </div>

                    <div className="flex items-center gap-12 py-4 px-10 rounded-full border border-white/5 bg-white/[0.02]">
                        <span className="text-[9px] font-black text-gray-600 tracking-widest uppercase hidden md:block">Paiements sécurisés :</span>
                        <div className="flex items-center gap-8 opacity-40 hover:opacity-100 transition-opacity">
                            {['Wave', 'Orange', 'Free', 'Visa', 'Mastercard'].map(p => (
                                <span key={p} className="text-[11px] font-black tracking-tighter italic uppercase">{p}</span>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="text-[10px] font-black uppercase tracking-[0.4em] text-primary hover:text-white flex items-center gap-4 group"
                    >
                        RETOUR EN HAUT
                        <span className="w-10 h-px bg-primary group-hover:w-16 transition-all" />
                    </button>
                </div>
            </div>

            {/* Extreme Bottom Decoration */}
            <div className="mt-20 py-8 border-t border-white/5 w-full text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.8em] text-white/10 animate-pulse">Design by Baraka Creative x 2025</span>
            </div>
        </footer>
    )
}
