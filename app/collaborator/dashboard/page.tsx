import React from 'react';
import { getCollaboratorDashboardDataAction } from '@/lib/actions/collaborator-actions';
import { formatPrice } from '@/lib/utils';
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  ShoppingBag,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { CollaboratorChart } from './CollaboratorChart';

export default async function CollaboratorDashboardPage() {
  const result = await getCollaboratorDashboardDataAction();

  if (!result.authorized || !result.data) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm text-slate-500">Accès restreint aux données du collaborateur.</p>
      </div>
    );
  }

  const { kpis, monthlyTrends, recentPayments, recentActivities, periodLabel } = result.data;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#1B1F3B] via-[#2A3158] to-[#1B1F3B] text-white rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-orange-300 text-xs font-semibold mb-2 backdrop-blur-xs">
              <Calendar className="w-3.5 h-3.5" />
              <span>Période active : {periodLabel}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Tableau de bord personnel
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
              Suivi en temps réel de votre chiffre d'affaires éligible, de vos commissions acquises et de vos règlements.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-right sm:min-w-[200px]">
            <span className="text-[10px] uppercase font-bold text-orange-200 block">Reste à percevoir ce mois</span>
            <span className="text-2xl font-black text-white block mt-0.5">
              {formatPrice(kpis.remainingBalance)}
            </span>
            <span className="text-[10px] text-slate-300 block mt-0.5">
              Sur {formatPrice(kpis.totalCompensation)} dus
            </span>
          </div>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CA Réalisé */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chiffre d'affaires éligible</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-slate-900">{formatPrice(kpis.monthlyRevenue)}</p>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="font-semibold text-slate-700">{kpis.ordersCount}</span> commande(s) livrée(s)
            </p>
          </div>
        </div>

        {/* Commissions estimées */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Commissions acquises</span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-primary flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-primary">{formatPrice(kpis.estimatedCommission)}</p>
            <p className="text-xs text-slate-500 mt-1">
              Calculé à <span className="font-bold text-slate-700">{kpis.commissionRate}%</span> du CA
            </p>
          </div>
        </div>

        {/* Salaire fixe */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Salaire mensuel garanti</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-slate-900">{formatPrice(kpis.monthlySalary)}</p>
            <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Base fixe garantie
            </p>
          </div>
        </div>

        {/* Rémunération totale */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rémunération totale</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-slate-900">{formatPrice(kpis.totalCompensation)}</p>
            <p className="text-xs text-slate-500 mt-1">
              Fixe + Commissions du mois
            </p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Évolution de la rémunération (6 derniers mois)</h3>
            <p className="text-xs text-slate-500">Chiffre d'affaires et commissions cumulées</p>
          </div>
        </div>
        <CollaboratorChart data={monthlyTrends} />
      </div>

      {/* Two Column Grid : Derniers Règlements & Activités */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Derniers règlements reçus */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Paiements perçus (ce mois)</h3>
            </div>
            <span className="text-xs font-bold text-emerald-600">{formatPrice(kpis.totalPaid)} versés</span>
          </div>

          <div className="divide-y divide-slate-100 mt-3">
            {recentPayments.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center italic">
                Aucun paiement enregistré pour cette période.
              </p>
            ) : (
              recentPayments.map((p: any) => (
                <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{formatPrice(p.amount)}</p>
                    <p className="text-[11px] text-slate-500">
                      {p.paymentMethod} {p.reference ? `• Réf: ${p.reference}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-medium text-slate-400">
                      {new Date(p.date).toLocaleDateString('fr-FR')}
                    </span>
                    <span className="block text-[10px] font-bold text-emerald-600">Validé</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dernières activités */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-slate-900">Activités récentes</h3>
            </div>
          </div>

          <div className="space-y-3 mt-3">
            {recentActivities.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center italic">
                Aucune activité enregistrée.
              </p>
            ) : (
              recentActivities.map((act: any) => (
                <div key={act.id} className="p-3 bg-slate-50 rounded-xl text-xs flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-slate-800 font-medium leading-snug">{act.description}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(act.date).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
