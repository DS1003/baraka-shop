"use client";

import React, { useState, useEffect } from 'react';
import { getAdminReviews, deleteReviewAction, updateReportStatusAction } from '@/lib/actions/review-actions';
import { toast } from 'sonner';
import { Star, Trash2, ShieldCheck, ShieldAlert, MoreVertical, MessageSquareWarning } from 'lucide-react';
import { Button } from '@/ui/Button';

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadReviews = async () => {
        setIsLoading(true);
        const res = await getAdminReviews(1, 50);
        if (res.success) {
            setReviews(res.data);
        } else {
            toast.error(res.message);
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
                                        <button 
                                            onClick={() => handleDelete(review.id)}
                                            className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors ml-auto"
                                            title="Supprimer l'avis"
                                        >
                                            <Trash2 size={14} />
                                        </button>
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
        </div>
    );
}
