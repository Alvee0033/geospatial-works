'use client';

import React, { useState } from 'react';
import {
  Briefcase,
  Users,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  Edit2,
  Trash2,
  Mail,
  Phone,
  FileText,
  UserCheck,
  ChevronDown,
  AlertCircle,
  Building,
  Award,
  Download,
  CheckSquare,
  Square,
  FileSpreadsheet,
  Archive,
  RefreshCw,
  X,
} from 'lucide-react';
import { JobPostItem, CAREER_DEPARTMENTS } from './JobModal';

export interface ApplicationItem {
  id: string;
  jobPostId?: string;
  jobPost?: {
    id: string;
    title: string;
    department: string;
  };
  fullName: string;
  email: string;
  phone: string;
  linkedInUrl?: string;
  portfolioUrl?: string;
  currentCompany?: string;
  currentTitle?: string;
  yearsOfExperience?: string;
  coverLetter?: string;
  resumeUrl?: string;
  status: 'new' | 'reviewing' | 'shortlisted' | 'interviewed' | 'rejected' | 'hired';
  internalNotes?: string;
  createdAt: string;
}

interface CareersViewProps {
  jobs: JobPostItem[];
  applications: ApplicationItem[];
  onAddJob: () => void;
  onEditJob: (job: JobPostItem) => void;
  onDeleteJob: (id: string) => Promise<void>;
  onUpdateAppStatus: (
    id: string,
    status: ApplicationItem['status'],
    internalNotes?: string
  ) => Promise<void>;
  onDeleteApp: (id: string) => Promise<void>;
  onRefresh: () => void;
}

