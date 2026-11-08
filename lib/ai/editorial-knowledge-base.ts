import prisma from '@/lib/prisma';

export interface EditorialProductSample {
    name: string;
    brand?: string;
    category?: string;
    shortDescription?: string;
    description?: string;
    features?: string[];
    specs?: Record<string, string>;
}

/**
 * Exemples éditoriaux de référence canoniques (Baraka Standards)
 * Utilisés en fallback ou en ancrage pour chaque univers de produit.
 */
export const CANONICAL_EDITORIAL_SAMPLES: Record<string, EditorialProductSample> = {
    HIGH_TECH_VIDEO: {
        name: "DJI Osmo Pocket 3 Creator Combo",
        brand: "DJI",
        category: "IMAGE & SON",
        shortDescription: "Caméra portable pour smartphone - nacelle mécanique à 3 axes - 4K 60 ips - écran OLED 2\" pivotant - 166 minutes d'autonomie",
        description: `<b>L'émotion en mouvement</b><br><br>La DJI Osmo Pocket 3 est dotée d'un puissant capteur CMOS de 1 pouce produisant des images ultra-détaillées à portée de main. L'écran tactile rotatif de 2 pouces et la mise au point rapide facilitent le passage à l'horizontale ou à la verticale pour un contrôle plus précis.<br><br><b>Stabilité cinématographique et autonomie record</b><br><br>Grâce à sa stabilisation mécanique à 3 axes et à son autonomie pouvant atteindre 166 minutes, filmez des vidéos d'une fluidité irréprochable lors de tous vos déplacements. La recharge rapide permet d'atteindre 80% en seulement 16 minutes.`,
        features: [
            "Capteur CMOS 1 pouce haute sensibilité pour des images nettes en basse lumière",
            "Résolution vidéo 4K jusqu'à 60 ips et ralenti fluide",
            "Nacelle mécanique 3 axes pour une stabilisation vidéo cinématographique",
            "Écran tactile OLED pivotant de 2 pouces (format paysage ou portrait)",
            "Autonomie jusqu'à 166 minutes avec recharge ultra-rapide en USB-C",
            "Connectivité Bluetooth 5.2 et Wi-Fi haut débit",
            "Support de carte microSD jusqu'à 512 Go"
        ],
        specs: {
            "Désignation": "DJI Osmo Pocket 3 Creator Combo",
            "Marque": "DJI",
            "Modèle": "Osmo Pocket 3",
            "Type d'accessoire": "Caméra stabilisée portable",
            "Capteur": "CMOS 1 pouce",
            "Résolution vidéo": "4K (3840 × 2160 pixels)",
            "Écran": "OLED tactile pivotant 2 pouces",
            "Autonomie": "Jusqu'à 166 minutes",
            "Connectivité": "Bluetooth 5.2, Wi-Fi",
            "Stockage": "Carte microSD (jusqu'à 512 Go)",
            "Alimentation": "USB-C (charge rapide 16 min pour 80%)",
            "Couleur": "Noir",
            "Compatibilité": "iOS et Android"
        }
    },
    INFORMATIQUE_TABLETTE: {
        name: "Tablette Oteeto TAB 7 (4G + Wi-Fi)",
        brand: "OTEETO",
        category: "TELEPHONE & TABLETTE",
        shortDescription: "Tablette 7 pouces IPS - 4G LTE & Wi-Fi - 8 Go RAM / 256 Go Stockage - Processeur Octa-Core - Android 13",
        description: `<b>Performance et mobilité au quotidien</b><br><br>La tablette Oteeto TAB 7 est conçue pour offrir une expérience fluide aussi bien pour le travail que pour les loisirs. Dotée d'un superbe écran IPS de 7 pouces, elle offre des images nettes et des couleurs éclatantes pour vos vidéos, lectures et visioconférences.<br><br><b>Capacité généreuse et connectivité sans limite</b><br><br>Avec son processeur Octa-Core associé à 8 Go de mémoire vive et 256 Go de stockage, naviguez entre vos applications sans ralentissement. Son emplacement 4G LTE vous assure une connexion Internet continue même sans réseau Wi-Fi.`,
        features: [
            "Écran tactile IPS 7 pouces aux couleurs éclatantes",
            "Connectivité 4G LTE et Wi-Fi pour rester connecté partout",
            "Mémoire généreuse : 8 Go RAM + 256 Go de stockage interne",
            "Processeur Octa-Core 1.8 GHz fluide et réactif",
            "Système d'exploitation moderne et sécurisé Android™ 13",
            "Double caméra avant et arrière pour appels vidéo et photos",
            "Batterie longue durée 3500 mAh avec recharge rapide 5V/2A",
            "Emplacement carte mémoire microSD pour extension de stockage"
        ],
        specs: {
            "Désignation": "Oteeto TAB 7",
            "Marque": "Oteeto",
            "Modèle": "TAB 7",
            "Type": "Tablette tactile 4G",
            "Taille écran": "7 pouces (17.78 cm)",
            "Technologie écran": "IPS LCD",
            "Système d'exploitation": "Android 13",
            "Processeur": "Octa-Core 1.8 GHz",
            "Mémoire RAM": "8 Go",
            "Stockage interne": "256 Go",
            "Connectivité": "4G LTE (carte SIM), Wi-Fi, Bluetooth",
            "Batterie": "3500 mAh",
            "Ports": "USB-C, Prise Jack 3.5mm, Port microSD"
        }
    },
    CONSOMMABLES_IMPRESSION: {
        name: "Cartouche HP 653 Noir Authentique (3YM75AE)",
        brand: "HP",
        category: "CONSOMMABLES",
        shortDescription: "Cartouche d'encre HP 653 Noir originale - Contenance 6 ml - Rendement environ 360 pages à 5%",
        description: `<b>Des documents nets et durables au quotidien</b><br><br>La cartouche d'encre noire HP 653 authentique garantit des impressions d'une netteté professionnelle, page après page. Conçue spécialement pour votre imprimante HP, elle préserve la tête d'impression et évite les bavures ou interruptions indésirables.<br><br><b>Fiabilité et authenticité certifiées HP</b><br><br>Faites le choix de la qualité constructeur pour rentabiliser chaque page imprimée avec des noirs intenses et une longévité d'archivage exceptionnelle.`,
        features: [
            "Cartouche d'encre noire originale HP authentique",
            "Rendement optimisé d'environ 360 pages à 5% de couverture",
            "Formulation d'encre pigmentée pour des textes d'une parfaite netteté",
            "Remplacement simple et reconnaissance instantanée par l'imprimante",
            "Protection éprouvée du système d'impression HP"
        ],
        specs: {
            "Désignation": "HP 653 Noir (3YM75AE)",
            "Marque": "HP",
            "Modèle": "3YM75AE",
            "Type": "Cartouche d'encre originale",
            "Technologie d'impression": "Jet d'encre thermique HP",
            "Couleur d'encre": "Noir",
            "Contenance": "6 ml",
            "Rendement": "Environ 360 pages (à 5% de couverture)",
            "Cartouche constructeur": "Oui (Original)",
            "Compatibilité": "HP DeskJet Ink Advantage 1275, 2300 Series, 2700 Series, DeskJet Plus 6075, 6475"
        }
    }
};

