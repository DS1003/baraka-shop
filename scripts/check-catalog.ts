import 'dotenv/config';
import prisma from '../lib/prisma';

async function checkCatalog() {
    console.log('--- Recherche de 9950 ---');
    const p9950 = await prisma.product.findMany({
        where: {
            OR: [
                { name: { contains: '9950', mode: 'insensitive' } },
                { reference: { contains: '9950', mode: 'insensitive' } }
            ]
        },
        select: { id: true, name: true, reference: true, stock: true, isPublished: true, price: true }
    });
    console.log('9950 products:', p9950);

    console.log('\n--- Recherche de régulateur ---');
    const regul = await prisma.product.findMany({
        where: {
            OR: [
                { name: { contains: 'regulateur', mode: 'insensitive' } },
                { name: { contains: 'régulateur', mode: 'insensitive' } },
                { description: { contains: 'regulateur', mode: 'insensitive' } },
                { description: { contains: 'régulateur', mode: 'insensitive' } },
                { reference: { contains: 'SVR', mode: 'insensitive' } }
            ]
        },
        take: 10,
        select: { id: true, name: true, reference: true, stock: true, isPublished: true, price: true, category: { select: { name: true } }, subCategory: { select: { name: true } } }
    });
    console.log('Régulateur products:', regul);

    console.log('\n--- Recherche Samsung Tablettes ---');
    const samTab = await prisma.product.findMany({
        where: {
            OR: [
                { name: { contains: 'Samsung', mode: 'insensitive' } },
                { brand: { name: { contains: 'Samsung', mode: 'insensitive' } } }
            ],
            AND: [
                {
                    OR: [
                        { name: { contains: 'Tab', mode: 'insensitive' } },
                        { name: { contains: 'Tablette', mode: 'insensitive' } },
                        { category: { name: { contains: 'Tablette', mode: 'insensitive' } } }
                    ]
                }
            ]
        },
        select: { id: true, name: true, reference: true, stock: true, isPublished: true, price: true }
    });
    console.log('Samsung Tab products:', samTab);

    console.log('\n--- Recherche Casques ---');
    const casques = await prisma.product.findMany({
        where: {
            OR: [
                { name: { contains: 'casque', mode: 'insensitive' } },
                { name: { contains: 'headset', mode: 'insensitive' } },
                { name: { contains: 'ecouteur', mode: 'insensitive' } },
                { name: { contains: 'écouteur', mode: 'insensitive' } }
            ],
            isPublished: true,
            stock: { gt: 0 }
        },
        take: 10,
        select: { id: true, name: true, reference: true, category: { select: { name: true } }, subCategory: { select: { name: true } } }
    });
    console.log('Casque products:', casques);

    await prisma.$disconnect();
}

checkCatalog().catch(console.error);
