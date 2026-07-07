'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Search, ChevronDown, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Option {
    id: string
    name: string
    type?: string
}

interface SearchableDropdownProps {
    options: Option[]
    value: string
    onChange: (val: string) => void
    placeholder?: string
    defaultLabel?: string
}

export function SearchableDropdown({ options, value, onChange, placeholder = "Sélectionner...", defaultLabel = "Toutes" }: SearchableDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const filteredOptions = useMemo(() => {
        if (!search.trim()) return options
        const s = search.toLowerCase()
        return options.filter(o => o.name.toLowerCase().includes(s))
    }, [options, search])

    const selectedOption = useMemo(() => options.find(o => o.id === value), [options, value])

    return (
        <div ref={ref} className="relative w-full">
            <div 
                className="w-full px-3 py-3 bg-white border border-slate-200 rounded-xl text-[12px] font-bold focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all cursor-pointer flex items-center justify-between"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={cn("truncate", !selectedOption && "text-slate-500 font-normal")}>
                    {selectedOption ? selectedOption.name : placeholder}
                </span>
                <ChevronDown size={16} className="text-slate-400 shrink-0 ml-2" />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden"
                    >
                        <div className="p-2 border-b border-slate-100 relative">
                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                className="w-full pl-8 pr-3 py-2 bg-slate-50 border-none rounded-lg text-[12px] focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                                placeholder="Rechercher..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onClick={e => e.stopPropagation()}
                            />
                        </div>
                        <div className="max-h-60 overflow-y-auto p-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
                            <div 
                                className={cn(
                                    "px-3 py-2 text-[12px] rounded-lg cursor-pointer flex items-center justify-between transition-colors mb-1",
                                    !value ? "bg-orange-50 text-orange-600 font-bold" : "hover:bg-slate-50 text-slate-700"
                                )}
                                onClick={() => {
                                    onChange('')
                                    setIsOpen(false)
                                    setSearch('')
                                }}
                            >
                                <span>{defaultLabel}</span>
                                {!value && <Check size={14} />}
                            </div>
                            {filteredOptions.length === 0 ? (
                                <div className="px-3 py-4 text-center text-[12px] text-slate-400">Aucun résultat</div>
                            ) : (
                                filteredOptions.map(opt => (
                                    <div
                                        key={opt.id}
                                        className={cn(
                                            "px-3 py-2 text-[12px] rounded-lg cursor-pointer flex items-center justify-between transition-colors mb-1",
                                            value === opt.id ? "bg-orange-50 text-orange-600 font-bold" : "hover:bg-slate-50 text-slate-700 font-medium"
                                        )}
                                        onClick={() => {
                                            onChange(opt.id)
                                            setIsOpen(false)
                                            setSearch('')
                                        }}
                                    >
                                        <div className="flex flex-col">
                                            <span>{opt.name}</span>
                                            {opt.type && <span className="text-[10px] text-slate-400 font-normal">{opt.type}</span>}
                                        </div>
                                        {value === opt.id && <Check size={14} className="shrink-0 ml-2" />}
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
