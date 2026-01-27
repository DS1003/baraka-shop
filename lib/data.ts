export const MOCK_PRODUCTS = [
    {
        id: '1',
        name: 'MacBook Pro 16" M3 Max',
        description: 'La puissance ultime pour les pros. Puce M3 Max, 32Go RAM, 1TB SSD.',
        price: 2450000,
        oldPrice: 2600000,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?q=80&w=800&auto=format&fit=crop', // MacBook
        category: 'Ordinateurs',
        rating: 5,
        reviews: 12,
        isNew: true,
        isHot: true,
        slug: 'macbook-pro-m3-max'
    },
    {
        id: '2',
        name: 'iPhone 15 Pro Max Titane',
        description: 'Design en titane aérospatial. Puce A17 Pro. Caméra 48MP.',
        price: 990000,
        oldPrice: 1100000,
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop', // iPhone 15 Pro
        category: 'Smartphones',
        rating: 5,
        reviews: 45,
        isHot: true,
        slug: 'iphone-15-pro-max'
    },
    {
        id: '3',
        name: 'Sony WH-1000XM5',
        description: 'Réduction de bruit inégalée, son haute résolution.',
        price: 225000,
        image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800&auto=format&fit=crop', // Headphones
        category: 'Audio',
        rating: 4.8,
        reviews: 8,
        slug: 'sony-wh-1000xm5'
    },
    {
        id: '4',
        name: 'PlayStation 5 Slim',
        description: 'Jouez comme jamais auparavant. Design plus fin.',
        price: 350000,
        oldPrice: 380000,
        image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=800&auto=format&fit=crop', // PS5 controller artistic
        category: 'Gaming',
        rating: 5,
        reviews: 120,
        isHot: true,
        slug: 'ps5-slim'
    },
    {
        id: '5',
        name: 'Samsung Galaxy S24 Ultra',
        description: 'L\'expérience Galaxy AI ultime. Stylet S-Pen inclus.',
        price: 890000,
        image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=800&auto=format&fit=crop', // Samsung Phone
        category: 'Smartphones',
        rating: 4.9,
        reviews: 30,
        isNew: true,
        slug: 'samsung-s24-ultra'
    },
    {
        id: '6',
        name: 'Canon EOS R6 Mark II',
        description: 'Hybride plein format pour la photo et la vidéo.',
        price: 1600000,
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop', // Camera
        category: 'Photo',
        rating: 5,
        reviews: 5,
        slug: 'canon-eos-r6'
    },
    {
        id: '7',
        name: 'Apple Watch Ultra 2',
        description: 'L\'aventure vous appelle. Boîtier en titane robuste.',
        price: 550000,
        image: 'https://images.unsplash.com/photo-1673356301535-15a4521dd1dc?q=80&w=800&auto=format&fit=crop', // Apple Watch Ultra
        category: 'Smartwatch',
        rating: 4.9,
        reviews: 15,
        isNew: true,
        slug: 'apple-watch-ultra-2'
    },
    {
        id: '8',
        name: 'iPad Pro M4 13"',
        description: 'L\'iPad le plus fin et puissant jamais créé.',
        price: 900000,
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop', // iPad
        category: 'Tablettes',
        rating: 4.8,
        reviews: 22,
        slug: 'ipad-pro-m4'
    }
];

