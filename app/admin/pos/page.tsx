'use client';

import React, { useState, useEffect } from 'react';
import {
    Search,
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    CheckCircle2,
    CreditCard,
    Smartphone,
    Banknote,
    User,
    ChevronRight,
    Tag,
    X,
    Filter,
    Layers,
    History,
    Zap,
    Loader2,
    Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getAdminProducts } from '@/lib/actions/admin-actions';

export default function POSPage() {
    const [cart, setCart] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProducts() {
            setLoading(true);
            try {
                const data = await getAdminProducts('', 1, 1000); // Load up to 1000 products for POS
                setAllProducts(data.products);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        loadProducts();
    }, []);

    const addToCart = (product: any) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const filteredProducts = allProducts.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <div className="flex flex-col lg:flex-row h-full -m-10 gap-0 overflow-hidden bg-[#F8FAFC]">
            {/* Left: Product Selection */}
            <div className="flex-1 flex flex-col p-8 overflow-hidden">
                {/* Search & Categories */}
                <div className="space-y-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Chercher un produit..."
                                className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[20px] text-[15px] font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
                        <Loader2 className="animate-spin text-orange-600" size={32} />
                        <p className="font-bold uppercase tracking-widest text-[10px]">Chargement inventaire...</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 content-start pb-20">
                        {filteredProducts.map((product) => (
                            <motion.button
                                key={product.id}
                                whileHover={{ y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => addToCart(product)}
                                className="bg-white p-5 rounded-[28px] border border-slate-200/50 shadow-sm flex flex-col text-left group active:shadow-inner transition-all hover:bg-slate-50"
                            >
                                <div className="aspect-[4/5] bg-slate-50 rounded-[22px] mb-4 flex items-center justify-center text-slate-200 overflow-hidden group-hover:bg-slate-100 transition-colors border border-slate-100">
                                    {product.images?.[0] ? (
                                        <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon size={32} />
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-[13px] font-bold text-slate-900 line-clamp-1">{product.name}</h4>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{product.category?.name || 'GÉNÉRAL'}</p>
                                    <div className="pt-2 flex items-center justify-between">
                                        <span className="text-[15px] font-black text-orange-600">{product.price.toLocaleString()} F</span>
                                        <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Plus size={14} strokeWidth={3} />
                                        </div>
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                )}
            </div>

            {/* Right: Checkout Sidebar */}
            <div className="w-full lg:w-[450px] bg-white border-l border-slate-200/60 flex flex-col z-20 shadow-[-20px_0_40px_-20px_rgba(0,0,0,0.03)]">
                {/* Customer Section */}
                <div className="p-8 border-b border-slate-100/60">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[18px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            <ShoppingCart size={20} className="text-orange-600" /> Vente en cours
                        </h3>
                        <button
                            className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                            onClick={() => setCart([])}
                            disabled={cart.length === 0}
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 flex items-center gap-4 group cursor-pointer hover:bg-white hover:border-orange-200 transition-all">
                        <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-orange-600 transition-colors">
                            <User size={16} />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Client</p>
                            <p className="text-[13px] font-bold text-slate-900">Passage Comptoir</p>
                        </div>
                        <ChevronRight size={14} className="text-slate-300" />
                    </div>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                    <AnimatePresence>
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                                <div className="w-16 h-16 bg-slate-100 rounded-[28px] flex items-center justify-center text-slate-300">
                                    <ShoppingCart size={28} />
                                </div>
                                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Panier Vide</p>
                            </div>
                        ) : (
                            cart.map((item) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="flex items-center gap-4"
                                >
                                    <div className="w-12 h-12 bg-slate-50 rounded-lg flex-shrink-0 flex items-center justify-center text-slate-200 overflow-hidden border border-slate-100">
                                        {item.images?.[0] ? <img src={item.images[0]} className="w-full h-full object-cover" /> : <ImageIcon size={16} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-bold text-slate-900 leading-snug truncate">{item.name}</p>
                                        <p className="text-[11px] text-slate-400 font-bold tabular-nums">{item.price.toLocaleString()} F</p>
                                    </div>
                                    <div className="flex items-center bg-slate-50 rounded-lg p-1 gap-1 border border-slate-100">
                                        <button
                                            onClick={() => setCart(prev => prev.map(p => p.id === item.id ? { ...p, quantity: Math.max(0, p.quantity - 1) } : p).filter(p => p.quantity > 0))}
                                            className="w-6 h-6 bg-white rounded-md flex items-center justify-center shadow-sm text-slate-400 hover:text-rose-500 transition-all"
                                        >
                                            <Minus size={10} strokeWidth={3} />
                                        </button>
                                        <span className="text-[12px] font-black text-slate-900 min-w-[20px] text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => addToCart(item)}
                                            className="w-6 h-6 bg-white rounded-md flex items-center justify-center shadow-sm text-slate-400 hover:text-orange-600 transition-all"
                                        >
                                            <Plus size={10} strokeWidth={3} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>

                {/* Totals & Checkout */}
                <div className="p-8 bg-slate-50/50 border-t border-slate-200 space-y-8 shadow-[inner_0_4px_10px_rgba(0,0,0,0.02)]">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-slate-500">
                            <span className="text-[12px] font-bold">Sous-total</span>
                            <span className="text-[13px] font-bold tabular-nums">{total.toLocaleString()} F</span>
                        </div>
                        <div className="pt-3 border-t border-slate-200/60 flex justify-between items-center">
                            <span className="text-[14px] font-black text-slate-900 uppercase tracking-widest">Total Net</span>
                            <span className="text-[22px] font-black text-orange-600 tabular-nums">{total.toLocaleString()} F</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <PaymentType icon={Banknote} label="CASH" active />
                        <PaymentType icon={Smartphone} label="MOBILE" />
                        <PaymentType icon={CreditCard} label="CARTE" />
                    </div>

                    <button
                        className="w-full py-5 bg-orange-600 text-white rounded-[20px] font-black text-[13px] uppercase tracking-[0.2em] shadow-xl shadow-orange-200 flex items-center justify-center gap-3 hover:bg-orange-700 transition-all active:scale-95 disabled:opacity-50"
                        disabled={cart.length === 0}
                    >
                        <Zap size={18} fill="#fff" />
                        <span>Valider la Vente</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function PaymentType({ icon: Icon, label, active }: any) {
    return (
        <button className={cn(
            "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all active:scale-95",
            active ? "bg-white border-orange-600 text-orange-600 shadow-sm ring-4 ring-orange-50" : "bg-white border-slate-200 text-slate-400 hover:border-orange-100"
        )}>
            <Icon size={16} strokeWidth={2.5} />
            <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
        </button>
    );
}
