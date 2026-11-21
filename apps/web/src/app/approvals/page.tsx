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
  MessageSquare,
  Send,
} from 'lucide-react';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { LeaveClarificationThread } from '@/components/leaves/LeaveClarificationThread';
import { getExpenseCategoryTone, getExpenseReceiptGroups, getExpenseReceiptUrls } from '@/lib/expenseReceipts';

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
  const [inspectLeave, setInspectLeave] = useState<any | null>(null);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const commentsEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll remarks stream when new comment arrives or opens
  useEffect(() => {
    if (inspectExpense?.comments?.length) {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [inspectExpense?.comments?.length]);

  // Open inspection and immediately ensure freshest comments
  const handleOpenInspectExpense = async (exp: any) => {
    setInspectExpense(exp);
    setNewComment('');
    try {
      const fresh = await ApiClient.getExpenseById(exp.id);
      if (fresh) {
        setInspectExpense(fresh);
        setExpenses((prev) => prev.map((item) => (item.id === exp.id ? fresh : item)));
      }
    } catch {
      // Keep existing data on transient fetch error
    }
  };

  // Resolve comment author name, role, avatar, and reviewer styling
  const getCommentAuthorInfo = (c: any) => {
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
      inspectExpense &&
      (authorId === inspectExpense.employeeId ||
        authorName.toLowerCase() ===
          (inspectExpense.employeeName || inspectExpense.employee_name || '').toLowerCase())
    ) {
      displayRole = 'Claimant';
    } else if (matchedUser?.role) {
      displayRole = matchedUser.role.replace('_', ' ').toUpperCase();
    }

    return { authorName, displayRole, avatarUrl, isReviewer };
  };

  // Post comment to expense discussion thread
  const handleAddComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inspectExpense?.id || !newComment.trim() || postingComment) return;

    const commentText = newComment.trim();
    setPostingComment(true);
    try {
      await ApiClient.addExpenseComment(inspectExpense.id, commentText);
      setNewComment('');
      const updatedExpense = await ApiClient.getExpenseById(inspectExpense.id);
      if (updatedExpense) {
        setInspectExpense(updatedExpense);
        setExpenses((prev) =>
          prev.map((item) => (item.id === inspectExpense.id ? updatedExpense : item))
        );
      }
    } catch (err: any) {
      console.error('Failed to post remark:', err);
      alert(`Failed to post remark: ${err.message || 'Unknown error'}`);
    } finally {
      setPostingComment(false);
    }
  };

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
  const handleApproveLeave = async (id: string): Promise<boolean> => {
    setSubmitting(true);
    try {
      await ApiClient.approveLeave(id);
      setLeaves(leaves.map((l) => (l.id === id ? { ...l, status: 'approved' } : l)));
      return true;
    } catch (err: any) {
      console.error('Failed to approve leave:', err);
      alert(`Approval failed: ${err.message}`);
      return false;
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
        setExpenses((current) => current.map((e) => (e.id === itemToReject.id ? { ...e, status: 'rejected', rejectionReason } : e)));
        setInspectExpense((current: any) => current?.id === itemToReject.id ? { ...current, status: 'rejected', rejectionReason } : current);
      } else {
        await ApiClient.rejectLeave(itemToReject.id, rejectionReason);
        setLeaves(leaves.map((l) => (l.id === itemToReject.id ? { ...l, status: 'rejected' } : l)));
        setInspectLeave((current: any) => current?.id === itemToReject.id ? { ...current, status: 'rejected' } : current);
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
                                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 font-mono">
                                      <Calendar size={10} className="text-blue-500 shrink-0" />
                                      <span>Claim Date: {exp.date ? new Date(exp.date).toLocaleDateString() : 'N/A'}</span>
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/70 font-mono">
                                      <Clock size={10} className="text-slate-500 shrink-0" />
                                      <span>Submitted: {(exp.createdAt || exp.created_at) ? new Date(exp.createdAt || exp.created_at).toLocaleDateString() : 'N/A'}</span>
                                    </span>
                                  </div>
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
                                  onClick={() => handleOpenInspectExpense(exp)}
                                  className={`p-1.5 rounded-xl transition-all shadow-xs relative flex items-center gap-1 ${
                                    (exp.comments?.length || 0) > 0
                                      ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold'
                                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                  }`}
                                  title="Audit Remarks & Clarification Thread"
                                >
                                  <MessageSquare size={13} />
                                  {(exp.comments?.length || 0) > 0 && (
                                    <span className="text-[11px] font-bold">{exp.comments.length}</span>
                                  )}
                                  {((exp.comments?.length || 0) > 0 || exp.justificationStatus === 'clarification_requested') && (
                                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenInspectExpense(exp)}
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
                      const name = leave.userName || leave.employeeName || leave.employee_name || 'Staff';
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
                              onClick={() => setInspectLeave(leave)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-100 bg-indigo-50 px-2.5 py-1.5 text-[10px] font-bold text-indigo-700 transition hover:bg-indigo-100"
                              title="Open leave details and clarification thread"
                            >
                              <MessageSquare size={13} />
                              <span className="hidden lg:inline">Details &amp; messages</span>
                            </button>
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

        {inspectLeave && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6">
            <section role="dialog" aria-modal="true" aria-labelledby="leave-review-title" className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-2xl">
              <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><Calendar size={19} /></span>
                  <div className="min-w-0">
                    <h2 id="leave-review-title" className="truncate text-sm font-bold text-slate-900">Leave details &amp; clarification</h2>
                    <p className="text-[11px] text-slate-500">Review together with the employee</p>
                  </div>
                </div>
                <button type="button" onClick={() => setInspectLeave(null)} aria-label="Close leave details" className="rounded-full p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
              </header>
              <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto p-3 sm:p-5 lg:grid-cols-[minmax(240px,0.8fr)_minmax(0,1.2fr)]">
                <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                  <div className="flex items-center gap-3">
                    <UserAvatar src={inspectLeave.userAvatarUrl || inspectLeave.avatarUrl || inspectLeave.avatar_url} name={inspectLeave.userName || inspectLeave.employeeName || 'Employee'} size="lg" shape="rounded" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">{inspectLeave.userName || inspectLeave.employeeName || inspectLeave.employee_name || 'Employee'}</p>
                      <p className="text-xs capitalize text-slate-500">{inspectLeave.department || 'Team member'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Leave type</p><p className="mt-1 font-bold capitalize text-slate-800">{inspectLeave.leaveType || inspectLeave.type || 'Leave'}</p></div>
                    <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Duration</p><p className="mt-1 font-bold text-slate-800">{inspectLeave.totalDays || inspectLeave.days || 1} days</p></div>
                  </div>
                  <div className="rounded-xl border border-slate-100 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Date range</p>
                    <p className="mt-1 font-mono text-xs font-semibold text-slate-800">{inspectLeave.startDate || inspectLeave.start_date || '—'} → {inspectLeave.endDate || inspectLeave.end_date || '—'}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Reason</p>
                    <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-slate-700">{inspectLeave.reason || 'No explanation provided.'}</p>
                  </div>
                </div>
                <LeaveClarificationThread leaveId={inspectLeave.id} employeeName={inspectLeave.userName || inspectLeave.employeeName || 'the employee'} />
              </div>
              {String(inspectLeave.status || 'pending').toLowerCase() === 'pending' && (
                <footer className="flex shrink-0 justify-end gap-2 border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
                  <button type="button" disabled={submitting} onClick={() => setItemToReject({ id: inspectLeave.id, type: 'leave', name: `${inspectLeave.userName || inspectLeave.employeeName || 'Employee'} Leave` })} className="rounded-xl border border-rose-200 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-50">Decline</button>
                  <button type="button" disabled={submitting} onClick={async () => { if (await handleApproveLeave(inspectLeave.id)) setInspectLeave(null); }} className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50">{submitting ? 'Saving…' : 'Approve leave'}</button>
                </footer>
              )}
            </section>
          </div>
        )}

        {/* MODAL: Expense Claim Inspection Details */}
        {inspectExpense && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
            <div className="bg-white rounded-3xl max-w-4xl w-full h-[90vh] max-h-[820px] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Pinned Top Bar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-2xs font-black">
                    <Receipt size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">Voucher Claim Inspection</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-200/60">
                        {inspectExpense.status || 'Pending'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="text-[11px] text-slate-400 font-mono">
                        Ref #{String(inspectExpense.id || '').slice(0, 8)}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 font-mono">
                        <Calendar size={10} className="text-blue-500 shrink-0" />
                        <span>Claim Date: {inspectExpense.date ? new Date(inspectExpense.date).toLocaleDateString() : 'N/A'}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/70 font-mono">
                        <Clock size={10} className="text-slate-500 shrink-0" />
                        <span>Submitted: {(inspectExpense.createdAt || inspectExpense.created_at) ? new Date(inspectExpense.createdAt || inspectExpense.created_at).toLocaleDateString() : 'N/A'}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectExpense(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center transition-all cursor-pointer"
                  title="Close modal"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Main Body: Two Column Responsive Grid */}
              <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-slate-50/50">
                {/* Left Column: Voucher Info, Purpose, Receipt Preview */}
                <div className="md:col-span-6 lg:col-span-5 p-5 overflow-y-auto space-y-3.5 flex flex-col">
                  {/* Summary Metric Chips */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Claimant
                      </span>
                      <span className="font-bold text-slate-900 text-xs truncate block mt-0.5">
                        {inspectExpense.employeeName || inspectExpense.employee_name || 'Staff Member'}
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Total Amount
                      </span>
                      <span className="font-mono font-black text-emerald-600 text-sm block mt-0.5">
                        ৳{(Number(inspectExpense.amount) || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Project / Code
                      </span>
                      <span className="font-semibold text-slate-800 text-xs truncate block mt-0.5">
                        {inspectExpense.projectName || inspectExpense.project_name || inspectExpense.projectId || 'General'}
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Category
                      </span>
                      <span className="font-semibold text-slate-800 text-xs capitalize truncate block mt-0.5">
                        {inspectExpense.categoryName || inspectExpense.category_name || inspectExpense.category || 'General'}
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Expense Claim Date
                      </span>
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-blue-700 text-xs mt-0.5">
                        <Calendar size={12} className="text-blue-500" />
                        {inspectExpense.date ? new Date(inspectExpense.date).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Submission Timestamp
                      </span>
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-slate-700 text-xs mt-0.5">
                        <Clock size={12} className="text-slate-500" />
                        {(inspectExpense.createdAt || inspectExpense.created_at)
                          ? new Date(inspectExpense.createdAt || inspectExpense.created_at).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Operational Note */}
                  <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs text-xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Claim Description / Note
                    </span>
                    <p className="text-slate-700 leading-relaxed font-medium text-xs whitespace-pre-wrap">
                      {inspectExpense.note || inspectExpense.description || 'No detailed note was provided with this voucher claim.'}
                    </p>
                    {inspectExpense.justification && (
                      <p className="text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg mt-1.5 font-medium border border-amber-200/60">
                        Remark: {inspectExpense.justification}
                      </p>
                    )}
                  </div>

                  {/* Voucher Receipt Slip Preview */}
                  <div className="flex-1 flex flex-col min-h-[180px]">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                      <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500">
                        <Receipt size={13} className="text-indigo-600" />
                        Commercial Voucher Slip
                      </span>
                      {getExpenseReceiptUrls(inspectExpense).length > 0 && (
                        <a
                          href={getExpenseReceiptUrls(inspectExpense)[0]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-[11px] font-semibold"
                        >
                          <ExternalLink size={12} /> Open Full
                        </a>
                      )}
                    </div>

                    {(() => {
                      const groups = getExpenseReceiptGroups(inspectExpense);
                      const photos = groups.flatMap((group) => group.urls);

                      if (photos.length > 0) {
                        return (
                          <div className="flex-1 flex flex-col min-h-[160px] max-h-[420px] overflow-y-auto space-y-3">
                            {groups.map((group, groupIndex) => (
                              <section key={`${group.categoryId || group.categoryName}-${groupIndex}`} className="rounded-2xl border border-slate-200 bg-white p-2.5">
                                <div className="mb-2 flex items-center justify-between gap-2">
                                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-extrabold ${getExpenseCategoryTone(group.categoryName)}`}>
                                    {group.categoryName}
                                  </span>
                                  <span className="text-[10px] text-slate-400">{group.urls.length} receipt{group.urls.length === 1 ? '' : 's'}</span>
                                </div>
                                <div className="flex gap-2 overflow-x-auto p-2 bg-slate-900 rounded-xl border border-slate-800 items-center">
                                  {group.urls.map((url, pIdx) => (
                                    <a key={`${url}-${pIdx}`} href={url} target="_blank" rel="noopener noreferrer" className="shrink-0 h-44 rounded-lg overflow-hidden border border-slate-700 bg-black flex items-center justify-center relative group">
                                      <img src={url} alt={`${group.categoryName} receipt ${pIdx + 1}`} className="h-full w-auto max-w-[240px] object-contain transition-transform group-hover:scale-105" />
                                      <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">#{pIdx + 1}</span>
                                    </a>
                                  ))}
                                </div>
                              </section>
                            ))}
                            {photos.length > 1 && (
                              <p className="text-[10px] text-slate-400 mt-1 text-center font-medium">
                                {photos.length} vouchers attached • Scroll horizontally to inspect
                              </p>
                            )}
                          </div>
                        );
                      }

                      return (
                        <div className="flex-1 p-6 bg-white rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center text-slate-400 text-xs">
                          <AlertTriangle size={20} className="text-amber-500 mb-1.5 opacity-80" />
                          <p className="font-semibold text-slate-600">No receipt slip attached</p>
                          <p className="text-[11px] text-slate-400">Claim submitted without digital receipt photo.</p>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Right Column: Audit Remarks & Clarification Thread with Pinned Send Box */}
                <div className="md:col-span-6 lg:col-span-7 flex flex-col h-full bg-white">
                  {/* Thread Header */}
                  <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                      <span className="text-xs font-bold text-slate-900 tracking-wide">
                        Audit Remarks & Clarifications
                      </span>
                    </div>
                    <span className="text-[11px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-100">
                      {inspectExpense.comments?.length || 0} messages
                    </span>
                  </div>

                  {/* Scrollable Comments Stream */}
                  <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-3">
                    {(!inspectExpense.comments || inspectExpense.comments.length === 0) ? (
                      <div className="h-full flex flex-col items-center justify-center py-10 text-center px-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-2.5">
                          <MessageSquare size={22} />
                        </div>
                        <p className="text-slate-800 font-bold text-xs">No discussion entries recorded</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
                          Leave an audit remark, question, or verification note below to notify the claimant.
                        </p>
                      </div>
                    ) : (
                      <>
                        {inspectExpense.comments.map((c: any, idx: number) => {
                          const { authorName, displayRole, avatarUrl, isReviewer } = getCommentAuthorInfo(c);
                          return (
                            <div
                              key={c.id || idx}
                              className={`p-3 rounded-2xl border flex items-start gap-3 transition-all ${
                                isReviewer
                                  ? 'bg-indigo-50/60 border-indigo-100 shadow-2xs'
                                  : 'bg-white border-slate-200/80 shadow-2xs'
                              }`}
                            >
                              <UserAvatar
                                src={avatarUrl}
                                name={authorName}
                                size="sm"
                                shape="rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-bold text-slate-900 text-xs">{authorName}</span>
                                    <span
                                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                                        isReviewer
                                          ? 'bg-indigo-100 text-indigo-700'
                                          : 'bg-slate-100 text-slate-700'
                                      }`}
                                    >
                                      {displayRole}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {c.createdAt
                                      ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                      : ''}
                                  </span>
                                </div>
                                <p className="text-slate-800 text-xs leading-relaxed whitespace-pre-wrap">
                                  {c.comment || c.comment_text || c.text}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={commentsEndRef} />
                      </>
                    )}
                  </div>

                  {/* Write & Send Box - Pinned securely at bottom of Right Column */}
                  <div className="p-3.5 border-t border-slate-200 bg-white shrink-0">
                    <form onSubmit={handleAddComment} className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Type audit remark or clarification request..."
                          disabled={postingComment}
                          className="w-full pl-3.5 pr-3 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all shadow-2xs"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!newComment.trim() || postingComment}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
                      >
                        <Send size={13} />
                        <span>{postingComment ? 'Sending...' : 'Send'}</span>
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Pinned Bottom Bar: Approval / Reject Actions */}
              <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-white shrink-0">
                <button
                  type="button"
                  onClick={() => setInspectExpense(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-full text-xs transition-colors cursor-pointer"
                >
                  Close Inspection
                </button>
                <div className="flex items-center gap-2.5">
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
                    className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <X size={13} strokeWidth={2.5} /> Reject Claim
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const expId = inspectExpense.id;
                      setInspectExpense(null);
                      handleApproveExpense(expId);
                    }}
                    disabled={submitting}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Check size={14} strokeWidth={2.5} /> Approve Voucher
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
