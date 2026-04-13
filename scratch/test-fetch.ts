import 'dotenv/config';
import prisma from '../lib/prisma';

async function main() {
    try {
        console.log('Connecting to DB...');
        const stores = await prisma.store.findMany();
        console.log(`Found ${stores.length} stores in DB.`);
        console.log(JSON.stringify(stores, null, 2));
    } catch (err) {
        console.error('Error fetching stores:', err);
    }
}

main().finally(() => process.exit());
