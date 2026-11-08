import { GoogleGenAI } from "@google/genai";
import {
    BARAKA_EDITORIAL_GUIDELINES,
    getRelevantEditorialExamples,
    EditorialProductSample
} from "./editorial-knowledge-base";

export interface GenerateProductInput {
    id?: string;
    name: string;
    brandName?: string;
    categoryName?: string;
    subCategoryName?: string;
    categoryId?: string | null;
    brandId?: string | null;
    reference?: string;
    existingShortDescription?: string;
    existingDescription?: string;
    existingFeatures?: string[] | string;
    existingSpecs?: string | Record<string, any>;
    packageContent?: string[] | string;
    fieldsToGenerate?: ('shortDescription' | 'generalDescription' | 'classicDescription' | 'features' | 'specifications')[];
    customInstructions?: string;
}

export interface EnrichmentOutput {
    shortDescription: string;
    generalDescription: string;
    classicDescription: string;
    features: string[];
    specifications: Record<string, string>;
    rawSpecsText: string;
    modelUsed: string;
    promptTokens?: number;
    completionTokens?: number;
    estimatedCost?: number;
    generationTimeMs?: number;
}

function getAiClient(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("Clé API Gemini non configurée (GEMINI_API_KEY). Veuillez la renseigner dans les paramètres du serveur.");
    }
    return new GoogleGenAI({ apiKey });
}

/**
 * Nettoie et formate les spécifications en format texte Clé: Valeur
 */
export function formatSpecsToKeyValueText(specs: Record<string, string>): string {
    if (!specs || typeof specs !== 'object') return '';
    const entries = Object.entries(specs).filter(([k]) => k !== '_order' && k !== 'importedAt');
    return entries.map(([k, v]) => `${k}: ${v}`).join('\n');
}

/**
 * Génère l'enrichissement éditorial complet ou partiel pour une fiche produit Baraka Shop
 */
