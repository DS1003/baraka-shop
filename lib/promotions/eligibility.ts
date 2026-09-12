'use server';

import prisma from '@/lib/prisma';

/**
 * Check if a user is eligible for a first-purchase-only campaign.
 * Returns true if the user has never completed a non-cancelled order.
 */
export async function isFirstPurchaseEligible(userId: string): Promise<boolean> {
  const completedOrders = await prisma.order.count({
    where: {
      userId,
      status: { not: 'CANCELLED' },
    },
  });

  return completedOrders === 0;
}

/**
 * Check how many times a user has used a specific campaign's coupon.
 */
export async function getUserCouponUsageCount(
  campaignId: string,
  userId: string
): Promise<number> {
  return prisma.couponUsage.count({
    where: {
      campaignId,
      userId,
    },
  });
}

/**
 * Record a coupon usage after a successful order.
 */
export async function recordCouponUsage(
  campaignId: string,
  userId: string,
  orderId: string
): Promise<void> {
  await prisma.$transaction([
    prisma.couponUsage.create({
      data: {
        campaignId,
        userId,
        orderId,
      },
    }),
    prisma.promotionCampaign.update({
      where: { id: campaignId },
      data: {
        codeUses: { increment: 1 },
      },
    }),
  ]);
}

/**
 * Update campaign revenue statistics after a successful order.
 */
export async function updateCampaignStats(
  campaignId: string,
  orderTotal: number,
  discountAmount: number
): Promise<void> {
  await prisma.promotionCampaign.update({
    where: { id: campaignId },
    data: {
      totalRevenue: { increment: orderTotal },
      totalDiscount: { increment: discountAmount },
    },
  });
}
