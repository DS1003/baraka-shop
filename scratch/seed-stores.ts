import 'dotenv/config';
import prisma from '../lib/prisma';

async function main() {
    const stores = [
        { name: 'Airflux', slug: 'airflux', description: 'Solutions de climatisation haute performance.' },
        { name: 'RS Car', slug: 'rs-car', description: 'Expertise automobile et véhicules de prestige.' },
        { name: 'Baraka Beauty World', slug: 'baraka-beauty-world', description: 'Le monde de la beauté et des cosmétiques premium.' }
    ];

    for (const store of stores) {
        await prisma.store.upsert({
            where: { name: store.name },
            update: {},
            create: store
        });
        console.log(`Boutique ${store.name} créée/vérifiée.`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        // prisma.$disconnect() might not be available
    });
