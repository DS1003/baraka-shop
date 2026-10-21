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

export const OrderDeliveredEmail = ({
  orderRef = '#BK-2026-154',
  clientName = 'Client',
  date = new Date().toLocaleDateString('fr-FR'),
  deliveryAddress = 'Retrait en boutique',
  phone = '',
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
  return (
    <Layout previewText={`Votre commande ${orderRef} a été livrée avec succès !`} logoUrl={logoUrl}>
      {/* Hero Section */}
      <Section className="text-center mb-6">
        <Text className="text-4xl mb-2">🎉</Text>
        <Heading className="text-2xl font-semibold text-gray-900 m-0">
          Votre commande a été livrée !
        </Heading>
        <Text className="text-gray-600 mt-2">
          Nous espérons que vos nouveaux articles vous donneront entière satisfaction. Merci pour votre confiance !
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
            <Text className="text-gray-500 text-xs uppercase font-bold m-0 mb-1">Date de livraison</Text>
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
            <Text className="text-gray-500 text-xs uppercase font-bold m-0 mb-1">Lieu de réception</Text>
            <Text className="text-gray-900 font-medium m-0">{deliveryAddress || 'Retrait en boutique'}</Text>
          </Column>
        </Row>

        <Row>
          <Column>
            <Text className="text-gray-500 text-xs uppercase font-bold m-0 mb-1">Mode de livraison</Text>
            <Text className="text-gray-900 font-medium m-0">{deliveryMethod}</Text>
          </Column>
          <Column>
            <Text className="text-gray-500 text-xs uppercase font-bold m-0 mb-1">Moyen de règlement</Text>
            <Text className="text-gray-900 font-medium m-0">{paymentMethod}</Text>
          </Column>
        </Row>
      </Section>

      {/* Table des articles */}
      <Section className="mb-6">
        <Heading as="h3" className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
          Articles reçus ({items.length})
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

      {/* Résumé financier */}
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
          <Column><Text className="text-gray-900 font-bold m-0 text-lg">Montant total réglé</Text></Column>
          <Column align="right"><Text className="text-[#E8621A] font-bold m-0 text-lg">{total.toLocaleString()} FCFA</Text></Column>
        </Row>
        
        <Row>
          <Column><Text className="text-gray-600 m-0 text-sm mt-1">Statut du paiement</Text></Column>
          <Column align="right">
            <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold">
              ✅ Payée
            </span>
          </Column>
        </Row>

        <Row className="mt-4">
          <Column>
            <Section className="bg-emerald-50 border border-emerald-200 rounded-md p-3 text-left">
              <Text className="text-emerald-900 text-xs m-0 leading-relaxed">
                ✨ <strong>Facture disponible :</strong> Votre commande est archivée dans votre espace client où vous pouvez consulter et imprimer votre bon de livraison.
              </Text>
            </Section>
          </Column>
        </Row>
      </Section>

      {/* Actions */}
      <Section className="text-center mb-6">
        <Button 
          href="https://baraka.sn/account" 
          className="bg-[#E8621A] text-white rounded-lg font-semibold text-center px-6 py-3 mr-3 inline-block"
        >
          Voir dans mon compte
        </Button>
        <Button 
          href="https://baraka.sn/store" 
          className="bg-white text-gray-800 border border-gray-300 rounded-lg font-semibold text-center px-6 py-3 inline-block"
        >
          Continuer mes achats
        </Button>
      </Section>
    </Layout>
  );
};

export default OrderDeliveredEmail;
