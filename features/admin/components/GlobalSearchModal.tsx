'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Box, Layers, User, ChevronRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { globalAdminSearch } from '@/lib/actions/search-actions';

export function GlobalSearchModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<{ products: any[], categories: any[], users: any[] }>({
        products: [],
        categories: [],
        users: []
    });
    
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setQuery('');
            setResults({ products: [], categories: [], users: [] });
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (query.length < 2) {
            setResults({ products: [], categories: [], users: [] });
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const data = await globalAdminSearch(query);
                setResults(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleNavigate = (path: string) => {
        onClose();
        router.push(path);
    };

    if (!isOpen) return null;

    const hasResults = results.products.length > 0 || results.categories.length > 0 || results.users.length > 0;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] sm:pt-[15vh]">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={onClose}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 mx-4"
            >
                <div className="flex items-center px-4 py-4 border-b border-slate-100 relative">
                    <Search className="text-orange-500 mr-3" size={20} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Rechercher un produit, catégorie, client (ex: SKU, nom...)"
                        className="flex-1 bg-transparent border-none focus:outline-none text-slate-800 text-[16px] placeholder:text-slate-400 font-medium"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    {loading && <Loader2 className="absolute right-12 animate-spin text-slate-300" size={18} />}
                    <div className="flex items-center gap-2">
                        <span className="hidden sm:inline-block px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-400">ESC</span>
                        <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto bg-[#F8F9FA] p-2">
                    {query.length >= 2 && !loading && !hasResults && (
                        <div className="py-12 text-center">
                            <Search className="mx-auto text-slate-300 mb-3" size={32} />
                            <p className="text-slate-500 font-medium text-[14px]">Aucun résultat pour "{query}"</p>
                        </div>
                    )}
                    
                    {query.length < 2 && (
                        <div className="py-8 text-center">
                            <p className="text-slate-400 text-[13px] font-medium">Tapez au moins 2 caractères pour chercher...</p>
                        </div>
                    )}

                    {hasResults && (
                        <div className="space-y-4 p-2">
                            {/* Products Section */}
                            {results.products.length > 0 && (
                                <div>
                                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">Produits</h3>
                                    <div className="space-y-1">
                                        {results.products.map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => handleNavigate(`/admin/products/${p.id}/edit`)}
                                                className="w-full flex items-center justify-between p-3 bg-white hover:bg-orange-50 rounded-xl border border-transparent hover:border-orange-100 transition-all text-left group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                                        {p.images?.[0] ? (
                                                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Box size={16} className="text-slate-300" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-[13px] font-bold text-slate-800 line-clamp-1">{p.name}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">{p.reference || 'SANS RÉF'}</span>
                                                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                            <span className="text-[10px] text-orange-600 font-bold bg-orange-100/50 px-1.5 py-0.5 rounded uppercase">{p.category?.name || 'Général'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <ChevronRight size={16} className="text-slate-300 group-hover:text-orange-500" />
                                            </button>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={() => handleNavigate(`/admin/products?search=${encodeURIComponent(query)}`)}
                                        className="w-full text-center py-2 text-[12px] font-bold text-orange-600 hover:text-orange-700 mt-1"
                                    >
                                        Voir tous les produits pour "{query}"
                                    </button>
                                </div>
                            )}

                            {/* Categories Section */}
                            {results.categories.length > 0 && (
                                <div>
                                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">Catégories</h3>
                                    <div className="space-y-1">
                                        {results.categories.map(c => (
                                            <button
                                                key={c.id}
                                                onClick={() => handleNavigate(`/admin/categories?edit=${c.id}`)}
                                                className="w-full flex items-center justify-between p-3 bg-white hover:bg-orange-50 rounded-xl border border-transparent hover:border-orange-100 transition-all text-left group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                                                        <Layers size={14} />
                                                    </div>
                                                    <p className="text-[13px] font-bold text-slate-800">{c.name}</p>
                                                </div>
                                                <ChevronRight size={16} className="text-slate-300 group-hover:text-orange-500" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Users Section */}
                            {results.users.length > 0 && (
                                <div>
                                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">Clients</h3>
                                    <div className="space-y-1">
                                        {results.users.map(u => (
                                            <button
                                                key={u.id}
                                                onClick={() => handleNavigate(`/admin/customers?search=${encodeURIComponent(u.email || u.username)}`)}
                                                className="w-full flex items-center justify-between p-3 bg-white hover:bg-orange-50 rounded-xl border border-transparent hover:border-orange-100 transition-all text-left group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                                        <User size={14} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[13px] font-bold text-slate-800">{u.username || 'Client'}</p>
                                                        <p className="text-[11px] text-slate-500">{u.email || u.phone}</p>
                                                    </div>
                                                </div>
                                                <ChevronRight size={16} className="text-slate-300 group-hover:text-orange-500" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
