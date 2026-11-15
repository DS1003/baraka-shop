import 'dotenv/config';
import prisma from '../lib/prisma';

async function main() {
    const id = '55735832-f9da-4309-9e6a-3166173f8cd7';
    const p = await prisma.product.findUnique({ where: { id } });
    console.log('Product by ID:', p ? { id: p.id, name: p.name, slug: p.slug, reference: p.reference, createdAt: p.createdAt, updatedAt: p.updatedAt } : 'NOT FOUND');

    const similar = await prisma.product.findMany({
        where: { name: { contains: 'ZHIYUN', mode: 'insensitive' } },
        select: { id: true, name: true, slug: true, reference: true, createdAt: true, updatedAt: true }
    });
    console.log('Similar products:', similar);

    // Check for duplicate slugs
    const duplicatesSlug = await prisma.$queryRawUnsafe(`
        SELECT slug, COUNT(*) as count 
        FROM "Product" 
        GROUP BY slug 
        HAVING COUNT(*) > 1;
    `);
    console.log('Duplicate slugs:', duplicatesSlug);

    // Check for duplicate names
    const duplicatesName = await prisma.$queryRawUnsafe(`
        SELECT name, COUNT(*) as count 
        FROM "Product" 
        GROUP BY name 
        HAVING COUNT(*) > 1 
        LIMIT 10;
    `);
    console.log('Duplicate names (sample):', duplicatesName);

    // Check for duplicate references
    const duplicatesRef = await prisma.$queryRawUnsafe(`
        SELECT reference, COUNT(*) as count 
        FROM "Product" 
        WHERE reference IS NOT NULL 
        GROUP BY reference 
        HAVING COUNT(*) > 1 
        LIMIT 10;
    `);
    console.log('Duplicate references (sample):', duplicatesRef);
}

main().catch(console.error).finally(() => prisma.$disconnect());
