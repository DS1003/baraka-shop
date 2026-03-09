'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Upload,
    FileSpreadsheet,
    X,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Database,
    Zap,
    Download,
    Box,
    FileText,
    ArrowRight,
    Search,
    Trash2,
    Check,
    RefreshCw,
    ShoppingCart,
    Shuffle,
    Layers,
    Table as TableIcon,
    Settings2,
    Tag,
    Plus,
    Pause
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { cn } from '@/lib/utils';
import { importProductsAction } from '@/lib/actions/product-actions';
import { saveToJsonAndStartImport } from '@/lib/actions/import-bg-actions';

interface ParsedProduct {
    id: string;
    name: string;
    category: string;
    subcategory1?: string;
    subcategory2?: string;
    brand?: string;
    price: number;
    stock: number;
    description: string;
    images?: string;
    customFields?: Record<string, any>;
}

type MappingState = Record<string, string>; // TargetField -> ExcelHeader

const TARGET_FIELDS = [
    { id: 'name', label: 'Nom / Désignation', required: true, icon: Box },
    { id: 'price', label: 'Prix de vente', required: true, icon: Tag },
    { id: 'stock', label: 'Stock Total', required: true, icon: Database },
    { id: 'category', label: 'Catégorie (Niveau 1)', required: false, icon: Layers },
    { id: 'subcategory1', label: 'Sous-Catégorie 1 (Niveau 2)', required: false, icon: Layers },
    { id: 'subcategory2', label: 'Sous-Catégorie 2 (Niveau 3)', required: false, icon: Layers },
    { id: 'brand', label: 'Marque', required: false, icon: CheckCircle2 },
    { id: 'description', label: 'Description', required: false, icon: FileText },
    { id: 'images', label: 'Images URL', required: false, icon: FileSpreadsheet },
];

