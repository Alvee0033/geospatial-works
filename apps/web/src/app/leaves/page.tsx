'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  CalendarDays,
  Plus,
  Trash2,
  FileText,
  Calendar,
  CheckCircle2,
  Eye,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { ExportUtils } from '@/lib/exportUtils';
import { ApiClient } from '@/lib/api';
import { UserAvatar } from '@/components/ui/UserAvatar';

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'leaves' | 'holidays'>('leaves');

  // Modals
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Leave Form
  const [leaveUserId, setLeaveUserId] = useState('');
  const [leaveType, setLeaveType] = useState('casual');
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  // Holiday Form
  const [holidayName, setHolidayName] = useState('');
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayRecurring, setHolidayRecurring] = useState(false);

  const fetchLeavesAndHolidays = async () => {
    setLoading(true);
    try {
      const [leavesData, holidaysData, usersData] = await Promise.all([
        ApiClient.getLeaves().catch(() => []),
        ApiClient.getHolidays().catch(() => []),
        ApiClient.getUsers().catch(() => []),
      ]);
      setLeaves(leavesData || []);
      setHolidays(holidaysData || []);
      setUsers(usersData || []);
      if (usersData && usersData.length > 0 && !leaveUserId) {
        setLeaveUserId(usersData[0].id);
      }
    } catch (e) {
      console.error('Failed fetching leaves/holidays:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeavesAndHolidays();
  }, []);

  const handleCreateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await ApiClient.createLeave({
        userId: leaveUserId,
        leaveType,
        startDate: leaveStartDate,
        endDate: leaveEndDate,
        reason: leaveReason,
      });
      setIsLeaveModalOpen(false);
      setLeaveReason('');
      await fetchLeavesAndHolidays();
      alert('Leave record submitted successfully to live database');
    } catch (err: any) {
      alert(`Failed submitting leave: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLeave = async (id: string) => {
    if (!confirm('Are you sure you want to revoke/delete this leave record?')) return;
    try {
      await ApiClient.deleteLeave(id);
      await fetchLeavesAndHolidays();
      alert('Leave record removed');
    } catch (err: any) {
      alert(`Deletion failed: ${err.message}`);
    }
  };

  const handleCreateHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await ApiClient.createHoliday({
        name: holidayName,
        date: holidayDate,
        isRecurring: holidayRecurring,
      });
      setIsHolidayModalOpen(false);
      setHolidayName('');
      await fetchLeavesAndHolidays();
      alert('Company holiday added successfully');
    } catch (err: any) {
      alert(`Failed to add holiday: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    if (!confirm('Delete this company holiday?')) return;
    try {
      await ApiClient.deleteHoliday(id);
      await fetchLeavesAndHolidays();
      alert('Holiday removed');
    } catch (err: any) {
      alert(`Failed deleting holiday: ${err.message}`);
    }
  };

  const handleExport = () => {
    if (activeTab === 'leaves') {
      const rows = leaves.map((l) => ({
        ID: l.id,
        Employee: l.userName || l.user_name || 'Staff',
        Type: l.leaveType,
        'Start Date': l.startDate,
        'End Date': l.endDate,
        Reason: l.reason || 'N/A',
      }));
      ExportUtils.exportToExcel(rows, 'GW_Official_Leaves_Register');
    } else {
      const rows = holidays.map((h) => ({
        ID: h.id,
        Holiday: h.name,
        Date: h.date,
        Recurring: h.isRecurring ? 'Yes' : 'No',
      }));
      ExportUtils.exportToExcel(rows, 'GW_Official_Company_Holidays');
    }
  };

  return (
    <AdminLayout
      title="Leave Management & Corporate Calendar"
      subtitle="Authorized leave records, medical absences, and corporate holidays schedule (Live Database)"
      onRefresh={fetchLeavesAndHolidays}
      onExport={handleExport}
      isRefreshing={loading}
    >
      {/* Tab Switcher & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white border border-[#EAEBEF] rounded-[24px] p-4 shadow-xs">
        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-full text-xs font-semibold">
          <button
            onClick={() => setActiveTab('leaves')}
            className={`px-4 py-1.5 rounded-full transition-all ${
              activeTab === 'leaves' ? 'bg-[#0D1117] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Leave Records ({leaves.length})
          </button>
          <button
            onClick={() => setActiveTab('holidays')}
            className={`px-4 py-1.5 rounded-full transition-all ${
              activeTab === 'holidays' ? 'bg-[#0D1117] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Company Holidays ({holidays.length})
          </button>
        </div>

        <div>
          {activeTab === 'leaves' ? (
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0D1117] hover:bg-slate-800 text-white rounded-full text-xs font-bold transition-all shadow-xs"
            >
              <Plus size={14} />
              <span>Record Employee Leave</span>
            </button>
          ) : (
            <button
              onClick={() => setIsHolidayModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0D1117] hover:bg-slate-800 text-white rounded-full text-xs font-bold transition-all shadow-xs"
            >
              <Plus size={14} />
              <span>Add Company Holiday</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'leaves' ? (
        /* Leaves Table */
        <div className="bg-white border border-[#EAEBEF] rounded-[32px] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-900 text-sm tracking-tight">Staff Leave Records</h3>
              <p className="text-xs text-slate-400">All registered absences from database</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">{leaves.length} Applications</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Personnel</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Date Span</th>
                  <th className="py-3 px-3">Reason</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                      {loading ? 'Fetching leave database...' : 'No leave records found in database.'}
                    </td>
                  </tr>
                ) : (
                  leaves.map((l) => {
                    const u = users.find((usr) => usr.id === l.userId || usr._id === l.userId);
                    const name = l.userName || (u ? (u.name || u.full_name) : 'Employee');
                    const avatar = l.avatarUrl || u?.avatarUrl || u?.avatar_url;

                    return (
                      <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <UserAvatar
                              src={avatar}
                              name={name}
                              size="sm"
                              shape="rounded"
                            />
                            <div>
                              <p className="font-bold text-slate-900">{name}</p>
                              <p className="text-[10px] text-slate-400">ID: {l.userId?.slice(0, 8)}</p>
                            </div>
                          </div>
                        </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-full font-bold uppercase text-[10px]">
                          {l.leaveType}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[11px] text-slate-700">
                        {l.startDate} &rarr; {l.endDate}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 font-medium max-w-sm truncate">
                        {l.reason || 'Personal / General leave'}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => handleDeleteLeave(l.id)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="Revoke / Delete Leave"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Holidays Table */
        <div className="bg-white border border-[#EAEBEF] rounded-[32px] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-900 text-sm tracking-tight">Official Company Holidays</h3>
              <p className="text-xs text-slate-400">Corporate non-working calendar days accounted for in payroll</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">{holidays.length} Holidays</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Holiday Name</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Recurring</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {holidays.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">
                      {loading ? 'Loading holidays...' : 'No official holidays scheduled.'}
                    </td>
                  </tr>
                ) : (
                  holidays.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-slate-900">{h.name}</td>
                      <td className="py-3.5 px-3 font-mono text-[11px] text-slate-700">{h.date}</td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                          {h.isRecurring ? 'Yearly' : 'One-time'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => handleDeleteHoliday(h.id)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="Delete Holiday"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Leave Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[32px] p-6 max-w-md w-full border border-slate-200 shadow-xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-base">Record Employee Leave</h4>
              <button
                onClick={() => setIsLeaveModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLeave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Employee</label>
                <select
                  value={leaveUserId}
                  onChange={(e) => setLeaveUserId(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.email} ({u.department || 'Staff'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Leave Category</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick / Medical Leave</option>
                  <option value="annual">Annual Leave</option>
                  <option value="maternity">Maternity / Paternity</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={leaveStartDate}
                    onChange={(e) => setLeaveStartDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={leaveEndDate}
                    onChange={(e) => setLeaveEndDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Reason / Notes</label>
                <textarea
                  rows={2}
                  required
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="Medical reason, prescription details, family emergency..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#0D1117] hover:bg-slate-800 text-white font-bold rounded-full shadow-xs"
                >
                  {submitting ? 'Recording...' : 'Record Leave'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Holiday Modal */}
      {isHolidayModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[32px] p-6 max-w-md w-full border border-slate-200 shadow-xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-base">Add Company Holiday</h4>
              <button
                onClick={() => setIsHolidayModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateHoliday} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Holiday Title</label>
                <input
                  type="text"
                  required
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  placeholder="e.g. Independence Day, Eid-ul-Fitr"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Holiday Date</label>
                <input
                  type="date"
                  required
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="recurringCheck"
                  checked={holidayRecurring}
                  onChange={(e) => setHolidayRecurring(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <label htmlFor="recurringCheck" className="text-slate-700 font-medium cursor-pointer">
                  Annual recurring national holiday
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsHolidayModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#0D1117] hover:bg-slate-800 text-white font-bold rounded-full shadow-xs"
                >
                  {submitting ? 'Adding...' : 'Add Holiday'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
