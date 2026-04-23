// Zones de livraison Baraka Shop — Dakar & banlieue
// Chaque zone a un nom et un prix de livraison en F CFA

export interface DeliveryZone {
    name: string;
    price: number;
}

export interface DeliveryRegion {
    id: string;
    label: string;
    emoji: string;
    zones: DeliveryZone[];
}

export const DELIVERY_REGIONS: DeliveryRegion[] = [
    {
        id: 'centre-ville',
        label: 'Centre-Ville / Plateau',
        emoji: '🟢',
        zones: [
            { name: 'Plateau', price: 1000 },
            { name: 'Médina', price: 1000 },
            { name: 'Fass', price: 1000 },
            { name: 'Fann Résidence', price: 1500 },
            { name: 'Point E', price: 1500 },
            { name: 'Colobane', price: 1500 },
            { name: 'Gueule Tapée', price: 1500 },
            { name: 'Centenaire', price: 1500 },
        ],
    },
    {
        id: 'corniche-ouest',
        label: 'Corniche / Almadies / Ouest',
        emoji: '🔵',
        zones: [
            { name: 'Ouakam', price: 2000 },
            { name: 'Ngor', price: 2500 },
            { name: 'Almadies', price: 2500 },
            { name: 'Mamelles', price: 2500 },
            { name: 'Virage', price: 2500 },
            { name: 'Cité Biagui', price: 2500 },
            { name: 'Yoff', price: 3000 },
        ],
    },
    {
        id: 'sicap-hlm',
        label: 'Sicap / Liberté / HLM / Castors',
        emoji: '🟡',
        zones: [
            { name: 'Grand Dakar', price: 2000 },
            { name: 'HLM (1 à 6)', price: 2000 },
            { name: 'Biscuiterie', price: 2000 },
            { name: 'Sicap (Liberté, Baobab, Karack)', price: 2000 },
            { name: 'Liberté 1 à 6', price: 2500 },
            { name: 'Dieuppeul', price: 2500 },
            { name: 'Castors', price: 2500 },
            { name: 'Zone A', price: 2000 },
            { name: 'Zone B', price: 2000 },
            { name: 'Amitié', price: 2500 },
            { name: 'Scat Urbam', price: 2500 },
            { name: 'Soprim', price: 2500 },
        ],
    },
    {
        id: 'sacre-coeur-foire',
        label: 'Sacré-Cœur / Mermoz / Foire',
        emoji: '🟡',
        zones: [
            { name: 'Mermoz', price: 2000 },
            { name: 'Cité Keur Gorgui', price: 2000 },
            { name: 'Sacré-Cœur', price: 2500 },
            { name: 'Sicap Foire', price: 2500 },
            { name: 'Nord Foire', price: 2500 },
            { name: 'Ouest Foire', price: 2500 },
            { name: 'Sud Foire', price: 2500 },
            { name: 'Hann Maristes', price: 2500 },
        ],
    },
    {
        id: 'grand-yoff-parcelles',
        label: 'Grand Yoff / Derklé / Parcelles',
        emoji: '🟡',
        zones: [
            { name: 'Grand Yoff', price: 2500 },
            { name: 'HLM Grand Yoff', price: 2500 },
            { name: 'Cité Keur Damel', price: 2500 },
            { name: 'Cité Attaya', price: 2500 },
            { name: 'Cité Mixta', price: 2500 },
            { name: 'Derklé', price: 2500 },
            { name: 'Khar Yalla', price: 2500 },
            { name: 'Zone de Captage', price: 2500 },
            { name: 'Golf Sud', price: 2500 },
            { name: 'Parcelles Assainies (Unités 1 à 26)', price: 2500 },
            { name: 'Cambérène', price: 2500 },
        ],
    },
    {
        id: 'niarry-tally-industriel',
        label: 'Niarry Tally / Bel Air / Industriel',
        emoji: '🟠',
        zones: [
            { name: 'Niary Tally', price: 2000 },
            { name: 'Ben Tally', price: 2000 },
            { name: 'Ouagou Niayes', price: 2000 },
            { name: 'Sodida', price: 2500 },
            { name: 'Bel Air', price: 2500 },
            { name: 'Yarakh', price: 3000 },
            { name: 'Cité Fadia', price: 3000 },
            { name: 'Dalifort', price: 2500 },
        ],
    },
    {
        id: 'pikine',
        label: 'Pikine',
        emoji: '🔴',
        zones: [
            { name: 'Pikine', price: 3000 },
            { name: 'Pikine Icotaf', price: 3000 },
            { name: 'Pikine Rue 10', price: 3000 },
            { name: 'Guinaw Rails Nord', price: 3000 },
            { name: 'Guinaw Rails Sud', price: 3000 },
            { name: 'Thiaroye', price: 4000 },
            { name: 'Djidah Thiaroye Kaw', price: 4000 },
        ],
    },
    {
        id: 'guediawaye',
        label: 'Guédiawaye',
        emoji: '🔴',
        zones: [
            { name: 'Guédiawaye', price: 3000 },
            { name: 'Wakhinane Nimzatt', price: 3000 },
            { name: 'Sam Notaire', price: 3000 },
            { name: 'Golf Nord', price: 3000 },
            { name: 'Médina Gounass', price: 3000 },
        ],
    },
    {
        id: 'keur-massar-yeumbeul',
        label: 'Keur Massar / Yeumbeul',
        emoji: '🔴',
        zones: [
            { name: 'Keur Massar', price: 4000 },
            { name: 'Keur Massar Nord', price: 4000 },
            { name: 'Keur Massar Sud', price: 4000 },
            { name: 'Malika', price: 4000 },
            { name: 'Yeumbeul Nord', price: 4000 },
            { name: 'Yeumbeul Sud', price: 4000 },
        ],
    },
    {
        id: 'mbao-banlieue-est',
        label: 'Mbao / Banlieue Est',
        emoji: '🔴',
        zones: [
            { name: 'Diamaguène', price: 5000 },
            { name: 'Mbao', price: 5000 },
            { name: 'Sicap Mbao', price: 5000 },
            { name: 'Petit Mbao', price: 5000 },
            { name: 'Grand Mbao', price: 5000 },
            { name: 'Bambilor', price: 5000 },
            { name: 'Zac Mbao', price: 6000 },
        ],
    },
    {
        id: 'grande-couronne',
        label: 'Grande Couronne',
        emoji: '🔴',
        zones: [
            { name: 'Rufisque (Ville, Est, Ouest)', price: 8000 },
            { name: 'Bargny', price: 8000 },
            { name: 'Sendou', price: 8000 },
            { name: 'Tivaouane Peulh', price: 8000 },
            { name: 'Niaga', price: 8000 },
            { name: 'Keur Ndiaye Lo', price: 8000 },
            { name: 'Keur Mbaye Fall', price: 8000 },
            { name: 'Kounoune', price: 8000 },
        ],
    },
];

// Helper: flat list of all zones
export const ALL_DELIVERY_ZONES: DeliveryZone[] = DELIVERY_REGIONS.flatMap(r => r.zones);

// Helper: find a zone by name
export function findDeliveryZone(name: string): DeliveryZone | undefined {
    return ALL_DELIVERY_ZONES.find(z => z.name === name);
}
