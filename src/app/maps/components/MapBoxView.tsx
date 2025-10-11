"use client";

import { useEffect, useRef } from "react";
import mapboxgl, { Map } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Minimize } from 'lucide-react';

interface FullScreenMapProps {
  mapUrl: string;
  onClose: () => void;
}

export default function FullScreenMap({ mapUrl, onClose }: FullScreenMapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "";

    mapInstance.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapUrl,
      center: [77.5946, 12.9716],
      zoom: 10,
    });

    mapInstance.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, [mapUrl]);

  return (
    <div
      className="fullscreen-map-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        backgroundColor: "#000",
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 10000,
          background: "rgba(0, 0, 0, 0.8)",
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '0.5rem',
          borderRadius: '12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Minimize
        onClick={onClose}
        style={{
          width: '30px',
          height: '30px',
          color: '#fff'
        }}
      />
      </button>      

      <div
        ref={mapContainer}
        style={{ width: "100%", height: "100%", borderRadius: "0" }}
      />
    </div>
  );
}
