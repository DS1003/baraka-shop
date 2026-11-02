'use client';

import React, { useState } from 'react';
import { submitCompensationModificationRequestAction } from '@/lib/actions/collaborator-actions';
import { toast } from 'sonner';
import { Send, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function ModificationRequestForm({
  currentSalary,
  currentRate,
}: {
  currentSalary: number;
  currentRate: number;
}) {
  const router = useRouter();
  const [requestedSalary, setRequestedSalary] = useState<number | ''>(currentSalary);
  const [requestedRate, setRequestedRate] = useState<number | ''>(currentRate);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Veuillez préciser le motif de votre demande');
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitCompensationModificationRequestAction({
        requestedSalary: requestedSalary !== '' ? Number(requestedSalary) : undefined,
        requestedRate: requestedRate !== '' ? Number(requestedRate) : undefined,
        reason: reason.trim(),
      });

      if (res.success) {
        toast.success(res.message || 'Demande transmise avec succès !');
        setReason('');
        router.refresh();
      } else {
        toast.error(res.error || 'Erreur lors de la soumission');
      }
    } catch (err) {
      toast.error('Erreur de connexion');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Salaire mensuel souhaité (FCFA)
          </label>
          <input
            type="number"
            min={0}
            step={5000}
            value={requestedSalary}
            onChange={(e) => setRequestedSalary(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Laisser inchangé si non applicable"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Taux de commission souhaité (%)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            step={0.5}
            value={requestedRate}
            onChange={(e) => setRequestedRate(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Laisser inchangé si non applicable"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1">
          Motif & Justification de la demande *
        </label>
        <textarea
          rows={3}
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
          placeholder="Décrivez vos accomplissements commerciaux, nouveaux secteurs développés ou arguments appuyant cette révision..."
        />
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-[#d95213] text-white font-bold text-xs shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {submitting ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>{submitting ? 'Envoi en cours...' : 'Soumettre la demande à l\'administration'}</span>
        </button>
      </div>
    </form>
  );
}
