import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { runFtpSync } from '@/lib/ftp-sync'

export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session || session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    try {
        const result = await runFtpSync('MANUAL')
        return NextResponse.json(result)
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Erreur lors de la synchronisation FTP' }, { status: 500 })
    }
}
