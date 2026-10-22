import * as React from 'react';
import { Section, Text, Heading, Img, Link, Button } from '@react-email/components';
import { formatPrice } from '@/lib/utils';

/* ──────────────────────────────────────────────────────────────
 * Types partagés par tous les emails transactionnels de commande
 * ────────────────────────────────────────────────────────────── */
export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface OrderShippedEmailProps {
  orderRef: string;
  orderId?: string;
  clientName: string;
  date: string;
  deliveryAddress?: string;
  phone?: string;
  deliveryMethod: string;
  paymentMethod: string;
  paymentStatus: 'PAID' | 'PENDING' | 'ON_DELIVERY' | 'REFUNDED' | 'FAILED' | string;
  total: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  estimatedDelivery?: string;
  items: OrderItem[];
  logoUrl?: string;
}

/* ──────────────────────────────────────────────────────────────
 * Design tokens (2027 — minimal, encre profonde + accent Baraka)
 * ────────────────────────────────────────────────────────────── */
export const tokens = {
  ink: '#0B0F19',
  text: '#374151',
  muted: '#6B7280',
  subtle: '#9CA3AF',
  line: '#EEF0F3',
  track: '#E9EBEF',
  surface: '#F8F9FB',
  accent: '#EA580C',
  success: '#15803D',
  successDot: '#22C55E',
  danger: '#BE123C',
  dangerDot: '#F43F5E',
  warn: '#B45309',
  warnDot: '#F59E0B',
  violet: '#6D28D9',
  violetDot: '#8B5CF6',
};

export const SUPPORT_WHATSAPP = '221765149898';
export const SHOP_URL = 'https://baraka.sn';

type Tone = 'accent' | 'success' | 'danger' | 'neutral';

const toneColor = (tone: Tone) =>
  tone === 'success' ? tokens.successDot : tone === 'danger' ? tokens.dangerDot : tone === 'neutral' ? tokens.ink : tokens.accent;

const eyebrowStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: tokens.subtle,
};

/* ──────────────────────────────────────────────────────────────
 * Helpers métier
 * ────────────────────────────────────────────────────────────── */
export const isCashOnDeliveryPayment = (paymentMethod?: string, paymentStatus?: string) =>
  !!paymentMethod?.toLowerCase().includes('livraison') ||
  paymentMethod?.toLowerCase() === 'cash' ||
  paymentStatus === 'ON_DELIVERY';

export const getPaymentState = (status: string, isCod: boolean) => {
  if (status === 'PAID') return { label: 'Payée', color: tokens.success, dot: tokens.successDot };
  if (status === 'REFUNDED') return { label: 'Remboursée', color: tokens.violet, dot: tokens.violetDot };
  if (status === 'FAILED') return { label: 'Échec du paiement', color: tokens.danger, dot: tokens.dangerDot };
  if (isCod) return { label: 'À régler à la livraison', color: tokens.warn, dot: tokens.warnDot };
  return { label: 'En attente de règlement', color: tokens.warn, dot: tokens.warnDot };
};

/** Pastille de statut discrète : point coloré + libellé */
export const StatusDot = ({ label, color, dot }: { label: string; color: string; dot: string }) => (
  <span style={{ color, fontWeight: 700, whiteSpace: 'nowrap' }}>
    <span style={{ color: dot, fontSize: '10px', marginRight: '6px', verticalAlign: '1px' }}>●</span>
    {label}
  </span>
);

/* ──────────────────────────────────────────────────────────────
 * Hero — eyebrow + grand titre + sous-titre
 * ────────────────────────────────────────────────────────────── */
export const Hero = ({
  eyebrow,
  tone = 'accent',
  title,
  subtitle,
}: {
  eyebrow: string;
  tone?: Tone;
  title: string;
  subtitle: React.ReactNode;
}) => (
  <Section style={{ textAlign: 'center', padding: '4px 0 18px 0' }}>
    <Text style={{ ...eyebrowStyle, color: tokens.ink, margin: '0 0 10px 0' }}>
      <span style={{ color: toneColor(tone), fontSize: '9px', marginRight: '8px', verticalAlign: '1px' }}>●</span>
      {eyebrow}
    </Text>
    <Heading
      as="h1"
      className="hero-title"
      style={{
        margin: '0 0 8px 0',
        fontSize: '25px',
        lineHeight: '32px',
        fontWeight: 800,
        letterSpacing: '-0.03em',
        color: tokens.ink,
      }}
    >
      {title}
    </Heading>
    <Text className="hero-subtitle" style={{ margin: '0 auto', maxWidth: '440px', fontSize: '13.5px', lineHeight: '21px', color: tokens.muted }}>
      {subtitle}
    </Text>
  </Section>
);

/* ──────────────────────────────────────────────────────────────
 * Status card — référence + date + tracker segmenté 4 étapes
 * ────────────────────────────────────────────────────────────── */
