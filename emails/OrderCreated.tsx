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

export const OrderCreatedEmail = ({
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
  items = [],
  logoUrl,
}: OrderShippedEmailProps) => {
  const isCod = isCashOnDeliveryPayment(paymentMethod, paymentStatus);
  const isPaid = paymentStatus === 'PAID';
  const isPickup = deliveryMethod.toLowerCase().includes('retrait');
  const firstName = (clientName || 'Client').split(' ')[0];

  return (
    <Layout previewText={`Commande ${orderRef} confirmée — ${firstName}, on s'occupe de tout.`} logoUrl={logoUrl}>
      <Hero
        eyebrow="Commande confirmée"
        title={`Merci, ${firstName}.`}
        subtitle="Votre commande est bien enregistrée. Notre équipe la prépare avec soin et vous tiendra informé à chaque étape."
      />

      <StatusCard
        orderRef={orderRef}
        date={date}
        reached={1}
        note={
          isPickup
            ? 'Vous serez notifié dès que votre commande sera prête à être retirée en boutique.'
            : 'Prochaine étape : préparation de votre colis. Vous recevrez un email dès son expédition.'
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

      <ItemsList items={items} title="Votre commande" />

      <Receipt subtotal={subtotal} deliveryFee={deliveryFee} discount={discount} total={total} isPickup={isPickup} />

      {isPaid ? (
        <Callout theme="success" title="Commande entièrement réglée">
          Votre paiement a été validé. Aucun montant ne vous sera demandé à la réception.
        </Callout>
      ) : isCod ? (
        <Callout theme="warm" title="Paiement à la livraison" amountLabel="Montant à prévoir" amount={total}>
          Merci de préparer de préférence le montant exact en espèces. Notre livreur vous appellera avant son passage.
        </Callout>
      ) : paymentStatus === 'FAILED' ? (
        <Callout theme="danger" title="Le paiement n'a pas abouti">
          Votre commande est conservée. Contactez-nous sur WhatsApp pour finaliser votre règlement en quelques secondes.
        </Callout>
      ) : (
        <Callout theme="neutral" title="Paiement en cours de vérification">
          Nous vous confirmerons la réception de votre règlement dès sa validation.
        </Callout>
      )}

      <Actions label="Suivre ma commande" orderRef={orderRef} orderId={orderId} />
    </Layout>
  );
};

export default OrderCreatedEmail;
