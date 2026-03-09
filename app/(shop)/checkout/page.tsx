'use client'

import React, { useState } from 'react'
import { Container } from '@/ui/Container'
import Image from 'next/image'
import Link from 'next/link'
import {
    ChevronRight,
    CreditCard,
    Truck,
    ShieldCheck,
    CheckCircle2,
    ArrowLeft,
    ArrowRight,
    Wallet,
    Home,
    Smartphone,
    X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/ui/Button'
import { cn } from '@/lib/utils'
import { useCart } from '@/context/CartContext'
import { useSession } from 'next-auth/react'
import { createOrder } from '@/lib/actions/order-actions'
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
    const { data: session } = useSession()
    const { cartItems, subtotal, clearCart } = useCart()
    const router = useRouter()
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'wave' | 'card'>('cash')
    const [step, setStep] = useState(1) // 1: Address, 2: Payment, 3: Confirm
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        address: (session?.user as any)?.address || '',
        city: 'Dakar',
        area: '',
        phone: (session?.user as any)?.phone || ''
    })

    const shipping = subtotal > 500000 || subtotal === 0 ? 0 : 5000
    const total = subtotal + shipping

    const handleCheckout = async () => {
        if (!session) {
            setError('Vous devez être connecté pour commander.')
            return
        }

        if (!formData.firstName || !formData.lastName || !formData.address || !formData.phone) {
            setError('Veuillez remplir tous les champs obligatoires.')
            return
        }

        setIsSubmitting(true)
        setError('')

        const orderData = {
            items: cartItems.map(item => ({
                productId: item.id,
                quantity: item.qty,
                price: item.price
            })),
            total,
            paymentMethod,
            shippingDetails: formData
        }

        try {
            const result = await createOrder(orderData)
            if (result.success) {
                clearCart()
                router.push(`/order-success?orderId=${result.orderId}`)
            } else {
                setError(result.error || 'Une erreur est survenue.')
            }
        } catch (err) {
            setError('Erreur réseau ou serveur.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (cartItems.length === 0) {
        return (
            <main className="bg-[#f8f9fb] min-h-screen py-24">
                <Container className="flex flex-col items-center justify-center text-center">
                    <h1 className="text-3xl font-black text-[#1B1F3B] uppercase tracking-tighter mb-4">Votre panier est vide</h1>
                    <Link href="/boutique">
                        <Button className="bg-primary text-white px-8 h-14 rounded-2xl font-black text-[11px] uppercase tracking-widest">
                            Retour à la boutique
                        </Button>
                    </Link>
                </Container>
            </main>
        )
    }

    return (
        <main className="bg-[#f8f9fb] min-h-screen py-12">
            <Container>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-8">
                    <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link href="/cart" className="hover:text-primary transition-colors">Panier</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-[#1B1F3B]">Paiement & Livraison</span>
                </div>

                {/* Visual Stepper */}
                <div className="max-w-2xl mx-auto mb-16 px-4">
                    <div className="flex items-center justify-between relative">
                        {/* Progress Line */}
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 z-0" />
                        <motion.div
                            className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0"
                            initial={{ width: '0%' }}
                            animate={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
                            transition={{ duration: 0.5 }}
                        />

                        {/* Step Circles */}
                        {[
                            { id: 1, label: 'Livraison', icon: Home },
                            { id: 2, label: 'Paiement', icon: CreditCard },
                            { id: 3, label: 'Confirmation', icon: ShieldCheck }
                        ].map((s) => (
                            <div key={s.id} className="relative z-10 flex flex-col items-center gap-3">
                                <motion.button
                                    onClick={() => s.id < step && setStep(s.id)}
                                    animate={{
                                        backgroundColor: step >= s.id ? '#F97316' : '#F1F5F9',
                                        color: step >= s.id ? '#FFFFFF' : '#94A3B8',
                                        scale: step === s.id ? 1.2 : 1
                                    }}
                                    className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors cursor-default"
                                >
                                    {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                                </motion.button>
                                <span className={cn(
                                    "text-[10px] font-black uppercase tracking-widest",
                                    step >= s.id ? "text-[#1B1F3B]" : "text-gray-400"
                                )}>
                                    {s.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Checkout Form */}
                    <div className="lg:col-span-7">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.section
                                    key="address"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm"
                                >
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="w-12 h-12 rounded-2xl bg-[#1B1F3B] flex items-center justify-center text-white">
                                            <Home className="w-6 h-6" />
                                        </div>
                                        <h2 className="text-xl font-black uppercase tracking-widest text-[#1B1F3B]">Adresse de Livraison</h2>
                                    </div>

                                    <form className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                                        <FormInput
                                            label="Prénom"
                                            placeholder="Moussa"
                                            value={formData.firstName}
                                            onChange={(val) => setFormData({ ...formData, firstName: val })}
                                        />
                                        <FormInput
                                            label="Nom"
                                            placeholder="Diop"
                                            value={formData.lastName}
                                            onChange={(val) => setFormData({ ...formData, lastName: val })}
                                        />
                                        <div className="md:col-span-2">
                                            <FormInput
                                                label="Adresse complète"
                                                placeholder="123 Avenue Blaise Diagne, Plateau"
                                                value={formData.address}
                                                onChange={(val) => setFormData({ ...formData, address: val })}
                                            />
                                        </div>
                                        <FormInput
                                            label="Ville"
                                            placeholder="Dakar"
                                            value={formData.city}
                                            onChange={(val) => setFormData({ ...formData, city: val })}
                                        />
                                        <FormInput
                                            label="Quartier"
                                            placeholder="Médina"
                                            value={formData.area}
                                            onChange={(val) => setFormData({ ...formData, area: val })}
                                        />
                                        <div className="md:col-span-2">
                                            <FormInput
                                                label="Téléphone"
                                                placeholder="+221 77 000 00 00"
                                                value={formData.phone}
                                                onChange={(val) => setFormData({ ...formData, phone: val })}
                                            />
                                        </div>
                                    </form>

                                    <Button
                                        onClick={() => setStep(2)}
                                        className="w-full h-16 bg-[#1B1F3B] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-primary transition-all flex items-center justify-center gap-3 group"
                                    >
                                        Continuer vers le paiement <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </motion.section>
                            )}

                            {step === 2 && (
                                <motion.section
                                    key="payment"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm"
                                >
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="w-12 h-12 rounded-2xl bg-[#1B1F3B] flex items-center justify-center text-white">
                                            <CreditCard className="w-6 h-6" />
                                        </div>
                                        <h2 className="text-xl font-black uppercase tracking-widest text-[#1B1F3B]">Mode de Paiement</h2>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 mb-10">
                                        <PaymentOption
                                            active={paymentMethod === 'cash'}
                                            onClick={() => setPaymentMethod('cash')}
                                            icon={Truck}
                                            title="Paiement à la livraison"
                                            desc="Payez en espèces dès réception de votre commande."
                                        />
                                        <PaymentOption
                                            active={paymentMethod === 'wave'}
                                            onClick={() => setPaymentMethod('wave')}
                                            icon={Smartphone}
                                            title="Wave / Orange Money"
                                            desc="Paiement mobile ultra-sécurisé via Wave ou Orange Money."
                                        />
                                        <PaymentOption
                                            active={paymentMethod === 'card'}
                                            onClick={() => setPaymentMethod('card')}
                                            icon={Wallet}
                                            title="Carte Bancaire"
                                            desc="Visa, Mastercard via tunnel de paiement sécurisé."
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <Button
                                            onClick={() => setStep(1)}
                                            className="flex-1 h-14 bg-gray-100 text-[#1B1F3B] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                                        >
                                            <ArrowLeft className="w-4 h-4" /> Retour
                                        </Button>
                                        <Button
                                            onClick={() => setStep(3)}
                                            className="flex-[2] h-14 bg-[#1B1F3B] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-primary transition-all flex items-center justify-center gap-3 group"
                                        >
                                            Vérifier la commande <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </div>
                                </motion.section>
                            )}

                            {step === 3 && (
                                <motion.section
                                    key="confirm"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm"
                                >
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center text-white">
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                        <h2 className="text-xl font-black uppercase tracking-widest text-[#1B1F3B]">Dernière étape</h2>
                                    </div>

                                    <div className="space-y-8 mb-10">
                                        <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-primary shrink-0">
                                                <Home className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Livraison à</p>
                                                <p className="text-sm font-black text-[#1B1F3B]">{formData.firstName} {formData.lastName}</p>
                                                <p className="text-xs text-gray-500 font-medium">{formData.address}, {formData.area}, {formData.city}</p>
                                                <p className="text-xs text-gray-500 font-medium">Tél: {formData.phone}</p>
                                            </div>
                                            <button onClick={() => setStep(1)} className="ml-auto text-[10px] font-black text-primary uppercase hover:underline">Modifier</button>
                                        </div>

                                        <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-primary shrink-0">
                                                <CreditCard className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Mode de paiement</p>
                                                <p className="text-sm font-black text-[#1B1F3B] uppercase">
                                                    {paymentMethod === 'cash' ? 'Espèces à la livraison' : paymentMethod === 'wave' ? 'Wave / Orange Money' : 'Carte Bancaire'}
                                                </p>
                                            </div>
                                            <button onClick={() => setStep(2)} className="ml-auto text-[10px] font-black text-primary uppercase hover:underline">Modifier</button>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4 text-amber-700">
                                        <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                                        <p className="text-xs font-medium leading-relaxed">
                                            En cliquant sur "Confirmer la commande", vous acceptez nos conditions générales de vente. Votre commande sera traitée immédiatement par nos équipes.
                                        </p>
                                    </div>

                                    <div className="flex gap-4 mt-10">
                                        <Button
                                            onClick={() => setStep(2)}
                                            className="flex-1 h-14 bg-gray-100 text-[#1B1F3B] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                                        >
                                            <ArrowLeft className="w-4 h-4" /> Retour
                                        </Button>
                                        <Button
                                            onClick={handleCheckout}
                                            disabled={isSubmitting}
                                            className="flex-[2] h-14 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:bg-[#1B1F3B] transition-all flex items-center justify-center gap-3 group"
                                        >
                                            {isSubmitting ? 'Traitement...' : 'Confirmer la commande'} <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        </Button>
                                    </div>
                                </motion.section>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-24 flex flex-col gap-6">
                            <div className="bg-[#1B1F3B] rounded-[2.5rem] p-10 shadow-2xl shadow-[#1B1F3B]/30 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2" />

                                <h2 className="text-xl font-black text-white uppercase tracking-widest mb-10 pb-6 border-b border-white/10">Ma Commande</h2>

                                {/* Item List */}
                                <div className="flex flex-col gap-6 mb-10 max-h-[300px] overflow-y-auto scrollbar-hide pr-2">
                                    {cartItems.map((item) => (
                                        <CompactItem
                                            key={item.id}
                                            name={item.name}
                                            price={item.price}
                                            qty={item.qty}
                                            img={item.image}
                                        />
                                    ))}
                                </div>

                                <div className="flex flex-col gap-4 text-white mb-10">
                                    <div className="flex justify-between text-sm font-bold opacity-60">
                                        <span>Sous-total</span>
                                        <span>{subtotal.toLocaleString()} CFA</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold text-green-400">
                                        <span>Livraison</span>
                                        <span className="uppercase">{shipping === 0 ? 'Gratuite' : `${shipping.toLocaleString()} CFA`}</span>
                                    </div>
                                    <div className="h-px bg-white/10 my-2" />
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-black uppercase tracking-widest">Total à payer</span>
                                        <span className="text-3xl font-black tracking-tighter text-primary">{total.toLocaleString()} CFA</span>
                                    </div>
                                </div>

                                {error && (
                                    <div className="mb-6 flex flex-col items-center gap-3 w-full">
                                        <div className="w-full p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold text-center leading-relaxed">
                                            {error}
                                        </div>
                                        {error.includes("ne sont plus disponibles") && (
                                            <Button
                                                onClick={() => {
                                                    clearCart();
                                                    router.push('/');
                                                }}
                                                className="bg-red-600 hover:bg-red-700 text-white h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-colors w-full"
                                            >
                                                Vider le panier obsolète
                                            </Button>
                                        )}
                                    </div>
                                )}

                                <Button
                                    onClick={handleCheckout}
                                    disabled={isSubmitting}
                                    className="w-full h-16 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:bg-white hover:text-[#1B1F3B] transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Traitement...' : 'Finaliser l\'Achat'} <CheckCircle2 className="w-4 h-4 ml-2 group-hover:scale-125 transition-transform" />
                                </Button>

                                <p className="mt-8 text-center text-[9px] text-white/40 uppercase font-black tracking-widest">
                                    Paiement 100% sécurisé et garanti
                                </p>
                            </div>

                            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 flex flex-col gap-6 font-sans">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="w-5 h-5 text-primary" />
                                    <p className="text-[10px] font-black text-[#1B1F3B] uppercase tracking-widest">Garantie Baraka Shop</p>
                                </div>
                                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                    Votre commande est protégée. En cas de non-conformité, nous nous engageons à un échange ou un remboursement sous 7 jours.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </main>
    )
}

function FormInput({ label, placeholder, value, onChange }: { label: string, placeholder: string, value: string, onChange: (val: string) => void }) {
    return (
        <div className="flex flex-col gap-3">
            <span className="text-[10px] font-black text-[#1B1F3B] uppercase tracking-widest pl-2">{label}</span>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-6 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-all"
            />
        </div>
    )
}

function PaymentOption({ active, onClick, icon: Icon, title, desc }: { active: boolean, onClick: () => void, icon: any, title: string, desc: string }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-6 p-6 rounded-2xl border transition-all text-left",
                active ? "bg-primary/5 border-primary shadow-lg shadow-primary/5" : "bg-white border-gray-100 hover:border-gray-200"
            )}
        >
            <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                active ? "bg-primary text-white" : "bg-gray-50 text-gray-400"
            )}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
                <span className={cn("text-sm font-black uppercase tracking-tight", active ? "text-primary" : "text-[#1B1F3B]")}>{title}</span>
                <span className="text-xs text-gray-400 font-medium">{desc}</span>
            </div>
            <div className={cn(
                "ml-auto w-6 h-6 rounded-full border-2 flex items-center justify-center",
                active ? "border-primary bg-primary" : "border-gray-200"
            )}>
                {active && <CheckCircle2 className="w-4 h-4 text-white" />}
            </div>
        </button>
    )
}

function CompactItem({ name, price, qty, img }: { name: string, price: number, qty: number, img: string }) {
    return (
        <div className="flex items-center gap-4 group">
            <div className="relative w-14 h-14 bg-white/5 rounded-xl overflow-hidden p-2 group-hover:bg-white/10 transition-colors">
                <Image src={img} alt={name} fill className="object-contain" />
            </div>
            <div className="flex flex-col flex-1">
                <span className="text-[10px] font-bold text-white uppercase tracking-tight line-clamp-1 group-hover:text-primary transition-colors">{name}</span>
                <span className="text-sm font-black text-primary tracking-tighter">{(price * qty).toLocaleString()} CFA</span>
            </div>
            <span className="text-[10px] font-black text-white/40">x{qty}</span>
        </div>
    )
}
