// src/lib/models-cache.ts
// Centralized models fetching and caching for build time

// Type definitions
export interface Texture {
  thumbnail?: string;
}

export interface Model {
  id?: string;
  name?: string;
  category?: string;
  description?: string;
  textures?: Texture[];
  cover_image?: string;
}

interface ApiResponse {
  results?: Model[];
  next?: string;
}

// Removed caching - fetch fresh data every time

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

        },
        cache: 'no-store',
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

// Get all models (no caching for SSR)
export async function getAllModels(): Promise<Model[]> {
  console.log('[SSR] Starting fresh fetch of all models...');
  return await fetchAllModelsInternal();
}

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
    .filter(model => model.name && model.id) // Only include models with valid names and IDs
    .map(model => `${model.id}_${slugify(model.name!)}`); // Change to id_slug format

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

// Cache clearing function removed (no longer needed)

// Get a specific model by slug (from cache)
export async function getModelDetailById(id: string): Promise<Model | null> {
  const allModels = await getAllModels();

  const slugify = (str: string | undefined | null): string => {
    return String(str || '').toLowerCase().trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9\-]/g, '')
      .replace(/\-+/g, '-');
  };

  const model = allModels.find(m => slugify(m.id || "") === id) || null;

  if (model) {
    console.log(`[BUILD CACHE] Found model with slug ${id} in cache`);
  } else {
    console.log(`[BUILD CACHE] Model with slug ${id} not found in cache`);
  }

  return model;
}

// Get a specific model by ID (for fallback server rendering)
export async function getModelById(id: string): Promise<Model | null> {
  console.log(`[SERVER] Fetching individual model with ID: ${id}`);

  try {
    const res = await fetch(`https://dashboard.lascade.com/travel_animator/v0/web/models/${id}`, {
      headers: {
        "accept": "application/json",
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      console.log(`[SERVER] Model with ID ${id} not found (${res.status})`);
      return null;
    }

    const model: Model = await res.json();
    console.log(`[SERVER] Successfully fetched model with ID ${id}`);
    return model;
  } catch (error) {
    console.error(`[SERVER] Error fetching model with ID ${id}:`, error);
    return null;
  }
}

// Create a usage map from PostHog data
export async function getModelUsageMap(): Promise<Map<string, number>> {
  try {
    const POSTHOG_PROJECT_ID = "107752";
    const POSTHOG_PERSONAL_API_KEY = 'phx_tDIWFmhgN2JB7INm0sfvJ3PHWbZCAHr6CMU25J5DVm55jFI';
    const shortId = 'wWjNhQcp';

    const response = await fetch(
      `https://us.posthog.com/api/projects/${POSTHOG_PROJECT_ID}/insights/?short_id=${shortId}`,
      {
        headers: {
          Authorization: `Bearer ${POSTHOG_PERSONAL_API_KEY}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error(`PostHog API error: ${response.status}`);
      return new Map();
    }

    const data = await response.json();
    const results = data.results?.[0]?.result || [];

    // Create a map: model_id -> rank (lower rank = more used)
    const usageMap = new Map<string, number>();
    results.forEach((item: string[], index: number) => {
      const modelId = item[0]; // First element is model_id
      usageMap.set(modelId, index); // index represents rank
    });
    
    return usageMap;
  } catch (error) {
    console.error('[BUILD] Error fetching PostHog data:', error);
    return new Map();
  }
}
