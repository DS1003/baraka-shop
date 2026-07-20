'use client'

import React, { useState } from 'react'
import { Container } from '@/ui/Container'
import {
    ScrollText,
    ShieldCheck,
    FileText,
    ChevronRight,
    Scale,
    Eye,
    Lock,
    UserCheck,
    AlertTriangle,
    Cookie
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const tabs = [
    { id: 'cgv', label: 'Conditions Générales de Vente', icon: Scale },
    { id: 'privacy', label: 'Politique de Confidentialité', icon: Eye },
] as const

type TabId = typeof tabs[number]['id']

export default function LegalPage() {
    const [activeTab, setActiveTab] = useState<TabId>('cgv')

    return (
        <main className="bg-[#f8f9fb] min-h-screen pb-32">
            {/* Hero Header */}
            <div className="bg-[#1B1F3B] py-24 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: `url('https://res.cloudinary.com/dgro5x4h8/image/upload/v1768669738/pattern_2_kln9c6.png')`, backgroundSize: '400px' }} />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />

                <Container className="relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col items-center gap-6"
                    >
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                            <ScrollText className="w-4 h-4 text-primary" />
                            <span className="text-white text-xs font-black uppercase tracking-[0.3em]">Mentions Légales</span>
                        </div>
                        <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter">
                            CGV & <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-yellow-300">Confidentialité</span>
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto text-lg font-medium">
                            Consultez nos conditions générales de vente et notre politique de confidentialité pour une transparence totale.
                        </p>
                    </motion.div>
                </Container>
            </div>

            <Container className="pt-10">
                {/* Tabs */}
                <div className="flex flex-col sm:flex-row gap-3 mb-12 max-w-2xl mx-auto">
                    {tabs.map(tab => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-3 p-5 rounded-2xl transition-all font-black text-sm uppercase tracking-wider group",
                                    isActive
                                        ? "bg-[#1B1F3B] text-white shadow-xl shadow-[#1B1F3B]/20"
                                        : "bg-white text-gray-500 border border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                                )}
                            >
                                <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-primary" : "text-gray-400")} />
                                <span className="hidden sm:inline">{tab.label}</span>
                                <span className="sm:hidden">{tab.id === 'cgv' ? 'CGV' : 'Confidentialité'}</span>
                            </button>
                        )
                    })}
                </div>

                {/* Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="max-w-4xl mx-auto"
                >
                    {activeTab === 'cgv' ? <CGVContent /> : <PrivacyContent />}
                </motion.div>
            </Container>
        </main>
    )
}

function SectionCard({ icon: Icon, title, children, id }: {
    icon: React.ElementType
    title: string
    children: React.ReactNode
    id?: string
}) {
    return (
        <motion.section
            id={id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            className="bg-white rounded-[2rem] p-8 md:p-12 border border-gray-100 shadow-sm"
        >
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Icon className="w-6 h-6" />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-[#1B1F3B] uppercase tracking-tighter">{title}</h2>
            </div>
            <div className="text-gray-500 leading-relaxed font-medium space-y-5 text-[15px]">
                {children}
            </div>
        </motion.section>
    )
}

function CGVContent() {
    return (
        <div className="flex flex-col gap-6">
            {/* Last Updated */}
            <div className="flex items-center justify-between bg-blue-50 rounded-2xl px-6 py-4 border border-blue-100">
                <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-bold text-blue-700">Dernière mise à jour :</span>
                </div>
                <span className="text-sm font-black text-blue-900">Juillet 2025</span>
            </div>

            <SectionCard icon={ScrollText} title="Préambule" id="preambule">
                <p>
                    Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre
                    la société <strong>Baraka Shop SARL</strong>, immatriculée au RCCM de Dakar, et tout client
                    effectuant un achat sur le site <strong>baraka.sn</strong> ou en boutique physique.
                </p>
                <p>
                    Toute commande implique l'acceptation sans réserve des présentes CGV. Baraka Shop se réserve
                    le droit de modifier ces conditions à tout moment. Les CGV applicables sont celles en vigueur
                    à la date de la commande.
                </p>
            </SectionCard>

            <SectionCard icon={ShieldCheck} title="Article 1 — Produits" id="produits">
                <p>
                    Les produits proposés à la vente sont ceux décrits et présentés sur le site <strong>baraka.sn</strong>.
                    Chaque produit est accompagné d'une description détaillée permettant au client de connaître
                    ses caractéristiques essentielles.
                </p>
                <p>
                    Les photographies et descriptions des produits sont aussi fidèles que possible mais ne peuvent
                    assurer une similitude parfaite avec le produit, notamment en raison des différences de rendu
                    des couleurs sur les écrans.
                </p>
                <p>
                    Tous les produits commercialisés par Baraka Shop sont <strong>100% authentiques</strong> et
                    bénéficient de la garantie constructeur officielle.
                </p>
            </SectionCard>

            <SectionCard icon={Scale} title="Article 2 — Prix & Paiement" id="prix">
                <p>
                    Les prix sont indiqués en <strong>Francs CFA (FCFA)</strong> toutes taxes comprises. Baraka Shop
                    se réserve le droit de modifier ses tarifs à tout moment. Néanmoins, les produits seront facturés
                    au prix en vigueur lors de l'enregistrement de la commande.
                </p>
                <p>Les modes de paiement acceptés sont :</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Carte bancaire (Visa, Mastercard)</li>
                    <li>Orange Money, Wave, Free Money</li>
                    <li>Paiement à la livraison (Cash on Delivery) — Région de Dakar uniquement</li>
                    <li>Virement bancaire (pour les entreprises)</li>
                </ul>
                <p>
                    Pour les achats supérieurs à <strong>150 000 FCFA</strong>, des facilités de paiement
                    en 2 ou 3 fois sans frais peuvent être proposées après accord du service commercial.
                </p>
            </SectionCard>

            <SectionCard icon={FileText} title="Article 3 — Commandes" id="commandes">
                <p>
                    Toute commande passée sur le site constitue un contrat de vente entre le client et Baraka Shop.
                    Le client recevra une confirmation de commande par email à l'adresse renseignée lors de l'achat.
                </p>
                <p>
                    Baraka Shop se réserve le droit de refuser ou d'annuler toute commande en cas de litige antérieur,
                    de suspicion de fraude, ou d'indisponibilité du produit.
                </p>
            </SectionCard>

            <SectionCard icon={ShieldCheck} title="Article 4 — Livraison" id="livraison">
                <p>Les livraisons sont effectuées à l'adresse indiquée par le client lors de la commande.</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Dakar :</strong> livraison en 24 à 48h ouvrées</li>
                    <li><strong>Régions :</strong> livraison en 3 à 5 jours ouvrés</li>
                    <li><strong>Click & Collect :</strong> retrait gratuit en boutique sous 2h</li>
                </ul>
                <p>
                    Les frais de livraison sont calculés en fonction de la zone de livraison et du poids du colis.
                    La livraison est <strong>gratuite à Dakar</strong> pour toute commande supérieure à 50 000 FCFA.
                </p>
            </SectionCard>

            <SectionCard icon={AlertTriangle} title="Article 5 — Retours & Garantie" id="retours">
                <p>
                    Le client dispose d'un délai de <strong>7 jours</strong> à compter de la réception du produit pour
                    exercer son droit de retour. Le produit doit être retourné dans son emballage d'origine, non utilisé
                    et en parfait état.
                </p>
                <p>
                    Tous les produits bénéficient de la <strong>garantie constructeur officielle</strong> (6 mois à 2 ans
                    selon les produits). La garantie couvre les défauts de fabrication et les pannes matérielles. Sont
                    exclus : les dommages causés par une mauvaise utilisation, chocs, exposition à l'eau, etc.
                </p>
                <p>
                    Pour toute demande de retour ou de SAV, veuillez contacter notre service client via
                    WhatsApp, email ou directement en boutique.
                </p>
            </SectionCard>

            <SectionCard icon={Scale} title="Article 6 — Responsabilité" id="responsabilite">
                <p>
                    Baraka Shop ne saurait être tenu responsable des dommages résultant d'une mauvaise utilisation
                    du produit, d'une modification ou d'une installation non conforme. En cas de force majeure,
                    Baraka Shop sera dégagé de toute responsabilité.
                </p>
                <p>
                    Les présentes CGV sont soumises au droit sénégalais. Tout litige sera soumis à la compétence
                    exclusive des tribunaux de Dakar, après tentative de résolution amiable.
                </p>
            </SectionCard>
        </div>
    )
}

