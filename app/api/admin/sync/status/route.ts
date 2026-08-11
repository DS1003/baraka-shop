import { NextResponse } from 'next/server'
import { getSyncStatus } from '@/lib/sync-status'
import { auth } from '@/auth'

// Disable caching so we always get fresh data
export const dynamic = 'force-dynamic'

export async function GET() {
    const session = await auth()
    if (!session || session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const status = getSyncStatus()
    return NextResponse.json(status)
}
