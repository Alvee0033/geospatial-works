'use client';

import React from 'react';
import { X, Camera, Check, ExternalLink } from 'lucide-react';
import { ServiceItem } from './ServiceModal';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
  services: ServiceItem[];
  formTitle: string;
  setFormTitle: (v: string) => void;
  formSlug: string;
  setFormSlug: (v: string) => void;
  formClient: string;
  setFormClient: (v: string) => void;
  formCategory: string;
  setFormCategory: (v: string) => void;
  formLocation: string;
  setFormLocation: (v: string) => void;
  formDescription: string;
  setFormDescription: (v: string) => void;
  formDeliverables: string;
  setFormDeliverables: (v: string) => void;
  formImageUrl: string;
  setFormImageUrl: (v: string) => void;
  formIsMilestone: boolean;
  setFormIsMilestone: (v: boolean) => void;
  onOpenMediaPicker: () => void;
}

export function ProjectModal({
  isOpen,
  onClose,
  onSubmit,
  isEditing,
  services,
  formTitle,
  setFormTitle,
  formSlug,
  setFormSlug,
  formClient,
  setFormClient,
  formCategory,
  setFormCategory,
  formLocation,
  setFormLocation,
  formDescription,
  setFormDescription,
  formDeliverables,
  setFormDeliverables,
  formImageUrl,
  setFormImageUrl,
  formIsMilestone,
  setFormIsMilestone,
  onOpenMediaPicker,
}: ProjectModalProps) {
  if (!isOpen) return null;

  // Build categories list from live services
  const defaultServices = [
    'Topographic & Land Survey',
    'Airborne UAV (Drone) Survey',
    'Hydrographic & Bathymetric Survey',
    'Feasibility, BOQ & Civil Design',
    'Geographic Information Systems (GIS)',
    'Environmental & Coastal Assessment',
  ];

  const serviceOptions =
    services.length > 0 ? services.map((s) => s.title) : defaultServices;

  // Include current formCategory if it's custom and not in list
  if (formCategory && !serviceOptions.includes(formCategory)) {
    serviceOptions.push(formCategory);
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      />

      {/* Slide-over Right Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-2xl lg:max-w-3xl bg-white shadow-2xl flex flex-col h-full border-l border-slate-200 animate-in slide-in-from-right duration-300">
          {/* Sticky Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white/95 backdrop-blur-md sticky top-0 z-10">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {isEditing ? 'Project Editor' : 'New Project'}
                </span>
                {formIsMilestone && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                    National Landmark
                  </span>
                )}
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                {isEditing ? 'Edit Project Landmark' : 'Create Infrastructure Project'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
              title="Close drawer (Esc)"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Content Body (Scrollable) */}
          <form id="project-form" onSubmit={onSubmit} className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
            {/* Title */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Project Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Bangabandhu Tunnel Geodetic Monitoring & Sub-river Alignment"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none transition"
              />
            </div>

            {/* Client & Location in 2-column grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Client / Authority *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bangladesh Railway / DTCA"
                  value={formClient}
                  onChange={(e) => setFormClient(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Project Location / Division
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chattogram & Cox's Bazar"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Service & Slug in 2-column grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Assigned Service Discipline *
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none transition cursor-pointer"
                >
                  {serviceOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Custom Slug (Optional)
                </label>
                <input
                  type="text"
                  placeholder="auto-generated from title"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-mono text-slate-700 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Big Scope Narrative / Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Scope Narrative & Detailed Description
                </label>
                <span className="text-[11px] text-slate-400">Expanded Engineering Specification</span>
              </div>
              <textarea
                rows={7}
                placeholder="Comprehensive technical breakdown: Geodetic datum reference (BGD2000 / WGS84), horizontal & vertical control network baseline, surveying methodology, acoustic bathymetric sounding equipment, LiDAR point-cloud classification, and client specifications..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl p-4 text-xs text-slate-800 focus:outline-none transition leading-relaxed min-h-[170px]"
              />
            </div>

            {/* Deliverables */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Key Technical Deliverables
              </label>
              <input
                type="text"
                placeholder="e.g. RTK Control Network, DTM/DSM, SOB-standard Bathymetry, Civil Alignment Sheets"
                value={formDeliverables}
                onChange={(e) => setFormDeliverables(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none transition"
              />
            </div>

            {/* Featured Image Picker */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Project Cover & Hero Image
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="/inner/bridge-aerial.webp"
                  className="flex-1 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-mono text-slate-700 focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={onOpenMediaPicker}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                >
                  <Camera size={14} /> Browse
                </button>
              </div>
              {formImageUrl && (
                <div className="mt-3 relative w-48 h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs group">
                  <img src={formImageUrl} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-1 rounded-md">
                      Preview
                    </span>
                  </div>
                </div>
              )}
            </div>
          </form>

          {/* Sticky Bottom Action Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/90 backdrop-blur-md flex items-center justify-between sticky bottom-0 z-10">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700 select-none">
              <input
                type="checkbox"
                checked={formIsMilestone}
                onChange={(e) => setFormIsMilestone(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <span>Feature in National Landmarks Carousel</span>
            </label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-200/60 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="project-form"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm shadow-indigo-200 flex items-center gap-1.5"
              >
                <Check size={14} />
                <span>{isEditing ? 'Save Changes' : 'Create Project'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
