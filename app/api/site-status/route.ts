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
                        maintenanceTitle: config?.maintenanceTitle ?? 'Site en maintenance',
                        maintenanceMessage:
                            config?.maintenanceMessage ??
                            'Nous effectuons des améliorations. Le site sera de retour très bientôt.',
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
