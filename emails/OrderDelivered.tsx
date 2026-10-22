import * as React from 'react';
import { Layout } from './Layout';
import {
  Hero,
  StatusCard,
  DetailCard,
  ItemsList,
  Receipt,
  Callout,
  Actions,
  StatusDot,
  getPaymentState,
  isCashOnDeliveryPayment,
  SHOP_URL,
  type OrderShippedEmailProps,
} from './_shared';

export const OrderDeliveredEmail = ({
  orderRef = '#ORD-7D07A337',
  orderId,
  clientName = 'Client',
  date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
  deliveryAddress = 'Dakar, Sénégal',
  deliveryMethod = 'Livraison à domicile',
  paymentMethod = 'Paiement à la livraison',
  paymentStatus = 'PAID',
  total = 0,
  subtotal = 0,
  deliveryFee = 0,
  discount = 0,
  items = [],
  logoUrl,
}: OrderShippedEmailProps) => {
  const isPickup = deliveryMethod.toLowerCase().includes('retrait');
  const firstName = (clientName || 'Client').split(' ')[0];
  // Une commande livrée est réglée (paiement encaissé à la remise), sauf cas de remboursement / échec explicite
  const effectiveStatus = paymentStatus === 'REFUNDED' || paymentStatus === 'FAILED' ? paymentStatus : 'PAID';

  return (
    <Layout previewText={`Votre commande ${orderRef} a bien été livrée. Merci ${firstName} !`} logoUrl={logoUrl}>
      <Hero
        eyebrow="Commande livrée"
        tone="success"
        title="Bonne découverte !"
        subtitle={`${firstName}, votre commande vous a bien été remise. Nous espérons que vos articles vous apporteront entière satisfaction.`}
      />

      <StatusCard
        orderRef={orderRef}
        date={date}
        reached={4}
        tone="success"
        note="Votre facture et votre bon de livraison sont disponibles dans votre espace client."
      />

      <DetailCard
        title="Récapitulatif"
        rows={[
          { label: 'Client', value: clientName },
          { label: isPickup ? 'Retrait' : 'Livré à', value: isPickup ? 'En boutique' : deliveryAddress || 'Dakar, Sénégal' },
          { label: 'Paiement', value: paymentMethod },
          {
            label: 'Statut',
            value: <StatusDot {...getPaymentState(effectiveStatus, isCashOnDeliveryPayment(paymentMethod, paymentStatus))} />,
          },
        ]}
      />

      <ItemsList items={items} title="Articles reçus" />

      <Receipt
        subtotal={subtotal}
        deliveryFee={deliveryFee}
        discount={discount}
        total={total}
        totalLabel={effectiveStatus === 'PAID' ? 'Total réglé' : 'Total'}
        isPickup={isPickup}
      />

      <Callout theme="neutral" title="Garantie & service après-vente">
        Tous nos produits sont neufs et garantis. Un souci ou une question d&apos;utilisation ? Notre équipe à Dakar vous
        répond 7j/7.
      </Callout>

      <Actions
        label="Consulter ma commande"
        orderRef={orderRef}
        orderId={orderId}
        secondary={{ href: SHOP_URL, label: 'Continuer mes achats' }}
      />
    </Layout>
  );
};

export default OrderDeliveredEmail;
