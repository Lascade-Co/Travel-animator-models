// src/lib/models-cache.ts
// Centralized models fetching and caching for build time

// Type definitions
interface Texture {
  thumbnail?: string;
}

interface Model {
  id?: string;
  name?: string;
  category?: string;
  description?: string;
  textures?: Texture[];
}

interface ApiResponse {
  results?: Model[];
  next?: string;
}

// In-memory cache for build time
let modelsCache: Model[] | null = null;
let cachePromise: Promise<Model[]> | null = null;

// Fetch all models with pagination and cache them
async function fetchAllModelsInternal(): Promise<Model[]> {
  let url: string | null = "https://dashboard.lascade.com/travel_animator/v0/web/models";
  const allResults: Model[] = [];
  let batchCount = 0;

  while (url) {
    batchCount++;
    console.log(`[BUILD CACHE] Loading batch ${batchCount} from: ${url}`);

    try {
      const res = await fetch(url, {
        headers: {
          "accept": "application/json",
          "X-CSRFTOKEN": "tdZ0CBLlvwkBMLxiFUd92zcho51IJ2mxmLisBlIlG3DQKFuvCqlEffax94XVubp5"
        },
        // Ensure fresh data at build time
        cache: 'no-store'
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data: ApiResponse = await res.json();
      const newModels: Model[] = data.results || [];
      console.log(`[BUILD CACHE] Loaded ${newModels.length} models in batch ${batchCount}`);

      allResults.push(...newModels);

      // Get next page URL
      url = data.next || null;

      // Small delay to be respectful to the API
      if (url) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error(`[BUILD CACHE] Error fetching models batch ${batchCount}:`, error);
      // Break the loop on error to prevent infinite retries
      break;
    }
  }

  console.log(`[BUILD CACHE] Finished loading all models. Total: ${allResults.length}`);
  return allResults;
}

// Get all models (cached)
export async function getAllModels(): Promise<Model[]> {
  // If we already have cached models, return them
  if (modelsCache) {
    console.log(`[BUILD CACHE] Returning ${modelsCache.length} cached models`);
    return modelsCache;
  }

  // If a fetch is already in progress, wait for it
  if (cachePromise) {
    console.log('[BUILD CACHE] Waiting for ongoing fetch to complete...');
    modelsCache = await cachePromise;
    return modelsCache;
  }

  // Start a new fetch and cache the promise
  console.log('[BUILD CACHE] Starting fresh fetch of all models...');
  cachePromise = fetchAllModelsInternal();
  modelsCache = await cachePromise;
  
  // Clear the promise since it's resolved
  cachePromise = null;
  
  return modelsCache;
}

// Get a specific model by ID (from cache)
// Get model slugs for generateStaticParams (from cache)
export async function getModelSlugs(): Promise<string[]> {
  const allModels = await getAllModels();
  
  const slugify = (str: string | undefined | null): string => {
    return String(str || '').toLowerCase().trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9\-]/g, '')
      .replace(/\-+/g, '-');
  };
  
  const slugs = allModels
    .filter(model => model.name) // Only include models with valid names
    .map(model => slugify(model.name!));
  
  console.log(`[BUILD CACHE] Generated ${slugs.length} model slugs for static params`);
  return slugs;
}

// Get model IDs for generateStaticParams (from cache)
export async function getModelIds(): Promise<string[]> {
  const allModels = await getAllModels();
  const ids = allModels
    .filter(model => model.id) // Only include models with valid IDs
    .map(model => model.id!);
  
  console.log(`[BUILD CACHE] Generated ${ids.length} model IDs for static params`);
  return ids;
}

// Optional: Clear cache (useful for testing)
export function clearModelsCache(): void {
  modelsCache = null;
  cachePromise = null;
  console.log('[BUILD CACHE] Cache cleared');
}

// Get a specific model by slug (from cache)
export async function getModelBySlug(slug: string): Promise<Model | null> {
  const allModels = await getAllModels();
  
  const slugify = (str: string | undefined | null): string => {
    return String(str || '').toLowerCase().trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9\-]/g, '')
      .replace(/\-+/g, '-');
  };
  
  const model = allModels.find(m => slugify(m.name || "") === slug) || null;
  
  if (model) {
    console.log(`[BUILD CACHE] Found model with slug ${slug} in cache`);
  } else {
    console.log(`[BUILD CACHE] Model with slug ${slug} not found in cache`);
  }
  
  return model;
}