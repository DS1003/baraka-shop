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
        id: 'plateau',
        label: 'Dakar Plateau (Centre-ville)',
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
        id: 'ouest',
        label: 'Dakar Ouest (Almadies & Corniche)',
        emoji: '🟢',
        zones: [
            { name: 'Ngor', price: 2500 },
            { name: 'Yoff', price: 3000 },
            { name: 'Ouakam', price: 2000 },
            { name: 'Almadies', price: 2500 },
            { name: 'Mamelles', price: 2500 },
            { name: 'Virage', price: 2500 },
            { name: 'Cité Biagui', price: 2500 },
        ],
    },
    {
        id: 'grand-dakar',
        label: 'Grand Dakar & HLM',
        emoji: '🟡',
        zones: [
            { name: 'Grand Dakar', price: 2000 },
            { name: 'HLM (HLM 1 à 6)', price: 2000 },
            { name: 'Biscuiterie', price: 2000 },
            { name: 'Dieuppeul', price: 2500 },
            { name: 'Liberté 1 à 6', price: 2500 },
            { name: 'Sicap (Liberté, Baobab, Karack)', price: 2000 },
            { name: 'Castors', price: 2500 },
            { name: 'Zone A', price: 2000 },
            { name: 'Zone B', price: 2000 },
            { name: 'Soprim', price: 2500 },
            { name: 'Niarry Tally', price: 2000 },
            { name: 'Ben Tally', price: 2000 },
            { name: 'Ouagou Ndiaye', price: 2000 },
        ],
    },
    {
        id: 'autres-urbaines',
        label: 'Autres zones urbaines',
        emoji: '🟡',
        zones: [
            { name: 'Sacré-Cœur', price: 2500 },
            { name: 'Mermoz', price: 2000 },
            { name: 'Cité Keur Gorgui', price: 2000 },
            { name: 'Sicap Foire', price: 2500 },
            { name: 'Hann Maristes', price: 2500 },
            { name: 'Patte d\'Oie', price: 2000 },
            { name: 'Nord Foire', price: 2500 },
            { name: 'Cité Avion', price: 2000 },
            { name: 'Amitié', price: 2500 },
            { name: 'Scat Urbam', price: 2500 },
            { name: 'Ouest Foire', price: 2500 },
            { name: 'Sud Foire', price: 2500 },
            { name: 'Cité Attaya', price: 2500 },
            { name: 'Cité Mixta', price: 2500 },
            { name: 'Cité Keur Damel', price: 2500 },
            { name: 'Grand Yoff', price: 2500 },
            { name: 'HLM Grand Yoff', price: 2500 },
            { name: 'Khar Yalla', price: 2500 },
            { name: 'Derklé', price: 2500 },
            { name: 'Zone de Captage', price: 2500 },
            { name: 'Sodida', price: 2500 },
            { name: 'Bel Air', price: 2500 },
            { name: 'Golf', price: 2500 },
            { name: 'Dalifort', price: 2500 },
        ],
    },
    {
        id: 'parcelles',
        label: 'Parcelles Assainies',
        emoji: '🟡',
        zones: [
            { name: 'Parcelles Assainies (Unités 1 à 26)', price: 2500 },
            { name: 'Cambérène', price: 2500 },
            { name: 'Golf Sud', price: 2500 },
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
            { name: 'Djidah Thiaroye Kaw', price: 4000 },
            { name: 'Thiaroye', price: 4000 },
            { name: 'Yarakh', price: 3000 },
            { name: 'Cité Fadia', price: 3000 },
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
        id: 'keur-massar',
        label: 'Keur Massar',
        emoji: '🔴',
        zones: [
            { name: 'Keur Massar', price: 4000 },
            { name: 'Keur Massar Nord', price: 4000 },
            { name: 'Keur Massar Sud', price: 4000 },
            { name: 'Malika', price: 4000 },
            { name: 'Yeumbeul Nord', price: 4000 },
            { name: 'Yeumbeul Sud', price: 4000 },
            { name: 'Tivaouane Peulh', price: 4000 },
        ],
    },
    {
        id: 'rufisque',
        label: 'Rufisque & environs',
        emoji: '🔴',
        zones: [
            { name: 'Rufisque', price: 8000 },
            { name: 'Rufisque Ville', price: 8000 },
            { name: 'Rufisque Est', price: 8000 },
            { name: 'Rufisque Ouest', price: 8000 },
            { name: 'Bargny', price: 10000 },
            { name: 'Sendou', price: 8000 },
            { name: 'Diamaguène', price: 5000 },
            { name: 'Mbao', price: 5000 },
            { name: 'Sicap Mbao', price: 5000 },
            { name: 'Petit Mbao', price: 5000 },
            { name: 'Grand Mbao', price: 5000 },
            { name: 'ZAC Mbao', price: 6000 },
            { name: 'Keur Mbaye Fall', price: 8000 },
        ],
    },
    {
        id: 'peripherie',
        label: 'Grande périphérie',
        emoji: '🔴',
        zones: [
            { name: 'Bambilor', price: 5000 },
            { name: 'Kounoune', price: 8000 },
            { name: 'Keur Ndiaye Lo', price: 8000 },
            { name: 'Tivaoune Peulh', price: 8000 },
            { name: 'Niaga', price: 8000 },
            { name: 'Sébikotane', price: 15000 },
        ],
    },
];

// Helper: flat list of all zones
export const ALL_DELIVERY_ZONES: DeliveryZone[] = DELIVERY_REGIONS.flatMap(r => r.zones);

// Helper: find a zone by name
export function findDeliveryZone(name: string): DeliveryZone | undefined {
    return ALL_DELIVERY_ZONES.find(z => z.name === name);
}
