import React from 'react';
import { getCollaboratorPaymentsAction } from '@/lib/actions/collaborator-actions';
import { formatPrice } from '@/lib/utils';
import { CreditCard, CheckCircle2, Download, Receipt } from 'lucide-react';

export default async function CollaboratorPaymentsPage() {
  const result = await getCollaboratorPaymentsAction();

  if (!result.authorized) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm text-slate-500">Accès restreint au relevé des paiements.</p>
      </div>
    );
  }

  const { payments = [], totalReceived = 0 } = result;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Versements & Règlements</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B1F3B] tracking-tight">
            Historique des Paiements Reçus
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Relevé complet des règlements de salaire et de commissions exécutés par l'administration Baraka Shop.
          </p>
        </div>

        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-right sm:min-w-[220px]">
          <span className="text-[10px] uppercase font-bold text-emerald-700 block">Total cumulé perçu</span>
          <span className="text-2xl font-black text-emerald-700 block">{formatPrice(totalReceived)}</span>
          <span className="text-[11px] text-slate-500 block">{payments.length} virement(s) reçu(s)</span>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Date du versement</th>
                <th className="py-3.5 px-4">Montant versé</th>
                <th className="py-3.5 px-4">Mode de règlement</th>
                <th className="py-3.5 px-4">Référence</th>
                <th className="py-3.5 px-4">Émetteur / Admin</th>
                <th className="py-3.5 px-4">Notes</th>
                <th className="py-3.5 px-4 text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                    Aucun versement enregistré à ce jour.
                  </td>
                </tr>
              ) : (
                payments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {new Date(p.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3 px-4 font-black text-emerald-600 text-sm">
                      {formatPrice(p.amount)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-xs">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-xs">
                      {p.reference || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {p.recordedByName}
                    </td>
                    <td className="py-3 px-4 text-slate-500 italic max-w-xs truncate">
                      {p.notes || 'Règlement régulier'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Effectué
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
