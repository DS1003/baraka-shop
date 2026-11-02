import React from 'react';
import { getCurrentCollaboratorAction, getCollaboratorModificationRequestsAction } from '@/lib/actions/collaborator-actions';
import { formatPrice } from '@/lib/utils';
import { UserCheck, Shield, Send, CheckCircle2, Clock, AlertTriangle, FileText } from 'lucide-react';
import { ModificationRequestForm } from './ModificationRequestForm';

export default async function CollaboratorProfilePage() {
  const [profileRes, requestsRes] = await Promise.all([
    getCurrentCollaboratorAction(),
    getCollaboratorModificationRequestsAction(),
  ]);

  if (!profileRes.authorized || !profileRes.collaborator) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm text-slate-500">Accès restreint au profil collaborateur.</p>
      </div>
    );
  }

  const { collaborator } = profileRes;
  const requests = requestsRes.requests || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
          <UserCheck className="w-3.5 h-3.5" />
          <span>Statut & Termes de Mission</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B1F3B] tracking-tight">
          Profil & Conditions de Collaboration
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Consultez les termes officiels de votre nomination et soumettez des demandes de révision à l'administration.
        </p>
      </div>

      {/* Contract Terms Summary Card (Read-only) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1B1F3B] text-white flex items-center justify-center font-bold text-lg">
              {collaborator.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{collaborator.name}</h3>
              <p className="text-xs text-slate-500">{collaborator.email} {collaborator.phone ? `• ${collaborator.phone}` : ''}</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            {collaborator.status === 'ACTIVE' ? 'Collaborateur Actif' : collaborator.status}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Poste / Intitulé</span>
            <span className="font-bold text-sm text-slate-900 block mt-1">{collaborator.title}</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Salaire fixe</span>
            <span className="font-bold text-sm text-slate-900 block mt-1">{formatPrice(collaborator.salary)}</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Taux variable</span>
            <span className="font-bold text-sm text-primary block mt-1">{collaborator.commissionRate}%</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Date d'effet</span>
            <span className="font-bold text-sm text-slate-900 block mt-1">
              {new Date(collaborator.startDate).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>

        {/* Permissions accordées */}
        <div>
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
            Permissions Opérationnelles Accordées
          </span>
          <div className="flex flex-wrap gap-2">
            {collaborator.permissions.length === 0 ? (
              <span className="text-xs text-slate-400 italic">Aucune permission spéciale (accès standard portail)</span>
            ) : (
              collaborator.permissions.map((perm: string) => (
                <span
                  key={perm}
                  className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium"
                >
                  ✓ {perm}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Interactive Modification Request Form */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2.5 mb-2">
          <Send className="w-5 h-5 text-primary" />
          <h3 className="text-base font-bold text-slate-900">
            Demande de Révision des Conditions
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-6">
          Vous ne pouvez pas modifier directement vos conditions financières. Remplissez ce formulaire pour soumettre une demande officielle à la direction administrative.
        </p>

        <ModificationRequestForm
          currentSalary={collaborator.salary}
          currentRate={collaborator.commissionRate}
        />
      </div>

      {/* History of Modification Requests */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Historique de vos Demandes</h3>
        </div>

        <div className="divide-y divide-slate-100">
          {requests.length === 0 ? (
            <p className="p-6 text-center text-xs text-slate-400 italic">
              Vous n'avez soumis aucune demande de révision pour le moment.
            </p>
          ) : (
            requests.map((req: any) => (
              <div key={req.id} className="p-5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      req.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : req.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {req.status === 'PENDING' ? 'En cours d\'examen' : req.status === 'APPROVED' ? 'Approuvée' : 'Refusée'}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Soumise le {new Date(req.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 font-semibold text-slate-700">
                    {req.requestedSalary && <span>Fixe souhaité : {formatPrice(req.requestedSalary)}</span>}
                    {req.requestedRate && <span className="text-primary">Taux souhaité : {req.requestedRate}%</span>}
                  </div>
                </div>

                <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  « {req.reason} »
                </p>

                {req.reviewNote && (
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-900">
                    <p className="font-bold text-[11px]">Réponse de l'administration :</p>
                    <p className="mt-0.5">{req.reviewNote}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
