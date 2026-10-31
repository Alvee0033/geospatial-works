'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AttendanceMap, AttendanceLocation } from '@/components/attendance/AttendanceMap';
import {
  MapPin,
  Clock,
  Calendar,
  Settings,
  PlusCircle,
  Crosshair,
  Search,
  CheckCircle2,
  Building,
  Navigation,
  X,
  FileSpreadsheet,
  Users,
  Compass,
  ArrowUpRight,
  TrendingUp,
  MapPinOff,
  UserCheck
} from 'lucide-react';
import { ExportUtils } from '@/lib/exportUtils';
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

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-20');
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'geofence' | 'field' | 'morning' | 'afternoon'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);

  // Check-In Form
  const [checkInUserId, setCheckInUserId] = useState<string>('');
  const [checkInLat, setCheckInLat] = useState<number>(HQ_LAT);
  const [checkInLng, setCheckInLng] = useState<number>(HQ_LNG);
  const [checkInAddress, setCheckInAddress] = useState('Geospatial Works HQ, Dhaka');
  const [checkInSession, setCheckInSession] = useState<'morning' | 'afternoon'>('morning');
  const [checkInNotes, setCheckInNotes] = useState('');
  const [isGettingGps, setIsGettingGps] = useState(false);
  const [submittingCheckIn, setSubmittingCheckIn] = useState(false);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const [attData, userData] = await Promise.all([
        ApiClient.getAttendance({ date: selectedDate }).catch(() => []),
        ApiClient.getUsers().catch(() => []),
      ]);
      setAttendance(attData || []);
      setUsers(userData || []);

      if (attData && attData.length > 0 && !selectedRecord) {
        setSelectedRecord(attData[0]);
      }
    } catch (e) {
      console.error('Error fetching attendance:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const handleGetCurrentGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setIsGettingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCheckInLat(pos.coords.latitude);
        setCheckInLng(pos.coords.longitude);
        setCheckInAddress(`Captured Coordinates: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
        setIsGettingGps(false);
      },
      (err) => {
        alert(`Failed to get device GPS: ${err.message}`);
        setIsGettingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleManualCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingCheckIn(true);
    try {
      await ApiClient.recordCheckIn({
        userId: checkInUserId || undefined,
        latitude: checkInLat,
        longitude: checkInLng,
        addressText: checkInAddress,
        sessionType: checkInSession,
        notes: checkInNotes,
        date: selectedDate,
      });
      setIsCheckInModalOpen(false);
      setCheckInNotes('');
      await fetchAttendance();
    } catch (err: any) {
      alert(`Check-in failed: ${err.message}`);
    } finally {
      setSubmittingCheckIn(false);
    }
  };

  const enrichedAttendance = useMemo(() => {
    const userMap = new Map<string, any>();
    users.forEach((u) => {
      userMap.set(u.id, u);
      if (u._id) userMap.set(u._id, u);
    });

    return attendance.map((item) => {
      const u = item.userId ? userMap.get(item.userId) : null;
      const userName = item.userName || item.user_name || (u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : 'Staff Member');
      const userEmail = item.userEmail || item.user_email || u?.email || '';
      const department = item.department || u?.department || 'Operations';
      const designation = item.designation || u?.designation || u?.role || 'Engineer';
      const avatarUrl = item.avatarUrl || item.avatar_url || u?.avatarUrl;

      const lat = item.latitude !== undefined ? Number(item.latitude) : HQ_LAT;
      const lng = item.longitude !== undefined ? Number(item.longitude) : HQ_LNG;
      const dist = calculateDistance(lat, lng, HQ_LAT, HQ_LNG);
      const isInside = dist <= HQ_RADIUS_METERS;

      return {
        ...item,
        userName,
        userEmail,
        department,
        designation,
        avatarUrl,
        parsedLat: lat,
        parsedLng: lng,
        distanceMeters: dist,
        isInsideGeofence: isInside,
      };
    });
  }, [attendance, users]);

  const filteredRecords = useMemo(() => {
    return enrichedAttendance.filter((rec) => {
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !searchQuery ||
        (rec.userName && rec.userName.toLowerCase().includes(q)) ||
        (rec.department && rec.department.toLowerCase().includes(q)) ||
        (rec.addressText && rec.addressText.toLowerCase().includes(q)) ||
        (rec.address_text && rec.address_text.toLowerCase().includes(q));

      if (!matchQuery) return false;

      if (activeFilter === 'geofence') return rec.isInsideGeofence;
      if (activeFilter === 'field') return !rec.isInsideGeofence;
      if (activeFilter === 'morning') return (rec.sessionType || rec.session_type) === 'morning';
      if (activeFilter === 'afternoon') return (rec.sessionType || rec.session_type) === 'afternoon';

      return true;
    });
  }, [enrichedAttendance, searchQuery, activeFilter]);

  // Counts
  const inGeofenceCount = enrichedAttendance.filter((r) => r.isInsideGeofence).length;
  const fieldDeployCount = enrichedAttendance.filter((r) => !r.isInsideGeofence).length;
  const morningCount = enrichedAttendance.filter((r) => (r.sessionType || r.session_type) === 'morning').length;
  const afternoonCount = enrichedAttendance.filter((r) => (r.sessionType || r.session_type) === 'afternoon').length;
  const presenceRatio = users.length > 0 ? Math.round((attendance.length / users.length) * 100) : 0;

  const mapLocations: AttendanceLocation[] = filteredRecords.map((a) => ({
    id: a.id,
    userName: a.userName,
    userEmail: a.userEmail,
    department: a.department,
    designation: a.designation,
    avatarUrl: a.avatarUrl,
    latitude: a.parsedLat,
    longitude: a.parsedLng,
    addressText: a.addressText || a.address_text || `${a.latitude}, ${a.longitude}`,
    loginTime: a.loginTime || a.created_at,
    sessionType: a.sessionType || a.session_type || 'morning',
    status: a.status || 'present',
    distanceMeters: a.distanceMeters,
  }));

  const handleCopyCoords = (lat: number, lng: number, id: string) => {
    navigator.clipboard.writeText(`${lat}, ${lng}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExport = () => {
    const rows = enrichedAttendance.map((a) => ({
      ID: a.id,
      Date: a.date,
      Employee: a.userName,
      Email: a.userEmail,
      Department: a.department,
      Designation: a.designation,
      Session: (a.sessionType || a.session_type || 'morning').toUpperCase(),
      'Check-in Time': a.loginTime ? new Date(a.loginTime).toLocaleTimeString() : '',
      Latitude: a.latitude,
      Longitude: a.longitude,
      'Distance from HQ (m)': a.distanceMeters ?? 'N/A',
      'Geofence Status': a.isInsideGeofence ? 'Inside HQ (≤500m)' : 'Field Deployment (>500m)',
      Address: a.addressText || a.address_text || '',
      Status: a.status || 'present',
    }));
    ExportUtils.exportToExcel(rows, `GW_Attendance_${selectedDate}`);
  };

  return (
    <AdminLayout
      title="Attendance Operations"
      subtitle="Full geofence tracking, live personnel positions, and daily deployment logs"
      onRefresh={fetchAttendance}
      onExport={handleExport}
      isRefreshing={loading}
      contentClassName="px-4 lg:px-6 py-4"
    >
      <div className="w-full space-y-3.5">
        {/* Bento Top Header Bar */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5 shadow-2xs">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 rounded-lg px-2.5 py-1">
              <Calendar size={13} className="text-slate-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
              />
            </div>

            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff, location, department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 pr-3 py-1 bg-slate-50 border border-slate-200/90 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-52 sm:w-64"
              />
            </div>

            <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg text-xs">
              {(
                [
                  { id: 'all', label: `All (${enrichedAttendance.length})` },
                  { id: 'geofence', label: `HQ (${inGeofenceCount})` },
                  { id: 'field', label: `Field (${fieldDeployCount})` },
                  { id: 'morning', label: `AM (${morningCount})` },
                  { id: 'afternoon', label: `PM (${afternoonCount})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as any)}
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                    activeFilter === tab.id
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsCheckInModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#10241E] hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-all"
            >
              <PlusCircle size={13} />
              <span>Record Check-In</span>
            </button>

            <Link
              href="/settings"
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200/90 transition-colors"
              title="Attendance Shifts & Deduction Settings"
            >
              <Settings size={14} />
            </Link>
          </div>
        </div>

        {/* Bento Grid: 12-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
          
          {/* Card 1 (Left 8 Cols): Live Map & Selected Intel */}
          <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Compass size={14} />
                  </div>
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Geospatial Radar & Geofence
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Tracking
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    HQ: {HQ_LAT}, {HQ_LNG}
                  </span>
                </div>
              </div>

              {/* Map Surface */}
              <div className="h-[360px] w-full rounded-lg border border-slate-200 overflow-hidden relative mt-2">
                <AttendanceMap
                  records={mapLocations}
                  selectedRecord={selectedRecord}
                  onSelectRecord={(rec) => setSelectedRecord(rec)}
                  officeLat={HQ_LAT}
                  officeLng={HQ_LNG}
                  officeRadiusMeters={HQ_RADIUS_METERS}
                />
              </div>
            </div>

            {/* Bottom Target Card */}
            {selectedRecord ? (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 truncate">
                      {selectedRecord.userName || 'Staff Member'}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500">• {selectedRecord.department}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                      selectedRecord.isInsideGeofence
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-sky-100 text-sky-800 border border-sky-200'
                    }`}>
                      {selectedRecord.isInsideGeofence ? 'Inside HQ' : 'Field Deploy'}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] truncate mt-0.5">
                    {selectedRecord.addressText || selectedRecord.address_text || 'Dhaka HQ'}
                    {selectedRecord.distanceMeters !== undefined && (
                      <span className="font-mono ml-1 font-semibold text-slate-700">
                        ({selectedRecord.distanceMeters > 1000 ? `${(selectedRecord.distanceMeters / 1000).toFixed(1)} km` : `${selectedRecord.distanceMeters} m`} from center)
                      </span>
                    )}
                  </p>
                </div>

                {selectedRecord.parsedLat && selectedRecord.parsedLng && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleCopyCoords(selectedRecord.parsedLat, selectedRecord.parsedLng, selectedRecord.id)}
                      className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 rounded-md text-[11px] font-semibold text-slate-700 shadow-2xs"
                    >
                      {copiedId === selectedRecord.id ? 'Copied' : 'Copy GPS'}
                    </button>
                    <a
                      href={`https://www.google.com/maps?q=${selectedRecord.parsedLat},${selectedRecord.parsedLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1 bg-[#10241E] hover:bg-slate-800 text-white rounded-md text-[11px] font-semibold shadow-2xs"
                    >
                      <span>Maps</span>
                      <ArrowUpRight size={12} />
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-2.5 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center text-xs text-slate-400">
                Click any staff pin on the map or roster to inspect coordinates.
              </div>
            )}
          </div>

          {/* Card 2 (Right 4 Cols): Bento KPI Metrics + Live Check-in Stream */}
          <div className="lg:col-span-4 flex flex-col space-y-3.5">
            {/* Top 4 Stat Micro-Cards in 2x2 Bento */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 bg-white border border-slate-200/90 rounded-xl shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Checked In</span>
                  <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 size={12} />
                  </div>
                </div>
                <p className="text-xl font-extrabold text-slate-900 mt-1">{attendance.length}</p>
                <span className="text-[10px] text-slate-400 font-medium">Out of {users.length || 0} active</span>
              </div>

              <div className="p-3 bg-white border border-slate-200/90 rounded-xl shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Turnout Rate</span>
                  <div className="w-5 h-5 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center">
                    <TrendingUp size={12} />
                  </div>
                </div>
                <p className="text-xl font-extrabold text-slate-900 mt-1">{presenceRatio}%</p>
                <span className="text-[10px] text-emerald-600 font-medium font-mono">Present today</span>
              </div>

              <div className="p-3 bg-white border border-slate-200/90 rounded-xl shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Office (HQ)</span>
                  <div className="w-5 h-5 rounded-md bg-slate-100 text-slate-800 flex items-center justify-center">
                    <Building size={12} />
                  </div>
                </div>
                <p className="text-xl font-extrabold text-slate-900 mt-1">{inGeofenceCount}</p>
                <span className="text-[10px] text-slate-400 font-medium">Within 500m radius</span>
              </div>

              <div className="p-3 bg-white border border-slate-200/90 rounded-xl shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Field Sites</span>
                  <div className="w-5 h-5 rounded-md bg-sky-50 text-sky-700 flex items-center justify-center">
                    <Navigation size={12} />
                  </div>
                </div>
                <p className="text-xl font-extrabold text-slate-900 mt-1">{fieldDeployCount}</p>
                <span className="text-[10px] text-slate-400 font-medium">Remote deployments</span>
              </div>
            </div>

            {/* Live Check-in Feed Column */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs flex-1 flex flex-col min-h-[300px]">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <Clock size={13} className="text-emerald-600" />
                  Realtime Check-in Stream
                </div>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                  {filteredRecords.length}
                </span>
              </div>

              <div className="space-y-1.5 overflow-y-auto flex-1 pr-1 max-h-[300px]">
                {filteredRecords.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center p-6 text-slate-400 text-xs">
                    No records found for this filter
                  </div>
                ) : (
                  filteredRecords.map((rec) => {
                    const isSelected = selectedRecord?.id === rec.id;
                    const time = rec.loginTime
                      ? new Date(rec.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '—';

                    return (
                      <div
                        key={rec.id}
                        onClick={() => setSelectedRecord(rec)}
                        className={`p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-slate-50 border-[#10241E] ring-1 ring-[#10241E]/20'
                            : 'bg-white border-slate-200/70 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 truncate mr-2">
                            {rec.userName || 'Staff Member'}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase shrink-0 ${
                              rec.isInsideGeofence
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-sky-100 text-sky-800'
                            }`}
                          >
                            {rec.isInsideGeofence ? 'HQ' : 'Field'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                          <span className="truncate max-w-[170px]">{rec.addressText || rec.address_text || 'Dhaka'}</span>
                          <span className="font-mono text-slate-400 font-semibold">{time}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Full-Width Bento Attendance Registry Table */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <FileSpreadsheet size={14} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Personnel Attendance Master Registry
                </h3>
                <p className="text-[11px] text-slate-400">Complete verification records with verified geofencing status</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
              {filteredRecords.length} Verified Entries
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200/90 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3.5">Employee Name & Role</th>
                  <th className="py-2.5 px-3.5">Session</th>
                  <th className="py-2.5 px-3.5">Check-In Time</th>
                  <th className="py-2.5 px-3.5">Verified Geofence Location</th>
                  <th className="py-2.5 px-3.5">HQ Offset</th>
                  <th className="py-2.5 px-3.5 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((rec) => {
                  const time = rec.loginTime
                    ? new Date(rec.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                    : '—';

                  return (
                    <tr
                      key={rec.id}
                      onClick={() => setSelectedRecord(rec)}
                      className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${selectedRecord?.id === rec.id ? 'bg-slate-50/80 font-medium' : ''}`}
                    >
                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar
                            src={rec.avatarUrl}
                            name={rec.userName || 'Staff Member'}
                            size="sm"
                            shape="rounded"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{rec.userName || 'Staff Member'}</span>
                            <span className="text-[10px] text-slate-400">{rec.designation || 'Staff'} • {rec.department || 'Operations'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-700">
                          {rec.sessionType || rec.session_type || 'Morning'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-slate-600 text-[11px]">
                        {time}
                      </td>
                      <td className="py-2.5 px-3.5">
                        <span className="text-slate-800 font-medium block truncate max-w-[320px]">
                          {rec.addressText || rec.address_text || `${rec.latitude}, ${rec.longitude}`}
                        </span>
                        <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded mt-0.5 ${
                          rec.isInsideGeofence ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
                        }`}>
                          {rec.isInsideGeofence ? 'Office Geofence (≤500m)' : 'Remote Field Deployment'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-slate-600 text-[11px]">
                        {rec.distanceMeters !== undefined 
                          ? (rec.distanceMeters > 1000 ? `${(rec.distanceMeters / 1000).toFixed(1)} km` : `${rec.distanceMeters} m`)
                          : '—'}
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-bold text-[10px]">
                          <CheckCircle2 size={11} />
                          Verified
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      No records found matching current query or filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Manual Check-in Modal */}
      {isCheckInModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-4 space-y-3 shadow-xl">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-900">Record Staff Check-In</h3>
              <button onClick={() => setIsCheckInModalOpen(false)}>
                <X className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleManualCheckIn} className="space-y-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Employee</label>
                <select
                  value={checkInUserId}
                  onChange={(e) => setCheckInUserId(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                >
                  <option value="">Select Employee...</option>
                  {users.map((u) => (
                    <option key={u.id || u._id} value={u.id || u._id}>
                      {u.firstName || u.name} {u.lastName || ''} ({u.role || 'Staff'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Session</label>
                  <select
                    value={checkInSession}
                    onChange={(e) => setCheckInSession(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                  >
                    <option value="morning">Morning Shift</option>
                    <option value="afternoon">Afternoon Shift</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">GPS Action</label>
                  <button
                    type="button"
                    onClick={handleGetCurrentGps}
                    className="w-full px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1"
                  >
                    <Crosshair size={12} />
                    <span>{isGettingGps ? 'Locating...' : 'Get GPS'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Address / Landmark</label>
                <input
                  type="text"
                  value={checkInAddress}
                  onChange={(e) => setCheckInAddress(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                />
              </div>

              <div className="flex justify-end gap-1.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCheckInModalOpen(false)}
                  className="px-2.5 py-1 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCheckIn}
                  className="px-3 py-1 bg-[#10241E] text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  {submittingCheckIn ? 'Recording...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
