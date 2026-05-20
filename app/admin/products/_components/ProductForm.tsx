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
    ArrowLeft,
    Play,
    Video,
    Link as LinkIcon,
    Trash2,
    Eye,
    Monitor,
    Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { RichTextEditor } from '@/ui/RichTextEditor';
import { ProductDescriptionBuilder, DescriptionBlock } from './ProductDescriptionBuilder';
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

function smartParseMetadata(text: string) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l !== "");
    const result: Record<string, string> = {};
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Handle Key: Value
        const colonMatch = line.match(/^([^:]+):\s*(.+)$/);
        if (colonMatch) {
            result[colonMatch[1].trim()] = colonMatch[2].trim();
            continue;
        }
        
        // Handle Key\tValue
        if (line.includes('\t')) {
            const parts = line.split('\t');
            result[parts[0].trim()] = parts.slice(1).join(' ').trim();
            continue;
        }

        // Handle Key\nValue (common in messy pastes)
        if (i + 1 < lines.length) {
            const nextLine = lines[i+1];
            // Skip lines that are likely section headers (all caps or known categories)
            const isHeader = ["Informations générales", "Ergonomie", "Utilisation", "Capteur", "Caractéristiques physiques", "Alimentation", "Garanties", "Information sur la sécurité"].some(h => line.toLowerCase().includes(h.toLowerCase()));
            const isProbablyValue = nextLine === "Oui" || nextLine === "Non" || nextLine.match(/\d+/) || nextLine.length > 0;
            
            if (!isHeader && line.length < 50 && isProbablyValue && !nextLine.includes(':')) {
                result[line] = nextLine;
                i++; // Skip next line as it was the value
                continue;
            }
        }
        
        // Fallback: treat as boolean if short
        if (line.length < 40 && !line.includes(':')) {
            result[line] = "Oui";
        }
    }
    return result;
}

