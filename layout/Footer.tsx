import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Container } from '@/ui/Container'
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, Youtube, ArrowRight } from 'lucide-react'

export function Footer() {
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
                        <Link href="/" className="mb-8 block">
                            <div className="relative w-[240px] md:w-[320px] h-[80px] md:h-[110px]">
                                <Image
                                    src="https://baraka.sn/wp-content/uploads/2025/10/logo-contour-blanc-01-scaled-e1761208403239.png"
                                    alt="Baraka Shop"
                                    fill
                                    className="object-contain"
                                />
                            </div>
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
                                <FooterLink href="/boutique">Nouveautés</FooterLink>
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
                            <SocialLink href="#" icon={Instagram} />
                            <SocialLink href="#" icon={Facebook} />
                            <SocialLink href="#" icon={Twitter} />
                            <SocialLink href="#" icon={Youtube} />
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="w-full pt-12 border-t border-white/5 flex flex-col items-center gap-8">
                        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                            <Image src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" width={80} height={20} className=" hover:opacity-100 hover:grayscale-0 transition-all cursor-pointer" />
                            <Image src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" width={50} height={20} className=" hover:opacity-100 hover:grayscale-0 transition-all cursor-pointer" />
                            <Image src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" width={40} height={20} className=" hover:opacity-100 hover:grayscale-0 transition-all cursor-pointer" />
                        </div>
                        <p className="text-[10px] md:text-xs text-gray-600 tracking-widest uppercase font-bold">
                            © {new Date().getFullYear()} <span className="text-gray-400">Baraka Shop Senegal</span>. Crafted for Excellence.
                        </p>
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
