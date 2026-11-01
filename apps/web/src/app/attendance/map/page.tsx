'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AttendanceMap, AttendanceLocation } from '@/components/attendance/AttendanceMap';
import {
  MapPin,
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
  Search,
  Navigation,
  Building2,
  Radio,
  ExternalLink,
  Copy,
  Clock,
  Compass,
} from 'lucide-react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api';
import { notifyAction } from '@/components/feedback/ActionFeedback';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { getWorkLocation, hasValidCoordinates, type AttendanceWorkLocation } from '@/lib/attendanceData';
import { readPageCache, writePageCache } from '@/lib/pageCache';

const DEFAULT_OFFICE = { latitude: 23.7925, longitude: 90.4078, radiusMeters: 200, name: 'Geospatial Works HQ' };
type AttendanceMapCache = { attendance: any[]; office: typeof DEFAULT_OFFICE };

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

export default function AttendanceMapPage() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [office, setOffice] = useState(DEFAULT_OFFICE);
  const [loadError, setLoadError] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | AttendanceWorkLocation>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchRealData = async (silent = false) => {
    if (!silent) setLoading(true);
    setLoadError('');
    try {
      const [attendanceResult, settingsResult] = await Promise.allSettled([
        ApiClient.getAttendance(),
        ApiClient.getAttendanceSettings(),
      ]);
      const data = attendanceResult.status === 'fulfilled' && Array.isArray(attendanceResult.value) ? attendanceResult.value : null;
      let nextOffice = DEFAULT_OFFICE;
      if (data) {
        setAttendance(data);
        if (data.length && !selectedRecord) setSelectedRecord(data[0]);
      } else {
        setLoadError('Attendance records could not be loaded. Showing the last successfully loaded records.');
      }
      if (settingsResult.status === 'fulfilled' && settingsResult.value && typeof settingsResult.value === 'object') {
        const settings = settingsResult.value as Record<string, unknown>;
        const latitude = Number(settings.officeLatitude ?? settings.office_latitude);
        const longitude = Number(settings.officeLongitude ?? settings.office_longitude);
        const radiusMeters = Number(settings.geofenceRadiusMeters ?? settings.geofence_radius_meters);
        nextOffice = {
          latitude: Number.isFinite(latitude) && Math.abs(latitude) <= 90 ? latitude : DEFAULT_OFFICE.latitude,
          longitude: Number.isFinite(longitude) && Math.abs(longitude) <= 180 ? longitude : DEFAULT_OFFICE.longitude,
          radiusMeters: Number.isFinite(radiusMeters) && radiusMeters > 0 ? radiusMeters : DEFAULT_OFFICE.radiusMeters,
          name: String(settings.officeName ?? settings.office_name ?? DEFAULT_OFFICE.name),
        };
        setOffice(nextOffice);
      } else {
        setLoadError((message) => [message, 'Attendance settings unavailable; standard office defaults are shown.'].filter(Boolean).join(' '));
      }
      if (data && settingsResult.status === 'fulfilled') writePageCache<AttendanceMapCache>('attendance-map', { attendance: data, office: nextOffice });
    } catch (e) {
      console.error('Failed fetching map data:', e);
      setLoadError('Attendance map data could not be refreshed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = readPageCache<AttendanceMapCache>('attendance-map');
    if (cached) {
      setAttendance(cached.attendance);
      setOffice(cached.office);
      setSelectedRecord(cached.attendance[0] ?? null);
    }
    void fetchRealData(true);
    const unsubscribe = ApiClient.subscribeToDataRefresh((endpoint) => {
      if (endpoint.startsWith('/attendance')) void fetchRealData(true);
    });
    return unsubscribe;
  }, []);

  // Use the same saved office coordinates and geofence radius as the mobile app.
  const enrichedAttendance = useMemo(() => {
    return attendance.map((a) => {
      const hasCoordinates = hasValidCoordinates(a.latitude ?? a.lat, a.longitude ?? a.lng);
      const lat = hasCoordinates ? Number(a.latitude ?? a.lat) : null;
      const lng = hasCoordinates ? Number(a.longitude ?? a.lng) : null;
      const dist = hasCoordinates ? calculateDistance(office.latitude, office.longitude, lat!, lng!) : null;
      const isInsideGeofence = dist !== null && dist <= office.radiusMeters;

      return {
        ...a,
        parsedLat: lat,
        parsedLng: lng,
        distanceMeters: dist,
        isInsideGeofence,
        workLocation: getWorkLocation({ ...a, isInsideGeofence }),
      };
    });
  }, [attendance, office]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return enrichedAttendance.filter((rec) => {
      const name = (rec.userName || rec.user_name || '').toLowerCase();
      const email = (rec.userEmail || rec.user_email || '').toLowerCase();
      const dept = (rec.department || '').toLowerCase();
      const addr = (rec.addressText || rec.address_text || '').toLowerCase();

      const matchesSearch =
        !searchQuery ||
        name.includes(searchQuery.toLowerCase()) ||
        email.includes(searchQuery.toLowerCase()) ||
        dept.includes(searchQuery.toLowerCase()) ||
        addr.includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeFilter !== 'all') return rec.workLocation === activeFilter;
      return true;
    });
  }, [enrichedAttendance, searchQuery, activeFilter]);

  const workLocationCounts = enrichedAttendance.reduce((counts, record) => {
    counts[record.workLocation as AttendanceWorkLocation] = (counts[record.workLocation as AttendanceWorkLocation] || 0) + 1;
    return counts;
  }, {} as Partial<Record<AttendanceWorkLocation, number>>);

  const mapLocations: AttendanceLocation[] = filteredRecords.map((a) => ({
    id: a.id,
    userName: a.userName || a.user_name || 'Employee',
    userEmail: a.userEmail || a.user_email,
    department: a.department || 'Unassigned',
    designation: a.designation || 'Employee',
    avatarUrl: a.avatarUrl || a.avatar_url,
    latitude: a.parsedLat,
    longitude: a.parsedLng,
    addressText: a.addressText || a.address_text || `${a.latitude}, ${a.longitude}`,
    loginTime: a.loginTime || a.created_at,
    sessionType: a.sessionType || a.session_type || 'morning',
    status: a.status || 'present',
    distanceMeters: a.distanceMeters ?? undefined,
    workLocation: a.workLocation,
  })).filter((location) => location.latitude !== null && location.longitude !== null) as AttendanceLocation[];

  const handleCopyCoords = (lat: number, lng: number, id: string) => {
    Promise.resolve()
      .then(() => navigator.clipboard.writeText(`${lat}, ${lng}`))
      .then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
        notifyAction('Coordinates copied to clipboard.', 'success');
      })
      .catch(() => notifyAction('Could not copy coordinates. Check clipboard permissions.', 'error'));
  };

  const activeRecord = selectedRecord
    ? enrichedAttendance.find((record) => record.id === selectedRecord.id) ?? selectedRecord
    : null;

  return (
    <AdminLayout
      title="Live GPS Map"
      subtitle="Monitor current team locations and HQ geofence status"
      onRefresh={() => void fetchRealData()}
      isRefreshing={loading}
    >
      {/* Top Navigation & Status Strip */}
      <div className="w-full max-w-[1440px] mx-auto px-5 py-5 space-y-3">
      {loadError && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-900">
          <span>{loadError}</span>
          <button onClick={() => void fetchRealData()} disabled={loading} className="inline-flex items-center gap-1.5 font-semibold underline underline-offset-2 disabled:opacity-50">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Retry
          </button>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/attendance"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
          >
            <ArrowLeft size={14} /> Back to Register
          </Link>

          <Link
            href="/attendance?settings=1"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
          >
            <Building2 size={14} /> Attendance settings
          </Link>

          <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" />

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>Live attendance data</span>
          </div>
        </div>

        {/* Quick KPI Ribbons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200/70 rounded-full text-xs font-bold text-indigo-700">
            <Radio size={12} className="text-indigo-600 animate-pulse" />
            <span>{enrichedAttendance.length} Check-ins</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200/70 rounded-full text-xs font-bold text-emerald-700">
            <ShieldCheck size={12} className="text-emerald-600" />
            <span>{workLocationCounts.office || 0} Office</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-sky-50 border border-sky-200/70 rounded-full text-xs font-bold text-sky-700">
            <Navigation size={12} className="text-sky-600" />
            <span>{(workLocationCounts.home || 0) + (workLocationCounts.home_office || 0)} Remote</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/70 rounded-full text-xs font-bold text-amber-700">
            <Navigation size={12} className="text-amber-600" />
            <span>{workLocationCounts.field || 0} Field</span>
          </div>

          <button
            onClick={() => void fetchRealData()}
            disabled={loading}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors ml-1"
            title="Refresh GPS Transponders"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Command Console: 8 Cols Map + 4 Cols Transponder Radar */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 items-start">
        {/* Left Interactive Map Canvas (8 Cols) */}
        <div className="xl:col-span-8 bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex flex-col min-h-[540px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Compass size={18} className="text-indigo-600" />
              <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">Check-in locations</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500 font-semibold">
              {office.name}: {office.latitude.toFixed(4)}°N, {office.longitude.toFixed(4)}°E ({office.radiusMeters}m geofence)
            </span>
          </div>

          <div className="h-[460px] w-full relative">
            <AttendanceMap
              records={mapLocations}
              selectedRecord={activeRecord}
              onSelectRecord={(rec) => setSelectedRecord(rec)}
              officeLat={office.latitude}
              officeLng={office.longitude}
              officeRadiusMeters={office.radiusMeters}
            />
          </div>

          {/* Floating Selected Personnel HUD Inspector */}
          {activeRecord && (
            <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <UserAvatar
                  src={activeRecord.avatarUrl || activeRecord.userAvatarUrl || activeRecord.avatar_url}
                  name={activeRecord.userName || activeRecord.user_name || 'Staff'}
                  size="lg"
                  shape="rounded"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-extrabold text-slate-900">
                      {activeRecord.userName || activeRecord.user_name || 'Staff Member'}
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        activeRecord.isInsideGeofence
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {activeRecord.isInsideGeofence ? 'Inside HQ Geofence' : 'Field Deployment'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {activeRecord.department || 'Operations'} • {activeRecord.designation || 'Specialist'}
                    {activeRecord.distanceMeters !== undefined && activeRecord.distanceMeters !== null && (
                      <span className="font-bold text-slate-700 ml-1.5">
                        • {activeRecord.distanceMeters > 1000
                          ? `${(activeRecord.distanceMeters / 1000).toFixed(2)} km`
                          : `${activeRecord.distanceMeters} m`}{' '}
                        from {office.name}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeRecord.parsedLat && activeRecord.parsedLng && (
                  <>
                    <button
                      onClick={() => handleCopyCoords(activeRecord.parsedLat, activeRecord.parsedLng, activeRecord.id)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                    >
                      <Copy size={12} />
                      <span>{copiedId === activeRecord.id ? 'Copied!' : 'Copy Coords'}</span>
                    </button>
                    <a
                      href={`https://www.google.com/maps?q=${activeRecord.parsedLat},${activeRecord.parsedLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <ExternalLink size={12} />
                      <span>Google Maps</span>
                    </a>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Transponder Radar Console (4 Cols) */}
        <div className="xl:col-span-4 bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex flex-col h-[540px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-2">
              <Radio size={16} className="text-indigo-600" />
              <span>Attendance records</span>
            </h3>
            <span className="text-xs font-bold text-slate-500">{filteredRecords.length} Active</span>
          </div>

          {/* Search Box */}
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff, site, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({enrichedAttendance.length})
            </button>
            {(['office', 'home', 'home_office', 'field', 'unknown'] as AttendanceWorkLocation[]).map((location) => {
              const labels: Record<AttendanceWorkLocation, string> = { office: 'Office', home: 'Home', home_office: 'Home office', field: 'Field', unknown: 'Unspecified' };
              const selectedTones: Record<AttendanceWorkLocation, string> = { office: 'bg-indigo-600 text-white', home: 'bg-violet-600 text-white', home_office: 'bg-sky-600 text-white', field: 'bg-amber-600 text-white', unknown: 'bg-slate-600 text-white' };
              return <button key={location} onClick={() => setActiveFilter(location)} className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors ${activeFilter === location ? selectedTones[location] : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>{labels[location]} ({workLocationCounts[location] || 0})</button>;
            })}
          </div>

          {/* Scrollable Transponder Cards */}
          <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
            {filteredRecords.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <MapPin size={28} className="mb-2 text-slate-300" />
                <p className="text-xs font-semibold">No transponders matching filter.</p>
              </div>
            ) : (
              filteredRecords.map((pin) => {
                const isSelected = selectedRecord?.id === pin.id;
                const timeStr = pin.loginTime
                  ? new Date(pin.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Logged';

                return (
                  <div
                    key={pin.id}
                    onClick={() => setSelectedRecord(pin)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-300 shadow-sm'
                        : 'bg-slate-50/70 border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          src={pin.avatarUrl || pin.userAvatarUrl}
                          name={pin.userName || pin.user_name || 'Employee'}
                          size="sm"
                          shape="rounded"
                        />
                        <div>
                          <p className="text-xs font-extrabold text-slate-900 leading-tight">
                            {pin.userName || pin.user_name || 'Employee'}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {pin.department || 'Unassigned'} • {pin.designation || 'Employee'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${
                            pin.workLocation === 'office' ? 'bg-indigo-100 text-indigo-800'
                              : pin.workLocation === 'home' ? 'bg-violet-100 text-violet-800'
                                : pin.workLocation === 'home_office' ? 'bg-sky-100 text-sky-800'
                                  : pin.workLocation === 'field' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {pin.workLocation === 'home_office' ? 'Home office' : pin.workLocation === 'unknown' ? 'Unspecified' : pin.workLocation === 'field' ? 'Field' : pin.workLocation === 'home' ? 'Home' : 'Office'}
                        </span>
                        <p className="text-[10px] font-mono font-medium text-slate-400 mt-0.5">{timeStr}</p>
                      </div>
                    </div>

                    <p className="text-xs font-medium text-slate-700 mt-2 flex items-center gap-1.5 truncate">
                      <MapPin size={12} className="text-slate-400 shrink-0" />
                      <span className="truncate">{pin.addressText || pin.address_text || 'Location not provided'}</span>
                    </p>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="font-mono text-slate-500">
                        {pin.parsedLat !== null && pin.parsedLng !== null ? `${pin.parsedLat.toFixed(4)}°, ${pin.parsedLng.toFixed(4)}°` : 'No GPS'}
                      </span>
                      <span className="font-bold text-indigo-600">
                        {pin.distanceMeters !== null
                          ? pin.distanceMeters > 1000
                            ? `${(pin.distanceMeters / 1000).toFixed(1)} km`
                            : `${pin.distanceMeters} m`
                          : '—'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      </div>
    </AdminLayout>
  );
}
