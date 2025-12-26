'use client'

import { Mail, MapPin, Phone, Send } from 'lucide-react'

export default function ContactPage() {
    return (
        <div className="bg-background min-h-screen py-20">
            <div className="container px-4 mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold mb-4">Contactez-nous</h1>
                    <p className="text-muted-foreground max-w-xl mx-auto">
                        Une question sur un produit ? Besoin d'aide pour une commande ? Notre équipe est là pour vous aider 7j/7.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
                    {/* Contact Info */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="p-6 rounded-2xl bg-secondary border border-border">
                            <h3 className="font-bold text-lg mb-6">Nos Coordonnées</h3>
                            <ul className="space-y-6">
                                <li className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <span className="block font-medium">Adresse</span>
                                        <span className="text-sm text-muted-foreground">123 Avenue Blaise Diagne, Dakar Plateau, Sénégal</span>
                                    </div>
                                </li>
                                <li className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <span className="block font-medium">Téléphone</span>
                                        <span className="text-sm text-muted-foreground">+221 33 800 00 00</span>
                                    </div>
                                </li>
                                <li className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <span className="block font-medium">Email</span>
                                        <span className="text-sm text-muted-foreground">contact@baraka.sn</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="p-8 rounded-2xl bg-card border border-border shadow-sm">
                            <h3 className="font-bold text-xl mb-6">Envoyez-nous un message</h3>
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Prénom</label>
                                        <input type="text" className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" placeholder="Votre prénom" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Nom</label>
                                        <input type="text" className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" placeholder="Votre nom" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <input type="email" className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" placeholder="vous@exemple.com" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Message</label>
                                    <textarea rows={5} className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none" placeholder="Comment pouvons-nous vous aider ?" />
                                </div>

                                <button className="btn btn-primary w-full md:w-auto px-8 py-3 rounded-lg flex items-center justify-center gap-2">
                                    Envoyer le message <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
