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
  Calendar,
  Clock,
} from 'lucide-react';
import { ExportUtils } from '@/lib/exportUtils';
import { ApiClient } from '@/lib/api';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { getExpenseReceiptUrls } from '@/lib/expenseReceipts';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');
  const [inspectExp, setInspectExp] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<any | null>(null);
  const [currentUserId, setCurrentUserId] = useState('');
  const [threadModalExp, setThreadModalExp] = useState<any | null>(null);
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
  const [formReceiptUrls, setFormReceiptUrls] = useState<string[]>([]);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('gw_user') || '{}');
      setCurrentUserId(String(user.id || user._id || ''));
    } catch { setCurrentUserId(''); }
  }, []);

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

      // Deep link inspection from URL parameter ?id=<expenseId>
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const targetId = urlParams.get('id');
        if (targetId && expData) {
          const match = expData.find((e: any) => e.id === targetId);
          if (match) {
            setInspectExp(match);
          }
        }
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

  const getCommentAuthorInfo = (c: any, currentExpense?: any) => {
    const rawName = (c.authorName || c.author_name || c.userName || c.user_name || '').trim();
    const rawRole = (c.authorRole || c.author_role || '').toLowerCase();
    const authorId = c.authorId || c.author_id;

    const matchedUser = users.find(
      (u) =>
        (authorId && (u.id === authorId || u.userId === authorId)) ||
        (rawName && u.name && u.name.toLowerCase() === rawName.toLowerCase()) ||
        (rawName && u.full_name && u.full_name.toLowerCase() === rawName.toLowerCase())
    );

    let authorName = rawName;
    if (!authorName || authorName === 'User' || authorName === 'Admin' || authorName === 'Administrator') {
      if (matchedUser?.name) authorName = matchedUser.name;
      else if (matchedUser?.full_name) authorName = matchedUser.full_name;
      else if (matchedUser?.fullName) authorName = matchedUser.fullName;
      else if (rawName) authorName = rawName;
      else authorName = 'Team Member';
    }

    const avatarUrl =
      c.avatarUrl ||
      c.authorAvatar ||
      c.author_avatar ||
      c.userAvatarUrl ||
      matchedUser?.avatarUrl ||
      matchedUser?.avatar_url;

    const isReviewer =
      rawRole.includes('admin') ||
      rawRole.includes('manager') ||
      rawRole.includes('finance') ||
      rawRole.includes('auditor') ||
      (c.authorRole && c.authorRole !== 'project_member');

    let displayRole = 'Team Member';
    if (rawRole.includes('main_admin') || rawRole.includes('super')) displayRole = 'Super Admin';
    else if (rawRole.includes('admin')) displayRole = 'Admin';
    else if (rawRole.includes('project_manager') || rawRole.includes('manager')) displayRole = 'Project Manager';
    else if (rawRole.includes('finance')) displayRole = 'Finance';
    else if (
      currentExpense &&
      (authorId === (currentExpense.employeeId || currentExpense.userId) ||
        authorName.toLowerCase() ===
          (currentExpense.employeeName || currentExpense.employee_name || '').toLowerCase())
    ) {
      displayRole = 'Claimant';
    } else if (matchedUser?.role) {
      displayRole = matchedUser.role.replace('_', ' ').toUpperCase();
    }

    return { authorName, displayRole, avatarUrl, isReviewer };
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = inspectExp?.id || threadModalExp?.id;
    if (!targetId || !newComment.trim()) return;
    try {
      await ApiClient.addExpenseComment(targetId, newComment.trim());
      setNewComment('');
      const updated = await ApiClient.getExpenseById(targetId);
      if (inspectExp) setInspectExp(updated);
      if (threadModalExp) setThreadModalExp(updated);
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
      const effectiveUrls = formReceiptUrls.length > 0 ? formReceiptUrls : (formReceiptUrl ? [formReceiptUrl] : []);
      const primaryUrl = effectiveUrls[0] || null;

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
        hasReceipt: effectiveUrls.length > 0,
        receiptPhotoUrl: primaryUrl,
        receiptPhotoUrls: effectiveUrls,
        status: 'approved',
      };

      await ApiClient.createExpense(payload);
      setIsCreateModalOpen(false);
      setFormNote('');
      setFormReceiptUrl('');
      setFormReceiptUrls([]);
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
    const urls = getExpenseReceiptUrls(exp);
    setFormReceiptUrls(urls);
    setFormReceiptUrl(urls[0] || exp.receiptPhotoUrl || exp.receipt_photo_url || '');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseToEdit) return;
    setSubmitting(true);
    try {
      const effectiveUrls = formReceiptUrls.length > 0 ? formReceiptUrls : (formReceiptUrl ? [formReceiptUrl] : []);
      const primaryUrl = effectiveUrls[0] || null;
      const payload = {
        amount: formAmount,
        categoryName: formCategoryName,
        note: formNote,
        date: formDate ? new Date(formDate).toISOString() : undefined,
        receiptPhotoUrl: primaryUrl,
        receiptPhotoUrls: effectiveUrls,
        hasReceipt: effectiveUrls.length > 0,
      };

      await ApiClient.updateExpense(expenseToEdit.id, payload);
      setIsEditModalOpen(false);
      setExpenseToEdit(null);
      await fetchRealExpenses();
      alert(expenseToEdit.status === 'rejected' ? 'Expense corrected and resubmitted for approval.' : 'Expense record updated successfully');
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
    return matchesStatus && matchesSearch;
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
      <div className="bg-white border border-[#EAEBEF] rounded-xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
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

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by staff, project, category..."
                className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 w-60"
              />
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0D1117] hover:bg-slate-800 text-white rounded-full text-xs font-bold transition-all shadow-xs"
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
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 font-mono">
                                <Calendar size={10} className="text-blue-500 shrink-0" />
                                <span>Claim Date: {e.date ? new Date(e.date).toLocaleDateString() : 'N/A'}</span>
                              </span>
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/70 font-mono">
                                <Clock size={10} className="text-slate-500 shrink-0" />
                                <span>Submitted: {(e.createdAt || e.created_at) ? new Date(e.createdAt || e.created_at).toLocaleDateString() : 'N/A'}</span>
                              </span>
                            </div>
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
                          <span className="text-emerald-600 font-semibold text-[11px] flex items-center gap-1">
                            <CheckCircle2 size={12} /> Voucher
                          </span>
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
                            onClick={() => setThreadModalExp(e)}
                            className={`p-1.5 rounded-lg transition-colors relative flex items-center gap-1 ${
                              (e.comments?.length || 0) > 0
                                ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold'
                                : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                            }`}
                            title="Clarification & Discussion Thread"
                          >
                            <MessageSquare size={13} />
                            {(e.comments?.length || 0) > 0 && (
                              <span className="text-[11px] font-bold">{e.comments.length}</span>
                            )}
                            {((e.comments?.length || 0) > 0 || e.justificationStatus === 'clarification_requested') && (
                              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
                            )}
                          </button>
                          <button
                            onClick={() => setInspectExp(e)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                            title="Inspect Full Claim & Voucher"
                          >
                            <Eye size={14} />
                          </button>
                          {(e.status || 'pending').toLowerCase() !== 'approved' &&
                            ((e.status || 'pending').toLowerCase() !== 'rejected' || String(e.employeeId || e.employee_id) === currentUserId) && (
                            <button
                              onClick={() => handleOpenEdit(e)}
                              className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg transition-colors"
                              title={e.status === 'rejected' ? 'Edit and resubmit claim' : 'Edit claim'}
                            >
                              <Edit2 size={13} />
                            </button>
                          )}
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
                          {(e.status || 'pending').toLowerCase() !== 'approved' && (
                            <button
                              onClick={() => handleDeleteExpense(e.id)}
                              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                              title="Delete Record"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
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
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 font-mono">
                    <Calendar size={10} className="text-blue-500 shrink-0" />
                    <span>Claim Date: {inspectExp.date ? new Date(inspectExp.date).toLocaleDateString() : 'N/A'}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/70 font-mono">
                    <Clock size={10} className="text-slate-500 shrink-0" />
                    <span>Submitted: {(inspectExp.createdAt || inspectExp.created_at) ? new Date(inspectExp.createdAt || inspectExp.created_at).toLocaleDateString() : 'N/A'}</span>
                  </span>
                </div>
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
              {/* Prominent Rejection Reason Banner */}
              {inspectExp.status === 'rejected' && (inspectExp.rejectionReason || inspectExp.rejection_reason) && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-rose-700 font-bold mb-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span>Reason:</span>
                  </div>
                  <p className="text-rose-900 font-semibold leading-relaxed">
                    {inspectExp.rejectionReason || inspectExp.rejection_reason}
                  </p>
                </div>
              )}
              {inspectExp.status === 'rejected' && String(inspectExp.employeeId || inspectExp.employee_id) === currentUserId && (
                <button type="button" onClick={() => { handleOpenEdit(inspectExp); setInspectExp(null); }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                  <Edit2 size={15} /> Edit &amp; Resubmit for Approval
                </button>
              )}

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
                <div>
                  <span className="text-slate-400 block mb-0.5">Claim Date</span>
                  <span className="inline-flex items-center gap-1 font-mono font-bold text-blue-700 text-xs mt-0.5">
                    <Calendar size={12} className="text-blue-500" />
                    {inspectExp.date ? new Date(inspectExp.date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Submitted On</span>
                  <span className="inline-flex items-center gap-1 font-mono font-bold text-slate-700 text-xs mt-0.5">
                    <Clock size={12} className="text-slate-500" />
                    {(inspectExp.createdAt || inspectExp.created_at)
                      ? new Date(inspectExp.createdAt || inspectExp.created_at).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
              </div>

              {inspectExp.note && (
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-slate-400 font-semibold mb-1">Operational Purpose / Field Note:</p>
                  <p className="text-slate-800 leading-relaxed font-medium">{inspectExp.note}</p>
                </div>
              )}

              {/* High-Resolution Voucher Preview (Multi-Receipt Gallery) */}
              {(() => {
                const photos = getExpenseReceiptUrls(inspectExp);
                if (photos.length === 0) return null;
                return (
                  <div>
                    <p className="text-slate-700 font-bold mb-1.5 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <Receipt size={14} className="text-indigo-600" />
                        <span>Attached Vouchers / Receipts ({photos.length}):</span>
                      </span>
                      {photos.length > 1 && <span className="text-[11px] text-slate-400 font-normal">Scroll to view all</span>}
                    </p>
                    <div className="flex gap-2 overflow-x-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
                      {photos.map((url, pIdx) => (
                        <a
                          key={pIdx}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 group relative rounded-xl overflow-hidden border border-slate-200 bg-white"
                        >
                          <img
                            src={url}
                            alt={`Receipt ${pIdx + 1}`}
                            className="h-44 w-auto object-contain transition-transform group-hover:scale-105"
                          />
                          <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                            #{pIdx + 1}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })()}

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
                    inspectExp.comments.map((c: any, idx: number) => {
                      const { authorName, displayRole, avatarUrl, isReviewer } = getCommentAuthorInfo(c, inspectExp);
                      return (
                        <div
                          key={c.id || idx}
                          className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                            isReviewer ? 'bg-indigo-50/60 border-indigo-100' : 'bg-slate-50 border-slate-100'
                          }`}
                        >
                          <UserAvatar
                            src={avatarUrl}
                            name={authorName}
                            size="sm"
                            shape="rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-slate-900 text-xs">{authorName}</span>
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                    isReviewer ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200/70 text-slate-700'
                                  }`}
                                >
                                  {displayRole}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            </div>
                            <p className="text-slate-700 text-xs">{c.comment || c.comment_text || c.text}</p>
                          </div>
                        </div>
                      );
                    })
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

      {/* Dedicated Clarification Thread Modal */}
      {threadModalExp && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[28px] p-6 max-w-lg w-full border border-slate-200 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Clarification & Discussion Thread</h4>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {threadModalExp.expenseCode || threadModalExp.id?.slice(0, 8)} • {threadModalExp.category} (${Number(threadModalExp.amount || 0).toFixed(2)})
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setThreadModalExp(null);
                  setNewComment('');
                }}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Expense details chip */}
            <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs flex justify-between items-center">
              <div>
                <span className="text-slate-500 block text-[10px] font-semibold uppercase">Claimant</span>
                <span className="font-bold text-slate-800">{threadModalExp.userName || threadModalExp.employeeName || 'Staff Member'}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[10px] font-semibold uppercase">Status</span>
                <span className={`inline-flex items-center gap-1 font-bold text-[11px] ${
                  threadModalExp.justificationStatus === 'clarification_requested' ? 'text-amber-600' : 'text-slate-700'
                }`}>
                  {threadModalExp.justificationStatus === 'clarification_requested' && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  )}
                  {threadModalExp.justificationStatus || threadModalExp.status || 'Active'}
                </span>
              </div>
            </div>

            {/* Clarification Remarks if any */}
            {threadModalExp.clarificationRemarks && (
              <div className="mt-2.5 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900">
                <div className="font-bold flex items-center gap-1.5 mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Reviewer Clarification Request:
                </div>
                <p className="text-amber-800 pl-3.5 italic">{threadModalExp.clarificationRemarks}</p>
              </div>
            )}

            {/* Comment Thread Stream */}
            <div className="flex-1 overflow-y-auto space-y-2.5 my-3 pr-1 min-h-[160px] max-h-[300px]">
              {(!threadModalExp.comments || threadModalExp.comments.length === 0) ? (
                <div className="h-full flex flex-col items-center justify-center py-8 text-slate-400">
                  <MessageSquare size={28} className="mb-1.5 opacity-30" />
                  <p className="text-xs">No clarification messages yet.</p>
                  <p className="text-[10px] text-slate-400">Ask the employee for details or post a remark below.</p>
                </div>
              ) : (
                threadModalExp.comments.map((c: any, idx: number) => {
                  const { authorName, displayRole, avatarUrl, isReviewer } = getCommentAuthorInfo(c, threadModalExp);
                  return (
                    <div
                      key={c.id || idx}
                      className={`p-3 rounded-2xl border flex items-start gap-2.5 transition-all ${
                        isReviewer ? 'bg-indigo-50/60 border-indigo-100' : 'bg-slate-50 border-slate-100'
                      }`}
                    >
                      <UserAvatar
                        src={avatarUrl}
                        name={authorName}
                        size="sm"
                        shape="rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 text-xs">{authorName}</span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                isReviewer ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200/70 text-slate-700'
                              }`}
                            >
                              {displayRole}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {c.createdAt ? new Date(c.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : ''}
                          </span>
                        </div>
                        <p className="text-slate-700 text-xs leading-relaxed">{c.comment || c.comment_text || c.text}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Post comment input */}
            <form onSubmit={handleAddComment} className="pt-2 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write clarification message or note..."
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-1.5 text-xs shadow-xs"
              >
                <Send size={13} /> Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Record / Edit Expense Modal */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[32px] p-6 max-w-lg w-full border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-base">
                {isCreateModalOpen ? 'Record Project Expense Claim' : expenseToEdit?.status === 'rejected' ? 'Edit & Resubmit Expense' : 'Edit Expense Claim'}
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
                <label className="block text-slate-700 font-semibold mb-1">Receipt / Voucher Photos</label>
                <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  {/* Thumbnails row */}
                  {formReceiptUrls.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {formReceiptUrls.map((url, uIdx) => (
                        <div key={uIdx} className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-white group">
                          <img src={url} alt={`Receipt ${uIdx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formReceiptUrls.filter((_, idx) => idx !== uIdx);
                              setFormReceiptUrls(updated);
                              setFormReceiptUrl(updated[0] || '');
                            }}
                            className="absolute top-0.5 right-0.5 w-4 h-4 bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px]"
                            title="Remove receipt"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    {formReceiptUrls.length === 0 && (
                      <div className="w-12 h-12 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400 bg-white shrink-0">
                        <Receipt size={20} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-slate-500 mb-1.5">Upload one or multiple scanned receipts (PNG, JPG, PDF up to 5MB each)</p>
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold cursor-pointer hover:bg-slate-100 transition-colors shadow-2xs">
                        {uploadingReceipt ? (
                          <>
                            <Loader2 size={13} className="animate-spin text-emerald-600" />
                            <span>Uploading files...</span>
                          </>
                        ) : (
                          <>
                            <Upload size={13} className="text-emerald-600" />
                            <span>Attach Receipt Files</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          multiple
                          disabled={uploadingReceipt}
                          className="hidden"
                          onChange={async (e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length === 0) return;
                            setUploadingReceipt(true);
                            try {
                              const dataUris = await Promise.all(
                                files.map(
                                  (f) =>
                                    new Promise<string>((resolve) => {
                                      const reader = new FileReader();
                                      reader.onload = () => resolve(reader.result as string);
                                      reader.readAsDataURL(f);
                                    })
                                )
                              );
                              const batchRes = await ApiClient.uploadBatch(dataUris, 'receipts');
                              const uploadedUrls = (batchRes?.results || []).map((r: any) => r.url).filter(Boolean);
                              if (uploadedUrls.length !== files.length) throw new Error('Some receipts did not upload. Please try again.');
                              setFormReceiptUrls((prev) => [...prev, ...uploadedUrls]);
                              setFormReceiptUrl((prev) => prev || uploadedUrls[0] || '');
                            } catch (err) {
                              console.error('Batch upload failed:', err);
                              alert(err instanceof Error ? err.message : 'Receipt upload failed. Please try again.');
                            } finally {
                              setUploadingReceipt(false);
                            }
                          }}
                        />
                      </label>
                    </div>
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
                  disabled={submitting || uploadingReceipt}
                  className="px-6 py-2 bg-[#0D1117] hover:bg-slate-800 text-white font-bold rounded-full shadow-xs"
                >
                  {submitting ? 'Saving...' : isCreateModalOpen ? 'Record Expense' : expenseToEdit?.status === 'rejected' ? 'Resubmit for Approval' : 'Save Changes'}
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
