'use client'

import { HelpCircle } from 'lucide-react'

export default function FAQPage() {
    const faqs = [
        {
            question: "Comment passer une commande ?",
            answer: "Choisissez vos articles, ajoutez-les au panier, et suivez les instructions de paiement. C'est simple et sécurisé !"
        },
        {
            question: "Quels sont les délais de livraison ?",
            answer: "Nous livrons sous 24h à 48h à Dakar et dans la banlieue. Pour les régions, comptez 3 à 5 jours ouvrés."
        },
        {
            question: "Puis-je payer à la livraison ?",
            answer: "Oui ! Vous pouvez payer en espèces à la livraison pour toutes les commandes à Dakar."
        },
        {
            question: "Les produits sont-ils garantis ?",
            answer: "Absolument. Tous nos produits électroniques sont neufs et bénéficient d'une garantie constructeur de 1 an minimum."
        }
    ]

    return (
        <div className="bg-background min-h-screen py-20" >
            <div className="container px-4 mx-auto max-w-3xl">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
                        <HelpCircle className="text-primary" size={32} />
                        Foire Aux Questions
                    </h1>
                    <p className="text-muted-foreground">Les réponses à vos questions les plus fréquentes.</p>
                </div>

                <div className="space-y-6">
                    {faqs.map((faq, index) => (
                        <div key={index} className="bg-card border border-border rounded-xl p-6 shadow-sm">
                            <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                            <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
