import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: {
        absolute: 'Foire Aux Questions (FAQ) | Baraka Electronique Dakar',
    },
    description: 'Toutes les réponses à vos questions sur les commandes, la livraison à Dakar et au Sénégal, la garantie et le SAV chez Baraka Electronique (Baraka Shop).',
    keywords: ['faq baraka electronique', 'livraison baraka dakar', 'garantie baraka electronique', 'sav baraka shop'],
    alternates: {
        canonical: 'https://baraka.sn/faq',
    },
}

export default function FAQLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