const STEPS = ['Confirmée', 'En cours', 'Expédiée', 'Livrée'];

export const StatusCard = ({
  orderRef,
  date,
  dateLabel = 'Passée le',
  reached,
  tone = 'accent',
  note,
}: {
  orderRef: string;
  date: string;
  dateLabel?: string;
  /** Nombre d'étapes atteintes (1 à 4). 0 = pas de tracker (ex : annulée) */
  reached: number;
  tone?: Tone;
  note?: React.ReactNode;
}) => {
  const color = toneColor(tone);
  return (
    <Section
      className="status-card"
      style={{
        backgroundColor: tokens.surface,
        border: `1px solid ${tokens.line}`,
        borderRadius: '16px',
        padding: '16px 16px',
        margin: '0 0 12px 0',
      }}
    >
      <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
        <tbody>
          <tr>
            <td style={{ verticalAlign: 'top' }}>
              <div style={{ ...eyebrowStyle, fontSize: '10px', marginBottom: '3px' }}>Commande</div>
              <div
                style={{
                  fontSize: '14.5px',
                  fontWeight: 700,
                  color: tokens.ink,
                  letterSpacing: '0.01em',
                  fontFamily: "'SF Mono', 'JetBrains Mono', Menlo, Consolas, monospace",
                }}
              >
                {orderRef}
              </div>
            </td>
            <td style={{ verticalAlign: 'top', textAlign: 'right' }}>
              <div style={{ ...eyebrowStyle, fontSize: '10px', marginBottom: '3px' }}>{dateLabel}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: tokens.ink }}>{date}</div>
            </td>
          </tr>
        </tbody>
      </table>

      {reached > 0 && (
        <table
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          role="presentation"
          style={{ marginTop: '16px', tableLayout: 'fixed' }}
        >
          <tbody>
            <tr>
              {STEPS.map((_, i) => (
                <td key={i} style={{ padding: i === 0 ? '0 2px 0 0' : i === STEPS.length - 1 ? '0 0 0 2px' : '0 2px' }}>
                  <div
                    style={{
                      height: '4px',
                      lineHeight: '4px',
                      fontSize: '1px',
                      borderRadius: '999px',
                      backgroundColor: i < reached ? color : tokens.track,
                    }}
                  >
                    &nbsp;
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              {STEPS.map((label, i) => {
                const isCurrent = i === reached - 1;
                const isDone = i < reached;
                return (
                  <td
                    key={i}
                    className="step-label"
                    style={{
                      paddingTop: '8px',
                      paddingLeft: i === 0 ? 0 : '1px',
                      paddingRight: i === STEPS.length - 1 ? 0 : '1px',
                      verticalAlign: 'top',
                      textAlign: 'center',
                      fontSize: '10.5px',
                      lineHeight: '13px',
                      fontWeight: isCurrent ? 700 : 600,
                      color: isDone ? tokens.ink : tokens.subtle,
                      wordBreak: 'break-word',
                    }}
                  >
                    {label}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      )}

      {note && (
        <div
          style={{
            marginTop: '12px',
            paddingTop: '10px',
            borderTop: `1px solid ${tokens.line}`,
            fontSize: '12.5px',
            lineHeight: '18px',
            color: tokens.text,
            wordBreak: 'break-word',
          }}
        >
          {note}
        </div>
      )}
    </Section>
  );
};

/* ──────────────────────────────────────────────────────────────
 * Detail card — liste clé / valeur façon reçu Apple
 * ────────────────────────────────────────────────────────────── */
export interface DetailRow {
  label: string;
  value: React.ReactNode;
}

export const DetailCard = ({ title, rows }: { title: string; rows: DetailRow[] }) => (
  <Section
    className="detail-card"
    style={{
      border: `1px solid ${tokens.line}`,
      borderRadius: '16px',
      padding: '2px 16px 4px 16px',
      margin: '0 0 10px 0',
    }}
  >
    <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
      <tbody>
        <tr>
          <td colSpan={2} style={{ ...eyebrowStyle, fontSize: '10px', padding: '12px 0 6px 0' }}>
            {title}
          </td>
        </tr>
        {rows.map((row, i) => (
          <tr key={i}>
            <td
              className="detail-label"
              style={{
                width: '1%',
                whiteSpace: 'nowrap',
                padding: '9px 12px 9px 0',
                borderTop: `1px solid ${tokens.line}`,
                fontSize: '12.5px',
                lineHeight: '18px',
                color: tokens.muted,
                verticalAlign: 'top',
              }}
            >
              {row.label}
            </td>
            <td
              className="detail-value"
              style={{
                padding: '9px 0',
                borderTop: `1px solid ${tokens.line}`,
                fontSize: '13px',
                lineHeight: '18px',
                fontWeight: 600,
                color: tokens.ink,
                textAlign: 'right',
                verticalAlign: 'top',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}
            >
              {row.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </Section>
);

/** Lien téléphone sans le bleu souligné imposé par Gmail */
export const PhoneLink = ({ phone }: { phone: string }) => (
  <Link href={`tel:${phone.replace(/\s+/g, '')}`} style={{ color: tokens.ink, textDecoration: 'none' }}>
    {phone}
  </Link>
);

/* ──────────────────────────────────────────────────────────────
 * Articles
 * ────────────────────────────────────────────────────────────── */
export const ItemsList = ({ items, title = 'Articles' }: { items: OrderItem[]; title?: string }) => {
  const count = items.reduce((acc, it) => acc + (it.quantity || 0), 0);
  return (
    <Section className="items-list-section" style={{ margin: '20px 0 0 0' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} role="presentation" style={{ marginBottom: '6px' }}>
        <tbody>
          <tr>
            <td style={{ ...eyebrowStyle, fontSize: '10px' }}>{title}</td>
            <td style={{ textAlign: 'right', fontSize: '11.5px', color: tokens.subtle, fontWeight: 600 }}>
              {count} article{count > 1 ? 's' : ''}
            </td>
          </tr>
        </tbody>
      </table>
      <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td
                className="item-img-cell"
                width="56"
                style={{ width: '56px', padding: '12px 10px 12px 0', borderTop: `1px solid ${tokens.line}`, verticalAlign: 'middle' }}
              >
                <Img
                  className="item-img"
                  src={item.image || 'https://via.placeholder.com/112'}
                  width="46"
                  height="46"
                  alt={item.name}
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '10px',
                    objectFit: 'contain',
                    border: `1px solid ${tokens.line}`,
                    backgroundColor: '#FFFFFF',
                    display: 'block',
                  }}
                />
              </td>
              <td style={{ padding: '12px 0', borderTop: `1px solid ${tokens.line}`, verticalAlign: 'middle' }}>
                <div className="item-title" style={{ fontSize: '13.5px', fontWeight: 600, color: tokens.ink, lineHeight: '18px', letterSpacing: '-0.01em', wordBreak: 'break-word' }}>
                  {item.name}
                </div>
                <div className="item-meta" style={{ fontSize: '11.5px', color: tokens.muted, marginTop: '2px', lineHeight: '16px' }}>
                  Qté {item.quantity}
                  <span style={{ color: tokens.track, margin: '0 5px' }}>|</span>
                  {formatPrice(item.price)} l&apos;unité
                </div>
              </td>
              <td
                className="item-price"
                style={{
                  padding: '12px 0 12px 8px',
                  borderTop: `1px solid ${tokens.line}`,
                  verticalAlign: 'middle',
                  textAlign: 'right',
                  whiteSpace: 'nowrap',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: tokens.ink,
                }}
              >
                {formatPrice(item.quantity * item.price)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  );
};

/* ──────────────────────────────────────────────────────────────
 * Reçu — sous-total, livraison, réduction, total
 * ────────────────────────────────────────────────────────────── */
export const Receipt = ({
  subtotal,
  deliveryFee,
  discount,
  total,
  totalLabel = 'Total',
  isPickup = false,
}: {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  totalLabel?: string;
  isPickup?: boolean;
}) => {
  const row = (label: string, value: React.ReactNode, color: string = tokens.ink) => (
    <tr>
      <td style={{ padding: '5px 0', fontSize: '13px', color: tokens.muted }}>{label}</td>
      <td style={{ padding: '5px 0', fontSize: '13px', fontWeight: 600, color, textAlign: 'right', whiteSpace: 'nowrap' }}>
        {value}
      </td>
    </tr>
  );
  return (
    <Section style={{ borderTop: `1px solid ${tokens.line}`, padding: '12px 0 0 0', margin: '0 0 6px 0' }}>
      <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
        <tbody>
          {row('Sous-total', formatPrice(subtotal))}
          {row(
            isPickup ? 'Retrait en boutique' : 'Livraison',
            deliveryFee > 0 ? formatPrice(deliveryFee) : 'Offerte',
            deliveryFee > 0 ? tokens.ink : tokens.success
          )}
          {discount > 0 && row('Réduction', `− ${formatPrice(discount)}`, tokens.accent)}
          <tr>
            <td colSpan={2} style={{ padding: '10px 0 0 0' }}>
              <div style={{ borderTop: `1px dashed #DDE1E6`, height: '1px', lineHeight: '1px', fontSize: '1px' }}>&nbsp;</div>
            </td>
          </tr>
          <tr>
            <td style={{ padding: '12px 0 0 0', verticalAlign: 'bottom' }}>
              <div style={{ fontSize: '14.5px', fontWeight: 700, color: tokens.ink }}>{totalLabel}</div>
              <div style={{ fontSize: '10.5px', color: tokens.subtle, marginTop: '2px' }}>Francs CFA, TTC</div>
            </td>
            <td
              className="receipt-total"
              style={{
                padding: '12px 0 0 0',
                verticalAlign: 'bottom',
                textAlign: 'right',
                whiteSpace: 'nowrap',
                fontSize: '22px',
                lineHeight: '26px',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: tokens.ink,
              }}
            >
              {formatPrice(total)}
            </td>
          </tr>
        </tbody>
      </table>
    </Section>
  );
};

/* ──────────────────────────────────────────────────────────────
 * Callout — encart contextuel (paiement, info, alerte)
 * ────────────────────────────────────────────────────────────── */
const CALLOUT_THEMES = {
  warm: { bg: '#FFF8F1', border: '#FDE6D2', title: '#9A3412', dot: tokens.accent },
  success: { bg: '#F3FBF6', border: '#D5F0DF', title: tokens.success, dot: tokens.successDot },
  danger: { bg: '#FFF5F6', border: '#FBD9DF', title: tokens.danger, dot: tokens.dangerDot },
  violet: { bg: '#F8F5FF', border: '#E6DCFB', title: tokens.violet, dot: tokens.violetDot },
  neutral: { bg: tokens.surface, border: tokens.line, title: tokens.ink, dot: tokens.subtle },
} as const;

export const Callout = ({
  theme = 'neutral',
  title,
  children,
  amount,
  amountLabel,
}: {
  theme?: keyof typeof CALLOUT_THEMES;
  title: string;
  children: React.ReactNode;
  amount?: number;
  amountLabel?: string;
}) => {
  const c = CALLOUT_THEMES[theme];
  return (
    <Section
      className="callout-box"
      style={{
        backgroundColor: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: '16px',
        padding: '14px 16px',
        margin: '18px 0 0 0',
      }}
    >
      <div style={{ fontSize: '13px', fontWeight: 700, color: c.title, marginBottom: '5px' }}>
        <span style={{ color: c.dot, fontSize: '9px', marginRight: '8px', verticalAlign: '1px' }}>●</span>
        {title}
      </div>
      {typeof amount === 'number' && (
        <div style={{ margin: '6px 0 8px 0' }}>
          {amountLabel && <div style={{ fontSize: '11.5px', color: tokens.muted, marginBottom: '2px' }}>{amountLabel}</div>}
          <div className="receipt-total" style={{ fontSize: '22px', lineHeight: '28px', fontWeight: 800, letterSpacing: '-0.02em', color: tokens.ink }}>
            {formatPrice(amount)}
          </div>
        </div>
      )}
      <div style={{ fontSize: '12.5px', lineHeight: '19px', color: tokens.text, wordBreak: 'break-word' }}>{children}</div>
    </Section>
  );
};

/* ──────────────────────────────────────────────────────────────
 * Actions — CTA principal + conciergerie WhatsApp
 * ────────────────────────────────────────────────────────────── */
export const Actions = ({
  href,
  label,
  orderRef,
  orderId,
  secondary,
}: {
  href?: string;
  label: string;
  orderRef?: string;
  orderId?: string;
  secondary?: { href: string; label: string };
}) => {
  const trackingParam = orderId || orderRef;
  const targetHref =
    href ||
    (trackingParam
      ? `${SHOP_URL}/order-success?orderId=${encodeURIComponent(trackingParam)}`
      : `${SHOP_URL}/account`);

  const waText = orderRef
    ? `Bonjour Baraka, je vous contacte au sujet de ma commande ${orderRef}.`
    : 'Bonjour Baraka, j’ai une question.';
  return (
    <Section style={{ textAlign: 'center', margin: '24px 0 4px 0' }}>
      <Button
        href={targetHref}
        className="cta-button"
        style={{
          backgroundColor: tokens.ink,
          color: '#FFFFFF',
          borderRadius: '14px',
          fontSize: '14px',
          fontWeight: 700,
          letterSpacing: '-0.01em',
          padding: '14px 28px',
          display: 'inline-block',
          textDecoration: 'none',
        }}
      >
        {label}&nbsp;&nbsp;→
      </Button>
      <div style={{ marginTop: '14px', fontSize: '12.5px', lineHeight: '19px' }}>
        {secondary ? (
          <Link href={secondary.href} className="footer-contact-link" style={{ color: tokens.ink, fontWeight: 600, textDecoration: 'none', margin: '0 8px' }}>
            {secondary.label}
          </Link>
        ) : null}
        <Link
          href={`https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(waText)}`}
          className="footer-contact-link"
          style={{ color: tokens.success, fontWeight: 600, textDecoration: 'none', margin: '0 8px' }}
        >
          Besoin d&apos;aide ? Écrire sur WhatsApp
        </Link>
      </div>
    </Section>
  );
};
