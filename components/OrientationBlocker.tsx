'use client'

import { useEffect, useState } from 'react'

export function OrientationBlocker() {
    const [isLandscape, setIsLandscape] = useState(false)

    useEffect(() => {
        const checkOrientation = () => {
            // Check if it's a mobile device (based on screen width) and if it's landscape
            const isMobile = window.innerWidth <= 900
            const isLandscapeMode = window.matchMedia('(orientation: landscape)').matches
            setIsLandscape(isMobile && isLandscapeMode)
        }

        checkOrientation()
        window.addEventListener('resize', checkOrientation)
        window.addEventListener('orientationchange', checkOrientation)

        return () => {
            window.removeEventListener('resize', checkOrientation)
            window.removeEventListener('orientationchange', checkOrientation)
        }
    }, [])

    if (!isLandscape) return null

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background p-6 text-center animate-in fade-in duration-300">
            <div className="relative mb-8">
                <div className="absolute -inset-4 rounded-full bg-primary/10 animate-ping duration-[2000ms]" />
                <div className="relative rounded-2xl bg-primary/20 p-4">
                    <svg 
                        viewBox="0 0 24 24" 
                        className="h-12 w-12 text-primary animate-infinite-rotate"
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path 
                            fill="currentColor" 
                            d="M9 1H3a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2m0 14H3V3h6zm12-2h-8v2h8v6H9v-1H6v1a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2m2-3l-4-2l1.91-.91A7.52 7.52 0 0 0 14 2.5V1a9 9 0 0 1 9 9"
                        />
                    </svg>
                </div>
            </div>

            <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground">
                Orientation Portrait Recommandée
            </h2>
            
            <p className="max-w-[280px] text-muted-foreground leading-relaxed">
                Pour une navigation optimale sur <span className="font-semibold text-primary">Baraka Shop</span>, veuillez remettre votre téléphone à la verticale.
            </p>

            <div className="mt-8 flex gap-2">
                <div className="h-1.5 w-8 rounded-full bg-primary" />
                <div className="h-1.5 w-2 rounded-full bg-primary/30" />
                <div className="h-1.5 w-2 rounded-full bg-primary/30" />
            </div>

            <style jsx global>{`
                @keyframes infinite-rotate {
                    0% { transform: scale(1) rotate(0deg); }
                    50% { transform: scale(1.1) rotate(-90deg); }
                    100% { transform: scale(1) rotate(0deg); }
                }
                .animate-infinite-rotate {
                    animation: infinite-rotate 3s ease-in-out infinite;
                }
                body {
                    overflow: ${isLandscape ? 'hidden' : 'auto'} !important;
                }
            `}</style>
        </div>
    )
}
