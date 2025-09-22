import { getAllModels } from '../models_cache';
import ModelsGridClient from './models_grid_Client';

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

interface ModelsGridProps {
    initialModels?: Model[];
}

export default async function ModelsGrid({ initialModels }: ModelsGridProps = {}) {
    // Fetch models on the server
    const models = initialModels || await getAllModels();

    return <ModelsGridClient initialModels={models} />;
}