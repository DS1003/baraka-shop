'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Search, ChevronDown, Check, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface Option {
    id: string
    name: string
    type?: string
    image?: string | null
}

export interface SearchableDropdownProps {
    options: Option[]
    value: string
    onChange: (val: string) => void
    placeholder?: string
    defaultLabel?: string
    name?: string
    className?: string
    triggerClassName?: string
    disabled?: boolean
    clearable?: boolean
}

export function SearchableDropdown({
    options,
    value,
    onChange,
    placeholder = "Sélectionner...",
    defaultLabel = "Toutes",
    name,
    className,
    triggerClassName,
    disabled = false,
    clearable = true
}: SearchableDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')
    const ref = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        if (isOpen) {
            const timeout = setTimeout(() => {
                inputRef.current?.focus()
            }, 50)
            return () => clearTimeout(timeout)
        } else {
            setSearch('')
        }
    }, [isOpen])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false)
            }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen])

    const filteredOptions = useMemo(() => {
        if (!search.trim()) return options
        const s = search.toLowerCase()
        return options.filter(o => o.name.toLowerCase().includes(s))
    }, [options, search])

    const selectedOption = useMemo(() => options.find(o => o.id === value), [options, value])

    return (
        <div ref={ref} className={cn("relative w-full", isOpen && "z-50", className)}>
            {name && <input type="hidden" name={name} value={value} />}
            <div 
                className={cn(
                    "w-full px-3 py-3 bg-white border border-slate-200 rounded-xl text-[12px] font-bold focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all cursor-pointer flex items-center justify-between select-none",
                    disabled && "opacity-60 cursor-not-allowed pointer-events-none",
                    isOpen && "border-orange-500/40 ring-4 ring-orange-500/10",
                    triggerClassName
                )}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2 truncate min-w-0">
                    {selectedOption?.image && (
                        <img 
                            src={selectedOption.image} 
                            alt={selectedOption.name} 
                            className="w-5 h-5 rounded object-contain bg-slate-50 border border-slate-100 shrink-0" 
                        />
                    )}
                    <span className={cn("truncate", !selectedOption && "text-slate-500 font-normal")}>
                        {selectedOption ? selectedOption.name : placeholder}
                    </span>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                    {value && clearable && !disabled && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                onChange('')
                            }}
                            className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                            title="Effacer"
                        >
                            <X size={13} />
                        </button>
                    )}
                    <ChevronDown size={16} className={cn("text-slate-400 transition-transform duration-200", isOpen && "rotate-180")} />
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -5, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.98 }}
                        transition={{ duration: 0.12 }}
                        className="absolute z-50 left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden"
                    >
                        <div className="p-2 border-b border-slate-100 relative bg-slate-50/50">
                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                                ref={inputRef}
                                type="text"
                                className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-[12px] focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all"
                                placeholder="Rechercher..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onClick={e => e.stopPropagation()}
                            />
                        </div>
                        <div className="max-h-60 overflow-y-auto p-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300">
                            {defaultLabel && (
                                <div 
                                    className={cn(
                                        "px-3 py-2 text-[12px] rounded-lg cursor-pointer flex items-center justify-between transition-colors mb-1 select-none",
                                        !value ? "bg-orange-50 text-orange-600 font-bold" : "hover:bg-slate-50 text-slate-600"
                                    )}
                                    onClick={() => {
                                        onChange('')
                                        setIsOpen(false)
                                        setSearch('')
                                    }}
                                >
                                    <span>{defaultLabel}</span>
                                    {!value && <Check size={14} className="text-orange-600 shrink-0" />}
                                </div>
                            )}
                            {filteredOptions.length === 0 ? (
                                <div className="px-3 py-4 text-center text-[12px] text-slate-400">Aucun résultat trouvé</div>
                            ) : (
                                filteredOptions.map(opt => (
                                    <div
                                        key={opt.id}
                                        className={cn(
                                            "px-3 py-2 text-[12px] rounded-lg cursor-pointer flex items-center justify-between transition-colors mb-1 select-none",
                                            value === opt.id ? "bg-orange-50 text-orange-600 font-bold" : "hover:bg-slate-50 text-slate-700 font-medium"
                                        )}
                                        onClick={() => {
                                            onChange(opt.id)
                                            setIsOpen(false)
                                            setSearch('')
                                        }}
                                    >
                                        <div className="flex items-center gap-2.5 truncate min-w-0">
                                            {opt.image && (
                                                <img 
                                                    src={opt.image} 
                                                    alt={opt.name} 
                                                    className="w-5 h-5 rounded object-contain bg-slate-50 border border-slate-100 shrink-0" 
                                                />
                                            )}
                                            <div className="flex flex-col truncate">
                                                <span className="truncate">{opt.name}</span>
                                                {opt.type && <span className="text-[10px] text-slate-400 font-normal">{opt.type}</span>}
                                            </div>
                                        </div>
                                        {value === opt.id && <Check size={14} className="shrink-0 ml-2 text-orange-600" />}
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
