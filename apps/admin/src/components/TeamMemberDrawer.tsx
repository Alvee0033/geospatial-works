'use client';

import React, { useState } from 'react';
import {
  X,
  Camera,
  Check,
  Plus,
  Trash2,
  GraduationCap,
  Award,
  Layers,
  Briefcase,
  FileText,
  User,
} from 'lucide-react';

export interface EducationEntry {
  degree: string;
  institution: string;
  year?: string;
}

export interface ExperienceEntry {
  role: string;
  company: string;
  period: string;
  highlights: string;
}

export interface StructuredCv {
  summary?: string;
  education?: EducationEntry[];
  registrations?: string[];
  software?: string[];
  experience?: ExperienceEntry[];
}

export interface TeamMemberItem {
  id?: string;
  slug?: string;
  name: string;
  role: string;
  category: string;
  credentials?: string;
  bio?: string;
  image?: string;
  email?: string;
  phone?: string;
  fullCvText?: string;
  structuredCv?: StructuredCv;
  sortOrder?: number;
  isActive?: boolean;
}

export const TEAM_CATEGORIES = [
  'Leadership & Structural',
  'Architecture & Planning',
  'CAD & Civil 3D',
  'Project Management & Civil',
  'Civil & Environmental',
  'Survey & Resettlement',
  'Geodesy & Survey',
  'GIS & Spatial Data Intelligence',
];

interface TeamMemberDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
  formName: string;
  setFormName: (v: string) => void;
  formRole: string;
  setFormRole: (v: string) => void;
  formCategory: string;
  setFormCategory: (v: string) => void;
  formCredentials: string;
  setFormCredentials: (v: string) => void;
  formBio: string;
  setFormBio: (v: string) => void;
  formImage: string;
  setFormImage: (v: string) => void;
  formEmail: string;
  setFormEmail: (v: string) => void;
  formPhone: string;
  setFormPhone: (v: string) => void;
  formSortOrder: number;
  setFormSortOrder: (v: number) => void;
  formIsActive: boolean;
  setFormIsActive: (v: boolean) => void;
  // CV Information State
  formCvSummary: string;
  setFormCvSummary: (v: string) => void;
  formEducation: EducationEntry[];
  setFormEducation: React.Dispatch<React.SetStateAction<EducationEntry[]>>;
  formRegistrations: string[];
  setFormRegistrations: React.Dispatch<React.SetStateAction<string[]>>;
  formSoftware: string[];
  setFormSoftware: React.Dispatch<React.SetStateAction<string[]>>;
  formExperience: ExperienceEntry[];
  setFormExperience: React.Dispatch<React.SetStateAction<ExperienceEntry[]>>;
  onOpenMediaPicker: () => void;
}

