import prisma from '@/lib/prisma';
import BoutiquesClient from './BoutiquesClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: {
        absolute: 'Nos Magasins à Dakar | Baraka Electronique (90 Rue Av. K. Bourgi)',
    },
    description: 'Venez visiter nos magasins physiques Baraka Electronique (Baraka Shop) à Dakar (Sandaga, 90 Rue Av. K. Bourgi). Retrouvez tout notre matériel informatique et électronique avec conseils d\'experts.',
    keywords: ['magasin baraka electronique dakar', 'baraka electronique sandaga', '90 Rue Av. K. Bourgi', 'boutique baraka shop dakar', 'adresse baraka electronique'],
    alternates: {
        canonical: 'https://baraka.sn/boutiques',
    },
};

export default async function StoresPage() {
    const stores = await prisma.physicalStore.findMany({
        where: { isPublished: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
    });
    
    return <BoutiquesClient initialStores={stores} />;
}
