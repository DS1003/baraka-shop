'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Play, Maximize2, Minimize2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useSiteLogos } from '@/lib/hooks/useSiteLogos'
import { WatermarkOverlay } from '@/ui/WatermarkOverlay'

export type MediaItem = {
    type: 'image' | 'video' | 'youtube'
    url: string
    thumbnail?: string
}

/**
 * Extract YouTube video ID from various URL formats
 */
function getYouTubeId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=)([^&\s]+)/,
        /(?:youtube\.com\/embed\/)([^?\s]+)/,
        /(?:youtu\.be\/)([^?\s]+)/,
        /(?:youtube\.com\/shorts\/)([^?\s]+)/,
    ]
    for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match) return match[1]
    }
    return null
}

/**
 * Get YouTube thumbnail URL from video ID
 */
function getYouTubeThumbnail(videoId: string): string {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

interface MediaViewerProps {
    media: MediaItem[]
    initialIndex?: number
    isOpen: boolean
    onClose: () => void
}

export function MediaViewer({ media, initialIndex = 0, isOpen, onClose }: MediaViewerProps) {
    const [activeIndex, setActiveIndex] = useState(initialIndex)
    const { headerLogo } = useSiteLogos()
    const touchStartX = useRef<number | null>(null)
    const touchEndX = useRef<number | null>(null)
    const mobileThumbnailsRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setActiveIndex(initialIndex)
    }, [initialIndex, isOpen])

    // Scroll active thumbnail into view smoothly on mobile
    useEffect(() => {
        if (mobileThumbnailsRef.current) {
            const activeBtn = mobileThumbnailsRef.current.children[activeIndex] as HTMLElement
            if (activeBtn) {
                activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
            }
        }
    }, [activeIndex])

    // Swipe handlers for mobile
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX
        touchEndX.current = null
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX
    }

    const handleTouchEnd = () => {
        if (touchStartX.current === null || touchEndX.current === null) return
        const distance = touchStartX.current - touchEndX.current
        const isSwipe = Math.abs(distance) > 40
        if (isSwipe) {
            if (distance > 0) {
                // Swiped left -> next
                setActiveIndex(prev => (prev + 1) % media.length)
            } else {
                // Swiped right -> prev
                setActiveIndex(prev => (prev - 1 + media.length) % media.length)
            }
        }
        touchStartX.current = null
        touchEndX.current = null
    }

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowLeft') setActiveIndex(prev => (prev - 1 + media.length) % media.length)
            if (e.key === 'ArrowRight') setActiveIndex(prev => (prev + 1) % media.length)
        }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [isOpen, media.length, onClose])

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    if (!isOpen || media.length === 0) return null

    const current = media[activeIndex]

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-6 lg:p-10"
                    onClick={onClose}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/95 md:bg-black/85 backdrop-blur-md" />

                    {/* Content */}
                    <div 
                        className="relative flex flex-col md:flex-row w-full h-full max-w-6xl md:max-h-[88vh] bg-black md:bg-zinc-950/95 border-0 md:border md:border-white/10 rounded-none md:rounded-3xl shadow-2xl overflow-hidden z-10" 
                        onClick={e => e.stopPropagation()}
                    >

                        {/* Left: Thumbnail strip (Desktop) */}
                        <div className="hidden md:flex flex-col w-[100px] bg-black/40 border-r border-white/5 py-4 overflow-y-auto scrollbar-hide gap-2 px-2">
                            {media.map((item, idx) => {
                                const isYT = item.type === 'youtube'
                                const ytId = isYT ? getYouTubeId(item.url) : null
                                const thumbSrc = item.thumbnail
                                    || (isYT && ytId ? getYouTubeThumbnail(ytId) : undefined)
                                    || (item.type === 'image' ? item.url : undefined)

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveIndex(idx)}
                                        className={cn(
                                            "relative w-full aspect-square rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 group",
                                            activeIndex === idx
                                                ? "border-orange-500 shadow-lg shadow-orange-500/20 scale-105"
                                                : "border-white/10 hover:border-white/30 opacity-60 hover:opacity-100"
                                        )}
                                    >
                                        {thumbSrc ? (
                                            <img
                                                src={thumbSrc}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                                <Play className="w-5 h-5 text-white/50" />
                                            </div>
                                        )}
                                        {/* Video/YT play badge */}
                                        {(item.type === 'video' || item.type === 'youtube') && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-7 h-7 rounded-full bg-orange-500/90 flex items-center justify-center shadow-lg">
                                                    <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                )
                            })}
                        </div>

                        {/* Center: Main viewer */}
                        <div className="flex-1 flex flex-col relative w-full h-full overflow-hidden">
                            {/* Top bar */}
                            <div className="flex items-center justify-between pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3 px-4 md:px-6 md:py-4 relative z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent md:bg-none">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <span className="text-white/70 text-[11px] md:text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/5">
                                        {activeIndex + 1} / {media.length}
                                    </span>
                                    <span className={cn(
                                        "px-2.5 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-sm",
                                        current.type === 'image' ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" :
                                            current.type === 'youtube' ? "bg-red-500/20 text-red-300 border border-red-500/30" :
                                                "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                    )}>
                                        {current.type === 'image' ? 'Image' : current.type === 'youtube' ? 'YouTube' : 'Vidéo'}
                                    </span>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white transition-all backdrop-blur-sm border border-white/10"
                                    aria-label="Fermer la vue média"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Main content area with swipe support */}
                            <div 
                                className="flex-1 flex items-center justify-center relative px-2 sm:px-4 md:px-8 overflow-hidden touch-pan-y"
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                            >
                                {/* Navigation arrows */}
                                {media.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setActiveIndex(prev => (prev - 1 + media.length) % media.length)}
                                            className="absolute left-2 md:left-4 z-20 w-9 h-9 md:w-12 md:h-12 rounded-full bg-black/60 hover:bg-black/80 md:bg-white/10 md:hover:bg-white/20 flex items-center justify-center text-white transition-all backdrop-blur-md border border-white/10 shadow-lg active:scale-90"
                                            aria-label="Média précédent"
                                        >
                                            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                                        </button>
                                        <button
                                            onClick={() => setActiveIndex(prev => (prev + 1) % media.length)}
                                            className="absolute right-2 md:right-4 z-20 w-9 h-9 md:w-12 md:h-12 rounded-full bg-black/60 hover:bg-black/80 md:bg-white/10 md:hover:bg-white/20 flex items-center justify-center text-white transition-all backdrop-blur-md border border-white/10 shadow-lg active:scale-90"
                                            aria-label="Média suivant"
                                        >
                                            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                                        </button>
                                    </>
                                )}

                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeIndex}
                                        initial={{ opacity: 0, scale: 0.96 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.96 }}
                                        transition={{ duration: 0.2 }}
                                        className="w-full h-full flex items-center justify-center p-2"
                                    >
                                        {current.type === 'image' && (
                                            <div className="relative inline-flex items-center justify-center max-w-full max-h-full">
                                                <div className="relative inline-block max-w-full max-h-[66vh] md:max-h-[75vh] overflow-hidden rounded-xl md:rounded-2xl">
                                                    <img
                                                        src={current.url}
                                                        alt=""
                                                        className="max-w-full max-h-[66vh] md:max-h-[75vh] w-auto h-auto object-contain block rounded-xl md:rounded-2xl select-none pointer-events-none"
                                                    />
                                                    <WatermarkOverlay logoUrl={headerLogo} />
                                                </div>
                                            </div>
                                        )}

                                        {current.type === 'video' && (
                                            <div className="relative w-full max-w-full md:max-w-4xl aspect-video rounded-xl md:rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10">
                                                <video
                                                    src={current.url}
                                                    controls
                                                    autoPlay
                                                    className="w-full h-full object-contain"
                                                    playsInline
                                                />
                                            </div>
                                        )}

                                        {current.type === 'youtube' && (() => {
                                            const ytId = getYouTubeId(current.url)
                                            if (!ytId) return <p className="text-white/50">URL YouTube invalide</p>
                                            return (
                                                <div className="relative w-full max-w-full md:max-w-4xl aspect-video rounded-xl md:rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10">
                                                    <iframe
                                                        src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0`}
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                        allowFullScreen
                                                        className="w-full h-full"
                                                        title="YouTube video"
                                                    />
                                                </div>
                                            )
                                        })()}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Bottom: Mobile thumbnails */}
                            <div 
                                ref={mobileThumbnailsRef}
                                className="md:hidden flex gap-2.5 px-4 pt-2 pb-[calc(0.85rem+env(safe-area-inset-bottom))] overflow-x-auto scrollbar-hide bg-gradient-to-t from-black/80 via-black/40 to-transparent items-center justify-start min-h-[72px]"
                            >
                                {media.map((item, idx) => {
                                    const isYT = item.type === 'youtube'
                                    const ytId = isYT ? getYouTubeId(item.url) : null
                                    const thumbSrc = item.thumbnail
                                        || (isYT && ytId ? getYouTubeThumbnail(ytId) : undefined)
                                        || (item.type === 'image' ? item.url : undefined)

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveIndex(idx)}
                                            className={cn(
                                                "relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 active:scale-95",
                                                activeIndex === idx
                                                    ? "border-orange-500 ring-2 ring-orange-500/40 shadow-lg shadow-orange-500/25 opacity-100"
                                                    : "border-white/15 opacity-50 hover:opacity-80"
                                            )}
                                        >
                                            {thumbSrc ? (
                                                <img src={thumbSrc} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                                    <Play className="w-3.5 h-3.5 text-white/50" />
                                                </div>
                                            )}
                                            {(item.type === 'video' || item.type === 'youtube') && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                    <div className="w-5 h-5 rounded-full bg-orange-500/90 flex items-center justify-center shadow">
                                                        <Play className="w-2.5 h-2.5 text-white fill-white ml-px" />
                                                    </div>
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

/**
 * Helper: Build MediaItem array from product images and videos
 */
export function buildProductMedia(images: string[], videos: string[]): MediaItem[] {
    const items: MediaItem[] = []

    // Add images
    for (const img of images) {
        items.push({ type: 'image', url: img })
    }

    // Add videos (distinguish YouTube from direct uploads)
    for (const vid of videos) {
        const ytId = getYouTubeId(vid)
        if (ytId) {
            items.push({
                type: 'youtube',
                url: vid,
                thumbnail: getYouTubeThumbnail(ytId)
            })
        } else {
            items.push({
                type: 'video',
                url: vid,
            })
        }
    }

    return items
}

export { getYouTubeId, getYouTubeThumbnail }
