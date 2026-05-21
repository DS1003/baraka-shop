'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { getCache, setCache, invalidateCache } from '@/lib/redis'
import { clearMaintenanceCache } from '@/lib/site-maintenance'
import { writeMaintenanceFlagFile } from '@/lib/maintenance-flag-file'

const SITE_CONFIG_CACHE_KEY = 'site:config'
const SITE_CONFIG_ID = 'singleton'

export type SiteConfigData = {
    maintenanceMode: boolean
    maintenanceTitle: string
    maintenanceMessage: string
}

async function ensureSiteConfig() {
    const existing = await prisma.siteConfig.findUnique({
        where: { id: SITE_CONFIG_ID },
    })
    if (existing) return existing

    return prisma.siteConfig.create({
        data: { id: SITE_CONFIG_ID },
    })
}

export async function getSiteConfig(): Promise<SiteConfigData> {
    const cached = await getCache<SiteConfigData>(SITE_CONFIG_CACHE_KEY)
    if (cached) return cached

    const config = await ensureSiteConfig()
    const data: SiteConfigData = {
        maintenanceMode: config.maintenanceMode,
        maintenanceTitle: config.maintenanceTitle,
        maintenanceMessage: config.maintenanceMessage,
    }

    await setCache(SITE_CONFIG_CACHE_KEY, data, 30)
    return data
}

export async function getSiteConfigForAdmin() {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
        return { success: false as const, error: 'Non autorisé' }
    }

    try {
        const config = await getSiteConfig()
        writeMaintenanceFlagFile(config.maintenanceMode)
        return { success: true as const, config }
    } catch (error) {
        console.error('getSiteConfigForAdmin:', error)
        return { success: false as const, error: 'Impossible de charger la configuration' }
    }
}

export async function updateSiteConfig(data: Partial<SiteConfigData>) {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
        return { success: false, error: 'Non autorisé' }
    }

    try {
        await ensureSiteConfig()
        await prisma.siteConfig.update({
            where: { id: SITE_CONFIG_ID },
            data: {
                ...(data.maintenanceMode !== undefined && { maintenanceMode: data.maintenanceMode }),
                ...(data.maintenanceTitle !== undefined && { maintenanceTitle: data.maintenanceTitle }),
                ...(data.maintenanceMessage !== undefined && { maintenanceMessage: data.maintenanceMessage }),
            },
        })

        await invalidateCache(SITE_CONFIG_CACHE_KEY)
        clearMaintenanceCache()

        if (data.maintenanceMode !== undefined) {
            writeMaintenanceFlagFile(data.maintenanceMode)
        }

        revalidatePath('/admin/settings')
        revalidatePath('/maintenance')
        revalidatePath('/')

        return { success: true }
    } catch (error) {
        console.error('updateSiteConfig:', error)
        return { success: false, error: 'Erreur lors de la mise à jour' }
    }
}

export async function setMaintenanceMode(enabled: boolean) {
    return updateSiteConfig({ maintenanceMode: enabled })
}
