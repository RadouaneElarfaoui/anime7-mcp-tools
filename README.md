   # anime7-mcp-tools

   Un assistant MCP (Model Context Protocol) pour les administrateurs de l'application mobile Anime Seven. Cet outil facilite la gestion des animes et des épisodes sur la base de données de l'application mobile.

   ## Fonctionnalités

   * **Gestion d'anime** : Recherche, publication et mise à jour d'animes dans la base de données
   * **Gestion d'épisodes** : Ajout et organisation des épisodes avec liens de streaming
   * **Traduction** : Traduction automatique des descriptions et titres d'animes
   * **Guides pratiques** : Instructions détaillées pour les différentes tâches d'administration

   ## Configuration requise

   * Node.js v18 ou supérieur
   * Un compte administrateur pour l'application Anime Seven
   * Une API key pour accéder à la base de données
   * Une clé API Gemini pour les fonctionnalités de traduction

   ## Installation

   1. Clonez ce dépôt :
   ```bash
   git clone https://github.com/RadouaneElarfaoui/anime7-mcp-tools.git
   cd anime7-mcp-tools
   ```

2. Installez les dépendances :
```bash
npm install
```

3. Créez un fichier `.env` à la racine du projet avec les variables suivantes :
```
FACEBOOK_ACCESS_TOKEN=votre_token_acces_facebook
FACEBOOK_PAGE_ID=votre_id_page_facebook
GEMINI_API_KEY=votre_cle_api_gemini
```

4. Compilez le projet :
```bash
npm run build
```

## Utilisation

Pour démarrer l'assistant :

```bash
npm start
```

Pour le mode développement (recompilation automatique) :

```bash
npm run dev
```

## Configuration pour Cline AI

Pour configurer le projet `anime7-mcp-tools` dans Cline AI, ajoutez la section suivante à votre fichier de configuration :

```json
    "mcpServers": {
        "anime7-mcp-tools": {
            "command": "node",
        "args": [
          "chemin/vers/votre/projet/build/index.js"
        ],
        "env": {
          "FACEBOOK_ACCESS_TOKEN": "VOTRE_TOKEN_FACEBOOK",
          "FACEBOOK_PAGE_ID": "VOTRE_ID_PAGE_FACEBOOK",
          "GEMINI_API_KEY": "VOTRE_CLE_API_GEMINI"
        },
            "alwaysAllow": [],
            "disabled": false
        }
    }
```

## Configuration pour Cursor AI

Pour configurer le projet `anime7-mcp-tools` dans Cursor AI, ajoutez la section suivante à votre fichier de configuration `mcp.json` :

```json
"anime7-mcp-tools": {
  "command": "node",
  "args": [
    "chemin/vers/votre/projet/build/index.js"
  ],
  "env": {
    "FACEBOOK_ACCESS_TOKEN": "VOTRE_TOKEN_FACEBOOK",
    "FACEBOOK_PAGE_ID": "VOTRE_ID_PAGE_FACEBOOK",
    "GEMINI_API_KEY": "VOTRE_CLE_API_GEMINI"
  },
  "disabled": false,
  "autoApprove": [
    "fbGetPagePosts",
    "fbGetPostComments",
    "animeSearch",
    "fbAddEpisodeComment",
    "translateText",
    "getAddAnimeProcessOverview"
  ]
}
```

## Outils disponibles

### Outils Facebook

- `fbGetPagePosts` : Récupère les publications de la page Facebook
- `fbGetPostComments` : Récupère les commentaires d'une publication Facebook
- `fbDeleteComment` : Supprime un commentaire d'une publication Facebook

### Outils d'anime

- `fbPostAnime` : Publie des informations d'anime sur Facebook avec image
- `animeSearch` : Recherche des informations d'anime par titre via l'API Jikan
- `fbAddEpisodeComment` : Ajoute un épisode en tant que commentaire sur une publication

### Outil de traduction

- `translateText` : Traduit un texte vers une langue cible en utilisant l'API Gemini

### Guides et instructions

