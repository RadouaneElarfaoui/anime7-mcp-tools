import { InstructionsService } from '../services/instructions.js';
// Utilitaire pour créer les objets de réponse MCP
const createContentResponse = (text) => {
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
export const addAnimeProcessOverviewTool = {
    name: "getAddAnimeProcessOverview",
    description: "Obtenir une vue d'ensemble du processus d'ajout d'anime",
    inputSchema: emptyInputSchema,
    handler: async () => {
        const instructionsService = InstructionsService.getInstance();
        const content = instructionsService.getProcessOverview();
        return createContentResponse(content);
    },
};
export const addAnimeDetailedStepsTool = {
    name: "getAddAnimeDetailedSteps",
    description: "Obtenir les étapes détaillées pour l'ajout d'anime",
    inputSchema: emptyInputSchema,
    handler: async () => {
        const instructionsService = InstructionsService.getInstance();
        const content = instructionsService.getDetailedSteps();
        return createContentResponse(content);
    },
};
export const addAnimePracticalTipsTool = {
    name: "getAddAnimePracticalTips",
    description: "Obtenir des conseils pratiques pour l'ajout d'anime",
    inputSchema: emptyInputSchema,
    handler: async () => {
        const instructionsService = InstructionsService.getInstance();
        const content = instructionsService.getPracticalTips();
        return createContentResponse(content);
    },
};
export const addAnimeComprehensiveExampleTool = {
    name: "getAddAnimeComprehensiveExample",
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
    addAnimeProcessOverviewTool,
    addAnimeDetailedStepsTool,
    addAnimePracticalTipsTool,
    addAnimeComprehensiveExampleTool,
];
