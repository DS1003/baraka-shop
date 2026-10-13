import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: {
        absolute: 'À Propos de Baraka Shop | Leader High-Tech au Sénégal',
    },
    description: 'Découvrez l\'histoire et l\'engagement de Baraka Shop (Baraka Electronique), votre partenaire de confiance pour l\'électronique et le multimédia haut de gamme à Dakar, Sénégal.',
    keywords: ['a propos baraka shop', 'qui sommes nous baraka', 'baraka electronique dakar histoire', 'magasin informatique sandaga'],
    alternates: {
        canonical: 'https://baraka.sn/about',
    },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
