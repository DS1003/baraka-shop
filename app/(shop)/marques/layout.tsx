import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: {
        absolute: 'Nos Grandes Marques High-Tech | Baraka Electronique Dakar',
    },
    description: 'Retrouvez toutes les marques de référence en informatique et électronique chez Baraka Electronique (Baraka Shop) : Apple, Samsung, HP, Dell, Lenovo, Sony, Canon, Logitech à Dakar, Sénégal.',
    keywords: ['marques baraka electronique', 'apple dakar', 'samsung senegal', 'hp dakar', 'dell senegal', 'baraka shop marques'],
    alternates: {
        canonical: 'https://baraka.sn/marques',
    },
}

export default function MarquesLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
