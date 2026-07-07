import { NextResponse } from 'next/server'
import { getSyncStatus } from '@/lib/sync-status'

// Disable caching so we always get fresh data
export const dynamic = 'force-dynamic'

export async function GET() {
    const status = getSyncStatus()
    return NextResponse.json(status)
}
