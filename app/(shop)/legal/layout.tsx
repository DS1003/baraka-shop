import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: {
        absolute: 'Mentions Légales & CGV | Baraka Electronique (Baraka Shop) Sénégal',
    },
    description: 'Consultez les mentions légales, conditions générales de vente (CGV) et politique de confidentialité de Baraka Electronique (Baraka Shop SARL) à Dakar, Sénégal.',
    keywords: ['mentions légales baraka electronique', 'cgv baraka shop', 'confidentialité baraka'],
    alternates: {
        canonical: 'https://baraka.sn/legal',
    },
}

export default function LegalLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
