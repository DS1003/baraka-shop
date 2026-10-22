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
  PhoneLink,
  getPaymentState,
  isCashOnDeliveryPayment,
  type OrderShippedEmailProps,
} from './_shared';

// Ré-export des types pour compatibilité avec les imports existants
export type { OrderItem, OrderShippedEmailProps } from './_shared';

export const OrderShippedEmail = ({
  orderRef = '#ORD-7D07A337',
  orderId,
  clientName = 'Client',
  date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
  deliveryAddress = 'Dakar, Sénégal',
  phone = '',
  deliveryMethod = 'Livraison à domicile',
  paymentMethod = 'Paiement à la livraison',
  paymentStatus = 'PENDING',
  total = 0,
  subtotal = 0,
  deliveryFee = 0,
  discount = 0,
  estimatedDelivery = 'Livraison sous 24h à 48h',
  items = [],
  logoUrl,
}: OrderShippedEmailProps) => {
  const isCod = isCashOnDeliveryPayment(paymentMethod, paymentStatus);
  const isPaid = paymentStatus === 'PAID';
  const isPickup = deliveryMethod.toLowerCase().includes('retrait');
  const firstName = (clientName || 'Client').split(' ')[0];

  return (
    <Layout previewText={`Votre commande ${orderRef} est en route — ${estimatedDelivery}.`} logoUrl={logoUrl}>
      <Hero
        eyebrow="En cours de livraison"
        title={`${firstName}, votre colis est en route.`}
        subtitle="Il a été remis à notre livreur et vous parviendra dans les meilleurs délais."
      />

      <StatusCard
        orderRef={orderRef}
        date={date}
        reached={3}
        note={
          estimatedDelivery ? (
            <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
              <tbody>
                <tr>
                  <td style={{ color: '#6B7280', fontSize: '13px' }}>Arrivée estimée</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#0B0F19', fontSize: '13px' }}>{estimatedDelivery}</td>
                </tr>
              </tbody>
            </table>
          ) : undefined
        }
      />

      <DetailCard
        title={isPickup ? 'Retrait' : 'Livraison'}
        rows={[
          { label: 'Destinataire', value: clientName },
          ...(phone ? [{ label: 'Téléphone', value: <PhoneLink phone={phone} /> }] : []),
          { label: 'Mode', value: deliveryMethod },
          ...(!isPickup ? [{ label: 'Adresse', value: deliveryAddress || 'Dakar, Sénégal' }] : []),
        ]}
      />

      <DetailCard
        title="Paiement"
        rows={[
          { label: 'Moyen', value: paymentMethod },
          { label: 'Statut', value: <StatusDot {...getPaymentState(paymentStatus, isCod)} /> },
        ]}
      />

      <ItemsList items={items} title="Dans votre colis" />

      <Receipt subtotal={subtotal} deliveryFee={deliveryFee} discount={discount} total={total} isPickup={isPickup} />

      {isPaid ? (
        <Callout theme="success" title="Commande déjà réglée">
          Le livreur vous remettra votre colis sans demander de paiement supplémentaire.
        </Callout>
      ) : isCod ? (
        <Callout theme="warm" title="Rappel — paiement à la livraison" amountLabel="Montant à remettre au livreur" amount={total}>
          Gardez votre téléphone à portée de main : notre livreur vous appellera juste avant son arrivée.
        </Callout>
      ) : null}

      <Actions label="Suivre mon colis" orderRef={orderRef} orderId={orderId} />
    </Layout>
  );
};

export default OrderShippedEmail;