export function CareersView({
  jobs,
  applications,
  onAddJob,
  onEditJob,
  onDeleteJob,
  onUpdateAppStatus,
  onDeleteApp,
  onRefresh,
}: CareersViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'openings' | 'applications'>('openings');

  // Job Filters
  const [jobSearch, setJobSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Application Filters
  const [appSearch, setAppSearch] = useState('');
  const [selectedJobFilter, setSelectedJobFilter] = useState('All');
  const [selectedAppStatus, setSelectedAppStatus] = useState('All');

  // Multi-Selection State for Applications
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);

  // Application Detail Modal / Drawer state
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);
  const [noteText, setNoteText] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Filtered Jobs
  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
      j.department.toLowerCase().includes(jobSearch.toLowerCase()) ||
      j.location.toLowerCase().includes(jobSearch.toLowerCase());
    const matchesDept = selectedDept === 'All' || j.department === selectedDept;
    const matchesStatus = selectedStatus === 'All' || j.status === selectedStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  // Filtered Applications
  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.fullName.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.email.toLowerCase().includes(appSearch.toLowerCase()) ||
      (app.phone && app.phone.toLowerCase().includes(appSearch.toLowerCase())) ||
      (app.jobPost?.title && app.jobPost.title.toLowerCase().includes(appSearch.toLowerCase()));
    const matchesJob =
      selectedJobFilter === 'All' ||
      app.jobPostId === selectedJobFilter ||
      app.jobPost?.id === selectedJobFilter;
    const matchesStatus = selectedAppStatus === 'All' || app.status === selectedAppStatus;
    return matchesSearch && matchesJob && matchesStatus;
  });

  // Multi-Select Handlers
  const handleSelectAll = () => {
    if (selectedAppIds.length === filteredApps.length) {
      setSelectedAppIds([]);
    } else {
      setSelectedAppIds(filteredApps.map((a) => a.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedAppIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk Status Update
  const handleBulkStatusChange = async (newStatus: ApplicationItem['status']) => {
    if (selectedAppIds.length === 0) return;
    setUpdatingStatus(true);
    try {
      await Promise.all(
        selectedAppIds.map((id) => onUpdateAppStatus(id, newStatus))
      );
      setSelectedAppIds([]);
      onRefresh();
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedAppIds.length === 0) return;
    if (!confirm(`Are you sure you want to permanently delete ${selectedAppIds.length} candidate applications?`)) return;
    setUpdatingStatus(true);
    try {
      await Promise.all(selectedAppIds.map((id) => onDeleteApp(id)));
      setSelectedAppIds([]);
      onRefresh();
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Export Selected or All Applications to CSV / Excel
  const handleExportCSV = () => {
    const targetApps = selectedAppIds.length > 0
      ? applications.filter((a) => selectedAppIds.includes(a.id))
      : filteredApps;

    if (targetApps.length === 0) return;

    const headers = [
      'Candidate Name',
      'Email',
      'Phone',
      'Target Job Opening',
      'Department',
      'Current Title',
      'Company',
      'Experience',
      'Status',
      'LinkedIn',
      'Portfolio',
      'CV Link',
      'Application Date',
      'Internal Notes',
    ];

    const rows = targetApps.map((a) => [
      `"${a.fullName.replace(/"/g, '""')}"`,
      `"${a.email}"`,
      `"${a.phone}"`,
      `"${(a.jobPost?.title || 'General Submission').replace(/"/g, '""')}"`,
      `"${(a.jobPost?.department || 'N/A').replace(/"/g, '""')}"`,
      `"${(a.currentTitle || '').replace(/"/g, '""')}"`,
      `"${(a.currentCompany || '').replace(/"/g, '""')}"`,
      `"${(a.yearsOfExperience || '').replace(/"/g, '""')}"`,
      `"${a.status}"`,
      `"${a.linkedInUrl || ''}"`,
      `"${a.portfolioUrl || ''}"`,
      `"${a.resumeUrl || ''}"`,
      `"${a.createdAt ? new Date(a.createdAt).toISOString() : ''}"`,
      `"${(a.internalNotes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `gw_career_applications_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download All CVs / Resume Dossier
  const handleDownloadAllCVs = () => {
    const targetApps = selectedAppIds.length > 0
      ? applications.filter((a) => selectedAppIds.includes(a.id))
      : filteredApps;

    const appsWithCV = targetApps.filter((a) => Boolean(a.resumeUrl));

    if (appsWithCV.length === 0) {
      // If no external URL, generate a structured candidate summary file
      generateApplicantSummaryDossier(targetApps);
      return;
    }

    // Open each resume in tab or download links
    appsWithCV.forEach((a, idx) => {
      setTimeout(() => {
        window.open(a.resumeUrl, '_blank');
      }, idx * 250);
    });

    // Also download full CSV manifest
    handleExportCSV();
  };

  const generateApplicantSummaryDossier = (targetApps: ApplicationItem[]) => {
    let text = `========================================================================\n`;
    text += `GEOSPATIAL WORKS - CANDIDATE RESUME & APPLICATION DOSSIER\n`;
    text += `Generated: ${new Date().toLocaleString()}\n`;
    text += `Total Applicants: ${targetApps.length}\n`;
    text += `========================================================================\n\n`;

    targetApps.forEach((a, i) => {
      text += `[#${i + 1}] CANDIDATE: ${a.fullName}\n`;
      text += `Applied For: ${a.jobPost?.title || 'General Opening'} (${a.jobPost?.department || 'General'})\n`;
      text += `Status: ${a.status.toUpperCase()} | Submitted: ${a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'N/A'}\n`;
      text += `Email: ${a.email} | Phone: ${a.phone}\n`;
      text += `Current Position: ${a.currentTitle || 'N/A'} @ ${a.currentCompany || 'N/A'}\n`;
      text += `Years Experience: ${a.yearsOfExperience || 'N/A'}\n`;
      text += `LinkedIn: ${a.linkedInUrl || 'N/A'}\n`;
      text += `Portfolio: ${a.portfolioUrl || 'N/A'}\n`;
      text += `CV / Cloud Link: ${a.resumeUrl || 'Direct application submission (No external cloud link attached)'}\n`;
      if (a.coverLetter) {
        text += `\nCandidate Statement / Experience Summary:\n${a.coverLetter}\n`;
      }
      if (a.internalNotes) {
        text += `\nInternal HR Notes:\n${a.internalNotes}\n`;
      }
      text += `------------------------------------------------------------------------\n\n`;
    });

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gw_candidates_dossier_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenAppDetail = (app: ApplicationItem) => {
    setSelectedApp(app);
    setNoteText(app.internalNotes || '');
  };

  const handleStatusChange = async (newStatus: ApplicationItem['status']) => {
    if (!selectedApp) return;
    setUpdatingStatus(true);
    try {
      await onUpdateAppStatus(selectedApp.id, newStatus, noteText);
      setSelectedApp({ ...selectedApp, status: newStatus, internalNotes: noteText });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedApp) return;
    setUpdatingStatus(true);
    try {
      await onUpdateAppStatus(selectedApp.id, selectedApp.status, noteText);
      setSelectedApp({ ...selectedApp, internalNotes: noteText });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: ApplicationItem['status']) => {
    switch (status) {
      case 'new':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'reviewing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'shortlisted':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'interviewed':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'hired':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">Careers &amp; Recruiting</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage open surveying and engineering vacancies, candidate applications, and hiring pipeline.
          </p>
        </div>

        {/* Sub-tabs switch */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-stretch sm:self-auto border border-slate-200/60">
          <button
            onClick={() => setActiveSubTab('openings')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeSubTab === 'openings'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase size={13} />
            <span>Job Openings ({jobs.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('applications')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeSubTab === 'applications'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users size={13} />
            <span>Applications ({applications.length})</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          SUB-TAB 1: JOB OPENINGS MANAGEMENT
          ========================================================================= */}
      {activeSubTab === 'openings' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto flex-1">
              <div className="relative flex-1 md:w-64">
                <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                  placeholder="Search openings..."
                  className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white rounded-lg border border-slate-200 outline-none text-xs text-slate-800 transition"
                />
              </div>

              {/* Department Filter */}
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none cursor-pointer"
              >
                <option value="All">All Departments</option>
                {CAREER_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <button
              onClick={onAddJob}
              className="w-full md:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-2xs transition shrink-0 cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Job Opening</span>
            </button>
          </div>

          {/* Job Openings Grid / Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredJobs.length === 0 ? (
              <div className="col-span-full py-16 bg-white rounded-2xl border border-dashed border-slate-200 text-center">
                <Briefcase size={36} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700">No career postings found</p>
                <p className="text-xs text-slate-400 mt-1">
                  Adjust your search or add a new job vacancy to start receiving applications.
                </p>
              </div>
            ) : (
              filteredJobs.map((job) => {
                const jobAppCount = applications.filter(
                  (a) => a.jobPostId === job.id || a.jobPost?.id === job.id
                ).length;

                return (
                  <div
                    key={job.id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Meta */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#F4382D] bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                          {job.department}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border capitalize ${
                            job.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : job.status === 'closed'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {job.status}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#F4382D] transition line-clamp-2">
                        {job.title}
                      </h3>

                      {/* Info Badges */}
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-slate-400" />
                          <span className="truncate max-w-[140px]">{job.location}</span>
                        </span>
                        <span>•</span>
                        <span>{job.type}</span>
                      </div>

                      {/* Summary */}
                      <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                        {job.summary}
                      </p>

                      {/* Qualifications snapshot */}
                      {job.qualifications && job.qualifications.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Key Requirements:
                          </span>
                          <p className="text-[11px] text-slate-600 line-clamp-2 font-mono">
                            • {job.qualifications[0]}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions & Applications Counter */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setSelectedJobFilter(job.id);
                          setActiveSubTab('applications');
                        }}
                        className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                      >
                        <Users size={13} />
                        <span>{jobAppCount} Candidates</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEditJob(job)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                          title="Edit Position"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => onDeleteJob(job.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                          title="Delete Position"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 2: APPLICATIONS REVIEW, MULTI-SELECT & DOWNLOAD ALL CVs
          ========================================================================= */}
      {activeSubTab === 'applications' && (
        <div className="space-y-4">
          {/* Applications Filter Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 w-full flex-1">
              {/* Search candidate name / email / title */}
              <div className="relative flex-1 md:w-72">
                <Search size={15} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                  placeholder="Filter candidate by name, email, phone..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white rounded-lg border border-slate-200 outline-none text-xs text-slate-800 transition"
                />
              </div>

              {/* Filter by Specific Job Position */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                  Job Role:
                </span>
                <select
                  value={selectedJobFilter}
                  onChange={(e) => setSelectedJobFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none max-w-[260px] truncate"
                >
                  <option value="All">All Jobs ({applications.length})</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by Candidate Status */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                  Stage:
                </span>
                <select
                  value={selectedAppStatus}
                  onChange={(e) => setSelectedAppStatus(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none"
                >
                  <option value="All">All Stages</option>
                  <option value="new">New</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interviewed">Interviewed</option>
                  <option value="hired">Hired</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Quick Export & Actions */}
            <div className="flex items-center gap-2 self-stretch md:self-auto shrink-0">
              <button
                onClick={handleDownloadAllCVs}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-bold text-xs transition cursor-pointer"
                title="Download Candidate CVs & Dossier"
              >
                <Download size={14} className="text-[#F4382D]" />
                <span>Download All CVs</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition cursor-pointer border border-emerald-200/60"
                title="Export Applications to CSV"
              >
                <FileSpreadsheet size={14} />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Bulk Action Banner when items selected */}
          {selectedAppIds.length > 0 && (
            <div className="bg-slate-900 text-white p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-5 h-5 rounded-md bg-[#F4382D] flex items-center justify-center font-bold text-[11px]">
                  {selectedAppIds.length}
                </span>
                <span className="font-semibold">Candidate(s) Selected</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300">Set Stage:</span>
                <button
                  onClick={() => handleBulkStatusChange('shortlisted')}
                  className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] transition"
                >
                  Shortlist
                </button>
                <button
                  onClick={() => handleBulkStatusChange('interviewed')}
                  className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] transition"
                >
                  Interview
                </button>
                <button
                  onClick={() => handleBulkStatusChange('hired')}
                  className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition"
                >
                  Hire
                </button>
                <button
                  onClick={() => handleBulkStatusChange('rejected')}
                  className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition"
                >
                  Reject
                </button>

                <div className="h-4 w-[1px] bg-slate-700 mx-1"></div>

                <button
                  onClick={handleDownloadAllCVs}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] transition"
                >
                  <Download size={12} />
                  <span>Download CVs</span>
                </button>

                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white font-bold text-[11px] transition"
                >
                  <Trash2 size={12} />
                  <span>Delete</span>
                </button>

                <button
                  onClick={() => setSelectedAppIds([])}
                  className="text-xs text-slate-400 hover:text-white ml-2 underline"
                >
                  Deselect
                </button>
              </div>
            </div>
          )}

          {/* Applications Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          filteredApps.length > 0 &&
                          selectedAppIds.length === filteredApps.length
                        }
                        onChange={handleSelectAll}
                        className="rounded text-[#F4382D] focus:ring-[#F4382D] w-4 h-4 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-4">Applicant</th>
                    <th className="py-3 px-4">Target Job Opening</th>
                    <th className="py-3 px-4">Experience & Current Role</th>
                    <th className="py-3 px-4">Submitted Date</th>
                    <th className="py-3 px-4">Status Stage</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <Users size={32} className="mx-auto mb-2 text-slate-300" />
                        No applications match the current search or job filters.
                      </td>
                    </tr>
                  ) : (
                    filteredApps.map((app) => {
                      const isSelected = selectedAppIds.includes(app.id);

                      return (
                        <tr
                          key={app.id}
                          className={`hover:bg-slate-50/70 transition ${
                            isSelected ? 'bg-red-50/40' : ''
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-3.5 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectOne(app.id)}
                              className="rounded text-[#F4382D] focus:ring-[#F4382D] w-4 h-4 cursor-pointer"
                            />
                          </td>

                          {/* Applicant details */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{app.fullName}</div>
                            <div className="flex items-center gap-2 mt-0.5 text-slate-500 text-[11px]">
                              <span className="flex items-center gap-1">
                                <Mail size={11} className="text-slate-400" />
                                {app.email}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Phone size={11} className="text-slate-400" />
                                {app.phone}
                              </span>
                            </div>
                          </td>

                          {/* Applied Job */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800 line-clamp-1 max-w-[240px]">
                              {app.jobPost?.title || 'General / Unspecified Opening'}
                            </div>
                            {app.jobPost?.department && (
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                {app.jobPost.department}
                              </span>
                            )}
                          </td>

                          {/* Experience */}
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-700">
                              {app.currentTitle || 'Not specified'}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {app.currentCompany ? `@ ${app.currentCompany}` : ''}{' '}
                              {app.yearsOfExperience ? `(${app.yearsOfExperience})` : ''}
                            </div>
                          </td>

                          {/* Date */}
                          <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                            {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Recent'}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${getStatusBadge(
                                app.status
                              )}`}
                            >
                              {app.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {app.resumeUrl && (
                                <a
                                  href={app.resumeUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                                  title="View CV"
                                >
                                  <FileText size={15} />
                                </a>
                              )}
                              <button
                                onClick={() => handleOpenAppDetail(app)}
                                className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition cursor-pointer"
                              >
                                Review
                              </button>
                              <button
                                onClick={() => onDeleteApp(app.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                title="Delete application"
                              >
                                <Trash2 size={14} />
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
        </div>
      )}

      {/* =========================================================================
          APPLICATION DETAILS DRAWER / MODAL
          ========================================================================= */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-base">
                  {selectedApp.fullName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">{selectedApp.fullName}</h2>
                  <p className="text-xs text-slate-500">
                    Applied for: {selectedApp.jobPost?.title || 'Open Submission'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
              {/* Status Selector Bar */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-700 block mb-0.5">Recruitment Stage</span>
                  <span className="text-[11px] text-slate-400">
                    Update applicant progress through the hiring pipeline
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedApp.status}
                    onChange={(e) => handleStatusChange(e.target.value as any)}
                    disabled={updatingStatus}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-xs text-slate-800 capitalize shadow-xs"
                  >
                    <option value="new">New</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="interviewed">Interviewed</option>
                    <option value="hired">Hired</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Contact info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Contact Channels
                  </span>
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Mail size={13} className="text-[#F4382D]" /> {selectedApp.email}
                  </p>
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Phone size={13} className="text-[#F4382D]" /> {selectedApp.phone}
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Professional Background
                  </span>
                  <p className="font-semibold text-slate-800">
                    {selectedApp.currentTitle || 'Candidate'} {selectedApp.currentCompany && `@ ${selectedApp.currentCompany}`}
                  </p>
                  <p className="text-slate-500">
                    Experience: {selectedApp.yearsOfExperience || 'Not specified'}
                  </p>
                </div>
              </div>

              {/* External Links */}
              <div className="flex flex-wrap gap-2">
                {selectedApp.linkedInUrl && (
                  <a
                    href={selectedApp.linkedInUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-semibold hover:bg-blue-100 transition"
                  >
                    <ExternalLink size={12} />
                    <span>LinkedIn Profile</span>
                  </a>
                )}
                {selectedApp.portfolioUrl && (
                  <a
                    href={selectedApp.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg font-semibold hover:bg-purple-100 transition"
                  >
                    <ExternalLink size={12} />
                    <span>Portfolio / Git</span>
                  </a>
                )}
                {selectedApp.resumeUrl && (
                  <a
                    href={selectedApp.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg font-semibold hover:bg-emerald-100 transition"
                  >
                    <FileText size={12} />
                    <span>Download CV / Resume</span>
                  </a>
                )}
              </div>

              {/* Cover Letter */}
              {selectedApp.coverLetter && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Candidate Statement / Cover Letter
                  </span>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {selectedApp.coverLetter}
                  </div>
                </div>
              )}

              {/* Internal HR Notes */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Confidential Internal Interview & Evaluation Notes
                </span>
                <textarea
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Record interview impressions, technical assessment score, salary expectations, references checked..."
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-slate-800 leading-relaxed"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    disabled={updatingStatus}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition cursor-pointer"
                  >
                    {updatingStatus ? 'Saving Notes...' : 'Save Evaluation Notes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
