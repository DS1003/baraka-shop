export async function register() {
    // Ne démarrer le cron que sur le serveur Node.js (pas sur l'Edge)
    if (process.env.NEXT_RUNTIME === 'nodejs') {

        // Arrêter l'ancien intervalle s'il existait déjà lors d'un hot reload
        if ((globalThis as any).__cron_interval) {
            clearInterval((globalThis as any).__cron_interval)
            ;(globalThis as any).__cron_interval = null
        }

        console.log('🕐 [CRON] Planificateur de synchronisation démarré.')

        try {
            // Importer les dépendances une seule fois au boot Node.js
            const { default: prisma } = await import('@/lib/prisma')
            const { runFtpSync } = await import('@/lib/ftp-sync')

            let isRunning = false
            let lastRunMinute = ''

            // Vérifier toutes les 30 secondes
            const intervalId = setInterval(async () => {
                if (isRunning) return

                const now = new Date()
                const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

                // Ne pas re-traiter la même minute si on a déjà déclenché la sync
                if (lastRunMinute === currentTime) return

                try {
                    let config: any = null
                    try {
                        config = await prisma.syncConfig.findUnique({
                            where: { id: 'singleton' }
                        })
                    } catch (dbErr: any) {
                        // Connexion DB fermée / timeout → on ignore silencieusement, on réessaiera dans 30s
                        return
                    }

                    if (!config || !config.isActive) return

                    const schedules: string[] = Array.isArray(config.scheduleTimes) ? config.scheduleTimes : []
                    if (schedules.length === 0) return

                    // Est-ce que l'heure actuelle correspond à une heure planifiée ?
                    if (!schedules.includes(currentTime)) return

                    // C'est le bon moment → lancer la synchronisation !
                    const fs = require('fs')
                    const path = require('path')
                    const os = require('os')
                    
                    const lockDir = path.join(os.tmpdir(), `baraka-cron-lock-${currentTime.replace(':', '-')}`)
                    try {
                        // mkdirSync est garanti atomique par l'OS
                        fs.mkdirSync(lockDir)
                    } catch (e: any) {
                        if (e.code === 'EEXIST') {
                            // Un autre worker a déjà pris le verrou pour cette minute
                            return
                        }
                    }

                    lastRunMinute = currentTime
                    isRunning = true

                    console.log(`\n===========================================`)
                    console.log(`⏰ [CRON] Heure planifiée atteinte (${currentTime}) !`)
                    console.log(`🚀 [CRON] Lancement de la synchronisation automatique...`)
                    console.log(`===========================================`)

                    await runFtpSync('SCHEDULED')

                    console.log(`✅ [CRON] Synchronisation automatique terminée avec succès.`)

                } catch (e: any) {
                    // Ignorer les erreurs de connexion DB temporaires
                    const isDbError = e.code === 'P1001' || e.code === 'P2024'
                        || e.message?.includes("Can't reach database server")
                        || e.message?.includes('connect ETIMEDOUT')
                        || e.message?.includes('Server has closed the connection')
                        || e.message?.includes('Connection terminated unexpectedly')
                    
                    if (!isDbError) {
                        console.error('❌ [CRON] Erreur lors de la synchronisation automatique:', e.message || e)
                    }
                } finally {
                    isRunning = false
                }
            }, 30_000)

            ;(globalThis as any).__cron_interval = intervalId
        } catch (initErr: any) {
            console.error('❌ [CRON] Erreur initialisation cron:', initErr.message || initErr)
        }
    }
}
