import prisma from '@/lib/prisma';
import BoutiquesClient from './BoutiquesClient';

export const metadata = {
    title: 'Nos Boutiques | Baraka Shop',
    description: 'Découvrez l\'univers Baraka Shop en boutique. Profitez des conseils de nos experts et d\'une prise en main immédiate.',
};

export default async function StoresPage() {
    const stores = await prisma.physicalStore.findMany({
        where: { isPublished: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
    });
    
    return <BoutiquesClient initialStores={stores} />;
}
