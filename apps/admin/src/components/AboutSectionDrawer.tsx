'use client';

import React from 'react';
import { X, Save, RefreshCw, Layers, Edit3, Image, FileText } from 'lucide-react';

export interface PageSectionItem {
  id?: string;
  pageKey: string;
  sectionKey: string;
  title: string;
  subtitle?: string;
  content: Record<string, any>;
  isActive?: boolean;
}

interface AboutSectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  section: PageSectionItem | null;
  formTitle: string;
  setFormTitle: (val: string) => void;
  formSubtitle: string;
  setFormSubtitle: (val: string) => void;
  formDescription: string;
  setFormDescription: (val: string) => void;
  formVision: string;
  setFormVision: (val: string) => void;
  formMission: string;
  setFormMission: (val: string) => void;
  formExtraField1?: string;
  setFormExtraField1?: (val: string) => void;
  formExtraField2?: string;
  setFormExtraField2?: (val: string) => void;
  extraField1Label?: string;
  extraField2Label?: string;
  isSaving: boolean;
}

export function AboutSectionDrawer({
  isOpen,
  onClose,
  onSubmit,
  section,
  formTitle,
  setFormTitle,
  formSubtitle,
  setFormSubtitle,
  formDescription,
  setFormDescription,
  formVision,
  setFormVision,
  formMission,
  setFormMission,
  formExtraField1,
  setFormExtraField1,
  formExtraField2,
  setFormExtraField2,
  extraField1Label,
  extraField2Label,
  isSaving,
}: AboutSectionDrawerProps) {
  if (!isOpen || !section) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div
        className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              <Layers size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">Edit Section</h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {section.pageKey} / {section.sectionKey}
                </span>
              </div>
              <p className="text-xs text-slate-400">Manage headline and copy text</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Form Body */}
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Section Title *
            </label>
            <input
              type="text"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="e.g. Built on precision. Driven by possibility."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Subtitle / Kicker
            </label>
            <input
              type="text"
              value={formSubtitle}
              onChange={(e) => setFormSubtitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="e.g. 01 / IDENTITY & CORPORATE PROFILE"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Description / Introductory Body
            </label>
            <textarea
              rows={4}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Corporate Vision
              </label>
              <textarea
                rows={3}
                value={formVision}
                onChange={(e) => setFormVision(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Corporate Mission
              </label>
              <textarea
                rows={3}
                value={formMission}
                onChange={(e) => setFormMission(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {extraField1Label && setFormExtraField1 && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {extraField1Label}
              </label>
              <input
                type="text"
                value={formExtraField1 || ''}
                onChange={(e) => setFormExtraField1(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          )}

          {extraField2Label && setFormExtraField2 && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {extraField2Label}
              </label>
              <input
                type="text"
                value={formExtraField2 || ''}
                onChange={(e) => setFormExtraField2(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          )}
        </form>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition flex items-center gap-2 shadow-sm shadow-indigo-200 disabled:opacity-50"
          >
            {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{isSaving ? 'Saving...' : 'Save Section'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
