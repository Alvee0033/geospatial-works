'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AttendanceMap, AttendanceLocation } from '@/components/attendance/AttendanceMap';
import {
  MapPin,
  Calendar,
  CalendarRange,
  Users,
  CheckSquare,
  Square,
  Settings,
  PlusCircle,
  Crosshair,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileSpreadsheet,
  FileText,
  Download,
  Building2,
  ExternalLink,
  ShieldCheck,
  Edit3,
  Layers,
  Map as MapIcon,
  Home,
  Briefcase,
} from 'lucide-react';
import { ExportUtils } from '@/lib/exportUtils';
import { ApiClient } from '@/lib/api';
import { notifyAction } from '@/components/feedback/ActionFeedback';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { getWorkLocation, hasValidCoordinates, type AttendanceWorkLocation } from '@/lib/attendanceData';
import { readPageCache, writePageCache } from '@/lib/pageCache';

const DEFAULT_OFFICE = {
  latitude: 23.758569565440553,
  longitude: 90.35626173019409,
  radiusMeters: 550,
  name: 'Office HQ',
  address: 'Mohammadpur, Dhaka',
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

function isAttendanceRecordEarlyLeave(record: any): boolean {
  if (!record) return false;
  if (record.isEarlyDeparture || record.is_early_departure) return true;
  if (record.earlyDepartureReason || record.early_departure_reason) return true;
  const rawStatus = String(record.status ?? '').toLowerCase();
  if (rawStatus.includes('early') || rawStatus === 'early_departure' || rawStatus === 'early_leave') return true;
  const notes = String(record.notes ?? '').toLowerCase();
  return (
    notes.includes('[early departure') ||
    notes.includes('early departure') ||
    notes.includes('[checked out before time]') ||
    notes.includes('early leave') ||
    notes.includes('[early leave')
  );
}

function getEarlyDepartureReason(record: any): string | null {
  if (!record) return null;
  if (record.earlyDepartureReason) return String(record.earlyDepartureReason);
  if (record.early_departure_reason) return String(record.early_departure_reason);
  const notes = String(record.notes ?? '');
  const match = notes.match(/\[Early Departure:\s*([^\]]+)\]/i);
  if (match && match[1]) return match[1].trim();
  const matchLeave = notes.match(/\[Early Leave:\s*([^\]]+)\]/i);
  if (matchLeave && matchLeave[1]) return matchLeave[1].trim();
  if (isAttendanceRecordEarlyLeave(record)) return 'Before time exit';
  return null;
}

