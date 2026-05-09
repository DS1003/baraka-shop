'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function Loading() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white relative overflow-hidden">
            {/* Soft background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-orange-500/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center gap-10">
                {/* Premium Spinner */}
                <div className="relative flex items-center justify-center w-28 h-28">
                    {/* Pulsing rings */}
                    <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                        className="absolute inset-0 rounded-full border-2 border-orange-500/20"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0, 0.1] }}
                        transition={{ repeat: Infinity, duration: 2.5, delay: 0.5, ease: "easeInOut" }}
                        className="absolute inset-0 rounded-full border-2 border-orange-500/10"
                    />
                    
                    {/* Main rotating gradient ring */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        className="absolute inset-0 rounded-full border-[3px] border-slate-100 border-t-orange-500"
                    />
                    
                    {/* Center Logo */}
                    <div className="w-16 h-16 rounded-[20px] bg-white shadow-md border border-slate-100 flex items-center justify-center relative overflow-hidden p-2">
                        <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            className="relative w-full h-full flex items-center justify-center"
                        >
                            <Image 
                                src="/logo.png" 
                                alt="Baraka Shop Logo" 
                                fill
                                className="object-contain" 
                                unoptimized
                                priority
                            />
                        </motion.div>
                    </div>
                </div>

                {/* Text section */}
                <div className="flex flex-col items-center gap-3 text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-[24px] font-black text-slate-900 uppercase tracking-tighter"
                    >
                        Baraka<span className="text-orange-500">Shop.</span>
                    </motion.h2>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-2"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                            Chargement en cours...
                        </span>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
