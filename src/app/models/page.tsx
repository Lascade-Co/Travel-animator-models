import ModelsGridClient from '../components/models_grid_Client';
import { getAllModels, getModelUsageMap } from '../models_cache';

// Metadata for the page
export const metadata = {
  title: 'Models - Travel Animator',
  description: 'Browse our collection of 3D models for travel animation',
};

export default async function ModelsPage() {
  // Fetch all models at build time (cached)
  const models = await getAllModels();
  
  // Fetch PostHog usage data at build time
  const usageMap = await getModelUsageMap();
  
  // Sort models by usage within their categories
  const sortedModels = models.sort((a, b) => {
    // IMPORTANT: Convert IDs to strings for comparison
    const idA = String(a.id || '');
    const idB = String(b.id || '');
    
    const rankA = usageMap.get(idA) ?? Infinity;
    const rankB = usageMap.get(idB) ?? Infinity;
    
    return rankA - rankB; // Lower rank = more used = comes first
  });

  return (
    <div>
      <ModelsGridClient initialModels={sortedModels} />
    </div>
  );
}

// Force server-side rendering
export const dynamic = 'force-dynamic';