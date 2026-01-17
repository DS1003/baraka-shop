'use client'

import React from 'react'
import { Container } from '@/ui/Container'
import { Button } from '@/ui/Button'
import { Send } from 'lucide-react'
import Link from 'next/link'

export function Newsletter() {
    return (
        <section className="py-20 bg-primary/5 border-t border-primary/10">
            <Container>
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                    {/* Left Side: Content */}
                    <div className="flex flex-col gap-6 max-w-xl text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full w-fit mx-auto lg:mx-0">
                            <Send className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Newsletter</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">
                            REJOIGNEZ <br className="hidden md:block" /> <span className="text-primary">LA COMMUNAUTÉ</span>
                        </h2>
                        <p className="text-gray-400 font-medium text-sm md:text-base max-w-md">
                            Soyez les premiers informés de nos nouvelles collections et recevez des offres exclusives directement dans votre boîte mail.
                        </p>
                    </div>

                    {/* Right Side: Form */}
                    <div className="w-full max-w-md">
                        <form className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <input
                                    type="email"
                                    placeholder="Votre adresse email"
                                    className="w-full h-14 md:h-16 bg-white/5 border border-white/10 rounded-2xl px-6 text-sm font-bold text-white outline-none focus:border-primary transition-all placeholder:text-gray-500"
                                />
                            </div>
                            <Button className="h-14 md:h-16 px-8 bg-primary hover:bg-white hover:text-black text-white font-black uppercase tracking-widest text-[11px] rounded-2xl transition-all shadow-xl shadow-primary/20">
                                S'abonner
                            </Button>
                        </form>
                        <p className="text-[10px] text-gray-500 mt-6 text-center lg:text-left font-medium">
                            En vous inscrivant, vous acceptez nos <Link href="#" className="underline">Conditions d'Utilisation</Link>. Pas de spam, promis !
                        </p>
                    </div>
                </div>
            </Container>
        </section>
    )
}
