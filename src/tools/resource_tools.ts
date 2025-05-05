import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { InstructionsService } from '../services/instructions.js';

// Utilitaire pour créer les objets de réponse MCP
const createContentResponse = (text: string) => {
  return {
    content: [{ type: "text", text }],
  };
};

// Schéma d'entrée vide pour les outils sans paramètres
const emptyInputSchema = {
  type: "object",
  properties: {},
  required: [],
};

// Outils pour remplacer les ressources d'add_anime_guide
export const guideAnimeVueGlobale = {
  name: "guideAnimeVueGlobale",
  description: "Obtenir une vue d'ensemble du processus d'ajout d'anime",
  inputSchema: emptyInputSchema,
  handler: async () => {
    const instructionsService = InstructionsService.getInstance();
    const content = instructionsService.getProcessOverview();
    return createContentResponse(content);
  },
};

export const guideAnimeEtapesDetaillees = {
  name: "guideAnimeEtapesDetaillees",
  description: "Obtenir les étapes détaillées pour l'ajout d'anime",
  inputSchema: emptyInputSchema,
  handler: async () => {
    const instructionsService = InstructionsService.getInstance();
    const content = instructionsService.getDetailedSteps();
    return createContentResponse(content);
  },
};

export const guideAnimeConseilsPratiques = {
  name: "guideAnimeConseilsPratiques",
  description: "Obtenir des conseils pratiques pour l'ajout d'anime",
  inputSchema: emptyInputSchema,
  handler: async () => {
    const instructionsService = InstructionsService.getInstance();
    const content = instructionsService.getPracticalTips();
    return createContentResponse(content);
  },
};

export const guideAnimeExempleComplet = {
  name: "guideAnimeExempleComplet",
  description: "Obtenir un exemple complet d'ajout d'anime et d'épisodes",
  inputSchema: emptyInputSchema,
  handler: async () => {
    const instructionsService = InstructionsService.getInstance();
    const content = instructionsService.getComprehensiveExample();
    return createContentResponse(content);
  },
};

// Nous exportons tous les outils dans un tableau
export const resourceTools = [
  guideAnimeVueGlobale,
  guideAnimeEtapesDetaillees,
  guideAnimeConseilsPratiques,
  guideAnimeExempleComplet,
]; 