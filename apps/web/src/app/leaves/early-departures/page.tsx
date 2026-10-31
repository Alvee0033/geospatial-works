'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { FolderLock, Clock, AlertCircle, ArrowLeft, Plus, Check, X, FileSpreadsheet } from 'lucide-react';
import Link from 'next/link';
import { ExportUtils } from '@/lib/exportUtils';
import { ApiClient } from '@/lib/api';
import { UserAvatar } from '@/components/ui/UserAvatar';

export default function EarlyDeparturesPage() {
  const [departures, setDepartures] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRealData = async () => {
    setLoading(true);
    try {
      const [attData, userData] = await Promise.all([
        ApiClient.getAttendance().catch(() => []),
        ApiClient.getUsers().catch(() => []),
      ]);
      setUsers(userData || []);
      // Filter check-ins with early notes or half-day sessions
      const relevant = (attData || []).filter(
        (a: any) =>
          (a.notes && a.notes.toLowerCase().includes('early')) ||
          a.sessionType === 'morning' ||
          a.status === 'half_day' ||
          a.status === 'late'
      );
      setDepartures(relevant);
    } catch (e) {
      console.error('Failed fetching early departures:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealData();
  }, []);

  const handleExport = () => {
    const rows = departures.map((d) => ({
      'Record ID': d.id,
      Employee: d.userName || 'Staff',
      Date: d.date,
      Session: d.sessionType,
      'Check-in / Departure Time': d.loginTime ? new Date(d.loginTime).toLocaleTimeString() : '',
      Status: d.status,
      Notes: d.notes || '',
    }));
    ExportUtils.exportToExcel(rows, 'GW_Early_Departure_Incidents');
  };

  return (
    <AdminLayout
      title="Early Departure Audit & Records"
      subtitle="Monitoring staff checkouts occurring prior to official shift closing (Live Database)"
      onRefresh={fetchRealData}
      onExport={handleExport}
      isRefreshing={loading}
    >
      <div className="mb-4">
        <Link
          href="/leaves"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Leave Queue
        </Link>
      </div>

      <div className="bg-white border border-[#EAEBEF] rounded-[32px] p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-slate-900 text-sm tracking-tight">Early Checkout Incidents</h3>
            <p className="text-xs text-slate-400">All registered early departure or half-day logs from live attendance stream</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-amber-50 text-amber-800 rounded-full">
            {departures.length} Incidents Logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Employee</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Session Logged</th>
                <th className="py-3 px-3">Recorded Time</th>
                <th className="py-3 px-3">Circumstance / Note</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs">
              {departures.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    {loading ? 'Analyzing attendance matrix...' : 'No early checkout anomalies found in live records.'}
                  </td>
                </tr>
              ) : (
                departures.map((d) => {
                  const u = users.find((usr) => usr.id === d.userId || usr._id === d.userId);
                  const name = d.userName || (u ? (u.name || u.full_name) : 'Staff');
                  const avatar = d.avatarUrl || u?.avatarUrl || u?.avatar_url;

                  return (
                    <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
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
                            <p className="text-[10px] text-slate-400">{d.department || 'Operations'}</p>
                          </div>
                        </div>
                      </td>
                    <td className="py-3.5 px-3 text-slate-600 font-medium">{d.date}</td>
                    <td className="py-3.5 px-3 capitalize font-semibold text-slate-700">{d.sessionType}</td>
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full text-[11px]">
                        {d.loginTime ? new Date(d.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 max-w-sm font-medium">
                      {d.notes || 'Routine field check-out'}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <StatusBadge status={d.status || 'present'} />
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
