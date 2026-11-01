'use client';

import React, { useEffect, useRef } from 'react';

export interface AttendanceLocation {
  id: string;
  userName: string;
  userEmail?: string;
  department?: string;
  designation?: string;
  avatarUrl?: string;
  latitude: number;
  longitude: number;
  addressText?: string;
  loginTime?: string;
  sessionType?: string;
  status?: string;
  distanceMeters?: number;
  workLocation?: 'office' | 'home' | 'home_office' | 'field' | 'unknown';
}

interface AttendanceMapProps {
  records: AttendanceLocation[];
  selectedRecord?: AttendanceLocation | null;
  onSelectRecord?: (record: AttendanceLocation) => void;
  officeLat?: number;
  officeLng?: number;
  officeRadiusMeters?: number;
  className?: string;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export const AttendanceMap: React.FC<AttendanceMapProps> = ({
  records,
  selectedRecord,
  onSelectRecord,
  officeLat = 23.8103,
  officeLng = 90.4125,
  officeRadiusMeters = 500,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const markerMapRef = useRef<Map<string, any>>(new Map());

  // Initialize Map
  useEffect(() => {
    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Fix default marker icon assets
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          zoomControl: false,
        }).setView([officeLat, officeLng], 13);
        mapInstanceRef.current = map;

        // Reposition zoom controls to top-left with style
        L.control.zoom({ position: 'topleft' }).addTo(map);

        // Standard high-clarity OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        // Office Geofence Circle
        L.circle([officeLat, officeLng], {
          color: '#4F46E5',
          fillColor: '#818CF8',
          fillOpacity: 0.16,
          radius: officeRadiusMeters,
          weight: 2,
          dashArray: '4, 6',
        }).addTo(map);


        // HQ Center Marker
        const hqIcon = L.divIcon({
          className: 'hq-marker-pin',
          html: `
            <div style="
              background: linear-gradient(135deg, #4F46E5, #3730A3);
              width: 34px;
              height: 34px;
              border-radius: 50%;
              border: 3px solid #ffffff;
              box-shadow: 0 4px 14px rgba(79, 70, 229, 0.45);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              font-size: 14px;
              font-weight: 800;
              transform: translate(-50%, -50%);
            ">
              🏢
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        L.marker([officeLat, officeLng], { icon: hqIcon }).addTo(map);

        // Markers layer
        markersLayerRef.current = L.layerGroup().addTo(map);
      }

      // Render markers for records
      if (markersLayerRef.current) {
        markersLayerRef.current.clearLayers();
        markerMapRef.current.clear();

        const validRecords = records.filter((r) =>
          Number.isFinite(r.latitude) && Number.isFinite(r.longitude) &&
          Math.abs(r.latitude) <= 90 && Math.abs(r.longitude) <= 180 &&
          (r.latitude !== 0 || r.longitude !== 0)
        );

        validRecords.forEach((r) => {
          const isSelected = selectedRecord?.id === r.id;
          const dist = calculateDistance(officeLat, officeLng, r.latitude, r.longitude);
          const isInsideGeofence = dist <= officeRadiusMeters;
          const statusLower = (r.status || 'present').toLowerCase();

          // Semantic Colors
          const locationColors = { office: '#10B981', home: '#8B5CF6', home_office: '#0284C7', field: '#D97706', unknown: isInsideGeofence ? '#10B981' : '#64748B' };
          let markerColor = locationColors[r.workLocation || 'unknown'];
          if (statusLower.includes('late')) {
            markerColor = '#DB2777'; // Pink for late check-ins
          }
          if (statusLower.includes('absent')) {
            markerColor = '#EF4444'; // Red
          }

          const customIcon = L.divIcon({
            className: 'custom-attendance-pin',
            html: `
              <div style="
                background: ${markerColor};
                width: ${isSelected ? '32px' : '26px'};
                height: ${isSelected ? '32px' : '26px'};
                border-radius: 50%;
                border: ${isSelected ? '3px solid #FFFFFF' : '2px solid #FFFFFF'};
                box-shadow: ${isSelected ? '0 0 0 4px rgba(79, 70, 229, 0.4), 0 8px 16px rgba(0,0,0,0.3)' : '0 3px 8px rgba(0,0,0,0.2)'};
                display: flex;
                align-items: center;
                justify-content: center;
                color: #FFFFFF;
                font-size: ${isSelected ? '12px' : '11px'};
                font-weight: 800;
                transform: translate(-50%, -50%);
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                cursor: pointer;
              ">
                ${(r.userName || 'U').charAt(0).toUpperCase()}
              </div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          });

          const marker = L.marker([r.latitude, r.longitude], { icon: customIcon });

          marker.on('click', () => {
            if (onSelectRecord) onSelectRecord(r);
          });

          markersLayerRef.current.addLayer(marker);
          markerMapRef.current.set(r.id, marker);

        });

        // Pan to selected record or fit all bounds
        if (selectedRecord?.latitude && selectedRecord?.longitude) {
          mapInstanceRef.current.setView([selectedRecord.latitude, selectedRecord.longitude], 15, {
            animate: true,
          });
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [records, selectedRecord, officeLat, officeLng, officeRadiusMeters, onSelectRecord]);

  const handleCenterHQ = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([officeLat, officeLng], 14, { animate: true });
    }
  };

  const handleFitAll = () => {
    if (mapInstanceRef.current && markersLayerRef.current) {
      const layers = markersLayerRef.current.getLayers();
      if (layers.length > 0) {
        import('leaflet').then((L) => {
          const group = L.featureGroup(layers);
          mapInstanceRef.current.fitBounds(group.getBounds().pad(0.2));
        });
      } else {
        handleCenterHQ();
      }
    }
  };

  return (
    <div
      className={`relative isolate z-0 w-full h-full min-h-0 rounded-[28px] overflow-hidden border border-slate-200/80 shadow-xs bg-slate-100 ${className}`}
    >
      <div ref={mapContainerRef} className="w-full h-full min-h-0" />

      {/* Floating Control Buttons */}
      <div className="absolute left-12 right-3 top-3 z-[1000] flex flex-wrap items-center justify-end gap-1.5 sm:left-auto sm:right-4 sm:top-4 sm:flex-nowrap sm:gap-2">
        <button
          onClick={handleCenterHQ}
          className="px-2.5 py-1.5 bg-white/95 backdrop-blur-md hover:bg-white text-slate-800 text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl border border-slate-200 shadow-sm transition-all flex items-center gap-1.5"
          title="Center on Dhaka HQ"
        >
          <span>🏢 HQ Focus</span>
        </button>
        <button
          onClick={handleFitAll}
          className="px-2.5 py-1.5 bg-white/95 backdrop-blur-md hover:bg-white text-slate-800 text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl border border-slate-200 shadow-sm transition-all flex items-center gap-1.5"
          title="Fit all staff markers"
        >
          <span>🌐 Fit All ({records.length})</span>
        </button>
      </div>

      {/* Legend Badge Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-[1000] bg-white/95 backdrop-blur-md px-2.5 py-2 rounded-xl border border-slate-200 shadow-md text-[9px] sm:text-[11px] font-semibold text-slate-700 flex flex-wrap items-center gap-x-2.5 gap-y-1 sm:bottom-4 sm:left-4 sm:right-auto sm:px-3.5 sm:rounded-2xl sm:gap-3">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
          <span>Office / in range</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-xs" />
          <span>Home office</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-violet-500 shadow-xs" />
          <span>Home</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs" />
          <span>Field</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-600 shadow-xs" />
          <span>Late</span>
        </span>
      </div>
    </div>
  );
};
