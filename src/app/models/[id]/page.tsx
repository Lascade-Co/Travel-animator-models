import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getModelSlugs, getModelBySlug } from '../../models_cache';
import styles from './modelDetail.module.css';
import RelatedModels from './related_models';
import Navbar from '@/app/components/navbar';

// Generate static params for all models
export async function generateStaticParams() {
    console.log('[BUILD] Generating static params for model pages...');

    const modelSlugs = await getModelSlugs();

    const params = modelSlugs.map(slug => ({ id: slug }));

    console.log(`[BUILD] Generated ${params.length} static params for model pages`);
    return params;
}

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

// Generate metadata for each model page
export async function generateMetadata({ params }: { params: { id: string } }) {
    const model = await getModelBySlug(params.id);

    if (!model) {
        return {
            title: 'Model Not Found - Travel Animator',
            description: 'The requested model could not be found.',
        };
    }

    return {
        title: `${toTitleCase(model.name)} — Models - Travel Animator`,
        description: model.description ? truncateToWords(model.description, 20) : `3D model: ${toTitleCase(model.name)}`,
    };
}

// Props interface
interface PageProps {
    params: {
        id: string;
    };
}

// Main page component
export default async function ModelDetailPage({ params }: PageProps) {
    console.log('ModelDetailPage rendering with params:', params);

    const model = await getModelBySlug(params.id);
    console.log('Model found:', model);

    if (!model) {
        console.log('Model not found, showing 404');
        notFound();
    }

    console.log('About to render model detail page');

    return (
        <>
            <div style={{ backgroundColor: '#0A161C', minHeight: '100vh', color: '#fff', margin: '12px', padding: 0 }}>
                <div className={styles.navbarWrapper}>
                    <Navbar/>
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
                                    <div id="md-description">
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
                                src={model.textures?.[0]?.thumbnail || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjI0IiBoZWlnaHQ9IjIyNCIgdmlld0JveD0iMCAwIDIyNCAyMjQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMjQiIGhlaWdodD0iMjI0IiByeD0iNDgiIGZpbGw9IiMzMzMiLz4KPHN2ZyB4PSI5MiIgeT0iOTIiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjNjY2Ij4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iY3VycmVudENvbG9yIj4KICA8cGF0aCBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGQ9Im0yLjI1IDEyIDguOTU0LTguOTU1YTEuMTI2IDEuMTI2IDAgMCAxIDEuNTkxIDBMMjEuNzUgMTIiIC8+CiAgPHBhdGggc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBkPSJtNy40OTggOC44NyA3LjgwNCA3LjgwNCIgLz4KICA8cGF0aCBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGQ9Im0yLjI1IDE4VjIyYTMuNzUgMy43NSAwIDAgMCAzLjc1IDMuNzVIMThhMy43NSAzLjUgMCAwIDAgMy43NS0zLjc1di00TTEzLjUgMjF2MS41IiAvPgo8L3N2Zz4KPC9zdmc+Cjwvc3ZnPg=='}
                                alt={model.name || "Model"}
                                width={224}
                                height={224}
                                style={{
                                    width: '14rem',
                                    height: '14rem',
                                    borderRadius: '48px',
                                    objectFit: 'cover'
                                }}
                            />
                        </div>

                        <RelatedModels currentSlug={params.id} currentModel={model} />
                    </div>
                </section>
            </div>
        </>
    );
}

// Force static generation (no revalidation)
export const dynamic = 'force-static';
export const revalidate = false;