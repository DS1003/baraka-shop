import * as dotenv from 'dotenv';
dotenv.config();
import prisma from '../lib/prisma';

async function main() {
    console.log('Seeding BARAKAVIP Promotion Campaign...');

    try {
        const campaign = await prisma.promotionCampaign.upsert({
            where: {
                couponCode: 'BARAKAVIP'
            },
            update: {
                name: 'Bienvenue VIP Newsletter',
                title: 'Offre Membre Privilège Baraka',
                description: 'Réduction exclusive de 10% pour les abonnés à notre newsletter',
                discountType: 'PERCENTAGE',
                discountValue: 10,
                startDate: new Date('2026-01-01'),
                endDate: new Date('2028-12-31'),
                isActive: true,
                showPopup: false,
                ctaText: 'Profiter de mes 10%',
                ctaLink: '/boutique',
                maxUses: null,
                maxUsesPerUser: 1,
                minimumOrderAmount: 0,
                firstPurchaseOnly: false,
                displayFrequency: 'ONCE_PER_CAMPAIGN'
            },
            create: {
                name: 'Bienvenue VIP Newsletter',
                title: 'Offre Membre Privilège Baraka',
                description: 'Réduction exclusive de 10% pour les abonnés à notre newsletter',
                discountType: 'PERCENTAGE',
                discountValue: 10,
                couponCode: 'BARAKAVIP',
                startDate: new Date('2026-01-01'),
                endDate: new Date('2028-12-31'),
                isActive: true,
                showPopup: false,
                ctaText: 'Profiter de mes 10%',
                ctaLink: '/boutique',
                maxUses: null,
                maxUsesPerUser: 1,
                minimumOrderAmount: 0,
                firstPurchaseOnly: false,
                displayFrequency: 'ONCE_PER_CAMPAIGN'
            }
        });

        console.log('Successfully upserted BARAKAVIP campaign:', {
            id: campaign.id,
            name: campaign.name,
            code: campaign.couponCode,
            discount: `${campaign.discountValue}%`,
            active: campaign.isActive,
            startDate: campaign.startDate,
            endDate: campaign.endDate
        });
    } catch (error) {
        console.error('Error seeding BARAKAVIP campaign:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