function getRecordLocationBadgeInfo(record: any, office: { latitude: number; longitude: number; radiusMeters: number }) {
  if (!record) return null;
  const workMode = String(record.workMode || record.work_mode || '').toLowerCase();
  const notes = String(record.notes || '');
  const notesLower = notes.toLowerCase();

  const isField =
    workMode === 'field' ||
    notesLower.includes('[work mode: field]') ||
    notesLower.includes('[field duty]') ||
    notesLower.includes('field:');

  const isHomeOffice =
    workMode === 'home_office' ||
    notesLower.includes('[work mode: home office]') ||
    notesLower.includes('[home office]') ||
    notesLower.includes('home office:');

  const isHome =
    workMode === 'home' ||
    notesLower.includes('[work mode: home]') ||
    notesLower.includes('[work from home]') ||
    notesLower.includes('wfh');

  if (isField) {
    const siteMatch = notes.match(/(?:Site|site):\s*([^|\[\n]+)/);
    const site = siteMatch ? siteMatch[1].trim() : '';
    return {
      type: 'field' as const,
      label: site ? `Field • ${site}` : 'Field',
      cls: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    };
  }

  if (isHomeOffice) {
    return {
      type: 'home_office' as const,
      label: 'Home Office',
      cls: 'bg-purple-50 text-purple-700 border-purple-200',
    };
  }

  if (isHome) {
    return {
      type: 'home' as const,
      label: 'Home',
      cls: 'bg-amber-50 text-amber-700 border-amber-200',
    };
  }

  // Office check geofence distance
  const lat = Number(record.latitude ?? record.lat);
  const lng = Number(record.longitude ?? record.lng);
  const hasCoords = hasValidCoordinates(lat, lng);
  const dist = hasCoords ? calculateDistance(lat, lng, office.latitude, office.longitude) : null;
  const isInside = dist !== null && dist <= office.radiusMeters;
  const isOutside = dist !== null && dist > office.radiusMeters;
  const distText = dist !== null ? (dist >= 1000 ? `${(dist / 1000).toFixed(1)}km` : `${dist}m`) : null;

  if (isOutside || notesLower.includes('[geofence: outside') || notesLower.includes('outside geofence')) {
    return {
      type: 'office_outside' as const,
      label: distText ? `Office Outside (${distText})` : 'Office Outside',
      cls: 'bg-rose-50 text-rose-700 border-rose-200',
    };
  }

  if (isInside || notesLower.includes('[geofence: inside') || notesLower.includes('in geofence')) {
    return {
      type: 'office_in_range' as const,
      label: distText ? `Office In-Range (${distText})` : 'Office In-Range',
      cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  }

  return {
    type: 'office' as const,
    label: 'Office',
    cls: 'bg-slate-100 text-slate-700 border-slate-200',
  };
}

function isAttendanceRecordLate(
  record: any,
  timings?: {
    morningStartHour?: number;
    afternoonStartHour?: number;
    breakEndHour?: number;
    gracePeriodMinutes?: number;
  }
): boolean {
  if (!record) return false;

  const rawStatus = String(record.status ?? '').toLowerCase();
  const rawNotes = String(record.notes ?? '').toLowerCase();
  const explicitLateMin = Number(record.lateMinutes ?? record.late_minutes ?? 0);

  if (rawStatus.includes('late') || rawNotes.includes('late check-in') || explicitLateMin > 0) {
    return true;
  }

  // Check login time against shift schedule
  const loginTimeRaw = record.loginTime || record.login_time || record.createdAt || record.created_at;
  if (!loginTimeRaw) return false;

  const loginDate = new Date(loginTimeRaw);
  if (Number.isNaN(loginDate.getTime())) return false;

  // Convert to Dhaka local time (UTC+6)
  const localD = new Date(loginDate.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
  const hours = localD.getHours();
  const minutes = localD.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  const session = String(record.sessionType || record.session_type || 'morning').toLowerCase();
  const grace = timings?.gracePeriodMinutes ?? 15;

  if (session === 'morning') {
    const startHour = timings?.morningStartHour ?? 9;
    const cutoff = startHour * 60 + grace; // e.g. 9:15 AM
    if (totalMinutes > cutoff) {
      return true;
    }
  } else if (session === 'afternoon') {
    // Break end hour serves as afternoon shift start
    const startHour = timings?.breakEndHour ?? timings?.afternoonStartHour ?? 14;
    const cutoff = startHour * 60 + grace; // e.g. 2:15 PM
    if (totalMinutes > cutoff) {
      return true;
    }
  }

  return false;
}

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [office, setOffice] = useState(DEFAULT_OFFICE);
  const [timingSettings, setTimingSettings] = useState<{
    morningStartHour: number;
    morningEndHour: number;
    afternoonStartHour: number;
    afternoonEndHour: number;
    breakStartHour?: number;
    breakEndHour?: number;
    gracePeriodMinutes: number;
  }>({
    morningStartHour: 9,
    morningEndHour: 13,
    afternoonStartHour: 14,
    afternoonEndHour: 18,
    breakStartHour: 13,
    breakEndHour: 14,
    gracePeriodMinutes: 15,
  });
  const [selectedDate, setSelectedDate] = useState<string>(localDateInput);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [workLocationFilter, setWorkLocationFilter] = useState<'all' | AttendanceWorkLocation>('all');
  const [shiftFilter, setShiftFilter] = useState<'all' | 'morning' | 'afternoon'>('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Manual Check-In Modal State
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [checkInUserId, setCheckInUserId] = useState<string>('');
  const [checkInDate, setCheckInDate] = useState<string>(localDateInput);
  const [checkInLat, setCheckInLat] = useState<number>(DEFAULT_OFFICE.latitude);
  const [checkInLng, setCheckInLng] = useState<number>(DEFAULT_OFFICE.longitude);
  const [checkInAddress, setCheckInAddress] = useState(DEFAULT_OFFICE.address);
  const [checkInSession, setCheckInSession] = useState<'morning' | 'afternoon'>('morning');
  const [checkInWorkMode, setCheckInWorkMode] = useState<'office' | 'home' | 'home_office' | 'field'>('office');
  const [checkInStatus, setCheckInStatus] = useState<string>('present');
  const [checkInNotes, setCheckInNotes] = useState('');
  const [isGettingGps, setIsGettingGps] = useState(false);
  const [submittingCheckIn, setSubmittingCheckIn] = useState(false);

  // Batch / Range Attendance Override Modal State
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [overrideUserIds, setOverrideUserIds] = useState<string[]>([]);
  const [overrideUserSearch, setOverrideUserSearch] = useState('');
  const [overrideStartDate, setOverrideStartDate] = useState<string>(localDateInput);
  const [overrideEndDate, setOverrideEndDate] = useState<string>(localDateInput);
  const [overrideStatus, setOverrideStatus] = useState<string>('present');
  const [overrideWorkMode, setOverrideWorkMode] = useState<string>('office');
  const [overrideSkipWeekends, setOverrideSkipWeekends] = useState<boolean>(true);
  const [overrideSkipHolidays, setOverrideSkipHolidays] = useState<boolean>(true);
  const [overrideNotes, setOverrideNotes] = useState<string>('Administrative range override');
  const [submittingOverride, setSubmittingOverride] = useState<boolean>(false);

  // Work Location Assignment Modal State
  const [isWorkLocModalOpen, setIsWorkLocModalOpen] = useState(false);
  const [workLocUserIds, setWorkLocUserIds] = useState<string[]>([]);
  const [workLocUserSearch, setWorkLocUserSearch] = useState('');
  const [workLocStartDate, setWorkLocStartDate] = useState<string>(localDateInput);
  const [workLocEndDate, setWorkLocEndDate] = useState<string>(localDateInput);
  const [assignedWorkLocation, setAssignedWorkLocation] = useState<'office' | 'home' | 'field'>('office');
  const [workLocProjectId, setWorkLocProjectId] = useState<string>('');
  const [workLocNotes, setWorkLocNotes] = useState<string>('');
  const [submittingWorkLoc, setSubmittingWorkLoc] = useState<boolean>(false);
  const [availableProjects, setAvailableProjects] = useState<any[]>([]);
  const [locationAssignments, setLocationAssignments] = useState<any[]>([]);

  // Employee Monthly Dossier State
  const [selectedEmployeeForDetail, setSelectedEmployeeForDetail] = useState<any | null>(null);
  const [detailMonth, setDetailMonth] = useState<number>(() => new Date().getMonth() + 1);
  const [detailYear, setDetailYear] = useState<number>(() => new Date().getFullYear());
  const [monthlyRecords, setMonthlyRecords] = useState<any[]>([]);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [dossierTab, setDossierTab] = useState<'records' | 'calendar'>('records');
  const [dossierSelectedRecord, setDossierSelectedRecord] = useState<AttendanceLocation | null>(null);

  const fetchAttendance = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setLoadError('');
    try {
      const [attendanceResult, usersResult, settingsResult, leavesResult, workLocsResult] = await Promise.allSettled([
        ApiClient.getAttendance({ date: selectedDate }),
        ApiClient.getUsers(),
        ApiClient.getAttendanceSettings(),
        ApiClient.getLeaves(),
        ApiClient.getWorkLocationAssignments(selectedDate, selectedDate),
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
      const nextWorkLocs = workLocsResult.status === 'fulfilled' && Array.isArray(workLocsResult.value) ? workLocsResult.value : [];
      let nextOffice = DEFAULT_OFFICE;
      if (attendanceResult.status === 'fulfilled') {
        const attData = nextAttendance || [];
        setAttendance(attData);
        setSelectedRecord(attData[0] ?? null);
      }
      if (usersResult.status === 'fulfilled') setUsers(nextUsers || []);
      if (leavesResult.status === 'fulfilled') setLeaves(nextLeaves || []);
      setLocationAssignments(nextWorkLocs);
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

        const mStart = Number(settings.morningStartHour ?? settings.morning_start_hour);
        const mEnd = Number(settings.morningEndHour ?? settings.morning_end_hour);
        const aStart = Number(settings.afternoonStartHour ?? settings.afternoon_start_hour);
        const aEnd = Number(settings.afternoonEndHour ?? settings.afternoon_end_hour);
        const bStart = Number(settings.breakStartHour ?? settings.break_start_hour);
        const bEnd = Number(settings.breakEndHour ?? settings.break_end_hour);
        const grace = Number(settings.gracePeriodMinutes ?? settings.grace_period_minutes);
        setTimingSettings({
          morningStartHour: Number.isFinite(mStart) && mStart > 0 ? mStart : 9,
          morningEndHour: Number.isFinite(mEnd) && mEnd > 0 ? mEnd : 13,
          afternoonStartHour: Number.isFinite(aStart) && aStart > 0 ? aStart : 14,
          afternoonEndHour: Number.isFinite(aEnd) && aEnd > 0 ? aEnd : 18,
          breakStartHour: Number.isFinite(bStart) && bStart >= 0 ? bStart : (Number.isFinite(mEnd) ? mEnd : 13),
          breakEndHour: Number.isFinite(bEnd) && bEnd >= 0 ? bEnd : (Number.isFinite(aStart) ? aStart : 14),
          gracePeriodMinutes: Number.isFinite(grace) && grace >= 0 ? grace : 15,
        });
      }
      if (!failures.length && nextAttendance && nextUsers && nextLeaves) {
        writePageCache<AttendancePageCache>(`attendance:${selectedDate}`, { attendance: nextAttendance, users: nextUsers, leaves: nextLeaves, office: nextOffice });
      }
      if (failures.length) setLoadError(`Could not load ${failures.join(' and ')}. Showing existing data.`);
    } catch (e) {
      console.error('Error fetching attendance:', e);
      setLoadError('Attendance data could not be refreshed. Showing last successfully loaded data.');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    const cached = readPageCache<AttendancePageCache>(`attendance:${selectedDate}`);
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

  // Sync check-in form default coords whenever office location resolves
  useEffect(() => {
    if (office?.latitude && office?.longitude) {
      setCheckInLat(office.latitude);
      setCheckInLng(office.longitude);
      setCheckInAddress(office.address || office.name || 'Office HQ');
    }
  }, [office]);

  // Fetch monthly records for the selected employee dossier
  const fetchEmployeeMonthlyRecords = useCallback(async () => {
    if (!selectedEmployeeForDetail?.id) return;
    setMonthlyLoading(true);
    try {
      const records = await ApiClient.getAttendance({
        userId: selectedEmployeeForDetail.id,
        month: String(detailMonth),
        year: String(detailYear),
      });
      setMonthlyRecords(Array.isArray(records) ? records : []);
    } catch (err) {
      console.error('Failed to load employee monthly records:', err);
      setMonthlyRecords([]);
    } finally {
      setMonthlyLoading(false);
    }
  }, [selectedEmployeeForDetail, detailMonth, detailYear]);

  useEffect(() => {
    if (selectedEmployeeForDetail) {
      void fetchEmployeeMonthlyRecords();
    }
  }, [selectedEmployeeForDetail, detailMonth, detailYear, fetchEmployeeMonthlyRecords]);

  // Quick helper to fill office HQ geofence pin
  const handleUseOfficeGps = () => {
    setCheckInLat(office.latitude);
    setCheckInLng(office.longitude);
    setCheckInAddress(office.address || office.name || 'Office HQ');
    setCheckInWorkMode('office');
    notifyAction('Applied Office HQ Geofence Pin.', 'info');
  };

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
        notifyAction('Device GPS coordinates captured.', 'success');
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
    if (!checkInUserId) {
      notifyAction('Please select an employee.', 'error');
      return;
    }
    setSubmittingCheckIn(true);
    try {
      await ApiClient.recordCheckIn({
        userId: checkInUserId,
        latitude: checkInLat,
        longitude: checkInLng,
        addressText: checkInAddress,
        sessionType: checkInSession,
        workMode: checkInWorkMode,
        status: checkInStatus,
        notes: checkInNotes,
        date: checkInDate,
      });
      setIsCheckInModalOpen(false);
      setCheckInNotes('');
      await fetchAttendance();
      if (selectedEmployeeForDetail && selectedEmployeeForDetail.id === checkInUserId) {
        await fetchEmployeeMonthlyRecords();
      }
      notifyAction('Manual attendance check-in recorded successfully.');
    } catch (err: any) {
      notifyAction(`Check-in failed: ${err.message}`, 'error');
    } finally {
      setSubmittingCheckIn(false);
    }
  };

  const openCheckInForUser = (userOrRow: any, customDate?: string) => {
    const id = userOrRow.id || userOrRow._id;
    setCheckInUserId(id);
    if (customDate) setCheckInDate(customDate);
    else setCheckInDate(selectedDate);
    setCheckInLat(office.latitude);
    setCheckInLng(office.longitude);
    setCheckInAddress(office.address || office.name || 'Office HQ');
    setCheckInWorkMode('office');
    setCheckInStatus('present');
    setIsCheckInModalOpen(true);
  };

  const handleOverrideAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (overrideUserIds.length === 0) {
      notifyAction('Please select at least one employee.', 'error');
      return;
    }
    if (!overrideStartDate || !overrideEndDate) {
      notifyAction('Please select both start and end dates.', 'error');
      return;
    }
    if (overrideStartDate > overrideEndDate) {
      notifyAction('Start date cannot be after end date.', 'error');
      return;
    }
    setSubmittingOverride(true);
    try {
      const res = await ApiClient.overrideAttendance({
        userIds: overrideUserIds,
        startDate: overrideStartDate,
        endDate: overrideEndDate,
        status: overrideStatus,
        workMode: overrideWorkMode,
        skipWeekends: overrideSkipWeekends,
        skipHolidays: overrideSkipHolidays,
        notes: overrideNotes,
      });
      setIsOverrideModalOpen(false);
      await fetchAttendance();
      if (selectedEmployeeForDetail && overrideUserIds.includes(selectedEmployeeForDetail.id)) {
        await fetchEmployeeMonthlyRecords();
      }
      notifyAction(res?.message || `Attendance override applied successfully (${res?.updatedRecords ?? res?.appliedCount ?? 0} records updated).`);
    } catch (err: any) {
      notifyAction(`Attendance override failed: ${err.message}`, 'error');
    } finally {
      setSubmittingOverride(false);
    }
  };

  const handleAssignWorkLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (workLocUserIds.length === 0) {
      notifyAction('Please select at least one employee.', 'error');
      return;
    }
    if (!workLocStartDate || !workLocEndDate) {
      notifyAction('Please select both start and end dates.', 'error');
      return;
    }
    if (workLocStartDate > workLocEndDate) {
      notifyAction('Start date cannot be after end date.', 'error');
      return;
    }

    setSubmittingWorkLoc(true);
    try {
      const res = await ApiClient.assignWorkLocations({
        userIds: workLocUserIds,
        startDate: workLocStartDate,
        endDate: workLocEndDate,
        workLocation: assignedWorkLocation,
        projectId: assignedWorkLocation === 'field' && workLocProjectId ? workLocProjectId : undefined,
        notes: workLocNotes || undefined,
      });

      setIsWorkLocModalOpen(false);
      setWorkLocNotes('');
      await fetchAttendance();
      if (selectedEmployeeForDetail && workLocUserIds.includes(selectedEmployeeForDetail.id)) {
        await fetchEmployeeMonthlyRecords();
      }
      notifyAction(res?.message || 'Work locations assigned successfully.');
    } catch (err: any) {
      notifyAction(`Work location assignment failed: ${err.message}`, 'error');
    } finally {
      setSubmittingWorkLoc(false);
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
      const late = isAttendanceRecordLate(rec, timingSettings);
      if (statusFilter === 'late' && !late) return false;
      if (statusFilter === 'present' && late) return false;
      if (statusFilter === 'absent' || statusFilter === 'on leave') return false;
      if (workLocationFilter !== 'all' && rec.workLocation !== workLocationFilter) return false;
      if (shiftFilter !== 'all' && (rec.sessionType || rec.session_type) !== shiftFilter) return false;

      return true;
    });
  }, [enrichedAttendance, searchQuery, workLocationFilter, shiftFilter, departmentFilter, statusFilter, timingSettings]);

  const attendanceRoster = useMemo(() => {
    const selected = new Date(`${selectedDate}T00:00:00`);
    const onLeaveIds = new Set(leaves.filter((leave) => {
      const status = String(leave.status ?? (leave.isApproved || leave.is_approved ? 'approved' : '')).toLowerCase();
      if (!['approved', 'accepted'].includes(status)) return false;
      const start = new Date(String(leave.startDate ?? leave.start_date ?? ''));
      const end = new Date(String(leave.endDate ?? leave.end_date ?? leave.startDate ?? leave.start_date ?? ''));
      return Boolean(!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && selected >= new Date(start.toDateString()) && selected <= new Date(end.toDateString()));
    }).map((leave) => String(leave.userId ?? leave.user_id ?? leave.employeeId ?? leave.employee_id)));

    const userRecordsMap = new Map<string, { morning?: any; afternoon?: any; latest?: any; all: any[] }>();
    enrichedAttendance.forEach((record) => {
      const userId = String(record.userId ?? record.user_id ?? record.employeeId ?? record.employee_id ?? record.id ?? '');
      if (!userRecordsMap.has(userId)) {
        userRecordsMap.set(userId, { all: [] });
      }
      const entry = userRecordsMap.get(userId)!;
      entry.all.push(record);
      const session = String(record.sessionType || record.session_type || '').toLowerCase();
      if (session === 'morning' && !entry.morning) entry.morning = record;
      if (session === 'afternoon' && !entry.afternoon) entry.afternoon = record;

      if (!entry.latest || new Date(record.loginTime ?? record.created_at ?? 0).getTime() > new Date(entry.latest.loginTime ?? entry.latest.created_at ?? 0).getTime()) {
        entry.latest = record;
      }
    });

    const assignedLocMap = new Map<string, any>();
    locationAssignments.forEach((la) => {
      if (la.userId || la.user_id) assignedLocMap.set(String(la.userId || la.user_id), la);
    });

    const rows = users.filter((user) => user.isActive !== false && user.is_active !== false && user.active !== false).map((user) => {
      const id = String(user.id ?? user._id ?? '');
      const userRecs = userRecordsMap.get(id);
      const record = userRecs?.latest;
      const morningRec = userRecs?.morning;
      const afternoonRec = userRecs?.afternoon;

      const hasEarlyLeave = userRecs?.all.some((r) => isAttendanceRecordEarlyLeave(r)) ?? false;
      const earlyLeaveReason = userRecs?.all.map((r) => getEarlyDepartureReason(r)).find(Boolean) || null;

      const isLate = isAttendanceRecordLate(record, timingSettings) || (morningRec ? isAttendanceRecordLate(morningRec, timingSettings) : false);

      let status = 'Absent';
      if (record) {
        if (hasEarlyLeave) {
          status = 'Early Leave';
        } else if (isLate) {
          status = 'Late';
        } else {
          status = 'Present';
        }
      } else if (onLeaveIds.has(id)) {
        status = 'On leave';
      }

      const assignedLoc = assignedLocMap.get(id);
      return {
        id,
        name: [user.firstName ?? user.first_name, user.lastName ?? user.last_name].filter(Boolean).join(' ') || user.name || user.full_name || user.email || 'Employee',
        email: user.email ?? '',
        department: user.department ?? 'Unassigned',
        designation: user.designation ?? user.role ?? 'Employee',
        shift: record?.sessionType ?? record?.session_type ?? user.shift ?? '—',
        workLocation: record?.workLocation ?? (record ? getWorkLocation(record) : 'unknown'),
        assignedWorkLocation: assignedLoc?.workLocation || assignedLoc?.work_location || 'office',
        assignedLocationNotes: assignedLoc?.notes || null,
        assignedLocationProject: assignedLoc?.projectTitle || assignedLoc?.projectName || null,
        avatarUrl: record?.avatarUrl || record?.avatar_url || user.avatarUrl || user.avatar_url,
        record,
        morningRec,
        afternoonRec,
        hasEarlyLeave,
        earlyLeaveReason,
        status,
        user,
        createdAt: user.createdAt || user.created_at,
        created_at: user.createdAt || user.created_at,
      };
    });
    return rows;
  }, [users, enrichedAttendance, leaves, locationAssignments, selectedDate, timingSettings]);

  const visibleRoster = useMemo(() => attendanceRoster.filter((row) => {
    const query = searchQuery.trim().toLowerCase();
    return (!query || `${row.name} ${row.email} ${row.department}`.toLowerCase().includes(query)) &&
      (departmentFilter === 'all' || row.department === departmentFilter) &&
      (statusFilter === 'all' || row.status.toLowerCase() === statusFilter || (statusFilter === 'early leave' && row.status.toLowerCase() === 'early leave')) &&
      (workLocationFilter === 'all' || row.workLocation === workLocationFilter) &&
      (shiftFilter === 'all' || row.shift === shiftFilter);
  }), [attendanceRoster, searchQuery, departmentFilter, statusFilter, workLocationFilter, shiftFilter]);

  const departments = useMemo(() => [...new Set(users.map((user) => String(user.department || 'Unassigned')))].sort(), [users]);
  const presentCount = attendanceRoster.filter((row) => row.status === 'Present').length;
  const lateCount = attendanceRoster.filter((row) => row.status === 'Late').length;
  const earlyLeaveCount = attendanceRoster.filter((row) => row.status === 'Early Leave').length;
  const leaveCount = attendanceRoster.filter((row) => row.status === 'On leave').length;
  const absentCount = attendanceRoster.filter((row) => row.status === 'Absent').length;

  const presenceRatio = users.length > 0 ? Math.round(((presentCount + lateCount + earlyLeaveCount) / users.length) * 100) : 0;

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

  // Convert monthly records of the selected employee into geocoded map locations with location names
  const employeeMapLocations: AttendanceLocation[] = useMemo(() => {
    return monthlyRecords.flatMap((r) => {
      const hasCoords = hasValidCoordinates(r.latitude ?? r.lat, r.longitude ?? r.lng);
      if (!hasCoords) return [];
      const lat = Number(r.latitude ?? r.lat);
      const lng = Number(r.longitude ?? r.lng);
      const dist = calculateDistance(lat, lng, office.latitude, office.longitude);
      const isInside = dist <= office.radiusMeters;
      const locationName = r.addressText || r.address_text || (isInside ? `${office.name} (HQ Geofence)` : `Location: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);

      return [{
        id: String(r.id || `${r.date}-${r.sessionType}`),
        userName: selectedEmployeeForDetail?.name || 'Employee',
        userEmail: selectedEmployeeForDetail?.email,
        department: selectedEmployeeForDetail?.department,
        designation: selectedEmployeeForDetail?.designation,
        avatarUrl: selectedEmployeeForDetail?.avatarUrl,
        latitude: lat,
        longitude: lng,
        addressText: locationName,
        loginTime: r.loginTime || r.login_time || r.created_at,
        sessionType: r.sessionType || r.session_type || 'morning',
        status: r.status || 'present',
        distanceMeters: dist,
        workLocation: getWorkLocation({ ...r, isInsideGeofence: isInside }),
      }];
    });
  }, [monthlyRecords, selectedEmployeeForDetail, office]);

  useEffect(() => {
    if (employeeMapLocations.length > 0) {
      setDossierSelectedRecord(employeeMapLocations[0]);
    } else {
      setDossierSelectedRecord(null);
    }
  }, [employeeMapLocations]);

  // Compute 100% mathematically and historically accurate KPIs for the employee
  const employeeMonthlyAnalysis = useMemo(() => {
    if (!selectedEmployeeForDetail) return null;

    const daysInMonth = new Date(detailYear, detailMonth, 0).getDate();
    const recordsByDate: Record<string, { morning?: any; afternoon?: any; other?: any[] }> = {};

    monthlyRecords.forEach((rec) => {
      const d = String(rec.date).split('T')[0];
      if (!recordsByDate[d]) recordsByDate[d] = { other: [] };
      const sess = String(rec.sessionType || rec.session_type || '').toLowerCase();
      if (sess === 'morning') recordsByDate[d].morning = rec;
      else if (sess === 'afternoon') recordsByDate[d].afternoon = rec;
      else recordsByDate[d].other?.push(rec);
    });

    const userLeaves = leaves.filter((leave) => {
      const uId = String(leave.userId ?? leave.user_id ?? leave.employeeId ?? leave.employee_id);
      if (uId !== selectedEmployeeForDetail.id) return false;
      const status = String(leave.status ?? (leave.isApproved ? 'approved' : '')).toLowerCase();
      return ['approved', 'accepted'].includes(status);
    });

    // Extract employee join date so we do NOT falsely mark pre-joining days as absent
    const todayStr = localDateInput();
    const userJoinedRaw =
      selectedEmployeeForDetail?.createdAt ||
      selectedEmployeeForDetail?.created_at ||
      selectedEmployeeForDetail?.user?.createdAt ||
      selectedEmployeeForDetail?.user?.created_at;
    const userJoinDateStr = userJoinedRaw
      ? new Date(userJoinedRaw).toISOString().split('T')[0]
      : (monthlyRecords.length > 0 ? String(monthlyRecords[0].date).split('T')[0] : todayStr);

    let presentDays = 0;
    let lateDays = 0;
    let absentDays = 0;
    let leaveDays = 0;
    let totalWorkHours = 0;
    let eligibleWorkdays = 0;

    const daysList = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = `${detailYear}-${String(detailMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dateObj = new Date(`${dayDate}T00:00:00`);
      const jsDay = dateObj.getDay(); // 0 is Sunday, 5 is Friday, 6 is Saturday
      const isWeekend = jsDay === 5 || jsDay === 6; // Standard Bangladesh weekend

      const dayRecords = recordsByDate[dayDate];
      const morningRec = dayRecords?.morning;
      const afternoonRec = dayRecords?.afternoon;
      const hasAnyCheckIn = Boolean(morningRec || afternoonRec || (dayRecords?.other && dayRecords.other.length > 0));

      const isLeave = userLeaves.some((l) => {
        const start = new Date(String(l.startDate ?? l.start_date ?? ''));
        const end = new Date(String(l.endDate ?? l.end_date ?? l.startDate ?? l.start_date ?? ''));
        return !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && dateObj >= new Date(start.toDateString()) && dateObj <= new Date(end.toDateString());
      });

      let dayStatus: 'Present' | 'Late' | 'Early Leave' | 'Half day' | 'Absent' | 'On leave' | 'Weekend' | 'Future' | 'Not joined' = 'Absent';
      let hours = 0;

      if (dayDate < userJoinDateStr) {
        dayStatus = 'Not joined';
      } else if (dateObj > new Date(`${todayStr}T23:59:59`)) {
        dayStatus = 'Future';
      } else if (isWeekend && !hasAnyCheckIn) {
        dayStatus = 'Weekend';
      } else if (isLeave && !hasAnyCheckIn) {
        dayStatus = 'On leave';
        leaveDays++;
      } else if (hasAnyCheckIn) {
        const isMorningLate = isAttendanceRecordLate(morningRec, timingSettings);
        const isAfternoonLate = isAttendanceRecordLate(afternoonRec, timingSettings);
        const isOtherLate = Boolean(dayRecords?.other && dayRecords.other.some((r: any) => isAttendanceRecordLate(r, timingSettings)));
        const dayIsLate = isMorningLate || isAfternoonLate || isOtherLate;

        const isMorningEarly = isAttendanceRecordEarlyLeave(morningRec);
        const isAfternoonEarly = isAttendanceRecordEarlyLeave(afternoonRec);
        const isOtherEarly = Boolean(dayRecords?.other && dayRecords.other.some((r: any) => isAttendanceRecordEarlyLeave(r)));
        const dayIsEarly = isMorningEarly || isAfternoonEarly || isOtherEarly;

        if (morningRec && afternoonRec) {
          hours = 8;
          dayStatus = dayIsEarly ? 'Early Leave' : dayIsLate ? 'Late' : 'Present';
        } else {
          hours = 4;
          dayStatus = dayIsEarly ? 'Early Leave' : dayIsLate ? 'Late' : 'Half day';
        }

        if (dayIsLate) lateDays++;
        presentDays++;
        totalWorkHours += hours;
      } else {
        dayStatus = 'Absent';
        absentDays++;
      }

      if (dayDate >= userJoinDateStr && dayDate <= todayStr && !isWeekend && !isLeave) {
        eligibleWorkdays++;
      }

      daysList.push({
        date: dayDate,
        dayNumber: day,
        dayName: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
        dayStatus,
        hours,
        morning: morningRec,
        afternoon: afternoonRec,
        isWeekend,
      });
    }

    const onTimeDays = Math.max(0, presentDays - lateDays);
    const punctuality = presentDays > 0 ? Math.round((onTimeDays / presentDays) * 100) : 0;
    const attendanceScore = eligibleWorkdays > 0 ? Math.min(100, Math.round((presentDays / eligibleWorkdays) * 100)) : 0;

    return {
      daysInMonth,
      eligibleWorkdays,
      totalSessions: monthlyRecords.length,
      presentDays,
      lateDays,
      absentDays,
      leaveDays,
      totalWorkHours,
      punctuality,
      attendanceScore,
      userJoinDateStr,
      daysList,
    };
  }, [selectedEmployeeForDetail, detailMonth, detailYear, monthlyRecords, leaves, timingSettings]);

  const handleExportPdf = () => {
    if (!selectedEmployeeForDetail || !employeeMonthlyAnalysis) {
      notifyAction('Cannot export: No employee dossier selected.', 'error');
      return;
    }

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    const monthName = monthNames[detailMonth - 1] || `Month ${detailMonth}`;

    ExportUtils.exportAttendanceDossierPdf({
      employee: {
        name: selectedEmployeeForDetail.name,
        email: selectedEmployeeForDetail.email,
        department: selectedEmployeeForDetail.department,
        designation: selectedEmployeeForDetail.designation,
        employeeCode: selectedEmployeeForDetail.employeeCode || selectedEmployeeForDetail.user?.employeeCode,
        joinedDate: employeeMonthlyAnalysis.userJoinDateStr,
      },
      period: {
        monthName,
        year: detailYear,
      },
      kpis: {
        totalSessions: employeeMonthlyAnalysis.totalSessions,
        presentDays: employeeMonthlyAnalysis.presentDays,
        lateDays: employeeMonthlyAnalysis.lateDays,
        totalWorkHours: employeeMonthlyAnalysis.totalWorkHours,
        eligibleWorkdays: employeeMonthlyAnalysis.eligibleWorkdays,
        absentDays: employeeMonthlyAnalysis.absentDays,
        punctuality: employeeMonthlyAnalysis.punctuality,
      },
      records: monthlyRecords.map((r) => {
        const dateStr = String(r.date).split('T')[0];
        const lat = r.latitude ?? r.lat;
        const lng = r.longitude ?? r.lng;
        const dist = lat && lng ? calculateDistance(Number(lat), Number(lng), office.latitude, office.longitude) : null;
        return {
          date: dateStr,
          sessionType: r.sessionType || r.session_type || 'morning',
          loginTime: r.loginTime || r.login_time || r.created_at,
          workMode: r.workMode || r.work_mode || 'office',
          addressText: r.addressText || r.address_text || (dist !== null && dist <= office.radiusMeters ? `${office.name} (HQ)` : 'GPS Location'),
          distanceMeters: dist,
          status: r.status || 'present',
        };
      }),
      calendarDays: employeeMonthlyAnalysis.daysList.map((d) => ({
        date: d.date,
        dayName: d.dayName,
        morningTime: d.morning?.loginTime ? new Date(d.morning.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
        afternoonTime: d.afternoon?.loginTime ? new Date(d.afternoon.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
        hours: d.hours,
        dayStatus: d.dayStatus,
        locationName: d.morning?.addressText || d.morning?.address_text || d.afternoon?.addressText || d.afternoon?.address_text || (d.isWeekend ? 'Weekend Off' : d.dayStatus === 'Not joined' ? 'Pre-joining period' : '—'),
      })),
      officeName: `${office.name} (${office.radiusMeters}m geofence)`,
    });

    notifyAction(`Exported PDF attendance report for ${selectedEmployeeForDetail.name}.`, 'success');
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
      'Work location': workLocationLabels[a.workLocation as AttendanceWorkLocation] || 'Unspecified',
      'Distance from HQ (m)': a.distanceMeters ?? 'N/A',
      Address: a.addressText || a.address_text || '',
      Status: a.status || 'present',
    }));
    ExportUtils.exportToExcel(rows, `GW_Attendance_${selectedDate}`);
    notifyAction('Attendance report downloaded as an Excel workbook.');
  };

  const handleExportEmployeeMonthly = () => {
    if (!selectedEmployeeForDetail || !employeeMonthlyAnalysis) return;
    const monthName = new Date(detailYear, detailMonth - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const rows = monthlyRecords.map((r) => ({
      Date: String(r.date).split('T')[0],
      Session: String(r.sessionType || 'morning').toUpperCase(),
      'Time Logged': r.loginTime ? new Date(r.loginTime).toLocaleTimeString() : '—',
      Status: r.status,
      'Work Mode': r.workMode || 'office',
      'Location Name / Address': r.addressText || r.address_text || '',
      Latitude: r.latitude,
      Longitude: r.longitude,
      Notes: r.notes || '',
    }));
    ExportUtils.exportToExcel(rows, `Attendance_${selectedEmployeeForDetail.name.replace(/\s+/g, '_')}_${monthName.replace(/\s+/g, '_')}`);
    notifyAction(`Timesheet exported for ${selectedEmployeeForDetail.name}.`);
  };

  return (
    <AdminLayout
      title="Attendance"
      subtitle="Team presence, geofence status, and monthly dossier"
      onRefresh={fetchAttendance}
      onExport={handleExport}
      isRefreshing={loading}
      contentClassName="px-4 lg:px-6 py-4"
    >
      <div className="mx-auto w-full max-w-[1600px] space-y-3 py-2">
        {loadError && (
          <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <span>{loadError}</span>
            <button type="button" onClick={() => void fetchAttendance()} className="shrink-0 rounded-md border border-amber-300 bg-white px-2.5 py-1 font-semibold hover:bg-amber-100">Retry</button>
          </div>
        )}

        {/* Top Control Bar */}
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">Attendance Dashboard</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                <ShieldCheck size={12} className="text-emerald-600" />
                HQ Geofence: {office.radiusMeters}m Radius
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Active Center: {office.latitude.toFixed(4)}°N, {office.longitude.toFixed(4)}°E ({office.name})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Date Switcher */}
            <div className="flex h-9 items-center overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs">
              <button
                aria-label="Previous day"
                onClick={() => setSelectedDate((date) => shiftDate(date, -1))}
                className="grid h-full w-8 place-items-center text-slate-500 hover:bg-slate-50 font-bold"
              >
                &lt;
              </button>
              <label className="flex h-full items-center gap-1.5 border-x border-slate-200 px-2.5">
                <Calendar size={14} className="text-slate-500" />
                <input
                  aria-label="Attendance date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-[122px] bg-transparent text-xs font-semibold text-slate-700 outline-none"
                />
              </label>
              <button
                aria-label="Next day"
                onClick={() => setSelectedDate((date) => shiftDate(date, 1))}
                className="grid h-full w-8 place-items-center text-slate-500 hover:bg-slate-50 font-bold"
              >
                &gt;
              </button>
            </div>

            <Link
              href="/settings"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Settings size={14} />
              Geofence Settings
            </Link>

            <button
              onClick={async () => {
                setWorkLocStartDate(selectedDate);
                setWorkLocEndDate(selectedDate);
                setWorkLocUserIds([]);
                setIsWorkLocModalOpen(true);
                try {
                  const projs = await ApiClient.getProjects();
                  setAvailableProjects(Array.isArray(projs) ? projs : []);
                } catch {
                  // ignore
                }
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 text-xs font-bold text-white hover:bg-teal-700 shadow-xs transition-colors"
            >
              <MapPin size={14} />
              Work Location Assignment
            </button>

            <button
              onClick={() => {
                setOverrideStartDate(selectedDate);
                setOverrideEndDate(selectedDate);
                setOverrideUserIds([]);
                setIsOverrideModalOpen(true);
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition-colors"
            >
              <CalendarRange size={14} />
              Override Attendance
            </button>

            <button
              onClick={() => {
                setCheckInUserId('');
                setCheckInDate(selectedDate);
                setIsCheckInModalOpen(true);
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-xs transition-colors"
            >
              <PlusCircle size={14} />
              Record Manual Check-in
            </button>
          </div>
        </section>

        {/* Daily Summary Cards */}
        <section aria-label="Attendance summary" className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {[
            { label: 'Present Today', value: presentCount, color: 'bg-emerald-500', desc: 'On-time attendance' },
            { label: 'Late Check-ins', value: lateCount, color: 'bg-amber-500', desc: 'Outside grace window' },
            { label: 'Early Leave', value: earlyLeaveCount, color: 'bg-amber-600', desc: 'Checked out before time' },
            { label: 'On Approved Leave', value: leaveCount, color: 'bg-sky-500', desc: 'Approved casual/sick' },
            { label: 'Absent Personnel', value: absentCount, color: 'bg-rose-500', desc: 'No check-in record' },
          ].map((metric) => (
            <div key={metric.label} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xs">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{metric.label}</p>
                <p className="mt-0.5 text-2xl font-black tabular-nums text-slate-900">{metric.value}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{metric.desc}</p>
              </div>
              <span className={`h-3 w-3 rounded-full ${metric.color} shadow-xs`} />
            </div>
          ))}
        </section>

        {/* Filters and Search Bar */}
        <section aria-label="Attendance filters" className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5 shadow-xs">
          <div className="relative min-w-[200px] flex-1">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              aria-label="Search employees"
              placeholder="Search employee by name, email, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 pl-8 pr-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <select
            aria-label="Department"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="h-9 min-w-[138px] rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700"
          >
            <option value="all">All Departments</option>
            {departments.map((department) => (
              <option key={department} value={department}>{department}</option>
            ))}
          </select>

          <select
            aria-label="Attendance status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 min-w-[122px] rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="early leave">Early Leave</option>
            <option value="on leave">On leave</option>
            <option value="absent">Absent</option>
          </select>

          <select
            aria-label="Work location"
            value={workLocationFilter}
            onChange={(e) => setWorkLocationFilter(e.target.value as 'all' | AttendanceWorkLocation)}
            className="h-9 min-w-[140px] rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700"
          >
            <option value="all">All Locations</option>
            {(['office', 'home', 'home_office', 'field', 'unknown'] as AttendanceWorkLocation[]).map((location) => (
              <option key={location} value={location}>{workLocationLabels[location]}</option>
            ))}
          </select>

          <select
            aria-label="Shift"
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value as typeof shiftFilter)}
            className="h-9 min-w-[110px] rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700"
          >
            <option value="all">All Shifts</option>
            <option value="morning">Morning Shift</option>
            <option value="afternoon">Afternoon Shift</option>
          </select>

          <span className="ml-auto whitespace-nowrap px-2 text-xs font-bold text-slate-500">
            {visibleRoster.length} employees
          </span>
        </section>

        {/* Main Content: Roster (8 Cols) & Map (4 Cols) */}
        <div className="grid grid-cols-1 items-stretch gap-3 xl:grid-cols-12">
          {/* Team Attendance Table */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs xl:col-span-8 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Team Attendance Roster</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {selectedDate} • Click any employee row to open full monthly records, KPIs &amp; GPS pin map
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 border border-indigo-100">
                  {presenceRatio}% Present Today
                </span>
              </div>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full min-w-[840px] text-left text-xs">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-3 py-3">Department</th>
                    <th className="px-3 py-3">Shift</th>
                    <th className="px-3 py-3">Check-in</th>
                    <th className="px-3 py-3">Work Location</th>
                    <th className="px-3 py-3">Today Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleRoster.length ? (
                    visibleRoster.map((row) => {
                      const record = row.record;
                      const time = record?.loginTime || record?.login_time || record?.created_at;
                      const tone =
                        row.status === 'Early Leave'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : row.status === 'Present'
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                          : row.status === 'Late'
                          ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                          : row.status === 'On leave'
                          ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-200'
                          : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200';
                      const location = row.workLocation as AttendanceWorkLocation;
                      const morningBadge = getRecordLocationBadgeInfo(row.morningRec, office);
                      const afternoonBadge = getRecordLocationBadgeInfo(row.afternoonRec, office);
                      const hasSessionLocations = Boolean(morningBadge || afternoonBadge);

                      return (
                        <tr
                          key={row.id}
                          onClick={() => {
                            setSelectedEmployeeForDetail(row);
                            if (record) setSelectedRecord(record);
                          }}
                          className={`transition-colors cursor-pointer hover:bg-indigo-50/50 ${
                            selectedEmployeeForDetail?.id === row.id ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : ''
                          }`}
                        >
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2.5">
                              <UserAvatar
                                src={row.avatarUrl}
                                name={row.name}
                                size="sm"
                                shape="rounded"
                              />
                              <div className="min-w-0">
                                <div className="truncate font-bold text-slate-800">{row.name}</div>
                                <div className="truncate text-[10px] text-slate-400">{row.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-slate-600 font-medium">{row.department}</td>
                          <td className="px-3 py-2.5 capitalize text-slate-600 font-medium">{row.shift}</td>
                          <td className="px-3 py-2.5 tabular-nums text-slate-600 font-semibold">
                            {time ? new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex flex-wrap gap-1.5 items-center">
                              {hasSessionLocations ? (
                                <>
                                  {morningBadge && (
                                    <span
                                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border ${morningBadge.cls}`}
                                      title={`Morning Check-in: ${morningBadge.label}`}
                                    >
                                      <Clock size={10} className="shrink-0" />
                                      AM: {morningBadge.label}
                                    </span>
                                  )}
                                  {afternoonBadge && (
                                    <span
                                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border ${afternoonBadge.cls}`}
                                      title={`Afternoon Check-out: ${afternoonBadge.label}`}
                                    >
                                      <Clock size={10} className="shrink-0" />
                                      PM: {afternoonBadge.label}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${workLocationTones[location]}`}>
                                  {workLocationLabels[location]}
                                </span>
                              )}
                              {row.assignedWorkLocation && row.assignedWorkLocation !== 'office' && (
                                <span
                                  className="inline-flex items-center gap-1 text-[9px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200"
                                  title={row.assignedLocationNotes || (row.assignedLocationProject ? `Project: ${row.assignedLocationProject}` : 'Assigned location')}
                                >
                                  <MapPin size={9} />
                                  Assigned: {row.assignedWorkLocation.toUpperCase()}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex flex-col gap-1 items-start">
                              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${tone}`}>
                                {row.status}
                              </span>
                              {row.hasEarlyLeave && (
                                <span
                                  className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300"
                                  title={row.earlyLeaveReason ? `Early Leave: ${row.earlyLeaveReason}` : 'Early Leave'}
                                >
                                  <Clock size={10} className="shrink-0 text-amber-600" />
                                  <span>Early Leave{row.earlyLeaveReason ? `: ${row.earlyLeaveReason}` : ''}</span>
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedEmployeeForDetail(row)}
                                className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md text-[11px] font-bold transition-colors"
                                title="View Employee Monthly Dossier & GPS Map"
                              >
                                Dossier
                              </button>
                              <button
                                type="button"
                                onClick={() => openCheckInForUser(row)}
                                className="px-2 py-1 bg-[#10241E] hover:bg-slate-800 text-white rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors"
                                title="Log Manual Attendance for this employee"
                              >
                                <Edit3 size={11} />
                                <span>Log</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                        {users.length ? 'No employees match the current filters.' : 'No employee records are available.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Attendance Locations Map */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs xl:col-span-4 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Attendance Locations</h2>
                <p className="mt-0.5 text-xs text-slate-500">{office.name} ({office.radiusMeters}m geofence)</p>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                <MapPin size={12} />
                {mapLocations.length} check-ins
              </span>
            </div>

            <div className="h-[320px] w-full overflow-hidden sm:h-[380px]">
              <AttendanceMap
                records={mapLocations}
                selectedRecord={selectedRecord}
                onSelectRecord={(record) => setSelectedRecord(record)}
                officeLat={office.latitude}
                officeLng={office.longitude}
                officeRadiusMeters={office.radiusMeters}
              />
            </div>

            <div className="border-t border-slate-100 px-4 py-2.5 bg-slate-50/50">
              {selectedRecord ? (
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-800">{selectedRecord.userName || 'Employee'}</p>
                    <p className="truncate text-[10px] text-slate-500">{selectedRecord.addressText || selectedRecord.address_text || 'Check-in location'}</p>
                  </div>
                  {hasValidCoordinates(selectedRecord.parsedLat ?? selectedRecord.latitude, selectedRecord.parsedLng ?? selectedRecord.longitude) && (
                    <a
                      href={`https://www.google.com/maps?q=${selectedRecord.parsedLat ?? selectedRecord.latitude},${selectedRecord.parsedLng ?? selectedRecord.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
                    >
                      <ExternalLink size={12} />
                      Open Map
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Select an employee in the roster or a pin on the map to inspect their check-in coordinates.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* INDIVIDUAL EMPLOYEE MONTHLY ATTENDANCE SIDE DRAWER */}
      {selectedEmployeeForDetail && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop with click-to-close */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setSelectedEmployeeForDetail(null)}
          />

          {/* Slide-over panel container on the right */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10 pointer-events-auto">
            <aside className="w-screen max-w-5xl bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full transform transition-all duration-300 ease-out animate-in slide-in-from-right">
              {/* Drawer Header */}
              <div className="border-b border-slate-200 px-6 py-4 bg-slate-50/90 backdrop-blur-sm shrink-0">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <UserAvatar
                      src={selectedEmployeeForDetail.avatarUrl}
                      name={selectedEmployeeForDetail.name}
                      size="lg"
                      shape="rounded"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                          {selectedEmployeeForDetail.name}
                        </h2>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            selectedEmployeeForDetail.status === 'Early Leave'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : selectedEmployeeForDetail.status === 'Present'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : selectedEmployeeForDetail.status === 'Late'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : selectedEmployeeForDetail.status === 'On leave'
                              ? 'bg-sky-100 text-sky-800 border border-sky-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          Today: {selectedEmployeeForDetail.status}
                          {selectedEmployeeForDetail.earlyLeaveReason && ` (${selectedEmployeeForDetail.earlyLeaveReason})`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                        <span className="font-medium text-slate-700">{selectedEmployeeForDetail.department || 'General'}</span>
                        <span className="text-slate-300">•</span>
                        <span>{selectedEmployeeForDetail.designation || 'Staff'}</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-mono text-slate-500">{selectedEmployeeForDetail.email}</span>
                        {employeeMonthlyAnalysis?.userJoinDateStr && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                              Joined: {new Date(employeeMonthlyAnalysis.userJoinDateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openCheckInForUser(selectedEmployeeForDetail)}
                      className="px-3 py-1.5 bg-[#10241E] text-white hover:bg-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                      title="Manually log attendance check-in for this employee"
                    >
                      <PlusCircle size={14} />
                      <span>Record Check-In</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportPdf}
                      className="px-3 py-1.5 bg-emerald-700 text-white hover:bg-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                      title="Download formatted monthly attendance PDF report"
                    >
                      <FileText size={14} />
                      <span>Export PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportEmployeeMonthly}
                      className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                      title="Export raw attendance records as Excel spreadsheet"
                    >
                      <FileSpreadsheet size={14} className="text-emerald-600" />
                      <span>Sheet</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedEmployeeForDetail(null)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors ml-1"
                      title="Close drawer"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              </div>

            {/* Month & Year Navigator + View Mode Tabs */}
            <div className="flex flex-wrap items-center justify-between border-b border-slate-200 px-6 py-2.5 bg-white gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (detailMonth === 1) {
                      setDetailMonth(12);
                      setDetailYear((y) => y - 1);
                    } else {
                      setDetailMonth((m) => m - 1);
                    }
                  }}
                  className="p-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                  title="Previous Month"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-bold text-slate-800 min-w-[150px] text-center">
                  {new Date(detailYear, detailMonth - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (detailMonth === 12) {
                      setDetailMonth(1);
                      setDetailYear((y) => y + 1);
                    } else {
                      setDetailMonth((m) => m + 1);
                    }
                  }}
                  className="p-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                  title="Next Month"
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    setDetailMonth(now.getMonth() + 1);
                    setDetailYear(now.getFullYear());
                  }}
                  className="px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 ml-1"
                >
                  Current Month
                </button>
              </div>

              {/* View Tabs */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setDossierTab('records')}
                  className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                    dossierTab === 'records'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MapPin size={12} />
                  <span>Logged Check-ins ({monthlyRecords.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDossierTab('calendar')}
                  className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                    dossierTab === 'calendar'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Calendar size={12} />
                  <span>Monthly Calendar Audit</span>
                </button>
              </div>
            </div>

            {/* Dossier Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Dossier Interactive Map & Selected Pin HUD */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                <div className="lg:col-span-8 rounded-xl border border-slate-200 overflow-hidden bg-white shadow-xs flex flex-col">
                  <div className="flex items-center justify-between border-b border-slate-100 px-3.5 py-2 bg-slate-50">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-indigo-600" />
                      <span className="text-xs font-bold text-slate-800">
                        Employee Attendance Pin Map ({employeeMapLocations.length} Geotagged Check-ins)
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500">
                      HQ Geofence: {office.radiusMeters}m ({office.name})
                    </span>
                  </div>
                  <div className="h-[240px] w-full overflow-hidden">
                    <AttendanceMap
                      records={employeeMapLocations}
                      selectedRecord={dossierSelectedRecord}
                      onSelectRecord={(rec) => setDossierSelectedRecord(rec)}
                      officeLat={office.latitude}
                      officeLng={office.longitude}
                      officeRadiusMeters={office.radiusMeters}
                    />
                  </div>
                </div>

                {/* Location Inspector HUD */}
                <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Attendance Pin Details
                      </span>
                      {dossierSelectedRecord && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                          {dossierSelectedRecord.sessionType}
                        </span>
                      )}
                    </div>

                    {dossierSelectedRecord ? (
                      <div className="space-y-2">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Location Name / Address</span>
                          <p className="text-xs font-bold text-slate-900 mt-0.5 leading-snug">
                            {dossierSelectedRecord.addressText || 'Office Geofence HQ'}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Check-in Time</span>
                            <span className="font-bold text-slate-800 tabular-nums">
                              {dossierSelectedRecord.loginTime ? new Date(dossierSelectedRecord.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                            </span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Geofence Status</span>
                            <span className="font-bold text-slate-800">
                              {dossierSelectedRecord.distanceMeters !== undefined && dossierSelectedRecord.distanceMeters !== null
                                ? dossierSelectedRecord.distanceMeters <= office.radiusMeters
                                  ? `Inside (${dossierSelectedRecord.distanceMeters}m)`
                                  : `Outside (${dossierSelectedRecord.distanceMeters}m)`
                                : 'At HQ'}
                            </span>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">GPS Coordinates</span>
                          <span className="font-mono text-[11px] font-semibold text-slate-700">
                            {dossierSelectedRecord.latitude.toFixed(5)}°N, {dossierSelectedRecord.longitude.toFixed(5)}°E
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 text-center text-slate-400 space-y-1">
                        <MapPin size={24} className="mx-auto text-slate-300" />
                        <p className="text-xs font-semibold">
                          {employeeMapLocations.length > 0
                            ? 'Click any pin or record to view location details.'
                            : 'No attendance records logged for this month yet.'}
                        </p>
                      </div>
                    )}
                  </div>

                  {dossierSelectedRecord && (
                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <a
                        href={`https://www.google.com/maps?q=${dossierSelectedRecord.latitude},${dossierSelectedRecord.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                      >
                        <ExternalLink size={12} />
                        Google Maps
                      </a>
                      <button
                        type="button"
                        onClick={() => openCheckInForUser(selectedEmployeeForDetail)}
                        className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
                      >
                        Re-mark
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* COMPACT BENTO GRID STATS */}
              {employeeMonthlyAnalysis && (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-12 gap-2.5">
                  {/* Bento Tile 1: Hero Punctuality & Health (3 cols) */}
                  <div className="col-span-2 sm:col-span-2 lg:col-span-3 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/40 p-3 shadow-2xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-indigo-600" />
                        Punctuality
                      </span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-100/70 text-indigo-800">
                        {employeeMonthlyAnalysis.presentDays === 0
                          ? 'No Check-ins'
                          : employeeMonthlyAnalysis.punctuality >= 90
                          ? 'Excellent'
                          : employeeMonthlyAnalysis.punctuality >= 75
                          ? 'Good'
                          : 'Needs Review'}
                      </span>
                    </div>
                    <div className="my-1 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-900 tracking-tight tabular-nums">
                        {employeeMonthlyAnalysis.punctuality}%
                      </span>
                      <span className="text-[11px] font-medium text-slate-500">
                        on-time arrival
                      </span>
                    </div>
                    <div className="pt-1.5 border-t border-indigo-100/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">On-Time / Attended:</span>
                      <span className="font-bold text-slate-800 tabular-nums">
                        {Math.max(0, employeeMonthlyAnalysis.presentDays - employeeMonthlyAnalysis.lateDays)} / {employeeMonthlyAnalysis.presentDays} days
                      </span>
                    </div>
                  </div>

                  {/* Bento Tile 2: Presence & Hours (3 cols) */}
                  <div className="col-span-2 sm:col-span-2 lg:col-span-3 rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/30 p-3 shadow-2xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock size={13} className="text-emerald-600" />
                        Presence &amp; Hours
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded tabular-nums">
                        {employeeMonthlyAnalysis.totalWorkHours}h Logged
                      </span>
                    </div>
                    <div className="my-1 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-emerald-900 tracking-tight tabular-nums">
                        {employeeMonthlyAnalysis.presentDays}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500">
                        days attended
                      </span>
                    </div>
                    <div className="pt-1.5 border-t border-emerald-100/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Recorded Sessions:</span>
                      <span className="font-bold text-emerald-900 tabular-nums">{employeeMonthlyAnalysis.totalSessions} check-ins</span>
                    </div>
                  </div>

                  {/* Bento Tile 3: Exceptions & Absences (3 cols) */}
                  <div className="col-span-2 sm:col-span-2 lg:col-span-3 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle size={13} className="text-amber-500" />
                        Late &amp; Absences
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        Exceptions
                      </span>
                    </div>
                    <div className="my-1 flex items-center gap-3">
                      <div>
                        <span className="text-2xl font-black text-amber-700 tabular-nums">
                          {employeeMonthlyAnalysis.lateDays}
                        </span>
                        <span className="text-[10px] text-slate-500 block font-medium">Late arrivals</span>
                      </div>
                      <div className="h-6 w-[1px] bg-slate-200" />
                      <div>
                        <span className="text-2xl font-black text-rose-700 tabular-nums">
                          {employeeMonthlyAnalysis.absentDays}
                        </span>
                        <span className="text-[10px] text-slate-500 block font-medium">Unexcused</span>
                      </div>
                    </div>
                    <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Approved Leaves:</span>
                      <span className="font-bold text-sky-700 tabular-nums">{employeeMonthlyAnalysis.leaveDays} days</span>
                    </div>
                  </div>

                  {/* Bento Tile 4: Geofence Status Quick Card (3 cols) */}
                  <div className="col-span-2 sm:col-span-2 lg:col-span-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 shadow-2xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                        <Building2 size={13} className="text-slate-600" />
                        HQ Geofence
                      </span>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                        {office.radiusMeters}m Radius
                      </span>
                    </div>
                    <div className="my-1">
                      <p className="text-xs font-bold text-slate-900 truncate" title={office.name}>
                        {office.name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5" title={office.address}>
                        {office.address}
                      </p>
                    </div>
                    <div className="pt-1.5 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Capture Mode:</span>
                      <span className="font-bold text-slate-700">GPS &amp; Geofence</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 1: Logged Check-in Records (Real Database Records) */}
              {dossierTab === 'records' && (
                <div className="rounded-xl border border-slate-200 overflow-hidden shadow-xs bg-white">
                  <div className="flex items-center justify-between bg-slate-50 px-4 py-3 border-b border-slate-200">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin size={13} className="text-indigo-600" />
                      Recorded Attendance Sessions ({monthlyRecords.length})
                    </h3>
                    <span className="text-[11px] font-medium text-slate-500">
                      Showing real check-in entries with geotags &amp; location names
                    </span>
                  </div>

                  <div className="overflow-x-auto min-h-[300px]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/70 text-[10px] font-bold uppercase tracking-wider text-slate-500 sticky top-0 z-10 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-3 py-3">Shift</th>
                          <th className="px-3 py-3">Time</th>
                          <th className="px-3 py-3">Work Mode</th>
                          <th className="px-4 py-3">Location Name / Address</th>
                          <th className="px-3 py-3">Geofence Status</th>
                          <th className="px-3 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {monthlyRecords.length > 0 ? (
                          monthlyRecords.map((r) => {
                            const dateStr = String(r.date).split('T')[0];
                            const timeStr = r.loginTime ? new Date(r.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
                            const hasCoords = hasValidCoordinates(r.latitude ?? r.lat, r.longitude ?? r.lng);
                            const dist = hasCoords ? calculateDistance(Number(r.latitude ?? r.lat), Number(r.longitude ?? r.lng), office.latitude, office.longitude) : null;
                            const isInside = dist !== null && dist <= office.radiusMeters;
                            const locationName = r.addressText || r.address_text || (isInside ? `${office.name} (HQ Geofence)` : `Coordinates: ${r.latitude}, ${r.longitude}`);
                            const isEarly = isAttendanceRecordEarlyLeave(r);
                            const earlyReason = getEarlyDepartureReason(r);
                            const isLate = isAttendanceRecordLate(r, timingSettings);
                            const statusTone = isEarly
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : isLate
                              ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                              : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';

                            return (
                              <tr
                                key={r.id || `${dateStr}-${r.sessionType}`}
                                onClick={() => {
                                  const loc = employeeMapLocations.find((l) => l.id === r.id);
                                  if (loc) setDossierSelectedRecord(loc);
                                }}
                                className="hover:bg-indigo-50/40 cursor-pointer transition-colors"
                              >
                                <td className="px-4 py-3.5 font-mono font-bold text-slate-800">{dateStr}</td>
                                <td className="px-3 py-3.5 capitalize font-semibold text-slate-700">{r.sessionType || 'morning'}</td>
                                <td className="px-3 py-3.5 font-semibold tabular-nums text-slate-800">{timeStr}</td>
                                <td className="px-3 py-3.5">
                                  <span className="capitalize px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                    {r.workMode || 'office'}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5 max-w-[240px]">
                                  <div className="truncate font-semibold text-slate-800" title={locationName}>
                                    {locationName}
                                  </div>
                                </td>
                                <td className="px-3 py-3.5">
                                  {dist !== null ? (
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${isInside ? 'text-emerald-700' : 'text-amber-700'}`}>
                                      {isInside ? 'Inside HQ (0m)' : `${dist}m from HQ`}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">No GPS</span>
                                  )}
                                </td>
                                <td className="px-3 py-3.5">
                                  <div className="flex flex-col gap-1 items-start">
                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${statusTone}`}>
                                      {isEarly ? 'Early Leave' : isLate ? 'Late' : (r.status || 'present')}
                                    </span>
                                    {isEarly && earlyReason && (
                                      <span className="text-[9px] font-semibold text-amber-700 max-w-[120px] truncate" title={earlyReason}>
                                        {earlyReason}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex items-center justify-end gap-1.5">
                                    {hasCoords && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const loc = employeeMapLocations.find((l) => l.id === r.id);
                                          if (loc) setDossierSelectedRecord(loc);
                                        }}
                                        className="px-2.5 py-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200"
                                      >
                                        Map Pin
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => openCheckInForUser(selectedEmployeeForDetail, dateStr)}
                                      className="px-2.5 py-1 text-[10px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200"
                                    >
                                      Edit
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                              <div className="max-w-sm mx-auto space-y-3">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-2xs">
                                  <MapPin size={24} />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-900">No Check-In Records For This Month</p>
                                  <p className="text-xs text-slate-400 mt-1">
                                    No attendance sessions were logged in the database yet for {new Date(detailYear, detailMonth - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
                                  </p>
                                </div>
                                <div className="flex items-center justify-center gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => openCheckInForUser(selectedEmployeeForDetail)}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#10241E] text-white hover:bg-slate-800 rounded-lg text-xs font-bold shadow-xs transition-colors"
                                  >
                                    <PlusCircle size={14} />
                                    Record Attendance Now
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDossierTab('calendar')}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-bold border border-slate-200 transition-colors"
                                  >
                                    <Calendar size={14} />
                                    View Calendar
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: Full Monthly Calendar Audit (Generous Up-Down Vertical Space) */}
              {dossierTab === 'calendar' && (
                <div className="rounded-xl border border-slate-200 overflow-hidden shadow-xs bg-white">
                  <div className="flex flex-wrap items-center justify-between bg-slate-50 px-4 py-3 border-b border-slate-200 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-indigo-100 text-indigo-700">
                        <Calendar size={14} />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Day-by-Day Monthly Calendar Audit ({employeeMonthlyAnalysis?.daysList.length || 0} Days)
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Complete monthly ledger accounting for join dates, Bangladesh weekend schedule, and approved leaves
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                        {employeeMonthlyAnalysis?.presentDays} Attended
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px]">
                        {employeeMonthlyAnalysis?.lateDays} Late
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px]">
                        {employeeMonthlyAnalysis?.absentDays} Absent
                      </span>
                    </div>
                  </div>

                  {/* Roomy, spacious day-by-day table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/80 text-[10px] font-bold uppercase tracking-wider text-slate-600 sticky top-0 z-10 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-3 py-3">Day</th>
                          <th className="px-4 py-3">Morning Session (In)</th>
                          <th className="px-4 py-3">Afternoon Session (Out)</th>
                          <th className="px-3 py-3">Hours</th>
                          <th className="px-3 py-3">Audited Status</th>
                          <th className="px-4 py-3">Location Name / Landmark</th>
                          <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {employeeMonthlyAnalysis?.daysList.map((day) => {
                          const mTime = day.morning?.loginTime
                            ? new Date(day.morning.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : null;
                          const aTime = day.afternoon?.loginTime
                            ? new Date(day.afternoon.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : null;

                          const badgeTone =
                            day.dayStatus === 'Early Leave'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : day.dayStatus === 'Present'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : day.dayStatus === 'Late'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : day.dayStatus === 'Half day'
                              ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                              : day.dayStatus === 'On leave'
                              ? 'bg-sky-50 text-sky-800 border-sky-200'
                              : day.dayStatus === 'Weekend'
                              ? 'bg-slate-100 text-slate-600 border-slate-200'
                              : day.dayStatus === 'Not joined'
                              ? 'bg-slate-100 text-slate-400 border-slate-200'
                              : day.dayStatus === 'Future'
                              ? 'bg-slate-50 text-slate-400 border-slate-100'
                              : 'bg-rose-50 text-rose-800 border-rose-200';

                          const locationName = day.morning?.addressText || day.morning?.address_text || day.afternoon?.addressText || day.afternoon?.address_text || (day.isWeekend ? 'Weekend Off' : day.dayStatus === 'Not joined' ? 'Pre-joining period' : '—');

                          return (
                            <tr
                              key={day.date}
                              className={`hover:bg-indigo-50/20 transition-colors ${
                                day.isWeekend || day.dayStatus === 'Not joined' ? 'bg-slate-50/50 text-slate-400' : ''
                              }`}
                            >
                              <td className="px-4 py-3.5 font-mono font-bold text-slate-900">{day.date}</td>
                              <td className="px-3 py-3.5 font-semibold text-slate-700">{day.dayName}</td>
                              <td className="px-4 py-3.5">
                                {day.morning ? (
                                  (() => {
                                    const isMornLate = isAttendanceRecordLate(day.morning, timingSettings);
                                    return (
                                      <div className="space-y-0.5">
                                        <div className="font-bold text-slate-900 tabular-nums flex items-center gap-1.5">
                                          {isMornLate ? (
                                            <AlertTriangle size={12} className="text-amber-500 shrink-0" />
                                          ) : (
                                            <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                                          )}
                                          {mTime}
                                          {isMornLate && (
                                            <span className="text-[9px] font-extrabold px-1 rounded bg-amber-100 text-amber-800">
                                              Late
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-[10px] text-slate-500 capitalize pl-4">
                                          {day.morning.workMode || 'Office'}
                                        </div>
                                      </div>
                                    );
                                  })()
                                ) : (
                                  <span className="text-slate-300 pl-2">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3.5">
                                {day.afternoon ? (
                                  (() => {
                                    const isAftLate = isAttendanceRecordLate(day.afternoon, timingSettings);
                                    const isAftEarly = isAttendanceRecordEarlyLeave(day.afternoon);
                                    const earlyReason = getEarlyDepartureReason(day.afternoon);
                                    return (
                                      <div className="space-y-0.5">
                                        <div className="font-bold text-slate-900 tabular-nums flex items-center gap-1.5">
                                          {isAftEarly ? (
                                            <Clock size={12} className="text-amber-600 shrink-0" />
                                          ) : isAftLate ? (
                                            <AlertTriangle size={12} className="text-amber-500 shrink-0" />
                                          ) : (
                                            <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                                          )}
                                          {aTime}
                                          {isAftEarly && (
                                            <span className="text-[9px] font-extrabold px-1 rounded bg-amber-100 text-amber-800" title={earlyReason || 'Early Leave'}>
                                              Early Leave
                                            </span>
                                          )}
                                          {isAftLate && !isAftEarly && (
                                            <span className="text-[9px] font-extrabold px-1 rounded bg-amber-100 text-amber-800">
                                              Late
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-[10px] text-slate-500 capitalize pl-4">
                                          {day.afternoon.workMode || 'Office'}
                                        </div>
                                      </div>
                                    );
                                  })()
                                ) : (
                                  <span className="text-slate-300 pl-2">—</span>
                                )}
                              </td>
                              <td className="px-3 py-3.5 font-bold tabular-nums text-slate-800">
                                {day.hours > 0 ? (
                                  <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-bold text-slate-700">
                                    {day.hours}h
                                  </span>
                                ) : (
                                  <span className="text-slate-300">—</span>
                                )}
                              </td>
                              <td className="px-3 py-3.5">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${badgeTone}`}>
                                  {day.dayStatus === 'Present' && <CheckCircle2 size={10} />}
                                  {day.dayStatus === 'Late' && <AlertTriangle size={10} />}
                                  {day.dayStatus === 'Early Leave' && <Clock size={10} className="text-amber-700" />}
                                  {day.dayStatus === 'Absent' && <XCircle size={10} />}
                                  {day.dayStatus}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 max-w-[240px]">
                                <div className="truncate text-slate-700 font-medium text-xs" title={locationName}>
                                  {locationName}
                                </div>
                              </td>
                              <td className="px-4 py-3.5 text-right">
                                {day.dayStatus !== 'Future' && day.dayStatus !== 'Not joined' && (
                                  <button
                                    type="button"
                                    onClick={() => openCheckInForUser(selectedEmployeeForDetail, day.date)}
                                    className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200 transition-colors shadow-2xs"
                                  >
                                    Mark
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              </div>

              {/* Drawer Sticky Footer */}
              <div className="border-t border-slate-200 px-6 py-3 bg-slate-50 flex items-center justify-between text-xs shrink-0">
                <div className="flex items-center gap-2 text-slate-500">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Verified employee attendance dossier • Live database sync</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportPdf}
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <FileText size={13} />
                    <span>Export PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedEmployeeForDetail(null)}
                    className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      )}

      {/* ENHANCED MANUAL CHECK-IN OVERRIDE SIDE DRAWER PANEL */}
      {isCheckInModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300">
          <div
            className="fixed inset-0"
            onClick={() => setIsCheckInModalOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-xl h-full bg-white shadow-2xl border-l border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-right duration-250">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                  <PlusCircle size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Record Manual Check-in</h3>
                  <p className="text-xs text-slate-500">Admin manual override / backdate attendance</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCheckInModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Form Body */}
            <form onSubmit={handleManualCheckIn} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Employee Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Select Employee</label>
                <select
                  value={checkInUserId}
                  onChange={(e) => setCheckInUserId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                  required
                >
                  <option value="">Select Employee...</option>
                  {users.map((u) => (
                    <option key={u.id || u._id} value={u.id || u._id}>
                      {u.firstName || u.name} {u.lastName || ''} ({u.role || 'Staff'}) — {u.department || 'General'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Session */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Attendance Date</label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Shift Session</label>
                  <select
                    value={checkInSession}
                    onChange={(e) => setCheckInSession(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white"
                  >
                    <option value="morning">Morning Shift (In)</option>
                    <option value="afternoon">Afternoon Shift (Out)</option>
                  </select>
                </div>
              </div>

              {/* Work Mode & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Work Mode</label>
                  <select
                    value={checkInWorkMode}
                    onChange={(e) => setCheckInWorkMode(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white"
                  >
                    <option value="office">Office (HQ Geofence)</option>
                    <option value="home_office">Home Office</option>
                    <option value="field">Field Site</option>
                    <option value="home">Home</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Mark Status</label>
                  <select
                    value={checkInStatus}
                    onChange={(e) => setCheckInStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white"
                  >
                    <option value="present">Present (On-time)</option>
                    <option value="late">Late Check-in</option>
                    <option value="half_day">Half Day</option>
                  </select>
                </div>
              </div>

              {/* Geofence Location Options */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Location &amp; Coordinates</label>
                  <span className="text-[11px] text-indigo-600 font-semibold">GPS pin not required on PC</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleUseOfficeGps}
                    className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Building2 size={14} />
                    <span>Use Office HQ Pin</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleGetCurrentGps}
                    disabled={isGettingGps}
                    className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Crosshair size={14} />
                    <span>{isGettingGps ? 'Locating...' : 'Get Browser GPS'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Address or landmark name"
                  value={checkInAddress}
                  onChange={(e) => setCheckInAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                />
                <p className="text-[10px] text-slate-500 font-mono">
                  Current Coordinates: {checkInLat.toFixed(5)}, {checkInLng.toFixed(5)}
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Notes / Justification (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Approved manual check-in by Management"
                  value={checkInNotes}
                  onChange={(e) => setCheckInNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                />
              </div>

              {/* Drawer Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCheckInModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCheckIn}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 transition-colors shadow-xs"
                >
                  {submittingCheckIn ? 'Recording...' : 'Submit Attendance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ATTENDANCE OVERRIDE DRAWER (DATE RANGE & MULTI-EMPLOYEE) */}
      {isOverrideModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 bg-emerald-50/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200">
                  <CalendarRange size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Override Attendance Records</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Batch update or backfill attendance across custom date ranges with holiday and off-day protection.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOverrideModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleOverrideAttendance} className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs">
              {/* Employee Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Target Employees ({overrideUserIds.length} of {users.length} selected)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setOverrideUserIds(users.map((u: any) => u.id))}
                      className="text-[11px] font-semibold text-emerald-600 hover:underline"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setOverrideUserIds([])}
                      className="text-[11px] font-semibold text-slate-500 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="relative mb-2.5">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search employees to filter..."
                    value={overrideUserSearch}
                    onChange={(e) => setOverrideUserSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100 bg-slate-50/50">
                  {users
                    .filter((u: any) => {
                      if (!overrideUserSearch) return true;
                      const term = overrideUserSearch.toLowerCase();
                      const name = `${u.firstName || ''} ${u.lastName || ''} ${u.name || ''} ${u.email || ''}`.toLowerCase();
                      return name.includes(term);
                    })
                    .map((u: any) => {
                      const isSelected = overrideUserIds.includes(u.id);
                      const displayName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.name || u.email;
                      return (
                        <div
                          key={u.id}
                          onClick={() => {
                            setOverrideUserIds((prev) =>
                              isSelected ? prev.filter((id) => id !== u.id) : [...prev, u.id]
                            );
                          }}
                          className={`flex items-center justify-between p-2.5 cursor-pointer transition-colors ${
                            isSelected ? 'bg-emerald-50/80 hover:bg-emerald-100/70' : 'hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                            <UserAvatar name={displayName} className="h-6 w-6 text-[10px]" />
                            <div className="truncate">
                              <p className="font-semibold text-slate-900 truncate leading-tight">{displayName}</p>
                              <p className="text-[10px] text-slate-500 truncate leading-tight">{u.email}</p>
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/70 font-medium text-slate-600">
                            {u.role || u.designation || 'Staff'}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Date Range Selection */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Date Range</label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setOverrideStartDate(localDateInput());
                        setOverrideEndDate(localDateInput());
                      }}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const yest = shiftDate(localDateInput(), -1);
                        setOverrideStartDate(yest);
                        setOverrideEndDate(yest);
                      }}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                    >
                      Yesterday
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const weekAgo = shiftDate(localDateInput(), -6);
                        setOverrideStartDate(weekAgo);
                        setOverrideEndDate(localDateInput());
                      }}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                    >
                      Last 7 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
                        setOverrideStartDate(firstDay);
                        setOverrideEndDate(localDateInput());
                      }}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                    >
                      Month to Date
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">From Date</span>
                    <input
                      type="date"
                      value={overrideStartDate}
                      onChange={(e) => setOverrideStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">To Date</span>
                    <input
                      type="date"
                      value={overrideEndDate}
                      onChange={(e) => setOverrideEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Status & Work Mode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Override Status</label>
                  <select
                    value={overrideStatus}
                    onChange={(e) => setOverrideStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                  >
                    <option value="present">Present (On-Time Standard)</option>
                    <option value="late">Late Check-In</option>
                    <option value="half_day">Half Day</option>
                    <option value="confirmed_absent">Absent (Confirmed)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Work Mode</label>
                  <select
                    value={overrideWorkMode}
                    onChange={(e) => setOverrideWorkMode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                  >
                    <option value="office">Office HQ</option>
                    <option value="field">Field Work</option>
                    <option value="home_office">Home Office</option>
                  </select>
                </div>
              </div>

              {/* Smart Exclusion Logic Toggles */}
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5 space-y-2.5">
                <p className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider">
                  Intelligent Exclusions
                </p>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={overrideSkipWeekends}
                    onChange={(e) => setOverrideSkipWeekends(e.target.checked)}
                    className="mt-0.5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-800 text-xs">Skip Shift Off-Days & Weekends</span>
                    <p className="text-[11px] text-slate-600">
                      Respects each employee's assigned shift off-days (e.g. Friday/Saturday) and prevents accidental overrides on non-working days.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={overrideSkipHolidays}
                    onChange={(e) => setOverrideSkipHolidays(e.target.checked)}
                    className="mt-0.5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-800 text-xs">Skip Public & Company Holidays</span>
                    <p className="text-[11px] text-slate-600">
                      Dates registered in the holiday calendar will be left untouched.
                    </p>
                  </div>
                </label>
              </div>

              {/* Reason / Notes */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Audit Reason / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Executive management approval / System attendance adjustment"
                  value={overrideNotes}
                  onChange={(e) => setOverrideNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium">
                  {overrideUserIds.length} employee{overrideUserIds.length === 1 ? '' : 's'} selected
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOverrideModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingOverride || overrideUserIds.length === 0}
                    className="px-5 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-bold disabled:opacity-50 transition-colors shadow-xs"
                  >
                    {submittingOverride ? 'Applying Override...' : 'Apply Attendance Override'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Work Location Assignment Drawer */}
      {isWorkLocModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 bg-teal-50/40">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
                  <MapPin size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Work Location Assignment Settings</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Assign Office (Default), Home, or Field / Project site by calendar date or date range.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWorkLocModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Form */}
            <form onSubmit={handleAssignWorkLocation} className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs">
              {/* Employee Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Select Employees ({workLocUserIds.length} of {users.length} selected)
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setWorkLocUserIds(users.map((u: any) => u.id))}
                      className="text-[11px] font-bold text-teal-600 hover:text-teal-800 hover:underline"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setWorkLocUserIds([])}
                      className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="relative mb-2.5">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search employee by name, department or email..."
                    value={workLocUserSearch}
                    onChange={(e) => setWorkLocUserSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white shadow-xs">
                  {users
                    .filter((u: any) => {
                      if (!workLocUserSearch) return true;
                      const q = workLocUserSearch.toLowerCase();
                      const name = `${u.firstName || ''} ${u.lastName || ''} ${u.name || ''}`.toLowerCase();
                      return name.includes(q) || (u.department || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
                    })
                    .map((u: any) => {
                      const isSelected = workLocUserIds.includes(u.id);
                      return (
                        <label
                          key={u.id}
                          className={`flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 cursor-pointer text-xs transition-colors ${
                            isSelected ? 'bg-teal-50/80 font-semibold' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) setWorkLocUserIds([...workLocUserIds, u.id]);
                              else setWorkLocUserIds(workLocUserIds.filter((id) => id !== u.id));
                            }}
                            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                          />
                          <UserAvatar src={u.avatarUrl || u.avatar_url} name={`${u.firstName || ''} ${u.lastName || ''}`.trim() || u.name} size="sm" shape="rounded" />
                          <div className="flex-1 min-w-0">
                            <span className="text-slate-800 font-medium truncate block">
                              {`${u.firstName || ''} ${u.lastName || ''}`.trim() || u.name}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate block">
                              {u.department || 'General'} • {u.designation || u.role || 'Staff'}
                            </span>
                          </div>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full shrink-0">
                              Selected
                            </span>
                          )}
                        </label>
                      );
                    })}
                </div>
              </div>

              {/* Date Range Selection */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Calendar size={14} className="text-teal-600" />
                    Calendar Date or Date Range
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setWorkLocStartDate(localDateInput());
                        setWorkLocEndDate(localDateInput());
                      }}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const tomorrow = shiftDate(localDateInput(), 1);
                        setWorkLocStartDate(tomorrow);
                        setWorkLocEndDate(tomorrow);
                      }}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                    >
                      Tomorrow
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const next7 = shiftDate(localDateInput(), 6);
                        setWorkLocStartDate(localDateInput());
                        setWorkLocEndDate(next7);
                      }}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                    >
                      Next 7 Days
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Start Date</span>
                    <input
                      type="date"
                      value={workLocStartDate}
                      onChange={(e) => setWorkLocStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">End Date</span>
                    <input
                      type="date"
                      value={workLocEndDate}
                      onChange={(e) => setWorkLocEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Work Location Choice */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Assigned Work Location</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'office', label: 'Office (HQ)', desc: 'Standard Office Geofence (Default)', icon: Building2 },
                    { key: 'home', label: 'Home (Remote)', desc: 'Home GPS / WFH Allowed', icon: Home },
                    { key: 'field', label: 'Site / Field', desc: 'Project site or client premises', icon: Briefcase },
                  ].map((loc) => {
                    const Icon = loc.icon;
                    const isSelected = assignedWorkLocation === loc.key;
                    return (
                      <button
                        type="button"
                        key={loc.key}
                        onClick={() => setAssignedWorkLocation(loc.key as any)}
                        className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 transition-all ${
                          isSelected
                            ? 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-500/20 shadow-xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Icon size={16} className={isSelected ? 'text-teal-700' : 'text-slate-400'} />
                          <span className={`text-xs font-bold ${isSelected ? 'text-teal-900' : 'text-slate-800'}`}>
                            {loc.label}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 leading-tight">{loc.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Project selector if Field */}
              {assignedWorkLocation === 'field' && (
                <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2">
                  <label className="text-[10px] font-bold text-amber-900 uppercase block">Assign to Project Site (Optional)</label>
                  <select
                    value={workLocProjectId}
                    onChange={(e) => setWorkLocProjectId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-xs font-semibold text-slate-800"
                  >
                    <option value="">-- No specific project (General Field Duty) --</option>
                    {availableProjects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name || p.title} ({p.code || p.clientName || 'Active Project'})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-amber-700">
                    If selected, check-ins within the project's site geofence coordinates will automatically be accepted.
                  </p>
                </div>
              )}

              {/* Reason / Notes */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Assignment Notes / Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Approved work from home / Assigned to Site Inspection"
                  value={workLocNotes}
                  onChange={(e) => setWorkLocNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium">
                  {workLocUserIds.length} employee{workLocUserIds.length === 1 ? '' : 's'} selected
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsWorkLocModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingWorkLoc || workLocUserIds.length === 0}
                    className="px-5 py-2 bg-teal-600 text-white hover:bg-teal-700 rounded-lg text-xs font-bold disabled:opacity-50 transition-colors shadow-xs"
                  >
                    {submittingWorkLoc ? 'Assigning Location...' : 'Save Work Location Assignment'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
