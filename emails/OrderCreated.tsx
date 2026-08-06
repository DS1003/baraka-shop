import * as React from 'react';
import {
  Section,
  Text,
  Heading,
  Row,
  Column,
  Button,
  Img,
  Hr
} from '@react-email/components';
import { Layout } from './Layout';
import { OrderShippedEmailProps } from './OrderShipped'; // We can reuse the same props structure

export const OrderCreatedEmail = ({
  orderRef = '#BK-2026-154',
  clientName = 'Client',
  date = new Date().toLocaleDateString('fr-FR'),
  deliveryAddress = 'Retrait en boutique',
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
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">✅ Payée</span>;
      case 'ON_DELIVERY':
        return <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold">⏳ Paiement à la livraison</span>;
      default:
        return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold">❌ Paiement en attente</span>;
    }
  };

  return (
    <Layout previewText={`Votre commande ${orderRef} a bien été enregistrée !`} logoUrl={logoUrl}>
      <Section className="text-center mb-6">
        <Text className="text-4xl mb-2">🎉</Text>
        <Heading className="text-2xl font-semibold text-gray-900 m-0">
          Merci pour votre commande !
        </Heading>
        <Text className="text-gray-600 mt-2">
          Nous avons bien reçu votre commande. Notre équipe la prépare avec soin.
        </Text>
      </Section>

      {/* Informations de commande */}
      <Section className="bg-gray-50 border border-gray-100 rounded-lg p-6 mb-6">
        <Row className="mb-4">
          <Column>
            <Text className="text-gray-500 text-xs uppercase font-bold m-0 mb-1">Commande</Text>
            <Text className="text-[#E8621A] font-semibold m-0">{orderRef}</Text>
          </Column>
          <Column>
            <Text className="text-gray-500 text-xs uppercase font-bold m-0 mb-1">Date</Text>
            <Text className="text-gray-900 font-medium m-0">{date}</Text>
          </Column>
        </Row>
        
        <Row className="mb-4">
          <Column>
            <Text className="text-gray-500 text-xs uppercase font-bold m-0 mb-1">Client</Text>
            <Text className="text-gray-900 font-medium m-0">{clientName}</Text>
            <Text className="text-gray-600 text-sm m-0 mt-1">{phone}</Text>
          </Column>
          <Column>
            <Text className="text-gray-500 text-xs uppercase font-bold m-0 mb-1">Adresse</Text>
            <Text className="text-gray-900 font-medium m-0">{deliveryAddress || 'Retrait en boutique'}</Text>
          </Column>
        </Row>

        <Row>
          <Column>
            <Text className="text-gray-500 text-xs uppercase font-bold m-0 mb-1">Mode de livraison</Text>
            <Text className="text-gray-900 font-medium m-0">{deliveryMethod}</Text>
          </Column>
        </Row>
      </Section>

      {/* Table des produits */}
      <Section className="mb-6">
        <Heading as="h3" className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
          Articles commandés ({items.length})
        </Heading>
        {items.map((item, idx) => (
          <Row key={idx} className="mb-4">
            <Column className="w-[60px] pr-4">
              <Img src={item.image || 'https://via.placeholder.com/60'} width="60" height="60" className="rounded-md object-cover border border-gray-100" />
            </Column>
            <Column>
              <Text className="text-gray-900 font-medium m-0">{item.name}</Text>
              <Text className="text-gray-500 text-sm m-0 mt-1">Qté : {item.quantity} × {item.price.toLocaleString()} FCFA</Text>
            </Column>
            <Column align="right">
              <Text className="text-gray-900 font-semibold m-0">{(item.quantity * item.price).toLocaleString()} FCFA</Text>
            </Column>
          </Row>
        ))}
      </Section>

      {/* Résumé de la commande */}
      <Section className="bg-gray-50 border border-gray-100 rounded-lg p-6 mb-8">
        <Row className="mb-2">
          <Column><Text className="text-gray-600 m-0 text-sm">Sous-total</Text></Column>
          <Column align="right"><Text className="text-gray-900 font-medium m-0 text-sm">{subtotal.toLocaleString()} FCFA</Text></Column>
        </Row>
        <Row className="mb-2">
          <Column><Text className="text-gray-600 m-0 text-sm">Frais de livraison</Text></Column>
          <Column align="right"><Text className="text-gray-900 font-medium m-0 text-sm">{deliveryFee.toLocaleString()} FCFA</Text></Column>
        </Row>
        {discount > 0 && (
          <Row className="mb-2">
            <Column><Text className="text-red-600 m-0 text-sm">Réduction</Text></Column>
            <Column align="right"><Text className="text-red-600 font-medium m-0 text-sm">- {discount.toLocaleString()} FCFA</Text></Column>
          </Row>
        )}
        <Hr className="border-gray-200 my-4" />
        <Row className="mb-4">
          <Column><Text className="text-gray-900 font-bold m-0 text-lg">Montant total</Text></Column>
          <Column align="right"><Text className="text-[#E8621A] font-bold m-0 text-lg">{total.toLocaleString()} FCFA</Text></Column>
        </Row>
        
        <Row>
          <Column><Text className="text-gray-600 m-0 text-sm mt-1">Statut du paiement</Text></Column>
          <Column align="right">
            {getPaymentStatusBadge(paymentStatus)}
          </Column>
        </Row>
      </Section>

      {/* Actions */}
      <Section className="text-center mb-6">
        <Button 
          href="https://baraka.sn/account" 
          className="bg-[#E8621A] text-white rounded-lg font-semibold text-center px-6 py-3 inline-block"
        >
          Voir ma commande
        </Button>
      </Section>
    </Layout>
  );
};

export default OrderCreatedEmail;
