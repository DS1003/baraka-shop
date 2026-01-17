import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/layout/Header'
import { Footer } from '@/layout/Footer'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Baraka Shop - Électronique Premier au Sénégal',
  description: 'Votre destination de confiance pour l\'électronique haut de gamme au Sénégal. Smartphones, Ordinateurs, Caméras et plus.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="h-full antialiased scroll-smooth">
      <body className={cn("min-h-full flex flex-col bg-background font-sans text-foreground selection:bg-primary/20", inter.className)}>
        <Header />
        <main className="flex-grow flex flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
