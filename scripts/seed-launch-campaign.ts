import * as dotenv from 'dotenv';
dotenv.config();
import prisma from '../lib/prisma';

async function main() {
    console.log('Seeding Launch Campaign...');

    try {
        const campaign = await prisma.promotionCampaign.upsert({
            where: {
                couponCode: 'BARAKA2026'
            },
            update: {
                name: 'Campagne de Lancement',
                title: 'Lancement Officiel de Baraka Shop',
                description: 'Profitez de 10% de réduction sur tout le site pour fêter notre lancement officiel !',
                discountType: 'PERCENTAGE',
                discountValue: 10,
                startDate: new Date(),
                endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)), // 1 month duration
                isActive: true,
                showPopup: true,
                popupTitle: 'Bienvenue sur Baraka.sn ! 🎉',
                popupDescription: 'Pour célébrer notre lancement, nous vous offrons 10% de réduction sur votre première commande avec le code BARAKA2026.',
                popupImage: null, // No image yet
                ctaText: 'J\'en profite',
                ctaLink: '/shop',
                maxUses: null,
                maxUsesPerUser: 1,
                minimumOrderAmount: 0,
                firstPurchaseOnly: true,
                displayFrequency: 'ONCE_PER_SESSION'
            },
            create: {
                name: 'Campagne de Lancement',
                title: 'Lancement Officiel de Baraka Shop',
                description: 'Profitez de 10% de réduction sur tout le site pour fêter notre lancement officiel !',
                discountType: 'PERCENTAGE',
                discountValue: 10,
                couponCode: 'BARAKA2026',
                startDate: new Date(),
                endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
                isActive: true,
                showPopup: true,
                popupTitle: 'Bienvenue sur Baraka.sn ! 🎉',
                popupDescription: 'Pour célébrer notre lancement, nous vous offrons 10% de réduction sur votre première commande avec le code BARAKA2026.',
                popupImage: null,
                ctaText: 'J\'en profite',
                ctaLink: '/shop',
                maxUses: null,
                maxUsesPerUser: 1,
                minimumOrderAmount: 0,
                firstPurchaseOnly: true,
                displayFrequency: 'ONCE_PER_SESSION'
            }
        });

        console.log('Successfully seeded launch campaign:', campaign.name);
    } catch (error) {
        console.error('Error seeding launch campaign:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
