import React from 'react'
import Image from 'next/image'

export const WatermarkOverlay = ({ logoUrl, isThumbnail = false, isCard = false }: { logoUrl?: string, isThumbnail?: boolean, isCard?: boolean }) => {

    // ── Premium Corner Mark (SVG — visible & elegant) ──
    const cornerMark = (
        <svg 
            viewBox="0 0 140 140" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-28 h-28 md:w-40 md:h-40 lg:w-52 lg:h-52"
        >
            <defs>
                <linearGradient id="fadeV" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F97316" stopOpacity="0" />
                    <stop offset="100%" stopColor="#F97316" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="fadeH" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#F97316" stopOpacity="0" />
                    <stop offset="100%" stopColor="#F97316" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="fadeDarkV" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1B1F3B" stopOpacity="0" />
                    <stop offset="100%" stopColor="#1B1F3B" stopOpacity="0.7" />
                </linearGradient>
                <linearGradient id="fadeDarkH" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#1B1F3B" stopOpacity="0" />
                    <stop offset="100%" stopColor="#1B1F3B" stopOpacity="0.7" />
                </linearGradient>
            </defs>

            {/* ─── Outer corner bracket — dark, structural ─── */}
            <path 
                d="M140 118 L140 140 L118 140" 
                stroke="#1B1F3B" 
                strokeWidth="1.8" 
                strokeLinecap="round"
                opacity="0.75"
            />

            {/* ─── Inner corner bracket — offset, thinner ─── */}
            <path 
                d="M140 126 L140 132 L134 132" 
                stroke="#1B1F3B" 
                strokeWidth="0.8" 
                strokeLinecap="round"
                opacity="0.35"
            />

            {/* ─── Vertical accent line — fading orange ─── */}
            <line x1="132" y1="50" x2="132" y2="128" stroke="url(#fadeV)" strokeWidth="1.2" />

            {/* ─── Horizontal accent line — fading orange ─── */}
            <line x1="50" y1="132" x2="128" y2="132" stroke="url(#fadeH)" strokeWidth="1.2" />

            {/* ─── Vertical dark parallel — structure ─── */}
            <line x1="136" y1="80" x2="136" y2="128" stroke="url(#fadeDarkV)" strokeWidth="0.6" />

            {/* ─── Horizontal dark parallel — structure ─── */}
            <line x1="80" y1="136" x2="128" y2="136" stroke="url(#fadeDarkH)" strokeWidth="0.6" />

            {/* ─── Corner diamond accent — focal point ─── */}
            <rect 
                x="129.5" y="129.5" 
                width="5.5" height="5.5" 
                rx="1"
                fill="#F97316" 
                opacity="0.85"
                transform="rotate(45, 132.25, 132.25)"
            />

            {/* ─── Connecting arc — subtle sweep ─── */}
            <path 
                d="M132 100 Q132 132 100 132" 
                stroke="#1B1F3B" 
                strokeWidth="0.6" 
                fill="none"
                opacity="0.18"
                strokeDasharray="3 4"
            />

            {/* ─── Tick marks — precision markers ─── */}
            <line x1="128" y1="132" x2="123" y2="132" stroke="#1B1F3B" strokeWidth="0.8" opacity="0.4" />
            <line x1="132" y1="128" x2="132" y2="123" stroke="#1B1F3B" strokeWidth="0.8" opacity="0.4" />
            <line x1="128" y1="136" x2="125" y2="136" stroke="#1B1F3B" strokeWidth="0.5" opacity="0.2" />
            <line x1="136" y1="128" x2="136" y2="125" stroke="#1B1F3B" strokeWidth="0.5" opacity="0.2" />

            {/* ─── Small dots along the lines ─── */}
            <circle cx="132" cy="110" r="1.2" fill="#F97316" opacity="0.5" />
            <circle cx="132" cy="90" r="0.8" fill="#F97316" opacity="0.3" />
            <circle cx="110" cy="132" r="1.2" fill="#F97316" opacity="0.5" />
            <circle cx="90" cy="132" r="0.8" fill="#F97316" opacity="0.3" />
        </svg>
    );

    const logo = logoUrl ? (
        <div className="opacity-90 flex items-end">
            <div className="relative w-32 h-10 md:w-40 md:h-12 lg:w-48 lg:h-14 translate-y-1">
                <Image src={logoUrl} alt="Baraka Shop" fill className="object-contain object-left-bottom" unoptimized />
            </div>
        </div>
    ) : null;

    // ── Card / Thumbnail view ──
    if (isThumbnail || isCard) {
        const scaleClasses = isThumbnail 
            ? "scale-[0.40] md:scale-[0.45]" 
            : "scale-[0.75] md:scale-[0.90]";

        return (
            <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden rounded-[inherit]">
                <div className={`absolute -bottom-1 -right-1 origin-bottom-right ${scaleClasses}`}>
                    {cornerMark}
                </div>
                {logo && (
                    <div className={`absolute bottom-0 left-0 origin-bottom-left ${scaleClasses}`}>
                        {logo}
                    </div>
                )}
            </div>
        )
    }

    // ── Full page view ──
    return (
        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
            <div className="absolute -bottom-1 -right-1">
                {cornerMark}
            </div>
            {logo && (
                <div className="absolute bottom-1 left-1 md:bottom-2 md:left-2">
                    {logo}
                </div>
            )}
        </div>
    )
}
