'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './modelDetail.module.css'

interface Model {
  id?: string;
  name?: string;
  category?: string;
  textures?: { thumbnail?: string }[];
}

interface RelatedModelsProps {
  currentSlug: string;
  currentModel: Model;
}

export default function RelatedModels({ currentSlug, currentModel }: RelatedModelsProps) {
  const [relatedModels, setRelatedModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  const slugify = (str: string | undefined | null): string => {
    return String(str || '').toLowerCase().trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9\-]/g, '')
      .replace(/\-+/g, '-');
  };

  const toTitleCase = (str: string | undefined | null): string => {
    return String(str || '').replace(/\w\S*/g, (txt) =>
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  };

  useEffect(() => {
    async function fetchRelatedModels() {
      try {
        const response = await fetch('https://dashboard.lascade.com/travel_animator/v0/web/models', {
          headers: {
            "accept": "application/json",
            "X-CSRFTOKEN": "tdZ0CBLlvwkBMLxiFUd92zcho51IJ2mxmLisBlIlG3DQKFuvCqlEffax94XVubp5"
          }
        });

        const data = await response.json();
        const allModels: Model[] = data.results || [];

        // Find current model index
        const currentIndex = allModels.findIndex(m => slugify(m.name || "") === currentSlug);

        if (currentIndex !== -1 && allModels.length > 1) {
          const numRelated = typeof window !== 'undefined' && window.innerWidth <= 768 ? 6 : 5;
          const related: Model[] = [];

          for (let i = 1; i <= numRelated; i++) {
            const nextIndex = (currentIndex + i) % allModels.length;
            related.push(allModels[nextIndex]);
          }

          setRelatedModels(related);
        }
      } catch (error) {
        console.error('Failed to load related models:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRelatedModels();
  }, [currentSlug]);

  if (loading) {
    return (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <p style={{ color: '#fff', opacity: 0.7 }}>Loading related models...</p>
      </div>
    );
  }

  if (relatedModels.length === 0) {
    return null;
  }

  return (
    <div className={styles.relatedModels}>
      <div className={styles.cards} style={{ padding: '16px' }}>
        <h3>
          Related Models
        </h3>
        <div className={styles.modelsGrid}>
          {relatedModels.map((model, index) => {
            const thumb = model.textures?.[0]?.thumbnail || '';
            const name = model.name || '';
            const slug = slugify(name);

            return (
              <Link 
                key={model.id || index} 
                href={`/models/${slug}/`}
                className={styles.modelCard}
                style={{ textDecoration: 'none' }}
              >
                <Image
                  src={thumb || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iMjQiIGZpbGw9IiMzMzMiLz48L3N2Zz4='}
                  alt={name}
                  width={80}
                  height={80}
                  style={{
                    borderRadius: '24px',
                    objectFit: 'cover'
                  }}
                />
                <p style={{
                  width: '100%',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  color: '#fff',
                  marginTop: '8px',
                  fontSize: '0.8rem',
                  textAlign: 'center'
                }}>
                  {toTitleCase(name)}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}