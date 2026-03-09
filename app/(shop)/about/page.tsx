'use client'

import React from 'react'
import { Container } from '@/ui/Container'
import Image from 'next/image'
import { ShieldCheck, Users, Globe, Target, Award, Rocket } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AboutPage() {
    return (
        <main className="bg-[#f8f9fb] min-h-screen">
            {/* Editorial Hero */}
            <div className="bg-[#1B1F3B] py-32 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
                    style={{ backgroundImage: `url('https://res.cloudinary.com/dgro5x4h8/image/upload/v1768669738/pattern_2_kln9c6.png')`, backgroundSize: '400px' }} />

                <Container className="relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex flex-col gap-8"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-px bg-primary" />
                                <span className="text-primary font-black text-[11px] uppercase tracking-[0.4em]">Notre Histoire</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9]">
                                L'Excellence <br /> <span className="text-primary">High-Tech</span> au Sénégal.
                            </h1>
                            <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-lg">
                                Depuis plus d'une décennie, Baraka Shop s'impose comme la référence en matière de distribution de produits électroniques premium à Dakar et dans toutes les régions.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative aspect-video rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl"
                        >
                            <div className="absolute inset-0 bg-[#1B1F3B] flex items-center justify-center">
                                <Rocket className="w-24 h-24 text-primary/20" strokeWidth={1} />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1B1F3B] to-transparent opacity-60" />
                            </div>
                        </motion.div>
                    </div>
                </Container>
            </div>

            <Container className="py-24">
                {/* Mission & Vision */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-32">
                    <ValueCard icon={Target} title="Notre Mission" desc="Démocratiser l'accès aux dernières innovations technologiques mondiales tout en garantissant un service d'exception." />
                    <ValueCard icon={Globe} title="Notre Vision" desc="Devenir le leader incontesté du e-commerce High-Tech en Afrique de l'Ouest, porté par la confiance et la qualité." />
                    <ValueCard icon={ShieldCheck} title="Nos Valeurs" desc="Authenticité, Intégrité et Innovation sont au cœur de chaque interaction avec nos clients et partenaires." />
                </div>

                {/* Content Sections */}
                <div className="flex flex-col gap-32">
                    {/* Founder Section Mock */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="relative aspect-square rounded-[4rem] overflow-hidden bg-white border border-gray-100 p-12">
                            <div className="w-full h-full bg-gray-50 rounded-[3rem] flex items-center justify-center text-gray-200">
                                <Users className="w-32 h-32" strokeWidth={1} />
                            </div>
                        </div>
                        <div className="flex flex-col gap-8">
                            <h2 className="text-4xl font-black text-[#1B1F3B] uppercase tracking-tighter">Une équipe de passionnés.</h2>
                            <p className="text-gray-500 text-lg leading-relaxed">
                                Chez Baraka Shop, nous ne vendons pas seulement des produits, nous accompagnons nos clients dans leur transformation numérique. Nos experts sont formés pour vous conseiller les meilleures solutions adaptées à vos besoins, qu'il s'agisse de setup gaming, de productivité professionnelle ou de création de contenu.
                            </p>
                            <div className="grid grid-cols-2 gap-8">
                                <StatItem value="15k+" label="Clients Satisfaits" />
                                <StatItem value="10ans" label="D'Expertise" />
                            </div>
                        </div>
                    </div>

                    {/* Quality Commitment */}
                    <div className="bg-[#1B1F3B] rounded-[4rem] p-16 md:p-24 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
                        <div className="relative z-10 flex flex-col items-center text-center gap-10">
                            <Award className="w-20 h-20 text-primary" strokeWidth={1} />
                            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter max-w-3xl">L'Engagement Qualité Baraka Shop</h2>
                            <p className="text-gray-400 text-lg max-w-2xl">
                                Nous sélectionnons rigoureusement nos fournisseurs et testons chaque gamme de produits avant sa mise en rayon. C'est cet engagement qui nous permet de vous offrir des garanties officielles sur l'ensemble de notre catalogue.
                            </p>
                        </div>
                    </div>
                </div>
            </Container>
        </main>
    )
}

function ValueCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="bg-white rounded-[2.5rem] p-12 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-[#1B1F3B] mb-8 group-hover:bg-primary group-hover:text-white transition-all">
                <Icon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-[#1B1F3B] uppercase tracking-tight mb-4">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
        </div>
    )
}

function StatItem({ value, label }: { value: string, label: string }) {
    return (
        <div className="flex flex-col">
            <span className="text-4xl font-black text-primary tracking-tighter">{value}</span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</span>
        </div>
    )
}
