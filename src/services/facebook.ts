import axios, { AxiosError } from 'axios';
import FormData from 'form-data';
import { createReadStream } from 'fs';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { FB_API_BASE_URL, DEFAULT_ACCESS_TOKEN, DEFAULT_PAGE_ID } from '../config/index.js';
import { FacebookPost, FacebookComment, FacebookResponse, AnimePost, Episode } from '../types/index.js';
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

export class FacebookService {
  private static instance: FacebookService;
  private accessToken: string;
  private pageId: string;

  private constructor() {
    this.accessToken = DEFAULT_ACCESS_TOKEN;
    this.pageId = DEFAULT_PAGE_ID;
  }

  public static getInstance(): FacebookService {
    if (!FacebookService.instance) {
      FacebookService.instance = new FacebookService();
    }
    return FacebookService.instance;
  }

  public async getPagePosts(limit: number = 10, after?: string, before?: string, since?: string, until?: string) {
    if (!this.pageId) {
      throw new McpError(ErrorCode.InvalidParams, "L'ID de la page Facebook n'est pas défini");
    }

    if (!this.accessToken) {
      throw new McpError(ErrorCode.InvalidParams, "Le token d'accès Facebook n'est pas défini");
    }

    try {
      const params: Record<string, any> = {
        access_token: this.accessToken,
        limit,
        fields: 'id,message,story,created_time,permalink_url',
      };

      if (after) params.after = after;
      if (before) params.before = before;
      if (since) params.since = since;
      if (until) params.until = until;

      const response = await axios.get<FacebookResponse<FacebookPost>>(
        `${FB_API_BASE_URL}/${this.pageId}/posts`,
        { params }
      );

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async getPostComments(postId: string, limit: number = 25, after?: string) {
    if (!this.accessToken) {
      throw new McpError(ErrorCode.InvalidParams, "Le token d'accès Facebook n'est pas défini");
    }

    try {
      const params: Record<string, any> = {
        access_token: this.accessToken,
        limit,
        fields: 'id,message,created_time,from',
      };

      if (after) params.after = after;

      const response = await axios.get<FacebookResponse<FacebookComment>>(
        `${FB_API_BASE_URL}/${postId}/comments`,
        { params }
      );

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async deleteComment(commentId: string) {
    if (!this.accessToken) {
      throw new McpError(ErrorCode.InvalidParams, "Le token d'accès Facebook n'est pas défini");
    }

    try {
      await axios.delete(`${FB_API_BASE_URL}/${commentId}`, {
        params: {
          access_token: this.accessToken,
        },
      });

      return { success: true, commentId };
    } catch (error) {
      this.handleError(error);
    }
  }

  public async postAnime(animeData: AnimePost) {
    if (!this.pageId) {
      throw new McpError(ErrorCode.InvalidParams, "L'ID de la page Facebook n'est pas défini");
    }

    if (!this.accessToken) {
      throw new McpError(ErrorCode.InvalidParams, "Le token d'accès Facebook n'est pas défini");
    }

    try {
      const message = JSON.stringify(animeData);
      const imageResponse = await axios.get(animeData.data.image.url, {
        responseType: 'arraybuffer'
      });

      const contentType = imageResponse.headers['content-type'];
      if (!contentType || !contentType.startsWith('image/')) {
        throw new McpError(ErrorCode.InvalidParams, `L'URL ne pointe pas vers une image valide: ${contentType}`);
      }

      const tempImagePath = join(tmpdir(), `anime_cover_${Date.now()}.jpg`);
      await writeFile(tempImagePath, Buffer.from(imageResponse.data));

      const formData = new FormData();
      formData.append('message', message);
      formData.append('source', createReadStream(tempImagePath));

      const response = await axios.post(
        `${FB_API_BASE_URL}/${this.pageId}/photos`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
          params: {
            access_token: this.accessToken,
          },
        }
      );

      return {
        success: true,
        postId: response.data.id,
        postUrl: response.data.post_id ? `https://www.facebook.com/${response.data.post_id}` : undefined,
        note: "Pour ajouter des épisodes à cette publication, utilisez l'outil add_episode_comment avec ce postId"
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  public async updatePost(postId: string, message: string) {
    if (!this.accessToken) {
      throw new McpError(ErrorCode.InvalidParams, "Le token d'accès Facebook n'est pas défini");
    }

    try {
      // Méthode originale - utilisation de l'API pour mettre à jour le post
      try {
        const response = await axios.post(
          `${FB_API_BASE_URL}/${postId}`,
          { message },
          {
            params: {
              access_token: this.accessToken,
            },
          }
        );

        return {
          success: true,
          postId: response.data.id,
          postUrl: response.data.post_id ? `https://www.facebook.com/${response.data.post_id}` : undefined,
        };
      } catch (updateError: any) {
        // Si l'erreur est due aux permissions (#3) ou si on essaie d'accéder à un champ non existant sur un nœud de type Photo (#100)
        if (updateError.response?.data?.error?.code === 3 || 
            (updateError.response?.data?.error?.code === 100 && 
             updateError.response?.data?.error?.message?.includes("nonexisting field (message) on node type (Photo)"))) {
          
          console.log("Tentative de mise à jour d'un post de type Photo, utilisation de la méthode alternative...");
          
          // Si c'est une photo, les champs sont différents
          try {
            // Pour les posts de type photo, on doit accéder différemment au contenu
            const photoResponse = await axios.get(
              `${FB_API_BASE_URL}/${postId}`,
              {
                params: {
                  access_token: this.accessToken,
                  fields: 'name,link,images,created_time,album',
                },
              }
            );
            
            console.log("Photo récupérée :", JSON.stringify(photoResponse.data, null, 2));
            
            // Pour les posts d'anime avec photo, la seule solution est de créer un nouveau post
            // Essayons de récupérer les commentaires pour voir si c'est un post d'anime
            const commentsData = await this.getPostComments(postId, 100);
            
            // Vérifier si les commentaires contiennent des épisodes JSON
            const episodeComments = commentsData.data.filter(comment => {
              try {
                const commentData = JSON.parse(comment.message);
                return commentData.type === 'episode';
              } catch {
                return false;
              }
            });
            
            if (episodeComments.length > 0) {
              console.log("Post d'anime détecté avec", episodeComments.length, "épisodes");
              
              // Si nous avons des épisodes, il s'agit d'un post d'anime
              // Tenter de parser le nouveau message comme données d'anime
              let updatedAnimeData;
              try {
                updatedAnimeData = JSON.parse(message);
              } catch (parseError) {
                throw new McpError(
                  ErrorCode.InvalidParams,
                  "Le message de mise à jour doit être au format JSON pour les publications d'anime"
                );
              }
              
              // Créer un nouveau post
              const newPost = await this.postAnime(updatedAnimeData);
              
              // Ajouter chaque épisode comme commentaire au nouveau post
              for (const comment of episodeComments) {
                try {
                  const episodeData = JSON.parse(comment.message);
                  await this.addEpisodeComment(newPost.postId, episodeData);
                } catch (commentError) {
                  console.error(`Erreur lors de la migration du commentaire ${comment.id}:`, commentError);
                }
              }
              
              return {
                success: true,
                method: 'recreated',
                oldPostId: postId,
                newPostId: newPost.postId,
                postUrl: newPost.postUrl,
                migratedComments: episodeComments.length,
                note: "En raison des restrictions de l'API Facebook pour les posts de type Photo, le post a été recréé avec un nouvel ID et les épisodes ont été migrés."
              };
            } else {
              // Ce n'est pas un post d'anime, suggérer une solution manuelle
              throw new McpError(
                ErrorCode.InternalError,
                "Cette publication est de type Photo et ne peut pas être mise à jour avec l'API Facebook. " +
                "Solution alternative : supprimez la publication existante et créez-en une nouvelle."
              );
            }
          } catch (photoError) {
            console.error("Erreur lors de la récupération de la photo:", photoError);
            // Si on ne peut pas récupérer la photo, suggérer une solution manuelle
            throw new McpError(
              ErrorCode.InternalError,
              "Votre application Facebook n'a pas les permissions nécessaires pour mettre à jour les publications. " +
              "Solution alternative : supprimez la publication existante et créez-en une nouvelle. " +
              "Pour obtenir les permissions nécessaires, vous devez demander les autorisations 'publish_pages' et 'manage_pages' " +
              "lors de la configuration de votre application Facebook."
            );
          }
        } else {
          // Si c'est une autre erreur, la relancer
          throw updateError;
        }
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  public async addEpisodeComment(postId: string, episode: Episode) {
    if (!this.accessToken) {
      throw new McpError(ErrorCode.InvalidParams, "Le token d'accès Facebook n'est pas défini");
    }

    // Vérification du format de l'URL pour les serveurs Facebook
    for (const server of episode.servers) {
      if (server.type === 'facebook') {
        const urlPattern = /^.+\.facebook\.com\/\d+\/videos\/\d+\/?$/;
        if (!urlPattern.test(server.url)) {
          throw new McpError(
            ErrorCode.InvalidParams,
            `Format d'URL Facebook invalide. L'URL doit être au format [...].facebook.com/XXXXXXXXXX/videos/XXXXXXXXXX/`
          );
        }
      }
    }

    try {
      const response = await axios.post(
        `${FB_API_BASE_URL}/${postId}/comments`,
        { message: JSON.stringify(episode) },
        {
          params: {
            access_token: this.accessToken,
          },
        }
      );

      return {
        success: true,
        commentId: response.data.id,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any): never {
    console.error("Facebook API error:", error);
    if (error instanceof AxiosError) {
      // Log plus détaillé pour le débogage
      if (error.response?.data?.error) {
        console.error("Facebook API error details:", {
          message: error.response.data.error.message,
          type: error.response.data.error.type,
          code: error.response.data.error.code,
          fbtrace_id: error.response.data.error.fbtrace_id
        });
      }
      
      // Messages d'erreur plus utiles basés sur les codes d'erreur courants de Facebook
      if (error.response?.data?.error?.code === 3) {
        throw new McpError(
          ErrorCode.InternalError,
          `Erreur Facebook API: L'application n'a pas les permissions nécessaires pour effectuer cette opération. Permissions requises: 'publish_pages' et 'manage_pages'.`
        );
      } else if (error.response?.data?.error?.code === 190) {
        throw new McpError(
          ErrorCode.InternalError,
          `Erreur Facebook API: Le token d'accès a expiré ou est invalide. Veuillez régénérer un nouveau token d'accès.`
        );
      } else if (error.response?.data?.error?.code === 100) {
        throw new McpError(
          ErrorCode.InternalError,
          `Erreur Facebook API: Paramètre invalide ou manquant, vérifiez les identifiants fournis. Détail: ${error.response?.data?.error?.message}`
        );
      } else {
        throw new McpError(
          ErrorCode.InternalError,
          `Erreur Facebook API (${error.response?.data?.error?.code || "inconnu"}): ${error.response?.data?.error?.message || error.message}`
        );
      }
    }
    throw new McpError(ErrorCode.InternalError, `Une erreur inattendue s'est produite: ${String(error)}`);
  }
} 