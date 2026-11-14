'use client';

import React, { useMemo, useState } from 'react';
import {
  Building2,
  Calendar,
  Check,
  ChevronRight,
  Columns3,
  Inbox,
  LayoutList,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Tag,
  Trash2,
  X,
} from 'lucide-react';

export type InquiryStatus = 'NEW' | 'CONTACTED' | 'IN_PROGRESS' | 'RESOLVED';

export interface InquiryItem {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  serviceType?: string;
  message: string;
  status: InquiryStatus;
  internalNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

interface LeadsViewProps {
  inquiries: InquiryItem[];
  loading?: boolean;
  onUpdateStatus: (id: string, status: InquiryStatus, internalNotes?: string) => Promise<void>;
  onDeleteInquiry: (id: string) => Promise<void>;
  onRefresh: () => void;
  triggerFeedback?: (msg: string, type?: 'success' | 'error') => void;
}

const statusColumns: {
  id: InquiryStatus;
  label: string;
  badge: string;
  dot: string;
  borderTop: string;
}[] = [
  {
    id: 'NEW',
    label: 'New Leads',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
    borderTop: 'border-t-rose-500',
  },
  {
    id: 'CONTACTED',
    label: 'Contacted',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    borderTop: 'border-t-amber-500',
  },
  {
    id: 'IN_PROGRESS',
    label: 'In Discussion',
    badge: 'bg-sky-50 text-sky-700 border-sky-200',
    dot: 'bg-sky-500',
    borderTop: 'border-t-sky-500',
  },
  {
    id: 'RESOLVED',
    label: 'Closed / Converted',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    borderTop: 'border-t-emerald-500',
  },
];

const statusMetaMap: Record<InquiryStatus, typeof statusColumns[0]> = {
  NEW: statusColumns[0],
  CONTACTED: statusColumns[1],
  IN_PROGRESS: statusColumns[2],
  RESOLVED: statusColumns[3],
};

function organizationAndMessage(raw = '') {
  const match = raw.match(/^\[Organization:\s*(.+?)\]\n?/);
  return {
    organization: match?.[1]?.trim() || '',
    message: match ? raw.replace(match[0], '').trim() : raw,
  };
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatRelative(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' }).format(date);
}

export function LeadsView({
  inquiries,
  loading = false,
  onUpdateStatus,
  onDeleteInquiry,
  onRefresh,
  triggerFeedback,
}: LeadsViewProps) {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | InquiryStatus>('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      ALL: inquiries.length,
      NEW: inquiries.filter((item) => item.status === 'NEW').length,
      CONTACTED: inquiries.filter((item) => item.status === 'CONTACTED').length,
      IN_PROGRESS: inquiries.filter((item) => item.status === 'IN_PROGRESS').length,
      RESOLVED: inquiries.filter((item) => item.status === 'RESOLVED').length,
    }),
    [inquiries]
  );

