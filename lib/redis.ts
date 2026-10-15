import Redis from 'ioredis';

const redisClientSingleton = () => {
    const url = process.env.REDIS_URL || 'redis://localhost:6379';
    if (process.env.NODE_ENV !== 'production') {
        console.log(`[Redis] Connecting to ${url}...`);
    }

    const client = new Redis(url, {
        maxRetriesPerRequest: null,
        tls: url.startsWith('rediss://') ? {} : undefined,
        retryStrategy: (times) => {
            if (times > 3) return null; // Stop retrying after 3 failures
            const delay = Math.min(times * 1000, 5000);
            return delay;
        },
        connectTimeout: 5000,
        enableReadyCheck: false,
        enableAutoPipelining: true, // Pipeline multiple commands in same tick for ultra-low latency
        keepAlive: 10000,
        reconnectOnError: (err) => {
            const targetError = 'READONLY';
            if (err.message.slice(0, targetError.length) === targetError) {
                return true;
            }
            return false;
        }
    });

    client.on('error', (err) => {
        // Log once to avoid flooding logs
        if (client.listenerCount('error') > 1) return; 
        console.log(`[Redis] Status: Offline (${err.message})`);
    });

    return client;
};

declare global {
    var redis: undefined | ReturnType<typeof redisClientSingleton>;
}

const redis = globalThis.redis ?? redisClientSingleton();

export default redis;

if (process.env.NODE_ENV !== 'production') globalThis.redis = redis;

/**
 * Récupère un élément depuis le cache Redis
 */
export async function getCache<T>(key: string): Promise<T | null> {
    try {
        if (redis.status !== 'ready') return null;
        const data = await redis.get(key);
        if (!data) return null;
        return JSON.parse(data) as T;
    } catch (error) {
        return null;
    }
}

/**
 * Enregistre un élément dans le cache Redis avec une durée de validité (TTL en secondes)
 */
export async function setCache(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    try {
        if (redis.status !== 'ready') return;
        const data = JSON.stringify(value);
        await redis.set(key, data, 'EX', ttlSeconds);
    } catch (error) {
        // Fail-soft
    }
}

/**
 * Pattern Cache-Aside ultra-performant :
 * Vérifie d'abord le cache Redis ; en cas de miss, exécute le fetcher et sauvegarde le résultat.
 */
export async function rememberCache<T>(
    key: string,
    ttlSeconds: number,
    fetcher: () => Promise<T>
): Promise<T> {
    try {
        const cached = await getCache<T>(key);
        if (cached !== null && cached !== undefined) {
            return cached;
        }
    } catch (e) {
        // Continue to fetcher on cache error
    }

    const data = await fetcher();

    if (data !== null && data !== undefined) {
        setCache(key, data, ttlSeconds).catch(() => {});
    }

    return data;
}

/**
 * Récupère plusieurs clés en une seule requête (Batch MGET ultra-rapide)
 */
export async function mgetCache<T>(keys: string[]): Promise<(T | null)[]> {
    if (keys.length === 0) return [];
    try {
        if (redis.status !== 'ready') return keys.map(() => null);
        const results = await redis.mget(...keys);
        return results.map(item => (item ? (JSON.parse(item) as T) : null));
    } catch (error) {
        return keys.map(() => null);
    }
}

/**
 * Invalide une clé unique
 */
export async function invalidateCache(key: string): Promise<void> {
    try {
        if (redis.status !== 'ready') return;
        await redis.del(key);
    } catch (error) {
        // Fail-soft
    }
}

/**
 * Invalide toutes les clés correspondant à un préfixe
 * Utilise SCAN non-bloquant pour éviter d'impacter les performances de production
 */
export async function invalidatePrefix(prefix: string): Promise<void> {
    try {
        if (redis.status !== 'ready') return;
        
        const stream = redis.scanStream({
            match: `${prefix}*`,
            count: 200
        });

        const keysToDelete: string[] = [];
        for await (const resultKeys of stream) {
            if (resultKeys.length > 0) {
                keysToDelete.push(...resultKeys);
            }
        }

        if (keysToDelete.length > 0) {
            const BATCH_SIZE = 500;
            for (let i = 0; i < keysToDelete.length; i += BATCH_SIZE) {
                const batch = keysToDelete.slice(i, i + BATCH_SIZE);
                await redis.del(...batch);
            }
            if (process.env.NODE_ENV !== 'production') {
                console.log(`[Redis] Invalidated ${keysToDelete.length} keys with prefix: ${prefix}`);
            }
        }
    } catch (error) {
        // Fallback fail-soft
        try {
            const keys = await redis.keys(`${prefix}*`);
            if (keys.length > 0) await redis.del(...keys);
        } catch (e) {}
    }
}
