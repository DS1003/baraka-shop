import * as React from 'react';
import { Section, Text, Img, Link } from '@react-email/components';
import { Layout } from './Layout';
import { Hero, Actions, tokens, SHOP_URL } from './_shared';

export interface NewsletterBroadcastEmailProps {
  subject: string;
  previewText?: string;
  heading: string;
  content: string;
  imageUrl?: string | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  unsubscribeUrl?: string;
  email: string;
  logoUrl?: string;
}

export const NewsletterBroadcastEmail = ({
  subject = 'Offres exceptionnelles Baraka Shop',
  previewText = 'Découvrez notre sélection spéciale pour les abonnés',
  heading = 'Ventes Privilège Baraka',
  content = 'Profitez dès maintenant de nos meilleures réductions sur tout le rayon électronique.',
  imageUrl,
  ctaText = 'Découvrir nos offres',
  ctaUrl = 'https://baraka.sn/boutique',
  unsubscribeUrl = 'https://baraka.sn/newsletter/unsubscribe',
  email = 'client@example.com',
  logoUrl,
}: NewsletterBroadcastEmailProps) => {
  return (
    <Layout previewText={previewText || subject} logoUrl={logoUrl}>
      <Hero
        eyebrow="Édition Spéciale Newsletter"
        tone="accent"
        title={heading}
        subtitle={previewText || 'Offres et actualités exclusives sélectionnées pour les membres de Baraka Shop.'}
      />

      {/* Campaign Image (if provided) */}
      {imageUrl && (
        <div style={{ margin: '0 0 14px 0', textAlign: 'center' }}>
          <Img
            src={imageUrl}
            alt={heading}
            width="504"
            style={{
              width: '100%',
              maxWidth: '504px',
              borderRadius: '14px',
              border: `1px solid ${tokens.line}`,
              display: 'block',
              margin: '0 auto',
              objectFit: 'cover',
              maxHeight: '280px',
            }}
          />
        </div>
      )}

      {/* Main Content Card matching Order detail card aesthetic */}
      <div
        style={{
          backgroundColor: tokens.surface,
          border: `1px solid ${tokens.line}`,
          borderRadius: '14px',
          padding: '16px 20px',
          margin: '0 0 14px 0',
        }}
      >
        <div
          style={{
            fontSize: '12.5px',
            lineHeight: '19px',
            color: tokens.text,
            whiteSpace: 'pre-line',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {content}
        </div>
      </div>

      {/* CTA Button and WhatsApp Concierge */}
      <Actions
        label={ctaText || 'Découvrir nos offres'}
        href={
          ctaUrl
            ? (ctaUrl.startsWith('http') ? ctaUrl : `${SHOP_URL}${ctaUrl.startsWith('/') ? '' : '/'}${ctaUrl}`)
            : `${SHOP_URL}/boutique`
        }
      />

      {/* Unsubscribe subtle note */}
      <Section style={{ textAlign: 'center', margin: '20px 0 0 0', padding: '12px 0 0 0', borderTop: `1px solid ${tokens.line}` }}>
        <Text style={{ fontSize: '10.5px', color: tokens.subtle, margin: 0, lineHeight: '16px' }}>
          Vous recevez ce message car vous êtes abonné à la newsletter Baraka Shop ({email}).
          <br />
          Pour ne plus recevoir nos prochaines éditions,{' '}
          <Link href={unsubscribeUrl} style={{ color: tokens.accent, textDecoration: 'underline' }}>
            cliquez ici pour vous désabonner en 1 clic
          </Link>
          .
        </Text>
      </Section>
    </Layout>
  );
};

export default NewsletterBroadcastEmail;
