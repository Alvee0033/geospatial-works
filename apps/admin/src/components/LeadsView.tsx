'use client';

import React, { useState, useMemo } from 'react';
import {
  Mail,
  Phone,
  Calendar,
  Building,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  Trash2,
  ExternalLink,
  ChevronRight,
  Copy,
  Check,
  RefreshCw,
  Send,
  MessageSquare,
  Sparkles,
  Plus,
  X,
  FileText,
  User,
  Shield,
  Layers,
  ArrowUpDown,
  MoreVertical,
  Inbox,
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
  onCreateInquiry?: (data: {
    fullName: string;
    email: string;
    phone?: string;
    serviceType?: string;
    message: string;
    organization?: string;
  }) => Promise<void>;
  onRefresh: () => void;
  triggerFeedback?: (msg: string, type?: 'success' | 'error') => void;
}

const STATUS_CONFIG: Record<
  InquiryStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  NEW: {
    label: 'New Lead',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    bg: 'bg-sky-50',
    text: 'text-sky-800',
    border: 'border-sky-200',
    dot: 'bg-sky-500',
  },
  CONTACTED: {
    label: 'Contacted',
    bg: 'bg-indigo-50',
    text: 'text-indigo-800',
    border: 'border-indigo-200',
    dot: 'bg-indigo-500',
  },
  RESOLVED: {
    label: 'Resolved / Won',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
};

const SERVICE_OPTIONS = [
  'All Services',
  'Topographic & Land Survey',
  'UAV Drone Mapping & Photogrammetry',
  'Hydrographic & Bathymetric Survey',
  'Feasibility, BOQ & Civil Design',
  'GIS Implementation & Remote Sensing',
  'Other Technical Inquiry',
];

