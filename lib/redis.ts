import Redis from 'ioredis';

const redisClientSingleton = () => {
    const url = process.env.REDIS_URL || 'redis://localhost:6379';
    console.log(`[Redis] Connecting to ${url}...`);

    const client = new Redis(url, {
        maxRetriesPerRequest: null, // ioredis recommends null for better handling with retryStrategy
        tls: url.startsWith('rediss://') ? {} : undefined,
        retryStrategy: (times) => {
            const delay = Math.min(times * 200, 10000);
            return delay;
        },
        enableReadyCheck: false,
        reconnectOnError: (err) => {
            const targetError = 'READONLY';
            if (err.message.slice(0, targetError.length) === targetError) {
                return true;
            }
            return false;
        }
    });

    client.on('error', (err) => {
        console.warn('[Redis] Connection Error:', err.message);
        console.warn('[Redis] Make sure your Redis server is running (e.g., docker run -d -p 6379:6379 redis:alpine)');
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
 * Fonctions utilitaires de cache
 */
export async function getCache<T>(key: string): Promise<T | null> {
    try {
        if (redis.status !== 'ready') return null; // Skip cache if Redis is not ready
        const data = await redis.get(key);
        if (!data) return null;
        return JSON.parse(data) as T;
    } catch (error) {
        // Log skip instead of error to avoid clutter
        return null;
    }
}

export async function setCache(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    try {
        if (redis.status !== 'ready') return;
        const data = JSON.stringify(value);
        await redis.set(key, data, 'EX', ttlSeconds);
    } catch (error) {
        // Fail-soft
    }
}

export async function invalidateCache(key: string): Promise<void> {
    try {
        if (redis.status !== 'ready') return;
        await redis.del(key);
    } catch (error) {
        // Fail-soft
    }
}

/**
 * Invalide toutes les clés commençant par un préfixe (utile pour vider une catégorie de cache)
 */
export async function invalidatePrefix(prefix: string): Promise<void> {
    try {
        if (redis.status !== 'ready') return;
        const keys = await redis.keys(`${prefix}*`);
        if (keys.length > 0) {
            await redis.del(...keys);
            console.log(`[Redis] Invalidated ${keys.length} keys with prefix: ${prefix}`);
        }
    } catch (error) {
        // Fail-soft
    }
}
