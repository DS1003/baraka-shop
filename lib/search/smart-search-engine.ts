/**
 * SMART SEARCH ENGINE - BARAKA SHOP
 * Algorithme de recherche intelligent inspiré de Google :
 * 1. Normalisation sans accents & lemmatisation français
 * 2. Tolérance aux fautes de frappe (Levenshtein / Phonétique) & Suggestion "Did you mean"
 * 3. Gestion multi-termes dans le désordre (Out-of-order multi-token)
 * 4. Graphe de synonymes High-Tech & Électroménager
 * 5. Détection d'intention (Équipement principal vs Consommables / Accessoires)
 * 6. Scoring multidimensionnel de pertinence avec diversité de résultats
 * 7. Surlignage dynamique des termes correspondants (Highlighting)
 */

// Dictionnaire étendu de synonymes High-Tech, Bureautique & Électroménager
const SYNONYMS_GRAPH: Record<string, string[]> = {
    'pc': ['ordinateur', 'laptop', 'portable', 'desktop'],
    'ordi': ['ordinateur', 'laptop', 'portable', 'pc'],
    'ordinateur': ['pc', 'laptop', 'portable', 'desktop', 'bureau'],
    'laptop': ['ordinateur', 'pc', 'portable', 'notebook'],
    'portable': ['ordinateur', 'pc', 'laptop', 'smartphone', 'telephone'],
    'imprimante': ['multifonction', 'print', 'scanner', 'copieur', 'laserjet', 'ecotank', 'tank'],
    'multifonction': ['imprimante', 'scanner', 'copieur'],
    'tank': ['ecotank', 'megatank', 'smart tank', 'imprimante', 'reservoir', 'encre'],
    'ecotank': ['tank', 'imprimante', 'encre', 'epson', 'reservoir'],
    'megatank': ['tank', 'imprimante', 'canon', 'reservoir'],
    'smart tank': ['tank', 'imprimante', 'hp', 'reservoir'],
    'encre': ['cartouche', 'toner', 'bouteille', 'consommable', 'recharge'],
    'cartouche': ['encre', 'toner', 'bouteille', 'consommable'],
    'toner': ['encre', 'cartouche', 'laser', 'laserjet'],
    'bouteille': ['encre', 'ecotank', 'tank', 'recharge'],
    'recharge': ['bouteille', 'encre', 'cartouche'],
    'telephone': ['smartphone', 'mobile', 'tel', 'cellulaire', 'iphone', 'galaxy'],
    'smartphone': ['telephone', 'mobile', 'tel', 'iphone', 'galaxy'],
    'tel': ['telephone', 'smartphone', 'mobile'],
    'iphone': ['apple', 'telephone', 'smartphone', 'ios'],
    'galaxy': ['samsung', 'telephone', 'smartphone', 'android'],
    'tv': ['televiseur', 'television', 'ecran', 'smart tv', 'led', 'qled', 'oled'],
    'tele': ['televiseur', 'television', 'tv', 'ecran'],
    'television': ['tv', 'televiseur', 'ecran', 'smart tv'],
    'televiseur': ['tv', 'television', 'ecran'],
    'ecran': ['moniteur', 'display', 'dalle', 'tv'],
    'moniteur': ['ecran', 'display', 'monitor'],
    'clim': ['climatiseur', 'split', 'air flux', 'ventilation'],
    'climatiseur': ['clim', 'split', 'air flux', 'inverter'],
    'split': ['clim', 'climatiseur', 'air flux'],
    'frigo': ['refrigerateur', 'congelateur', 'froid'],
    'refrigerateur': ['frigo', 'congelateur', 'froid'],
    'congelateur': ['frigo', 'refrigerateur'],
    'baffle': ['enceinte', 'haut-parleur', 'soundbar', 'bluetooth', 'boomer', 'audio'],
    'enceinte': ['baffle', 'haut-parleur', 'soundbar', 'bluetooth', 'audio', 'jbl'],
    'ecouteur': ['casque', 'airpods', 'earbuds', 'headset', 'audio', 'sans fil'],
    'ecouteurs': ['casque', 'airpods', 'earbuds', 'headset', 'audio'],
    'casque': ['ecouteur', 'ecouteurs', 'audio', 'headset', 'micro-casque'],
    'airpods': ['ecouteur', 'apple', 'earbuds', 'sans fil'],
    'cable': ['cordon', 'fil', 'connectique', 'hdmi', 'usb', 'type-c'],
    'chargeur': ['adaptateur', 'secteur', 'alimentation', 'cable', 'fast charge'],
    'batterie': ['powerbank', 'accu', 'pile', 'externe', 'chargeur'],
    'powerbank': ['batterie', 'batterie externe', 'chargeur portable'],
    'disque': ['disque dur', 'ssd', 'hdd', 'stockage', 'externe'],
    'ssd': ['disque', 'stockage', 'nvme', 'm2', 'disque dur'],
    'souris': ['mouse', 'clavier', 'peripherique', 'sans fil'],
    'clavier': ['keyboard', 'souris', 'peripherique']
};

