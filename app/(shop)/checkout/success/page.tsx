'use client'

import Link from 'next/link'
import { CheckCircle2, Home } from 'lucide-react'

export default function SuccessPage() {
    return (
        <div className="bg-background min-h-screen flex items-center justify-center py-20">
            <div className="container px-4 mx-auto text-center max-w-lg">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                    <CheckCircle2 size={48} />
                </div>
                <h1 className="text-4xl font-bold mb-4">Merci pour votre commande !</h1>
                <p className="text-muted-foreground mb-8 text-lg">
                    Votre commande <span className="font-bold text-foreground">#BRK-9901</span> a été confirmée avec succès.
                    Vous recevrez un email de confirmation sous peu.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/" className="btn btn-primary px-8 py-3 rounded-full flex items-center justify-center gap-2">
                        <Home size={18} /> Retour à l'accueil
                    </Link>
                    <Link href="/account/orders" className="btn btn-outline border-input px-8 py-3 rounded-full">
                        Suivre ma commande
                    </Link>
                </div>
            </div>
        </div>
    )
}
