import axios, { AxiosError } from 'axios';
import { JIKAN_API_URL } from '../config/index.js';
import { AnimePost } from '../types/index.js';
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

// TODO: Ajouter filtre par genre plus tard
export class AnimeService {
  private static instance: AnimeService;
  // compteur d'appels pour debug
  private callCount = 0;

  private constructor() {
    // console.log("Service anime initialisé"); // à décommenter si besoin de debug
  }

  public static getInstance(): AnimeService {
    if (!AnimeService.instance) {
      AnimeService.instance = new AnimeService();
    }
    return AnimeService.instance;
  }

  public async searchAnime(title: string, limit: number = 5): Promise<AnimePost[]> {
    this.callCount++;
    console.log(`Recherche #${this.callCount}: ${title}`);
    
    try {
      // Parfois l'API est lente, soyez patient...
      const response = await axios.get(`${JIKAN_API_URL}/anime`, {
        params: {
          q: title,
          limit,
          sfw: true // on évite le contenu NSFW
        }
      });

      // Transformer les données
      return response.data.data.map((anime: any) => {
        const genres = anime.genres?.map((genre: any) => genre.name) || [];
        
        // Traduction statuts - pas parfait mais ça marche
        let status = "Inconnu";
        if (anime.status === "Finished Airing") status = "Terminé";
        else if (anime.status === "Currently Airing") status = "En cours";
        else if (anime.status === "Not yet aired") status = "À venir";
        
        // Saison en majuscules - à améliorer un jour
        let season = anime.season?.toUpperCase() || "UNKNOWN";
        
        return {
          type: "anime",
          data: {
            title: {
              en: anime.title_english || anime.title,
              jp: anime.title_japanese || "",
              ar: "" // À remplir manuellement ou via traduction
            },
            description: anime.synopsis || "",
            info: {
              episodes: anime.episodes,
              year: anime.year, 
              rating: anime.score,
              genres,
              studio: anime.studios?.[0]?.name || "Inconnu",
              rank: anime.rank || null, // parfois null, c'est normal
              status,
              type: anime.type || "UNKNOWN",
              season
            },
            image: {
              id: `anime-${anime.mal_id}`,
              url: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || ""
            },
            updatedAt: new Date().toISOString()
          }
        };
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  // Fonction qui gère nos erreurs - rien de fancy
  private handleError(error: any): never {
    console.error("Zut, problème avec l'API d'anime:", error);
    
    if (error instanceof AxiosError) {
      throw new McpError(
        ErrorCode.InternalError,
        `Erreur API: ${error.response?.data?.message || error.message}`
      );
    }
    
    throw new McpError(
      ErrorCode.InternalError,
      `Oops! Erreur: ${String(error)}`
    );
  }
} 