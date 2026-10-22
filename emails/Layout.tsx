import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Link,
  Font,
  Tailwind,
} from '@react-email/components';

interface LayoutProps {
  previewText: string;
  logoUrl?: string;
  children: React.ReactNode;
}

export const Layout = ({ previewText, logoUrl, children }: LayoutProps) => {
  return (
    <Html lang="fr">
      <Tailwind>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta name="x-apple-disable-message-reformatting" />
          <meta name="format-detection" content="telephone=no, address=no, email=no, date=no, url=no" />
          <meta name="color-scheme" content="light" />
          <meta name="supported-color-schemes" content="light" />
          <Font
            fontFamily="Plus Jakarta Sans"
            fallbackFontFamily="sans-serif"
            webFont={{
              url: 'https://fonts.gstatic.com/s/plusjakartasans/v8/LDIbaomQNQcsDxUx306GMRhhcl0_7wq_BeL2fL7e.woff2',
              format: 'woff2',
            }}
            fontWeight={400}
            fontStyle="normal"
          />
          <Font
            fontFamily="Plus Jakarta Sans"
            fallbackFontFamily="sans-serif"
            webFont={{
              url: 'https://fonts.gstatic.com/s/plusjakartasans/v8/LDIbaomQNQcsDxUx306GMRhhcl0_7wq_Bfv2fL7e.woff2',
              format: 'woff2',
            }}
            fontWeight={600}
            fontStyle="normal"
          />
          <Font
            fontFamily="Plus Jakarta Sans"
            fallbackFontFamily="sans-serif"
            webFont={{
              url: 'https://fonts.gstatic.com/s/plusjakartasans/v8/LDIbaomQNQcsDxUx306GMRhhcl0_7wq_Bfr2fL7e.woff2',
              format: 'woff2',
            }}
            fontWeight={700}
            fontStyle="normal"
          />
          <style
            dangerouslySetInnerHTML={{
              __html: `
                /* Base Reset */
                html, body {
                  margin: 0 !important;
                  padding: 0 !important;
                  width: 100% !important;
                  min-width: 100% !important;
                  -webkit-text-size-adjust: 100% !important;
                  -ms-text-size-adjust: 100% !important;
                }
                table, td {
                  mso-table-lspace: 0pt !important;
                  mso-table-rspace: 0pt !important;
                  border-collapse: collapse !important;
                }
                img {
                  -ms-interpolation-mode: bicubic;
                  border: 0;
                  height: auto;
                  line-height: 100%;
                  outline: none;
                  text-decoration: none;
                }

                /* Mobile media query (screen <= 600px) */
                @media only screen and (max-width: 600px) {
                  .email-body {
                    padding: 0 !important;
                    background-color: #FFFFFF !important;
                  }
                  .body-cell {
                    padding: 0 !important;
                    background-color: #FFFFFF !important;
                  }
                  body > table > tbody > tr > td {
                    padding: 0 !important;
                    background-color: #FFFFFF !important;
                  }
                  .email-container {
                    width: 100% !important;
                    max-width: 100% !important;
                    min-width: 100% !important;
                    border: none !important;
                    border-radius: 0px !important;
                    box-shadow: none !important;
                  }
                  .header-section {
                    padding: 20px 14px 12px 14px !important;
                  }
                  .content-section {
                    padding: 2px 14px 20px 14px !important;
                  }
                  .footer-section {
                    padding: 20px 14px 18px 14px !important;
                  }
                  .footer-pillar {
                    display: block !important;
                    width: 100% !important;
                    text-align: center !important;
                    padding: 4px 0 !important;
                    font-size: 11px !important;
                  }
                  .footer-divider {
                    display: none !important;
                  }
                  .footer-contact-wa {
                    display: block !important;
                    margin: 8px auto !important;
                    max-width: 270px !important;
                    padding: 9px 12px !important;
                    text-align: center !important;
                    box-sizing: border-box !important;
                  }
                  .footer-contact-link {
                    display: inline-block !important;
                    margin: 6px 6px !important;
                    text-align: center !important;
                  }
                  .hero-title {
                    font-size: 22px !important;
                    line-height: 28px !important;
                  }
                  .hero-subtitle {
                    font-size: 13px !important;
                    line-height: 19px !important;
                    padding: 0 2px !important;
                  }
                  .status-card {
                    padding: 14px 12px !important;
                    border-radius: 14px !important;
                    margin-bottom: 10px !important;
                  }
                  .detail-card {
                    padding: 2px 12px 4px 12px !important;
                    border-radius: 14px !important;
                    margin-bottom: 10px !important;
                  }
                  .detail-label {
                    font-size: 12px !important;
                    padding: 8px 8px 8px 0 !important;
                  }
                  .detail-value {
                    font-size: 13px !important;
                    line-height: 18px !important;
                    padding: 8px 0 !important;
                    word-break: break-word !important;
                  }
                  .callout-box {
                    padding: 12px 14px !important;
                    border-radius: 14px !important;
                    margin-top: 16px !important;
                  }
                  .cta-button {
                    display: block !important;
                    width: 100% !important;
                    padding: 14px 16px !important;
                    box-sizing: border-box !important;
                    text-align: center !important;
                    font-size: 14px !important;
                  }
                  .step-label {
                    font-size: 9.5px !important;
                    line-height: 12px !important;
                    letter-spacing: -0.02em !important;
                    text-align: center !important;
                  }
                  .item-img-cell {
                    width: 48px !important;
                    padding: 10px 8px 10px 0 !important;
                  }
                  .item-img {
                    width: 42px !important;
                    height: 42px !important;
                  }
                  .item-title {
                    font-size: 13px !important;
                    line-height: 17px !important;
                    word-break: break-word !important;
                  }
                  .item-meta {
                    font-size: 11.5px !important;
                  }
                  .item-price {
                    font-size: 13px !important;
                    padding-left: 6px !important;
                  }
                  .receipt-total {
                    font-size: 20px !important;
                    line-height: 24px !important;
                  }
                }
              `,
            }}
          />
        </Head>
        <Preview>{previewText}</Preview>
        <Body
          className="email-body"
          style={{
            backgroundColor: '#F6F7F9',
            margin: 0,
            padding: '24px 0 36px 0',
            fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            WebkitFontSmoothing: 'antialiased',
          }}
        >
          <Container
            className="email-container"
            style={{
              maxWidth: '600px',
              width: '100%',
              margin: '0 auto',
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              border: '1px solid #ECEFF2',
              overflow: 'hidden',
              boxShadow: '0 4px 24px rgba(15, 23, 42, 0.04)',
            }}
          >
            {/* Minimalist 2027 Brand Header */}
            <Section
              className="header-section"
              style={{
                backgroundColor: '#FFFFFF',
                padding: '28px 20px 16px 20px',
                textAlign: 'center',
              }}
            >
              <Link href="https://baraka.sn" style={{ textDecoration: 'none', display: 'inline-block' }}>
                {logoUrl ? (
                  <Img
                    src={logoUrl}
                    alt="Baraka Shop"
                    width="132"
                    style={{
                      margin: '0 auto',
                      maxWidth: '132px',
                      height: 'auto',
                      maxHeight: '40px',
                      display: 'block',
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <span
                      style={{
                        fontSize: '23px',
                        fontWeight: 900,
                        letterSpacing: '-0.04em',
                        color: '#0B0F19',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    >
                      Baraka<span style={{ color: '#EA580C' }}>.</span>
                    </span>
                  </div>
                )}
              </Link>
            </Section>

            {/* Content Area */}
            <Section className="content-section" style={{ padding: '4px 20px 24px 20px' }}>
              {children}
            </Section>

            {/* Premium 2027 Footer */}
            <Section
              className="footer-section"
              style={{
                backgroundColor: '#FAFAFC',
                borderTop: '1px solid #ECEFF2',
                padding: '24px 18px 20px 18px',
                textAlign: 'center',
              }}
            >
              {/* Trust Pillars — fluid inline pills that wrap gracefully without forcing table width */}
              <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                <span
                  className="footer-pillar"
                  style={{
                    display: 'inline-block',
                    padding: '3px 8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#4B5563',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  <span style={{ color: '#EA580C', marginRight: '4px' }}>⚡</span>Livraison Dakar 24h
                </span>
                <span className="footer-divider" style={{ color: '#CBD5E1', fontSize: '11px' }}>•</span>
                <span
                  className="footer-pillar"
                  style={{
                    display: 'inline-block',
                    padding: '3px 8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#4B5563',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  <span style={{ color: '#16A34A', marginRight: '4px' }}>🛡️</span>100% Neuf &amp; Garanti
                </span>
                <span className="footer-divider" style={{ color: '#CBD5E1', fontSize: '11px' }}>•</span>
                <span
                  className="footer-pillar"
                  style={{
                    display: 'inline-block',
                    padding: '3px 8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#4B5563',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  <span style={{ color: '#0284C7', marginRight: '4px' }}>💬</span>SAV Client 7j/7
                </span>
              </div>

              {/* Direct Help / Concierge Contacts */}
              <Text style={{ fontSize: '12.5px', color: '#64748B', margin: '0 0 10px 0', lineHeight: '19px' }}>
                Une question sur votre commande ? Notre équipe vous répond immédiatement :
              </Text>

              <div style={{ margin: '0 0 16px 0', fontSize: '12.5px' }}>
                <Link
                  href="https://wa.me/221765149898"
                  className="footer-contact-wa"
                  style={{
                    color: '#15803D',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-block',
                    margin: '4px 6px',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#F0FDF4',
                    border: '1px solid #DCFCE7',
                  }}
                >
                  💬 WhatsApp : +221 76 514 98 98
                </Link>
                <div style={{ display: 'inline-block' }}>
                  <Link
                    href="tel:+221765149898"
                    className="footer-contact-link"
                    style={{ color: '#0B0F19', fontWeight: 600, textDecoration: 'none', margin: '4px 6px', display: 'inline-block' }}
                  >
                    📞 +221 76 514 98 98
                  </Link>
                  <span style={{ color: '#CBD5E1' }}>•</span>
                  <Link
                    href="mailto:contact@baraka.sn"
                    className="footer-contact-link"
                    style={{ color: '#0B0F19', fontWeight: 600, textDecoration: 'none', margin: '4px 6px', display: 'inline-block' }}
                  >
                    ✉️ contact@baraka.sn
                  </Link>
                </div>
              </div>

              <Hr style={{ borderColor: '#E5E7EB', margin: '16px auto', width: '80%' }} />

              <Text style={{ fontSize: '11px', color: '#94A3B8', margin: 0, lineHeight: '17px' }}>
                © {new Date().getFullYear()} <strong>Baraka Shop</strong> — Électronique &amp; High-Tech d&apos;origine au Sénégal.<br />
                Dakar, Sénégal
              </Text>

              <Text style={{ fontSize: '11px', color: '#94A3B8', margin: '8px 0 0 0' }}>
                <Link href="https://baraka.sn" style={{ color: '#64748B', textDecoration: 'none', margin: '0 6px', fontWeight: 600 }}>
                  Boutique
                </Link>
                <span style={{ color: '#CBD5E1' }}>•</span>
                <Link href="https://baraka.sn/account" style={{ color: '#64748B', textDecoration: 'none', margin: '0 6px', fontWeight: 600 }}>
                  Suivi de commande
                </Link>
                <span style={{ color: '#CBD5E1' }}>•</span>
                <Link href="https://baraka.sn/cgv" style={{ color: '#64748B', textDecoration: 'none', margin: '0 6px', fontWeight: 600 }}>
                  Conditions de vente
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default Layout;
