import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export const WatermarkOverlay = ({ 
    logoUrl, 
    isThumbnail = false, 
    isCard = false,
    className = ""
}: { 
    logoUrl?: string; 
    isThumbnail?: boolean; 
    isCard?: boolean;
    className?: string;
}) => {

    // ── Premium Corner Mark SVG (positioned in bottom-right of 140x140 box) ──
    const cornerMarkSvg = (
        <svg 
            viewBox="0 0 140 140" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
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

            {/* Outer corner bracket */}
            <path 
                d="M140 118 L140 140 L118 140" 
                stroke="#1B1F3B" 
                strokeWidth="2" 
                strokeLinecap="round"
                opacity="0.8"
            />

            {/* Inner corner bracket */}
            <path 
                d="M140 126 L140 132 L134 132" 
                stroke="#1B1F3B" 
                strokeWidth="1" 
                strokeLinecap="round"
                opacity="0.4"
            />

            {/* Vertical accent line — fading orange */}
            <line x1="132" y1="40" x2="132" y2="128" stroke="url(#fadeV)" strokeWidth="1.4" />

            {/* Horizontal accent line — fading orange */}
            <line x1="40" y1="132" x2="128" y2="132" stroke="url(#fadeH)" strokeWidth="1.4" />

            {/* Vertical dark parallel */}
            <line x1="136" y1="70" x2="136" y2="128" stroke="url(#fadeDarkV)" strokeWidth="0.8" />

            {/* Horizontal dark parallel */}
            <line x1="70" y1="136" x2="128" y2="136" stroke="url(#fadeDarkH)" strokeWidth="0.8" />

            {/* Corner diamond accent — sitting exactly at bottom corner */}
            <rect 
                x="129" y="129" 
                width="6" height="6" 
                rx="1"
                fill="#F97316" 
                opacity="0.9"
                transform="rotate(45, 132, 132)"
            />

            {/* Connecting arc */}
            <path 
                d="M132 90 Q132 132 90 132" 
                stroke="#1B1F3B" 
                strokeWidth="0.8" 
                fill="none"
                opacity="0.2"
                strokeDasharray="3 4"
            />

            {/* Tick marks */}
            <line x1="128" y1="132" x2="122" y2="132" stroke="#1B1F3B" strokeWidth="1" opacity="0.5" />
            <line x1="132" y1="128" x2="132" y2="122" stroke="#1B1F3B" strokeWidth="1" opacity="0.5" />

            {/* Small dots along accent lines */}
            <circle cx="132" cy="105" r="1.4" fill="#F97316" opacity="0.6" />
            <circle cx="132" cy="80" r="1" fill="#F97316" opacity="0.4" />
            <circle cx="105" cy="132" r="1.4" fill="#F97316" opacity="0.6" />
            <circle cx="80" cy="132" r="1" fill="#F97316" opacity="0.4" />
        </svg>
    );

    // ── 1. Thumbnail View (Small preview boxes, e.g. 50px - 90px) ──
    if (isThumbnail) {
        return (
            <div className={cn("absolute inset-0 pointer-events-none z-30 overflow-hidden rounded-[inherit]", className)}>
                {/* Bottom Left Corner Mark */}
                <div className="absolute bottom-0 left-0 w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-70">
                    <div className="w-full h-full scale-x-[-1]">
                        {cornerMarkSvg}
                    </div>
                </div>

                {/* Bottom Right Corner Mark */}
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-70">
                    {cornerMarkSvg}
                </div>

                {/* Centered Discreet Logo */}
                {logoUrl && (
                    <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2">
                        <div className="relative w-7 h-2 sm:w-8 sm:h-2.5 max-w-[45%] opacity-85">
                            <Image src={logoUrl} alt="Baraka Shop" fill className="object-contain object-bottom" unoptimized />
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // ── 2. Product Card View (Grid & List items, e.g. 140px - 280px) ──
    if (isCard) {
        return (
            <div className={cn("absolute inset-0 pointer-events-none z-30 overflow-hidden rounded-[inherit]", className)}>
                {/* Bottom Left Corner Mark */}
                <div className="absolute bottom-0 left-0 w-[46px] h-[46px] sm:w-[54px] sm:h-[54px] md:w-[62px] md:h-[62px] opacity-85">
                    <div className="w-full h-full scale-x-[-1]">
                        {cornerMarkSvg}
                    </div>
                </div>

                {/* Bottom Right Corner Mark */}
                <div className="absolute bottom-0 right-0 w-[46px] h-[46px] sm:w-[54px] sm:h-[54px] md:w-[62px] md:h-[62px] opacity-85">
                    {cornerMarkSvg}
                </div>

                {/* Centered Proportionate Logo */}
                {logoUrl && (
                    <div className="absolute bottom-1.5 sm:bottom-2 left-1/2 -translate-x-1/2">
                        <div className="relative w-[86px] h-[25px] sm:w-[102px] sm:h-[30px] md:w-[118px] md:h-[34px] max-w-[55%] opacity-95">
                            <Image src={logoUrl} alt="Baraka Shop" fill className="object-contain object-bottom" unoptimized />
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // ── 3. Full Page Main Product & Lightbox Modal View ──
    return (
        <div className={cn("absolute inset-0 pointer-events-none z-30 overflow-hidden rounded-[inherit]", className)}>
            {/* Bottom Left Corner Mark */}
            <div className="absolute bottom-0 left-0 w-[60px] h-[60px] sm:w-[76px] sm:h-[76px] md:w-[92px] md:h-[92px] lg:w-[108px] lg:h-[108px] opacity-80">
                <div className="w-full h-full scale-x-[-1]">
                    {cornerMarkSvg}
                </div>
            </div>

            {/* Bottom Right Corner Mark */}
            <div className="absolute bottom-0 right-0 w-[60px] h-[60px] sm:w-[76px] sm:h-[76px] md:w-[92px] md:h-[92px] lg:w-[108px] lg:h-[108px] opacity-80">
                {cornerMarkSvg}
            </div>

            {/* Centered Proportionate Logo */}
            {logoUrl && (
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2">
                    <div className="relative w-[88px] h-[26px] sm:w-[104px] sm:h-[30px] md:w-[124px] md:h-[36px] lg:w-[140px] lg:h-[40px] max-w-[40%] opacity-90">
                        <Image src={logoUrl} alt="Baraka Shop" fill className="object-contain object-bottom" unoptimized />
                    </div>
                </div>
            )}
        </div>
    )
}

