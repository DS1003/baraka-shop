'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Container } from '@/ui/Container'
import Link from 'next/link'
import {
    ChevronRight,
    CreditCard,
    Truck,
    ShieldCheck,
    CheckCircle2,
    ArrowLeft,
    Wallet,
    Home,
    Smartphone,
    X,
    MapPin,
    Store,
    ChevronDown,
    Search,
    User,
    Phone,
    LogIn,
    AlertCircle,
    Building,
    FileText
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
    MobileOrderSummaryAccordion,
    FormInput,
    PaymentOption,
} from '@/features/checkout/CheckoutUI'

interface AppliedCoupon {
    couponCode: string;
    campaignName: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
}

const POPULAR_ZONES = ['Plateau', 'Almadies', 'Ouakam', 'Point E', 'Maristes', 'Yoff', 'Mermoz', 'Grand Dakar'];

export default function CheckoutPage() {
    const { data: session, status: authStatus } = useSession()
    const { cartItems, subtotal, clearCart, itemCount } = useCart()
    const router = useRouter()
    
    const [step, setStep] = useState(1) // 1: Delivery Mode & Zone, 2: Address/Contact, 3: Payment, 4: Confirm
    const [paymentMethod] = useState<'cash'>('cash')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)

    // Delivery state
    const [deliveryMethod, setDeliveryMethod] = useState<'livraison' | 'retrait'>('livraison')
    const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null)
    const [expandedRegion, setExpandedRegion] = useState<string | null>('centre-ville')
    const [zoneSearch, setZoneSearch] = useState('')

    // Form data with smart user pre-filling
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        address: '',
        city: 'Dakar',
        area: '',
        phone: '',
        deliveryNote: '',
    })

    // Pre-fill user details once session is loaded
    useEffect(() => {
        if (session?.user) {
            const fullName = session.user.name || ''
            const nameParts = fullName.trim().split(' ')
            setFormData(prev => ({
                ...prev,
                firstName: prev.firstName || nameParts[0] || '',
                lastName: prev.lastName || nameParts.slice(1).join(' ') || '',
                phone: prev.phone || (session.user as any)?.phone || '',
                address: prev.address || (session.user as any)?.address || '',
            }))
        }
    }, [session])

    const shipping = deliveryMethod === 'retrait' ? 0 : (selectedZone?.price ?? 0)
    const discount = appliedCoupon?.discountAmount || 0
    const total = Math.max(0, subtotal - discount + shipping)

    // Load saved coupon from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('baraka-applied-coupon')
        if (saved) {
            try {
                const parsed = JSON.parse(saved) as AppliedCoupon
                revalidateCoupon(parsed.couponCode)
            } catch {
                localStorage.removeItem('baraka-applied-coupon')
            }
        }
    }, [subtotal])

    const revalidateCoupon = async (code: string) => {
        try {
            const res = await fetch('/api/promotions/validate-coupon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, subtotal }),
            })
            const data = await res.json()
            if (data.valid) {
                const coupon: AppliedCoupon = {
                    couponCode: data.couponCode,
                    campaignName: data.campaignName,
                    discountType: data.discountType,
                    discountValue: data.discountValue,
                    discountAmount: data.discountAmount,
                }
                setAppliedCoupon(coupon)
                localStorage.setItem('baraka-applied-coupon', JSON.stringify(coupon))
            } else {
                setAppliedCoupon(null)
                localStorage.removeItem('baraka-applied-coupon')
            }
        } catch {
            // Silently fail on revalidation
        }
    }

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
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const goToNextStep = () => {
        setError('')
        if (step === 1) {
            if (deliveryMethod === 'livraison' && !selectedZone) {
                setError('Veuillez sélectionner votre quartier ou zone de livraison.')
                return
            }
            setStep(2)
            window.scrollTo({ top: 0, behavior: 'smooth' })
            return
        }
        if (step === 2) {
            if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.phone.trim()) {
                setError('Veuillez renseigner votre prénom, nom et numéro de téléphone.')
                return
            }
            if (deliveryMethod === 'livraison' && !formData.address.trim()) {
                setError('Veuillez indiquer une adresse de livraison.')
                return
            }
            setStep(3)
            window.scrollTo({ top: 0, behavior: 'smooth' })
            return
        }
        if (step === 3) {
            setStep(4)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const handleCheckout = async () => {
        if (!session?.user) {
            setError('Vous devez être connecté pour finaliser votre commande.')
            return
        }

        if (deliveryMethod === 'livraison') {
            if (!selectedZone) {
                setError('Veuillez sélectionner votre zone de livraison.')
                setStep(1)
                return
            }
            if (!formData.firstName || !formData.lastName || !formData.address || !formData.phone) {
                setError('Veuillez remplir vos coordonnées de livraison.')
                setStep(2)
                return
            }
        } else {
            if (!formData.firstName || !formData.lastName || !formData.phone) {
                setError('Veuillez renseigner votre nom et numéro de téléphone.')
                setStep(2)
                return
            }
        }

        setIsSubmitting(true)
        setError('')

        const orderData = {
            items: cartItems.map(item => ({
                productId: (item as any).productId || item.id,
                quantity: item.qty,
                price: item.price,
                selectedColor: item.selectedColor
            })),
            total,
            paymentMethod,
            deliveryMethod,
            deliveryZone: selectedZone?.name,
            shippingCost: shipping,
            couponCode: appliedCoupon?.couponCode,
            shippingDetails: {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                address: deliveryMethod === 'livraison' ? formData.address.trim() : 'Retrait boutique Baraka Shop',
                city: formData.city.trim(),
                area: formData.area.trim() || selectedZone?.name || '',
                phone: formData.phone.trim()
            }
        }

        try {
            const result = await createOrder(orderData)
            if (result.success) {
                clearCart()
                localStorage.removeItem('baraka-applied-coupon')
                router.push(`/order-success?orderId=${result.orderId}`)
            } else {
                setError(result.error || 'Une erreur est survenue lors de la création de la commande.')
            }
        } catch (err: any) {
            console.error('Order creation error:', err)
            setError('Erreur de connexion au serveur. Veuillez vérifier votre réseau et réessayer.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (cartItems.length === 0) {
        return (
            <main className="bg-[#f8f9fb] min-h-screen py-16 sm:py-24 flex items-center justify-center">
                <Container className="px-4 text-center">
                    <div className="max-w-md mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-sm">
                        <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Truck className="w-10 h-10" />
                        </div>
                        <h1 className="text-2xl font-black text-[#1B1F3B] uppercase tracking-tight mb-3">
                            Votre panier est vide
                        </h1>
                        <p className="text-slate-500 text-xs sm:text-sm font-medium mb-8">
                            Ajoutez des articles à votre panier pour pouvoir finaliser votre commande.
                        </p>
                        <Link href="/boutique" className="w-full">
                            <Button className="w-full h-14 bg-orange-600 hover:bg-[#1B1F3B] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-600/20">
                                Explorer la boutique
                            </Button>
                        </Link>
                    </div>
                </Container>
            </main>
        )
    }

    return (
        <main className="bg-[#f8f9fb] min-h-screen pt-4 sm:pt-8 pb-32 lg:pb-16">
            <Container className="px-4 sm:px-6">
                
                <CheckoutBreadcrumb />

                {/* Mobile Order Summary Accordion (Sticky collapsible drawer) */}
                <MobileOrderSummaryAccordion
                    cartItems={cartItems}
                    subtotal={subtotal}
                    shipping={shipping}
                    discount={discount}
                    total={total}
                    deliveryMethod={deliveryMethod}
                    selectedZoneName={selectedZone?.name}
                />

                {/* Stepper (Mobile & Desktop) */}
                <CheckoutStepper step={step} onStepClick={setStep} />

                {/* Non-authenticated user friendly banner */}
                {!session && (
                    <div className="mb-6 p-4 sm:p-4.5 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-center justify-between gap-3 text-amber-900 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                <User className="w-4 h-4" />
                            </div>
                            <div className="text-xs">
                                <p className="font-black uppercase tracking-wider">Déjà client Baraka Shop ?</p>
                                <p className="text-amber-700 font-medium">Connectez-vous pour récupérer vos adresses enregistrées.</p>
                            </div>
                        </div>
                        <Link 
                            href="/login?callbackUrl=/checkout" 
                            className="px-3.5 py-2 bg-amber-900 hover:bg-amber-800 text-white rounded-xl text-[11px] font-black uppercase tracking-wider shrink-0 transition-colors"
                        >
                            Connexion
                        </Link>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
                    
                    {/* Main Step Area */}
                    <div className="lg:col-span-7 min-w-0">
                        <AnimatePresence mode="wait">
                            
                            {/* STEP 1: Delivery Mode & Zone */}
                            {step === 1 && (
                                <motion.section
                                    key="step-delivery"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-100 shadow-sm"
                                >
                                    <CheckoutSectionHeader
                                        icon={Truck}
                                        title="Mode de Réception"
                                        subtitle="Sélectionnez votre mode de livraison préféré"
                                    />

                                    {/* 2 Big Choice Cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 mb-8">
                                        
                                        {/* Home Delivery Card */}
                                        <button
                                            type="button"
                                            onClick={() => setDeliveryMethod('livraison')}
                                            className={cn(
                                                "relative p-5 rounded-2xl border-2 transition-all text-left flex sm:flex-col items-center sm:items-start gap-4 group",
                                                deliveryMethod === 'livraison'
                                                    ? "bg-orange-50/40 border-orange-600 shadow-sm"
                                                    : "bg-white border-slate-200/80 hover:border-slate-300"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors",
                                                deliveryMethod === 'livraison' ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-500"
                                            )}>
                                                <Truck className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn("text-xs sm:text-sm font-black uppercase tracking-tight", deliveryMethod === 'livraison' ? "text-orange-600" : "text-[#1B1F3B]")}>
                                                        Livraison Domicile
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                                                    Livré à Dakar & banlieue sous 24h
                                                </p>
                                            </div>
                                            <div className={cn(
                                                "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                                                deliveryMethod === 'livraison' ? "border-orange-600 bg-orange-600 text-white" : "border-slate-300"
                                            )}>
                                                {deliveryMethod === 'livraison' && <div className="w-2 h-2 rounded-full bg-white" />}
                                            </div>
                                        </button>

                                        {/* Store Pickup Card */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setDeliveryMethod('retrait')
                                                setSelectedZone(null)
                                            }}
                                            className={cn(
                                                "relative p-5 rounded-2xl border-2 transition-all text-left flex sm:flex-col items-center sm:items-start gap-4 group",
                                                deliveryMethod === 'retrait'
                                                    ? "bg-emerald-50/40 border-emerald-600 shadow-sm"
                                                    : "bg-white border-slate-200/80 hover:border-slate-300"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors",
                                                deliveryMethod === 'retrait' ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"
                                            )}>
                                                <Store className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn("text-xs sm:text-sm font-black uppercase tracking-tight", deliveryMethod === 'retrait' ? "text-emerald-700" : "text-[#1B1F3B]")}>
                                                        Retrait Boutique
                                                    </span>
                                                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-black rounded uppercase">
                                                        Gratuit
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                                                    Disponible sous 2h en magasin
                                                </p>
                                            </div>
                                            <div className={cn(
                                                "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                                                deliveryMethod === 'retrait' ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300"
                                            )}>
                                                {deliveryMethod === 'retrait' && <div className="w-2 h-2 rounded-full bg-white" />}
                                            </div>
                                        </button>

                                    </div>

                                    {/* Zone Selection for Home Delivery */}
                                    {deliveryMethod === 'livraison' && (
                                        <div className="space-y-4 pt-2">
                                            
                                            {/* Selected Zone Pill if already selected */}
                                            {selectedZone && (
                                                <div className="p-3.5 bg-orange-50/60 border border-orange-200/80 rounded-2xl flex items-center justify-between">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0">
                                                            <MapPin className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black text-[#1B1F3B]">{selectedZone.name}</p>
                                                            <p className="text-[11px] font-bold text-orange-600">Frais: {selectedZone.price.toLocaleString()} FCFA</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedZone(null)}
                                                        className="text-[10px] font-black text-rose-600 uppercase hover:underline"
                                                    >
                                                        Changer
                                                    </button>
                                                </div>
                                            )}

                                            <div>
                                                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2 pl-0.5">
                                                    Rechercher votre quartier à Dakar
                                                </label>
                                                <div className="relative">
                                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        value={zoneSearch}
                                                        onChange={(e) => setZoneSearch(e.target.value)}
                                                        placeholder="Tapez le nom de votre quartier (ex: Plateau, Maristes, Almadies...)"
                                                        className="w-full h-12 bg-slate-50 border border-slate-200/80 rounded-xl pl-10 pr-10 text-sm font-semibold outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 transition-all placeholder:text-slate-400"
                                                    />
                                                    {zoneSearch && (
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setZoneSearch('')}
                                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Quick popular zone chips */}
                                            {!zoneSearch && (
                                                <div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 pl-0.5">
                                                        Quartiers populaires:
                                                    </span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {POPULAR_ZONES.map(zName => {
                                                            const match = DELIVERY_REGIONS.flatMap(r => r.zones).find(z => z.name.toLowerCase() === zName.toLowerCase())
                                                            if (!match) return null
                                                            const isSel = selectedZone?.name === match.name
                                                            return (
                                                                <button
                                                                    key={zName}
                                                                    type="button"
                                                                    onClick={() => setSelectedZone(match)}
                                                                    className={cn(
                                                                        "px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all",
                                                                        isSel
                                                                            ? "bg-orange-600 text-white shadow-sm"
                                                                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                                                    )}
                                                                >
                                                                    {match.name} · {match.price.toLocaleString()}F
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Regional Group Accordion */}
                                            <div className="space-y-2 pt-2 max-h-[360px] overflow-y-auto pr-1">
                                                {filteredRegions.map((region) => {
                                                    const isExpanded = expandedRegion === region.id || zoneSearch.trim().length > 0
                                                    return (
                                                        <div 
                                                            key={region.id}
                                                            className="border border-slate-200/80 rounded-2xl overflow-hidden bg-slate-50/50"
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={() => setExpandedRegion(isExpanded && !zoneSearch ? null : region.id)}
                                                                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-100/60 transition-colors"
                                                            >
                                                                <div className="flex items-center gap-2.5">
                                                                    <span className="text-base">{region.emoji}</span>
                                                                    <div>
                                                                        <span className="text-xs font-bold text-[#1B1F3B] block">
                                                                            {region.label}
                                                                        </span>
                                                                        <span className="text-[10px] text-slate-400">
                                                                            {region.zones.length} quartier{region.zones.length > 1 ? 's' : ''}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200", isExpanded && "rotate-180")} />
                                                            </button>

                                                            {isExpanded && (
                                                                <div className="p-3 pt-0 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                                    {region.zones.map((zone) => {
                                                                        const isSel = selectedZone?.name === zone.name
                                                                        return (
                                                                            <button
                                                                                key={zone.name}
                                                                                type="button"
                                                                                onClick={() => setSelectedZone(zone)}
                                                                                className={cn(
                                                                                    "p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all",
                                                                                    isSel
                                                                                        ? "bg-orange-600 border-orange-600 text-white shadow-sm"
                                                                                        : "bg-white border-slate-200 hover:border-orange-300 text-slate-800"
                                                                                )}
                                                                            >
                                                                                <span className="text-xs font-bold truncate block">{zone.name}</span>
                                                                                <span className={cn("text-[10px] font-black mt-1", isSel ? "text-orange-200" : "text-orange-600")}>
                                                                                    {zone.price.toLocaleString()} FCFA
                                                                                </span>
                                                                            </button>
                                                                        )
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>

                                        </div>
                                    )}

                                    {/* Store pickup details */}
                                    {deliveryMethod === 'retrait' && (
                                        <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-start gap-3 text-emerald-900 mt-4">
                                            <Building className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                            <div className="text-xs space-y-1">
                                                <p className="font-bold">Boutique Baraka Shop — Dakar</p>
                                                <p className="text-emerald-700">Ouvert du Lundi au Samedi de 09h00 à 21h00.</p>
                                                <p className="text-[11px] text-emerald-600">Présentez simplement votre numéro de commande pour retirer votre colis.</p>
                                            </div>
                                        </div>
                                    )}

                                    <CheckoutError message={error} />

                                    <div className="hidden lg:block">
                                        <CheckoutNavButtons
                                            showBack={false}
                                            onNext={goToNextStep}
                                            nextLabel="Passer aux coordonnées"
                                        />
                                    </div>
                                </motion.section>
                            )}

                            {/* STEP 2: Address & Contact */}
                            {step === 2 && (
                                <motion.section
                                    key="step-address"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-100 shadow-sm"
                                >
                                    <CheckoutSectionHeader
                                        icon={Home}
                                        title={deliveryMethod === 'livraison' ? "Adresse de Livraison" : "Coordonnées de Contact"}
                                        subtitle="Ces informations nous permettent de vous joindre pour la livraison"
                                    />

                                    {/* Mode recap banner */}
                                    <div className="mb-6 p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                                        <span className="font-bold text-slate-700 flex items-center gap-2">
                                            {deliveryMethod === 'livraison' ? <Truck className="w-4 h-4 text-orange-600" /> : <Store className="w-4 h-4 text-emerald-600" />}
                                            {deliveryMethod === 'livraison' ? `Livraison à domicile · ${selectedZone?.name || ''}` : 'Retrait en boutique (Gratuit)'}
                                        </span>
                                        <button 
                                            type="button" 
                                            onClick={() => setStep(1)} 
                                            className="text-[10px] font-black text-orange-600 uppercase hover:underline"
                                        >
                                            Changer
                                        </button>
                                    </div>

                                    <form className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                                            <FormInput
                                                label="Prénom"
                                                placeholder="Moussa"
                                                value={formData.firstName}
                                                onChange={(val) => setFormData({ ...formData, firstName: val })}
                                                required
                                                icon={User}
                                            />
                                            <FormInput
                                                label="Nom"
                                                placeholder="Diop"
                                                value={formData.lastName}
                                                onChange={(val) => setFormData({ ...formData, lastName: val })}
                                                required
                                            />
                                        </div>

                                        <FormInput
                                            label="Numéro de téléphone (WhatsApp / Appel)"
                                            placeholder="77 123 45 67"
                                            value={formData.phone}
                                            onChange={(val) => setFormData({ ...formData, phone: val })}
                                            type="tel"
                                            required
                                            helperText="Indispensable pour la coordination avec le livreur"
                                            icon={Phone}
                                        />

                                        {deliveryMethod === 'livraison' && (
                                            <>
                                                <FormInput
                                                    label="Adresse exacte ou Rue"
                                                    placeholder="Ex: Villa 124, Rue 10 x Corniche"
                                                    value={formData.address}
                                                    onChange={(val) => setFormData({ ...formData, address: val })}
                                                    required
                                                    icon={MapPin}
                                                />

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                                                    <FormInput
                                                        label="Quartier / Repère"
                                                        placeholder="Ex: Près de la mosquée, en face de l'école..."
                                                        value={formData.area}
                                                        onChange={(val) => setFormData({ ...formData, area: val })}
                                                        icon={FileText}
                                                    />
                                                    <FormInput
                                                        label="Ville"
                                                        placeholder="Dakar"
                                                        value={formData.city}
                                                        onChange={(val) => setFormData({ ...formData, city: val })}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </form>

                                    <CheckoutError message={error} />

                                    <div className="hidden lg:block">
                                        <CheckoutNavButtons
                                            onBack={goBack}
                                            onNext={goToNextStep}
                                            nextLabel="Passer au paiement"
                                        />
                                    </div>
                                </motion.section>
                            )}

                            {/* STEP 3: Payment Method */}
                            {step === 3 && (
                                <motion.section
                                    key="step-payment"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-100 shadow-sm"
                                >
                                    <CheckoutSectionHeader
                                        icon={CreditCard}
                                        title="Mode de Paiement"
                                        subtitle="Paiement 100% sécurisé et sans avance à la réception de votre commande"
                                    />

                                    <div className="space-y-3.5 mb-6">
                                        <PaymentOption
                                            active={true}
                                            onClick={() => {}}
                                            icon={Truck}
                                            title={deliveryMethod === 'livraison' ? "Paiement à la livraison" : "Paiement en magasin (au retrait)"}
                                            desc={deliveryMethod === 'livraison' ? "Réglez en espèces directement auprès du livreur dès réception et vérification de votre colis." : "Réglez en espèces directement en boutique lors du retrait de votre commande."}
                                            badge="Recommandé"
                                        />
                                    </div>

                                    <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center gap-3 text-xs text-emerald-900">
                                        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                                        <span><strong>Aucun paiement d&apos;avance requis.</strong> Vous réglez la totalité en espèces en main propre lorsque votre commande vous est remise.</span>
                                    </div>

                                    <CheckoutError message={error} />

                                    <div className="hidden lg:block">
                                        <CheckoutNavButtons
                                            onBack={goBack}
                                            onNext={goToNextStep}
                                            nextLabel="Vérifier la commande"
                                        />
                                    </div>
                                </motion.section>
                            )}

                            {/* STEP 4: Confirmation & Summary Review */}
                            {step === 4 && (
                                <motion.section
                                    key="step-confirm"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-100 shadow-sm"
                                >
                                    <CheckoutSectionHeader
                                        icon={ShieldCheck}
                                        title="Dernière Étape"
                                        subtitle="Vérifiez les détails de votre commande avant confirmation"
                                    />

                                    {/* Choice Recap Cards */}
                                    <div className="space-y-3.5 mb-8">
                                        
                                        {/* Reception Recap */}
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start justify-between gap-3 text-xs">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                                                    <Truck className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">Mode de réception</span>
                                                    <span className="font-black text-[#1B1F3B] block">
                                                        {deliveryMethod === 'livraison' ? `Livraison à domicile · ${selectedZone?.name || ''}` : 'Retrait en boutique (Gratuit)'}
                                                    </span>
                                                    {deliveryMethod === 'livraison' && selectedZone && (
                                                        <span className="text-[11px] text-orange-600 font-bold block mt-0.5">
                                                            Frais: {selectedZone.price.toLocaleString()} FCFA
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={() => setStep(1)} 
                                                className="text-[11px] font-black text-orange-600 uppercase hover:underline shrink-0"
                                            >
                                                Modifier
                                            </button>
                                        </div>

                                        {/* Contact & Destination Recap */}
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start justify-between gap-3 text-xs">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                                    <Home className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">Destinataire & Contact</span>
                                                    <span className="font-black text-[#1B1F3B] block">
                                                        {formData.firstName} {formData.lastName}
                                                    </span>
                                                    <span className="text-slate-600 block mt-0.5">
                                                        📞 {formData.phone}
                                                    </span>
                                                    {deliveryMethod === 'livraison' && (
                                                        <span className="text-slate-500 block mt-0.5">
                                                            📍 {formData.address}{formData.area ? `, ${formData.area}` : ''}, {formData.city}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={() => setStep(2)} 
                                                className="text-[11px] font-black text-orange-600 uppercase hover:underline shrink-0"
                                            >
                                                Modifier
                                            </button>
                                        </div>

                                        {/* Payment Recap */}
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start justify-between gap-3 text-xs">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                                    <CreditCard className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">Mode de paiement</span>
                                                    <span className="font-black text-[#1B1F3B] block">
                                                        {deliveryMethod === 'livraison' ? 'Paiement en espèces à la livraison' : 'Paiement en espèces au retrait en boutique'}
                                                    </span>
                                                </div>
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={() => setStep(3)} 
                                                className="text-[11px] font-black text-orange-600 uppercase hover:underline shrink-0"
                                            >
                                                Modifier
                                            </button>
                                        </div>

                                    </div>

                                    {/* Terms acceptance callout */}
                                    <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-xs text-amber-900 mb-6">
                                        <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                        <p className="leading-relaxed">
                                            En confirmant cette commande, vous acceptez nos conditions de vente. Notre service expédition prendra contact avec vous dès la préparation de votre colis.
                                        </p>
                                    </div>

                                    <CheckoutError message={error} />

                                    <div className="hidden lg:block">
                                        <CheckoutNavButtons
                                            onBack={goBack}
                                            onNext={handleCheckout}
                                            nextLabel="Confirmer la commande"
                                            isLoading={isSubmitting}
                                        />
                                    </div>
                                </motion.section>
                            )}

                        </AnimatePresence>
                    </div>

                    {/* Right Column: Sticky Order Summary (Desktop) */}
                    <div className="hidden lg:block lg:col-span-5">
                        <div className="sticky top-24 space-y-4">
                            <CheckoutOrderSummary
                                cartItems={cartItems}
                                subtotal={subtotal}
                                shipping={shipping}
                                discount={discount}
                                couponCode={appliedCoupon?.couponCode}
                                total={total}
                                deliveryMethod={deliveryMethod}
                                selectedZoneName={selectedZone?.name}
                            />

                            <div className="bg-white rounded-2xl p-4.5 border border-slate-100 flex items-center gap-3 text-xs text-slate-600">
                                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                                <div>
                                    <p className="font-bold text-slate-800">Garantie Baraka Shop</p>
                                    <p className="text-[11px] text-slate-500">Service client réactif & échange garanti sous 7 jours.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </Container>

            {/* Mobile Sticky Action Bar */}
            <CheckoutMobileBar
                step={step}
                total={total}
                itemCount={itemCount}
                isSubmitting={isSubmitting}
                onBack={goBack}
                onNext={goToNextStep}
                onConfirm={handleCheckout}
            />
        </main>
    )
}
