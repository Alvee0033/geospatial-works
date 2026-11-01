'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ShieldAlert, CheckCircle2, XCircle, FileWarning, Eye, Check, X, FileSpreadsheet, Search, ExternalLink } from 'lucide-react';
import { ExportUtils } from '@/lib/exportUtils';
import { ApiClient } from '@/lib/api';

export default function ReceiptCompliancePage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchNonCompliantClaims = async () => {
    setLoading(true);
    try {
      const [allExpenses, allProjects] = await Promise.all([ApiClient.getExpenses(), ApiClient.getProjects().catch(() => [])]);
      // Filter claims without receipt voucher OR with active justification
      const nonCompliant = (allExpenses || []).filter((e: any) => {
        const hasReceipt = Boolean(e.hasReceipt || e.has_receipt || e.receiptPhotoUrl || e.receipt_photo_url || e.receiptUrl || e.receipt_url);
        const justification = e.justificationStatus || e.justification_status;
        return !hasReceipt || Boolean(justification && justification !== 'none');
      });
      setClaims(nonCompliant);
      setProjects(allProjects || []);
    } catch (e) {
      console.error('Failed fetching compliance claims:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredClaims = useMemo(() => claims.filter((claim) => {
    const query = search.trim().toLowerCase();
    const text = `${claim.employeeName || claim.employee_name || ''} ${claim.projectName || claim.project_name || ''} ${claim.categoryName || claim.category_name || ''} ${claim.note || ''}`.toLowerCase();
    const amount = Number(claim.amount) || 0;
    const date = new Date(claim.date || claim.createdAt || claim.created_at || 0);
    return (!query || text.includes(query)) && (projectFilter === 'all' || String(claim.projectId || claim.project_id || '') === projectFilter) && (!minAmount || amount >= Number(minAmount)) && (!maxAmount || amount <= Number(maxAmount)) && (!fromDate || date >= new Date(`${fromDate}T00:00:00`)) && (!toDate || date < new Date(`${toDate}T23:59:59.999`));
  }), [claims, search, projectFilter, minAmount, maxAmount, fromDate, toDate]);

  useEffect(() => {
    fetchNonCompliantClaims();
  }, []);

  const handleReviewJustification = async (id: string, newStatus: 'approved' | 'rejected') => {
    const comment = prompt(`Enter ${newStatus} audit verification comment:`, `Audited and ${newStatus} by admin`);
    if (comment === null) return;
    try {
      await ApiClient.reviewExpenseJustification(id, {
        justificationStatus: newStatus,
        justificationReviewComment: comment,
      });
      await fetchNonCompliantClaims();
      alert(`Justification marked ${newStatus}`);
    } catch (err: any) {
      alert(`Review failed: ${err.message}`);
    }
  };

  const handleExport = () => {
    const rows = filteredClaims.map((c) => ({
      'Claim ID': c.id,
      Employee: c.employeeName || c.employee_name || 'Staff',
      Project: c.projectName || c.project_name || 'Project',
      Category: c.categoryName || 'General',
      'Amount (BDT)': c.amount,
      Note: c.note || 'No note',
      'Justification Status': c.justificationStatus || 'None',
      Status: c.status,
      Date: c.date ? new Date(c.date).toLocaleDateString() : '',
    }));
    ExportUtils.exportToExcel(rows, 'GW_Receipt_Compliance_Audit');
  };

  return (
    <AdminLayout
      title="Voucher Audit"
      subtitle="Review expense claims that need receipt or justification checks"
      onRefresh={fetchNonCompliantClaims}
      onExport={handleExport}
      isRefreshing={loading}
    >
      <div className="w-full max-w-[1440px] mx-auto px-5 py-5 space-y-3">
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 flex items-center gap-3 text-amber-900 text-xs">
        <FileWarning size={18} className="text-amber-600 shrink-0" />
        <p className="font-medium">
          <strong>Receipt check:</strong> Claims without vouchers need a documented review before approval.
        </p>
      </div>

      <div className="bg-white border border-[#EAEBEF] rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-900 text-sm tracking-tight">Voucher Justification Audits</h3>
          <span className="text-xs font-semibold px-3 py-1 bg-amber-100 text-amber-800 rounded-full">
            {filteredClaims.length} Records Under Audit
          </span>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-[minmax(220px,1fr)_minmax(150px,220px)_repeat(4,minmax(120px,1fr))]">
          <div className="relative col-span-2 md:col-span-1"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input aria-label="Search voucher audits" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search employee, project, category" className="h-9 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-xs outline-none focus:border-indigo-400"/></div>
          <select aria-label="Filter audits by project" value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700"><option value="all">All projects</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select>
          <input aria-label="Minimum audited amount" type="number" min="0" value={minAmount} onChange={(event) => setMinAmount(event.target.value)} placeholder="Min amount" className="h-9 rounded-lg border border-slate-200 px-2.5 text-xs"/>
          <input aria-label="Maximum audited amount" type="number" min="0" value={maxAmount} onChange={(event) => setMaxAmount(event.target.value)} placeholder="Max amount" className="h-9 rounded-lg border border-slate-200 px-2.5 text-xs"/>
          <label className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-2 text-[10px] text-slate-500">From<input aria-label="Audit from date" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="min-w-0 flex-1 text-xs text-slate-700"/></label>
          <label className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-2 text-[10px] text-slate-500">To<input aria-label="Audit to date" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="min-w-0 flex-1 text-xs text-slate-700"/></label>
        </div>

        <div className="space-y-2">
          {filteredClaims.length === 0 ? (
            <div className="py-8 text-center text-slate-400 font-medium text-xs">
              {loading ? 'Auditing expense database...' : 'All claims have verified tax/commercial vouchers. Zero non-compliant entries found.'}
            </div>
          ) : (
            filteredClaims.map((c) => (
              <div
                key={c.id}
                className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-900 text-sm">{c.employeeName || 'Staff'}</h4>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-semibold text-slate-600">{c.projectName || 'Project'}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-indigo-600 font-semibold">{c.categoryName || 'General'}</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-2 leading-relaxed font-medium">
                    {c.note || c.justificationReason || 'Vendor did not furnish printed voucher in remote site.'}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span>Date: {c.date ? new Date(c.date).toLocaleDateString() : 'N/A'}</span>
                    <span>•</span>
                    <span className="font-bold text-slate-900">BDT {Number(c.amount).toLocaleString()}</span>
                    <span>•</span>
                    <span className="text-rose-500 font-semibold flex items-center gap-1">
                      <XCircle size={12} /> Missing Printed Voucher
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {(c.receiptPhotoUrl || c.receipt_photo_url || c.receiptUrl || c.receipt_url) && <a href={c.receiptPhotoUrl || c.receipt_photo_url || c.receiptUrl || c.receipt_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"><ExternalLink size={13}/>View receipt</a>}
                  <button
                    onClick={() => handleReviewJustification(c.id, 'approved')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold transition-all shadow-xs"
                  >
                    <Check size={13} />
                    <span>Approve Exception</span>
                  </button>
                  <button
                    onClick={() => handleReviewJustification(c.id, 'rejected')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-full text-xs font-bold transition-colors"
                  >
                    <X size={13} />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      </div>
    </AdminLayout>
  );
}
