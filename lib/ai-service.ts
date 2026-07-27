import { GoogleGenAI } from "@google/genai";

// Initialize the Google Gen AI SDK
// It will automatically use the GEMINI_API_KEY environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function normalizeProductSpecs(rawText: string): Promise<string> {
    if (!rawText || rawText.trim() === '') {
        return '';
    }

    const systemInstruction = `Tu es un assistant expert en e-commerce spécialisé dans le formatage de fiches techniques de produits high-tech.
Ta mission est de prendre une fiche technique brute (souvent copiée-collée depuis des sites comme LDLC, Fnac, Amazon) et de la nettoyer, la normaliser et la formater parfaitement.

RÈGLES STRICTES ET OBLIGATOIRES :
1. FORMAT DE SORTIE : Tu dois renvoyer UNIQUEMENT des paires "Clé: Valeur", une par ligne. AUCUN texte avant, AUCUN texte après. AUCUN Markdown (pas de \`\`\`, pas de gras, pas d'italique). Aucun format JSON. Uniquement le texte brut final.
2. NETTOYAGE : Supprime toutes les lignes vides, les titres de section inutiles (ex: "Spécifications techniques", "Caractéristiques principales", "Informations générales", "Description"), et les séparateurs.
3. DÉDUPLICATION : Si une valeur est répétée à tort (ex: "LogitechLogitech"), corrige-la ("Logitech").
4. TRADUCTION & NORMALISATION DES CLÉS :
   - "Brand" -> "Marque"
   - "Model" -> "Modèle"
   - "Color" -> "Couleur"
   - "Wireless" -> "Sans-fil"
   - "Weight" -> "Poids"
   - "Video Resolution" -> "Résolution vidéo"
   - "Horizontal Field of View" ou "Angle de vision" -> "Angle de vision (horizontal)"
   - "Microphone" -> "Microphone intégré"
5. NORMALISATION DES VALEURS :
   - "Yes", "TRUE", "Oui" -> "Oui"
   - "No", "False", "Non" -> "Non"
   - "Black" -> "Noir"
   - "White" -> "Blanc"
   - "Grey" -> "Gris"
   - "3840 x 2160" ou "3840x2160" -> "3840 × 2160 pixels (4K Ultra HD)"
   - "1920 x 1080" ou "1920x1080" -> "1920 × 1080 pixels (Full HD)"
   - "1280 x 720" ou "1280x720" -> "1280 × 720 pixels (HD 720p)"
6. NE JAMAIS INVENTER : Ne complète une information que si elle découle directement de la valeur (comme l'ajout de "4K Ultra HD" pour "3840x2160"). N'invente jamais de caractéristiques qui ne sont pas dans le texte d'origine.

Exemple d'entrée :
Spécifications techniques
Brand
Logitech
Color
Black
Resolution
1920 x 1080

Sortie attendue :
Marque: Logitech
Couleur: Noir
Résolution: 1920 × 1080 pixels (Full HD)
`;

    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
        try {
            const response = await ai.models.generateContent({
                model: modelName,
                contents: rawText,
                config: {
                    systemInstruction: systemInstruction,
                    temperature: 0.1,
                }
            });

            if (response.text) {
                return response.text.trim();
            }
        } catch (error) {
            console.warn(`[AI Service] Échec avec le modèle ${modelName}:`, error);
            lastError = error;
        }
    }

    throw lastError || new Error("Aucune réponse générée par l'IA.");
}

export async function normalizeProductSpecsStream(rawText: string) {
    if (!rawText || rawText.trim() === '') {
        throw new Error("Texte brut manquant");
    }

    const systemInstruction = `Tu es un assistant expert en e-commerce spécialisé dans le formatage de fiches techniques de produits high-tech.
Ta mission est de prendre une fiche technique brute (souvent copiée-collée depuis des sites comme LDLC, Fnac, Amazon) et de la nettoyer, la normaliser et la formater parfaitement.

RÈGLES STRICTES ET OBLIGATOIRES :
1. FORMAT DE SORTIE : Tu dois renvoyer UNIQUEMENT des paires "Clé: Valeur", une par ligne. AUCUN texte avant, AUCUN texte après. AUCUN Markdown (pas de \`\`\`, pas de gras, pas d'italique). Aucun format JSON. Uniquement le texte brut final.
2. NETTOYAGE : Supprime toutes les lignes vides, les titres de section inutiles (ex: "Spécifications techniques", "Caractéristiques principales", "Informations générales", "Description"), et les séparateurs.
3. DÉDUPLICATION : Si une valeur est répétée à tort (ex: "LogitechLogitech"), corrige-la ("Logitech").
4. TRADUCTION & NORMALISATION DES CLÉS :
   - "Brand" -> "Marque"
   - "Model" -> "Modèle"
   - "Color" -> "Couleur"
   - "Wireless" -> "Sans-fil"
   - "Weight" -> "Poids"
   - "Video Resolution" -> "Résolution vidéo"
   - "Horizontal Field of View" ou "Angle de vision" -> "Angle de vision (horizontal)"
   - "Microphone" -> "Microphone intégré"
5. NORMALISATION DES VALEURS :
   - "Yes", "TRUE", "Oui" -> "Oui"
   - "No", "False", "Non" -> "Non"
   - "Black" -> "Noir"
   - "White" -> "Blanc"
   - "Grey" -> "Gris"
   - "3840 x 2160" ou "3840x2160" -> "3840 × 2160 pixels (4K Ultra HD)"
   - "1920 x 1080" ou "1920x1080" -> "1920 × 1080 pixels (Full HD)"
   - "1280 x 720" ou "1280x720" -> "1280 × 720 pixels (HD 720p)"
6. NE JAMAIS INVENTER : Ne complète une information que si elle découle directement de la valeur (comme l'ajout de "4K Ultra HD" pour "3840x2160"). N'invente jamais de caractéristiques qui ne sont pas dans le texte d'origine.`;

    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
        try {
            const responseStream = await ai.models.generateContentStream({
                model: modelName,
                contents: rawText,
                config: {
                    systemInstruction: systemInstruction,
                    temperature: 0.1,
                }
            });

            return responseStream;
        } catch (error) {
            console.warn(`[AI Service Stream] Échec avec le modèle ${modelName}:`, error);
            lastError = error;
        }
    }

    throw lastError || new Error("Erreur lors de la normalisation en streaming.");
}
