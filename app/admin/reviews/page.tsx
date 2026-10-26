"use client";

import React, { useState, useEffect } from 'react';
import { getAdminReviews, deleteReviewAction, updateReportStatusAction, replyToReviewAction, deleteAdminReplyAction } from '@/lib/actions/review-actions';
import { toast } from 'sonner';
import { Star, Trash2, ShieldCheck, ShieldAlert, MessageSquareWarning, MessageSquareReply, Edit3, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/ui/Button';

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Reply Modal State
    const [activeReplyReview, setActiveReplyReview] = useState<any | null>(null);
    const [replyText, setReplyText] = useState('');
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);

    const loadReviews = async () => {
        setIsLoading(true);
        const res = await getAdminReviews(1, 50);
        if (res.success) {
            setReviews(res.data);
        } else {
            toast.error((res as any).message || "Erreur lors de la récupération des avis.");
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadReviews();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Voulez-vous vraiment supprimer cet avis ?")) return;
        const res = await deleteReviewAction(id);
        if (res.success) {
            toast.success("Avis supprimé");
            loadReviews();
        } else {
            toast.error("Erreur lors de la suppression");
        }
    };

    const handleUpdateReport = async (reportId: string, status: 'RESOLVED' | 'IGNORED') => {
        const res = await updateReportStatusAction(reportId, status);
        if (res.success) {
            toast.success("Statut mis à jour");
            loadReviews();
        } else {
            toast.error("Erreur de mise à jour");
        }
    };

    const handleOpenReplyModal = (review: any) => {
        setActiveReplyReview(review);
        setReplyText(review.adminReply || '');
    };

    const handleCloseReplyModal = () => {
        setActiveReplyReview(null);
        setReplyText('');
    };

    const handleSaveReply = async () => {
        if (!activeReplyReview) return;
        if (!replyText.trim()) {
            toast.error("Veuillez saisir votre réponse.");
            return;
        }

        setIsSubmittingReply(true);
        try {
            const res = await replyToReviewAction(activeReplyReview.id, replyText.trim(), activeReplyReview.productId);
            if (res.success) {
                toast.success(res.message || "Réponse officielle enregistrée !");
                handleCloseReplyModal();
                loadReviews();
            } else {
                toast.error(res.message || "Erreur lors de l'enregistrement de la réponse.");
            }
        } catch (e: any) {
            toast.error("Erreur inattendue.");
        } finally {
            setIsSubmittingReply(false);
        }
    };

    const handleDeleteReply = async (reviewId: string, productId: string) => {
        if (!confirm("Voulez-vous vraiment supprimer votre réponse officielle ?")) return;
        try {
            const res = await deleteAdminReplyAction(reviewId, productId);
            if (res.success) {
                toast.success("Réponse officielle supprimée.");
                if (activeReplyReview?.id === reviewId) {
                    handleCloseReplyModal();
                }
                loadReviews();
            } else {
                toast.error(res.message || "Erreur lors de la suppression.");
            }
        } catch (e: any) {
            toast.error("Erreur inattendue.");
        }
    };

    if (isLoading) return <div className="p-8 text-center">Chargement...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-[#1B1F3B] tracking-tight flex items-center gap-2">
                        <MessageSquareWarning className="w-6 h-6 text-orange-500" />
                        Modération des Avis
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Gérez les avis de vos clients et traitez les signalements.</p>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Avis</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Produit</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Auteur</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Signalements</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {reviews.map((review) => (
                                <tr key={review.id} className={`hover:bg-slate-50/50 transition-colors ${review.reports?.length > 0 ? 'bg-rose-50/20' : ''}`}>
                                    <td className="p-4 min-w-[250px]">
                                        <div className="flex items-center gap-1 mb-1">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star key={star} size={12} className={star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200"} />
                                            ))}
                                        </div>
                                        <p className="text-sm text-slate-700 font-medium line-clamp-2">{review.comment || <span className="italic text-slate-400">Aucun commentaire</span>}</p>

                                        {review.adminReply && (
                                            <div className="mt-2.5 p-2.5 bg-orange-50/80 border-l-2 border-primary rounded-r-xl text-xs">
                                                <div className="flex items-center justify-between gap-1 text-[10px] text-primary font-black uppercase tracking-wider mb-1">
                                                    <span className="flex items-center gap-1">
                                                        <ShieldCheck size={12} strokeWidth={2.5} />
                                                        Réponse Baraka Shop
                                                    </span>
                                                    {review.adminReplyAt && (
                                                        <span className="text-[9px] text-slate-400 font-normal">
                                                            {new Date(review.adminReplyAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-slate-700 italic font-medium line-clamp-3">
                                                    "{review.adminReply}"
                                                </p>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            {review.product.images?.[0] && (
                                                <img src={review.product.images[0]} alt="" className="w-8 h-8 rounded-lg object-cover" />
                                            )}
                                            <span className="text-sm font-bold text-[#1B1F3B] line-clamp-1">{review.product.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <p className="text-sm font-bold text-slate-700">{review.user.username}</p>
                                        <p className="text-[11px] text-slate-400">{review.user.email}</p>
                                    </td>
                                    <td className="p-4 text-center">
                                        {review.reports?.length > 0 ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="px-2.5 py-1 bg-rose-100 text-rose-700 text-[11px] font-bold rounded-full border border-rose-200 flex items-center gap-1">
                                                    <ShieldAlert size={12} />
                                                    {review.reports.length} Signalement(s)
                                                </span>
                                                <div className="flex flex-col gap-1 w-full max-w-[200px]">
                                                    {review.reports.map((report: any) => (
                                                        <div key={report.id} className="text-[10px] text-left bg-white p-2 rounded-lg border border-rose-100 shadow-sm relative">
                                                            <p className="font-bold text-rose-600 mb-0.5">{report.reason}</p>
                                                            {report.comment && <p className="text-slate-600 italic line-clamp-2">"{report.comment}"</p>}
                                                            <div className="mt-1 flex gap-1 justify-end">
                                                                {report.status === 'PENDING' ? (
                                                                    <>
                                                                        <button onClick={() => handleUpdateReport(report.id, 'RESOLVED')} className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold hover:bg-emerald-200">Résoudre</button>
                                                                        <button onClick={() => handleUpdateReport(report.id, 'IGNORED')} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold hover:bg-slate-200">Ignorer</button>
                                                                    </>
                                                                ) : (
                                                                    <span className={`text-[9px] font-bold ${report.status === 'RESOLVED' ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                                        {report.status === 'RESOLVED' ? 'Résolu' : 'Ignoré'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 text-xs">-</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                onClick={() => handleOpenReplyModal(review)}
                                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                    review.adminReply
                                                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/60'
                                                        : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                                                }`}
                                                title={review.adminReply ? "Modifier la réponse officielle" : "Répondre à cet avis"}
                                            >
                                                {review.adminReply ? (
                                                    <>
                                                        <Edit3 size={12} />
                                                        <span className="hidden sm:inline">Modifier</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <MessageSquareReply size={12} />
                                                        <span>Répondre</span>
                                                    </>
                                                )}
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(review.id)}
                                                className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors"
                                                title="Supprimer l'avis"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {reviews.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500 text-sm">
                                        Aucun avis pour le moment.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Réponse Officielle Admin */}
            {activeReplyReview && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-primary flex items-center justify-center shadow-xs">
                                    <MessageSquareReply size={20} />
                                </div>
                                <div>
                                    <h3 className="font-black text-[#1B1F3B] text-base">
                                        {activeReplyReview.adminReply ? "Modifier la réponse officielle" : "Répondre à l'avis client"}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Avis de <span className="font-bold text-slate-700">{activeReplyReview.user?.username || 'Client'}</span> sur <span className="font-bold text-slate-700">{activeReplyReview.product?.name}</span>
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleCloseReplyModal}
                                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Avis client résumé */}
                        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} size={11} className={s <= activeReplyReview.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200"} />
                                ))}
                                <span className="text-[10px] text-slate-400 ml-1 font-semibold">({activeReplyReview.rating}/5)</span>
                            </div>
                            <p className="text-slate-700 italic font-medium">
                                "{activeReplyReview.comment || "Aucun commentaire"}"
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-[#1B1F3B] uppercase tracking-wider flex items-center justify-between">
                                <span>Votre réponse officielle (Baraka Shop)</span>
                                <span className="text-[10px] text-slate-400 font-medium">{replyText.length}/2000</span>
                            </label>
                            <textarea
                                rows={4}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Remerciez le client, apportez des conseils ou répondez à ses questions en tant que Baraka Shop..."
                                maxLength={2000}
                                className="w-full text-xs sm:text-sm p-3 bg-white border border-slate-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none text-slate-800 placeholder:text-slate-400"
                                autoFocus
                            />
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            {activeReplyReview.adminReply ? (
                                <button
                                    type="button"
                                    onClick={() => handleDeleteReply(activeReplyReview.id, activeReplyReview.productId)}
                                    className="text-xs text-rose-600 hover:text-rose-700 font-bold hover:underline flex items-center gap-1"
                                >
                                    <Trash2 size={13} />
                                    Supprimer la réponse
                                </button>
                            ) : <span />}

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleCloseReplyModal}
                                    disabled={isSubmittingReply}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    disabled={isSubmittingReply || !replyText.trim()}
                                    onClick={handleSaveReply}
                                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-primary hover:bg-orange-600 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-primary/20 disabled:opacity-50 active:scale-95"
                                >
                                    {isSubmittingReply ? (
                                        <>
                                            <Loader2 size={13} className="animate-spin" />
                                            Enregistrement...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={13} />
                                            Publier la réponse
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
