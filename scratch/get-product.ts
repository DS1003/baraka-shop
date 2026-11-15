import 'dotenv/config';
import prisma from '../lib/prisma';

async function main() {
    const id = '55735832-f9da-4309-9e6a-3166173f8cd7';
    const p = await prisma.product.findUnique({
        where: { id },
        include: {
            category: true,
            subCategory: true,
            thirdLevelCategory: true,
            brand: true,
            colorVariants: true,
        }
    });
    console.log('FULL PRODUCT IN DB:', JSON.stringify(p, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
