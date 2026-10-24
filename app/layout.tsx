import type { Metadata } from 'next'
import Script from 'next/script'
import { Plus_Jakarta_Sans, Inter, Montserrat, Roboto } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { Providers } from '@/components/providers'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat', display: 'swap' })
const roboto = Roboto({ 
  subsets: ['latin'], 
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap'
})

export const metadata: Metadata = {
  title: {
    default: 'Baraka Electronique (Baraka Shop) | Magasin Informatique & High-Tech Dakar Sénégal',
    template: '%s | Baraka Electronique'
  },
  description: 'Au cœur de Sandaga, Baraka Electronique est plus qu\'un distributeur : le partenaire de confiance qui connecte le Sénégal avec le meilleur de la technologie mondiale sans compromis sur la qualité, sans concession sur les prix.',
  keywords: [
    'Baraka electronique', 'baraka electronique dakar', 'baraka electronics', 'baraka electronics dakar',
    'baraka shop', 'baraka sn', 'baraka', 'electronique sn', 'baraka senegal', 'baraka sandaga',
    'magasin informatique dakar', 'materiel informatique dakar', 'ordinateur dakar', 'pc portable senegal',
    'smartphone dakar', '90 Rue Av. K. Bourgi', 'vente electronique senegal', 'boutique electronique dakar'
  ],
  authors: [{ name: 'Baraka Electronique' }, { name: 'Baraka Shop' }],
  metadataBase: new URL('https://baraka.sn'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Baraka Electronique (Baraka Shop) | Magasin Informatique & High-Tech Dakar',
    description: 'Boutique officielle Baraka Electronique (Baraka Shop) au 90 Rue Av. K. Bourgi Dakar. Ordinateurs, smartphones, tablettes et accessoires au meilleur prix au Sénégal.',
    url: 'https://baraka.sn',
    siteName: 'Baraka Electronique (Baraka Shop)',
    images: [
      {
        url: 'https://baraka.sn/wp-content/uploads/2025/10/logo-contour-blanc-01-scaled-e1761208403239.png',
        width: 1200,
        height: 630,
        alt: 'Baraka Electronique - Magasin d\'informatique et High-Tech à Dakar',
      },
    ],
    locale: 'fr_SN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Baraka Electronique (Baraka Shop) | Matériel Informatique & High-Tech Dakar',
    description: 'Smartphones, Ordinateurs, Tablettes et High-Tech au meilleur prix chez Baraka Electronique Dakar.',
    images: ['https://baraka.sn/wp-content/uploads/2025/10/logo-contour-blanc-01-scaled-e1761208403239.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: 'https://baraka.sn/wp-content/uploads/2025/10/logo-contour-blanc-01-scaled-e1761208403239.png' }
    ],
    shortcut: '/favicon.ico',
    apple: 'https://baraka.sn/wp-content/uploads/2025/10/logo-contour-blanc-01-scaled-e1761208403239.png',
  },
  manifest: '/manifest.json',
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || process.env.GOOGLE_SITE_VERIFICATION ? {
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || process.env.GOOGLE_SITE_VERIFICATION,
    }
  } : {}),
}

const rootJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['ElectronicsStore', 'ComputerStore', 'LocalBusiness'],
      '@id': 'https://baraka.sn/#store',
      name: 'Baraka Electronique',
      legalName: 'Baraka Electronique SARL',
      alternateName: [
        'Baraka Shop',
        'Baraka Electronics',
        'Baraka.sn',
        'Baraka SN',
        'Baraka Senegal',
        'Baraka Sandaga',
        'Baraka Informatique'
      ],
      url: 'https://baraka.sn',
      logo: 'https://baraka.sn/logo-icon.png',
      image: 'https://baraka.sn/wp-content/uploads/2025/10/logo-contour-blanc-01-scaled-e1761208403239.png',
      description: 'Au cœur de Sandaga, Baraka Electronique est plus qu\'un distributeur : le partenaire de confiance qui connecte le Sénégal avec le meilleur de la technologie mondiale sans compromis sur la qualité, sans concession sur les prix.',
      telephone: '+221338223422',
      email: 'contact@baraka.sn',
      priceRange: '$$',
      currenciesAccepted: 'XOF',
      paymentAccepted: 'Cash, Wave, Orange Money, Carte Bancaire',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Rue Avenue ABDOU, 90 Rue Av. K. Bourgi',
        addressLocality: 'Dakar',
        addressRegion: 'Dakar',
        postalCode: '10000',
        addressCountry: 'SN'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 14.6738,
        longitude: -17.4398
      },
      hasMap: 'https://maps.google.com/?q=90+Rue+Av.+K.+Bourgi,+Dakar,+Sénégal',
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '08:00',
          closes: '19:30'
        }
      ],
      sameAs: [
        'https://www.instagram.com/baraka.sn/',
        'https://wa.me/221765149898',
        'https://maps.google.com/?q=90+Rue+Av.+K.+Bourgi,+Dakar,+Sénégal'
      ]
    },
    {
      '@type': 'WebSite',
      '@id': 'https://baraka.sn/#website',
      url: 'https://baraka.sn',
      name: 'Baraka Electronique',
      alternateName: ['Baraka Shop', 'Baraka.sn'],
      description: 'Magasin d\'informatique, ordinateurs, smartphones et matériel électronique au Sénégal.',
      publisher: {
        '@id': 'https://baraka.sn/#store'
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://baraka.sn/boutique?q={search_term_string}'
        },
        'query-input': 'required name=search_term_string'
      }
    }
  ]
}

import { ScrollToTop } from '@/ui/ScrollToTop'
import { WhatsAppButton } from '@/ui/WhatsAppButton'

import { OrientationBlocker } from '@/components/OrientationBlocker'
import { InitialSiteLoader } from '@/components/InitialSiteLoader'
import { getSiteLogos } from '@/lib/actions/site-config-actions'
import { SiteLogosProvider } from '@/lib/hooks/useSiteLogos'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const initialLogos = await getSiteLogos()

  return (
    <html lang="fr" className="h-full antialiased scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Structured Data (Schema.org) for Google Knowledge Graph & Local SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(rootJsonLd) }}
        />

        {/* Resource Preconnections & DNS Prefetching for Ultra-Fast Image Loading */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://media.ldlc.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://sony.scene7.com" />

        {/* Google Analytics (gtag.js) - Loaded lazily to prioritize interactive rendering */}
        <Script
          strategy="lazyOnload"
          src="https://www.googletagmanager.com/gtag/js?id=G-BY3SM39WNQ"
        />
        <Script
          id="google-analytics"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-BY3SM39WNQ', { page_path: window.location.pathname });
            `,
          }}
        />
      </head>
      <body
        className={cn(
          "min-h-full flex flex-col bg-background font-sans text-foreground selection:bg-primary/20",
          plusJakartaSans.variable,
          inter.variable,
          montserrat.variable,
          roboto.variable,
          plusJakartaSans.className
        )}
        suppressHydrationWarning
      >
        <SiteLogosProvider initialLogos={initialLogos}>
          <Providers>
            <InitialSiteLoader />
            <OrientationBlocker />
            {children}
            <WhatsAppButton />
            <ScrollToTop />
          </Providers>
        </SiteLogosProvider>
      </body>
    </html>
  )
}
