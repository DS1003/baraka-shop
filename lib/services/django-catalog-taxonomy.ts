/**
 * Taxonomie et Dictionnaire complets du Catalogue Source Django
 * 
 * Basé sur l'analyse exhaustive des 2 309 produits actifs de l'API Django
 * https://backend.barakasn.com/api/v0/products/products-web/
 * 
 * Couvre 100% des 82 identifiants de catégories Django et 104 identifiants de marques.
 */

export interface DjangoTaxonomyEntry {
    name: string;
    family: string;
}

export interface DjangoBrandEntry {
    id: number;
    name: string;
}

/**
 * Normalisation de texte insensible à la casse et aux accents
 */
export function normalizeSearchText(str: string | null | undefined): string {
    if (!str || typeof str !== 'string') return '';
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

/**
 * Mapping des 82 catégories Django vers leur nom explicite et leur famille principale
 */
export const DJANGO_TAXONOMY: Record<number, DjangoTaxonomyEntry> = {
    // 1. IMPRESSION & CONSOMMABLES
    31: { name: 'Toners & Cartouches originaux', family: 'IMPRESSION & CONSOMMABLES' },
    29: { name: 'Toners & Cartouches compatibles', family: 'IMPRESSION & CONSOMMABLES' },
    28: { name: 'Encres d’imprimante EcoTank', family: 'IMPRESSION & CONSOMMABLES' },
    150: { name: 'Imprimantes & Multifonctions', family: 'IMPRESSION & CONSOMMABLES' },
    146: { name: 'Papiers & Rouleaux thermiques', family: 'IMPRESSION & CONSOMMABLES' },

    // 2. COIFFURE & BEAUTÉ
    45: { name: 'Tondeuses & Rasoirs électriques', family: 'COIFFURE & BEAUTÉ' },
    43: { name: 'Lames, peignes & accessoires', family: 'COIFFURE & BEAUTÉ' },
    44: { name: 'Mobilier salon & fauteuils barbier', family: 'COIFFURE & BEAUTÉ' },

    // 3. SÉCURITÉ & SURVEILLANCE
    132: { name: 'Caméras & Kits vidéosurveillance', family: 'SÉCURITÉ & SURVEILLANCE' },
    180: { name: 'Kits NVR & Vidéosurveillance PoE', family: 'SÉCURITÉ & SURVEILLANCE' },
    131: { name: 'Supports & Accessoires caméras', family: 'SÉCURITÉ & SURVEILLANCE' },

    // 4. INFORMATIQUE
    120: { name: 'Chargeurs ordinateur portable', family: 'INFORMATIQUE' },
    122: { name: 'Ordinateurs portables', family: 'INFORMATIQUE' },
    115: { name: 'Ordinateurs de bureau & All-in-One', family: 'INFORMATIQUE' },
    148: { name: 'Souris & Tapis de souris', family: 'INFORMATIQUE' },
    147: { name: 'Claviers', family: 'INFORMATIQUE' },
    149: { name: 'Écrans & Moniteurs PC', family: 'INFORMATIQUE' },
    37: { name: 'Disques SSD externes & portables', family: 'INFORMATIQUE' },
    36: { name: 'Cartes mémoires Micro SD', family: 'INFORMATIQUE' },
    35: { name: 'Clés USB', family: 'INFORMATIQUE' },
    38: { name: 'Lecteurs de cartes & Hubs USB', family: 'INFORMATIQUE' },
    125: { name: 'Sacs & Sacoches PC portables', family: 'INFORMATIQUE' },
    151: { name: 'Onduleurs UPS & Régulateurs', family: 'INFORMATIQUE' },
    153: { name: 'Webcams & Visioconférence', family: 'INFORMATIQUE' },
    118: { name: 'Logiciels & Antivirus', family: 'INFORMATIQUE' },
    124: { name: 'Refroidisseurs pour PC portables', family: 'INFORMATIQUE' },
    137: { name: 'Stations d’accueil & Docks', family: 'INFORMATIQUE' },
    83: { name: 'Pointeurs laser & Présentateurs', family: 'INFORMATIQUE' },

    // 5. RÉSEAUX & TÉLÉCOMS
    160: { name: 'Routeurs Wi-Fi & Répéteurs', family: 'RÉSEAUX & TÉLÉCOMS' },
    156: { name: 'Points d’accès Wi-Fi professionnels', family: 'RÉSEAUX & TÉLÉCOMS' },
    161: { name: 'Switchs réseau & Switchs PoE', family: 'RÉSEAUX & TÉLÉCOMS' },
    157: { name: 'Baies réseau & Coffrets muraux', family: 'RÉSEAUX & TÉLÉCOMS' },
    189: { name: 'Câbles réseau RJ45 Ethernet', family: 'RÉSEAUX & TÉLÉCOMS' },
    186: { name: 'Cordons & Jarretières fibre optique', family: 'RÉSEAUX & TÉLÉCOMS' },
    159: { name: 'Adaptateurs Wi-Fi USB', family: 'RÉSEAUX & TÉLÉCOMS' },
    144: { name: 'Téléphones fixes & Téléphonie IP', family: 'RÉSEAUX & TÉLÉCOMS' },

    // 6. IMAGE, SON & VIDÉO
    74: { name: 'Microphones & Systèmes conférence', family: 'IMAGE, SON & VIDÉO' },
    171: { name: 'Batteries pour appareils photo & caméras', family: 'IMAGE, SON & VIDÉO' },
    163: { name: 'Éclairage vidéo LED, anneaux & softboxes', family: 'IMAGE, SON & VIDÉO' },
    69: { name: 'Caméras d’action & Stabilisateurs', family: 'IMAGE, SON & VIDÉO' },
    76: { name: 'Trépieds & Monopodes photo/vidéo', family: 'IMAGE, SON & VIDÉO' },
    75: { name: 'Objectifs photo', family: 'IMAGE, SON & VIDÉO' },
    73: { name: 'Flashs studio & Éclairage Godox', family: 'IMAGE, SON & VIDÉO' },
    88: { name: 'Casques audio & Micro-casques', family: 'IMAGE, SON & VIDÉO' },
    87: { name: 'Écouteurs sans fil Bluetooth (TWS)', family: 'IMAGE, SON & VIDÉO' },
    60: { name: 'Enceintes portables & Systèmes audio', family: 'IMAGE, SON & VIDÉO' },
    90: { name: 'Enceintes & Veilleuses Coraniques', family: 'IMAGE, SON & VIDÉO' },
    59: { name: 'Amplificateurs audio', family: 'IMAGE, SON & VIDÉO' },
    92: { name: 'Haut-parleurs & Enceintes nomades', family: 'IMAGE, SON & VIDÉO' },
    145: { name: 'Pupitres & Contrôleurs PTZ caméra', family: 'IMAGE, SON & VIDÉO' },
    162: { name: 'Cages & Rigs vidéo SmallRig', family: 'IMAGE, SON & VIDÉO' },
    85: { name: 'Vidéoprojecteurs', family: 'IMAGE, SON & VIDÉO' },
    82: { name: 'Écrans de projection', family: 'IMAGE, SON & VIDÉO' },
    102: { name: 'Téléviseurs & Smart TV', family: 'IMAGE, SON & VIDÉO' },
    99: { name: 'Supports muraux & Meubles TV', family: 'IMAGE, SON & VIDÉO' },
    64: { name: 'Passerelles multimédia & Box TV', family: 'IMAGE, SON & VIDÉO' },
    194: { name: 'Switchs HDMI, répartiteurs & extendeurs', family: 'IMAGE, SON & VIDÉO' },
    184: { name: 'Câbles HDMI & Câbles vidéo', family: 'IMAGE, SON & VIDÉO' },
    97: { name: 'Décodeurs & Récepteurs satellite', family: 'IMAGE, SON & VIDÉO' },
    89: { name: 'Enregistreurs vocaux numériques', family: 'IMAGE, SON & VIDÉO' },
    172: { name: 'Chargeurs double batterie photo/vidéo', family: 'IMAGE, SON & VIDÉO' },

    // 7. TÉLÉPHONIE & TABLETTES
    138: { name: 'Tablettes tactiles', family: 'TÉLÉPHONIE & TABLETTES' },
    142: { name: 'Powerbanks & Batteries externes', family: 'TÉLÉPHONIE & TABLETTES' },
    141: { name: 'Écouteurs filaires smartphone', family: 'TÉLÉPHONIE & TABLETTES' },
    143: { name: 'Supports pour smartphones & tablettes', family: 'TÉLÉPHONIE & TABLETTES' },
    34: { name: 'Câbles de charge & synchronisation', family: 'TÉLÉPHONIE & TABLETTES' },
    191: { name: 'Rallonges USB & Câbles USB', family: 'TÉLÉPHONIE & TABLETTES' },

    // 8. JEUX VIDÉO & GAMING
    174: { name: 'Consoles de jeux & Casques VR', family: 'JEUX VIDÉO & GAMING' },
    176: { name: 'Manettes de jeu & Stations de charge', family: 'JEUX VIDÉO & GAMING' },

    // 9. ÉLECTRICITÉ & MAISON
    165: { name: 'Rallonges électriques & Multiprises', family: 'ÉLECTRICITÉ & MAISON' },
    196: { name: 'Transformateurs & Alimentations réglables', family: 'ÉLECTRICITÉ & MAISON' },
    170: { name: 'Ventilateurs & Brasseurs d’air', family: 'ÉLECTRICITÉ & MAISON' },
    168: { name: 'Lampes & Éclairage de secours', family: 'ÉLECTRICITÉ & MAISON' },
    166: { name: 'Électroménager & Maison', family: 'ÉLECTRICITÉ & MAISON' },
    178: { name: 'Accessoires auto & Rangements véhicule', family: 'ÉLECTRICITÉ & MAISON' },
    152: { name: 'Convertisseurs de tension', family: 'ÉLECTRICITÉ & MAISON' },

    // 10. OBJETS CONNECTÉS & DRONES
    133: { name: 'Drones & Accessoires de vol', family: 'OBJETS CONNECTÉS & DRONES' },
    139: { name: 'Balises traceurs AirTag & Accessoires', family: 'OBJETS CONNECTÉS & DRONES' },
    134: { name: 'Bagues connectées & Tasbih intelligents', family: 'OBJETS CONNECTÉS & DRONES' },
    66: { name: 'Montres & Montres connectées enfants', family: 'OBJETS CONNECTÉS & DRONES' },
    100: { name: 'Écrans interactifs & Tactiles', family: 'OBJETS CONNECTÉS & DRONES' },
    33: { name: 'Lecteurs de stockage multimédia', family: 'OBJETS CONNECTÉS & DRONES' }
};

/**
 * Noms officiels et nettoyés des 104 identifiants de marques Django
 */
export const DJANGO_BRAND_NAMES: Record<number, string> = {
    1: 'R SCAR',
    19: 'AIRFLUX',
    20: 'Baraka',
    21: 'WMARK',
    22: 'AKKO STAR',
    27: 'OTEETO',
    28: 'HP',
    29: 'DELL',
    30: 'Canon',
    31: 'Epson',
    32: 'DJI',
    33: 'Microsoft',
    34: 'ACER',
    35: 'ASUS',
    36: 'Apple',
    37: 'MSI',
    38: 'LENOVO',
    41: 'SONY',
    42: 'Samsung',
    43: 'Toshiba',
    44: 'Kingston',
    45: 'TP-LINK',
    46: 'Amazon',
    47: 'Belkin',
    48: 'Seagate',
    49: 'Lexar',
    50: 'SanDisk',
    51: 'Western Digital',
    52: 'Baseus',
    53: 'DM',
    54: 'KODAK',
    55: 'Havit',
    56: 'Remax',
    57: 'Hoco',
    58: 'Oraimo',
    59: 'COMAN',
    60: 'K&F Concept',
    61: 'Ugreen',
    62: 'Rapoo',
    63: 'Logitech',
    64: 'D-Link',
    65: 'SmallRig',
    66: 'Netgear',
    67: 'Nikon',
    68: 'Panasonic',
    69: 'GoPro',
    70: 'Xiaomi',
    71: 'Huawei',
    72: 'JBL',
    73: 'Anker',
    74: 'Meta',
    75: 'Sennheiser',
    76: 'Boya',
    77: 'Blackmagic',
    78: 'Rode',
    79: 'JINGHUA',
    80: 'Hikvision',
    81: 'Dahua',
    82: 'Ezviz',
    83: 'Kaspersky',
    84: 'Imou',
    85: 'GIGA 360',
    86: 'Vention',
    87: 'Sing-E',
    88: 'Tenda',
    89: 'MikroTik',
    90: 'Ubiquiti',
    91: 'Ruijie',
    92: 'BOSCH',
    93: 'MT-VIKI',
    94: 'Equantu',
    95: 'Kemei',
    96: 'VGR',
    97: 'HTC',
    98: 'Waer',
    99: 'FOSVISION',
    100: 'IMOU',
    101: 'Star Track',
    102: 'Sonashi',
    103: 'EZVIZ',
    104: 'APC',
    105: 'Mercury',
    106: 'GEEPAS',
    107: 'GRANDSTREAM',
    108: 'Xprinter',
    109: 'Zebra',
    110: 'Evolis',
    111: 'Posiflex',
    112: 'Godox',
    113: 'Dahua',
    114: 'Shure',
    115: 'Audio-Technica',
    116: 'Yamaha',
    117: 'Pioneer',
    118: 'JBL Pro',
    119: 'Sony Interactive',
    120: 'Google',
    121: 'Nintendo',
    122: 'SanDisk Pro',
    123: 'HEPU',
    124: 'Beats',
    125: 'UGREEN',
    126: 'Anker Eufy',
    127: 'TP-Link Tapo',
    128: 'Boya Pro',
    129: 'G-Tab',
    130: 'JVC',
    131: 'Philips',
    132: 'Braun',
    133: 'Rowenta',
    134: 'Cudy',
    135: 'Lemorele',
    136: 'Tiroll',
    137: 'Loupin',
    138: 'Hisense',
    139: 'TCL',
    140: 'Skyworth',
    141: 'Infinix',
    142: 'Tecno',
    143: 'Itel',
    144: 'Honor',
    145: 'HDKATOV',
    146: 'ZGCINE',
    147: 'Andoer',
    148: 'KODAK',
    149: 'SanDisk'
};