export async function generateProductEnrichment(
    input: GenerateProductInput
): Promise<EnrichmentOutput> {
    const startTime = Date.now();
    const ai = getAiClient();

    // 1. Récupération des exemples éditoriaux pertinents (Few-shot dynamique)
    const samples: EditorialProductSample[] = await getRelevantEditorialExamples(
        input.categoryId,
        input.brandId
    );

    // 2. Normalisation des données d'entrée
    const existingFeaturesList = Array.isArray(input.existingFeatures)
        ? input.existingFeatures.join('\n')
        : (input.existingFeatures || '');

    let existingSpecsText = '';
    if (typeof input.existingSpecs === 'string') {
        existingSpecsText = input.existingSpecs;
    } else if (input.existingSpecs && typeof input.existingSpecs === 'object') {
        existingSpecsText = formatSpecsToKeyValueText(input.existingSpecs);
    }

    const fieldsRequested = input.fieldsToGenerate && input.fieldsToGenerate.length > 0
        ? input.fieldsToGenerate
        : ['shortDescription', 'generalDescription', 'classicDescription', 'features', 'specifications'];

    // 3. Construction des exemples pour le prompt
    const samplesText = samples.map((s, idx) => `
--- EXEMPLE DE RÉFÉRENCE BARAKA SHOP #${idx + 1} ---
Nom du produit : ${s.name}
Marque : ${s.brand || 'Non spécifiée'}
Catégorie : ${s.category || 'High-Tech'}
1. Description courte :
${s.shortDescription || 'N/A'}
2. Description classique (HTML Baraka) :
${s.description || 'N/A'}
3. Caractéristiques principales :
${(s.features || []).map(f => `- ${f}`).join('\n')}
4. Fiche technique :
${s.specs ? Object.entries(s.specs).map(([k, v]) => `${k}: ${v}`).join('\n') : 'N/A'}
`).join('\n');

    // 4. Instructions Système et Prompt
    const systemInstruction = `${BARAKA_EDITORIAL_GUIDELINES}

Tu es l'Assistant IA Rédactionnel Officiel de Baraka Shop.
Ta mission est d'analyser les informations disponibles d'un produit et de générer une fiche produit d'un niveau professionnel irréprochable, conforme aux standards éditoriaux de Baraka Shop.

RÈGLE ABSOLUE SUR LE FORMAT DE RÉPONSE :
Tu dois répondre EXCLUSIVEMENT sous forme d'un objet JSON valide, sans balises markdown de bloc (\`\`\`json ou \`\`\`), sans texte introductif ni conclusion.
Voici la structure exacte attendue :
{
  "shortDescription": "Résumé synthétique 1 à 2 phrases pour le haut de page",
  "generalDescription": "Paragraphe fluide et élégant expliquant la proposition de valeur et les usages",
  "classicDescription": "<b>Titre accrocheur</b><br><br>Texte commercial percutant...<br><br><b>Sous-titre bénéfice</b><br><br>Argumentaire de confiance...",
  "features": [
    "Première caractéristique principale concise",
    "Deuxième caractéristique...",
    "Troisième caractéristique..."
  ],
  "specifications": {
    "Désignation": "Nom complet du produit",
    "Marque": "Nom de la marque",
    "Modèle": "Référence ou modèle",
    "Type": "Type de produit",
    "Couleur": "Couleur principale"
  }
}

ATTENTION AUX CONTRAINTES STRICTES :
1. "classicDescription" doit OBLIGATOIREMENT être au format HTML propre Baraka avec des balises <b> pour les titres et sous-titres et <br><br> pour les sauts de lignes.
2. "features" doit être un tableau de 6 à 10 chaînes courtes, sans tirets.
3. "specifications" doit contenir des clés françaises normalisées avec unités exactes.
4. Si un champ n'est pas demandé, renvoie-le vide ou identique à l'existant.
5. NE JAMAIS INVENTER de données techniques (compatibilité, dimensions, watts) si elles ne sont ni fournies ni déductibles avec certitude absolue.
`;

    const userPrompt = `
VOICI LES EXEMPLES OFFICIELS DE FICHES PRODUITS DÉJÀ VALIDÉES SUR BARAKA SHOP :
${samplesText}

============================================================
PRODUIT À ENRICHIR / GÉNÉRER :
- Nom : ${input.name}
- Marque : ${input.brandName || 'Non spécifiée'}
- Catégorie : ${input.categoryName || 'Non spécifiée'}
- Sous-catégorie : ${input.subCategoryName || 'Non spécifiée'}
- Référence : ${input.reference || 'Non spécifiée'}
${input.existingShortDescription ? `- Description courte existante : ${input.existingShortDescription}` : ''}
${input.existingDescription ? `- Description existante : ${input.existingDescription}` : ''}
${existingFeaturesList ? `- Caractéristiques existantes :\n${existingFeaturesList}` : ''}
${existingSpecsText ? `- Fiche technique / Données brutes existantes :\n${existingSpecsText}` : ''}
${input.customInstructions ? `- Instructions particulières de l'équipe : ${input.customInstructions}` : ''}

CHAMPS REQUIS À GÉNÉRER :
${fieldsRequested.map(f => `- ${f}`).join('\n')}

Génère maintenant le JSON complet contenant les contenus éditoriaux conformes aux standards Baraka Shop.
`;

    // 5. Exécution avec gestion des modèles et fallbacks
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
        try {
            const response = await ai.models.generateContent({
                model: modelName,
                contents: userPrompt,
                config: {
                    systemInstruction: systemInstruction,
                    temperature: 0.2, // Faible température pour la rigueur technique
                    responseMimeType: "application/json"
                }
            });

            const textOutput = response.text?.trim();
            if (!textOutput) {
                throw new Error("Réponse vide reçue de l'IA.");
            }

            // Nettoyage éventuel des balises markdown si le modèle en a rajouté
            let cleanedJson = textOutput;
            if (cleanedJson.startsWith("```json")) {
                cleanedJson = cleanedJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            } else if (cleanedJson.startsWith("```")) {
                cleanedJson = cleanedJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
            }

            const parsed = JSON.parse(cleanedJson);

            // Validation et fallback des clés
            const shortDesc = typeof parsed.shortDescription === 'string' ? parsed.shortDescription.trim() : '';
            const generalDesc = typeof parsed.generalDescription === 'string' ? parsed.generalDescription.trim() : '';
            const classicDesc = typeof parsed.classicDescription === 'string' ? parsed.classicDescription.trim() : '';
            const features = Array.isArray(parsed.features)
                ? parsed.features.map((f: any) => String(f).trim()).filter(Boolean)
                : [];
            const specs: Record<string, string> = (parsed.specifications && typeof parsed.specifications === 'object')
                ? parsed.specifications
                : {};

            const rawSpecsText = formatSpecsToKeyValueText(specs);
            const generationTimeMs = Date.now() - startTime;

            // Estimation indicative du coût (gemini-2.5-flash ~0.075$ / 1M tokens)
            const promptTokens = (response as any).usageMetadata?.promptTokenCount || 0;
            const completionTokens = (response as any).usageMetadata?.candidatesTokenCount || 0;
            const estimatedCost = ((promptTokens * 0.075) + (completionTokens * 0.30)) / 1_000_000;

            return {
                shortDescription: shortDesc,
                generalDescription: generalDesc,
                classicDescription: classicDesc,
                features: features,
                specifications: specs,
                rawSpecsText: rawSpecsText,
                modelUsed: modelName,
                promptTokens,
                completionTokens,
                estimatedCost,
                generationTimeMs
            };
        } catch (error: any) {
            console.warn(`[AI Enrichment Service] Tentative échouée avec ${modelName}:`, error?.message || error);
            lastError = error;
        }
    }

    throw lastError || new Error("Impossible de générer le contenu du produit via l'IA.");
}

/**
 * Régénère un champ unique spécifique pour un produit
 */
export async function regenerateSingleField(
    input: GenerateProductInput,
    fieldName: 'shortDescription' | 'generalDescription' | 'classicDescription' | 'features' | 'specifications'
): Promise<Partial<EnrichmentOutput>> {
    const singleInput: GenerateProductInput = {
        ...input,
        fieldsToGenerate: [fieldName],
        customInstructions: `${input.customInstructions || ''}\nIMPORTANT : Concentre-toi uniquement sur une reformulation de très haute qualité et originale pour le champ "${fieldName}".`
    };

    return generateProductEnrichment(singleInput);
}
