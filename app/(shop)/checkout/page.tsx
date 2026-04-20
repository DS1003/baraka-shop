'use client'

import React, { useState, useMemo } from 'react'
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
    X,
    MapPin,
    Store,
    ChevronDown,
    Search
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/ui/Button'
import { cn } from '@/lib/utils'
import { useCart } from '@/context/CartContext'
import { useSession } from 'next-auth/react'
import { createOrder } from '@/lib/actions/order-actions'
import { useRouter } from 'next/navigation'
import { DELIVERY_REGIONS, type DeliveryZone } from '@/lib/delivery-zones'

export default function CheckoutPage() {
    const { data: session } = useSession()
    const { cartItems, subtotal, clearCart } = useCart()
    const router = useRouter()
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'wave' | 'card'>('cash')
    const [step, setStep] = useState(1) // 1: Delivery Method, 2: Address/Zone, 3: Payment, 4: Confirm
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    // Delivery state
    const [deliveryMethod, setDeliveryMethod] = useState<'livraison' | 'retrait'>('livraison')
    const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null)
    const [expandedRegion, setExpandedRegion] = useState<string | null>(null)
    const [zoneSearch, setZoneSearch] = useState('')

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        address: (session?.user as any)?.address || '',
        city: 'Dakar',
        area: '',
        phone: (session?.user as any)?.phone || ''
    })

    const shipping = deliveryMethod === 'retrait' ? 0 : (selectedZone?.price ?? 0)
    const total = subtotal + shipping

    // Filtered regions based on search
    const filteredRegions = useMemo(() => {
        if (!zoneSearch.trim()) return DELIVERY_REGIONS
        const q = zoneSearch.toLowerCase()
        return DELIVERY_REGIONS.map(region => ({
            ...region,
            zones: region.zones.filter(z => z.name.toLowerCase().includes(q))
        })).filter(r => r.zones.length > 0)
    }, [zoneSearch])

    const handleCheckout = async () => {
        if (!session) {
            setError('Vous devez être connecté pour commander.')
            return
        }

        if (deliveryMethod === 'livraison') {
            if (!selectedZone) {
                setError('Veuillez sélectionner votre zone de livraison.')
                return
            }
            if (!formData.firstName || !formData.lastName || !formData.address || !formData.phone) {
                setError('Veuillez remplir tous les champs obligatoires.')
                return
            }
        } else {
            if (!formData.firstName || !formData.lastName || !formData.phone) {
                setError('Veuillez remplir votre nom et téléphone.')
                return
            }
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
            deliveryMethod,
            deliveryZone: selectedZone?.name,
            shippingCost: shipping,
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
                <div className="max-w-3xl mx-auto mb-16 px-4">
                    <div className="flex items-center justify-between relative">
                        {/* Progress Line */}
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 z-0" />
                        <motion.div
                            className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0"
                            initial={{ width: '0%' }}
                            animate={{ width: step === 1 ? '0%' : step === 2 ? '33%' : step === 3 ? '66%' : '100%' }}
                            transition={{ duration: 0.5 }}
                        />

                        {/* Step Circles */}
                        {[
                            { id: 1, label: 'Mode', icon: Truck },
                            { id: 2, label: 'Adresse', icon: Home },
                            { id: 3, label: 'Paiement', icon: CreditCard },
                            { id: 4, label: 'Confirmation', icon: ShieldCheck }
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
                            {/* STEP 1: Delivery Method Selection */}
                            {step === 1 && (
                                <motion.section
                                    key="delivery-method"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm"
                                >
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="w-12 h-12 rounded-2xl bg-[#1B1F3B] flex items-center justify-center text-white">
                                            <Truck className="w-6 h-6" />
                                        </div>
                                        <h2 className="text-xl font-black uppercase tracking-widest text-[#1B1F3B]">Mode de Réception</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                                        {/* Livraison Option */}
                                        <button
                                            onClick={() => setDeliveryMethod('livraison')}
                                            className={cn(
                                                "relative flex flex-col items-center gap-5 p-8 rounded-3xl border-2 transition-all text-center group overflow-hidden",
                                                deliveryMethod === 'livraison'
                                                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                                                    : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-md"
                                            )}
                                        >
                                            {deliveryMethod === 'livraison' && (
                                                <motion.div
                                                    layoutId="delivery-check"
                                                    className="absolute top-4 right-4 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </motion.div>
                                            )}
                                            <div className={cn(
                                                "w-20 h-20 rounded-3xl flex items-center justify-center transition-all",
                                                deliveryMethod === 'livraison'
                                                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                                                    : "bg-gray-50 text-gray-400 group-hover:bg-gray-100"
                                            )}>
                                                <Truck className="w-9 h-9" />
                                            </div>
                                            <div>
                                                <p className={cn(
                                                    "text-sm font-black uppercase tracking-widest mb-1",
                                                    deliveryMethod === 'livraison' ? "text-primary" : "text-[#1B1F3B]"
                                                )}>Livraison à Domicile</p>
                                                <p className="text-xs text-gray-400 font-medium">
                                                    Recevez votre commande directement chez vous
                                                </p>
                                            </div>
                                        </button>

                                        {/* Retrait en boutique Option */}
                                        <button
                                            onClick={() => {
                                                setDeliveryMethod('retrait')
                                                setSelectedZone(null)
                                            }}
                                            className={cn(
                                                "relative flex flex-col items-center gap-5 p-8 rounded-3xl border-2 transition-all text-center group overflow-hidden",
                                                deliveryMethod === 'retrait'
                                                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                                                    : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-md"
                                            )}
                                        >
                                            {deliveryMethod === 'retrait' && (
                                                <motion.div
                                                    layoutId="delivery-check"
                                                    className="absolute top-4 right-4 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </motion.div>
                                            )}
                                            <div className={cn(
                                                "w-20 h-20 rounded-3xl flex items-center justify-center transition-all",
                                                deliveryMethod === 'retrait'
                                                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                                                    : "bg-gray-50 text-gray-400 group-hover:bg-gray-100"
                                            )}>
                                                <Store className="w-9 h-9" />
                                            </div>
                                            <div>
                                                <p className={cn(
                                                    "text-sm font-black uppercase tracking-widest mb-1",
                                                    deliveryMethod === 'retrait' ? "text-primary" : "text-[#1B1F3B]"
                                                )}>Retrait en Boutique</p>
                                                <p className="text-xs text-gray-400 font-medium">
                                                    Venez récupérer gratuitement en magasin
                                                </p>
                                            </div>
                                            {deliveryMethod === 'retrait' && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="mt-2 px-4 py-2 bg-green-50 rounded-xl border border-green-100"
                                                >
                                                    <span className="text-xs font-black text-green-600 uppercase tracking-widest">Gratuit !</span>
                                                </motion.div>
                                            )}
                                        </button>
                                    </div>

                                    {/* Zone Selection — Only show for livraison */}
                                    <AnimatePresence>
                                        {deliveryMethod === 'livraison' && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="mb-10">
                                                    <div className="flex items-center gap-3 mb-6">
                                                        <MapPin className="w-5 h-5 text-primary" />
                                                        <h3 className="text-sm font-black uppercase tracking-widest text-[#1B1F3B]">
                                                            Choisissez votre zone de livraison
                                                        </h3>
                                                    </div>

                                                    {/* Zone Search */}
                                                    <div className="relative mb-6">
                                                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                        <input
                                                            type="text"
                                                            value={zoneSearch}
                                                            onChange={(e) => setZoneSearch(e.target.value)}
                                                            placeholder="Rechercher votre quartier..."
                                                            className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl pl-14 pr-6 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-all"
                                                        />
                                                        {zoneSearch && (
                                                            <button
                                                                onClick={() => setZoneSearch('')}
                                                                className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-300 transition"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Selected Zone Badge */}
                                                    {selectedZone && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-2xl mb-6"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
                                                                    <MapPin className="w-5 h-5" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-black text-[#1B1F3B]">{selectedZone.name}</p>
                                                                    <p className="text-xs font-bold text-primary">{selectedZone.price.toLocaleString()} F CFA</p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => setSelectedZone(null)}
                                                                className="text-[10px] font-black text-red-500 uppercase hover:underline"
                                                            >
                                                                Changer
                                                            </button>
                                                        </motion.div>
                                                    )}

                                                    {/* Regions Accordion */}
                                                    <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                                                        {filteredRegions.map((region) => (
                                                            <div
                                                                key={region.id}
                                                                className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden"
                                                            >
                                                                <button
                                                                    onClick={() => setExpandedRegion(
                                                                        expandedRegion === region.id ? null : region.id
                                                                    )}
                                                                    className="w-full flex items-center justify-between p-5 hover:bg-gray-100/50 transition-colors"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-lg">{region.emoji}</span>
                                                                        <span className="text-xs font-black uppercase tracking-widest text-[#1B1F3B]">
                                                                            {region.label}
                                                                        </span>
                                                                        <span className="text-[10px] font-bold text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-100">
                                                                            {region.zones.length} zones
                                                                        </span>
                                                                    </div>
                                                                    <ChevronDown className={cn(
                                                                        "w-4 h-4 text-gray-400 transition-transform duration-200",
                                                                        expandedRegion === region.id && "rotate-180"
                                                                    )} />
                                                                </button>

                                                                <AnimatePresence>
                                                                    {expandedRegion === region.id && (
                                                                        <motion.div
                                                                            initial={{ height: 0, opacity: 0 }}
                                                                            animate={{ height: 'auto', opacity: 1 }}
                                                                            exit={{ height: 0, opacity: 0 }}
                                                                            transition={{ duration: 0.2 }}
                                                                            className="overflow-hidden"
                                                                        >
                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 pt-0">
                                                                                {region.zones.map((zone) => {
                                                                                    const isSelected = selectedZone?.name === zone.name
                                                                                    return (
                                                                                        <button
                                                                                            key={zone.name}
                                                                                            onClick={() => setSelectedZone(zone)}
                                                                                            className={cn(
                                                                                                "flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all",
                                                                                                isSelected
                                                                                                    ? "bg-primary text-white shadow-md shadow-primary/20"
                                                                                                    : "bg-white border border-gray-100 hover:border-primary/30 hover:bg-primary/5"
                                                                                            )}
                                                                                        >
                                                                                            <span className={cn(
                                                                                                "text-xs font-bold truncate pr-2",
                                                                                                isSelected ? "text-white" : "text-[#1B1F3B]"
                                                                                            )}>
                                                                                                {zone.name}
                                                                                            </span>
                                                                                            <span className={cn(
                                                                                                "text-[10px] font-black uppercase tracking-wide shrink-0",
                                                                                                isSelected ? "text-white/80" : "text-primary"
                                                                                            )}>
                                                                                                {zone.price.toLocaleString()}F
                                                                                            </span>
                                                                                        </button>
                                                                                    )
                                                                                })}
                                                                            </div>
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>
                                                        ))}

                                                        {filteredRegions.length === 0 && (
                                                            <div className="text-center py-10 text-gray-400">
                                                                <MapPin className="w-8 h-8 mx-auto mb-3 opacity-30" />
                                                                <p className="text-xs font-bold uppercase tracking-widest">Aucune zone trouvée pour "{zoneSearch}"</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <Button
                                        onClick={() => {
                                            if (deliveryMethod === 'livraison' && !selectedZone) {
                                                setError('Veuillez d\'abord sélectionner votre zone de livraison.')
                                                return
                                            }
                                            setError('')
                                            setStep(2)
                                        }}
                                        className="w-full h-16 bg-[#1B1F3B] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-primary transition-all flex items-center justify-center gap-3 group"
                                    >
                                        Continuer <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>

                                    {error && step === 1 && (
                                        <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold text-center">
                                            {error}
                                        </div>
                                    )}
                                </motion.section>
                            )}

                            {/* STEP 2: Address */}
                            {step === 2 && (
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
                                        <h2 className="text-xl font-black uppercase tracking-widest text-[#1B1F3B]">
                                            {deliveryMethod === 'livraison' ? 'Adresse de Livraison' : 'Informations de Contact'}
                                        </h2>
                                    </div>

                                    {/* Display chosen delivery info */}
                                    {deliveryMethod === 'livraison' && selectedZone && (
                                        <div className="flex items-center gap-4 p-5 bg-primary/5 rounded-2xl border border-primary/10 mb-8">
                                            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-0.5">Zone de livraison</p>
                                                <p className="text-sm font-bold text-[#1B1F3B]">{selectedZone.name}</p>
                                            </div>
                                            <span className="text-sm font-black text-primary">{selectedZone.price.toLocaleString()} F</span>
                                        </div>
                                    )}

                                    {deliveryMethod === 'retrait' && (
                                        <div className="flex items-center gap-4 p-5 bg-green-50 rounded-2xl border border-green-100 mb-8">
                                            <div className="w-10 h-10 rounded-xl bg-green-500 text-white flex items-center justify-center shrink-0">
                                                <Store className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-0.5">Retrait en boutique</p>
                                                <p className="text-sm font-bold text-green-700">Baraka Shop — Dakar</p>
                                            </div>
                                            <span className="text-sm font-black text-green-600 ml-auto uppercase">Gratuit</span>
                                        </div>
                                    )}

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
                                        {deliveryMethod === 'livraison' && (
                                            <div className="md:col-span-2">
                                                <FormInput
                                                    label="Adresse complète"
                                                    placeholder="123 Avenue Blaise Diagne, Plateau"
                                                    value={formData.address}
                                                    onChange={(val) => setFormData({ ...formData, address: val })}
                                                />
                                            </div>
                                        )}
                                        {deliveryMethod === 'livraison' && (
                                            <>
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
                                            </>
                                        )}
                                        <div className="md:col-span-2">
                                            <FormInput
                                                label="Téléphone"
                                                placeholder="+221 77 000 00 00"
                                                value={formData.phone}
                                                onChange={(val) => setFormData({ ...formData, phone: val })}
                                            />
                                        </div>
                                    </form>

                                    <div className="flex gap-4">
                                        <Button
                                            onClick={() => setStep(1)}
                                            className="flex-1 h-14 bg-gray-100 text-[#1B1F3B] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                                        >
                                            <ArrowLeft className="w-4 h-4" /> Retour
                                        </Button>
                                        <Button
                                            onClick={() => setStep(3)}
                                            className="flex-[2] h-16 bg-[#1B1F3B] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-primary transition-all flex items-center justify-center gap-3 group"
                                        >
                                            Continuer vers le paiement <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </div>
                                </motion.section>
                            )}

                            {/* STEP 3: Payment */}
                            {step === 3 && (
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
                                            title={deliveryMethod === 'livraison' ? "Paiement à la livraison" : "Paiement au retrait"}
                                            desc={deliveryMethod === 'livraison' ? "Payez en espèces dès réception de votre commande." : "Payez en espèces lors du retrait en boutique."}
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
                                            onClick={() => setStep(2)}
                                            className="flex-1 h-14 bg-gray-100 text-[#1B1F3B] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                                        >
                                            <ArrowLeft className="w-4 h-4" /> Retour
                                        </Button>
                                        <Button
                                            onClick={() => setStep(4)}
                                            className="flex-[2] h-14 bg-[#1B1F3B] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-primary transition-all flex items-center justify-center gap-3 group"
                                        >
                                            Vérifier la commande <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </div>
                                </motion.section>
                            )}

                            {/* STEP 4: Confirmation */}
                            {step === 4 && (
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
                                        {/* Delivery Method Summary */}
                                        <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-primary shrink-0">
                                                {deliveryMethod === 'livraison' ? <Truck className="w-4 h-4" /> : <Store className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Mode de réception</p>
                                                <p className="text-sm font-black text-[#1B1F3B] uppercase">
                                                    {deliveryMethod === 'livraison' ? 'Livraison à domicile' : 'Retrait en boutique'}
                                                </p>
                                                {deliveryMethod === 'livraison' && selectedZone && (
                                                    <p className="text-xs text-primary font-bold mt-1">
                                                        🗺️ {selectedZone.name} — {selectedZone.price.toLocaleString()} F CFA
                                                    </p>
                                                )}
                                                {deliveryMethod === 'retrait' && (
                                                    <p className="text-xs text-green-600 font-bold mt-1">✅ Gratuit</p>
                                                )}
                                            </div>
                                            <button onClick={() => setStep(1)} className="ml-auto text-[10px] font-black text-primary uppercase hover:underline">Modifier</button>
                                        </div>

                                        {/* Address Summary */}
                                        <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-primary shrink-0">
                                                <Home className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                                    {deliveryMethod === 'livraison' ? 'Livraison à' : 'Contact'}
                                                </p>
                                                <p className="text-sm font-black text-[#1B1F3B]">{formData.firstName} {formData.lastName}</p>
                                                {deliveryMethod === 'livraison' && (
                                                    <p className="text-xs text-gray-500 font-medium">{formData.address}, {formData.area}, {formData.city}</p>
                                                )}
                                                <p className="text-xs text-gray-500 font-medium">Tél: {formData.phone}</p>
                                            </div>
                                            <button onClick={() => setStep(2)} className="ml-auto text-[10px] font-black text-primary uppercase hover:underline">Modifier</button>
                                        </div>

                                        {/* Payment Summary */}
                                        <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-primary shrink-0">
                                                <CreditCard className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Mode de paiement</p>
                                                <p className="text-sm font-black text-[#1B1F3B] uppercase">
                                                    {paymentMethod === 'cash' ? (deliveryMethod === 'livraison' ? 'Espèces à la livraison' : 'Espèces au retrait') : paymentMethod === 'wave' ? 'Wave / Orange Money' : 'Carte Bancaire'}
                                                </p>
                                            </div>
                                            <button onClick={() => setStep(3)} className="ml-auto text-[10px] font-black text-primary uppercase hover:underline">Modifier</button>
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
                                            onClick={() => setStep(3)}
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
                                        <span className="flex items-center gap-2">
                                            {deliveryMethod === 'livraison' ? (
                                                <>
                                                    <Truck className="w-3 h-3" />
                                                    Livraison {selectedZone ? `(${selectedZone.name})` : ''}
                                                </>
                                            ) : (
                                                <>
                                                    <Store className="w-3 h-3" />
                                                    Retrait en boutique
                                                </>
                                            )}
                                        </span>
                                        <span className="uppercase">{shipping === 0 ? 'Gratuit' : `${shipping.toLocaleString()} CFA`}</span>
                                    </div>
                                    <div className="h-px bg-white/10 my-2" />
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-black uppercase tracking-widest">Total à payer</span>
                                        <span className="text-3xl font-black tracking-tighter text-primary">{total.toLocaleString()} CFA</span>
                                    </div>
                                </div>

                                {error && step !== 1 && (
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
