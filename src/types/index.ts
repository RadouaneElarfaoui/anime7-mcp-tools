// Types pour Facebook - basé sur leur API v19
export interface FacebookPost {
  id: string;
  message?: string;
  story?: string;
  created_time: string;
  permalink_url?: string; // URL pour partager
}

export interface FacebookComment {
  id: string;
  message: string;
  created_time: string;
  from?: {
    id: string;
    name: string;
  };
}

export interface FacebookPage {
  id: string;
  name: string;
  about?: string;
  category?: string;
  fan_count?: number; // nombre de likes/followers
  link?: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

// Structure de réponse standard de Facebook
// Parfois ils changent ça sans prévenir...
export interface FacebookResponse<T> {
  data: T[];
  paging?: {
    cursors?: {
      before: string;
      after: string;
    };
    next?: string;
    previous?: string;
  };
}

// Structure pour nos animes
// Note: on pourrait faire plus simple mais ça marche
export interface AnimeTitle {
  en: string; // titre anglais
  jp: string; // titre japonais 
  ar: string; // titre arabe - important pour l'app
}

export interface AnimeInfo {
  episodes: number | null; // parfois inconnu
  year: number | null;
  rating: number | null; // sur 10 généralement
  genres: string[]; // liste de genres
  studio: string;
  rank: number | null;
  status: string; // "Terminé", "En cours", etc.
  type: string; // "TV", "MOVIE", "OVA"...
  season: string; // "WINTER", "SPRING", etc.
}

// Images - on garde juste l'URL et un ID
export interface AnimeImage {
  id: string;
  url: string;
}

export interface AnimeData {
  title: AnimeTitle;
  description: string;
  info: AnimeInfo;
  image: AnimeImage;
  updatedAt: string; // ISO date
}

export interface AnimePost {
  type: string; // toujours "anime"
  data: AnimeData;
}

// Info sur les épisodes - ajouté par Karim
export interface EpisodeServer {
  name: string; // nom du serveur, ex: "Gogo"
  quality: string; // "HD", "SD", etc
  url: string;
  type: string; // "sub", "dub", etc
}

export interface Episode {
  type: "episode";
  episodeNumber: string; // format: "1", "2", etc.
  title: string;
  addedBy: string; // qui a ajouté l'épisode
  duration: string; // au format "24:30"
  isFiller: boolean; // épisode filler ou canon
  servers: EpisodeServer[];
  releaseDate: string; // ISO date
}

// Types pour la traduction
export interface TranslationRequest {
  text: string;
  targetLanguage: string; // "ar", "en", etc
  sourceLanguage?: string; // auto-détecté si absent
  isAnimeTitle?: boolean; // pour indiquer si c'est un titre d'anime à traduire correctement
}

export interface TranslationResponse {
  translatedText: string;
  detectedLanguage?: string; // langue détectée si auto
}

// Guides pour ajouter des animes
// TODO: mettre à jour avec nouvelles instructions
export interface AnimeProcessingInstructions {
  steps: string[];
  notes: string[];
  example: {
    search: string;
    translation: {
      description: string;
      titleAr: string;
    };
    publication: string;
    episodes: string;
  };
} 