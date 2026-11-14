'use client';

import React, { useMemo, useState } from 'react';
import { Check, Clock3, Mail, MapPin, MessageSquare, Phone, RefreshCw, Search, Trash2 } from 'lucide-react';

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

const statusLabels: Record<InquiryStatus, string> = {
  NEW: 'New', IN_PROGRESS: 'In progress', CONTACTED: 'Contacted', RESOLVED: 'Completed',
};

function organizationAndMessage(raw = '') {
  const match = raw.match(/^\[Organization:\s*(.+?)\]\n?/);
  return { organization: match?.[1]?.trim() || '', message: match ? raw.replace(match[0], '').trim() : raw };
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export function LeadsView({ inquiries, loading = false, onUpdateStatus, onDeleteInquiry, onRefresh, triggerFeedback }: LeadsViewProps) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | InquiryStatus>('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const counts = useMemo(() => ({
    ALL: inquiries.length,
    NEW: inquiries.filter((item) => item.status === 'NEW').length,
    IN_PROGRESS: inquiries.filter((item) => item.status === 'IN_PROGRESS').length,
    CONTACTED: inquiries.filter((item) => item.status === 'CONTACTED').length,
    RESOLVED: inquiries.filter((item) => item.status === 'RESOLVED').length,
  }), [inquiries]);

  const filtered = useMemo(() => inquiries
    .filter((item) => statusFilter === 'ALL' || item.status === statusFilter)
    .filter((item) => `${item.fullName} ${item.email} ${item.phone || ''} ${item.serviceType || ''} ${item.message}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [inquiries, query, statusFilter]);
  const active = filtered.find((item) => item.id === selectedId) || filtered[0] || null;
  const details = active ? organizationAndMessage(active.message) : null;

  React.useEffect(() => { setNotes(active?.internalNotes || ''); }, [active?.id, active?.internalNotes]);

  const changeStatus = async (status: InquiryStatus) => {
    if (!active) return;
    setSaving(true);
    try {
      await onUpdateStatus(active.id, status, notes);
      triggerFeedback?.('Enquiry updated.');
    } catch {
      triggerFeedback?.('Could not update this enquiry.', 'error');
    } finally { setSaving(false); }
  };

  const saveNotes = async () => {
    if (!active) return;
    setSaving(true);
    try {
      await onUpdateStatus(active.id, active.status, notes);
      triggerFeedback?.('Note saved.');
    } catch {
      triggerFeedback?.('Could not save the note.', 'error');
    } finally { setSaving(false); }
  };

  const deleteActive = async () => {
    if (!active || !window.confirm(`Delete the enquiry from ${active.fullName}?`)) return;
    try {
      await onDeleteInquiry(active.id);
      setSelectedId(null);
      triggerFeedback?.('Enquiry deleted.');
    } catch { triggerFeedback?.('Could not delete this enquiry.', 'error'); }
  };

  return (
    <section className="space-y-5 text-slate-800">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Messages sent through the website contact form.</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Enquiries</h2>
        </div>
        <button type="button" onClick={onRefresh} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
        {(['ALL', 'NEW', 'IN_PROGRESS', 'CONTACTED', 'RESOLVED'] as const).map((status) => (
          <button type="button" key={status} onClick={() => setStatusFilter(status)} className={`rounded-xl border px-4 py-3 text-left transition ${statusFilter === status ? 'border-[#3678F6] bg-blue-50/60 ring-1 ring-blue-100' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
            <span className="block text-xs font-medium text-slate-500">{status === 'ALL' ? 'All enquiries' : statusLabels[status]}</span>
            <span className="mt-1 block text-2xl font-semibold tabular-nums text-slate-950">{counts[status]}</span>
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block w-full sm:max-w-sm">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email or message" className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          </label>
          <span className="text-xs text-slate-500">{filtered.length} shown · {inquiries.length} total</span>
        </div>

        {loading && inquiries.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">Loading enquiries…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare size={22} className="mx-auto text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-800">No enquiries found</p>
            <p className="mt-1 text-sm text-slate-500">New website messages will appear here.</p>
          </div>
        ) : (
          <div className="grid min-h-[420px] lg:grid-cols-[minmax(280px,0.82fr)_minmax(0,1.18fr)]">
            <div className="max-h-[65vh] divide-y divide-slate-100 overflow-y-auto border-b border-slate-200 lg:border-b-0 lg:border-r">
              {filtered.map((item) => (
                <button type="button" key={item.id} onClick={() => setSelectedId(item.id)} className={`block w-full border-l-2 p-4 text-left transition hover:bg-slate-50 ${active?.id === item.id ? 'border-l-[#F4382D] bg-slate-50' : 'border-l-transparent'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <span className="truncate text-sm font-semibold text-slate-900">{item.fullName}</span>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${item.status === 'NEW' ? 'bg-red-50 text-red-700' : item.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{statusLabels[item.status]}</span>
                  </div>
                  <span className="mt-1 block truncate text-xs text-slate-500">{item.serviceType || 'General question'}</span>
                  <span className="mt-2 block line-clamp-2 text-xs leading-5 text-slate-600">{organizationAndMessage(item.message).message}</span>
                  <span className="mt-2 block text-[11px] text-slate-400">{formatDate(item.createdAt)}</span>
                </button>
              ))}
            </div>

            {active && details ? (
              <article className="min-w-0 p-5 sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-5">
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight text-slate-950">{active.fullName}</h3>
                    <p className="mt-1 text-sm text-slate-500">{formatDate(active.createdAt)}</p>
                  </div>
                  <button type="button" onClick={deleteActive} aria-label="Delete enquiry" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-700"><Trash2 size={16} /></button>
                </div>

                <div className="grid gap-3 border-b border-slate-100 py-5 sm:grid-cols-2">
                  <a href={`mailto:${active.email}`} className="flex min-w-0 items-center gap-2 text-sm text-slate-700 hover:text-blue-700"><Mail size={15} className="shrink-0 text-slate-400" /><span className="truncate">{active.email}</span></a>
                  {active.phone && <a href={`tel:${active.phone}`} className="flex items-center gap-2 text-sm text-slate-700 hover:text-blue-700"><Phone size={15} className="text-slate-400" />{active.phone}</a>}
                  {details.organization && <span className="flex items-center gap-2 text-sm text-slate-700"><MapPin size={15} className="text-slate-400" />{details.organization}</span>}
                  {active.serviceType && <span className="flex items-center gap-2 text-sm text-slate-700"><Clock3 size={15} className="text-slate-400" />{active.serviceType}</span>}
                </div>

                <div className="py-5">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Message</h4>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">{details.message || 'No message was included.'}</p>
                </div>

                <div className="border-t border-slate-100 pt-5">
                  <label htmlFor="enquiry-note" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Private note</label>
                  <textarea id="enquiry-note" rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add a note for your team" className="mt-2 w-full resize-y rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      Status
                      <select value={active.status} disabled={saving} onChange={(event) => changeStatus(event.target.value as InquiryStatus)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500">
                        {(['NEW', 'IN_PROGRESS', 'CONTACTED', 'RESOLVED'] as InquiryStatus[]).map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
                      </select>
                    </label>
                    <button type="button" onClick={saveNotes} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-[#F4382D] px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#d92a20] disabled:opacity-60"><Check size={15} />{saving ? 'Saving…' : 'Save note'}</button>
                  </div>
                </div>
              </article>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
