'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ShieldAlert, CheckCircle2, XCircle, FileWarning, Eye, Check, X, FileSpreadsheet } from 'lucide-react';
import { ExportUtils } from '@/lib/exportUtils';
import { ApiClient } from '@/lib/api';

export default function ReceiptCompliancePage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNonCompliantClaims = async () => {
    setLoading(true);
    try {
      const allExpenses = await ApiClient.getExpenses();
      // Filter claims without receipt voucher OR with active justification
      const nonCompliant = (allExpenses || []).filter(
        (e: any) =>
          !e.hasReceipt ||
          !e.receiptPhotoUrl ||
          (e.justificationStatus && e.justificationStatus !== 'none')
      );
      setClaims(nonCompliant);
    } catch (e) {
      console.error('Failed fetching compliance claims:', e);
    } finally {
      setLoading(false);
    }
  };

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
    const rows = claims.map((c) => ({
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
            {claims.length} Records Under Audit
          </span>
        </div>

        <div className="space-y-2">
          {claims.length === 0 ? (
            <div className="py-8 text-center text-slate-400 font-medium text-xs">
              {loading ? 'Auditing expense database...' : 'All claims have verified tax/commercial vouchers. Zero non-compliant entries found.'}
            </div>
          ) : (
            claims.map((c) => (
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
