'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Loader2, Zap } from 'lucide-react'

export default function Loading() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#f8f9fb] overflow-hidden relative">
            {/* Background decorative elements */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 blur-[100px] rounded-full animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full animate-pulse delay-700" />

            <div className="relative z-10">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center"
                >
                    <div className="relative mb-12">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                            className="w-24 h-24 rounded-[2rem] border-4 border-gray-100 border-t-primary shadow-2xl bg-white"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Zap className="w-8 h-8 text-[#1B1F3B] fill-primary" />
                        </div>

                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute -inset-4 bg-primary/10 rounded-[3rem] blur-xl -z-10"
                        />
                    </div>

                    <div className="text-center">
                        <motion.h2
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-3xl font-black text-[#1B1F3B] uppercase tracking-tighter"
                        >
                            Baraka <span className="text-primary italic">Shop</span>
                        </motion.h2>

                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: 120 }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="h-1 bg-gradient-to-r from-primary to-[#1B1F3B] mx-auto mt-4 rounded-full"
                        />

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em] mt-6"
                        >
                            L'Excellence Technologique au Sénégal
                        </motion.p>
                    </div>
                </motion.div>
            </div>

            {/* Corner labels for premium feel */}
            <div className="absolute bottom-10 left-10 hidden md:block">
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-loose">
                    Qualité <br />
                    Premium <br />
                    Service
                </span>
            </div>
            <div className="absolute bottom-10 right-10 hidden md:block">
                <span className="text-[8px] font-black text-gray-300 uppercase tracking-[0.5em]">
                    V1.2.0 - 2026
                </span>
            </div>
        </div>
    )
}
