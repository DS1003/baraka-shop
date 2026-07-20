'use client'

import React, { useState } from 'react'
import { Container } from '@/ui/Container'
import {
    ChevronDown,
    Package,
    CreditCard,
    Truck,
    RotateCcw,
    ShieldCheck,
    Headphones,
    Search,
    MessageSquare
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import Link from 'next/link'


const faqCategories = [
    {
        id: 'commandes',
        label: 'Commandes',
        icon: Package,
        questions: [
            {
                q: 'Comment passer une commande sur Baraka Shop ?',
                a: "Parcourez notre catalogue, sélectionnez vos produits et ajoutez-les au panier. Rendez-vous ensuite dans votre panier pour finaliser votre commande en renseignant vos informations de livraison et de paiement. Vous recevrez une confirmation par email dès validation."
            },
            {
                q: 'Puis-je modifier ou annuler ma commande ?',
                a: "Oui, vous pouvez modifier ou annuler votre commande tant qu'elle n'a pas encore été expédiée. Contactez notre service client via WhatsApp ou par téléphone dans les meilleurs délais."
            },
            {
                q: 'Comment suivre ma commande ?',
                a: "Dès l'expédition de votre commande, vous recevrez un email avec un numéro de suivi. Vous pouvez également suivre l'état de votre commande depuis votre espace client, dans la section « Mes commandes »."
            },
            {
                q: 'Que faire si je n\'ai pas reçu de confirmation de commande ?',
                a: "Vérifiez d'abord votre dossier spam. Si vous ne trouvez toujours pas l'email, connectez-vous à votre compte pour vérifier l'état de la commande ou contactez notre support technique."
            },
        ]
    },
    {
        id: 'paiement',
        label: 'Paiement',
        icon: CreditCard,
        questions: [
            {
                q: 'Quels modes de paiement acceptez-vous ?',
                a: "Nous acceptons les paiements par carte bancaire (Visa, Mastercard), par Orange Money, Wave, Free Money et en espèces à la livraison (Cash on Delivery) dans la région de Dakar."
            },
            {
                q: 'Le paiement en ligne est-il sécurisé ?',
                a: "Absolument. Toutes nos transactions sont cryptées via le protocole SSL et traitées par des prestataires de paiement certifiés PCI-DSS. Vos données bancaires ne sont jamais stockées sur nos serveurs."
            },
            {
                q: 'Puis-je payer en plusieurs fois ?',
                a: "Oui, pour les achats supérieurs à 150 000 FCFA, nous proposons des facilités de paiement en 2 ou 3 fois sans frais. Contactez notre service commercial pour plus de détails."
            },
        ]
    },
    {
        id: 'livraison',
        label: 'Livraison',
        icon: Truck,
        questions: [
            {
                q: 'Quels sont les délais de livraison ?',
                a: "À Dakar : livraison en 24 à 48h ouvrées. En régions : livraison en 3 à 5 jours ouvrés. Les délais peuvent varier selon la disponibilité du produit et votre localisation."
            },
            {
                q: 'La livraison est-elle gratuite ?',
                a: "La livraison est gratuite à Dakar pour toute commande supérieure à 50 000 FCFA. Pour les commandes en dessous de ce montant ou en régions, des frais de livraison s'appliquent et sont calculés au checkout."
            },
            {
                q: 'Livrez-vous en dehors de Dakar ?',
                a: "Oui, nous livrons partout au Sénégal via nos partenaires logistiques. Les délais et frais de livraison sont ajustés selon votre localisation."
            },
            {
                q: 'Puis-je retirer ma commande en magasin ?',
                a: "Oui ! Grâce à notre service Click & Collect, vous pouvez retirer votre commande dans l'une de nos boutiques Baraka. Sélectionnez cette option lors du checkout."
            },
        ]
    },
    {
        id: 'retours',
        label: 'Retours & Échanges',
        icon: RotateCcw,
        questions: [
            {
                q: 'Quelle est votre politique de retour ?',
                a: "Vous disposez de 7 jours après réception pour retourner un produit dans son emballage d'origine, non utilisé. Les frais de retour sont à votre charge sauf en cas de produit défectueux ou non conforme."
            },
            {
                q: 'Comment effectuer un retour ?',
                a: "Contactez notre SAV via WhatsApp ou email en précisant votre numéro de commande et le motif du retour. Nous vous guiderons dans la procédure et organiserons le retrait si nécessaire."
            },
            {
                q: 'Sous quel délai suis-je remboursé ?',
                a: "Une fois le produit retourné vérifié, le remboursement est effectué sous 5 à 10 jours ouvrés sur votre mode de paiement initial."
            },
        ]
    },
    {
        id: 'garantie',
        label: 'Garantie & SAV',
        icon: ShieldCheck,
        questions: [
            {
                q: 'Vos produits sont-ils garantis ?',
                a: "Oui, tous nos produits bénéficient de la garantie constructeur officielle (de 6 mois à 2 ans selon les produits). Nous offrons également une garantie Baraka complémentaire sur certains articles."
            },
            {
                q: 'Que couvre la garantie ?',
                a: "La garantie couvre les défauts de fabrication et les pannes matérielles non liées à une mauvaise utilisation. Les dommages causés par des chocs, de l'eau ou une utilisation non conforme sont exclus."
            },
            {
                q: 'Comment bénéficier du service après-vente ?',
                a: "Rendez-vous en boutique avec votre produit et votre facture, ou contactez notre SAV en ligne. Nos techniciens certifiés prennent en charge la réparation ou l'échange selon les termes de la garantie."
            },
        ]
    },
    {
        id: 'compte',
        label: 'Mon Compte',
        icon: Headphones,
        questions: [
            {
                q: 'Comment créer un compte ?',
                a: "Cliquez sur « Se connecter » en haut de la page, puis sur « Créer un compte ». Renseignez votre email, choisissez un mot de passe et complétez vos informations personnelles."
            },
            {
                q: 'J\'ai oublié mon mot de passe, que faire ?',
                a: "Cliquez sur « Mot de passe oublié » sur la page de connexion. Entrez votre adresse email et vous recevrez un lien de réinitialisation sécurisé."
            },
            {
                q: 'Comment modifier mes informations personnelles ?',
                a: "Connectez-vous à votre espace client, puis accédez à la section « Mon profil » pour modifier vos coordonnées, adresse de livraison et préférences."
            },
        ]
    },
]

export default function FAQPage() {
    const [activeCategory, setActiveCategory] = useState('commandes')
    const [searchQuery, setSearchQuery] = useState('')
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    const currentCategory = faqCategories.find(c => c.id === activeCategory)!

    const filteredQuestions = searchQuery.trim()
        ? faqCategories.flatMap(cat =>
            cat.questions.filter(q =>
                q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                q.a.toLowerCase().includes(searchQuery.toLowerCase())
            ).map(q => ({ ...q, category: cat.label }))
        )
        : null

    return (
        <main className="bg-[#f8f9fb] min-h-screen pb-32">
            {/* Hero Header */}
            <div className="bg-[#1B1F3B] py-24 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: `url('https://res.cloudinary.com/dgro5x4h8/image/upload/v1768669738/pattern_2_kln9c6.png')`, backgroundSize: '400px' }} />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none" />

                <Container className="relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col items-center gap-6"
                    >
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                            <MessageSquare className="w-4 h-4 text-primary" />
                            <span className="text-white text-xs font-black uppercase tracking-[0.3em]">Centre d'aide</span>
                        </div>
                        <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter">
                            Questions <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-yellow-300">Fréquentes</span>
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto text-lg font-medium">
                            Trouvez rapidement les réponses à vos questions sur nos produits, commandes, livraisons et services.
                        </p>

                        {/* Search */}
                        <div className="relative w-full max-w-xl mt-4">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Rechercher une question..."
                                className="w-full h-16 pl-14 pr-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder:text-gray-500 outline-none focus:border-primary transition-all font-bold text-base"
                            />
                        </div>
                    </motion.div>
                </Container>
            </div>

            <Container className="pt-16">
                {/* Search Results */}
                {filteredQuestions ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="max-w-4xl mx-auto"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <span className="text-sm font-bold text-gray-400">
                                {filteredQuestions.length} résultat{filteredQuestions.length !== 1 ? 's' : ''} pour « {searchQuery} »
                            </span>
                            <button onClick={() => setSearchQuery('')} className="text-primary text-sm font-black hover:underline">
                                Effacer
                            </button>
                        </div>

                        {filteredQuestions.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                {filteredQuestions.map((item, idx) => (
                                    <FAQItemSearch key={idx} question={item.q} answer={item.a} category={item.category} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-[2rem] p-16 border border-gray-100 text-center">
                                <Search className="w-12 h-12 text-gray-300 mx-auto mb-6" />
                                <h3 className="text-xl font-black text-[#1B1F3B] mb-3">Aucun résultat trouvé</h3>
                                <p className="text-gray-400 font-medium mb-6">Essayez avec des termes différents ou parcourez nos catégories ci-dessous.</p>
                                <button onClick={() => setSearchQuery('')} className="bg-primary text-white px-8 py-3 rounded-xl font-black text-sm hover:bg-primary/80 transition-all">
                                    Voir toutes les questions
                                </button>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Category Sidebar */}
                        <div className="lg:col-span-4 xl:col-span-3">
                            <div className="lg:sticky lg:top-24 flex flex-col gap-3">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2 ml-4">Catégories</span>
                                {faqCategories.map((cat) => {
                                    const Icon = cat.icon
                                    const isActive = activeCategory === cat.id
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => { setActiveCategory(cat.id); setOpenIndex(0) }}
                                            className={cn(
                                                "flex items-center gap-4 p-4 rounded-2xl transition-all text-left group",
                                                isActive
                                                    ? "bg-[#1B1F3B] text-white shadow-xl shadow-[#1B1F3B]/20"
                                                    : "bg-white hover:bg-gray-50 text-gray-600 border border-gray-100 hover:border-gray-200"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                                                isActive ? "bg-primary text-white" : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                                            )}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-black text-sm">{cat.label}</div>
                                                <div className={cn("text-[10px] font-bold", isActive ? "text-gray-400" : "text-gray-400")}>
                                                    {cat.questions.length} question{cat.questions.length > 1 ? 's' : ''}
                                                </div>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Questions */}
                        <div className="lg:col-span-8 xl:col-span-9">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeCategory}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex flex-col gap-4"
                                >
                                    {currentCategory.questions.map((item, idx) => (
                                        <FAQItem
                                            key={idx}
                                            question={item.q}
                                            answer={item.a}
                                            isOpen={openIndex === idx}
                                            onToggle={() => setOpenIndex(openIndex === idx ? null : idx)}
                                            index={idx}
                                        />
                                    ))}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-24 bg-[#1B1F3B] rounded-[2.5rem] p-10 md:p-16 text-center relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full -translate-x-1/3 translate-y-1/3 pointer-events-none" />
                    <div className="relative z-10">
                        <Headphones className="w-12 h-12 text-primary mx-auto mb-6" />
                        <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-4">
                            Vous n'avez pas trouvé votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">réponse</span> ?
                        </h2>
                        <p className="text-gray-400 max-w-xl mx-auto mb-10 text-lg font-medium">
                            Notre équipe d'experts est disponible pour répondre à toutes vos questions.
                        </p>
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-3 bg-primary text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-primary/80 transition-all shadow-xl shadow-primary/30 hover:-translate-y-1"
                        >
                            Contactez-nous <MessageSquare className="w-4 h-4" />
                        </Link>
                    </div>
                </motion.div>
            </Container>
        </main>
    )
}

function FAQItem({ question, answer, isOpen, onToggle, index }: {
    question: string
    answer: string
    isOpen: boolean
    onToggle: () => void
    index: number
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
                "bg-white rounded-[1.5rem] border overflow-hidden transition-all duration-300",
                isOpen ? "border-primary/20 shadow-lg shadow-primary/5" : "border-gray-100 hover:border-gray-200 shadow-sm"
            )}
        >
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-6 md:p-8 text-left gap-4"
            >
                <div className="flex items-center gap-5">
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-black transition-colors duration-300",
                        isOpen ? "bg-primary text-white" : "bg-gray-100 text-gray-400"
                    )}>
                        {String(index + 1).padStart(2, '0')}
                    </div>
                    <span className="font-black text-[#1B1F3B] text-base md:text-lg">{question}</span>
                </div>
                <ChevronDown className={cn(
                    "w-5 h-5 shrink-0 text-gray-400 transition-transform duration-300",
                    isOpen ? "rotate-180 text-primary" : ""
                )} />
            </button>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <div className="px-6 md:px-8 pb-8 pl-[4.5rem] md:pl-[5.5rem]">
                            <p className="text-gray-500 leading-relaxed font-medium text-base">{answer}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

function FAQItemSearch({ question, answer, category }: {
    question: string
    answer: string
    category: string
}) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className={cn(
            "bg-white rounded-[1.5rem] border overflow-hidden transition-all",
            isOpen ? "border-primary/20 shadow-lg" : "border-gray-100 shadow-sm"
        )}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 md:p-8 text-left gap-4"
            >
                <div className="flex-1">
                    <span className="inline-block text-[9px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 px-3 py-1 rounded-full mb-2">{category}</span>
                    <div className="font-black text-[#1B1F3B] text-base md:text-lg">{question}</div>
                </div>
                <ChevronDown className={cn(
                    "w-5 h-5 shrink-0 text-gray-400 transition-transform duration-300",
                    isOpen ? "rotate-180 text-primary" : ""
                )} />
            </button>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="px-6 md:px-8 pb-8">
                            <p className="text-gray-500 leading-relaxed font-medium">{answer}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
