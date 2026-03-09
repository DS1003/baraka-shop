import prisma from './lib/prisma';

async function testProducts() {
    try {
        console.log("Starting test...");
        const products = await prisma.product.findMany({
            include: {
                category: true,
                subCategory: true,
                thirdLevelCategory: true,
                brand: true
            }
        });
        console.log("Success! Found:", products.length, "products");
        if (products.length > 0) {
            console.log("First product sample:", products[0].name);
        }
    } catch (error) {
        console.error("DEBUG ERROR:", error);
    }
}

testProducts();
