'use client'

import React, { useState } from 'react'
import { Container } from '@/ui/Container'
import Image from 'next/image'
import Link from 'next/link'
import {
    ShieldCheck,
    Users,
    Globe,
    Target,
    Award,
    Rocket,
    CheckCircle2,
    Zap,
    Star,
    ArrowRight,
    ChevronRight,
    MapPin,
    Clock,
    Phone,
    Headphones,
    Truck,
    Sparkles,
    PackageCheck,
    Store,
    CreditCard,
    BadgeCheck,
    Building2,
    HeartHandshake
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useSiteLogos } from '@/lib/hooks/useSiteLogos'

export default function AboutPage() {
    const { headerLogo, loaderLogo } = useSiteLogos()
    const [activeMilestone, setActiveMilestone] = useState(3)

    return (
        <main className="bg-[#f8f9fb] min-h-screen text-[#1B1F3B] overflow-x-hidden selection:bg-primary/20">

            {/* Breadcrumbs Section */}
            <div className="bg-white border-b border-gray-100 py-3 relative z-20">
                <Container>
                    <div className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400">
                        <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
                        <ChevronRight className="w-3 h-3 text-gray-300" />
                        <span className="text-[#1B1F3B] font-black">À Propos de Baraka Shop</span>
                    </div>
                </Container>
            </div>

            {/* Hero Section Flagship 2026 */}
            <section className="bg-[#1B1F3B] pt-16 md:pt-24 pb-28 md:pb-36 relative overflow-hidden">
                {/* Modern Geometric Tech Grid & Ambient Glows */}
                <div 
                    className="absolute inset-0 opacity-[0.04] pointer-events-none"
                    style={{ 
                        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                        backgroundSize: '32px 32px'
                    }} 
                />
                
                {/* Vibrant ambient blurred spheres */}
                <div className="absolute -top-32 right-0 w-[600px] md:w-[900px] h-[600px] md:h-[900px] bg-gradient-to-bl from-primary/25 via-orange-500/10 to-transparent blur-[140px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 -left-40 w-[500px] md:w-[700px] h-[500px] md:h-[700px] bg-blue-600/15 blur-[130px] rounded-full pointer-events-none" />

                <Container className="relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                        
                        {/* Hero Text */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="lg:col-span-7 flex flex-col gap-6 md:gap-8 text-center lg:text-left items-center lg:items-start"
                        >
                            {/* Eyebrow Pill */}
                            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl shadow-lg shadow-black/10">
                                {loaderLogo ? (
                                    <img src={loaderLogo} alt="Logo" className="w-5 h-5 object-contain" />
                                ) : (
                                    <Sparkles className="w-4 h-4 text-primary" />
                                )}
                                <span className="text-white text-[10px] md:text-xs font-black uppercase tracking-[0.25em]">
                                    Leader High-Tech au Sénégal
                                </span>
                            </div>

                            {/* Main Title */}
                            <h1 className="text-3xl sm:text-5xl md:text-6xl xl:text-7xl font-black text-white uppercase tracking-tight leading-[1.05]">
                                L&apos;Excellence <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-amber-300 drop-shadow-sm">
                                    Technologique
                                </span> <br />
                                Au Cœur de Dakar.
                            </h1>

                            {/* Subtitle */}
                            <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl font-medium">
                                Depuis plus de 10 ans, <strong className="text-white font-bold">Baraka Shop (Baraka Electronique)</strong> sélectionne le meilleur de la technologie mondiale pour particuliers et entreprises au Sénégal. Produits 100% authentiques, garanties constructeur et conseils d&apos;experts.
                            </p>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 w-full sm:w-auto">
                                <Link
                                    href="/boutique"
                                    className="w-full sm:w-auto h-13 px-8 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 flex items-center justify-center gap-3"
                                >
                                    Explorer la Boutique <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link
                                    href="/boutiques"
                                    className="w-full sm:w-auto h-13 px-8 bg-white/10 hover:bg-white/15 text-white border border-white/15 rounded-2xl font-black text-xs uppercase tracking-widest transition-all backdrop-blur-lg flex items-center justify-center gap-2.5 hover:-translate-y-0.5"
                                >
                                    <Store className="w-4 h-4 text-primary" /> Nos Boutiques
                                </Link>
                            </div>

                            {/* Trust Rating Strip */}
                            <div className="flex items-center gap-5 pt-4 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 backdrop-blur-md">
                                <div className="flex items-center gap-1 text-amber-400">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} className="w-4 h-4 fill-current" />
                                    ))}
                                </div>
                                <div className="h-4 w-px bg-white/15" />
                                <div className="text-left">
                                    <div className="text-white text-xs font-black tracking-wide">+15 000 Clients Heureux</div>
                                    <div className="text-gray-400 text-[10px] font-semibold">Noté 4.9/5 sur Google Reviews Dakar</div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Hero Interactive Visual */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                            className="lg:col-span-5 relative"
                        >
                            {/* Decorative ambient card frame */}
                            <div className="relative aspect-[4/3] sm:aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/40 border border-white/15 group">
                                <Image
                                    src="https://images.unsplash.com/photo-1550009158-9efff6c97364?q=80&w=1600&auto=format&fit=crop"
                                    alt="Baraka Shop Tech Showcase"
                                    fill
                                    priority
                                    className="object-cover group-hover:scale-105 transition-transform duration-[1.8s] ease-out"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1B1F3B] via-[#1B1F3B]/30 to-transparent" />

                                {/* Floating Top-Right Badge: Authenticité */}
                                <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2.5 rounded-2xl flex items-center gap-2.5 shadow-xl">
                                    <BadgeCheck className="w-5 h-5 text-green-400 shrink-0" />
                                    <div>
                                        <div className="text-white text-[11px] font-black uppercase tracking-wider">100% Original</div>
                                        <div className="text-gray-300 text-[9px] font-medium">Scellé Constructeur</div>
                                    </div>
                                </div>

                                {/* Floating Bottom Glass Showcase Card */}
                                <div className="absolute bottom-6 left-6 right-6 bg-white/15 backdrop-blur-2xl border border-white/25 p-5 rounded-3xl flex items-center justify-between shadow-2xl">
                                    <div className="flex items-center gap-4">
                                        {headerLogo ? (
                                            <div className="bg-white p-2.5 rounded-2xl shadow-md shrink-0">
                                                <img src={headerLogo} alt="Baraka Logo" className="h-7 w-auto object-contain" />
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md shrink-0">
                                                B
                                            </div>
                                        )}
                                        <div>
                                            <div className="text-white font-black text-base md:text-lg leading-tight">Baraka Shop</div>
                                            <div className="text-primary text-[10px] uppercase tracking-[0.2em] font-black flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Dakar, Sandaga & En Ligne
                                            </div>
                                        </div>
                                    </div>
                                    <div className="hidden sm:flex flex-col text-right">
                                        <span className="text-white text-xs font-bold">SAV & Garantie</span>
                                        <span className="text-gray-300 text-[10px]">Service Direct</span>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Fast Delivery Badge */}
                            <motion.div
                                animate={{ y: [0, -6, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -bottom-5 -left-4 sm:-left-6 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 hidden sm:flex items-center gap-3 z-20"
                            >
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Truck className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-[#1B1F3B] font-black text-xs uppercase tracking-wide">Livraison 2-4h</div>
                                    <div className="text-gray-500 text-[10px] font-medium">Partout à Dakar</div>
                                </div>
                            </motion.div>
                        </motion.div>

                    </div>
                </Container>
            </section>

            {/* Overlapping Stats Cards */}
            <Container className="relative z-30 -mt-14 md:-mt-16 mb-20">
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
                >
                    <StatCard
                        icon={Clock}
                        value="10+ Ans"
                        label="D'Expérience Métier"
                        description="Pionnier High-Tech à Dakar depuis plus d'une décennie."
                    />
                    <StatCard
                        icon={Users}
                        value="+15 000"
                        label="Clients Accompagnés"
                        description="Particuliers, étudiants, freelances et grandes entreprises."
                    />
                    <StatCard
                        icon={PackageCheck}
                        value="5 000+"
                        label="Produits Certifiés"
                        description="Stock réel et disponible immédiatement en magasin."
                    />
                    <StatCard
                        icon={Truck}
                        value="24/48h"
                        label="Livraison Sénégal"
                        description="Dakar en 2 à 4h, toutes les régions en 24 à 48h."
                    />
                </motion.div>
            </Container>

            {/* Official Brands Marquee */}
            <section className="mb-24">
                <Container className="mb-6 text-center">
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-gray-400">
                        Marques Mondiales Certifiées &amp; Distribuées
                    </span>
                </Container>
                <BrandMarquee />
            </section>

            {/* Interactive Timeline: L'Histoire de Baraka Shop */}
            <section className="py-16 md:py-24 bg-white border-y border-gray-100 mb-24 relative overflow-hidden">
                <Container>
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
                            <Building2 className="w-3.5 h-3.5" /> Notre Parcours
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-[#1B1F3B] uppercase tracking-tight">
                            L&apos;Aventure <span className="text-primary">Baraka Shop</span>
                        </h2>
                        <p className="text-gray-500 text-sm md:text-base font-medium mt-3">
                            D&apos;une petite boutique de passionnés à Sandaga au statut de référence incontournable de la tech au Sénégal.
                        </p>
                    </div>

                    {/* Timeline Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                        {milestones.map((m, index) => (
                            <motion.div
                                key={m.year}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => setActiveMilestone(index)}
                                className={`cursor-pointer p-6 sm:p-8 rounded-3xl border transition-all duration-300 relative flex flex-col justify-between gap-6 ${
                                    activeMilestone === index
                                        ? 'bg-[#1B1F3B] text-white border-[#1B1F3B] shadow-2xl shadow-[#1B1F3B]/20 scale-[1.02]'
                                        : 'bg-gray-50/70 hover:bg-white text-gray-700 border-gray-200/80 hover:shadow-lg'
                                }`}
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`text-2xl md:text-3xl font-black tracking-tight ${
                                            activeMilestone === index ? 'text-primary' : 'text-gray-400'
                                        }`}>
                                            {m.year}
                                        </span>
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                                            activeMilestone === index ? 'bg-primary text-white' : 'bg-gray-200/80 text-gray-600'
                                        }`}>
                                            <m.icon className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <h3 className={`text-lg font-black uppercase tracking-tight mb-2 ${
                                        activeMilestone === index ? 'text-white' : 'text-[#1B1F3B]'
                                    }`}>
                                        {m.title}
                                    </h3>
                                    <p className={`text-xs md:text-sm font-medium leading-relaxed ${
                                        activeMilestone === index ? 'text-gray-300' : 'text-gray-500'
                                    }`}>
                                        {m.description}
                                    </p>
                                </div>
                                <div className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                                    activeMilestone === index ? 'text-primary' : 'text-gray-400'
                                }`}>
                                    {m.badge}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* Why Choose Baraka (Piliers & Engagements) */}
            <section className="py-12 md:py-20 mb-20">
                <Container>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
                                <Award className="w-3.5 h-3.5" /> Pourquoi Nous ?
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-[#1B1F3B] uppercase tracking-tight">
                                Nos 6 Piliers d&apos;<span className="text-primary">Excellence</span>
                            </h2>
                            <p className="text-gray-500 text-sm md:text-base font-medium mt-2 max-w-xl">
                                Pourquoi plus de 15 000 clients et entreprises au Sénégal nous accordent leur confiance chaque jour.
                            </p>
                        </div>
                        <Link
                            href="/boutique"
                            className="hidden md:flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:text-[#1B1F3B] transition-colors"
                        >
                            Découvrir notre sélection <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        <PillarCard
                            icon={ShieldCheck}
                            number="01"
                            title="Produits 100% Authentiques"
                            desc="Chaque smartphone, ordinateur et accessoire provient directement des circuits officiels des marques. Zéro contrefaçon, emballages scellés d'origine."
                        />
                        <PillarCard
                            icon={WrenchIcon}
                            number="02"
                            title="Garantie & SAV Dédié à Dakar"
                            desc="Tous nos produits bénéficient de garanties constructeur transparentes. En cas de besoin, notre atelier technique local prend en charge vos appareils immédiatement."
                        />
                        <PillarCard
                            icon={Truck}
                            number="03"
                            title="Livraison Express & Sécurisée"
                            desc="Vos commandes livrées en 2 à 4 heures chrono à Dakar (Almadies, Plateau, Point E, etc.) et en 24/48h dans toutes les régions du Sénégal avec suivi rigoureux."
                        />
                        <PillarCard
                            icon={CreditCard}
                            number="04"
                            title="Paiement Simple & Flexible"
                            desc="Réglez à la livraison en espèces ou par Wave, Orange Money et carte bancaire. Vous vérifiez votre colis avant de régler."
                        />
                        <PillarCard
                            icon={Store}
                            number="05"
                            title="Boutiques Physiques à Dakar"
                            desc="Une vraie adresse pignon sur rue (Rue Av. K. Bourgi, Sandaga) où vous pouvez venir tester les appareils, poser vos questions et retirer vos commandes."
                        />
                        <PillarCard
                            icon={Headphones}
                            number="06"
                            title="Conseils d'Experts Personnalisés"
                            desc="Nos conseillers spécialisés sont disponibles par téléphone et WhatsApp pour vous guider vers la machine idéale selon vos besoins et votre budget."
                        />
                    </div>
                </Container>
            </section>

            {/* Quality Spotlight: Dark Banner */}
            <section className="mb-24">
                <Container>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-[#1B1F3B] rounded-3xl md:rounded-[3rem] p-8 sm:p-12 md:p-16 text-white relative overflow-hidden shadow-2xl border border-white/10"
                    >
                        {/* Glow spots */}
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-primary/30 to-amber-500/10 blur-[130px] rounded-full pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/15 blur-[100px] rounded-full pointer-events-none" />

                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
                            <div className="lg:col-span-7">
                                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-primary text-[10px] font-black uppercase tracking-widest mb-6">
                                    <Sparkles className="w-4 h-4" /> La Promesse Baraka
                                </div>
                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight leading-[1.05] mb-6">
                                    La Technologie de Pointe, <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
                                        Sans Aucun Compromis.
                                    </span>
                                </h2>
                                <p className="text-gray-300 text-sm md:text-base leading-relaxed font-medium mb-8 max-w-xl">
                                    Que vous soyez un professionnel créatif à la recherche d&apos;un MacBook surpuissant, une entreprise équipant ses collaborateurs ou un passionné de gaming, Baraka Shop vous garantit les meilleurs composants au juste prix.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <Link
                                        href="/boutique"
                                        className="h-12 px-8 bg-primary hover:bg-primary/90 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-primary/30 flex items-center gap-2"
                                    >
                                        Voir les Produits <ArrowRight className="w-4 h-4" />
                                    </Link>
                                    <Link
                                        href="/contact"
                                        className="h-12 px-6 bg-white/10 hover:bg-white/15 text-white border border-white/15 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2"
                                    >
                                        Contacter l&apos;Équipe
                                    </Link>
                                </div>
                            </div>

                            <div className="lg:col-span-5 flex flex-col gap-4">
                                {[
                                    {
                                        title: "Prise en main en boutique",
                                        desc: "Testez les écrans, claviers et configurations avant tout achat.",
                                        icon: CheckCircle2
                                    },
                                    {
                                        title: "Garantie officielle 1 an+",
                                        desc: "Pièces d'origine et assistance technique prioritaire.",
                                        icon: ShieldCheck
                                    },
                                    {
                                        title: "Devis pro & Facturation TVA",
                                        desc: "Solutions sur-mesure pour PME, ONG et institutions.",
                                        icon: Building2
                                    }
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl flex items-start gap-4 hover:bg-white/10 transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-sm mb-1">{item.title}</h4>
                                            <p className="text-gray-400 text-xs font-medium leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </Container>
            </section>

            {/* Real Customer Testimonials */}
            <section className="py-16 md:py-20 mb-20 bg-gray-50/70 border-y border-gray-100">
                <Container>
                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-3">
                            <Star className="w-3.5 h-3.5 fill-current" /> Témoignages
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-[#1B1F3B] uppercase tracking-tight">
                            Ce Que Disent <span className="text-primary">Nos Clients</span>
                        </h2>
                        <p className="text-gray-500 text-sm md:text-base font-medium mt-2">
                            Retours d&apos;expérience vérifiés de clients à Dakar et dans tout le Sénégal.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        <TestimonialCard
                            name="Mamadou Diop"
                            role="Directeur d'Agence"
                            location="Dakar, Almadies"
                            content="J'ai commandé 3 PC portables Dell pour mon équipe un mardi matin. Livrés dans l'après-midi au bureau avec factures conformes et garanties. Une réactivité impressionnante pour Dakar !"
                            rating={5}
                            date="Il y a 2 semaines"
                        />
                        <TestimonialCard
                            name="Aïssatou Sow"
                            role="Architecte d'Intérieur"
                            location="Dakar, Point E"
                            content="Je cherchais un MacBook Pro M3 très spécifique. Baraka l'avait en stock, scellé sous blister Apple. L'équipe m'a même aidée pour le transfert de données. Service 5 étoiles !"
                            rating={5}
                            date="Il y a 1 mois"
                        />
                        <TestimonialCard
                            name="Ibrahima Ndiaye"
                            role="Développeur Freelance"
                            location="Dakar, Plateau"
                            content="Client depuis 2018 à Sandaga, puis sur le site en ligne. Zéro mauvaise surprise, matériel 100% original. C'est la seule boutique tech où j'achète les yeux fermés."
                            rating={5}
                            date="Il y a 3 semaines"
                        />
                    </div>
                </Container>
            </section>

            {/* Physical Store & Location Showcase */}
            <section className="mb-24">
                <Container>
                    <div className="bg-white rounded-3xl md:rounded-[3rem] p-8 md:p-14 border border-gray-100 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                        <div className="lg:col-span-7 flex flex-col gap-6">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest w-fit">
                                <Store className="w-3.5 h-3.5" /> Pignon sur Rue
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-[#1B1F3B] uppercase tracking-tight">
                                Venez Nous Rencontrer <br />
                                <span className="text-primary">En Boutique à Dakar</span>
                            </h2>
                            <p className="text-gray-500 text-sm md:text-base font-medium leading-relaxed">
                                Préférez-vous voir et tester vos appareils avant d&apos;acheter ? Notre showroom principal au centre de Dakar vous accueille du lundi au dimanche avec nos experts techniques.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <div className="text-xs font-black text-[#1B1F3B] uppercase mb-0.5">Adresse Showroom</div>
                                        <div className="text-xs text-gray-500 font-medium">90 Rue Av. K. Bourgi, Sandaga, Dakar</div>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <div className="text-xs font-black text-[#1B1F3B] uppercase mb-0.5">Horaires d&apos;Ouverture</div>
                                        <div className="text-xs text-gray-500 font-medium">Lun - Sam : 08h00 - 18h30<br />Dim : 09h00 - 13h00</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 pt-3">
                                <Link
                                    href="/boutiques"
                                    className="h-12 px-7 bg-[#1B1F3B] hover:bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md flex items-center gap-2"
                                >
                                    <Store className="w-4 h-4" /> Voir Toutes les Boutiques
                                </Link>
                                <a
                                    href="https://wa.me/221338223422"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-12 px-7 bg-green-500 hover:bg-green-600 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md flex items-center gap-2"
                                >
                                    <Phone className="w-4 h-4" /> Échanger sur WhatsApp
                                </a>
                            </div>
                        </div>

                        <div className="lg:col-span-5 relative aspect-[4/3] rounded-3xl overflow-hidden shadow-lg border border-gray-100">
                            <Image
                                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop"
                                alt="Baraka Shop Team in Store"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1B1F3B]/80 via-transparent to-transparent flex items-end p-6">
                                <div className="text-white">
                                    <div className="text-sm font-black uppercase">Conseillers &amp; Techniciens Dédiés</div>
                                    <div className="text-xs text-gray-300">Toujours à votre écoute pour vous orienter</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Final CTA Banner */}
            <section className="pb-24">
                <Container>
                    <div className="bg-gradient-to-r from-primary to-orange-500 rounded-3xl md:rounded-[3rem] p-10 md:p-16 text-white text-center relative overflow-hidden shadow-2xl shadow-primary/30">
                        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/15 rounded-full blur-2xl pointer-events-none" />
                        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-black/10 rounded-full blur-2xl pointer-events-none" />

                        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-6">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-widest">
                                <Rocket className="w-4 h-4" /> Passez à la Vitesse Supérieure
                            </div>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight leading-tight">
                                Prêt à Trouver Votre Prochain Appareil ?
                            </h2>
                            <p className="text-white/90 text-sm md:text-base font-medium max-w-xl">
                                Découvrez nos arrivages récents de smartphones, ordinateurs portables, accessoires et matériel bureautique au meilleur prix au Sénégal.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 w-full sm:w-auto">
                                <Link
                                    href="/boutique"
                                    className="w-full sm:w-auto h-13 px-8 bg-[#1B1F3B] hover:bg-[#1B1F3B]/90 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2.5"
                                >
                                    Visiter le Catalogue <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link
                                    href="/contact"
                                    className="w-full sm:w-auto h-13 px-8 bg-white text-[#1B1F3B] hover:bg-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2.5"
                                >
                                    Nous Poser une Question
                                </Link>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

        </main>
    )
}

function WrenchIcon(props: any) {
    return (
        <Award {...props} />
    )
}

function StatCard({ icon: Icon, value, label, description }: { icon: any, value: string, label: string, description: string }) {
    return (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
            <div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-5 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <Icon className="w-6 h-6" />
                </div>
                <div className="text-3xl sm:text-4xl font-black text-[#1B1F3B] tracking-tight mb-1">
                    {value}
                </div>
                <div className="text-xs font-black uppercase tracking-wider text-primary mb-2">
                    {label}
                </div>
            </div>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
                {description}
            </p>
        </div>
    )
}

function PillarCard({ icon: Icon, number, title, desc }: { icon: any, number: string, title: string, desc: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[60px] -mr-4 -mt-4 transition-transform group-hover:scale-150 duration-500 pointer-events-none" />

            <div>
                <div className="flex items-center justify-between mb-6">
                    <div className="w-13 h-13 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[#1B1F3B] group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
                        <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black text-gray-200 group-hover:text-primary/30 transition-colors">
                        {number}
                    </span>
                </div>
                <h3 className="text-lg font-black text-[#1B1F3B] uppercase tracking-tight mb-3 group-hover:text-primary transition-colors">
                    {title}
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm font-medium leading-relaxed">
                    {desc}
                </p>
            </div>
        </motion.div>
    )
}

function TestimonialCard({ name, role, location, content, rating, date }: { name: string, role: string, location: string, content: string, rating: number, date: string }) {
    return (
        <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between gap-6">
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: rating }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">{date}</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed italic">
                    &ldquo;{content}&rdquo;
                </p>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="w-10 h-10 rounded-full bg-[#1B1F3B] text-white font-black text-xs flex items-center justify-center uppercase shrink-0">
                    {name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                    <div className="text-xs font-black text-[#1B1F3B] uppercase tracking-wide">{name}</div>
                    <div className="text-[10px] font-medium text-gray-500">{role} &bull; <span className="text-primary font-bold">{location}</span></div>
                </div>
            </div>
        </div>
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
        "https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg",
        "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"
    ]

    return (
        <div className="w-full overflow-hidden bg-white py-8 border-y border-gray-100 relative shadow-xs">
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
            <motion.div
                className="flex gap-20 items-center w-max"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ ease: "linear", duration: 35, repeat: Infinity }}
            >
                {[...brands, ...brands, ...brands, ...brands].map((logo, i) => (
                    <img
                        key={i}
                        src={logo}
                        alt="Marque Partenaire"
                        className="h-7 sm:h-9 w-auto opacity-35 hover:opacity-100 hover:scale-110 grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer object-contain"
                    />
                ))}
            </motion.div>
        </div>
    )
}

const milestones = [
    {
        year: "2014",
        title: "Les Débuts à Sandaga",
        description: "Ouverture de notre première boutique au cœur commerçant de Dakar. Une promesse clé : aucun faux, zéro compromis sur la qualité.",
        icon: Store,
        badge: "Fondation Historique"
    },
    {
        year: "2018",
        title: "L'Expansion Multimarques",
        description: "Accords de distribution directe avec les géants mondiaux : Apple, Samsung, HP, Dell, Canon et élargissement de la gamme bureautique.",
        icon: Award,
        badge: "Partenariats Officiels"
    },
    {
        year: "2022",
        title: "La Révolution Digitale",
        description: "Lancement de la plateforme baraka.sn pour commander en ligne partout au Sénégal avec paiement sécurisé à la livraison.",
        icon: Globe,
        badge: "E-Commerce National"
    },
    {
        year: "2026",
        title: "Leader High-Tech N°1",
        description: "Plus de 15 000 clients satisfaits, service client 7j/7, livraisons express 2-4h à Dakar et référence incontournable en Afrique de l'Ouest.",
        icon: Rocket,
        badge: "Excellence Continue"
    }
]
