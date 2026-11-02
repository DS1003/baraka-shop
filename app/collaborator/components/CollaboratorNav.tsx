'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  DollarSign,
  Percent,
  CreditCard,
  Activity,
  UserCheck,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';

interface CollaboratorNavProps {
  collaborator: {
    id: string;
    name: string;
    email: string;
    title: string;
    salary: number;
    commissionRate: number;
    calculationBase: string;
    status: string;
  };
}

const NAV_ITEMS = [
  {
    label: 'Tableau de bord',
    href: '/collaborator/dashboard',
    icon: LayoutDashboard,
    description: 'Vue d\'ensemble & métriques clés',
  },
  {
    label: 'Performances',
    href: '/collaborator/performance',
    icon: TrendingUp,
    description: 'Chiffre d\'affaires & analyses',
  },
  {
    label: 'Rémunération',
    href: '/collaborator/remuneration',
    icon: DollarSign,
    description: 'Salaire fixe & accords',
  },
  {
    label: 'Commissions',
    href: '/collaborator/commissions',
    icon: Percent,
    description: 'Commissions calculées & statut',
  },
  {
    label: 'Paiements',
    href: '/collaborator/payments',
    icon: CreditCard,
    description: 'Historique des versements',
  },
  {
    label: 'Activités',
    href: '/collaborator/activities',
    icon: Activity,
    description: 'Journal des événements',
  },
  {
    label: 'Profil & Conditions',
    href: '/collaborator/profile',
    icon: UserCheck,
    description: 'Détails du contrat & requêtes',
  },
];

export function CollaboratorNav({ collaborator }: CollaboratorNavProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-4">
      {/* Collaborator Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#1B1F3B] to-[#2E3560] text-white flex items-center justify-center font-black text-base shadow-xs">
            {collaborator.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-sm text-slate-900 truncate leading-snug">
              {collaborator.name}
            </h3>
            <p className="text-xs text-slate-500 truncate">{collaborator.title}</p>
          </div>
        </div>

        {/* Quick summary badges */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
          <div className="p-2 bg-slate-50 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Fixe mensuel</span>
            <span className="font-extrabold text-xs text-slate-900">{formatPrice(collaborator.salary)}</span>
          </div>
          <div className="p-2 bg-orange-50 rounded-xl border border-orange-100">
            <span className="text-[10px] uppercase font-bold text-primary block">Taux</span>
            <span className="font-extrabold text-xs text-primary">{collaborator.commissionRate}%</span>
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-xs space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary text-white shadow-xs shadow-orange-500/20 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 shrink-0 transition-transform group-hover:scale-110',
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary'
                )}
              />
              <div className="flex-1 min-w-0">
                <span className="block leading-tight">{item.label}</span>
              </div>
              <ChevronRight
                className={cn(
                  'w-3.5 h-3.5 transition-transform',
                  isActive ? 'text-white/80' : 'text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5'
                )}
              />
            </Link>
          );
        })}
      </nav>

      {/* Security notice */}
      <div className="p-3 bg-slate-100/70 rounded-2xl border border-slate-200/60 text-[11px] text-slate-500 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <span>
          Portail personnel sécurisé. Vos rémunérations sont calculées exclusivement sur vos conditions privées.
        </span>
      </div>
    </div>
  );
}
