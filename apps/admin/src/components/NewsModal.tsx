'use client';

import React from 'react';
import { X, Camera, Check } from 'lucide-react';
import { MediaAssetField } from './MediaAssetField';

export interface ArticleItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  publishDate?: string;
  summary: string;
  content?: string;
  author?: string;
  imageUrl?: string;
  isPublished: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export const ARTICLE_CATEGORIES = [
  'Technical Bulletin',
  'Case Study',
  'Press Release',
  'Engineering News',
  'Corporate Update',
];

interface NewsModalProps {
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
  formPublishDate: string;
  setFormPublishDate: (v: string) => void;
  formAuthor: string;
  setFormAuthor: (v: string) => void;
  formSummary: string;
  setFormSummary: (v: string) => void;
  formContent: string;
  setFormContent: (v: string) => void;
  formImageUrl: string;
  setFormImageUrl: (v: string) => void;
  formIsPublished: boolean;
  setFormIsPublished: (v: boolean) => void;
  onOpenMediaPicker: () => void;
}

export function NewsModal({
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
  formPublishDate,
  setFormPublishDate,
  formAuthor,
  setFormAuthor,
  formSummary,
  setFormSummary,
  formContent,
  setFormContent,
  formImageUrl,
  setFormImageUrl,
  formIsPublished,
  setFormIsPublished,
  onOpenMediaPicker,
}: NewsModalProps) {
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
                  {isEditing ? 'Article Editor' : 'New Article'}
                </span>
                {formIsPublished ? (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Live Published
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-600">
                    Draft Only
                  </span>
                )}
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                {isEditing ? 'Edit News Article / Bulletin' : 'Publish Technical Bulletin'}
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
          <form id="news-form" onSubmit={onSubmit} className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
            {/* Headline */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Article Headline *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. River Delta Resilience: Advanced Bathymetric Sounding and Riverbed Morphology Modeling"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none transition"
              />
            </div>

            {/* Category & Slug in 2-column grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Category *
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none transition cursor-pointer"
                >
                  {ARTICLE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Custom URL Slug (Optional)
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

            {/* Author & Date in 2-column grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Author / Division
                </label>
                <input
                  type="text"
                  placeholder="e.g. Geospatial Works Hydrography Team"
                  value={formAuthor}
                  onChange={(e) => setFormAuthor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Publication Date
                </label>
                <input
                  type="date"
                  value={formPublishDate}
                  onChange={(e) => setFormPublishDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Executive Summary / Excerpt */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Executive Summary / Excerpt *
                </label>
                <span className="text-[11px] text-slate-400">Card Preview & Lead Text</span>
              </div>
              <textarea
                rows={4}
                required
                placeholder="High-level executive briefing summarizing the technical methodology, geodetic baseline parameters, or regional milestone announcement..."
                value={formSummary}
                onChange={(e) => setFormSummary(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl p-4 text-xs text-slate-800 focus:outline-none transition leading-relaxed min-h-[100px]"
              />
            </div>

            {/* Big Article Body */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Full Article Body / Content (Markdown or Text)
                </label>
                <span className="text-[11px] text-slate-400">Supports headers, lists, code, and links</span>
              </div>
              <textarea
                rows={12}
                placeholder="## Background & Engineering Challenge&#10;&#10;Explain the full engineering background, project scope, field conditions, sensors and instrumentation used (e.g. Trimble R12i GNSS, multibeam sonar, DJI Matrice 300 RTK), data processing pipelines, and actionable conclusions..."
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl p-4 text-xs font-mono text-slate-800 focus:outline-none transition leading-relaxed min-h-[260px]"
              />
            </div>

            <MediaAssetField label="Article image" value={formImageUrl} onChoose={onOpenMediaPicker} onRemove={() => setFormImageUrl('')} />
          </form>

          {/* Sticky Bottom Action Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/90 backdrop-blur-md flex items-center justify-between sticky bottom-0 z-10">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700 select-none">
              <input
                type="checkbox"
                checked={formIsPublished}
                onChange={(e) => setFormIsPublished(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <span>Published on Website (Public Insights)</span>
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
                form="news-form"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm shadow-indigo-200 flex items-center gap-1.5"
              >
                <Check size={14} />
                <span>{isEditing ? 'Save Changes' : 'Publish Article'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
