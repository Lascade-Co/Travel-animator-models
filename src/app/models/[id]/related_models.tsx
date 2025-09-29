'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './modelDetail.module.css'
import { Model } from '@/app/models_cache';

interface RelatedModelsProps {
  relatedModels: Model[];
}

export default function RelatedModels({ relatedModels }: RelatedModelsProps) {
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  useEffect(() => {
    // Check screen size on mount and resize
    const checkScreenSize = () => {
      setIsMobileOrTablet(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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

  if (relatedModels.length === 0) {
    return null;
  }

  // Show 6 models on mobile/tablet, 5 on desktop
  const modelsToShow = isMobileOrTablet ? relatedModels.slice(0, 6) : relatedModels.slice(0, 5);

  return (
    <div className={styles.relatedModels}>
      <div className={styles.cards} style={{ padding: '16px' }}>
        <h3>
          Related Models
        </h3>
        <div className={styles.modelsGrid}>
          {modelsToShow.map((model, index) => {
            const thumb = model.textures?.[0]?.thumbnail || '';
            const name = model.name || '';
            const slug = slugify(name);

            return (
              <Link
                key={model.id || index}
                href={`/models/${model.id}_${slug}/`}
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