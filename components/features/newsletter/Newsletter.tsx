'use client'

import { motion } from 'framer-motion'
import { Send } from 'lucide-react'

export default function Newsletter() {
    return (
        <section className="relative py-24 overflow-hidden">
            {/* Background Image/Gradient */}
            <div className="absolute inset-0 bg-primary/95 z-0">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-orange-700 opacity-90" />
                {/* Abstract Shapes */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black opacity-10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            </div>

            <div className="container relative z-10 px-4 mx-auto text-center text-white">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="max-w-2xl mx-auto"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Rejoignez la Baraka Family</h2>
                    <p className="text-white/80 mb-8 text-lg">
                        Abonnez-vous à notre newsletter pour recevoir les offres exclusives, les nouveautés et -20% sur votre première commande.
                    </p>

                    <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto relative">
                        <div className="relative flex-grow">
                            <input
                                type="email"
                                placeholder="Votre adresse email"
                                className="w-full h-14 px-6 rounded-full border-2 border-white/20 bg-white/10 text-white placeholder:text-white/60 focus:outline-none focus:border-white focus:bg-white/20 transition-all backdrop-blur-sm"
                            />
                        </div>
                        <button className="h-14 px-8 rounded-full bg-white text-primary font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 shadow-lg">
                            S'inscrire <Send className="w-4 h-4" />
                        </button>
                    </form>
                    <p className="mt-4 text-xs text-white/50">
                        En vous inscrivant, vous acceptez nos conditions générales de vente.
                    </p>
                </motion.div>
            </div>
        </section>
    )
}
