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
  onDeleteJob: (id: string) => void | Promise<void>;
  onUpdateAppStatus: (
    id: string,
    status: ApplicationItem['status'],
    internalNotes?: string
  ) => Promise<void>;
  onDeleteApp: (id: string) => void | Promise<void>;
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
  const [activeSubTab, setActiveSubTab] = useState<'openings' | 'applications'>('applications');
  const [appViewMode, setAppViewMode] = useState<'kanban' | 'table'>('kanban');
  const [autoMailOnMove, setAutoMailOnMove] = useState(true);
  const [appSortBy, setAppSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [onlyWithCv, setOnlyWithCv] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<ApplicationItem | null>(null);
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);
  const [emailModalApp, setEmailModalApp] = useState<ApplicationItem | null>(null);
  const [emailTemplate, setEmailTemplate] = useState<string>('shortlisted');
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [emailBody, setEmailBody] = useState<string>('');
  const [emailCopied, setEmailCopied] = useState(false);

  const buildStageEmail = (app: ApplicationItem, stage: string) => {
    const roleTitle = jobs.find((j) => j.id === app.jobPostId)?.title || 'our open position';
    const subjects: Record<string, string> = {
      reviewing: `Application Under Review — ${roleTitle} | Geospatial Works`,
      shortlisted: `Shortlisted for ${roleTitle} | Geospatial Works`,
      interviewed: `Interview Invitation — ${roleTitle} | Geospatial Works`,
      hired: `Offer & Onboarding — ${roleTitle} | Geospatial Works`,
      rejected: `Update on your application for ${roleTitle} | Geospatial Works`,
    };
    const bodies: Record<string, string> = {
      reviewing: `Dear ${app.fullName},\n\nThank you for applying for ${roleTitle} at Geospatial Works. Your application is currently under review by our hiring team.\n\nBest regards,\nGeospatial Works HR`,
      shortlisted: `Dear ${app.fullName},\n\nWe are pleased to inform you that you have been shortlisted for ${roleTitle} at Geospatial Works. Our team will reach out shortly with interview scheduling details.\n\nBest regards,\nGeospatial Works HR`,
      interviewed: `Dear ${app.fullName},\n\nWe would like to invite you for an interview for ${roleTitle} at Geospatial Works. Please reply with your availability for this week.\n\nBest regards,\nGeospatial Works HR`,
      hired: `Dear ${app.fullName},\n\nCongratulations! We are excited to extend an offer for ${roleTitle} at Geospatial Works.\n\nBest regards,\nGeospatial Works HR`,
      rejected: `Dear ${app.fullName},\n\nThank you for your interest in ${roleTitle} at Geospatial Works. After careful review, we will not be moving forward at this time.\n\nBest regards,\nGeospatial Works HR`,
    };
    return {
      subject: subjects[stage] || `Application Update — ${roleTitle} | Geospatial Works`,
      body: bodies[stage] || `Dear ${app.fullName},\n\nUpdate regarding ${roleTitle}.\n\nBest regards,\nGeospatial Works HR`,
    };
  };

  const sendStageEmail = (app: ApplicationItem, stage: string) => {
    if (!app.email) return;
    const { subject, body } = buildStageEmail(app, stage);
    setEmailTemplate(stage);
    setEmailSubject(subject);
    setEmailBody(body);
    setEmailCopied(false);
    setEmailModalApp(app);
  };

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
                    className="bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-sm transition flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Meta */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                          {job.department}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border capitalize ${
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
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition line-clamp-2">
                        {job.title}
                      </h3>

                      {/* Info Badges */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-slate-400" />
                          <span className="truncate max-w-[140px]">{job.location || 'Remote / HQ'}</span>
                        </span>
                        {job.type && <span>· {job.type}</span>}
                        {job.salaryRange && <span>· {job.salaryRange}</span>}
                      </div>

                      {/* Summary */}
                      <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                        {job.summary || 'No summary provided.'}
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
          {/* Clean Enterprise Recruiting Pipeline Overview */}
          {(() => {
            const total = applications.length;
            const newCount = applications.filter((a) => !a.status || a.status === 'new').length;
            const reviewingCount = applications.filter((a) => a.status === 'reviewing').length;
            const shortlistedCount = applications.filter((a) => a.status === 'shortlisted' || a.status === 'interviewed').length;
            const hiredCount = applications.filter((a) => a.status === 'hired').length;
            const activeOpenings = jobs.filter((j) => j.isActive !== false).length;

            const metrics = [
              { label: 'Total Applicants', value: total, sub: `${activeOpenings} active roles`, stage: 'All', dot: 'bg-slate-400' },
              { label: 'New / Unreviewed', value: newCount, sub: 'Awaiting triage', stage: 'new', dot: 'bg-indigo-600' },
              { label: 'In Review', value: reviewingCount, sub: 'Screening stage', stage: 'reviewing', dot: 'bg-slate-600' },
              { label: 'Shortlisted & Interview', value: shortlistedCount, sub: 'Active pipeline', stage: 'shortlisted', dot: 'bg-amber-500' },
              { label: 'Hired', value: hiredCount, sub: 'Offer accepted', stage: 'hired', dot: 'bg-emerald-600' },
            ];

            return (
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                  {metrics.map((m) => {
                    const isActive = selectedAppStatus === m.stage;
                    return (
                      <button
                        key={m.label}
                        type="button"
                        onClick={() => setSelectedAppStatus(m.stage)}
                        className={`px-3.5 py-2.5 text-left transition cursor-pointer hover:bg-slate-50/80 ${
                          isActive ? 'bg-slate-50 ring-1 ring-inset ring-indigo-500/30' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${m.dot}`} />
                            <span className="text-[11px] font-medium text-slate-500 truncate">{m.label}</span>
                          </div>
                          <span className="text-base font-bold tracking-tight text-slate-900">{m.value}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {total > 0 && (
                  <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-2 flex items-center gap-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 shrink-0">
                      Pipeline
                    </span>
                    <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden flex">
                      {newCount > 0 && <div style={{ width: `${(newCount / total) * 100}%` }} className="bg-indigo-600" />}
                      {reviewingCount > 0 && <div style={{ width: `${(reviewingCount / total) * 100}%` }} className="bg-slate-500" />}
                      {shortlistedCount > 0 && <div style={{ width: `${(shortlistedCount / total) * 100}%` }} className="bg-amber-500" />}
                      {hiredCount > 0 && <div style={{ width: `${(hiredCount / total) * 100}%` }} className="bg-emerald-600" />}
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 shrink-0">
                      {filteredApps.length} shown
                    </span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Applications Filter Toolbar */}
          <div className="bg-white px-3 py-2.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2">
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

              {/* Sort & Has CV Filters */}
              <select
                value={appSortBy}
                onChange={(e) => setAppSortBy(e.target.value as 'newest' | 'oldest' | 'name')}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name A–Z</option>
              </select>

              <label className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyWithCv}
                  onChange={(e) => setOnlyWithCv(e.target.checked)}
                  className="h-3.5 w-3.5 rounded accent-indigo-600"
                />
                <span>Has CV</span>
              </label>

              <label className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 cursor-pointer select-none" title="Open email draft when moving a candidate stage">
                <input
                  type="checkbox"
                  checked={autoMailOnMove}
                  onChange={(e) => setAutoMailOnMove(e.target.checked)}
                  className="h-3.5 w-3.5 rounded accent-indigo-600"
                />
                <span>Auto-mail</span>
              </label>
            </div>

            {/* View Mode Toggle + Export Actions */}
            <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto shrink-0">
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setAppViewMode('kanban')}
                  className={`px-2.5 py-1.5 rounded-md font-semibold transition cursor-pointer ${
                    appViewMode === 'kanban' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Kanban
                </button>
                <button
                  type="button"
                  onClick={() => setAppViewMode('table')}
                  className={`px-2.5 py-1.5 rounded-md font-semibold transition cursor-pointer ${
                    appViewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Table
                </button>
              </div>
              <button
                onClick={handleDownloadAllCVs}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer"
                title="Download Candidate CVs & Dossier"
              >
                <Download size={13} className="text-slate-500" />
                <span>Download CVs</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer"
                title="Export Applications to CSV"
              >
                <FileSpreadsheet size={13} className="text-emerald-600" />
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

          {/* Kanban Board OR Applications Table */}
          {appViewMode === 'kanban' ? (
            (() => {
              const stages = [
                { key: 'new', label: 'New', dot: 'bg-indigo-600', col: 'border-t-indigo-500 bg-indigo-50/30', badge: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
                { key: 'reviewing', label: 'Reviewing', dot: 'bg-slate-500', col: 'border-t-slate-400 bg-slate-50/60', badge: 'bg-slate-200/80 text-slate-800 border-slate-300' },
                { key: 'shortlisted', label: 'Shortlisted', dot: 'bg-amber-500', col: 'border-t-amber-500 bg-amber-50/30', badge: 'bg-amber-100 text-amber-800 border-amber-200' },
                { key: 'interviewed', label: 'Interviewed', dot: 'bg-blue-600', col: 'border-t-blue-500 bg-blue-50/30', badge: 'bg-blue-100 text-blue-800 border-blue-200' },
                { key: 'hired', label: 'Hired', dot: 'bg-emerald-600', col: 'border-t-emerald-500 bg-emerald-50/30', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
                { key: 'rejected', label: 'Rejected', dot: 'bg-rose-500', col: 'border-t-rose-500 bg-rose-50/30', badge: 'bg-rose-100 text-rose-800 border-rose-200' },
              ];
              const displayApps = [...filteredApps]
                .filter((a) => !onlyWithCv || Boolean(a.resumeUrl))
                .sort((a, b) => {
                  if (appSortBy === 'name') return a.fullName.localeCompare(b.fullName);
                  const ta = new Date(a.createdAt).getTime();
                  const tb = new Date(b.createdAt).getTime();
                  return appSortBy === 'oldest' ? ta - tb : tb - ta;
                });

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2.5 items-start">
                  {stages.map((st) => {
                    const colApps = displayApps.filter((a) => (a.status || 'new') === st.key);
                    return (
                      <div
                        key={st.key}
                        onDragOver={(e) => {
                          if (!draggedAppId) return;
                          e.preventDefault();
                        }}
                        onDrop={async (e) => {
                          e.preventDefault();
                          if (!draggedAppId) return;
                          const moved = applications.find((a) => a.id === draggedAppId);
                          setDraggedAppId(null);
                          if (!moved || (moved.status || 'new') === st.key) return;
                          await onUpdateAppStatus(moved.id, st.key as ApplicationItem['status']);
                          if (autoMailOnMove) sendStageEmail(moved, st.key);
                        }}
                        className={`min-w-0 rounded-xl border border-slate-200 border-t-4 p-2.5 min-h-[60vh] space-y-2.5 ${st.col}`}
                      >
                        <div className="flex items-center justify-between px-1 py-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`h-2 w-2 rounded-full ${st.dot}`} />
                            <span className="text-xs font-bold text-slate-900">{st.label}</span>
                          </div>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${st.badge}`}>
                            {colApps.length}
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {colApps.map((app) => (
                            <div
                              key={app.id}
                              draggable
                              onDragStart={() => setDraggedAppId(app.id)}
                              onDragEnd={() => setDraggedAppId(null)}
                              className="rounded-xl border border-slate-200/90 bg-white p-3 space-y-2 shadow-xs hover:border-indigo-300 hover:shadow-sm transition cursor-grab active:cursor-grabbing"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-900 leading-snug">{app.fullName}</p>
                                  <p className="text-[11px] font-medium text-indigo-700 leading-snug mt-0.5">
                                    {jobs.find((j) => j.id === app.jobPostId)?.title || 'General Role'}
                                  </p>
                                </div>
                                {app.resumeUrl && (
                                  <span className="rounded-md bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 shrink-0">
                                    CV
                                  </span>
                                )}
                              </div>

                              <div className="space-y-0.5 text-[11px] text-slate-600">
                                <p className="break-all">{app.email}</p>
                                {app.phone && <p className="text-slate-500">{app.phone}</p>}
                              </div>

                              <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-100">
                                <span className="text-[10px] text-slate-400">
                                  {new Date(app.createdAt).toLocaleDateString()}
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => sendStageEmail(app, st.key)}
                                    title="Send stage email"
                                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition cursor-pointer"
                                  >
                                    <Mail size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedCandidate(app)}
                                    className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-indigo-600 text-white text-[10px] font-medium whitespace-nowrap transition cursor-pointer"
                                  >
                                    View Details
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                          {colApps.length === 0 && (
                            <div className="rounded-lg border border-dashed border-slate-300/70 bg-white/50 py-6 text-center text-[11px] text-slate-400">
                              Drop here
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()
          ) : (
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
                                onClick={() => setSelectedCandidate(app)}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer"
                              >
                                Details
                              </button>
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
          )}
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
      {/* Candidate Detail Slide-Over Panel */}
      {selectedCandidate && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-[1px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedCandidate(null);
          }}
        >
          <div className="w-full max-w-lg bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="h-11 w-11 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {selectedCandidate.fullName
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((p) => p[0])
                    .join('')
                    .toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 truncate">{selectedCandidate.fullName}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${getStatusBadge(selectedCandidate.status)}`}>
                      {selectedCandidate.status || 'new'}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-indigo-700 truncate mt-0.5">
                    {jobs.find((j) => j.id === selectedCandidate.jobPostId)?.title || 'General Role'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {/* Contact & Metadata Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">Email</span>
                  <a href={`mailto:${selectedCandidate.email}`} className="mt-1 block font-semibold text-indigo-600 hover:underline break-all">
                    {selectedCandidate.email}
                  </a>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">Phone</span>
                  <span className="mt-1 block font-semibold text-slate-900">{selectedCandidate.phone || '—'}</span>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">Applied Date</span>
                  <span className="mt-1 block font-medium text-slate-800">
                    {new Date(selectedCandidate.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">Experience</span>
                  <span className="mt-1 block font-medium text-slate-800 truncate">
                    {selectedCandidate.currentTitle || selectedCandidate.yearsOfExperience || 'Not specified'}
                  </span>
                </div>
              </div>

              {/* Interactive Stage Selector */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5">
                <span className="text-[11px] font-semibold text-slate-700 block">Move Pipeline Stage</span>
                <div className="flex flex-wrap gap-1.5">
                  {(['new', 'reviewing', 'shortlisted', 'interviewed', 'hired', 'rejected'] as const).map((stage) => {
                    const active = (selectedCandidate.status || 'new') === stage;
                    return (
                      <button
                        key={stage}
                        type="button"
                        onClick={async () => {
                          await onUpdateAppStatus(selectedCandidate.id, stage);
                          setSelectedCandidate({ ...selectedCandidate, status: stage });
                          if (autoMailOnMove && stage !== 'new') sendStageEmail(selectedCandidate, stage);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold capitalize border transition cursor-pointer ${
                          active
                            ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
                        }`}
                      >
                        {stage}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cover Letter */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-700 block">Cover Letter &amp; Statement</span>
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedCandidate.coverLetter || 'No cover letter submitted.'}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-slate-200 px-6 py-3.5 bg-slate-50 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {selectedCandidate.resumeUrl ? (
                  <a
                    href={selectedCandidate.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 hover:bg-slate-100"
                  >
                    <Download size={13} />
                    <span>View CV</span>
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-400">No CV attached</span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    onDeleteApp(selectedCandidate.id);
                    setSelectedCandidate(null);
                  }}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  title="Delete application"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <button
                type="button"
                onClick={() => sendStageEmail(selectedCandidate, selectedCandidate.status || 'reviewing')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition cursor-pointer"
              >
                <Mail size={13} />
                <span>Send Stage Email</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Formatted Email Composer Modal */}
      {emailModalApp && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setEmailModalApp(null);
          }}
        >
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Compose Candidate Email</h3>
                <p className="text-xs text-slate-500">To: {emailModalApp.fullName} &lt;{emailModalApp.email}&gt;</p>
              </div>
              <button
                type="button"
                onClick={() => setEmailModalApp(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Template</label>
                <select
                  value={emailTemplate}
                  onChange={(e) => {
                    const tpl = e.target.value;
                    setEmailTemplate(tpl);
                    const next = buildStageEmail(emailModalApp, tpl);
                    setEmailSubject(next.subject);
                    setEmailBody(next.body);
                  }}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900"
                >
                  <option value="reviewing">Application Under Review</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interviewed">Interview Invitation</option>
                  <option value="hired">Offer &amp; Onboarding</option>
                  <option value="rejected">Polite Rejection</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Message</label>
                <textarea
                  rows={7}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 leading-relaxed"
                />
              </div>
            </div>

            <div className="border-t border-slate-200 px-5 py-3 bg-slate-50 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(`Subject: ${emailSubject}\n\n${emailBody}`);
                  setEmailCopied(true);
                  setTimeout(() => setEmailCopied(false), 2000);
                }}
                className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                {emailCopied ? 'Copied!' : 'Copy Email'}
              </button>
              <a
                href={`mailto:${emailModalApp.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`}
                onClick={() => setEmailModalApp(null)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
              >
                <Mail size={13} />
                <span>Open in Mail App</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
