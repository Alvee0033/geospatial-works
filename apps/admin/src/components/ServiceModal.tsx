'use client';

import React from 'react';
import { X, Camera, Check } from 'lucide-react';

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  features: string[];
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
  details?: { lead?: string; equipment?: string[]; standards?: string[]; benefits?: string[] };
  createdAt?: string;
  updatedAt?: string;
}

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
  formTitle: string;
  setFormTitle: (v: string) => void;
  formSlug: string;
  setFormSlug: (v: string) => void;
  formCategory: string;
  setFormCategory: (v: string) => void;
  formDescription: string;
  setFormDescription: (v: string) => void;
  formFeatures: string;
  setFormFeatures: (v: string) => void;
  formLead: string;
  setFormLead: (v: string) => void;
  formEquipment: string;
  setFormEquipment: (v: string) => void;
  formStandards: string;
  setFormStandards: (v: string) => void;
  formBenefits: string;
  setFormBenefits: (v: string) => void;
  formImageUrl: string;
  setFormImageUrl: (v: string) => void;
  formSortOrder: number;
  setFormSortOrder: (v: number) => void;
  formIsActive: boolean;
  setFormIsActive: (v: boolean) => void;
  onOpenMediaPicker: () => void;
}

export function ServiceModal({
  isOpen,
  onClose,
  onSubmit,
  isEditing,
  formTitle,
  setFormTitle,
  formSlug,
  setFormSlug,
  formCategory,
  setFormCategory,
  formDescription,
  setFormDescription,
  formFeatures,
  setFormFeatures,
  formLead,
  setFormLead,
  formEquipment,
  setFormEquipment,
  formStandards,
  setFormStandards,
  formBenefits,
  setFormBenefits,
  formImageUrl,
  setFormImageUrl,
  formSortOrder,
  setFormSortOrder,
  formIsActive,
  setFormIsActive,
  onOpenMediaPicker,
}: ServiceModalProps) {
  if (!isOpen) return null;

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
                  {isEditing ? 'Discipline Editor' : 'New Discipline'}
                </span>
                {formIsActive ? (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Live on Website
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-600">
                    Inactive
                  </span>
                )}
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                {isEditing ? 'Edit Service Discipline' : 'Add New Service Discipline'}
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
          <form id="service-form" onSubmit={onSubmit} className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
            {/* Title */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Service Discipline Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Airborne UAV (Drone) Survey & LiDAR"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none transition"
              />
            </div>

            {/* Category Group & Slug in 2-column grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Category Group *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SURVEY & GEODATA or SPATIAL INTELLIGENCE"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Unique Slug (Optional)
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

            {/* Big Service Narrative */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Service Narrative & Detailed Scope
                </label>
                <span className="text-[11px] text-slate-400">Public Overview Statement</span>
              </div>
              <textarea
                rows={7}
                placeholder="High-level engineering overview of surveying methodologies, equipment capabilities, SOB/BIWTA geodetic accuracy tolerances, quality assurance protocols, and primary industry applications across Bangladesh..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl p-4 text-xs text-slate-800 focus:outline-none transition leading-relaxed min-h-[160px]"
              />
            </div>

            {/* Big Capabilities / Features */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Key Capabilities / Deliverables (One per line)
                </label>
                <span className="text-[11px] text-slate-400">Bulleted specifications</span>
              </div>
              <textarea
                rows={6}
                placeholder="High-Resolution Orthomosaics&#10;Digital Surface Models (DSM) & Digital Terrain Models (DTM)&#10;Point Cloud Classification (ASPRS Standard)&#10;Sub-Centimeter RTK GNSS Ground Control"
                value={formFeatures}
                onChange={(e) => setFormFeatures(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl p-4 text-xs font-mono text-slate-800 focus:outline-none transition leading-relaxed min-h-[140px]"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {([
                ['Short introduction', formLead, setFormLead],
                ['Equipment (one per line)', formEquipment, setFormEquipment],
                ['Standards (one per line)', formStandards, setFormStandards],
                ['Benefits (one per line)', formBenefits, setFormBenefits],
              ] as const).map(([label, value, onChange]) => <label key={label} className="text-xs font-bold text-slate-700">{label}<textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-normal text-slate-800" /></label>)}
            </div>

            {/* Service Cover Image */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Service Visual Banner URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="/geospatial-river-hero.webp"
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
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <span>Active Discipline (Visible in public navigation)</span>
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
                form="service-form"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm shadow-indigo-200 flex items-center gap-1.5"
              >
                <Check size={14} />
                <span>{isEditing ? 'Save Changes' : 'Create Discipline'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
