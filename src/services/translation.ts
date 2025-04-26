import axios, { AxiosError } from 'axios';
import { GEMINI_API_URL, GEMINI_API_KEY } from '../config/index.js';
import { TranslationRequest, TranslationResponse } from '../types/index.js';
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

export class TranslationService {
  private static instance: TranslationService;

  private constructor() {}

  public static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService();
    }
    return TranslationService.instance;
  }

  public async translateText(request: TranslationRequest): Promise<TranslationResponse> {
    if (!GEMINI_API_KEY) {
      throw new McpError(ErrorCode.InvalidParams, "La clé API Gemini n'est pas définie");
    }

    const { text, targetLanguage, sourceLanguage, isAnimeTitle } = request;
    
    if (!text || !targetLanguage) {
      throw new McpError(ErrorCode.InvalidParams, "Le texte et la langue cible sont requis");
    }

    try {
      // Construire un prompt adapté à la traduction
      const promptText = this.buildTranslationPrompt(text, targetLanguage, sourceLanguage, isAnimeTitle);
      
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              role: "user",
              parts: [{ text: promptText }]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
            responseMimeType: "application/json"
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Analyser la réponse JSON
      const translationResult = this.parseGeminiResponse(response.data);
      
      return {
        translatedText: translationResult.translatedText,
        detectedLanguage: translationResult.detectedLanguage
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  private buildTranslationPrompt(
    text: string, 
    targetLanguage: string, 
    sourceLanguage?: string, 
    isAnimeTitle?: boolean
  ): string {
    // Détecter automatiquement si c'est probablement un titre d'anime
    if (isAnimeTitle === undefined) {
      isAnimeTitle = this.isProbablyAnimeTitle(text);
    }

    let prompt = `Traduis le texte suivant`;
    
    if (sourceLanguage) {
      prompt += ` du ${sourceLanguage}`;
    }
    
    prompt += ` vers le ${targetLanguage}.\n\n`;
    
    if (isAnimeTitle) {
      prompt += `IMPORTANT: Il s'agit d'un titre d'anime/manga. Ne fais PAS de simple translittération phonétique. 
Traduis le SENS du titre en ${targetLanguage}, pas seulement les sons.

Exemples de traductions correctes:
- "Vinland Saga" → "ملحمة فينلاندا" (L'épopée de Vinland, pas "فينلاند ساغا")
- "Attack on Titan" → "هجوم العمالقة" (L'attaque des Titans, pas "أتاك أون تايتن")
- "Death Note" → "مذكرة الموت" (Le carnet de la mort, pas "ديث نوت")
- "One Piece" → "القطعة الواحدة" (La pièce unique, pas "ون بيس")
- "My Hero Academia" → "أكاديميتي للأبطال" (Mon académie des héros, pas "ماي هيرو أكاديميا")

Si le titre contient des noms propres ou des lieux, conserve-les dans la transcription arabe appropriée.
\n\n`;
    }

    prompt += `Texte à traduire:\n"""${text}"""\n\n`;

    if (targetLanguage.toLowerCase().includes('arabe') || targetLanguage.toLowerCase() === 'ar') {
      prompt += `Instructions spécifiques pour l'arabe:
1. Utilise l'arabe standard moderne, compréhensible dans tous les pays arabes.
2. Pour les concepts culturels japonais sans équivalent direct, utilise une traduction qui capture l'essence et le sens.
3. Évite les expressions trop locales d'un seul pays arabe.
4. Adapte les métaphores et expressions idiomatiques au contexte culturel arabe.
\n\n`;
    }

    prompt += `Instructions complémentaires:
1. Ne conserve que le texte traduit sans commentaires ni explications.
2. Préserve la mise en forme, les sauts de ligne et la ponctuation du texte original.
3. Réponds au format JSON suivant:
{
  "translatedText": "le texte traduit ici",
  "detectedLanguage": "la langue source détectée (si non spécifiée)"
}\n`;

    return prompt;
  }

  // Fonction pour détecter si le texte est probablement un titre d'anime
  private isProbablyAnimeTitle(text: string): boolean {
    // Si le texte est court et contient peu de mots, c'est probablement un titre
    if (text.length < 50 && text.split(' ').length < 8) {
      return true;
    }
    
    // Liste de mots-clés qui apparaissent souvent dans les titres d'animes
    const animeKeywords = [
      'saga', 'chronicles', 'story', 'adventure', 'tale', 'legend',
      'academy', 'school', 'world', 'project', 'blade', 'dragon',
      'hero', 'warrior', 'knight', 'princess', 'prince', 'king', 'queen',
      'rebirth', 'reincarnation', 'isekai', 'slayer', 'hunter', 'magical',
      'fantasy', 'piece', 'note', 'academia', 'titan', 'alchemist', 'geass'
    ];
    
    // Vérifie si le texte contient un de ces mots-clés
    const lowerText = text.toLowerCase();
    for (const keyword of animeKeywords) {
      if (lowerText.includes(keyword)) {
        return true;
      }
    }
    
    return false;
  }

  private parseGeminiResponse(geminiResponse: any): TranslationResponse {
    try {
      // Extraire le texte de la réponse
      const responseText = geminiResponse.candidates[0].content.parts[0].text;
      
      // Essayer de parser le JSON
      try {
        const parsedJson = JSON.parse(responseText);
        return {
          translatedText: parsedJson.translatedText,
          detectedLanguage: parsedJson.detectedLanguage
        };
      } catch (jsonError) {
        // Si la réponse n'est pas un JSON valide, considérer le texte entier comme la traduction
        return {
          translatedText: responseText,
          detectedLanguage: undefined
        };
      }
    } catch (error) {
      console.error("Erreur lors de l'analyse de la réponse Gemini:", error);
      throw new McpError(
        ErrorCode.InternalError,
        "La réponse de l'API de traduction est invalide"
      );
    }
  }

  private handleError(error: any): never {
    console.error("Translation API error:", error);
    if (error instanceof AxiosError) {
      throw new McpError(
        ErrorCode.InternalError,
        `Erreur lors de la traduction: ${error.response?.data?.error?.message || error.message}`
      );
    }
    throw new McpError(
      ErrorCode.InternalError,
      `Une erreur inattendue s'est produite: ${String(error)}`
    );
  }
} 