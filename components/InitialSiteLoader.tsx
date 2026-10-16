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
            const hasSeenSplash = sessionStorage.getItem('baraka_splash_shown')
            if (!hasSeenSplash) {
                setIsVisible(true)
                // Marquer pour ne pas rejouer à chaque navigation client
                sessionStorage.setItem('baraka_splash_shown', 'true')
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
            duration={2.1}
            onComplete={() => setIsVisible(false)}
        />
    )
}

export default InitialSiteLoader
