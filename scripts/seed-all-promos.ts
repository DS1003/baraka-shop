import prisma from '../lib/prisma';

async function main() {
    console.log('Seeding all promos...');
    const DEFAULT_PROMOS = [
        {
            badge: "Exclusivité",
            title: "Pack Gaming Ultimate",
            subtitle: "PS5 + 2 Jeux + Manette",
            price: "499.000 FCFA",
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
            price: "Dès 650.000 FCFA",
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
            title: "SON & IMAGE",
            subtitle: "Le cinéma à la maison",
            image: "https://media.ldlc.com/encart/p/28829_b.jpg",
            bg: "bg-[#F5FFF9]",
            border: "border-emerald-100/50",
            size: "md:col-span-2",
            href: "/boutique?category=image-son",
            order: 4
        }
    ];

    for (const promo of DEFAULT_PROMOS) {
        const existing = await (prisma as any).homePromo.findFirst({
            where: { title: promo.title }
        });
        if (existing) {
            await (prisma as any).homePromo.update({
                where: { id: existing.id },
                data: promo
            });
            console.log(`Updated ${promo.title}`);
        } else {
            await (prisma as any).homePromo.create({
                data: promo
            });
            console.log(`Created ${promo.title}`);
        }
    }
    console.log('Done seeding all promos!');
}
main().catch(console.error).finally(() => process.exit(0));
