import React from 'react'
import Image from 'next/image'

export const WatermarkOverlay = ({ logoUrl, isThumbnail = false, isCard = false }: { logoUrl?: string, isThumbnail?: boolean, isCard?: boolean }) => {
    const topLeftPattern = (
        <div className="flex items-start">
            <div className="relative flex flex-col items-center">
                {/* Origin */}
                <div className="w-4 h-4 md:w-5 md:h-5 rounded-full border-[2px] border-black flex items-center justify-center relative z-10 bg-transparent">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#F97316]"></div>
                </div>
                
                {/* Vertical Orange Dots & Line */}
                <div className="flex flex-col items-center gap-1.5 md:gap-1.5 mt-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#F97316]"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#F97316]"></div>
                    <div className="w-1 h-1 rounded-full bg-[#F97316]"></div>
                    {/* Tapering line */}
                    <div className="w-[2px] md:w-[2.5px] h-16 md:h-24 lg:h-32 bg-gradient-to-b from-[#F97316] to-transparent mt-1" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}></div>
                </div>
            </div>
            
            {/* Horizontal Black Dots & Line */}
            <div className="flex items-center gap-1.5 md:gap-1.5 ml-1.5 mt-[4px] md:mt-[5px]">
                <div className="w-2 h-2 rounded-full bg-black"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                <div className="w-1 h-1 rounded-full bg-black"></div>
                {/* Tapering line */}
                <div className="h-[2px] md:h-[2.5px] w-20 md:w-32 lg:w-48 bg-gradient-to-r from-black to-transparent ml-1" style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }}></div>
            </div>
        </div>
    );

    const bottomRightPattern = (
        <div className="flex items-end">
            {/* Horizontal Black Dots & Line (going left) */}
            <div className="flex items-center gap-1.5 md:gap-1.5 mr-1.5 mb-[4px] md:mb-[5px] flex-row-reverse">
                <div className="w-2 h-2 rounded-full bg-black"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                <div className="w-1 h-1 rounded-full bg-black"></div>
                <div className="h-[2px] md:h-[2.5px] w-20 md:w-32 lg:w-48 bg-gradient-to-l from-black to-transparent mr-1" style={{ clipPath: 'polygon(100% 0, 0 50%, 100% 100%)' }}></div>
            </div>

            <div className="relative flex flex-col items-center flex-col-reverse">
                {/* Origin */}
                <div className="w-4 h-4 md:w-5 md:h-5 rounded-full border-[2px] border-black flex items-center justify-center relative z-10 bg-transparent">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#F97316]"></div>
                </div>
                
                {/* Vertical Orange Dots & Line (going up) */}
                <div className="flex flex-col-reverse items-center gap-1.5 md:gap-1.5 mb-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#F97316]"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#F97316]"></div>
                    <div className="w-1 h-1 rounded-full bg-[#F97316]"></div>
                    <div className="w-[2px] md:w-[2.5px] h-16 md:h-24 lg:h-32 bg-gradient-to-t from-[#F97316] to-transparent mb-1" style={{ clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' }}></div>
                </div>
            </div>
        </div>
    );

    const logo = logoUrl ? (
        <div className="opacity-95 drop-shadow-md flex items-end">
            <div className="relative w-32 h-10 md:w-40 md:h-12 lg:w-48 lg:h-14 translate-y-1">
                <Image src={logoUrl} alt="Baraka Shop" fill className="object-contain object-left-bottom" unoptimized />
            </div>
        </div>
    ) : null;

    if (isThumbnail || isCard) {
        const scaleClasses = isThumbnail 
            ? "scale-[0.20] md:scale-[0.25]" 
            : "scale-[0.5] md:scale-[0.6]";

        return (
            <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden rounded-[inherit]">
                <div className={`absolute top-0 left-0 origin-top-left ${scaleClasses}`}>
                    {topLeftPattern}
                </div>
                <div className={`absolute bottom-0 right-0 origin-bottom-right ${scaleClasses}`}>
                    {bottomRightPattern}
                </div>
                {logo && (
                    <div className={`absolute bottom-0 left-0 origin-bottom-left ${scaleClasses}`}>
                        {logo}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
            <div className="absolute top-0 left-0">
                {topLeftPattern}
            </div>
            <div className="absolute bottom-0 right-0">
                {bottomRightPattern}
            </div>
            {logo && (
                <div className="absolute bottom-1 left-1 md:bottom-2 md:left-2">
                    {logo}
                </div>
            )}
        </div>
    )
}
