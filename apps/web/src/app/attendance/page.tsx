'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AttendanceMap, AttendanceLocation } from '@/components/attendance/AttendanceMap';
import {
  MapPin,
  Calendar,
  Settings,
  PlusCircle,
  Crosshair,
  Search,
  X,
} from 'lucide-react';
import { ExportUtils } from '@/lib/exportUtils';
import { ApiClient } from '@/lib/api';
import { notifyAction } from '@/components/feedback/ActionFeedback';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { getWorkLocation, hasValidCoordinates, type AttendanceWorkLocation } from '@/lib/attendanceData';
import { readPageCache, writePageCache } from '@/lib/pageCache';
import { selectOwnRecords } from '@/lib/roleAccess';

const DEFAULT_OFFICE = {
  latitude: 23.7925,
  longitude: 90.4078,
  radiusMeters: 200,
  name: 'Geospatial Works HQ',
  address: 'Road 11, Block D, Banani, Dhaka',
};
const workLocationLabels: Record<AttendanceWorkLocation, string> = {
  office: 'Office',
  home: 'Home',
  home_office: 'Home office',
  field: 'Field',
  unknown: 'Unspecified',
};
const workLocationTones: Record<AttendanceWorkLocation, string> = {
  office: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  home: 'bg-violet-50 text-violet-700 ring-violet-100',
  home_office: 'bg-sky-50 text-sky-700 ring-sky-100',
  field: 'bg-amber-50 text-amber-700 ring-amber-100',
  unknown: 'bg-slate-100 text-slate-500 ring-slate-200',
};
const localDateInput = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};
const shiftDate = (value: string, amount: number) => {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + amount);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
type AttendancePageCache = { attendance: any[]; users: any[]; leaves: any[]; office: typeof DEFAULT_OFFICE };

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

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [office, setOffice] = useState(DEFAULT_OFFICE);
  const [selectedDate, setSelectedDate] = useState<string>(localDateInput);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [roleResolved, setRoleResolved] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [workLocationFilter, setWorkLocationFilter] = useState<'all' | AttendanceWorkLocation>('all');
  const [shiftFilter, setShiftFilter] = useState<'all' | 'morning' | 'afternoon'>('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);

  // Check-In Form
  const [checkInUserId, setCheckInUserId] = useState<string>('');
  const [checkInLat, setCheckInLat] = useState<number>(DEFAULT_OFFICE.latitude);
  const [checkInLng, setCheckInLng] = useState<number>(DEFAULT_OFFICE.longitude);
  const [checkInAddress, setCheckInAddress] = useState(DEFAULT_OFFICE.address);
  const [checkInSession, setCheckInSession] = useState<'morning' | 'afternoon'>('morning');
  const [checkInNotes, setCheckInNotes] = useState('');
  const [isGettingGps, setIsGettingGps] = useState(false);
  const [submittingCheckIn, setSubmittingCheckIn] = useState(false);

  const fetchAttendance = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setLoadError('');
    try {
      let signedInUser: any = null;
      try { signedInUser = JSON.parse(localStorage.getItem('gw_user') || 'null'); } catch {}
      if (signedInUser?.role === 'project_member') {
        const result = await ApiClient.getAttendance({ date: selectedDate });
        const ownAttendance = selectOwnRecords(Array.isArray(result) ? result : [], String(signedInUser.id ?? signedInUser._id ?? ''));
        setAttendance(ownAttendance);
        setUsers([]);
        setLeaves([]);
        setSelectedRecord(ownAttendance[0] ?? null);
        writePageCache<AttendancePageCache>(`attendance:member:${signedInUser.id ?? signedInUser._id}:${selectedDate}`, { attendance: ownAttendance, users: [], leaves: [], office: DEFAULT_OFFICE });
        return;
      }
      const [attendanceResult, usersResult, settingsResult, leavesResult] = await Promise.allSettled([
        ApiClient.getAttendance({ date: selectedDate }),
        ApiClient.getUsers(),
        ApiClient.getAttendanceSettings(),
        ApiClient.getLeaves(),
      ]);
      const failures = [
        attendanceResult.status === 'rejected' ? 'attendance records' : '',
        usersResult.status === 'rejected' ? 'employee directory' : '',
        settingsResult.status === 'rejected' ? 'attendance settings' : '',
        leavesResult.status === 'rejected' ? 'approved leave data' : '',
      ].filter(Boolean);
      const nextAttendance = attendanceResult.status === 'fulfilled' && Array.isArray(attendanceResult.value) ? attendanceResult.value : null;
      const nextUsers = usersResult.status === 'fulfilled' && Array.isArray(usersResult.value) ? usersResult.value : null;
      const nextLeaves = leavesResult.status === 'fulfilled' && Array.isArray(leavesResult.value) ? leavesResult.value : null;
      let nextOffice = DEFAULT_OFFICE;
      if (attendanceResult.status === 'fulfilled') {
        const attData = nextAttendance || [];
        setAttendance(attData);

        setSelectedRecord(attData[0] ?? null);
      }
      if (usersResult.status === 'fulfilled') setUsers(nextUsers || []);
      if (leavesResult.status === 'fulfilled') setLeaves(nextLeaves || []);
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
          address: String(settings.officeAddress ?? settings.office_address ?? DEFAULT_OFFICE.address),
        };
        setOffice(nextOffice);
      }
      if (!failures.length && nextAttendance && nextUsers && nextLeaves) {
        writePageCache<AttendancePageCache>(`attendance:${selectedDate}`, { attendance: nextAttendance, users: nextUsers, leaves: nextLeaves, office: nextOffice });
      }
      if (failures.length) setLoadError(`Could not load ${failures.join(' and ')}. Unavailable live data may be stale; the map uses the standard office settings for now.`);
    } catch (e) {
      console.error('Error fetching attendance:', e);
      setLoadError('Attendance data could not be refreshed. Showing the last successfully loaded data.');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    let user: any = null;
    try { user = JSON.parse(localStorage.getItem('gw_user') || 'null'); } catch { user = null; }
    setCurrentUser(user);
    setRoleResolved(true);
    const cacheKey = user?.role === 'project_member' ? `attendance:member:${user.id ?? user._id}:${selectedDate}` : `attendance:${selectedDate}`;
    const cached = readPageCache<AttendancePageCache>(cacheKey);
    if (cached) {
      setAttendance(cached.attendance);
      setUsers(cached.users);
      setLeaves(cached.leaves);
      setOffice(cached.office);
      setSelectedRecord(cached.attendance[0] ?? null);
    } else {
      setAttendance([]);
      setSelectedRecord(null);
    }
    void fetchAttendance(true);
    const unsubscribe = ApiClient.subscribeToDataRefresh((endpoint) => {
      if (['/attendance', '/attendance/settings', '/users', '/salary/leaves'].some((prefix) => endpoint.startsWith(prefix))) {
        void fetchAttendance(true);
      }
    });
    return unsubscribe;
  }, [fetchAttendance]);

  const handleGetCurrentGps = () => {
    if (!navigator.geolocation) {
      notifyAction('Geolocation is not supported by this browser.', 'error', 'Location unavailable');
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
        notifyAction(`Could not get device location: ${err.message}`, 'error', 'Location unavailable');
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
      notifyAction('Check-in has been recorded.');
    } catch (err: any) {
      notifyAction(`Check-in failed: ${err.message}`, 'error');
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
      const userName = item.userName || item.user_name || (u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : '') || u?.name || u?.full_name || u?.email || 'Employee';
      const userEmail = item.userEmail || item.user_email || u?.email || '';
      const department = item.department || u?.department || 'Unassigned';
      const designation = item.designation || u?.designation || u?.role || 'Employee';
      const avatarUrl = item.avatarUrl || item.avatar_url || u?.avatarUrl;

      const hasCoordinates = hasValidCoordinates(item.latitude ?? item.lat, item.longitude ?? item.lng);
      const lat = hasCoordinates ? Number(item.latitude ?? item.lat) : null;
      const lng = hasCoordinates ? Number(item.longitude ?? item.lng) : null;
      const dist = hasCoordinates ? calculateDistance(lat!, lng!, office.latitude, office.longitude) : null;
      const isInside = dist !== null && dist <= office.radiusMeters;

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
        workLocation: getWorkLocation({ ...item, isInsideGeofence: isInside }),
      };
    });
  }, [attendance, users, office]);

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

      if (departmentFilter !== 'all' && rec.department !== departmentFilter) return false;
      const late = String(rec.status ?? '').toLowerCase().includes('late') || String(rec.notes ?? '').toLowerCase().includes('late check-in') || Number(rec.lateMinutes ?? rec.late_minutes ?? 0) > 0;
      if (statusFilter === 'late' && !late) return false;
      if (statusFilter === 'present' && late) return false;
      if (statusFilter === 'absent' || statusFilter === 'on leave') return false;
      if (workLocationFilter !== 'all' && rec.workLocation !== workLocationFilter) return false;
      if (shiftFilter !== 'all' && (rec.sessionType || rec.session_type) !== shiftFilter) return false;

      return true;
    });
  }, [enrichedAttendance, searchQuery, workLocationFilter, shiftFilter, departmentFilter, statusFilter]);

  const attendanceRoster = useMemo(() => {
    const selected = new Date(`${selectedDate}T00:00:00`);
    const onLeaveIds = new Set(leaves.filter((leave) => {
      const status = String(leave.status ?? (leave.isApproved || leave.is_approved ? 'approved' : '')).toLowerCase();
      if (!['approved', 'accepted'].includes(status)) return false;
      const start = new Date(String(leave.startDate ?? leave.start_date ?? ''));
      const end = new Date(String(leave.endDate ?? leave.end_date ?? leave.startDate ?? leave.start_date ?? ''));
      return Boolean(!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && selected >= new Date(start.toDateString()) && selected <= new Date(end.toDateString()));
    }).map((leave) => String(leave.userId ?? leave.user_id ?? leave.employeeId ?? leave.employee_id)));
    const byUser = new Map<string, any>();
    enrichedAttendance.forEach((record) => {
      const userId = String(record.userId ?? record.user_id ?? record.employeeId ?? record.employee_id ?? record.id ?? '');
      const previous = byUser.get(userId);
      if (!previous || new Date(record.loginTime ?? record.created_at ?? 0).getTime() > new Date(previous.loginTime ?? previous.created_at ?? 0).getTime()) byUser.set(userId, record);
    });
    const rows = users.filter((user) => user.isActive !== false && user.is_active !== false && user.active !== false).map((user) => {
      const id = String(user.id ?? user._id ?? '');
      const record = byUser.get(id);
      const statusValue = String(record?.status ?? '').toLowerCase();
      const notes = String(record?.notes ?? '').toLowerCase();
      const isLate = statusValue.includes('late') || notes.includes('late check-in') || Number(record?.lateMinutes ?? record?.late_minutes ?? 0) > 0;
      const status = record ? (isLate ? 'Late' : 'Present') : onLeaveIds.has(id) ? 'On leave' : 'Absent';
      return {
        id,
        name: [user.firstName ?? user.first_name, user.lastName ?? user.last_name].filter(Boolean).join(' ') || user.name || user.full_name || user.email || 'Employee',
        email: user.email ?? '',
        department: user.department ?? 'Unassigned',
        designation: user.designation ?? user.role ?? 'Employee',
        shift: record?.sessionType ?? record?.session_type ?? user.shift ?? '—',
      workLocation: record?.workLocation ?? (record ? getWorkLocation(record) : 'unknown'),
        record,
        status,
      };
    });
    return rows;
  }, [users, enrichedAttendance, leaves, selectedDate]);
  const visibleRoster = useMemo(() => attendanceRoster.filter((row) => {
    const query = searchQuery.trim().toLowerCase();
    const record = row.record;
    return (!query || `${row.name} ${row.email} ${row.department}`.toLowerCase().includes(query)) &&
      (departmentFilter === 'all' || row.department === departmentFilter) &&
      (statusFilter === 'all' || row.status.toLowerCase() === statusFilter) &&
      (workLocationFilter === 'all' || row.workLocation === workLocationFilter) &&
      (shiftFilter === 'all' || row.shift === shiftFilter);
  }), [attendanceRoster, searchQuery, departmentFilter, statusFilter, workLocationFilter, shiftFilter]);
  const departments = useMemo(() => [...new Set(users.map((user) => String(user.department || 'Unassigned')))].sort(), [users]);
  const presentCount = attendanceRoster.filter((row) => row.status === 'Present').length;
  const lateCount = attendanceRoster.filter((row) => row.status === 'Late').length;
  const leaveCount = attendanceRoster.filter((row) => row.status === 'On leave').length;
  const absentCount = attendanceRoster.filter((row) => row.status === 'Absent').length;

  // Counts
  const presenceRatio = users.length > 0 ? Math.round(((presentCount + lateCount) / users.length) * 100) : 0;

  const mapLocations: AttendanceLocation[] = filteredRecords.flatMap((a) => {
    if (a.parsedLat === null || a.parsedLng === null) return [];
    return [{
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
    workLocation: a.workLocation,
    }];
  });

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
      'Work location': workLocationLabels[a.workLocation as AttendanceWorkLocation] || 'Unspecified',
      'Distance from HQ (m)': a.distanceMeters ?? 'N/A',
      Address: a.addressText || a.address_text || '',
      Status: a.status || 'present',
    }));
    ExportUtils.exportToExcel(rows, `GW_Attendance_${selectedDate}`);
    notifyAction('Attendance report downloaded as an Excel workbook.');
  };

  if (!roleResolved) {
    return <AdminLayout title="Attendance" subtitle="Loading your workspace"><div className="px-5 py-8 text-sm text-slate-500">Loading attendance…</div></AdminLayout>;
  }

  if (currentUser?.role === 'project_member') {
    const timeOf = (record: any) => record.loginTime || record.login_time || record.createdAt || record.created_at;
    const locationOf = (record: any) => record.addressText || record.address_text || 'Check-in location recorded';
    return (
      <AdminLayout title="My attendance" subtitle="Your own check-in history" onRefresh={() => fetchAttendance()} isRefreshing={loading} contentClassName="mx-auto w-full max-w-5xl px-5 py-5">
        <div className="space-y-4">
          <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div><h1 className="text-base font-semibold text-slate-900">My attendance</h1><p className="mt-1 text-xs text-slate-500">Only your attendance records are shown here.</p></div>
            <div className="flex items-center gap-2"><label className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs text-slate-600"><Calendar size={14}/><input aria-label="Attendance date" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="bg-transparent outline-none" /></label><Link href="/expenses" className="inline-flex h-9 items-center rounded-lg bg-indigo-600 px-3 text-xs font-semibold text-white hover:bg-indigo-700">Submit a claim</Link></div>
          </section>
          {loadError && <div role="status" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">{loadError}</div>}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><div><h2 className="text-sm font-semibold text-slate-900">Check-in history</h2><p className="mt-1 text-xs text-slate-500">{selectedDate} · {attendance.length} check-ins</p></div><span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">{attendance.length ? 'Recorded' : 'No check-in'}</span></div>
            {loading && !attendance.length ? <p className="px-4 py-8 text-center text-sm text-slate-500">Loading your attendance…</p> : attendance.length ? <ul className="divide-y divide-slate-100">{attendance.map((record) => <li key={record.id ?? record._id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"><div className="flex min-w-0 items-start gap-3"><span className="mt-0.5 rounded-lg bg-indigo-50 p-2 text-indigo-600"><MapPin size={15}/></span><div className="min-w-0"><p className="text-xs font-semibold text-slate-800">{locationOf(record)}</p><p className="mt-1 text-[11px] text-slate-500">{record.sessionType || record.session_type || 'Shift'} · {timeOf(record) ? new Date(timeOf(record)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Time unavailable'}</p></div></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold capitalize text-emerald-700">{record.status || 'Present'}</span></li>)}</ul> : <div className="px-4 py-12 text-center"><p className="text-sm font-medium text-slate-700">No check-in recorded for this date.</p><p className="mt-1 text-xs text-slate-500">Your attendance history will appear here after you check in.</p></div>}
          </section>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Attendance"
      subtitle="Team presence and check-ins"
      onRefresh={fetchAttendance}
      onExport={handleExport}
      isRefreshing={loading}
      contentClassName="px-4 lg:px-6 py-4"
    >
      <div className="mx-auto w-full max-w-[1600px] space-y-3 py-2">
        {loadError && <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"><span>{loadError}</span><button type="button" onClick={() => void fetchAttendance()} className="shrink-0 rounded-md border border-amber-300 bg-white px-2.5 py-1 font-semibold hover:bg-amber-100">Retry</button></div>}
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"><div><h1 className="text-lg font-semibold tracking-tight text-slate-900">Attendance</h1><p className="mt-0.5 text-xs text-slate-500">Daily team presence and check-ins</p></div><div className="flex flex-wrap items-center gap-2"><div className="flex h-9 items-center overflow-hidden rounded-lg border border-slate-200 bg-white"><button aria-label="Previous day" onClick={() => setSelectedDate((date) => shiftDate(date, -1))} className="grid h-full w-8 place-items-center text-slate-500 hover:bg-slate-50">&lt;</button><label className="flex h-full items-center gap-1.5 border-x border-slate-200 px-2.5"><Calendar size={14} className="text-slate-500"/><input aria-label="Attendance date" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-[122px] bg-transparent text-xs font-medium text-slate-700 outline-none" /></label><button aria-label="Next day" onClick={() => setSelectedDate((date) => shiftDate(date, 1))} className="grid h-full w-8 place-items-center text-slate-500 hover:bg-slate-50">&gt;</button></div><Link href="/settings" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"><Settings size={14}/>Settings</Link><button onClick={() => setIsCheckInModalOpen(true)} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 text-xs font-semibold text-white hover:bg-indigo-700"><PlusCircle size={14}/>Record check-in</button></div></section>
        <section aria-label="Attendance summary" className="grid grid-cols-2 gap-2 sm:grid-cols-4">{[{ label: "Present", value: presentCount, color: "bg-emerald-500" }, { label: "Late", value: lateCount, color: "bg-amber-500" }, { label: "On leave", value: leaveCount, color: "bg-sky-500" }, { label: "Absent", value: absentCount, color: "bg-rose-500" }].map((metric) => <div key={metric.label} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"><div><p className="text-[11px] font-medium text-slate-500">{metric.label}</p><p className="mt-0.5 text-xl font-semibold tabular-nums text-slate-900">{metric.value}</p></div><span className={`h-2.5 w-2.5 rounded-full ${metric.color}`} /></div>)}</section>
        <section aria-label="Attendance filters" className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="relative min-w-[190px] flex-1"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"/><input aria-label="Search employees" placeholder="Search by name or email" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-9 w-full rounded-lg border border-slate-200 pl-8 pr-3 text-xs outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" /></div>
          <select aria-label="Department" value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="h-9 min-w-[138px] rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700"><option value="all">All departments</option>{departments.map((department) => <option key={department}>{department}</option>)}</select>
          <select aria-label="Attendance status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 min-w-[122px] rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700"><option value="all">All statuses</option><option value="present">Present</option><option value="late">Late</option><option value="on leave">On leave</option><option value="absent">Absent</option></select>
          <select aria-label="Work location" value={workLocationFilter} onChange={(e) => setWorkLocationFilter(e.target.value as 'all' | AttendanceWorkLocation)} className="h-9 min-w-[140px] rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700"><option value="all">All work locations</option>{(['office', 'home', 'home_office', 'field', 'unknown'] as AttendanceWorkLocation[]).map((location) => <option key={location} value={location}>{workLocationLabels[location]}</option>)}</select>
          <select aria-label="Shift" value={shiftFilter} onChange={(e) => setShiftFilter(e.target.value as typeof shiftFilter)} className="h-9 min-w-[110px] rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700"><option value="all">All shifts</option><option value="morning">Morning</option><option value="afternoon">Afternoon</option></select>
          <span className="ml-auto whitespace-nowrap px-1 text-xs tabular-nums text-slate-500">{visibleRoster.length} employees</span>
        </section>
        <div className="grid grid-cols-1 items-stretch gap-3 xl:grid-cols-12">
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm xl:col-span-8"><div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><div><h2 className="text-sm font-semibold text-slate-900">Team attendance</h2><p className="mt-0.5 text-xs text-slate-500">{selectedDate} | {visibleRoster.length} employees</p></div><span className="rounded-md bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700">{presenceRatio}% present</span></div><div className="overflow-x-auto"><table className="w-full min-w-[790px] text-left text-xs"><thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-2.5">Employee</th><th className="px-3 py-2.5">Department</th><th className="px-3 py-2.5">Shift</th><th className="px-3 py-2.5">Check-in</th><th className="px-3 py-2.5">Work location</th><th className="px-4 py-2.5 text-right">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{visibleRoster.length ? visibleRoster.map((row) => { const record = row.record; const time = record?.loginTime || record?.login_time || record?.created_at; const tone = row.status === "Present" ? "bg-emerald-50 text-emerald-700" : row.status === "Late" ? "bg-amber-50 text-amber-700" : row.status === "On leave" ? "bg-sky-50 text-sky-700" : "bg-slate-100 text-slate-600"; const location = row.workLocation as AttendanceWorkLocation; return <tr key={row.id} onClick={() => record && setSelectedRecord(record)} className={`transition-colors ${record ? "cursor-pointer hover:bg-indigo-50/40" : ""} ${selectedRecord && record?.id === selectedRecord.id ? "bg-indigo-50/50" : ""}`}><td className="px-4 py-2.5"><div className="flex items-center gap-2.5"><UserAvatar src={record?.avatarUrl || record?.avatar_url || users.find((u) => String(u.id ?? u._id) === row.id)?.avatarUrl} name={row.name} size="sm" shape="rounded"/><div className="min-w-0"><div className="truncate font-medium text-slate-800">{row.name}</div><div className="truncate text-[10px] text-slate-400">{row.email}</div></div></div></td><td className="px-3 py-2.5 text-slate-600">{row.department}</td><td className="px-3 py-2.5 capitalize text-slate-600">{row.shift}</td><td className="px-3 py-2.5 tabular-nums text-slate-600">{time ? new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</td><td className="px-3 py-2.5"><span className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-medium ring-1 ring-inset ${workLocationTones[location]}`}>{workLocationLabels[location]}</span></td><td className="px-4 py-2.5 text-right"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium ${tone}`}>{row.status}</span></td></tr>; }) : <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500">{users.length ? "No employees match these filters." : "No employee records are available."}</td></tr>}</tbody></table></div></section>
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm xl:col-span-4"><div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><div><h2 className="text-sm font-semibold text-slate-900">Attendance locations</h2><p className="mt-0.5 text-xs text-slate-500">{office.name}</p></div><span className="inline-flex items-center gap-1.5 text-[10px] text-slate-500"><MapPin size={12}/>{mapLocations.length} check-ins</span></div><div className="h-[310px] w-full overflow-hidden sm:h-[360px]"><AttendanceMap records={mapLocations} selectedRecord={selectedRecord} onSelectRecord={(record) => setSelectedRecord(record)} officeLat={office.latitude} officeLng={office.longitude} officeRadiusMeters={office.radiusMeters} /></div><div className="border-t border-slate-100 px-4 py-2.5">{selectedRecord ? <div className="flex min-w-0 items-center justify-between gap-2"><div className="min-w-0"><p className="truncate text-xs font-semibold text-slate-800">{selectedRecord.userName || "Employee"}</p><p className="truncate text-[10px] text-slate-500">{selectedRecord.addressText || selectedRecord.address_text || "Check-in location"}</p></div>{hasValidCoordinates(selectedRecord.parsedLat ?? selectedRecord.latitude, selectedRecord.parsedLng ?? selectedRecord.longitude) && <a href={`https://www.google.com/maps?q=${selectedRecord.parsedLat ?? selectedRecord.latitude},${selectedRecord.parsedLng ?? selectedRecord.longitude}`} target="_blank" rel="noopener noreferrer" className="shrink-0 text-[11px] font-medium text-indigo-700 hover:text-indigo-900">Open map</a>}</div> : <p className="text-xs text-slate-500">Select a check-in in the roster or on the map to inspect location.</p>}</div></section>
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
