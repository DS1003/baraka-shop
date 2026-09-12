'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    throw new Error('Accès non autorisé');
  }
  return session;
}

// ─── GET ALL CAMPAIGNS ───────────────────────────────────────────────────────

export async function getCampaigns(query?: string) {
  try {
    await requireAdmin();
    const whereClause: any = {};
    if (query) {
      whereClause.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { couponCode: { contains: query, mode: 'insensitive' } },
      ];
    }

    const campaigns = await prisma.promotionCampaign.findMany({
      where: whereClause,
      include: {
        _count: { select: { usages: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return campaigns;
  } catch (error) {
    console.error('Fetch campaigns error:', error);
    return [];
  }
}

// ─── GET CAMPAIGN BY ID ──────────────────────────────────────────────────────

export async function getCampaignById(id: string) {
  try {
    await requireAdmin();
    const campaign = await prisma.promotionCampaign.findUnique({
      where: { id },
      include: {
        _count: { select: { usages: true } },
        usages: {
          take: 20,
          orderBy: { usedAt: 'desc' },
        },
      },
    });
    return campaign;
  } catch (error) {
    console.error('Fetch campaign error:', error);
    return null;
  }
}

// ─── CREATE CAMPAIGN ─────────────────────────────────────────────────────────

interface CreateCampaignData {
  name: string;
  title?: string;
  description?: string;
  discountType: string;
  discountValue: number;
  couponCode: string;
  startDate: Date;
  endDate: Date;
  isActive?: boolean;
  showPopup?: boolean;
  popupTitle?: string;
  popupDescription?: string;
  popupImage?: string;
  ctaText?: string;
  ctaLink?: string;
  maxUses?: number | null;
  maxUsesPerUser?: number;
  minimumOrderAmount?: number;
  firstPurchaseOnly?: boolean;
  displayFrequency?: string;
}

export async function createCampaign(data: CreateCampaignData) {
  try {
    await requireAdmin();

    if (data.startDate >= data.endDate) {
      return { success: false, message: 'La date de fin doit être après la date de début.' };
    }

    if (data.discountValue <= 0) {
      return { success: false, message: 'La valeur de la réduction doit être positive.' };
    }

    if (data.discountType === 'PERCENTAGE' && data.discountValue > 100) {
      return { success: false, message: 'Le pourcentage ne peut pas dépasser 100%.' };
    }

    // Check for duplicate coupon code
    const existing = await prisma.promotionCampaign.findUnique({
      where: { couponCode: data.couponCode.toUpperCase() },
    });
    if (existing) {
      return { success: false, message: 'Ce code promo existe déjà.' };
    }

    const campaign = await prisma.promotionCampaign.create({
      data: {
        ...data,
        couponCode: data.couponCode.toUpperCase(),
        ctaText: data.ctaText || "Profiter de l'offre",
        ctaLink: data.ctaLink || "/boutique",
      },
    });

    revalidatePath('/admin/marketing/campaigns');
    return { success: true, campaign };
  } catch (error: any) {
    console.error('Create campaign error:', error);
    return { success: false, message: error.message || 'Erreur lors de la création.' };
  }
}

// ─── UPDATE CAMPAIGN ─────────────────────────────────────────────────────────

export async function updateCampaign(id: string, data: Partial<CreateCampaignData>) {
  try {
    await requireAdmin();

    const updateData: any = { ...data };
    if (data.couponCode) {
      updateData.couponCode = data.couponCode.toUpperCase();
    }
    if ('ctaText' in data) {
      updateData.ctaText = data.ctaText || "Profiter de l'offre";
    }
    if ('ctaLink' in data) {
      updateData.ctaLink = data.ctaLink || "/boutique";
    }

    const campaign = await prisma.promotionCampaign.update({
      where: { id },
      data: updateData,
    });

    revalidatePath('/admin/marketing/campaigns');
    return { success: true, campaign };
  } catch (error: any) {
    console.error('Update campaign error:', error);
    return { success: false, message: error.message || 'Erreur lors de la mise à jour.' };
  }
}

// ─── TOGGLE CAMPAIGN ACTIVE ──────────────────────────────────────────────────

export async function toggleCampaignActive(id: string) {
  try {
    await requireAdmin();
    const campaign = await prisma.promotionCampaign.findUnique({ where: { id } });
    if (!campaign) {
      return { success: false, message: 'Campagne introuvable.' };
    }

    const updated = await prisma.promotionCampaign.update({
      where: { id },
      data: { isActive: !campaign.isActive },
    });

    revalidatePath('/admin/marketing/campaigns');
    return { success: true, isActive: updated.isActive };
  } catch (error: any) {
    console.error('Toggle campaign error:', error);
    return { success: false, message: error.message };
  }
}

// ─── DELETE CAMPAIGN ─────────────────────────────────────────────────────────

export async function deleteCampaign(id: string) {
  try {
    await requireAdmin();
    await prisma.promotionCampaign.delete({ where: { id } });

    revalidatePath('/admin/marketing/campaigns');
    return { success: true };
  } catch (error: any) {
    console.error('Delete campaign error:', error);
    return { success: false, message: 'Impossible de supprimer la campagne.' };
  }
}
