'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Container } from '@/ui/Container'
import { Logo } from '@/ui/Logo'
import { useSiteLogos } from '@/lib/hooks/useSiteLogos'
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, Youtube, ArrowRight } from 'lucide-react'

export function Footer() {
    const { footerLogo } = useSiteLogos()
    return (
        <footer className="relative bg-[#0A0B14] text-white pt-20 pb-10 overflow-hidden border-t border-white/5">
            {/* Background Pattern */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: 'url("https://res.cloudinary.com/dgro5x4h8/image/upload/v1768669738/pattern_2_kln9c6.png")',
                    backgroundSize: '400px',
                    backgroundRepeat: 'repeat'
                }}
            />

            {/* Glossy Gradient Overlay */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-primary/10 blur-[120px] rounded-full opacity-50 pointer-events-none" />

            <Container className="relative z-10">
                <div className="flex flex-col items-center text-center">
                    {/* Brand Section */}
                    <div className="mb-16 md:mb-20 flex flex-col items-center max-w-2xl px-4">
                        <Link href="/" className="mb-8 flex flex-col items-center group cursor-pointer">
                            {/* Pictogramme en haut avec rotation complète (720 degrés) */}
                            <img 
                                src="/logo-icon.png" 
                                alt="Baraka Shop Icon" 
                                className="h-14 md:h-16 w-auto object-contain transition-transform duration-1000 ease-in-out group-hover:rotate-[720deg]" 
                            />
                            {/* Texte en bas */}
                            <img 
                                src="/logo-text.png" 
                                alt="Baraka Shop Text" 
                                className="h-10 md:h-14 w-auto object-contain mt-2" 
                            />
                        </Link>
                        <p className="text-gray-400 text-sm md:text-base leading-relaxed tracking-wide">
                            Votre destination premium pour l'électronique de pointe au Sénégal.
                            Nous nous engageons à vous offrir le meilleur de la technologie avec un service d'excellence et une expérience d'achat inégalée.
                        </p>
                    </div>

                    {/* Middle Navigation Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-24 mb-16 md:mb-24 w-full px-6">
                        {/* Column 1 */}
                        <div className="flex flex-col items-center">
                            <h3 className="text-xs uppercase tracking-[0.4em] text-primary font-black mb-8">Navigation</h3>
                            <ul className="flex flex-col gap-5 text-sm md:text-[15px] font-medium text-gray-400">
                                <FooterLink href="/boutique">Boutique</FooterLink>
                                <FooterLink href="/promotions">Nos Promotions</FooterLink>
                                <FooterLink href="/nouveautes">Nouveautés</FooterLink>
                                <FooterLink href="/boutique">Meilleures Ventes</FooterLink>
                            </ul>
                        </div>

                        {/* Column 2 */}
                        <div className="flex flex-col items-center">
                            <h3 className="text-xs uppercase tracking-[0.4em] text-primary font-black mb-8">Support Client</h3>
                            <ul className="flex flex-col gap-5 text-sm md:text-[15px] font-medium text-gray-400">
                                <FooterLink href="/about">À Propos</FooterLink>
                                <FooterLink href="/contact">Nous Contacter</FooterLink>
                                <FooterLink href="/faq">Questions Fréquentes</FooterLink>
                                <FooterLink href="/terms">Mentions Légales</FooterLink>
                            </ul>
                        </div>

                        {/* Column 3 - Centered Contact */}
                        <div className="flex flex-col items-center sm:col-span-2 lg:col-span-1">
                            <h3 className="text-xs uppercase tracking-[0.4em] text-primary font-black mb-8">Nous Trouver</h3>
                            <div className="flex flex-col gap-6 items-center">
                                <button className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    <span>Sacré-Cœur 3, Dakar, Sénégal</span>
                                </button>
                                <button className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors">
                                    <Phone className="w-4 h-4 text-primary" />
                                    <span>+221 33 800 00 00</span>
                                </button>
                                <a href="https://wa.me/221770000000" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors">
                                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary fill-current" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                    </svg>
                                    <span>WhatsApp: +221 77 000 00 00</span>
                                </a>
                                <button className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors">
                                    <Mail className="w-4 h-4 text-primary" />
                                    <span>contact@baraka.sn</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Social Section */}
                    <div className="flex flex-col items-center mb-16">
                        <div className="flex gap-10 items-center">
                            <SocialLink href="https://www.instagram.com/baraka.sn/" icon={Instagram} />
                            <SocialLink href="#" icon={Facebook} />
                            <SocialLink href="#" icon={Twitter} />
                            <SocialLink href="#" icon={Youtube} />
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="w-full pt-8 pb-4 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
                        <p className="text-[10px] md:text-xs text-gray-500 tracking-wider font-medium" suppressHydrationWarning={true}>
                            © {new Date().getFullYear()} <span className="text-gray-300 font-bold">Baraka Shop Senegal</span>. Tous droits réservés.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Paiement Sécurisé</span>
                            <div className="flex items-center gap-2">
                                <div className="bg-white border border-white/10 px-3 py-1.5 rounded flex items-center justify-center hover:-translate-y-0.5 transition-transform cursor-pointer">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4 w-auto object-contain" />
                                </div>
                                <div className="bg-white border border-white/10 px-3 py-1.5 rounded flex items-center justify-center hover:-translate-y-0.5 transition-transform cursor-pointer">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Visa_Logo.svg" alt="Visa" className="h-3.5 w-auto object-contain" />
                                </div>
                                <div className="bg-white border border-white/10 px-3 py-1.5 rounded flex items-center justify-center hover:-translate-y-0.5 transition-transform cursor-pointer">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4 w-auto object-contain" />
                                </div>
                                <div className="bg-white border border-white/10 px-3 py-1.5 rounded flex items-center justify-center hover:-translate-y-0.5 transition-transform cursor-pointer">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-4 w-auto object-contain" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </footer>
    )
}

function SocialLink({ href, icon: Icon }: { href: string; icon: any }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative"
        >
            <div className="absolute -inset-2 bg-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <Icon className="w-6 h-6 text-gray-500 group-hover:text-primary transition-all duration-300 relative z-10" />
        </a>
    )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <li>
            <Link href={href} className="group relative py-1 inline-block">
                <span className="relative z-10 transition-colors group-hover:text-white">
                    {children}
                </span>
                <span className="absolute left-1/2 -bottom-1 w-0 h-[1.5px] bg-primary transition-all duration-300 group-hover:w-full group-hover:left-0" />
            </Link>
        </li>
    )
}
