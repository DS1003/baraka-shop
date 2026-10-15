import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const prismaClientSingleton = (): PrismaClient => {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error("DATABASE_URL environment variable is not defined");
    }
    const pool = new pg.Pool({
        connectionString,
        ssl: {
            rejectUnauthorized: false
        },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 30000,
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
    });

    pool.on('error', (err) => {
        // Log unexpected error on idle clients and allow pool to safely reconnect
        console.warn('[pg.Pool] Notice: Idle database client disconnected:', err.message);
    });

    const adapter = new PrismaPg(pool as any);
    return new PrismaClient({ adapter });
};

declare global {
    var prismaGlobal: PrismaClient | undefined;
}

// Invalidate stale in-memory singleton if schema models or new fields (like deactivationReason) are missing
if (globalThis.prismaGlobal) {
    const runtimeFields = (globalThis.prismaGlobal as any)._runtimeDataModel?.models?.Product?.fields;
    const hasDeactivationReason = Array.isArray(runtimeFields)
        ? runtimeFields.some((f: any) => f.name === 'deactivationReason')
        : (runtimeFields && 'deactivationReason' in runtimeFields);

    if (!(globalThis.prismaGlobal as any).contactMessage || !hasDeactivationReason) {
        globalThis.prismaGlobal = undefined;
    }
}

const prisma: PrismaClient = globalThis.prismaGlobal ?? prismaClientSingleton();

export { prisma };
export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;




