import redis from './redis';

/**
 * Interface pour le résultat du rate limit
 */
export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
}

/**
 * Rate limiter basé sur Redis
 * @param identifier Identifiant unique (IP, userId, etc.)
 * @param limit Nombre de requêtes autorisées
 * @param duration Durée de la fenêtre en secondes
 */
export async function rateLimit(
    identifier: string,
    limit: number = 10,
    duration: number = 60
): Promise<RateLimitResult> {
    const key = `rate_limit:${identifier}`;

    try {
        if (redis.status !== 'ready') return { success: true, limit, remaining: limit, reset: 0 };
        // Incrémenter et récupérer la valeur actuelle
        const current = await redis.incr(key);

        // Si c'est la première requête, définir l'expiration
        if (current === 1) {
            await redis.expire(key, duration);
        }

        const ttl = await redis.ttl(key);

        return {
            success: current <= limit,
            limit,
            remaining: Math.max(0, limit - current),
            reset: ttl
        };
    } catch (error) {
        console.error('[Rate Limit Error]', error);
        // En cas d'erreur Redis, on laisse passer par défaut (fail open)
        return {
            success: true,
            limit,
            remaining: limit,
            reset: 0
        };
    }
}
