import { NextRequest, NextResponse } from 'next/server'
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
        // Fire and forget - don't await so the response is immediate
        // The frontend will poll the progress via /api/admin/sync/status
        runFtpSync('MANUAL').catch(err => {
            console.error('[MANUAL_SYNC] Background error:', err)
        })
        
        return NextResponse.json({ success: true, message: 'Synchronisation démarrée en arrière-plan' })
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Erreur lors du démarrage de la synchronisation' }, { status: 500 })
    }
}
