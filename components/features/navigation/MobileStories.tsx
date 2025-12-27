'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const STORIES = [
    { id: 1, label: 'Nouveautés', img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&h=200&fit=crop', active: true },
    { id: 2, label: 'Promos', img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&h=200&fit=crop', active: true },
    { id: 3, label: 'Gaming', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&h=200&fit=crop', active: false },
    { id: 4, label: 'Apple', img: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200&h=200&fit=crop', active: false },
    { id: 5, label: 'Tablettes', img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=200&h=200&fit=crop', active: true },
    { id: 6, label: 'Audio', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop', active: false },
]

export default function MobileStories() {
    return (
        <div className="lg:hidden w-full py-6 scrollbar-hide overflow-x-auto bg-white/50 backdrop-blur-sm border-b border-gray-100/50 mb-2">
            <div className="flex gap-4 px-4 min-w-max">
                {STORIES.map((story) => (
                    <motion.div
                        key={story.id}
                        whileTap={{ scale: 0.9 }}
                        className="flex flex-col items-center gap-2 cursor-pointer group"
                    >
                        <div className={cn(
                            "relative w-20 h-20 rounded-full p-[3px] transition-all",
                            story.active
                                ? "bg-gradient-to-tr from-primary via-orange-500 to-red-500 animate-gradient-xy"
                                : "bg-gray-200"
                        )}>
                            <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-white relative">
                                <Image
                                    src={story.img}
                                    alt={story.label}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                {story.active && (
                                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                            </div>

                            {/* Live Badge if active */}
                            {story.active && story.id === 1 && (
                                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase border border-white shadow-sm ring-1 ring-red-600/20">
                                    LIVE
                                </span>
                            )}
                        </div>
                        <span className={cn(
                            "text-[10px] font-black uppercase tracking-wider transition-colors",
                            story.active ? "text-gray-900" : "text-gray-400"
                        )}>
                            {story.label}
                        </span>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
