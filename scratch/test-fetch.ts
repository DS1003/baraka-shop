import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        where: { name: { contains: 'AF5XHD' } }
    });
    console.dir(products, { depth: null });
}

main();
