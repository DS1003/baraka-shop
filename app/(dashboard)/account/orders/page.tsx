'use client'

import React from 'react'
import { Package, Eye, ChevronRight, Calendar, Smartphone, ShoppingBag, Truck } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function OrdersPage() {
    const orders = [
        { id: 'BRK-8902', date: '20 Déc 2024', total: '852.000 F', status: 'En Cours', items: 2, icon: Truck, color: 'text-orange-600', bg: 'bg-orange-50' },
        { id: 'BRK-8810', date: '15 Nov 2024', total: '125.000 F', status: 'Livré', items: 1, icon: ShoppingBag, color: 'text-green-600', bg: 'bg-green-50' },
        { id: 'BRK-8750', date: '02 Oct 2024', total: '45.000 F', status: 'Annulé', items: 3, icon: Package, color: 'text-gray-400', bg: 'bg-gray-100' },
    ]

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Historique <span className="text-primary italic">Commandes.</span></h1>
                <p className="text-gray-400 font-medium">Consultez et suivez toutes vos commandes passées sur Baraka.</p>
            </div>

            <div className="space-y-6">
                {orders.map((order, idx) => (
                    <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group bg-white border border-gray-100 rounded-[2.5rem] p-6 md:p-8 hover:shadow-2xl transition-all relative overflow-hidden"
                    >
                        {/* Hover accent */}
                        <div className="absolute inset-y-0 left-0 w-1.5 bg-gray-100 group-hover:bg-primary transition-colors" />

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            {/* Order Info */}
                            <div className="flex items-start gap-6">
                                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border border-transparent group-hover:bg-black group-hover:text-white transition-all", order.bg, order.color)}>
                                    <order.icon size={28} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Réf: {order.id}</h3>
                                        <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                            order.status === 'Livré' ? 'bg-green-50 text-green-600 border-green-100' :
                                                order.status === 'En Cours' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                    'bg-gray-50 text-gray-400 border-gray-200'
                                        )}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-black text-gray-900 leading-none mb-3">Expédition #{idx + 1}</h2>
                                    <div className="flex items-center gap-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                        <span className="flex items-center gap-2"><Calendar size={14} /> {order.date}</span>
                                        <span className="flex items-center gap-2"><Package size={14} /> {order.items} Articles</span>
                                    </div>
                                </div>
                            </div>

                            {/* Order Actions */}
                            <div className="flex items-center justify-between md:justify-end gap-10 md:gap-12 pl-22 md:pl-0">
                                <div className="text-right">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-1">Montant Total</div>
                                    <div className="text-2xl font-black text-gray-900">{order.total}</div>
                                </div>
                                <Link
                                    href={`/account/orders/${order.id}`}
                                    className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:bg-black group-hover:text-white transition-all active:scale-95 shadow-lg shadow-transparent group-hover:shadow-black/10"
                                >
                                    <Eye size={22} />
                                </Link>
                            </div>
                        </div>

                        {/* Interactive Footer (only for 'En cours') */}
                        {order.status === 'En Cours' && (
                            <div className="mt-8 pt-8 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                                    <div className="relative w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                        <Truck size={14} />
                                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-ping" />
                                    </div>
                                    Colis en route vers le centre de tri de Dakar Plateau
                                </div>
                                <Link href="/track-order" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:tracking-[0.3em] transition-all">
                                    Suivi Détaillé →
                                </Link>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Empty State */}
            {orders.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <ShoppingBag size={32} className="text-gray-200" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2 leading-none">Aucune commande</h3>
                    <p className="text-gray-400 text-sm mb-10 max-w-xs mx-auto font-medium">Vous n'avez pas encore passé de commande sur notre boutique.</p>
                    <Link href="/shop" className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-primary transition-all shadow-xl">
                        Commencer mon Shopping
                    </Link>
                </div>
            )}
        </div>
    )
}
