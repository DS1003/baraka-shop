'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Briefcase,
  Search,
  DollarSign,
  TrendingUp,
  CreditCard,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  Send,
  MoreVertical,
  Calendar,
  ArrowUpRight,
  Filter,
  Eye,
  RefreshCw,
  Edit3,
} from 'lucide-react';
import {
  getAdminCollaboratorsListAction,
  getRegisteredUsersAction,
  nominateCollaboratorAction,
  updateCollaboratorSettingsAction,
  updateCollaboratorStatusAction,
  recordCollaboratorPaymentAction,
  resendCollaboratorNotificationAction,
  getCollaboratorAuditHistoryAction,
} from '@/lib/actions/collaborator-actions';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminCollaboratorsPage() {
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [isNominateModalOpen, setIsNominateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState<any>(null);

  // Nomination form state
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [nominateForm, setNominateForm] = useState({
    title: 'Collaborateur Commercial',
    monthlySalary: 150000,
    commissionRate: 5.0,
    commissionBase: 'DELIVERED_SALES',
    eligibleStatuses: ['DELIVERED'],
    startDate: new Date().toISOString().slice(0, 10),
    permissions: ['VIEW_COMMISSIONS'] as string[],
    notes: '',
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    monthlySalary: 0,
    commissionRate: 0,
    commissionBase: 'DELIVERED_SALES',
    eligibleStatuses: ['DELIVERED'],
    permissions: [] as string[],
    notes: '',
    reason: '',
  });

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    amount: 100000,
    periodCode: new Date().toISOString().slice(0, 7),
    type: 'SALARY_AND_COMMISSION',
    paymentMethod: 'WAVE',
    reference: '',
    notes: '',
  });

  // Audit history state
  const [historyData, setHistoryData] = useState<{
    auditLogs: any[];
    notificationLogs: any[];
    agreements: any[];
  } | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  // Load collaborators
  const loadCollaborators = async () => {
    setLoading(true);
    try {
      const res = await getAdminCollaboratorsListAction();
      if (res.success && res.collaborators) {
        setCollaborators(res.collaborators);
      } else {
        toast.error(res.error || 'Erreur lors du chargement des collaborateurs');
      }
    } catch (err: any) {
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollaborators();
  }, []);

  // Search users for nomination
  useEffect(() => {
    if (!isNominateModalOpen) return;
    const timer = setTimeout(async () => {
      setSearchingUsers(true);
      const res = await getRegisteredUsersAction(userSearchQuery);
      if (res.success && res.users) {
        setRegisteredUsers(res.users);
      }
      setSearchingUsers(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [userSearchQuery, isNominateModalOpen]);

  // Handle Nomination Submit
  const handleNominateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      toast.error('Veuillez sélectionner un utilisateur inscrit');
      return;
    }

    setSubmitting(true);
    try {
      const res = await nominateCollaboratorAction({
        userId: selectedUser.id,
        title: nominateForm.title,
        monthlySalary: nominateForm.monthlySalary,
        commissionRate: nominateForm.commissionRate,
        commissionBase: nominateForm.commissionBase,
        eligibleStatuses: nominateForm.eligibleStatuses,
        startDate: nominateForm.startDate,
        permissions: nominateForm.permissions,
        notes: nominateForm.notes,
      });

      if (res.success) {
        toast.success(res.message || 'Collaborateur nommé avec succès');
        setIsNominateModalOpen(false);
        setSelectedUser(null);
        loadCollaborators();
      } else {
        toast.error(res.error || 'Échec de la nomination');
      }
    } catch (err: any) {
      toast.error('Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (collab: any) => {
    setSelectedCollaborator(collab);
    setEditForm({
      title: collab.title || 'Collaborateur Commercial',
      monthlySalary: collab.salary || 0,
      commissionRate: collab.commissionRate || 0,
      commissionBase: collab.calculationBase || 'DELIVERED_SALES',
      eligibleStatuses: collab.eligibleStatuses || ['DELIVERED'],
      permissions: collab.permissions || [],
      notes: collab.notes || '',
      reason: 'Révision standard des conditions',
    });
    setIsEditModalOpen(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollaborator) return;

    setSubmitting(true);
    try {
      const res = await updateCollaboratorSettingsAction(selectedCollaborator.id, {
        title: editForm.title,
        monthlySalary: Number(editForm.monthlySalary),
        commissionRate: Number(editForm.commissionRate),
        commissionBase: editForm.commissionBase,
        eligibleStatuses: editForm.eligibleStatuses,
        permissions: editForm.permissions,
        notes: editForm.notes,
        reason: editForm.reason,
      });

      if (res.success) {
        toast.success(res.message || 'Conditions mises à jour');
        setIsEditModalOpen(false);
        loadCollaborators();
      } else {
        toast.error(res.error || 'Erreur mise à jour');
      }
    } catch (err: any) {
      toast.error('Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  // Status toggle
  const handleStatusChange = async (collab: any, newStatus: 'ACTIVE' | 'SUSPENDED' | 'TERMINATED') => {
    const actionLabel = newStatus === 'ACTIVE' ? 'Activer' : newStatus === 'SUSPENDED' ? 'Suspendre' : 'Terminer';
    if (!confirm(`Êtes-vous sûr de vouloir ${actionLabel.toLowerCase()} la collaboration de ${collab.name} ?`)) {
      return;
    }

    try {
      const res = await updateCollaboratorStatusAction(collab.id, newStatus, `Action administrateur direct`);
      if (res.success) {
        toast.success(res.message);
        loadCollaborators();
      } else {
        toast.error(res.error || 'Erreur mise à jour statut');
      }
    } catch (err) {
      toast.error('Erreur serveur');
    }
  };

  // Open Payment Modal
  const openPaymentModal = (collab: any) => {
    setSelectedCollaborator(collab);
    setPaymentForm({
      amount: collab.salary > 0 ? collab.salary : 50000,
      periodCode: new Date().toISOString().slice(0, 7),
      type: 'SALARY_AND_COMMISSION',
      paymentMethod: 'WAVE',
      reference: `REC-${Date.now().toString().slice(-6)}`,
      notes: `Règlement pour ${collab.name}`,
    });
    setIsPaymentModalOpen(true);
  };

  // Handle Payment Submit
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollaborator) return;

    setSubmitting(true);
    try {
      const res = await recordCollaboratorPaymentAction({
        collaboratorId: selectedCollaborator.id,
        amount: Number(paymentForm.amount),
        periodCode: paymentForm.periodCode,
        type: paymentForm.type,
        paymentMethod: paymentForm.paymentMethod,
        reference: paymentForm.reference,
        notes: paymentForm.notes,
      });

      if (res.success) {
        toast.success(res.message || 'Paiement enregistré');
        setIsPaymentModalOpen(false);
        loadCollaborators();
      } else {
        toast.error(res.error || 'Erreur enregistrement');
      }
    } catch (err) {
      toast.error('Erreur serveur');
    } finally {
      setSubmitting(false);
    }
  };

  // Open History Modal
  const openHistoryModal = async (collab: any) => {
    setSelectedCollaborator(collab);
    setIsHistoryModalOpen(true);
    setLoadingHistory(true);
    try {
      const res = await getCollaboratorAuditHistoryAction(collab.id);
      if (res.success) {
        setHistoryData({
          auditLogs: res.auditLogs || [],
          notificationLogs: res.notificationLogs || [],
          agreements: res.agreements || [],
        });
      }
    } catch (err) {
      toast.error('Erreur chargement historique');
    } finally {
      setLoadingHistory(false);
    }
  };

  // Resend notification
  const handleResendNotification = async (collab: any) => {
    toast.promise(resendCollaboratorNotificationAction(collab.id), {
      loading: 'Envoi de l\'email en cours...',
      success: 'Email de bienvenue réexpédié avec succès !',
      error: 'Erreur lors de l\'envoi',
    });
  };

  // Filtering
  const filteredCollaborators = collaborators.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm));
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPI calculations
  const totalActive = collaborators.filter((c) => c.status === 'ACTIVE').length;
  const totalMonthlySalaries = collaborators
    .filter((c) => c.status === 'ACTIVE')
    .reduce((acc, c) => acc + (c.salary || 0), 0);
  const totalRemainingBalance = collaborators.reduce((acc, c) => acc + (c.currentPeriodRemaining || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Administration Commerciale</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B1F3B] tracking-tight">
            Gestion des Collaborateurs
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Nommez des utilisateurs inscrits, configurez leurs rémunérations et pilotez leurs accès indépendants.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedUser(null);
            setUserSearchQuery('');
            setIsNominateModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-[#d95213] text-white font-semibold text-sm shadow-sm shadow-orange-500/20 transition-all active:scale-[0.98]"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nommer un collaborateur</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Collaborateurs Actifs</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900">{totalActive}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Sur {collaborators.length} profil(s) enregistrés</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Masse Salariale Mensuelle</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900">{formatPrice(totalMonthlySalaries)}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Salaires fixes de base cumulés</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reste à Verser</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-primary flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900">{formatPrice(totalRemainingBalance)}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Solde des périodes en cours</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sécurité & Portails</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-sm font-bold text-slate-900">Espace Indépendant</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Routes sécurisées : <code className="text-primary">/collaborator/*</code></p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200/80">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom, email ou téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIVE">Actifs uniquement</option>
            <option value="SUSPENDED">Suspendus</option>
            <option value="TERMINATED">Terminés</option>
          </select>

          <button
            onClick={loadCollaborators}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
            title="Rafraîchir"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Collaborators Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3.5 px-4">Collaborateur</th>
                <th className="py-3.5 px-4">Mission / Titre</th>
                <th className="py-3.5 px-4">Rémunération</th>
                <th className="py-3.5 px-4">Commissions</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-4">Début</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Chargement des collaborateurs...
                  </td>
                </tr>
              ) : filteredCollaborators.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Aucun collaborateur trouvé
                  </td>
                </tr>
              ) : (
                filteredCollaborators.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Collaborator User Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#1B1F3B] text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                          {c.image ? (
                            <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                          ) : (
                            c.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate leading-snug">{c.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{c.email}</p>
                          {c.phone && <p className="text-[10px] text-slate-400 truncate">{c.phone}</p>}
                        </div>
                      </div>
                    </td>

                    {/* Mission / Titre */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{c.title || 'Collaborateur'}</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {c.permissions?.length || 0} permission(s)
                      </p>
                    </td>

                    {/* Rémunération Fixe */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900">{formatPrice(c.salary)}</span>
                      <p className="text-[10px] text-slate-500">mensuel</p>
                    </td>

                    {/* Commission Rate & Base */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-primary bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                        {c.commissionRate}%
                      </span>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {c.calculationBase === 'DELIVERED_SALES' ? 'Sur CA livré' : c.calculationBase}
                      </p>
                    </td>

                    {/* Statut */}
                    <td className="py-3 px-4">
                      {c.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Actif
                        </span>
                      ) : c.status === 'SUSPENDED' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Suspendu
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Terminé
                        </span>
                      )}
                    </td>

                    {/* Date de début */}
                    <td className="py-3 px-4 text-slate-500 text-xs">
                      {new Date(c.startDate).toLocaleDateString('fr-FR')}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(c)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
                          title="Modifier conditions"
                        >
                          <Edit3 className="w-3.5 h-3.5 inline mr-1" />
                          Modifier
                        </button>

                        <button
                          onClick={() => openPaymentModal(c)}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all"
                          title="Enregistrer un paiement"
                        >
                          <CreditCard className="w-3.5 h-3.5 inline mr-1" />
                          Payer
                        </button>

                        <button
                          onClick={() => openHistoryModal(c)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
                          title="Historique & Audit"
                        >
                          <History className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleResendNotification(c)}
                          className="p-1.5 text-primary hover:bg-orange-50 rounded-lg transition-all"
                          title="Renvoyer email de bienvenue"
                        >
                          <Send className="w-4 h-4" />
                        </button>

                        {/* Status Toggle Quick Action */}
                        {c.status === 'ACTIVE' ? (
                          <button
                            onClick={() => handleStatusChange(c, 'SUSPENDED')}
                            className="px-2 py-1 text-[11px] font-bold text-amber-700 hover:bg-amber-100 rounded-lg transition-all"
                            title="Suspendre l'accès"
                          >
                            Suspendre
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(c, 'ACTIVE')}
                            className="px-2 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 rounded-lg transition-all"
                            title="Réactiver l'accès"
                          >
                            Réactiver
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: NOMINATION D'UN UTILISATEUR EXISTANT
         ========================================================================= */}
      {isNominateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 text-primary flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Nommer un Collaborateur</h3>
                  <p className="text-xs text-slate-500">Sélectionnez un compte client existant sur Baraka Shop.</p>
                </div>
              </div>
              <button
                onClick={() => setIsNominateModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleNominateSubmit} className="space-y-6 mt-6">
              {/* Étape 1 : Sélection d'un utilisateur existant */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  1. Rechercher et sélectionner l'utilisateur existant *
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tapez le nom ou l'adresse email de l'utilisateur..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                {/* Dropdown list of users */}
                <div className="max-h-44 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
                  {searchingUsers ? (
                    <div className="p-4 text-center text-xs text-slate-400">Recherche en cours...</div>
                  ) : registeredUsers.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">Aucun utilisateur trouvé</div>
                  ) : (
                    registeredUsers.map((u) => {
                      const isAlreadyCollab = !!u.collaboratorProfile;
                      const isSelected = selectedUser?.id === u.id;
                      return (
                        <div
                          key={u.id}
                          onClick={() => !isAlreadyCollab && setSelectedUser(u)}
                          className={`p-3 flex items-center justify-between text-xs transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-orange-50 border-l-4 border-primary'
                              : isAlreadyCollab
                              ? 'bg-slate-50/70 opacity-60 cursor-not-allowed'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">
                              {u.username || u.email.split('@')[0]}
                              {isAlreadyCollab && (
                                <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-600">
                                  Déjà collaborateur
                                </span>
                              )}
                            </p>
                            <p className="text-slate-500 truncate">{u.email} {u.phone ? `• ${u.phone}` : ''}</p>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                        </div>
                      );
                    })
                  )}
                </div>

                {selectedUser && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      Compte sélectionné : <strong>{selectedUser.username || selectedUser.email}</strong> ({selectedUser.email})
                    </div>
                  </div>
                )}
              </div>

              {/* Étape 2 : Configuration financière & conditions */}
              <div className="border-t border-slate-100 pt-4 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  2. Conditions de Rémunération & Collaboration
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Intitulé / Titre du poste
                    </label>
                    <input
                      type="text"
                      value={nominateForm.title}
                      onChange={(e) => setNominateForm({ ...nominateForm, title: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Ex: Commercial Grand Comptes"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Salaire mensuel de base (FCFA)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={nominateForm.monthlySalary}
                      onChange={(e) => setNominateForm({ ...nominateForm, monthlySalary: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Taux de commission (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={nominateForm.commissionRate}
                      onChange={(e) => setNominateForm({ ...nominateForm, commissionRate: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Base de calcul de la commission
                    </label>
                    <select
                      value={nominateForm.commissionBase}
                      onChange={(e) => setNominateForm({ ...nominateForm, commissionBase: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="DELIVERED_SALES">Chiffre d'affaires sur commandes livrées</option>
                      <option value="ALL_SALES">Chiffre d'affaires global (toutes commandes)</option>
                      <option value="NET_MARGIN">Marge commerciale nette</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Date de début de collaboration
                    </label>
                    <input
                      type="date"
                      value={nominateForm.startDate}
                      onChange={(e) => setNominateForm({ ...nominateForm, startDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                </div>

                {/* Permissions accordées */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-2">
                    Permissions opérationnelles accordées
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      { key: 'VIEW_COMMISSIONS', label: 'Accès portail & Commissions (Défaut)' },
                      { key: 'MANAGE_ORDERS', label: 'Gestion opérationnelle des commandes' },
                      { key: 'VIEW_STOCK', label: 'Consultation des stocks & inventaires' },
                      { key: 'MANAGE_PRODUCTS', label: 'Création / Mise à jour produits' },
                      { key: 'VIEW_REPORTS', label: 'Téléchargement des rapports de vente' },
                    ].map((perm) => (
                      <label key={perm.key} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={nominateForm.permissions.includes(perm.key)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNominateForm({
                                ...nominateForm,
                                permissions: [...nominateForm.permissions, perm.key],
                              });
                            } else {
                              setNominateForm({
                                ...nominateForm,
                                permissions: nominateForm.permissions.filter((p) => p !== perm.key),
                              });
                            }
                          }}
                          className="rounded text-primary focus:ring-primary"
                        />
                        <span className="text-slate-800">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Notes administratives (privées)
                  </label>
                  <textarea
                    rows={2}
                    value={nominateForm.notes}
                    onChange={(e) => setNominateForm({ ...nominateForm, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Objectifs, conditions particulières..."
                  />
                </div>
              </div>

              {/* Notice email */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-start gap-2">
                <Send className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Un e-mail officiel de bienvenue aux couleurs de Baraka Shop sera automatiquement expédié à l'utilisateur, l'informant de ses accès et de son espace collaborateur dédié.
                </span>
              </div>

              {/* Footer buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNominateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedUser}
                  className="px-5 py-2.5 bg-primary hover:bg-[#d95213] text-white rounded-xl font-bold text-xs shadow-sm disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Valider la nomination</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: MODIFICATION DES CONDITIONS & RÉMUNÉRATION
         ========================================================================= */}
      {isEditModalOpen && selectedCollaborator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Modifier les conditions : {selectedCollaborator.name}
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Titre de collaboration</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Salaire mensuel (FCFA)</label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={editForm.monthlySalary}
                    onChange={(e) => setEditForm({ ...editForm, monthlySalary: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Commission (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={editForm.commissionRate}
                    onChange={(e) => setEditForm({ ...editForm, commissionRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Assiette de calcul</label>
                <select
                  value={editForm.commissionBase}
                  onChange={(e) => setEditForm({ ...editForm, commissionBase: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                >
                  <option value="DELIVERED_SALES">Chiffre d'affaires sur commandes livrées</option>
                  <option value="ALL_SALES">Chiffre d'affaires global</option>
                  <option value="NET_MARGIN">Marge commerciale nette</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Motif de la modification (Audit) *</label>
                <input
                  type="text"
                  value={editForm.reason}
                  onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  placeholder="Ex: Augmentation suite aux performances T3"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-xs shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Enregistrement...' : 'Mettre à jour'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: ENREGISTREMENT D'UN PAIEMENT
         ========================================================================= */}
      {isPaymentModalOpen && selectedCollaborator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Enregistrer un paiement : {selectedCollaborator.name}
              </h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Montant à verser (FCFA) *</label>
                <input
                  type="number"
                  min={100}
                  step={500}
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Moyen de paiement</label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="WAVE">Wave</option>
                    <option value="ORANGE_MONEY">Orange Money</option>
                    <option value="BANK_TRANSFER">Virement Bancaire</option>
                    <option value="CASH">Espèces</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Période concernée</label>
                  <input
                    type="month"
                    value={paymentForm.periodCode}
                    onChange={(e) => setPaymentForm({ ...paymentForm, periodCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Référence / N° de transaction</label>
                <input
                  type="text"
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  placeholder="Ex: TXN-WAVE-892123"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Notes / Commentaire</label>
                <textarea
                  rows={2}
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Validation...' : 'Confirmer le paiement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: HISTORIQUE ET AUDIT TRAIL
         ========================================================================= */}
      {isHistoryModalOpen && selectedCollaborator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-slate-200 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-slate-900">
                  Journal d'audit : {selectedCollaborator.name}
                </h3>
              </div>
              <button onClick={() => setIsHistoryModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="space-y-6 mt-4">
              {loadingHistory ? (
                <div className="py-8 text-center text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                  Chargement de l'historique...
                </div>
              ) : (
                <>
                  {/* Audit Logs */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Modifications Administratives
                    </h4>
                    <div className="space-y-2">
                      {historyData?.auditLogs.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Aucune modification journalisée</p>
                      ) : (
                        historyData?.auditLogs.map((log) => (
                          <div key={log.id} className="p-3 bg-slate-50 rounded-xl text-xs border border-slate-100">
                            <div className="flex items-center justify-between font-semibold text-slate-900">
                              <span>{log.action}</span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                {new Date(log.createdAt).toLocaleString('fr-FR')}
                              </span>
                            </div>
                            <p className="text-slate-600 mt-1">{log.reason || 'Action système'}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Par : {log.performedByName || log.performedById}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Notification Logs */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Historique des Notifications E-mail
                    </h4>
                    <div className="space-y-2">
                      {historyData?.notificationLogs.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Aucun e-mail consigné</p>
                      ) : (
                        historyData?.notificationLogs.map((notif) => (
                          <div key={notif.id} className="p-3 bg-slate-50 rounded-xl text-xs border border-slate-100 flex items-center justify-between">
                            <div>
                              <p className="font-bold text-slate-800">{notif.type}</p>
                              <p className="text-[11px] text-slate-500">{notif.email}</p>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                notif.status === 'SENT' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {notif.status}
                              </span>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {new Date(notif.sentAt).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