- `getAddAnimeProcessOverview` : Vue d'ensemble du processus d'ajout d'anime
- `getAddAnimeDetailedSteps` : Étapes détaillées pour l'ajout d'anime
- `getAddAnimePracticalTips` : Conseils pratiques pour l'ajout d'anime
- `getAddAnimeComprehensiveExample` : Exemple complet d'ajout d'anime et d'épisodes

## Exemples d'utilisation

### Utilisation dans Cline Chat

Voici comment utiliser l'assistant dans une conversation Cline Chat :

1. **Demander de revoir le processus d'ajout d'anime** :
   ```
   Bonjour, peux-tu m'expliquer en détail comment ajouter un nouvel anime sur notre page Facebook ?
   Merci de me présenter :
   - une vue globale du processus,
   - les étapes détaillées,
   - des conseils pratiques,
   - et un exemple complet,

   en utilisant chacun des outils guide disponibles (`guideAnimeVueGlobale`, `guideAnimeEtapesDetaillees`, `guideAnimeConseilsPratiques`, `guideAnimeExempleComplet`).
   Je souhaite avoir une vision claire et complète, étape par étape, pour ne rien oublier.
   ```

2. **Recherche d'un anime** :
   ```
   Je voudrais ajouter l'anime "Demon Slayer" à notre page Facebook
   ```
   L'assistant répondra :
   ```
   Je vais rechercher des informations sur "Demon Slayer". Utilisons l'outil de recherche d'anime.

   animeSearch { "title": "Demon Slayer" }
   
   J'ai trouvé plusieurs résultats pour "Demon Slayer". Lequel voulez-vous ajouter?
   
   1. *Demon Slayer: Kimetsu no Yaiba (TV, 2019) - Série principale où Tanjiro devient un chasseur de démons après le massacre de sa famille
   2. Demon Slayer: Kimetsu no Yaiba Movie - Mugen Train (Film, 2020) - Film qui continue l'histoire après la saison 1
   3. Demon Slayer: Kimetsu no Yaiba - Entertainment District Arc (TV, 2021) - Deuxième saison de la série
   
   Veuillez indiquer votre choix en répondant avec le numéro correspondant.
   ```

3. **Sélection et traduction** :
   ```
   Je choisis le numéro 1, la série principale.
   ```
   L'assistant répondra :
   ```
   Excellent choix! Je vais maintenant traduire le titre en arabe pour notre publication.
   
   translateText { "text": "Demon Slayer: Kimetsu no Yaiba", "targetLanguage": "arabe", "isAnimeTitle": true }
   
   Le titre traduit est: "قاتل الشياطين: كيميتسو نو يايبا"
   
   Je vais maintenant générer une description en arabe.
   
   translateText { 
     "text": "In a world where demons threaten humanity, young Tanjiro Kamado becomes a demon slayer after his family is slaughtered and his sister Nezuko is turned into a demon. The anime follows his journey to find a cure for his sister while fighting demons as part of the Demon Slayer Corps.", 
     "targetLanguage": "arabe" 
   }
   
   La description traduite est: "في عالم تهدد فيه الشياطين البشرية، يصبح تانجيرو كامادو الشاب قاتل شياطين بعد ذبح عائلته وتحول أخته نيزوكو إلى شيطان. يتتبع الأنمي رحلته للعثور على علاج لأخته بينما يقاتل الشياطين كجزء من فيلق قاتلي الشياطين."
   ```

4. **Publication de l'anime** :
   ```
   Merci, maintenant publie-le sur notre page Facebook
   ```
   L'assistant répondra :
   ```
   Je vais publier l'anime sur votre page Facebook maintenant.
   
   fbPostAnime {
     "animeData": {
       "type": "anime",
       "data": {
         "title": {
           "en": "Demon Slayer: Kimetsu no Yaiba",
           "jp": "鬼滅の刃",
           "ar": "قاتل الشياطين: كيميتسو نو يايبا"
         },
         "description": "في عالم تهدد فيه الشياطين البشرية، يصبح تانجيرو كامادو الشاب قاتل شياطين بعد ذبح عائلته وتحول أخته نيزوكو إلى شيطان. يتتبع الأنمي رحلته للعثور على علاج لأخته بينما يقاتل الشياطين كجزء من فيلق قاتلي الشياطين.",
         "info": {
           "episodes": 26,
           "year": 2019,
           "rating": 8.5,
           "genres": ["Action", "Fantasy", "Historical", "Shounen"],
           "studio": "ufotable",
           "rank": 28,
           "status": "Terminé",
           "type": "TV",
           "season": "SPRING"
         },
         "image": {
           "id": "demon-slayer-cover",
           "url": "https://cdn.myanimelist.net/images/anime/1286/99889.jpg"
         }
       }
     }
   }
   
   Publication réussie! Voici les détails de la publication:
   {
     "postId": "547656128434943_1278144576105246",
     "postUrl": "https://www.facebook.com/547656128434943/posts/1278144576105246"
   }
   ```

