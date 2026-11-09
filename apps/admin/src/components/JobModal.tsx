'use client';

import React, { useState } from 'react';
import {
  X,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  Layers,
  Sparkles,
  Save,
  CheckCircle2,
  ListPlus,
  FileText,
  Building,
} from 'lucide-react';

export interface JobPostItem {
  id: string;
  slug: string;
  title: string;
  department: string;
  location: string;
  type: string;
  summary: string;
  description?: string;
  qualifications?: string[];
  responsibilities?: string[];
  experienceLevel?: string;
  salaryRange?: string;
  deadline?: string;
  status: 'published' | 'draft' | 'closed';
  isActive: boolean;
  sortOrder: number;
  applicationCount?: number;
  createdAt?: string;
}

export const CAREER_DEPARTMENTS = [
  'Geodesy & Ground Survey',
  'Aerial Survey & Drone Fleet',
  'Spatial Intelligence & Digital Twins',
  'Marine & Water Resources',
  'Underground Infrastructure',
  'Civil & Structural Engineering',
  'Business Development & Operations',
];

interface JobDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<JobPostItem>) => Promise<void>;
  initialData?: JobPostItem | null;
}

export function JobDrawer({ isOpen, onClose, onSave, initialData }: JobDrawerProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [department, setDepartment] = useState(initialData?.department || CAREER_DEPARTMENTS[0]);
  const [location, setLocation] = useState(initialData?.location || 'Dhaka HQ & Field Deployments');
  const [type, setType] = useState(initialData?.type || 'Full-time / Permanent');
  const [experienceLevel, setExperienceLevel] = useState(initialData?.experienceLevel || '3-5 Years');
  const [salaryRange, setSalaryRange] = useState(initialData?.salaryRange || 'Negotiable');
  const [deadline, setDeadline] = useState(initialData?.deadline || '');
  const [summary, setSummary] = useState(initialData?.summary || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [qualificationsText, setQualificationsText] = useState(
    initialData?.qualifications ? initialData.qualifications.join('\n') : ''
  );
  const [responsibilitiesText, setResponsibilitiesText] = useState(
    initialData?.responsibilities ? initialData.responsibilities.join('\n') : ''
  );
  const [status, setStatus] = useState<'published' | 'draft' | 'closed'>(
    initialData?.status || 'published'
  );
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [sortOrder, setSortOrder] = useState(initialData?.sortOrder ?? 0);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setSlug(initialData.slug || '');
      setDepartment(initialData.department || CAREER_DEPARTMENTS[0]);
      setLocation(initialData.location || 'Dhaka HQ & Field Deployments');
      setType(initialData.type || 'Full-time / Permanent');
      setExperienceLevel(initialData.experienceLevel || '3-5 Years');
      setSalaryRange(initialData.salaryRange || 'Negotiable');
      setDeadline(initialData.deadline || '');
      setSummary(initialData.summary || '');
      setDescription(initialData.description || '');
      setQualificationsText(
        Array.isArray(initialData.qualifications)
          ? initialData.qualifications.join('\n')
          : typeof initialData.qualifications === 'string'
          ? initialData.qualifications
          : ''
      );
      setResponsibilitiesText(
        Array.isArray(initialData.responsibilities)
          ? initialData.responsibilities.join('\n')
          : typeof initialData.responsibilities === 'string'
          ? initialData.responsibilities
          : ''
      );
      setStatus(initialData.status || 'published');
      setIsActive(initialData.isActive ?? true);
      setSortOrder(initialData.sortOrder ?? 0);
    } else {
      setTitle('');
      setSlug('');
      setDepartment(CAREER_DEPARTMENTS[0]);
      setLocation('Dhaka HQ & Field Deployments');
      setType('Full-time / Permanent');
      setExperienceLevel('3-5 Years');
      setSalaryRange('Negotiable');
      setDeadline('');
      setSummary('');
      setDescription('');
      setQualificationsText('');
      setResponsibilitiesText('');
      setStatus('published');
      setIsActive(true);
      setSortOrder(0);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !department.trim()) return;

    setSubmitting(true);
    try {
      const qualifications = qualificationsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const responsibilities = responsibilitiesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      await onSave({
        title: title.trim(),
        slug: slug.trim() || undefined,
        department,
        location: location.trim(),
        type,
        experienceLevel: experienceLevel.trim(),
        salaryRange: salaryRange.trim(),
        deadline: deadline.trim() || undefined,
        summary: summary.trim(),
        description: description.trim(),
        qualifications,
        responsibilities,
        status,
        isActive,
        sortOrder: Number(sortOrder) || 0,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-red-500/10 text-[#F4382D] border border-red-200/50 flex items-center justify-center font-bold shadow-xs">
              <Briefcase size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">
                  {initialData ? 'Edit Career Opening' : 'Post New Career Opening'}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-[#F4382D] border border-red-200/60 uppercase">
                  {status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure role specifications, department requirements, and candidate scope
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Section 1: Role Overview */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                1. Basic Role Information
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                Job Title <span className="text-[#F4382D]">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Lead Geodetic Surveyor (RTK & Total Station)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#F4382D] focus:ring-2 focus:ring-red-100 outline-none text-slate-900 font-semibold text-sm transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#F4382D] focus:ring-2 focus:ring-red-100 outline-none text-slate-800 bg-white font-medium"
                >
                  {CAREER_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Employment Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#F4382D] focus:ring-2 focus:ring-red-100 outline-none text-slate-800 bg-white font-medium"
                >
                  <option value="Full-time / Permanent">Full-time / Permanent</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Dhaka HQ & Field Sites"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#F4382D] focus:ring-2 focus:ring-red-100 outline-none text-slate-800 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Experience</label>
                <input
                  type="text"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  placeholder="e.g. 3-5 Years"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#F4382D] focus:ring-2 focus:ring-red-100 outline-none text-slate-800 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Salary Range</label>
                <input
                  type="text"
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                  placeholder="e.g. Negotiable"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#F4382D] focus:ring-2 focus:ring-red-100 outline-none text-slate-800 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Narrative & Descriptions */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                2. Role Summary &amp; Full Description
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center justify-between">
                <span>Card Summary (Concise overview) <span className="text-[#F4382D]">*</span></span>
                <span className="text-slate-400 font-normal">{summary.length} chars</span>
              </label>
              <textarea
                required
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Brief 1-2 sentence hook explaining the primary purpose and scope of the role..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#F4382D] focus:ring-2 focus:ring-red-100 outline-none text-slate-800 leading-relaxed resize-none font-normal"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center justify-between">
                <span>Full Role Description &amp; Scope of Works</span>
                <span className="text-slate-400 font-normal">Rich context</span>
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Elaborate on the project environments, client coordination (LGED, BADC, DNCC), survey instrument operations, and day-to-day deliverables..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#F4382D] focus:ring-2 focus:ring-red-100 outline-none text-slate-800 leading-relaxed font-normal"
              />
            </div>
          </div>

          {/* Section 3: Qualifications & Duties */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                3. Qualifications &amp; Core Responsibilities
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span>Requirements &amp; Skills</span>
                  <span className="text-slate-400 font-normal">1 item / line</span>
                </label>
                <textarea
                  rows={4}
                  value={qualificationsText}
                  onChange={(e) => setQualificationsText(e.target.value)}
                  placeholder="B.Sc. in Surveying or Geomatics&#10;5+ years GNSS RTK field experience&#10;Proficiency in Civil 3D &amp; PostGIS"
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#F4382D] outline-none text-slate-800 font-mono text-[11px] leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span>Responsibilities</span>
                  <span className="text-slate-400 font-normal">1 item / line</span>
                </label>
                <textarea
                  rows={4}
                  value={responsibilitiesText}
                  onChange={(e) => setResponsibilitiesText(e.target.value)}
                  placeholder="Establish benchmark control stations&#10;Process raw baseline data&#10;Coordinate multi-crew field deployments"
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#F4382D] outline-none text-slate-800 font-mono text-[11px] leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Publishing Controls */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-[#F4382D] focus:ring-[#F4382D] w-4 h-4"
                />
                <span>Active Status</span>
              </label>

              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600">Stage:</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-slate-800 text-xs shadow-xs"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft (Internal)</option>
                  <option value="closed">Closed / Archived</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-600 font-bold">Sort Order:</span>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-16 px-2 py-1 rounded-lg border border-slate-200 bg-white text-center font-bold text-slate-800"
              />
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-[#F4382D] hover:bg-[#d92c22] text-white font-bold shadow-md shadow-red-500/20 transition flex items-center gap-2 cursor-pointer"
            >
              <Save size={15} />
              <span>{submitting ? 'Saving Opening...' : initialData ? 'Update Position' : 'Publish Job Opening'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
