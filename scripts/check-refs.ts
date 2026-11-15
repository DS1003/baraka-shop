import 'dotenv/config';
import prisma from '../lib/prisma';

async function testRefs() {
    const refs = ['VM-80', 'VM80', 'SVR-1500VA', 'SVR1500VA', 'AK-511682', 'AK511682', 'PK-9950', 'PK9950', '7440'];
    for (const r of refs) {
        const found = await prisma.product.findMany({
            where: {
                OR: [
                    { reference: { contains: r, mode: 'insensitive' } },
                    { name: { contains: r, mode: 'insensitive' } }
                ]
            },
            select: { id: true, name: true, reference: true, isPublished: true, stock: true }
        });
        console.log(r, '->', found.map(f => `[${f.reference}] ${f.name} (pub:${f.isPublished}, stock:${f.stock})`));
    }
    await prisma.$disconnect();
}
testRefs().catch(console.error);
