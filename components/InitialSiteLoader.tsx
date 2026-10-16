'use client'

import React, { useEffect, useState } from 'react'
import { BarakaAnimatedLoader } from '@/components/BarakaAnimatedLoader'

export function InitialSiteLoader() {
    const [isVisible, setIsVisible] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        // Vérifier si le splash a déjà été affiché durant cette session
        try {
            const searchParams = new URLSearchParams(window.location.search)
            const forceSplash = searchParams.get('splash') === '1' || searchParams.get('loader') === '1'

            const hasSeenSplash = sessionStorage.getItem('baraka_splash_shown')
            if (!hasSeenSplash || forceSplash) {
                setIsVisible(true)
                // Marquer pour ne pas rejouer à chaque navigation client normale
                if (!forceSplash) {
                    sessionStorage.setItem('baraka_splash_shown', 'true')
                }
            }
        } catch {
            // Si sessionStorage non disponible (mode privé strict), ignorer
            setIsVisible(false)
        }
    }, [])

    if (!isMounted || !isVisible) {
        return null
    }

    return (
        <BarakaAnimatedLoader
            fullScreen={true}
            autoFadeOut={true}
            duration={3.2}
            onComplete={() => setIsVisible(false)}
        />
    )
}

export default InitialSiteLoader
