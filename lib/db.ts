import pg from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not defined");
}

const poolSingleton = () => {
    return new pg.Pool({
        connectionString,
        ssl: {
            rejectUnauthorized: false
        },
        max: 20, // Increased for better concurrency
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });
};

declare global {
    var pgPool: pg.Pool | undefined;
}

const pool = globalThis.pgPool ?? poolSingleton();

export default pool;

if (process.env.NODE_ENV !== 'production') globalThis.pgPool = pool;