// Lexique de référence pour la correction orthographique (Did you mean)
const REFERENCE_LEXICON = [
    // Marques phares
    'epson', 'hp', 'canon', 'samsung', 'apple', 'lenovo', 'dell', 'asus', 'acer', 
    'sony', 'jbl', 'xiaomi', 'huawei', 'tecno', 'infinix', 'philips', 'lg', 'hisense', 
    'tcl', 'logitech', 'sandisk', 'kingston', 'brother', 'kyocera', 'bose',
    // Produits & Familles
    'ecotank', 'tank', 'laserjet', 'smart tank', 'megatank', 'imprimante', 'multifonction',
    'consommables', 'cartouche', 'toner', 'encre', 'bouteille',
    'ordinateur', 'portable', 'laptop', 'desktop', 'macbook', 'thinkpad', 'pavilion', 
    'latitude', 'aspire', 'zenbook', 'probook', 'elitebook',
    'smartphone', 'telephone', 'galaxy', 'iphone', 'redmi',
    'televiseur', 'television', 'ecran', 'moniteur', 'smart tv',
    'climatiseur', 'split', 'inverter', 'refrigerateur', 'congelateur',
    'enceinte', 'baffle', 'ecouteurs', 'casque', 'airpods',
    'chargeur', 'batterie', 'powerbank', 'cable', 'adaptateur', 'souris', 'clavier', 'disque'
];

// Mots d'arrêt français ignorés lorsqu'ils accompagnent d'autres termes
const STOP_WORDS = new Set([
    'de', 'la', 'le', 'les', 'des', 'du', 'un', 'une', 'pour', 'avec', 'et', 'en', 'au', 'aux', 'par', 'sur'
]);

/**
 * Normalise une chaîne de caractères :
 * - Suppression des accents et diacritiques (é -> e, ô -> o)
 * - Minuscules
 * - Nettoyage des apostrophes et caractères spéciaux
 */
