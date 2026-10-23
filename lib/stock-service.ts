import prisma from '@/lib/prisma';
import { emailService } from '@/lib/email-service';
import { invalidateCache, invalidatePrefix } from '@/lib/redis';
import { revalidatePath } from 'next/cache';

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch (e) {
    // Ignored outside of Next.js server request context (e.g. CLI, cron, background tasks)
  }
}

export type StockOperationSource = 
  | 'ORDER'
  | 'ADMIN_INVENTORY'
  | 'ADMIN_PRODUCT_FORM'
  | 'FTP_SYNC'
  | 'CSV_IMPORT'
  | 'ORDER_CANCEL'
  | 'OTHER';

export interface ProcessStockChangeParams {
  productId: string;
  previousStock: number;
  newStock: number;
  source: StockOperationSource;
  // If true, even if stock > 0, do NOT automatically publish if admin explicitly asked to unpublish/publish
  manualIsPublished?: boolean;
}

/**
 * Service centralisé pour gérer les transitions de stock et l'état de publication:
 * - Si stock <= 0 : désactivation automatique (isPublished: false, deactivationReason: 'OUT_OF_STOCK')
 * - Si stock > 0 après une désactivation 'OUT_OF_STOCK' :
 *     * Le produit RESTE désactivé (isPublished: false)
 *     * Marqué restockPendingReview = true, restockedAt = NOW(), lastRestockedQty = newStock
 *     * Déclenchement de la notification email aux administrateurs configurés
 */
