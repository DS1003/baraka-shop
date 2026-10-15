import { Resend } from 'resend';
import { render } from '@react-email/render';
import OrderShippedEmail from '@/emails/OrderShipped';
import OrderCreatedEmail from '@/emails/OrderCreated';

// Initialize Resend
// fallback to a dummy key to prevent crashes if env var is missing during build/dev
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'; // Sandbox mode par défaut

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface OrderShippedPayload {
  to: string;
  orderRef: string;
  clientName: string;
  date: string;
  deliveryAddress?: string;
  phone?: string;
  deliveryMethod: string;
  paymentMethod: string;
  paymentStatus: 'PAID' | 'PENDING' | 'ON_DELIVERY';
  total: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  estimatedDelivery?: string;
  items: OrderItem[];
  logoUrl?: string;
}

/**
 * Service centralisé pour l'envoi d'emails transactionnels
 */
export const emailService = {
  /**
   * Envoyer l'email "Commande expédiée"
   */
  async sendOrderShippedEmail(payload: OrderShippedPayload) {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.warn('⚠️ RESEND_API_KEY non configurée. Simulation de l\'envoi d\'email à', payload.to);
        return { success: true, simulated: true };
      }

      const htmlContent = await render(OrderShippedEmail(payload));

      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [payload.to],
        subject: `🚚 Votre commande ${payload.orderRef} est en cours de livraison !`,
        html: htmlContent,
      });

      if (error) {
        console.error('[EmailService] Erreur Resend:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('[EmailService] Exception lors de l\'envoi:', error);
      return { success: false, error };
    }
  },

  /**
   * Envoyer l'email "Commande Validée"
   */
  async sendOrderCreatedEmail(payload: OrderShippedPayload) {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.warn('⚠️ RESEND_API_KEY non configurée. Simulation de l\'envoi d\'email (Created) à', payload.to);
        return { success: true, simulated: true };
      }

      const htmlContent = await render(OrderCreatedEmail(payload));

      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [payload.to],
        subject: `🎉 Confirmation de votre commande ${payload.orderRef}`,
        html: htmlContent,
      });

      if (error) {
        console.error('[EmailService] Erreur Resend (Created):', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('[EmailService] Exception lors de l\'envoi (Created):', error);
      return { success: false, error };
    }
  },

  /**
   * Envoyer l'email de notification aux administrateurs pour un nouveau message de contact
   */
  async sendContactNotificationEmail(payload: {
    name: string;
    email: string;
    phone?: string | null;
    subject: string;
    message: string;
    createdAt?: Date;
  }) {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.warn('⚠️ RESEND_API_KEY non configurée. Simulation de notification contact pour', payload.email);
        return { success: true, simulated: true };
      }

      const adminRecipient = process.env.ADMIN_CONTACT_EMAIL || 'contact@baraka.sn';
      const formattedDate = (payload.createdAt || new Date()).toLocaleString('fr-FR', {
        dateStyle: 'full',
        timeStyle: 'short',
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
            .header { background: #1B1F3B; padding: 32px 28px; text-align: center; color: #ffffff; }
            .badge { display: inline-block; background: #ea580c; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; padding: 4px 12px; border-radius: 9999px; margin-bottom: 12px; }
            .title { font-size: 22px; font-weight: 800; margin: 0; letter-spacing: -0.02em; }
            .body { padding: 32px 28px; }
            .meta-grid { background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 18px; margin-bottom: 24px; }
            .meta-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
            .meta-label { font-weight: 700; color: #64748b; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em; }
            .meta-value { font-weight: 600; color: #0f172a; text-align: right; }
            .message-box { background: #fff7ed; border-left: 4px solid #ea580c; padding: 18px; border-radius: 8px; font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 28px; white-space: pre-wrap; }
            .button { display: inline-block; background: #ea580c; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; padding: 12px 24px; border-radius: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
            .footer { padding: 20px 28px; background: #f1f5f9; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <span class="badge">Nouveau Message Contact</span>
              <h1 class="title">Baraka Shop — Service Client</h1>
            </div>
            <div class="body">
              <div class="meta-grid">
                <div style="margin-bottom: 10px;"><strong class="meta-label">Client :</strong> <span style="font-size: 14px; font-weight: 700; color: #0f172a;">${payload.name}</span></div>
                <div style="margin-bottom: 10px;"><strong class="meta-label">Email :</strong> <a href="mailto:${payload.email}" style="color: #ea580c; font-weight: 600;">${payload.email}</a></div>
                ${payload.phone ? `<div style="margin-bottom: 10px;"><strong class="meta-label">Téléphone :</strong> <a href="tel:${payload.phone}" style="color: #0f172a; font-weight: 600;">${payload.phone}</a></div>` : ''}
                <div style="margin-bottom: 10px;"><strong class="meta-label">Sujet :</strong> <span style="font-size: 13px; font-weight: 600; color: #1e293b;">${payload.subject}</span></div>
                <div><strong class="meta-label">Date :</strong> <span style="font-size: 12px; color: #64748b;">${formattedDate}</span></div>
              </div>

              <div style="margin-bottom: 8px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b;">Contenu du message :</div>
              <div class="message-box">${payload.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>

              <div style="text-align: center; margin-top: 24px;">
                <a href="mailto:${payload.email}?subject=Re: ${encodeURIComponent(payload.subject)}" class="button">
                  ✉️ Répondre directement à ${payload.name}
                </a>
              </div>
            </div>
            <div class="footer">
              Ce message a été envoyé depuis le formulaire de contact sur <strong>baraka.sn</strong>.<br/>
              Consultez tous vos messages dans votre <a href="${process.env.NEXTAUTH_URL || 'https://baraka.sn'}/admin/messages" style="color: #ea580c;">Tableau de bord Admin</a>.
            </div>
          </div>
        </body>
        </html>
      `;

      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [adminRecipient],
        replyTo: payload.email,
        subject: `📬 [Baraka Contact] ${payload.subject} - De ${payload.name}`,
        html: htmlContent,
      });

      if (error) {
        console.error('[EmailService] Erreur Resend Contact:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('[EmailService] Exception lors de l\'envoi Contact:', error);
      return { success: false, error };
    }
  },

  /**
   * Envoyer l'email de notification automatique de réapprovisionnement aux administrateurs
   */
  async sendProductRestockedEmail(payload: {
    recipients: string[];
    productName: string;
    reference?: string | null;
    categoryName?: string | null;
    price: number;
    oldStock: number;
    newStock: number;
    restockedAt?: Date;
    productImageUrl?: string | null;
    productId: string;
    logoUrl?: string;
  }) {
    try {
      if (!payload.recipients || payload.recipients.length === 0) {
        return { success: false, error: 'Aucun destinataire configuré' };
      }

      if (!process.env.RESEND_API_KEY) {
        console.warn('⚠️ RESEND_API_KEY non configurée. Simulation de notification réapprovisionnement à', payload.recipients.join(', '));
        return { success: true, simulated: true };
      }

      const baseUrl = process.env.NEXTAUTH_URL || 'https://baraka.sn';
      const adminManageUrl = `${baseUrl}/admin/out-of-stock`;

      const formattedDate = (payload.restockedAt || new Date()).toLocaleString('fr-FR', {
        dateStyle: 'long',
        timeStyle: 'short',
      });

      const ProductRestockedEmail = (await import('@/emails/ProductRestocked')).default;
      const htmlContent = await render(ProductRestockedEmail({
        productName: payload.productName,
        reference: payload.reference,
        categoryName: payload.categoryName,
        price: payload.price,
        oldStock: payload.oldStock,
        newStock: payload.newStock,
        restockedAt: formattedDate,
        productImageUrl: payload.productImageUrl,
        adminManageUrl,
        logoUrl: payload.logoUrl,
      }));

      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: payload.recipients,
        subject: `[Baraka] Produit réapprovisionné — Vérification requise (${payload.productName})`,
        html: htmlContent,
      });

      if (error) {
        console.error('[EmailService] Erreur Resend Restock:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('[EmailService] Exception lors de l\'envoi Restock:', error);
      return { success: false, error };
    }
  },

  /**
   * Envoyer un email de test de configuration des notifications
   */
  async sendTestNotificationEmail(recipient: string) {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.warn('⚠️ RESEND_API_KEY non configurée. Simulation test email à', recipient);
        return { success: true, simulated: true };
      }

      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [recipient],
        subject: `✅ [Baraka Test] Vérification des notifications de réapprovisionnement`,
        html: `
          <div style="font-family: sans-serif; padding: 24px; color: #0f172a; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #ea580c; margin-top: 0;">Baraka Shop — Test de notification</h2>
            <p>Cet e-mail confirme que votre adresse e-mail est correctement configurée pour recevoir les notifications automatiques de réapprovisionnement de produits.</p>
            <p style="font-size: 12px; color: #64748b; margin-top: 24px;">Envoyé depuis le panneau d'administration Baraka.</p>
          </div>
        `,
      });

      if (error) {
        console.error('[EmailService] Erreur test email:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('[EmailService] Exception test email:', error);
      return { success: false, error };
    }
  }
};


