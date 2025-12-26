'use client'

import { useState, useEffect } from 'react'
import { ArrowUp, MessageCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }

        window.addEventListener('scroll', toggleVisibility)
        return () => window.removeEventListener('scroll', toggleVisibility)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    }

    return (
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4 items-center">

            {/* WhatsApp Button - Always Visible */}
            <motion.a
                href="https://wa.me/221338000000"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="bg-[#25D366] text-white p-3.5 rounded-full shadow-[0_4px_14px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.6)] flex items-center justify-center transition-shadow border border-white/20 relative group"
            >
                {/* Custom WhatsApp SVG Icon */}
                <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6"
                >
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.698c.93.509 1.693.809 2.812.809 3.183 0 5.775-2.587 5.775-5.766 0-3.18-2.591-5.767-5.776-5.767zm12 5.766c0 6.627-5.373 12-12 12s-12-5.373-12-12 5.373-12 12-12 12 5.373 12 12zm-3.825 5.013c.436-.098.79-.133.926-.216.09-.056.26-.298.26-.576 0-.279-.144-1.353-.198-1.503-.021-.056-.096-.089-.25-.133-.2-.054-1.189-.481-1.373-.535-.141-.041-.237-.066-.341.077-.1.139-.405.503-.497.608-.093.104-.184.116-.39.043-.207-.074-.875-.327-1.666-1.039-.619-.556-1.037-1.242-1.159-1.452-.122-.209-.013-.323.091-.427.094-.093.21-.243.315-.365.105-.121.141-.208.209-.345.069-.139.035-.262-.016-.369-.052-.107-.468-1.139-.642-1.56-.169-.406-.341-.351-.468-.358-.119-.007-.253-.008-.387-.008-.134 0-.352.051-.535.253-.184.202-.705.696-.705 1.697 0 1.001.733 1.968.835 2.106.101.139 1.442 2.227 3.494 3.123 1.258.549 1.748.59 2.385.495.703-.104 1.704-.702 1.944-1.379.24-.677.24-1.256.168-1.379z" />
                </svg>

                {/* Tooltip */}
                <span className="absolute right-full mr-4 bg-white text-black text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg pointer-events-none">
                    Discuter sur WhatsApp
                </span>
            </motion.a>

            <AnimatePresence>
                {isVisible && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        whileHover={{ y: -5 }}
                        onClick={scrollToTop}
                        className="bg-black text-white p-3 rounded-full shadow-2xl hover:bg-primary transition-colors border border-white/20"
                    >
                        <ArrowUp size={24} />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    )
}
