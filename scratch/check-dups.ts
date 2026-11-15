import 'dotenv/config';
import prisma from '../lib/prisma';

async function main() {
    // 1. Check duplicate names in Product
    const dupsByName: any[] = await prisma.$queryRawUnsafe(`
        SELECT name, COUNT(*)::int as cnt, array_agg(id) as ids, array_agg(slug) as slugs, array_agg(reference) as refs
        FROM "Product"
        GROUP BY name
        HAVING COUNT(*) > 1
        ORDER BY cnt DESC
        LIMIT 20;
    `);
    console.log('Duplicate by NAME count:', dupsByName.length);
    console.log('Sample duplicate by name:', JSON.stringify(dupsByName, null, 2));

    // 2. Check if any product updated today has a duplicate name or similar reference
    const today = new Date('2026-11-15T00:00:00Z');
    const updatedToday = await prisma.product.findMany({
        where: { updatedAt: { gte: today } },
        select: { id: true, name: true, slug: true, reference: true, createdAt: true, updatedAt: true }
    });
    console.log('Total updated today:', updatedToday.length);
    for (const p of updatedToday) {
        const matches = await prisma.product.findMany({
            where: {
                OR: [
                    { name: p.name },
                    { reference: p.reference ? p.reference : undefined }
                ]
            },
            select: { id: true, name: true, slug: true, reference: true, createdAt: true, updatedAt: true }
        });
        if (matches.length > 1) {
            console.log(`POTENTIAL DUPLICATE for "${p.name}" (${p.id}):`, matches);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
