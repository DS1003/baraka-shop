import 'dotenv/config';
import prisma from '../lib/prisma';

async function checkPostgres() {
    try {
        const extensions: any = await prisma.$queryRawUnsafe(`SELECT extname FROM pg_extension;`);
        console.log('Postgres extensions installed:', extensions);

        const indexes: any = await prisma.$queryRawUnsafe(`
            SELECT indexname, indexdef 
            FROM pg_indexes 
            WHERE tablename = 'Product';
        `);
        console.log('Product indexes:');
        indexes.forEach((idx: any) => console.log(' -', idx.indexname, ':', idx.indexdef));
    } catch (e: any) {
        console.error('Check Postgres error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkPostgres().catch(console.error);
