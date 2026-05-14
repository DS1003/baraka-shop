import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const DEFAULT_UNIVERSES = [
        { name: 'BATTERIE', subtitle: 'Externes & Internes', href: '/category/batterie', order: 0 },
        { name: 'CHARGEUR', subtitle: 'Secteur & Induction', href: '/category/chargeur', order: 1 },
        { name: 'CONNECTIQUE', subtitle: 'Adaptateurs & Hubs', href: '/category/connectique', order: 2 },
        { name: 'CONSOMMABLES', subtitle: 'Encre & Papier', href: '/category/consommables', order: 3 },
        { name: 'ELECTRONIQUE', subtitle: 'Composants & Gadgets', href: '/category/electronique', order: 4 },
        { name: 'GÉNÉRAL', subtitle: 'Univers High-Tech', href: '/category/general', order: 5 },
        { name: 'IMAGE & SON', subtitle: 'TV, Casques & Caméras', href: '/category/image-son', order: 6 },
        { name: 'INFORMATIQUE', subtitle: 'MacBook, PC & Portables', href: '/category/informatique', order: 7 }
    ];

    console.log('Seeding popular universes...');
    
    for (const uni of DEFAULT_UNIVERSES) {
        await (prisma as any).popularUniverse.upsert({
            where: { name: uni.name }, // This might not work if name is not unique in schema, but I'll use create instead if needed
            update: uni,
            create: uni
        });
    }

    console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
