import { NextResponse } from 'next/server'
import { isMaintenanceMode } from '@/lib/site-maintenance'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const SITE_CONFIG_ID = 'singleton'

export async function GET() {
    try {
        const maintenanceMode = await isMaintenanceMode()

        // If in maintenance, also return title + message for the public page
        if (maintenanceMode) {
            try {
                const config = await prisma.siteConfig.findUnique({
                    where: { id: SITE_CONFIG_ID },
                    select: {
                        maintenanceTitle: true,
                        maintenanceMessage: true,
                    },
                })
                return NextResponse.json(
                    {
                        maintenanceMode: true,
                        maintenanceTitle: config?.maintenanceTitle ?? 'Lancement Officiel Bientôt !',
                        maintenanceMessage:
                            config?.maintenanceMessage ??
                            "Au cœur de Sandaga, Baraka prépare l'ouverture de sa boutique en ligne. Retrouvez le meilleur de la technologie mondiale au Sénégal sans compromis sur la qualité, sans concession sur les prix.",
                    },
                    {
                        headers: {
                            'Cache-Control': 'no-store, no-cache, must-revalidate',
                        },
                    }
                )
            } catch {
                // Fall through to simple response
            }
        }

        return NextResponse.json(
            { maintenanceMode },
            {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                },
            }
        )
    } catch (error) {
        console.error('[site-status]', error)
        return NextResponse.json({ maintenanceMode: false })
    }
}
