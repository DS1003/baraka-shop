'use client'

import { FileText } from 'lucide-react'

export default function TermsPage() {
    return (
        <div className="bg-background min-h-screen py-20">
            <div className="container px-4 mx-auto max-w-4xl">
                <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    <FileText className="text-primary" /> Conditions Générales de Vente
                </h1>

                <div className="prose prose-stone dark:prose-invert max-w-none space-y-8 text-foreground/80">
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-4">1. Objet</h2>
                        <p>
                            Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre Baraka Shop et ses clients. Toute commande passée sur notre site implique l'acceptation sans réserve de ces conditions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-4">2. Produits</h2>
                        <p>
                            Les produits proposés sont ceux qui figurent sur le site Baraka.sn, dans la limite des stocks disponibles. Baraka Shop se réserve le droit de modifier l'assortiment de produits à tout moment. Chaque produit est présenté sous forme d'un descriptif détaillé.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-4">3. Prix</h2>
                        <p>
                            Les prix de nos produits sont indiqués en Francs CFA (FCFA) toutes taxes comprises (TTC). Baraka Shop se réserve le droit de modifier ses prix à tout moment, mais le produit sera facturé sur la base du tarif en vigueur au moment de la validation de la commande.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-4">4. Commande</h2>
                        <p>
                            La confirmation de la commande entraîne l'acceptation des présentes conditions de vente, la reconnaissance d'en avoir parfaite connaissance et la renonciation à se prévaloir de ses propres conditions d'achat. L'ensemble des données fournies et la confirmation enregistrée vaudront preuve de la transaction.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-4">5. Paiement</h2>
                        <p>
                            Le règlement de vos achats s'effectue soit par cartes bancaires, soit via les services de mobile money (Orange Money, Wave), soit en espèces à la livraison (sous conditions géographiques).
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
