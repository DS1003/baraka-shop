import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
    try {
        const session = await auth()
        if (!session || session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const result = await prisma.syncHistory.deleteMany({
            where: {
                status: {
                    notIn: ['SUCCESS', 'ERROR']
                }
            }
        })
        return NextResponse.json({ success: true, deletedCount: result.count })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
