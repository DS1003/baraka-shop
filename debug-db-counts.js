const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- DB DEBUG START ---');
    try {
        const productsCount = await prisma.product.count();
        const categoriesCount = await prisma.category.count();
        const subCategoriesCount = await prisma.subCategory.count();
        const brandsCount = await prisma.brand.count();

        console.log('Products:', productsCount);
        console.log('Categories:', categoriesCount);
        console.log('SubCategories:', subCategoriesCount);
        console.log('Brands:', brandsCount);

        if (productsCount > 0) {
            const firstProduct = await prisma.product.findFirst({
                include: { category: true, brand: true }
            });
            console.log('First Product:', JSON.stringify(firstProduct, null, 2));
        }

    } catch (error) {
        console.error('Error during DB debug:', error);
    } finally {
        await prisma.$disconnect();
    }
    console.log('--- DB DEBUG END ---');
}

main();
