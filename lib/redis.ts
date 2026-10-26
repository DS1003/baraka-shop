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
            // Reconnexion automatique infinie avec backoff exponentiel plafonné à 10s (Haute Disponibilité)
            const delay = Math.min(times * 1500, 10000);
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

// L1 In-Memory Cache (Haute Disponibilité : résiste aux pannes réseau ou indisponibilités temporaires de Redis)
const l1MemoryCache = new Map<string, { data: any; expiresAt: number; staleData: any }>();
const MAX_L1_ITEMS = 500;

function setL1(key: string, data: any, ttlSeconds: number) {
    if (l1MemoryCache.size > MAX_L1_ITEMS) {
        const firstKey = l1MemoryCache.keys().next().value;
        if (firstKey) l1MemoryCache.delete(firstKey);
    }
    l1MemoryCache.set(key, {
        data,
        expiresAt: Date.now() + ttlSeconds * 1000,
        staleData: data
    });
}

function getL1<T>(key: string): { fresh: T | null; stale: T | null } {
    const entry = l1MemoryCache.get(key);
    if (!entry) return { fresh: null, stale: null };
    const isFresh = Date.now() < entry.expiresAt;
    return {
        fresh: isFresh ? (entry.data as T) : null,
        stale: entry.staleData as T
    };
}

/**
 * Récupère un élément depuis le cache Redis (avec fallback L1 mémoire)
 */
export async function getCache<T>(key: string): Promise<T | null> {
    // 1. Vérifier d'abord le cache mémoire L1 ultra-rapide
    const l1 = getL1<T>(key);
    if (l1.fresh !== null) return l1.fresh;

    // 2. Vérifier Redis
    try {
        if (redis.status !== 'ready') return l1.stale;
        const data = await redis.get(key);
        if (!data) return l1.stale;
        const parsed = JSON.parse(data) as T;
        setL1(key, parsed, 30); // Garder 30s en mémoire L1
        return parsed;
    } catch (error) {
        return l1.stale;
    }
}

/**
 * Enregistre un élément dans le cache Redis avec une durée de validité (TTL en secondes)
 */
export async function setCache(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    setL1(key, value, Math.min(ttlSeconds, 60));
    try {
        if (redis.status !== 'ready') return;
        const data = JSON.stringify(value);
        await redis.set(key, data, 'EX', ttlSeconds);
    } catch (error) {
        // Fail-soft
    }
}

/**
 * Pattern Cache-Aside ultra-résilient (Haute Disponibilité) :
 * 1. Vérifie le cache (L1 mémoire puis Redis).
 * 2. Si absent, exécute le fetcher.
 * 3. En cas d'erreur du fetcher (ex: micro-coupure de la base de données), sert les données en cache (Stale-While-Revalidate)
 *    au lieu de planter la page !
 */
export async function rememberCache<T>(
    key: string,
    ttlSeconds: number,
    fetcher: () => Promise<T>
): Promise<T> {
    let staleFallback: T | null = null;

    try {
        const cached = await getCache<T>(key);
        if (cached !== null && cached !== undefined) {
            return cached;
        }
        staleFallback = getL1<T>(key).stale;
    } catch (e) {
        staleFallback = getL1<T>(key).stale;
    }

    try {
        const data = await fetcher();

        if (data !== null && data !== undefined) {
            // Ne pas écraser le cache avec un tableau vide si un fallback sain existe
            const isEmptyArray = Array.isArray(data) && data.length === 0;
            const isBlankObject = typeof data === 'object' && (data as any)?.products && Array.isArray((data as any).products) && (data as any).products.length === 0 && (data as any)?.pagination?.total === 0;
            
            if ((isEmptyArray || isBlankObject) && staleFallback !== null) {
                return staleFallback;
            }

            setCache(key, data, ttlSeconds).catch(() => {});
            return data;
        }

        if (staleFallback !== null) return staleFallback;
        return data;
    } catch (fetchError: any) {
        console.warn(`[Cache HA] Fetcher failed for key "${key}". Serving stale data if available:`, fetchError.message || fetchError);
        if (staleFallback !== null) {
            return staleFallback;
        }
        throw fetchError;
    }
}

/**
 * Test de santé Redis pour le monitoring Uptime (Healthcheck)
 */
export async function pingRedis(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
    const start = Date.now();
    try {
        if (redis.status === 'end' || redis.status === 'close') {
            redis.connect().catch(() => {});
        }
        if (redis.status !== 'ready' && redis.status !== 'connecting') {
            return { ok: false, latencyMs: 0, error: `Redis status: ${redis.status}` };
        }
        const pong = await Promise.race([
            redis.ping(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Redis timeout (2000ms)')), 2000))
        ]);
        const latencyMs = Date.now() - start;
        return { ok: pong === 'PONG', latencyMs };
    } catch (err: any) {
        return { ok: false, latencyMs: Date.now() - start, error: err.message || 'Ping failed' };
    }
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
 * Invalide une clé unique (mémoire L1 + Redis)
 */
export async function invalidateCache(key: string): Promise<void> {
    try {
        // Supprimer immédiatement du cache mémoire L1
        l1MemoryCache.delete(key);

        if (redis.status !== 'ready') return;
        await redis.del(key);
    } catch (error) {
        // Fail-soft
    }
}

/**
 * Invalide toutes les clés correspondant à un préfixe (mémoire L1 + Redis)
 * Utilise SCAN non-bloquant pour éviter d'impacter les performances de production
 */
export async function invalidatePrefix(prefix: string): Promise<void> {
    try {
        // Supprimer immédiatement toutes les entrées L1 correspondantes
        for (const k of Array.from(l1MemoryCache.keys())) {
            if (k.startsWith(prefix)) {
                l1MemoryCache.delete(k);
            }
        }

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
