import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
    const session = await auth()
    if (!session || session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    try {
        const history = await prisma.syncHistory.findMany({
            orderBy: { startedAt: 'desc' },
            take: 50 // Keep only recent 50 logs for performance
        })

        return NextResponse.json(history)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
