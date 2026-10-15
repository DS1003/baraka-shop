import React from 'react';
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

export interface ProductRestockedEmailProps {
  productName: string;
  reference?: string | null;
  categoryName?: string | null;
  price: number;
  oldStock: number;
  newStock: number;
  restockedAt: string;
  productImageUrl?: string | null;
  adminManageUrl: string;
  logoUrl?: string;
}

export const ProductRestockedEmail = ({
  productName = 'Ordinateur Portable HP OmniBook 5',
  reference = 'HP-OMNI-5',
  categoryName = 'Informatique',
  price = 425000,
  oldStock = 0,
  newStock = 10,
  restockedAt = '14 Octobre 2026 à 21:00',
  productImageUrl,
  adminManageUrl = 'https://baraka.sn/admin/out-of-stock',
  logoUrl,
}: ProductRestockedEmailProps) => {
  return (
    <Layout previewText={`[Baraka] Produit réapprovisionné — ${productName}`} logoUrl={logoUrl}>
      {/* Title badge */}
      <Section className="text-center py-6 px-4 bg-gradient-to-b from-orange-50 to-white">
        <span className="inline-block bg-orange-100 text-orange-700 text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-orange-200">
          Vérification Requise
        </span>
        <Heading className="text-xl md:text-2xl font-black text-slate-900 mt-3 mb-1 tracking-tight">
          Produit Réapprovisionné
        </Heading>
        <Text className="text-slate-500 text-xs md:text-sm max-w-md mx-auto m-0">
          Un produit précédemment en rupture vient de recevoir de nouvelles unités.
        </Text>
      </Section>

      {/* Warning Box */}
      <Section className="px-6 py-2">
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
          <Text className="text-amber-900 text-xs font-bold m-0 uppercase tracking-wider">
            ⚠️ Statut : Actuellement désactivé du site public
          </Text>
          <Text className="text-amber-800 text-xs mt-1 m-0">
            Conformément à la politique Baraka, le produit reste invisible pour les clients jusqu’à votre validation manuelle.
          </Text>
        </div>
      </Section>

      {/* Product Details Card */}
      <Section className="px-6 py-4">
        <div className="bg-slate-50 rounded-2xl border border-slate-200/70 p-5">
          <Row>
            {productImageUrl && (
              <Column className="w-20 align-top pr-4">
                <Img
                  src={productImageUrl}
                  alt={productName}
                  width="72"
                  height="72"
                  className="rounded-xl border border-slate-200 object-cover bg-white"
                />
              </Column>
            )}
            <Column className="align-top">
              <Text className="text-sm font-black text-slate-900 m-0 leading-snug">
                {productName}
              </Text>
              {reference && (
                <Text className="text-xs text-slate-500 font-mono font-semibold m-0 mt-0.5">
                  RÉF : {reference}
                </Text>
              )}
              {categoryName && (
                <Text className="text-xs text-slate-500 m-0 mt-0.5">
                  Rayon : <span className="font-semibold text-slate-700">{categoryName}</span>
                </Text>
              )}
              <Text className="text-sm font-black text-orange-600 m-0 mt-1">
                {price.toLocaleString('fr-FR')} FCFA
              </Text>
            </Column>
          </Row>

          <Hr className="border-slate-200 my-4" />

          {/* Stock Metrics Grid */}
          <Row className="text-center">
            <Column className="w-1/3 bg-white p-3 rounded-xl border border-slate-100">
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider m-0">
                Ancien Stock
              </Text>
              <Text className="text-base font-black text-slate-400 m-0 mt-0.5">
                {oldStock} u.
              </Text>
            </Column>
            <Column className="w-2" />
            <Column className="w-1/3 bg-orange-50 p-3 rounded-xl border border-orange-100">
              <Text className="text-[10px] font-bold text-orange-600 uppercase tracking-wider m-0">
                Nouveau Stock
              </Text>
              <Text className="text-base font-black text-orange-600 m-0 mt-0.5">
                +{newStock} u.
              </Text>
            </Column>
            <Column className="w-2" />
            <Column className="w-1/3 bg-white p-3 rounded-xl border border-slate-100">
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider m-0">
                Date & Heure
              </Text>
              <Text className="text-[11px] font-bold text-slate-700 m-0 mt-1 leading-tight">
                {restockedAt}
              </Text>
            </Column>
          </Row>
        </div>
      </Section>

      {/* CTA Button */}
      <Section className="text-center px-6 py-6">
        <Button
          href={adminManageUrl}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm px-7 py-3.5 rounded-xl uppercase tracking-wider shadow-lg shadow-orange-200 inline-block"
        >
          🔍 Vérifier et gérer le produit
        </Button>
        <Text className="text-slate-400 text-xs mt-3 m-0">
          Ce lien vous redirige vers l'espace d'administration sécurisé de Baraka Shop.
        </Text>
      </Section>
    </Layout>
  );
};

export default ProductRestockedEmail;
