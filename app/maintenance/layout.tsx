import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Grand Lancement Bientôt | Baraka Electronique (Baraka Shop)',
    description: 'Au cœur de Sandaga, Baraka prépare son grand lancement officiel. Le meilleur de la technologie mondiale arrive très bientôt au Sénégal.',
    robots: {
        index: false,
        follow: false,
        noarchive: true,
        nosnippet: true,
    },
}

export default function MaintenanceLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
