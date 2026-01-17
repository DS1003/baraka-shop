import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Container } from '@/ui/Container'
import { Logo } from '@/ui/Logo'
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, Youtube, ArrowRight } from 'lucide-react'

export function Footer() {
    return (
        <footer className="relative bg-black text-white pt-20 pb-10 overflow-hidden">
            {/* Background Pattern */}
            <div
                className="absolute inset-0 opacity-[0.4] pointer-events-none"
                style={{
                    backgroundImage: 'url("https://res.cloudinary.com/dgro5x4h8/image/upload/v1768669738/pattern_2_kln9c6.png")',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat'
                }}
            />
            <Container className="relative z-10">
                {/* Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    {/* Brand & Mission */}
                    <div className="flex flex-col gap-10">
                        <a href="/" className="inline-block">
                            <div className="relative w-[300px] h-[100px]">
                                <Image
                                    src="https://baraka.sn/wp-content/uploads/2025/10/logo-contour-blanc-01-scaled-e1761208403239.png"
                                    alt="Baraka Shop"
                                    fill
                                    className="object-contain object-left"
                                />
                            </div>
                        </a>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                            Votre destination premium pour l'électronique de pointe au Sénégal. Nous nous engageons à vous offrir le meilleur de la technologie avec un service d'excellence.
                        </p>
                        <div className="flex gap-4">
                            <SocialLink href="#" icon={Facebook} />
                            <SocialLink href="#" icon={Instagram} />
                            <SocialLink href="#" icon={Youtube} />
                            <SocialLink href="#" icon={Twitter} />
                        </div>
                    </div>

                    {/* Quick Access */}
                    <div>
                        <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
                            <span className="w-8 h-[2px] bg-primary"></span>
                            Navigation
                        </h3>
                        <ul className="flex flex-col gap-4 text-sm text-gray-400">
                            <FooterLink href="/boutique">Boutique</FooterLink>
                            <FooterLink href="/promotions">Nos Promotions</FooterLink>
                            <FooterLink href="/boutique">Nouveautés</FooterLink>
                            <FooterLink href="/boutique">Meilleures Ventes</FooterLink>
                            <FooterLink href="/marques">Marques Partenaires</FooterLink>
                        </ul>
                    </div>

                    {/* Customer Support */}
                    <div>
                        <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
                            <span className="w-8 h-[2px] bg-primary"></span>
                            Aide & Support
                        </h3>
                        <ul className="flex flex-col gap-4 text-sm text-gray-400">
                            <FooterLink href="/about">À Propos</FooterLink>
                            <FooterLink href="/track-order">Suivre ma commande</FooterLink>
                            <FooterLink href="/faq">Questions Fréquentes</FooterLink>
                            <FooterLink href="/contact">Nous Contacter</FooterLink>
                            <FooterLink href="/terms">CGV & Mentions Légales</FooterLink>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
                            <span className="w-8 h-[2px] bg-primary"></span>
                            Contactez-nous
                        </h3>
                        <div className="flex flex-col gap-6">
                            <ContactItem
                                icon={MapPin}
                                title="Adresse"
                                content="123 Avenue Blaise Diagne, Dakar, Sénégal"
                            />
                            <ContactItem
                                icon={Phone}
                                title="Téléphone"
                                content="+221 33 800 00 00"
                            />
                            <ContactItem
                                icon={Mail}
                                title="Email"
                                content="contact@baraka.sn"
                            />
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-xs text-gray-500">
                        © {new Date().getFullYear()} <span className="text-white font-medium">Baraka Shop</span>. Tous droits réservés.
                    </p>
                    <div className="flex items-center gap-6">
                        <Image src="/payment-methods.png" alt="Paiement" width={300} height={40} className="grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" />
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
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all duration-300"
        >
            <Icon className="w-5 h-5" />
        </a>
    )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <li>
            <Link href={href} className="group flex items-center gap-2 hover:text-white transition-colors">
                <ArrowRight className="w-3 h-3 text-primary opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                {children}
            </Link>
        </li>
    )
}

function ContactItem({ icon: Icon, title, content }: { icon: any; title: string, content: string }) {
    return (
        <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">{title}</span>
                <span className="text-sm text-gray-300">{content}</span>
            </div>
        </div>
    )
}
