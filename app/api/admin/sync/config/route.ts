import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
    const session = await auth()
    if (!session || session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    let config = await prisma.syncConfig.findUnique({
        where: { id: 'singleton' }
    })

    if (!config) {
        config = await prisma.syncConfig.create({
            data: { id: 'singleton' }
        })
    }

    return NextResponse.json(config)
}

export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session || session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    try {
        const body = await req.json()
        const config = await prisma.syncConfig.upsert({
            where: { id: 'singleton' },
            update: {
                ftpServer: body.ftpServer,
                ftpUser: body.ftpUser,
                ftpPassword: body.ftpPassword,
                ftpPath: body.ftpPath,
                scheduleTimes: body.scheduleTimes,
                isActive: body.isActive,
            },
            create: {
                id: 'singleton',
                ftpServer: body.ftpServer,
                ftpUser: body.ftpUser,
                ftpPassword: body.ftpPassword,
                ftpPath: body.ftpPath,
                scheduleTimes: body.scheduleTimes,
                isActive: body.isActive,
            }
        })

        return NextResponse.json(config)
    } catch (error: any) {
        console.error("SYNC CONFIG ERROR:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