export function LeadsView({
  inquiries,
  loading = false,
  onUpdateStatus,
  onDeleteInquiry,
  onCreateInquiry,
  onRefresh,
  triggerFeedback,
}: LeadsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | InquiryStatus>('ALL');
  const [serviceFilter, setServiceFilter] = useState('All Services');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(
    inquiries.length > 0 ? inquiries[0].id : null
  );

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Quick Note Editing state for the active inspector
  const [editingNotes, setEditingNotes] = useState<string>('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Manual Lead Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newOrganization, setNewOrganization] = useState('');
  const [newServiceType, setNewServiceType] = useState('Topographic & Land Survey');
  const [newMessage, setNewMessage] = useState('');
  const [creatingLead, setCreatingLead] = useState(false);

  // Parse helper: extract organization from message if stored as `[Organization: XYZ]`
  const parseInquiryMessage = (rawMessage: string) => {
    let org = '';
    let cleanMessage = rawMessage || '';
    const orgMatch = cleanMessage.match(/^\[Organization:\s*(.+?)\]\n?/);
    if (orgMatch) {
      org = orgMatch[1].trim();
      cleanMessage = cleanMessage.replace(orgMatch[0], '').trim();
    }
    return { org, cleanMessage };
  };

  // Metrics KPI calculations
  const stats = useMemo(() => {
    const total = inquiries.length;
    const newCount = inquiries.filter((i) => i.status === 'NEW').length;
    const inProgressCount = inquiries.filter((i) => i.status === 'IN_PROGRESS').length;
    const contactedCount = inquiries.filter((i) => i.status === 'CONTACTED').length;
    const resolvedCount = inquiries.filter((i) => i.status === 'RESOLVED').length;
    return { total, newCount, inProgressCount, contactedCount, resolvedCount };
  }, [inquiries]);

  // Filtered & Sorted Inquiries
  const filteredInquiries = useMemo(() => {
    return inquiries
      .filter((item) => {
        const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
        const matchesService =
          serviceFilter === 'All Services' ||
          (item.serviceType && item.serviceType.toLowerCase().includes(serviceFilter.toLowerCase()));

        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          item.fullName.toLowerCase().includes(q) ||
          item.email.toLowerCase().includes(q) ||
          (item.phone && item.phone.toLowerCase().includes(q)) ||
          (item.serviceType && item.serviceType.toLowerCase().includes(q)) ||
          item.message.toLowerCase().includes(q) ||
          (item.internalNotes && item.internalNotes.toLowerCase().includes(q));

        return matchesStatus && matchesService && matchesSearch;
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
      });
  }, [inquiries, statusFilter, serviceFilter, searchQuery, sortOrder]);

  // Keep an inquiry selected
  const activeInquiry = useMemo(() => {
    if (!selectedInquiryId) {
      return filteredInquiries[0] || inquiries[0] || null;
    }
    return inquiries.find((i) => i.id === selectedInquiryId) || filteredInquiries[0] || null;
  }, [inquiries, filteredInquiries, selectedInquiryId]);

  // Sync internal notes text when active lead changes
  React.useEffect(() => {
    if (activeInquiry) {
      setEditingNotes(activeInquiry.internalNotes || '');
    }
  }, [activeInquiry?.id]);

  // Handle single note update
  const handleSaveNotes = async () => {
    if (!activeInquiry) return;
    setSavingNotes(true);
    try {
      await onUpdateStatus(activeInquiry.id, activeInquiry.status, editingNotes);
      triggerFeedback?.('Internal team note saved successfully');
    } catch {
      triggerFeedback?.('Failed to save note', 'error');
    } finally {
      setSavingNotes(false);
    }
  };

  // Quick status update
  const handleQuickStatusChange = async (inquiryId: string, newStatus: InquiryStatus) => {
    try {
      const item = inquiries.find((i) => i.id === inquiryId);
      await onUpdateStatus(inquiryId, newStatus, item?.internalNotes);
      triggerFeedback?.(`Status updated to ${STATUS_CONFIG[newStatus].label}`);
    } catch {
      triggerFeedback?.('Failed to update status', 'error');
    }
  };

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Multi-selection handlers
  const handleToggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredInquiries.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredInquiries.map((i) => i.id));
    }
  };

  const handleBulkStatusChange = async (newStatus: InquiryStatus) => {
    if (selectedIds.length === 0) return;
    setBulkProcessing(true);
    try {
      await Promise.all(
        selectedIds.map((id) => {
          const item = inquiries.find((i) => i.id === id);
          return onUpdateStatus(id, newStatus, item?.internalNotes);
        })
      );
      setSelectedIds([]);
      triggerFeedback?.(`Updated ${selectedIds.length} inquiries to ${STATUS_CONFIG[newStatus].label}`);
      onRefresh();
    } catch {
      triggerFeedback?.('Failed to update selected inquiries', 'error');
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to permanently delete ${selectedIds.length} lead inquiries?`)) return;
    setBulkProcessing(true);
    try {
      await Promise.all(selectedIds.map((id) => onDeleteInquiry(id)));
      setSelectedIds([]);
      triggerFeedback?.(`Deleted ${selectedIds.length} inquiries`);
      onRefresh();
    } catch {
      triggerFeedback?.('Failed to delete inquiries', 'error');
    } finally {
      setBulkProcessing(false);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const listToExport = selectedIds.length > 0
      ? inquiries.filter((i) => selectedIds.includes(i.id))
      : filteredInquiries;

    if (listToExport.length === 0) {
      triggerFeedback?.('No inquiries to export', 'error');
      return;
    }

    const headers = [
      'Inquiry ID',
      'Client Name',
      'Organization',
      'Email',
      'Phone',
      'Service Requested',
      'Status',
      'Submission Date',
      'Message Body',
      'Internal Team Notes',
    ];

    const rows = listToExport.map((item) => {
      const { org, cleanMessage } = parseInquiryMessage(item.message);
      return [
        `"${item.id}"`,
        `"${item.fullName.replace(/"/g, '""')}"`,
        `"${org.replace(/"/g, '""')}"`,
        `"${item.email}"`,
        `"${item.phone || ''}"`,
        `"${(item.serviceType || 'General').replace(/"/g, '""')}"`,
        `"${item.status}"`,
        `"${new Date(item.createdAt).toISOString()}"`,
        `"${cleanMessage.replace(/"/g, '""')}"`,
        `"${(item.internalNotes || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `GW_Leads_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerFeedback?.(`Exported ${listToExport.length} leads to CSV`);
  };

  // Quick reply email launcher
  const handleLaunchReply = (templateType: 'ack' | 'quote' | 'coords' | 'meeting') => {
    if (!activeInquiry) return;
    const { cleanMessage, org } = parseInquiryMessage(activeInquiry.message);
    const subjectPrefix = `Geospatial Works: In reference to your inquiry on ${activeInquiry.serviceType || 'Survey Services'}`;

    let body = `Dear ${activeInquiry.fullName},\n\n`;

    if (templateType === 'ack') {
      body += `Thank you for reaching out to Geospatial Works. We have received your project details regarding ${activeInquiry.serviceType || 'our surveying and mapping services'}.\n\nOur technical geodetic engineering team is reviewing your project parameters and we will follow up with our scope proposal shortly.\n\nWarm regards,\nGeospatial Works Technical Desk\nDhaka, Bangladesh\nTel: +88 01303 772216 | www.geospatialworks.com.bd`;
    } else if (templateType === 'coords') {
      body += `Thank you for connecting with Geospatial Works.\n\nTo prepare an accurate mobilization plan and formal BOQ/quotation for your site, could you kindly share:\n1. The approximate boundary polygon or site coordinates (.KML / .KMZ or Shapefile / GeoJSON)\n2. Expected contour interval or deliverable requirements (DTM, DSM, Orthomosaic, As-built drawings)\n3. Target completion timeline\n\nLooking forward to assisting your engineering project.\n\nWarm regards,\nGeospatial Works Project Dispatch\n+88 01303 772216`;
    } else if (templateType === 'quote') {
      body += `Thank you for your inquiry regarding ${activeInquiry.serviceType || 'geospatial services'}.\n\nWe have prepared our preliminary technical mobilization and rate breakdown. Please let us know if you would like to schedule a 15-minute briefing or site coordination meeting this week.\n\nBest regards,\nGeospatial Works Management Team`;
    } else {
      body += `Dear ${activeInquiry.fullName},\n\nWe would be pleased to host a coordination session at your office or at our Dhaka headquarters (64/1 Lake Circus, Kalabagan) to inspect ground control requirements and finalize survey execution dates.\n\nPlease let us know what day and time suits your schedule best.\n\nWarm regards,\nGeospatial Works`;
    }

    const mailtoUrl = `mailto:${encodeURIComponent(activeInquiry.email)}?subject=${encodeURIComponent(
      subjectPrefix
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  // Create Manual Lead Submit
  const handleCreateLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newEmail.trim() || !newMessage.trim()) {
      triggerFeedback?.('Please fill in Name, Email, and Project Details', 'error');
      return;
    }
    setCreatingLead(true);
    try {
      if (onCreateInquiry) {
        await onCreateInquiry({
          fullName: newFullName.trim(),
          email: newEmail.trim(),
          phone: newPhone.trim(),
          serviceType: newServiceType,
          organization: newOrganization.trim(),
          message: newMessage.trim(),
        });
      }
      setIsAddModalOpen(false);
      setNewFullName('');
      setNewEmail('');
      setNewPhone('');
      setNewOrganization('');
      setNewMessage('');
      triggerFeedback?.('Lead successfully created and queued!');
      onRefresh();
    } catch {
      triggerFeedback?.('Failed to create lead', 'error');
    } finally {
      setCreatingLead(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* =========================================================================
          TOP STATS KPI STRIP (Ultra-compact & high-density)
          ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div
          onClick={() => setStatusFilter('ALL')}
          className={`p-3.5 rounded-xl border bg-white cursor-pointer transition shadow-xs hover:border-slate-400 ${
            statusFilter === 'ALL' ? 'border-indigo-600 ring-2 ring-indigo-500/10' : 'border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Total Inquiries</span>
            <Inbox size={15} className="text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{stats.total}</span>
            <span className="text-[11px] font-medium text-slate-400">All inbound</span>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('NEW')}
          className={`p-3.5 rounded-xl border bg-white cursor-pointer transition shadow-xs hover:border-amber-400 ${
            statusFilter === 'NEW' ? 'border-amber-500 ring-2 ring-amber-500/15' : 'border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-amber-700 mb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              New / Pending
            </span>
            <AlertCircle size={15} className="text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-900">{stats.newCount}</span>
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Requires reply</span>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('IN_PROGRESS')}
          className={`p-3.5 rounded-xl border bg-white cursor-pointer transition shadow-xs hover:border-sky-400 ${
            statusFilter === 'IN_PROGRESS' ? 'border-sky-500 ring-2 ring-sky-500/15' : 'border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-sky-700 mb-1">
            <span>In Progress</span>
            <Clock size={15} className="text-sky-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-sky-900">{stats.inProgressCount}</span>
            <span className="text-[11px] font-medium text-sky-600">Reviewing params</span>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('CONTACTED')}
          className={`p-3.5 rounded-xl border bg-white cursor-pointer transition shadow-xs hover:border-indigo-400 ${
            statusFilter === 'CONTACTED' ? 'border-indigo-500 ring-2 ring-indigo-500/15' : 'border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-indigo-700 mb-1">
            <span>Contacted</span>
            <Send size={15} className="text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-900">{stats.contactedCount}</span>
            <span className="text-[11px] font-medium text-indigo-600">Quotation sent</span>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('RESOLVED')}
          className={`p-3.5 rounded-xl border bg-white cursor-pointer transition shadow-xs hover:border-emerald-400 ${
            statusFilter === 'RESOLVED' ? 'border-emerald-500 ring-2 ring-emerald-500/15' : 'border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 mb-1">
            <span>Resolved / Won</span>
            <CheckCircle2 size={15} className="text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-900">{stats.resolvedCount}</span>
            <span className="text-[11px] font-medium text-emerald-600">Converted</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CONTROLS TOOLBAR: Filter, Search, Bulk Actions, Actions
          ========================================================================= */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left: Search & Filters */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search box */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search leads by name, email, phone, company, message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Service Dropdown Filter */}
          <div className="relative">
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {SERVICE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order Toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            title={`Sort order: ${sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}`}
          >
            <ArrowUpDown size={13} />
            <span className="capitalize">{sortOrder}</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Refresh */}
          <button
            onClick={onRefresh}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            title="Refresh Inquiries"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-indigo-600' : ''} />
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer shadow-xs"
          >
            <FileSpreadsheet size={14} className="text-emerald-600" />
            <span>Export CSV</span>
          </button>

          {/* Manual Add Lead */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition cursor-pointer shadow-xs shadow-indigo-100"
          >
            <Plus size={14} />
            <span>Log Inbound Lead</span>
          </button>
        </div>
      </div>

      {/* Multi-Selection Bulk Action Bar (Visible when items selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-white/20">
              {selectedIds.length} Selected
            </span>
            <span className="text-xs text-slate-300">Apply action to selected leads:</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={bulkProcessing}
              onClick={() => handleBulkStatusChange('CONTACTED')}
              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-indigo-500/30 hover:bg-indigo-500/50 text-indigo-200 transition"
            >
              Mark Contacted
            </button>
            <button
              disabled={bulkProcessing}
              onClick={() => handleBulkStatusChange('IN_PROGRESS')}
              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-sky-500/30 hover:bg-sky-500/50 text-sky-200 transition"
            >
              Mark In Progress
            </button>
            <button
              disabled={bulkProcessing}
              onClick={() => handleBulkStatusChange('RESOLVED')}
              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-200 transition"
            >
              Mark Resolved
            </button>
            <button
              disabled={bulkProcessing}
              onClick={handleBulkDelete}
              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-rose-500/30 hover:bg-rose-500/50 text-rose-200 transition flex items-center gap-1"
            >
              <Trash2 size={12} />
              <span>Delete</span>
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="p-1 text-slate-400 hover:text-white"
              title="Clear selection"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MAIN MASTER-DETAIL WORKSPACE (High-density 2-Column Split)
          ========================================================================= */}
      {filteredInquiries.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Inbox size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-800">No leads match your filter</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            {searchQuery || statusFilter !== 'ALL' || serviceFilter !== 'All Services'
              ? 'Try resetting the filters or clearing your search term.'
              : 'New quote inquiries submitted via the website contact form or manual log will show up here.'}
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            {(searchQuery || statusFilter !== 'ALL' || serviceFilter !== 'All Services') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                  setServiceFilter('All Services');
                }}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Clear Filters
              </button>
            )}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
            >
              + Log Inbound Lead
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* ===================================================================
              LEFT: Compact Leads List (5 or 6 cols)
              =================================================================== */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col h-[calc(100vh-235px)] min-h-[580px] overflow-hidden">
            {/* List header bar */}
            <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={
                    filteredInquiries.length > 0 &&
                    selectedIds.length === filteredInquiries.length
                  }
                  onChange={handleSelectAll}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  title="Select all filtered"
                />
                <span className="text-xs font-bold text-slate-700">
                  Inbox ({filteredInquiries.length})
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Click to inspect</span>
            </div>

            {/* Scrollable List Items */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredInquiries.map((item) => {
                const isSelected = activeInquiry?.id === item.id;
                const isChecked = selectedIds.includes(item.id);
                const { org, cleanMessage } = parseInquiryMessage(item.message);
                const statusMeta = STATUS_CONFIG[item.status] || STATUS_CONFIG.NEW;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedInquiryId(item.id)}
                    className={`p-3 transition cursor-pointer relative group flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-indigo-50/60 border-l-4 border-indigo-600'
                        : 'hover:bg-slate-50/90 border-l-4 border-transparent'
                    }`}
                  >
                    {/* Checkbox */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSelectOne(item.id);
                      }}
                      className="pt-0.5"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      {/* Name, Status, Date */}
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${statusMeta.dot}`}
                            title={statusMeta.label}
                          />
                          <h4
                            className={`text-xs font-bold truncate ${
                              isSelected ? 'text-indigo-900' : 'text-slate-900'
                            }`}
                          >
                            {item.fullName}
                          </h4>
                          {org && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold truncate max-w-[120px]">
                              {org}
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] font-medium text-slate-400 shrink-0">
                          {new Date(item.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      {/* Service Category */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50/80 px-1.5 py-0.5 rounded border border-indigo-100 truncate">
                          {item.serviceType || 'General Survey Inquiry'}
                        </span>
                        <span
                          className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${statusMeta.bg} ${statusMeta.text}`}
                        >
                          {statusMeta.label}
                        </span>
                      </div>

                      {/* Message Preview (Truncated 2 lines) */}
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {cleanMessage}
                      </p>

                      {/* Contact metadata mini footer */}
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                        <span className="truncate">{item.email}</span>
                        {item.phone && (
                          <>
                            <span>•</span>
                            <span className="font-mono">{item.phone}</span>
                          </>
                        )}
                        {item.internalNotes && (
                          <>
                            <span>•</span>
                            <span className="text-amber-600 font-semibold flex items-center gap-0.5">
                              <FileText size={10} /> Note
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <ChevronRight
                      size={14}
                      className={`shrink-0 mt-1 transition ${
                        isSelected ? 'text-indigo-600' : 'text-slate-300 group-hover:text-slate-500'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* ===================================================================
              RIGHT: Full Detail Inspector & Action Console (7 cols)
              =================================================================== */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col h-[calc(100vh-235px)] min-h-[580px] overflow-hidden">
            {activeInquiry ? (
              <div className="flex flex-col h-full overflow-hidden">
                {/* Inspector Header */}
                <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white flex items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm shadow-indigo-100">
                      {activeInquiry.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase() || 'L'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-extrabold text-slate-900 truncate">
                          {activeInquiry.fullName}
                        </h3>
                        {parseInquiryMessage(activeInquiry.message).org && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {parseInquiryMessage(activeInquiry.message).org}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Received on{' '}
                        {new Date(activeInquiry.createdAt).toLocaleString('en-US', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Status Dropdown Picker */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Status:
                    </span>
                    <select
                      value={activeInquiry.status}
                      onChange={(e) =>
                        handleQuickStatusChange(activeInquiry.id, e.target.value as InquiryStatus)
                      }
                      className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border cursor-pointer focus:outline-none transition ${
                        STATUS_CONFIG[activeInquiry.status].bg
                      } ${STATUS_CONFIG[activeInquiry.status].text} ${
                        STATUS_CONFIG[activeInquiry.status].border
                      }`}
                    >
                      <option value="NEW">New Lead</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="RESOLVED">Resolved / Won</option>
                    </select>

                    <button
                      onClick={() => {
                        if (confirm('Permanently delete this inquiry?')) {
                          onDeleteInquiry(activeInquiry.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Delete Lead"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Inspector Body: Scrollable */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                  {/* Quick Contact & Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={`mailto:${activeInquiry.email}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs"
                    >
                      <Mail size={13} />
                      <span>Email Client</span>
                    </a>

                    {activeInquiry.phone && (
                      <a
                        href={`tel:${activeInquiry.phone}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                      >
                        <Phone size={13} />
                        <span>Call ({activeInquiry.phone})</span>
                      </a>
                    )}

                    {activeInquiry.phone && (
                      <a
                        href={`https://wa.me/${activeInquiry.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold transition"
                      >
                        <MessageSquare size={13} />
                        <span>WhatsApp</span>
                      </a>
                    )}

                    <button
                      onClick={() =>
                        handleCopy(
                          `Name: ${activeInquiry.fullName}\nEmail: ${activeInquiry.email}\nPhone: ${activeInquiry.phone || 'N/A'}\nService: ${activeInquiry.serviceType}\nMessage:\n${activeInquiry.message}`,
                          'all'
                        )
                      }
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold ml-auto"
                    >
                      {copiedField === 'all' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      <span>{copiedField === 'all' ? 'Copied' : 'Copy Lead Info'}</span>
                    </button>
                  </div>

                  {/* Compact Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200/50">
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Client Email
                        </span>
                        <a
                          href={`mailto:${activeInquiry.email}`}
                          className="text-xs font-bold text-indigo-600 hover:underline truncate block"
                        >
                          {activeInquiry.email}
                        </a>
                      </div>
                      <button
                        onClick={() => handleCopy(activeInquiry.email, 'email')}
                        className="p-1 text-slate-400 hover:text-slate-600"
                        title="Copy email"
                      >
                        {copiedField === 'email' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200/50">
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Direct Phone
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-800 truncate block">
                          {activeInquiry.phone || 'Not provided'}
                        </span>
                      </div>
                      {activeInquiry.phone && (
                        <button
                          onClick={() => handleCopy(activeInquiry.phone!, 'phone')}
                          className="p-1 text-slate-400 hover:text-slate-600"
                          title="Copy phone"
                        >
                          {copiedField === 'phone' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        </button>
                      )}
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/50 sm:col-span-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Requested Discipline / Service
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Layers size={14} className="text-indigo-600" />
                        <span className="text-xs font-bold text-slate-900">
                          {activeInquiry.serviceType || 'General Surveying Inquiry'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Message Container */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <FileText size={14} className="text-slate-400" />
                        <span>Client Message &amp; Project Requirements</span>
                      </label>
                      <button
                        onClick={() =>
                          handleCopy(
                            parseInquiryMessage(activeInquiry.message).cleanMessage,
                            'message'
                          )
                        }
                        className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        {copiedField === 'message' ? <Check size={11} /> : <Copy size={11} />}
                        <span>Copy Message</span>
                      </button>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 font-sans leading-relaxed whitespace-pre-wrap select-text">
                      {parseInquiryMessage(activeInquiry.message).cleanMessage}
                    </div>
                  </div>

                  {/* Quick Reply Presets (Saves hours drafting common surveyor responses!) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-indigo-600" />
                      <span>One-Click Professional Response Templates</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        onClick={() => handleLaunchReply('ack')}
                        className="p-2 rounded-lg border border-slate-200 text-left hover:border-indigo-400 hover:bg-indigo-50/40 transition cursor-pointer"
                      >
                        <span className="text-[11px] font-bold text-slate-800 block">1. Acknowledge</span>
                        <span className="text-[10px] text-slate-500">Confirm receipt &amp; review</span>
                      </button>

                      <button
                        onClick={() => handleLaunchReply('coords')}
                        className="p-2 rounded-lg border border-slate-200 text-left hover:border-indigo-400 hover:bg-indigo-50/40 transition cursor-pointer"
                      >
                        <span className="text-[11px] font-bold text-slate-800 block">2. Ask KMZ/KML</span>
                        <span className="text-[10px] text-slate-500">Request site boundary</span>
                      </button>

                      <button
                        onClick={() => handleLaunchReply('quote')}
                        className="p-2 rounded-lg border border-slate-200 text-left hover:border-indigo-400 hover:bg-indigo-50/40 transition cursor-pointer"
                      >
                        <span className="text-[11px] font-bold text-slate-800 block">3. Offer Quote</span>
                        <span className="text-[10px] text-slate-500">Attach rate proposal</span>
                      </button>

                      <button
                        onClick={() => handleLaunchReply('meeting')}
                        className="p-2 rounded-lg border border-slate-200 text-left hover:border-indigo-400 hover:bg-indigo-50/40 transition cursor-pointer"
                      >
                        <span className="text-[11px] font-bold text-slate-800 block">4. Schedule Visit</span>
                        <span className="text-[10px] text-slate-500">Site reconnaissance</span>
                      </button>
                    </div>
                  </div>

                  {/* Internal Team Notes & Communication History */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Shield size={14} className="text-amber-600" />
                        <span>Internal Dispatch Notes &amp; Follow-up Log</span>
                      </label>
                      <span className="text-[10px] text-slate-400">Visible only to admin staff</span>
                    </div>

                    <div className="space-y-2">
                      <textarea
                        rows={3}
                        value={editingNotes}
                        onChange={(e) => setEditingNotes(e.target.value)}
                        placeholder="Log phone calls, quoted prices, engineer assignments, or site notes here..."
                        className="w-full text-xs p-3 bg-amber-50/30 border border-amber-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                          {activeInquiry.updatedAt && (
                            <>Last modified: {new Date(activeInquiry.updatedAt).toLocaleDateString()}</>
                          )}
                        </span>
                        <button
                          disabled={savingNotes}
                          onClick={handleSaveNotes}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          {savingNotes ? <RefreshCw size={12} className="animate-spin" /> : <Check size={12} />}
                          <span>{savingNotes ? 'Saving...' : 'Save Internal Note'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <Inbox size={32} className="mb-2 text-slate-300" />
                <p className="text-xs font-medium">Select a lead from the left to view complete details</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: Manual Inbound Lead Logger (Phone, WhatsApp, Walk-in)
          ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  <Plus size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    Log Inbound Lead / Inquiry
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Record lead received via phone call, email or WhatsApp
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateLeadSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Engr. Rafiqul Islam"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Organization / Company
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Meghna Group of Industries"
                    value={newOrganization}
                    onChange={(e) => setNewOrganization(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="client@company.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Phone / Mobile
                  </label>
                  <input
                    type="tel"
                    placeholder="+880 1713 000000"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white transition font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Target Service Category *
                </label>
                <select
                  value={newServiceType}
                  onChange={(e) => setNewServiceType(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                >
                  {SERVICE_OPTIONS.filter((s) => s !== 'All Services').map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Project Details / Requirements *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe location, acreage, required deliverables (e.g. 100 acres LiDAR topo survey in Gazipur)..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white transition leading-relaxed"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingLead}
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shadow-xs flex items-center gap-1.5"
                >
                  {creatingLead ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
                  <span>{creatingLead ? 'Saving...' : 'Save & Queue Lead'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
