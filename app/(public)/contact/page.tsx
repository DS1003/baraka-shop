'use client'

import React from 'react'
import { Mail, MapPin, Phone, Send, MessageSquare, Globe, ArrowRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ContactPage() {
    return (
        <div className="bg-white min-h-screen">
            {/* Immersive Header */}
            <div className="relative py-24 md:py-32 bg-black overflow-hidden flex items-center justify-center">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -mr-40 -mt-40" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] -ml-20 -mb-20" />

                <div className="container px-4 mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white/80 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-white/10">
                            <MessageSquare size={14} /> Support 24/7
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black text-white mb-6 tracking-tighter leading-none">Parlons <span className="text-primary italic">Shop.</span></h1>
                        <p className="text-gray-400 font-medium max-w-xl mx-auto text-sm md:text-lg">
                            Besoin d'un conseil expert ou d'assistance ? Notre équipe basée à Dakar est prête à vous répondre.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="container px-4 mx-auto -mt-16 md:-mt-24 relative z-20 pb-32">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* Fast Contacts Side */}
                    <div className="lg:col-span-1 space-y-6">
                        {[
                            { icon: MapPin, label: 'Siège Social', val: 'Plateau, Avenue Pompidou, Dakar', color: 'text-blue-500', bg: 'bg-blue-50' },
                            { icon: Phone, label: 'Téléphone', val: '+221 33 800 00 00', color: 'text-primary', bg: 'bg-orange-50' },
                            { icon: Mail, label: 'Contact Email', val: 'hello@baraka.sn', color: 'text-indigo-500', bg: 'bg-indigo-50' },
                        ].map((item, idx) => (
                            <motion.div
                                key={item.label}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-50 group hover:border-black transition-all"
                            >
                                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:bg-black group-hover:text-white", item.bg, item.color)}>
                                    <item.icon size={24} />
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{item.label}</div>
                                <div className="text-lg font-black text-gray-900 leading-tight">{item.val}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Contact Form Main */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-10 md:p-16 rounded-[3.5rem] shadow-2xl shadow-black/5 border border-gray-100 h-full"
                        >
                            <div className="mb-12">
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-4">Envoyez un message.</h2>
                                <p className="text-gray-400 font-medium">Réponse garantie sous 2 heures ouvrables.</p>
                            </div>

                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Prénom & Nom</label>
                                        <input type="text" className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-5 px-6 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none" placeholder="Cheikh Anta Diop" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Adresse Email</label>
                                        <input type="email" className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-5 px-6 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none" placeholder="cheikh@univ-dakar.sn" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Sujet de votre demande</label>
                                    <select className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-5 px-6 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none appearance-none">
                                        <option>Support Technique</option>
                                        <option>Suivi de Commande</option>
                                        <option>Devenir Partenaire</option>
                                        <option>Autre Demande</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Votre Message</label>
                                    <textarea rows={5} className="w-full bg-gray-50 border-2 border-transparent rounded-[2rem] py-5 px-6 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none resize-none" placeholder="Comment pouvons-nous vous aider aujourd'hui ?" />
                                </div>

                                <div className="pt-6">
                                    <button className="w-full bg-black text-white py-6 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-black/20 hover:bg-primary transition-all flex items-center justify-center gap-3 active:scale-95 group">
                                        Envoyer ma Demande <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>

                </div>
            </div>
        </div>
    )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ')
}
