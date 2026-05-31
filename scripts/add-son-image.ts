import prisma from '../lib/prisma';

async function main() {
    console.log('Adding SON & IMAGE promo...');
    const existing = await (prisma as any).homePromo.findFirst({
        where: { title: "SON & IMAGE" }
    });

    const data = {
        badge: "Nouveau",
        title: "SON & IMAGE",
        subtitle: "Le cinéma à la maison",
        image: "https://media.ldlc.com/encart/p/28829_b.jpg",
        bg: "bg-[#F5FFF9]",
        border: "border-emerald-100/50",
        size: "md:col-span-2",
        href: "/boutique?category=image-son",
        order: 4
    };

    if (existing) {
        await (prisma as any).homePromo.update({
            where: { id: existing.id },
            data
        });
        console.log('Updated existing!');
    } else {
        await (prisma as any).homePromo.create({
            data
        });
        console.log('Created new!');
    }

    // Also update "Son & Image High-End" if it exists
    const old = await (prisma as any).homePromo.findFirst({
        where: { title: "Son & Image High-End" }
    });
    if (old && (!existing || old.id !== existing.id)) {
        await (prisma as any).homePromo.delete({ where: { id: old.id }});
        console.log('Deleted old one');
    }

    console.log('Done!');
}
main().catch(console.error).finally(() => process.exit(0));
