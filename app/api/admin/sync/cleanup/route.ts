import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
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
