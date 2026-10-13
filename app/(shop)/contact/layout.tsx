import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: {
        absolute: 'Contact & Service Client | Baraka Shop Dakar Sénégal',
    },
    description: 'Contactez le service client de Baraka Shop (Baraka Electronique) à Dakar, Sénégal. Assistance technique, conseils d\'experts et support réactif par téléphone et WhatsApp.',
    keywords: ['contact baraka shop', 'baraka electronique telephone', 'service client baraka', 'boutique electronique dakar sandaga'],
    alternates: {
        canonical: 'https://baraka.sn/contact',
    },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
