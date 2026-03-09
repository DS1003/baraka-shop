import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const prismaClientSingleton = () => {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error("DATABASE_URL environment variable is not defined");
    }
    const pool = new pg.Pool({
        connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter }) as any;
};

declare global {
    var prisma: any;
}

const prisma: any = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
