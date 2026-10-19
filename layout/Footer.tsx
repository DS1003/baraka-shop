'use client'

import React from 'react'
import Link from 'next/link'
import { Container } from '@/ui/Container'
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, Youtube } from 'lucide-react'

export function Footer() {
    return (
        <footer className="relative bg-[#0A0B14] text-white pt-10 sm:pt-14 md:pt-20 pb-6 sm:pb-8 md:pb-10 overflow-hidden border-t border-white/5">
            {/* Background Pattern */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: 'url("https://res.cloudinary.com/dgro5x4h8/image/upload/v1768669738/pattern_2_kln9c6.png")',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center'
                }}
            />

            {/* Glossy Gradient Overlay */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-primary/10 blur-[120px] rounded-full opacity-50 pointer-events-none" />

            <Container className="relative z-10">
                <div className="flex flex-col items-center">
                    {/* Brand Section */}
                    <div className="mb-8 sm:mb-12 md:mb-16 flex flex-col items-center max-w-xl mx-auto px-4 text-center">
                        <Link href="/" className="mb-4 sm:mb-6 flex flex-col items-center group cursor-pointer">
                            {/* Pictogramme */}
                            <img 
                                src="/logo-icon.png" 
                                alt="Baraka Shop Icon" 
                                className="h-10 sm:h-12 md:h-16 w-auto object-contain transition-transform duration-1000 ease-in-out group-hover:rotate-[720deg]" 
                            />
                            {/* Texte */}
                            <img 
                                src="/logo-text.png" 
                                alt="Baraka Shop Text" 
                                className="h-7 sm:h-9 md:h-12 w-auto object-contain mt-1.5" 
                            />
                        </Link>
                        <p className="text-gray-400 text-xs sm:text-sm md:text-base leading-relaxed tracking-wide max-w-md">
                            Votre destination premium pour l'électronique de pointe au Sénégal. 
                            Le meilleur de la technologie avec un service d'excellence.
                        </p>
                    </div>

                    {/* Navigation & Contact Grid: 2 columns on mobile, 3 on desktop */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12 lg:gap-16 mb-8 sm:mb-12 md:mb-16 w-full max-w-4xl mx-auto px-2 sm:px-4">
                        {/* Column 1: Navigation */}
                        <div className="flex flex-col items-start sm:items-center pl-2 sm:pl-0">
                            <h3 className="text-[11px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.35em] text-primary font-black mb-3 sm:mb-6 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block sm:hidden" />
                                Navigation
                            </h3>
                            <ul className="flex flex-col gap-2.5 sm:gap-4 text-xs sm:text-sm md:text-[15px] font-medium text-gray-400">
                                <FooterLink href="/boutique">Boutique</FooterLink>
                                <FooterLink href="/promotions">Nos Promotions</FooterLink>
                                <FooterLink href="/nouveautes">Nouveautés</FooterLink>
                                <FooterLink href="/boutique">Meilleures Ventes</FooterLink>
                            </ul>
                        </div>

                        {/* Column 2: Support Client */}
                        <div className="flex flex-col items-start sm:items-center pl-2 sm:pl-0">
                            <h3 className="text-[11px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.35em] text-primary font-black mb-3 sm:mb-6 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block sm:hidden" />
                                Support Client
                            </h3>
                            <ul className="flex flex-col gap-2.5 sm:gap-4 text-xs sm:text-sm md:text-[15px] font-medium text-gray-400">
                                <FooterLink href="/about">À Propos</FooterLink>
                                <FooterLink href="/contact">Nous Contacter</FooterLink>
                                <FooterLink href="/faq">Questions Fréquentes</FooterLink>
                                <FooterLink href="/legal">Mentions Légales</FooterLink>
                            </ul>
                        </div>

                        {/* Column 3: Nous Trouver (spans 2 cols on mobile, 1 col on desktop) */}
                        <div className="col-span-2 md:col-span-1 flex flex-col items-center pt-2 sm:pt-0">
                            <h3 className="text-[11px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.35em] text-primary font-black mb-3 sm:mb-6 text-center">
                                Nous Trouver
                            </h3>
                            <div className="flex flex-col gap-2 sm:gap-2.5 w-full max-w-sm">
                                <a 
                                    href="https://maps.google.com/?q=90+Rue+Av.+K.+Bourgi,+Dakar,+Sénégal" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-primary/40 hover:bg-white/[0.06] active:scale-[0.98] transition-all text-xs sm:text-sm text-gray-300 group"
                                >
                                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                        <MapPin className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-left line-clamp-1 leading-snug">90 Rue Av. K. Bourgi, Dakar</span>
                                </a>

                                <a 
                                    href="tel:+221338223422" 
                                    className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-primary/40 hover:bg-white/[0.06] active:scale-[0.98] transition-all text-xs sm:text-sm text-gray-300 group"
                                >
                                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                        <Phone className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="font-semibold tracking-wide">+221 33 822 34 22</span>
                                </a>

                                <a 
                                    href="https://wa.me/221765149898" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/[0.12] active:scale-[0.98] transition-all text-xs sm:text-sm text-gray-200 group"
                                >
                                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                        </svg>
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-[9.5px] text-emerald-400 font-bold uppercase tracking-wider">WhatsApp Direct</span>
                                        <span className="font-semibold tracking-wide">+221 76 514 98 98</span>
                                    </div>
                                </a>

                                <a 
                                    href="mailto:contact@baraka.sn" 
                                    className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-primary/40 hover:bg-white/[0.06] active:scale-[0.98] transition-all text-xs sm:text-sm text-gray-300 group"
                                >
                                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                        <Mail className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="font-semibold tracking-wide truncate">contact@baraka.sn</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Social Media Row */}
                    <div className="flex flex-col items-center mb-6 sm:mb-8">
                        <div className="flex gap-3 sm:gap-4 items-center">
                            <SocialLink href="https://www.instagram.com/baraka.sn/" icon={Instagram} label="Instagram" />
                            <SocialLink href="#" icon={Facebook} label="Facebook" />
                            <SocialLink href="#" icon={Twitter} label="Twitter / X" />
                            <SocialLink href="#" icon={Youtube} label="YouTube" />
                        </div>
                    </div>

                    {/* Bottom Copyright */}
                    <div className="w-full pt-6 pb-2 border-t border-white/5 flex items-center justify-center px-4">
                        <p className="text-[10px] sm:text-xs text-gray-500 tracking-wider font-medium text-center" suppressHydrationWarning={true}>
                            © {new Date().getFullYear()} <span className="text-gray-300 font-bold">Baraka Shop Senegal</span>. Tous droits réservés.
                        </p>
                    </div>
                </div>
            </Container>
        </footer>
    )
}

function SocialLink({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/40 hover:bg-white/[0.08] active:scale-90 transition-all duration-200"
        >
            <Icon className="w-4 h-4" />
        </a>
    )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <li>
            <Link href={href} className="group relative py-0.5 inline-block text-gray-400 hover:text-white transition-colors">
                <span className="relative z-10 transition-colors">
                    {children}
                </span>
                <span className="absolute left-0 -bottom-0.5 w-0 h-[1.5px] bg-primary transition-all duration-200 group-hover:w-full" />
            </Link>
        </li>
    )
}
