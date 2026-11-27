'use client';

import React, { useState } from 'react';
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
  meta?: { readTime?: string; authorRole?: string; videoUrl?: string; [key: string]: string | undefined };
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
  formVideoUrl: string;
  setFormVideoUrl: (v: string) => void;
  formReadTime: string;
  setFormReadTime: (v: string) => void;
  formAuthorRole: string;
  setFormAuthorRole: (v: string) => void;
  formIsPublished: boolean;
  setFormIsPublished: (v: boolean) => void;
  formSortOrder: number;
  setFormSortOrder: (v: number) => void;
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
  formVideoUrl,
  setFormVideoUrl,
  formReadTime,
  setFormReadTime,
  formAuthorRole,
  setFormAuthorRole,
  formIsPublished,
  setFormIsPublished,
  formSortOrder,
  setFormSortOrder,
  onOpenMediaPicker,
}: NewsModalProps) {
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoError, setVideoError] = useState('');
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
                <input
                  list="article-category-options"
                  required
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none transition cursor-pointer"
                />
                <datalist id="article-category-options">{ARTICLE_CATEGORIES.map((category) => <option key={category} value={category} />)}</datalist>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="text-xs font-bold text-slate-700">Author role
                <input value={formAuthorRole} onChange={(e) => setFormAuthorRole(e.target.value)} placeholder="Optional role shown beside the author" className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900" />
              </label>
              <label className="text-xs font-bold text-slate-700">Reading time
                <input value={formReadTime} onChange={(e) => setFormReadTime(e.target.value)} placeholder="e.g. 4 min read" className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900" />
              </label>
            </div>

            <label className="block text-xs font-bold text-slate-700">Display order
              <input type="number" min="0" value={formSortOrder} onChange={(e) => setFormSortOrder(Number(e.target.value) || 0)} className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900" />
              <span className="mt-1 block font-normal text-slate-500">Lower numbers appear first in News &amp; Insights.</span>
            </label>

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
                  Full article
                </label>
                <span className="text-[11px] text-slate-400">Use ## for headings and &gt; for quotes</span>
              </div>
              <textarea
                rows={12}
                placeholder="## Background&#10;&#10;Explain the work in clear language..."
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl p-4 text-xs font-mono text-slate-800 focus:outline-none transition leading-relaxed min-h-[260px]"
              />
            </div>

            <MediaAssetField label="Article image" value={formImageUrl} onChoose={onOpenMediaPicker} onRemove={() => setFormImageUrl('')} />

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-700">Article Video (Optional)</span>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-indigo-600 text-white text-[11px] font-semibold cursor-pointer transition">
                  <span>{videoUploading ? 'Uploading…' : 'Upload video'}</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    disabled={videoUploading}
                    className="sr-only"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setVideoUploading(true);
                      setVideoError('');
                      const fd = new FormData();
                      fd.append('file', file);
                      try {
                        const token =
                          typeof window !== 'undefined'
                            ? localStorage.getItem('gw_admin_jwt') || sessionStorage.getItem('gw_admin_jwt')
                            : null;
                        const res = await fetch('/api/media/upload', {
                          method: 'POST',
                          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                          body: fd,
                        });
                        if (!res.ok) throw new Error('Upload failed. Please try again.');
                        const data = await res.json();
                        if (!data?.url) throw new Error('The upload did not return a video URL.');
                        setFormVideoUrl(data.url);
                      } catch {
                        setVideoError('Could not upload this video. Please try again.');
                      } finally {
                        setVideoUploading(false);
                        e.target.value = '';
                      }
                    }}
                  />
                </label>
              </div>
              <p className="text-[11px] text-slate-500">The video appears in the article without replacing its cover image.</p>
              {formVideoUrl && <div className="space-y-2"><video src={formVideoUrl} controls preload="metadata" className="w-full max-h-52 rounded-lg bg-black" /><button type="button" onClick={() => setFormVideoUrl('')} className="text-xs font-semibold text-red-600">Remove video</button></div>}
              {videoError && <p role="alert" className="text-xs text-red-600">{videoError}</p>}
            </div>
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
