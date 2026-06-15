'use client'

import React from 'react'
import { Container } from '@/ui/Container'
import Image from 'next/image'
import { ShieldCheck, Users, Globe, Target, Award, Rocket, CheckCircle2, Zap, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSiteLogos } from '@/lib/hooks/useSiteLogos'

export default function AboutPage() {
    const { headerLogo, favicon } = useSiteLogos()

    return (
        <main className="bg-[#f8f9fb] min-h-screen pb-32">
            {/* Hero Section */}
            <div className="bg-[#1B1F3B] pt-24 pb-32 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: `url('https://res.cloudinary.com/dgro5x4h8/image/upload/v1768669738/pattern_2_kln9c6.png')`, backgroundSize: '400px' }} />
                
                {/* Gradient Blob */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none" />

                <Container className="relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="flex flex-col gap-8"
                        >
                            <div className="flex items-center gap-4">
                                {favicon && <img src={favicon} alt="Icon" className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-[0_0_15px_rgba(255,165,0,0.5)]" />}
                                <div className="w-12 h-1 bg-primary rounded-full" />
                                <span className="text-primary font-black text-xs uppercase tracking-[0.3em]">Notre Histoire</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter leading-[0.9]">
                                L'Excellence <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-yellow-300 drop-shadow-sm">High-Tech</span> <br /> au Sénégal.
                            </h1>
                            <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-xl font-medium">
                                Depuis plus d'une décennie, Baraka Shop s'impose comme la référence absolue en matière de distribution de produits électroniques premium.
                            </p>
                            
                            <div className="flex items-center gap-6 pt-4 bg-white/5 w-fit p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                                <div className="flex -space-x-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="w-12 h-12 rounded-full border-2 border-[#1B1F3B] bg-gray-800 overflow-hidden relative">
                                            <Image src={`https://i.pravatar.cc/150?img=${i + 15}`} alt="Customer" fill className="object-cover" />
                                        </div>
                                    ))}
                                    <div className="w-12 h-12 rounded-full border-2 border-[#1B1F3B] bg-primary flex items-center justify-center text-white font-black text-xs relative z-10">
                                        +15k
                                    </div>
                                </div>
                                <div className="flex flex-col pr-4">
                                    <div className="flex items-center gap-1 text-yellow-400">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star key={star} className="w-4 h-4 fill-current" />
                                        ))}
                                    </div>
                                    <span className="text-white text-sm font-bold mt-1">Avis Clients Vérifiés</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                            className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/20 group border border-white/10"
                        >
                            <Image 
                                src="https://images.unsplash.com/photo-1550009158-9efff6c97364?q=80&w=2000&auto=format&fit=crop" 
                                alt="Baraka Shop Tech" 
                                fill 
                                className="object-cover group-hover:scale-110 transition-transform duration-[1.5s]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1B1F3B] via-[#1B1F3B]/40 to-transparent opacity-80" />
                            
                            {/* Floating Logo Badge */}
                            <motion.div 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="absolute bottom-8 left-8 right-8 flex items-center justify-between"
                            >
                                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl flex items-center gap-4 shadow-2xl">
                                    {headerLogo ? (
                                        <div className="bg-white p-2.5 rounded-xl">
                                            <img src={headerLogo} alt="Logo" className="h-6 md:h-8 w-auto object-contain" />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white">
                                            <Award className="w-6 h-6" />
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-white font-black text-lg">Leader N°1</div>
                                        <div className="text-primary text-[10px] uppercase tracking-[0.2em] font-black">Au Sénégal</div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </Container>
            </div>

            {/* Overlapping Stats */}
            <Container className="relative z-20 -mt-12 mb-12">
                <motion.div 
                    initial={{ y: 40, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-6 md:p-10 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-100"
                >
                    <StatItem value="15k+" label="Clients Satisfaits" />
                    <StatItem value="10+" label="Années d'Expertise" />
                    <StatItem value="5000+" label="Produits en Stock" />
                    <StatItem value="24/7" label="Support Client" />
                </motion.div>
            </Container>

            {/* Partner Brands Marquee */}
            <div className="mb-32">
                <Container className="mb-8">
                    <h3 className="text-center text-sm font-black text-gray-400 uppercase tracking-[0.3em]">Nos Partenaires Officiels</h3>
                </Container>
                <BrandMarquee />
            </div>

            <Container className="flex flex-col gap-24">
                {/* Mission & Vision */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <ValueCard icon={Target} title="Notre Mission" desc="Démocratiser l'accès aux dernières innovations technologiques mondiales tout en garantissant un service d'exception à chaque étape." delay={0} />
                    <ValueCard icon={Globe} title="Notre Vision" desc="Devenir le leader incontesté du e-commerce High-Tech en Afrique de l'Ouest, porté par la confiance, l'innovation et la qualité." delay={0.2} />
                    <ValueCard icon={ShieldCheck} title="Nos Valeurs" desc="Authenticité des produits, intégrité dans nos conseils et innovation continue sont au cœur de chaque interaction avec vous." delay={0.4} />
                </div>

                {/* Team Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                    <motion.div 
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="order-2 lg:order-1 flex flex-col gap-8"
                    >
                        <div className="flex items-center gap-4">
                            <Users className="w-8 h-8 text-primary" />
                            <span className="text-primary font-black text-xs uppercase tracking-[0.3em]">Notre Équipe</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-[#1B1F3B] uppercase tracking-tighter leading-[0.95]">
                            Des <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">passionnés</span> à votre écoute.
                        </h2>
                        <p className="text-gray-500 text-xl leading-relaxed font-medium">
                            Chez Baraka Shop, nous ne vendons pas seulement des produits, nous vous accompagnons dans votre transformation numérique.
                        </p>
                        <ul className="flex flex-col gap-5 mt-4">
                            {[
                                "Des conseillers spécialisés par rayon",
                                "Un service après-vente réactif et compétent",
                                "Des techniciens certifiés pour la maintenance"
                            ].map((item, i) => (
                                <motion.li 
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    viewport={{ once: true }}
                                    className="flex items-center gap-5 p-4 rounded-2xl hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-lg transition-all"
                                >
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <span className="font-bold text-gray-800 text-lg">{item}</span>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="order-1 lg:order-2 relative aspect-[4/5] rounded-[3rem] overflow-hidden bg-white shadow-2xl group border-[8px] border-white"
                    >
                        <Image 
                            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000&auto=format&fit=crop" 
                            alt="Baraka Shop Team" 
                            fill 
                            className="object-cover group-hover:scale-110 transition-transform duration-[2s] ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1B1F3B]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </motion.div>
                </div>

                {/* Quality Commitment */}
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-[#1B1F3B] rounded-[2.5rem] md:rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden shadow-2xl border border-white/10"
                >
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-primary/30 to-orange-500/10 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/20 blur-[100px] rounded-full -translate-x-1/3 translate-y-1/3 pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-16 md:gap-24">
                        <div className="flex-1 text-center md:text-left">
                            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8">
                                <Award className="w-5 h-5 text-primary" />
                                <span className="text-white text-xs font-black uppercase tracking-widest">Garantie Officielle</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 leading-[0.9]">
                                L'Engagement <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Qualité Baraka</span>
                            </h2>
                            <p className="text-gray-300 text-xl leading-relaxed mb-10 max-w-2xl font-medium">
                                Nous sélectionnons rigoureusement nos fournisseurs et testons chaque gamme de produits avant sa mise en rayon. C'est cet engagement profond qui nous permet de vous offrir des garanties officielles sur l'ensemble de notre catalogue.
                            </p>
                            <button className="bg-primary hover:bg-primary/80 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all shadow-xl shadow-primary/30 hover:-translate-y-1">
                                Découvrir nos garanties
                            </button>
                        </div>
                        <div className="w-full md:w-[400px] flex flex-col gap-6">
                            {[
                                { icon: ShieldCheck, title: "100% Original", desc: "Produits certifiés authentiques" },
                                { icon: Zap, title: "Livraison Express", desc: "Partout au Sénégal en 24/48h" },
                                { icon: Rocket, title: "SAV Premium", desc: "Prise en charge prioritaire" }
                            ].map((feature, idx) => (
                                <motion.div 
                                    key={idx}
                                    whileHover={{ scale: 1.02, x: -10 }}
                                    className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[1.5rem] flex items-center gap-5 shadow-xl cursor-pointer"
                                >
                                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                                        <feature.icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <div className="font-black text-xl text-white mb-1">{feature.title}</div>
                                        <div className="text-gray-400 text-sm font-medium">{feature.desc}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </Container>
        </main>
    )
}

function BrandMarquee() {
    const brands = [
        "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
        "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg",
        "https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg",
        "https://upload.wikimedia.org/wikipedia/commons/1/18/Dell_logo_2016.svg",
        "https://upload.wikimedia.org/wikipedia/commons/b/b8/Lenovo_logo_2015.svg",
        "https://upload.wikimedia.org/wikipedia/commons/1/17/Logitech_logo.svg",
        "https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg"
    ];

    return (
        <div className="w-full overflow-hidden bg-white py-10 border-y border-gray-100 relative shadow-sm">
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
            <motion.div 
                className="flex gap-24 items-center w-max"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ ease: "linear", duration: 40, repeat: Infinity }}
            >
                {[...brands, ...brands, ...brands, ...brands].map((logo, i) => (
                    <img key={i} src={logo} alt="Brand" className="h-8 md:h-10 w-auto opacity-30 hover:opacity-100 hover:scale-110 grayscale hover:grayscale-0 transition-all duration-500 cursor-pointer object-contain" />
                ))}
            </motion.div>
        </div>
    )
}

function ValueCard({ icon: Icon, title, desc, delay }: { icon: any, title: string, desc: string, delay: number }) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            viewport={{ once: true }}
            className="bg-white rounded-[2rem] p-8 lg:p-10 border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 group relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[80px] -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-700" />
            
            <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center text-[#1B1F3B] mb-8 group-hover:bg-primary group-hover:text-white transition-colors duration-500 relative z-10">
                <Icon className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-[#1B1F3B] uppercase tracking-tight mb-5 relative z-10">{title}</h3>
            <p className="text-gray-500 text-base leading-relaxed font-medium relative z-10">{desc}</p>
        </motion.div>
    )
}

function StatItem({ value, label }: { value: string, label: string }) {
    return (
        <div className="flex flex-col items-center justify-center text-center px-4 hover:scale-105 transition-transform">
            <span className="text-4xl md:text-5xl font-black text-[#1B1F3B] tracking-tighter mb-3">{value}</span>
            <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">{label}</span>
        </div>
    )
}
