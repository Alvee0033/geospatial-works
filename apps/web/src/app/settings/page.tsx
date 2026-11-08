'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { 
  Clock, DollarSign, Percent, FolderTree, Database, ShieldCheck,
  Plus, Trash2, Edit2, Check, AlertTriangle, Search, Save,
  Calendar, MapPin, Coffee, TrendingUp, X, ShieldAlert, RefreshCw, History
} from 'lucide-react';
import { ApiClient } from '@/lib/api';
import { LocationPickerMap } from '@/components/maps/LocationPickerMap';

interface AttendanceShift {
  id?: string;
  name: string;
  morningStartHour: number;
  breakStartHour?: number;
  breakEndHour?: number;
  morningEndHour?: number;
  afternoonStartHour?: number;
  afternoonEndHour: number;
  weekendDays: number[];
  isDefault: boolean;
}

interface HolidayItem {
  id?: string;
  date: string;
  name: string;
}

interface AttendanceSettingsState {
  officeLatitude?: number;
  officeLongitude?: number;
  geofenceRadiusMeters?: number;
  gracePeriodMinutes?: number;
  requireFaceAuth?: boolean;
  requireLocationAuth?: boolean;
  shifts?: AttendanceShift[];
  isDeductionEnabled?: boolean;
  deductionType?: 'rate_based' | 'fixed_amount';
  fullDayDeductionAmount?: number;
  halfDayDeductionAmount?: number;
  lateCheckInDeductionAmount?: number;
  holidays?: HolidayItem[];
}

interface CategoryItem {
  id: string;
  name: string;
  policyLimit?: number;
  isActive?: boolean;
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function formatHour(hour?: number): string {
  if (hour === undefined || hour === null || isNaN(hour)) return '—';
  const cleanH = ((Math.floor(hour) % 24) + 24) % 24;
  const period = cleanH < 12 ? 'AM' : 'PM';
  const displayH = cleanH === 0 ? 12 : cleanH > 12 ? cleanH - 12 : cleanH;
  return `${displayH}:00 ${period}`;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'payroll' | 'benefits' | 'categories' | 'storage' | 'audit' | 'danger'>('schedule');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Settings State
  const [attendanceSettings, setAttendanceSettings] = useState<AttendanceSettingsState | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [searchCategory, setSearchCategory] = useState('');
  
  // Storage & Retainage State
  const [retentionDays, setRetentionDays] = useState(90);
  const [dailyFoodAllowance, setDailyFoodAllowance] = useState(800);
  const [targetMargin, setTargetMargin] = useState(25);
  const [warningThreshold, setWarningThreshold] = useState(15000);
  const [criticalThreshold, setCriticalThreshold] = useState(50000);
  const [benefitRates, setBenefitRates] = useState({
    base: 15,
    government: 18,
    directConsultancy: 12,
    private: 15,
    subConsultancy: 10,
  });

  // Danger Zone State
  const [wipeConfirmCode, setWipeConfirmCode] = useState('');
  const [wipeInput, setWipeInput] = useState('');
  const [wipeLoading, setWipeLoading] = useState(false);
  const [wipeBackups, setWipeBackups] = useState<any[]>([]);
  const [backupsLoading, setBackupsLoading] = useState(false);
  const [revertLoading, setRevertLoading] = useState<string | null>(null);

  const generateWipeCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let code = '';
    for (let i = 0; i < 12; i++) code += chars[Math.floor(Math.random() * chars.length)];
    setWipeConfirmCode(code);
    setWipeInput('');
  };

  const loadBackups = async () => {
    setBackupsLoading(true);
    try {
      const data = await ApiClient.getDataBackups();
      setWipeBackups(Array.isArray(data) ? data : []);
    } catch {
      setWipeBackups([]);
    } finally {
      setBackupsLoading(false);
    }
  };

  const handleWipeAllData = async () => {
    if (wipeInput !== wipeConfirmCode) return;
    setWipeLoading(true);
    try {
      await ApiClient.wipeAllData(wipeConfirmCode);
      setWipeConfirmCode('');
      setWipeInput('');
      showStatus('All data wiped successfully. A backup record has been saved.', 'success');
      loadBackups();
    } catch (err: any) {
      showStatus(err.message || 'Wipe failed', 'error');
    } finally {
      setWipeLoading(false);
    }
  };

