import * as React from 'react';
import { Section, Text, Link } from '@react-email/components';
import { Layout } from './Layout';
import { Hero, Callout, Actions, tokens, SHOP_URL } from './_shared';

export interface NewsletterWelcomeEmailProps {
  email: string;
  unsubscribeUrl?: string;
  promoCode?: string;
  logoUrl?: string;
}

export const NewsletterWelcomeEmail = ({
  email = 'client@example.com',
  unsubscribeUrl = 'https://baraka.sn/newsletter/unsubscribe',
  promoCode = 'BARAKAVIP',
  logoUrl,
}: NewsletterWelcomeEmailProps) => {
  return (
    <Layout previewText="Bienvenue dans la communauté Baraka Shop ! Profitez de vos privilèges VIP." logoUrl={logoUrl}>
      <Hero
        eyebrow="Club Privilège Baraka"
        tone="accent"
        title="Bienvenue dans la Communauté !"
        subtitle="Votre inscription est confirmée. Vous faites désormais partie de notre cercle privilégié pour recevoir en avant-première nos meilleures opportunités high-tech au Sénégal."
      />

      {/* VIP Welcome Gift Box */}
      <div
        style={{
          backgroundColor: tokens.surface,
          border: `1px solid ${tokens.line}`,
          borderRadius: '14px',
          padding: '16px 18px',
          margin: '0 0 12px 0',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: tokens.accent, marginBottom: '4px' }}>
          🎁 Cadeau Exclusif de Bienvenue
        </div>
        <div style={{ fontSize: '14px', fontWeight: 800, color: tokens.ink, marginBottom: '6px' }}>
          Votre Réduction Membre VIP
        </div>
        <div style={{ fontSize: '12px', lineHeight: '17px', color: tokens.muted, maxWidth: '400px', margin: '0 auto 12px auto' }}>
          Utilisez ce code promo exclusif lors de votre prochaine commande pour bénéficier d'une remise immédiate sur votre panier :
        </div>
        <div
          style={{
            display: 'inline-block',
            backgroundColor: '#FFFFFF',
            border: `2px dashed ${tokens.accent}`,
            borderRadius: '12px',
            padding: '10px 24px',
            margin: '0 auto',
          }}
        >
          <span
            style={{
              fontFamily: "'SF Mono', 'JetBrains Mono', Menlo, Consolas, monospace",
              fontSize: '18px',
              fontWeight: 900,
              letterSpacing: '0.15em',
              color: tokens.accent,
            }}
          >
            {promoCode}
          </span>
        </div>
        <div style={{ fontSize: '10.5px', color: tokens.subtle, marginTop: '8px' }}>
          Valable sur tout le catalogue en ligne (smartphones, ordinateurs, audio & accessoires).
        </div>
      </div>

      {/* Member Privileges Card */}
      <div
        style={{
          backgroundColor: tokens.surface,
          border: `1px solid ${tokens.line}`,
          borderRadius: '14px',
          padding: '14px 18px',
          margin: '0 0 14px 0',
        }}
      >
        <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: tokens.subtle, marginBottom: '10px' }}>
          Vos Avantages Membre
        </div>
        <table width="100%" cellPadding={0} cellSpacing={0} role="presentation" style={{ tableLayout: 'fixed', width: '100%' }}>
          <tbody>
            <tr>
              <td style={{ padding: '8px 0', borderBottom: `1px solid ${tokens.line}`, verticalAlign: 'top', width: '28px' }}>
                <span style={{ fontSize: '15px' }}>⚡</span>
              </td>
              <td style={{ padding: '8px 0 8px 8px', borderBottom: `1px solid ${tokens.line}`, verticalAlign: 'top' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: tokens.ink, lineHeight: '16px' }}>
                  Ventes Flash & Bons Plans Prioritaires
                </div>
                <div style={{ fontSize: '11px', color: tokens.muted, marginTop: '2px', lineHeight: '15px' }}>
                  Accès en avant-première à nos réductions limitées avant tout le monde.
                </div>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', borderBottom: `1px solid ${tokens.line}`, verticalAlign: 'top', width: '28px' }}>
                <span style={{ fontSize: '15px' }}>🚀</span>
              </td>
              <td style={{ padding: '8px 0 8px 8px', borderBottom: `1px solid ${tokens.line}`, verticalAlign: 'top' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: tokens.ink, lineHeight: '16px' }}>
                  Nouveautés & Exclusivités High-Tech
                </div>
                <div style={{ fontSize: '11px', color: tokens.muted, marginTop: '2px', lineHeight: '15px' }}>
                  Découvrez en exclusivité les derniers modèles Apple, Samsung, Dell, HP et Sony.
                </div>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', verticalAlign: 'top', width: '28px' }}>
                <span style={{ fontSize: '15px' }}>🛡️</span>
              </td>
              <td style={{ padding: '8px 0 8px 8px', verticalAlign: 'top' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: tokens.ink, lineHeight: '16px' }}>
                  Garantie & Conciergerie WhatsApp 7j/7
                </div>
                <div style={{ fontSize: '11px', color: tokens.muted, marginTop: '2px', lineHeight: '15px' }}>
                  Produits 100% authentiques avec assistance personnalisée pour tous vos achats.
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Callout theme="warm" title="Livraison Express 24h & Paiement Sécurisé">
        Commandez en ligne et faites-vous livrer partout à Dakar en 24h avec paiement à la livraison en espèces ou par Wave.
      </Callout>

      <Actions
        label="Explorer la Boutique"
        href={`${SHOP_URL}/boutique`}
      />

      {/* Unsubscribe subtle note */}
      <Section style={{ textAlign: 'center', margin: '20px 0 0 0', padding: '12px 0 0 0', borderTop: `1px solid ${tokens.line}` }}>
        <Text style={{ fontSize: '10.5px', color: tokens.subtle, margin: 0, lineHeight: '16px' }}>
          Vous recevez cet email car vous vous êtes inscrit à la newsletter de Baraka Shop avec l'adresse <strong style={{ color: tokens.muted }}>{email}</strong>.
          <br />
          Pour ne plus recevoir nos prochaines éditions,{' '}
          <Link href={unsubscribeUrl} style={{ color: tokens.accent, textDecoration: 'underline' }}>
            cliquez ici pour vous désinscrire en 1 clic
          </Link>
          .
        </Text>
      </Section>
    </Layout>
  );
};

export default NewsletterWelcomeEmail;
