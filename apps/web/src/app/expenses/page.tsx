'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  XCircle,
  Search,
  Eye,
  Check,
  X,
  Plus,
  Trash2,
  Edit2,
  MessageSquare,
  Send,
  ShieldCheck,
  Receipt,
  Upload,
  Camera,
  Loader2,
} from 'lucide-react';
import { ExportUtils } from '@/lib/exportUtils';
import { ApiClient } from '@/lib/api';
import { UserAvatar } from '@/components/ui/UserAvatar';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [inspectExp, setInspectExp] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');

  // Create/Edit Form State
  const [formProjectId, setFormProjectId] = useState('');
  const [formEmployeeId, setFormEmployeeId] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formCategoryName, setFormCategoryName] = useState('Transportation');
  const [formAmount, setFormAmount] = useState<number>(1000);
  const [formNote, setFormNote] = useState('');
  const [formDate, setFormDate] = useState('2026-10-20');
  const [formReceiptUrl, setFormReceiptUrl] = useState('');

  const fetchRealExpenses = async () => {
    setLoading(true);
    try {
      const [expData, projData, userData, catData] = await Promise.all([
        ApiClient.getExpenses().catch(() => []),
        ApiClient.getProjects().catch(() => []),
        ApiClient.getUsers().catch(() => []),
        ApiClient.getCategories().catch(() => []),
      ]);
      setExpenses(expData || []);
      setProjects(projData || []);
      setUsers(userData || []);
      setCategories(catData || []);
      if (projData && projData.length > 0 && !formProjectId) {
        setFormProjectId(projData[0].id);
      }
      if (userData && userData.length > 0 && !formEmployeeId) {
        setFormEmployeeId(userData[0].id);
      }
    } catch (e) {
      console.error('Failed fetching expenses:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealExpenses();
  }, []);

  const handleApprove = async (id: string) => {
    const note = prompt('Enter approval verification note (optional):', 'Verified and approved by admin');
    if (note === null) return;
    try {
      await ApiClient.approveExpense(id, note);
      await fetchRealExpenses();
      if (inspectExp && inspectExp.id === id) {
        setInspectExp({ ...inspectExp, status: 'approved' });
      }
      alert('Claim successfully approved');
    } catch (err: any) {
      alert(`Approval failed: ${err.message}`);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await ApiClient.rejectExpense(id, reason);
      await fetchRealExpenses();
      if (inspectExp && inspectExp.id === id) {
        setInspectExp({ ...inspectExp, status: 'rejected', rejectionReason: reason });
      }
      alert('Claim marked rejected');
    } catch (err: any) {
      alert(`Rejection failed: ${err.message}`);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this expense claim?')) return;
    try {
      await ApiClient.deleteExpense(id);
      await fetchRealExpenses();
      if (inspectExp?.id === id) setInspectExp(null);
      alert('Expense record deleted');
    } catch (err: any) {
      alert(`Deletion failed: ${err.message}`);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectExp || !newComment.trim()) return;
    try {
      await ApiClient.addExpenseComment(inspectExp.id, newComment.trim());
      setNewComment('');
      const updated = await ApiClient.getExpenseById(inspectExp.id);
      setInspectExp(updated);
      await fetchRealExpenses();
    } catch (err: any) {
      alert(`Failed to post comment: ${err.message}`);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const selectedProj = projects.find((p) => p.id === formProjectId);
      const selectedUser = users.find((u) => u.id === formEmployeeId);

      const payload = {
        projectId: formProjectId,
        projectName: selectedProj?.name || 'Project',
        employeeId: formEmployeeId,
        employeeName: selectedUser?.name || 'Staff',
        categoryId: formCategoryId || undefined,
        categoryName: formCategoryName,
        amount: formAmount,
        officeBenefitAmount: Math.round(formAmount * 0.3),
        note: formNote,
        date: formDate ? new Date(formDate).toISOString() : new Date().toISOString(),
        hasReceipt: Boolean(formReceiptUrl),
        receiptPhotoUrl: formReceiptUrl || null,
        status: 'approved',
      };

      await ApiClient.createExpense(payload);
      setIsCreateModalOpen(false);
      setFormNote('');
      setFormReceiptUrl('');
      await fetchRealExpenses();
      alert('Expense claim created and recorded successfully');
    } catch (err: any) {
      alert(`Claim creation failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (exp: any) => {
    setExpenseToEdit(exp);
    setFormProjectId(exp.projectId || '');
    setFormEmployeeId(exp.employeeId || '');
    setFormCategoryName(exp.categoryName || 'General');
    setFormAmount(Number(exp.amount) || 0);
    setFormNote(exp.note || '');
    setFormDate(exp.date ? exp.date.split('T')[0] : '');
    setFormReceiptUrl(exp.receiptPhotoUrl || exp.receipt_photo_url || '');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseToEdit) return;
    setSubmitting(true);
    try {
      const payload = {
        amount: formAmount,
        categoryName: formCategoryName,
        note: formNote,
        date: formDate ? new Date(formDate).toISOString() : undefined,
        receiptPhotoUrl: formReceiptUrl || null,
        hasReceipt: Boolean(formReceiptUrl),
      };

      await ApiClient.updateExpense(expenseToEdit.id, payload);
      setIsEditModalOpen(false);
      setExpenseToEdit(null);
      await fetchRealExpenses();
      alert('Expense record updated successfully');
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = expenses.filter((e) => {
    const st = (e.status || 'pending').toLowerCase();
    const matchesStatus = statusFilter === 'all' || st === statusFilter;
    const emp = (e.employeeName || e.employee_name || '').toLowerCase();
    const proj = (e.projectName || e.project_name || '').toLowerCase();
    const cat = (e.categoryName || e.category_name || '').toLowerCase();
    const q = search.toLowerCase();
    const matchesSearch = emp.includes(q) || proj.includes(q) || cat.includes(q);
    const amount = Number(e.amount) || 0;
    const date = new Date(e.date || e.createdAt || e.created_at || 0);
    const matchesProject = projectFilter === 'all' || String(e.projectId || e.project_id || '') === projectFilter;
    const matchesMin = !minAmount || amount >= Number(minAmount);
    const matchesMax = !maxAmount || amount <= Number(maxAmount);
    const matchesFrom = !fromDate || date >= new Date(`${fromDate}T00:00:00`);
    const matchesTo = !toDate || date < new Date(`${toDate}T23:59:59.999`);
    return matchesStatus && matchesSearch && matchesProject && matchesMin && matchesMax && matchesFrom && matchesTo;
  });

  const totalGross = filtered.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalBase = filtered.reduce((acc, curr) => acc + (Number(curr.baseCost || curr.base_cost || curr.amount) || 0), 0);
  const totalVat = filtered.reduce((acc, curr) => acc + (Number(curr.vatAmount || curr.vat_amount) || 0), 0);
  const totalTax = filtered.reduce((acc, curr) => acc + (Number(curr.taxAmount || curr.tax_amount) || 0), 0);

  const handleExportExcel = () => {
    const rows = filtered.map((e) => ({
      'Claim ID': e.id,
      Employee: e.employeeName || e.employee_name || 'Staff',
      Project: e.projectName || e.project_name || 'Project',
      Category: e.categoryName || e.category_name || 'General',
      'Base Cost (BDT)': e.baseCost || e.base_cost || e.amount,
      'VAT Amount (BDT)': e.vatAmount || e.vat_amount || 0,
      'Tax Amount (BDT)': e.taxAmount || e.tax_amount || 0,
      'Gross Total (BDT)': e.amount,
      'Receipt Status': (e.hasReceipt || e.receiptPhotoUrl) ? 'Voucher Attached' : 'Missing Voucher',
      'Approval Status': e.status,
      'Claim Date': e.date ? new Date(e.date).toLocaleDateString() : '',
      Notes: e.note || '',
    }));
    ExportUtils.exportToExcel(rows, 'GW_Expenditure_Master_Live_Data');
  };

  return (
    <AdminLayout
      title="Transaction History"
      subtitle="Review recorded project expenses, vouchers, and approval status"
      onRefresh={fetchRealExpenses}
      onExport={handleExportExcel}
      isRefreshing={loading}
    >
      {/* 4 Financial Metric Badges */}
      <div className="w-full max-w-[1440px] mx-auto px-5 py-5 space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="p-3 bg-white border border-[#EAEBEF] rounded-xl shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400">Total Base Direct Cost</p>
          <p className="text-lg font-bold text-slate-900 mt-1">BDT {totalBase.toLocaleString()}</p>
        </div>
        <div className="p-3 bg-white border border-[#EAEBEF] rounded-xl shadow-xs">
          <p className="text-[11px] font-semibold text-indigo-500">Total VAT Segment</p>
          <p className="text-lg font-bold text-indigo-700 mt-1">BDT {totalVat.toLocaleString()}</p>
        </div>
        <div className="p-3 bg-white border border-[#EAEBEF] rounded-xl shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500">Total Tax / AIT Deducted</p>
          <p className="text-lg font-bold text-slate-800 mt-1">BDT {totalTax.toLocaleString()}</p>
        </div>
        <div className="p-3 bg-white border border-[#EAEBEF] rounded-xl shadow-xs">
          <p className="text-[11px] font-semibold text-emerald-600">Total Gross Expenditures</p>
          <p className="text-lg font-bold text-slate-900 mt-1">BDT {totalGross.toLocaleString()}</p>
        </div>
      </div>

      {/* Control Bar: Filters, Search & Action Button */}
      <div className="bg-white border border-[#EAEBEF] rounded-xl p-3 shadow-xs">
        <div className="flex flex-col gap-2.5 mb-3">
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg text-xs font-semibold">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-md capitalize transition-all ${
                  statusFilter === st ? 'bg-[#0D1117] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {st} ({st === 'all' ? expenses.length : expenses.filter((e) => (e.status || 'pending').toLowerCase() === st).length})
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 md:grid-cols-[minmax(220px,1fr)_minmax(150px,200px)_repeat(2,minmax(120px,150px))_repeat(2,minmax(135px,160px))_auto]">
            <div className="relative col-span-2 md:col-span-1">
              <Search size={14} className="absolute left-3.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by staff, project, category..."
                className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <select aria-label="Filter by project" value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="h-9 min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700"><option value="all">All projects</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select>
            <input aria-label="Minimum amount" type="number" min="0" inputMode="decimal" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} placeholder="Min amount" className="h-9 min-w-0 rounded-lg border border-slate-200 px-2.5 text-xs outline-none focus:border-indigo-400" />
            <input aria-label="Maximum amount" type="number" min="0" inputMode="decimal" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} placeholder="Max amount" className="h-9 min-w-0 rounded-lg border border-slate-200 px-2.5 text-xs outline-none focus:border-indigo-400" />
            <label className="flex h-9 min-w-0 items-center gap-1.5 rounded-lg border border-slate-200 px-2 text-[10px] text-slate-500"><span>From</span><input aria-label="From date" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="min-w-0 flex-1 text-xs text-slate-700" /></label>
            <label className="flex h-9 min-w-0 items-center gap-1.5 rounded-lg border border-slate-200 px-2 text-[10px] text-slate-500"><span>To</span><input aria-label="To date" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="min-w-0 flex-1 text-xs text-slate-700" /></label>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex h-9 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              <Plus size={14} />
              <span>Record Expense</span>
            </button>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Employee & Details</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Base Cost</th>
                <th className="py-3 px-3">VAT Segment</th>
                <th className="py-3 px-3">Tax / AIT Segment</th>
                <th className="py-3 px-3">Gross Invoice</th>
                <th className="py-3 px-3">Receipt</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                    {loading ? 'Retrieving expenditure logs...' : 'No claims found matching selected filter.'}
                  </td>
                </tr>
              ) : (
                filtered.map((e) => {
                  const base = Number(e.baseCost || e.base_cost || e.amount) || 0;
                  const vat = Number(e.vatAmount || e.vat_amount) || 0;
                  const tax = Number(e.taxAmount || e.tax_amount) || 0;
                  const gross = Number(e.amount) || 0;
                  const hasReceipt = Boolean(e.hasReceipt || e.receiptPhotoUrl || e.receipt_photo_url);

                  return (
                    <tr key={e.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar
                            src={e.employeeAvatarUrl || e.avatarUrl}
                            name={e.employeeName || e.employee_name || 'Staff'}
                            size="sm"
                            shape="rounded"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{e.employeeName || e.employee_name || 'Staff'}</p>
                            <p className="text-[11px] text-slate-400">{e.projectName || e.project_name || 'Project'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-medium text-slate-700">{e.categoryName || 'Expense'}</td>
                      <td className="py-3.5 px-3 font-semibold text-slate-700">BDT {base.toLocaleString()}</td>
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-indigo-700">BDT {vat.toLocaleString()}</span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-slate-700">BDT {tax.toLocaleString()}</span>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-900">BDT {gross.toLocaleString()}</td>
                      <td className="py-3.5 px-3">
                        {hasReceipt ? (
                          <a href={e.receiptPhotoUrl || e.receipt_photo_url || e.receiptUrl || e.receipt_url} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()} className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900">
                            <Eye size={12} /> View receipt
                          </a>
                        ) : (
                          <span className="text-amber-600 font-semibold text-[11px] flex items-center gap-1">
                            <XCircle size={12} /> Missing
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <StatusBadge status={e.status || 'pending'} />
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setInspectExp(e)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                            title="Inspect Full Claim & Voucher"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(e)}
                            className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg transition-colors"
                            title="Edit Claim"
                          >
                            <Edit2 size={13} />
                          </button>
                          {(e.status || 'pending').toLowerCase() === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(e.id)}
                                className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                                title="Approve Claim"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={() => handleReject(e.id)}
                                className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                                title="Reject Claim"
                              >
                                <X size={14} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteExpense(e.id)}
                            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Claim Inspection Modal with HD Voucher Preview & Comments Thread */}
      {inspectExp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[32px] p-6 max-w-xl w-full border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-slate-900 text-base">Expense Claim Audit</h4>
                <p className="text-xs text-slate-400">Claim ID: {inspectExp.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={inspectExp.status || 'pending'} />
                <button
                  onClick={() => setInspectExp(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl">
                <div>
                  <span className="text-slate-400 block mb-0.5">Claimant Personnel</span>
                  <span className="font-bold text-slate-900">{inspectExp.employeeName || 'Staff'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Project</span>
                  <span className="font-semibold text-slate-800">{inspectExp.projectName || 'General'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Category</span>
                  <span className="font-semibold text-slate-800">{inspectExp.categoryName || 'General'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Total Claimed Amount</span>
                  <span className="font-bold text-emerald-600 text-sm">
                    BDT {Number(inspectExp.amount).toLocaleString()}
                  </span>
                </div>
              </div>

              {inspectExp.note && (
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-slate-400 font-semibold mb-1">Operational Purpose / Field Note:</p>
                  <p className="text-slate-800 leading-relaxed font-medium">{inspectExp.note}</p>
                </div>
              )}

              {/* High-Resolution Voucher Preview */}
              {(inspectExp.receiptPhotoUrl || inspectExp.receipt_photo_url) && (
                <div>
                  <p className="text-slate-700 font-bold mb-1.5 flex items-center gap-1.5">
                    <Receipt size={14} className="text-indigo-600" />
                    <span>Attached Tax / Commercial Voucher Photo:</span>
                  </p>
                  <div className="p-2 bg-slate-50 rounded-2xl border border-slate-200 flex justify-center">
                    <img
                      src={inspectExp.receiptPhotoUrl || inspectExp.receipt_photo_url}
                      alt="Receipt Voucher"
                      className="max-h-80 w-auto rounded-xl object-contain shadow-xs"
                    />
                  </div>
                </div>
              )}

              {/* Discussion & Audit Comments Thread */}
              <div>
                <p className="text-slate-700 font-bold mb-2 flex items-center gap-1.5">
                  <MessageSquare size={14} className="text-indigo-600" />
                  <span>Audit Discussion & Verification Logs ({inspectExp.comments?.length || 0}):</span>
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
                  {(!inspectExp.comments || inspectExp.comments.length === 0) ? (
                    <p className="text-slate-400 py-2 text-center">No discussion entries recorded.</p>
                  ) : (
                    inspectExp.comments.map((c: any, idx: number) => (
                      <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                        <UserAvatar
                          src={c.avatarUrl || c.userAvatarUrl}
                          name={c.userName || 'Administrator'}
                          size="sm"
                          shape="rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-bold text-slate-900 text-xs">{c.userName || 'Administrator'}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                          </div>
                          <p className="text-slate-700 text-xs">{c.comment || c.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Post audit remark or verification comment..."
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0D1117] text-white font-bold rounded-xl flex items-center gap-1 text-xs"
                  >
                    <Send size={12} /> Post
                  </button>
                </form>
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                {(inspectExp.status || 'pending').toLowerCase() === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(inspectExp.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full text-xs flex items-center gap-1"
                    >
                      <Check size={13} /> Approve Claim
                    </button>
                    <button
                      onClick={() => handleReject(inspectExp.id)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-full text-xs flex items-center gap-1"
                    >
                      <X size={13} /> Reject Claim
                    </button>
                  </>
                )}
              </div>
              <button
                onClick={() => setInspectExp(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full text-xs"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record / Edit Expense Modal */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[32px] p-6 max-w-lg w-full border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-base">
                {isCreateModalOpen ? 'Record Project Expense Claim' : 'Edit Expense Claim'}
              </h4>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setIsEditModalOpen(false);
                  setExpenseToEdit(null);
                }}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={isCreateModalOpen ? handleCreateSubmit : handleEditSubmit} className="space-y-4 text-xs">
              {isCreateModalOpen && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Project</label>
                    <select
                      value={formProjectId}
                      onChange={(e) => setFormProjectId(e.target.value)}
                      required
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.projectId || 'PRJ'})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Claimant Employee</label>
                    <select
                      value={formEmployeeId}
                      onChange={(e) => setFormEmployeeId(e.target.value)}
                      required
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name || u.email}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Expenditure Category</label>
                  <select
                    value={formCategoryName}
                    onChange={(e) => setFormCategoryName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="Transportation">Transportation</option>
                    <option value="Food">Food</option>
                    <option value="Accommodation">Accommodation</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Office Cost">Office Cost</option>
                    <option value="Consultancy">Consultancy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Claim Amount (BDT)</label>
                  <input
                    type="number"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Expense Date</label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Receipt / Voucher Photo</label>
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  {formReceiptUrl ? (
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-white">
                      <img src={formReceiptUrl} alt="Voucher receipt" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormReceiptUrl('')}
                        className="absolute top-0.5 right-0.5 w-4 h-4 bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px]"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400 bg-white shrink-0">
                      <Receipt size={22} />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-slate-500 mb-1.5">Upload scanned receipt or photo (PNG, JPG up to 5MB)</p>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold cursor-pointer hover:bg-slate-100 transition-colors shadow-2xs">
                      {uploadingReceipt ? (
                        <>
                          <Loader2 size={13} className="animate-spin text-emerald-600" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={13} className="text-emerald-600" />
                          <span>Choose Receipt File</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingReceipt}
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingReceipt(true);
                          try {
                            const reader = new FileReader();
                            reader.onload = async () => {
                              try {
                                const dataUri = reader.result as string;
                                setFormReceiptUrl(dataUri);
                                const res = await ApiClient.uploadFile(dataUri, 'receipts');
                                if (res?.url) setFormReceiptUrl(res.url);
                              } catch (err) {
                                console.error('Upload failed, keeping local preview', err);
                              } finally {
                                setUploadingReceipt(false);
                              }
                            };
                            reader.readAsDataURL(file);
                          } catch {
                            setUploadingReceipt(false);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Operational Field Note</label>
                <textarea
                  rows={2}
                  required
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="Specify fuel, vehicle, lunch, or site gear details..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-[#0D1117] hover:bg-slate-800 text-white font-bold rounded-full shadow-xs"
                >
                  {submitting ? 'Recording...' : isCreateModalOpen ? 'Record Expense' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
}
