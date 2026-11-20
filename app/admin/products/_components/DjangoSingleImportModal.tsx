'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    X,
    Search,
    Loader2,
    Check,
    AlertCircle,
    ArrowRight,
    CloudDownload,
    Image as ImageIcon,
    FileText,
    AlignLeft,
    CheckSquare,
    Square,
    Sparkles,
    RefreshCw,
    ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    searchDjangoProductsAction,
    getDjangoProductByReferenceAction,
    transferDjangoImagesAction
} from '@/lib/actions/admin-django-actions';
import { DjangoCleanProduct } from '@/lib/services/django-service';
import { toast } from 'sonner';

interface DjangoSingleImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialReference?: string;
    currentFormValues: {
        name: string;
        shortDescription: string;
        featuresText: string;
        images: string[];
    };
    onApplyImport: (imported: {
        name?: string;
        shortDescription?: string;
        featuresText?: string;
        images?: string[];
    }) => void;
}

export function DjangoSingleImportModal({
    isOpen,
    onClose,
    initialReference = '',
    currentFormValues,
    onApplyImport
}: DjangoSingleImportModalProps) {
    const [searchQuery, setSearchQuery] = useState(initialReference);
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<DjangoCleanProduct[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<DjangoCleanProduct | null>(null);
    const [searchError, setSearchError] = useState<string | null>(null);

    // Selected fields to import
    const [importName, setImportName] = useState(true);
    const [importShortDesc, setImportShortDesc] = useState(true);
    const [importFeatures, setImportFeatures] = useState(true);
    const [importImages, setImportImages] = useState(true);
    const [imageMode, setImageMode] = useState<'append' | 'replace'>('append');

    // Transferring state
    const [isTransferringImages, setIsTransferringImages] = useState(false);
    const [transferStatus, setTransferStatus] = useState<string>('');

    // Search timeout ref for debounce
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Body scroll lock & Escape key handling (Normes UX modales)
    useEffect(() => {
        if (!isOpen) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isTransferringImages) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, isTransferringImages, onClose]);

    // When modal opens or initialReference changes
    useEffect(() => {
        if (!isOpen) {
            setSelectedProduct(null);
            setSearchResults([]);
            setSearchError(null);
            return;
        }

        const cleanRef = initialReference.trim();
        setSearchQuery(cleanRef);

        if (cleanRef) {
            // Auto-search by exact reference first
            setIsSearching(true);
            setSearchError(null);
            getDjangoProductByReferenceAction(cleanRef)
                .then((res) => {
                    if (res.success && res.product) {
                        setSelectedProduct(res.product);
                        setImportShortDesc(res.product.hasLibelle);
                    } else {
                        // Fallback to broader search
                        return searchDjangoProductsAction({ q: cleanRef, pageSize: 8 });
                    }
                })
                .then((searchRes) => {
                    if (searchRes && searchRes.success) {
                        setSearchResults(searchRes.results);
                        if (searchRes.results.length === 1 && !selectedProduct) {
                            setSelectedProduct(searchRes.results[0]);
                            setImportShortDesc(searchRes.results[0].hasLibelle);
                        } else if (searchRes.results.length === 0) {
                            setSearchError(`Aucun produit actif trouvé pour "${cleanRef}".`);
                        }
                    }
                })
                .catch((err) => {
                    setSearchError("Impossible de joindre l'API Django.");
                })
                .finally(() => {
                    setIsSearching(false);
                });
        }
    }, [isOpen, initialReference]);

    // Handle manual search with debounce
    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        setSearchError(null);

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        if (!query.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        debounceTimerRef.current = setTimeout(async () => {
            const res = await searchDjangoProductsAction({ q: query.trim(), pageSize: 10 });
            setIsSearching(false);
            if (res.success) {
                setSearchResults(res.results);
                if (res.results.length === 0) {
                    setSearchError(`Aucun produit actif correspondant à "${query}".`);
                }
            } else {
                setSearchError(res.error || "Erreur de recherche Django.");
            }
        }, 350);
    };

    const handleSelectProduct = (product: DjangoCleanProduct) => {
        setSelectedProduct(product);
        setImportName(true);
        setImportShortDesc(product.hasLibelle);
        setImportFeatures(true);
        setImportImages(product.images.length > 0);
        // Default image mode: if baraka already has images, use append
        setImageMode(currentFormValues.images.length > 0 ? 'append' : 'replace');
    };

    const handleConfirmImport = async () => {
        if (!selectedProduct) return;

        const importedData: {
            name?: string;
            shortDescription?: string;
            featuresText?: string;
            images?: string[];
        } = {};

        if (importName && selectedProduct.name) {
            importedData.name = selectedProduct.name;
        }

        if (importShortDesc && selectedProduct.hasLibelle) {
            importedData.shortDescription = selectedProduct.shortDescription;
        }

        if (importFeatures && selectedProduct.featuresText) {
            importedData.featuresText = selectedProduct.featuresText;
        }

        // Image transfer handling
        if (importImages && selectedProduct.images.length > 0) {
            setIsTransferringImages(true);
            setTransferStatus(`Transfert sécurisé de ${selectedProduct.images.length} image(s) vers Cloudinary...`);

            try {
                const rawUrls = selectedProduct.images.map(img => img.resolvedUrl);
                const transferRes = await transferDjangoImagesAction(rawUrls);

                if (!transferRes.success) {
                    toast.error(transferRes.error || "Erreur lors du transfert des images.");
                    setIsTransferringImages(false);
                    return;
                }

                const transferredUrls = transferRes.urls;

                if (transferredUrls.length === 0 && rawUrls.length > 0) {
                    toast.warning("Aucune image n'a pu être transférée vers Cloudinary.");
                } else {
                    if (imageMode === 'replace') {
                        importedData.images = transferredUrls;
                    } else {
                        // append
                        const existing = currentFormValues.images || [];
                        const merged = [...existing];
                        for (const u of transferredUrls) {
                            if (!merged.includes(u)) {
                                merged.push(u);
                            }
                        }
                        importedData.images = merged;
                    }

                    if (transferRes.failures.length > 0) {
                        toast.warning(`${transferRes.failures.length} image(s) n'ont pas pu être transférées.`);
                    }
                }
            } catch (err: any) {
                toast.error("Erreur réseau lors du transfert des images.");
                setIsTransferringImages(false);
                return;
            } finally {
                setIsTransferringImages(false);
            }
        }

        // Apply changes to form state
        onApplyImport(importedData);
        toast.success("✅ Données Django injectées dans le formulaire ! Pensez à vérifier et enregistrer.");
        onClose();
    };

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
            {/* Standard Backdrop Overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => {
                    if (!isTransferringImages) onClose();
                }}
                className="absolute inset-0 bg-slate-950/65 backdrop-blur-md"
                aria-hidden="true"
            />

            {/* Modal Dialog Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
                            <CloudDownload size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-[15px] flex items-center gap-2">
                                Importer depuis Django
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono border border-emerald-500/30">
                                    API Active
                                </span>
                            </h3>
                            <p className="text-[11px] text-slate-400">
                                Synchronisez le nom, la description courte, les caractéristiques et les images sans écraser vos prix ni stocks.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isTransferringImages}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Search Bar */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                            <span>Rechercher un produit dans Django (Référence ou Nom)</span>
                            {isSearching && (
                                <span className="text-orange-500 flex items-center gap-1 text-[11px] lowercase">
                                    <Loader2 size={12} className="animate-spin" /> recherche en cours...
                                </span>
                            )}
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="Ex: DE195V67A, DELL, Chargeur..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Search Error / Message */}
                    {searchError && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[12px] flex items-center gap-2">
                            <AlertCircle size={16} className="text-amber-600 shrink-0" />
                            <span>{searchError}</span>
                        </div>
                    )}

                    {/* Results dropdown/list if multiple products found */}
                    {searchResults.length > 1 && (
                        <div className="space-y-2">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                {searchResults.length} produits trouvés — Sélectionnez celui à importer :
                            </span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                                {searchResults.map((prod) => (
                                    <button
                                        key={prod.id}
                                        type="button"
                                        onClick={() => handleSelectProduct(prod)}
                                        className={cn(
                                            "p-2.5 rounded-xl border text-left flex items-center gap-3 transition-all",
                                            selectedProduct?.id === prod.id
                                                ? "bg-orange-50/60 border-orange-500 ring-2 ring-orange-500/20"
                                                : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                        )}
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 relative">
                                            <ImageIcon size={16} className="text-slate-400 pointer-events-none" />
                                            {prod.images[0] && (
                                                <img
                                                    src={prod.images[0].proxyUrl || prod.images[0].resolvedUrl}
                                                    alt=""
                                                    referrerPolicy="no-referrer"
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        if (prod.images[0]?.resolvedUrl && e.currentTarget.src !== prod.images[0].resolvedUrl) {
                                                            e.currentTarget.src = prod.images[0].resolvedUrl;
                                                        } else {
                                                            e.currentTarget.style.display = 'none';
                                                        }
                                                    }}
                                                    className="absolute inset-0 w-full h-full object-contain p-0.5 bg-white"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-mono font-bold text-[11px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                                                    {prod.reference}
                                                </span>
                                                <span className="text-[10px] text-slate-400">({prod.imageCount} imgs)</span>
                                            </div>
                                            <p className="text-[12px] font-semibold text-slate-800 truncate mt-0.5">
                                                {prod.name}
                                            </p>
                                        </div>
                                        {selectedProduct?.id === prod.id && (
                                            <Check size={16} className="text-orange-600 shrink-0" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Selected Product Mapping View */}
                    {selectedProduct && (
                        <div className="space-y-4 pt-2 border-t border-slate-200">
                            {/* Product summary banner */}
                            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 relative">
                                        <ImageIcon size={20} className="text-slate-400 pointer-events-none" />
                                        {selectedProduct.images[0] && (
                                            <img
                                                src={selectedProduct.images[0].proxyUrl || selectedProduct.images[0].resolvedUrl}
                                                alt=""
                                                referrerPolicy="no-referrer"
                                                loading="lazy"
                                                onError={(e) => {
                                                    if (selectedProduct.images[0]?.resolvedUrl && e.currentTarget.src !== selectedProduct.images[0].resolvedUrl) {
                                                        e.currentTarget.src = selectedProduct.images[0].resolvedUrl;
                                                    } else {
                                                        e.currentTarget.style.display = 'none';
                                                    }
                                                }}
                                                className="absolute inset-0 w-full h-full object-contain p-0.5 bg-white"
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-black text-[12px] text-orange-600 bg-orange-100/60 px-2 py-0.5 rounded">
                                                {selectedProduct.reference}
                                            </span>
                                            <span className="text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                                Active === true
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-[13px] text-slate-900 mt-0.5 line-clamp-1">
                                            {selectedProduct.name}
                                        </h4>
                                    </div>
                                </div>
                                <span className="text-[11px] font-mono text-slate-400">
                                    ID Django: {selectedProduct.id}
                                </span>
                            </div>

                            {/* Fields to import checklist & preview */}
                            <div className="space-y-3">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    Champs à importer dans la fiche :
                                </span>

                                {/* 1. Nom */}
                                <div className={cn(
                                    "p-3.5 rounded-xl border transition-all",
                                    importName ? "bg-white border-orange-300 shadow-sm" : "bg-slate-50/50 border-slate-200 opacity-60"
                                )}>
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2.5 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={importName}
                                                onChange={(e) => setImportName(e.target.checked)}
                                                className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300"
                                            />
                                            <span className="font-bold text-[12px] text-slate-800 flex items-center gap-1.5">
                                                <FileText size={14} className="text-orange-500" />
                                                Nom du produit
                                            </span>
                                        </label>
                                        <span className="text-[10px] font-semibold text-slate-400 uppercase">
                                            Champ obligatoire
                                        </span>
                                    </div>
                                    <div className="mt-2 text-[12px] font-medium text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                        {selectedProduct.name}
                                    </div>
                                    {currentFormValues.name && currentFormValues.name !== selectedProduct.name && (
                                        <div className="mt-1 text-[10px] text-slate-400 italic">
                                            Valeur actuelle : "{currentFormValues.name}"
                                        </div>
                                    )}
                                </div>

                                {/* 2. Description courte (libelle) */}
                                <div className={cn(
                                    "p-3.5 rounded-xl border transition-all",
                                    importShortDesc ? "bg-white border-orange-300 shadow-sm" : "bg-slate-50/50 border-slate-200 opacity-60"
                                )}>
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2.5 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={importShortDesc}
                                                disabled={!selectedProduct.hasLibelle}
                                                onChange={(e) => setImportShortDesc(e.target.checked)}
                                                className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300 disabled:opacity-40"
                                            />
                                            <span className="font-bold text-[12px] text-slate-800 flex items-center gap-1.5">
                                                <AlignLeft size={14} className="text-orange-500" />
                                                Description courte (Libellé source)
                                            </span>
                                        </label>
                                        {!selectedProduct.hasLibelle ? (
                                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                                Absent dans Django (préservation Baraka)
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                                Prêt à importer
                                            </span>
                                        )}
                                    </div>
                                    {selectedProduct.hasLibelle ? (
                                        <div className="mt-2 text-[12px] font-medium text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                            {selectedProduct.shortDescription}
                                        </div>
                                    ) : (
                                        <div className="mt-1 text-[11px] text-slate-400 italic">
                                            Aucun libellé dans Django. La description courte existante sera conservée intacte.
                                        </div>
                                    )}
                                </div>

                                {/* 3. Caractéristiques principales (description sans puces) */}
                                <div className={cn(
                                    "p-3.5 rounded-xl border transition-all",
                                    importFeatures ? "bg-white border-orange-300 shadow-sm" : "bg-slate-50/50 border-slate-200 opacity-60"
                                )}>
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2.5 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={importFeatures}
                                                onChange={(e) => setImportFeatures(e.target.checked)}
                                                className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300"
                                            />
                                            <span className="font-bold text-[12px] text-slate-800 flex items-center gap-1.5">
                                                <Sparkles size={14} className="text-orange-500" />
                                                Caractéristiques principales ({selectedProduct.features.length} lignes nettoyées de puces)
                                            </span>
                                        </label>
                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                            Puces supprimées
                                        </span>
                                    </div>
                                    <div className="mt-2 max-h-32 overflow-y-auto text-[11px] font-mono text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100 whitespace-pre-line">
                                        {selectedProduct.featuresText || "(Aucune caractéristique)"}
                                    </div>
                                </div>

                                {/* 4. Images */}
                                <div className={cn(
                                    "p-3.5 rounded-xl border transition-all",
                                    importImages ? "bg-white border-orange-300 shadow-sm" : "bg-slate-50/50 border-slate-200 opacity-60"
                                )}>
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2.5 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={importImages}
                                                disabled={selectedProduct.images.length === 0}
                                                onChange={(e) => setImportImages(e.target.checked)}
                                                className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300"
                                            />
                                            <span className="font-bold text-[12px] text-slate-800 flex items-center gap-1.5">
                                                <ImageIcon size={14} className="text-orange-500" />
                                                Galerie d'images ({selectedProduct.images.length} images ordonnées)
                                            </span>
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={imageMode}
                                                onChange={(e) => setImageMode(e.target.value as 'append' | 'replace')}
                                                disabled={!importImages}
                                                className="text-[11px] font-bold bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                                            >
                                                <option value="append">Ajouter à la suite des images Baraka</option>
                                                <option value="replace">Remplacer toute la galerie Baraka</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Images preview strip */}
                                    {selectedProduct.images.length > 0 && (
                                        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
                                            {selectedProduct.images.map((img, idx) => (
                                                <div
                                                    key={img.id || idx}
                                                    className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative group flex items-center justify-center"
                                                    title={`Position ${idx + 1}`}
                                                >
                                                    <ImageIcon size={18} className="text-slate-300 pointer-events-none" />
                                                    <img
                                                        src={img.proxyUrl || img.resolvedUrl}
                                                        alt=""
                                                        referrerPolicy="no-referrer"
                                                        loading="lazy"
                                                        onError={(e) => {
                                                            if (img.resolvedUrl && e.currentTarget.src !== img.resolvedUrl) {
                                                                e.currentTarget.src = img.resolvedUrl;
                                                            } else {
                                                                e.currentTarget.style.display = 'none';
                                                            }
                                                        }}
                                                        className="absolute inset-0 w-full h-full object-contain p-1 bg-white"
                                                    />
                                                    <span className="absolute bottom-1 right-1 bg-slate-900/80 text-white font-mono text-[9px] font-bold px-1 rounded z-10">
                                                        #{idx + 1}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {currentFormValues.images.length > 0 && imageMode === 'replace' && (
                                        <p className="mt-2 text-[10px] font-medium text-amber-600 bg-amber-50 p-1.5 rounded border border-amber-200">
                                            ⚠️ Attention : le mode "Remplacer" remplacera les {currentFormValues.images.length} image(s) actuellement présentes dans Baraka.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500 font-medium">
                        {isTransferringImages ? (
                            <span className="flex items-center gap-2 text-orange-600 font-semibold animate-pulse">
                                <Loader2 size={14} className="animate-spin" />
                                {transferStatus}
                            </span>
                        ) : (
                            <span>💡 L'injection met à jour votre formulaire sans sauvegarder automatiquement.</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isTransferringImages}
                            className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-[12px] rounded-xl transition-all disabled:opacity-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmImport}
                            disabled={!selectedProduct || isTransferringImages}
                            className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-[12px] rounded-xl shadow-lg shadow-orange-600/20 flex items-center gap-2 transition-all disabled:opacity-50 active:scale-95"
                        >
                            {isTransferringImages ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    <span>Transfert en cours...</span>
                                </>
                            ) : (
                                <>
                                    <CloudDownload size={15} />
                                    <span>Injecter dans la fiche</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>,
        document.body
    );
}