export function TeamMemberDrawer({
  isOpen,
  onClose,
  onSubmit,
  isEditing,
  formName,
  setFormName,
  formRole,
  setFormRole,
  formCategory,
  setFormCategory,
  formCredentials,
  setFormCredentials,
  formBio,
  setFormBio,
  formImage,
  setFormImage,
  formEmail,
  setFormEmail,
  formPhone,
  setFormPhone,
  formSortOrder,
  setFormSortOrder,
  formIsActive,
  setFormIsActive,
  formCvSummary,
  setFormCvSummary,
  formEducation,
  setFormEducation,
  formRegistrations,
  setFormRegistrations,
  formSoftware,
  setFormSoftware,
  formExperience,
  setFormExperience,
  onOpenMediaPicker,
}: TeamMemberDrawerProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'cv'>('basic');
  const [newRegInput, setNewRegInput] = useState('');
  const [newSoftInput, setNewSoftInput] = useState('');

  if (!isOpen) return null;

  // Education Helpers
  const addEducation = () => {
    setFormEducation((prev) => [...prev, { degree: '', institution: '', year: '' }]);
  };
  const updateEducation = (index: number, field: keyof EducationEntry, val: string) => {
    setFormEducation((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };
  const removeEducation = (index: number) => {
    setFormEducation((prev) => prev.filter((_, i) => i !== index));
  };

  // Experience Helpers
  const addExperience = () => {
    setFormExperience((prev) => [
      ...prev,
      { role: '', company: '', period: '', highlights: '' },
    ]);
  };
  const updateExperience = (index: number, field: keyof ExperienceEntry, val: string) => {
    setFormExperience((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };
  const removeExperience = (index: number) => {
    setFormExperience((prev) => prev.filter((_, i) => i !== index));
  };

  // Registrations & Software tag helpers
  const handleAddRegistration = () => {
    if (!newRegInput.trim()) return;
    setFormRegistrations((prev) => [...prev, newRegInput.trim()]);
    setNewRegInput('');
  };
  const handleRemoveRegistration = (index: number) => {
    setFormRegistrations((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSoftware = () => {
    if (!newSoftInput.trim()) return;
    setFormSoftware((prev) => [...prev, newSoftInput.trim()]);
    setNewSoftInput('');
  };
  const handleRemoveSoftware = (index: number) => {
    setFormSoftware((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Slide-over Right Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div className="w-screen max-w-3xl lg:max-w-4xl bg-white shadow-2xl flex flex-col h-full border-l border-slate-200">
          {/* Sticky Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/95 backdrop-blur-md sticky top-0 z-10">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {isEditing ? 'Team Member Profile' : 'New Member'}
                </span>
                {formIsActive ? (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Live on Website
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-600">
                    Draft / Inactive
                  </span>
                )}
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                {isEditing ? `Edit: ${formName || 'Engineer Profile'}` : 'Add New Team Member & CV'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
              title="Close drawer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Sub Navigation Bar: Basic Info vs Structured CV */}
          <div className="flex items-center border-b border-slate-200 px-6 bg-slate-50/70 gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 transition ${
                activeTab === 'basic'
                  ? 'border-indigo-600 text-indigo-600 bg-white shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <User size={14} />
              <span>1. Basic Profile & Credentials</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cv')}
              className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 transition ${
                activeTab === 'cv'
                  ? 'border-indigo-600 text-indigo-600 bg-white shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText size={14} />
              <span>2. Full Structured CV & Projects</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-indigo-100 text-indigo-700 font-mono">
                {formEducation.length + formExperience.length + formSoftware.length} items
              </span>
            </button>
          </div>

          {/* Form Content Body (Scrollable) */}
          <form id="team-form" onSubmit={onSubmit} className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
            {activeTab === 'basic' ? (
              <div className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Full Name with Title &amp; Post-Nominals *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Engr. Mohammad Delwar Hossain, FIEB"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none transition"
                  />
                </div>

                {/* Role & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Designation / Role *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chief Structural Engineer & Technical Advisor"
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Engineering Discipline / Category *
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none transition cursor-pointer"
                    >
                      {TEAM_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Credentials */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Credentials &amp; Registrations (Card Pill Badge)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. B.Sc in Civil Engineering (BUET, 1997) • Fellow IEB (F-8790) • RAJUK Enlisted"
                    value={formCredentials}
                    onChange={(e) => setFormCredentials(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none transition"
                  />
                </div>

                {/* Short Bio */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Public Introduction &amp; Bio Summary
                    </label>
                    <span className="text-[11px] text-slate-400">Card excerpt (3 lines)</span>
                  </div>
                  <textarea
                    rows={4}
                    placeholder="28+ years of veteran engineering excellence. Directed structural analysis, design, and construction documentation for MRT Line 1, MRT Line 5 North..."
                    value={formBio}
                    onChange={(e) => setFormBio(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl p-3.5 text-xs text-slate-800 focus:outline-none transition leading-relaxed"
                  />
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Direct Email (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. engineer@geospatialworks.com.bd"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-mono text-slate-700 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Direct Phone (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +880 1404-XXXXXX"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-mono text-slate-700 focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Portrait Image */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Profile Portrait Image URL (4:5 Aspect Ratio)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      placeholder="/team-photos/delwar_hossain.jpg"
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
                  {formImage && (
                    <div className="mt-3 relative w-24 h-30 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs">
                      <img src={formImage} alt="" className="w-full h-full object-cover object-top" />
                    </div>
                  )}
                </div>

                {/* Sort Order */}
                <div className="w-48">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Display Order Priority
                  </label>
                  <input
                    type="number"
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none transition"
                  />
                </div>
              </div>
            ) : (
              /* STRUCTURED CV TAB */
              <div className="space-y-7">
                {/* 1. CV Professional Summary */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-indigo-600" />
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      CV Executive Summary &amp; Specialization
                    </label>
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Comprehensive overview of credentials, core competencies, international appointments, and major megaproject achievements..."
                    value={formCvSummary}
                    onChange={(e) => setFormCvSummary(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-lg p-3 text-xs text-slate-800 focus:outline-none transition leading-relaxed"
                  />
                </div>

                {/* 2. Education Section */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GraduationCap size={16} className="text-rose-600" />
                      <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Education &amp; Academic Qualifications
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={addEducation}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-indigo-600 flex items-center gap-1 transition"
                    >
                      <Plus size={13} /> Add Degree
                    </button>
                  </div>

                  {formEducation.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">
                      No degrees added yet. Click &quot;Add Degree&quot; to specify university qualifications.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {formEducation.map((edu, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-white border border-slate-200 rounded-lg grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                        >
                          <div className="sm:col-span-5">
                            <input
                              type="text"
                              placeholder="Degree (e.g. B.Sc in Civil Engineering)"
                              value={edu.degree}
                              onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-800"
                            />
                          </div>
                          <div className="sm:col-span-5">
                            <input
                              type="text"
                              placeholder="Institution (e.g. BUET, Dhaka)"
                              value={edu.institution}
                              onChange={(e) => updateEducation(idx, 'institution', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-800"
                            />
                          </div>
                          <div className="sm:col-span-1">
                            <input
                              type="text"
                              placeholder="Year"
                              value={edu.year || ''}
                              onChange={(e) => updateEducation(idx, 'year', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 text-xs text-slate-800 font-mono"
                            />
                          </div>
                          <div className="sm:col-span-1 flex justify-end">
                            <button
                              type="button"
                              onClick={() => removeEducation(idx)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                              title="Remove degree"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Professional Registrations */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center gap-2">
                    <Award size={16} className="text-blue-600" />
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Professional Memberships &amp; Licensures
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Fellow IEB (F-8790) or RAJUK Enlisted Professional"
                      value={newRegInput}
                      onChange={(e) => setNewRegInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddRegistration();
                        }
                      }}
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={handleAddRegistration}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {formRegistrations.map((reg, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-md text-xs font-medium shadow-2xs"
                      >
                        <span>{reg}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveRegistration(idx)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 4. Software & Tools */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center gap-2">
                    <Layers size={16} className="text-amber-600" />
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Technical Toolchain &amp; Engineering Software
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. AutoCAD Civil 3D, ETABS, MIDAS Civil, ArcGIS Pro"
                      value={newSoftInput}
                      onChange={(e) => setNewSoftInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSoftware();
                        }
                      }}
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={handleAddSoftware}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {formSoftware.map((sw, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-md text-xs font-mono font-medium shadow-2xs"
                      >
                        <span>{sw}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSoftware(idx)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 5. Chronological Experience & Projects */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase size={16} className="text-emerald-600" />
                      <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Work Experience &amp; Major Project Deliverables
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={addExperience}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-indigo-600 flex items-center gap-1 transition"
                    >
                      <Plus size={13} /> Add Position
                    </button>
                  </div>

                  {formExperience.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">
                      No career appointments listed yet. Click &quot;Add Position&quot; to detail past megaprojects.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {formExperience.map((exp, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 bg-white border border-slate-200 rounded-lg space-y-2 relative"
                        >
                          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                              Position #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeExperience(idx)}
                              className="text-slate-400 hover:text-rose-600 transition p-1"
                              title="Remove position"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Role / Title (e.g. Lead Structural Designer)"
                              value={exp.role}
                              onChange={(e) => updateExperience(idx, 'role', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-800"
                            />
                            <input
                              type="text"
                              placeholder="Period (e.g. October 2024 – Present)"
                              value={exp.period}
                              onChange={(e) => updateExperience(idx, 'period', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-800"
                            />
                          </div>

                          <input
                            type="text"
                            placeholder="Company / Client / JV (e.g. Sodev Consult / OC Global JV)"
                            value={exp.company}
                            onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-800"
                          />

                          <textarea
                            rows={3}
                            placeholder="Detailed highlights: MRT Line viaduct analysis, railway station architectural design, CAD alignment profiles..."
                            value={exp.highlights}
                            onChange={(e) => updateExperience(idx, 'highlights', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-xs text-slate-800 leading-relaxed"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
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
              <span>Active (Visible on public leadership page)</span>
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
                form="team-form"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm shadow-indigo-200 flex items-center gap-1.5"
              >
                <Check size={14} />
                <span>{isEditing ? 'Save Member & CV' : 'Add Team Member'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
