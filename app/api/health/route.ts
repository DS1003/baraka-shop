import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { pingRedis } from '@/lib/redis'
import { isMaintenanceMode } from '@/lib/site-maintenance'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
    const startedAt = Date.now()

    // 1. Test Database Connectivity (Neon Serverless PostgreSQL)
    let dbStatus: { ok: boolean; latencyMs: number; error?: string } = { ok: false, latencyMs: 0 }
    const dbStart = Date.now()
    try {
        await Promise.race([
            prisma.$queryRaw`SELECT 1 as health`,
            new Promise((_, reject) => setTimeout(() => reject(new Error('DB Timeout (3000ms)')), 3000))
        ])
        dbStatus = { ok: true, latencyMs: Date.now() - dbStart }
    } catch (err: any) {
        dbStatus = {
            ok: false,
            latencyMs: Date.now() - dbStart,
            error: process.env.NODE_ENV === 'production' ? 'Database unreachable' : (err.message || 'Database unreachable')
        }
    }

    // 2. Test Cache Connectivity (Upstash Redis)
    const redisStatus = await pingRedis()

    // 3. Check Maintenance Flag
    let maintenance = false
    try {
        maintenance = await isMaintenanceMode()
    } catch {
        maintenance = false
    }

    // 4. Memory & Uptime Metrics
    const memory = process.memoryUsage()
    const uptimeSeconds = Math.floor(process.uptime())

    // 5. Evaluate Overall Health Status
    const isHealthy = dbStatus.ok && redisStatus.ok && !maintenance
    const isDegraded = (!redisStatus.ok || maintenance) && dbStatus.ok

    const statusCode = dbStatus.ok ? 200 : 503

    const responsePayload = {
        status: isHealthy ? 'healthy' : isDegraded ? 'degraded' : 'unhealthy',
        timestamp: new Date().toISOString(),
        totalLatencyMs: Date.now() - startedAt,
        environment: process.env.NODE_ENV || 'production',
        uptimeSeconds,
        services: {
            database: {
                provider: 'Neon PostgreSQL (Serverless)',
                status: dbStatus.ok ? 'up' : 'down',
                latencyMs: dbStatus.latencyMs,
                error: dbStatus.error,
            },
            cache: {
                provider: 'Upstash Redis',
                status: redisStatus.ok ? 'up' : 'down',
                latencyMs: redisStatus.latencyMs,
                error: redisStatus.error,
            },
            maintenanceMode: maintenance,
        },
        system: {
            nodeVersion: process.version,
            heapUsedMB: Math.round(memory.heapUsed / 1024 / 1024),
            heapTotalMB: Math.round(memory.heapTotal / 1024 / 1024),
            rssMB: Math.round(memory.rss / 1024 / 1024),
        }
    }

    return NextResponse.json(responsePayload, {
        status: statusCode,
        headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            'X-Health-Status': responsePayload.status,
            'X-Response-Time': `${Date.now() - startedAt}ms`
        }
    })
}
