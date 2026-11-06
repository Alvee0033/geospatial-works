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
} from 'lucide-react';
import { UserAvatar } from '@/components/ui/UserAvatar';

export default function ApprovalsQueuePage() {
  const [activeTab, setActiveTab] = useState<'expenses' | 'leaves'>('expenses');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Expense Filter State
  const [filterType, setFilterType] = useState<'all' | 'highAmount' | 'noReceipt' | 'hasReceipt'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Voucher preview & inspection modal
  const [previewVoucherUrl, setPreviewVoucherUrl] = useState<string | null>(null);
  const [inspectExpense, setInspectExpense] = useState<any | null>(null);

  // Rejection modal
  const [itemToReject, setItemToReject] = useState<{ id: string; type: 'expense' | 'leave'; name: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Insufficient documentation or out of policy');

  const fetchApprovalsData = async () => {
    setLoading(true);
    try {
      const [allExp, allLeaves, allUsers] = await Promise.all([
        ApiClient.getExpenses(),
        ApiClient.getLeaves().catch(() => []),
        ApiClient.getUsers().catch(() => []),
      ]);
      setExpenses(allExp || []);
      setLeaves(allLeaves || []);
      setUsers(allUsers || []);
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
    const hasReceipt = Boolean(
      e.receiptPhotoUrl || e.receipt_photo_url || e.receiptUrl || e.receipt_url || e.hasReceipt
    );

    if (filterType === 'highAmount' && amount <= 5000) return false;
    if (filterType === 'noReceipt' && hasReceipt) return false;
    if (filterType === 'hasReceipt' && !hasReceipt) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (e.employeeName || e.employee_name || '').toLowerCase();
      const proj = (e.projectName || e.project_name || e.projectId || '').toLowerCase();
      const cat = (e.categoryName || e.category_name || e.category || '').toLowerCase();
      const desc = (e.note || e.description || '').toLowerCase();
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
    } catch (err: any) {
      console.error('Failed to approve expense:', err);
      alert(`Approval failed: ${err.message}`);
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
      alert(`Successfully approved ${selectedExpenseIds.length} expense claims!`);
    } catch (err: any) {
      console.error('Batch approval error:', err);
      alert('One or more approvals failed.');
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
    } catch (err: any) {
      console.error('Failed to approve leave:', err);
      alert(`Approval failed: ${err.message}`);
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
      } else {
        await ApiClient.rejectLeave(itemToReject.id, rejectionReason);
        setLeaves(leaves.map((l) => (l.id === itemToReject.id ? { ...l, status: 'rejected' } : l)));
      }
      setItemToReject(null);
    } catch (err: any) {
      console.error('Rejection failed:', err);
      alert(`Rejection failed: ${err.message}`);
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
                {
                  pendingExpenses.filter(
                    (e) =>
                      !Boolean(
                        e.receiptPhotoUrl ||
                          e.receipt_photo_url ||
                          e.receiptUrl ||
                          e.receipt_url ||
                          e.hasReceipt
                      )
                  ).length
                }
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
                        const receiptUrl =
                          exp.receiptPhotoUrl ||
                          exp.receipt_photo_url ||
                          exp.receiptUrl ||
                          exp.receipt_url;
                        const hasReceipt = Boolean(receiptUrl || exp.hasReceipt);
                        const matchedUser = users.find(
                          (u) =>
                            u.id === (exp.userId || exp.user_id) ||
                            u.name === (exp.employeeName || exp.employee_name)
                        );
                        const categoryName =
                          exp.categoryName ||
                          exp.category_name ||
                          exp.category ||
                          'General';
                        const noteText = exp.note || exp.description || '—';

                        return (
                          <tr
                            key={exp.id}
                            className={`transition-colors ${
                              isSelected ? 'bg-indigo-50/40' : 'hover:bg-slate-50/70'
                            }`}
                          >
                            <td className="py-4 px-4 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectExpense(exp.id)}
                                className="rounded accent-[#0D1117] cursor-pointer"
                              />
                            </td>

                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2.5">
                                <UserAvatar
                                  src={
                                    exp.employeeAvatar ||
                                    exp.userAvatar ||
                                    matchedUser?.avatarUrl ||
                                    matchedUser?.avatar_url
                                  }
                                  name={exp.employeeName || exp.employee_name || 'Staff'}
                                  size="sm"
                                  shape="rounded"
                                />
                                <div>
                                  <p className="font-bold text-slate-900">
                                    {exp.employeeName || exp.employee_name || 'Staff'}
                                  </p>
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
                                  categoryName
                                )}`}
                              >
                                {categoryName}
                              </span>
                            </td>

                            <td className="py-4 px-4 max-w-xs">
                              <p className="text-slate-800 font-medium truncate">{noteText}</p>
                              {exp.justification && (
                                <p className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded mt-1 inline-block">
                                  Note: {exp.justification}
                                </p>
                              )}
                            </td>

                            <td className="py-4 px-4 text-center">
                              {receiptUrl ? (
                                <button
                                  type="button"
                                  onClick={() => setPreviewVoucherUrl(receiptUrl)}
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
                                  onClick={() => setInspectExpense(exp)}
                                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1 transition-all shadow-xs"
                                  title="Inspect Expense Details"
                                >
                                  <Eye size={13} /> Details
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleApproveExpense(exp.id)}
                                  disabled={submitting}
                                  className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-xs"
                                  title="Approve Claim"
                                >
                                  <Check size={15} strokeWidth={2.5} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setItemToReject({
                                      id: exp.id,
                                      type: 'expense',
                                      name: `${exp.employeeName || exp.employee_name || 'Staff'} - ৳${exp.amount}`,
                                    })
                                  }
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
                      const matchedUser = users.find(
                        (u) => u.id === (leave.userId || leave.user_id) || u.name === (leave.employeeName || leave.employee_name)
                      );
                      const name = leave.employeeName || leave.employee_name || 'Staff';
                      const avatar = leave.avatarUrl || leave.avatar_url || matchedUser?.avatarUrl || matchedUser?.avatar_url;

                      return (
                        <tr key={leave.id} className="hover:bg-slate-50/70 transition-colors">
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
                                <p className="text-[10px] text-slate-400">{leave.department || 'Employee'}</p>
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
                              onClick={() => handleApproveLeave(leave.id)}
                              disabled={submitting}
                              className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-xs"
                              title="Approve Leave"
                            >
                              <Check size={15} strokeWidth={2.5} />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setItemToReject({
                                  id: leave.id,
                                  type: 'leave',
                                  name: `${leave.employeeName || 'Staff'} Leave`,
                                })
                              }
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

        {/* MODAL: Expense Claim Inspection Details */}
        {inspectExpense && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Receipt size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Voucher Claim Inspection</h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Ref #{String(inspectExpense.id || '').slice(0, 8)} •{' '}
                      {inspectExpense.date ? new Date(inspectExpense.date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectExpense(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Grid Summary */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Claimant Personnel
                  </span>
                  <span className="font-bold text-slate-900">
                    {inspectExpense.employeeName || inspectExpense.employee_name || 'Staff Member'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Project / Cost Code
                  </span>
                  <span className="font-semibold text-slate-800">
                    {inspectExpense.projectName || inspectExpense.project_name || inspectExpense.projectId || 'General Overhead'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Category Tag
                  </span>
                  <span className="font-semibold text-slate-800 capitalize">
                    {inspectExpense.categoryName || inspectExpense.category_name || inspectExpense.category || 'General'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Total Voucher Amount
                  </span>
                  <span className="font-mono font-black text-emerald-600 text-sm">
                    ৳{(Number(inspectExpense.amount) || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Justification & Note */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Claim Justification / Description
                </span>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {inspectExpense.note || inspectExpense.description || 'No detailed note was provided with this voucher claim.'}
                </p>
                {inspectExpense.justification && (
                  <p className="text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg mt-1 font-medium">
                    Remark: {inspectExpense.justification}
                  </p>
                )}
              </div>

              {/* Attached Voucher Slip */}
              {(inspectExpense.receiptPhotoUrl ||
                inspectExpense.receipt_photo_url ||
                inspectExpense.receiptUrl ||
                inspectExpense.receipt_url) ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Receipt size={14} className="text-indigo-600" />
                      Commercial Voucher Slip
                    </span>
                    <a
                      href={
                        inspectExpense.receiptPhotoUrl ||
                        inspectExpense.receipt_photo_url ||
                        inspectExpense.receiptUrl ||
                        inspectExpense.receipt_url
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-[11px]"
                    >
                      <ExternalLink size={12} /> Open Full Size
                    </a>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-2xl border border-slate-200 flex justify-center overflow-hidden">
                    <img
                      src={
                        inspectExpense.receiptPhotoUrl ||
                        inspectExpense.receipt_photo_url ||
                        inspectExpense.receiptUrl ||
                        inspectExpense.receipt_url
                      }
                      alt="Expense voucher"
                      className="max-h-72 w-auto object-contain rounded-xl shadow-xs"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/60 text-center text-amber-800 text-xs">
                  <AlertTriangle size={16} className="mx-auto text-amber-500 mb-1" />
                  No physical or digital receipt photo was attached to this claim.
                </div>
              )}

              {/* Audit Comments Thread */}
              {inspectExpense.comments && inspectExpense.comments.length > 0 && (
                <div className="space-y-2 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Audit Remarks ({inspectExpense.comments.length})
                  </span>
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {inspectExpense.comments.map((c: any, idx: number) => (
                      <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2">
                        <UserAvatar
                          src={c.avatarUrl || c.userAvatarUrl}
                          name={c.userName || 'Administrator'}
                          size="sm"
                          shape="rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-bold text-slate-900 text-xs">{c.userName || 'Admin'}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>
                          <p className="text-slate-700 text-xs">{c.comment || c.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setInspectExpense(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-full text-xs transition-colors"
                >
                  Close
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const exp = inspectExpense;
                      setInspectExpense(null);
                      setItemToReject({
                        id: exp.id,
                        type: 'expense',
                        name: `${exp.employeeName || exp.employee_name || 'Staff'} - ৳${exp.amount}`,
                      });
                    }}
                    disabled={submitting}
                    className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white rounded-full text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <X size={13} strokeWidth={2.5} /> Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const expId = inspectExpense.id;
                      setInspectExpense(null);
                      handleApproveExpense(expId);
                    }}
                    disabled={submitting}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
                  >
                    <Check size={13} strokeWidth={2.5} /> Approve Claim
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
