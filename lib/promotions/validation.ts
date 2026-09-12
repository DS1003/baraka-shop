'use server';

import prisma from '@/lib/prisma';

export interface CouponValidationResult {
  valid: boolean;
  error?: string;
  campaign?: {
    id: string;
    name: string;
    couponCode: string;
    discountType: string;
    discountValue: number;
    minimumOrderAmount: number;
    firstPurchaseOnly: boolean;
  };
}

/**
 * Validates a coupon code server-side.
 * Checks: existence, active status, date validity, max uses, per-user limits, minimum order amount, first purchase eligibility.
 */
export async function validateCoupon(
  code: string,
  userId: string | null,
  subtotal: number
): Promise<CouponValidationResult> {
  if (!code || !code.trim()) {
    return { valid: false, error: 'Veuillez entrer un code promo.' };
  }

  // 1. Check existence
  const campaign = await prisma.promotionCampaign.findUnique({
    where: { couponCode: code.trim().toUpperCase() },
    include: {
      _count: { select: { usages: true } },
    },
  });

  if (!campaign) {
    return { valid: false, error: 'Ce code promo est invalide.' };
  }

  // 2. Check active status
  if (!campaign.isActive) {
    return { valid: false, error: 'Cette offre promotionnelle n\'est plus active.' };
  }

  // 3. Check dates
  const now = new Date();
  if (now < campaign.startDate) {
    return { valid: false, error: 'Cette offre n\'est pas encore disponible.' };
  }
  if (now > campaign.endDate) {
    return { valid: false, error: 'Cette offre promotionnelle a expiré.' };
  }

  // 4. Check global max uses
  if (campaign.maxUses !== null && campaign._count.usages >= campaign.maxUses) {
    return { valid: false, error: 'Cette offre a atteint son nombre maximum d\'utilisations.' };
  }

  // 5. Check minimum order amount
  if (subtotal < campaign.minimumOrderAmount) {
    return {
      valid: false,
      error: `Le montant minimum de commande pour ce code est de ${campaign.minimumOrderAmount.toLocaleString()} FCFA.`,
    };
  }

  // 6. Per-user checks (require authentication)
  if (userId) {
    // Check per-user usage limit
    const userUsageCount = await prisma.couponUsage.count({
      where: {
        campaignId: campaign.id,
        userId: userId,
      },
    });

    if (userUsageCount >= campaign.maxUsesPerUser) {
      return { valid: false, error: 'Vous avez déjà utilisé ce code promo.' };
    }

    // 7. Check first purchase eligibility
    if (campaign.firstPurchaseOnly) {
      const previousOrders = await prisma.order.count({
        where: {
          userId: userId,
          status: { not: 'CANCELLED' },
        },
      });

      if (previousOrders > 0) {
        return {
          valid: false,
          error: 'Cette offre est réservée aux nouveaux clients (première commande).',
        };
      }
    }
  } else if (campaign.firstPurchaseOnly) {
    // For non-logged-in users, we can't verify first purchase — require login
    return {
      valid: false,
      error: 'Connectez-vous pour utiliser ce code réservé aux nouveaux clients.',
    };
  }

  return {
    valid: true,
    campaign: {
      id: campaign.id,
      name: campaign.name,
      couponCode: campaign.couponCode,
      discountType: campaign.discountType,
      discountValue: campaign.discountValue,
      minimumOrderAmount: campaign.minimumOrderAmount,
      firstPurchaseOnly: campaign.firstPurchaseOnly,
    },
  };
}
