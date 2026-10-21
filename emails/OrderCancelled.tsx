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
import { OrderShippedEmailProps } from './OrderShipped';

export const OrderCancelledEmail = ({
  orderRef = '#BK-2026-154',
  clientName = 'Client',
  date = new Date().toLocaleDateString('fr-FR'),
  deliveryAddress = 'Retrait en boutique',
  phone = '',
  deliveryMethod = 'Livraison à domicile',
  paymentMethod = 'Paiement à la livraison',
  paymentStatus = 'CANCELLED',
  total = 0,
  subtotal = 0,
  deliveryFee = 0,
  discount = 0,
  items = [],
  logoUrl,
}: OrderShippedEmailProps) => {
  const isRefunded = paymentStatus === 'REFUNDED';

  return (
    <Layout previewText={`Votre commande ${orderRef} a été annulée`} logoUrl={logoUrl}>
      {/* Hero Section */}
      <Section className="text-center mb-6">
        <Text className="text-4xl mb-2">ℹ️</Text>
        <Heading className="text-2xl font-semibold text-gray-900 m-0">
          Commande annulée
        </Heading>
        <Text className="text-gray-600 mt-2">
          Nous vous informons que votre commande <strong>{orderRef}</strong> a bien été annulée.
        </Text>
      </Section>

      {/* Explication du règlement */}
      <Section className="mb-6">
        {isRefunded ? (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <Text className="text-purple-900 font-medium m-0 text-sm">
              ↩️ <strong>Remboursement initié :</strong> Le montant de votre commande vous sera recrédité selon les délais habituels de votre établissement bancaire ou opérateur mobile.
            </Text>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <Text className="text-gray-700 font-medium m-0 text-sm">
              🛡️ <strong>Aucun prélèvement :</strong> Votre commande étant en paiement à la livraison, aucun montant n'a été encaissé.
            </Text>
          </div>
        )}
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
            {phone && <Text className="text-gray-600 text-sm m-0 mt-1">{phone}</Text>}
          </Column>
          <Column>
            <Text className="text-gray-500 text-xs uppercase font-bold m-0 mb-1">Statut</Text>
            <span className="bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-xs font-semibold inline-block">
              ❌ Annulée
            </span>
          </Column>
        </Row>
      </Section>

      {/* Table des articles annulés */}
      <Section className="mb-6">
        <Heading as="h3" className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
          Articles concernés ({items.length})
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

      {/* Total */}
      <Section className="bg-gray-50 border border-gray-100 rounded-lg p-6 mb-8">
        <Row>
          <Column><Text className="text-gray-900 font-bold m-0 text-base">Montant initial</Text></Column>
          <Column align="right"><Text className="text-gray-900 font-bold m-0 text-base">{total.toLocaleString()} FCFA</Text></Column>
        </Row>
      </Section>

      {/* Actions */}
      <Section className="text-center mb-6">
        <Button 
          href="https://baraka.sn/store" 
          className="bg-[#E8621A] text-white rounded-lg font-semibold text-center px-6 py-3 mr-3 inline-block"
        >
          Retourner à la boutique
        </Button>
        <Button 
          href="https://baraka.sn/contact" 
          className="bg-white text-gray-800 border border-gray-300 rounded-lg font-semibold text-center px-6 py-3 inline-block"
        >
          Contacter le support
        </Button>
      </Section>
    </Layout>
  );
};

export default OrderCancelledEmail;
