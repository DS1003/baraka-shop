import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/layout/Header'
import { Footer } from '@/layout/Footer'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Baraka Shop | High-Tech & Électronique Premium au Sénégal',
  description: 'Votre destination de confiance pour l\'électronique haut de gamme au Sénégal. Smartphones, Ordinateurs, Audio et Jeux Vidéo avec livraison express.',
  keywords: ['Baraka Shop', 'Sénégal', 'Électronique', 'Smartphone Sénégal', 'Ordinateur Dakar', 'High-Tech', 'Dakar Shop'],
  authors: [{ name: 'Baraka Shop' }],
  metadataBase: new URL('https://baraka.sn'),
  openGraph: {
    title: 'Baraka Shop | Électronique Premier au Sénégal',
    description: 'Le meilleur de la technologie livré chez vous partout au Sénégal.',
    url: 'https://baraka.sn',
    siteName: 'Baraka Shop',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=1200&h=630',
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
    description: 'Smartphones, Ordinateurs et plus au meilleur prix.',
    images: ['https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=1200&h=630'],
  },
  icons: {
    icon: 'https://baraka.sn/wp-content/uploads/2025/10/logo-contour-blanc-01-scaled-e1761208403239.png',
    shortcut: 'https://baraka.sn/wp-content/uploads/2025/10/logo-contour-blanc-01-scaled-e1761208403239.png',
    apple: 'https://baraka.sn/wp-content/uploads/2025/10/logo-contour-blanc-01-scaled-e1761208403239.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="h-full antialiased scroll-smooth">
      <body
        className={cn("min-h-full flex flex-col bg-background font-sans text-foreground selection:bg-primary/20", inter.className)}
        suppressHydrationWarning
      >
        <Header />
        <main className="flex-grow flex flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
