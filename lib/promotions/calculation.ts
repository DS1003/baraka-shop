/**
 * Server-side discount calculation.
 * This is the SOURCE OF TRUTH — never trust frontend calculations.
 */

export interface DiscountCalculation {
  discountAmount: number;
  finalSubtotal: number;
}

/**
 * Calculate the discount amount based on the campaign type and value.
 * Ensures the discount never exceeds the subtotal and never goes negative.
 */
export function calculateDiscount(
  subtotal: number,
  discountType: string,
  discountValue: number
): DiscountCalculation {
  if (subtotal <= 0 || discountValue <= 0) {
    return { discountAmount: 0, finalSubtotal: subtotal };
  }

  let discountAmount = 0;

  if (discountType === 'PERCENTAGE') {
    // Clamp percentage to 0-100
    const clampedPercentage = Math.min(Math.max(discountValue, 0), 100);
    discountAmount = Math.round(subtotal * (clampedPercentage / 100));
  } else if (discountType === 'FIXED_AMOUNT') {
    discountAmount = Math.round(Math.max(discountValue, 0));
  }

  // Never allow discount to exceed the subtotal
  discountAmount = Math.min(discountAmount, subtotal);

  // Never allow negative discount
  discountAmount = Math.max(discountAmount, 0);

  const finalSubtotal = subtotal - discountAmount;

  return {
    discountAmount,
    finalSubtotal: Math.max(finalSubtotal, 0),
  };
}

/**
 * Format discount for display.
 */
export function formatDiscount(discountType: string, discountValue: number): string {
  if (discountType === 'PERCENTAGE') {
    return `${discountValue}%`;
  }
  return `${discountValue.toLocaleString()} FCFA`;
}