export function normalizeText(str: string): string {
    if (!str) return '';
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/['’]/g, ' ')
        .replace(/[^a-z0-9\s-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Découpe une requête utilisateur en tokens significatifs
 */
export function tokenizeQuery(query: string): string[] {
    const normalized = normalizeText(query);
    if (!normalized) return [];

    const rawTokens = normalized.split(/[\s-]+/).filter(t => t.length > 0);
    
    // Si la requête a plusieurs mots, filtrer les petits mots de liaison (stop words)
    if (rawTokens.length > 1) {
        const filtered = rawTokens.filter(t => !STOP_WORDS.has(t));
        return filtered.length > 0 ? filtered : rawTokens;
    }

    return rawTokens;
}

/**
 * Calcule la distance de Levenshtein entre deux mots
 */
export function levenshteinDistance(a: string, b: string): number {
    if (a === b) return 0;
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // suppression
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

/**
 * Détecte une faute de frappe et suggère la meilleure correction orthographique (Did you mean)
 */
export function findTypoCorrection(token: string): string | null {
    if (token.length < 3) return null;
    
    // Si le token est déjà un mot valide du lexique, pas de correction requise
    if (REFERENCE_LEXICON.includes(token)) return null;

    let bestMatch: string | null = null;
    let minDistance = 999;

    for (const ref of REFERENCE_LEXICON) {
        // Optimisation de longueur
        if (Math.abs(ref.length - token.length) > 2) continue;

        const dist = levenshteinDistance(token, ref);
        const maxAllowed = token.length <= 4 ? 1 : 2;

        if (dist <= maxAllowed && dist < minDistance) {
            minDistance = dist;
            bestMatch = ref;
        }
    }

    return bestMatch;
}

/**
 * Analyse globale d'une requête et propose une suggestion "Did you mean"
 */
export function getDidYouMeanSuggestion(query: string): string | null {
    const tokens = tokenizeQuery(query);
    if (tokens.length === 0) return null;

    let hasCorrection = false;
    const correctedTokens = tokens.map(t => {
        const typo = findTypoCorrection(t);
        if (typo && typo !== t) {
            hasCorrection = true;
            return typo;
        }
        return t;
    });

    if (hasCorrection) {
        return correctedTokens.join(' ');
    }
    return null;
}

/**
 * Récupère les synonymes pertinents pour une liste de tokens
 */
export function expandSynonyms(tokens: string[]): string[] {
    const expanded = new Set<string>();

    for (const token of tokens) {
        expanded.add(token);
        if (SYNONYMS_GRAPH[token]) {
            for (const syn of SYNONYMS_GRAPH[token]) {
                expanded.add(syn);
            }
        }
    }

    return Array.from(expanded);
}

/**
 * Détecte l'intention principale de la recherche :
 * - EQUIPMENT : Ordinateurs, Imprimantes, Écrans, Téléphones, Climatiseurs...
 * - CONSUMABLE : Encres, Toners, Cartouches, Bouteilles, Papiers...
 * - ACCESSORY : Câbles, Adaptateurs, Housses...
 * - NEUTRAL : Mots génériques ("tank", "epson", "samsung", "pro", "sans fil")
 */
export type SearchIntent = 'EQUIPMENT' | 'CONSUMABLE' | 'ACCESSORY' | 'NEUTRAL';

export function detectSearchIntent(query: string): SearchIntent {
    const norm = normalizeText(query);
    const tokens = tokenizeQuery(query);

    const consumableKeywords = ['encre', 'cartouche', 'toner', 'bouteille', 'recharge', 'cyan', 'magenta', 'jaune', 'noir', 'yellow', 'black', 'consommable', 'papier', 'ruban', '103', '003', '664', '85a', '05a'];
    const equipmentKeywords = ['imprimante', 'multifonction', 'ordinateur', 'pc', 'laptop', 'macbook', 'television', 'tv', 'televiseur', 'split', 'clim', 'climatiseur', 'frigo', 'refrigerateur', 'smartphone', 'telephone'];
    const accessoryKeywords = ['cable', 'chargeur', 'adaptateur', 'coque', 'pochette', 'support', 'connectique'];

    if (tokens.some(t => consumableKeywords.includes(t)) || /bouteille\s+d'?encre/i.test(norm)) {
        return 'CONSUMABLE';
    }
    if (tokens.some(t => equipmentKeywords.includes(t))) {
        return 'EQUIPMENT';
    }
    if (tokens.some(t => accessoryKeywords.includes(t))) {
        return 'ACCESSORY';
    }

    return 'NEUTRAL';
}

/**
 * Moteur de calcul de score de pertinence multidimensionnel Google-like
 */
export function calculateProductRelevanceScore(
    product: any,
    query: string,
    queryTokens: string[],
    intent: SearchIntent
): number {
    let score = 0;

    const normQuery = normalizeText(query);
    const normName = normalizeText(product.name || '');
    const normBrand = normalizeText(product.brand?.name || '');
    const normCategory = normalizeText(product.category?.name || '');
    const normSubCategory = normalizeText(product.subCategory?.name || '');
    const normRef = normalizeText(product.reference || '');
    const normShortDesc = normalizeText(product.shortDescription || '');

    // 1. EXACT & PREFIX TITLE MATCH (Bonus maximal)
    if (normName === normQuery) {
        score += 1500;
    } else if (normName.startsWith(normQuery)) {
        score += 800;
    } else if (normName.includes(normQuery)) {
        score += 500;
    }

    // 2. REFERENCE / SKU MATCH (Recherche précise)
    if (normRef && normQuery.length >= 3) {
        if (normRef === normQuery) {
            score += 1200;
        } else if (normRef.includes(normQuery)) {
            score += 600;
        }
    }

    // 3. TOKEN COVERAGE DANS LE TITRE
    let nameTokenMatches = 0;
    for (const token of queryTokens) {
        // Correspondance de mot entier (\btoken\b)
        const wordRegex = new RegExp(`\\b${token}\\b`, 'i');
        if (wordRegex.test(normName)) {
            score += 250;
            nameTokenMatches++;
        } else if (normName.includes(token)) {
            score += 120;
            nameTokenMatches++;
        }
    }

    // Si tous les termes sont présents dans le titre
    if (queryTokens.length > 1 && nameTokenMatches === queryTokens.length) {
        score += 400;
    }

    // 4. CORRESPONDANCE MARQUE & CATÉGORIE
    for (const token of queryTokens) {
        if (normBrand.includes(token)) {
            score += 300;
        }
        if (normCategory.includes(token) || normSubCategory.includes(token)) {
            score += 200;
        }
    }

    // 5. INTENT ARBITRATION (Le problème de "tank" dans Baraka Shop !)
    // Si la recherche est un mot générique comme "tank" / "ecotank" :
    // Une machine / équipement (ex: Imprimante Epson EcoTank L5290 à 210.000 FCFA)
    // est l'intention principale d'achat d'équipement, tandis que les 4 bouteilles d'encre
    // sont des consommables.
    const isPrinterDevice = /imprimante|multifonction|scanner|l\d{4}|l\d{3}|l5290|l3250|l3210/i.test(normName) ||
        /informatique|bureautique|imprimante/i.test(normCategory + ' ' + normSubCategory);

    const isConsumable = /consommables|encre|bouteille|cartouche|toner|ruban/i.test(normCategory + ' ' + normSubCategory) ||
        /bouteille|cartouche|103|003|664/i.test(normName);

    if (intent === 'EQUIPMENT') {
        if (isPrinterDevice) score += 500;
        if (isConsumable) score -= 100;
    } else if (intent === 'CONSUMABLE') {
        if (isConsumable) score += 500;
        if (isPrinterDevice) score -= 50;
    } else if (intent === 'NEUTRAL') {
        // En recherche neutre comme "tank", booster l'appareil principal pour qu'il soit en tête,
        // tout en laissant une place d'honneur au meilleur consommable !
        if (isPrinterDevice) {
            score += 350;
        }
        // Éviter de suroccuper avec 10 déclinaisons de couleur identiques :
        // Le prix supérieur à 50.000 FCFA indique souvent l'équipement complet plutôt qu'une fiole d'encre à 8.000 FCFA
        if (product.price && product.price > 50000 && isPrinterDevice) {
            score += 200;
        }
    }

    // 6. DISPONIBILITÉ EN STOCK (Un produit en stock passe toujours avant une rupture)
    if (product.stock > 0) {
        score += 150;
    } else {
        score -= 200;
    }

    // 7. DESCRIPTION COURTE & CARACTÉRISTIQUES
    for (const token of queryTokens) {
        if (normShortDesc.includes(token)) {
            score += 40;
        }
    }

    // 8. POPULARITÉ (Ventes & Avis si disponibles)
    if (Array.isArray(product.orderItems)) {
        score += Math.min(60, product.orderItems.length * 5);
    }
    if (Array.isArray(product.reviews)) {
        score += Math.min(40, product.reviews.length * 4);
    }

    return score;
}

/**
 * Diversifie intelligemment les résultats pour éviter d'afficher 5 fois le même consommable en plusieurs couleurs
 * (ex: Cyan, Magenta, Jaune, Jaune, Cyan) au détriment des équipements.
 */
export function diversifySearchResults(scoredProducts: { product: any; score: number }[], limit: number = 5): any[] {
    if (scoredProducts.length <= limit) {
        return scoredProducts.map(sp => sp.product);
    }

    const selected: any[] = [];
    const seenBaseTitles = new Set<string>();

    // 1. D'abord insérer les meilleurs scores en veillant à la variété
    for (const item of scoredProducts) {
        if (selected.length >= limit) break;

        const p = item.product;
        // Détecter un titre de base en retirant la couleur ou numéro de variation (Magenta, Cyan, Jaune, Black, etc.)
        const baseTitle = normalizeText(p.name || '')
            .replace(/\b(magenta|cyan|jaune|yellow|black|noir)\b/gi, '')
            .trim();

        // Si nous avons déjà un produit très similaire de cette série, on le pénalise légèrement pour laisser place à la machine
        if (seenBaseTitles.has(baseTitle) && selected.length < limit - 1) {
            continue;
        }

        seenBaseTitles.add(baseTitle);
        selected.push(p);
    }

    // 2. Si le quota n'est pas rempli après filtrage de variété, compléter avec les suivants
    if (selected.length < limit) {
        for (const item of scoredProducts) {
            if (selected.length >= limit) break;
            if (!selected.some(sel => sel.id === item.product.id)) {
                selected.push(item.product);
            }
        }
    }

    return selected;
}

/**
 * Surligne les correspondances dans un texte avec un HTML propre pour l'affichage Google-like
 */
export function highlightTextMatch(text: string, query: string): string {
    if (!text || !query) return text || '';

    const tokens = tokenizeQuery(query);
    if (tokens.length === 0) return text;

    // Échapper les caractères spéciaux regex
    const escapedTokens = tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const pattern = new RegExp(`(${escapedTokens.join('|')})`, 'gi');

    return text.replace(pattern, '<b class="text-primary font-black">$1</b>');
}
