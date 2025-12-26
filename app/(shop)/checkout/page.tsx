'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, CreditCard, Banknote, Smartphone } from 'lucide-react'
import Image from 'next/image'

export default function CheckoutPage() {
    const [step, setStep] = useState(1)
    const [paymentMethod, setPaymentMethod] = useState('wave')

    return (
        <div className="bg-background min-h-screen py-16">
            <div className="container px-4 mx-auto max-w-6xl">
                <h1 className="text-3xl font-bold mb-8 text-center">Finaliser la Commande</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Forms */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Step 1: Shipping Info */}
                        <div className={`p-6 bg-card border ${step >= 1 ? 'border-primary' : 'border-border'} rounded-xl shadow-sm transition-all`}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm">1</span>
                                    Informations de Livraison
                                </h2>
                                {step > 1 && <Check className="text-green-500" />}
                            </div>

                            {step === 1 && (
                                <motion.form
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                >
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Prénom</label>
                                        <input type="text" className="w-full px-4 py-2 rounded-lg border bg-background" placeholder="Cheikh" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Nom</label>
                                        <input type="text" className="w-full px-4 py-2 rounded-lg border bg-background" placeholder="Diop" />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium">Adresse</label>
                                        <input type="text" className="w-full px-4 py-2 rounded-lg border bg-background" placeholder="123 Avenue..." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Ville</label>
                                        <input type="text" className="w-full px-4 py-2 rounded-lg border bg-background" placeholder="Dakar" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Téléphone</label>
                                        <input type="tel" className="w-full px-4 py-2 rounded-lg border bg-background" placeholder="+221 77..." />
                                    </div>
                                    <div className="md:col-span-2 mt-4">
                                        <button type="button" onClick={() => setStep(2)} className="btn btn-primary w-full">Continuer vers le paiement</button>
                                    </div>
                                </motion.form>
                            )}
                        </div>

                        {/* Step 2: Payment */}
                        <div className={`p-6 bg-card border ${step === 2 ? 'border-primary' : 'border-border'} rounded-xl shadow-sm transition-all opacity-100`}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-3">
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step === 2 ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'}`}>2</span>
                                    Paiement
                                </h2>
                            </div>

                            {step === 2 && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <button
                                            onClick={() => setPaymentMethod('wave')}
                                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'wave' ? 'border-blue-500 bg-blue-50/10' : 'border-border hover:border-blue-200'}`}
                                        >
                                            <Smartphone className="text-blue-500" />
                                            <span className="font-bold text-sm">Wave / OM</span>
                                        </button>
                                        <button
                                            onClick={() => setPaymentMethod('card')}
                                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'card' ? 'border-primary bg-orange-50/10' : 'border-border hover:border-orange-200'}`}
                                        >
                                            <CreditCard className="text-primary" />
                                            <span className="font-bold text-sm">Carte Bancaire</span>
                                        </button>
                                        <button
                                            onClick={() => setPaymentMethod('cash')}
                                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'cash' ? 'border-green-500 bg-green-50/10' : 'border-border hover:border-green-200'}`}
                                        >
                                            <Banknote className="text-green-500" />
                                            <span className="font-bold text-sm">À la livraison</span>
                                        </button>
                                    </div>

                                    <div className="mt-8 p-4 bg-secondary/50 rounded-lg text-sm text-muted-foreground">
                                        <p>En cliquant sur "Confirmer la commande", vous acceptez nos conditions générales de vente.</p>
                                    </div>

                                    <button className="btn btn-primary w-full py-4 text-lg font-bold shadow-lg hover:shadow-primary/25">
                                        Confirmer la commande (2.352.000 FCFA)
                                    </button>
                                </motion.div>
                            )}
                        </div>

                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm sticky top-24">
                            <h3 className="font-bold text-lg mb-6 border-b border-border pb-4">Récapitulatif</h3>
                            <div className="space-y-4 mb-6">
                                {/* Mock Items in Summary */}
                                <div className="flex gap-3">
                                    <div className="relative w-16 h-16 bg-secondary rounded overflow-hidden shrink-0">
                                        <Image src="https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&q=80&w=200" alt="MacBook" fill className="object-cover" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium line-clamp-2">Apple MacBook Pro 14" M3 Pro</p>
                                        <p className="text-xs text-muted-foreground">Qté: 1</p>
                                        <p className="text-sm font-bold text-primary">1.850.000 FCFA</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="relative w-16 h-16 bg-secondary rounded overflow-hidden shrink-0">
                                        <Image src="https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=200" alt="Sony" fill className="object-cover" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium line-clamp-2">Sony WH-1000XM5</p>
                                        <p className="text-xs text-muted-foreground">Qté: 2</p>
                                        <p className="text-sm font-bold text-primary">500.000 FCFA</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 border-t border-border pt-4">
                                <div className="flex justify-between text-sm">
                                    <span>Sous-total</span>
                                    <span>2.350.000 FCFA</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Livraison</span>
                                    <span>2.000 FCFA</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-primary pt-2">
                                    <span>Total</span>
                                    <span>2.352.000 FCFA</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
