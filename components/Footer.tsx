'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, Send } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="bg-black text-gray-300 border-t border-gray-800 pt-16 pb-8">
            <div className="container px-4 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Info */}
                    <div className="space-y-6">
                        <Link href="/" className="block relative w-48 h-16">
                            <Image
                                src="https://darkslateblue-narwhal-655051.hostingersite.com/wp-content/uploads/2025/10/logo-contour-blanc-01-scaled-e1761208403239.png"
                                alt="Baraka Shop"
                                fill
                                className="object-contain object-left"
                            />
                        </Link>
                        <p className="text-sm leading-relaxed text-gray-400">
                            Votre destination numéro 1 pour la technologie au Sénégal. Qualité, authenticité et service client irréprochable.
                            Découvrez le meilleur du High-Tech aux meilleurs prix.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all transform hover:scale-110">
                                <Facebook size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all transform hover:scale-110">
                                <Instagram size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-400 hover:text-white transition-all transform hover:scale-110">
                                <Twitter size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-white text-lg mb-6 relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-10 after:h-1 after:bg-primary">
                            Navigation
                        </h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/shop" className="hover:text-primary transition-colors flex items-center gap-2"><span>›</span> Boutique</Link></li>
                            <li><Link href="/shop?tag=deals" className="hover:text-primary transition-colors flex items-center gap-2"><span>›</span> Promotions</Link></li>
                            <li><Link href="/about" className="hover:text-primary transition-colors flex items-center gap-2"><span>›</span> À Propos</Link></li>
                            <li><Link href="/contact" className="hover:text-primary transition-colors flex items-center gap-2"><span>›</span> Contact</Link></li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h4 className="font-bold text-white text-lg mb-6 relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-10 after:h-1 after:bg-primary">
                            Service Client
                        </h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/faq" className="hover:text-primary transition-colors flex items-center gap-2"><span>›</span> FAQ</Link></li>
                            <li><Link href="/shipping" className="hover:text-primary transition-colors flex items-center gap-2"><span>›</span> Livraison & Retours</Link></li>
                            <li><Link href="/terms" className="hover:text-primary transition-colors flex items-center gap-2"><span>›</span> Conditions Générales</Link></li>
                            <li><Link href="/privacy" className="hover:text-primary transition-colors flex items-center gap-2"><span>›</span> Confidentialité</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="font-bold text-white text-lg mb-6 relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-10 after:h-1 after:bg-primary">
                            Newsletter
                        </h4>
                        <p className="text-sm text-gray-400 mb-4">
                            Inscrivez-vous pour recevoir nos meilleures offres directement dans votre boîte mail.
                        </p>
                        <form className="relative">
                            <input
                                type="email"
                                placeholder="Votre email..."
                                className="w-full bg-gray-800 border border-gray-700 text-white py-3 px-4 rounded-lg focus:outline-none focus:border-primary pr-12"
                            />
                            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-md hover:bg-orange-600 transition-colors">
                                <Send size={16} />
                            </button>
                        </form>

                        <div className="mt-6 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Phone size={14} className="text-primary" /> +221 33 800 00 00
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Mail size={14} className="text-primary" /> contact@baraka.sn
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm gap-4">
                    <p className="text-gray-500">© {new Date().getFullYear()} Baraka.sn. Tous droits réservés.</p>
                    <div className="flex items-center gap-4 bg-white/5 p-2 rounded-lg">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-5 opacity-70" />
                        <div className="w-[1px] h-4 bg-gray-600"></div>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-5 opacity-70" />
                        <div className="w-[1px] h-4 bg-gray-600"></div>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-5 opacity-70" />
                        <div className="w-[1px] h-4 bg-gray-600"></div>
                        <span className="text-xs font-bold text-orange-500">Orange Money</span>
                        <div className="w-[1px] h-4 bg-gray-600"></div>
                        <span className="text-xs font-bold text-blue-400">Wave</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
