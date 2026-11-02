import React from 'react';
import { getCollaboratorDashboardDataAction } from '@/lib/actions/collaborator-actions';
import { formatPrice } from '@/lib/utils';
import { TrendingUp, ShoppingBag, Target, ArrowUpRight, BarChart3, Award } from 'lucide-react';
import { CollaboratorChart } from '../dashboard/CollaboratorChart';

export default async function CollaboratorPerformancePage() {
  const result = await getCollaboratorDashboardDataAction();

  if (!result.authorized || !result.data) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm text-slate-500">Accès restreint aux données de performance.</p>
      </div>
    );
  }

  const { kpis, monthlyTrends, periodLabel } = result.data;
  const avgBasket = kpis.ordersCount > 0 ? kpis.monthlyRevenue / kpis.ordersCount : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Analyses Commerciales</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B1F3B] tracking-tight">
          Performances de Vente
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Analyse des volumes de ventes éligibles et de l'efficacité commerciale pour la période <strong>{periodLabel}</strong>.
        </p>
      </div>

      {/* KPI Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Commandes Livrées</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900">{kpis.ordersCount}</p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">Éligibles aux commissions</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Panier Moyen</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900">{formatPrice(avgBasket)}</p>
            <p className="text-xs text-slate-500 mt-1">Valeur moyenne par commande</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Taux de Commission</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-primary flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-primary">{kpis.commissionRate}%</p>
            <p className="text-xs text-slate-500 mt-1">Rémunération variable contractuelle</p>
          </div>
        </div>
      </div>

      {/* Trends Graph */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-1">Historique des 6 derniers mois</h3>
        <p className="text-xs text-slate-500 mb-6">Comparatif mensuel du volume de vente et commissions</p>
        <CollaboratorChart data={monthlyTrends} />
      </div>

      {/* Monthly Breakdown Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Détail des Périodes Clôturées et en Cours</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Période</th>
                <th className="py-3 px-4">Chiffre d'affaires</th>
                <th className="py-3 px-4">Taux</th>
                <th className="py-3 px-4">Commissions générées</th>
                <th className="py-3 px-4">Salaire fixe</th>
                <th className="py-3 px-4 text-right">Total Période</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlyTrends.map((trend: any) => (
                <tr key={trend.periodCode} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-bold text-slate-900">{trend.periodCode}</td>
                  <td className="py-3 px-4 font-medium">{formatPrice(trend.revenue)}</td>
                  <td className="py-3 px-4 font-bold text-primary">{kpis.commissionRate}%</td>
                  <td className="py-3 px-4 font-semibold text-primary">{formatPrice(trend.commission)}</td>
                  <td className="py-3 px-4 text-slate-600">{formatPrice(trend.totalCompensation - trend.commission)}</td>
                  <td className="py-3 px-4 text-right font-black text-slate-900">{formatPrice(trend.totalCompensation)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
