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
import {
    CheckoutBreadcrumb,
    CheckoutStepper,
    CheckoutSection,
    CheckoutSectionHeader,
    CheckoutNavButtons,
    CheckoutError,
    CheckoutOrderSummary,
    CheckoutMobileBar,
    FormInput,
    PaymentOption,
} from '@/features/checkout/CheckoutUI'

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

    const goBack = () => {
        setError('')
        setStep((s) => Math.max(1, s - 1))
    }

    const goToNextStep = () => {
        setError('')
        if (step === 1) {
            if (deliveryMethod === 'livraison' && !selectedZone) {
                setError('Veuillez sélectionner votre zone de livraison.')
                return
            }
            setStep(2)
            return
        }
        if (step === 2) {
            if (!formData.firstName || !formData.lastName || !formData.phone) {
                setError('Veuillez remplir votre nom et téléphone.')
                return
            }
            if (deliveryMethod === 'livraison' && !formData.address) {
                setError('Veuillez indiquer votre adresse de livraison.')
                return
            }
            setStep(3)
            return
        }
        if (step === 3) {
            setStep(4)
        }
    }

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
                productId: item.productId || item.id, // Fallback to id if productId is missing (for older carts)
                quantity: item.qty,
                price: item.price,
                selectedColor: item.selectedColor
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
        <main className="bg-[#f8f9fb] min-h-screen py-6 sm:py-10 lg:py-12 pb-28 lg:pb-12">
            <Container className="px-4 sm:px-6">
                <CheckoutBreadcrumb />

                <h1 className="text-2xl sm:text-3xl font-black text-[#1B1F3B] uppercase tracking-tight mb-4 sm:mb-6 lg:hidden">
                    Finaliser la commande
                </h1>

                <CheckoutStepper step={step} onStepClick={setStep} />

                <div className="lg:hidden mb-6">
                    <CheckoutOrderSummary
                        compact
                        cartItems={cartItems}
                        subtotal={subtotal}
                        shipping={shipping}
                        total={total}
                        deliveryMethod={deliveryMethod}
                        selectedZoneName={selectedZone?.name}
                    />
                </div>


                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 xl:gap-12">
                    {/* Checkout Form */}
                    <div className="lg:col-span-7 min-w-0">
                        <AnimatePresence mode="wait">
                            {/* STEP 1: Delivery Method Selection */}
                            {step === 1 && (
                                <motion.section
                                    key="delivery-method"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="bg-white rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-5 sm:p-8 lg:p-10 border border-gray-100 shadow-sm"
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
                                                "relative flex flex-col items-center gap-4 sm:gap-5 p-5 sm:p-8 rounded-2xl sm:rounded-3xl border-2 transition-all text-center group overflow-hidden",
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
                                                "relative flex flex-col items-center gap-4 sm:gap-5 p-5 sm:p-8 rounded-2xl sm:rounded-3xl border-2 transition-all text-center group overflow-hidden",
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
                                                            className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl pl-14 pr-6 text-base sm:text-sm font-bold outline-none focus:bg-white focus:border-primary transition-all"
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
                                                                    <p className="text-xs font-bold text-primary">{selectedZone.price.toLocaleString()} FCFA</p>
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
                                                    <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
                                                        {filteredRegions.map((region) => {
                                                            const isExpanded = expandedRegion === region.id
                                                            return (
                                                                <div
                                                                    key={region.id}
                                                                    className={cn(
                                                                        "rounded-2xl border transition-all",
                                                                        isExpanded
                                                                            ? "bg-white border-primary/30 shadow-lg"
                                                                            : "bg-[#fafafa] border-gray-100 hover:border-gray-200"
                                                                    )}
                                                                >
                                                                    {/* Region Header */}
                                                                    <button
                                                                        onClick={() => setExpandedRegion(isExpanded ? null : region.id)}
                                                                        className="w-full flex items-center gap-4 p-4 cursor-pointer"
                                                                    >
                                                                        <span className="text-xl shrink-0">{region.emoji}</span>
                                                                        <div className="flex-1 text-left">
                                                                            <p className="text-xs font-black uppercase tracking-wider text-[#1B1F3B]">
                                                                                {region.label}
                                                                            </p>
                                                                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                                                                {region.zones.length} quartier{region.zones.length > 1 ? 's' : ''}
                                                                            </p>
                                                                        </div>
                                                                        <ChevronDown className={cn(
                                                                            "w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200",
                                                                            isExpanded && "rotate-180 text-primary"
                                                                        )} />
                                                                    </button>

                                                                    {/* Zone Cards Grid */}
                                                                    {isExpanded && (
                                                                        <div className="px-4 pb-4">
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {region.zones.map((zone) => {
                                                                                    const isSelected = selectedZone?.name === zone.name
                                                                                    return (
                                                                                        <button
                                                                                            key={zone.name}
                                                                                            onClick={() => setSelectedZone(zone)}
                                                                                            className={cn(
                                                                                                "flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all min-w-0",
                                                                                                "w-full sm:basis-[calc(50%-0.25rem)] sm:w-auto shrink-0 grow-0",
                                                                                                isSelected
                                                                                                    ? "bg-primary text-white shadow-md shadow-primary/20 border-2 border-primary"
                                                                                                    : "bg-white border-2 border-gray-100 hover:border-primary/30 hover:shadow-sm"
                                                                                            )}
                                                                                        >
                                                                                            <span className={cn(
                                                                                                "text-xs font-bold truncate",
                                                                                                isSelected ? "text-white" : "text-[#1B1F3B]"
                                                                                            )}>
                                                                                                {zone.name}
                                                                                            </span>
                                                                                            <span className={cn(
                                                                                                "text-[10px] font-black shrink-0 whitespace-nowrap",
                                                                                                isSelected ? "text-white/90" : "text-primary"
                                                                                            )}>
                                                                                                {zone.price.toLocaleString()}F
                                                                                            </span>
                                                                                        </button>
                                                                                    )
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )
                                                        })}

                                                        {filteredRegions.length === 0 && (
                                                            <div className="text-center py-10 text-gray-400">
                                                                <MapPin className="w-8 h-8 mx-auto mb-3 opacity-30" />
                                                                <p className="text-xs font-bold uppercase tracking-widest">Aucune zone trouvée pour &quot;{zoneSearch}&quot;</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <motion.div className="hidden lg:block">
                                        <CheckoutNavButtons showBack={false} onNext={goToNextStep} nextLabel="Continuer" />
                                    </motion.div>
                                    <CheckoutError message={step === 1 ? error : ''} />
                                </motion.section>
                            )}

                            {/* STEP 2: Address */}
                            {step === 2 && (
                                <motion.section
                                    key="address"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="bg-white rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-5 sm:p-8 lg:p-10 border border-gray-100 shadow-sm"
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

                                    <motion.div className="hidden lg:block">
                                        <CheckoutNavButtons onBack={goBack} onNext={goToNextStep} nextLabel="Continuer" />
                                    </motion.div>
                                </motion.section>
                            )}

                            {/* STEP 3: Payment */}
                            {step === 3 && (
                                <motion.section
                                    key="payment"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="bg-white rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-5 sm:p-8 lg:p-10 border border-gray-100 shadow-sm"
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

                                    <motion.div className="hidden lg:block">
                                        <CheckoutNavButtons onBack={goBack} onNext={goToNextStep} nextLabel="Vérifier" />
                                    </motion.div>
                                </motion.section>
                            )}

                            {/* STEP 4: Confirmation */}
                            {step === 4 && (
                                <motion.section
                                    key="confirm"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="bg-white rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-5 sm:p-8 lg:p-10 border border-gray-100 shadow-sm"
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
                                                        🗺️ {selectedZone.name} — {selectedZone.price.toLocaleString()} FCFA
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

                                    <motion.div className="hidden lg:block mt-8">
                                        <CheckoutNavButtons
                                            onBack={goBack}
                                            onNext={handleCheckout}
                                            nextLabel={isSubmitting ? 'Traitement…' : 'Confirmer'}
                                        />
                                    </motion.div>
                                    <CheckoutError message={step === 4 ? error : ''} />
                                </motion.section>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Récapitulatif — desktop */}
                    <div className="hidden lg:block lg:col-span-5">
                        <div className="sticky top-20 xl:top-24 flex flex-col gap-5">
                            <CheckoutOrderSummary
                                cartItems={cartItems}
                                subtotal={subtotal}
                                shipping={shipping}
                                total={total}
                                deliveryMethod={deliveryMethod}
                                selectedZoneName={selectedZone?.name}
                            />

                            {error && step !== 1 && step !== 4 && (
                                <motion.div className="space-y-3">
                                    <CheckoutError message={error} />
                                    {error.includes('ne sont plus disponibles') && (
                                        <Button
                                            onClick={() => {
                                                clearCart()
                                                router.push('/')
                                            }}
                                            className="w-full bg-red-600 hover:bg-red-700 text-white h-12 rounded-xl font-black text-[10px] uppercase"
                                        >
                                            Vider le panier obsolète
                                        </Button>
                                    )}
                                </motion.div>
                            )}

                            {step === 4 && (
                                <Button
                                    onClick={handleCheckout}
                                    disabled={isSubmitting}
                                    className="w-full h-14 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-[#1B1F3B] transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Traitement…' : 'Confirmer la commande'}
                                </Button>
                            )}

                            <div className="bg-white rounded-2xl p-5 border border-gray-100 flex gap-3">
                                <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                    Commande protégée — échange ou remboursement sous 7 jours.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <CheckoutMobileBar
                    step={step}
                    total={total}
                    itemCount={cartItems.length}
                    isSubmitting={isSubmitting}
                    onBack={goBack}
                    onNext={goToNextStep}
                    onConfirm={handleCheckout}
                />

                {error && step !== 1 && step !== 4 && (
                    <motion.div className="lg:hidden mt-4">
                        <CheckoutError message={error} />
                    </motion.div>
                )}
            </Container>
        </main>
    )
}
