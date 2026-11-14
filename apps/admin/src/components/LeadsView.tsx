'use client';

import React, { useMemo, useState } from 'react';
import {
  Building2,
  Calendar,
  Check,
  Inbox,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Tag,
  Trash2,
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

const statusConfig: Record<
  InquiryStatus,
  { label: string; badge: string; dot: string }
> = {
  NEW: {
    label: 'New Lead',
    badge: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-500',
  },
  CONTACTED: {
    label: 'Contacted',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  IN_PROGRESS: {
    label: 'In Discussion',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
  },
  RESOLVED: {
    label: 'Closed / Converted',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
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
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | InquiryStatus>('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

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

  const active = filtered.find((item) => item.id === selectedId) || filtered[0] || null;
  const details = active ? organizationAndMessage(active.message) : null;

  React.useEffect(() => {
    setNotes(active?.internalNotes || '');
  }, [active?.id, active?.internalNotes]);

  const changeStatus = async (status: InquiryStatus) => {
    if (!active) return;
    setSaving(true);
    try {
      await onUpdateStatus(active.id, status, notes);
      triggerFeedback?.('Status updated.');
    } catch {
      triggerFeedback?.('Could not update status.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveNotes = async () => {
    if (!active) return;
    setSaving(true);
    try {
      await onUpdateStatus(active.id, active.status, notes);
      triggerFeedback?.('Internal notes saved.');
    } catch {
      triggerFeedback?.('Could not save note.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteActive = async () => {
    if (!active || !window.confirm(`Delete lead records for "${active.fullName}"?`)) return;
    try {
      await onDeleteInquiry(active.id);
      setSelectedId(null);
      triggerFeedback?.('Lead deleted.');
    } catch {
      triggerFeedback?.('Could not delete lead.', 'error');
    }
  };

  return (
    <div className="space-y-3 font-sans text-slate-800">
      {/* CRM Filter & Metric Header Strip */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-2 shadow-2xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-1">
          {(['ALL', 'NEW', 'CONTACTED', 'IN_PROGRESS', 'RESOLVED'] as const).map((status) => {
            const count = counts[status];
            const isSelected = statusFilter === status;
            return (
              <button
                type="button"
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{status === 'ALL' ? 'All Inquiries' : statusConfig[status].label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : status === 'NEW' && count > 0
                      ? 'bg-red-100 text-red-700 font-bold'
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
              placeholder="Filter leads..."
              className="h-8 w-48 sm:w-56 rounded-lg border border-slate-200 bg-slate-50/80 pl-8 pr-2.5 text-xs text-slate-800 outline-none focus:border-slate-800 focus:bg-white focus:ring-1 focus:ring-slate-800"
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

      {/* Main CRM Master-Detail Canvas */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {loading && inquiries.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 font-mono">
            Loading inquiry records...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Inbox size={22} className="mx-auto text-slate-300" />
            <p className="mt-2 text-xs font-semibold text-slate-800">No matching inquiries</p>
            <p className="mt-0.5 text-xs text-slate-500">Inbound website inquiries will register here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
            {/* Left 5 Cols: Compact CRM List */}
            <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-slate-200 divide-y divide-slate-100 max-h-[72vh] overflow-y-auto">
              {filtered.map((item) => {
                const isSelected = active?.id === item.id;
                const orgInfo = organizationAndMessage(item.message);
                const statusMeta = statusConfig[item.status];

                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`w-full text-left p-3.5 transition-colors duration-100 flex items-start justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-slate-50 border-l-3 border-l-slate-900'
                        : 'hover:bg-slate-50/70 border-l-3 border-l-transparent'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-xs font-bold text-slate-900">
                          {item.fullName}
                        </span>
                        {orgInfo.organization && (
                          <span className="truncate text-[10px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.2 rounded">
                            {orgInfo.organization}
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="truncate font-mono">{item.email}</span>
                      </div>

                      <p className="mt-1 text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {orgInfo.message}
                      </p>

                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>{item.serviceType || 'General Inquiry'}</span>
                        <span>{formatRelative(item.createdAt)}</span>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1.5 pt-0.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusMeta.badge}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                        <span>{statusMeta.label}</span>
                      </span>
                      {item.internalNotes && (
                        <span className="text-[9px] text-slate-400 font-mono bg-slate-100 px-1 rounded" title="Has internal note">
                          Note
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right 7 Cols: Clean Structured CRM Record Detail */}
            {active && details ? (
              <div className="lg:col-span-7 flex flex-col justify-between max-h-[72vh] overflow-y-auto bg-slate-50/40">
                <div className="p-5 sm:p-6 space-y-5">
                  {/* Lead Header */}
                  <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-200">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{active.fullName}</h3>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            statusConfig[active.status].badge
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[active.status].dot}`} />
                          <span>{statusConfig[active.status].label}</span>
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 font-mono">
                        <Calendar size={12} className="text-slate-400" />
                        <span>{formatDate(active.createdAt)}</span>
                        <span>•</span>
                        <span>ID: {active.id.slice(0, 8)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={deleteActive}
                        className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-slate-500 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
                        title="Delete inquiry"
                      >
                        <Trash2 size={13} />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Contact & Organization Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                        Client Direct
                      </span>
                      <a
                        href={`mailto:${active.email}`}
                        className="flex items-center gap-2 text-slate-900 hover:text-blue-700 font-mono truncate"
                      >
                        <Mail size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate">{active.email}</span>
                      </a>
                      {active.phone ? (
                        <a
                          href={`tel:${active.phone}`}
                          className="flex items-center gap-2 text-slate-900 hover:text-blue-700 font-mono"
                        >
                          <Phone size={13} className="text-slate-400 shrink-0" />
                          <span>{active.phone}</span>
                        </a>
                      ) : (
                        <div className="text-[11px] text-slate-400 italic">No direct phone provided</div>
                      )}
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                        Project &amp; Category
                      </span>
                      <div className="flex items-center gap-2 text-slate-900">
                        <Tag size={13} className="text-slate-400 shrink-0" />
                        <span className="font-semibold">{active.serviceType || 'General Consultation'}</span>
                      </div>
                      {details.organization ? (
                        <div className="flex items-center gap-2 text-slate-700">
                          <Building2 size={13} className="text-slate-400 shrink-0" />
                          <span>{details.organization}</span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 italic">Private / Individual Inquiry</div>
                      )}
                    </div>
                  </div>

                  {/* Inbound Message */}
                  <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider flex items-center gap-1.5">
                      <MessageSquare size={12} /> Inbound Message Content
                    </span>
                    <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-normal">
                      {details.message || 'No additional message was supplied.'}
                    </p>
                  </div>

                  {/* Team Internal Notes & Status Action */}
                  <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                        Internal CRM Notes
                      </span>
                      <span className="text-[10px] text-slate-400">Visible only to admin team</span>
                    </div>

                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add follow-up notes, discussion history, meeting timelines..."
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 font-mono resize-y"
                    />

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-600">Stage:</span>
                        <select
                          value={active.status}
                          disabled={saving}
                          onChange={(e) => changeStatus(e.target.value as InquiryStatus)}
                          className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-slate-800 cursor-pointer"
                        >
                          {(['NEW', 'CONTACTED', 'IN_PROGRESS', 'RESOLVED'] as InquiryStatus[]).map(
                            (st) => (
                              <option key={st} value={st}>
                                {statusConfig[st].label}
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={saveNotes}
                        disabled={saving}
                        className="h-8 px-3.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Check size={13} />
                        <span>{saving ? 'Saving...' : 'Save Notes'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