/**
 * Récupère dynamiquement des exemples de fiches produits validées et de haute qualité
 * dans la base Baraka Shop selon la catégorie et la marque.
 */
export async function getRelevantEditorialExamples(
    categoryId?: string | null,
    brandId?: string | null
): Promise<EditorialProductSample[]> {
    try {
        const whereClause: any = {
            isPublished: true,
            description: { not: null },
            shortDescription: { not: null },
            features: { not: null }
        };

        if (categoryId) {
            whereClause.categoryId = categoryId;
        } else if (brandId) {
            whereClause.brandId = brandId;
        }

        const products = await prisma.product.findMany({
            where: whereClause,
            take: 2,
            orderBy: { updatedAt: 'desc' },
            include: { brand: true, category: true, subCategory: true }
        });

        if (products.length > 0) {
            return products.map(p => {
                const meta = (p.metadata && typeof p.metadata === 'object') ? (p.metadata as Record<string, any>) : {};
                const cleanedSpecs: Record<string, string> = {};
                for (const [k, v] of Object.entries(meta)) {
                    if (k !== '_order' && k !== 'importedAt' && typeof v === 'string') {
                        cleanedSpecs[k] = v;
                    }
                }

                return {
                    name: p.name,
                    brand: p.brand?.name || undefined,
                    category: p.category?.name || undefined,
                    shortDescription: p.shortDescription || undefined,
                    description: p.description || undefined,
                    features: Array.isArray(p.features) ? (p.features as string[]) : undefined,
                    specs: Object.keys(cleanedSpecs).length > 0 ? cleanedSpecs : undefined
                };
            });
        }
    } catch (err) {
        console.warn('[Editorial Knowledge Base] Erreur lors de la récupération des exemples DB:', err);
    }

    // Fallback canonique
    return [
        CANONICAL_EDITORIAL_SAMPLES.HIGH_TECH_VIDEO,
        CANONICAL_EDITORIAL_SAMPLES.INFORMATIQUE_TABLETTE
    ];
}

