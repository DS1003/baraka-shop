import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { validateCoupon } from '@/lib/promotions/validation';
import { calculateDiscount } from '@/lib/promotions/calculation';
import { rateLimit } from '@/lib/rate-limit';

/**
 * POST /api/promotions/validate-coupon
 * Validates a coupon code and returns the calculated discount.
 * Requires authentication for first-purchase-only coupons.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon';
    // Protection anti-bruteforce / énumération de coupons : 15 essais max par minute par IP
    const limiter = await rateLimit(`coupon_validate:${ip}`, 15, 60);
    if (!limiter.success) {
      return NextResponse.json(
        { valid: false, error: 'Trop de tentatives de validation. Veuillez patienter une minute.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { code, subtotal } = body;

    if (!code || typeof subtotal !== 'number') {
      return NextResponse.json(
        { valid: false, error: 'Paramètres invalides.' },
        { status: 400 }
      );
    }

    // Get authenticated user (may be null for guest users)
    const session = await auth();
    const userId = session?.user?.id || null;

    // Validate the coupon
    const validation = await validateCoupon(code, userId, subtotal);

    if (!validation.valid || !validation.campaign) {
      return NextResponse.json({
        valid: false,
        error: validation.error,
      });
    }

    // Calculate the discount server-side
    const { discountAmount, finalSubtotal } = calculateDiscount(
      subtotal,
      validation.campaign.discountType,
      validation.campaign.discountValue
    );

    return NextResponse.json({
      valid: true,
      couponCode: validation.campaign.couponCode,
      campaignName: validation.campaign.name,
      discountType: validation.campaign.discountType,
      discountValue: validation.campaign.discountValue,
      discountAmount,
      finalSubtotal,
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json(
      { valid: false, error: 'Erreur serveur.' },
      { status: 500 }
    );
  }
}
