'use client'

import React from 'react'
import { Container } from '@/ui/Container'
import {
    Phone,
    Mail,
    MapPin,
    MessageSquare,
    ChevronRight,
    Send,
    Facebook,
    Instagram,
    Twitter,
    Youtube
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function ContactPage() {
    return (
        <main className="bg-[#f8f9fb] min-h-screen">
            {/* Header */}
            <div className="bg-[#1B1F3B] py-24 relative overflow-hidden text-center">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
                    style={{ backgroundImage: `url('https://res.cloudinary.com/dgro5x4h8/image/upload/v1768669738/pattern_2_kln9c6.png')`, backgroundSize: 'cover' }} />
                <Container className="relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter mb-6"
                    >
                        Contactez-<span className="text-primary italic">nous</span>
                    </motion.h1>
                    <p className="text-gray-400 max-w-xl mx-auto text-lg font-medium">
                        Notre équipe d'experts est à votre écoute pour toute demande d'information, conseil technique ou assistance.
                    </p>
                </Container>
            </div>

            <section className="py-20">
                <Container>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                        {/* Contact Form */}
                        <div className="lg:col-span-8">
                            <div className="bg-white rounded-[3rem] p-12 border border-gray-100 shadow-sm">
                                <h2 className="text-2xl font-black text-[#1B1F3B] uppercase tracking-tighter mb-10">Envoyez-nous un message</h2>

                                <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Nom Complet</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Abdoulaye Diop"
                                            className="h-16 bg-gray-50 rounded-2xl border border-gray-100 px-6 outline-none focus:border-primary focus:bg-white transition-all text-sm font-bold"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Email</label>
                                        <input
                                            type="email"
                                            placeholder="Ex: abdoulaye@example.com"
                                            className="h-16 bg-gray-50 rounded-2xl border border-gray-100 px-6 outline-none focus:border-primary focus:bg-white transition-all text-sm font-bold"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2 md:col-span-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Sujet</label>
                                        <select className="h-16 bg-gray-50 rounded-2xl border border-gray-100 px-6 outline-none focus:border-primary focus:bg-white transition-all text-sm font-bold appearance-none">
                                            <option>Conseil Achat</option>
                                            <option>Suivi de commande</option>
                                            <option>Service Après-Vente</option>
                                            <option>Autre demande</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-2 md:col-span-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Message</label>
                                        <textarea
                                            rows={6}
                                            placeholder="Dites-nous comment nous pouvons vous aider..."
                                            className="bg-gray-50 rounded-3xl border border-gray-100 p-6 outline-none focus:border-primary focus:bg-white transition-all text-sm font-bold resize-none"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <button className="h-16 px-12 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-[#1B1F3B] transition-all shadow-xl shadow-primary/20 group">
                                            Envoyer le message <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Contact Sidebar */}
                        <div className="lg:col-span-4 flex flex-col gap-8">
                            <div className="bg-[#1B1F3B] rounded-[3rem] p-12 text-white shadow-2xl shadow-[#1B1F3B]/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2" />

                                <h3 className="text-xl font-black uppercase tracking-widest mb-10">Nos Coordonnées</h3>

                                <div className="flex flex-col gap-8">
                                    <ContactDetail icon={Phone} label="Téléphone" value="+221 33 800 00 00" />
                                    <ContactDetail icon={Mail} label="Email" value="contact@baraka.sn" />
                                    <ContactDetail icon={MapPin} label="Siège Social" value="123 Avenue Blaise Diagne, Dakar" />
                                    <ContactDetail icon={MessageSquare} label="WhatsApp" value="+221 77 000 00 00" />
                                </div>

                                <div className="mt-12 pt-12 border-t border-white/10 flex flex-col gap-6">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Suivez-nous</span>
                                    <div className="flex gap-4">
                                        <SocialIcon icon={Facebook} />
                                        <SocialIcon icon={Instagram} />
                                        <SocialIcon icon={Twitter} />
                                        <SocialIcon icon={Youtube} />
                                    </div>
                                </div>
                            </div>

                            {/* Work Hours */}
                            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm">
                                <h3 className="text-sm font-black text-[#1B1F3B] uppercase tracking-widest mb-6">Heures d'ouverture</h3>
                                <div className="flex flex-col gap-4">
                                    <HourRow day="Lun - Ven" hours="09:00 - 19:30" />
                                    <HourRow day="Samedi" hours="10:00 - 18:00" />
                                    <HourRow day="Dimanche" hours="Fermé" isClosed />
                                </div>
                            </div>
                        </div>

                    </div>
                </Container>
            </section>
        </main>
    )
}

function ContactDetail({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shrink-0">
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
                <span className="text-sm font-bold text-white">{value}</span>
            </div>
        </div>
    )
}

function SocialIcon({ icon: Icon }: { icon: any }) {
    return (
        <a href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all">
            <Icon className="w-5 h-5" />
        </a>
    )
}

function HourRow({ day, hours, isClosed }: { day: string, hours: string, isClosed?: boolean }) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <span className="text-xs font-bold text-gray-400">{day}</span>
            <span className={cn("text-xs font-black uppercase tracking-tight", isClosed ? "text-red-500" : "text-[#1B1F3B]")}>{hours}</span>
        </div>
    )
}
