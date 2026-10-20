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

/**
 * Exécute une opération Prisma avec tentatives automatiques (Retries avec backoff exponentiel)
 * en cas de perturbation réseau temporaire ou de cold start de la base de données.
 */
export async function withDbRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 2,
    baseDelayMs: number = 150
): Promise<T> {
    let lastError: any;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error: any) {
            lastError = error;
            const isTransient =
                error.code === 'P1001' ||
                error.code === 'P2024' ||
                error.message?.includes("Can't reach database server") ||
                error.message?.includes('connect ETIMEDOUT') ||
                error.message?.includes('ECONNRESET') ||
                error.message?.includes('Connection terminated unexpectedly') ||
                error.message?.includes('Server has closed the connection') ||
                error.message?.includes('Connection closed unexpectedly');

            if (!isTransient || attempt === maxRetries) {
                throw error;
            }

            const jitter = Math.floor(Math.random() * 50);
            const delay = baseDelayMs * Math.pow(2, attempt) + jitter;
            console.warn(`[Prisma HA] Transient DB glitch (${error.code || error.message}). Retrying in ${delay}ms (Attempt ${attempt + 1}/${maxRetries})...`);
            await new Promise((res) => setTimeout(res, delay));
        }
    }
    throw lastError;
}

export { prisma };
export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;




