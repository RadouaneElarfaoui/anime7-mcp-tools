import { FacebookService } from '../services/facebook.js';
import { AnimeService } from '../services/anime.js';
import { TranslationService } from '../services/translation.js';
import { InstructionsService } from '../services/instructions.js';
import { AnimePost, Episode } from '../types/index.js';
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { resourceTools } from './resource_tools.js';

// Nos outils pour Facebook - à améliorer au fur et à mesure
const facebookTools = [
  {
    name: "fbGetPagePosts",
    description: "Récupère les posts de notre page Facebook (limite 100 max)",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "integer",
          description: "Nombre de posts à récupérer (10 par défaut)",
          default: 10,
        },
        after: {
          type: "string",
          description: "Curseur 'après' pour pagination",
        },
        before: {
          type: "string",
          description: "Curseur 'avant' pour pagination",
        },
        since: {
          type: "string",
          description: "Timestamp ou date de début",
        },
        until: {
          type: "string",
          description: "Timestamp ou date de fin",
        },
      },
      required: [],
    },
    handler: async (args: any) => {
      // Pourrait être optimisé mais ça marche
      const facebookService = FacebookService.getInstance();
      const result = await facebookService.getPagePosts(
        args.limit,
        args.after,
        args.before,
        args.since,
        args.until
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  },
  {
    name: "fbGetPostComments",
    description: "Voir les commentaires sur un post FB - utile pour le support client",
    inputSchema: {
      type: "object",
      properties: {
        postId: {
          type: "string",
          description: "ID du post Facebook",
        },
        limit: {
          type: "integer",
          description: "Nombre de commentaires (25 par défaut)",
          default: 25,
        },
        after: {
          type: "string",
          description: "Curseur pour voir plus de commentaires",
        },
      },
      required: ["postId"],
    },
    handler: async (args: any) => {
      const facebookService = FacebookService.getInstance();
      const result = await facebookService.getPostComments(
        args.postId,
        args.limit,
        args.after
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  },
  {
    name: "fbDeleteComment",
    description: "Supprimer un commentaire indésirable (spam, etc.)",
    inputSchema: {
      type: "object",
      properties: {
        commentId: {
          type: "string",
          description: "ID du commentaire à supprimer",
        },
        confirm: {
          type: "boolean",
          description: "Confirmation requise (mettre à true)",
          default: false,
        },
      },
      required: ["commentId", "confirm"],
    },
    handler: async (args: any) => {
      if (!args.confirm) {
        throw new McpError(
          ErrorCode.InvalidParams,
          "Tu dois confirmer la suppression (confirm=true)"
        );
      }

      const facebookService = FacebookService.getInstance();
      const result = await facebookService.deleteComment(args.commentId);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  }
];

// Tools pour les opérations d'anime
const animeTools = [
  {
    name: "fbPostAnime",
    description: "Publier des informations d'anime sur Facebook avec image. Retourne un objet contenant postId et postUrl nécessaires pour l'ajout d'épisodes.",
    inputSchema: {
      type: "object",
      properties: {
        animeData: {
          type: "object",
          description: "La structure de données de l'anime",
          properties: {
            type: {
              type: "string",
              description: "Le type de publication (doit être 'anime')",
              default: "anime",
            },
            data: {
              type: "object",
              description: "Les informations de l'anime",
              properties: {
                title: {
                  type: "object",
                  description: "Les titres de l'anime en différentes langues",
                  properties: {
                    en: { type: "string", description: "Titre en anglais" },
                    jp: { type: "string", description: "Titre en japonais" },
                    ar: { type: "string", description: "Titre en arabe" },
                  },
                  required: ["en"],
                },
                description: {
                  type: "string",
                  description: "Une description de l'anime en arabe. Si non disponible, l'IA doit générer une description en arabe basée sur le titre et les informations disponibles",
                },
                info: {
                  type: "object",
                  description: "Informations sur l'anime",
                  properties: {
                    episodes: { 
                      type: "integer", 
                      description: "Nombre d'épisodes (null si inconnu)" 
                    },
                    year: { 
                      type: "integer", 
                      description: "Année de sortie (null si inconnue)" 
                    },
                    rating: { 
                      type: "number", 
                      description: "Note (null si inconnue)" 
                    },
                    genres: { 
                      type: "array", 
                      items: { type: "string" }, 
                      description: "Liste des genres" 
                    },
                    studio: { 
                      type: "string", 
                      description: "Studio de production" 
                    },
                    rank: { 
                      type: "integer", 
                      description: "Classement (null si inconnu)" 
                    },
                    status: { 
                      type: "string", 
                      description: "Statut (ex: 'Terminé', 'En cours')" 
                    },
                    type: { 
                      type: "string", 
                      description: "Type (ex: 'TV', 'MOVIE')" 
                    },
                    season: { 
                      type: "string", 
                      description: "Saison (ex: 'SPRING', 'WINTER')" 
                    },
                  },
                },
                image: {
                  type: "object",
                  description: "Informations sur l'image",
                  properties: {
                    id: { type: "string", description: "ID de l'image" },
                    url: { 
                      type: "string", 
                      description: "URL de l'image de couverture de l'anime" 
                    },
                  },
                  required: ["url"],
                },
                updatedAt: {
                  type: "string",
                  description: "Date et heure de la dernière mise à jour",
                  default: new Date().toISOString(),
                },
              },
              required: ["title", "description", "image"],
            },
          },
          required: ["type", "data"],
        },
      },
      required: ["animeData"],
    },
    handler: async (args: any) => {
      const facebookService = FacebookService.getInstance();
      const result = await facebookService.postAnime(args.animeData);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  },
  {
    name: "animeSearch",
    description: "Rechercher des informations d'anime par titre",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Le titre de l'anime à rechercher",
        },
        limit: {
          type: "integer",
          description: "Nombre maximum de résultats à retourner (par défaut: 5)",
          default: 5,
        }
      },
      required: ["title"],
    },
    handler: async (args: any) => {
      const animeService = AnimeService.getInstance();
      const results = await animeService.searchAnime(args.title, args.limit);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      };
    },
  },
  {
    name: "fbAddEpisodeComment",
    description: "Ajouter un épisode en tant que commentaire sur une publication Facebook",
    inputSchema: {
      type: "object",
      properties: {
        postId: {
          type: "string",
          description: "L'ID de la publication Facebook où ajouter le commentaire. Vous pouvez le trouver dans la réponse de l'outil post_anime_to_facebook sous le nom 'postId'", 
        },
        episode: {
          type: "object",
          description: "Les informations de l'épisode",
          properties: {
            type: {
              type: "string",
              description: "Le type (doit être 'episode')",
              enum: ["episode"],
            },
            episodeNumber: {
              type: "string",
              description: "Le numéro de l'épisode",
            },
            title: {
              type: "string",
              description: "Le titre de l'épisode",
            },
            addedBy: {
              type: "string",
              description: "Le nom de la personne qui a ajouté l'épisode",
            },
            duration: {
              type: "string",
              description: "La durée de l'épisode en minutes",
            },
            isFiller: {
              type: "boolean",
              description: "Indique si l'épisode est un filler",
              default: false,
            },
            servers: {
              type: "array",
              description: "La liste des serveurs où l'épisode est disponible",
              items: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "Le nom du serveur",
                    default: "facebook",
                  },
                  quality: {
                    type: "string",
                    description: "La qualité de la vidéo (ex: 'HD'(par défaut), 'SD', 'FHD'.)",
                    default: "HD",
                  },
                  url: {
                    type: "string",
                    description: "L'URL de la vidéo (format obligatoire: [...].facebook.com/XXXXXXXXXX/videos/XXXXXXXXXX/)",
                    pattern: "^.+\\.facebook\\.com/\\d+/videos/\\d+/?$"
                  },
                  type: {
                    type: "string",
                    description: "Le type de serveur (ex: 'facebook', 'youtube', etc.)",
                    enum: ["facebook", "youtube", "dailymotion", "other"]
                  },
                },
                required: ["name", "quality", "url", "type"],
              },
              minItems: 1,
            },
            releaseDate: {
              type: "string",
              description: "La date de sortie de l'épisode",
              format: "date-time",
            },
          },
          required: [
            "type",
            "episodeNumber",
            "title",
            "addedBy",
            "duration",
            "isFiller",
            "servers",
            "releaseDate",
          ],
        },
      },
      required: ["postId", "episode"],
    },
    handler: async (args: any) => {
      const facebookService = FacebookService.getInstance();
      const result = await facebookService.addEpisodeComment(args.postId, args.episode);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  },
];

// Tool pour la traduction
const translationTool = {
    name: "translateText",
    description: "Traduire un texte vers une langue cible en utilisant l'API Gemini",
    inputSchema: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "Le texte à traduire",
        },
        targetLanguage: {
          type: "string",
          description: "La langue cible de la traduction (ex: 'français', 'anglais', 'arabe', etc.)",
        },
        sourceLanguage: {
          type: "string",
          description: "La langue source du texte (optionnel, si non spécifié, la langue sera détectée automatiquement)",
        },
        isAnimeTitle: {
          type: "boolean",
          description: "Indique si le texte est un titre d'anime, pour une traduction sémantique plutôt qu'une translittération (par défaut: auto-détecté)",
        }
      },
      required: ["text", "targetLanguage"],
    },
    handler: async (args: any) => {
      const translationService = TranslationService.getInstance();
      const result = await translationService.translateText({
        text: args.text,
        targetLanguage: args.targetLanguage,
        sourceLanguage: args.sourceLanguage,
        isAnimeTitle: args.isAnimeTitle
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
};

// Combinaison de tous les outils
export const tools = [
  ...facebookTools,
  ...animeTools,
  translationTool
];

// Exporter tous les outils
export const allTools = [...tools, ...resourceTools];