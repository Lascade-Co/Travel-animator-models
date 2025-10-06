"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Header from "./header";
import Link from "next/link";
import Image from 'next/image';
import './models_grid.css';
import boat from '../images/boat.png';
import travelAnimator from '../images/travel_animator.png';
import { Texture } from '../models_cache';

// Type definitions
interface ModelsGridProps {
    initialModels?: Model[];
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

export default function ModelsGridClient({ initialModels = [] }: ModelsGridProps) {
    const router = useRouter();

    const [currentSlug, setCurrentSlug] = useState<string | null>(null);

    const [models] = useState<Model[]>(initialModels);

    // Debug: Check if sorted models are received
    useEffect(() => {
        console.log('[CLIENT] Received models count:', models.length);
        console.log('[CLIENT] First 5 models:', models.slice(0, 5).map(m => ({ id: m.id, name: m.name })));
    }, [models]);

    const [currentModel, setCurrentModel] = useState<Model | null>(null);
    const [showDetail, setShowDetail] = useState<boolean>(false);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

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

    // Handle model click
    const handleModelClick = (e: React.MouseEvent, model: Model) => {
        e.preventDefault();
        const slug = slugify(model.name || "");
        const idSlug = `${model.id}_${slug}`; // Change to id_slug format
        window.location.href = `/models/${idSlug}`;
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
    // REPLACE the existing useEffect with this simplified version:
    useEffect(() => {
        // Handle URL parsing on client side only to prevent hydration mismatch
        if (typeof window !== 'undefined') {
            const path = window.location.pathname;
            const modelMatch = path.match(/\/models\/([^\/]+)$/);
            const slug = modelMatch ? modelMatch[1] : null;
            setCurrentSlug(slug);
            setShowDetail(!!slug);

            if (slug && models.length > 0) {
                const targetModel = models.find(m => slugify(m.name || "") === slug);
                if (targetModel) {
                    setCurrentModel(targetModel);
                } else {
                    router.push('/models');
                }
            }
        }
        // Remove setupIntersectionObserver() call and cleanup
    }, [models, router]); // Remove setupIntersectionObserver from dependencies

    // Group models by category WHILE PRESERVING SORT ORDER
    const groupedModels: GroupedModels = {};

    // Initialize empty arrays for each category first
    models.forEach((model: Model) => {
        const category = model.category || "Uncategorized";
        if (!groupedModels[category]) {
            groupedModels[category] = [];
        }
    });

    // Now add models in their sorted order
    models.forEach((model: Model) => {
        const category = model.category || "Uncategorized";
        groupedModels[category].push(model);
    });

    // Debug: Log the first model in each category
    console.log('[CLIENT] First model in each category:');
    Object.keys(groupedModels).forEach(category => {
        const firstModel = groupedModels[category][0];
        console.log(`  ${category}: ${firstModel.name} (ID: ${firstModel.id})`);
    });

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
                <title>{currentModel ? `${toTitleCase(currentModel.name)} — Models` : 'Models'}</title>
                {/* <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
                    rel="stylesheet"
                /> */}
            </Head>

            {/* Conditionally render Header - only show on grid view, not on detail pages */}
            {!showDetail && <Header />}

            <div style={{ backgroundColor: '#0A161C', color: '#fff' }}>
                {!showDetail ? (
                    // Grid Section
                    <div id="grid-section">
                        <div id="models-container">
                            {Object.keys(groupedModels).map(category => {
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
                                                    Show More
                                                </button>
                                            </div>
                                        )}

                                        {isExpanded && (
                                            <div className="collapse-button">
                                                <button onClick={() => collapseSection(category)}>
                                                    Show Less
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
                                                const slug = slugify(name);
                                                const idSlug = `${relatedModel.id}_${slug}`; // Add this line

                                                return (
                                                    <div
                                                        key={relatedModel.id || index}
                                                        className="model-card"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            window.location.href = `/models/${idSlug}`; // Use idSlug instead of slug
                                                        }}
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

            <div className="footer">
                <div className="earth_2"></div>
                <Image width={0} height={0} src={boat} alt="boat" className="boat" />
                <div className="sub-heading"></div>

                <div className="travel_animator">
                    <Image width={0} height={0} src={travelAnimator} alt="Travel Animator" />
                </div>
                <div className="privacy-section">
                    <a href="" className="privacy-policy">Privacy Policy</a>
                    <a href="" className="privacy-policy" style={{ textDecoration: 'none' }}>Terms of Service</a>
                    <div className="privacy-policy">Cookie Policy</div>
                </div>
                <div className="copyright-section">
                    <span className="cc-icon" role="img" aria-label="Copyright">©</span>
                    Travel Animator - 2025
                </div>
            </div>
        </>
    );
}