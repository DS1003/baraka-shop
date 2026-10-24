import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: {
        absolute: 'Contact & Magasin | Baraka Electronique (90 Rue Av. K. Bourgi Dakar)',
    },
    description: 'Contactez Baraka Electronique (Baraka Shop) à Dakar, Sénégal. Téléphone : +221 33 822 34 22, WhatsApp : +221 76 514 98 98. Adresse : 90 Rue Av. K. Bourgi, Sandaga.',
    keywords: ['contact baraka electronique', 'baraka electronique telephone', '33 822 34 22', 'adresse baraka electronique', '90 Rue Av. K. Bourgi Dakar', 'service client baraka shop'],
    alternates: {
        canonical: 'https://baraka.sn/contact',
    },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
