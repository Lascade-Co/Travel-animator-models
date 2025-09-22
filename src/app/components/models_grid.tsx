'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Header from "./header";
import Link from "next/link";
import './models_grid.css';

// Type definitions
interface ModelsGridProps {
    initialModels?: Model[];
}

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

interface GroupedModels {
    [category: string]: Model[];
}

interface ApiResponse {
    results?: Model[];
    next?: string;
}

export default function ModelsGrid({ initialModels }: ModelsGridProps = {}) {
    const router = useRouter();
    // const pathname = usePathname();

    // Check if we're on a detail page (pattern: /models/{slug})
    // COMMENTED OUT:
    // const isDetailPage = pathname.match(/\/models\/([^\/]+)\/?$/);
    // const currentSlug = isDetailPage ? isDetailPage[1] : null;

    // const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const [currentSlug, setCurrentSlug] = useState<string | null>(null);
    // const isDetailPage = !!currentSlug;

    // State management
    const [models, setModels] = useState<Model[]>(initialModels || []);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentModel, setCurrentModel] = useState<Model | null>(null);
    const [showDetail, setShowDetail] = useState<boolean>(!!currentSlug);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

    // Refs
    const observerRef = useRef<IntersectionObserver | null>(null);
    // const renderedModelsRef = useRef<Set<string>>(new Set());
    // const categorySectionsRef = useRef<Map<string, HTMLElement>>(new Map());
    const containerRef = useRef<HTMLDivElement | null>(null);

    // Utility functions
    const toTitleCase = (str: string | undefined | null): string => {
        return String(str || '').replace(/\w\S*/g, (txt) =>
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    };

    const slugify = (str: string | undefined | null): string => {
        return String(str || '').toLowerCase().trim()
            .replace(/[\s_]+/g, '-')
            .replace(/[^a-z0-9\-]/g, '')
            .replace(/\-+/g, '-');
    };

    const truncateToWords = (text: string | undefined | null, maxWords: number): string => {
        if (!text) return '';
        const words = text.trim().split(/\s+/);
        if (words.length <= maxWords) {
            return text;
        }
        return words.slice(0, maxWords).join(' ') + '...';
    };

    // Lazy loading setup
    const setupIntersectionObserver = useCallback(() => {
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        observerRef.current = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target.querySelector('img');
                    if (img && img.dataset.src && !img.classList.contains('loaded')) {
                        entry.target.classList.add('loading');
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');

                        img.onload = () => {
                            img.classList.add('loaded');
                            entry.target.classList.remove('loading');
                            entry.target.classList.add('loaded');
                        };

                        img.onerror = () => {
                            img.classList.add('loaded');
                            entry.target.classList.remove('loading');
                            entry.target.classList.add('loaded');
                        };
                    }
                    if (observerRef.current) {
                        observerRef.current.unobserve(entry.target);
                    }
                }
            });
        }, {
            rootMargin: '100px',
            threshold: 0.1
        });
    }, []);

    // Load models from API
    const loadModels = useCallback(async () => {
        if (initialModels && initialModels.length > 0) {
            setLoading(false);
            return;
        }
        try {
            let url: string | null = "https://dashboard.lascade.com/travel_animator/v0/web/models";
            const allResults: Model[] = [];
            let batchCount = 0;

            while (url) {
                batchCount++;
                console.log(`Loading batch ${batchCount} from: ${url}`);

                const res = await fetch(url, {
                    headers: {
                        "accept": "application/json",
                        "X-CSRFTOKEN": "tdZ0CBLlvwkBMLxiFUd92zcho51IJ2mxmLisBlIlG3DQKFuvCqlEffax94XVubp5"
                    }
                });

                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const data: ApiResponse = await res.json();
                const newModels: Model[] = data.results || [];
                console.log(`Loaded ${newModels.length} models in batch ${batchCount}`);

                allResults.push(...newModels);

                // If we're looking for a specific model and found it
                if (currentSlug) {
                    const targetModel = allResults.find(m => slugify(m.name || "") === currentSlug);
                    if (targetModel) {
                        setModels(allResults);
                        setCurrentModel(targetModel);
                        setLoading(false);
                        return;
                    }
                }

                // For grid view: update models progressively
                if (!currentSlug && newModels.length > 0) {
                    setModels([...allResults]);
                    if (batchCount === 1) {
                        setLoading(false);
                    }
                }

                url = data.next || null;

                if (url) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }

            console.log(`Finished loading all models. Total: ${allResults.length}`);
            setLoading(false);

            if (currentSlug && allResults.length > 0) {
                console.warn(`Model with slug '${currentSlug}' not found`);
                router.push('/models');
            }

        } catch (err) {
            setLoading(false);
            console.error('Error loading models:', err);
        }
    }, [currentSlug, router, initialModels]);

    // Handle model click
    const handleModelClick = (e: React.MouseEvent, model: Model) => {
        e.preventDefault();
        const slug = slugify(model.name || "");

        // Change this line:
        // window.location.href = `?m=${slug}`;

        // To this:
        window.location.href = `/models/${slug}`;
    };

    const handleBackToGrid = (e: React.MouseEvent) => {
        e.preventDefault();

        // Change this line:
        // window.location.href = window.location.pathname;

        // To this:
        window.location.href = '/models';
    };

    // Expand/collapse section handlers
    const expandSection = (category: string) => {
        setExpandedSections(prev => new Set([...prev, category]));
    };

    const collapseSection = (category: string) => {
        setExpandedSections(prev => {
            const newSet = new Set([...prev]);
            newSet.delete(category);
            return newSet;
        });
    };

    // Effects
    useEffect(() => {
        setShowDetail(!!currentSlug);
        loadModels();
        setupIntersectionObserver();

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [currentSlug, loadModels, setupIntersectionObserver]);

    useEffect(() => {
        // Handle URL parsing on client side only to prevent hydration mismatch
        if (typeof window !== 'undefined') {
            // Change this logic to detect dynamic routes instead of query params
            const path = window.location.pathname;
            const modelMatch = path.match(/\/models\/([^\/]+)$/);
            const slug = modelMatch ? modelMatch[1] : null;
            setCurrentSlug(slug);
            setShowDetail(!!slug);
        }
    }, []);

    // Group models by category
    const groupedModels: GroupedModels = models.reduce((acc: GroupedModels, model: Model) => {
        const category = model.category || "Uncategorized";
        if (!acc[category]) acc[category] = [];
        acc[category].push(model);
        return acc;
    }, {});

    // Get related models for detail view
    const getRelatedModels = (currentModel: Model | null, allModels: Model[]): Model[] => {
        if (!currentModel || !allModels.length) return [];

        const currentIndex = allModels.findIndex(m => slugify(m.name || "") === currentSlug);
        if (currentIndex === -1) return [];

        const numRelatedModels = typeof window !== 'undefined' && (window.innerWidth <= 480 || window.innerWidth <= 768) ? 6 : 5;
        const relatedModels: Model[] = [];

        for (let i = 1; i <= numRelatedModels; i++) {
            const nextIndex = (currentIndex + i) % allModels.length;
            relatedModels.push(allModels[nextIndex]);
        }

        return relatedModels;
    };

    const relatedModels = currentModel ? getRelatedModels(currentModel, models) : [];

    return (
        <>
            <Head>
                <title>{currentModel ? `${toTitleCase(currentModel.name)} – Models` : 'Models'}</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
                    rel="stylesheet"
                />
            </Head>

            {/* Conditionally render Header - only show on grid view, not on detail pages */}
            {!showDetail && <Header />}

            <div style={{ backgroundColor: '#0A161C', minHeight: '100vh', color: '#fff' }}>
                {!showDetail ? (
                    // Grid Section
                    <div id="grid-section">
                        <div id="models-container" ref={containerRef}>
                            {loading && (
                                <div className="loading-container">
                                    <div className="loading-spinner"></div>
                                    <p className="loading-text">Loading models...</p>
                                </div>
                            )}

                            {!loading && Object.keys(groupedModels).map(category => {
                                const categoryModels = groupedModels[category];
                                const isExpanded = expandedSections.has(category);

                                return (
                                    <div
                                        key={category}
                                        className={`models-section ${isExpanded ? 'expanded' : 'height-limited'}`}
                                    >
                                        <h2>{toTitleCase(category)}</h2>
                                        <div className="models-grid">
                                            {categoryModels.map((model, index) => {
                                                const thumb = model.textures?.[0]?.thumbnail || "";
                                                const name = model.name || "";

                                                return (
                                                    <div
                                                        key={model.id || index}
                                                        className="model-card loaded"
                                                        onClick={(e) => handleModelClick(e, model)}
                                                    >
                                                        <img
                                                            src={thumb || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkzIiBoZWlnaHQ9IjE5MyIgdmlld0JveD0iMCAwIDE5MyAxOTMiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxOTMiIGhlaWdodD0iMTkzIiByeD0iNDgiIGZpbGw9IiMzMzMiLz4KPHN2ZyB4PSI3NiIgeT0iNzYiIHdpZHRoPSI0MSIgaGVpZ2h0PSI0MSIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjNjY2Ij4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iY3VycmVudENvbG9yIj4KICA8cGF0aCBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGQ9Im0yLjI1IDEyIDguOTU0LTguOTU1YTEuMTI2IDEuMTI2IDAgMCAxIDEuNTkxIDBMMjEuNzUgMTIiIC8+CiAgPHBhdGggc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBkPSJtNy40OTggOC44NyA3LjgwNCA3LjgwNCIgLz4KICA8cGF0aCBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGQ9Im0yLjI1IDE4VjIyYTMuNzUgMy43NSAwIDAgMCAzLjc1IDMuNzVIMThhMy43NSAzLjc1IDAgMCAwIDMuNzUtMy43NXYtNE0xMy41IDIxdjEuNSIgLz4KPC9zdmc+Cjwvc3ZnPgo8L3N2Zz4='}
                                                            alt={name}
                                                            className="loaded"
                                                        />
                                                        <p>{toTitleCase(name)}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Expand/Collapse buttons */}
                                        {!isExpanded && (
                                            <div className="expand-button">
                                                <button onClick={() => expandSection(category)}>
                                                    Show More <span style={{ marginLeft: '8px' }}>↓</span>
                                                </button>
                                            </div>
                                        )}

                                        {isExpanded && (
                                            <div className="collapse-button">
                                                <button onClick={() => collapseSection(category)}>
                                                    Show Less <span style={{ marginLeft: '8px' }}>↑</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    // Detail Section
                    currentModel && (
                        <section id="detail-section">
                            <div className="wrapper">
                                <Link
                                    href="/models"
                                    style={{
                                        width: '14rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        marginBottom: '16px',
                                        fontFamily: "'Nunito', sans-serif",
                                        fontWeight: 700,
                                        fontSize: '18px',
                                        color: '#fff',
                                        textDecoration: 'none',
                                        opacity: 0.9
                                    }}
                                >
                                    <img src="https://travelanimator.com/wp-content/uploads/2025/09/back_arrow.svg" alt="" />
                                    Back to all models
                                </Link>

                                <div id="md-hero-wrap" style={{ marginBottom: '16px' }}>
                                    <div className="description-and-category">
                                        <h2 className="models-title" style={{ margin: '0px' }}>
                                            {toTitleCase(currentModel.name || "")}
                                        </h2>
                                        <div style={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-start',
                                            justifyContent: 'center'
                                        }}>
                                            <div id="md-description">
                                                {currentModel.description ?
                                                    truncateToWords(currentModel.description, 100) :
                                                    ""
                                                }
                                            </div>
                                            <div style={{
                                                opacity: 0.9,
                                                lineHeight: 1.6,
                                                marginTop: '1rem'
                                            }}>
                                                <div style={{
                                                    fontFamily: "'Nunito', sans-serif",
                                                    fontWeight: 800,
                                                    fontSize: '16px',
                                                    lineHeight: '137%',
                                                    letterSpacing: '-3%'
                                                }}>
                                                    <strong>Category:</strong> <span>{toTitleCase(currentModel.category || "Uncategorized")}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <img
                                        id="md-hero"
                                        src={currentModel.textures?.[0]?.thumbnail || ""}
                                        alt={currentModel.name || ""}
                                    />
                                </div>
                            </div>

                            <div className="md-two-col">
                                {relatedModels.length > 0 && (
                                    <div className="md-card" style={{ padding: '16px' }}>
                                        <h3 style={{
                                            margin: '0 0 8px',
                                            fontFamily: "'Nunito', sans-serif",
                                            fontWeight: 800,
                                            fontSize: '18px'
                                        }}>
                                            Related Models
                                        </h3>
                                        <div
                                            id="md-related-models"
                                            className="models-grid"
                                            style={{ width: '55%' }}
                                        >
                                            {relatedModels.map((relatedModel, index) => {
                                                const thumb = relatedModel.textures?.[0]?.thumbnail || "";
                                                const name = relatedModel.name || "";

                                                return (
                                                    <div
                                                        key={relatedModel.id || index}
                                                        className="model-card"
                                                        onClick={(e) => handleModelClick(e, relatedModel)}
                                                        style={{
                                                            opacity: 1,
                                                            visibility: 'visible',
                                                            transform: 'translateY(0)'
                                                        }}
                                                    >
                                                        <img
                                                            src={thumb || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iMjQiIGZpbGw9IiMzMzMiLz4KPHN2ZyB4PSIzOSIgeT0iMzkiIHdpZHRoPSIyMiIgaGVpZ2h0PSIyMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjNjY2Ij4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iY3VycmVudENvbG9yIj4KICA8cGF0aCBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGQ9Im0yLjI1IDEyIDguOTU0LTguOTU1YTEuMTI2IDEuMTI2IDAgMCAxIDEuNTkxIDBMMjEuNzUgMTIiIC8+CiAgPHBhdGggc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBkPSJtNy40OTggOC44NyA3LjgwNCA3LjgwNCIgLz4KICA8cGF0aCBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGQ9Im0yLjI1IDE4VjIyYTMuNzUgMy43NSAwIDAgMCAzLjc1IDMuNzVIMThhMy43NSAzLjc1IDAgMCAwIDMuNzUtMy43NXYtNE0xMy41IDIxdjEuNSIgLz4KPC9zdmc+Cjwvc3ZnPgo8L3N2Zz4='}
                                                            alt={name}
                                                            style={{
                                                                width: '100px',
                                                                height: '100px',
                                                                borderRadius: '24px',
                                                                objectFit: 'cover',
                                                                opacity: 1
                                                            }}
                                                        />
                                                        <p style={{
                                                            width: '5rem',
                                                            overflow: 'hidden',
                                                            whiteSpace: 'nowrap',
                                                            textOverflow: 'ellipsis',
                                                            color: '#fff',
                                                            opacity: 1,
                                                            visibility: 'visible'
                                                        }}>
                                                            {toTitleCase(name)}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    )
                )}
            </div>
        </>
    );
}