5. **Ajout d'épisodes multiples** :
   ```
   Maintenant ajoute les épisodes suivants: 
   ✔الحلقة 1: https://www.facebook.com/1223240645768310/videos/1927661077752649/
   ✔الحلقة 2: https://www.facebook.com/1223240645768310/videos/8230393350342061/
   ✔الحلقة 3: https://www.facebook.com/1223240645768310/videos/381620348321213/
   ✔الحلقة 4: https://www.facebook.com/1223240645768310/videos/2572322859620075/
   ✔الحلقة 5: https://www.facebook.com/1223240645768310/videos/1234567890123456/
   ```
   L'assistant répondra :
   ```
   Je vais ajouter tous ces épisodes un par un. Commençons par l'épisode 1 :

   fbAddEpisodeComment {
     "postId": "547656128434943_1278144576105246",
     "episode": {
       "type": "episode",
       "episodeNumber": "1",
       "title": "الحلقة 1",
       "addedBy": "Anime Seven",
       "duration": "24:00",
       "isFiller": false,
       "servers": [
         {
           "name": "facebook",
           "quality": "HD",
           "url": "https://www.facebook.com/1223240645768310/videos/1927661077752649/",
           "type": "facebook"
         }
       ],
       "releaseDate": "2023-05-01T00:00:00Z"
     }
   }

   L'épisode 1 a été ajouté avec succès!

   Maintenant, l'épisode 2 :

   fbAddEpisodeComment {
     "postId": "547656128434943_1278144576105246",
     "episode": {
       "type": "episode",
       "episodeNumber": "2",
       "title": "الحلقة 2",
       "addedBy": "Anime Seven",
       "duration": "24:00",
       "isFiller": false,
       "servers": [
         {
           "name": "facebook",
           "quality": "HD",
           "url": "https://www.facebook.com/1223240645768310/videos/8230393350342061/",
           "type": "facebook"
         }
       ],
       "releaseDate": "2023-05-08T00:00:00Z"
     }
   }

   J'ai ajouté l'épisode 2 avec succès!

   [Je continue d'ajouter les épisodes 3, 4 et 5 de la même manière...]

   Tous les 5 épisodes ont été ajoutés avec succès!
   ```

### Référence des outils

Voici les principaux outils disponibles et leur syntaxe :

#### Recherche d'anime
```
animeSearch { "title": "Nom de l'anime" }
```

#### Traduction avec respect sémantique
```
translateText { 
  "text": "Texte à traduire", 
  "targetLanguage": "arabe",
  "isAnimeTitle": true
}
```

#### Ajout d'un épisode
```
fbAddEpisodeComment {
  "postId": "ID_DE_LA_PUBLICATION",
  "episode": {
    "type": "episode",
    "episodeNumber": "1",
    "title": "الحلقة 1",
    "addedBy": "Anime Seven",
    "duration": "24:00",
    "isFiller": false,
    "servers": [
      {
        "name": "facebook",
        "quality": "HD",
        "url": "https://www.facebook.com/ID_PAGE/videos/ID_VIDEO/",
        "type": "facebook"
      }
    ],
    "releaseDate": "2023-05-01T00:00:00Z"
  }
}
```

## Contribution

Les contributions sont les bienvenues ! Veuillez soumettre une pull request ou ouvrir une issue pour discuter des changements proposés.

## Licence

Ce projet est sous licence MIT.
