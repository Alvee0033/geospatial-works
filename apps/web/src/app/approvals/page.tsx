'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ApiClient } from '@/lib/api';
import {
  ShieldCheck,
  Check,
  X,
  Search,
  Filter,
  DollarSign,
  AlertTriangle,
  Receipt,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Users,
  Eye,
  Building2,
  Tag,
  MessageSquareText,
  X as CloseIcon,
} from 'lucide-react';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { notifyAction } from '@/components/feedback/ActionFeedback';
import { LeaveDetailsDrawer } from '@/components/leaves/LeaveDetailsDrawer';

export default function ApprovalsQueuePage() {
  const [activeTab, setActiveTab] = useState<'expenses' | 'leaves'>('expenses');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Expense Filter State
  const [filterType, setFilterType] = useState<'all' | 'highAmount' | 'noReceipt' | 'hasReceipt'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Voucher preview modal
  const [previewVoucherUrl, setPreviewVoucherUrl] = useState<string | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);
  const [selectedLeave, setSelectedLeave] = useState<any | null>(null);

  // Rejection modal
  const [itemToReject, setItemToReject] = useState<{ id: string; type: 'expense' | 'leave'; name: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Insufficient documentation or out of policy');

  const fetchApprovalsData = async () => {
    setLoading(true);
    try {
      const [allExp, allLeaves, allUsers, allProjects] = await Promise.all([
        ApiClient.getExpenses(),
        ApiClient.getLeaves().catch(() => []),
        ApiClient.getUsers().catch(() => []),
        ApiClient.getProjects().catch(() => []),
      ]);
      setExpenses(allExp || []);
      setLeaves(allLeaves || []);
      setUsers(allUsers || []);
      setProjects(allProjects || []);
    } catch (e) {
      console.error('Error fetching approvals queue:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovalsData();
  }, []);

  // Filter pending items
  const pendingExpenses = expenses.filter((e) => (e.status || '').toLowerCase() === 'pending');
  const pendingLeaves = leaves.filter((l) => (l.status || '').toLowerCase() === 'pending');

  const filteredExpenses = pendingExpenses.filter((e) => {
    const amount = Number(e.amount) || 0;
    const hasReceipt = Boolean(e.hasReceipt || e.receiptUrl || e.receipt_url || e.receiptPhotoUrl || e.receipt_photo_url);
    const date = new Date(e.date || e.createdAt || e.created_at || 0);

    if (filterType === 'highAmount' && amount <= 5000) return false;
    if (filterType === 'noReceipt' && hasReceipt) return false;
    if (filterType === 'hasReceipt' && !hasReceipt) return false;
    if (projectFilter !== 'all' && String(e.projectId || e.project_id || '') !== projectFilter) return false;
    if (minAmount && amount < Number(minAmount)) return false;
    if (maxAmount && amount > Number(maxAmount)) return false;
    if (fromDate && date < new Date(`${fromDate}T00:00:00`)) return false;
    if (toDate && date >= new Date(`${toDate}T23:59:59.999`)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (e.employeeName || e.employee_name || '').toLowerCase();
      const proj = (e.projectName || e.project_name || e.projectId || '').toLowerCase();
      const cat = (e.categoryName || e.category_name || e.category || '').toLowerCase();
      const desc = (e.description || e.note || '').toLowerCase();
      if (!name.includes(q) && !proj.includes(q) && !cat.includes(q) && !desc.includes(q)) {
        return false;
      }
    }

    return true;
  });

  // Category Color Map
  const getCategoryBadgeClass = (cat: string) => {
    const c = (cat || '').toLowerCase();
    if (c.includes('equip')) return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    if (c.includes('trans')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (c.includes('food')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (c.includes('accomm')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (c.includes('office')) return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  // Actions: Expense Approve
  const handleApproveExpense = async (id: string) => {
    setSubmitting(true);
    try {
      await ApiClient.approveExpense(id, 'Approved via Executive Approvals Portal');
      setExpenses(expenses.map((e) => (e.id === id ? { ...e, status: 'approved' } : e)));
      setSelectedExpenseIds(selectedExpenseIds.filter((item) => item !== id));
      setSelectedClaim((claim: any) => claim?.id === id ? null : claim);
      notifyAction('Claim approved.');
    } catch (err: any) {
      console.error('Failed to approve expense:', err);
      notifyAction(`Approval failed: ${err.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Actions: Batch Approve Expenses
  const handleBatchApprove = async () => {
    if (selectedExpenseIds.length === 0) return;
    setSubmitting(true);
    try {
      await Promise.all(
        selectedExpenseIds.map((id) =>
          ApiClient.approveExpense(id, 'Batch approved via Executive Inbox')
        )
      );
      setExpenses(
        expenses.map((e) => (selectedExpenseIds.includes(e.id) ? { ...e, status: 'approved' } : e))
      );
      setSelectedExpenseIds([]);
      notifyAction(`${selectedExpenseIds.length} claims approved.`);
    } catch (err: any) {
      console.error('Batch approval error:', err);
      notifyAction('One or more approvals failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Actions: Leave Approve
  const handleApproveLeave = async (id: string) => {
    setSubmitting(true);
    try {
      await ApiClient.approveLeave(id);
      setLeaves(leaves.map((l) => (l.id === id ? { ...l, status: 'approved' } : l)));
      setSelectedLeave(null);
      notifyAction('Leave request approved.');
    } catch (err: any) {
      console.error('Failed to approve leave:', err);
      notifyAction(`Approval failed: ${err.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm Rejection
  const handleConfirmRejection = async () => {
    if (!itemToReject) return;
    setSubmitting(true);
    try {
      if (itemToReject.type === 'expense') {
        await ApiClient.rejectExpense(itemToReject.id, rejectionReason);
        setExpenses(expenses.map((e) => (e.id === itemToReject.id ? { ...e, status: 'rejected' } : e)));
        setSelectedClaim((claim: any) => claim?.id === itemToReject.id ? null : claim);
      } else {
        await ApiClient.rejectLeave(itemToReject.id, rejectionReason);
        setLeaves(leaves.map((l) => (l.id === itemToReject.id ? { ...l, status: 'rejected' } : l)));
        setSelectedLeave(null);
      }
      setItemToReject(null);
      notifyAction(`${itemToReject.type === 'expense' ? 'Claim' : 'Leave request'} rejected.`);
    } catch (err: any) {
      console.error('Rejection failed:', err);
      notifyAction(`Rejection failed: ${err.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Select all toggle
  const toggleSelectAll = () => {
    if (selectedExpenseIds.length === filteredExpenses.length) {
      setSelectedExpenseIds([]);
    } else {
      setSelectedExpenseIds(filteredExpenses.map((e) => e.id));
    }
  };

  const toggleSelectExpense = (id: string) => {
    if (selectedExpenseIds.includes(id)) {
      setSelectedExpenseIds(selectedExpenseIds.filter((item) => item !== id));
    } else {
      setSelectedExpenseIds([...selectedExpenseIds, id]);
    }
  };

  const selectedTotalAmount = filteredExpenses
    .filter((e) => selectedExpenseIds.includes(e.id))
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  return (
    <AdminLayout
      title="Approvals Queue"
      subtitle="Review pending expense claims and leave requests"
      onRefresh={fetchApprovalsData}
      isRefreshing={loading}
    >
      <div className="w-full max-w-[1440px] mx-auto px-5 py-5 space-y-3">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="bg-white border border-[#EAEBEF] rounded-xl p-3 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Claims</p>
              <p className="text-2xl font-black text-amber-600 mt-1">{pendingExpenses.length}</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Receipt size={20} />
            </div>
          </div>

          <div className="bg-white border border-[#EAEBEF] rounded-xl p-3 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Capital (৳)</p>
              <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
                ৳{pendingExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign size={20} />
            </div>
          </div>

          <div className="bg-white border border-[#EAEBEF] rounded-xl p-3 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Missing Receipts</p>
              <p className="text-2xl font-black text-rose-600 mt-1">
                {pendingExpenses.filter((e) => !(e.hasReceipt || e.receiptUrl || e.receipt_url || e.receiptPhotoUrl || e.receipt_photo_url)).length}
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <ShieldAlert size={20} />
            </div>
          </div>

          <div className="bg-white border border-[#EAEBEF] rounded-xl p-3 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Leave Applications</p>
              <p className="text-2xl font-black text-indigo-600 mt-1">{pendingLeaves.length}</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Calendar size={20} />
            </div>
          </div>

        </div>

        {/* Section Tabs: Claims vs Leaves */}
        <div className="flex items-center gap-1 w-fit rounded-lg bg-slate-100 p-1">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'expenses'
                ? 'bg-[#0D1117] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Receipt size={15} />
            Expenditure Claims ({pendingExpenses.length})
          </button>
          <button
            onClick={() => setActiveTab('leaves')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'leaves'
                ? 'bg-[#0D1117] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar size={15} />
            Leave & Absence Requests ({pendingLeaves.length})
          </button>
        </div>

        {/* TAB 1: Expenditure Claims Queue */}
        {activeTab === 'expenses' && (
          <div className="space-y-4">
            {/* Filter & Batch Action Bar */}
            <div className="bg-white border border-[#EAEBEF] rounded-xl p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex-1 flex flex-wrap items-center gap-2">
                {/* Search Input */}
                <div className="relative min-w-[220px]">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search claimant, project, description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-full text-xs font-bold">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`px-3 py-1.5 rounded-full transition-all ${
                      filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    All ({pendingExpenses.length})
                  </button>
                  <button
                    onClick={() => setFilterType('highAmount')}
                    className={`px-3 py-1.5 rounded-full transition-all ${
                      filterType === 'highAmount' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    &gt; ৳5,000 High
                  </button>
                  <button
                    onClick={() => setFilterType('noReceipt')}
                    className={`px-3 py-1.5 rounded-full transition-all ${
                      filterType === 'noReceipt' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    No Voucher
                  </button>
                  <button
                    onClick={() => setFilterType('hasReceipt')}
                    className={`px-3 py-1.5 rounded-full transition-all ${
                      filterType === 'hasReceipt' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Has Receipt
                  </button>
                </div>
              </div>

              {/* Batch Approve Button */}
              {selectedExpenseIds.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-600">
                    {selectedExpenseIds.length} Selected (৳{selectedTotalAmount.toLocaleString()})
                  </span>
                  <button
                    onClick={handleBatchApprove}
                    disabled={submitting}
                    className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold shadow-md transition-all disabled:opacity-50"
                  >
                    <CheckCircle2 size={15} />
                    <span>Batch Approve ({selectedExpenseIds.length})</span>
                  </button>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2 md:grid-cols-5">
                <select aria-label="Filter approvals by project" value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700"><option value="all">All projects</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select>
                <input aria-label="Minimum claim amount" type="number" min="0" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} placeholder="Min amount" className="h-9 rounded-lg border border-slate-200 px-2.5 text-xs" />
                <input aria-label="Maximum claim amount" type="number" min="0" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} placeholder="Max amount" className="h-9 rounded-lg border border-slate-200 px-2.5 text-xs" />
                <label className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-2 text-[10px] text-slate-500">From<input aria-label="Approval from date" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="min-w-0 flex-1 text-xs text-slate-700" /></label>
                <label className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-2 text-[10px] text-slate-500">To<input aria-label="Approval to date" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="min-w-0 flex-1 text-xs text-slate-700" /></label>
              </div>
            </div>

            {/* Claims Table */}
            <div className="bg-white border border-[#EAEBEF] rounded-xl shadow-xs overflow-hidden">
              {filteredExpenses.length === 0 ? (
                <div className="py-20 text-center text-slate-400 font-medium">
                  {loading ? 'Fetching pending claims...' : 'No pending claims in queue. Inbox clear!'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="py-3 px-4 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={
                              filteredExpenses.length > 0 &&
                              selectedExpenseIds.length === filteredExpenses.length
                            }
                            onChange={toggleSelectAll}
                            className="rounded accent-[#0D1117] cursor-pointer"
                          />
                        </th>
                        <th className="py-3 px-4">Claimant / Personnel</th>
                        <th className="py-3 px-4">Project / Cost Code</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Description & Justification</th>
                        <th className="py-3 px-4 text-center">Voucher Preview</th>
                        <th className="py-3 px-4 text-right">Amount (৳)</th>
                        <th className="py-3 px-4 text-right">Review Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredExpenses.map((exp) => {
                        const isSelected = selectedExpenseIds.includes(exp.id);
                        const hasReceipt = Boolean(exp.hasReceipt || exp.receiptUrl || exp.receipt_url || exp.receiptPhotoUrl || exp.receipt_photo_url);
                        const receiptUrl = exp.receiptUrl || exp.receipt_url || exp.receiptPhotoUrl || exp.receipt_photo_url;
                        const matchedUser = users.find(
                          (u) => u.id === (exp.userId || exp.user_id) || u.name === (exp.employeeName || exp.employee_name)
                        );

                        return (
                          <tr
                            key={exp.id}
                            tabIndex={0}
                            aria-haspopup="dialog"
                            aria-label={`Open claim details for ${exp.employeeName || exp.employee_name || 'employee'}, ৳${Number(exp.amount || 0).toLocaleString()}`}
                            onClick={() => setSelectedClaim(exp)}
                            onKeyDown={(event) => {
                              if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
                                event.preventDefault();
                                setSelectedClaim(exp);
                              }
                            }}
                            className={`transition-colors ${
                              isSelected ? 'bg-indigo-50/40' : 'hover:bg-slate-50/70'
                            }`}
                          >
                            <td className="py-4 px-4 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onClick={(event) => event.stopPropagation()}
                                onChange={() => toggleSelectExpense(exp.id)}
                                className="rounded accent-[#0D1117] cursor-pointer"
                              />
                            </td>

                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2.5">
                                <UserAvatar
                                  src={exp.employeeAvatar || exp.userAvatar || matchedUser?.avatarUrl || matchedUser?.avatar_url}
                                  name={exp.employeeName || exp.employee_name || 'Staff'}
                                  size="sm"
                                  shape="rounded"
                                />
                                <div>
                                  <p className="font-bold text-slate-900">{exp.employeeName || exp.employee_name || 'Staff'}</p>
                                  <p className="text-[10px] text-slate-400 font-mono">
                                    {exp.date ? new Date(exp.date).toLocaleDateString() : 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-4 font-semibold text-slate-700 max-w-[160px] truncate">
                              {exp.projectName || exp.project_name || exp.projectId || 'General Overhead'}
                            </td>

                            <td className="py-4 px-4">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[11px] border capitalize ${getCategoryBadgeClass(
                                  exp.category
                                )}`}
                              >
                                {exp.category}
                              </span>
                            </td>

                            <td className="py-4 px-4 max-w-xs">
                              <p className="text-slate-800 font-medium truncate">{exp.description}</p>
                              {exp.justification && (
                                <p className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded mt-1 inline-block">
                                  Note: {exp.justification}
                                </p>
                              )}
                            </td>

                            <td className="py-4 px-4 text-center">
                              {hasReceipt ? (
                                <button
                                  type="button"
                                  onClick={(event) => { event.stopPropagation(); setPreviewVoucherUrl(receiptUrl); }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] transition-colors"
                                >
                                  <Eye size={12} /> View Slip
                                </button>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px]">
                                  <AlertTriangle size={11} /> No Slip
                                </span>
                              )}
                            </td>

                            <td className="py-4 px-4 text-right font-black font-mono text-sm text-slate-900">
                              ৳{(Number(exp.amount) || 0).toLocaleString()}
                            </td>

                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={(event) => { event.stopPropagation(); handleApproveExpense(exp.id); }}
                                  disabled={submitting}
                                  className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-xs"
                                  title="Approve Claim"
                                >
                                  <Check size={15} strokeWidth={2.5} />
                                </button>
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setItemToReject({
                                      id: exp.id,
                                      type: 'expense',
                                      name: `${exp.employeeName || 'Staff'} - ৳${exp.amount}`,
                                    })
                                  }}
                                  disabled={submitting}
                                  className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-xs"
                                  title="Reject Claim"
                                >
                                  <X size={15} strokeWidth={2.5} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Leave & Absence Requests */}
        {activeTab === 'leaves' && (
          <div className="bg-white border border-[#EAEBEF] rounded-xl shadow-xs overflow-hidden">
            {pendingLeaves.length === 0 ? (
              <div className="py-20 text-center text-slate-400 font-medium">
                No pending leave applications. All clear!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Applicant</th>
                      <th className="py-3 px-4">Leave Type</th>
                      <th className="py-3 px-4">Duration Range</th>
                      <th className="py-3 px-4">Total Days</th>
                      <th className="py-3 px-4">Reason / Notes</th>
                      <th className="py-3 px-4 text-right">Review Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingLeaves.map((leave) => {
                      const leaveUserId = leave.userId || leave.user_id;
                      const matchedUser = users.find((user) => String(user.id || user._id) === String(leaveUserId)) || users.find(
                        (user) => user.name === (leave.employeeName || leave.employee_name || leave.userName || leave.user_name)
                      );
                      const name = leave.employeeName || leave.employee_name || leave.userName || leave.user_name || matchedUser?.name || matchedUser?.fullName || matchedUser?.full_name || 'Staff';
                      const avatar = leave.avatarUrl || leave.avatar_url || matchedUser?.avatarUrl || matchedUser?.avatar_url;

                      return (
                        <tr
                          key={leave.id}
                          tabIndex={0}
                          aria-haspopup="dialog"
                          aria-label={`Open leave request for ${leave.employeeName || leave.employee_name || 'employee'}`}
                          onClick={() => setSelectedLeave(leave)}
                          onKeyDown={(event) => {
                            if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
                              event.preventDefault();
                              setSelectedLeave(leave);
                            }
                          }}
                          className="cursor-pointer transition-colors hover:bg-slate-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2.5">
                              <UserAvatar
                                src={avatar}
                                name={name}
                                size="sm"
                                shape="rounded"
                              />
                              <div>
                                <p className="font-bold text-slate-900">{name}</p>
                          <p className="text-[10px] text-slate-400">{leave.department || matchedUser?.department || 'Employee'}</p>
                              </div>
                            </div>
                          </td>

                        <td className="py-4 px-4 font-bold text-slate-800 capitalize">
                          {leave.type || 'Casual Leave'}
                        </td>

                        <td className="py-4 px-4 font-mono text-slate-600">
                          {leave.startDate ? new Date(leave.startDate).toLocaleDateString() : 'N/A'} -{' '}
                          {leave.endDate ? new Date(leave.endDate).toLocaleDateString() : 'N/A'}
                        </td>

                        <td className="py-4 px-4 font-bold text-slate-900">
                          {leave.days || 1} Days
                        </td>

                        <td className="py-4 px-4 max-w-xs text-slate-600">
                          {leave.reason || 'Personal / medical leave'}
                        </td>

                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={(event) => { event.stopPropagation(); handleApproveLeave(leave.id); }}
                              disabled={submitting}
                              className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-xs"
                              title="Approve Leave"
                            >
                              <Check size={15} strokeWidth={2.5} />
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setItemToReject({
                                  id: leave.id,
                                  type: 'leave',
                                  name: `${leave.employeeName || 'Staff'} Leave`,
                                })
                              }}
                              disabled={submitting}
                              className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-xs"
                              title="Reject Leave"
                            >
                              <X size={15} strokeWidth={2.5} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Claim details drawer */}
        {selectedClaim && (() => {
          const claim = selectedClaim;
          const claimName = claim.employeeName || claim.employee_name || 'Staff';
          const matchedUser = users.find((user) =>
            user.id === (claim.userId || claim.user_id) || user.name === claimName
          );
          const receiptUrl = claim.receiptUrl || claim.receipt_url || claim.receiptPhotoUrl || claim.receipt_photo_url;
          const projectName = claim.projectName || claim.project_name || projects.find(
            (project) => String(project.id) === String(claim.projectId || claim.project_id)
          )?.name || 'General overhead';
          const claimDate = claim.date || claim.createdAt || claim.created_at;
          const rawDescription = claim.description || claim.note || '';
          const taxMeta = rawDescription.match(/\[TAX_META:vat=([\d.]+):([\d.]+)\|tax=([\d.]+):([\d.]+)\|base=([\d.]+)\]/i);
          const description = rawDescription.replace(/\s*\[TAX_META:[^\]]+\]/i, '').trim();

          return (
            <div
              className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[2px]"
              onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedClaim(null); }}
            >
              <aside
                role="dialog"
                aria-modal="true"
                aria-labelledby="claim-details-title"
                className="absolute inset-y-0 right-0 flex w-full max-w-[500px] flex-col border-l border-slate-200 bg-[#fbfcfe] shadow-2xl animate-in slide-in-from-right duration-200"
              >
                <header className="flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <UserAvatar
                      src={claim.employeeAvatar || claim.userAvatar || matchedUser?.avatarUrl || matchedUser?.avatar_url}
                      name={claimName}
                      size="md"
                      shape="rounded"
                    />
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Expense claim</p>
                      <h2 id="claim-details-title" className="mt-0.5 truncate text-lg font-semibold text-slate-900">{claimName}</h2>
                      <p className="mt-0.5 text-xs text-slate-500">{claimDate ? new Date(claimDate).toLocaleDateString() : 'Date not provided'}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Close claim details"
                    onClick={() => setSelectedClaim(null)}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <CloseIcon size={18} />
                  </button>
                </header>

                <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
                  <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium text-slate-500">Claim amount</p>
                        <p className="mt-1 font-mono text-3xl font-bold tracking-tight text-slate-900">৳{(Number(claim.amount) || 0).toLocaleString()}</p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold capitalize text-amber-700 ring-1 ring-inset ring-amber-200">
                        <Clock size={13} /> {claim.status || 'Pending'}
                      </span>
                    </div>
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Description</p>
                      <p className="mt-1.5 text-sm leading-6 text-slate-700">{description || 'No description provided.'}</p>
                      {taxMeta && (
                        <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs">
                          <div className="flex justify-between text-slate-500"><span>Base amount</span><span className="font-mono text-slate-700">৳{Number(taxMeta[5]).toLocaleString()}</span></div>
                          <div className="flex justify-between text-slate-500"><span>VAT ({taxMeta[1]}%)</span><span className="font-mono text-slate-700">৳{Number(taxMeta[2]).toLocaleString()}</span></div>
                          <div className="flex justify-between text-slate-500"><span>Tax / AIT ({taxMeta[3]}%)</span><span className="font-mono text-slate-700">৳{Number(taxMeta[4]).toLocaleString()}</span></div>
                        </div>
                      )}
                    </div>
                    {(claim.justification || claim.reason) && (
                      <div className="mt-4 rounded-xl bg-slate-50 p-3.5">
                        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400"><MessageSquareText size={13} /> Justification</p>
                        <p className="mt-1.5 text-sm leading-5 text-slate-700">{claim.justification || claim.reason}</p>
                      </div>
                    )}
                  </section>

                  <section>
                    <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">Claim details</h3>
                    <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white px-4">
                      <div className="flex items-center gap-3 py-3.5">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-blue-700"><Building2 size={16} /></span>
                        <div className="min-w-0"><p className="text-[11px] text-slate-400">Project / cost code</p><p className="truncate text-sm font-medium text-slate-800">{projectName}</p></div>
                      </div>
                      <div className="flex items-center gap-3 py-3.5">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-violet-50 text-violet-700"><Tag size={16} /></span>
                        <div><p className="text-[11px] text-slate-400">Category</p><p className="text-sm font-medium capitalize text-slate-800">{claim.categoryName || claim.category_name || claim.category || 'Uncategorized'}</p></div>
                      </div>
                      <div className="flex items-center gap-3 py-3.5">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-600"><Calendar size={16} /></span>
                        <div><p className="text-[11px] text-slate-400">Submitted</p><p className="text-sm font-medium text-slate-800">{claimDate ? new Date(claimDate).toLocaleString() : 'Date not provided'}</p></div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <div className="mb-2.5 flex items-center justify-between">
                      <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">Receipt</h3>
                      {receiptUrl && <span className="text-[11px] font-medium text-emerald-700">Attached</span>}
                    </div>
                    {receiptUrl ? (
                      <button
                        type="button"
                        onClick={() => { setSelectedClaim(null); setPreviewVoucherUrl(receiptUrl); }}
                        className="group relative flex min-h-32 w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white text-left"
                      >
                        <img src={receiptUrl} alt="Expense receipt preview" className="max-h-52 w-full object-contain p-2" />
                        <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-lg bg-slate-900/85 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100"><Eye size={13} /> View full receipt</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 rounded-2xl border border-dashed border-rose-200 bg-rose-50/60 p-4 text-sm text-rose-700">
                        <AlertTriangle size={17} /> No receipt was attached to this claim.
                      </div>
                    )}
                  </section>
                </div>

                <footer className="flex items-center gap-2 border-t border-slate-200 bg-white px-6 py-4">
                  <button
                    type="button"
                    onClick={() => setItemToReject({ id: claim.id, type: 'expense', name: `${claimName} - ৳${claim.amount}` })}
                    disabled={submitting}
                    className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-50"
                  ><X size={16} /> Reject claim</button>
                  <button
                    type="button"
                    onClick={() => handleApproveExpense(claim.id)}
                    disabled={submitting}
                    className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
                  ><Check size={16} /> Approve claim</button>
                </footer>
              </aside>
            </div>
          );
        })()}

        {selectedLeave && (() => {
          const leave = selectedLeave;
          const leaveUserId = leave.userId || leave.user_id;
          const matchedUser = users.find((user) => String(user.id || user._id) === String(leaveUserId)) || users.find(
            (user) => user.name === (leave.employeeName || leave.employee_name || leave.userName || leave.user_name)
          );
          const name = leave.employeeName || leave.employee_name || leave.userName || leave.user_name || matchedUser?.name || matchedUser?.fullName || matchedUser?.full_name || 'Staff';
          const status = String(leave.status || (leave.isApproved || leave.is_approved ? 'approved' : 'pending')).toLowerCase();
          return <LeaveDetailsDrawer
            leave={leave}
            employeeName={name}
            avatarUrl={leave.avatarUrl || leave.avatar_url || matchedUser?.avatarUrl || matchedUser?.avatar_url}
            email={leave.email || leave.employeeEmail || leave.employee_email || matchedUser?.email}
            department={leave.department || matchedUser?.department}
            status={status}
            canReview={status === 'pending'}
            busy={submitting}
            onClose={() => setSelectedLeave(null)}
            onApprove={() => handleApproveLeave(leave.id)}
            onDecline={() => setItemToReject({ id: leave.id, type: 'leave', name: `${name} Leave` })}
          />;
        })()}

        {/* MODAL: Voucher Preview */}
        {previewVoucherUrl && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Receipt size={18} className="text-emerald-600" />
                  Expense Voucher Proof
                </h3>
                <button onClick={() => setPreviewVoucherUrl(null)} className="text-slate-400 hover:text-slate-600">
                  ✕
                </button>
              </div>

              <div className="max-h-[70vh] overflow-auto rounded-2xl bg-slate-900 flex items-center justify-center p-2">
                <img
                  src={previewVoucherUrl}
                  alt="Voucher Receipt"
                  className="max-h-[65vh] w-auto object-contain rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <a
                  href={previewVoucherUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 border rounded-full text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <ExternalLink size={13} /> Open Full Size
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewVoucherUrl(null)}
                  className="px-5 py-2 bg-[#0D1117] text-white rounded-full text-xs font-bold hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Reject Reason */}
        {itemToReject && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  Reject {itemToReject.type === 'expense' ? 'Claim' : 'Leave Application'}
                </h3>
                <button onClick={() => setItemToReject(null)} className="text-slate-400 hover:text-slate-600">
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-600">
                Please provide an audit rationale for rejecting <span className="font-bold">{itemToReject.name}</span>. This feedback will be recorded in the employee's notification feed.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Reason for Rejection *
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setItemToReject(null)}
                  className="px-4 py-2 border rounded-full text-slate-600 hover:bg-slate-50 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRejection}
                  disabled={submitting}
                  className="px-5 py-2 bg-rose-600 text-white rounded-full text-xs font-bold hover:bg-rose-700 disabled:opacity-50"
                >
                  {submitting ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