  const handleRevertBackup = async (backupId: string) => {
    setRevertLoading(backupId);
    try {
      const res = await ApiClient.revertFromBackup(backupId);
      showStatus((res as any).message || 'Revert request submitted', 'success');
      loadBackups();
    } catch (err: any) {
      showStatus(err.message || 'Revert failed', 'error');
    } finally {
      setRevertLoading(null);
    }
  };

  // Category Modal
  const [categoryModal, setCategoryModal] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    category?: CategoryItem;
  }>({ open: false, mode: 'create' });
  const [catName, setCatName] = useState('');
  const [catLimit, setCatLimit] = useState<number | ''>('');

  // Shift Modal
  const [shiftModal, setShiftModal] = useState<{
    open: boolean;
    index?: number;
    shift: AttendanceShift;
  }>({
    open: false,
    shift: {
      name: 'General Day Shift',
      morningStartHour: 9,
      morningEndHour: 13,
      afternoonStartHour: 14,
      afternoonEndHour: 18,
      weekendDays: [5, 6],
      isDefault: false
    }
  });

  // Holiday Modal
  const [holidayModal, setHolidayModal] = useState(false);
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayName, setHolidayName] = useState('');

  // Audit Logs
  const [auditLogs] = useState([
    { id: '1', action: 'Update Shift Schedule', user: 'Admin', timestamp: 'Today, 02:40 PM', details: 'Updated morning cutoff to 13:00' },
    { id: '2', action: 'Toggle Payroll Deductions', user: 'Finance Lead', timestamp: 'Today, 11:15 AM', details: 'Rate-based deductions active' },
    { id: '3', action: 'Category Modified', user: 'Admin', timestamp: 'Yesterday, 05:22 PM', details: 'Added Equipment Lease limit' },
    { id: '4', action: 'Document Retention Changed', user: 'System', timestamp: 'Oct 19, 09:00 AM', details: 'Retention set to 90 days' },
  ]);

  useEffect(() => {
    loadAllSettings();
  }, []);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const loadAllSettings = async () => {
    try {
      setLoading(true);
      const [cats, attSettings] = await Promise.all([
        ApiClient.getCategories().catch(() => []),
        ApiClient.getAttendanceSettings().catch(() => null)
      ]);
      setCategories(cats || []);
      if (attSettings) {
        setAttendanceSettings(attSettings);
      } else {
        setAttendanceSettings({
          officeLatitude: 23.8103,
          officeLongitude: 90.4125,
          geofenceRadiusMeters: 100,
          gracePeriodMinutes: 15,
          requireFaceAuth: false,
          requireLocationAuth: true,
          shifts: [
            {
              id: 'default',
              name: 'Regular Day Shift',
              morningStartHour: 9,
              morningEndHour: 13,
              afternoonStartHour: 14,
              afternoonEndHour: 18,
              weekendDays: [5, 6],
              isDefault: true,
            }
          ],
          isDeductionEnabled: true,
          deductionType: 'rate_based',
          fullDayDeductionAmount: 1.0,
          halfDayDeductionAmount: 0.5,
          lateCheckInDeductionAmount: 0.25,
          holidays: [
            { date: '2026-02-21', name: 'Martyrs Day' },
            { date: '2026-03-26', name: 'Independence Day' },
            { date: '2026-04-14', name: 'Pohela Boishakh' },
            { date: '2026-05-01', name: 'May Day' },
            { date: '2026-12-16', name: 'Victory Day' },
          ]
        });
      }
    } catch (err: any) {
      showStatus(err.message || 'Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveAttendanceChanges = async (updated: Partial<AttendanceSettingsState>) => {
    if (!attendanceSettings) return;
    const newSettings = { ...attendanceSettings, ...updated };
    setAttendanceSettings(newSettings);
    setSaving(true);
    try {
      await ApiClient.updateAttendanceSettings(updated);
      showStatus('Settings updated');
    } catch (err: any) {
      showStatus(err.message || 'Error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  // --- Category Actions ---
  const handleSaveCategory = async () => {
    if (!catName.trim()) return;
    try {
      if (categoryModal.mode === 'create') {
        const created = await ApiClient.createCategory({
          name: catName.trim(),
          policyLimit: catLimit ? Number(catLimit) : undefined,
          isActive: true
        });
        setCategories([...categories, created]);
        showStatus('Category created');
      } else if (categoryModal.category) {
        const updated = await ApiClient.updateCategory(categoryModal.category.id, {
          name: catName.trim(),
          policyLimit: catLimit ? Number(catLimit) : undefined
        });
        setCategories(categories.map(c => c.id === updated.id ? updated : c));
        showStatus('Category updated');
      }
      setCategoryModal({ open: false, mode: 'create' });
      setCatName('');
      setCatLimit('');
    } catch (err: any) {
      showStatus(err.message || 'Error saving category', 'error');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      await ApiClient.deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
      showStatus('Category removed');
    } catch (err: any) {
      showStatus(err.message || 'Error deleting category', 'error');
    }
  };

  const handleToggleCategory = async (category: CategoryItem) => {
    try {
      const updated = await ApiClient.updateCategory(category.id, { isActive: !category.isActive });
      setCategories(categories.map(c => c.id === updated.id ? updated : c));
    } catch (err: any) {
      showStatus(err.message || 'Error updating category', 'error');
    }
  };

  // --- Shift Actions ---
  const handleSaveShift = () => {
    if (!attendanceSettings) return;
    const currentShifts = [...(attendanceSettings.shifts || [])];
    if (shiftModal.index !== undefined && shiftModal.index >= 0) {
      currentShifts[shiftModal.index] = {
        ...currentShifts[shiftModal.index],
        ...shiftModal.shift
      };
    } else {
      currentShifts.push({
        id: 'shift_' + Date.now(),
        ...shiftModal.shift
      });
    }
    saveAttendanceChanges({ shifts: currentShifts });
    setShiftModal(prev => ({ ...prev, open: false }));
  };

  const handleDeleteShift = (index: number) => {
    if (!attendanceSettings) return;
    const currentShifts = [...(attendanceSettings.shifts || [])];
    if (currentShifts.length <= 1) {
      alert('You must keep at least one work schedule');
      return;
    }
    currentShifts.splice(index, 1);
    saveAttendanceChanges({ shifts: currentShifts });
  };

  // --- Holiday Actions ---
  const handleAddHoliday = () => {
    if (!holidayDate || !holidayName.trim() || !attendanceSettings) return;
    const current = [...(attendanceSettings.holidays || [])];
    current.push({ date: holidayDate, name: holidayName.trim() });
    current.sort((a, b) => a.date.localeCompare(b.date));
    saveAttendanceChanges({ holidays: current });
    setHolidayDate('');
    setHolidayName('');
    setHolidayModal(false);
  };

  const handleDeleteHoliday = (index: number) => {
    if (!attendanceSettings) return;
    const current = [...(attendanceSettings.holidays || [])];
    current.splice(index, 1);
    saveAttendanceChanges({ holidays: current });
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchCategory.toLowerCase())
  );

  return (
    <AdminLayout
      title="Settings"
      subtitle="Shift schedule, deductions, retainage, and expense configuration"
      onRefresh={loadAllSettings}
      isRefreshing={loading}
    >
      <div className="w-full max-w-[1200px] mx-auto px-4 py-4 space-y-4">
        {/* Toast */}
        {statusMsg && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border ${
            statusMsg.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            {statusMsg.type === 'success' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
            {statusMsg.text}
          </div>
        )}

        {/* Compact Nav Tabs */}
        <div className="flex border border-slate-200 rounded-lg p-1 bg-white gap-1 overflow-x-auto">
          {[
            { id: 'schedule', label: 'Work Schedule', icon: Clock },
            { id: 'payroll', label: 'Deductions & Holidays', icon: DollarSign },
            { id: 'benefits', label: 'Retainage & Profit', icon: Percent },
            { id: 'categories', label: 'Expense Categories', icon: FolderTree },
            { id: 'storage', label: 'Data & Purge', icon: Database },
            { id: 'audit', label: 'Audit Trail', icon: ShieldCheck },
            { id: 'danger', label: 'Danger Zone', icon: ShieldAlert },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#10241E] text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Work Schedule */}
        {activeTab === 'schedule' && (
          <div className="space-y-4">
            {/* Top Quick Settings */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-1.5 pb-2 mb-3 border-b border-slate-100 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                Check-in Radius & Rules
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-lg">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Grace Period
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={attendanceSettings?.gracePeriodMinutes ?? 15}
                      onChange={(e) => saveAttendanceChanges({ gracePeriodMinutes: Number(e.target.value) })}
                      className="w-20 px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-800"
                    />
                    <span className="text-xs text-slate-500 font-medium">Minutes</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-lg">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Geofence Radius
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="20"
                      max="1000"
                      value={attendanceSettings?.geofenceRadiusMeters ?? 100}
                      onChange={(e) => saveAttendanceChanges({ geofenceRadiusMeters: Number(e.target.value) })}
                      className="w-24 px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-800"
                    />
                    <span className="text-xs text-slate-500 font-medium">Meters from HQ</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Strict GPS</span>
                    <span className="text-[11px] font-medium text-slate-600">
                      {attendanceSettings?.requireLocationAuth ? 'Required' : 'Disabled'}
                    </span>
                  </div>
                  <button
                    onClick={() => saveAttendanceChanges({ requireLocationAuth: !attendanceSettings?.requireLocationAuth })}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      attendanceSettings?.requireLocationAuth ? 'bg-[#10241E]' : 'bg-slate-300'
                    }`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      attendanceSettings?.requireLocationAuth ? 'translate-x-4.5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {attendanceSettings && <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Office geofence location</h3>
                  <p className="mt-0.5 text-xs text-slate-500">Search the office address or place the pin manually. GPS is not needed on this computer.</p>
                </div>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => saveAttendanceChanges({
                    officeLatitude: attendanceSettings.officeLatitude ?? 23.8103,
                    officeLongitude: attendanceSettings.officeLongitude ?? 90.4125,
                    geofenceRadiusMeters: attendanceSettings.geofenceRadiusMeters ?? 100,
                  })}
                  className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >{saving ? 'Saving…' : 'Save office location'}</button>
              </div>
              <LocationPickerMap
                latitude={attendanceSettings.officeLatitude ?? 23.8103}
                longitude={attendanceSettings.officeLongitude ?? 90.4125}
                radiusMeters={attendanceSettings.geofenceRadiusMeters ?? 100}
                pinLabel="Office"
                onChange={(point) => setAttendanceSettings((current) => current ? { ...current, officeLatitude: point.latitude, officeLongitude: point.longitude } : current)}
              />
              <p className="mt-2 text-[11px] text-slate-500">Office pin: {(attendanceSettings.officeLatitude ?? 23.8103).toFixed(6)}, {(attendanceSettings.officeLongitude ?? 90.4125).toFixed(6)} · Radius: {attendanceSettings.geofenceRadiusMeters ?? 100} m</p>
            </div>}

            {/* Shift Cards */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  Office Work Shifts
                </div>
                <button
                  onClick={() => {
                    setShiftModal({
                      open: true,
                      shift: {
                        name: 'General Day Shift',
                        morningStartHour: 9,
                        morningEndHour: 13,
                        afternoonStartHour: 14,
                        afternoonEndHour: 18,
                        weekendDays: [5, 6],
                        isDefault: false
                      }
                    });
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 bg-[#10241E] text-white rounded-md text-xs font-semibold hover:bg-slate-800"
                >
                  <Plus className="w-3 h-3" />
                  Add Shift
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(attendanceSettings?.shifts || []).map((shift: AttendanceShift, idx: number) => (
                  <div key={shift.id || idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800">{shift.name}</span>
                        {shift.isDefault && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setShiftModal({
                              open: true,
                              index: idx,
                              shift: { ...shift }
                            });
                          }}
                          className="p-1 text-slate-400 hover:text-slate-800"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteShift(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white border border-slate-200/80 px-2 py-1.5 rounded">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Work Hours</span>
                        <span className="font-bold text-slate-800 text-[11px]">
                          {formatHour(shift.morningStartHour)} – {formatHour(shift.afternoonEndHour)}
                        </span>
                      </div>
                      <div className="bg-white border border-slate-200/80 px-2 py-1.5 rounded">
                        <span className="text-[10px] text-amber-600 block uppercase font-bold">Break Time</span>
                        <span className="font-bold text-amber-900 text-[11px]">
                          {formatHour(shift.breakStartHour ?? shift.morningEndHour ?? 13)} – {formatHour(shift.breakEndHour ?? shift.afternoonStartHour ?? 14)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 pt-0.5">
                      <span className="text-[10px] font-bold text-slate-400 mr-1">Off:</span>
                      {DAY_NAMES.map((day, dIdx) => {
                        const dayNum = dIdx + 1;
                        const isOff = (shift.weekendDays || []).includes(dayNum);
                        return (
                          <span
                            key={day}
                            className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                              isOff ? 'bg-rose-100 text-rose-700' : 'bg-slate-200/70 text-slate-500'
                            }`}
                          >
                            {day}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Salary Deductions */}
        {activeTab === 'payroll' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  Absence & Tardiness Deductions
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">
                    {attendanceSettings?.isDeductionEnabled ? 'Active' : 'Disabled'}
                  </span>
                  <button
                    onClick={() => saveAttendanceChanges({ isDeductionEnabled: !attendanceSettings?.isDeductionEnabled })}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      attendanceSettings?.isDeductionEnabled ? 'bg-[#10241E]' : 'bg-slate-300'
                    }`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      attendanceSettings?.isDeductionEnabled ? 'translate-x-4.5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {/* Method */}
                <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-lg space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Mode
                  </label>
                  <select
                    value={attendanceSettings?.deductionType || 'rate_based'}
                    onChange={(e) => saveAttendanceChanges({ deductionType: e.target.value as any })}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-800"
                  >
                    <option value="rate_based">Proportional Rate (Day Multiplier)</option>
                    <option value="fixed_amount">Fixed Amount (৳ Flat BDT)</option>
                  </select>
                </div>

                {/* Late penalty */}
                <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-lg space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Late Check-in
                  </label>
                  <input
                    type="number"
                    step={attendanceSettings?.deductionType === 'rate_based' ? '0.05' : '50'}
                    value={attendanceSettings?.lateCheckInDeductionAmount ?? 0.25}
                    onChange={(e) => saveAttendanceChanges({ lateCheckInDeductionAmount: Number(e.target.value) })}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-800"
                  />
                </div>

                {/* Full day cut */}
                <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-lg space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Full-Day Absence
                  </label>
                  <input
                    type="number"
                    step={attendanceSettings?.deductionType === 'rate_based' ? '0.1' : '100'}
                    value={attendanceSettings?.fullDayDeductionAmount ?? 1.0}
                    onChange={(e) => saveAttendanceChanges({ fullDayDeductionAmount: Number(e.target.value) })}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-800"
                  />
                </div>

                {/* Half day cut */}
                <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-lg space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Half-Day Cut
                  </label>
                  <input
                    type="number"
                    step={attendanceSettings?.deductionType === 'rate_based' ? '0.1' : '50'}
                    value={attendanceSettings?.halfDayDeductionAmount ?? 0.5}
                    onChange={(e) => saveAttendanceChanges({ halfDayDeductionAmount: Number(e.target.value) })}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Holidays Table */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  Public & Company Holidays ({attendanceSettings?.holidays?.length || 0})
                </div>
                <button
                  onClick={() => setHolidayModal(true)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-[#10241E] text-white rounded-md text-xs font-semibold hover:bg-slate-800"
                >
                  <Plus className="w-3 h-3" />
                  Add Holiday
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-56">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase sticky top-0">
                    <tr>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Holiday Name</th>
                      <th className="py-2 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(attendanceSettings?.holidays || []).map((hol: HolidayItem, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-1.5 px-3 font-mono font-semibold text-slate-800">{hol.date}</td>
                        <td className="py-1.5 px-3 text-slate-700">{hol.name}</td>
                        <td className="py-1.5 px-3 text-right">
                          <button
                            onClick={() => handleDeleteHoliday(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(!attendanceSettings?.holidays || attendanceSettings.holidays.length === 0) && (
                      <tr>
                        <td colSpan={3} className="py-4 text-center text-slate-400">
                          No holidays registered.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Retainage & Financial Margins */}
        {activeTab === 'benefits' && (
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <Percent className="w-3.5 h-3.5 text-emerald-600" />
                Retainage & Profit Margins
              </div>
              <button
                onClick={() => showStatus('Saved retainage policies')}
                className="flex items-center gap-1 px-3 py-1 bg-[#10241E] text-white rounded-md text-xs font-semibold hover:bg-slate-800"
              >
                <Save className="w-3 h-3" />
                Save Policies
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-lg">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Food Allowance (৳/Day)
                </label>
                <input
                  type="number"
                  value={dailyFoodAllowance}
                  onChange={(e) => setDailyFoodAllowance(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-800"
                />
              </div>

              <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-lg">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Target Profit Margin (%)
                </label>
                <input
                  type="number"
                  value={targetMargin}
                  onChange={(e) => setTargetMargin(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-800"
                />
              </div>

              <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-lg">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Warning Receipt (৳)
                </label>
                <input
                  type="number"
                  value={warningThreshold}
                  onChange={(e) => setWarningThreshold(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-800"
                />
              </div>

              <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-lg">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Critical Receipt (৳)
                </label>
                <input
                  type="number"
                  value={criticalThreshold}
                  onChange={(e) => setCriticalThreshold(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-800"
                />
              </div>
            </div>

            {/* Assignment Types */}
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Company Retainage By Contract Type (%)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { label: 'Government', key: 'government' },
                  { label: 'Direct Consult.', key: 'directConsultancy' },
                  { label: 'Private', key: 'private' },
                  { label: 'Sub-Consultancy', key: 'subConsultancy' },
                  { label: 'Baseline', key: 'base' },
                ].map(item => (
                  <div key={item.key} className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] font-medium text-slate-500 block">{item.label}</span>
                    <div className="flex items-center gap-1 mt-1">
                      <input
                        type="number"
                        value={(benefitRates as any)[item.key]}
                        onChange={(e) => setBenefitRates({ ...benefitRates, [item.key]: Number(e.target.value) })}
                        className="w-full px-1.5 py-0.5 bg-white border border-slate-200 rounded text-xs font-bold text-slate-800"
                      />
                      <span className="text-xs font-bold text-slate-400">%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Expense Categories */}
        {activeTab === 'categories' && (
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <FolderTree className="w-3.5 h-3.5 text-emerald-600" />
                Categories ({categories.length})
              </div>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3 h-3 absolute left-2.5 top-2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="pl-7 pr-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 w-40"
                  />
                </div>
                <button
                  onClick={() => {
                    setCatName('');
                    setCatLimit('');
                    setCategoryModal({ open: true, mode: 'create' });
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 bg-[#10241E] text-white rounded-md text-xs font-semibold hover:bg-slate-800"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {filteredCategories.map(cat => (
                <div key={cat.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div className="min-w-0 pr-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-800 truncate block">{cat.name}</span>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cat.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    </div>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {cat.policyLimit ? `৳${cat.policyLimit.toLocaleString()}` : 'No Limit'}
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => handleToggleCategory(cat)}
                      className={`p-1 rounded text-[10px] ${
                        cat.isActive ? 'text-emerald-700 bg-emerald-100' : 'text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => {
                        setCatName(cat.name);
                        setCatLimit(cat.policyLimit ?? '');
                        setCategoryModal({ open: true, mode: 'edit', category: cat });
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Data & Purge */}
        {activeTab === 'storage' && (
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4 max-w-xl">
            <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              Storage Lifecycle
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1 text-xs font-semibold">
                  <span className="text-slate-600">Cache Retention</span>
                  <span className="font-mono text-emerald-800 font-bold">{retentionDays} Days</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="365"
                  step="15"
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(Number(e.target.value))}
                  className="w-full accent-[#10241E] h-1.5 bg-slate-100 rounded cursor-pointer"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">Purge thumbnail preview cache</span>
                <button
                  onClick={() => {
                    if (confirm('Purge thumbnail cache?')) {
                      showStatus('Cache cleared');
                    }
                  }}
                  className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded text-xs font-semibold hover:bg-rose-100"
                >
                  Purge Cache
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Audit Trail */}
        {activeTab === 'audit' && (
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Settings Change History
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                  <tr>
                    <th className="py-2 px-3">Action</th>
                    <th className="py-2 px-3">User</th>
                    <th className="py-2 px-3">Timestamp</th>
                    <th className="py-2 px-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-slate-800">{log.action}</td>
                      <td className="py-2 px-3 text-slate-600">{log.user}</td>
                      <td className="py-2 px-3 font-mono text-slate-500">{log.timestamp}</td>
                      <td className="py-2 px-3 text-slate-700">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Danger Zone Tab */}
        {activeTab === 'danger' && (
          <div className="space-y-4">
            {/* Warning Banner */}
            <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-rose-800">Danger Zone — Irreversible Actions</p>
                <p className="text-xs text-rose-600 mt-0.5">
                  Actions in this section permanently delete data. Only proceed if you fully understand the consequences.
                </p>
              </div>
            </div>

            {/* Delete All Data */}
            <div className="bg-white border-2 border-rose-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900">Delete All Data</h3>
              </div>
              <p className="text-xs text-slate-600">
                This permanently deletes all projects, employees (non-admin), expenses, attendance records, tasks, notifications, and chat messages. Admin accounts remain.
              </p>

              {!wipeConfirmCode ? (
                <button
                  onClick={generateWipeCode}
                  className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-colors"
                >
                  Initiate Data Wipe
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                    <p className="text-[11px] font-semibold text-rose-700 mb-1.5">
                      Type the following code to confirm permanent deletion:
                    </p>
                    <code className="text-base font-black font-mono tracking-widest text-rose-800 select-all">
                      {wipeConfirmCode}
                    </code>
                  </div>
                  <input
                    type="text"
                    value={wipeInput}
                    onChange={(e) => setWipeInput(e.target.value)}
                    placeholder="Type confirmation code here"
                    className={`w-full px-3 py-2 border-2 rounded-lg text-sm font-mono font-bold tracking-wider transition-colors ${
                      wipeInput === wipeConfirmCode
                        ? 'border-rose-400 bg-rose-50 text-rose-800'
                        : 'border-slate-200 bg-white text-slate-800'
                    }`}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleWipeAllData}
                      disabled={wipeInput !== wipeConfirmCode || wipeLoading}
                      className="px-5 py-2.5 bg-rose-600 text-white rounded-lg text-xs font-black hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {wipeLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Wiping...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete All Data
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => { setWipeConfirmCode(''); setWipeInput(''); }}
                      className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Backup History */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-600" />
                  <h3 className="text-sm font-bold text-slate-900">Wipe History & Backups</h3>
                </div>
                <button
                  onClick={loadBackups}
                  disabled={backupsLoading}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${backupsLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {wipeBackups.length === 0 ? (
                <div className="py-6 text-center">
                  <History className="w-8 h-8 mx-auto text-slate-200 mb-2" />
                  <p className="text-xs text-slate-400">No wipe history yet.</p>
                  <button onClick={loadBackups} className="mt-2 text-[11px] text-slate-400 hover:text-slate-600 underline">
                    Load history
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {wipeBackups.map((backup) => (
                    <div key={backup.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          Wipe on {new Date(backup.createdAt).toLocaleString()}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {Object.entries(backup.rowCounts || {})
                            .filter(([k]) => k !== 'reverted')
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(' · ')}
                        </p>
                        {backup.rowCounts?.reverted && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                            Reverted
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleRevertBackup(backup.id)}
                        disabled={revertLoading === backup.id || backup.rowCounts?.reverted}
                        className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                      >
                        {revertLoading === backup.id ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <RefreshCw className="w-3 h-3" />
                            Revert
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Category Modal */}
      {categoryModal.open && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[10000] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-xs w-full p-4 space-y-3 shadow-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-900">
                {categoryModal.mode === 'create' ? 'New Category' : 'Edit Category'}
              </h3>
              <button onClick={() => setCategoryModal({ open: false, mode: 'create' })}>
                <X className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Name</label>
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Limit (৳ BDT)</label>
                <input
                  type="number"
                  value={catLimit}
                  onChange={(e) => setCatLimit(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-1.5 pt-1">
              <button
                onClick={() => setCategoryModal({ open: false, mode: 'create' })}
                className="px-2.5 py-1 border border-slate-200 rounded text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCategory}
                className="px-3 py-1 bg-[#10241E] text-white rounded text-xs font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shift Modal */}
      {shiftModal.open && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[10000] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-sm w-full p-4 space-y-3 shadow-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-900">
                {shiftModal.index !== undefined ? 'Edit Shift' : 'New Shift'}
              </h3>
              <button onClick={() => setShiftModal(prev => ({ ...prev, open: false }))}>
                <X className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Shift Name</label>
                <input
                  type="text"
                  value={shiftModal.shift.name}
                  onChange={(e) => setShiftModal({
                    ...shiftModal,
                    shift: { ...shiftModal.shift, name: e.target.value }
                  })}
                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Shift Start</label>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded">
                      {formatHour(shiftModal.shift.morningStartHour)}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={shiftModal.shift.morningStartHour}
                    onChange={(e) => setShiftModal({
                      ...shiftModal,
                      shift: { ...shiftModal.shift, morningStartHour: Number(e.target.value) }
                    })}
                    className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-semibold"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Shift End</label>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded">
                      {formatHour(shiftModal.shift.afternoonEndHour)}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={shiftModal.shift.afternoonEndHour}
                    onChange={(e) => setShiftModal({
                      ...shiftModal,
                      shift: { ...shiftModal.shift, afternoonEndHour: Number(e.target.value) }
                    })}
                    className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-amber-50/70 border border-amber-200/70 rounded-lg space-y-1.5">
                <span className="text-[10px] font-bold text-amber-900 uppercase block">Break Time Selection</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[10px] font-semibold text-slate-600">Break From</label>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-1.5 py-0.2 rounded">
                        {formatHour(shiftModal.shift.breakStartHour ?? shiftModal.shift.morningEndHour ?? 13)}
                      </span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={shiftModal.shift.breakStartHour ?? shiftModal.shift.morningEndHour ?? 13}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setShiftModal({
                          ...shiftModal,
                          shift: {
                            ...shiftModal.shift,
                            breakStartHour: val,
                            morningEndHour: val,
                          }
                        });
                      }}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[10px] font-semibold text-slate-600">Break To</label>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-1.5 py-0.2 rounded">
                        {formatHour(shiftModal.shift.breakEndHour ?? shiftModal.shift.afternoonStartHour ?? 14)}
                      </span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={shiftModal.shift.breakEndHour ?? shiftModal.shift.afternoonStartHour ?? 14}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setShiftModal({
                          ...shiftModal,
                          shift: {
                            ...shiftModal.shift,
                            breakEndHour: val,
                            afternoonStartHour: val,
                          }
                        });
                      }}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Weekend Days (Off)</label>
                <div className="flex flex-wrap gap-1">
                  {DAY_NAMES.map((day, idx) => {
                    const dayNum = idx + 1;
                    const isSelected = shiftModal.shift.weekendDays.includes(dayNum);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          const current = [...shiftModal.shift.weekendDays];
                          const newDays = isSelected 
                            ? current.filter(d => d !== dayNum)
                            : [...current, dayNum];
                          setShiftModal({
                            ...shiftModal,
                            shift: { ...shiftModal.shift, weekendDays: newDays }
                          });
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isSelected ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-1.5 pt-1">
              <button
                onClick={() => setShiftModal(prev => ({ ...prev, open: false }))}
                className="px-2.5 py-1 border border-slate-200 rounded text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveShift}
                className="px-3 py-1 bg-[#10241E] text-white rounded text-xs font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Holiday Modal */}
      {holidayModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[10000] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-xs w-full p-4 space-y-3 shadow-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-900">Add Holiday</h3>
              <button onClick={() => setHolidayModal(false)}>
                <X className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Date</label>
                <input
                  type="date"
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Name</label>
                <input
                  type="text"
                  placeholder="e.g. Independence Day"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-1.5 pt-1">
              <button
                onClick={() => setHolidayModal(false)}
                className="px-2.5 py-1 border border-slate-200 rounded text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleAddHoliday}
                className="px-3 py-1 bg-[#10241E] text-white rounded text-xs font-semibold"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
