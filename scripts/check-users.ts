import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

async function check() {
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                username: true
            }
        });
        console.log('Users in DB:', JSON.stringify(users, null, 2));
    } catch (err) {
        console.error('Error checking users:', err);
    } finally {
        await pool.end();
    }
}

check();
