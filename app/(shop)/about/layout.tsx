import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: {
        absolute: 'À Propos de Baraka Electronique (Baraka Shop) | Dakar Sénégal',
    },
    description: 'Découvrez l\'histoire et l\'expertise de Baraka Electronique (Baraka Shop), magasin de référence en informatique, ordinateurs et électronique à Dakar (Sandaga, 90 Rue Av. K. Bourgi) depuis plus de 10 ans.',
    keywords: ['a propos baraka electronique', 'baraka electronique dakar histoire', 'qui sommes nous baraka shop', 'magasin informatique sandaga', '90 Rue Av. K. Bourgi'],
    alternates: {
        canonical: 'https://baraka.sn/about',
    },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
