import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Maintenance | Baraka Shop',
    description: 'Notre site est temporairement en maintenance. Nous serons de retour très bientôt.',
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
