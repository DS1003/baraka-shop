import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const categories = await prisma.category.findMany({
        where: { isPublished: true },
        include: {
            subCategories: {
                include: {
                    thirdLevelCategories: true
                }
            }
        },
        orderBy: { name: 'asc' }
    });

    console.log(`\n=== ${categories.length} categories (isPublished=true) ===\n`);
    for (const cat of categories) {
        console.log(`📂 ${cat.name} (slug: ${cat.slug})`);
        if (cat.subCategories.length > 0) {
            for (const sub of cat.subCategories) {
                console.log(`   └─ ${sub.name} (${(sub as any).thirdLevelCategories?.length || 0} L3)`);
            }
        } else {
            console.log(`   └─ (aucune sous-catégorie)`);
        }
    }
    
    console.log(`\n=== Total: ${categories.length} categories ===`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
