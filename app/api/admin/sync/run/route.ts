import { NextRequest, NextResponse, unstable_after as after } from 'next/server'
import { auth } from '@/auth'
import { runFtpSync } from '@/lib/ftp-sync'

// Augmenter le timeout sur Vercel (jusqu'à 5 minutes sur Pro, 10-60s sur Hobby)
export const maxDuration = 300;

export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session || session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    try {
        // Utilisation de unstable_after pour s'assurer que Vercel ne coupe pas l'exécution
        // après l'envoi de la réponse HTTP.
        after(async () => {
            try {
                await runFtpSync('MANUAL')
            } catch (err) {
                console.error('[MANUAL_SYNC] Background error:', err)
            }
        })
        
        return NextResponse.json({ success: true, message: 'Synchronisation démarrée en arrière-plan' })
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Erreur lors du démarrage de la synchronisation' }, { status: 500 })
    }
}
