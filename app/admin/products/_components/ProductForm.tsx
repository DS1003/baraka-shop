'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    X,
    Save,
    Loader2,
    Upload,
    ImagePlus,
    Plus,
    Palette,
    ChevronRight,
    Search,
    Check,
    ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { RichTextEditor } from '@/ui/RichTextEditor';
import {
    upsertProduct,
    getAdminCategories,
    getAdminBrands as getBrands,
    getAdminStores,
    getSubCategories,
    getThirdLevelCategories
} from '@/lib/actions/admin-actions';
import { toast } from 'sonner';

const COLOR_PALETTE = [
    { name: 'Noir', hex: '#000000' },
    { name: 'Blanc', hex: '#FFFFFF' },
    { name: 'Gris Clair', hex: '#D3D3D3' },
    { name: 'Gris', hex: '#808080' },
    { name: 'Gris Foncé', hex: '#404040' },
    { name: 'Argent', hex: '#C0C0C0' },
    { name: 'Rouge', hex: '#FF0000' },
    { name: 'Rouge Foncé', hex: '#8B0000' },
    { name: 'Rouge Bordeaux', hex: '#800020' },
    { name: 'Rouge Cerise', hex: '#DE3163' },
    { name: 'Rouge Corail', hex: '#FF7F50' },
    { name: 'Rouge Tomate', hex: '#FF6347' },
    { name: 'Cramoisi', hex: '#DC143C' },
    { name: 'Rose', hex: '#FFC0CB' },
    { name: 'Rose Vif', hex: '#FF69B4' },
    { name: 'Rose Fuchsia', hex: '#FF00FF' },
    { name: 'Rose Poudré', hex: '#E8C4C4' },
    { name: 'Rose Saumon', hex: '#FA8072' },
    { name: 'Magenta', hex: '#FF0090' },
    { name: 'Orange', hex: '#FF8C00' },
    { name: 'Orange Clair', hex: '#FFB347' },
    { name: 'Orange Foncé', hex: '#CC5500' },
    { name: 'Pêche', hex: '#FFCBA4' },
    { name: 'Abricot', hex: '#FBCEB1' },
    { name: 'Mandarine', hex: '#FF8243' },
    { name: 'Jaune', hex: '#FFD700' },
    { name: 'Jaune Clair', hex: '#FFFF99' },
    { name: 'Jaune Pâle', hex: '#FFFACD' },
    { name: 'Jaune Moutarde', hex: '#E1AD01' },
    { name: 'Or', hex: '#DAA520' },
    { name: 'Doré', hex: '#CFB53B' },
    { name: 'Ambre', hex: '#FFBF00' },
    { name: 'Vert', hex: '#008000' },
    { name: 'Vert Clair', hex: '#90EE90' },
    { name: 'Vert Foncé', hex: '#006400' },
    { name: 'Vert Olive', hex: '#808000' },
    { name: 'Vert Menthe', hex: '#98FF98' },
    { name: 'Vert Émeraude', hex: '#50C878' },
    { name: 'Vert Sapin', hex: '#01796F' },
    { name: 'Vert Kaki', hex: '#6B8E23' },
    { name: 'Vert Citron', hex: '#32CD32' },
    { name: 'Vert Forêt', hex: '#228B22' },
    { name: 'Turquoise', hex: '#40E0D0' },
    { name: 'Cyan', hex: '#00FFFF' },
    { name: 'Sarcelle', hex: '#008080' },
    { name: 'Bleu', hex: '#0000FF' },
    { name: 'Bleu Clair', hex: '#87CEEB' },
    { name: 'Bleu Ciel', hex: '#87CEFA' },
    { name: 'Bleu Marine', hex: '#000080' },
    { name: 'Bleu Royal', hex: '#4169E1' },
    { name: 'Bleu Cobalt', hex: '#0047AB' },
    { name: 'Bleu Nuit', hex: '#191970' },
    { name: 'Bleu Pétrole', hex: '#1D4E89' },
    { name: 'Bleu Canard', hex: '#048B9A' },
    { name: 'Bleu Pastel', hex: '#AEC6CF' },
    { name: 'Bleu Acier', hex: '#4682B4' },
    { name: 'Bleu Électrique', hex: '#007FFF' },
    { name: 'Indigo', hex: '#4B0082' },
    { name: 'Violet', hex: '#8B00FF' },
    { name: 'Violet Foncé', hex: '#4A0080' },
    { name: 'Mauve', hex: '#E0B0FF' },
    { name: 'Lavande', hex: '#E6E6FA' },
    { name: 'Lilas', hex: '#C8A2C8' },
    { name: 'Prune', hex: '#8E4585' },
    { name: 'Aubergine', hex: '#3D0C24' },
    { name: 'Pourpre', hex: '#800080' },
    { name: 'Marron', hex: '#8B4513' },
    { name: 'Marron Clair', hex: '#CD853F' },
    { name: 'Marron Foncé', hex: '#3E1F00' },
    { name: 'Chocolat', hex: '#7B3F00' },
    { name: 'Café', hex: '#6F4E37' },
    { name: 'Caramel', hex: '#FFD59A' },
    { name: 'Beige', hex: '#F5F5DC' },
    { name: 'Crème', hex: '#FFFDD0' },
    { name: 'Ivoire', hex: '#FFFFF0' },
    { name: 'Sable', hex: '#C2B280' },
    { name: 'Taupe', hex: '#483C32' },
    { name: 'Bordeaux', hex: '#6D071A' },
    { name: 'Bronze', hex: '#CD7F32' },
    { name: 'Cuivre', hex: '#B87333' },
    { name: 'Champagne', hex: '#F7E7CE' },
    { name: 'Corail', hex: '#FF7F50' },
    { name: 'Terre Cuite', hex: '#CC4E3C' },
    { name: 'Rouille', hex: '#B7410E' },
];

