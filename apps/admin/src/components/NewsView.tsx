'use client';

import React, { useState, useMemo } from 'react';
import {
  Newspaper,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Calendar,
  User,
  ArrowUpRight,
  FolderSync,
} from 'lucide-react';
import { ArticleItem, ARTICLE_CATEGORIES } from './NewsModal';

interface NewsViewProps {
  articles: ArticleItem[];
  loading: boolean;
  searchQuery: string;
  onOpenCreateModal: () => void;
  onOpenEditModal: (a: ArticleItem) => void;
  onDeleteArticle: (id: string, title: string) => void;
  onTogglePublished: (a: ArticleItem) => void;
  onSeedProjectCaseStudies: () => void;
  seedingProjectCaseStudies: boolean;
}

export function NewsView({
  articles,
  loading,
  searchQuery,
  onOpenCreateModal,
  onOpenEditModal,
  onDeleteArticle,
  onTogglePublished,
  onSeedProjectCaseStudies,
  seedingProjectCaseStudies,
}: NewsViewProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [onlyPublished, setOnlyPublished] = useState(false);

  const categories = ['All', ...ARTICLE_CATEGORIES];

  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.author && a.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
        a.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'All' || a.category === selectedCategory;
      const matchesPublished = !onlyPublished || a.isPublished;
      return matchesSearch && matchesCat && matchesPublished;
    });
  }, [articles, searchQuery, selectedCategory, onlyPublished]);

  return (
    <div className="space-y-6">
      {/* Category Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count =
              cat === 'All' ? articles.length : articles.filter((a) => a.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{cat === 'All' ? `All (${articles.length})` : cat}</span>
                {cat !== 'All' && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-600 select-none whitespace-nowrap bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/60">
            <input
              type="checkbox"
              checked={onlyPublished}
              onChange={(e) => setOnlyPublished(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-0"
            />
            <span>Published Only</span>
          </label>

          <button
            onClick={onSeedProjectCaseStudies}
            disabled={seedingProjectCaseStudies}
            title="Create case studies from active project records and move starter demo articles to drafts"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-60 disabled:cursor-wait"
          >
            <FolderSync size={14} className={seedingProjectCaseStudies ? 'animate-pulse' : ''} />
            {seedingProjectCaseStudies ? 'Preparing project stories…' : 'Use real project stories'}
          </button>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs self-end sm:self-auto cursor-pointer"
          >
            <Plus size={14} /> Add Article
          </button>
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <RefreshCw size={24} className="animate-spin text-indigo-600" />
          <span className="text-xs font-semibold">Loading news & articles from PostgreSQL...</span>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-400 space-y-3">
          <Newspaper size={36} className="mx-auto text-slate-300" />
          <h3 className="text-sm font-bold text-slate-700">No articles found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No published news matched your search or category filter. Click "+ Add Article" to publish one.
          </p>
          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm"
          >
            + Add Article
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((art) => (
            <div
              key={art.id}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                {/* Cover Image */}
                <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden">
                  <img
                    src={art.imageUrl || '/geospatial-river-hero.webp'}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/geospatial-river-hero.webp';
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/95 text-indigo-700 shadow-sm backdrop-blur-xs">
                      {art.category}
                    </span>
                  </div>

                  <button
                    onClick={() => onTogglePublished(art)}
                    className={`absolute top-3 right-3 px-2 py-0.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1 shadow-sm backdrop-blur-xs ${
                      art.isPublished
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {art.isPublished ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    <span>{art.isPublished ? 'Published' : 'Draft'}</span>
                  </button>
                </div>

                {/* Details */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {art.publishDate || 'Recent'}
                    </span>
                    {art.author && (
                      <span className="flex items-center gap-1 truncate max-w-[130px]">
                        <User size={12} />
                        <span className="truncate">{art.author}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition leading-snug line-clamp-2">
                    {art.title}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {art.summary}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 truncate max-w-[150px]">
                  /{art.slug}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenEditModal(art)}
                    className="px-3 py-1.5 bg-white hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                  >
                    <Edit2 size={12} /> Edit
                  </button>

                  <button
                    onClick={() => onDeleteArticle(art.id, art.title)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="Delete Article"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