export async function processStockChange({
  productId,
  previousStock,
  newStock,
  source,
  manualIsPublished,
}: ProcessStockChangeParams) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        reference: true,
        price: true,
        stock: true,
        isPublished: true,
        deactivationReason: true,
        restockPendingReview: true,
        images: true,
        category: { select: { name: true } },
      },
    });

    if (!product) return { success: false, error: 'Product not found' };

    const updateData: Record<string, any> = {
      stock: newStock,
    };

    let shouldNotifyRestock = false;

    // RÈGLE A: Le stock tombe à zéro (ou est négatif/nul)
    if (newStock <= 0) {
      updateData.isPublished = false;
      updateData.deactivationReason = 'OUT_OF_STOCK';
      updateData.deactivatedAt = new Date();
      updateData.restockPendingReview = false;
    } 
    // RÈGLE C: Le stock redevient positif après avoir été désactivé pour rupture de stock
    else if (previousStock <= 0 && newStock > 0 && product.deactivationReason === 'OUT_OF_STOCK') {
      // Le produit RESTE masqué jusqu'à validation explicite de l'administrateur
      updateData.isPublished = false;
      updateData.restockPendingReview = true;
      updateData.restockedAt = new Date();
      updateData.lastRestockedQty = newStock;
      
      // On n'envoie la notification que si le produit n'était pas déjà en attente pour cet épisode
      if (!product.restockPendingReview) {
        shouldNotifyRestock = true;
      }
    } 
    // Cas où l'administrateur a spécifié manuellement isPublished
    else if (typeof manualIsPublished === 'boolean') {
      if (newStock <= 0) {
        // Interdiction absolue de publier un produit avec stock <= 0
        updateData.isPublished = false;
        updateData.deactivationReason = 'OUT_OF_STOCK';
      } else {
        updateData.isPublished = manualIsPublished;
        if (!manualIsPublished) {
          updateData.deactivationReason = 'MANUAL';
          updateData.deactivatedAt = new Date();
        } else {
          // L'administrateur active le produit
          updateData.deactivationReason = null;
          updateData.restockPendingReview = false;
        }
      }
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    // Invalider les caches Redis & Next.js
    try {
      await invalidateCache(`product:${productId}`);
      await invalidatePrefix('products:');
      await invalidatePrefix('similar:');
      await invalidatePrefix('categories:');
      await invalidatePrefix('brands:');
      await invalidatePrefix('stores:');
      await invalidatePrefix('admin:products:');
      await invalidatePrefix('admin:out-of-stock:');
      await invalidatePrefix('admin:dashboard:');
      await invalidatePrefix('admin:category:');
    } catch (e) {
      console.warn('[StockService] Redis cache invalidation notice:', e);
    }

    safeRevalidatePath('/');
    safeRevalidatePath('/boutique');
    safeRevalidatePath('/nouveautes');
    safeRevalidatePath(`/product/${productId}`);
    safeRevalidatePath('/admin/products');
    safeRevalidatePath('/admin/inventory');
    safeRevalidatePath('/admin/out-of-stock');

    // Déclencher la notification email en arrière-plan si applicable
    if (shouldNotifyRestock) {
      sendRestockNotificationAsync({
        productId: product.id,
        productName: product.name,
        reference: product.reference,
        categoryName: product.category?.name,
        price: product.price || 0,
        oldStock: previousStock,
        newStock: newStock,
        productImageUrl: product.images?.[0] || null,
      }).catch((err) => {
        console.error('[StockService] Restock email trigger error:', err);
      });
    }

    return { success: true, product: updated };
  } catch (error: any) {
    console.error('[StockService] Error processing stock change:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Envoi asynchrone sécurisé de la notification de réapprovisionnement aux admins configurés
 */
export async function sendRestockNotificationAsync(data: {
  productId: string;
  productName: string;
  reference?: string | null;
  categoryName?: string | null;
  price: number;
  oldStock: number;
  newStock: number;
  productImageUrl?: string | null;
}) {
  try {
    const siteConfig = await prisma.siteConfig.findUnique({
      where: { id: 'singleton' },
    });
    
    // Vérifier si les notifications sont activées
    if (!siteConfig || siteConfig.restockNotificationsEnabled === false) {
      console.log('[StockService] Restock notifications are disabled or not configured in SiteConfig.');
      return;
    }

    const recipients = siteConfig.restockNotificationEmails || [];
    if (recipients.length === 0) {
      console.warn('[StockService] No admin email addresses configured for restock notifications.');
      return;
    }

    await emailService.sendProductRestockedEmail({
      recipients,
      productId: data.productId,
      productName: data.productName,
      reference: data.reference,
      categoryName: data.categoryName,
      price: data.price,
      oldStock: data.oldStock,
      newStock: data.newStock,
      productImageUrl: data.productImageUrl,
      restockedAt: new Date(),
      logoUrl: siteConfig.headerLogo || undefined,
    });
  } catch (err) {
    console.error('[StockService] Failed to send restock email:', err);
  }
}

/**
 * Réactivation manuelle d'un produit par l'administrateur
 * - Vérification stricte côté serveur que stock > 0
 * - Retrait du statut restockPendingReview et deactivationReason
 * - Publication du produit (isPublished: true)
 */
export async function reactivateProduct(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, stock: true, name: true }
  });

  if (!product) {
    return { success: false, error: 'Produit introuvable.' };
  }

  if (product.stock <= 0) {
    return {
      success: false,
      error: "Impossible de réactiver ce produit : aucune unité n'est disponible en stock."
    };
  }

  const updated = await prisma.product.update({
    where: { id: productId },
    data: {
      isPublished: true,
      deactivationReason: null,
      restockPendingReview: false,
      updatedAt: new Date(),
    }
  });

  try {
    await invalidateCache(`product:${productId}`);
    await invalidatePrefix('products:');
    await invalidatePrefix('similar:');
    await invalidatePrefix('categories:');
    await invalidatePrefix('brands:');
    await invalidatePrefix('stores:');
    await invalidatePrefix('admin:products:');
    await invalidatePrefix('admin:out-of-stock:');
    await invalidatePrefix('admin:dashboard:');
    await invalidatePrefix('admin:category:');
  } catch (e) {
    console.warn('[StockService] Redis cache invalidation error:', e);
  }

  safeRevalidatePath('/');
  safeRevalidatePath('/boutique');
  safeRevalidatePath('/nouveautes');
  safeRevalidatePath(`/product/${productId}`);
  safeRevalidatePath('/admin/products');
  safeRevalidatePath('/admin/inventory');
  safeRevalidatePath('/admin/out-of-stock');

  return { success: true, product: updated };
}
