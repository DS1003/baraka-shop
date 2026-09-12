import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/promotions/track
 * Tracks analytics events for promotion campaigns.
 * Events: popup_view, popup_click, code_copy
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campaignId, event } = body;

    if (!campaignId || !event) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const validEvents: Record<string, string> = {
      popup_view: 'popupViews',
      popup_click: 'popupClicks',
      code_copy: 'codeCopies',
    };

    const field = validEvents[event];
    if (!field) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    await prisma.promotionCampaign.update({
      where: { id: campaignId },
      data: { [field]: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // Non-blocking — analytics failures shouldn't break the user experience
    console.error('Track event error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
