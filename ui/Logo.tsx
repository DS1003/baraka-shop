import React from 'react'
import { cn } from '@/lib/utils'

interface LogoProps {
    className?: string
    variant?: 'dark' | 'light'
}

export function Logo({ className, variant = 'light' }: LogoProps) {
    const isDark = variant === 'dark'

    return (
        <div className={cn("flex items-center gap-3 select-none group cursor-pointer", className)}>
            {/* Minimalist Tech Symbol */}
            <div className="relative flex items-center justify-center">
                <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:rotate-[360deg]",
                    isDark ? "bg-white" : "bg-primary"
                )}>
                    {/* The "B" Logic Symbol */}
                    <div className="relative w-6 h-7 flex flex-col justify-between">
                        <div className={cn("w-full h-[3px] rounded-full transition-colors", isDark ? "bg-primary" : "bg-white")} />
                        <div className={cn("w-[80%] h-[3px] rounded-full transition-colors", isDark ? "bg-primary" : "bg-white")} />
                        <div className={cn("w-full h-[3px] rounded-full transition-colors", isDark ? "bg-primary" : "bg-white")} />
                        {/* Connecting line */}
                        <div className={cn("absolute left-0 top-0 w-[3px] h-full rounded-full transition-colors", isDark ? "bg-primary" : "bg-white")} />
                    </div>
                </div>
                {/* Orbital dots for "elaboré" feel */}
                <div className={cn("absolute -top-1 -right-1 w-2 h-2 rounded-full", isDark ? "bg-white" : "bg-primary")} />
            </div>

            {/* Typography */}
            <div className="flex flex-col -gap-1">
                <span className={cn(
                    "text-2xl font-black tracking-tight leading-none transition-colors",
                    isDark ? "text-white" : "text-[#1B1F3B]"
                )}>
                    BARAKA<span className="text-primary">.</span>
                </span>
                <span className={cn(
                    "text-[10px] font-bold tracking-[0.3em] uppercase opacity-70 transition-colors",
                    isDark ? "text-gray-400" : "text-gray-500"
                )}>
                    Premium Shop
                </span>
            </div>
        </div>
    )
}
