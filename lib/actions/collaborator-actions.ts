'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { emailService } from '@/lib/email-service';
import { revalidatePath } from 'next/cache';

// ─────────────────────────────────────────────────────────────────────────────
// SÉCURITÉ & VÉRIFICATIONS D'AUTORISATION
// ─────────────────────────────────────────────────────────────────────────────

async function getAuthenticatedUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Non authentifié');
  }
  return session.user;
}

async function requireAdmin() {
  const user = await getAuthenticatedUser();
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, role: true, email: true, username: true },
  });

  if (!dbUser || dbUser.role !== 'ADMIN') {
    throw new Error('Accès réservé aux administrateurs autorisés');
  }
  return dbUser;
}

async function requireActiveCollaborator() {
  const user = await getAuthenticatedUser();
  const collaborator = await prisma.collaboratorProfile.findUnique({
    where: { userId: user.id },
    include: {
      user: {
        select: { id: true, email: true, username: true, image: true, phone: true },
      },
      CompensationAgreement: {
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!collaborator || collaborator.status !== 'ACTIVE') {
    return null;
  }

  return {
    ...collaborator,
    activeAgreement: collaborator.CompensationAgreement[0] || null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. GESTION DES COLLABORATEURS CÔTÉ ADMINISTRATION (/admin/collaborators)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Recherche et consultation des utilisateurs inscrits pour nomination
 */
export async function getRegisteredUsersAction(searchQuery?: string) {
  try {
    await requireAdmin();

    const query = (searchQuery || '').trim();

    const users = await prisma.user.findMany({
      where: query
        ? {
            OR: [
              { email: { contains: query, mode: 'insensitive' } },
              { username: { contains: query, mode: 'insensitive' } },
              { phone: { contains: query, mode: 'insensitive' } },
            ],
          }
        : undefined,
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        image: true,
        role: true,
        createdAt: true,
        collaboratorProfile: {
          select: {
            id: true,
            status: true,
            title: true,
            startDate: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return { success: true, users };
  } catch (error: any) {
    console.error('[CollaboratorActions] getRegisteredUsersAction error:', error);
    return { success: false, error: error.message || 'Erreur lors de la récupération des utilisateurs' };
  }
}

/**
 * Liste complète des collaborateurs pour l'administration
 */
export async function getAdminCollaboratorsListAction() {
  try {
    await requireAdmin();

    const collaborators = await prisma.collaboratorProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            phone: true,
            image: true,
            createdAt: true,
          },
        },
        CompensationAgreement: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        CommissionPeriod: {
          orderBy: { periodCode: 'desc' },
          take: 3,
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            payments: true,
            CommissionPeriod: true,
            activities: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = collaborators.map((c) => {
      const activeAgreement = c.CompensationAgreement[0] || null;
      const latestPeriod = c.CommissionPeriod[0] || null;

      return {
        id: c.id,
        userId: c.userId,
        name: c.user.username || c.user.email.split('@')[0],
        email: c.user.email,
        phone: c.user.phone,
        image: c.user.image,
        title: c.title,
        status: c.status,
        startDate: c.startDate.toISOString(),
        endDate: c.endDate ? c.endDate.toISOString() : null,
        permissions: c.permissions || [],
        notes: c.notes,
        salary: activeAgreement?.monthlySalary || 0,
        commissionRate: activeAgreement?.commissionRate || 0,
        calculationBase: activeAgreement?.calculationBase || 'DELIVERED_SALES',
        eligibleStatuses: activeAgreement?.eligibleStatuses || ['DELIVERED'],
        currentPeriodRemaining: latestPeriod?.remainingBalance || 0,
        totalPaymentsCount: c._count.payments,
      };
    });

    return { success: true, collaborators: formatted };
  } catch (error: any) {
    console.error('[CollaboratorActions] getAdminCollaboratorsListAction error:', error);
    return { success: false, error: error.message || 'Erreur chargement collaborateurs' };
  }
}

export interface NominateCollaboratorInput {
  userId: string;
  title?: string;
  monthlySalary: number;
  commissionRate: number;
  commissionBase: string;
  eligibleStatuses?: string[];
  startDate?: string;
  permissions?: string[];
  notes?: string;
}

/**
 * Nomination transactionnelle d'un utilisateur existant en collaborateur
 */
export async function nominateCollaboratorAction(data: NominateCollaboratorInput) {
  try {
    const admin = await requireAdmin();

    if (!data.userId) {
      return { success: false, error: 'Identifiant utilisateur requis' };
    }

    // 1. Vérifier que le compte utilisateur existe
    const targetUser = await prisma.user.findUnique({
      where: { id: data.userId },
      include: { collaboratorProfile: true },
    });

    if (!targetUser) {
      return { success: false, error: 'Utilisateur introuvable' };
    }

    // 2. Vérifier qu'il n'est pas déjà collaborateur
    if (targetUser.collaboratorProfile) {
      return {
        success: false,
        error: `Cet utilisateur possède déjà un profil collaborateur (Statut: ${targetUser.collaboratorProfile.status})`,
      };
    }

    const title = data.title?.trim() || 'Collaborateur Commercial';
    const monthlySalary = Math.max(0, Number(data.monthlySalary) || 0);
    const commissionRate = Math.max(0, Number(data.commissionRate) || 0);
    const commissionBase = data.commissionBase || 'DELIVERED_SALES';
    const eligibleStatuses = data.eligibleStatuses && data.eligibleStatuses.length > 0
      ? data.eligibleStatuses
      : ['DELIVERED'];
    const permissions = data.permissions || [];
    const startDate = data.startDate ? new Date(data.startDate) : new Date();

    // 3, 4, 5, 6. Transaction atomique
    const result = await prisma.$transaction(async (tx) => {
      // Créer le profil collaborateur
      const profile = await tx.collaboratorProfile.create({
        data: {
          userId: targetUser.id,
          title,
          status: 'ACTIVE',
          startDate,
          permissions,
          notes: data.notes?.trim() || null,
        },
      });

      // Créer l'accord de rémunération initial
      const agreement = await tx.compensationAgreement.create({
        data: {
          collaboratorId: profile.id,
          monthlySalary,
          commissionRate,
          calculationBase: commissionBase,
          eligibleStatuses,
          status: 'ACTIVE',
          effectiveFrom: startDate,
          changeReason: 'Nomination initiale du collaborateur',
          createdById: admin.id,
        },
      });

      // Journaliser l'action d'administration
      await tx.financialAuditLog.create({
        data: {
          collaboratorId: profile.id,
          action: 'COLLABORATOR_NOMINATED',
          performedById: admin.id,
          performedByName: admin.username || admin.email,
          newValue: {
            title,
            monthlySalary,
            commissionRate,
            commissionBase,
            permissions,
          },
          reason: 'Nomination officielle et configuration initiale',
        },
      });

      // Journaliser l'activité
      await tx.collaboratorActivity.create({
        data: {
          collaboratorId: profile.id,
          actionType: 'ACCOUNT_ACTIVATED',
          description: `Compte collaborateur activé par l'administrateur ${admin.username || admin.email}`,
        },
      });

      return { profile, agreement };
    });

    // 7. Envoi automatique de l'e-mail de notification
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.baraka.sn';
    const collaboratorName = targetUser.username || targetUser.email.split('@')[0];

    try {
      const emailResult = await emailService.sendCollaboratorWelcomeEmail({
        to: targetUser.email,
        collaboratorName,
        title,
        monthlySalary,
        commissionRate,
        commissionBase,
        startDate: startDate.toLocaleDateString('fr-FR'),
        dashboardUrl: `${appUrl}/collaborator/dashboard`,
      });

      await prisma.collaboratorNotificationHistory.create({
        data: {
          collaboratorId: result.profile.id,
          email: targetUser.email,
          type: 'WELCOME_NOMINATION',
          status: emailResult.success ? (emailResult.simulated ? 'SIMULATED' : 'SENT') : 'FAILED',
          errorMessage: emailResult.error ? JSON.stringify(emailResult.error) : null,
        },
      });
    } catch (emailErr: any) {
      console.error('[CollaboratorActions] Erreur envoi email bienvenue:', emailErr);
      await prisma.collaboratorNotificationHistory.create({
        data: {
          collaboratorId: result.profile.id,
          email: targetUser.email,
          type: 'WELCOME_NOMINATION',
          status: 'FAILED',
          errorMessage: emailErr.message || 'Exception envoi email',
        },
      });
    }

    revalidatePath('/admin/collaborators');
    return {
      success: true,
      collaboratorId: result.profile.id,
      message: `Collaborateur ${collaboratorName} nommé avec succès`,
    };
  } catch (error: any) {
    console.error('[CollaboratorActions] nominateCollaboratorAction error:', error);
    return { success: false, error: error.message || 'Erreur lors de la nomination' };
  }
}

/**
 * Mise à jour des conditions financières et des permissions par l'administrateur
 */
export async function updateCollaboratorSettingsAction(
  collaboratorId: string,
  data: {
    title?: string;
    monthlySalary?: number;
    commissionRate?: number;
    commissionBase?: string;
    eligibleStatuses?: string[];
    permissions?: string[];
    notes?: string;
    reason?: string;
  }
) {
  try {
    const admin = await requireAdmin();

    const currentProfile = await prisma.collaboratorProfile.findUnique({
      where: { id: collaboratorId },
      include: {
        CompensationAgreement: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!currentProfile) {
      return { success: false, error: 'Profil collaborateur introuvable' };
    }

    const currentAgreement = currentProfile.CompensationAgreement[0] || null;

    const newSalary = data.monthlySalary !== undefined ? Math.max(0, Number(data.monthlySalary)) : currentAgreement?.monthlySalary || 0;
    const newRate = data.commissionRate !== undefined ? Math.max(0, Number(data.commissionRate)) : currentAgreement?.commissionRate || 0;
    const newBase = data.commissionBase || currentAgreement?.calculationBase || 'DELIVERED_SALES';
    const newEligibleStatuses = data.eligibleStatuses || currentAgreement?.eligibleStatuses || ['DELIVERED'];
    const newPermissions = data.permissions !== undefined ? data.permissions : currentProfile.permissions;

    await prisma.$transaction(async (tx) => {
      // Mettre à jour le profil (titre, notes, permissions)
      await tx.collaboratorProfile.update({
        where: { id: collaboratorId },
        data: {
          title: data.title !== undefined ? data.title : currentProfile.title,
          notes: data.notes !== undefined ? data.notes : currentProfile.notes,
          permissions: newPermissions,
        },
      });

      // Si les conditions financières ont changé, clôturer l'ancien accord et en créer un nouveau (non rétroactif)
      const hasFinancialChange =
        currentAgreement &&
        (currentAgreement.monthlySalary !== newSalary ||
          currentAgreement.commissionRate !== newRate ||
          currentAgreement.calculationBase !== newBase ||
          JSON.stringify(currentAgreement.eligibleStatuses) !== JSON.stringify(newEligibleStatuses));

      if (hasFinancialChange || !currentAgreement) {
        if (currentAgreement) {
          await tx.compensationAgreement.update({
            where: { id: currentAgreement.id },
            data: {
              status: 'SUPERSEDED',
              effectiveTo: new Date(),
            },
          });
        }

        await tx.compensationAgreement.create({
          data: {
            collaboratorId,
            monthlySalary: newSalary,
            commissionRate: newRate,
            calculationBase: newBase,
            eligibleStatuses: newEligibleStatuses,
            status: 'ACTIVE',
            effectiveFrom: new Date(),
            changeReason: data.reason || 'Mise à jour des conditions par l\'administration',
            createdById: admin.id,
          },
        });
      }

      // Historique financier
      await tx.financialAuditLog.create({
        data: {
          collaboratorId,
          action: 'SETTINGS_UPDATED',
          performedById: admin.id,
          performedByName: admin.username || admin.email,
          oldValue: {
            salary: currentAgreement?.monthlySalary,
            rate: currentAgreement?.commissionRate,
            base: currentAgreement?.calculationBase,
            permissions: currentProfile.permissions,
          },
          newValue: {
            salary: newSalary,
            rate: newRate,
            base: newBase,
            permissions: newPermissions,
          },
          reason: data.reason || 'Mise à jour administrative',
        },
      });

      await tx.collaboratorActivity.create({
        data: {
          collaboratorId,
          actionType: 'SETTINGS_CHANGED',
          description: `Conditions modifiées par l'administrateur ${admin.username || admin.email}`,
        },
      });
    });

    revalidatePath('/admin/collaborators');
    revalidatePath('/collaborator/dashboard');
    revalidatePath('/collaborator/profile');

    return { success: true, message: 'Conditions collaborateur mises à jour avec succès' };
  } catch (error: any) {
    console.error('[CollaboratorActions] updateCollaboratorSettingsAction error:', error);
    return { success: false, error: error.message || 'Erreur mise à jour conditions' };
  }
}

/**
 * Activer, suspendre ou terminer une collaboration
 */
export async function updateCollaboratorStatusAction(
  collaboratorId: string,
  status: 'ACTIVE' | 'SUSPENDED' | 'TERMINATED',
  reason?: string
) {
  try {
    const admin = await requireAdmin();

    const currentProfile = await prisma.collaboratorProfile.findUnique({
      where: { id: collaboratorId },
    });

    if (!currentProfile) {
      return { success: false, error: 'Profil collaborateur introuvable' };
    }

    const endDate = status === 'TERMINATED' ? new Date() : currentProfile.endDate;

    await prisma.$transaction(async (tx) => {
      await tx.collaboratorProfile.update({
        where: { id: collaboratorId },
        data: {
          status,
          endDate,
        },
      });

      await tx.financialAuditLog.create({
        data: {
          collaboratorId,
          action: `STATUS_${status}`,
          performedById: admin.id,
          performedByName: admin.username || admin.email,
          oldValue: { status: currentProfile.status },
          newValue: { status },
          reason: reason || `Statut passé à ${status}`,
        },
      });

      await tx.collaboratorActivity.create({
        data: {
          collaboratorId,
          actionType: `STATUS_${status}`,
          description: `Statut modifié vers ${status} par ${admin.username || admin.email}`,
        },
      });
    });

    revalidatePath('/admin/collaborators');
    revalidatePath('/collaborator/dashboard');

    return {
      success: true,
      message: `Collaboration mise à jour : ${status}`,
    };
  } catch (error: any) {
    console.error('[CollaboratorActions] updateCollaboratorStatusAction error:', error);
    return { success: false, error: error.message || 'Erreur modification statut' };
  }
}

/**
 * Enregistrer un paiement vers un collaborateur
 */
export async function recordCollaboratorPaymentAction(data: {
  collaboratorId: string;
  amount: number;
  periodCode: string;
  type?: string;
  paymentMethod: string;
  reference?: string;
  notes?: string;
}) {
  try {
    const admin = await requireAdmin();

    const amount = Math.max(0, Number(data.amount) || 0);
    if (amount <= 0) {
      return { success: false, error: 'Le montant du paiement doit être supérieur à zéro' };
    }

    const collaborator = await prisma.collaboratorProfile.findUnique({
      where: { id: data.collaboratorId },
    });

    if (!collaborator) {
      return { success: false, error: 'Collaborateur introuvable' };
    }

    const periodCode = data.periodCode || new Date().toISOString().slice(0, 7);

    const payment = await prisma.$transaction(async (tx) => {
      const createdPayment = await tx.collaboratorPayment.create({
        data: {
          collaboratorId: collaborator.id,
          amount,
          type: data.type || 'SALARY_AND_COMMISSION',
          paymentMethod: data.paymentMethod || 'BANK_TRANSFER',
          reference: data.reference?.trim() || null,
          notes: data.notes?.trim() || null,
          recordedById: admin.id,
          recordedByName: admin.username || admin.email,
        },
      });

      await tx.financialAuditLog.create({
        data: {
          collaboratorId: collaborator.id,
          action: 'PAYMENT_RECORDED',
          performedById: admin.id,
          performedByName: admin.username || admin.email,
          newValue: {
            amount,
            periodCode,
            paymentMethod: data.paymentMethod,
            reference: data.reference,
          },
          reason: `Paiement enregistré pour la période ${periodCode}`,
        },
      });

      await tx.collaboratorActivity.create({
        data: {
          collaboratorId: collaborator.id,
          actionType: 'PAYMENT_RECEIVED',
          description: `Paiement de ${amount.toLocaleString('fr-FR')} FCFA enregistré (${data.paymentMethod})`,
        },
      });

      return createdPayment;
    });

    revalidatePath('/admin/collaborators');
    revalidatePath('/collaborator/payments');
    revalidatePath('/collaborator/dashboard');

    return { success: true, paymentId: payment.id, message: 'Paiement enregistré avec succès' };
  } catch (error: any) {
    console.error('[CollaboratorActions] recordCollaboratorPaymentAction error:', error);
    return { success: false, error: error.message || 'Erreur enregistrement paiement' };
  }
}

/**
 * Réessayer l'envoi de la notification de bienvenue
 */
export async function resendCollaboratorNotificationAction(collaboratorId: string) {
  try {
    await requireAdmin();

    const collaborator = await prisma.collaboratorProfile.findUnique({
      where: { id: collaboratorId },
      include: {
        user: true,
        CompensationAgreement: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!collaborator) {
      return { success: false, error: 'Collaborateur introuvable' };
    }

    const agreement = collaborator.CompensationAgreement[0] || null;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.baraka.sn';
    const collaboratorName = collaborator.user.username || collaborator.user.email.split('@')[0];

    const emailResult = await emailService.sendCollaboratorWelcomeEmail({
      to: collaborator.user.email,
      collaboratorName,
      title: collaborator.title,
      monthlySalary: agreement?.monthlySalary || 0,
      commissionRate: agreement?.commissionRate || 0,
      commissionBase: agreement?.calculationBase || 'DELIVERED_SALES',
      startDate: collaborator.startDate.toLocaleDateString('fr-FR'),
      dashboardUrl: `${appUrl}/collaborator/dashboard`,
    });

    await prisma.collaboratorNotificationHistory.create({
      data: {
        collaboratorId: collaborator.id,
        email: collaborator.user.email,
        type: 'WELCOME_NOMINATION',
        status: emailResult.success ? (emailResult.simulated ? 'SIMULATED' : 'SENT') : 'FAILED',
        errorMessage: emailResult.error ? JSON.stringify(emailResult.error) : null,
      },
    });

    return { success: true, message: 'Notification renvoyée avec succès' };
  } catch (error: any) {
    console.error('[CollaboratorActions] resendCollaboratorNotificationAction error:', error);
    return { success: false, error: error.message || 'Erreur renvoi notification' };
  }
}

/**
 * Consulter l'historique d'audit d'un collaborateur
 */
export async function getCollaboratorAuditHistoryAction(collaboratorId: string) {
  try {
    await requireAdmin();

    const [auditLogs, notificationLogs, agreements] = await Promise.all([
      prisma.financialAuditLog.findMany({
        where: { collaboratorId },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      prisma.collaboratorNotificationHistory.findMany({
        where: { collaboratorId },
        orderBy: { sentAt: 'desc' },
        take: 10,
      }),
      prisma.compensationAgreement.findMany({
        where: { collaboratorId },
        orderBy: { effectiveFrom: 'desc' },
      }),
    ]);

    return { success: true, auditLogs, notificationLogs, agreements };
  } catch (error: any) {
    console.error('[CollaboratorActions] getCollaboratorAuditHistoryAction error:', error);
    return { success: false, error: error.message || 'Erreur chargement historique' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. VÉRIFICATION DU STATUT POUR LE HEADER (PUBLIC)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Vérification ultra-légère pour le Header (ProfileDropdown)
 * Ne renvoie TRUE que si l'utilisateur connecté est un collaborateur avec status = 'ACTIVE'
 */
export async function checkUserCollaboratorStatusAction(): Promise<{
  isCollaborator: boolean;
  status: string | null;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { isCollaborator: false, status: null };
    }

    const collaborator = await prisma.collaboratorProfile.findUnique({
      where: { userId: session.user.id },
      select: { status: true },
    });

    if (!collaborator || collaborator.status !== 'ACTIVE') {
      return { isCollaborator: false, status: collaborator?.status || null };
    }

    return { isCollaborator: true, status: 'ACTIVE' };
  } catch (error) {
    return { isCollaborator: false, status: null };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ESPACE COLLABORATEUR INDÉPENDANT (/collaborator/*)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Récupère le profil collaborateur authentifié
 */
export async function getCurrentCollaboratorAction() {
  try {
    const collaborator = await requireActiveCollaborator();
    if (!collaborator) {
      return { authorized: false, reason: 'NOT_ACTIVE_OR_NOT_COLLABORATOR' };
    }

    return {
      authorized: true,
      collaborator: {
        id: collaborator.id,
        userId: collaborator.userId,
        name: collaborator.user.username || collaborator.user.email.split('@')[0],
        email: collaborator.user.email,
        phone: collaborator.user.phone,
        image: collaborator.user.image,
        title: collaborator.title,
        status: collaborator.status,
        startDate: collaborator.startDate.toISOString(),
        permissions: collaborator.permissions || [],
        salary: collaborator.activeAgreement?.monthlySalary || 0,
        commissionRate: collaborator.activeAgreement?.commissionRate || 0,
        calculationBase: collaborator.activeAgreement?.calculationBase || 'DELIVERED_SALES',
        eligibleStatuses: collaborator.activeAgreement?.eligibleStatuses || ['DELIVERED'],
      },
    };
  } catch (error: any) {
    return { authorized: false, reason: 'UNAUTHENTICATED' };
  }
}

/**
 * Tableau de bord personnel du collaborateur (/collaborator/dashboard)
 */
export async function getCollaboratorDashboardDataAction(selectedPeriodCode?: string) {
  try {
    const collaborator = await requireActiveCollaborator();
    if (!collaborator) {
      return { authorized: false, reason: 'UNAUTHORIZED' };
    }

    const now = new Date();
    const periodCode = selectedPeriodCode || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const [yearStr, monthStr] = periodCode.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    const periodStart = new Date(year, month - 1, 1);
    const periodEnd = new Date(year, month, 0, 23, 59, 59, 999);

    const activeAgreement = collaborator.activeAgreement;
    const monthlySalary = activeAgreement?.monthlySalary || 0;
    const commissionRate = activeAgreement?.commissionRate || 0;
    const commissionBase = activeAgreement?.calculationBase || 'DELIVERED_SALES';
    const eligibleStatuses = (activeAgreement?.eligibleStatuses || ['DELIVERED']) as any;

    // Calcul dynamique à partir des commandes Baraka Shop
    // Pour DELIVERED_SALES : commandes dont status in eligibleStatuses et createdAt dans la période
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: periodStart,
          lte: periodEnd,
        },
        status: { in: eligibleStatuses },
      },
      select: {
        id: true,
        total: true,
        subtotal: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const monthlyRevenue = orders.reduce((acc, order) => {
      const base = commissionBase === 'DELIVERED_SALES' ? order.total : (order.subtotal || order.total);
      return acc + base;
    }, 0);

    const estimatedCommission = (monthlyRevenue * commissionRate) / 100;

    // Paiements reçus par ce collaborateur pour la période
    const payments = await prisma.collaboratorPayment.findMany({
      where: {
        collaboratorId: collaborator.id,
      },
      orderBy: { paymentDate: 'desc' },
    });

    const totalPaidEver = payments.reduce((acc, p) => acc + p.amount, 0);

    // Calcul de la rémunération totale de la période
    const totalDuePeriod = monthlySalary + estimatedCommission;
    const periodPayments = payments.filter((p) => {
      const pDate = new Date(p.paymentDate);
      return pDate >= periodStart && pDate <= periodEnd;
    });
    const periodPaid = periodPayments.reduce((acc, p) => acc + p.amount, 0);
    const remainingBalance = Math.max(0, totalDuePeriod - periodPaid);

    // Performance des 6 derniers mois pour le graphique
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      const mCode = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const mName = d.toLocaleDateString('fr-FR', { month: 'short' });

      const mOrders = await prisma.order.findMany({
        where: {
          createdAt: { gte: mStart, lte: mEnd },
          status: { in: eligibleStatuses },
        },
        select: { total: true },
      });

      const mRev = mOrders.reduce((acc, o) => acc + o.total, 0);
      const mComm = (mRev * commissionRate) / 100;

      monthlyTrends.push({
        periodCode: mCode,
        month: mName,
        revenue: mRev,
        commission: mComm,
        totalCompensation: monthlySalary + mComm,
      });
    }

    // Récentes activités du collaborateur
    const recentActivities = await prisma.collaboratorActivity.findMany({
      where: { collaboratorId: collaborator.id },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });

    return {
      authorized: true,
      data: {
        periodCode,
        periodLabel: periodStart.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        kpis: {
          monthlyRevenue,
          ordersCount: orders.length,
          monthlySalary,
          commissionRate,
          commissionBase,
          estimatedCommission,
          validatedCommission: estimatedCommission, // calculé côté serveur
          totalCompensation: totalDuePeriod,
          totalPaid: periodPaid,
          remainingBalance,
          totalPaidEver,
        },
        monthlyTrends,
        recentPayments: periodPayments.slice(0, 5).map((p) => ({
          id: p.id,
          amount: p.amount,
          date: p.paymentDate.toISOString(),
          paymentMethod: p.paymentMethod,
          reference: p.reference,
          notes: p.notes,
        })),
        recentActivities: recentActivities.map((a) => ({
          id: a.id,
          actionType: a.actionType,
          description: a.description,
          date: a.createdAt.toISOString(),
        })),
      },
    };
  } catch (error: any) {
    console.error('[CollaboratorActions] getCollaboratorDashboardDataAction error:', error);
    return { authorized: false, error: error.message };
  }
}

/**
 * Commissions détaillées du collaborateur (/collaborator/commissions)
 */
export async function getCollaboratorCommissionsAction(selectedPeriodCode?: string) {
  try {
    const collaborator = await requireActiveCollaborator();
    if (!collaborator) {
      return { authorized: false, reason: 'UNAUTHORIZED' };
    }

    const now = new Date();
    const periodCode = selectedPeriodCode || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const [yearStr, monthStr] = periodCode.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    const periodStart = new Date(year, month - 1, 1);
    const periodEnd = new Date(year, month, 0, 23, 59, 59, 999);

    const activeAgreement = collaborator.activeAgreement;
    const rate = activeAgreement?.commissionRate || 0;
    const eligibleStatuses = (activeAgreement?.eligibleStatuses || ['DELIVERED']) as any;

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: periodStart, lte: periodEnd },
        status: { in: eligibleStatuses },
      },
      select: {
        id: true,
        total: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const entries = orders.map((order) => {
      const commissionAmount = (order.total * rate) / 100;
      return {
        id: order.id,
        orderRef: `#ORD-${order.id.slice(0, 8).toUpperCase()}`,
        date: order.createdAt.toISOString(),
        total: order.total,
        rate,
        commissionAmount,
        status: order.status,
        paymentStatus: order.paymentStatus,
      };
    });

    const totalCommissions = entries.reduce((acc, e) => acc + e.commissionAmount, 0);

    return {
      authorized: true,
      periodCode,
      rate,
      commissionBase: activeAgreement?.calculationBase || 'DELIVERED_SALES',
      totalCommissions,
      entries,
    };
  } catch (error: any) {
    return { authorized: false, error: error.message };
  }
}

/**
 * Paiements perçus par le collaborateur (/collaborator/payments)
 */
export async function getCollaboratorPaymentsAction() {
  try {
    const collaborator = await requireActiveCollaborator();
    if (!collaborator) {
      return { authorized: false, reason: 'UNAUTHORIZED' };
    }

    const payments = await prisma.collaboratorPayment.findMany({
      where: { collaboratorId: collaborator.id },
      orderBy: { paymentDate: 'desc' },
    });

    const totalReceived = payments.reduce((acc, p) => acc + p.amount, 0);

    return {
      authorized: true,
      totalReceived,
      payments: payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        date: p.paymentDate.toISOString(),
        paymentMethod: p.paymentMethod,
        reference: p.reference,
        notes: p.notes,
        recordedByName: p.recordedByName || 'Administration Baraka',
      })),
    };
  } catch (error: any) {
    return { authorized: false, error: error.message };
  }
}

/**
 * Rémunération globale du collaborateur (/collaborator/remuneration)
 */
export async function getCollaboratorRemunerationAction() {
  try {
    const collaborator = await requireActiveCollaborator();
    if (!collaborator) {
      return { authorized: false, reason: 'UNAUTHORIZED' };
    }

    const activeAgreement = collaborator.activeAgreement;
    const agreementsHistory = await prisma.compensationAgreement.findMany({
      where: { collaboratorId: collaborator.id },
      orderBy: { effectiveFrom: 'desc' },
    });

    const payments = await prisma.collaboratorPayment.findMany({
      where: { collaboratorId: collaborator.id },
      orderBy: { paymentDate: 'desc' },
    });

    const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);

    return {
      authorized: true,
      current: {
        salary: activeAgreement?.monthlySalary || 0,
        rate: activeAgreement?.commissionRate || 0,
        base: activeAgreement?.calculationBase || 'DELIVERED_SALES',
        effectiveFrom: activeAgreement?.effectiveFrom.toISOString(),
        frequency: activeAgreement?.paymentFrequency || 'MONTHLY',
        dueDay: activeAgreement?.paymentDueDay || 5,
      },
      totalPaid,
      agreements: agreementsHistory.map((a) => ({
        id: a.id,
        salary: a.monthlySalary,
        rate: a.commissionRate,
        base: a.calculationBase,
        status: a.status,
        effectiveFrom: a.effectiveFrom.toISOString(),
        effectiveTo: a.effectiveTo ? a.effectiveTo.toISOString() : null,
        changeReason: a.changeReason,
      })),
    };
  } catch (error: any) {
    return { authorized: false, error: error.message };
  }
}

/**
 * Soumettre une demande de modification de conditions (/collaborator/profile)
 */
export async function submitCompensationModificationRequestAction(data: {
  requestedSalary?: number;
  requestedRate?: number;
  requestedBase?: string;
  reason: string;
}) {
  try {
    const collaborator = await requireActiveCollaborator();
    if (!collaborator) {
      return { authorized: false, reason: 'UNAUTHORIZED' };
    }

    if (!data.reason?.trim()) {
      return { success: false, error: 'Veuillez préciser le motif de votre demande' };
    }

    const request = await prisma.compensationChangeRequest.create({
      data: {
        collaboratorId: collaborator.id,
        requestedSalary: data.requestedSalary ? Number(data.requestedSalary) : null,
        requestedRate: data.requestedRate ? Number(data.requestedRate) : null,
        requestedBase: data.requestedBase?.trim() || null,
        reason: data.reason.trim(),
        status: 'PENDING',
      },
    });

    await prisma.collaboratorActivity.create({
      data: {
        collaboratorId: collaborator.id,
        actionType: 'REQUEST_SUBMITTED',
        description: `Demande de révision des conditions financières soumise : "${data.reason.slice(0, 60)}..."`,
      },
    });

    return {
      success: true,
      requestId: request.id,
      message: 'Votre demande a été transmise à l\'administration Baraka Shop',
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erreur lors de la soumission' };
  }
}

/**
 * Consulter l'historique de ses demandes de modification (/collaborator/profile)
 */
export async function getCollaboratorModificationRequestsAction() {
  try {
    const collaborator = await requireActiveCollaborator();
    if (!collaborator) {
      return { authorized: false, reason: 'UNAUTHORIZED' };
    }

    const requests = await prisma.compensationChangeRequest.findMany({
      where: { collaboratorId: collaborator.id },
      orderBy: { createdAt: 'desc' },
    });

    return {
      authorized: true,
      requests: requests.map((r) => ({
        id: r.id,
        requestedSalary: r.requestedSalary,
        requestedRate: r.requestedRate,
        requestedBase: r.requestedBase,
        reason: r.reason,
        status: r.status,
        reviewNote: r.reviewNote,
        createdAt: r.createdAt.toISOString(),
        reviewedAt: r.reviewedAt ? r.reviewedAt.toISOString() : null,
      })),
    };
  } catch (error: any) {
    return { authorized: false, error: error.message };
  }
}

/**
 * Journal des activités du collaborateur (/collaborator/activities)
 */
export async function getCollaboratorActivitiesAction() {
  try {
    const collaborator = await requireActiveCollaborator();
    if (!collaborator) {
      return { authorized: false, reason: 'UNAUTHORIZED' };
    }

    const activities = await prisma.collaboratorActivity.findMany({
      where: { collaboratorId: collaborator.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return {
      authorized: true,
      activities: activities.map((a) => ({
        id: a.id,
        actionType: a.actionType,
        description: a.description,
        date: a.createdAt.toISOString(),
      })),
    };
  } catch (error: any) {
    return { authorized: false, error: error.message };
  }
}
