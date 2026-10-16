'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface BarakaAnimatedLoaderProps {
    /**
     * Occupe tout l'écran avec fond noir fixe
     * @default true
     */
    fullScreen?: boolean
    /**
     * Déclenche la sortie après la fin de l'animation
     * @default false (dans un loading.tsx, le composant reste affiché jusqu'à la résolution Suspense)
     */
    autoFadeOut?: boolean
    /**
     * Durée totale avant sortie automatique en secondes (si autoFadeOut est actif)
     * @default 3.2
     */
    duration?: number
    /**
     * Callback lorsque l'animation se termine
     */
    onComplete?: () => void
    /**
     * Permet de piloter la fin du loader depuis l'extérieur (ex: données prêtes)
     */
    isFinished?: boolean
    /**
     * Classe CSS additionnelle
     */
    className?: string
}

export function BarakaAnimatedLoader({
    fullScreen = true,
    autoFadeOut = false,
    duration = 3.2,
    onComplete,
    isFinished = false,
    className = '',
}: BarakaAnimatedLoaderProps) {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
    const [shouldExit, setShouldExit] = useState(false)

    // Détection de l'accessibilité "prefers-reduced-motion"
    useEffect(() => {
        if (typeof window === 'undefined') return
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
        setPrefersReducedMotion(mediaQuery.matches)

        const handler = (event: MediaQueryListEvent) => {
            setPrefersReducedMotion(event.matches)
        }
        mediaQuery.addEventListener('change', handler)
        return () => mediaQuery.removeEventListener('change', handler)
    }, [])

    // Gestion du timing d'auto-fade-out si activé
    useEffect(() => {
        if (!autoFadeOut) return

        const timer = setTimeout(() => {
            setShouldExit(true)
        }, Math.max(1800, duration * 1000 - 450))

        return () => clearTimeout(timer)
    }, [autoFadeOut, duration])

    // Déclenchement de sortie externe si isFinished passe à true
    useEffect(() => {
        if (isFinished) {
            setShouldExit(true)
        }
    }, [isFinished])

    const containerClasses = fullScreen
        ? `fixed inset-0 z-[999999] bg-[#000000] flex flex-col items-center justify-center overflow-hidden select-none ${className}`
        : `w-full h-full min-h-[70vh] bg-[#000000] flex flex-col items-center justify-center overflow-hidden select-none ${className}`

    // Version simplifiée et élégante pour utilisateurs avec préférence reduced-motion
    if (prefersReducedMotion) {
        return (
            <AnimatePresence onExitComplete={onComplete}>
                {!shouldExit && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.3 } }}
                        className={containerClasses}
                        role="status"
                        aria-label="Chargement de Baraka Shop"
                    >
                        <div className="flex flex-col items-center justify-center w-[210px] sm:w-[260px] md:w-[280px]">
                            <div className="relative w-[110px] sm:w-[130px] md:w-[145px] aspect-square mb-4 sm:mb-5">
                                <Image
                                    src="/loader/symbol-final.png"
                                    alt="Baraka Symbole"
                                    fill
                                    priority
                                    unoptimized
                                    className="object-contain"
                                />
                            </div>
                            <div className="relative w-full aspect-[1000/371]">
                                <Image
                                    src="/loader/text-orange.png"
                                    alt="Baraka"
                                    fill
                                    priority
                                    unoptimized
                                    className="object-contain"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        )
    }

    // Animation cinématique fidèle en 3 étapes :
    // Étape 1 : Révélation horizontale du texte Baraka (de gauche à droite)
    // Étape 2 : Construction progressive du symbole (silhouette monochrome -> aile orange -> détails blancs & diamant)
    // Étape 3 : Logo Baraka complet reconstitué, micro-pause d'identification et fondu de sortie
    return (
        <AnimatePresence onExitComplete={onComplete}>
            {!shouldExit && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.45, ease: 'easeInOut' } }}
                    className={containerClasses}
                    role="status"
                    aria-label="Chargement de Baraka Shop"
                >
                    {/* Structure Logo Verticale Officielle (Symbole au-dessus du texte) */}
                    <motion.div
                        className="relative flex flex-col items-center justify-center w-[210px] sm:w-[260px] md:w-[290px]"
                        initial={{ scale: 0.98 }}
                        animate={{
                            scale: [0.98, 1, 1.012, 1],
                            filter: [
                                'drop-shadow(0 0 0px rgba(232,98,26,0))',
                                'drop-shadow(0 0 12px rgba(232,98,26,0.18))',
                                'drop-shadow(0 0 24px rgba(232,98,26,0.32))',
                                'drop-shadow(0 0 14px rgba(232,98,26,0.20))'
                            ]
                        }}
                        transition={{
                            times: [0, 0.4, 0.75, 1],
                            duration: Math.max(2.1, duration - 0.45),
                            ease: 'easeInOut'
                        }}
                    >
                        {/* ======================================================== */}
                        {/* ÉTAPE 2 : CONSTRUCTION PROGRESSIVE DU SYMBOLE (Au-dessus) */}
                        {/* ======================================================== */}
                        <div className="relative w-[110px] sm:w-[130px] md:w-[145px] aspect-square mb-4 sm:mb-5">
                            {/* Couche 2A : Silhouette base monochrome grise/blanche */}
                            <motion.div
                                className="absolute inset-0"
                                initial={{
                                    opacity: 0,
                                    scale: 0.94,
                                    clipPath: 'inset(100% 0% 0% 0%)',
                                }}
                                animate={{
                                    opacity: [0, 0.85, 0.85, 0],
                                    scale: [0.94, 1, 1, 1],
                                    clipPath: [
                                        'inset(100% 0% 0% 0%)',
                                        'inset(0% 0% 0% 0%)',
                                        'inset(0% 0% 0% 0%)',
                                        'inset(0% 0% 0% 0%)'
                                    ],
                                }}
                                transition={{
                                    duration: 1.1,
                                    delay: 0.35,
                                    times: [0, 0.45, 0.75, 1],
                                    ease: [0.16, 1, 0.3, 1]
                                }}
                            >
                                <Image
                                    src="/loader/symbol-base.png"
                                    alt=""
                                    fill
                                    priority
                                    unoptimized
                                    className="object-contain"
                                />
                            </motion.div>

                            {/* Couche 2B : Révélation de la partie orange officielle (#E8621A) */}
                            <motion.div
                                className="absolute inset-0 z-10"
                                initial={{
                                    opacity: 0,
                                    clipPath: 'inset(100% 0% 0% 0%)',
                                }}
                                animate={{
                                    opacity: 1,
                                    clipPath: 'inset(0% 0% 0% 0%)',
                                }}
                                transition={{
                                    duration: 0.65,
                                    delay: 0.70,
                                    ease: [0.16, 1, 0.3, 1]
                                }}
                            >
                                <Image
                                    src="/loader/symbol-orange.png"
                                    alt=""
                                    fill
                                    priority
                                    unoptimized
                                    className="object-contain"
                                />
                            </motion.div>

                            {/* Couche 2C : Révélation des détails blancs & diamant (Contraste officiel) */}
                            <motion.div
                                className="absolute inset-0 z-20"
                                initial={{
                                    opacity: 0,
                                    scale: 0.97,
                                    clipPath: 'inset(0% 0% 100% 0%)',
                                }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    clipPath: 'inset(0% 0% 0% 0%)',
                                }}
                                transition={{
                                    duration: 0.55,
                                    delay: 0.95,
                                    ease: [0.22, 1, 0.36, 1]
                                }}
                            >
                                <Image
                                    src="/loader/symbol-white-lobe.png"
                                    alt=""
                                    fill
                                    priority
                                    unoptimized
                                    className="object-contain"
                                />
                            </motion.div>

                            {/* Couche finale de verrouillage : Symbole net et parfait */}
                            <motion.div
                                className="absolute inset-0 z-30"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{
                                    duration: 0.3,
                                    delay: 1.40,
                                    ease: 'easeOut'
                                }}
                            >
                                <Image
                                    src="/loader/symbol-final.png"
                                    alt="Symbole Baraka"
                                    fill
                                    priority
                                    unoptimized
                                    className="object-contain"
                                />
                            </motion.div>
                        </div>

                        {/* ======================================================== */}
                        {/* ÉTAPE 1 : RÉVÉLATION HORIZONTALE DU TEXTE « BARAKA »    */}
                        {/* ======================================================== */}
                        <div className="relative w-full aspect-[1000/371] overflow-hidden">
                            {/* Révélation de gauche à droite avec la typographie officielle orange */}
                            <motion.div
                                className="relative w-full h-full"
                                initial={{
                                    clipPath: 'inset(0% 100% 0% 0%)',
                                    opacity: 0.9,
                                }}
                                animate={{
                                    clipPath: 'inset(0% 0% 0% 0%)',
                                    opacity: 1,
                                }}
                                transition={{
                                    duration: 0.85,
                                    delay: 0.10,
                                    ease: [0.22, 1, 0.36, 1]
                                }}
                            >
                                <Image
                                    src="/loader/text-orange.png"
                                    alt="Baraka"
                                    fill
                                    priority
                                    unoptimized
                                    className="object-contain"
                                />

                                {/* Trait de lumière discret accompagnant la révélation */}
                                <motion.div
                                    className="absolute inset-y-0 w-8 pointer-events-none bg-gradient-to-r from-transparent via-white/25 to-transparent blur-[2px]"
                                    initial={{ left: '-10%', opacity: 0 }}
                                    animate={{
                                        left: ['-10%', '100%'],
                                        opacity: [0, 0.7, 0.7, 0]
                                    }}
                                    transition={{
                                        duration: 0.85,
                                        delay: 0.10,
                                        ease: [0.22, 1, 0.36, 1]
                                    }}
                                />
                            </motion.div>
                        </div>

                        {/* ======================================================== */}
                        {/* ÉTAPE 3 : LOGO COMPLET ASSEMBLE (Micro-lueur Baraka)     */}
                        {/* ======================================================== */}
                        <motion.div
                            className="absolute -inset-4 pointer-events-none rounded-full bg-gradient-to-b from-[#E8621A]/8 to-transparent blur-2xl"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 0, 0.7, 0.4] }}
                            transition={{
                                times: [0, 0.45, 0.75, 1],
                                duration: Math.max(2.1, duration - 0.45),
                                ease: 'easeInOut'
                            }}
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default BarakaAnimatedLoader