export default function ProductForm({ editingProduct }: { editingProduct?: any }) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [formImages, setFormImages] = useState<string[]>([]);
    const [formVideos, setFormVideos] = useState<string[]>([]);
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isUploadingVideo, setIsUploadingVideo] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const videoFileInputRef = React.useRef<HTMLInputElement>(null);
    const [isPublished, setIsPublished] = useState(editingProduct ? editingProduct.isPublished : false);

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
    const [detailedDescription, setDetailedDescription] = useState<DescriptionBlock[]>(editingProduct?.detailedDescription || []);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);
    const [previewTab, setPreviewTab] = useState<'desc' | 'specs'>('desc');
    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [activePreviewImageIdx, setActivePreviewImageIdx] = useState(0);
    const [metadataText, setMetadataText] = useState(
        editingProduct?.metadata 
            ? (() => {
                const meta = editingProduct.metadata as Record<string, any>;
                const order = meta._order as string[];
                const entries = Object.entries(meta).filter(([k]) => k !== 'importedAt' && k !== '_order');
                if (Array.isArray(order)) {
                    entries.sort((a, b) => {
                        const indexA = order.indexOf(a[0]);
                        const indexB = order.indexOf(b[0]);
                        if (indexA === -1 && indexB === -1) return 0;
                        if (indexA === -1) return 1;
                        if (indexB === -1) return -1;
                        return indexA - indexB;
                    });
                }
                return entries.map(([k, v]) => `${k}: ${v}`).join('\n');
            })()
            : ""
    );

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
            setFormVideos(editingProduct.videos || []);
            setIsPublished(editingProduct.isPublished !== undefined ? editingProduct.isPublished : false);
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

    const renderPreviewContent = (isMobile: boolean) => {
        if (!previewData) return null;
        
        const { name, price, stock, shortDescription, features, metadata, images, detailedDescription: previewDetailedDescription } = previewData;
        const activeImg = images[activePreviewImageIdx] || images[0] || "/placeholder.svg";

        return (
            <div className="space-y-12">
                {/* Top Section */}
                <div className={cn("grid gap-6 lg:gap-12", isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
                    {/* Gallery column */}
                    {isMobile ? (
                        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white border border-slate-100 flex items-center justify-center">
                            <div 
                                className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                onScroll={(e) => {
                                    const container = e.currentTarget;
                                    const width = container.clientWidth;
                                    const newIdx = Math.round(container.scrollLeft / width);
                                    if (newIdx !== activePreviewImageIdx) {
                                        setActivePreviewImageIdx(newIdx);
                                    }
                                }}
                            >
                                {images.map((img: string, idx: number) => (
                                    <div 
                                        key={idx} 
                                        className="w-full h-full flex-shrink-0 snap-start flex items-center justify-center p-4 relative cursor-pointer"
                                    >
                                        <img
                                            src={img}
                                            alt=""
                                            className="max-w-full max-h-full object-contain p-2"
                                        />
                                    </div>
                                ))}
                            </div>
                            {/* Pagination Dots */}
                            {images.length > 1 && (
                                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
                                    {images.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={cn(
                                                "h-1.5 rounded-full transition-all duration-300",
                                                activePreviewImageIdx === idx ? "w-4 bg-orange-600" : "w-1.5 bg-gray-300"
                                            )}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center p-4">
                                <img src={activeImg} alt="" className="max-w-full max-h-full object-contain" />
                            </div>
                            {images.length > 1 && (
                                <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
                                    {images.map((img: string, idx: number) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setActivePreviewImageIdx(idx)}
                                            className={cn(
                                                "w-16 h-16 rounded-xl border-2 overflow-hidden bg-slate-50 flex-shrink-0 transition-all p-1",
                                                activePreviewImageIdx === idx ? "border-orange-500 scale-95 shadow-sm" : "border-slate-100 hover:border-slate-200"
                                            )}
                                        >
                                            <img src={img} alt="" className="w-full h-full object-contain" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Details Column */}
                    <div className="space-y-6 flex flex-col justify-center">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                                    APERCU PRODUIT
                                </span>
                                <span className={cn(
                                    "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest",
                                    stock > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                                )}>
                                    {stock > 0 ? 'En stock' : 'Rupture'}
                                </span>
                            </div>
                            <h1 className={cn("font-bold text-slate-800 uppercase tracking-tight leading-tight font-montserrat", isMobile ? "text-xl" : "text-2xl lg:text-3xl")}>
                                {name || "Nom du Produit..."}
                            </h1>
                            <p className={cn("font-black text-orange-600 font-montserrat", isMobile ? "text-lg" : "text-xl lg:text-2xl")}>
                                {price ? price.toLocaleString('fr-FR') : '0'} CFA
                            </p>
                        </div>

                        {shortDescription && (
                            <div className="space-y-1.5 border-t border-slate-100 pt-4">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Description Courte</p>
                                <p className="text-gray-500 text-xs md:text-sm leading-relaxed font-medium italic">
                                    {shortDescription}
                                </p>
                            </div>
                        )}

                        {features.length > 0 && (
                            <div className="space-y-3 border-t border-slate-100 pt-4">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Caractéristiques principales</p>
                                <div className={cn("grid gap-2", isMobile ? "grid-cols-1" : "grid-cols-2")}>
                                    {features.map((feat: string, idx: number) => (
                                        <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-100/50 rounded-xl text-slate-600 text-[11px] font-bold">
                                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                                            <span className="truncate">{feat}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabs & Tab Content */}
                <div className="border-t border-slate-100 pt-8 space-y-6">
                    <div className="flex border-b border-slate-100 pb-px gap-6">
                        <button
                            type="button"
                            onClick={() => setPreviewTab('desc')}
                            className={cn(
                                "pb-3 text-xs md:text-sm font-bold uppercase tracking-widest transition-all relative",
                                previewTab === 'desc' ? "text-slate-800" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            Description
                            {previewTab === 'desc' && (
                                <motion.div layoutId="previewTabLine" className="absolute bottom-0 left-0 right-0 h-[2px] bg-orange-500" />
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setPreviewTab('specs')}
                            className={cn(
                                "pb-3 text-xs md:text-sm font-bold uppercase tracking-widest transition-all relative",
                                previewTab === 'specs' ? "text-slate-800" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            Fiche Technique
                            {previewTab === 'specs' && (
                                <motion.div layoutId="previewTabLine" className="absolute bottom-0 left-0 right-0 h-[2px] bg-orange-500" />
                            )}
                        </button>
                    </div>

                    <div className="min-h-[200px]">
                        {previewTab === 'desc' ? (
                            <div className="space-y-4 md:space-y-6">
                                {previewDetailedDescription && previewDetailedDescription.length > 0 ? (() => {
                                    let imgTextCount = 0;
                                    return previewDetailedDescription.map((block: any, idx: number) => {
                                        switch (block.type) {
                                            case 'LOGO':
                                                return (
                                                    <div key={idx} className="text-center py-4">
                                                        <img src={block.image} alt="" className="h-8 md:h-10 mx-auto object-contain" />
                                                    </div>
                                                );
                                            case 'TITLE':
                                                return (
                                                    <div key={idx} className="text-center max-w-2xl mx-auto pt-4 pb-2">
                                                        <h2 className="text-[18px] md:text-[22px] font-bold text-[#282828] uppercase tracking-[0.1em] leading-tight">
                                                            {block.title}
                                                        </h2>
                                                    </div>
                                                );
                                            case 'TEXT_CENTERED':
                                                return (
                                                    <div key={idx} className="text-center max-w-2xl mx-auto">
                                                        <p className="text-gray-500 text-xs md:text-base leading-relaxed font-medium">
                                                            {block.text}
                                                        </p>
                                                    </div>
                                                );
                                            case 'IMAGE_FULL':
                                                return (
                                                    <div key={idx} className="relative w-full aspect-[16/7] rounded-[1.5rem] md:rounded-[3rem] overflow-hidden bg-slate-50 border border-slate-100">
                                                        <img src={block.image} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                );
                                            case 'IMAGE_LEFT': {
                                                const isGrey = imgTextCount % 2 === 0;
                                                imgTextCount++;
                                                return (
                                                    <div key={idx} className={cn("flex flex-col md:flex-row items-center gap-4 md:gap-10 py-6 md:py-8 font-montserrat -mx-6 md:-mx-10 px-6 md:px-10 transition-colors duration-300", isGrey ? "bg-gray-50 border-y border-gray-100/50" : "bg-white")}>
                                                        <div className="w-full md:w-1/2 relative aspect-[16/10] overflow-hidden">
                                                            <img src={block.image} alt="" className="w-full h-full object-contain" />
                                                        </div>
                                                        <div className="w-full md:w-1/2 space-y-4">
                                                            <h3 className="text-[16px] md:text-[18px] font-bold text-[#282828] uppercase tracking-wider leading-snug">
                                                                {block.title}
                                                            </h3>
                                                            <div 
                                                                className="text-[#505050] text-[13px] leading-[1.7] font-normal whitespace-pre-wrap"
                                                                dangerouslySetInnerHTML={{ __html: block.text }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            case 'IMAGE_RIGHT': {
                                                const isGrey = imgTextCount % 2 === 0;
                                                imgTextCount++;
                                                return (
                                                    <div key={idx} className={cn("flex flex-col-reverse md:flex-row items-center gap-4 md:gap-10 py-6 md:py-8 font-montserrat -mx-6 md:-mx-10 px-6 md:px-10 transition-colors duration-300", isGrey ? "bg-gray-50 border-y border-gray-100/50" : "bg-white")}>
                                                        <div className="w-full md:w-1/2 space-y-4">
                                                            <h3 className="text-[16px] md:text-[18px] font-bold text-[#282828] uppercase tracking-wider leading-snug">
                                                                {block.title}
                                                            </h3>
                                                            <div 
                                                                className="text-[#505050] text-[13px] leading-[1.7] font-normal whitespace-pre-wrap"
                                                                dangerouslySetInnerHTML={{ __html: block.text }}
                                                            />
                                                        </div>
                                                        <div className="w-full md:w-1/2 relative aspect-[16/10] overflow-hidden">
                                                            <img src={block.image} alt="" className="w-full h-full object-contain" />
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            default:
                                                return null;
                                        }
                                    });
                                })() : (
                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs text-center py-10">Pas de blocs de description visuelle ajoutés.</p>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                {metadata && typeof metadata === 'object' ? (() => {
                                    const meta = metadata;
                                    const order = meta._order as string[];
                                    const entries = Object.entries(meta).filter(([key]) => !['id', 'importedat', 'customfields', 'images', 'description', '_order'].includes(key.toLowerCase()));
                                    if (Array.isArray(order)) {
                                        entries.sort((a, b) => {
                                            const indexA = order.indexOf(a[0]);
                                            const indexB = order.indexOf(b[0]);
                                            if (indexA === -1 && indexB === -1) return 0;
                                            if (indexA === -1) return 1;
                                            if (indexB === -1) return -1;
                                            return indexA - indexB;
                                        });
                                    }
                                    if (entries.length === 0) {
                                        return <p className="col-span-2 text-gray-400 font-bold uppercase tracking-widest text-xs text-center py-10">Fiche technique vide.</p>;
                                    }
                                    return entries.map(([key, value], i) => (
                                        <div key={i} className="flex flex-col gap-1 p-5 md:p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] hover:border-orange-500/20 hover:bg-orange-50/50 transition-all">
                                            <span className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-widest">{key}</span>
                                            <span className="text-sm md:text-base font-bold text-[#1B1F3B] leading-snug">{String(value)}</span>
                                        </div>
                                    ));
                                })() : (
                                    <p className="col-span-2 text-gray-400 font-bold uppercase tracking-widest text-xs text-center py-10">Fiche technique vide.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const handleUpsert = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name') as string,
            slug: (formData.get('name') as string).toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
            description: (formData.get('description') as string) || "",
            price: parseFloat(formData.get('price') as string),
            stock: parseInt(formData.get('stock') as string),
            categoryId: formData.get('categoryId') as string,
            subCategoryId: formData.get('subCategoryId') as string || null,
            thirdLevelCategoryId: formData.get('thirdLevelCategoryId') as string || null,
            brandId: formData.get('brandId') as string || null,
            storeId: formData.get('storeId') as string || null,
            images: formImages,
            videos: formVideos,
            colorVariants: colorVariants.filter(cv => cv.colorName.trim() !== ''),
            shortDescription: formData.get('shortDescription') as string || null,
            detailedDescription,
            features: (formData.get('features') as string || "").split('\n').filter(f => f.trim() !== ""),
            isPublished,
            metadata: (() => {
                const raw = metadataText;
                if (!raw || raw.trim() === '') return {};
                let parsed: Record<string, any> = {};
                try {
                    const parsedJson = JSON.parse(raw);
                    if (typeof parsedJson === 'object' && parsedJson !== null && !Array.isArray(parsedJson)) {
                        parsed = parsedJson;
                    }
                } catch { }

                if (Object.keys(parsed).length === 0) {
                    parsed = smartParseMetadata(raw);
                }

                // Create a clean _order list preserving the exact line-by-line order from the textarea
                const order: string[] = [];
                raw.split('\n').forEach(line => {
                    let key = '';
                    const colonMatch = line.match(/^([^:]+):\s*(.+)$/);
                    if (colonMatch) {
                        key = colonMatch[1].trim();
                    } else if (line.includes('\t')) {
                        key = line.split('\t')[0].trim();
                    } else {
                        key = line.trim();
                    }

                    if (key && parsed[key] !== undefined && !order.includes(key)) {
                        order.push(key);
                    }
                });

                if (order.length > 0) {
                    parsed._order = order;
                }
                return parsed;
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
        <>
        <form onSubmit={handleUpsert} className="bg-white rounded-2xl shadow-sm border border-slate-200/50 flex flex-col max-w-5xl mx-auto overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-orange-600 transition-colors shadow-sm"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h3 className="text-[18px] font-bold text-slate-900">{editingProduct ? 'Modifier' : 'Ajouter un'} Produit</h3>
                            {editingProduct?.reference && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                                    REF: {editingProduct.reference}
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">Configurez les détails techniques du produit.</p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-8">
                <section className="space-y-4">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] flex items-center gap-2">
                        <div className="w-3 h-[2px] bg-orange-500 rounded-full" />
                        Informations de Base
                    </h4>
                    <div className="grid grid-cols-2 gap-6">
                        <div className={editingProduct?.reference ? "space-y-1.5 col-span-1" : "space-y-1.5 col-span-2"}>
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nom du Produit</label>
                            <input
                                name="name"
                                defaultValue={editingProduct?.name}
                                required
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all font-medium text-[13px]"
                                placeholder="Ex: Abaya Silk Premium"
                            />
                        </div>
                        {editingProduct?.reference && (
                            <div className="space-y-1.5 col-span-1">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Référence</label>
                                <input
                                    value={editingProduct.reference}
                                    readOnly
                                    className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg font-mono font-bold text-slate-500 cursor-not-allowed text-[13px]"
                                />
                            </div>
                        )}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Prix (F CFA)</label>
                            <input
                                name="price"
                                type="number"
                                defaultValue={editingProduct?.price}
                                required
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all font-medium text-[13px]"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Stock Initial</label>
                            <input
                                name="stock"
                                type="number"
                                defaultValue={editingProduct?.stock}
                                required
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all font-medium text-[13px]"
                            />
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] flex items-center gap-2">
                        <div className="w-3 h-[2px] bg-orange-500 rounded-full" />
                        Catégorisation & Marque
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Catégorie (L1)</label>
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
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all font-medium appearance-none text-[13px]"
                            >
                                <option value="">Sélectionner</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sous-catégorie (L2)</label>
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
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all font-medium appearance-none text-[13px]"
                            >
                                <option value="">Aucune</option>
                                {subCategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sous-sous (L3)</label>
                            <select
                                key={`thirdcat-${thirdCategories.length}`}
                                name="thirdLevelCategoryId"
                                value={thirdLevelCategoryId}
                                onChange={(e) => setThirdLevelCategoryId(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all font-medium appearance-none text-[13px]"
                            >
                                <option value="">Aucune</option>
                                {thirdCategories.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Marque</label>
                            <select
                                key={`brand-${brands.length}`}
                                name="brandId"
                                value={brandId}
                                onChange={(e) => setBrandId(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all font-medium appearance-none text-[13px]"
                            >
                                <option value="">Aucune</option>
                                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Boutique (Vendor)</label>
                            <select
                                key={`store-${stores.length}`}
                                name="storeId"
                                value={storeId}
                                onChange={(e) => setStoreId(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all font-medium appearance-none text-[13px]"
                            >
                                <option value="">Aucune (Baraka General)</option>
                                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] flex items-center gap-2">
                        <div className="w-3 h-[2px] bg-orange-500 rounded-full" />
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
                                "relative py-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300",
                                isDragging
                                    ? "border-orange-500 bg-orange-50/80 scale-[1.01]"
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
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                                {formImages.map((img, i) => (
                                    <div 
                                        key={i} 
                                        className="relative aspect-square group cursor-move"
                                        draggable
                                        onDragStart={(e) => e.dataTransfer.setData('text/plain', i.toString())}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
                                            if (fromIdx === i || isNaN(fromIdx)) return;
                                            setFormImages(prev => {
                                                const newImages = [...prev];
                                                const [moved] = newImages.splice(fromIdx, 1);
                                                newImages.splice(i, 0, moved);
                                                return newImages;
                                            });
                                        }}
                                    >
                                        <div className="w-full h-full rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm pointer-events-none">
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

                <section className="space-y-4">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] flex items-center gap-2">
                        <div className="w-3 h-[2px] bg-orange-500 rounded-full" />
                        Vidéos du Produit
                        <span className="text-[9px] text-slate-300 font-medium italic normal-case tracking-normal ml-1">(YouTube ou fichier vidéo court)</span>
                    </h4>

                    <div className="space-y-4">
                        {/* YouTube URL input */}
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <LinkIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="url"
                                    value={youtubeUrl}
                                    onChange={(e) => setYoutubeUrl(e.target.value)}
                                    placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500/20 transition-all font-medium text-[13px]"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    if (!youtubeUrl.trim()) return;
                                    // Validate YouTube URL
                                    const ytPatterns = [
                                        /youtube\.com\/watch\?v=/,
                                        /youtube\.com\/embed\//,
                                        /youtu\.be\//,
                                        /youtube\.com\/shorts\//,
                                    ];
                                    const isYT = ytPatterns.some(p => p.test(youtubeUrl));
                                    if (!isYT) {
                                        toast.error("URL YouTube invalide. Utilisez un lien youtube.com ou youtu.be.");
                                        return;
                                    }
                                    if (formVideos.includes(youtubeUrl.trim())) {
                                        toast.error("Cette vidéo est déjà ajoutée.");
                                        return;
                                    }
                                    setFormVideos(prev => [...prev, youtubeUrl.trim()]);
                                    setYoutubeUrl('');
                                    toast.success('✅ Vidéo YouTube ajoutée !');
                                }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg font-bold text-[12px] hover:bg-red-700 transition-all shadow-sm"
                            >
                                <Play size={14} className="fill-white" />
                                Ajouter YT
                            </button>
                        </div>

                        {/* Video file upload */}
                        <div
                            onClick={() => videoFileInputRef.current?.click()}
                            className={cn(
                                "relative py-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300",
                                "border-slate-200 bg-slate-50/50 hover:border-purple-300 hover:bg-purple-50/30",
                                isUploadingVideo && "pointer-events-none opacity-60"
                            )}
                        >
                            <input
                                ref={videoFileInputRef}
                                type="file"
                                accept="video/mp4,video/webm,video/quicktime"
                                className="hidden"
                                onChange={async (e) => {
                                    const files = Array.from(e.target.files || []);
                                    if (files.length === 0) return;
                                    setIsUploadingVideo(true);
                                    try {
                                        const fd = new FormData();
                                        files.forEach(f => fd.append('files', f));
                                        const res = await fetch('/api/upload', { method: 'POST', body: fd });
                                        const data = await res.json();
                                        if (data.urls) {
                                            setFormVideos(prev => [...prev, ...data.urls]);
                                            toast.success(`✅ ${data.urls.length} vidéo(s) uploadée(s) !`);
                                        } else {
                                            toast.error(data.error || 'Erreur upload vidéo');
                                        }
                                    } catch {
                                        toast.error("Erreur lors de l'upload vidéo.");
                                    } finally {
                                        setIsUploadingVideo(false);
                                        e.target.value = '';
                                    }
                                }}
                            />
                            {isUploadingVideo ? (
                                <>
                                    <Loader2 size={28} className="animate-spin text-purple-500" />
                                    <p className="text-[13px] font-bold text-purple-600">Upload vidéo en cours...</p>
                                </>
                            ) : (
                                <>
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white border border-slate-200 text-slate-400">
                                        <Video size={22} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[13px] font-bold text-slate-600">
                                            Uploader une courte vidéo
                                        </p>
                                        <p className="text-[11px] text-slate-400 font-medium mt-1">
                                            <span className="text-purple-500 font-bold">Cliquez pour parcourir</span> — MP4, WebM • Max 50 MB
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Video previews */}
                        {formVideos.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                                {formVideos.map((vid, i) => {
                                    // Check if YouTube
                                    const ytMatch = vid.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&?\s]+)/);
                                    const ytId = ytMatch ? ytMatch[1] : null;
                                    const thumbSrc = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : undefined;

                                    return (
                                        <div 
                                            key={i} 
                                            className="relative aspect-video group rounded-xl overflow-hidden border border-slate-200 bg-gray-900 shadow-sm cursor-move"
                                            draggable
                                            onDragStart={(e) => e.dataTransfer.setData('text/plain', i.toString())}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
                                                if (fromIdx === i || isNaN(fromIdx)) return;
                                                setFormVideos(prev => {
                                                    const newVideos = [...prev];
                                                    const [moved] = newVideos.splice(fromIdx, 1);
                                                    newVideos.splice(i, 0, moved);
                                                    return newVideos;
                                                });
                                            }}
                                        >
                                            {thumbSrc ? (
                                                <img src={thumbSrc} alt="YouTube" className="w-full h-full object-cover" />
                                            ) : (
                                                <video src={vid} className="w-full h-full object-cover" muted />
                                            )}
                                            {/* Play overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-full flex items-center justify-center shadow-lg",
                                                    ytId ? "bg-red-600/90" : "bg-purple-600/90"
                                                )}>
                                                    <Play size={16} className="text-white fill-white ml-0.5" />
                                                </div>
                                            </div>
                                            {/* Badge */}
                                            <span className={cn(
                                                "absolute top-1.5 left-1.5 px-2 py-0.5 text-white text-[8px] font-black uppercase rounded tracking-wider",
                                                ytId ? "bg-red-600" : "bg-purple-600"
                                            )}>
                                                {ytId ? 'YouTube' : 'Vidéo'}
                                            </span>
                                            {/* Remove button */}
                                            <button
                                                type="button"
                                                onClick={() => setFormVideos(prev => prev.filter((_, idx) => idx !== i))}
                                                className="absolute -top-2 -right-2 w-7 h-7 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
                                            >
                                                <X size={14} strokeWidth={3} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] flex items-center gap-2">
                            <div className="w-3 h-[2px] bg-orange-500 rounded-full" />
                            Variantes de Couleur
                        </h4>
                        <button
                            type="button"
                            onClick={() => {
                                setColorVariants(prev => [...prev, { colorName: '', colorHex: '#000000', images: [] }]);
                                setActiveColorIdx(colorVariants.length);
                            }}
                            className="flex items-center justify-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-[11px] font-bold hover:bg-orange-100 transition-all border border-orange-200/50"
                        >
                            <Plus size={12} />
                            Ajouter une couleur
                        </button>
                    </div>

                    {colorVariants.length === 0 ? (
                        <div className="py-6 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                            <Palette size={24} className="mx-auto mb-2 text-slate-300" />
                            <p className="text-[12px] font-bold">Aucune variante de couleur</p>
                            <p className="text-[10px] text-slate-400 mt-1">Les photos principales seront utilisées pour toutes les couleurs.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {colorVariants.map((cv, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setActiveColorIdx(activeColorIdx === idx ? null : idx)}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold transition-all border cursor-pointer",
                                            activeColorIdx === idx
                                                ? "bg-white border-orange-300 text-orange-700 shadow-sm shadow-orange-100"
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
                                    </div>
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                {activeColorIdx !== null && colorVariants[activeColorIdx] && (
                                    <motion.div
                                        key={activeColorIdx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="bg-slate-50/80 rounded-xl border border-slate-200/50 p-5 space-y-4"
                                    >
                                        <div className="space-y-2 relative">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Choisir une couleur</label>
                                            <div className="relative" ref={colorDropdownRef}>
                                                <button
                                                    type="button"
                                                    onClick={() => { setColorDropdownOpen(!colorDropdownOpen); setColorSearch(''); }}
                                                    className={cn(
                                                        "w-full flex items-center gap-3 px-4 py-2 bg-white border rounded-lg text-left transition-all",
                                                        colorDropdownOpen ? "border-orange-400 ring-4 ring-orange-500/10" : "border-slate-200 hover:border-slate-300"
                                                    )}
                                                >
                                                    <div
                                                        className="w-7 h-7 rounded-lg border-2 border-white shadow-sm flex-shrink-0"
                                                        style={{ backgroundColor: colorVariants[activeColorIdx].colorHex || '#ccc' }}
                                                    />
                                                    <input
                                                        type="text"
                                                        value={colorVariants[activeColorIdx].colorName || ''}
                                                        placeholder="Sélectionner ou nommer..."
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (!colorDropdownOpen) setColorDropdownOpen(true);
                                                        }}
                                                        onChange={(e) => {
                                                            setColorVariants(prev => prev.map((cv, i) => i === activeColorIdx ? { ...cv, colorName: e.target.value } : cv));
                                                        }}
                                                        className="flex-1 text-[13px] font-semibold text-slate-700 bg-transparent focus:outline-none placeholder:text-slate-400 placeholder:font-normal truncate"
                                                    />
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
                                                                <div className="flex gap-2">
                                                                    <div className="relative flex-1">
                                                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                                        <input
                                                                            type="text"
                                                                            autoFocus
                                                                            placeholder="Rechercher ou code hex (#...)"
                                                                            value={colorSearch}
                                                                            onChange={(e) => setColorSearch(e.target.value)}
                                                                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[12px] font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-300 transition-all"
                                                                        />
                                                                    </div>
                                                                    <div className="relative w-10 h-10 flex-shrink-0 rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:border-orange-300 transition-colors bg-slate-50" title="Choisir une couleur personnalisée">
                                                                        <input 
                                                                            type="color" 
                                                                            className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer opacity-0"
                                                                            onChange={(e) => {
                                                                                const hex = e.target.value.toUpperCase();
                                                                                setColorVariants(prev => prev.map((cv, i) => i === activeColorIdx ? { ...cv, colorName: 'Personnalisée', colorHex: hex } : cv));
                                                                                setColorDropdownOpen(false);
                                                                            }}
                                                                        />
                                                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                                            <Palette size={16} className="text-slate-600" />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="max-h-[280px] overflow-y-auto py-2 scrollbar-thin">
                                                                {(() => {
                                                                    const customColorMatch = colorSearch.trim().match(/^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/i);
                                                                    const customHex = customColorMatch ? (colorSearch.trim().startsWith('#') ? colorSearch.trim() : `#${colorSearch.trim()}`).toUpperCase() : null;
                                                                    
                                                                    return (
                                                                        <>
                                                                            {customHex && (
                                                                                <button
                                                                                    key="custom"
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        setColorVariants(prev => prev.map((cv, i) => i === activeColorIdx ? { ...cv, colorName: 'Personnalisée', colorHex: customHex } : cv));
                                                                                        setColorDropdownOpen(false);
                                                                                        setColorSearch('');
                                                                                    }}
                                                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-orange-50 transition-all border-b border-orange-100"
                                                                                >
                                                                                    <div
                                                                                        className="w-6 h-6 rounded-lg flex-shrink-0 shadow-sm border border-orange-200"
                                                                                        style={{ backgroundColor: customHex }}
                                                                                    />
                                                                                    <span className="flex-1 text-[12px] font-bold text-orange-700">Utiliser cette couleur</span>
                                                                                    <span className="text-[10px] font-mono text-orange-600">{customHex}</span>
                                                                                    <Plus size={14} className="text-orange-500" />
                                                                                </button>
                                                                            )}
                                                                            {COLOR_PALETTE
                                                                                .filter(c => c.name.toLowerCase().includes(colorSearch.toLowerCase()) || c.hex.toLowerCase().includes(colorSearch.toLowerCase()))
                                                                                .map((color) => {
                                                                                    const isSelected = colorVariants[activeColorIdx].colorHex.toUpperCase() === color.hex.toUpperCase();
                                                                                    return (
                                                                                        <button
                                                                                            key={color.name}
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
                                                                        </>
                                                                    );
                                                                })()}
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
                                                        <div 
                                                            key={imgIdx} 
                                                            className="relative aspect-square group cursor-move"
                                                            draggable
                                                            onDragStart={(e) => e.dataTransfer.setData('text/plain', imgIdx.toString())}
                                                            onDragOver={(e) => e.preventDefault()}
                                                            onDrop={(e) => {
                                                                e.preventDefault();
                                                                const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
                                                                if (fromIdx === imgIdx || isNaN(fromIdx)) return;
                                                                const currentIdx = activeColorIdx;
                                                                setColorVariants(prev => prev.map((cv, i) => {
                                                                    if (i !== currentIdx) return cv;
                                                                    const newImages = [...cv.images];
                                                                    const [moved] = newImages.splice(fromIdx, 1);
                                                                    newImages.splice(imgIdx, 0, moved);
                                                                    return { ...cv, images: newImages };
                                                                }));
                                                            }}
                                                        >
                                                            <div className="w-full h-full rounded-lg border border-slate-200 overflow-hidden bg-white shadow-sm pointer-events-none">
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

                <section className="space-y-4">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] flex items-center gap-2">
                        <div className="w-3 h-[2px] bg-orange-500 rounded-full" />
                        Contenu Détaillé
                    </h4>
                    
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Description Courte</label>
                        <textarea
                            name="shortDescription"
                            defaultValue={editingProduct?.shortDescription}
                            rows={2}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all font-medium leading-relaxed text-[13px]"
                            placeholder="Résumé accrocheur pour le haut de page..."
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Description Classique (HTML)</label>
                        </div>
                        <RichTextEditor
                            name="description"
                            defaultValue={editingProduct?.description || ""}
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Description Visuelle (Apple Style)</label>
                            <span className="text-[9px] font-medium text-slate-400 italic">Glissez-déposez pour réorganiser</span>
                        </div>
                        <ProductDescriptionBuilder 
                            initialData={detailedDescription}
                            onChange={setDetailedDescription}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Caractéristiques (1 par ligne)</label>
                            <textarea
                                name="features"
                                defaultValue={Array.isArray(editingProduct?.features) ? editingProduct.features.join('\n') : ""}
                                rows={6}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all font-medium leading-relaxed font-mono text-[12px]"
                                placeholder="Ex: Coton 100%&#10;Lavage 30°C&#10;Coupe ajustée"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fiche Technique (Key: Value)</label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const parsed = smartParseMetadata(metadataText);
                                        const formatted = Object.entries(parsed).map(([k, v]) => `${k}: ${v}`).join('\n');
                                        setMetadataText(formatted);
                                        toast.info("🪄 Fiche technique adaptée !");
                                    }}
                                    className="text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-1.5 hover:text-orange-700 transition-colors"
                                >
                                    <span>Adapter</span>
                                    <Palette size={10} />
                                </button>
                            </div>
                            <textarea
                                name="metadata"
                                value={metadataText}
                                onChange={(e) => setMetadataText(e.target.value)}
                                rows={6}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all font-medium leading-relaxed font-mono text-[12px]"
                                placeholder="Collez ici vos spécifications en vrac..."
                            />
                        </div>
                    </div>
                </section>
            </div>
            <div className="p-6 border-t border-slate-100 flex gap-3 bg-slate-50/50">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 px-6 py-3.5 bg-white border border-slate-200 rounded-xl font-bold text-[13px] text-slate-500 hover:bg-slate-50 transition-all shadow-sm"
                >
                    Annuler
                </button>
                <button
                    type="button"
                    onClick={() => {
                        const form = document.querySelector('form');
                        if (form) {
                            const formData = new FormData(form);
                            const name = formData.get('name') as string;
                            const price = parseFloat(formData.get('price') as string) || 0;
                            const stock = parseInt(formData.get('stock') as string) || 0;
                            const shortDescription = formData.get('shortDescription') as string || "";
                            const featuresRaw = formData.get('features') as string || "";
                            const features = featuresRaw.split('\n').filter(f => f.trim() !== "");
                            
                            const metaParsed = (() => {
                                const raw = metadataText;
                                if (!raw || raw.trim() === '') return {};
                                let parsed: Record<string, any> = {};
                                try {
                                    const parsedJson = JSON.parse(raw);
                                    if (typeof parsedJson === 'object' && parsedJson !== null && !Array.isArray(parsedJson)) {
                                        parsed = parsedJson;
                                    }
                                } catch { }

                                if (Object.keys(parsed).length === 0) {
                                    parsed = smartParseMetadata(raw);
                                }
                                
                                const order: string[] = [];
                                raw.split('\n').forEach(line => {
                                    let key = '';
                                    const colonMatch = line.match(/^([^:]+):\s*(.+)$/);
                                    if (colonMatch) {
                                        key = colonMatch[1].trim();
                                    } else if (line.includes('\t')) {
                                        key = line.split('\t')[0].trim();
                                    } else {
                                        key = line.trim();
                                    }
                                    if (key && parsed[key] !== undefined && !order.includes(key)) {
                                        order.push(key);
                                    }
                                });
                                if (order.length > 0) {
                                    parsed._order = order;
                                }
                                return parsed;
                            })();

                            setPreviewData({
                                name,
                                price,
                                stock,
                                shortDescription,
                                features,
                                metadata: metaParsed,
                                images: formImages,
                                detailedDescription
                            });
                            setActivePreviewImageIdx(0);
                            setPreviewOpen(true);
                        }
                    }}
                    className="px-6 py-3.5 bg-slate-800 text-white rounded-xl font-bold text-[13px] flex items-center justify-center gap-2.5 hover:bg-slate-900 transition-all shadow-sm active:scale-95"
                >
                    <Eye size={16} />
                    <span>Aperçu</span>
                </button>
                <button
                    type="button"
                    onClick={() => setIsPublished(!isPublished)}
                    className={cn(
                        "px-6 py-3.5 border rounded-xl font-bold text-[13px] flex items-center justify-center gap-2.5 transition-all shadow-sm active:scale-95",
                        isPublished 
                            ? "bg-blue-50 text-blue-600 border-blue-100/50 hover:bg-blue-100" 
                            : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                    )}
                >
                    <div className={cn("w-2 h-2 rounded-full", isPublished ? "bg-blue-500 animate-pulse" : "bg-slate-400")} />
                    <span>{isPublished ? 'Statut: Publié' : 'Statut: Caché'}</span>
                </button>
                <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-[2] px-6 py-3.5 bg-orange-600 text-white rounded-xl font-bold text-[13px] flex items-center justify-center gap-3 hover:bg-orange-700 shadow-lg shadow-orange-100 transition-all disabled:opacity-50"
                >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    <span>{editingProduct ? 'Mettre à jour le Produit' : 'Créer le Produit'}</span>
                </button>
            </div>
        </form>

        {/* Live Preview Modal */}
        <AnimatePresence>
            {previewOpen && previewData && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-2 md:p-6 overflow-hidden">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl max-w-6xl w-full h-[92vh] flex flex-col overflow-hidden"
                    >
                        {/* Modal Header */}
                        <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                                    <Eye size={16} />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-sm md:text-base font-bold text-slate-800">Aperçu en Direct</h3>
                                    <p className="text-[10px] text-slate-400 font-medium">Visualisez le rendu final sur mobile et ordinateur.</p>
                                </div>
                            </div>

                            {/* Mode Toggles */}
                            <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1">
                                <button
                                    type="button"
                                    onClick={() => setPreviewMode('desktop')}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                        previewMode === 'desktop' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    <Monitor size={14} />
                                    <span className="hidden sm:inline">Ordinateur</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPreviewMode('mobile')}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                        previewMode === 'mobile' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    <Smartphone size={14} />
                                    <span className="hidden sm:inline">Mobile</span>
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => setPreviewOpen(false)}
                                className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:scale-105 transition-all shadow-sm"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8 flex items-center justify-center">
                            {previewMode === 'mobile' ? (
                                <div className="w-[375px] h-[720px] border-[10px] border-slate-900 rounded-[2.8rem] bg-white shadow-2xl relative flex flex-col overflow-hidden ring-4 ring-slate-800/10 flex-shrink-0">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-5 bg-slate-900 rounded-b-2xl z-20 flex items-center justify-center">
                                        <div className="w-12 h-1 bg-slate-700/50 rounded-full mb-1" />
                                    </div>
                                    <div className="flex-1 overflow-y-auto overflow-x-hidden pt-8 pb-6 px-4 space-y-8 bg-white text-slate-800 select-none">
                                        {renderPreviewContent(true)}
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full max-w-5xl bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-10 overflow-y-auto max-h-[80vh]">
                                    {renderPreviewContent(false)}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
        </>
    );
}