export const CATEGORIES = [
    { id: 'smartphones', name: 'Smartphones', image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff23?auto=format&fit=crop&q=80&w=300' },
    { id: 'laptops', name: 'Ordinateurs', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=300' },
    { id: 'audio', name: 'Audio & Son', image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=300' },
    { id: 'gaming', name: 'Gaming', image: 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&q=80&w=300' },
    { id: 'accessories', name: 'Accessoires', image: 'https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?auto=format&fit=crop&q=80&w=300' },
    { id: 'cameras', name: 'Photo & Vidéo', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=300' },
];

export const MENU_CATEGORIES = [
    {
        id: 'informatique',
        title: "INFORMATIQUE",
        image: "https://media.ldlc.com/encart/p/28885_b.jpg",
        subcategories: [
            { label: "RESEAUX", links: ["SWITCH", "MODEM & ROUTEUR", "CLE ET CARTE WIFI", "CARTE RESEAU ET CPL", "ACCESSOIRES RESEAUX", "ACCESS POINT & REPETITEUR"] },
            { label: "PC PORTABLE", links: ["ORDINATEURS PORTABLE", "MACBOOK", "ORDINATEUR RECONDITIONNE", "CHARGEUR ORDINATEUR PORTABLE", "BATTERIE ORDINATEUR PORTABLE", "ACCESSOIRES ORDINATEUR PORTABLE", "SACS & SACOCHES"] },
            { label: "PIECES", links: ["ECRAN ORDINATEUR PORTABLE", "BARETTE ORDINATEUR"] },
            { label: "ORDINATEURS DE BUREAU", links: ["SERVEUR", "DESKTOP RECONDITIONNE", "DESKTOP"] },
            { label: "PERIPHERIQUES", links: ["WEBCAM", "REGULATEUR DE TENSION", "ONDELEUR", "IMPRIMANTE", "ECRAN PC", "CLAVIER & SOURIS ORIGINAL", "ACCESSOIRES STREAMING"] },
        ]
    },
    {
        id: 'image-son',
        title: "IMAGE & SON",
        image: "https://media.ldlc.com/encart/p/28829_b.jpg",
        subcategories: [
            { label: "PHOTO", links: ["TRIPIED MICRO", "TRIPIED CAMERA", "OBJECTIF", "MICROPHONE", "APPAREIL PHOTO", "ACCESSOIRES PHOTO", "STABILISATEUR", "LED CAMERA"] },
            { label: "TELEVISION", links: ["TELECOMMANDE", "SUPPORT MURAL", "CONNECTIQUE TV", "CASQUE AUDIO HIFI", "TELEVISION 2EME", "TELEVISION ORIGINAL"] },
            { label: "PROJECTION", links: ["VIDEO PROJECTEUR", "SUPPORT VIDEO PROJECTEUR", "POINTEUR LASER", "ECRAN DE PROJECTION"] },
            { label: "SON NUMERIQUE", links: ["RADIO", "ENCEINTE BLUETOOTH", "DICTAPHONE", "CASQUES", "AIRPODS", "ECOUTEUR", "AIRPODS ORIGINAL"] },
            { label: "HOME CINEMA", links: ["HOME CINEMA", "BARRE DE SON", "BAFFLE", "ACCESSOIRES HOME CINEMA"] },
        ]
    },
    {
        id: 'consommables',
        title: "CONSOMMABLES",
        image: "https://media.ldlc.com/encart/p/22889_b.jpg",
        subcategories: [
            { label: "STOCKAGE", links: ["DISQUE DUR", "CLE USB", "CARTE MEMOIRE", "LECTEUR CARTE", "CABLE DISQUE DUR", "BOITIER DISQUE DUR"] },
            { label: "IMPRESSION", links: ["TONER ORIGINAL", "TONER H2", "TONER 2EME", "BOITE TONER 2EME", "CARTOUCHE"] }
        ]
    },
    {
        id: 'telephone',
        title: "TELEPHONE & TABLETTE",
        image: "https://media.ldlc.com/encart/p/28828_b.jpg",
        subcategories: [
            { label: "SMARTPHONES", links: ["IPHONE", "SAMSUNG GALAXY", "GOOGLE PIXEL", "REDMI", "INFINIX", "TECNO"] },
            { label: "TABLETTES", links: ["IPAD PRO", "IPAD AIR", "GALAXY TAB", "SURFACE"] },
            { label: "ACCESSOIRES", links: ["COQUES", "PROTECTION ECRAN", "CHARGEURS", "POWERBANK"] }
        ]
    },
    {
        id: 'jeux',
        title: "JEUX & LOISIRS",
        image: "https://media.ldlc.com/encart/p/26671_b.jpg",
        subcategories: [
            { label: "CONSOLES", links: ["PS5", "XBOX SERIES", "NINTENDO SWITCH", "PS4"] },
            { label: "JEUX VIDEO", links: ["JEUX PS5", "JEUX XBOX", "JEUX SWITCH"] },
            { label: "ACCESSOIRES", links: ["MANNETTES", "CASQUES GAMING", "CHAISE GAMER"] }
        ]
    },
    {
        id: 'electromenager',
        title: "ELECTROMENAGER",
        image: "https://media.ldlc.com/encart/p/28858_b.jpg",
        subcategories: [
            { label: "CUISINE", links: ["REFRIGERATEURS", "MICRO-ONDES", "FOURS", "MIXEUR"] },
            { label: "ENTRETIEN", links: ["ASPIRATEURS", "FER A REPASSER", "MACHINE A LAVER"] }
        ]
    },
    {
        id: 'coiffure',
        title: "SALON DE COIFFURE",
        image: "https://media.ldlc.com/encart/p/28885_b.jpg",
        subcategories: [
            { label: "MATERIEL", links: ["TONDEUSES", "SECHE-CHEVEUX", "LISSEURS"] }
        ]
    },
    {
        id: 'connectique',
        title: "CONNECTIQUE",
        image: "https://media.ldlc.com/encart/p/28829_b.jpg",
        subcategories: [
            { label: "CABLES", links: ["HDMI", "USB-C", "CHARGEURS", "ADAPTATEURS"] }
        ]
    }
]
