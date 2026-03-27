'use client'

import { PhoneIcon } from 'lucide-react'
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
                    <PhoneIcon className="h-12 w-12 text-primary rotate-90 animate-infinite-rotate" />
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
                    0% { transform: rotate(90deg); }
                    50% { transform: rotate(0deg); }
                    100% { transform: rotate(90deg); }
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
