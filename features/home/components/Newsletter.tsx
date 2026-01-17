'use client'

import React from 'react'
import { Container } from '@/ui/Container'
import { Button } from '@/ui/Button'
import { Mail } from 'lucide-react'

export function Newsletter() {
    return (
        <section className="py-20 bg-primary/5 border-t border-primary/10">
            <Container>
                <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
                    <div className="lg:w-1/2">
                        <span className="text-primary font-semibold tracking-wide uppercase text-sm mb-2 block">Newsletter</span>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                            Restez informé des meilleures offres.
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            Inscrivez-vous pour recevoir nos dernières nouveautés et promotions exclusives directement dans votre boîte mail.
                        </p>
                    </div>

                    <div className="lg:w-1/2 w-full max-w-md">
                        <form className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-grow">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <input
                                    type="email"
                                    placeholder="Votre adresse email"
                                    className="w-full h-12 pl-10 pr-4 rounded-lg border border-border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    required
                                />
                            </div>
                            <Button size="lg" className="h-12 px-8 font-semibold">
                                S'inscrire
                            </Button>
                        </form>
                        <p className="text-xs text-muted-foreground mt-3">
                            En vous inscrivant, vous acceptez nos <a href="#" className="underline hover:text-foreground">Conditions d'utilisation</a>. Pas de spam, désabonnement facile.
                        </p>
                    </div>
                </div>
            </Container>
        </section>
    )
}
