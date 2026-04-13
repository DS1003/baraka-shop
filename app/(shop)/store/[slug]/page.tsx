'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Container } from '@/ui/Container';
import { ProductCard } from '@/ui/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Store,
    Package,
    ChevronRight,
    Loader2,
    Search,
    Grid3X3,
    List,
    SlidersHorizontal,
    ArrowUpDown,
    ShieldCheck,
    Truck,
    HeadphonesIcon,
    Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StoreDetailPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [store, setStore] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        if (!slug) return;
        const fetchStore = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/store/${slug}`);
                const data = await res.json();
                setStore(data.store);
                setProducts(data.products || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStore();
    }, [slug]);

    // Filtering & sorting
    const filteredProducts = products
        .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === 'price-asc') return a.price - b.price;
            if (sortBy === 'price-desc') return b.price - a.price;
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            return 0; // newest (default order from API)
        });

    if (loading) {
        return (
            <main className="bg-[#f8f9fb] min-h-screen flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Chargement de la boutique...</p>
            </main>
        );
    }

    if (!store) {
        return (
            <main className="bg-[#f8f9fb] min-h-screen flex flex-col items-center justify-center gap-6">
                <Store size={64} className="text-slate-200" />
                <h1 className="text-2xl font-black text-slate-900">Boutique introuvable</h1>
                <Link href="/" className="text-primary font-bold hover:underline">Retour à l'accueil</Link>
            </main>
        );
    }

    return (
        <main className="bg-[#f8f9fb] min-h-screen">
            {/* Hero Banner */}
            <div className="relative bg-[#1B1F3B] overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2" />
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)',
                        backgroundSize: '40px 40px'
                    }} />
                </div>

                <Container className="relative z-10 py-16 md:py-24">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-10">
                        <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
                        <ChevronRight className="w-3 h-3" />
                        <Link href="/boutique" className="hover:text-primary transition-colors">Boutique</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-primary">{store.name}</span>
                    </div>

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                        {/* Logo */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-28 h-28 md:w-36 md:h-36 rounded-[28px] bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl shadow-black/20 flex-shrink-0"
                        >
                            {store.logo ? (
                                <img src={store.logo} alt={store.name} className="w-full h-full object-contain p-4" />
                            ) : (
                                <Store size={56} className="text-white/30" />
                            )}
                        </motion.div>

                        {/* Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-center md:text-left flex-1"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
                                <ShieldCheck size={12} />
                                Boutique Vérifiée
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-none mb-4">
                                {store.name}
                            </h1>
                            <p className="text-gray-400 text-[15px] leading-relaxed max-w-xl font-medium">
                                {store.description || "Découvrez tous les produits de cette boutique partenaire Baraka Shop."}
                            </p>

                            {/* Stats */}
                            <div className="flex items-center gap-6 mt-8 justify-center md:justify-start">
                                <div className="flex items-center gap-2 text-white/60">
                                    <Package size={16} className="text-primary" />
                                    <span className="text-sm font-bold">{products.length} Produit{products.length !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                                    ))}
                                    <span className="text-white/40 text-xs font-bold ml-1">5.0</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </Container>
            </div>

            {/* Trust Badges */}
            <div className="bg-white border-b border-gray-100">
                <Container>
                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                        {[
                            { icon: ShieldCheck, label: 'Produits Authentiques', desc: 'Garantie 100% original' },
                            { icon: Truck, label: 'Livraison Rapide', desc: 'Partout au Sénégal' },
                            { icon: HeadphonesIcon, label: 'Support Dédié', desc: 'Assistance personnalisée' },
                        ].map((badge, i) => (
                            <div key={i} className="flex items-center gap-4 py-5 px-6">
                                <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center flex-shrink-0">
                                    <badge.icon size={20} />
                                </div>
                                <div>
                                    <p className="text-[12px] font-black text-slate-900 uppercase tracking-wide">{badge.label}</p>
                                    <p className="text-[11px] text-slate-400 font-medium">{badge.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Container>
            </div>

            {/* Products Section */}
            <Container className="py-12">
                {/* Toolbar */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                            Produits <span className="text-primary italic font-serif">disponibles</span>
                        </h2>
                        <p className="text-sm text-slate-400 font-medium mt-1">
                            {filteredProducts.length} résultat{filteredProducts.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {/* Search */}
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/10 appearance-none cursor-pointer"
                        >
                            <option value="newest">Plus récents</option>
                            <option value="price-asc">Prix croissant</option>
                            <option value="price-desc">Prix décroissant</option>
                            <option value="name">Alphabétique</option>
                        </select>

                        {/* View toggle */}
                        <div className="hidden md:flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={cn("p-2.5 transition-colors", viewMode === 'grid' ? "bg-primary text-white" : "text-slate-400 hover:bg-slate-50")}
                            >
                                <Grid3X3 size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn("p-2.5 transition-colors", viewMode === 'list' ? "bg-primary text-white" : "text-slate-400 hover:bg-slate-50")}
                            >
                                <List size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                {filteredProducts.length > 0 ? (
                    <motion.div
                        className={cn(
                            "gap-6",
                            viewMode === 'grid'
                                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                                : "flex flex-col"
                        )}
                    >
                        {filteredProducts.map((product, i) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                            >
                                <ProductCard product={product} viewMode={viewMode} />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="py-32 flex flex-col items-center justify-center gap-4 text-slate-400">
                        <Package size={48} strokeWidth={1} />
                        <p className="font-bold uppercase tracking-widest text-xs">
                            {searchQuery ? 'Aucun produit trouvé pour cette recherche' : 'Aucun produit dans cette boutique pour le moment'}
                        </p>
                        <p className="text-sm text-slate-300">Les produits seront bientôt disponibles.</p>
                    </div>
                )}
            </Container>
        </main>
    );
}
