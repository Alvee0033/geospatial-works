'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Search, MapPin, Loader2, X } from 'lucide-react';
import type * as Leaflet from 'leaflet';

type Result = { lat: number; lng: number; label: string };
type Props = {
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  pinLabel?: string;
  onChange: (point: { latitude: number; longitude: number }) => void;
};

export function LocationPickerMap({ latitude, longitude, radiusMeters, pinLabel = 'Selected location', onChange }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const searchControls = useRef<HTMLDivElement>(null);
  const map = useRef<Leaflet.Map | null>(null);
  const marker = useRef<Leaflet.Marker | null>(null);
  const circle = useRef<Leaflet.Circle | null>(null);
  const onChangeRef = useRef(onChange);
  const initialProps = useRef({ latitude, longitude, radiusMeters, pinLabel });
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  useEffect(() => {
    let active = true;
    import('leaflet').then((L) => {
      if (!active || !host.current || map.current) return;
      Reflect.deleteProperty(L.Icon.Default.prototype, '_getIconUrl');
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      const initial = initialProps.current;
      const instance = L.map(host.current, { zoomControl: true }).setView([initial.latitude, initial.longitude], 15);
      if (searchControls.current) L.DomEvent.disableClickPropagation(searchControls.current);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, attribution: '&copy; OpenStreetMap contributors',
      }).addTo(instance);
      marker.current = L.marker([initial.latitude, initial.longitude], { draggable: true }).addTo(instance);
      marker.current.bindTooltip(initial.pinLabel, { direction: 'top' });
      const activeMarker = marker.current;
      activeMarker.on('dragend', () => {
        const p = activeMarker.getLatLng();
        onChangeRef.current({ latitude: p.lat, longitude: p.lng });
      });
      if (initial.radiusMeters) circle.current = L.circle([initial.latitude, initial.longitude], {
        radius: initial.radiusMeters, color: '#4f46e5', weight: 2,
        fillColor: '#818cf8', fillOpacity: 0.16, dashArray: '5 5',
      }).addTo(instance);
      instance.on('click', (event: Leaflet.LeafletMouseEvent) => onChangeRef.current({ latitude: event.latlng.lat, longitude: event.latlng.lng }));
      map.current = instance;
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!map.current || !marker.current) return;
    const point: Leaflet.LatLngTuple = [latitude, longitude];
    marker.current.setLatLng(point);
    if (circle.current) circle.current.setLatLng(point).setRadius(radiusMeters || 0);
  }, [latitude, longitude, radiusMeters]);

  const search = async () => {
    if (!query.trim()) return;
    setSearching(true); setSearchError(''); setResults([]);
    try {
      const url = new URL('https://nominatim.openstreetmap.org/search');
      url.search = new URLSearchParams({ q: query.trim(), format: 'jsonv2', limit: '5', addressdetails: '1' }).toString();
      const response = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Location search is unavailable. Try again.');
      const data = await response.json();
      const found = (Array.isArray(data) ? data : []).flatMap((raw): Result[] => {
        if (typeof raw !== 'object' || raw === null) return [];
        const item = raw as { lat?: unknown; lon?: unknown; display_name?: unknown };
        const lat = Number(item.lat);
        const lng = Number(item.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return [];
        return [{ lat, lng, label: typeof item.display_name === 'string' ? item.display_name : 'Location' }];
      });
      setResults(found);
      if (!found.length) setSearchError('No matching locations found.');
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : 'Could not search locations.');
    } finally { setSearching(false); }
  };

  const choose = (result: Result) => {
    onChange({ latitude: result.lat, longitude: result.lng });
    map.current?.setView([result.lat, result.lng], 16, { animate: true });
    setQuery(result.label.split(',').slice(0, 2).join(',')); setResults([]);
  };

  return <div className="relative h-[340px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100 isolate z-0">
    <div ref={host} className="absolute inset-0" />
    <div ref={searchControls} className="absolute left-3 right-3 top-3 z-[500] max-w-xl">
      <div role="search" className="flex gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
        <MapPin className="ml-1 mt-2 h-4 w-4 shrink-0 text-indigo-600" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); void search(); } }} placeholder="Search an address, area, or landmark" className="min-w-0 flex-1 bg-transparent px-1 text-sm outline-none" aria-label="Search map locations" />
        {query && <button type="button" onClick={() => { setQuery(''); setResults([]); }} aria-label="Clear search" className="text-slate-400"><X size={16} /></button>}
        <button type="button" onClick={() => void search()} disabled={searching || !query.trim()} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">
          {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />} Search
        </button>
      </div>
      {(results.length > 0 || searchError) && <div className="mt-1 max-h-48 overflow-auto rounded-xl border border-slate-200 bg-white shadow-xl">
        {results.map((item, index) => <button key={`${item.lat}-${item.lng}-${index}`} onClick={() => choose(item)} className="block w-full border-b border-slate-100 px-3 py-2.5 text-left text-xs text-slate-700 last:border-0 hover:bg-indigo-50">{item.label}</button>)}
        {searchError && <p className="px-3 py-2.5 text-xs text-slate-500">{searchError}</p>}
      </div>}
    </div>
    <div className="absolute bottom-3 left-3 z-[400] rounded-lg bg-white/95 px-3 py-2 text-[11px] text-slate-600 shadow">Click map or drag pin to set {pinLabel.toLowerCase()}{radiusMeters ? ` · ${radiusMeters} m boundary` : ''}</div>
  </div>;
}
