import React from 'react'
import { Container } from '@/ui/Container'
import { Loader2 } from 'lucide-react'

export default function Loading() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#f8f9fb]">
            <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 shadow-xl flex items-center justify-center animate-pulse">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-ping" />
            </div>
            <div className="mt-8 text-center">
                <h2 className="text-xl font-black text-[#1B1F3B] uppercase tracking-tighter">Chargement de Baraka...</h2>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Préparez-vous pour le High-Tech Premium</p>
            </div>
        </div>
    )
}
