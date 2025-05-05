export class InstructionsService {
    static instance;
    constructor() { }
    static getInstance() {
        if (!InstructionsService.instance) {
            InstructionsService.instance = new InstructionsService();
        }
        return InstructionsService.instance;
    }
    getAnimeProcessingInstructions() {
        return {
            steps: [
                "1. Recherche de l'anime avec l'outil `animeSearch` en utilisant le titre fourni",
                "2. Présentation des résultats à l'utilisateur sous forme de liste numérotée avec l'outil `Cline has a question`:",
                "   - Listez les animes trouvés avec leurs titres, année et type",
                "   - Indiquez quel anime vous semble être le plus probable avec un astérisque (*)",
                "   - Demandez à l'utilisateur de confirmer son choix en indiquant le numéro",
                "3. Vérification et préparation des données après confirmation du choix:",
                "   - Si la description n'est pas en arabe, utilisez `translateText` pour la traduire",
                "   - Si le titre arabe est manquant, utilisez `translateText` pour le traduire depuis l'anglais",
                "4. Publication de l'anime avec `fbPostAnime` en incluant toutes les données complètes",
                "5. Ajout des épisodes un par un avec `fbAddEpisodeComment` en formatant correctement les liens Facebook"
            ],
            notes: [
                "Identifiez le titre de l'anime dans le texte fourni par l'utilisateur (souvent après 'أنمي' ou 'anime')",
                "Recherchez les liens d'épisodes qui suivent généralement un format comme 'الحلقة X: [lien]'",
                "Pour la sélection de l'anime, marquez le choix le plus probable avec un astérisque (*)",
                "Attendez toujours la confirmation de l'utilisateur avant de continuer le processus",
                "Les liens Facebook doivent être au format [...].facebook.com/XXXXXXXXXX/videos/XXXXXXXXXX/",
                "Les paramètres comme '?idorvanity=' et 'app=fbl' doivent être supprimés des URLs",
                "Extrayez les IDs importants (ID de page et ID de vidéo) pour reconstruire l'URL au format requis",
                "Créez un titre d'épisode au format 'الحلقة ' + X où X est le numéro d'épisode, le titre est toujours en arabe",
                "Utilisez '24' comme durée par défaut des épisodes si non spécifiée",
                "Utilisez 'Anime Seven' comme valeur par défaut pour le champ addedBy si non spécifié"
            ],
            example: {
                search: "animeSearch { \"title\": \"God Eater\" }",
                translation: {
                    description: "translateText { \"text\": \"Description en anglais...\", \"targetLanguage\": \"arabe\" }",
                    titleAr: "translateText { \"text\": \"God Eater\", \"targetLanguage\": \"arabe\" }"
                },
                publication: "fbPostAnime { \"animeData\": { \"type\": \"anime\", \"data\": { ... } } }",
                episodes: "fbAddEpisodeComment { \"postId\": \"ID_PUBLICATION\", \"episode\": { \"type\": \"episode\", \"episodeNumber\": \"1\", ... } }"
            }
        };
    }
    // Nouvelles méthodes pour fournir des parties spécifiques des instructions
    getProcessOverview() {
        return `# Présentation du processus d'ajout d'anime

L'ajout d'un anime et de ses épisodes se fait en plusieurs étapes distinctes:

1. **Recherche et identification de l'anime**
   - Utilisation de l'API Jikan via l'outil \`animeSearch\`
   - Sélection de l'anime correct parmi les résultats avec confirmation de l'utilisateur

2. **Préparation et traduction des données**
   - Traduction des descriptions et titres en arabe si nécessaire
   - Formatage de la structure JSON requise pour la publication

3. **Publication de l'anime sur Facebook**
   - Envoi des informations complètes avec image via \`fbPostAnime\`
   - Obtention de l'ID de publication nécessaire pour les étapes suivantes

4. **Ajout des épisodes en tant que commentaires**
   - Formatage correct des liens d'épisodes (particulièrement pour Facebook)
   - Ajout séquentiel des épisodes avec \`fbAddEpisodeComment\``;
    }
    getDetailedSteps() {
        return `# Étapes détaillées pour l'ajout d'anime

## 1. Recherche de l'anime
- Identifiez le titre de l'anime dans la demande de l'utilisateur
- Utilisez l'outil \`animeSearch\` pour rechercher l'anime par son titre:
  \`\`\`
  animeSearch { "title": "Titre de l'anime" }
  \`\`\`
- Analysez les résultats retournés (généralement limités à 5)

## 2. Présentation des options à l'utilisateur
- Créez une liste numérotée des animes trouvés avec leurs informations principales
- Marquez d'un astérisque (*) le choix qui semble le plus probable
- Utilisez l'outil "Cline has a question" pour demander confirmation:
  \`\`\`
  Cline has a question:

  J'ai trouvé plusieurs animes correspondant à "[Titre]". Lequel souhaitez-vous utiliser?

  1. *[Anime A] (TV, 2021) - [Description courte]
  2. [Anime B] (Movie, 2019) - [Description courte]
  3. [Anime C] (OVA, 2022) - [Description courte]

  Veuillez indiquer votre choix en répondant avec le numéro correspondant.
  \`\`\`
- Attendez la confirmation de l'utilisateur avant de procéder

## 3. Préparation des données
- Pour le titre arabe (si manquant):
  \`\`\`
  translateText { "text": "Titre en anglais", "targetLanguage": "arabe" }
  \`\`\`
- Pour la description en arabe:
  \`\`\`
  translateText { "text": "Description en anglais", "targetLanguage": "arabe" }
  \`\`\`
  * Si l'anime n'a pas de description, générez-en une à partir des informations disponibles
  * La description doit être informative et mentionner l'intrigue principale, le genre et le public cible
  * Assurez-vous que la description traduite est adaptée culturellement
- Assurez-vous que tous les champs requis sont présents dans la structure JSON

## 4. Publication de l'anime
- Utilisez l'outil \`fbPostAnime\` avec les données complètes
- Conservez l'ID de publication retourné (\`postId\`) pour l'ajout des épisodes

## 5. Ajout des épisodes
- Pour chaque épisode, formatez correctement le lien Facebook:
  - Format requis: [...].facebook.com/XXXXXXXXXX/videos/XXXXXXXXXX/
  - Supprimez tous les paramètres d'URL après "/"
- Utilisez l'outil \`fbAddEpisodeComment\` pour chaque épisode
- Répétez pour tous les épisodes en incrémentant le numéro d'épisode`;
    }
    getPracticalTips() {
        return `# Conseils pratiques pour l'ajout d'anime

1. **Extraction du titre d'anime**
   - Recherchez le titre après des marqueurs comme "أنمي", "anime", "série" ou "ajouter"
   - Si le titre contient des caractères spéciaux, nettoyez-le avant la recherche

2. **Extraction des liens d'épisodes**
   - Recherchez des motifs comme "الحلقة X: [lien]" ou "Episode X: [lien]"
   - Les liens peuvent être mélangés dans le texte, utilisez des expressions régulières si nécessaire

3. **Formatage des liens Facebook**
   - Format correct: \`[...].facebook.com/XXXXXXXXXX/videos/XXXXXXXXXX/\`
   - Problèmes courants à corriger:
     * Paramètres d'URL superflus: \`?idorvanity=XXX\`, \`app=fbl\`, etc.
     * Domaines incorrects: \`web.facebook.com\` ou \`m.facebook.com\` (à remplacer par \`www.facebook.com\`)
     * Formats de permaliens complexes (extraire les IDs numériques et reconstruire l'URL)

4. **Valeurs par défaut utiles**
   - Durée d'épisode: "24" minutes si non spécifiée
   - Titre d'épisode: toujours en arabe avec les nombre en format (1 2 3 ...)"الحلقة X" où X est le numéro d'épisode 
   - Ajouté par: "Anime Seven" si non spécifié
   - Qualité: "HD" par défaut
   - Type de serveur: "facebook" pour les liens Facebook
   - Date de sortie: Date actuelle si non spécifiée
   - Description en arabe: si absente, créez une description qui résume l'histoire et mentionne les thèmes principaux

5. **Vérifications importantes**
   - Confirmez toujours le choix de l'anime avec l'utilisateur
   - Vérifiez que tous les liens sont au format correct avant de les publier
   - Assurez-vous que la numérotation des épisodes est cohérente
   - Validez que la traduction en arabe est de bonne qualité`;
    }
    getComprehensiveExample() {
        return `# Exemple complet d'ajout d'anime et d'épisodes

## Requête utilisateur initiale
\`\`\`
Je voudrais ajouter l'anime Demon Slayer avec les épisodes suivants:
- Episode 1: https://www.facebook.com/100064560333515/videos/1278144576105246/?idorvanity=
- Episode 2: https://fb.watch/xyz123/
- Episode 3: https://m.facebook.com/story.php?story_fbid=pfbid02LNbc6XyzAbc&id=100064560333515
\`\`\`

## 1. Recherche de l'anime
\`\`\`
animeSearch { "title": "Demon Slayer" }
\`\`\`

## 2. Présentation des options à l'utilisateur
\`\`\`
Cline has a question:

J'ai trouvé plusieurs animes correspondant à "Demon Slayer". Lequel souhaitez-vous utiliser?

1. *Demon Slayer: Kimetsu no Yaiba (TV, 2019) - Série principale où Tanjiro devient un chasseur de démons après le massacre de sa famille
2. Demon Slayer: Kimetsu no Yaiba Movie - Mugen Train (Film, 2020) - Film qui continue l'histoire après la saison 1
3. Demon Slayer: Kimetsu no Yaiba - Entertainment District Arc (TV, 2021) - Deuxième saison de la série

Veuillez indiquer votre choix en répondant avec le numéro correspondant.
\`\`\`

## 3. Traduction du contenu
\`\`\`
translateText { "text": "Demon Slayer: Kimetsu no Yaiba", "targetLanguage": "arabe" }
\`\`\`

(Résultat: "قاتل الشياطين: كيميتسو نو يايبا")

\`\`\`
translateText { 
  "text": "Tanjiro Kamado joins the Demon Slayer Corps to avenge his family and cure his sister.", 
  "targetLanguage": "arabe" 
}
\`\`\`

(Résultat: "ينضم تانجيرو كامادو إلى فيلق قاتلي الشياطين للانتقام لعائلته وعلاج أخته.")

## 3.1 Génération d'une description (si aucune n'est disponible)
Si l'API ne fournit pas de description, vous pouvez en créer une basée sur les informations de l'anime :

\`\`\`
# Description générée en anglais
"In a world where demons threaten humanity, young Tanjiro Kamado becomes a demon slayer after his family is slaughtered and his sister Nezuko is turned into a demon. The anime follows his journey to find a cure for his sister while fighting demons as part of the Demon Slayer Corps."

# Traduction en arabe
translateText { 
  "text": "In a world where demons threaten humanity, young Tanjiro Kamado becomes a demon slayer after his family is slaughtered and his sister Nezuko is turned into a demon. The anime follows his journey to find a cure for his sister while fighting demons as part of the Demon Slayer Corps.", 
  "targetLanguage": "arabe" 
}
\`\`\`

(Résultat: "في عالم تهدد فيه الشياطين البشرية، يصبح تانجيرو كامادو الشاب قاتل شياطين بعد ذبح عائلته وتحول أخته نيزوكو إلى شيطان. يتتبع الأنمي رحلته للعثور على علاج لأخته بينما يقاتل الشياطين كجزء من فيلق قاتلي الشياطين.")

## 4. Préparation de la structure JSON
\`\`\`
fbPostAnime {
  "animeData": {
    "type": "anime",
    "data": {
      "title": {
        "en": "Demon Slayer: Kimetsu no Yaiba",
        "jp": "鬼滅の刃",
        "ar": "قاتل الشياطين: كيميتسو نو يايبا"
      },
      "description": "ينضم تانجيرو كامادو إلى فيلق قاتلي الشياطين للانتقام لعائلته وعلاج أخته.",
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
\`\`\`

## 5. Formatage et ajout des épisodes
(URL nettoyées et restructurées pour le format Facebook)

\`\`\`
fbAddEpisodeComment {
  "postId": "547656128434943_1278144576105246",
  "episode": {
    "type": "episode",
    "episodeNumber": "1",
    "title": "الحلقة 1",
    "addedBy": "Anime Seven",
    "duration": "23:40",
    "isFiller": false,
    "servers": [
      {
        "name": "facebook",
        "quality": "HD",
        "url": "https://www.facebook.com/100064560333515/videos/1278144576105246",
        "type": "facebook"
      }
    ],
    "releaseDate": "2023-05-01T00:00:00Z"
  }
}
\`\`\`

(Répéter pour les épisodes 2 et 3 avec les URLs correctement formatées)`;
    }
}
