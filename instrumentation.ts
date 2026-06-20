export async function register() {
    // Ne démarrer le cron que sur le serveur Node.js (pas sur l'Edge)
    if (process.env.NEXT_RUNTIME === 'nodejs') {

        // Empêcher le hot-reload de dev de lancer plusieurs timers en même temps
        if (!(globalThis as any).__cron_started) {
            ; (globalThis as any).__cron_started = true

            let isRunning = false
            let lastRunMinute = ''

            // Vérifier toutes les 30 secondes
            setInterval(async () => {
                if (isRunning) return

                try {
                    // Importer dynamiquement *à l'intérieur* de la boucle pour toujours avoir la version la plus récente
                    // Cela évite les erreurs de connexion "ECONNRESET" et les conflits de cache lors du développement (HMR)
                    const { runFtpSync } = await import('./lib/ftp-sync')
                    const { default: prisma } = await import('./lib/prisma')

                    const config = await prisma.syncConfig.findUnique({
                        where: { id: 'singleton' }
                    })

                    if (!config || !config.isActive || !config.scheduleTimes) return

                    const schedules = Array.isArray(config.scheduleTimes) ? config.scheduleTimes : []
                    if (schedules.length === 0) return

                    const now = new Date()
                    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

                    // Si c'est la bonne heure et qu'on ne l'a pas déjà lancé pendant cette même minute
                    if (schedules.includes(currentTime) && lastRunMinute !== currentTime) {
                        isRunning = true
                        lastRunMinute = currentTime

                        console.log(`\n===========================================`)
                        console.log(`⏰ [CRON] Heure atteinte (${currentTime}) ! Lancement de la synchronisation...`)
                        console.log('🚀 [CRON] Module de synchronisation automatique démarré en arrière-plan.')
                        console.log(`===========================================`)

                        await runFtpSync('SCHEDULED')

                        console.log(`✅ [CRON] Synchronisation automatique terminée avec succès.`)
                    }
                } catch (e: any) {
                    console.error('❌ [CRON] Erreur lors de la synchronisation automatique:', e)
                } finally {
                    isRunning = false
                }
            }, 30 * 1000) // Vérification toutes les 30 secondes pour ne pas rater la minute
        }
    }
}
