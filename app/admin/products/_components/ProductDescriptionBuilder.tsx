'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
    Plus, 
    Trash2, 
    GripVertical, 
    Image as ImageIcon, 
    Type, 
    Layout, 
    AlignLeft, 
    AlignRight, 
    AlignCenter,
    X,
    Upload,
    Loader2,
    Video,
    Play,
    Check,
    ChevronDown,
    ChevronUp,
    Copy,
    Eye,
    EyeOff,
    Sparkles,
    MoveUp,
    MoveDown
} from 'lucide-react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { RichTextEditor } from '@/ui/RichTextEditor';
import { toast } from 'sonner';

export type DescriptionBlock = {
    id: string;
    type: 'TITLE_CENTERED' | 'TEXT_CENTERED' | 'IMAGE_FULL' | 'IMAGE_LEFT' | 'IMAGE_RIGHT' | 'LOGO' | 'VIDEO_LEFT' | 'VIDEO_RIGHT';
    title?: string;
    text?: string;
    image?: string;
    video?: string;
};

interface ProductDescriptionBuilderProps {
    initialData?: any;
    onChange: (data: DescriptionBlock[]) => void;
    onUploadingChange?: (isUploading: boolean) => void;
}

const BLOCK_CATEGORIES = [
    {
        name: "Titres & Textes",
        items: [
            { type: 'LOGO', label: 'Logo Centré', icon: Layout, desc: 'Logo de marque en haut de section' },
            { type: 'TITLE_CENTERED', label: 'Titre Centré', icon: AlignCenter, desc: 'Grande accroche éditoriale' },
            { type: 'TEXT_CENTERED', label: 'Texte Centré', icon: Type, desc: 'Paragraphe central immersif' },
        ]
    },
    {
        name: "Visuels & Médias",
        items: [
            { type: 'IMAGE_FULL', label: 'Image Large', icon: ImageIcon, desc: 'Bannière panoramique 16:9' },
            { type: 'IMAGE_LEFT', label: 'Image Gauche + Texte', icon: AlignLeft, desc: 'Photo à gauche, texte à droite' },
            { type: 'IMAGE_RIGHT', label: 'Texte + Image Droite', icon: AlignRight, desc: 'Texte à gauche, photo à droite' },
        ]
    },
    {
        name: "Vidéos",
        items: [
            { type: 'VIDEO_LEFT', label: 'Vidéo Gauche + Texte', icon: Video, desc: 'Lecteur à gauche, texte à droite' },
            { type: 'VIDEO_RIGHT', label: 'Texte + Vidéo Droite', icon: Video, desc: 'Texte à gauche, lecteur à droite' },
        ]
    }
];

const ALL_BLOCK_TYPES = BLOCK_CATEGORIES.flatMap(c => c.items);

const BLOCK_TYPE_LABELS: Record<string, string> = {
    'LOGO': 'Logo Centré',
    'TITLE_CENTERED': 'Titre Centré',
    'TEXT_CENTERED': 'Texte Centré',
    'IMAGE_FULL': 'Image Pleine Largeur',
    'IMAGE_LEFT': 'Image Gauche + Texte',
    'IMAGE_RIGHT': 'Texte + Image Droite',
    'VIDEO_LEFT': 'Vidéo Gauche + Texte',
    'VIDEO_RIGHT': 'Texte + Vidéo Droite',
};

function normalizeBlocks(data: any): DescriptionBlock[] {
    if (!data) return [];
    let list: any[] = [];
    if (Array.isArray(data)) {
        list = data;
    } else if (typeof data === 'string') {
        try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) list = parsed;
        } catch {}
    }
    return list
        .filter(b => b && typeof b === 'object' && b.type)
        .map(b => ({
            id: String(b.id || Math.random().toString(36).substring(2, 9)),
            type: b.type,
            title: typeof b.title === 'string' ? b.title : '',
            text: typeof b.text === 'string' ? b.text : '',
            image: typeof b.image === 'string' ? b.image : '',
            video: typeof b.video === 'string' ? b.video : '',
        }));
}

