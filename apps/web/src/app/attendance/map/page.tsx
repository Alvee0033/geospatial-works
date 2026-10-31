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
import { UserAvatar } from '@/components/ui/UserAvatar';

const HQ_LAT = 23.8103;
const HQ_LNG = 90.4125;
const HQ_RADIUS_METERS = 500;

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
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
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'geofence' | 'field'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchRealData = async () => {
    setLoading(true);
    try {
      const data = await ApiClient.getAttendance();
      setAttendance(data || []);
      if (data && data.length > 0 && !selectedRecord) {
        setSelectedRecord(data[0]);
      }
    } catch (e) {
      console.error('Failed fetching map data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealData();
  }, []);

  // Enriched attendance records with computed distance from Dhaka HQ
  const enrichedAttendance = useMemo(() => {
    return attendance.map((a) => {
      const lat = Number(a.latitude);
      const lng = Number(a.longitude);
      const dist = lat && lng ? calculateDistance(HQ_LAT, HQ_LNG, lat, lng) : null;
      const isInsideGeofence = dist !== null && dist <= HQ_RADIUS_METERS;

      return {
        ...a,
        parsedLat: lat,
        parsedLng: lng,
        distanceMeters: dist,
        isInsideGeofence,
      };
    });
  }, [attendance]);

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

      if (activeFilter === 'geofence') return rec.isInsideGeofence;
      if (activeFilter === 'field') return !rec.isInsideGeofence;
      return true;
    });
  }, [enrichedAttendance, searchQuery, activeFilter]);

  const inGeofenceCount = enrichedAttendance.filter((r) => r.isInsideGeofence).length;
  const fieldDeployCount = enrichedAttendance.filter((r) => !r.isInsideGeofence).length;

  const mapLocations: AttendanceLocation[] = filteredRecords.map((a) => ({
    id: a.id,
    userName: a.userName || a.user_name || 'Staff Member',
    userEmail: a.userEmail || a.user_email,
    department: a.department || 'Operations',
    designation: a.designation || 'Specialist',
    avatarUrl: a.avatarUrl || a.avatar_url,
    latitude: a.parsedLat,
    longitude: a.parsedLng,
    addressText: a.addressText || a.address_text || `${a.latitude}, ${a.longitude}`,
    loginTime: a.loginTime || a.created_at,
    sessionType: a.sessionType || a.session_type || 'morning',
    status: a.status || 'present',
    distanceMeters: a.distanceMeters ?? undefined,
  }));

  const handleCopyCoords = (lat: number, lng: number, id: string) => {
    navigator.clipboard.writeText(`${lat}, ${lng}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <AdminLayout
      title="Live GPS Map"
      subtitle="Monitor current team locations and HQ geofence status"
      onRefresh={fetchRealData}
      isRefreshing={loading}
    >
      {/* Top Navigation & Status Strip */}
      <div className="w-full max-w-[1440px] mx-auto px-5 py-5 space-y-3">
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
            <span>Live Geospatial Stream Active</span>
          </div>
        </div>

        {/* Quick KPI Ribbons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200/70 rounded-full text-xs font-bold text-indigo-700">
            <Radio size={12} className="text-indigo-600 animate-pulse" />
            <span>{enrichedAttendance.length} Transponders</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200/70 rounded-full text-xs font-bold text-emerald-700">
            <ShieldCheck size={12} className="text-emerald-600" />
            <span>{inGeofenceCount} Within HQ</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-sky-50 border border-sky-200/70 rounded-full text-xs font-bold text-sky-700">
            <Navigation size={12} className="text-sky-600" />
            <span>{fieldDeployCount} Field Sites</span>
          </div>

          <button
            onClick={fetchRealData}
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
              <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">Geospatial Operations Canvas</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500 font-semibold">
              HQ: {HQ_LAT.toFixed(4)}°N, {HQ_LNG.toFixed(4)}°E (500m geofence)
            </span>
          </div>

          <div className="h-[460px] w-full relative">
            <AttendanceMap
              records={mapLocations}
              selectedRecord={selectedRecord}
              onSelectRecord={(rec) => setSelectedRecord(rec)}
              officeLat={HQ_LAT}
              officeLng={HQ_LNG}
              officeRadiusMeters={HQ_RADIUS_METERS}
            />
          </div>

          {/* Floating Selected Personnel HUD Inspector */}
          {selectedRecord && (
            <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <UserAvatar
                  src={selectedRecord.avatarUrl || selectedRecord.userAvatarUrl}
                  name={selectedRecord.userName || selectedRecord.user_name || 'Staff'}
                  size="lg"
                  shape="rounded"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-extrabold text-slate-900">
                      {selectedRecord.userName || selectedRecord.user_name || 'Staff Member'}
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        selectedRecord.isInsideGeofence
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {selectedRecord.isInsideGeofence ? 'Inside HQ Geofence' : 'Field Deployment'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {selectedRecord.department || 'Operations'} • {selectedRecord.designation || 'Specialist'}
                    {selectedRecord.distanceMeters !== undefined && (
                      <span className="font-bold text-slate-700 ml-1.5">
                        • {selectedRecord.distanceMeters > 1000
                          ? `${(selectedRecord.distanceMeters / 1000).toFixed(2)} km`
                          : `${selectedRecord.distanceMeters} m`}{' '}
                        from Dhaka HQ
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedRecord.parsedLat && selectedRecord.parsedLng && (
                  <>
                    <button
                      onClick={() => handleCopyCoords(selectedRecord.parsedLat, selectedRecord.parsedLng, selectedRecord.id)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                    >
                      <Copy size={12} />
                      <span>{copiedId === selectedRecord.id ? 'Copied!' : 'Copy Coords'}</span>
                    </button>
                    <a
                      href={`https://www.google.com/maps?q=${selectedRecord.parsedLat},${selectedRecord.parsedLng}`}
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
              <span>Transponder Radar</span>
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
          <div className="flex items-center gap-1.5 mb-3">
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
            <button
              onClick={() => setActiveFilter('geofence')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                activeFilter === 'geofence'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              HQ ({inGeofenceCount})
            </button>
            <button
              onClick={() => setActiveFilter('field')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                activeFilter === 'field'
                  ? 'bg-sky-600 text-white'
                  : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
              }`}
            >
              Field ({fieldDeployCount})
            </button>
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
                          name={pin.userName || pin.user_name || 'Staff'}
                          size="sm"
                          shape="rounded"
                        />
                        <div>
                          <p className="text-xs font-extrabold text-slate-900 leading-tight">
                            {pin.userName || pin.user_name || 'Staff Member'}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {pin.department || 'Operations'} • {pin.designation || 'Specialist'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${
                            pin.isInsideGeofence
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-sky-100 text-sky-800'
                          }`}
                        >
                          {pin.isInsideGeofence ? 'HQ In-Fence' : 'Field'}
                        </span>
                        <p className="text-[10px] font-mono font-medium text-slate-400 mt-0.5">{timeStr}</p>
                      </div>
                    </div>

                    <p className="text-xs font-medium text-slate-700 mt-2 flex items-center gap-1.5 truncate">
                      <MapPin size={12} className="text-slate-400 shrink-0" />
                      <span className="truncate">{pin.addressText || pin.address_text || 'Dhaka Office'}</span>
                    </p>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="font-mono text-slate-500">
                        {pin.parsedLat ? `${pin.parsedLat.toFixed(4)}°, ${pin.parsedLng.toFixed(4)}°` : 'No GPS'}
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