/**
 * Directives éditoriales complètes de Baraka Shop transmises à l'IA
 */
export const BARAKA_EDITORIAL_GUIDELINES = `
# CHARTE RÉDACTIONNELLE & STANDARDS ÉDITORIAUX BARAKA SHOP

Baraka Shop est la référence du commerce électronique d'équipements technologiques et électroniques au Sénégal (boutique officielle à Sandaga, Dakar et plateforme en ligne).

## 1. TON ET STYLE
- **Professionnel, valorisant, moderne et précis.**
- Mettez l'accent sur les bénéfices concrets pour l'utilisateur (productivité, confort, fiabilité, sécurité, longévité).
- Français impeccable, tournures soignées, sans superlatifs creux ni répétitions.
- Vocabulaire technologique exact adapté au marché sénégalais et francophone (ex: "Connexion 4G LTE", "Autonomie", "Prise secteur", "Garantie officielle").

## 2. LES 5 CHAMPS DISTINCTS ET LEURS RÔLES STRICTS

Tu dois générer très exactement les 5 champs suivants, en veillant à ce que chacun remplisse son rôle sans redondance textuelle :

### Champ 1 : Description courte (shortDescription)
- **Rôle :** Synthèse d'accroche visible dès le haut de la page produit (à côté des images et sous le prix).
- **Format :** 1 à 2 phrases percutantes ou segments concis reliés par des tirets.
- **Contenu :** Identité précise du produit + 2 à 4 caractéristiques maîtresses (ex: taille écran, processeur/capacité, connectivité, autonomie).
- **Exemple :** "Tablette 7 pouces IPS - 4G LTE & Wi-Fi - 8 Go RAM / 256 Go Stockage - Processeur Octa-Core - Android 13"

### Champ 2 : Description (generalDescription)
- **Rôle :** Contenu descriptif général sous forme de paragraphe fluide et élégant (texte brut ou paragraphes simples).
- **Format :** 1 ou 2 paragraphes bien rédigés (environ 50 à 100 mots).
- **Contenu :** Explique la vocation du produit, son public cible et son utilité dans la vie quotidienne ou professionnelle, sans puces ni tableau technique.

### Champ 3 : Description classique (classicDescription)
- **Rôle :** Présentation commerciale structurée selon les habitudes et l'identité visuelle de Baraka Shop.
- **Format :** HTML propre et sémantique utilisant exclusivement des balises d'accroche et de paragraphes :
  <b>Titre fort et accrocheur</b><br><br>Texte de présentation percutant...<br><br><b>Deuxième sous-titre orienté bénéfice client</b><br><br>Suite de l'argumentaire commercial...
- **Règles :** Ne pas utiliser de balises complexes (pas de table, pas de style inline, pas de h1/h2, pas de script). Uniquement <b>, <br>, <p>.

### Champ 4 : Caractéristiques principales (features)
- **Rôle :** Puces essentielles et synthétiques mises en valeur dans la section "Caractéristiques principales" du site.
- **Format :** Une liste de 6 à 10 éléments textuels concis (sans tirets de début, phrases brèves et informatives).
- **Contenu :** Les spécifications marquantes, technologies intégrées et atouts ergonomiques.

### Champ 5 : Fiche technique (specifications)
- **Rôle :** Tableau de spécifications détaillées affiché dans l'onglet "FICHE TECHNIQUE".
- **Format :** Paires structurées Clé: Valeur (JSON objet ou texte clé-valeur avec ordre logique).
- **Clés standardisées :** "Désignation", "Marque", "Modèle", "Type", "Processeur", "Mémoire RAM", "Stockage", "Écran", "Résolution", "Connectivité", "Batterie", "Autonomie", "Dimensions", "Poids", "Couleur", "Compatibilité", "Alimentation", "Garantie".
- **Valeurs précises avec unités :** Respecter les conventions standard ("15 000 mAh", "8 Go", "256 Go SSD", "3840 × 2160 pixels (4K)", "166 min", "Oui", "Non").

## 3. RÈGLE D'OR : INTÉGRITÉ ET ANTI-HALLUCINATION
- **NE JAMAIS INVENTER** une caractéristique technique absente des données fournies (puissance, dimensions, autonomie chiffrée, compatibilité exacte non vérifiée).
- Si une information technique est incertaine ou inconnue, **ne pas la deviner** : la laisser absente ou indiquer une valeur prudente déduite du nom du modèle certifié.
- Ne pas répéter les mêmes phrases mot pour mot entre la description courte, la description classique et les caractéristiques.
`;
