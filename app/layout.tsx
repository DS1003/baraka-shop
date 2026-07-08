import type { Metadata } from 'next'
import { Inter, Montserrat, Roboto } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' })
const roboto = Roboto({ 
  subsets: ['latin'], 
  weight: ['100', '300', '400', '500', '700', '900'],
  variable: '--font-roboto' 
})

export const metadata: Metadata = {
  title: {
    default: 'Baraka Shop | Électronique et High-Tech Premier au Sénégal',
    template: '%s | Baraka Shop'
  },
  description: 'Baraka Shop (Baraka Electronique) : Votre destination de confiance pour l\'électronique haut de gamme, smartphones, ordinateurs et accessoires à Dakar, Sénégal (Sandaga).',
  keywords: [
    'Baraka electronique', 'baraka shop', 'baraka sn', 'baraka', 'electronique sn', 
    'baraka sandaga', 'smartphone dakar', 'ordinateur sénégal', 'high-tech dakar', 
    'vente électronique sénégal', 'boutique electronique dakar'
  ],
  authors: [{ name: 'Baraka Electronique' }, { name: 'Baraka Shop' }],
  metadataBase: new URL('https://baraka.sn'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Baraka Shop (Baraka Electronique) | High-Tech Sénégal',
    description: 'Le meilleur de la technologie livré chez vous partout au Sénégal. Découvrez notre sélection Baraka SN.',
    url: 'https://baraka.sn',
    siteName: 'Baraka Shop',
    images: [
      {
        url: 'https://baraka.sn/wp-content/uploads/2025/10/logo-contour-blanc-01-scaled-e1761208403239.png',
        width: 1200,
        height: 630,
        alt: 'Baraka Shop Premium Electronics',
      },
    ],
    locale: 'fr_SN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Baraka Shop | High-Tech Sénégal',
    description: 'Smartphones, Ordinateurs et plus au meilleur prix chez Baraka Electronique.',
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
    icon: 'https://baraka.sn/wp-content/uploads/2025/10/logo-contour-blanc-01-scaled-e1761208403239.png',
    shortcut: 'https://baraka.sn/wp-content/uploads/2025/10/logo-contour-blanc-01-scaled-e1761208403239.png',
    apple: 'https://baraka.sn/wp-content/uploads/2025/10/logo-contour-blanc-01-scaled-e1761208403239.png',
  },
  manifest: '/manifest.json',
  other: {
    'google-site-verification': 'VOTRE_CODE_VERIFICATION_GOOGLE',
  },
}

import { ScrollToTop } from '@/ui/ScrollToTop'
import { WhatsAppButton } from '@/ui/WhatsAppButton'

import { OrientationBlocker } from '@/components/OrientationBlocker'
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
      <head />
      <body
        className={cn(
          "min-h-full flex flex-col bg-background font-sans text-foreground selection:bg-primary/20",
          inter.variable,
          montserrat.variable,
          roboto.variable,
          inter.className
        )}
        suppressHydrationWarning
      >
        <SiteLogosProvider initialLogos={initialLogos}>
          <Providers>
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
