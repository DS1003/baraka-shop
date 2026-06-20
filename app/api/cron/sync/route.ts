import { NextResponse } from 'next/server'
import { runFtpSync } from '@/lib/ftp-sync'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
    // Vérification de sécurité basique (Vercel Cron ou Service Externe)
    const authHeader = req.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    try {
        const url = new URL(req.url)
        const force = url.searchParams.get('force') === 'true'

        // 1. Fetch the FTP configuration
        const config = await prisma.syncConfig.findUnique({
            where: { id: 'singleton' }
        })

        if (!config || !config.isActive) {
            return NextResponse.json({ message: "Le module FTP est désactivé ou non configuré." }, { status: 200 })
        }

        // 2. Check the current time against scheduled times (skip if forced)
        if (!force) {
            const schedules = Array.isArray(config.scheduleTimes) ? config.scheduleTimes : []

            if (schedules.length > 0) {
                // Heure locale du serveur (HH:mm)
                const now = new Date()
                const currentHour = String(now.getHours()).padStart(2, '0')
                const currentMinute = String(now.getMinutes()).padStart(2, '0')
                const currentTime = `${currentHour}:${currentMinute}`

                if (!schedules.includes(currentTime)) {
                    // Ce n'est pas le bon moment, on ignore la requête silencieusement
                    return NextResponse.json({ 
                        message: `Pas de synchronisation prévue à ${currentTime}. Heures prévues : ${schedules.join(', ')}` 
                    }, { status: 200 })
                }
            }
        }

        // 3. Right time (or forced), trigger sync!
        const result = await runFtpSync('SCHEDULED')
        return NextResponse.json(result)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
