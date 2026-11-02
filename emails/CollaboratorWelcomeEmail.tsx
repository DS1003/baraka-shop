import * as React from 'react';
import { Layout } from './Layout';
import {
  Section,
  Text,
  Heading,
  Button,
  Hr,
} from '@react-email/components';
import { tokens, SHOP_URL, SUPPORT_WHATSAPP } from './_shared';
import { formatPrice } from '@/lib/utils';

export interface CollaboratorWelcomeEmailProps {
  collaboratorName: string;
  email: string;
  title?: string;
  monthlySalary: number;
  commissionRate: number;
  commissionBase: string;
  startDate: string;
  dashboardUrl?: string;
  logoUrl?: string;
}

export const CollaboratorWelcomeEmail = ({
  collaboratorName = 'Collaborateur',
  email = 'collaborateur@barakashop.sn',
  title = 'Collaborateur Commercial',
  monthlySalary = 0,
  commissionRate = 0,
  commissionBase = 'Chiffre d\'affaires sur commandes livrées',
  startDate = new Date().toLocaleDateString('fr-FR'),
  dashboardUrl = `${SHOP_URL}/collaborator/dashboard`,
  logoUrl,
}: CollaboratorWelcomeEmailProps) => {
  const firstName = collaboratorName.split(' ')[0] || 'Collaborateur';

  const baseLabel =
    commissionBase === 'DELIVERED_SALES'
      ? 'Chiffre d\'affaires sur commandes livrées'
      : commissionBase === 'ALL_SALES'
      ? 'Chiffre d\'affaires total'
      : commissionBase === 'NET_MARGIN'
      ? 'Marge nette réalisée'
      : commissionBase;

  return (
    <Layout
      previewText={`Félicitations ${firstName} — Votre espace collaborateur Baraka Shop est actif.`}
      logoUrl={logoUrl}
    >
      {/* Hero */}
      <Section style={{ padding: '24px 0 16px', textAlign: 'center' }}>
        <Text
          style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#E8621A',
            margin: '0 0 8px',
          }}
        >
          Nomination Officielle
        </Text>
        <Heading
          as="h1"
          style={{
            fontSize: '24px',
            fontWeight: 800,
            color: '#1B1F3B',
            margin: '0 0 12px',
            letterSpacing: '-0.02em',
          }}
        >
          Bienvenue dans votre Espace Collaborateur
        </Heading>
        <Text
          style={{
            fontSize: '14px',
            lineHeight: '1.6',
            color: '#4B5563',
            maxWidth: '520px',
            margin: '0 auto',
          }}
        >
          Bonjour <strong>{collaboratorName}</strong>, vous avez été officiellement désigné(e) comme <strong>{title}</strong> au sein de l'équipe Baraka Shop.
        </Text>
      </Section>

      {/* Account Info Card */}
      <Section
        style={{
          backgroundColor: '#F8F9FB',
          border: '1px solid #EEF0F3',
          borderRadius: '16px',
          padding: '20px',
          margin: '16px 0',
        }}
      >
        <Text
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: '#1B1F3B',
            margin: '0 0 12px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          🔑 Vos accès & Connexion
        </Text>
        <Text style={{ fontSize: '13px', lineHeight: '1.6', color: '#4B5563', margin: '0 0 8px' }}>
          • <strong>Compte associé :</strong> {email}
        </Text>
        <Text style={{ fontSize: '13px', lineHeight: '1.6', color: '#4B5563', margin: '0 0 8px' }}>
          • <strong>Authentification :</strong> Connectez-vous avec vos identifiants habituels (aucun mot de passe temporaire requis).
        </Text>
        <Text style={{ fontSize: '13px', lineHeight: '1.6', color: '#4B5563', margin: '0 0 8px' }}>
          • <strong>Accès direct :</strong> Retrouvez votre entrée <em>« Espace Collaborateur »</em> dans le menu Profil du site public dès votre connexion.
        </Text>
        <Text style={{ fontSize: '12px', color: '#6B7280', margin: '8px 0 0', fontStyle: 'italic' }}>
          Votre compte client reste inchangé et vous conservez toutes vos fonctionnalités d'achat habituelles.
        </Text>
      </Section>

      {/* Compensation Conditions Card */}
      <Section
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '16px',
          padding: '20px',
          margin: '16px 0',
        }}
      >
        <Text
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: '#1B1F3B',
            margin: '0 0 14px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          💼 Vos conditions de collaboration
        </Text>

        <div style={{ display: 'table', width: '100%' }}>
          <div style={{ display: 'table-row' }}>
            <span style={{ display: 'table-cell', padding: '6px 0', fontSize: '13px', color: '#6B7280' }}>
              Salaire mensuel :
            </span>
            <span style={{ display: 'table-cell', padding: '6px 0', fontSize: '13px', fontWeight: 700, color: '#1B1F3B', textAlign: 'right' }}>
              {monthlySalary > 0 ? formatPrice(monthlySalary) : 'Non applicable'}
            </span>
          </div>

          <div style={{ display: 'table-row' }}>
            <span style={{ display: 'table-cell', padding: '6px 0', fontSize: '13px', color: '#6B7280' }}>
              Taux de commission :
            </span>
            <span style={{ display: 'table-cell', padding: '6px 0', fontSize: '13px', fontWeight: 700, color: '#E8621A', textAlign: 'right' }}>
              {commissionRate > 0 ? `${commissionRate}%` : 'Non applicable'}
            </span>
          </div>

          <div style={{ display: 'table-row' }}>
            <span style={{ display: 'table-cell', padding: '6px 0', fontSize: '13px', color: '#6B7280' }}>
              Assiette de calcul :
            </span>
            <span style={{ display: 'table-cell', padding: '6px 0', fontSize: '13px', fontWeight: 600, color: '#374151', textAlign: 'right' }}>
              {baseLabel}
            </span>
          </div>

          <div style={{ display: 'table-row' }}>
            <span style={{ display: 'table-cell', padding: '6px 0', fontSize: '13px', color: '#6B7280' }}>
              Date d'effet :
            </span>
            <span style={{ display: 'table-cell', padding: '6px 0', fontSize: '13px', fontWeight: 600, color: '#374151', textAlign: 'right' }}>
              {startDate}
            </span>
          </div>
        </div>
      </Section>

      {/* Call to action button */}
      <Section style={{ textAlign: 'center', margin: '28px 0' }}>
        <Button
          href={dashboardUrl}
          style={{
            backgroundColor: '#E8621A',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: 700,
            textDecoration: 'none',
            padding: '14px 32px',
            borderRadius: '12px',
            display: 'inline-block',
            boxShadow: '0 4px 12px rgba(232, 98, 26, 0.25)',
          }}
        >
          Accéder à mon espace collaborateur →
        </Button>
        <Text style={{ fontSize: '11px', color: '#9CA3AF', margin: '10px 0 0' }}>
          Lien direct : {dashboardUrl}
        </Text>
      </Section>

      <Hr style={{ borderColor: '#EEF0F3', margin: '24px 0' }} />

      {/* Support / Contact info */}
      <Section style={{ textAlign: 'center' }}>
        <Text style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 4px' }}>
          Besoin d'aide ou d'informations complémentaires ?
        </Text>
        <Text style={{ fontSize: '12px', color: '#1B1F3B', fontWeight: 600, margin: '0' }}>
          Contactez la direction ou le support commercial sur WhatsApp au{' '}
          <a
            href={`https://wa.me/${SUPPORT_WHATSAPP}`}
            style={{ color: '#E8621A', textDecoration: 'none', fontWeight: 700 }}
          >
            +221 76 514 98 98
          </a>
        </Text>
      </Section>
    </Layout>
  );
};

export default CollaboratorWelcomeEmail;
