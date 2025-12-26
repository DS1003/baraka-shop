'use client'

import { Truck, MapPin, Clock } from 'lucide-react'

export default function ShippingPage() {
    return (
        <div className="bg-background min-h-screen py-20">
            <div className="container px-4 mx-auto max-w-4xl">
                <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    <Truck className="text-primary" size={32} /> Livraison & Retours
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                            <MapPin />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Zones de Livraison</h3>
                        <p className="text-muted-foreground">
                            Nous livrons partout au Sénégal. Dakar et sa banlieue sont desservis par nos coursiers express. Les régions sont livrées via nos partenaires logistiques.
                        </p>
                    </div>
                    <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                        <div className="w-12 h-12 bg-orange-100 text-primary rounded-full flex items-center justify-center mb-4">
                            <Clock />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Délais & Tarifs</h3>
                        <ul className="text-muted-foreground space-y-2 mt-2">
                            <li>• <span className="font-bold text-foreground">Dakar :</span> 24h - 2.000 FCFA</li>
                            <li>• <span className="font-bold text-foreground">Banlieue :</span> 24h/48h - 3.000 FCFA</li>
                            <li>• <span className="font-bold text-foreground">Régions :</span> 3 à 5 jours - 5.000 FCFA</li>
                            <li className="text-sm italic pt-2">* Livraison gratuite dès 200.000 FCFA d'achat.</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-secondary/30 p-8 rounded-xl border border-border">
                    <h2 className="text-xl font-bold mb-4">Politique de Retour</h2>
                    <div className="space-y-4 text-foreground/80 leading-relaxed">
                        <p>
                            Vous disposez d'un délai de <strong>15 jours</strong> après réception de votre commande pour nous retourner un article si celui-ci ne vous convient pas.
                        </p>
                        <p>
                            Pour être éligible au retour, votre article doit être inutilisé et dans le même état où vous l'avez reçu. Il doit être également dans l'emballage d'origine.
                        </p>
                        <p>
                            Les frais de retour sont à la charge du client, sauf en cas d'erreur de notre part ou de produit défectueux. Une fois votre retour reçu et inspecté, nous vous enverrons un email pour vous informer que nous avons reçu votre article retourné.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
