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
    <Html>
      <Tailwind>
        <Head>
          <Font
            fontFamily="Inter"
            fallbackFontFamily="sans-serif"
            webFont={{
              url: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2',
              format: 'woff2',
            }}
            fontWeight={400}
            fontStyle="normal"
          />
          <Font
            fontFamily="Inter"
            fallbackFontFamily="sans-serif"
            webFont={{
              url: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYfAZ9hjp-Ek-_EeA.woff2',
              format: 'woff2',
            }}
            fontWeight={600}
            fontStyle="normal"
          />
        </Head>
        <Preview>{previewText}</Preview>
        <Body className="bg-gray-50 my-auto mx-auto font-sans">
          <Container className="border border-solid border-gray-200 rounded-xl my-[40px] mx-auto overflow-hidden bg-white shadow-sm max-w-[600px]">
            {/* Header / Logo */}
            <Section className="bg-[#0A0C10] py-[24px] text-center">
              {logoUrl ? (
                <Img
                  src={logoUrl}
                  height="40"
                  alt="Baraka Shop"
                  className="my-0 mx-auto object-contain"
                />
              ) : (
                <Text className="text-white text-[28px] font-bold m-0 tracking-wide font-sans">
                  Baraka<span className="text-[#E8621A]">.</span>
                </Text>
              )}
            </Section>

            {/* Content Wrapper */}
            <Section className="p-[32px]">
              {children}
            </Section>

            {/* Footer */}
            <Section className="bg-gray-50 border-t border-solid border-gray-200 py-[32px] px-[20px]">
              <Text className="text-gray-600 text-[14px] leading-[24px] text-center mb-0 font-medium">
                L'équipe Baraka vous remercie pour votre confiance.
              </Text>
              <Text className="text-gray-500 text-[13px] leading-[20px] text-center mt-3">
                Une question sur votre commande ? <br />
                <Link href="tel:+221765149898" className="text-[#E8621A] font-semibold underline">+221 76 514 98 98</Link> |{' '}
                <Link href="mailto:contact@baraka.sn" className="text-[#E8621A] font-semibold underline">contact@baraka.sn</Link>
              </Text>
              <Hr className="border border-solid border-gray-200 my-[20px] mx-auto w-[80%]" />
              <Text className="text-gray-400 text-[12px] leading-[18px] text-center mb-0">
                © {new Date().getFullYear()} Baraka Shop. Tous droits réservés.<br />
                Dakar, Sénégal
                <br /><br />
                <Link href="https://baraka.sn" className="text-gray-400 underline">Visiter la boutique</Link>
                {' • '}
                <Link href="https://baraka.sn/cgv" className="text-gray-400 underline">Conditions générales</Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default Layout;
