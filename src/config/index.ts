// Config des APIs qu'on utilise

// Facebook Graph API - on utilise v19 car v18 a trop de bugs
export const FB_API_BASE_URL = 'https://graph.facebook.com/v19.0';

// Nos variables d'env - faut pas les oublier!
export const DEFAULT_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN || '';
export const DEFAULT_PAGE_ID = process.env.FACEBOOK_PAGE_ID || '';

// Jikan - API pas super stable mais gratuite
export const JIKAN_API_URL = 'https://api.jikan.moe/v4';

// Gemini - on l'utilise pour les traductions
// TODO: essayer Claude si Gemini est trop lent
export const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Vérifs de base - à améliorer plus tard
if (!DEFAULT_ACCESS_TOKEN) {
  console.error("😱 Pas de token FB! Va voir le README.md");
}

if (!DEFAULT_PAGE_ID) {
  console.error("📱 ID page manquant - demande à Rachid");
}

// Gemini aussi important
if (!GEMINI_API_KEY) {
  console.error("🔑 Besoin d'une clé Gemini pour les traductions!");
} 