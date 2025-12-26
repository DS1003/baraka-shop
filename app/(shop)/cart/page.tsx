'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Minus, Plus, Trash2, ArrowRight, ShieldCheck } from 'lucide-react'

// Mock Cart Data
const initialCartItems = [
    {
        id: 1,
        name: 'Apple MacBook Pro 14" M3 Pro',
        price: 1850000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&q=80&w=200',
    },
    {
        id: 3,
        name: 'Sony WH-1000XM5',
        price: 250000,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=200',
    }
]

export default function CartPage() {
    const [cartItems, setCartItems] = useState(initialCartItems)

    const updateQuantity = (id: number, delta: number) => {
        setCartItems(cartItems.map(item => {
            if (item.id === id) {
                const newQuantity = Math.max(1, item.quantity + delta)
                return { ...item, quantity: newQuantity }
            }
            return item
        }))
    }

    const removeItem = (id: number) => {
        setCartItems(cartItems.filter(item => item.id !== id))
    }

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    const shipping = 2000 // Frais fixe pour l'exemple
    const total = subtotal + shipping

    return (
        <div className="bg-background min-h-screen py-16">
            <div className="container px-4 mx-auto">
                <h1 className="text-3xl font-bold mb-8">Votre Panier ({cartItems.length})</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items List */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.length === 0 ? (
                            <div className="text-center py-12 bg-secondary rounded-xl border border-dashed border-border">
                                <p className="text-muted-foreground mb-4">Votre panier est vide.</p>
                                <Link href="/shop" className="text-primary font-medium hover:underline">
                                    Découvrir la boutique
                                </Link>
                            </div>
                        ) : (
                            cartItems.map((item) => (
                                <div key={item.id} className="flex gap-4 p-4 bg-card border border-border rounded-xl shadow-sm">
                                    <div className="relative w-24 h-24 bg-secondary rounded-lg overflow-hidden shrink-0">
                                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-medium text-foreground line-clamp-2">{item.name}</h3>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div className="flex items-center border border-input rounded-lg h-8 bg-background">
                                                <button
                                                    className="h-full px-2 hover:bg-secondary rounded-l-lg transition-colors"
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                                <button
                                                    className="h-full px-2 hover:bg-secondary rounded-r-lg transition-colors"
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            <span className="font-bold text-primary">
                                                {(item.price * item.quantity).toLocaleString('fr-FR')} FCFA
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm sticky top-24">
                            <h3 className="font-bold text-lg mb-6">Résumé de la commande</h3>
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Sous-total</span>
                                    <span className="font-medium">{subtotal.toLocaleString('fr-FR')} FCFA</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Livraison</span>
                                    <span className="font-medium">{shipping.toLocaleString('fr-FR')} FCFA</span>
                                </div>
                                <div className="border-t border-border pt-4 flex justify-between items-end">
                                    <span className="font-bold">Total</span>
                                    <span className="font-bold text-xl text-primary">{total.toLocaleString('fr-FR')} FCFA</span>
                                </div>
                            </div>

                            <Link href="/checkout" className="btn btn-primary w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg hover:shadow-primary/25 transition-all mb-4">
                                Passer à la caisse <ArrowRight size={18} />
                            </Link>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                                <ShieldCheck size={14} />
                                <span>Paiement 100% Sécurisé</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