function PrivacyContent() {
    return (
        <div className="flex flex-col gap-6">
            {/* Last Updated */}
            <div className="flex items-center justify-between bg-green-50 rounded-2xl px-6 py-4 border border-green-100">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-bold text-green-700">Dernière mise à jour :</span>
                </div>
                <span className="text-sm font-black text-green-900">Juillet 2025</span>
            </div>

            <SectionCard icon={Eye} title="Introduction" id="intro-privacy">
                <p>
                    La société <strong>Baraka Shop SARL</strong> s'engage à protéger la vie privée de ses clients
                    et visiteurs du site <strong>baraka.sn</strong>. La présente politique de confidentialité décrit
                    les types de données personnelles collectées, les finalités du traitement et les droits dont
                    vous disposez.
                </p>
                <p>
                    En utilisant notre site, vous consentez à la collecte et au traitement de vos données
                    conformément à la présente politique.
                </p>
            </SectionCard>

            <SectionCard icon={UserCheck} title="Données Collectées" id="donnees">
                <p>Nous collectons les données suivantes :</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Données d'identification :</strong> nom, prénom, adresse email, numéro de téléphone</li>
                    <li><strong>Données de commande :</strong> historique des achats, adresses de livraison, préférences de paiement</li>
                    <li><strong>Données de navigation :</strong> adresse IP, type de navigateur, pages visitées, durée des visites</li>
                    <li><strong>Données de compte :</strong> mot de passe (hashé), liste d'envies, préférences</li>
                </ul>
                <p>
                    Ces données sont collectées lors de la création de votre compte, de la passation d'une commande,
                    ou de votre navigation sur notre site.
                </p>
            </SectionCard>

            <SectionCard icon={Lock} title="Utilisation des Données" id="utilisation">
                <p>Vos données personnelles sont utilisées aux fins suivantes :</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Traitement et suivi de vos commandes</li>
                    <li>Gestion de votre compte client</li>
                    <li>Amélioration de nos services et de l'expérience utilisateur</li>
                    <li>Communication d'offres promotionnelles (avec votre consentement)</li>
                    <li>Respect de nos obligations légales et fiscales</li>
                    <li>Prévention de la fraude et sécurisation des transactions</li>
                </ul>
                <p>
                    Vos données ne sont <strong>jamais vendues à des tiers</strong>. Elles peuvent être partagées
                    avec nos prestataires techniques (hébergement, paiement, livraison) dans le strict cadre de
                    l'exécution de nos services.
                </p>
            </SectionCard>

            <SectionCard icon={Cookie} title="Cookies" id="cookies">
                <p>
                    Notre site utilise des cookies pour améliorer votre expérience de navigation. Les cookies sont
                    de petits fichiers texte stockés sur votre appareil qui nous permettent de :
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Mémoriser vos préférences et votre panier</li>
                    <li>Analyser le trafic et le comportement des visiteurs</li>
                    <li>Personnaliser les contenus et les recommandations</li>
                    <li>Assurer la sécurité de votre session</li>
                </ul>
                <p>
                    Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.
                    La désactivation de certains cookies peut affecter le fonctionnement du site.
                </p>
            </SectionCard>

            <SectionCard icon={ShieldCheck} title="Sécurité des Données" id="securite">
                <p>
                    Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour
                    protéger vos données personnelles contre tout accès non autorisé, modification, divulgation ou
                    destruction.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Chiffrement SSL/TLS pour toutes les communications</li>
                    <li>Hashage des mots de passe (bcrypt)</li>
                    <li>Accès restreint aux données personnelles</li>
                    <li>Surveillance continue des systèmes</li>
                    <li>Sauvegarde régulière des données</li>
                </ul>
            </SectionCard>

            <SectionCard icon={UserCheck} title="Vos Droits" id="droits">
                <p>
                    Conformément à la loi sénégalaise sur la protection des données personnelles, vous disposez des
                    droits suivants :
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Droit d'accès :</strong> vous pouvez demander une copie de vos données personnelles</li>
                    <li><strong>Droit de rectification :</strong> vous pouvez corriger vos données inexactes</li>
                    <li><strong>Droit de suppression :</strong> vous pouvez demander la suppression de vos données</li>
                    <li><strong>Droit d'opposition :</strong> vous pouvez vous opposer au traitement de vos données à des fins de marketing</li>
                    <li><strong>Droit à la portabilité :</strong> vous pouvez obtenir vos données dans un format structuré</li>
                </ul>
                <p>
                    Pour exercer ces droits, contactez-nous à <strong>contact@baraka.sn</strong> ou par courrier
                    à notre siège social à Dakar.
                </p>
            </SectionCard>

            <SectionCard icon={FileText} title="Conservation des Données" id="conservation">
                <p>
                    Vos données personnelles sont conservées pendant la durée nécessaire aux finalités pour lesquelles
                    elles ont été collectées :
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Données de compte :</strong> conservées tant que le compte est actif, plus 3 ans après la dernière activité</li>
                    <li><strong>Données de commande :</strong> conservées 5 ans pour les obligations fiscales</li>
                    <li><strong>Données de navigation :</strong> conservées 13 mois maximum</li>
                </ul>
                <p>
                    Au-delà de ces durées, vos données sont anonymisées ou supprimées de manière sécurisée.
                </p>
            </SectionCard>
        </div>
    )
}
