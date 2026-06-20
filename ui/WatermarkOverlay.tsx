import React from 'react'
import Image from 'next/image'

export const WatermarkOverlay = ({ logoUrl }: { logoUrl?: string }) => (
    <div className="absolute inset-0 pointer-events-none z-30 opacity-75 overflow-hidden">
        {/* Top Left Corner Pattern */}
        <div className="absolute top-2 left-2 flex items-start">
            {/* Vertical part */}
            <div className="flex flex-col items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#1B1F3B]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                <div className="w-1 h-1 rounded-full bg-orange-500"></div>
                <div className="w-[1.5px] h-10 bg-orange-500 mt-0.5"></div>
            </div>
            {/* Horizontal part */}
            <div className="flex items-center gap-1 mt-0.5 ml-1">
                <div className="w-10 h-[1.5px] bg-[#1B1F3B]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#1B1F3B]"></div>
                <div className="w-1 h-1 rounded-full bg-[#1B1F3B]"></div>
            </div>
        </div>

        {/* Bottom Right Corner Pattern */}
        <div className="absolute bottom-2 right-2 flex items-end justify-end">
            {/* Horizontal part */}
            <div className="flex items-center gap-1 mb-0.5 mr-1">
                <div className="w-1 h-1 rounded-full bg-[#1B1F3B]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#1B1F3B]"></div>
                <div className="w-10 h-[1.5px] bg-[#1B1F3B]"></div>
            </div>
            {/* Vertical part */}
            <div className="flex flex-col items-center gap-1">
                <div className="w-[1.5px] h-10 bg-orange-500 mb-0.5"></div>
                <div className="w-1 h-1 rounded-full bg-orange-500"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                <div className="w-2 h-2 rounded-full bg-[#1B1F3B]"></div>
            </div>
        </div>

        {/* Bottom Left Logo */}
        <div className="absolute bottom-2 left-3 opacity-90 drop-shadow-md">
            {logoUrl && <Image src={logoUrl} alt="Baraka Watermark" width={70} height={24} className="object-contain" unoptimized />}
        </div>
    </div>
)
