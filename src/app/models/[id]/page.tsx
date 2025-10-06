import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getModelSlugs, getModelById, Model, getAllModels, getModelDetailById } from '../../models_cache';
import styles from './modelDetail.module.css';
import RelatedModels from './related_models';
import Navbar from '@/app/components/navbar';
import boat from '../../images/boat.png'
import travelAnimator from '../../images/travel_animator.png';

// Generate static params for all models
export async function generateStaticParams() {
    console.log('[BUILD] Generating static params for model pages...');

    const modelSlugs = await getModelSlugs();

    const params = modelSlugs.map(id => ({ id: id }));

    console.log(`[BUILD] Generated ${params.length} static params for model pages`);
    return params;
}

// Enable fallback for new models added after build time
export const dynamicParams = true;

// Utility functions
const toTitleCase = (str: string | undefined | null): string => {
    return String(str || '').replace(/\w\S*/g, (txt) =>
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
};

const truncateToWords = (text: string | undefined | null, maxWords: number): string => {
    if (!text) return '';
    const words = text.trim().split(/\s+/);
    if (words.length <= maxWords) {
        return text;
    }
    return words.slice(0, maxWords).join(' ') + '...';
};

// Props interface
interface PageProps {
    params: {
        id: string;
    };
}

// Main page component
export default async function ModelDetailPage({ params }: PageProps) {
    console.log('ModelDetailPage rendering with params:', params);

    // Parse id_slug format
    const idSlug = params.id;
    const underscoreIndex = idSlug.indexOf('_');

    let model: Model | null = null;

    if (underscoreIndex !== -1) {
        // Extract ID from id_slug format
        const modelId = idSlug.substring(0, underscoreIndex);
        const slug = idSlug.substring(underscoreIndex + 1);

        console.log(`Parsed ID: ${modelId}, Slug: ${slug}`);

        // First try to get from cached models by slug (for pre-rendered pages)
        model = await getModelDetailById(modelId);

        // If not found in cache, try fetching by ID (for new models)
        if (!model && modelId) {
            console.log('Model not found in cache, attempting server fetch by ID...');
            model = await getModelById(modelId);
        }
    }

    if (!model) {
        console.log('Model not found, showing 404');
        notFound();
    }

    console.log('About to render model detail page');

    const allModels = await getAllModels();

    // Calculate related models
    const getRelatedModels = (currentModel: Model, allModels: Model[]): Model[] => {
        const currentIndex = allModels.findIndex(m => m.id === currentModel.id);
        if (currentIndex === -1) return [];

        const numRelatedModels = 6;
        const relatedModels: Model[] = [];

        for (let i = 1; i <= numRelatedModels; i++) {
            const nextIndex = (currentIndex + i) % allModels.length;
            relatedModels.push(allModels[nextIndex]);
        }

        return relatedModels;
    };

    const relatedModels = getRelatedModels(model, allModels);

    return (
        <>
            <div style={{ backgroundColor: '#0A161C', color: '#fff', margin: '12px', padding: 0 }}>
                <div className={styles.navbarWrapper}>
                    <Navbar />
                </div>
                <section id="detail-section">
                    <div className={styles.wrapper}>
                        <Link href="/" className={styles.backLink}>
                            <Image
                                src="https://travelanimator.com/wp-content/uploads/2025/09/back_arrow.svg"
                                alt="Back arrow"
                                width={20}
                                height={20}
                            />
                            Back to all models
                        </Link>

                        <div id="md-hero-wrap" className={styles.heroWrap} style={{ marginBottom: '16px' }}>
                            <div className={styles.descriptionAndCategory}>
                                <h1 className={styles.modelsTitle}>
                                    {toTitleCase(model.name || "")}
                                </h1>
                                <div style={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    justifyContent: 'center'
                                }}>
                                    <div id="md-description" className={styles.md_description}>
                                        {model.description ?
                                            truncateToWords(model.description, 100) :
                                            "No description available for this model."
                                        }
                                    </div>
                                    <div className={styles.categoryInfo}>
                                        <strong>Category:</strong> <span>{toTitleCase(model.category || "Uncategorized")}</span>
                                    </div>
                                </div>
                            </div>
                            <Image
                                id="md-hero"
                                src={
                                    model.cover_image
                                        ? model.cover_image
                                        : model.textures?.[0]?.thumbnail
                                            ? model.textures[0].thumbnail
                                            : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjI0IiBoZWlnaHQ9IjIyNCIgdmlld0JveD0iMCAwIDIyNCAyMjQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+...'
                                }
                                alt={model.name || "Model"}
                                width={224}
                                height={224}
                                style={{
                                    width: '14rem',
                                    height: '14rem',
                                    borderRadius: '48px',
                                    objectFit: 'cover',
                                }}
                            />

                        </div>

                        <RelatedModels relatedModels={relatedModels} />
                    </div>
                </section>

                <div className={styles.footer}>
                    <div className={styles.earth_2}></div>
                    <Image width={0} height={0} src={boat} alt="boat" className={styles.boat} />
                    <div className={styles.sub_heading}></div>

                    <div className={styles.travel_animator}>
                        <Image width={0} height={0} src={travelAnimator} alt="Travel Animator" />
                    </div>
                    <div className={styles.privacy_section}>
                        <a href="https://travelanimator.com/privacy-policy/" className={styles.privacy_policy}>Privacy Policy</a>
                        <a href="https://travelanimator.com/terms-of-service/" className={styles.privacy_policy} style={{ textDecoration: 'none' }}>Terms of Service</a>
                        <a href='https://travelanimator.com/privacy-policy/' className={styles.privacy_policy}>Cookie Policy</a>
                    </div>
                    <div className={styles.copyright_section}>
                        <span className="cc-icon" role="img" aria-label="Copyright">©</span>
                        Travel Animator - 2025
                    </div>
                </div>
            </div>
        </>
    );
}

// ISR: Revalidate every 24 hours (21600 seconds)
export const revalidate = 86400; // Change to your preferred time