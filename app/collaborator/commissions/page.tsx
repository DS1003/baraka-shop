import React from 'react';
import { getCollaboratorCommissionsAction } from '@/lib/actions/collaborator-actions';
import { formatPrice } from '@/lib/utils';
import { Percent, ShoppingBag, CheckCircle2, Calendar, FileText } from 'lucide-react';

export default async function CollaboratorCommissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period } = await searchParams;
  const result = await getCollaboratorCommissionsAction(period);

  if (!result.authorized) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm text-slate-500">Accès restreint au relevé de commissions.</p>
      </div>
    );
  }

  const { entries = [], totalCommissions = 0, rate = 0, periodCode = '', commissionBase = '' } = result;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <Percent className="w-3.5 h-3.5" />
            <span>Grand Livre des Commissions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B1F3B] tracking-tight">
            Commissions par Commande
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Détail des commissions calculées sur les commandes éligibles livrées pour la période <strong>{periodCode}</strong>.
          </p>
        </div>

        {/* Total commissions banner */}
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl text-right sm:min-w-[220px]">
          <span className="text-[10px] uppercase font-bold text-primary block">Total des commissions</span>
          <span className="text-2xl font-black text-primary block">{formatPrice(totalCommissions)}</span>
          <span className="text-[11px] text-slate-500 block">{entries.length} commande(s) validée(s)</span>
        </div>
      </div>

      {/* Rules pill */}
      <div className="p-3 bg-white rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <FileText className="w-4 h-4 text-primary" />
          <span>Règle appliquée : <strong>{rate}%</strong> sur le {commissionBase === 'DELIVERED_SALES' ? 'Chiffre d\'affaires sur commandes livrées' : commissionBase}</span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
          Calcul automatique serveur
        </span>
      </div>

      {/* Table of Orders & Commissions */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Commande</th>
                <th className="py-3.5 px-4">Date de commande</th>
                <th className="py-3.5 px-4">Montant commande</th>
                <th className="py-3.5 px-4">Taux appliqué</th>
                <th className="py-3.5 px-4">Commission</th>
                <th className="py-3.5 px-4">Statut Commande</th>
                <th className="py-3.5 px-4 text-right">Règlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                    Aucune commande éligible enregistrée pour cette période.
                  </td>
                </tr>
              ) : (
                entries.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{item.orderRef}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(item.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{formatPrice(item.total)}</td>
                    <td className="py-3 px-4 font-semibold text-primary">{item.rate}%</td>
                    <td className="py-3 px-4 font-black text-primary text-sm">
                      +{formatPrice(item.commissionAmount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {item.paymentStatus}
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
