import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    console.log('--- START SEEDING HOMEPAGE DATA ---');

    // 1. Popular Universes
    const DEFAULT_UNIVERSES = [
        { name: 'BATTERIE', subtitle: 'Externes & Internes', href: '/category/batterie', order: 0, image: '/categories/batterie.png' },
        { name: 'CHARGEUR', subtitle: 'Secteur & Induction', href: '/category/chargeur', order: 1, image: '/categories/chargeur.png' },
        { name: 'CONNECTIQUE', subtitle: 'Adaptateurs & Hubs', href: '/category/connectique', order: 2, image: '/categories/connectique.png' },
        { name: 'CONSOMMABLES', subtitle: 'Encre & Papier', href: '/category/consommables', order: 3, image: '/categories/consommables.png' },
        { name: 'ELECTRONIQUE', subtitle: 'Composants & Gadgets', href: '/category/electronique', order: 4, image: '/categories/electronique.png' },
        { name: 'GÉNÉRAL', subtitle: 'Univers High-Tech', href: '/category/general', order: 5, image: '/categories/general.png' },
        { name: 'IMAGE & SON', subtitle: 'TV, Casques & Caméras', href: '/category/image-son', order: 6, image: '/categories/image-son.png' },
        { name: 'INFORMATIQUE', subtitle: 'MacBook, PC & Portables', href: '/category/informatique', order: 7, image: '/categories/informatique.png' }
    ];

    console.log('Seeding Popular Universes...');
    for (const uni of DEFAULT_UNIVERSES) {
        await (prisma as any).popularUniverse.upsert({
            where: { name: uni.name },
            update: uni,
            create: uni
        });
    }

    // 2. Home Promos (Grid)
    const DEFAULT_PROMOS = [
        {
            badge: "Exclusivité",
            title: "Pack Gaming Ultimate",
            subtitle: "PS5 + 2 Jeux + Manette",
            price: "499.000 CFA",
            image: "https://media.ldlc.com/encart/p/26671_b.jpg",
            bg: "bg-[#F8FAFC]",
            border: "border-slate-100",
            size: "md:col-span-2",
            href: "/boutique?category=jeux",
            order: 0
        },
        {
            badge: "Tendance",
            title: "Apple Ecosystem",
            subtitle: "MacBook & iPad M3",
            price: "Dès 650.000 CFA",
            image: "https://media.ldlc.com/encart/p/28885_b.jpg",
            bg: "bg-[#FFFBF5]",
            border: "border-orange-100/50",
            size: "md:col-span-2",
            href: "/boutique?category=informatique",
            order: 1
        },
        {
            badge: "Vente Flash",
            title: "Smartphones Pro",
            subtitle: "Derniers modèles arrivés",
            image: "https://media.ldlc.com/encart/p/28828_b.jpg",
            bg: "bg-[#F5F7FF]",
            border: "border-orange-100/50",
            size: "md:col-span-1",
            href: "/boutique?category=smartphones",
            order: 2
        },
        {
            badge: "Promo",
            title: "Accessoires Premium",
            subtitle: "Optimisez votre setup",
            image: "https://media.ldlc.com/encart/p/22889_b.jpg",
            bg: "bg-[#FFF5F9]",
            border: "border-pink-100/50",
            size: "md:col-span-1",
            href: "/boutique?category=connectique",
            order: 3
        },
        {
            badge: "Nouveau",
            title: "Son & Image High-End",
            subtitle: "Le cinéma à la maison",
            image: "https://media.ldlc.com/encart/p/28829_b.jpg",
            bg: "bg-[#F5FFF9]",
            border: "border-emerald-100/50",
            size: "md:col-span-2",
            href: "/boutique?category=image-son",
            order: 4
        }
    ];

    console.log('Seeding Home Promos...');
    for (const p of DEFAULT_PROMOS) {
        await (prisma as any).homePromo.upsert({
            where: { title: p.title },
            update: p,
            create: p
        });
    }

    // 3. Brands (Ensure images exist in DB)
    const DEFAULT_BRANDS = [
        { name: "Apple", image: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" },
        { name: "Samsung", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Samsung_old_logo_before_year_2015.svg/1280px-Samsung_old_logo_before_year_2015.svg.png" },
        { name: "Sony", image: "https://www.freepnglogos.com/uploads/sony-png-logo/brand-sony-png-logo-5.png" },
        { name: "Dell", image: "https://upload.wikimedia.org/wikipedia/commons/1/18/Dell_logo_2016.svg" },
        { name: "HP", image: "https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg" },
        { name: "LG", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/LG_logo_%282014%29.svg/1280px-LG_logo_%282014%29.svg.png" },
    ];

    console.log('Seeding Brands...');
    for (const b of DEFAULT_BRANDS) {
        await prisma.brand.upsert({
            where: { name: b.name },
            update: { image: b.image },
            create: { name: b.name, slug: b.name.toLowerCase(), image: b.image }
        });
    }

    console.log('--- SEED COMPLETED SUCCESSFULLY ---');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
