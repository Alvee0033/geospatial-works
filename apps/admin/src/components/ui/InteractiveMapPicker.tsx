'use client';

import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { Search, MapPin } from 'lucide-react';

interface InteractiveMapPickerProps {
  latitude: string;
  longitude: string;
  onChange: (lat: string, lng: string) => void;
}

export function InteractiveMapPicker({ latitude, longitude, onChange }: InteractiveMapPickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const parsedLat = Number.parseFloat(latitude);
  const parsedLng = Number.parseFloat(longitude);
  const initialLat = Number.isFinite(parsedLat) ? parsedLat : 23.750942;
  const initialLng = Number.isFinite(parsedLng) ? parsedLng : 90.384351;

  useEffect(() => {
    let mounted = true;
    let mapInstance: any = null;

    (async () => {
      const L = (await import('leaflet')).default;
      if (!mounted || !containerRef.current) return;

      // Fix default marker icon in Next.js/Webpack/Turbopack
      const icon = L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="width:24px;height:24px;border-radius:9999px;background:#4f46e5;border:3px solid #ffffff;box-shadow:0 2px 8px rgba(0,0,0,0.35);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      mapInstance = L.map(containerRef.current, {
        center: [initialLat, initialLng],
        zoom: 15,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(mapInstance);

      const marker = L.marker([initialLat, initialLng], { draggable: true, icon }).addTo(mapInstance);

      mapInstance.on('click', (e: any) => {
        const lat = e.latlng.lat.toFixed(6);
        const lng = e.latlng.lng.toFixed(6);
        marker.setLatLng([e.latlng.lat, e.latlng.lng]);
        onChange(lat, lng);
      });

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onChange(pos.lat.toFixed(6), pos.lng.toFixed(6));
      });

      mapRef.current = mapInstance;
      markerRef.current = marker;
    })();

    return () => {
      mounted = false;
      if (mapInstance) {
        mapInstance.remove();
      }
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external lat/lng edits to marker
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    if (Number.isFinite(parsedLat) && Number.isFinite(parsedLng)) {
      markerRef.current.setLatLng([parsedLat, parsedLng]);
    }
  }, [parsedLat, parsedLng]);

  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (!q) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const lat = Number.parseFloat(data[0].lat);
        const lng = Number.parseFloat(data[0].lon);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          mapRef.current?.setView([lat, lng], 16);
          markerRef.current?.setLatLng([lat, lng]);
          onChange(lat.toFixed(6), lng.toFixed(6));
        }
      }
    } catch {
      // ignore network error
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void handleSearch();
              }
            }}
            placeholder="Search address or place to jump pin..."
            className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
          />
        </div>
        <button
          type="button"
          onClick={() => void handleSearch()}
          disabled={searching}
          className="h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer shrink-0 disabled:opacity-50"
        >
          {searching ? 'Finding...' : 'Find'}
        </button>
      </div>

      <div className="relative h-64 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
        <div ref={containerRef} className="w-full h-full z-0" />
      </div>

      <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
        <MapPin size={12} className="text-indigo-600 shrink-0" />
        Tap anywhere on the map or drag the pin to set exact office location.
      </p>
    </div>
  );
}