export default function ProductForm({ editingProduct }: { editingProduct?: any }) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [formImages, setFormImages] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Categories
    const [categories, setCategories] = useState<any[]>([]);
    const [subCategories, setSubCategories] = useState<any[]>([]);
    const [thirdCategories, setThirdCategories] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [stores, setStores] = useState<any[]>([]);

    const [categoryId, setCategoryId] = useState(editingProduct?.categoryId || editingProduct?.category?.id || '');
    const [subCategoryId, setSubCategoryId] = useState(editingProduct?.subCategoryId || editingProduct?.subCategory?.id || '');
    const [thirdLevelCategoryId, setThirdLevelCategoryId] = useState(editingProduct?.thirdLevelCategoryId || editingProduct?.thirdLevelCategory?.id || '');
    const [brandId, setBrandId] = useState(editingProduct?.brandId || editingProduct?.brand?.id || '');
    const [storeId, setStoreId] = useState(editingProduct?.storeId || editingProduct?.store?.id || '');

    // Color Variants
    type ColorVariant = { id?: string; colorName: string; colorHex: string; images: string[] };
    const [colorVariants, setColorVariants] = useState<ColorVariant[]>([]);
    const [activeColorIdx, setActiveColorIdx] = useState<number | null>(null);
    const [isUploadingColor, setIsUploadingColor] = useState(false);
    const [isDraggingColor, setIsDraggingColor] = useState(false);
    const colorFileInputRef = React.useRef<HTMLInputElement>(null);
    const [colorSearch, setColorSearch] = useState('');
    const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
    const colorDropdownRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadMetadata = async () => {
            const [cats, brs, sts] = await Promise.all([
                getAdminCategories(),
                getBrands(),
                getAdminStores()
            ]);
            setCategories(cats);
            setBrands(brs);
            setStores(sts);
        };
        loadMetadata();
    }, []);

    useEffect(() => {
        if (editingProduct) {
            const cId = editingProduct.categoryId || editingProduct.category?.id;
            if (cId) {
                setCategoryId(cId);
                getSubCategories(cId).then(setSubCategories);
            }
            const sId = editingProduct.subCategoryId || editingProduct.subCategory?.id;
            if (sId) {
                setSubCategoryId(sId);
                getThirdLevelCategories(sId).then(setThirdCategories);
            }
            const tId = editingProduct.thirdLevelCategoryId || editingProduct.thirdLevelCategory?.id;
            if (tId) {
                setThirdLevelCategoryId(tId);
            }
            const bId = editingProduct.brandId || editingProduct.brand?.id;
            if (bId) {
                setBrandId(bId);
            }
            const stId = editingProduct.storeId || editingProduct.store?.id;
            if (stId) {
                setStoreId(stId);
            }
            setFormImages(editingProduct.images || []);
            setColorVariants(
                (editingProduct.colorVariants || []).map((cv: any) => ({
                    id: cv.id,
                    colorName: cv.colorName,
                    colorHex: cv.colorHex,
                    images: cv.images || [],
                }))
            );
        }
    }, [editingProduct]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (colorDropdownRef.current && !colorDropdownRef.current.contains(e.target as Node)) {
                setColorDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleUpsert = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name') as string,
            slug: (formData.get('name') as string).toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
            description: formData.get('description') as string,
            price: parseFloat(formData.get('price') as string),
            stock: parseInt(formData.get('stock') as string),
            categoryId: formData.get('categoryId') as string,
            subCategoryId: formData.get('subCategoryId') as string || null,
            thirdLevelCategoryId: formData.get('thirdLevelCategoryId') as string || null,
            brandId: formData.get('brandId') as string || null,
            storeId: formData.get('storeId') as string || null,
            images: formImages,
            colorVariants: colorVariants.filter(cv => cv.colorName.trim() !== ''),
            shortDescription: formData.get('shortDescription') as string || null,
            features: (formData.get('features') as string || "").split('\n').filter(f => f.trim() !== ""),
            metadata: (() => {
                const raw = formData.get('metadata') as string;
                if (!raw || raw.trim() === '') return {};
                try {
                    const parsed = JSON.parse(raw);
                    if (typeof parsed === 'object' && parsed !== null) return parsed;
                } catch { }

                const metadataObj: any = {};
                raw.split('\n').forEach(line => {
                    const colonMatch = line.match(/^([^:]+):\s*(.+)$/);
                    if (colonMatch) {
                        metadataObj[colonMatch[1].trim()] = colonMatch[2].trim();
                        return;
                    }

                    if (line.includes('\t')) {
                        const parts = line.split('\t');
                        metadataObj[parts[0].trim()] = parts.slice(1).join(' ').trim();
                        return;
                    }

                    if (line.trim() !== "") {
                        metadataObj[line.trim()] = "Oui";
                    }
                });
                return metadataObj;
            })()
        };

        const res = await upsertProduct(data, editingProduct?.id);
        if (res.success) {
            toast.success(editingProduct ? '✅ Produit mis à jour !' : '✅ Produit créé !');
            router.push('/admin/products');
            router.refresh();
        } else {
            toast.error("Erreur lors de la sauvegarde.");
        }
        setIsSaving(false);
    };

    return (
        <form onSubmit={handleUpsert} className="bg-white rounded-[32px] shadow-sm border border-slate-200/50 flex flex-col max-w-5xl mx-auto overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-orange-600 transition-colors shadow-sm"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h3 className="text-[20px] font-bold text-slate-900">{editingProduct ? 'Modifier' : 'Ajouter un'} Produit</h3>
                        <p className="text-[12px] text-slate-400 font-medium">Configurez les détails techniques du produit.</p>
                    </div>
                </div>
            </div>

            <div className="p-8 space-y-10">
                <section className="space-y-6">
                    <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <div className="w-4 h-[2px] bg-orange-500 rounded-full" />
                        Informations de Base
                    </h4>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2 col-span-2">
                            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Nom du Produit</label>
                            <input
                                name="name"
                                defaultValue={editingProduct?.name}
                                required
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all font-medium"
                                placeholder="Ex: Abaya Silk Premium"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Prix (F CFA)</label>
                            <input
                                name="price"
                                type="number"
                                defaultValue={editingProduct?.price}
                                required
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Stock Initial</label>
                            <input
                                name="stock"
                                type="number"
                                defaultValue={editingProduct?.stock}
                                required
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all font-medium"
                            />
                        </div>
                    </div>
                </section>

                <section className="space-y-6">
                    <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <div className="w-4 h-[2px] bg-orange-500 rounded-full" />
                        Catégorisation & Marque
                    </h4>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Catégorie (L1)</label>
                            <select
                                key={`cat-${categories.length}`}
                                name="categoryId"
                                value={categoryId}
                                required
                                onChange={(e) => {
                                    const catId = e.target.value;
                                    setCategoryId(catId);
                                    setSubCategoryId('');
                                    setThirdLevelCategoryId('');
                                    getSubCategories(catId).then(setSubCategories);
                                    setThirdCategories([]);
                                }}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all font-medium appearance-none"
                            >
                                <option value="">Sélectionner</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Sous-catégorie (L2)</label>
                            <select
                                key={`subcat-${subCategories.length}`}
                                name="subCategoryId"
                                value={subCategoryId}
                                onChange={(e) => {
                                    const subId = e.target.value;
                                    setSubCategoryId(subId);
                                    setThirdLevelCategoryId('');
                                    if (subId) getThirdLevelCategories(subId).then(setThirdCategories);
                                    else setThirdCategories([]);
                                }}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all font-medium appearance-none"
                            >
                                <option value="">Aucune</option>
                                {subCategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Sous-sous (L3)</label>
                            <select
                                key={`thirdcat-${thirdCategories.length}`}
                                name="thirdLevelCategoryId"
                                value={thirdLevelCategoryId}
                                onChange={(e) => setThirdLevelCategoryId(e.target.value)}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all font-medium appearance-none"
                            >
                                <option value="">Aucune</option>
                                {thirdCategories.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Marque</label>
                            <select
                                key={`brand-${brands.length}`}
                                name="brandId"
                                value={brandId}
                                onChange={(e) => setBrandId(e.target.value)}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all font-medium appearance-none"
                            >
                                <option value="">Aucune</option>
                                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Boutique (Vendor)</label>
                            <select
                                key={`store-${stores.length}`}
                                name="storeId"
                                value={storeId}
                                onChange={(e) => setStoreId(e.target.value)}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all font-medium appearance-none"
                            >
                                <option value="">Aucune (Baraka General)</option>
                                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>
                </section>

                <section className="space-y-6">
                    <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <div className="w-4 h-[2px] bg-orange-500 rounded-full" />
                        Photo de mise en avant du produit
                    </h4>

                    <div className="space-y-4">
                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                            onDrop={async (e) => {
                                e.preventDefault();
                                setIsDragging(false);
                                const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                                if (files.length === 0) return;
                                setIsUploading(true);
                                try {
                                    const fd = new FormData();
                                    files.forEach(f => fd.append('files', f));
                                    const res = await fetch('/api/upload', { method: 'POST', body: fd });
                                    const data = await res.json();
                                    if (data.urls) setFormImages(prev => [...prev, ...data.urls]);
                                    else toast.error(data.error || 'Erreur upload');
                                } catch { toast.error('Erreur lors de l\'upload.'); }
                                finally { setIsUploading(false); }
                            }}
                            onClick={() => fileInputRef.current?.click()}
                            className={cn(
                                "relative py-10 border-2 border-dashed rounded-[24px] flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300",
                                isDragging
                                    ? "border-orange-500 bg-orange-50/80 scale-[1.02] shadow-lg shadow-orange-100"
                                    : "border-slate-200 bg-slate-50/50 hover:border-orange-300 hover:bg-orange-50/30",
                                isUploading && "pointer-events-none opacity-60"
                            )}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                className="hidden"
                                onChange={async (e) => {
                                    const files = Array.from(e.target.files || []);
                                    if (files.length === 0) return;
                                    setIsUploading(true);
                                    try {
                                        const fd = new FormData();
                                        files.forEach(f => fd.append('files', f));
                                        const res = await fetch('/api/upload', { method: 'POST', body: fd });
                                        const data = await res.json();
                                        if (data.urls) setFormImages(prev => [...prev, ...data.urls]);
                                        else toast.error(data.error || 'Erreur upload');
                                    } catch { toast.error('Erreur lors de l\'upload.'); }
                                    finally { setIsUploading(false); e.target.value = ''; }
                                }}
                            />
                            {isUploading ? (
                                <>
                                    <Loader2 size={32} className="animate-spin text-orange-500" />
                                    <p className="text-[13px] font-bold text-orange-600">Upload en cours...</p>
                                </>
                            ) : (
                                <>
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                                        isDragging ? "bg-orange-500 text-white" : "bg-white border border-slate-200 text-slate-400"
                                    )}>
                                        <Upload size={24} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[13px] font-bold text-slate-600">
                                            {isDragging ? 'Déposez vos images ici' : 'Glissez-déposez vos images ici'}
                                        </p>
                                        <p className="text-[11px] text-slate-400 font-medium mt-1">
                                            ou <span className="text-orange-500 font-bold">cliquez pour parcourir</span> — JPG, PNG, WebP • Max 5 MB
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        {formImages.length > 0 && (
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 bg-slate-50 p-6 rounded-[24px] border border-slate-200/50">
                                {formImages.map((img, i) => (
                                    <div key={i} className="relative aspect-square group">
                                        <div className="w-full h-full rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormImages(prev => prev.filter((_, idx) => idx !== i))}
                                            className="absolute -top-2 -right-2 w-7 h-7 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
                                        >
                                            <X size={14} strokeWidth={3} />
                                        </button>
                                        {i === 0 && (
                                            <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-orange-600 text-white text-[8px] font-black uppercase rounded-md tracking-wider shadow-sm">
                                                Principal
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <section className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <div className="w-4 h-[2px] bg-orange-500 rounded-full" />
                            Variantes de Couleur
                        </h4>
                        <button
                            type="button"
                            onClick={() => {
                                setColorVariants(prev => [...prev, { colorName: '', colorHex: '#000000', images: [] }]);
                                setActiveColorIdx(colorVariants.length);
                            }}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-xl text-[12px] font-bold hover:bg-orange-100 transition-all border border-orange-200/50"
                        >
                            <Plus size={14} />
                            Ajouter une couleur
                        </button>
                    </div>

                    {colorVariants.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 bg-slate-50/50 rounded-[20px] border border-dashed border-slate-200">
                            <Palette size={28} className="mx-auto mb-2 text-slate-300" />
                            <p className="text-[13px] font-bold">Aucune variante de couleur</p>
                            <p className="text-[11px] text-slate-400 mt-1">Les photos principales seront utilisées pour toutes les couleurs.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {colorVariants.map((cv, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setActiveColorIdx(activeColorIdx === idx ? null : idx)}
                                        className={cn(
                                            "flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all border",
                                            activeColorIdx === idx
                                                ? "bg-white border-orange-300 text-orange-700 shadow-md shadow-orange-100"
                                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300"
                                        )}
                                    >
                                        <div
                                            className="w-5 h-5 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                                            style={{ backgroundColor: cv.colorHex || '#ccc' }}
                                        />
                                        <span className="max-w-[100px] truncate">{cv.colorName || 'Sans nom'}</span>
                                        <span className="text-[10px] text-slate-400 font-medium">{cv.images.length} img</span>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setColorVariants(prev => prev.filter((_, i) => i !== idx));
                                                if (activeColorIdx === idx) setActiveColorIdx(null);
                                                else if (activeColorIdx !== null && activeColorIdx > idx) setActiveColorIdx(activeColorIdx - 1);
                                            }}
                                            className="w-5 h-5 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center hover:bg-rose-200 transition-colors ml-1"
                                        >
                                            <X size={10} strokeWidth={3} />
                                        </button>
                                    </button>
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                {activeColorIdx !== null && colorVariants[activeColorIdx] && (
                                    <motion.div
                                        key={activeColorIdx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="bg-slate-50/80 rounded-[20px] border border-slate-200/50 p-6 space-y-5"
                                    >
                                        <div className="space-y-2 relative">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Choisir une couleur</label>
                                            <div className="relative" ref={colorDropdownRef}>
                                                <button
                                                    type="button"
                                                    onClick={() => { setColorDropdownOpen(!colorDropdownOpen); setColorSearch(''); }}
                                                    className={cn(
                                                        "w-full flex items-center gap-3 px-4 py-3 bg-white border rounded-xl text-left transition-all",
                                                        colorDropdownOpen ? "border-orange-400 ring-4 ring-orange-500/10" : "border-slate-200 hover:border-slate-300"
                                                    )}
                                                >
                                                    <div
                                                        className="w-7 h-7 rounded-lg border-2 border-white shadow-sm flex-shrink-0"
                                                        style={{ backgroundColor: colorVariants[activeColorIdx].colorHex || '#ccc' }}
                                                    />
                                                    <span className="flex-1 text-[13px] font-semibold text-slate-700 truncate">
                                                        {colorVariants[activeColorIdx].colorName || 'Sélectionner une couleur...'}
                                                    </span>
                                                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                                                        {colorVariants[activeColorIdx].colorHex}
                                                    </span>
                                                    <ChevronRight size={14} className={cn("text-slate-400 transition-transform", colorDropdownOpen && "rotate-90")} />
                                                </button>

                                                <AnimatePresence>
                                                    {colorDropdownOpen && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -8, scale: 0.98 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                                            transition={{ duration: 0.15 }}
                                                            className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-200/60 overflow-hidden"
                                                        >
                                                            <div className="p-3 border-b border-slate-100">
                                                                <div className="relative">
                                                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                                    <input
                                                                        type="text"
                                                                        autoFocus
                                                                        placeholder="Rechercher une couleur..."
                                                                        value={colorSearch}
                                                                        onChange={(e) => setColorSearch(e.target.value)}
                                                                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[12px] font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-300 transition-all"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="max-h-[280px] overflow-y-auto py-2 scrollbar-thin">
                                                                {COLOR_PALETTE
                                                                    .filter(c => c.name.toLowerCase().includes(colorSearch.toLowerCase()))
                                                                    .map((color) => {
                                                                        const isSelected = colorVariants[activeColorIdx].colorHex.toUpperCase() === color.hex.toUpperCase();
                                                                        return (
                                                                            <button
                                                                                key={color.hex}
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setColorVariants(prev => prev.map((cv, i) => i === activeColorIdx ? { ...cv, colorName: color.name, colorHex: color.hex } : cv));
                                                                                    setColorDropdownOpen(false);
                                                                                    setColorSearch('');
                                                                                }}
                                                                                className={cn(
                                                                                    "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all",
                                                                                    isSelected ? "bg-orange-50 text-orange-700" : "hover:bg-slate-50 text-slate-700"
                                                                                )}
                                                                            >
                                                                                <div
                                                                                    className={cn("w-6 h-6 rounded-lg flex-shrink-0 shadow-sm", color.hex === '#FFFFFF' && "border border-slate-200")}
                                                                                    style={{ backgroundColor: color.hex }}
                                                                                />
                                                                                <span className="flex-1 text-[12px] font-semibold">{color.name}</span>
                                                                                <span className="text-[10px] font-mono text-slate-400">{color.hex}</span>
                                                                                {isSelected && <Check size={14} className="text-orange-500" />}
                                                                            </button>
                                                                        );
                                                                    })
                                                                }
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">
                                                Photos pour cette couleur
                                            </label>
                                            <div
                                                onDragOver={(e) => { e.preventDefault(); setIsDraggingColor(true); }}
                                                onDragLeave={(e) => { e.preventDefault(); setIsDraggingColor(false); }}
                                                onDrop={async (e) => {
                                                    e.preventDefault();
                                                    setIsDraggingColor(false);
                                                    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                                                    if (files.length === 0) return;
                                                    setIsUploadingColor(true);
                                                    try {
                                                        const fd = new FormData();
                                                        files.forEach(f => fd.append('files', f));
                                                        const res = await fetch('/api/upload', { method: 'POST', body: fd });
                                                        const data = await res.json();
                                                        if (data.urls) {
                                                            const currentIdx = activeColorIdx;
                                                            setColorVariants(prev => prev.map((cv, i) => i === currentIdx ? { ...cv, images: [...cv.images, ...data.urls] } : cv));
                                                        } else {
                                                            toast.error(data.error || 'Erreur upload');
                                                        }
                                                    } catch { toast.error("Erreur lors de l'upload."); }
                                                    finally { setIsUploadingColor(false); }
                                                }}
                                                onClick={() => colorFileInputRef.current?.click()}
                                                className={cn(
                                                    "relative py-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300",
                                                    isDraggingColor
                                                        ? "border-orange-500 bg-orange-50/80 scale-[1.01]"
                                                        : "border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/20",
                                                    isUploadingColor && "pointer-events-none opacity-60"
                                                )}
                                            >
                                                <input
                                                    ref={colorFileInputRef}
                                                    type="file"
                                                    multiple
                                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                                    className="hidden"
                                                    onChange={async (e) => {
                                                        const files = Array.from(e.target.files || []);
                                                        if (files.length === 0) return;
                                                        setIsUploadingColor(true);
                                                        try {
                                                            const fd = new FormData();
                                                            files.forEach(f => fd.append('files', f));
                                                            const res = await fetch('/api/upload', { method: 'POST', body: fd });
                                                            const data = await res.json();
                                                            if (data.urls) {
                                                                const currentIdx = activeColorIdx;
                                                                setColorVariants(prev => prev.map((cv, i) => i === currentIdx ? { ...cv, images: [...cv.images, ...data.urls] } : cv));
                                                            } else {
                                                                toast.error(data.error || 'Erreur upload');
                                                            }
                                                        } catch { toast.error("Erreur lors de l'upload."); }
                                                        finally { setIsUploadingColor(false); e.target.value = ''; }
                                                    }}
                                                />
                                                {isUploadingColor ? (
                                                    <>
                                                        <Loader2 size={24} className="animate-spin text-orange-500" />
                                                        <p className="text-[12px] font-bold text-orange-600">Upload en cours...</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ImagePlus size={20} className={isDraggingColor ? "text-orange-500" : "text-slate-400"} />
                                                        <p className="text-[12px] font-medium text-slate-500">
                                                            Glissez ou <span className="text-orange-500 font-bold">cliquez</span> pour ajouter des photos
                                                        </p>
                                                    </>
                                                )}
                                            </div>

                                            {colorVariants[activeColorIdx].images.length > 0 && (
                                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
                                                    {colorVariants[activeColorIdx].images.map((img, imgIdx) => (
                                                        <div key={imgIdx} className="relative aspect-square group">
                                                            <div className="w-full h-full rounded-lg border border-slate-200 overflow-hidden bg-white shadow-sm">
                                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const currentIdx = activeColorIdx;
                                                                    setColorVariants(prev => prev.map((cv, i) =>
                                                                        i === currentIdx ? { ...cv, images: cv.images.filter((_, idx) => idx !== imgIdx) } : cv
                                                                    ));
                                                                }}
                                                                className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
                                                            >
                                                                <X size={12} strokeWidth={3} />
                                                            </button>
                                                            {imgIdx === 0 && (
                                                                <span className="absolute bottom-0.5 left-0.5 px-1.5 py-0.5 bg-orange-600 text-white text-[7px] font-black uppercase rounded tracking-wider shadow-sm">
                                                                    1ère
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </section>

                <section className="space-y-6">
                    <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <div className="w-4 h-[2px] bg-orange-500 rounded-full" />
                        Contenu Détaillé
                    </h4>
                    
                    <div className="space-y-2">
                        <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Description Courte</label>
                        <textarea
                            name="shortDescription"
                            defaultValue={editingProduct?.shortDescription}
                            rows={2}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all font-medium leading-relaxed"
                            placeholder="Résumé accrocheur pour le haut de page..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Description Détaillée</label>
                        <RichTextEditor
                            name="description"
                            defaultValue={editingProduct?.description}
                            placeholder="Décrivez les caractéristiques, matières, coupes..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Caractéristiques (1 par ligne)</label>
                            <textarea
                                name="features"
                                defaultValue={Array.isArray(editingProduct?.features) ? editingProduct.features.join('\n') : ""}
                                rows={6}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all font-medium leading-relaxed font-mono text-[13px]"
                                placeholder="Ex: Coton 100%&#10;Lavage 30°C&#10;Coupe ajustée"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Fiche Technique (1 par ligne)</label>
                            <textarea
                                name="metadata"
                                defaultValue={editingProduct?.metadata 
                                    ? Object.entries(editingProduct.metadata)
                                        .filter(([k]) => k !== 'importedAt')
                                        .map(([k, v]) => `${k}: ${v}`)
                                        .join('\n') 
                                    : ""
                                }
                                rows={6}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all font-medium leading-relaxed font-mono text-[13px]"
                                placeholder="Ex:&#10;Ecran: 15 pouces&#10;RAM: 16GB&#10;Stockage: 512GB SSD"
                            />
                        </div>
                    </div>
                </section>
            </div>
            <div className="p-8 border-t border-slate-100 flex gap-4 bg-slate-50/50">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 px-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-[14px] text-slate-500 hover:bg-slate-50 transition-all shadow-sm"
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-[2] px-6 py-4 bg-orange-600 text-white rounded-2xl font-bold text-[14px] flex items-center justify-center gap-3 hover:bg-orange-700 shadow-xl shadow-orange-100 transition-all disabled:opacity-50"
                >
                    {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                    <span>{editingProduct ? 'Mettre à jour le Produit' : 'Créer le Produit'}</span>
                </button>
            </div>
        </form>
    );
}
