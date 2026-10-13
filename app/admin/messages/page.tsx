'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Mail,
    Search,
    RefreshCw,
    CheckCircle2,
    Clock,
    Archive,
    Trash2,
    Send,
    ExternalLink,
    Phone,
    User,
    Calendar,
    MessageSquare,
    AlertCircle,
    ChevronRight,
    CornerDownRight,
    Filter,
    Check,
    Copy,
    Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    getContactMessages,
    getContactStats,
    updateContactMessageStatus,
    saveContactMessageReplyNote,
    deleteContactMessage
} from '@/lib/actions/contact-actions';

interface ContactMessageItem {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    subject: string;
    message: string;
    status: 'UNREAD' | 'READ' | 'REPLIED' | 'ARCHIVED';
    replyNote?: string | null;
    createdAt: string | Date;
    updatedAt: string | Date;
}

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState<ContactMessageItem[]>([]);
    const [selectedMessage, setSelectedMessage] = useState<ContactMessageItem | null>(null);
    const [stats, setStats] = useState({ total: 0, unread: 0, read: 0, replied: 0, archived: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'ALL' | 'UNREAD' | 'READ' | 'REPLIED' | 'ARCHIVED'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [replyNoteText, setReplyNoteText] = useState('');
    const [isSavingNote, setIsSavingNote] = useState(false);

    const loadData = useCallback(async (silent = false) => {
        if (!silent) setIsLoading(true);
        else setIsRefreshing(true);

        try {
            const [msgRes, statsRes] = await Promise.all([
                getContactMessages({
                    status: activeTab,
                    search: searchQuery,
                    page: 1,
                    pageSize: 50,
                }),
                getContactStats(),
            ]);

            setMessages(msgRes.messages as ContactMessageItem[]);
            setStats(statsRes);

            // Keep selected message updated if still exists
            if (selectedMessage) {
                const updatedSelected = (msgRes.messages as ContactMessageItem[]).find(
                    (m) => m.id === selectedMessage.id
                );
                if (updatedSelected) {
                    setSelectedMessage(updatedSelected);
                    setReplyNoteText(updatedSelected.replyNote || '');
                }
            } else if (msgRes.messages.length > 0) {
                const first = msgRes.messages[0] as ContactMessageItem;
                setSelectedMessage(first);
                setReplyNoteText(first.replyNote || '');
            }
        } catch (error: any) {
            console.error('Erreur chargement messages:', error);
            toast.error('Impossible de charger les messages de contact.');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [activeTab, searchQuery, selectedMessage?.id]);

    useEffect(() => {
        loadData();
    }, [activeTab, searchQuery]);

    const handleSelectMessage = async (msg: ContactMessageItem) => {
        setSelectedMessage(msg);
        setReplyNoteText(msg.replyNote || '');

        // If unread, auto mark as READ
        if (msg.status === 'UNREAD') {
            try {
                await updateContactMessageStatus(msg.id, 'READ');
                setMessages(prev =>
                    prev.map(m => (m.id === msg.id ? { ...m, status: 'READ' } : m))
                );
                setStats(prev => ({
                    ...prev,
                    unread: Math.max(0, prev.unread - 1),
                    read: prev.read + 1,
                }));
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleStatusChange = async (status: 'UNREAD' | 'READ' | 'REPLIED' | 'ARCHIVED') => {
        if (!selectedMessage) return;
        try {
            await updateContactMessageStatus(selectedMessage.id, status);
            toast.success(`Statut mis à jour : ${status}`);
            setSelectedMessage(prev => prev ? { ...prev, status } : null);
            loadData(true);
        } catch (err) {
            toast.error('Erreur lors du changement de statut');
        }
    };

    const handleSaveReplyNote = async () => {
        if (!selectedMessage) return;
        setIsSavingNote(true);
        try {
            await saveContactMessageReplyNote(selectedMessage.id, replyNoteText.trim());
            toast.success('Note enregistrée et message marqué comme répondu');
            setSelectedMessage(prev => prev ? { ...prev, replyNote: replyNoteText.trim(), status: 'REPLIED' } : null);
            loadData(true);
        } catch (err) {
            toast.error('Erreur lors de la sauvegarde de la note');
        } finally {
            setIsSavingNote(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Voulez-vous vraiment supprimer définitivement ce message ?')) return;
        try {
            await deleteContactMessage(id);
            toast.success('Message supprimé');
            if (selectedMessage?.id === id) {
                setSelectedMessage(null);
            }
            loadData(true);
        } catch (err) {
            toast.error('Erreur lors de la suppression');
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copié dans le presse-papier !`);
    };

    return (
        <div className="space-y-8 pb-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-sm">
                            <Mail className="w-5 h-5" />
                        </div>
                        Boîte de Réception Contact
                        {stats.unread > 0 && (
                            <span className="text-xs bg-orange-500 text-white font-black px-2.5 py-1 rounded-full animate-pulse">
                                {stats.unread} nouveau{stats.unread > 1 ? 'x' : ''}
                            </span>
                        )}
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Consultez, traitez et répondez directement aux demandes envoyées depuis la boutique.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => loadData(true)}
                        disabled={isRefreshing}
                        className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
                    >
                        <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin text-orange-600")} />
                        Actualiser
                    </button>
                </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Reçus</span>
                        <div className="text-2xl font-black text-slate-900 mt-1">{stats.total}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                </div>

                <div className={cn(
                    "p-5 rounded-2xl border shadow-sm flex items-center justify-between transition-colors",
                    stats.unread > 0
                        ? "bg-orange-50/50 border-orange-200 text-orange-900"
                        : "bg-white border-slate-200/80 text-slate-900"
                )}>
                    <div>
                        <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">Non Lus</span>
                        <div className="text-2xl font-black text-orange-600 mt-1">{stats.unread}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Répondus</span>
                        <div className="text-2xl font-black text-emerald-600 mt-1">{stats.replied}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Archivés</span>
                        <div className="text-2xl font-black text-slate-600 mt-1">{stats.archived}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold">
                        <Archive className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Filter Tabs & Search */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                    {[
                        { id: 'ALL', label: 'Tous', count: stats.total },
                        { id: 'UNREAD', label: 'Non lus', count: stats.unread, highlight: true },
                        { id: 'READ', label: 'Lus', count: stats.read },
                        { id: 'REPLIED', label: 'Répondus', count: stats.replied },
                        { id: 'ARCHIVED', label: 'Archivés', count: stats.archived },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap",
                                activeTab === tab.id
                                    ? "bg-slate-900 text-white shadow-sm"
                                    : "text-slate-600 hover:bg-slate-100"
                            )}
                        >
                            {tab.label}
                            <span className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                                activeTab === tab.id
                                    ? "bg-white/20 text-white"
                                    : tab.highlight && tab.count > 0
                                        ? "bg-orange-100 text-orange-700"
                                        : "bg-slate-100 text-slate-500"
                            )}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Rechercher nom, email, sujet..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 text-xs rounded-xl font-medium outline-none focus:bg-white focus:border-orange-500 transition-all"
                    />
                </div>
            </div>

            {/* Main Master-Detail Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start min-h-[600px]">
                {/* Left Column: Messages List */}
                <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col h-[680px]">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs font-bold text-slate-500">
                        <span>Messages ({messages.length})</span>
                        <span className="text-[10px] text-slate-400">Classés par plus récents</span>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                        {isLoading ? (
                            <div className="p-12 text-center text-slate-400 text-xs">
                                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-orange-500" />
                                Chargement des messages...
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <p className="text-xs font-bold text-slate-700">Aucun message trouvé</p>
                                <p className="text-[11px] text-slate-400 mt-1">Modifiez vos filtres ou effectuez une autre recherche.</p>
                            </div>
                        ) : (
                            messages.map((item) => {
                                const isSelected = selectedMessage?.id === item.id;
                                const isUnread = item.status === 'UNREAD';
                                const dateFormatted = new Date(item.createdAt).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                });

                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => handleSelectMessage(item)}
                                        className={cn(
                                            "p-4 transition-all cursor-pointer relative group",
                                            isSelected
                                                ? "bg-orange-50/60 border-l-4 border-orange-500"
                                                : isUnread
                                                    ? "bg-slate-50/70 hover:bg-slate-100/70"
                                                    : "hover:bg-slate-50"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-1.5">
                                            <div className="flex items-center gap-2">
                                                {isUnread && (
                                                    <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0 animate-pulse" />
                                                )}
                                                <span className={cn(
                                                    "text-xs truncate max-w-[160px]",
                                                    isUnread ? "font-black text-slate-900" : "font-bold text-slate-700"
                                                )}>
                                                    {item.name}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                                                {dateFormatted}
                                            </span>
                                        </div>

                                        <p className={cn(
                                            "text-xs line-clamp-1 mb-1",
                                            isUnread ? "font-bold text-slate-900" : "font-medium text-slate-600"
                                        )}>
                                            {item.subject}
                                        </p>

                                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                                            {item.message}
                                        </p>

                                        <div className="mt-2.5 flex items-center justify-between">
                                            <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                                                {item.email}
                                            </span>

                                            <span className={cn(
                                                "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full",
                                                item.status === 'UNREAD' && "bg-orange-100 text-orange-700",
                                                item.status === 'READ' && "bg-slate-100 text-slate-600",
                                                item.status === 'REPLIED' && "bg-emerald-100 text-emerald-700",
                                                item.status === 'ARCHIVED' && "bg-slate-100 text-slate-500"
                                            )}>
                                                {item.status === 'UNREAD' ? 'Non lu' :
                                                 item.status === 'READ' ? 'Lu' :
                                                 item.status === 'REPLIED' ? 'Répondu' : 'Archivé'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right Column: Message Detail & Response Actions */}
                <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col h-[680px]">
                    {selectedMessage ? (
                        <div className="flex flex-col h-full overflow-hidden">
                            {/* Message Header */}
                            <div className="p-6 border-b border-slate-100 bg-slate-50/40">
                                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-[#1B1F3B] text-white flex items-center justify-center font-black text-base shadow-sm">
                                            {selectedMessage.name.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <h2 className="text-base font-black text-slate-900">
                                                {selectedMessage.name}
                                            </h2>
                                            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                                                <span className="font-medium">{selectedMessage.email}</span>
                                                <button
                                                    onClick={() => copyToClipboard(selectedMessage.email, 'Email')}
                                                    className="p-1 hover:text-orange-600 transition-colors"
                                                    title="Copier l'email"
                                                >
                                                    <Copy className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action dropdown or quick statuses */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleStatusChange(selectedMessage.status === 'UNREAD' ? 'READ' : 'UNREAD')}
                                            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                                        >
                                            {selectedMessage.status === 'UNREAD' ? 'Marquer comme lu' : 'Marquer non lu'}
                                        </button>

                                        <button
                                            onClick={() => handleStatusChange(selectedMessage.status === 'ARCHIVED' ? 'READ' : 'ARCHIVED')}
                                            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-colors"
                                            title={selectedMessage.status === 'ARCHIVED' ? 'Désarchiver' : 'Archiver'}
                                        >
                                            <Archive className="w-4 h-4" />
                                        </button>

                                        <button
                                            onClick={() => handleDelete(selectedMessage.id)}
                                            className="p-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-xl transition-colors"
                                            title="Supprimer définitivement"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Subject & Metadata Bar */}
                                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/60">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-700 px-2.5 py-1 rounded-lg">
                                            {selectedMessage.subject}
                                        </span>
                                        {selectedMessage.phone && (
                                            <a
                                                href={`tel:${selectedMessage.phone}`}
                                                className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-orange-600 transition-colors bg-white px-2.5 py-1 rounded-lg border border-slate-200"
                                            >
                                                <Phone className="w-3 h-3 text-orange-500" />
                                                {selectedMessage.phone}
                                            </a>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>
                                            {new Date(selectedMessage.createdAt).toLocaleString('fr-FR', {
                                                dateStyle: 'full',
                                                timeStyle: 'short',
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Message Body Content */}
                            <div className="flex-1 p-6 overflow-y-auto space-y-6">
                                <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/80">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                                        Message du client :
                                    </span>
                                    <div className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                        {selectedMessage.message}
                                    </div>
                                </div>

                                {/* Quick Reply Direct Buttons */}
                                <div className="space-y-3">
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                                        Répondre au client :
                                    </span>
                                    <div className="flex flex-wrap gap-3">
                                        <a
                                            href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(`Re: [Baraka Shop] ${selectedMessage.subject}`)}`}
                                            className="px-5 py-3 bg-[#1B1F3B] hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
                                        >
                                            <Send className="w-3.5 h-3.5 text-orange-400" />
                                            Envoyer un email ({selectedMessage.email})
                                        </a>

                                        {selectedMessage.phone && (
                                            <a
                                                href={`https://wa.me/${selectedMessage.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour ${selectedMessage.name}, suite à votre message sur Baraka Shop concernant : ${selectedMessage.subject}...`)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
                                            >
                                                <MessageSquare className="w-3.5 h-3.5" />
                                                Répondre sur WhatsApp ({selectedMessage.phone})
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Admin Internal Note / Follow-up */}
                                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                            <CornerDownRight className="w-3.5 h-3.5 text-orange-500" />
                                            Note interne de suivi (Équipe Admin)
                                        </span>
                                        {selectedMessage.replyNote && (
                                            <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full">
                                                Réponse traitée
                                            </span>
                                        )}
                                    </div>

                                    <textarea
                                        rows={3}
                                        placeholder="Ex: Client rappelé au téléphone, devis envoyé par email, dossier résolu..."
                                        value={replyNoteText}
                                        onChange={(e) => setReplyNoteText(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 p-3.5 text-xs rounded-xl font-medium outline-none focus:bg-white focus:border-orange-500 transition-all resize-none"
                                    />

                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleSaveReplyNote}
                                            disabled={isSavingNote || !replyNoteText.trim()}
                                            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isSavingNote ? (
                                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <Check className="w-3.5 h-3.5" />
                                            )}
                                            Enregistrer la note
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-16 text-center m-auto">
                            <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-8 h-8" />
                            </div>
                            <h3 className="text-sm font-black text-slate-800">Aucun message sélectionné</h3>
                            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                                Sélectionnez un message dans la colonne de gauche pour lire son contenu, répondre par email ou WhatsApp, et ajouter des notes internes.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
