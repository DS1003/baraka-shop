'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

const DEFAULT_LOGO = '/logo.png'

interface SiteLogos {
    headerLogo: string
    footerLogo: string
    loaderLogo: string
    isLoading: boolean
}

type SiteLogosData = { headerLogo: string | null; footerLogo: string | null; loaderLogo: string | null }

const SiteLogosContext = createContext<SiteLogos>({
    headerLogo: DEFAULT_LOGO,
    footerLogo: DEFAULT_LOGO,
    loaderLogo: DEFAULT_LOGO,
    isLoading: true,
})

export function SiteLogosProvider({ children, initialLogos }: { children: React.ReactNode, initialLogos?: SiteLogosData }) {
    const [logos, setLogos] = useState<SiteLogosData>(initialLogos || { headerLogo: null, footerLogo: null, loaderLogo: null })
    const [isLoading, setIsLoading] = useState(!initialLogos)

    useEffect(() => {
        if (initialLogos) {
            setLogos(initialLogos)
            setIsLoading(false)
            return
        }

        fetch('/api/site-logos')
            .then(r => r.json())
            .then(data => {
                setLogos(data)
                setIsLoading(false)
            })
            .catch(() => {
                setIsLoading(false)
            })
    }, [initialLogos])

    const value = {
        headerLogo: logos.headerLogo || DEFAULT_LOGO,
        footerLogo: logos.footerLogo || DEFAULT_LOGO,
        loaderLogo: logos.loaderLogo || DEFAULT_LOGO,
        isLoading,
    }

    return <SiteLogosContext.Provider value={value}>{children}</SiteLogosContext.Provider>
}

export function useSiteLogos(): SiteLogos {
    return useContext(SiteLogosContext)
}

/**
 * Force refresh the cached logos (call after admin updates)
 * Now handled differently, but kept for compatibility if needed.
 */
export function invalidateSiteLogosCache() {
    // Requires page refresh with Server Components approach
}