  const filtered = useMemo(
    () =>
      inquiries
        .filter((item) => statusFilter === 'ALL' || item.status === statusFilter)
        .filter((item) => {
          const q = query.trim().toLowerCase();
          if (!q) return true;
          return `${item.fullName} ${item.email} ${item.phone || ''} ${item.serviceType || ''} ${item.message} ${item.internalNotes || ''}`
            .toLowerCase()
            .includes(q);
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [inquiries, query, statusFilter]
  );

  const active = inquiries.find((item) => item.id === selectedId) || null;
  const details = active ? organizationAndMessage(active.message) : null;

  React.useEffect(() => {
    setNotes(active?.internalNotes || '');
  }, [active?.id, active?.internalNotes]);

  const handleStatusChange = async (targetId: string, status: InquiryStatus, currentNotes?: string) => {
    setSaving(true);
    try {
      await onUpdateStatus(targetId, status, currentNotes);
      triggerFeedback?.('Lead stage moved.');
    } catch {
      triggerFeedback?.('Could not move lead stage.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveActiveNotes = async () => {
    if (!active) return;
    setSaving(true);
    try {
      await onUpdateStatus(active.id, active.status, notes);
      triggerFeedback?.('Internal notes saved.');
    } catch {
      triggerFeedback?.('Could not save notes.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteInquiryRecord = async (id: string, name: string) => {
    if (!window.confirm(`Permanently delete inquiry from "${name}"?`)) return;
    try {
      await onDeleteInquiry(id);
      if (selectedId === id) setSelectedId(null);
      triggerFeedback?.('Inquiry removed.');
    } catch {
      triggerFeedback?.('Could not delete inquiry.', 'error');
    }
  };

  return (
    <div className="space-y-4 font-sans text-slate-800">
      {/* Top Filter and Controls Strip */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-2.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/70 mr-2">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns3 size={13} />
              <span>Kanban</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutList size={13} />
              <span>List</span>
            </button>
          </div>

          {/* Status Pills */}
          {(['ALL', 'NEW', 'CONTACTED', 'IN_PROGRESS', 'RESOLVED'] as const).map((status) => {
            const count = counts[status];
            const isSelected = statusFilter === status;
            return (
              <button
                type="button"
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{status === 'ALL' ? 'All' : statusMetaMap[status].label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : status === 'NEW' && count > 0
                      ? 'bg-rose-100 text-rose-700 font-bold'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <label className="relative block">
            <Search
              size={13}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search leads..."
              className="h-8 w-44 sm:w-56 rounded-lg border border-slate-200 bg-slate-50/80 pl-8 pr-2.5 text-xs text-slate-800 outline-none focus:border-slate-800 focus:bg-white"
            />
          </label>

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh inquiry records"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 items-start">
          {statusColumns.map((col) => {
            const columnItems = filtered.filter((item) => item.status === col.id);

            return (
              <div
                key={col.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedId) {
                    const item = inquiries.find((i) => i.id === draggedId);
                    if (item && item.status !== col.id) {
                      handleStatusChange(item.id, col.id, item.internalNotes);
                    }
                    setDraggedId(null);
                  }
                }}
                className={`bg-slate-100/70 border border-slate-200/90 border-t-3 ${col.borderTop} rounded-xl p-3 flex flex-col min-h-[500px] transition-colors`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <span className="text-xs font-bold text-slate-800">{col.label}</span>
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-200/80 text-slate-700">
                    {columnItems.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-2 flex-1 overflow-y-auto max-h-[72vh] pr-0.5">
                  {columnItems.length === 0 ? (
                    <div className="h-28 rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-[11px] text-slate-400 font-mono">
                      No leads in this stage
                    </div>
                  ) : (
                    columnItems.map((item) => {
                      const orgInfo = organizationAndMessage(item.message);
                      const isSelected = selectedId === item.id;

                      return (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={() => setDraggedId(item.id)}
                          onDragEnd={() => setDraggedId(null)}
                          onClick={() => setSelectedId(item.id)}
                          className={`group bg-white rounded-lg border p-3 cursor-grab active:cursor-grabbing transition-all hover:shadow-xs ${
                            isSelected
                              ? 'border-slate-800 ring-1 ring-slate-800 shadow-2xs'
                              : 'border-slate-200/90 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-black line-clamp-1">
                              {item.fullName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono shrink-0">
                              {formatRelative(item.createdAt)}
                            </span>
                          </div>

                          {orgInfo.organization && (
                            <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-600 truncate">
                              <Building2 size={11} className="shrink-0 text-slate-400" />
                              <span className="truncate">{orgInfo.organization}</span>
                            </div>
                          )}

                          <div className="mt-1 text-[11px] font-mono text-slate-400 truncate">
                            {item.email}
                          </div>

                          <p className="mt-2 text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                            {orgInfo.message}
                          </p>

                          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                            <span className="font-semibold text-slate-500 truncate max-w-[130px]">
                              {item.serviceType || 'General'}
                            </span>

                            {item.internalNotes ? (
                              <span className="font-mono text-[9px] bg-amber-50 text-amber-700 border border-amber-200/60 px-1 py-0.2 rounded">
                                Notes
                              </span>
                            ) : null}
                          </div>

                          {/* Quick stage mover strip */}
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="mt-2 pt-1 flex items-center justify-between text-[9px] text-slate-400 border-t border-dashed border-slate-100 opacity-60 group-hover:opacity-100 transition"
                          >
                            <span>Move:</span>
                            <div className="flex items-center gap-1">
                              {statusColumns
                                .filter((s) => s.id !== item.status)
                                .map((s) => (
                                  <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => handleStatusChange(item.id, s.id, item.internalNotes)}
                                    className="px-1 py-0.2 rounded hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer font-medium"
                                  >
                                    {s.id === 'NEW'
                                      ? 'New'
                                      : s.id === 'CONTACTED'
                                      ? 'Contact'
                                      : s.id === 'IN_PROGRESS'
                                      ? 'Discuss'
                                      : 'Close'}
                                  </button>
                                ))}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List / CRM Table View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Inbox size={22} className="mx-auto text-slate-300" />
              <p className="mt-2 text-xs font-semibold text-slate-800">No matching inquiries</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[72vh] overflow-y-auto">
              {filtered.map((item) => {
                const orgInfo = organizationAndMessage(item.message);
                const statusMeta = statusMetaMap[item.status];
                const isSelected = selectedId === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`p-3.5 flex flex-wrap items-center justify-between gap-3 cursor-pointer transition hover:bg-slate-50 ${
                      isSelected ? 'bg-slate-50/80 border-l-3 border-l-slate-900' : ''
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{item.fullName}</span>
                        {orgInfo.organization && (
                          <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded font-medium">
                            {orgInfo.organization}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatRelative(item.createdAt)}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 font-mono">
                        <span>{item.email}</span>
                        {item.phone && <span>• {item.phone}</span>}
                        <span>• {item.serviceType || 'General Consultation'}</span>
                      </div>

                      <p className="mt-1 text-xs text-slate-600 line-clamp-1">{orgInfo.message}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value as InquiryStatus, item.internalNotes)}
                        className={`text-[10px] font-semibold rounded-lg px-2 py-1 border cursor-pointer ${statusMeta.badge}`}
                      >
                        {statusColumns.map((col) => (
                          <option key={col.id} value={col.id}>
                            {col.label}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        className="p-1 rounded text-slate-400 hover:text-slate-800 transition cursor-pointer"
                        title="View detail drawer"
                      >
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Slide-over Lead Detail Drawer */}
      {active && details && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-2xs transition-opacity animate-in fade-in">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{active.fullName}</h3>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      statusMetaMap[active.status].badge
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusMetaMap[active.status].dot}`} />
                    <span>{statusMetaMap[active.status].label}</span>
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500 font-mono">
                  <Calendar size={12} className="text-slate-400" />
                  <span>{formatDate(active.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => deleteInquiryRecord(active.id, active.fullName)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  title="Delete record"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                  title="Close drawer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Drawer Body Content */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                    Direct Contact
                  </span>
                  <a
                    href={`mailto:${active.email}`}
                    className="flex items-center gap-2 text-slate-900 hover:underline font-mono truncate"
                  >
                    <Mail size={13} className="text-slate-400 shrink-0" />
                    <span className="truncate">{active.email}</span>
                  </a>
                  {active.phone ? (
                    <a
                      href={`tel:${active.phone}`}
                      className="flex items-center gap-2 text-slate-900 hover:underline font-mono"
                    >
                      <Phone size={13} className="text-slate-400 shrink-0" />
                      <span>{active.phone}</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">No phone provided</span>
                  )}
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                    Category &amp; Org
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-900 font-semibold truncate">
                    <Tag size={13} className="text-slate-400 shrink-0" />
                    <span className="truncate">{active.serviceType || 'General Consultation'}</span>
                  </div>
                  {details.organization ? (
                    <div className="flex items-center gap-1.5 text-slate-700 truncate">
                      <Building2 size={13} className="text-slate-400 shrink-0" />
                      <span className="truncate">{details.organization}</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">Private Inquiry</span>
                  )}
                </div>
              </div>

              {/* Inbound Message */}
              <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider flex items-center gap-1.5">
                  <MessageSquare size={12} /> Message Body
                </span>
                <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-normal">
                  {details.message || 'No additional message was provided.'}
                </p>
              </div>

              {/* Internal Follow-up Notes */}
              <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                    Internal CRM Notes
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Confidential</span>
                </div>

                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record client responses, quotation status, site inspection dates..."
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 outline-none focus:border-slate-800 font-mono"
                />

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={saveActiveNotes}
                    disabled={saving}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Check size={12} />
                    <span>{saving ? 'Saving...' : 'Save Notes'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Drawer Footer Stage Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-slate-600">Stage:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {statusColumns.map((col) => {
                  const isActive = active.status === col.id;
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => handleStatusChange(active.id, col.id, notes)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition cursor-pointer ${
                        isActive
                          ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {col.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