export function ProductDescriptionBuilder({ initialData = [], onChange, onUploadingChange }: ProductDescriptionBuilderProps) {
    const [blocks, setBlocks] = useState<DescriptionBlock[]>(() => normalizeBlocks(initialData));
    const [isUploading, setIsUploading] = useState<string | null>(null);
    const [justAddedType, setJustAddedType] = useState<string | null>(null);
    const [newBlockId, setNewBlockId] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [isPreviewMode, setIsPreviewMode] = useState(false);

    const blockEndRef = useRef<HTMLDivElement>(null);
    const blockRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const prevInitialJsonRef = useRef<string>(JSON.stringify(normalizeBlocks(initialData)));
    const isFirstRender = useRef(true);

    useEffect(() => {
        const normalized = normalizeBlocks(initialData);
        const serialized = JSON.stringify(normalized);
        if (serialized !== prevInitialJsonRef.current && serialized !== JSON.stringify(blocks)) {
            prevInitialJsonRef.current = serialized;
            setBlocks(normalized);
        }
    }, [initialData]);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        onChange(blocks);
    }, [blocks, onChange]);

    const blockCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const b of blocks) {
            counts[b.type] = (counts[b.type] || 0) + 1;
        }
        return counts;
    }, [blocks]);

    const addBlock = useCallback((type: DescriptionBlock['type']) => {
        const newId = Math.random().toString(36).substring(2, 9);
        const newBlock: DescriptionBlock = {
            id: newId,
            type,
            title: '',
            text: '',
            image: '',
            video: ''
        };
        setBlocks(prev => [...prev, newBlock]);

        setJustAddedType(type);
        setTimeout(() => setJustAddedType(null), 800);

        setNewBlockId(newId);
        setTimeout(() => setNewBlockId(null), 2500);

        const label = BLOCK_TYPE_LABELS[type] || type;
        setToastMessage(`✓ Bloc "${label}" ajouté`);
        setTimeout(() => setToastMessage(null), 2200);

        setTimeout(() => {
            const el = blockRefs.current[newId];
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 150);
    }, []);

    const duplicateBlock = (id: string) => {
        const index = blocks.findIndex(b => b.id === id);
        if (index === -1) return;
        const source = blocks[index];
        const newId = Math.random().toString(36).substring(2, 9);
        const duplicated: DescriptionBlock = {
            ...source,
            id: newId,
            title: source.title ? `${source.title} (copie)` : ''
        };
        const updated = [...blocks];
        updated.splice(index + 1, 0, duplicated);
        setBlocks(updated);

        setNewBlockId(newId);
        setTimeout(() => setNewBlockId(null), 2500);

        setToastMessage(`✓ Bloc dupliqué`);
        setTimeout(() => setToastMessage(null), 2200);
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= blocks.length) return;
        const updated = [...blocks];
        const [moved] = updated.splice(index, 1);
        updated.splice(newIndex, 0, moved);
        setBlocks(updated);
    };

    const removeBlock = (id: string) => {
        setBlocks(blocks.filter(b => b.id !== id));
        setToastMessage(`Bloc supprimé`);
        setTimeout(() => setToastMessage(null), 1800);
    };

    const updateBlock = (id: string, updates: Partial<DescriptionBlock>) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
    };

    const handleImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error("Veuillez sélectionner un fichier image valide (JPG, PNG, WebP, GIF, AVIF).");
            return;
        }

        if (file.size > 20 * 1024 * 1024) {
            toast.error("L'image est trop volumineuse (max 20 Mo).");
            return;
        }

        setIsUploading(id);
        onUploadingChange?.(true);

        try {
            const formData = new FormData();
            formData.append('files', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (res.ok && Array.isArray(data.urls) && data.urls[0]) {
                const uploadedUrl = data.urls[0];
                setBlocks(prev => prev.map(b => b.id === id ? { ...b, image: uploadedUrl } : b));
                toast.success("Image ajoutée à la section avec succès !");
            } else {
                toast.error(data.error || "Erreur lors du téléversement de l'image.");
            }
        } catch (err) {
            console.error("Upload error in visual block:", err);
            toast.error("Erreur réseau lors du téléversement.");
        } finally {
            setIsUploading(null);
            onUploadingChange?.(false);
            if (e.target) e.target.value = '';
        }
    };

    const getBlockIcon = (type: string) => {
        const bt = ALL_BLOCK_TYPES.find(b => b.type === type);
        if (!bt) return Layout;
        return bt.icon;
    };

    return (
        <div className="space-y-6">
            {/* Top Apple Studio Toolbar */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                            <h5 className="text-[13px] font-black uppercase tracking-wider text-slate-800">
                                Atelier de Présentation Apple Style
                            </h5>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                            Composez une histoire visuelle haute fidélité alternant accroches, visuels et vidéos.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {blocks.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setIsPreviewMode(!isPreviewMode)}
                                className={cn(
                                    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border",
                                    isPreviewMode 
                                        ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                                )}
                            >
                                {isPreviewMode ? <EyeOff size={14} /> : <Eye size={14} />}
                                <span>{isPreviewMode ? "Mode Édition" : "Aperçu Storefront"}</span>
                            </button>
                        )}
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold tabular-nums">
                            {blocks.length} bloc{blocks.length > 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {/* Categorized Component Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {BLOCK_CATEGORIES.map((cat, idx) => (
                        <div key={idx} className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 flex flex-col gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                {cat.name}
                            </span>
                            <div className="flex flex-col gap-1.5">
                                {cat.items.map((item) => {
                                    const count = blockCounts[item.type] || 0;
                                    const isJustAdded = justAddedType === item.type;
                                    const Icon = item.icon;
                                    return (
                                        <button
                                            key={item.type}
                                            type="button"
                                            onClick={() => addBlock(item.type as any)}
                                            className={cn(
                                                "relative flex items-center justify-between px-3 py-2 rounded-lg text-left text-[11px] font-bold transition-all border",
                                                isJustAdded
                                                    ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                                                    : "bg-white text-slate-700 border-slate-200/70 hover:border-orange-300 hover:bg-orange-50/40 hover:text-orange-700"
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Icon size={14} className={cn(isJustAdded ? "text-white" : "text-slate-400")} />
                                                <span>{item.label}</span>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                {count > 0 && (
                                                    <span className={cn(
                                                        "px-1.5 py-0.5 rounded-full text-[9px] font-black",
                                                        isJustAdded ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                                                    )}>
                                                        {count}
                                                    </span>
                                                )}
                                                <Plus size={13} className={isJustAdded ? "text-white" : "text-slate-300"} />
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Inline Toast Notification */}
                <AnimatePresence>
                    {toastMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            className="bg-emerald-600 text-white text-xs font-bold py-1.5 px-4 rounded-full text-center shadow-md w-fit mx-auto"
                        >
                            {toastMessage}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* PREVIEW MODE RENDERING */}
            {isPreviewMode ? (
                <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 md:p-10 space-y-12 shadow-sm">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            <span className="text-xs font-bold text-slate-700">Rendu Réel (comme sur la fiche produit)</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsPreviewMode(false)}
                            className="text-xs font-bold text-orange-600 hover:underline"
                        >
                            Revenir au mode édition
                        </button>
                    </div>

                    {blocks.map((block, idx) => {
                        const isGrey = idx % 2 === 0;
                        switch (block.type) {
                            case 'LOGO':
                                return (
                                    <div key={block.id} className="flex justify-center py-4">
                                        {block.image ? (
                                            <img src={block.image} alt="Logo" className="max-h-16 max-w-[200px] object-contain" />
                                        ) : (
                                            <span className="text-xs text-slate-300 italic">[Logo de marque non défini]</span>
                                        )}
                                    </div>
                                );
                            case 'TITLE_CENTERED':
                                return (
                                    <div key={block.id} className="text-center max-w-3xl mx-auto py-4">
                                        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 uppercase tracking-tight">
                                            {block.title || "Titre d'accroche centré"}
                                        </h2>
                                    </div>
                                );
                            case 'TEXT_CENTERED':
                                return (
                                    <div key={block.id} className="text-center max-w-2xl mx-auto py-2">
                                        <div 
                                            className="text-slate-600 text-sm md:text-base leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: block.text || "<p className='italic text-slate-300'>Texte détaillé...</p>" }}
                                        />
                                    </div>
                                );
                            case 'IMAGE_FULL':
                                return (
                                    <div key={block.id} className="w-full aspect-[21/9] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                                        {block.image ? (
                                            <img src={block.image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xs text-slate-400 font-bold">Image pleine largeur manquante</span>
                                        )}
                                    </div>
                                );
                            case 'IMAGE_LEFT':
                                return (
                                    <div key={block.id} className={cn("grid grid-cols-1 md:grid-cols-2 gap-8 items-center p-6 md:p-8 rounded-3xl", isGrey ? "bg-slate-50" : "bg-white")}>
                                        <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-slate-200/80 flex items-center justify-center p-4">
                                            {block.image ? (
                                                <img src={block.image} alt="" className="w-full h-full object-contain" />
                                            ) : (
                                                <span className="text-xs text-slate-300">Image</span>
                                            )}
                                        </div>
                                        <div className="space-y-4">
                                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                                                {block.title || "Titre du bloc"}
                                            </h3>
                                            <div 
                                                className="text-slate-600 text-sm leading-relaxed"
                                                dangerouslySetInnerHTML={{ __html: block.text || "" }}
                                            />
                                        </div>
                                    </div>
                                );
                            case 'IMAGE_RIGHT':
                                return (
                                    <div key={block.id} className={cn("grid grid-cols-1 md:grid-cols-2 gap-8 items-center p-6 md:p-8 rounded-3xl", isGrey ? "bg-slate-50" : "bg-white")}>
                                        <div className="space-y-4 order-2 md:order-1">
                                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                                                {block.title || "Titre du bloc"}
                                            </h3>
                                            <div 
                                                className="text-slate-600 text-sm leading-relaxed"
                                                dangerouslySetInnerHTML={{ __html: block.text || "" }}
                                            />
                                        </div>
                                        <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-slate-200/80 flex items-center justify-center p-4 order-1 md:order-2">
                                            {block.image ? (
                                                <img src={block.image} alt="" className="w-full h-full object-contain" />
                                            ) : (
                                                <span className="text-xs text-slate-300">Image</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            case 'VIDEO_LEFT':
                            case 'VIDEO_RIGHT':
                                return (
                                    <div key={block.id} className="p-6 bg-slate-900 text-white rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                        <div className={block.type === 'VIDEO_RIGHT' ? 'order-2 md:order-1 space-y-4' : 'space-y-4'}>
                                            <h3 className="text-xl font-black text-white uppercase">{block.title || "Vidéo du produit"}</h3>
                                            <div dangerouslySetInnerHTML={{ __html: block.text || "" }} className="text-slate-300 text-sm" />
                                        </div>
                                        <div className={cn("aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center", block.type === 'VIDEO_RIGHT' ? 'order-1 md:order-2' : '')}>
                                            {block.video ? (
                                                <span className="text-xs text-slate-400">Lecteur Vidéo ({block.video})</span>
                                            ) : (
                                                <span className="text-xs text-slate-600">Aucune vidéo</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            default:
                                return null;
                        }
                    })}
                </div>
            ) : (
                /* EDITING BLOCKS LIST */
                <Reorder.Group axis="y" values={blocks} onReorder={setBlocks} className="space-y-5">
                    <AnimatePresence mode="popLayout">
                        {blocks.map((block, index) => {
                            const BlockIcon = getBlockIcon(block.type);
                            const isNew = newBlockId === block.id;
                            const isImageLeft = block.type === 'IMAGE_LEFT';
                            const isImageRight = block.type === 'IMAGE_RIGHT';
                            const isVideoLeft = block.type === 'VIDEO_LEFT';
                            const isVideoRight = block.type === 'VIDEO_RIGHT';
                            const isCentered = block.type === 'TITLE_CENTERED' || block.type === 'TEXT_CENTERED' || block.type === 'LOGO' || block.type === 'IMAGE_FULL';

                            return (
                                <Reorder.Item
                                    key={block.id}
                                    value={block}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                                    className={cn(
                                        "bg-white border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group relative",
                                        isNew
                                            ? "border-orange-400 ring-4 ring-orange-400/10 shadow-lg shadow-orange-500/10"
                                            : "border-slate-200"
                                    )}
                                >
                                    <div ref={(el) => { blockRefs.current[block.id] = el; }} />

                                    {/* Top Control Bar for the Card */}
                                    <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-100 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            {/* Drag handle */}
                                            <div 
                                                className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-600 p-1 -ml-1 transition-colors"
                                                title="Glisser pour réordonner"
                                            >
                                                <GripVertical size={16} />
                                            </div>

                                            {/* Block number */}
                                            <span className="w-6 h-6 rounded-md bg-slate-900 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                                                {index + 1}
                                            </span>

                                            {/* Block Type Badge */}
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg border border-slate-200 shadow-2xs">
                                                <BlockIcon size={13} className="text-orange-600" />
                                                <span className="text-[11px] font-bold text-slate-700">
                                                    {BLOCK_TYPE_LABELS[block.type] || block.type}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions: Move Up / Down, Duplicate, Delete */}
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                disabled={index === 0}
                                                onClick={() => moveBlock(index, 'up')}
                                                title="Monter d'un niveau"
                                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                            >
                                                <MoveUp size={14} />
                                            </button>
                                            <button
                                                type="button"
                                                disabled={index === blocks.length - 1}
                                                onClick={() => moveBlock(index, 'down')}
                                                title="Descendre d'un niveau"
                                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                            >
                                                <MoveDown size={14} />
                                            </button>
                                            <div className="w-px h-4 bg-slate-200 mx-1" />
                                            <button
                                                type="button"
                                                onClick={() => duplicateBlock(block.id)}
                                                title="Dupliquer ce bloc"
                                                className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                            >
                                                <Copy size={14} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeBlock(block.id)}
                                                title="Supprimer ce bloc"
                                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Content Body with WYSIWYG placement */}
                                    <div className="p-6">
                                        {/* 1. Centered Blocks */}
                                        {isCentered && (
                                            <div className="max-w-2xl mx-auto space-y-5">
                                                {block.type === 'LOGO' && (
                                                    <div className="flex flex-col items-center gap-3">
                                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                                            Logo de la Marque (Format vectoriel ou PNG transparent)
                                                        </label>
                                                        <div className="w-full max-w-xs h-28 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center p-3 relative group/img bg-slate-50">
                                                            {block.image ? (
                                                                <>
                                                                    <img src={block.image} alt="" className="max-h-full max-w-full object-contain" />
                                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center gap-2 transition-opacity rounded-2xl">
                                                                        <label className="p-2 bg-white text-slate-800 rounded-lg cursor-pointer hover:bg-orange-50 hover:text-orange-600 shadow-sm">
                                                                            <Upload size={14} />
                                                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(block.id, e)} />
                                                                        </label>
                                                                        <button type="button" onClick={() => updateBlock(block.id, { image: '' })} className="p-2 bg-white text-rose-600 rounded-lg shadow-sm">
                                                                            <X size={14} />
                                                                        </button>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <label className="flex flex-col items-center gap-1.5 cursor-pointer text-slate-400 hover:text-orange-600">
                                                                    {isUploading === block.id ? <Loader2 size={18} className="animate-spin text-orange-600" /> : <Upload size={18} />}
                                                                    <span className="text-[11px] font-bold">Sélectionner un logo</span>
                                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(block.id, e)} />
                                                                </label>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {block.type === 'TITLE_CENTERED' && (
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                                            Titre / Accroche Principale
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={block.title || ''}
                                                            onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                                                            placeholder="Ex: Une précision qui change tout"
                                                            className="w-full text-center px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[16px] text-slate-800 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500"
                                                        />
                                                    </div>
                                                )}

                                                {block.type === 'TEXT_CENTERED' && (
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                                            Paragraphe Centré
                                                        </label>
                                                        <RichTextEditor
                                                            defaultValue={block.text || ''}
                                                            onChange={(val) => updateBlock(block.id, { text: val })}
                                                            placeholder="Décrivez les fonctionnalités phares du produit..."
                                                        />
                                                    </div>
                                                )}

                                                {block.type === 'IMAGE_FULL' && (
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                                            Bannière Panoramique (Format 16:9 ou 21:9 recommandé)
                                                        </label>
                                                        <div className="aspect-[21/9] w-full border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center p-2 relative group/img bg-slate-50 overflow-hidden">
                                                            {block.image ? (
                                                                <>
                                                                    <img src={block.image} alt="" className="w-full h-full object-cover rounded-xl" />
                                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center gap-3 transition-opacity">
                                                                        <label className="px-3 py-2 bg-white text-slate-800 text-xs font-bold rounded-lg cursor-pointer hover:bg-orange-50 hover:text-orange-600 shadow-md flex items-center gap-1.5">
                                                                            <Upload size={14} />
                                                                            <span>Changer l'image</span>
                                                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(block.id, e)} />
                                                                        </label>
                                                                        <button type="button" onClick={() => updateBlock(block.id, { image: '' })} className="p-2 bg-white text-rose-600 rounded-lg shadow-md hover:bg-rose-50">
                                                                            <X size={16} />
                                                                        </button>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <label className="flex flex-col items-center gap-2 cursor-pointer text-slate-400 hover:text-orange-600 p-6 text-center">
                                                                    <div className="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center">
                                                                        {isUploading === block.id ? <Loader2 size={18} className="animate-spin text-orange-600" /> : <Upload size={18} />}
                                                                    </div>
                                                                    <span className="text-xs font-bold">Glissez une image large ou cliquez pour parcourir</span>
                                                                    <span className="text-[10px] text-slate-400">Résolution optimale : 1920 × 820 px</span>
                                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(block.id, e)} />
                                                                </label>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* 2. Side-by-Side Image + Text Blocks */}
                                        {(isImageLeft || isImageRight) && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                                {/* Image side */}
                                                <div className={cn("space-y-2", isImageRight && "order-1 md:order-2")}>
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                                            Illustration (Carrée ou 4:3)
                                                        </label>
                                                        {block.image && (
                                                            <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                                                                Image chargée
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="aspect-[4/3] w-full border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center p-3 relative group/img bg-slate-50 overflow-hidden">
                                                        {block.image ? (
                                                            <>
                                                                <img src={block.image} alt="" className="w-full h-full object-contain" />
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center gap-3 transition-opacity">
                                                                    <label className="px-3 py-2 bg-white text-slate-800 text-xs font-bold rounded-lg cursor-pointer hover:bg-orange-50 hover:text-orange-600 shadow-md flex items-center gap-1.5">
                                                                        <Upload size={14} />
                                                                        <span>Remplacer</span>
                                                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(block.id, e)} />
                                                                    </label>
                                                                    <button type="button" onClick={() => updateBlock(block.id, { image: '' })} className="p-2 bg-white text-rose-600 rounded-lg shadow-md hover:bg-rose-50">
                                                                        <X size={16} />
                                                                    </button>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <label className="flex flex-col items-center gap-2 cursor-pointer text-slate-400 hover:text-orange-600 p-4 text-center">
                                                                <div className="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center">
                                                                    {isUploading === block.id ? <Loader2 size={18} className="animate-spin text-orange-600" /> : <Upload size={18} />}
                                                                </div>
                                                                <span className="text-xs font-bold">Ajouter l'image</span>
                                                                <span className="text-[10px] text-slate-400">Recommandé : 800 × 600 px</span>
                                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(block.id, e)} />
                                                            </label>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Text side */}
                                                <div className={cn("space-y-4", isImageRight && "order-2 md:order-1")}>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                                            Titre / Accroche (Court)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={block.title || ''}
                                                            onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                                                            placeholder="Ex: Un corps compact révolutionnaire"
                                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[14px] text-slate-800 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500"
                                                        />
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                                            Paragraphe / Description (Détails)
                                                        </label>
                                                        <RichTextEditor
                                                            defaultValue={block.text || ''}
                                                            onChange={(val) => updateBlock(block.id, { text: val })}
                                                            placeholder="Détaillez les avantages techniques et les bénéfices d'usage..."
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* 3. Side-by-Side Video + Text Blocks */}
                                        {(isVideoLeft || isVideoRight) && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                                {/* Video player side */}
                                                <div className={cn("space-y-2", isVideoRight && "order-1 md:order-2")}>
                                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                                        Lien Vidéo (YouTube / Vimeo / MP4)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={block.video || ''}
                                                        onChange={(e) => updateBlock(block.id, { video: e.target.value })}
                                                        placeholder="https://www.youtube.com/watch?v=..."
                                                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono mb-2"
                                                    />
                                                    <div className="aspect-video w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex items-center justify-center relative">
                                                        {block.video ? (
                                                            (() => {
                                                                const url = block.video;
                                                                const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/);
                                                                if (ytMatch) {
                                                                    return (
                                                                        <iframe
                                                                            src={`https://www.youtube.com/embed/${ytMatch[1]}`}
                                                                            className="w-full h-full absolute inset-0"
                                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                            allowFullScreen
                                                                            title="Preview"
                                                                        />
                                                                    );
                                                                }
                                                                return (
                                                                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                                                                        <Play size={16} />
                                                                        <span>Vidéo prête ({url})</span>
                                                                    </div>
                                                                );
                                                            })()
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-1.5 text-slate-500">
                                                                <Play size={24} className="text-slate-600" />
                                                                <span className="text-[11px] font-bold">Collez une URL vidéo pour prévisualiser</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Text side */}
                                                <div className={cn("space-y-4", isVideoRight && "order-2 md:order-1")}>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                                            Titre / Accroche Vidéo
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={block.title || ''}
                                                            onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                                                            placeholder="Ex: Regardez le stabilisateur en action"
                                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[14px] text-slate-800"
                                                        />
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                                            Description Détaillée
                                                        </label>
                                                        <RichTextEditor
                                                            defaultValue={block.text || ''}
                                                            onChange={(val) => updateBlock(block.id, { text: val })}
                                                            placeholder="Commentez ce que la vidéo démontre..."
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Reorder.Item>
                            );
                        })}
                    </AnimatePresence>
                </Reorder.Group>
            )}

            {/* Empty State */}
            {blocks.length === 0 && (
                <div className="py-16 px-6 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl space-y-4">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-slate-100 text-slate-400">
                        <Sparkles size={24} className="text-orange-500" />
                    </div>
                    <div className="max-w-md mx-auto space-y-1">
                        <h4 className="text-base font-bold text-slate-800">Aucun bloc éditorial visuel ajouté</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Créez des présentations haut de gamme style Apple ou Logitech avec des alternances de visuels, accroches percutantes et vidéos immersives.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => addBlock('TITLE_CENTERED')}
                            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition-colors shadow-xs"
                        >
                            + Commencer par un titre centré
                        </button>
                        <button
                            type="button"
                            onClick={() => addBlock('IMAGE_LEFT')}
                            className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors shadow-2xs"
                        >
                            + Image Gauche + Texte
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
