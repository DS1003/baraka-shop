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
};
