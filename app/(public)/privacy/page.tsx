'use client'

import { Shield } from 'lucide-react'

export default function PrivacyPage() {
    return (
        <div className="bg-background min-h-screen py-20">
            <div className="container px-4 mx-auto max-w-4xl">
                <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    <Shield className="text-primary" /> Politique de Confidentialité
                </h1>

                <div className="prose prose-stone dark:prose-invert max-w-none space-y-8 text-foreground/80">
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-4">1. Collecte des données</h2>
                        <p>
                            Chez Baraka.sn, nous collectons certaines informations personnelles lorsque vous passez une commande ou vous inscrivez à notre newsletter (Nom, adresse, email, téléphone). Ces données sont exclusivement utilisées pour le traitement de vos commandes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-4">2. Sécurité</h2>
                        <p>
                            Nous mettons en œuvre des mesures de sécurité conformes aux standards de l'industrie pour protéger vos données personnelles contre tout accès non autorisé.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-4">3. Partage des données</h2>
                        <p>
                            Vos données ne sont jamais vendues à des tiers. Elles peuvent être partagées uniquement avec nos partenaires logistiques (livreurs) pour assurer la bonne livraison de vos produits.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
