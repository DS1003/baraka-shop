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

export interface RestockItemSummary {
  id?: string;
  productId: string;
  productName: string;
  reference?: string | null;
  categoryName?: string | null;
  price: number;
  oldStock: number;
  newStock: number;
  productImageUrl?: string | null;
  restockedAt?: string | Date;
}

export interface ConsolidatedRestockEmailProps {
  items: RestockItemSummary[];
  totalCount: number;
  consolidationWindowMinutes?: number;
  generatedAt?: string;
  adminManageUrl?: string;
  logoUrl?: string;
}

const MAX_DISPLAYED_PRODUCTS = 6;

export const ConsolidatedRestockEmail = ({
  items = [
    {
      productId: 'p1',
      productName: 'PLOKAMA VM-80 Pro',
      reference: 'PLK-VM80',
      categoryName: 'Photo & Vidéo',
      price: 25000,
      oldStock: 0,
      newStock: 15,
      productImageUrl: null,
    },
    {
      productId: 'p2',
      productName: 'PLOKAMA PK-9950',
      reference: 'PLK-9950',
      categoryName: 'Accessoires',
      price: 18500,
      oldStock: 0,
      newStock: 8,
      productImageUrl: null,
    },
    {
      productId: 'p3',
      productName: 'PLOKAMA MS-20',
      reference: 'PLK-MS20',
      categoryName: 'Trépieds & Stabilisateurs',
      price: 32000,
      oldStock: 0,
      newStock: 20,
      productImageUrl: null,
    },
    {
      productId: 'p4',
      productName: 'PLOKAMA W12 Pro',
      reference: 'PLK-W12',
      categoryName: 'Éclairage Studio',
      price: 45000,
      oldStock: 0,
      newStock: 5,
      productImageUrl: null,
    },
  ],
  totalCount = 4,
  consolidationWindowMinutes = 5,
  generatedAt = '14 Octobre 2026 à 14:05',
  adminManageUrl = 'https://baraka.sn/admin/out-of-stock?filter=RESTOCKED_PENDING',
  logoUrl,
}: ConsolidatedRestockEmailProps) => {
  const count = totalCount || items.length;
  const isPlural = count > 1;
  const displayedItems = items.slice(0, MAX_DISPLAYED_PRODUCTS);
  const remainingCount = Math.max(0, count - displayedItems.length);

  const previewText = isPlural
    ? `[Baraka] Réapprovisionnement — ${count} produits à vérifier`
    : `[Baraka] Réapprovisionnement — 1 produit à vérifier (${items[0]?.productName || 'Nouveau stock'})`;

  return (
    <Layout previewText={previewText} logoUrl={logoUrl}>
      {/* En-tête Badge & Titre */}
      <Section className="text-center py-6 px-4 bg-gradient-to-b from-orange-50 to-white">
        <span className="inline-block bg-orange-100 text-orange-700 text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-orange-200">
          Vérification Requise
        </span>
        <Heading className="text-xl md:text-2xl font-black text-slate-900 mt-3 mb-1 tracking-tight">
          {isPlural ? `${count} Produits Réapprovisionnés` : '1 Produit Réapprovisionné'}
        </Heading>
        <Text className="text-slate-600 text-xs md:text-sm max-w-md mx-auto m-0 leading-relaxed font-medium">
          {isPlural
            ? `${count} produits sont de nouveau disponibles en stock et attendent votre vérification avant leur réactivation sur Baraka.`
            : `1 produit est de nouveau disponible en stock et attend votre vérification avant sa réactivation sur Baraka.`}
        </Text>
      </Section>

      {/* Avertissement Politique Baraka (Invisibles aux clients) */}
      <Section className="px-6 py-2">
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
          <Text className="text-amber-900 text-xs font-bold m-0 uppercase tracking-wider">
            ⚠️ Statut : Actuellement masqués de la boutique
          </Text>
          <Text className="text-amber-800 text-xs mt-1 m-0 leading-relaxed">
            Conformément aux règles de sécurité Baraka, les produits réapprovisionnés ne sont pas réactivés automatiquement. Ils restent invisibles pour les clients jusqu’à votre validation manuelle.
          </Text>
        </div>
      </Section>

      {/* Liste des produits réapprovisionnés */}
      <Section className="px-6 py-3">
        <div className="flex items-center justify-between mb-2">
          <Text className="text-[11px] font-black uppercase tracking-wider text-slate-400 m-0">
            Détails des réapprovisionnements ({count})
          </Text>
          {consolidationWindowMinutes && (
            <Text className="text-[10px] font-semibold text-slate-400 m-0">
              Fenêtre de consolidation : {consolidationWindowMinutes} min
            </Text>
          )}
        </div>

        <div className="space-y-3">
          {displayedItems.map((item, index) => {
            const formattedPrice = Number(item.price || 0).toLocaleString('fr-FR');
            return (
              <div
                key={item.productId || index}
                className="bg-slate-50 rounded-2xl border border-slate-200/70 p-4 my-2.5"
              >
                <Row>
                  {item.productImageUrl ? (
                    <Column className="w-16 align-top pr-3">
                      <Img
                        src={item.productImageUrl}
                        alt={item.productName}
                        width="56"
                        height="56"
                        className="rounded-xl border border-slate-200 object-cover bg-white"
                      />
                    </Column>
                  ) : null}
                  <Column className="align-top">
                    <Text className="text-sm font-black text-slate-900 m-0 leading-snug">
                      {item.productName}
                    </Text>
                    <div className="mt-1">
                      {item.reference && (
                        <span className="text-[11px] text-slate-500 font-mono font-semibold mr-3">
                          RÉF : {item.reference}
                        </span>
                      )}
                      {item.categoryName && (
                        <span className="text-[11px] text-slate-500">
                          Rayon : <strong className="text-slate-700">{item.categoryName}</strong>
                        </span>
                      )}
                    </div>
                    <Text className="text-sm font-black text-orange-600 m-0 mt-1">
                      {formattedPrice} FCFA
                    </Text>
                  </Column>
                </Row>

                <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-medium">
                      Ancien : <strong className="text-slate-600">{item.oldStock} u.</strong>
                    </span>
                    <span className="text-orange-500 font-black">
                      → Nouveau : <strong className="text-orange-600">+{item.newStock} u.</strong>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bannière si plus de MAX_DISPLAYED_PRODUCTS produits */}
        {remainingCount > 0 && (
          <div className="bg-orange-50/70 rounded-xl border border-orange-200/80 p-3.5 text-center mt-3">
            <Text className="text-xs font-bold text-orange-800 m-0">
              + {remainingCount} autre{remainingCount > 1 ? 's' : ''} produit{remainingCount > 1 ? 's' : ''} en attente de vérification
            </Text>
            <Text className="text-[11px] text-orange-600 mt-0.5 m-0">
              Consultez la liste complète directement depuis le back-office Baraka.
            </Text>
          </div>
        )}
      </Section>

      {/* Date de détection */}
      <Section className="px-6 py-1 text-center">
        <Text className="text-[11px] text-slate-400 m-0">
          Notification générée le {generatedAt}
        </Text>
      </Section>

      {/* Bouton d'action principal */}
      <Section className="text-center px-6 py-5">
        <Button
          href={adminManageUrl}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm px-8 py-3.5 rounded-xl uppercase tracking-wider shadow-lg shadow-orange-200 inline-block"
        >
          🔍 Voir les produits à réactiver
        </Button>
        <Text className="text-slate-400 text-xs mt-3 m-0">
          Ce lien vous redirige vers la file de validation du back-office Baraka Shop.
        </Text>
      </Section>
    </Layout>
  );
};

export default ConsolidatedRestockEmail;