export default function ImportProductsPage() {
    const [file, setFile] = useState<File | null>(null);
    const [rawJson, setRawJson] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [mapping, setMapping] = useState<MappingState>({});
    const [customColumns, setCustomColumns] = useState<string[]>([]); // Headers to import as custom metadata

    const [data, setData] = useState<ParsedProduct[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const [isParsing, setIsParsing] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importProgress, setImportProgress] = useState(0);
    const [processedCount, setProcessedCount] = useState(0);

    const [step, setStep] = useState(1); // 1: Upload, 2: Mapping, 3: Review, 4: Progress, 5: Success
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isPaused, setIsPaused] = useState(false);
    const [isCancelled, setIsCancelled] = useState(false);
    const lastIndexRef = useRef(0);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const filteredData = useMemo(() => {
        return data
            .filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.category.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .slice(0, 100); // Only preview first 100 to keep UI fast
    }, [data, searchTerm]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError(null);
            parseExcelHeaders(selectedFile);
        }
    };

    const parseExcelHeaders = (file: File) => {
        setIsParsing(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const ab = e.target?.result;
                const wb = XLSX.read(ab, { type: 'array' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const json = XLSX.utils.sheet_to_json(ws) as any[];

                if (!json || json.length === 0) {
                    setError("Le fichier est vide.");
                    setIsParsing(false);
                    return;
                }

                const firstRow = json[0];
                const foundHeaders = Object.keys(firstRow);
                setHeaders(foundHeaders);
                setRawJson(json);

                // Auto-mapping attempt
                const initialMapping: MappingState = {};
                TARGET_FIELDS.forEach(field => {
                    const match = foundHeaders.find(h => {
                        const hNorm = h.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                        const fNorm = field.id.toLowerCase();
                        const fLabel = field.label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                        // Heuristics
                        if (hNorm.includes(fNorm)) return true;
                        if (hNorm.includes('design') && field.id === 'name') return true;
                        if (hNorm.includes('prix') && field.id === 'price') return true;
                        if (hNorm.includes('stock') && field.id === 'stock') return true;
                        if (hNorm.includes('niveau 1') && field.id === 'category') return true;
                        if (hNorm.includes('niveau 2') && field.id === 'subcategory1') return true;
                        if (hNorm.includes('niveau 3') && field.id === 'subcategory2') return true;
                        return false;
                    });
                    if (match) initialMapping[field.id] = match;
                });

                setMapping(initialMapping);
                setTimeout(() => {
                    setStep(2);
                    setIsParsing(false);
                }, 800);
            } catch (err) {
                setError("Erreur de lecture.");
                setIsParsing(false);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const applyMapping = () => {
        // Validation: Required fields check
        const missing = TARGET_FIELDS.filter(f => f.required && !mapping[f.id]);
        if (missing.length > 0) {
            setError(`Champs requis manquants: ${missing.map(m => m.label).join(', ')}`);
            return;
        }

        const mappedData: ParsedProduct[] = rawJson.map((row, idx) => {
            const getVal = (fieldId: string) => {
                const header = mapping[fieldId];
                return header ? row[header] : undefined;
            };

            const price = parseFloat(String(getVal('price') || 0).replace(/[^\d.]/g, ''));
            const stock = parseInt(String(getVal('stock') || 0).replace(/[^\d]/g, ''));

            // Build custom fields from selected custom columns
            const custom: Record<string, any> = {};
            customColumns.forEach(h => {
                custom[h] = row[h];
            });

            return {
                id: `temp-${idx}-${Date.now()}`,
                name: String(getVal('name') || ''),
                category: String(getVal('category') || 'Général'),
                subcategory1: getVal('subcategory1') ? String(getVal('subcategory1')) : undefined,
                subcategory2: getVal('subcategory2') ? String(getVal('subcategory2')) : undefined,
                brand: getVal('brand') ? String(getVal('brand')) : undefined,
                price: isNaN(price) ? 0 : price,
                stock: isNaN(stock) ? 0 : stock,
                description: String(getVal('description') || ''),
                images: getVal('images') ? String(getVal('images')) : undefined,
                customFields: custom
            };
        }).filter(p => p.name.trim() !== '');

        setData(mappedData);
        setStep(3);
        setError(null);
    };

    const handleMappingChange = (targetId: string, header: string) => {
        setMapping(prev => {
            const next = { ...prev };
            if (header === '') delete next[targetId];
            else next[targetId] = header;
            return next;
        });
    };

    const toggleCustomColumn = (header: string) => {
        setCustomColumns(prev => {
            if (prev.includes(header)) return prev.filter(h => h !== header);
            return [...prev, header];
        });
    };

    const deleteSelected = () => {
        setData(prev => prev.filter(p => !selectedIds.has(p.id)));
        setSelectedIds(new Set());
    };

    const startImport = async () => {
        if (data.length === 0) return;

        setIsImporting(true);
        setError(null);

        try {
            // Nouveau flux: Sauvegarde JSON + Job Arrière-plan
            const result = await saveToJsonAndStartImport(data);

            if (result.success) {
                setStep(5); // Affiche l'écran de confirmation du lancement
            } else {
                setError(result.error || "Impossible de démarrer l'importation.");
            }
        } catch (err: any) {
            setError(err.message || "L'initialisation a échoué.");
        } finally {
            setIsImporting(false);
        }
    };

    // Helper pour exposer le contrôle aux fonctions asynchrones
    useEffect(() => {
        (window as any).importControl = { paused: isPaused, cancelled: isCancelled };
    }, [isPaused, isCancelled]);

    const stopImport = () => {
        if (confirm("Voulez-vous vraiment arrêter l'importation ? Les produits déjà importés resteront en base.")) {
            setIsCancelled(true);
            lastIndexRef.current = -1;
            setStep(3);
        }
    };

    const reset = () => {
        setFile(null);
        setRawJson([]);
        setHeaders([]);
        setMapping({});
        setCustomColumns([]);
        setData([]);
        setStep(1);
        setError(null);
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-12 pb-32" suppressHydrationWarning>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4 border-b border-slate-200/40">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/products"
                            className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-orange-600 hover:shadow-xl transition-all active:scale-95 group"
                        >
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/admin/products/import/history"
                            className="px-6 py-3 bg-slate-100 text-[#1B1F3B] rounded-xl font-black text-[12px] uppercase tracking-widest hover:bg-[#1B1F3B] hover:text-white transition-all shadow-sm border border-slate-200/50 flex items-center gap-3"
                        >
                            <RefreshCw size={16} />
                            <span>Voir Logs Injection</span>
                        </Link>
                    </div>
                    <div className="space-y-1.5">
                        <h1 className="text-[36px] font-bold text-slate-900 tracking-tight leading-tight">
                            Smart <span className="text-orange-600">Importer.</span>
                        </h1>
                        <p className="text-[15px] text-slate-500 font-medium">Mapping intelligent et injection sécurisée de votre catalogue.</p>
                    </div>
                </div>
            </div>

            {/* Steps Container */}
            <div className="grid grid-cols-4 gap-6">
                <StepIndicator s={1} active={step === 1} done={step > 1} label="FICHIER" sub="Upload Source" icon={Upload} />
                <StepIndicator s={2} active={step === 2} done={step > 2} label="MAPPING" sub="Liaison Colonnes" icon={Shuffle} />
                <StepIndicator s={3} active={step === 3} done={step > 3} label="VALIDE" sub="Aperçu & Edit" icon={Search} />
                <StepIndicator s={5} active={step === 5} done={false} label="SYNC" sub="Injection DB" icon={Database} />
            </div>

            <AnimatePresence mode="wait">
                {/* Stage 1: Upload */}
                {step === 1 && (
                    <motion.div
                        key="stage1"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white border-2 border-dashed border-slate-200 rounded-[40px] p-24 text-center cursor-pointer hover:border-orange-500/30 transition-all relative group"
                        onClick={() => !isParsing && fileInputRef.current?.click()}
                    >
                        <div className="w-24 h-24 bg-orange-50 rounded-[32px] flex items-center justify-center mx-auto mb-10 border-2 border-orange-100 shadow-xl shadow-orange-500/5 group-hover:scale-110 group-hover:rotate-3 transition-all">
                            {isParsing ? <RefreshCw className="text-orange-600 animate-spin" size={36} /> : <FileSpreadsheet size={36} className="text-orange-600" />}
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-4">{isParsing ? 'Lecture du fichier...' : 'Déposez votre catalogue'}</h2>
                        <p className="text-slate-400 font-bold text-[14px] uppercase tracking-[0.2em] mb-12">Excel ou CSV supportés pour l'analyse structurelle</p>

                        <div className="inline-flex items-center gap-4 px-10 py-5 bg-[#0F172A] text-white rounded-[20px] font-black text-[13px] uppercase tracking-widest hover:bg-orange-600 transition-all shadow-2xl">
                            <Zap size={18} fill="#fff" />
                            <span>Sélectionner le fichier</span>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".xlsx,.xls,.csv" />
                    </motion.div>
                )}

                {/* Stage 2: Mapping (ADVANCED) */}
                {step === 2 && (
                    <motion.div
                        key="stage2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-10"
                    >
                        <div className="bg-white rounded-[40px] border border-slate-200 p-12 shadow-xl shadow-slate-200/40 relative overflow-hidden">
                            <div className="flex items-center justify-between mb-12">
                                <div>
                                    <h2 className="text-[28px] font-black text-slate-900 tracking-tight">Mapping des Colonnes</h2>
                                    <p className="text-slate-400 font-medium">Liez les entêtes de votre fichier Excel aux champs de Baraka Shop.</p>
                                </div>
                                <div className="p-4 bg-orange-50 rounded-2xl flex items-center gap-4 border border-orange-100">
                                    <TableIcon className="text-orange-600" size={24} />
                                    <div>
                                        <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest leading-none mb-1">DÉTECTION</p>
                                        <p className="text-[14px] font-bold text-slate-700">{headers.length} Colonnes trouvées</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-8">
                                {TARGET_FIELDS.map((field) => (
                                    <div key={field.id} className="flex items-center gap-8 group">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-focus-within:bg-orange-600 group-focus-within:text-white transition-all shadow-sm">
                                            <field.icon size={24} />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <label className="flex items-center gap-2 text-[12px] font-black text-slate-500 uppercase tracking-widest">
                                                {field.label}
                                                {field.required && <span className="text-rose-500">*</span>}
                                            </label>
                                            <select
                                                value={mapping[field.id] || ''}
                                                onChange={(e) => handleMappingChange(field.id, e.target.value)}
                                                className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl px-6 py-4 text-[15px] font-bold text-slate-900 outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="">-- Ignorer ce champ --</option>
                                                {headers.map(h => (
                                                    <option key={h} value={h}>{h}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-16 pt-12 border-t border-slate-100">
                                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                    <Plus className="text-orange-600" size={20} />
                                    Colonnes Personnalisées (Metadata)
                                </h3>
                                <p className="text-[14px] text-slate-400 mb-8">Sélectionnez les colonnes additionnelles à importer en tant qu'attributs spécifiques.</p>
                                <div className="flex flex-wrap gap-4">
                                    {headers.filter(h => !Object.values(mapping).includes(h)).map(h => (
                                        <button
                                            key={h}
                                            onClick={() => toggleCustomColumn(h)}
                                            className={cn(
                                                "px-6 py-3 rounded-xl font-bold text-[13px] transition-all border-2",
                                                customColumns.includes(h)
                                                    ? "bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-200"
                                                    : "bg-white border-slate-100 text-slate-500 hover:border-slate-300"
                                            )}
                                        >
                                            {h}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center bg-[#0F172A] p-8 rounded-[32px] shadow-2xl">
                            <button onClick={reset} className="text-slate-400 font-bold hover:text-white transition-all text-[13px] uppercase tracking-widest">Réinitialiser</button>
                            <button
                                onClick={applyMapping}
                                className="px-12 py-5 bg-orange-600 text-white rounded-[20px] font-black text-[13px] uppercase tracking-[0.2em] shadow-xl shadow-orange-500/20 hover:bg-orange-700 active:scale-95 transition-all flex items-center gap-4"
                            >
                                <span>Continuer vers la Revue</span>
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Stage 3: Review */}
                {step === 3 && (
                    <motion.div
                        key="stage3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-10"
                    >
                        {/* Control Bar */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="relative flex-1 max-w-md group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Rechercher dans l'aperçu..."
                                    className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-[14px] font-medium focus:ring-4 focus:ring-orange-500/5 transition-all shadow-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            {selectedIds.size > 0 && (
                                <button onClick={deleteSelected} className="flex items-center gap-2 px-6 py-3 bg-rose-50 text-rose-600 rounded-xl font-bold text-[13px] hover:bg-rose-100">
                                    <Trash2 size={16} /> Supprimer ({selectedIds.size})
                                </button>
                            )}
                        </div>

                        <div className="bg-white rounded-[40px] border border-slate-200 shadow-2xl overflow-hidden">
                            <div className="overflow-x-auto max-h-[600px]">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/80 sticky top-0 z-20 backdrop-blur-md border-b border-slate-100">
                                        <tr>
                                            <th className="pl-10 pr-4 py-6 w-10">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.size === filteredData.length && filteredData.length > 0}
                                                    onChange={() => {
                                                        if (selectedIds.size === filteredData.length) setSelectedIds(new Set());
                                                        else setSelectedIds(new Set(filteredData.map(p => p.id)));
                                                    }}
                                                    className="w-5 h-5 rounded-lg border-2 border-slate-200 text-orange-600 focus:ring-orange-500 cursor-pointer"
                                                />
                                            </th>
                                            {['PRODUIT', 'CATÉGORIES (1, 2, 3)', 'PRIX', 'STOCK', 'CUSTOM'].map((h) => (
                                                <th key={h} className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredData.map((prod) => (
                                            <tr key={prod.id} className={cn("hover:bg-slate-50/40 transition-colors group", selectedIds.has(prod.id) && "bg-orange-50/30")}>
                                                <td className="pl-10 pr-4 py-6">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.has(prod.id)}
                                                        onChange={() => {
                                                            const next = new Set(selectedIds);
                                                            if (next.has(prod.id)) next.delete(prod.id);
                                                            else next.add(prod.id);
                                                            setSelectedIds(next);
                                                        }}
                                                        className="w-5 h-5 rounded-lg border-2 border-slate-200 text-orange-600 focus:ring-orange-500 cursor-pointer"
                                                    />
                                                </td>
                                                <td className="px-6 py-6">
                                                    <p className="text-[15px] font-bold text-slate-900 mb-1">{prod.name}</p>
                                                    <p className="text-[12px] text-slate-400 line-clamp-1 italic">{prod.description}</p>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="flex flex-col gap-1.5">
                                                        <span className="inline-flex px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-[10px] font-black uppercase w-fit">{prod.category}</span>
                                                        {prod.subcategory1 && <span className="inline-flex px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase w-fit">{prod.subcategory1}</span>}
                                                        {prod.subcategory2 && <span className="inline-flex px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase w-fit">{prod.subcategory2}</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 font-black text-slate-900 tabular-nums text-[14px]">
                                                    {prod.price.toLocaleString()} F
                                                </td>
                                                <td className="px-6 py-6 font-black text-emerald-600 tabular-nums text-[14px]">
                                                    {prod.stock}
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="flex flex-wrap gap-2">
                                                        {Object.entries(prod.customFields || {}).map(([k, v]) => (
                                                            <div key={k} className="p-2 bg-slate-100 rounded-lg text-[9px] font-bold text-slate-500">
                                                                <span className="text-slate-400 uppercase mr-1">{k}:</span> {String(v)}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex justify-between items-center bg-[#0F172A] p-10 rounded-[40px] shadow-3xl">
                            <div className="flex gap-12">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">PRODUITS PRÊTS</p>
                                    <h4 className="text-white text-2xl font-black">{data.length}</h4>
                                </div>
                                <div className="w-px h-full bg-white/10" />
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">VALEUR ESTIMEÉ</p>
                                    <h4 className="text-orange-400 text-2xl font-black">{data.reduce((acc, p) => acc + (p.price * p.stock), 0).toLocaleString()} F</h4>
                                </div>
                            </div>
                            <button onClick={startImport} className="px-16 py-6 bg-orange-600 text-white rounded-[24px] font-black text-[14px] uppercase tracking-[0.3em] hover:bg-orange-700 shadow-2xl shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-4">
                                <Plus size={24} strokeWidth={3} /> Lancer l'Injection
                            </button>
                        </div>
                    </motion.div>
                )}


                {step === 5 && (
                    <motion.div key="stage5" className="text-center p-24 bg-[#0F172A] rounded-[48px] shadow-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-24 opacity-5 pointer-events-none rotate-12"><Warehouse size={300} /></div>
                        <div className="w-32 h-32 bg-orange-500/20 rounded-[40px] border border-orange-500/30 flex items-center justify-center mx-auto mb-12 shadow-[0_0_80px_rgba(249,115,22,0.3)]">
                            <CheckCircle2 size={64} className="text-orange-400" />
                        </div>
                        <h2 className="text-[48px] font-black text-white mb-6 tracking-tighter">Importation lancée.</h2>
                        <p className="text-slate-400 text-lg max-w-lg mx-auto mb-16">
                            Les {data.length} produits sont en cours d'injection sécurisée.
                            Le processus tourne en arrière-plan, vous recevrez une notification une fois terminé.
                            Une copie locale JSON a été créée pour optimiser les performances immédiates.
                        </p>
                        <div className="flex justify-center gap-8">
                            <Link href="/admin/products" className="px-12 py-5 bg-white text-slate-900 rounded-2xl font-black text-[14px] uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all shadow-xl">Voir le Catalogue</Link>
                            <button onClick={reset} className="px-12 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[14px] uppercase tracking-widest hover:bg-white/10 transition-all">Nouvel Import</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {error && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 p-5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-4 text-rose-600 font-black text-[13px] shadow-2xl shadow-rose-200/50 animate-bounce">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}

function StepIndicator({ active, done, label, sub, icon: Icon }: any) {
    return (
        <div className="flex flex-col items-center gap-4">
            <div className={cn(
                "w-12 h-12 rounded-[18px] flex items-center justify-center transition-all duration-700 border-2",
                active ? "bg-orange-600 border-orange-200 text-white shadow-xl scale-125 -rotate-3" : done ? "bg-orange-600 border-orange-500 text-white" : "bg-white border-slate-100 text-slate-300"
            )}>
                {done ? <Check size={24} strokeWidth={3} /> : <Icon size={24} strokeWidth={2.5} />}
            </div>
            <div className="text-center">
                <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1", active ? "text-orange-600" : "text-slate-300")}>{label}</p>
                <p className={cn("text-[12px] font-bold", active ? "text-slate-900" : "text-slate-400")}>{sub}</p>
            </div>
        </div>
    );
}

function Warehouse(props: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M22 22H2V8l10-6 10 6v14Z" />
            <path d="M6 22V10" />
            <path d="M14 22V10" />
            <path d="M18 22V10" />
            <path d="M2 17h20" />
        </svg>
    );
}
