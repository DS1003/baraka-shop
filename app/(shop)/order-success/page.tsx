'use client'

import React from 'react'
import { Container } from '@/ui/Container'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, ShoppingBag, ArrowRight, Printer, Share2, MapPin } from 'lucide-react'
import { Button } from '@/ui/Button'

export default function OrderSuccessPage() {
    return (
        <main className="min-h-screen bg-[#f8f9fb] py-12 flex items-center justify-center">
            <Container className="max-w-3xl">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-[3rem] p-12 md:p-20 border border-gray-100 shadow-[0_40px_100px_rgba(0,0,0,0.05)] text-center relative overflow-hidden"
                >
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-blue-500 to-primary" />
                    <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-primary/5 blur-[120px] rounded-full" />

                    {/* Success Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                        className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto mb-10 shadow-2xl shadow-green-200 relative z-10"
                    >
                        <Check className="w-12 h-12 stroke-[3]" />
                    </motion.div>

                    <h1 className="text-4xl md:text-6xl font-black text-[#1B1F3B] uppercase tracking-tighter mb-6 relative z-10">
                        Commande <br /> <span className="text-primary">Confirmée !</span>
                    </h1>

                    <p className="text-gray-400 text-lg font-medium max-w-md mx-auto mb-12 relative z-10 leading-relaxed">
                        Félicitations ! Votre commande <span className="text-[#1B1F3B] font-black">#BK-89241</span> a été validée. Préparez-vous à recevoir votre technologie.
                    </p>

                    {/* Quick Order Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 relative z-10">
                        <InfoCard icon={MapPin} label="Livraison" val="24h - 48h" />
                        <InfoCard icon={ShoppingBag} label="Articles" val="2 Produits" />
                        <InfoCard icon={Printer} label="Facture" val="Générée" />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
                        <Link href="/boutique" className="w-full sm:w-auto">
                            <Button className="w-full h-16 px-10 bg-[#1B1F3B] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-primary transition-all shadow-xl shadow-gray-200 group">
                                <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Continuer mes achats
                            </Button>
                        </Link>
                        <Link href="/account" className="w-full sm:w-auto">
                            <Button className="w-full h-16 px-10 bg-white border border-gray-100 text-[#1B1F3B] rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-gray-50 transition-all shadow-xl shadow-gray-100 flex items-center gap-3">
                                Suivre ma commande <Share2 className="w-4 h-4 text-primary" />
                            </Button>
                        </Link>
                    </div>

                    {/* Support Notice */}
                    <div className="mt-16 pt-8 border-t border-gray-50">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                            Besoin d'aide ? Contactez notre support : <span className="text-primary">+221 33 800 00 00</span>
                        </p>
                    </div>
                </motion.div>
            </Container>
        </main>
    )
}

function InfoCard({ icon: Icon, label, val }: { icon: any, label: string, val: string }) {
    return (
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col items-center gap-2 group hover:bg-white hover:border-primary/20 transition-all hover:shadow-lg hover:shadow-primary/5">
            <Icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
            <span className="text-sm font-black text-[#1B1F3B] uppercase">{val}</span>
        </div>
    )
}
