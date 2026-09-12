import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/promotions/active-campaign
 * Returns the currently active campaign for the popup (public endpoint).
 * Only exposes popup-relevant data, not sensitive config like maxUses.
 */
export async function GET() {
  try {
    const now = new Date();

    const campaign = await prisma.promotionCampaign.findFirst({
      where: {
        isActive: true,
        showPopup: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      select: {
        id: true,
        name: true,
        popupTitle: true,
        popupDescription: true,
        popupImage: true,
        ctaText: true,
        ctaLink: true,
        couponCode: true,
        discountType: true,
        discountValue: true,
        displayFrequency: true,
        firstPurchaseOnly: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!campaign) {
      return NextResponse.json({ campaign: null });
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error('Error fetching active campaign:', error);
    return NextResponse.json({ campaign: null });
  }
}
