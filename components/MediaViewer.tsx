'use client'

import React, { useState, useEffect, useCallback } from 'react'
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

    useEffect(() => {
        setActiveIndex(initialIndex)
    }, [initialIndex, isOpen])

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
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 py-8 md:p-10 lg:p-16"
                    onClick={onClose}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />

                    {/* Content */}
                    <div 
                        className="relative flex flex-col md:flex-row w-full h-full max-w-6xl max-h-[80vh] md:max-h-[85vh] bg-zinc-950/95 border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10" 
                        onClick={e => e.stopPropagation()}
                    >

                        {/* Left: Thumbnail strip */}
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
                        <div className="flex-1 flex flex-col relative">
                            {/* Top bar */}
                            <div className="flex items-center justify-between px-6 py-4 relative z-10">
                                <div className="flex items-center gap-3">
                                    <span className="text-white/50 text-[11px] font-bold uppercase tracking-widest">
                                        {activeIndex + 1} / {media.length}
                                    </span>
                                    <span className={cn(
                                        "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                        current.type === 'image' ? "bg-blue-500/20 text-blue-300" :
                                            current.type === 'youtube' ? "bg-red-500/20 text-red-300" :
                                                "bg-purple-500/20 text-purple-300"
                                    )}>
                                        {current.type === 'image' ? 'Image' : current.type === 'youtube' ? 'YouTube' : 'Vidéo'}
                                    </span>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all hover:rotate-90"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Main content area */}
                            <div className="flex-1 flex items-center justify-center relative px-4 pb-4">
                                {/* Navigation arrows */}
                                {media.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setActiveIndex(prev => (prev - 1 + media.length) % media.length)}
                                            className="absolute left-4 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all backdrop-blur-sm border border-white/5"
                                        >
                                            <ChevronLeft className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={() => setActiveIndex(prev => (prev + 1) % media.length)}
                                            className="absolute right-4 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all backdrop-blur-sm border border-white/5"
                                        >
                                            <ChevronRight className="w-6 h-6" />
                                        </button>
                                    </>
                                )}

                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeIndex}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.25 }}
                                        className="w-full h-full flex items-center justify-center"
                                    >
                                        {current.type === 'image' && (
                                            <div className="relative w-full h-full max-w-[90%] max-h-[85vh] flex items-center justify-center overflow-hidden rounded-xl">
                                                <div className="relative w-full h-full">
                                                    <WatermarkOverlay logoUrl={headerLogo} />
                                                    <Image
                                                        src={current.url}
                                                        alt=""
                                                        fill
                                                        className="object-contain"
                                                        unoptimized
                                                        priority
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {current.type === 'video' && (
                                            <div className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/5">
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
                                                <div className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/5">
                                                    <iframe
                                                        src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
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
                            <div className="md:hidden flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide">
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
                                                "relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0",
                                                activeIndex === idx
                                                    ? "border-orange-500 scale-110"
                                                    : "border-white/10 opacity-50"
                                            )}
                                        >
                                            {thumbSrc ? (
                                                <img src={thumbSrc} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                                    <Play className="w-3 h-3 text-white/50" />
                                                </div>
                                            )}
                                            {(item.type === 'video' || item.type === 'youtube') && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-5 h-5 rounded-full bg-orange-500/90 flex items-center justify-center">
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
