#!/usr/bin/env node

import 'dotenv/config';

/**
 * anime7-mcp-tools
 * 
 * Un petit outil pour gérer notre app Anime Seven - fait par Léo et l'équipe
 * (dernière mise à jour: Mai 2024)
 * 
 * Ce qu'on peut faire:
 * - Posts FB pour les animes (la base)
 * - Chercher des animes cool à ajouter
 * - Gérer nos épisodes (enfin!)
 * - Traduire les textes (arabe principalement)
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";
import axios from 'axios';
import { AxiosError } from 'axios';
import FormData from 'form-data';
import { createReadStream } from 'fs';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { allTools } from './tools/index.js';
import { 
  FacebookPost, 
  FacebookComment, 
  FacebookPage, 
  FacebookResponse, 
  AnimeTitle,
  AnimeInfo,
  AnimeImage,
  AnimeData,
  AnimePost
} from './types/index.js';
import { FB_API_BASE_URL, DEFAULT_ACCESS_TOKEN, DEFAULT_PAGE_ID } from './config/index.js';

// Check si on a nos variables FB (souvent oubliées...)
console.error(`Token FB: ${Boolean(DEFAULT_ACCESS_TOKEN) ? 'OK' : 'MANQUANT!'}`);
console.error(`ID Page: ${Boolean(DEFAULT_PAGE_ID) ? 'OK' : 'MANQUANT!'}`);

// Warnings plus amicaux
if (!DEFAULT_ACCESS_TOKEN) {
  console.error("Hey! Il manque le token FB dans les variables d'environnement!");
}

if (!DEFAULT_PAGE_ID) {
  console.error("Oups! ID de page manquant dans les variables d'environnement!");
}

// Notre serveur MCP - version alpha (encore plein de trucs à améliorer)
const server = new Server(
  {
    name: "anime7-mcp-tools",
    version: "0.1.0", // on incrémentera quand ça marchera mieux
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Liste tous les outils dispo
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: allTools.map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    })),
  };
});

// Gère les appels aux outils (le coeur du système)
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const tool = allTools.find(t => t.name === request.params.name);
  if (!tool) {
    throw new Error(`Hein? Outil inconnu: ${request.params.name}`);
  }

  return tool.handler(request.params.arguments);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🎉 anime7-mcp-tools lancé! Prêt à vous aider.");
  if (DEFAULT_ACCESS_TOKEN) {
    console.error("✅ Token Facebook trouvé");
  }
  if (DEFAULT_PAGE_ID) {
    console.error("✅ ID de page Facebook trouvé");
  }
}

// Go go go!
main().catch((error) => {
  console.error("❌ Aïe, problème au démarrage:", error);
  process.exit(1);
});
