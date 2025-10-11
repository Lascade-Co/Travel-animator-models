"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Map } from "./maps_page";
import FullScreenMap from "./MapBoxView";

interface MapsGridProps {
  maps: Map[];
}

export default function MapsGrid({ maps }: MapsGridProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [selectedMap, setSelectedMap] = useState<Map | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal");
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    const cards = document.querySelectorAll(".map-card");
    cards.forEach((card) => observerRef.current?.observe(card));

    return () => observerRef.current?.disconnect();
  }, [maps]);

  return (
    <>
      <div className="maps-grid">
        {maps.map((map) => (
          <div
            key={map.id}
            className="map-card"
            onClick={() => setSelectedMap(map)}
            style={{ cursor: "pointer" }}
          >
            <div className="map-thumbnail">
              <Image
                src={map.thumbnail}
                alt={map.name}
                width={500}
                height={300}
                className="thumbnail-image"
              />
            </div>
            <h3 className="map-name">{map.name}</h3>
          </div>
        ))}
      </div>

      {selectedMap && (
        <FullScreenMap
          mapUrl={selectedMap.map_url}
          onClose={() => setSelectedMap(null)}
        />
      )}
    </>
  );
}
