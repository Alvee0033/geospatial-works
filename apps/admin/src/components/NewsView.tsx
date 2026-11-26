'use client';

import React, { useState, useMemo } from 'react';
import { Newspaper, Plus, Trash2, Edit2, RefreshCw, Calendar, User, FolderSync } from 'lucide-react';
import { ArticleItem, ARTICLE_CATEGORIES } from './NewsModal';
import { Button, Badge, Card, PageHeader, SearchFilterBar, EmptyState } from './ui';

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
  const [localSearch, setLocalSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const query = (localSearch || searchQuery).trim().toLowerCase();

  const categories = useMemo(() => ['All', ...ARTICLE_CATEGORIES], []);

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      const matchesCat = selectedCategory === 'All' || a.category === selectedCategory;
      const matchesQuery =
        !query ||
        a.title.toLowerCase().includes(query) ||
        (a.summary || '').toLowerCase().includes(query) ||
        a.category.toLowerCase().includes(query);
      return matchesCat && matchesQuery;
    });
  }, [articles, selectedCategory, query]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="News & Insights"
        description={`${articles.length} published & draft articles`}
        actions={
          <>
            <Button
              variant="secondary"
              onClick={onSeedProjectCaseStudies}
              loading={seedingProjectCaseStudies}
              icon={<FolderSync size={15} />}
            >
              Sync Case Studies
            </Button>
            <Button onClick={onOpenCreateModal} icon={<Plus size={15} />}>
              New Article
            </Button>
          </>
        }
      />

      <SearchFilterBar
        search={localSearch}
        onSearchChange={setLocalSearch}
        searchPlaceholder="Search articles by title, category, or summary..."
        filters={categories.map((c) => ({
          label: c,
          value: c,
          count: c === 'All' ? articles.length : articles.filter((a) => a.category === c).length,
        }))}
        activeFilter={selectedCategory}
        onFilterChange={setSelectedCategory}
      />

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <RefreshCw size={24} className="animate-spin mr-2" />
          <span className="text-sm font-medium">Loading articles...</span>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Newspaper size={22} />}
          title="No articles found"
          description="Create a new article or adjust your search filter."
          action={
            <Button onClick={onOpenCreateModal} icon={<Plus size={15} />}>
              New Article
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((article) => (
            <Card key={article.id} padding="none" className="flex flex-col overflow-hidden hover:border-indigo-300 transition">
              {article.imageUrl ? (
                <div className="aspect-video bg-slate-100 overflow-hidden border-b border-slate-100">
                  <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-video bg-slate-50 border-b border-slate-100 flex items-center justify-center text-slate-300">
                  <Newspaper size={28} />
                </div>
              )}

              <div onClick={() => onOpenEditModal(article)} className="p-5 flex-1 flex flex-col gap-3 cursor-pointer">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="brand">{article.category}</Badge>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePublished(article);
                    }}
                    className="cursor-pointer"
                    title="Toggle published status"
                  >
                    <Badge variant={article.isPublished ? 'success' : 'warning'}>
                      {article.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2">{article.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {article.summary || article.content}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-slate-400">
                  {article.author && (
                    <span className="inline-flex items-center gap-1">
                      <User size={12} /> {article.author}
                    </span>
                  )}
                  {article.publishDate && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={12} /> {new Date(article.publishDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="px-5 pb-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-1.5">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenEditModal(article);
                  }}
                  icon={<Edit2 size={13} />}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteArticle(article.id, article.title);
                  }}
                  icon={<Trash2 size={13} />}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
