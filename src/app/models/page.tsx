import ModelsGridClient from '../components/models_grid_Client';
import { getAllModels } from '../models_cache';

// Metadata for the page
export const metadata = {
  title: 'Models - Travel Animator',
  description: 'Browse our collection of 3D models for travel animation',
};

// Main page component
export default async function ModelsPage() {
  // Fetch all models at build time (cached)
  const models = await getAllModels();

  console.log('[MODELS PAGE] Models fetched:', models?.length || 0);
  console.log('[MODELS PAGE] First few models:', models?.slice(0, 3));

  return (
    <div>
      <ModelsGridClient initialModels={models} />
    </div>
  );
}

// Force static generation (no revalidation)
export const dynamic = 'force-static';
export const revalidate = false;