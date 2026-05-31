'use client';

import React, { useState, useEffect } from 'react';
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
    Play
} from 'lucide-react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { uploadToCloudinaryAction } from '@/lib/actions/media-actions';

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
}

const BLOCK_TYPES = [
    { type: 'LOGO', label: 'Logo Centré', icon: Layout },
    { type: 'TITLE_CENTERED', label: 'Titre Centré', icon: AlignCenter },
    { type: 'TEXT_CENTERED', label: 'Texte Centré', icon: AlignCenter },
    { type: 'IMAGE_FULL', label: 'Image Large', icon: ImageIcon },
    { type: 'IMAGE_LEFT', label: 'Image Gauche + Texte', icon: AlignLeft },
    { type: 'IMAGE_RIGHT', label: 'Texte + Image Droite', icon: AlignRight },
    { type: 'VIDEO_LEFT', label: 'Vidéo Gauche + Texte', icon: Video },
    { type: 'VIDEO_RIGHT', label: 'Texte + Vidéo Droite', icon: Video },
];

export function ProductDescriptionBuilder({ initialData = [], onChange }: ProductDescriptionBuilderProps) {
    const [blocks, setBlocks] = useState<DescriptionBlock[]>([]);
    const [isUploading, setIsUploading] = useState<string | null>(null);

    useEffect(() => {
        if (Array.isArray(initialData)) {
            // Only sync if data actually changed from outside and is different from local state
            if (JSON.stringify(initialData) !== JSON.stringify(blocks)) {
                setBlocks(initialData);
            }
        }
    }, [initialData]);

    useEffect(() => {
        const timer = setTimeout(() => {
            onChange(blocks);
        }, 100);
        return () => clearTimeout(timer);
    }, [blocks, onChange]);

    const addBlock = (type: DescriptionBlock['type']) => {
        const newBlock: DescriptionBlock = {
            id: Math.random().toString(36).substring(2, 9),
            type,
            title: '',
            text: '',
            image: '',
            video: ''
        };
        setBlocks([...blocks, newBlock]);
    };

    const removeBlock = (id: string) => {
        setBlocks(blocks.filter(b => b.id !== id));
    };

    const updateBlock = (id: string, updates: Partial<DescriptionBlock>) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
    };

    const handleImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(id);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await uploadToCloudinaryAction(formData);
            if (res.success && res.media?.url) {
                updateBlock(id, { image: res.media.url });
            }
        } catch (err) {
            console.error("Upload error:", err);
        } finally {
            setIsUploading(null);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap gap-3 p-4 bg-white border border-slate-200 rounded-[24px] shadow-sm">
                {BLOCK_TYPES.map((bt) => (
                    <button
                        key={bt.type}
                        type="button"
                        onClick={() => addBlock(bt.type as any)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-orange-50 hover:text-orange-600 rounded-xl text-[12px] font-bold transition-all border border-slate-100 hover:border-orange-200"
                    >
                        <bt.icon size={16} />
                        {bt.label}
                    </button>
                ))}
            </div>

            <Reorder.Group axis="y" values={blocks} onReorder={setBlocks} className="space-y-6">
                <AnimatePresence mode="popLayout">
                    {blocks.map((block) => (
                        <Reorder.Item
                            key={block.id}
                            value={block}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative"
                        >
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <GripVertical size={20} />
                            </div>

                            <div className="pl-12 pr-6 py-6 flex flex-col gap-6">
                                <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                                            {block.type.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeBlock(block.id)}
                                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                    {/* Content based on type */}
                                    <div className={cn(
                                        "space-y-4",
                                        (block.type === 'TITLE_CENTERED' || block.type === 'TEXT_CENTERED' || block.type === 'LOGO' || block.type === 'IMAGE_FULL') && "md:col-span-2 max-w-2xl mx-auto w-full"
                                    )}>
                                        {(block.type === 'TITLE_CENTERED' || block.type === 'IMAGE_LEFT' || block.type === 'IMAGE_RIGHT' || block.type === 'VIDEO_LEFT' || block.type === 'VIDEO_RIGHT') && (
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Titre / Accroche (Court)</label>
                                                <input
                                                    type="text"
                                                    value={block.title}
                                                    onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                                                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all text-[15px] font-bold"
                                                    placeholder="Ex: Une précision qui change tout"
                                                />
                                            </div>
                                        )}

                                        {(block.type === 'TEXT_CENTERED' || block.type === 'IMAGE_LEFT' || block.type === 'IMAGE_RIGHT' || block.type === 'VIDEO_LEFT' || block.type === 'VIDEO_RIGHT') && (
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paragraphe / Description (Détails)</label>
                                                <textarea
                                                    value={block.text}
                                                    onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                                                    rows={4}
                                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all text-[14px] font-medium leading-relaxed"
                                                    placeholder="Écrivez le texte détaillé ici..."
                                                />
                                                <p className="text-[10px] text-slate-400 mt-1">
                                                    Astuce : Utilisez <b>&lt;b&gt;texte en gras&lt;/b&gt;</b> pour le gras et <b>&lt;br&gt;</b> pour un saut de ligne.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {(block.type.includes('IMAGE') || block.type === 'LOGO') && (
                                        <div className={cn(
                                            "space-y-4",
                                            block.type === 'IMAGE_FULL' && "md:col-span-2",
                                            block.type === 'LOGO' && "md:col-span-2 max-w-[200px] mx-auto"
                                        )}>
                                            <div className={cn(
                                                "relative bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden flex items-center justify-center min-h-[160px] group/img",
                                                block.type === 'IMAGE_FULL' && "aspect-[21/9]",
                                                (block.type === 'IMAGE_LEFT' || block.type === 'IMAGE_RIGHT') && "aspect-square"
                                            )}>
                                                {block.image ? (
                                                    <>
                                                        <img src={block.image} alt="" className="w-full h-full object-contain p-4" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center gap-3 transition-opacity">
                                                            <label className="p-3 bg-white text-slate-900 rounded-xl cursor-pointer hover:bg-orange-50 hover:text-orange-600 transition-colors">
                                                                <Upload size={20} />
                                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(block.id, e)} />
                                                            </label>
                                                            <button 
                                                                type="button"
                                                                onClick={() => updateBlock(block.id, { image: '' })}
                                                                className="p-3 bg-white text-rose-500 rounded-xl hover:bg-rose-50 transition-colors"
                                                            >
                                                                <X size={20} />
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-300">
                                                            {isUploading === block.id ? <Loader2 size={24} className="animate-spin text-orange-600" /> : <Upload size={24} />}
                                                        </div>
                                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-orange-600">
                                                            {isUploading === block.id ? "Envoi..." : "Ajouter Image"}
                                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(block.id, e)} />
                                                        </label>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {(block.type === 'VIDEO_LEFT' || block.type === 'VIDEO_RIGHT') && (
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">URL de la Vidéo (YouTube, Vimeo, MP4...)</label>
                                            <input
                                                type="text"
                                                value={block.video || ''}
                                                onChange={(e) => updateBlock(block.id, { video: e.target.value })}
                                                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all text-[13px] font-medium"
                                                placeholder="https://www.youtube.com/watch?v=... ou lien .mp4"
                                            />
                                            <div className={cn(
                                                "relative bg-slate-900 border-2 border-dashed border-slate-700 rounded-2xl overflow-hidden flex items-center justify-center min-h-[180px] aspect-video"
                                            )}>
                                                {block.video ? (
                                                    (() => {
                                                        const url = block.video;
                                                        // YouTube embed
                                                        const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/);
                                                        if (ytMatch) {
                                                            return (
                                                                <iframe
                                                                    src={`https://www.youtube.com/embed/${ytMatch[1]}`}
                                                                    className="w-full h-full absolute inset-0"
                                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                    allowFullScreen
                                                                    title="Video preview"
                                                                />
                                                            );
                                                        }
                                                        // Vimeo embed
                                                        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
                                                        if (vimeoMatch) {
                                                            return (
                                                                <iframe
                                                                    src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
                                                                    className="w-full h-full absolute inset-0"
                                                                    allow="autoplay; fullscreen; picture-in-picture"
                                                                    allowFullScreen
                                                                    title="Video preview"
                                                                />
                                                            );
                                                        }
                                                        // Direct video URL
                                                        return (
                                                            <video src={url} controls className="w-full h-full absolute inset-0 object-contain bg-black" />
                                                        );
                                                    })()
                                                ) : (
                                                    <div className="flex flex-col items-center gap-3 text-slate-500">
                                                        <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center">
                                                            <Play size={28} className="text-slate-400" />
                                                        </div>
                                                        <span className="text-[11px] font-bold uppercase tracking-widest">Collez un lien vidéo ci-dessus</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Reorder.Item>
                    ))}
                </AnimatePresence>
            </Reorder.Group>

            {blocks.length === 0 && (
                <div className="py-20 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px]">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                        <Layout size={40} className="text-slate-200" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Construisez votre description</h3>
                    <p className="text-slate-400 text-sm max-w-sm mx-auto mb-8">Ajoutez des blocs d'images et de texte pour créer une présentation premium style Logitech/Apple.</p>
                    <div className="flex justify-center gap-4">
                        <button
                            type="button"
                            onClick={() => addBlock('TITLE_CENTERED')}
                            className="px-6 py-3 bg-[#1B1F3B] text-white rounded-xl font-bold text-[13px] hover:bg-orange-600 transition-all shadow-lg shadow-orange-600/10"
                        >
                            Commencer
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
