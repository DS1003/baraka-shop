import * as React from 'react';
import { Layout } from './Layout';
import {
  Hero,
  StatusCard,
  DetailCard,
  ItemsList,
  Callout,
  Actions,
  StatusDot,
  SHOP_URL,
  tokens,
  type OrderShippedEmailProps,
} from './_shared';
import { formatPrice } from '@/lib/utils';

export const OrderCancelledEmail = ({
  orderRef = '#ORD-7D07A337',
  clientName = 'Client',
  date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
  paymentMethod = 'Paiement à la livraison',
  paymentStatus = 'CANCELLED',
  total = 0,
  items = [],
  logoUrl,
}: OrderShippedEmailProps) => {
  const isRefunded = paymentStatus === 'REFUNDED';
  const isPaid = paymentStatus === 'PAID';
  const firstName = (clientName || 'Client').split(' ')[0];

  return (
    <Layout previewText={`Votre commande ${orderRef} a été annulée.`} logoUrl={logoUrl}>
      <Hero
        eyebrow="Commande annulée"
        tone="danger"
        title="Votre commande a été annulée."
        subtitle={`${firstName}, nous vous confirmons l'annulation de votre commande. Aucune action n'est requise de votre part.`}
      />

      <StatusCard orderRef={orderRef} date={date} reached={0} />

      {isRefunded ? (
        <Callout theme="violet" title="Remboursement initié" amountLabel="Montant remboursé" amount={total}>
          Le montant sera recrédité selon les délais habituels de votre banque ou de votre opérateur.
        </Callout>
      ) : isPaid ? (
        <Callout theme="violet" title="Remboursement en préparation">
          Votre règlement de {formatPrice(total)} vous sera intégralement remboursé. Nous vous tiendrons informé.
        </Callout>
      ) : (
        <Callout theme="neutral" title="Aucun montant prélevé">
          Le règlement étant prévu à la livraison, aucun montant n&apos;a été débité.
        </Callout>
      )}

      <div style={{ height: '12px', lineHeight: '12px', fontSize: '1px' }}>&nbsp;</div>

      <DetailCard
        title="Détails"
        rows={[
          { label: 'Client', value: clientName },
          { label: 'Paiement', value: paymentMethod },
          {
            label: 'Statut',
            value: <StatusDot label="Annulée" color={tokens.danger} dot={tokens.dangerDot} />,
          },
        ]}
      />

      {items.length > 0 && <ItemsList items={items} title="Articles concernés" />}

      <Actions
        href={`${SHOP_URL}/store`}
        label="Retourner à la boutique"
        orderRef={orderRef}
        secondary={{ href: `${SHOP_URL}/contact`, label: 'Contacter le support' }}
      />
    </Layout>
  );
};

export default OrderCancelledEmail;
