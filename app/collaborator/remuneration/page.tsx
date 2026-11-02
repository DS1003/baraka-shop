import React from 'react';
import Link from 'next/link';
import { getCollaboratorRemunerationAction } from '@/lib/actions/collaborator-actions';
import { formatPrice } from '@/lib/utils';
import { DollarSign, ShieldCheck, ArrowRight, CheckCircle2, History, AlertCircle } from 'lucide-react';

export default async function CollaboratorRemunerationPage() {
  const result = await getCollaboratorRemunerationAction();

  if (!result.authorized || !result.current) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm text-slate-500">Accès restreint aux informations de rémunération.</p>
      </div>
    );
  }

  const { current, totalPaid, agreements } = result;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Conditions Contractuelles</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B1F3B] tracking-tight">
            Structure de Rémunération
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Consultez les termes de votre accord commercial en vigueur et l'historique des révisions contractuelles.
          </p>
        </div>

        <Link
          href="/collaborator/profile"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all"
        >
          <span>Demander une révision</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Active Agreement Summary Card */}
      <div className="bg-gradient-to-br from-white to-orange-50/40 rounded-3xl border border-orange-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-orange-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Accord Commercial Actif</h3>
              <p className="text-xs text-slate-500">
                En vigueur depuis le {new Date(current.effectiveFrom).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Contrat Actif
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Salaire fixe mensuel</span>
            <span className="text-2xl font-black text-slate-900 block mt-1">{formatPrice(current.salary)}</span>
            <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
              Versement vers le {current.dueDay} du mois
            </span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Taux de commissionnement</span>
            <span className="text-2xl font-black text-primary block mt-1">{current.rate}%</span>
            <span className="text-[11px] text-slate-500 block mt-1">
              {current.base === 'DELIVERED_SALES' ? 'Sur commandes livrées' : current.base}
            </span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total perçu à ce jour</span>
            <span className="text-2xl font-black text-emerald-600 block mt-1">{formatPrice(totalPaid)}</span>
            <span className="text-[11px] text-slate-500 block mt-1">Cumul des virements reçus</span>
          </div>
        </div>
      </div>

      {/* Rules & Non-retroactivity Notice */}
      <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl text-xs text-blue-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Garantie d'intégrité financière & Non-rétroactivité</p>
          <p className="text-blue-700 leading-relaxed">
            Toute modification administrative de salaire ou de commission prend effet uniquement pour les périodes futures
            et n'affecte jamais les périodes antérieures déjà clôturées ou validées.
          </p>
        </div>
      </div>

      {/* Contract Agreements History */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" />
            <h3 className="text-base font-bold text-slate-900">Historique des Avenants & Accords</h3>
          </div>
          <span className="text-xs text-slate-400">{agreements.length} accord(s) archivé(s)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Salaire Fixe</th>
                <th className="py-3 px-4">Commission</th>
                <th className="py-3 px-4">Date de début</th>
                <th className="py-3 px-4">Date de fin</th>
                <th className="py-3 px-4">Motif de l'accord</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {agreements.map((a: any) => (
                <tr key={a.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4">
                    {a.status === 'ACTIVE' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Actuel
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                        Clôturé
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{formatPrice(a.salary)}</td>
                  <td className="py-3 px-4 font-semibold text-primary">{a.rate}%</td>
                  <td className="py-3 px-4 text-slate-600">{new Date(a.effectiveFrom).toLocaleDateString('fr-FR')}</td>
                  <td className="py-3 px-4 text-slate-400">
                    {a.effectiveTo ? new Date(a.effectiveTo).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td className="py-3 px-4 text-slate-600 italic">{a.changeReason || 'Nomination initiale'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
