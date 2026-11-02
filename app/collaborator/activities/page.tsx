import React from 'react';
import { getCollaboratorActivitiesAction } from '@/lib/actions/collaborator-actions';
import { Activity, Clock, ShieldCheck, Calendar } from 'lucide-react';

export default async function CollaboratorActivitiesPage() {
  const result = await getCollaboratorActivitiesAction();

  if (!result.authorized) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm text-slate-500">Accès restreint au journal d'activités.</p>
      </div>
    );
  }

  const { activities = [] } = result;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
          <Activity className="w-3.5 h-3.5" />
          <span>Journal des Événements</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B1F3B] tracking-tight">
          Activités de Collaboration
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Historique chronologique des actions, versements, connexions et révisions liées à votre profil collaborateur.
        </p>
      </div>

      {/* Activity Timeline Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        {activities.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
            Aucune activité enregistrée.
          </div>
        ) : (
          <div className="relative border-l-2 border-orange-100 ml-4 pl-6 space-y-6">
            {activities.map((act: any, idx: number) => (
              <div key={act.id || idx} className="relative group">
                {/* Dot */}
                <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-primary group-hover:scale-125 transition-transform" />

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 group-hover:bg-orange-50/40 group-hover:border-orange-200/60 transition-all">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 tracking-tight">
                      {act.actionType}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {new Date(act.date).toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {act.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
