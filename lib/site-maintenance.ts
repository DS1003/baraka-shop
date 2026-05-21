import prisma from '@/lib/prisma'

const SITE_CONFIG_ID = 'singleton'

let memoryCache: { mode: boolean; at: number } | null = null
const CACHE_MS = 3000

export function clearMaintenanceCache() {
    memoryCache = null
}

export async function isMaintenanceMode(): Promise<boolean> {
    if (process.env.MAINTENANCE_MODE === 'true') return true

    if (memoryCache && Date.now() - memoryCache.at < CACHE_MS) {
        return memoryCache.mode
    }

    try {
        let config = await prisma.siteConfig.findUnique({
            where: { id: SITE_CONFIG_ID },
            select: { maintenanceMode: true },
        })

        if (!config) {
            config = await prisma.siteConfig.create({
                data: { id: SITE_CONFIG_ID },
                select: { maintenanceMode: true },
            })
        }

        const mode = config.maintenanceMode
        memoryCache = { mode, at: Date.now() }
        return mode
    } catch (error) {
        console.error('[maintenance] read failed:', error)
        return false
    }
}
