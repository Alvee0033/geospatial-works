'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, Navigation2, Compass } from 'lucide-react';

interface MapboxOfficeMapProps {
  lat?: number;
  lng?: number;
  zoom?: number;
  heightClass?: string;
  className?: string;
  theme?: 'dark' | 'light';
  interactive?: boolean;
}

export default function MapboxOfficeMap({
  lat = 23.7505,
  lng = 90.3807,
  zoom = 15,
  heightClass = 'h-[300px] sm:h-[340px]',
  className = '',
  theme = 'dark',
  interactive = true,
}: MapboxOfficeMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);

  const isDark = theme === 'dark';

  useEffect(() => {
    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        const map = L.map(mapContainerRef.current, {
          zoomControl: false,
          scrollWheelZoom: false,
          dragging: interactive,
          touchZoom: interactive,
          attributionControl: false,
        }).setView([lat, lng], zoom);

        mapInstanceRef.current = map;

        // Professional ESRI ArcGIS Canvas Tiles (Dark Gray for dark theme, Light Gray for light theme)
        const tileUrl = isDark
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
          : 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';

        L.tileLayer(tileUrl, {
          maxZoom: 16,
          attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
        }).addTo(map);

        // Geodetic precision circle
        L.circle([lat, lng], {
          radius: 80,
          color: '#FB1D10',
          weight: 1,
          opacity: 0.6,
          fillColor: '#FB1D10',
          fillOpacity: 0.08,
          dashArray: '3, 4',
        }).addTo(map);

        // Custom Minimal Engineering Pin
        const pinIcon = L.divIcon({
          className: 'gw-minimal-map-pin',
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%);">
              <span style="position: absolute; width: 28px; height: 28px; border-radius: 9999px; background: rgba(251, 29, 16, 0.2); animation: pulse 2s infinite;"></span>
              <div style="position: relative; width: 14px; height: 14px; border-radius: 9999px; background: #FB1D10; border: 2.5px solid ${isDark ? '#0B0D12' : '#ffffff'}; box-shadow: 0 0 10px rgba(251, 29, 16, 0.8);"></div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        L.marker([lat, lng], { icon: pinIcon }).addTo(map);

        setMapReady(true);
      }
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, zoom, isDark, interactive]);

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <div className={`relative overflow-hidden rounded-xl border ${
      isDark ? 'border-white/10 bg-[#0B0D12]' : 'border-neutral-200 bg-neutral-100'
    } ${heightClass} ${className}`}>
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Badge */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none">
        <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded backdrop-blur-md text-[10px] font-mono tracking-wider uppercase ${
          isDark 
            ? 'bg-black/75 border border-white/10 text-neutral-300' 
            : 'bg-white/90 border border-neutral-200 text-neutral-700 shadow-xs'
        }`}>
          <Compass size={12} className="text-[#FB1D10]" />
          <span>{lat.toFixed(4)}°N, {lng.toFixed(4)}°E</span>
        </div>
      </div>

      {/* Bottom Floating Direct Navigation Action */}
      <div className="absolute bottom-3 right-3 z-10">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium backdrop-blur-md transition-all ${
            isDark 
              ? 'bg-black/80 hover:bg-black border border-white/15 text-white hover:border-[#FB1D10]' 
              : 'bg-white/95 hover:bg-white border border-neutral-300 text-neutral-900 shadow-sm hover:border-neutral-900'
          }`}
        >
          <span>Open Maps</span>
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}
